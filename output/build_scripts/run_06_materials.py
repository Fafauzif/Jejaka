"""Load streets-01, apply materials-01, save checkpoint, render two review views."""
import json
import runpy
import sys
from pathlib import Path

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
sys.path.insert(0, ROOT + "/scripts")
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")

runpy.run_path(ROOT + "/output/build_scripts/apply_06_materials.py", run_name="__main__")

info = api["save_snapshot"](ROOT, "output/working/materials-01.blend", "materials-01", overwrite=True)
print(json.dumps(info, indent=2))

for cam, out, w, h in (("CAM_KEMBANG_STREET", "output/renders/materials_kembang.png", 1400, 900),
                       ("CAM_FABRIC_OVERVIEW", "output/renders/materials_overview.png", 1400, 900)):
    print(json.dumps(rr["render"](ROOT, cam, out, width=w, height=h, samples=48), indent=2))
