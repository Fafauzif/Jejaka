"""PALAGAN Task 3/5: Internatio office block at Willemsplein/Heerenstraat.

Rebuilds the LM_INTERNATIO massing as a long modernist office block:
- corrected setback south of Heerenstraat (the old massing crossed the street);
- 12-bay facade with ground arcade, tall upper windows and small top lights;
- projecting piers, balcony band, cornices and stepped end towers;
- blank removable signage band (no invented lettering);
- simple reconstructed rear and a separate low roof layer.

Evidence: L004 is the principal appearance reference; L002 supports identity.
The footprint remains a placement hypothesis and all dimensions/condition are
authored reconstruction. L005 is comparison-only, not a target-date source.
"""
from __future__ import annotations

import json
import math
import runpy
from pathlib import Path

import bpy
from mathutils import Vector

OWNER = "PALAGAN_SURABAYA_V1"
ORIGIN = (-135.0, 22.0)
ANGLE_DEG = 161.565051177078
ANGLE = math.radians(ANGLE_DEG)
X0, X1 = -36.0, 36.0
BAYS = 12
BW = (X1 - X0) / BAYS
TOWER_X = 42.0
Z_UPPER_TOP = 17.0
Z_ENT_TOP = 17.55
Z_SIGN_TOP = 18.85
Z_TOPLIGHT_TOP = 20.35
Z_PARAPET_TOP = 21.75
Z_BODY_TOP = 22.05
Z_TOWER_TOP = 24.2
Z_CAP_TOP = 26.85


