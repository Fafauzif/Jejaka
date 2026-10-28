# ST_KEMBANG — Kembang Djepoen / Handelstraat streetscape family

**Role:** A researched architectural vocabulary for background and mid-distance streets. **Build priority:**4. **Type:** streetscape family, not a claim that a complete row of 1945 shops has been individually identified.

## Read these references first

- L008: `references/images/L008.jpg`, museum photograph TM 60037910. Catalogue date20 January 1927; unknown photographer. CC BY-SA3.0.
- Crop: `references/images/L008_kembang_shophouses_crop.jpg`.
- M001:1943 street and block layout. Use the correct street direction and block edges from layout data; the photograph is not a measured street plan.

## Supported visual reading

L008 shows a commercial street with narrow shop frontages, upper-storey balconies or projecting elements, deep eaves/awnings, pitched roofs, hanging signs and overhead utility lines. A taller corner mass interrupts the row. The image contains busy road traffic, which establishes 1927 atmosphere rather than 1945 traffic density.

## Modelling specification

Create a small modular family rather than dozens of unrelated fantasy façades:

- `SHOP_A_SIMPLE`: narrow frontage, ground-level opening/doors, upper windows, shallow canopy and pitched roof.
- `SHOP_B_BALCONY`: frontage with recessed upper balcony, light railing and longer eave projection.
- `SHOP_C_TALL_CORNER`: a taller mass for a map/photo-supported corner; do not scatter towers randomly through every block.
- `SHOP_D_ATTACHED`: a plain attached commercial bay for rear and distant edges.

These module names describe proposed production assets, not four historically catalogued building classes. Their dimensions must be chosen to fit the mapped blocks and remain stored as assumptions. Keep façade widths and storey heights in a compact parameter table, with deterministic variation. Use small controlled differences in openings, awnings and roof orientation. Avoid large random height changes that break the supported streetscape silhouette.

## Placement and visual hierarchy

1. Trace or use the supplied historical block edges first.
2. Place street-facing modules along those edges and keep an explicit offset for the frontage line.
3. Generate back-of-block masses separately. Courtyards and rear lots cannot be inferred solely from this street photograph.
4. Reduce geometry with distance from saved cameras. Repeat mesh data where feasible while retaining unique asset IDs for evidence/procedural provenance.
5. Check that connected houses do not produce overlapping visible walls, z-fighting roofs or entrances floating above the street.

## Signs, culture and colour

The image supports a trading-street setting. It does not justify adding pagodas, lanterns, dragons or contemporary gateways to make the street look more culturally distinctive. Add such features only with local dated evidence. Avoid copying illegible advertising into invented words. Blank or abstracted low-contrast signs are preferable in unresolved background areas.

Paint colour is unestablished by the monochrome reference. Use a restrained material family and record palette selection as an artistic assumption. Roof weathering, broken shutters and wartime damage are separate layers; no random destruction should be presented as a documented condition.

## Acceptance

Produce one street-level render and one elevated oblique view. The row should read as a coherent commercial streetscape with human-scale openings, varied but controlled roof rhythm and continuous street frontage. Confirm that the asset manifest calls these typological reconstructions. The reference image is 1927 and cannot certify an exact November 1945 shop inventory.

## Evidence rules for all assets

The target is November 1945, but most included visual evidence is prewar. A source image proves appearance at its own catalogue date, not uninterrupted continuity to the target. Preserve the source date in object metadata. Do not promote a reconstruction to documented status after rendering it convincingly.

Metric dimensions are not surveyed in this brief. Obtain footprint and orientation from the historical layout data after map interpretation; keep heights, unseen elevations and fine detail parameterised. If the layout provides a provisional identification, the Blender asset must retain that status. Never silently identify an unlabelled black map footprint as this landmark. Keep source IDs on the object and on any generated asset specification.

Use one metre per scene unit. Organise into a parent collection named for the asset ID, with separate massing, architectural detail, materials and optional time-specific props. Reusable subparts should have named dimensions and a fixed seed. Save an intermediate massing checkpoint before detailed mesh generation. A broad proportion check and a reference-camera comparison must pass before ornamental work.

Acceptance requires a saved `.blend`, a plan view showing its position in the district, and a comparison render approximating the reference photograph's perspective. A reference-camera match is visual evidence of a resemblance, not a new historical source. Record any lens/occlusion limitations.
