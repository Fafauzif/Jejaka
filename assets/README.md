# Included production asset library

This directory contains actual downloadable assets, not placeholders or a list
of future downloads. It is separate from the historical evidence directory.

- Four 1K PBR material sets: diffuse, roughness and OpenGL normal maps.
- Two textured Poly Haven models: wooden storage chest/crate and coopered barrel.
- Two lightweight Kenney timber-pile models with their required colour atlas.
- Creator licence records, CC0 legal text, source metadata and file checksums.
- `MATERIAL_CONTACT_SHEET.jpg`, made from the bundled diffuse maps.

Start with `ASSET_CATALOG.json` and `../docs/ASSET_USAGE.md`. Load only the
relevant material/model entry while working. Do not feed every upstream
resolution variant in `source_metadata/` into the model's context.

All included third-party production assets use CC0-1.0 declarations verified
from primary creator sources. The original Kenney archive licence is included
unaltered. Credits are retained even when attribution is not required.

No executable third-party scripts, Blender add-ons, characters, vehicles,
weapon models, modern buildings, or paid dependencies are bundled here.

The included prop styles and material photographs are modern resources. Use
them only where compatible with a source-backed modelling decision. They are
not evidence for period presence or exact appearance.

`ASSET_CHECKS.json` records image decoding, glTF structure, geometry counts and
local dependency checks. Import/render checks in Blender were not executed
during kit preparation and remain local preflight tasks.
