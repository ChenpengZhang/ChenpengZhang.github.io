# Building-height sample

Source: `shp/foa_shijingshan_20141018_512.*`, supplied by Chenpeng Zhang from research undertaken during his internship at the Aerospace Information Research Institute, Chinese Academy of Sciences.

- 15,144 building footprints in Shijingshan, Beijing.
- Source `TIME`: `shijingshan_20141018_512` (2014 sample).
- Coordinates: WGS84 longitude/latitude; `HEIGHT`: metres, both confirmed by the data owner. The supplied files do not include a `.prj`.
- Height range: approximately 0.290–108.472 m.
- The original shapefile remains unchanged.

`buildings.geojson` is the web copy. Coordinates are rounded to seven decimal places, heights to three decimal places, and scores to four decimal places. No footprint simplification or height exaggeration is applied. Single-ring winding is normalized; three original records have reversed Shapefile winding. Features use unique sequential record IDs because the original `ID` repeats across image tiles. `source_id` and `image` preserve the original identifiers.

To regenerate (Python 3, `pyshp==2.3.1`):

```sh
python3 -m pip install pyshp==2.3.1
python3 scripts/prepare_buildings.py
```

The page at `research/index.html` runs entirely in the browser. GitHub Pages serves HTML, JS, CSS, and GeoJSON; no server process, API key, or build step is required. Serve the repository over HTTP for local development, rather than opening the page with `file://`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

MapLibre GL JS 5.6.2 is vendored under `assets/maplibre/`, including its license. OSM raster tiles are requested directly by the visitor's browser, with visible attribution and ordinary HTTP caching. There is no bulk download or offline tile cache. Tile availability depends on the external service and network; the research layer can be displayed without the basemap. See https://operations.osmfoundation.org/policies/tiles/.

The 3D view extrudes footprints from a flat base using `HEIGHT`. It does not model roofs or terrain. The 2014 sample and the current OSM basemap may differ.
