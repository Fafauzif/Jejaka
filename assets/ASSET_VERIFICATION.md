# Production asset verification

Prepared 2026-10-23. The supplied library contains four material sets and four
prop meshes. The source material maps use the 1K distributions, and model
textures use the 1K distributions.

## Checks performed

- Read the primary Poly Haven asset licence and API terms.
- Read the Kenney Survival Kit creator page and the licence inside the official
  downloaded ZIP. The original archive licence is included.
- Retrieved the Creative Commons CC0 legal text from its official URL.
- Downloaded every declared glTF external buffer and texture for the two Poly
  Haven models, retaining their relative directory structure.
- Compared each downloaded Poly Haven distribution file against its API-provided
  MD5 and calculated a local SHA256 for the catalogue. MD5 here is an upstream
  distribution cross-check, not a security guarantee.
- Parsed the two glTF JSON files and two GLB headers/JSON chunks. Inspected
  POSITION-accessor bounds and primitive triangle counts. All declared local
  buffer/image dependencies were present.
- Decoded bundled JPEG/PNG images, rather than checking filenames alone.
- Inspected the diffuse material swatches. Replaced the initial panel-like
  plaster candidate with a continuous plaster sample to avoid introducing
  arbitrary modern panel seams.
- Excluded source `.blend` files, add-ons and executable scripts. The models
  are standard glTF/GLB data with their buffers and images.

## Checks still needed locally

- Import each selected asset into the user's Blender 5.2 build.
- Check actual shader routing, colour management, UV repeat and model scale.
- Inspect origin/ground contact and multi-part prop relationships.
- Compare the intended use with the historical location brief.
- Measure memory/performance with the selected instance counts.

The kit does not claim that these props were present in the selected street,
that their modern material colours match 1945, or that a Blender render was
performed. The source-register A-series records production origin and permission;
historical evidence remains separately identified.
