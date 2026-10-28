"""Re-apply materials/lighting/cameras to the densified scene and re-render the bridge."""
import json
import runpy

import bpy

ROOT = r"C:\Users\fauzi\OneDrive\Desktop\Budayago"
api = runpy.run_path(ROOT + "/scripts/blender_session.py")
rr = runpy.run_path(ROOT + "/output/build_scripts/render_review.py")
runpy.run_path(ROOT + "/output/build_scripts/apply_06_materials.py", run_name="__main__")
runpy.run_path(ROOT + "/output/build_scripts/apply_07_lighting.py", run_name="__main__")
runpy.run_path(ROOT + "/output/build_scripts/apply_09_cameras.py", run_name="__main__")
print(json.dumps(api["save_snapshot"](ROOT, "output/working/background-02.blend", "background-02", overwrite=True), indent=2))
print("RENDERED", rr["render"](ROOT, "CAM_BRIDGE", "output/renders/bg_bridge.png", width=1400, height=900, samples=40)["bytes"])
