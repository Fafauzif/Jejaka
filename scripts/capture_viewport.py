import bpy
import os
from pathlib import Path

# Get project root
root = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
out = root / "output" / "renders"
out.mkdir(parents=True, exist_ok=True)
path = out / "current_viewport.png"

scene = bpy.context.scene
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(path)
previous = scene.render.filepath

# Find VIEW_3D
override = None
wm = bpy.context.window_manager
for window in wm.windows:
    for area in window.screen.areas:
        if area.type == "VIEW_3D":
            region = next((r for r in area.regions if r.type == "WINDOW"), None)
            if region is not None:
                override = (window, area, region)
                break
    if override:
        break

if override is None:
    print("ERROR: No VIEW_3D")
    raise SystemExit(1)

window, area, region = override
space = area.spaces.active
saved = (space.region_3d.view_perspective, space.shading.type)

try:
    space.region_3d.view_perspective = "PERSP"
    # Try to use current shading
    with bpy.context.temp_override(window=window, area=area, region=region, scene=scene):
        result = bpy.ops.render.opengl(write_still=True, view_context=True)
    print(f"OK: {path} size={path.stat().st_size}")
except Exception as e:
    print(f"ERR: {e}")
    raise
finally:
    try:
        space.region_3d.view_perspective = saved[0]
        space.shading.type = saved[1]
    except:
        pass
    scene.render.filepath = previous
