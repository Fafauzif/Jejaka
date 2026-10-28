"""Headless runner for the pending streets-01 operation.

External command (from the project root):
  blender.exe --background output/working/singa-01.blend \
      --python output/build_scripts/build_05_streets_run.py -- [--no-render]

Recovery note: the GUI Blender session's MCP socket stopped executing code, so
the street fabric is rebuilt deterministically from the singa-01 checkpoint
with the script saved on disk. The live singa-01.blend file is only read.
"""
from __future__ import annotations

import json
import runpy
import sys
from pathlib import Path

import bpy

PROJECT = Path(r"C:\Users\fauzi\OneDrive\Desktop\Budayago")
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
do_render = "--no-render" not in argv

print("RUN_START", bpy.data.filepath, "objects", len(bpy.data.objects))

streets = runpy.run_path(str(PROJECT / "output/build_scripts/build_05_streets.py"))
summary = streets["build"](str(PROJECT))
print("BUILD_SUMMARY " + json.dumps(summary, indent=2)[:4000])

session = runpy.run_path(str(PROJECT / "scripts/blender_session.py"))
saved = session["save_snapshot"](str(PROJECT), "output/working/streets-01.blend",
                                 "streets-01", overwrite=True)
print("SAVED " + json.dumps(saved, indent=2))

if do_render:
    review = runpy.run_path(str(PROJECT / "output/build_scripts/render_review.py"))
    for camera, png in (("CAM_KEMBANG_STREET", "output/renders/kembang_street_01.png"),
                        ("CAM_FABRIC_OVERVIEW", "output/renders/streets_01_overview.png")):
        info = review["render"](str(PROJECT), camera, png, width=1600, height=1000,
                                samples=48, show_map=False)
        print("RENDER " + json.dumps(info))

print("RUN_DONE objects", len(bpy.data.objects))
