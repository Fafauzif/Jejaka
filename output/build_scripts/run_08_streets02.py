"""Rebuild the street fabric from singa-01, then apply palette and lighting."""
import json
import runpy
import sys

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
sys.path.insert(0, ROOT + "/scripts")
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")

streets = runpy.run_path(ROOT + "/output/build_scripts/build_05_streets.py")
plan = streets["build"](ROOT)
print("STREETS modules", plan["total_modules"], "rear", plan["total_rear_modules"])
runpy.run_path(ROOT + "/output/build_scripts/apply_06_materials.py", run_name="__main__")
runpy.run_path(ROOT + "/output/build_scripts/apply_07_lighting.py", run_name="__main__")

print(json.dumps(api["save_snapshot"](ROOT, "output/working/streets-02.blend", "streets-02"), indent=2))
for cam, out in (("CAM_KEMBANG_STREET", "output/renders/streets_02_kembang.png"),
                 ("CAM_FABRIC_OVERVIEW", "output/renders/streets_02_overview.png")):
    print(json.dumps(rr["render"](ROOT, cam, out, width=1400, height=900, samples=48), indent=2))
