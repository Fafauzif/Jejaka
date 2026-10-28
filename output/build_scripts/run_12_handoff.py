"""handoff-01: verify, save master blend and render the six deliverable views."""
import json
import runpy
import sys

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
sys.path.insert(0, ROOT + "/scripts")
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")

runpy.run_path(ROOT + "/output/build_scripts/verify_12_final.py", run_name="__main__")
print(json.dumps(api["save_snapshot"](ROOT, "output/PALAGAN_Surabaya_Master.blend",
                                      "handoff-01"), indent=2))
views = (("CAM_DISTRICT_OVERVIEW", "output/renders/final_district_overview.png"),
         ("CAM_PLAN_CHECK", "output/renders/final_plan_check.png"),
         ("CAM_BRIDGE", "output/renders/final_bridge.png"),
         ("CAM_INTERNATIO_REFERENCE", "output/renders/final_internatio.png"),
         ("CAM_SINGA_REFERENCE", "output/renders/final_singa.png"),
         ("CAM_KEMBANG_STREET", "output/renders/final_kembang.png"))
for cam, out in views:
    info = rr["render"](ROOT, cam, out, width=1600, height=1000, samples=64)
    print("RENDERED", cam, info["bytes"])
