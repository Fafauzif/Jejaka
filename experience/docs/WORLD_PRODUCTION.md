# Street-level environment

The runtime loads the exported Surabaya district without changing the Blender master. It retains the original geometry and materials and adds a separate presentation layer.

## Coordinate and walking surfaces

The GLB already uses Y-up coordinates. Original Blender `(x, y, z)` corresponds to runtime `(x, z, -y)`. Road surfaces lie near runtime Y = 0.035 m. The bridge deck rises from approximately 0.42 m to 0.64 m. Approach ramps extend to X = -86 m on the west and X = 42 m on the east. A raycast against road, pavement, apron, bridge-deck, and ramp meshes provides standing height. A half-metre cache limits repeated queries.

## Appearance

A sky gradient, hemisphere light, warm directional light, and restrained distance fog establish the presentation look. Lighting and haze are artistic choices; they do not reconstruct recorded weather. Shadow coverage concentrates on the guided route. The runtime preserves embedded textures and applies modest anisotropic filtering.

Crates, plant pots, and a few plain canvas canopies add detail at road margins. These are original procedural assets and scene assumptions, not documented objects at those addresses. No invented business name or slogan appears on them.

## Dramatic layer

Six authored fire/smoke locations intensify with the story phase. Billboard textures use original Canvas-generated gradients and overlapping soft shapes. Dust uses a small point cloud. A separate group of plaster fragments animates one fictional fall near Kembang Djepoen. Named landmarks retain their intact source geometry. The animated fragments and fire positions do not establish a historical damage record.

The effects use authored animation, not a structural simulation. Their purpose is the visitor's restricted street-level view. The runtime never supplies a detached overhead camera.

## Runtime interface

`createWorld({scene, renderer, onProgress})` resolves to `model`, `update(dt, elapsed, phase)`, `setPhase(phase)`, `groundHeight(x,z)`, and `dispose()`.

`phase` ranges from 0 to 1. Audio and narrative modules remain outside this module. The world owns its lights and sky. The application owns the camera, renderer exposure, and quality settings.
