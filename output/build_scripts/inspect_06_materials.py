"""PALAGAN read-only inspection of materials, lighting, cameras (run inside Blender)."""
from __future__ import annotations

import json
from pathlib import Path

import bpy

ROOT = Path(bpy.data.filepath).resolve().parents[2]
scene = bpy.context.scene

report = {
    "filepath": bpy.data.filepath,
    "palagan_last_operation": scene.get("palagan_last_operation"),
    "engine": scene.render.engine,
    "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    "exposure": scene.view_settings.exposure,
    "view_transform": scene.view_settings.view_transform,
    "look": scene.view_settings.look,
    "world": None,
    "lights": [],
    "cameras": [],
    "materials": [],
    "images": [],
}

world = scene.world
if world:
    nodes = [{"type": n.type, "name": n.name} for n in world.node_tree.nodes] if world.use_nodes else []
    bg = world.node_tree.nodes.get("Background") if world.use_nodes else None
    report["world"] = {
        "name": world.name,
        "use_nodes": world.use_nodes,
        "nodes": nodes,
        "color": list(bg.inputs["Color"].default_value) if bg else None,
        "strength": bg.inputs["Strength"].default_value if bg else None,
    }

for ob in scene.objects:
    if ob.type == "LIGHT":
        light = ob.data
        report["lights"].append({
            "name": ob.name,
            "type": light.type,
            "energy": light.energy,
            "angle_deg": round(__import__("math").degrees(light.angle), 2) if hasattr(light, "angle") else None,
            "color": list(light.color),
            "rotation": [round(v, 2) for v in ob.rotation_euler],
            "hide_render": ob.hide_render,
        })
    elif ob.type == "CAMERA":
        cam = ob.data
        report["cameras"].append({
            "name": ob.name,
            "lens_mm": round(cam.lens, 2),
            "sensor": cam.sensor_width,
            "loc": [round(v, 2) for v in ob.location],
            "rot_deg": [round(__import__("math").degrees(v), 2) for v in ob.rotation_euler],
            "type": cam.type,
            "palagan_owner": ob.get("palagan_owner"),
        })

for mat in bpy.data.materials:
    if not mat.use_nodes:
        report["materials"].append({"name": mat.name, "use_nodes": False})
        continue
    bsdf = None
    for n in mat.node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED":
            bsdf = n
            break
    entry = {
        "name": mat.name,
        "owner": mat.get("palagan_owner"),
        "nodes": [n.type for n in mat.node_tree.nodes],
        "linked": {},
    }
    if bsdf:
        entry["base"] = [round(v, 3) for v in bsdf.inputs["Base Color"].default_value]
        entry["roughness"] = round(bsdf.inputs["Roughness"].default_value, 3)
        entry["metallic"] = round(bsdf.inputs["Metallic"].default_value, 3)
        entry["base_linked"] = bsdf.inputs["Base Color"].is_linked
        entry["rough_linked"] = bsdf.inputs["Roughness"].is_linked
        entry["normal_linked"] = bsdf.inputs["Normal"].is_linked
    mapping = mat.node_tree.nodes.get("UVRepeat")
    if mapping:
        entry["uv_repeat"] = [round(v, 3) for v in mapping.inputs["Scale"].default_value]
    entry["users"] = mat.users
    report["materials"].append(entry)

for img in bpy.data.images:
    report["images"].append({
        "name": img.name,
        "filepath": img.filepath,
        "size": list(img.size),
        "packed": bool(img.packed_file),
        "source": img.source,
    })

out = ROOT / "output" / "materials_inspection.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print("WROTE", out)
print("materials", len(report["materials"]), "lights", len(report["lights"]),
      "cameras", len(report["cameras"]), "images", len(report["images"]))
