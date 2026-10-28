# Civilian character production

## Asset

`assets/characters.glb` contains one original adult civilian model, one deformation skeleton and five animation clips. The model stands approximately 1.76 metres tall and faces positive Z after glTF conversion. Its feet sit at ground level. Clothing consists of a plain collared shirt with a breast pocket, trousers, a belt and simple shoes. These clothes are plausible reconstruction choices, not the recorded clothing of a historical individual.

The geometry uses restrained facial detail, close-cropped hair, a shaped nose, small eyes and articulated fingers. The intended viewing distance is three metres or more. Long facial close-ups and facial lip-sync fall outside this asset's capabilities.

## Animation clips

| Clip | Duration | Use |
|---|---:|---|
| Idle | 3.0 seconds | Quiet breathing and small head movement |
| Walk | 1.0 second | In-place walking loop |
| Run | 0.75 seconds | In-place escape movement |
| Crouch | 2.0 seconds | Sustained protective posture |
| Gesture | 2.5 seconds | A short conversational hand gesture |

Runtime movement must translate the character in step with the in-place clip. Blend clips over a short transition instead of switching poses in a single frame. Stop horizontal travel before returning to Idle. Clip durations follow a 24-frame-per-second export.

The shirt and blouse use connected surfaces with blended shoulder and elbow weights. The male trousers use a connected surface with blended knee weights. The face, jaw and nose share a smooth volume, and the shortened neck sits inside the collar. Hands, shoes and some secondary details retain rigid weights. The rig provides skeletal animation without cloth simulation or a facial rig. Avoid extreme joint poses, and keep the supplied movements within their authored range. The model does not include motion capture.

## Runtime instances

Use the Three.js `SkeletonUtils.clone` helper for independent animated instances. A regular `Object3D.clone` does not provide the required independent skeleton bindings. Give each instance its own `AnimationMixer`.

Clone materials before recolouring an individual character. The exported names are:

- `CIVILIAN_SHIRT`
- `CIVILIAN_TROUSERS`
- `CIVILIAN_COLLAR`
- `CIVILIAN_BELT`
- `CIVILIAN_SKIN`
- `CIVILIAN_HAIR`
- `CIVILIAN_EYE`
- `CIVILIAN_FACE_DETAIL`
- `CIVILIAN_SHOES`

Muted cream, grey, ochre and brown provide clothing variations. Modest changes in height and body scale can separate supporting figures. Do not assign ethnicity, allegiance or occupation on the basis of a palette variation.

## Source and editability

`tools/build_characters.py` constructs the geometry, skeleton and animations from scratch in Blender. It requires no external character models, textures, motion libraries or accounts. The generated character is original project material. Existing research governs period interpretation; the model's existence does not establish historical accuracy.

The script exports the character separately from the city. It does not open or modify the production reconstruction. Blender 4.0.2 generated the delivered GLB.

## Checks performed

The export contains one mesh with nine material primitives, one skin and the five named clips. Binary header and length checks passed. Fresh Blender processes imported both GLBs, recovered five actions with animated channels and rendered a mid-gesture pose. Separate CPU renders were inspected for each standing silhouette and the animated gestures. The male model also passed an earlier running-pose round trip.

The runtime must still verify character placement, ground contact, animation speed and transition behaviour within each encounter. These checks do not establish film-quality facial animation or full crowd simulation.

## Bu Sari variant

`assets/sari.glb` provides an adult shopkeeper variant at approximately 1.63 metres. She wears a plain long-sleeved blouse, a muted wrap skirt and a hair bun. The clothes and appearance are authored interpretations for a fictional character. No specific historical person or recorded shopkeeper is represented.

Sari uses the same material names, skeleton and five clip names. Idle and Gesture suit her shop encounter. Walk and Run use shorter strides to suit the wrap skirt. The skirt has a simple rigid hip attachment; avoid Crouch, extreme movement and close shots of the hem during travel. It does not simulate fabric.

`tools/build_sari.py` invokes the shared generator with the Sari variant selected. It writes `assets/sari.glb` and its own metadata without overwriting `characters.glb`. A CPU render of the exported variant's source scene and a fresh-import mid-gesture render were inspected. Export header, one skin and five animation names passed the same binary checks as the male model.

## Rebuild on a standard Blender installation

From the repository root, use a Blender installation that supports the export options in the script:

```bash
blender --background --factory-startup --python-exit-code 1 --python experience/tools/build_characters.py
blender --background --factory-startup --python-exit-code 1 --python experience/tools/build_sari.py
```

The generators locate `experience/assets/` relative to their own source, export the chosen model, render a CPU inspection image into the system temporary directory, and validate the GLB header, skin and clip names. `JEJAKA_QA_DIR` can select another inspection-image directory. Standard Blender installations normally bundle Python dependencies; an extracted distribution build can use `JEJAKA_PYTHON_EXTRA` with compatible site directories separated by the operating system's path separator. Blender4.0.2 was used for the included exports. Newer Blender versions may require adapting NLA/action export options. These scripts create new scenes and never open the production city master.
