"""PALAGAN hero renders: a Cycles device test, then presentation stills.

Run inside Blender on the master scene. Render settings are restored afterwards so
an inspection render never silently changes the saved scene.
"""
from __future__ import annotations

import json
import time
from pathlib import Path


def _project_root():
    import bpy
    here = Path(bpy.data.filepath).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "data" / "HISTORICAL_LAYOUT.json").is_file():
            return candidate
    raise RuntimeError("Project root not found from " + str(here))


def device_test(root, log_path=None):
    """Render one small Cycles frame to prove the GPU device actually works."""
    import bpy

    root = Path(root)
    scene = bpy.context.scene
    saved = {
        "engine": scene.render.engine,
        "x": scene.render.resolution_x,
        "y": scene.render.resolution_y,
        "pct": scene.render.resolution_percentage,
        "filepath": scene.render.filepath,
        "camera": scene.camera,
        "samples": scene.cycles.samples if hasattr(scene, "cycles") else None,
        "denoise": scene.cycles.use_denoising if hasattr(scene, "cycles") else None,
        "device": scene.cycles.device if hasattr(scene, "cycles") else None,
    }
    result = {}
    try:
        prefs = bpy.context.preferences.addons.get("cycles")
        if prefs is not None:
            cp = prefs.preferences
            cp.compute_device_type = "OPTIX"
            cp.get_devices()
            for dev in cp.devices:
                dev.use = dev.type == "OPTIX"
            result["cycles_devices"] = [(d.name, d.type, d.use) for d in cp.devices]

        scene.render.engine = "CYCLES"
        scene.cycles.device = "GPU"
        scene.cycles.samples = 24
        scene.cycles.use_denoising = True
        scene.render.resolution_x = 480
        scene.render.resolution_y = 300
        scene.render.resolution_percentage = 100
        out = root / "output" / "renders" / "_device_test.png"
        scene.render.filepath = str(out)
        started = time.time()
        bpy.ops.render.render(write_still=True)
        result.update({
            "ok": True,
            "seconds": round(time.time() - started, 2),
            "written": str(out),
            "bytes": out.stat().st_size if out.is_file() else 0,
        })
    except Exception as exc:
        result.update({"ok": False, "error": f"{type(exc).__name__}: {exc}"})
    finally:
        scene.render.engine = saved["engine"]
        scene.render.resolution_x = saved["x"]
        scene.render.resolution_y = saved["y"]
        scene.render.resolution_percentage = saved["pct"]
        scene.render.filepath = saved["filepath"]
        scene.camera = saved["camera"]
        if saved["samples"] is not None:
            scene.cycles.samples = saved["samples"]
            scene.cycles.use_denoising = saved["denoise"]
            scene.cycles.device = saved["device"]
    if log_path:
        Path(log_path).write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def still(root, camera, relative_png, width=1920, height=1200, samples=160,
          engine="CYCLES"):
    """Render one presentation still and report real timing."""
    import bpy

    scene = bpy.context.scene
    cam = bpy.data.objects.get(camera)
    if cam is None or cam.type != "CAMERA":
        raise ValueError("Missing camera " + camera)
    saved = {
        "engine": scene.render.engine,
        "x": scene.render.resolution_x,
        "y": scene.render.resolution_y,
        "pct": scene.render.resolution_percentage,
        "filepath": scene.render.filepath,
        "camera": scene.camera,
        "format": scene.render.image_settings.file_format,
        "color_mode": scene.render.image_settings.color_mode,
    }
    underlay = bpy.data.objects.get("REF_MAP_UNDERLAY") or bpy.data.objects.get("PALAGAN_MAP_UNDERLAY")
    map_hidden = underlay.hide_render if underlay else None
    out = Path(root) / relative_png
    out.parent.mkdir(parents=True, exist_ok=True)
    started = time.time()
    try:
        scene.camera = cam
        scene.render.engine = engine
        scene.render.resolution_x = int(width)
        scene.render.resolution_y = int(height)
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "PNG"
        scene.render.image_settings.color_mode = "RGBA"
        scene.render.filepath = str(out)
        if underlay is not None:
            underlay.hide_render = True
        if engine == "CYCLES":
            scene.cycles.device = "GPU"
            scene.cycles.samples = int(samples)
            scene.cycles.use_denoising = True
            scene.cycles.use_adaptive_sampling = True
            scene.cycles.adaptive_threshold = 0.02
        bpy.ops.render.render(write_still=True)
        if not out.is_file():
            raise RuntimeError("Render produced no file: " + str(out))
        return {"camera": camera, "written": str(out), "bytes": out.stat().st_size,
                "resolution": [width, height], "engine": engine,
                "samples": samples if engine == "CYCLES" else None,
                "seconds": round(time.time() - started, 1)}
    finally:
        scene.render.engine = saved["engine"]
        scene.render.resolution_x = saved["x"]
        scene.render.resolution_y = saved["y"]
        scene.render.resolution_percentage = saved["pct"]
        scene.render.filepath = saved["filepath"]
        scene.camera = saved["camera"]
        scene.render.image_settings.file_format = saved["format"]
        scene.render.image_settings.color_mode = saved["color_mode"]
        if underlay is not None and map_hidden is not None:
            underlay.hide_render = map_hidden
