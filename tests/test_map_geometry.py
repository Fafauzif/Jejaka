"""Pure geometry checks; does not import or claim to run Blender."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('map_seed',ROOT/'scripts/blender_map_blockout.py')
seed=importlib.util.module_from_spec(spec);spec.loader.exec_module(seed)

class GeometryTests(unittest.TestCase):
    def test_clockwise_footprints_become_upward_roofs(self):
        layout=json.loads((ROOT/'data/HISTORICAL_LAYOUT.json').read_text())
        for f in layout['features']:
            if f['kind']!='mapped_footprint':continue
            pts=seed.counterclockwise(f['local_xy_m'])
            normal_z=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:]+pts[:1]))
            self.assertGreater(normal_z,0,f['feature_id'])
    def test_layout_transform_matches_source_pixels(self):
        layout=json.loads((ROOT/'data/HISTORICAL_LAYOUT.json').read_text())
        for f in layout['features']:
            for p,expected in zip(f['source_pixels'],f['local_xy_m']):
                actual=seed.pixel_to_local(*p)
                for a,b in zip(actual,expected):self.assertAlmostEqual(a,b,places=2)
    def test_degenerate_ring_rejected(self):
        with self.assertRaises(ValueError):seed.counterclockwise([(0,0),(1,1),(2,2)])

if __name__=='__main__':unittest.main()
