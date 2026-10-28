"""PALAGAN Task 3/4: detailed Jembatan Merah / Roode Brug.

Replaces the LM_BRIDGE massing with a low three-span road bridge:
- cambered paved deck and approach ramps;
- stone abutments, two river piers and shallow longitudinal fascia;
- open metal railings with posts, rails and alternating diagonal braces;
- six colonial-style lamp standards;
- quay steps on both banks;
- bridge tram rails continuing the prewar track alignment.

Evidence: M001 crossing axis; L006 prewar photograph. Deck span, width,
thickness, pier count and lamps are authored reconstruction. L006 supports a
low bridge with open metal railings but not engineering dimensions or colour.
"""
from __future__ import annotations

import json
import math
import runpy
from pathlib import Path

import bpy

OWNER = "PALAGAN_SURABAYA_V1"
X0, X1 = -60.0, 18.0
HALF_W = 6.6
DECK_END_Z = 0.42
DECK_RISE = 0.22


def deck_z(x):
    t = (x - X0) / (X1 - X0)
    return DECK_END_Z + DECK_RISE * math.sin(math.pi * max(0.0, min(1.0, t)))


def flat_bar_xz(mb, p0, p1, y, width, depth, mat=0):
    """Thin bar in the XZ plane, extruded slightly in Y."""
    x0, z0 = p0
    x1, z1 = p1
    dx, dz = x1 - x0, z1 - z0
    ln = math.hypot(dx, dz)
    if ln < 1e-6:
        return
    nx, nz = -dz / ln * width / 2, dx / ln * width / 2
    ya, yb = y - depth / 2, y + depth / 2
    a0 = (x0 + nx, ya, z0 + nz)
    a1 = (x1 + nx, ya, z1 + nz)
    a2 = (x1 - nx, ya, z1 - nz)
    a3 = (x0 - nx, ya, z0 - nz)
    b0 = (x0 + nx, yb, z0 + nz)
    b1 = (x1 + nx, yb, z1 + nz)
    b2 = (x1 - nx, yb, z1 - nz)
    b3 = (x0 - nx, yb, z0 - nz)
    mb.add_quad(a0, a1, a2, a3, mat)
    mb.add_quad(b3, b2, b1, b0, mat)
    mb.add_quad(a0, b0, b1, a1, mat)
    mb.add_quad(a1, b1, b2, a2, mat)
    mb.add_quad(a2, b2, b3, a3, mat)
    mb.add_quad(a3, b3, b0, a0, mat)


