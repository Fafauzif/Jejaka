# Continuation

Last operation: `hero-renders-01` (complete). Master scene:
`output/PALAGAN_Surabaya_Master.blend` (138 objects: 135 owned + 3 preserved baseline;
42 materials; 589,282 base triangles; 9 cameras). Checkpoints under
`progress/checkpoints/handoff-01/` and `progress/checkpoints/hero-renders-01/`.
Five presentation stills live in `output/renders/hero_0*.png` (1920x1200, Cycles).
Read `output/DELIVERY_REPORT.md` before changing anything.

## Where the build stands

Tasks 1-4 complete, Task 5 (materials, lighting, presentation) complete, Task 6
handoff written. Built: Kali Mas and the mapped road network, detailed Jembatan
Merah, Internatio and Singa, the Kembang Djepoen corridor, 327 front shophouse
modules with 246 rear ranges, and 883 authored background parcels (1,563 units).

## Exact next action

The highest-value remaining work, in order:

1. **Facade detail on the `F_*` approximate massings** at the bridgehead. They are
   currently windowless boxes and dominate `final_bridge.png`. Evidence for their
   facades has NOT been established, so this needs a brief before modelling; do not
   invent a facade and call it documented.
2. **Water at grazing angles.** Still reads as a flat pale sheet in
   `final_singa.png`. Try a layered approach (darker base, visible ripple normals,
   more roughness variation) or accept and document.
3. **Revisit `CAM_INTERNATIO_REFERENCE`.** The raised three-quarter view is clear but
   is not an L004-like view; a ground-level comparison would be closer to the source.
4. **Optional period props.** Only after the date and placement can be supported.

Do not regenerate the city. Everything above is an incremental edit on the master.

## Known limitations carried forward

- Rows and parcels are typological (D011): widths, storeys, colours, shopfronts and
  background depth are authored; signboards are blank.
- Coarse `F_*` massings have no facade detail (see above).
- Background parcels are merged meshes, not instanced; scaling the module family up
  raises memory roughly linearly.
- Water, and the outer corners of the 650 m radius, are the weakest visual areas.
- Reconstruction assumptions are recorded in `DECISIONS.md` D011, D013-D016.

## Environment note

The MCP bridge was re-verified WORKING on 2026-10-24 (D017). The earlier failure that
forced the headless rebuilds (D012) has not recurred. A `{"type":"execute", ...}`
request, JSON terminated with a NUL byte, to 127.0.0.1:9876 returns `status: ok`.

It had genuinely hung during `streets-01`; it was never broken by configuration. To
reset it, the control is in **Edit > Preferences > Add-ons > MCP** and its
preferences panel (`Start MCP Bridge Server` / `Stop MCP Server`). It is NOT in the
3D Viewport N-sidebar; the add-on defines no sidebar panel, which is why looking for
it next to Blendkit finds nothing.

The live GUI session holds `output/working/singa-01.blend` with unsaved changes
(`palagan_last_operation = singa-01`, 137 objects, dirty) - the stale scene from D012.
Saving there would write to `singa-01.blend`, not to the master. Either revert it or
open `output/PALAGAN_Surabaya_Master.blend` instead.

## Build scripts for this batch

- `build_05_streets.py` — construction (street rows, shopfronts, background parcels)
- `apply_06_materials.py` + `material_palette.json` — material rebuild from parameters
- `apply_07_lighting.py` + `lighting_params.json` — daylight rig
- `apply_09_cameras.py` + `camera_setup.json` — camera placement with look-at aiming
- `verify_12_final.py` — integrity checks and evaluated geometry counts
- `run_06_materials.py`, `run_07_lighting.py`, `run_08_streets02.py`,
  `run_09_cameras.py`, `run_10_background.py`, `run_11_water.py`,
  `run_12_handoff.py` — headless runners for each operation
- `validate_05_streets.py`, `inspect_05_*.py`, `inspect_06_materials.py`,
  `inspect_08_bounds.py` — review and validation scripts
