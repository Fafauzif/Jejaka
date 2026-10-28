# Anatomical character source data

Jejaka uses the head, neck, and hand regions of MakeHuman's `hm08` base mesh and its low-poly eyeballs. These are mesh and UV data, not application code. The upstream OBJ headers explicitly state their release under CC0 in September 2020. The complete CC0 legal text and the MakeHuman licence explanation are included here.

The copyright holders named in the mesh headers are Data Collection AB, Joel Palmius, and Jonas Hauquier. This does not identify a historical person or imply their endorsement of Jejaka.

## Source register

| Data | Upstream location | Local use |
|---|---|---|
| `base.obj` | https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj | Only head/neck and hand surfaces are selected for the actors. Original data retained as `makehuman-base.obj`. |
| `low-poly.obj` | https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/eyes/low-poly/low-poly.obj | Fitted eyeballs, retained as `makehuman-eyes.obj`. |
| `brown_eye.png` | https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/eyes/materials/brown_eye.png | Downsampled to the bundled 256 px JPEG. |
| `young_darkskinned_male_diffuse.png` | https://download.tuxfamily.org/makehuman/assets/1.2/base/skins/textures/young_darkskinned_male_diffuse.png | 1024 px derivative: unused body regions removed; only the exported head/hand UV islands retained, plus an authored forearm tile. |
| `middleage_darkskinned_female_diffuse.png` | https://download.tuxfamily.org/makehuman/assets/1.2/base/skins/textures/middleage_darkskinned_female_diffuse.png | Same processing for Sari. |
| Asset licence | https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md | CC0 1.0 Universal, bundled as `LICENSE-CC0.txt`. |
| Licence explanation | https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md | Bundled as `MAKEHUMAN-LICENSE.md`; section C distinguishes the CC0 graphical assets from application code. |

The files were retrieved on 28 October 2026. `SOURCE_MANIFEST.json` records SHA-256 values for the downloaded and derived data. MakeHuman's official licence page also describes core graphical assets as CC0: https://www.makehumancommunity.org/about/license.html.

## Derivation

`character_anatomy.py` selects the source regions, retains their UVs, fits the head to the existing rig, slightly adjusts the jaw for the two fictional characters, and binds the hands to the existing named wrist bones. No external program logic is imported. Shirt, trousers, skirt, footwear, rig, and motion clips are Jejaka's authored geometry and animation.

`prepare_character_textures.py` can reproduce the image derivatives from the original downloaded PNG files. The runtime and normal Blender rebuild use the bundled derivatives and require no network access. Original source texture names are upstream identifiers, not evidence of a character's nationality or a record of clothing or appearance in 1945.
