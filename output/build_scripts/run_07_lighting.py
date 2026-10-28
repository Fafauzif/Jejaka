"""Load materials-01, apply lighting-01, save checkpoint, render three views."""
import json
import runpy
import sys

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
sys.path.insert(0, ROOT + "/scripts")
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")

runpy.run_path(ROOT + "/output/build_scripts/apply_07_lighting.py", run_name="__main__")
print(json.dumps(api["save_snapshot"](ROOT, "output/working/lighting-01.blend", "lighting-01"), indent=2))
for cam, out in (("CAM_KEMBANG_STREET", "output/renders/lighting_kembang.png"),
                 ("CAM_FABRIC_OVERVIEW", "output/renders/lighting_overview.png"),
                 ("CAM_BRIDGE", "output/renders/lighting_bridge.png")):
    print(json.dumps(rr["render"](ROOT, cam, out, width=1400, height=900, samples=48), indent=2))
