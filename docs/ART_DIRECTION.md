# Architecture and visual direction

## Intended look
A credible urban reconstruction with realistic proportions, quiet daylight, readable rivers and streets, and detail concentrated where the viewer approaches. The main view is elevated and oblique. It should read as a city district with a real street network, not a toy board, fantasy fortress, futuristic battlefield or repeated grid of identical houses.

## Order of visual decisions
1. Correct spatial relationships and landmark silhouettes.
2. Believable storeys, window rhythm, roof/parapet profiles and street scale.
3. Materials and restrained variations in weathering.
4. Small props only after date, context and performance are considered.

An elaborate texture cannot compensate for a wrong footprint or silhouette. Source images are evidence; generated geometry and rendered comparisons are interpretations.

## Scene organisation
Use separate collections for map reference, ground/water, street surfaces, each landmark, each background block, vegetation, optional props, lighting and review cameras. Each has an ownership tag. Maintain separate massing/detail objects on landmarks. Keep source-photo image empties or reference planes in an inspection collection that is disabled for final rendering.

Background blocks should combine a small vocabulary of historically informed shophouse and masonry types, with varied frontage widths and roof lengths. Avoid uniformly random windows, roofs and colours. Follow the map's street fronts and block openings; do not fill every unmarked open patch with a building.

## Materials
Begin with off-white/light plaster, weathered masonry, timber, muted roof surfaces and dark structural metal as authored appearance choices. B&W photographs establish tonal relationships rather than exact hues. Store the palette in a parameter file, not hundreds of unrelated materials. Do not copy present-day bright-red bridge paint or restored building trim without period evidence.

The new free-asset/material inventory is governed by `docs/ASSET_USAGE.md`. A licensed model is not historical evidence. Use adaptable generic assets as secondary props and material sources; no landmark replacement with a superficially similar downloaded building. PBR textures must respect reasonable scale, roughness and colour-space setup.

## Light and atmosphere
Use neutral daytime lighting for verification. Add a separate presentation look only after geometry review. Do not invent rain, dramatic fire, dense smoke, explosions or ash to conceal weak modelling or imply undocumented events. Moderate ambient occlusion can improve readability; avoid crushed shadows that obscure architectural comparison.

## Laptop resource policy
Detect resources first. Use instances for repeated components. Start background textures at1K and reserve2K for hero surfaces only when useful. Keep heavy modifiers adjustable and disabled at distance. Benchmark one detailed block and one landmark before multiplying assets. Record evaluated triangles, object/material counts, estimated texture sizes and actual viewport behaviour; no FPS or VRAM guarantee is assumed from the GPU model alone.

Use EEVEE for quick inspection and select final renders. Cycles is optional after a device test. Save before renders that may occupy Blender for a long time. Avoid installing render or generation services as dependencies for the first build.

## Required views
- `CAM_DISTRICT_OVERVIEW`: whole district, readable river and core crossing.
- `CAM_PLAN_CHECK`: near-orthographic plan comparison with the map.
- `CAM_BRIDGE`: source-informed view of deck/railings and banks.
- `CAM_INTERNATIO_REFERENCE`: approximate L004 viewpoint, with occlusion acknowledged.
- `CAM_SINGA_REFERENCE`: approximate L007 viewpoint.
- `CAM_KEMBANG_STREET`: corridor proportions and shophouse rhythm, informed by L008.

Store camera positions and target assets explicitly. Where camera matching is approximate, record the uncertainty. A convincing render does not prove exact restoration.
