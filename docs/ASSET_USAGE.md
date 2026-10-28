# Using the bundled free production assets

## Purpose and priority

These files reduce repetitive production work after the historical layout and
landmark forms are established. They do not determine the history. Build the
river, streets, crossings and landmark geometry from the historical brief
first. Add reusable materials and secondary props afterward.

All required bytes for the selected models/materials are included. They do not
require accounts, paid services, a live asset API or an additional download.

The library catalogue is `assets/ASSET_CATALOG.json`. Each entry includes its
creator, CC0 source declaration, local paths, checksums, intended use and
adaptation requirements. `research/asset_sources.json` uses source IDs A001–A009.

## Distinguish production resources from historical evidence

An A-series source proves the origin and reuse permission of a production asset.
It does not prove historical presence, position, colour, dimension or damage.
Keep production asset IDs separate from historical-source IDs in the model.

For an imported object, add a string property such as
`palagan_production_asset_ids_json = '["MODEL_WOODEN_CRATE_01"]'`. Its
`palagan_source_ids_json` should identify the historical evidence, if any, that
supports the object's period placement. Use `reconstructed` or `unknown` when
the placement is an approximation. Do not mark an object `documented` because
the reusable mesh has a source and a licence.

## Material sets

The library provides four surface categories: plaster, brick, clay roof tiles
and wooden planks. `assets/MATERIAL_CONTACT_SHEET.jpg` shows their diffuse maps
side by side. Exact filenames are in the catalogue; do not guess the suffix
because older Poly Haven assets use both `_diff_` and `_diffuse_`.

Each material set contains:

| Channel | Blender treatment |
|---|---|
| Diffuse | Image Texture in sRGB, connected to the material's base colour |
| Rough | Image Texture as Non-Color data, connected to roughness |
| `nor_gl` | Non-Color image through a Normal Map node, then into the shader normal input |

Use Blender 5.2's installed node/socket identifiers and introspection. Do not
rely on translated node display names. Metallic should not be inferred from
these plaster/brick/roof/wood surfaces. Do not connect a normal map directly
to the base colour or treat a roughness map as sRGB colour.

No displacement maps are included or required. At district scale, normal maps
can provide surface detail without geometry expansion. Source-backed close-up
roof shapes still need appropriate geometry. A texture cannot fix the wrong
tile profile, roof pitch, brick bond, window proportion or building footprint.

The catalogue retains raw upstream dimension metadata, but its units have not
been independently confirmed in the kit. Do not auto-convert those values into
UV repeat metres. Set UV scale from a defensible feature such as brick/board
dimensions in the asset brief, or record it as an artistic approximation.

The samples have different weathering and colour. Match them to the scene's
evidence and neutral daylight review. A monochrome historical photograph does
not establish an exact paint colour. Do not apply heavy discolouration to every
wall or treat material stains as evidence of battle damage.

## Textured realistic props

| Asset | Primary local file | Inspected source triangles | Restriction on interpretation |
|---|---|---:|---|
| Poly Haven Wooden Crate 01 | `assets/models/polyhaven/wooden_crate_01/wooden_crate_01_1k.gltf` | 6,576 | A detailed chest/crate design, not a verified Surabaya military/shipping crate |
| Poly Haven Wine Barrel 01 | `assets/models/polyhaven/wine_barrel_01/wine_barrel_01_1k.gltf` | 10,820 | A coopered barrel design, not evidence for wine storage at the chosen site |

Import the `.gltf` file with its `.bin` and `textures/` folder left intact. The
included glTF files already describe their PBR materials and local image
dependencies. Inspect the imported results in the user's Blender build before
placing them in the scene.

The source node trees have no non-identity node transforms. Catalogue bounds
come from POSITION accessors in glTF's Y-up coordinate system. The Blender
importer converts orientation. These are source-model measurements, not
historical dimensions. Check ground contact and scale in Blender. Put the
imported parts under an owned placement empty; moving only a lid or latch would
separate a multi-part prop.

For these models the supplied ARM image is a packed map. The glTF material
references determine channel routing: occlusion is red, roughness is green and
metallic is blue. Do not connect the packed RGB image directly to roughness.
Use the imported material or inspect its channel connections explicitly.

Use these props sparingly, in secondary areas where storage clutter is supported
or explicitly reconstructed. If their design conflicts with a reference, omit
or remodel them. Do not change a landmark's architecture to accommodate a free
asset. Use instances for repeated approved props rather than importing them
again for each placement.

## Optional low-detail timber scaffolds

| Asset | Local file | Inspected triangles |
|---|---|---:|
| Kenney plank pile | `assets/models/kenney/resource-planks.glb` | 72 |
| Kenney small log pile | `assets/models/kenney/resource-wood.glb` | 64 |

These are deliberately labelled optional low-poly scaffolds. Their flat atlas
style is inconsistent with realistic hero views. They can provide an inexpensive
background shape after recolouring/retexturing, or a starting mesh for a more
appropriate timber stack. Replace them for close examination.

Both GLBs reference `Textures/colormap.png`. Keep that exact relative path.
Although their container is GLB, the colour image is external. Their authored
dimensions are small; inspect, resize intentionally and record the approximation.
They are not full-size standardised construction timber.

## Import and placement procedure for the agent

1. Read the asset catalogue entry and the historical brief for the intended
   location. Confirm the reusable asset is appropriate.
2. Begin a bounded state-journal operation. Preserve the current Blender file.
3. Import one model or construct one material. Use a dedicated owned asset
   collection. Do not run scripts from source websites or install an add-on just
   to import these standard files.
4. Inspect local dependencies, material routing, multi-part relationships,
   dimensions and ground contact. Add persistent owner/asset/source properties.
5. Test the asset in neutral lighting and the intended camera distance. Correct
   materials and proportions before instancing it.
6. Place only the justified instances. Record inferred placement separately from
   source-backed locations. Keep secondary dressing out of verification views
   if it obscures the historical geometry.
7. Save the scene and inventory, review the relevant camera images, then commit
   the operation using the state helper. Update the asset manifest and decisions.

The catalogue's mesh counts are obtained by reading glTF accessors. They do not
measure Blender modifier expansion, scene instance totals, GPU memory or FPS.
JPEG maps were decoded and their dimensions checked. glTF/GLB structure and
all declared external dependencies were checked. Blender import, shader display
and rendering were not executed in the kit-preparation runtime.

## Credits and licences

Poly Haven creators: Rob Tuytel, Dimitrios Savva, Amal Kumar and James Ray Cock,
as applicable to the individual catalogue entries. Kenney created the optional
timber models. Individual roles are retained in the catalogue metadata.

Primary creator pages and actual file URLs are retained in the source register.
See `assets/licenses/CC0-1.0.txt`,
`assets/licenses/POLY_HAVEN_CC0_NOTICE.md` and
`assets/licenses/Kenney_Survival_Kit_License.txt`.

CC0 permits reuse, modification and redistribution of these declared assets.
Historical fidelity must still be checked independently. No project endorsement
by the asset creators is claimed.