def build(root):
    root = Path(root).expanduser().resolve()
    lib = runpy.run_path(str(root / "output/build_scripts/palagan_build_lib.py"))
    ensure = lib["ensure_collection"]
    clear = lib["clear_owned_layer"]
    MB = lib["MeshBuilder"]
    tag = lib["tag_object"]
    mats = lib["material_set"](root)
    layer = ensure("LM_BRIDGE")
    clear("LM_BRIDGE")

    assumption_deck = (
        "Low three-span deck reconstructed from the M001 crossing and L006 prewar appearance. "
        "Span, width, camber, pier positions and deck thickness are authored production values, not a survey."
    )
    source = ("M001", "L006")

    # ------------------------------------------------------------------
    # deck, kerbs and approach ramps
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_DECK")
    steps = 48
    across = 4
    for i in range(steps):
        xa = X0 + (X1 - X0) * i / steps
        xb = X0 + (X1 - X0) * (i + 1) / steps
        za, zb = deck_z(xa), deck_z(xb)
        for j in range(across):
            ya = -HALF_W + 2 * HALF_W * j / across
            yb = -HALF_W + 2 * HALF_W * (j + 1) / across
            b.add_quad((xa, ya, za), (xb, ya, zb), (xb, yb, zb), (xa, yb, za), 0,
                       uv=[(xa * 0.5, ya * 0.5), (xb * 0.5, ya * 0.5),
                           (xb * 0.5, yb * 0.5), (xa * 0.5, yb * 0.5)])
    deck = b.finish(layer, [mats["setts"]], name="PALAGAN_LM_BRIDGE_DECK",
                    asset_id="LM_BRIDGE_DECK", layer="LM_BRIDGE", source_ids=source,
                    evidence_status="reconstructed", assumption=assumption_deck,
                    extra={"palagan_bridge_deck_length_m": X1 - X0,
                           "palagan_bridge_deck_width_m": 2 * HALF_W,
                           "palagan_height_status": "authored camber; no measured longitudinal section"})

    # kerbs and edge bands
    b = MB("PALAGAN_LM_BRIDGE_KERBS")
    for side in (-1, 1):
        y = side * (HALF_W - 0.18)
        for i in range(steps):
            xa = X0 + (X1 - X0) * i / steps
            xb = X0 + (X1 - X0) * (i + 1) / steps
            za, zb = deck_z(xa) + 0.12, deck_z(xb) + 0.12
            b.add_box(((xa + xb) / 2, y, (za + zb) / 2 - 0.06), (xb - xa + 0.02, 0.36, 0.12), 0)
    b.finish(layer, [mats["stone"]], name="PALAGAN_LM_BRIDGE_KERBS",
             asset_id="LM_BRIDGE_KERBS", layer="LM_BRIDGE", source_ids=source,
             evidence_status="reconstructed", assumption="Kerb dimensions authored; L006 shows paved approaches and kerbs but no measured section.")

    # approach ramps with side retaining faces
    b = MB("PALAGAN_LM_BRIDGE_RAMPS")
    for xa, xb, za, zb in ((-86.0, X0, 0.04, deck_z(X0)), (X1, 42.0, deck_z(X1), 0.04)):
        seg = 8
        for i in range(seg):
            t0, t1 = i / seg, (i + 1) / seg
            x0 = xa + (xb - xa) * t0
            x1 = xa + (xb - xa) * t1
            z0 = za + (zb - za) * t0
            z1 = za + (zb - za) * t1
            b.add_quad((x0, -HALF_W, z0), (x1, -HALF_W, z1), (x1, HALF_W, z1), (x0, HALF_W, z0), 0,
                       uv=[(x0 * 0.5, -HALF_W * 0.5), (x1 * 0.5, -HALF_W * 0.5),
                           (x1 * 0.5, HALF_W * 0.5), (x0 * 0.5, HALF_W * 0.5)])
        b.add_quad((xa, -HALF_W - 0.35, 0.0), (xb, -HALF_W - 0.35, 0.0),
                   (xb, -HALF_W - 0.35, zb), (xa, -HALF_W - 0.35, za), 1)
        b.add_quad((xa, HALF_W + 0.35, 0.0), (xb, HALF_W + 0.35, 0.0),
                   (xb, HALF_W + 0.35, zb), (xa, HALF_W + 0.35, za), 1)
    b.finish(layer, [mats["setts"], mats["stone"]], name="PALAGAN_LM_BRIDGE_RAMPS",
             asset_id="LM_BRIDGE_RAMPS", layer="LM_BRIDGE", source_ids=source,
             evidence_status="reconstructed", assumption="Ramp grades and lengths are authored to join the blockout street datum; no measured profile exists.")

    # ------------------------------------------------------------------
    # structure: abutments, piers, fascia
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_STRUCTURE")
    # abutments
    b.add_box((-63.5, 0.0, -1.0), (9.0, 17.0, 2.6), 0)
    b.add_box((21.5, 0.0, -1.0), (9.0, 17.0, 2.6), 0)
    # wing walls
    for x, s in ((-68.0, -1), (26.0, 1)):
        b.add_box((x, -10.0, -0.8), (7.0, 6.0, 1.8), 0)
        b.add_box((x, 10.0, -0.8), (7.0, 6.0, 1.8), 0)
    # river piers, with wedge noses
    for px in (-34.0, -8.0):
        b.add_box((px, 0.0, -1.7), (2.6, 13.6, 3.9), 1)
        # cutwaters facing upstream/downstream
        for side in (-1, 1):
            y0 = side * 6.8
            y1 = side * 8.6
            b.add_tri((px - 1.3, y0, -3.6), (px + 1.3, y0, -3.6), (px, y1, -3.6), 1)
            b.add_tri((px - 1.3, y0, 0.2), (px, y1, 0.2), (px + 1.3, y0, 0.2), 1)
            b.add_quad((px - 1.3, y0, -3.6), (px, y1, -3.6), (px, y1, 0.2), (px - 1.3, y0, 0.2), 1)
            b.add_quad((px, y1, -3.6), (px + 1.3, y0, -3.6), (px + 1.3, y0, 0.2), (px, y1, 0.2), 1)
    structure = b.finish(layer, [mats["stone"], mats["stone_dark"]],
                         name="PALAGAN_LM_BRIDGE_STRUCTURE", asset_id="LM_BRIDGE_STRUCTURE",
                         layer="LM_BRIDGE", source_ids=source, evidence_status="reconstructed",
                         assumption="Abutment and pier engineering is inferred. Unseen foundations are not claimed; upstream cutwaters are a plausible authored detail.",
                         extra={"palagan_structural_class": "RECONSTRUCTED_STRUCTURAL_FILL"})

    # fascia beams as segmented side profiles following the camber
    b = MB("PALAGAN_LM_BRIDGE_FASCIA")
    for y in (-HALF_W - 0.05, HALF_W + 0.05):
        for i in range(steps):
            xa = X0 + (X1 - X0) * i / steps
            xb = X0 + (X1 - X0) * (i + 1) / steps
            za, zb = deck_z(xa), deck_z(xb)
            b.add_quad((xa, y, za - 0.85), (xb, y, zb - 0.85), (xb, y, zb), (xa, y, za), 0)
            b.add_quad((xa, y, za), (xb, y, zb), (xb, y, zb - 0.85), (xa, y, za - 0.85), 0)
    b.finish(layer, [mats["stone"]], name="PALAGAN_LM_BRIDGE_FASCIA",
             asset_id="LM_BRIDGE_FASCIA", layer="LM_BRIDGE", source_ids=source,
             evidence_status="reconstructed", assumption="Shallow fascia profile is authored from the low bridge silhouette; no structural drawings exist in the package.")

    # ------------------------------------------------------------------
    # railings
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_RAILINGS")
    panel = 1.9
    n = int((X1 - X0) / panel)
    for side in (-1, 1):
        y = side * (HALF_W - 0.24)
        xs = [X0 + i * (X1 - X0) / n for i in range(n + 1)]
        for i, x in enumerate(xs):
            z = deck_z(x)
            size = 0.18 if i in (0, len(xs) - 1) else 0.10
            b.add_box((x, y, z + 0.56), (size, size, 1.12), 0)
            b.add_box((x, y, z + 1.16), (size + 0.08, size + 0.08, 0.08), 0)
        for i in range(n):
            xa, xb = xs[i], xs[i + 1]
            za, zb = deck_z(xa), deck_z(xb)
            flat_bar_xz(b, (xa, za + 1.13), (xb, zb + 1.13), y, 0.075, 0.075, 0)
            flat_bar_xz(b, (xa, za + 0.14), (xb, zb + 0.14), y, 0.06, 0.05, 0)
            flat_bar_xz(b, (xa, za + 0.56), (xb, zb + 0.56), y, 0.045, 0.04, 0)
            if i % 2 == 0:
                flat_bar_xz(b, (xa, za + 0.16), (xb, zb + 0.98), y, 0.045, 0.04, 0)
            else:
                flat_bar_xz(b, (xb, zb + 0.16), (xa, za + 0.98), y, 0.045, 0.04, 0)
    b.finish(layer, [mats["metal_rust"]], name="PALAGAN_LM_BRIDGE_RAILINGS",
             asset_id="LM_BRIDGE_RAILINGS", layer="LM_BRIDGE", source_ids=("L006",),
             evidence_status="reconstructed",
             assumption="Railing rhythm is based on the visible L006 open metal railing with diagonal braces. Panel spacing and bar profiles are authored; the source does not establish every panel or the 1945 paint colour. Dark oxide finish is a presentation assumption, not evidence of red paint.",
             extra={"palagan_reference_detail": "L006_bridge_railings_crop.jpg"})

    # ------------------------------------------------------------------
    # lamp standards
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_LAMPS")
    for x in (-48.0, -22.0, 4.0):
        for side in (-1, 1):
            y = side * (HALF_W - 0.55)
            z = deck_z(x)
            b.add_cylinder((x, y, z + 0.14), 0.24, 0.28, 1, 8)
            b.add_cylinder((x, y, z + 1.1), 0.09, 1.8, 0, 8)
            b.add_cylinder((x, y, z + 2.0), 0.13, 0.12, 1, 8)
            b.add_cylinder((x, y, z + 2.75), 0.07, 1.35, 0, 8)
            # horizontal arm toward the deck centre
            arm_y = y - side * 0.55
            b.add_cylinder((x, arm_y, z + 3.38), 0.045, 1.05, 0, 6, axis="Y")
            b.add_cylinder((x, arm_y - side * 0.5, z + 3.25), 0.035, 0.3, 0, 6)
            # lantern
            b.add_box((x, arm_y - side * 0.5, z + 3.0), (0.28, 0.28, 0.44), 2)
            b.add_box((x, arm_y - side * 0.5, z + 3.25), (0.36, 0.36, 0.10), 1)
            b.add_tri((x - 0.2, arm_y - side * 0.5, z + 3.3), (x + 0.2, arm_y - side * 0.5, z + 3.3),
                      (x, arm_y - side * 0.5, z + 3.5), 1)
    b.finish(layer, [mats["metal_rust"], mats["stone"], mats["glass"]],
             name="PALAGAN_LM_BRIDGE_LAMPS", asset_id="LM_BRIDGE_LAMPS", layer="LM_BRIDGE",
             source_ids=("L006",), evidence_status="reconstructed",
             assumption="Lamp positions/design are an authored interpretation of the prewar street lighting visible in L006. No 1945 lighting inventory is implied.")

    # ------------------------------------------------------------------
    # quay steps
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_STEPS")
    # west bank just south of the bridge, descending east
    for i in range(5):
        x = -53.0 + i * 0.9
        z = 0.10 - i * 0.27
        b.add_box((x, -15.0, z - 0.14), (1.0, 3.4, 0.28), 0)
    # east bank just north of the bridge, descending west
    for i in range(5):
        x = 12.0 - i * 0.9
        z = 0.10 - i * 0.27
        b.add_box((x, 15.0, z - 0.14), (1.0, 3.4, 0.28), 0)
    b.finish(layer, [mats["stone"]], name="PALAGAN_LM_BRIDGE_STEPS",
             asset_id="LM_BRIDGE_STEPS", layer="LM_BRIDGE", source_ids=("L006",),
             evidence_status="reconstructed",
             assumption="Waterfront steps are visible in L006; exact count, position and dimensions at the bridge are authored.")

    # ------------------------------------------------------------------
    # bridge tram rails
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_BRIDGE_TRAM")
    for off in (-0.72, 0.72):
        for i in range(steps):
            xa = X0 + (X1 - X0) * i / steps
            xb = X0 + (X1 - X0) * (i + 1) / steps
            za, zb = deck_z(xa) + 0.015, deck_z(xb) + 0.015
            b.add_quad((xa, off - 0.045, za), (xb, off - 0.045, zb),
                       (xb, off + 0.045, zb), (xa, off + 0.045, za), 0)
    b.finish(layer, [mats["metal"]], name="PALAGAN_LM_BRIDGE_TRAM",
             asset_id="TRAM_RAILS_BRIDGE", layer="LM_BRIDGE", source_ids=("L004", "L006"),
             evidence_status="reconstructed",
             assumption="Prewar tram track across the bridge is inferred from visible tram infrastructure in L004/L006; wartime operation is not asserted.")

    # ------------------------------------------------------------------
    # camera
    # ------------------------------------------------------------------
    cam = bpy.data.objects.get("CAM_BRIDGE")
    if cam is None:
        cdata = bpy.data.cameras.new("CAM_BRIDGE")
        cdata.lens = 46.0
        cdata.sensor_width = 36.0
        cdata.clip_start = 0.3
        cdata.clip_end = 3000.0
        cam = bpy.data.objects.new("CAM_BRIDGE", cdata)
        ensure("CAMERAS").objects.link(cam)
    cam.location = (-92.0, -35.0, 7.0)
    target = (12.0, 4.0, 1.4)
    from mathutils import Vector
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    tag(cam, "CAM_BRIDGE", "CAMERAS", ("L006", "M001"), "reconstructed",
        "Approximate source-like bridge view from the west/south bank; lens and framing are authored, not a measured camera match.",
        extra={"palagan_camera_purpose": "bridge deck, railings and banks", "palagan_target_xyz": list(target)})

    scene = bpy.context.scene
    scene["palagan_last_operation"] = "bridge-01"
    scene["palagan_bridge_status"] = (
        "Detailed low bridge built from M001 + L006. Deck/pier/railing dimensions inferred; "
        "exact 1945 material colour and wartime damage unresolved."
    )
    return {
        "objects": len(layer.objects),
        "deck_length_m": X1 - X0,
        "deck_width_m": 2 * HALF_W,
        "rail_panels_per_side": n,
        "next": "Inspect CAM_BRIDGE render against L006 crop; then Internatio detail.",
    }


if __name__ == "__main__":
    raise SystemExit("Run build(ROOT) inside Blender")
