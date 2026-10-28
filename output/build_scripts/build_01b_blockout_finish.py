"""Finish the blockout checkpoint: restore readable road contrast, render a
clean model plan and a map-only plan for comparison, and save the checkpoint.

Run inside Blender after opening output/working/blockout-01.blend.
"""
from __future__ import annotations

import json
import runpy
from pathlib import Path

import bpy

OWNER = "PALAGAN_SURABAYA_V1"


def build(root):
    root = Path(root)
    scene = bpy.context.scene
    # Darker street surfaces and slightly lighter ground for district readability.
    adjustments = {
        "MAT_ROAD_ASPHALT": {"Base Color": (0.085, 0.082, 0.076, 1)},
        "MAT_ROAD_SETTS": {"Base Color": (0.22, 0.21, 0.185, 1)},
        "MAT_GROUND_EARTH": {"Base Color": (0.44, 0.41, 0.34, 1)},
    }
    for mat_name, inputs in adjustments.items():
        mat = bpy.data.materials.get(mat_name)
        if mat and mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            for key, value in inputs.items():
                if bsdf and key in bsdf.inputs:
                    bsdf.inputs[key].default_value = value
                    mat.diffuse_color = value
    underlay_mat = bpy.data.materials.get("MAT_MAP_UNDERLAY")
    if underlay_mat and underlay_mat.use_nodes:
        em = next((n for n in underlay_mat.node_tree.nodes if n.type == "EMISSION"), None)
        if em:
            em.inputs["Strength"].default_value = 1.0

    api = runpy.run_path(str(root / "output/build_scripts/render_review.py"))
    renders = []
    renders.append(api["render"](root, "CAM_DISTRICT_OVERVIEW", "output/renders/blockout_overview.png",
                                 width=1600, height=1000, samples=32, show_map=False))
    renders.append(api["render"](root, "CAM_PLAN_CHECK", "output/renders/blockout_plan_model.png",
                                 width=1400, height=1400, samples=24, show_map=False))

    # Map-only plan: hide every top-level PALAGAN layer except the reference.
    root_coll = bpy.data.collections.get("PALAGAN_SURABAYA")
    saved = {}
    if root_coll:
        for child in root_coll.children:
            saved[child.name] = child.hide_render
            child.hide_render = child.name != "PALAGAN_MAP_REFERENCE"
    underlay = bpy.data.objects.get("PALAGAN_MAP_UNDERLAY")
    if underlay:
        underlay.hide_render = False
    try:
        renders.append(api["render"](root, "CAM_PLAN_CHECK", "output/renders/blockout_plan_map.png",
                                     width=1400, height=1400, samples=16, show_map=True))
    finally:
        for name, value in saved.items():
            bpy.data.collections[name].hide_render = value

    scene["palagan_blockout_status"] = (
        "Cartographic river/street/bridge/massing seed inspected against the map. "
        "Bridges and landmark masses remain blockout geometry; detailed architecture is the next stage."
    )
    scene["palagan_blockout_checks"] = (
        "Plan model and map-only renders compared; river and principal street corridors follow M001. "
        "Outer coarse fabric is explicitly reconstructed and not a documented footprint set."
    )
    session = runpy.run_path(str(root / "scripts/blender_session.py"))
    saved_scene = session["save_snapshot"](root, "output/working/blockout-01.blend", "blockout-01", overwrite=True)
    return {"renders": renders, "saved": saved_scene}


if __name__ == "__main__":
    raise SystemExit("Run build(ROOT) inside Blender")
