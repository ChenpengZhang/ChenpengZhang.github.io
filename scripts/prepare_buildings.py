"""Convert the research sample to web GeoJSON. Requires pyshp==2.3.1.

Run from any directory: python3 scripts/prepare_buildings.py
Source coordinates are WGS84 and HEIGHT is in metres (confirmed by owner).
The original DBF ID repeats across image tiles, so feature IDs use record order.
"""
import json
import math
from pathlib import Path
import shapefile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/shp/foa_shijingshan_20141018_512.shp'
OUTPUT = ROOT / 'data/buildings.geojson'


def coordinates(value):
    if isinstance(value[0], (int, float)):
        lon, lat = value
        if not (math.isfinite(lon) and math.isfinite(lat) and -180 <= lon <= 180 and -90 <= lat <= 90):
            raise ValueError('Expected WGS84 longitude/latitude coordinates')
        return [round(lon, 7), round(lat, 7)]
    return [coordinates(child) for child in value]


def main():
    features = []
    with shapefile.Reader(str(SOURCE), encoding='utf-8') as reader:
        for index, item in enumerate(reader.iterShapeRecords(), start=1):
            height = item.record['HEIGHT']
            if height is None or not math.isfinite(height) or height < 0:
                raise ValueError(f'Invalid HEIGHT in record {index}')
            # A single ring is necessarily exterior; three source records have reversed
            # Shapefile winding. Preserve their shape while normalizing GeoJSON winding.
            if len(item.shape.parts) == 1:
                ring = list(item.shape.points)
                if shapefile.signed_area(ring) < 0:
                    ring.reverse()
                geometry = {'type': 'Polygon', 'coordinates': [ring]}
            else:
                geometry = item.shape.__geo_interface__
            if geometry['type'] not in ('Polygon', 'MultiPolygon'):
                raise ValueError(f'Expected a building polygon in record {index}')
            features.append({
                'type': 'Feature', 'id': index,
                'properties': {'height': round(height, 3), 'source_id': item.record['ID'],
                               'image': item.record['IMG_NAME'], 'score': round(item.record['SCORE'], 4)},
                'geometry': {'type': geometry['type'], 'coordinates': coordinates(geometry['coordinates'])}
            })
        bounds = list(reader.bbox)
    collection = {'type': 'FeatureCollection', 'bbox': bounds, 'features': features}
    OUTPUT.write_text(json.dumps(collection, separators=(',', ':'), allow_nan=False) + '\n')
    print(f'{len(features):,} buildings; {OUTPUT.stat().st_size / 1024**2:.2f} MiB → {OUTPUT}')


if __name__ == '__main__':
    main()
