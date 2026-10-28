"""Rebuild fabric with denser background blocks, then apply palette, lighting and cameras."""
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
print("PLAN modules", plan["total_modules"], "bg_blocks", plan["background_blocks"],
      "bg_units", plan["background_units"])
runpy.run_path(ROOT + "/output/build_scripts/apply_06_materials.py", run_name="__main__")
runpy.run_path(ROOT + "/output/build_scripts/apply_07_lighting.py", run_name="__main__")
runpy.run_path(ROOT + "/output/build_scripts/apply_09_cameras.py", run_name="__main__")

print(json.dumps(api["save_snapshot"](ROOT, "output/working/background-02.blend", "background-02", overwrite=True), indent=2))
for cam, out in (("CAM_PLAN_CHECK", "output/renders/bg_plan.png"),
                 ("CAM_DISTRICT_OVERVIEW", "output/renders/bg_overview.png"),
                 ("CAM_BRIDGE", "output/renders/bg_bridge.png")):
    info = rr["render"](ROOT, cam, out, width=1400, height=900, samples=40)
    print("RENDERED", cam, info["bytes"])
