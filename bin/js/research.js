(() => {
  'use strict';

  const status = document.getElementById('map-status');
  const selection = document.getElementById('selection');
  const stats = document.getElementById('dataset-stats');
  const view3d = document.getElementById('view-3d');
  const view2d = document.getElementById('view-2d');
  const reset = document.getElementById('reset-view');
  const basemap = document.getElementById('basemap');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['step', ['get', 'height'], '#b9d9e8', 5, '#77b8cd', 15, '#388eab', 30, '#22617f', 60, '#163c59'];
  const messages = {
    loading: ['Loading buildings…', '正在加载建筑数据…'],
    unavailable: ['The map could not start. Try a WebGL-enabled browser, or download the GeoJSON below.', '地图无法启动。请使用支持 WebGL 的浏览器，或下载下方 GeoJSON 数据。'],
    dataError: ['Building data could not be loaded. Refresh to try again, or download the GeoJSON below.', '建筑数据加载失败，请刷新重试，或下载下方 GeoJSON 数据。'],
    tileError: ['OSM basemap unavailable. Building data is still available; you can turn off the basemap.', 'OSM 底图暂时不可用，建筑数据仍可查看，可关闭底图。'],
    renderError: ['The building layer could not be rendered. Refresh to try again, or download the GeoJSON below.', '建筑图层渲染失败，请刷新重试，或下载下方 GeoJSON 数据。'],
    select: ['Click a building to inspect its height.', '点击建筑查看高度。'],
  };
  let state = 'loading';
  let data;
  let chosen;
  let map;
  let is3d = true;
  let ready = false;
  let tileFailed = false;
  const zh = () => document.documentElement.lang === 'zh-CN';
  const text = key => messages[key][zh() ? 1 : 0];

  function updateText() {
    status.textContent = state ? text(state) : '';
    if (data) {
      const heights = data.features.map(feature => feature.properties.height);
      const min = Math.min(...heights).toFixed(1);
      const max = Math.max(...heights).toFixed(1);
      stats.textContent = zh()
        ? `${data.features.length.toLocaleString('zh-CN')} 个建筑轮廓 · ${min}–${max} 米`
        : `${data.features.length.toLocaleString('en-US')} footprints · ${min}–${max} m`;
    }
    selection.textContent = chosen
      ? (zh() ? `建筑记录 #${chosen.id} · 高度 ${Number(chosen.properties.height).toFixed(2)} 米` : `Building record #${chosen.id} · Height ${Number(chosen.properties.height).toFixed(2)} m`)
      : text('select');
  }
  function setStatus(next) { state = next; updateText(); }
  document.addEventListener('languagechange', updateText);
  updateText();

  function clearSelection() {
    if (chosen && map) map.setFeatureState({ source: 'buildings', id: chosen.id }, { selected: false });
    chosen = null;
    updateText();
  }
  function fit() {
    const [west, south, east, north] = data.bbox;
    map.fitBounds([[west, south], [east, north]], {
      padding:40, pitch:is3d ? 50 : 0, bearing:0, maxZoom:16,
      duration:reducedMotion ? 0 : 500,
    });
  }
  function setView(threeDimensional) {
    if (!ready) return;
    is3d = threeDimensional;
    map.setLayoutProperty('buildings-3d', 'visibility', is3d ? 'visible' : 'none');
    map.setLayoutProperty('buildings-2d', 'visibility', is3d ? 'none' : 'visible');
    map.easeTo({ pitch:is3d ? 50 : 0, bearing:is3d ? map.getBearing() : 0, duration:reducedMotion ? 0 : 400 });
    view3d.setAttribute('aria-pressed', String(is3d));
    view2d.setAttribute('aria-pressed', String(!is3d));
  }

  async function start() {
    if (!window.maplibregl) {
      setStatus('unavailable');
      return;
    }
    try {
      // Load a local, empty style first. An unavailable tile server cannot block the research layer.
      map = new maplibregl.Map({
        container:'map', center:[116.181, 39.917], zoom:14, pitch:50,
        maxPitch:65, maxZoom:20, minZoom:10, renderWorldCopies:false,
        canvasContextAttributes:{ antialias:true },
        style:{ version:8, sources:{}, layers:[{ id:'background', type:'background', paint:{ 'background-color':'#e9eef0' } }] },
        attributionControl:false,
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch:true }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact:false }), 'bottom-right');
      map.addControl(new maplibregl.ScaleControl({ unit:'metric' }), 'bottom-left');
      map.on('error', event => {
        if (event.sourceId === 'osm') {
          tileFailed = true;
          if (ready && basemap.checked) setStatus('tileError');
        } else if (event.sourceId === 'buildings') {
          setStatus('renderError');
        }
      });
      map.getCanvas().addEventListener('webglcontextlost', () => setStatus('unavailable'));
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Map startup timed out')), 20000);
        map.once('load', () => { clearTimeout(timeout); resolve(); });
      });
    } catch (error) {
      console.error('Map initialization failed:', error);
      setStatus('unavailable');
      return;
    }

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30000);
    try {
      const response = await fetch('../data/buildings.geojson', { signal:abort.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      if (data.type !== 'FeatureCollection' || !data.features?.length || data.bbox?.length !== 4) throw new Error('Invalid building dataset');
    } catch (error) {
      console.error('Building data failed:', error);
      setStatus('dataError');
      return;
    } finally {
      clearTimeout(timeout);
    }

    try {
      map.addSource('osm', {
        type:'raster', tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize:256, maxzoom:19,
        attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      });
      map.addLayer({ id:'osm', type:'raster', source:'osm', paint:{ 'raster-opacity':0.72, 'raster-saturation':-0.65 } });
      map.addSource('buildings', { type:'geojson', data, maxzoom:18, tolerance:0 });
      const selectedColor = ['case', ['boolean', ['feature-state', 'selected'], false], '#dd9b3c', colors];
      map.addLayer({ id:'buildings-2d', type:'fill', source:'buildings', layout:{ visibility:'none' }, paint:{ 'fill-color':selectedColor, 'fill-opacity':0.85, 'fill-outline-color':'#426d83' } });
      map.addLayer({ id:'buildings-3d', type:'fill-extrusion', source:'buildings', paint:{ 'fill-extrusion-color':selectedColor, 'fill-extrusion-height':['get', 'height'], 'fill-extrusion-base':0, 'fill-extrusion-opacity':0.94 } });
      map.on('sourcedata', event => {
        if (event.sourceId === 'buildings' && event.isSourceLoaded && !ready) {
          ready = true;
          [view2d, view3d, reset, basemap].forEach(control => { control.disabled = false; });
          setStatus(tileFailed ? 'tileError' : '');
        }
      });
      fit();
      map.on('click', event => {
        if (!ready) return;
        const features = map.queryRenderedFeatures(event.point, { layers:[is3d ? 'buildings-3d' : 'buildings-2d'] });
        clearSelection();
        chosen = features[0] || null;
        if (chosen) map.setFeatureState({ source:'buildings', id:chosen.id }, { selected:true });
        updateText();
      });
      for (const layer of ['buildings-2d', 'buildings-3d']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      }
      view3d.addEventListener('click', () => setView(true));
      view2d.addEventListener('click', () => setView(false));
      reset.addEventListener('click', () => { clearSelection(); fit(); });
      basemap.addEventListener('change', () => {
        map.setLayoutProperty('osm', 'visibility', basemap.checked ? 'visible' : 'none');
        setStatus(basemap.checked && tileFailed ? 'tileError' : '');
      });
    } catch (error) {
      console.error('Building layer failed:', error);
      setStatus('renderError');
    }
  }
  start();
})();
