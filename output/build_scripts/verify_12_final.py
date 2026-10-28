"""PALAGAN handoff-01: scene integrity checks and evaluated geometry counts.

Run inside Blender on the final scene. Read-only apart from calculating
evaluated meshes; it never edits geometry.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import bpy

OWNER = "PALAGAN_SURABAYA_V1"


def _project_root():
    here = Path(bpy.data.filepath).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "data" / "HISTORICAL_LAYOUT.json").is_file():
            return candidate
    raise RuntimeError("Project root not found from " + str(here))


ROOT = _project_root()
OUT = ROOT / "output" / "verification_report.json"
scene = bpy.context.scene
report = {
    "filepath": bpy.data.filepath,
    "operation": scene.get("palagan_last_operation"),
    "palagan_checkpoint_at": scene.get("palagan_checkpoint_at"),
    "checks": {},
    "counts": {},
    "issues": [],
}

owned = [o for o in scene.objects if o.get("palagan_owner") == OWNER]
unowned = [o for o in scene.objects if o.get("palagan_owner") != OWNER]
report["counts"]["owned_objects"] = len(owned)
report["counts"]["unowned_objects"] = len(unowned)
report["counts"]["unowned_names"] = sorted(o.name for o in unowned)

# ---------------------------------------------------------------- dependencies
missing_images = []
for img in bpy.data.images:
    if img.source in {"VIEWER", "GENERATED"}:
        continue
    resolved = Path(bpy.path.abspath(img.filepath)) if img.filepath else None
    if resolved is None or not resolved.is_file():
        if not img.packed_file:
            missing_images.append({"image": img.name, "filepath": img.filepath})
report["checks"]["missing_images"] = missing_images
report["checks"]["image_count"] = len([i for i in bpy.data.images if i.source == "FILE"])

# ------------------------------------------------------- transforms and extents
bad_transform = []
far_away = []
zero_scale = []
for ob in scene.objects:
    loc = ob.matrix_world.translation
    if any(math.isnan(v) or math.isinf(v) for v in tuple(loc) + tuple(ob.scale)):
        bad_transform.append(ob.name)
    if max(abs(ob.scale.x), abs(ob.scale.y), abs(ob.scale.z)) < 1e-6:
        zero_scale.append(ob.name)
    if ob.type == "MESH" and math.hypot(loc.x, loc.y) > 2000.0:
        far_away.append(ob.name)
report["checks"]["nan_or_infinite_transforms"] = bad_transform
report["checks"]["zero_scale_objects"] = zero_scale
report["checks"]["mesh_objects_beyond_2000m"] = far_away

# ----------------------------------------------------------- material coverage
no_material = []
for ob in owned:
    if ob.type != "MESH":
        continue
    if not ob.data.materials or all(m is None for m in ob.data.materials):
        no_material.append(ob.name)
report["checks"]["owned_meshes_without_material"] = no_material

# ------------------------------------------------------------- geometry counts
deps = bpy.context.evaluated_depsgraph_get()
base_tris = 0
eval_tris = 0
verts = 0
for ob in owned:
    if ob.type != "MESH":
        continue
    me = ob.data
    me.calc_loop_triangles()
    base_tris += len(me.loop_triangles)
    verts += len(me.vertices)
    ev = ob.evaluated_get(deps)
    ev_me = ev.to_mesh()
    ev_me.calc_loop_triangles()
    eval_tris += len(ev_me.loop_triangles)
    ev.to_mesh_clear()
report["counts"]["base_triangles"] = base_tris
report["counts"]["evaluated_triangles"] = eval_tris
report["counts"]["base_vertices"] = verts
report["counts"]["materials"] = len(bpy.data.materials)
report["counts"]["owned_materials"] = len([m for m in bpy.data.materials if m.get("palagan_owner") == OWNER])
report["counts"]["cameras"] = len([o for o in scene.objects if o.type == "CAMERA"])
report["counts"]["lights"] = len([o for o in scene.objects if o.type == "LIGHT"])
report["counts"]["image_datablocks"] = len(bpy.data.images)

# --------------------------------------------------------------- render config
report["render"] = {
    "engine": scene.render.engine,
    "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    "eevee_taa_render_samples": scene.eevee.taa_render_samples,
    "raytracing": scene.eevee.use_raytracing,
    "view_transform": scene.view_settings.view_transform,
    "look": scene.view_settings.look,
    "exposure": scene.view_settings.exposure,
    "active_camera": scene.camera.name if scene.camera else None,
}

# --------------------------------------------------------- camera documentation
cams = {}
for ob in scene.objects:
    if ob.type != "CAMERA":
        continue
    cams[ob.name] = {
        "lens_mm": round(ob.data.lens, 1),
        "type": ob.data.type,
        "ortho_scale": round(ob.data.ortho_scale, 1) if ob.data.type == "ORTHO" else None,
        "location": [round(v, 1) for v in ob.location],
        "purpose": ob.get("palagan_purpose"),
        "basis": ob.get("palagan_basis"),
    }
report["cameras"] = cams

# ------------------------------------------------------------------- issues
if missing_images:
    report["issues"].append(f"{len(missing_images)} image datablocks have no file on disk")
if bad_transform:
    report["issues"].append(f"{len(bad_transform)} objects have non-finite transforms")
if zero_scale:
    report["issues"].append(f"{len(zero_scale)} objects have zero scale")
if far_away:
    report["issues"].append(f"{len(far_away)} mesh objects sit beyond 2000 m")
if no_material:
    report["issues"].append(f"{len(no_material)} owned meshes have no material")

OUT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print("VERIFY " + json.dumps({"counts": report["counts"], "issues": report["issues"]}, indent=1))
print("WROTE", OUT)
