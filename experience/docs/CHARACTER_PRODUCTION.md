# Civilian character production

## Assets and appearance

`assets/characters.glb` is the adult civilian used for Damar and supporting men. `assets/sari.glb` is the adult woman used for Sari. Both are fictional characters. Their geometry, colour, clothing, and movement do not establish a recorded person's appearance or a particular garment's presence in Surabaya in November 1945.

The current assets replace the earlier primitive face and hands with anatomical head, neck, eyelid, and hand topology derived from MakeHuman's CC0 `hm08` base mesh. Licensed skin and brown-eye texture derivatives retain the matching UV layout. The skin images contain the used head/hand islands and an authored forearm tile; unused body regions have been removed. Close-cropped hair is carried by the scalp texture, with an authored bun for Sari. The shirt, trousers, wrap skirt, footwear, rig, and five motion clips are authored for Jejaka.

These are moderate-detail game characters intended for conversations at approximately two to four metres. They support more believable heads and hands than the earlier assets, but have no facial rig, lip-sync, eye animation, cloth simulation, or motion capture. Extreme facial close-ups should not be staged as though those systems exist.

## Export comparison

The counts below are read from each exported GLB, not estimated from the Blender viewport. A primitive normally requires a separate material submission in the runtime; complete frame cost also depends on visibility, shadows, and shaders.

| Asset | Earlier triangles | Current triangles | Earlier material primitives | Current material primitives | Current file size |
|---|---:|---:|---:|---:|---:|
| Male civilian | 52,406 | 31,820 | 9 | 5 | 1,253,840 bytes |
| Sari | 38,476 | 25,030 | 9 | 6 | 1,037,160 bytes |

The textured skin and cloth add shading and texture work. Lower triangle and primitive counts alone are not a measured frame-rate gain on a particular device.

## Animation clips

| Clip | Duration | Intended use |
|---|---:|---|
| Idle | 3.0 seconds | Small breathing, head motion, and a restrained weight shift |
| Walk | 1.0 second | In-place walking with complementary arm swing |
| Run | 0.75 seconds | In-place escape movement |
| Crouch | 2.0 seconds | Sustained protective posture |
| Gesture | 2.5 seconds | A restrained conversational hand and head gesture |

The export is sampled at 24 frames per second. Runtime movement must translate the actor in step with the clip and blend between actions. The rigs retain the `hand.R` bone used by the notebook prop and the existing bone/clip vocabulary. Anatomical fingers are in a relaxed fixed shape and move with the wrist; they are not individually animated.

Shirt and trouser joints have blended weights. Hands and footwear use simple binding. The shoe uppers use a low, fitted profile with a shared lasting edge and thin outline-matched sole; the sole rests at ground height in the neutral pose. Sari has skin ankles beneath the skirt instead of exposed trouser stubs. The male trouser hem reaches the shoe collar. Sari's skirt follows the hips and does not simulate fabric. Use Idle and Gesture for her shop encounter; avoid Crouch, large strides, or close shots of the hem during motion. A movement clip being included does not establish that every pose is suitable for the skirt.

## Runtime interface

Use `SkeletonUtils.clone` for independent skinned instances and a separate `AnimationMixer` for each actor. Clone a material before recolouring an instance. Current exported material names are:

- `CIVILIAN_SHIRT`
- `CIVILIAN_TROUSERS`
- `CIVILIAN_SHOES`
- `CIVILIAN_SKIN`
- `CIVILIAN_EYE`
- `CIVILIAN_HAIR` for Sari's bun only

The shirt remains available for restrained runtime tint variation. Collars share its material; belts share the shoe material. Supporting characters should be distinguished by posture, staging, scale, and clothing colour without assigning nationality or allegiance from a palette choice.

## Source and rights

The source register, original mesh data, licence explanation, complete CC0 text, and checksums are in [character_sources](../tools/character_sources/README.md). MakeHuman's graphical assets are CC0; no MakeHuman application code is included in these generators. `character_anatomy.py` is the project's fitting and binding code.

The supplied skin texture names are upstream production identifiers. They do not identify an archival Indonesian person or certify the historical appearance of these fictional residents. Archive evidence and production asset licensing remain separate.

`tools/prepare_character_textures.py` reproduces the supplied derivatives from the original PNG files listed in the source register. Normal model rebuilding uses the bundled derivatives and requires no network access. Cloth weave, normal maps, and garment geometry are authored production detail, not a record of a historical textile.

## Rebuild

On a standard Blender installation with glTF export support, run from the repository root:

```bash
blender --background --factory-startup --python-exit-code 1 --python experience/tools/build_characters.py
blender --background --factory-startup --python-exit-code 1 --python experience/tools/build_sari.py
```

The scripts build new scenes, export their selected actor and rig, render a CPU inspection image in the temporary directory, and check the actual GLB header, clips, skin, and geometry counts. They never open the production city master. `JEJAKA_QA_DIR` can select another inspection image directory. The shared script locates its source data and asset textures relative to itself.

Blender 4.0.2 generated these files. For an extracted Blender package, `JEJAKA_PYTHON_EXTRA` can supply compatible Python site directories separated by the operating system's path separator. A standard Blender bundle normally supplies its own dependencies. This does not establish compatibility with the city master reported as a Blender 5.2.2 file; preserve that master.

## Verification

Both final GLBs passed binary length/header checks and contain one skin, one mesh, and all five named clips. Blender generated CPU renders of each exported source scene. The hand/sleeve overlap found in the first Sari render was corrected by trimming the reused wrist surface to its binding point. Collar panels were reduced and refitted to the chest, and their material merged with the shirt. A further inspected pass replaced the rounded shoe/platform construction, refitted ankles and hems, and brought the exposed forearm tile closer to the face and hand tones. The final assets were then imported into a fresh Blender process for animation-channel and pose checks; see the release verification record for the exact executed checks and remaining runtime limitations.


## Runtime crouch correction

The delivered GLBs retain an earlier Crouch pelvis translation on local Z, which moved the hips backward and left the bent feet above the ground. The runtime recognizes that specific constant-Y, negative-Z track and retargets it to a 0.17-metre local-Y lowering with zero local-Z translation. It leaves rebuilt or differently authored tracks unchanged. The source generator now uses the corrected local-Y translation; the release assets were not regenerated for this focused repair.

An actual Three.js pose check of the delivered male GLB compared Idle, the legacy Crouch and the retargeted Crouch using skeletal world positions and skinned shoe vertices. The corrected pose retains the resting shoe height within 1 mm and lowers the head by about 19 cm. This is a protective crouch, not a bespoke kneeling or receiving animation. The clothing and hands still use the supplied skeletal clips without facial performance or hand-object constraints.
