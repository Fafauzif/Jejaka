"""Apply cameras-01 and render the six required review views."""
import json
import runpy
import sys

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
sys.path.insert(0, ROOT + "/scripts")
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")

runpy.run_path(ROOT + "/output/build_scripts/apply_09_cameras.py", run_name="__main__")
print(json.dumps(api["save_snapshot"](ROOT, "output/working/cameras-01.blend", "cameras-01", overwrite=True), indent=2))
views = (("CAM_DISTRICT_OVERVIEW", "output/renders/cam_district_overview.png"),
         ("CAM_PLAN_CHECK", "output/renders/cam_plan_check.png"),
         ("CAM_BRIDGE", "output/renders/cam_bridge.png"),
         ("CAM_INTERNATIO_REFERENCE", "output/renders/cam_internatio.png"),
         ("CAM_SINGA_REFERENCE", "output/renders/cam_singa.png"),
         ("CAM_KEMBANG_STREET", "output/renders/cam_kembang.png"))
for cam, out in views:
    info = rr["render"](ROOT, cam, out, width=1400, height=900, samples=40)
    print("RENDERED", cam, info["bytes"])