def build(root):
    root = Path(root).expanduser().resolve()
    lib = runpy.run_path(str(root / "output/build_scripts/palagan_build_lib.py"))
    ensure = lib["ensure_collection"]
    clear = lib["clear_owned_layer"]
    MB = lib["MeshBuilder"]
    tag = lib["tag_object"]
    mats = lib["material_set"](root)
    layer = ensure("LM_INTERNATIO")
    clear("LM_INTERNATIO")

    # Dedicated clean plaster/glass palette for the modernist block. The shared
    # grey plaster texture reads as heavy vertical streaking at this scale.
    def simple_material(name, base, roughness, metallic=0.0):
        mat = bpy.data.materials.get(name)
        if mat is None:
            mat = lib["make_principled_material"](name, base, roughness, metallic=metallic)
        if mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = base
                bsdf.inputs["Roughness"].default_value = roughness
                bsdf.inputs["Metallic"].default_value = metallic
            mat.diffuse_color = base
        return mat

    plaster_i = simple_material("MAT_INTERNATIO_PLASTER", (0.63, 0.61, 0.54, 1), 0.86)
    trim_i = simple_material("MAT_INTERNATIO_TRIM", (0.78, 0.76, 0.68, 1), 0.8)
    glass_i = simple_material("MAT_INTERNATIO_GLASS", (0.095, 0.11, 0.115, 1), 0.3, 0.3)
    reveal_i = simple_material("MAT_INTERNATIO_REVEAL", (0.29, 0.29, 0.265, 1), 0.9)
    # A faint procedural surface break-up keeps the large plaster fields from going plastic.
    if not plaster_i.node_tree.nodes.get("PlasterMicroBump"):
        nt = plaster_i.node_tree
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.name = "PlasterMicroBump"
        noise.inputs["Scale"].default_value = 9.0
        noise.inputs["Detail"].default_value = 3.0
        noise.inputs["Roughness"].default_value = 0.6
        noise.location = (-520, -280)
        bump = nt.nodes.new("ShaderNodeBump")
        bump.location = (-240, -280)
        bump.inputs["Strength"].default_value = 0.07
        bump.inputs["Distance"].default_value = 0.04
        nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], nt.nodes.get("Principled BSDF").inputs["Normal"])

    source = ("M001", "L002", "L004")
    assumed = (
        "Placement hypothesis at Willemsplein/Heerenstraat, parallel to the street and set back "
        "about four metres. The footprint is not a surveyed plan; the P.W.D. map footprint is NOT used. "
        "Facade bay count follows L004, but dimensions, heights, openings, rear and roof are authored reconstruction."
    )

    def box(mb, xa, xb, ya, yb, za, zb, mat):
        mb.add_box(((xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2),
                   (xb - xa, yb - ya, zb - za), mat)

    def place(obj):
        # The L004 facade reads taller/narrower than the provisional 96 m massing.
        # Compress the detailed mesh to ~84 m total (towers included); 12 bays stay.
        for v in obj.data.vertices:
            v.co.x *= 0.875
        obj.location = (ORIGIN[0], ORIGIN[1], 0.0)
        obj.rotation_euler.z = ANGLE
        return obj

    # ------------------------------------------------------------------
    # 1. body shell and tower shafts
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_BODY")
    box(b, X0, X1, -10.6, 12.0, 0.0, Z_BODY_TOP, 0)
    for tx in (-TOWER_X, TOWER_X):
        box(b, tx - 6.0, tx + 6.0, -13.0, 7.0, 0.0, Z_TOWER_TOP, 0)
    body = b.finish(layer, [plaster_i],
                    name="PALAGAN_LM_INTERNATIO_BODY", asset_id="LM_INTERNATIO_BODY",
                    layer="LM_INTERNATIO", source_ids=source, evidence_status="reconstructed",
                    assumption=assumed + " Front wall is expressed by separate facade objects; body depth is an authored 24 m.",
                    extra={"palagan_bay_count": BAYS,
                           "palagan_height_status": "authored reconstruction, no surveyed section",
                           "palagan_footprint_status": "provisional placement hypothesis"})
    place(body)

    # ------------------------------------------------------------------
    # 2. facade: piers, horizontal bands, tower framing
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_FACADE")
    # ground-floor piers on every bay boundary
    for i in range(BAYS + 1):
        x = X0 + i * BW
        box(b, x - 0.52, x + 0.52, -12.25, -11.05, 0.65, 6.25, 0)
    # upper-storey projecting piers
    for i in range(BAYS + 1):
        x = X0 + i * BW
        box(b, x - 0.46, x + 0.46, -12.4, -10.35, 8.2, Z_UPPER_TOP, 0)
    # continuous upper sill / lintel bands
    box(b, X0, X1, -11.95, -10.45, 8.2, 8.78, 0)
    box(b, X0, X1, -11.95, -10.45, Z_UPPER_TOP - 0.08, Z_UPPER_TOP, 0)
    # ground-floor lintel band
    box(b, X0, X1, -12.2, -11.05, 5.9, 6.6, 0)
    # balcony / mezzanine band and cornices
    box(b, X0, X1, -13.05, -11.35, 6.6, 6.98, 1)
    box(b, X0, X1, -12.18, -11.45, 6.98, 7.92, 0)
    box(b, X0, X1, -12.98, -11.45, 7.92, 8.2, 1)
    # repeated raised panels on the balcony band
    for i in range(24):
        xc = X0 + 1.5 + i * 3.0
        box(b, xc - 0.58, xc + 0.58, -12.25, -12.14, 7.14, 7.76, 1)
    # upper horizontal shading fins per bay
    for i in range(BAYS):
        lo, hi = X0 + i * BW, X0 + (i + 1) * BW
        box(b, lo + 1.15, hi - 1.15, -12.18, -10.5, 9.1, 9.32, 1)
        box(b, lo + 1.15, hi - 1.15, -12.02, -10.5, 12.05, 12.22, 0)
        # dark side reveals make the deep window bays legible at district distance
        box(b, lo + 1.1, lo + 1.32, -10.92, -10.56, 8.78, Z_UPPER_TOP - 0.09, 2)
        box(b, hi - 1.32, hi - 1.1, -10.92, -10.56, 8.78, Z_UPPER_TOP - 0.09, 2)
    # shadow gaps under the two main cornices and above the ground arcade
    box(b, X0, X1, -12.48, -11.2, Z_UPPER_TOP - 0.02, Z_UPPER_TOP + 0.04, 2)
    box(b, X0, X1, -12.22, -11.25, 8.18, 8.24, 2)
    # entablature
    box(b, X0, X1, -13.05, -11.0, Z_UPPER_TOP, Z_ENT_TOP, 1)
    box(b, X0 - 0.3, X1 + 0.3, -13.15, -11.1, Z_ENT_TOP - 0.2, Z_ENT_TOP, 0)
    # small-window band: vertical mullions and sill/head bands
    z_top0, z_top1 = Z_TOPLIGHT_TOP - 1.5, Z_TOPLIGHT_TOP - 0.1
    box(b, X0, X1, -12.1, -11.55, z_top0, z_top0 + 0.2, 0)
    box(b, X0, X1, -12.1, -11.55, z_top1 - 0.2, z_top1, 0)
    n_top = 42
    for i in range(n_top + 1):
        x = X0 + i * (X1 - X0) / n_top
        box(b, x - 0.08, x + 0.08, -12.02, -11.82, z_top0 + 0.2, z_top1 - 0.2, 0)
    # tower framing pilasters and cornices
    for tx in (-TOWER_X, TOWER_X):
        for sx in (-1, 1):
            x = tx + sx * 5.55
            box(b, x - 0.45, x + 0.45, -13.5, -12.88, 0.7, 22.4, 1)
        for z0, z1 in ((7.15, 7.55), (16.55, 16.95), (21.35, 21.75)):
            box(b, tx - 6.05, tx + 6.05, -13.5, -12.82, z0, z1, 1)
    facade = b.finish(layer, [plaster_i, trim_i, reveal_i],
                      name="PALAGAN_LM_INTERNATIO_FACADE", asset_id="LM_INTERNATIO_FACADE",
                      layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                      assumption=assumed + " Bay width is derived by distributing L004's repeated vertical rhythm across the provisional length; the source does not give a measured bay dimension.",
                      extra={"palagan_bay_count": BAYS,
                             "palagan_bay_width_m": round(BW, 3),
                             "palagan_facade_module": "pier/opening/recess/shade fin"})
    place(facade)

    # ------------------------------------------------------------------
    # 3. dark glazing, mullions and tower window slots
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_WINDOWS")
    for i in range(BAYS):
        lo, hi = X0 + i * BW, X0 + (i + 1) * BW
        # tall upper window
        box(b, lo + 1.2, hi - 1.2, -10.78, -10.63, 8.78, Z_UPPER_TOP - 0.08, 0)
        for mx in (lo + 1.9, hi - 1.9):
            box(b, mx - 0.07, mx + 0.07, -10.72, -10.55, 8.78, Z_UPPER_TOP - 0.08, 1)
        box(b, lo + 1.2, hi - 1.2, -10.72, -10.52, 12.65, 12.83, 1)
        box(b, lo + 1.2, hi - 1.2, -10.7, -10.5, 8.78, 8.92, 1)
        # balcony-band dark recesses
        xc = lo + BW / 2
        box(b, xc - 0.55, xc + 0.55, -12.3, -12.22, 7.16, 7.74, 0)
    # continuous top-light glazing behind the mullion screen
    z_top0, z_top1 = Z_TOPLIGHT_TOP - 1.5, Z_TOPLIGHT_TOP - 0.1
    box(b, X0, X1, -11.82, -11.62, z_top0 + 0.2, z_top1 - 0.2, 0)
    # tower front slots
    for tx in (-TOWER_X, TOWER_X):
        for dx in (-3.0, 0.0, 3.0):
            box(b, tx + dx - 0.44, tx + dx + 0.44, -13.1, -12.98, 8.8, 18.9, 0)
            box(b, tx + dx - 0.05, tx + dx + 0.05, -13.04, -12.9, 8.8, 18.9, 1)
            box(b, tx + dx - 0.44, tx + dx + 0.44, -13.04, -12.9, 13.55, 13.72, 1)
            box(b, tx + dx - 0.53, tx + dx + 0.53, -13.04, -12.9, 8.64, 8.8, 1)
            box(b, tx + dx - 0.53, tx + dx + 0.53, -13.04, -12.9, 18.72, 18.88, 1)
        # upper slit windows in the tower cap
        for dx in (-1.7, 0.0, 1.7):
            box(b, tx + dx - 0.23, tx + dx + 0.23, -13.08, -12.98, 21.2, 23.55, 0)
    # tower outer-side windows, visible along the street
    for tx in (-TOWER_X, TOWER_X):
        side_x = tx + (6.03 if tx > 0 else -6.03)
        for zc in (5.0, 9.8, 14.4, 19.0):
            for dy in (-3.1, 1.9):
                box(b, side_x - 0.05, side_x + 0.05, dy - 0.65, dy + 0.65, zc, zc + 1.8, 0)
                box(b, side_x - 0.09, side_x + 0.09, dy - 0.72, dy + 0.72, zc + 1.8, zc + 1.92, 1)
    windows = b.finish(layer, [glass_i, trim_i],
                       name="PALAGAN_LM_INTERNATIO_WINDOWS", asset_id="LM_INTERNATIO_WINDOWS",
                       layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                       assumption="Glazing pattern, transom positions and slit windows are authored from the visible prewar facade. Dark glazing is a production choice, not evidence of 1945 glass condition.")
    place(windows)

    # ------------------------------------------------------------------
    # 4. ground-floor arcade, doors, steps and canopy
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_GROUND")
    box(b, X0, X1, -12.42, -11.4, 0.0, 0.65, 0)
    box(b, X0, X1, -12.26, -11.2, 5.82, 5.9, 5)
    for i in range(BAYS):
        lo, hi = X0 + i * BW, X0 + (i + 1) * BW
        ox0, ox1 = lo + 1.08, hi - 1.08
        # recessed shopfront / office interior
        box(b, ox0, ox1, -11.2, -11.08, 0.65, 5.9, 3)
        # central door leaf and flanking glazing
        xc = (lo + hi) / 2
        box(b, xc - 1.05, xc + 1.05, -11.06, -10.98, 0.65, 4.35, 2)
        for dx in (-2.1, 2.1):
            box(b, xc + dx - 0.9, xc + dx + 0.9, -11.04, -10.96, 0.65, 4.35, 3)
        # transom and door frame
        box(b, ox0, ox1, -11.02, -10.9, 4.35, 4.5, 4)
        box(b, xc - 1.15, xc - 1.03, -11.02, -10.9, 0.65, 4.5, 4)
        box(b, xc + 1.03, xc + 1.15, -11.02, -10.9, 0.65, 4.5, 4)
        # inner arcade frames break up the deep ground-floor shadow
        box(b, ox0, ox0 + 0.2, -11.52, -11.12, 0.65, 5.9, 4)
        box(b, ox1 - 0.2, ox1, -11.52, -11.12, 0.65, 5.9, 4)
        box(b, ox0, ox1, -11.52, -11.12, 5.62, 5.9, 4)
        # entry steps
        box(b, ox0, ox1, -12.92, -12.35, 0.0, 0.17, 0)
        box(b, ox0 + 0.2, ox1 - 0.2, -12.64, -12.35, 0.17, 0.32, 0)
    # continuous canopy
    box(b, X0, X1, -13.02, -11.9, 6.18, 6.4, 4)
    box(b, X0, X1, -13.06, -12.94, 6.2, 6.6, 1)
    # tower portals
    for tx in (-TOWER_X, TOWER_X):
        box(b, tx - 1.8, tx + 1.8, -13.06, -12.94, 0.7, 5.0, 3)
        box(b, tx - 1.95, tx - 1.75, -13.1, -12.95, 0.7, 5.0, 4)
        box(b, tx + 1.75, tx + 1.95, -13.1, -12.95, 0.7, 5.0, 4)
        box(b, tx - 1.95, tx + 1.95, -13.1, -12.95, 4.95, 5.2, 4)
        box(b, tx - 2.2, tx + 2.2, -13.65, -13.05, 0.0, 0.18, 0)
        box(b, tx - 2.0, tx + 2.0, -13.4, -13.05, 0.18, 0.34, 0)
    ground = b.finish(layer, [mats["stone"], plaster_i, mats["wood"],
                              glass_i, trim_i, reveal_i],
                      name="PALAGAN_LM_INTERNATIO_GROUND", asset_id="LM_INTERNATIO_GROUND",
                      layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                      assumption="Ground-floor openings, doors and steps are authored. L004 has a tram and people obscuring much of the lower facade, so the exact door/window rhythm is not fully recoverable.")
    place(ground)

    # ------------------------------------------------------------------
    # 5. parapets and stepped tower caps
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_PARAPETS")
    box(b, X0, X1, -12.02, -11.42, Z_TOPLIGHT_TOP, Z_PARAPET_TOP, 0)
    box(b, X0, X1, -12.16, -11.28, Z_PARAPET_TOP - 0.02, Z_PARAPET_TOP + 0.2, 1)
    for tx in (-TOWER_X, TOWER_X):
        box(b, tx - 6.2, tx + 6.2, -13.1, 7.1, Z_TOWER_TOP, Z_TOWER_TOP + 0.8, 0)
        box(b, tx - 5.35, tx + 5.35, -12.35, 6.35, Z_TOWER_TOP + 0.8, Z_TOWER_TOP + 1.6, 1)
        box(b, tx - 4.35, tx + 4.35, -11.55, 5.55, Z_TOWER_TOP + 1.6, Z_TOWER_TOP + 2.25, 0)
        box(b, tx - 4.55, tx + 4.55, -11.75, 5.75, Z_TOWER_TOP + 2.25, Z_CAP_TOP, 1)
    parapets = b.finish(layer, [plaster_i, trim_i],
                        name="PALAGAN_LM_INTERNATIO_PARAPETS", asset_id="LM_INTERNATIO_PARAPETS",
                        layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                        assumption="Stepped tower caps and parapet profile follow the L004 silhouette; exact step heights and cap plan are authored.")
    place(parapets)

    # ------------------------------------------------------------------
    # 6. roof, kept as a separate reconstruction layer
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_ROOF")
    b.add_hip_roof(X0 + 0.6, X1 - 0.6, -10.0, 11.4, Z_PARAPET_TOP - 0.05, 1.6, 0, overhang=0.25, ridge_ratio=0.68)
    # low rooftop plant / stair bulk
    box(b, -8.0, 6.0, -1.0, 7.0, Z_PARAPET_TOP, Z_PARAPET_TOP + 1.35, 1)
    for xc in (-20.0, -12.0, 16.0):
        box(b, xc - 1.1, xc + 1.1, 1.8, 4.0, Z_PARAPET_TOP, Z_PARAPET_TOP + 0.9, 1)
    roof = b.finish(layer, [mats["roof_dark"], mats["plaster_grey"]],
                    name="PALAGAN_LM_INTERNATIO_ROOF", asset_id="LM_INTERNATIO_ROOF",
                    layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                    assumption="Roof form is almost entirely hidden behind the parapet in L004. Low hip form, roof tile and rooftop plant are a reconstruction layer, not documented 1945 construction.")
    place(roof)

    # ------------------------------------------------------------------
    # 7. blank signage band - no invented lettering
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_SIGNAGE")
    box(b, X0, X1, -11.92, -11.58, Z_ENT_TOP, Z_SIGN_TOP, 0)
    box(b, X0, X1, -12.02, -11.9, Z_ENT_TOP, Z_ENT_TOP + 0.12, 1)
    box(b, X0, X1, -12.02, -11.9, Z_SIGN_TOP - 0.12, Z_SIGN_TOP, 1)
    for i in range(1, 6):
        x = X0 + i * (X1 - X0) / 6
        box(b, x - 0.035, x + 0.035, -11.94, -11.9, Z_ENT_TOP + 0.12, Z_SIGN_TOP - 0.12, 2)
    signage = b.finish(layer, [trim_i, plaster_i, mats["metal_rust"]],
                       name="PALAGAN_LM_INTERNATIO_SIGNAGE_BAND", asset_id="LM_INTERNATIO_SIGNAGE_BAND",
                       layer="LM_INTERNATIO", source_ids=("L004",), evidence_status="reconstructed",
                       assumption="The long prewar lettering is visible in L004, but 1945 wording/condition is unresolved. This is a deliberately blank, removable band: no characters have been invented or copied into the model.",
                       extra={"palagan_lettering_status": "intentionally omitted; editable blank band"})
    place(signage)

    # ------------------------------------------------------------------
    # 8. rear and side service detail
    # ------------------------------------------------------------------
    b = MB("PALAGAN_LM_INTERNATIO_REAR")
    for i in range(BAYS):
        xc = X0 + (i + 0.5) * BW
        for zc in (3.9, 9.2, 14.5):
            box(b, xc - 1.0, xc + 1.0, 12.02, 12.12, zc, zc + 1.9, 0)
            box(b, xc - 1.12, xc + 1.12, 12.12, 12.18, zc + 1.9, zc + 2.02, 1)
            box(b, xc - 1.12, xc + 1.12, 12.12, 12.18, zc - 0.12, zc, 1)
    for xc in (-20.0, 20.0):
        box(b, xc - 1.2, xc + 1.2, 12.03, 12.14, 0.0, 3.1, 2)
        box(b, xc - 1.32, xc + 1.32, 12.14, 12.2, 3.1, 3.25, 1)
    for xc in (-34.0, -17.0, 0.0, 17.0, 34.0):
        b.add_cylinder((xc, 12.22, 10.6), 0.075, 21.2, 3, 8, axis="Z")
    rear = b.finish(layer, [glass_i, trim_i, mats["wood"], mats["metal"]],
                    name="PALAGAN_LM_INTERNATIO_REAR", asset_id="LM_INTERNATIO_REAR",
                    layer="LM_INTERNATIO", source_ids=("L004", "L005"), evidence_status="reconstructed",
                    assumption="Rear elevation is unseen in the principal reference and deliberately simpler. Window grid, doors and downpipes are authored reconstruction, not documented detail.")
    place(rear)

    # ------------------------------------------------------------------
    # camera approximating the L004 viewing side
    # ------------------------------------------------------------------
    cam = bpy.data.objects.get("CAM_INTERNATIO_REFERENCE")
    if cam is None:
        cdata = bpy.data.cameras.new("CAM_INTERNATIO_REFERENCE")
        cam = bpy.data.objects.new("CAM_INTERNATIO_REFERENCE", cdata)
        ensure("CAMERAS").objects.link(cam)
    c, s = math.cos(ANGLE), math.sin(ANGLE)
    local_cam = (0.0, -90.0, 2.2)
    world_cam = (ORIGIN[0] + local_cam[0] * c - local_cam[1] * s,
                 ORIGIN[1] + local_cam[0] * s + local_cam[1] * c,
                 local_cam[2])
    target_local = (0.0, 0.0, 11.4)
    target = (ORIGIN[0] + target_local[0] * c - target_local[1] * s,
              ORIGIN[1] + target_local[0] * s + target_local[1] * c,
              target_local[2])
    cam.data.lens = 32.0
    cam.data.sensor_width = 36.0
    cam.data.clip_start = 0.3
    cam.data.clip_end = 4000.0
    cam.location = world_cam
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    tag(cam, "CAM_INTERNATIO_REFERENCE", "CAMERAS", ("L004",), "reconstructed",
        "Approximate L004 viewing side and framing; not a photogrammetric camera match. Foreground is open in the blockout and will be reassessed after street fabric is added.",
        extra={"palagan_camera_purpose": "Internatio facade comparison", "palagan_target_xyz": list(target),
               "palagan_camera_local_xyz": list(local_cam), "palagan_lens_mm": 32.0})

    scene = bpy.context.scene
    scene["palagan_last_operation"] = "internatio-01"
    scene["palagan_internatio_status"] = (
        "Detailed 12-bay modernist block, tower caps and blank signage band built from L004. "
        "Footprint placement, dimensions, rear elevation and 1945 condition remain reconstructed/unresolved."
    )
    scene["palagan_internatio_checks"] = (
        "Front setback corrected so the old massing no longer crosses Heerenstraat. "
        "Lettering deliberately omitted rather than invented. P.W.D. footprint excluded."
    )
    return {
        "objects": len(layer.objects),
        "bays": BAYS,
        "bay_width_m": round(BW * 0.875, 3),
        "overall_length_m": 84.0,
        "origin_xy": list(ORIGIN),
        "angle_deg": ANGLE_DEG,
        "camera_world": [round(v, 2) for v in world_cam],
        "next": "Render CAM_INTERNATIO_REFERENCE, compare to L004 crop, correct proportions.",
    }


if __name__ == "__main__":
    raise SystemExit("Run build(ROOT) inside Blender")
