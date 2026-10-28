# Street-level environment

The browser edition uses a route-focused delivery copy of the researched Surabaya district. The Blender master, original district export, source cartography, photographs and research files remain unchanged. The refined surface finishes, fixtures and dramatic effects are production interpretations rather than evidence of exact November 1945 conditions.

## Delivery geometry

`tools/optimize_district.py` reads `assets/district.glb.gz` and writes `assets/district-route.glb.gz` plus its JSON measurement record. Python with NumPy, Pillow and SciPy is needed only to rebuild the delivery asset; the visitor needs none of these dependencies.

The optimizer preserves named landmark geometry, roads, bridge deck, ramps, river and building/roof silhouettes. Fine joinery, glazing and trim outside the guided route's useful viewing area use a simplified level of detail. Repeated static architectural parts are welded and batched by material and 160 m spatial tiles; distant low-detail silhouettes share material batches. UV seams and hard normals remain separate. Source textures are encoded at delivery sizes: 1024 px diffuse images and 512 px normal/roughness images. Existing asset notices continue to apply to these resized derivatives.

A specific legacy street-generator error placed large, thin timber plates across the full building depth at roof ridge height (`build_05_streets.py`, parallel-roof branch). This created floating black slabs in street-level views. The optimizer identifies the high, thin, broad timber components and removes them in the delivery copy. Inferred roof sheets receive a 14 cm boundary fascia to give their exposed edges thickness. These corrections do not constitute a surveyed roof reconstruction.

The generated JSON records the exact asset byte and geometry counts. Counts describe the file; they are not device frame-rate measurements.

## Surfaces, fixtures and light

`environment-detail.js` combines the existing licensed grey-plaster diffuse scan with original deterministic colour/relief maps generated at runtime. The plaster photograph is sampled in world coordinates at a controlled brightness; the existing source credit and licence remain applicable. World coordinates set their physical repeat scale, avoiding stretched whole-building texture maps. Paving has individual setts and joints; plaster has restrained grain and lower-wall darkening; roof tiles have courses and curved relief; timber and stone have separate responses. The texture maps and their pixel size do not assert the original material specification of a particular address.

Six refined bridge lanterns use the original export's placement pattern. Their cast-iron shafts, tiered shoes, framed glass housings, caps and finials are a plausible production interpretation; exact historical fixture morphology remains unverified. Base shoes and rivets refine the existing railing. Thin courses, plinths and drainpipes are added to selected nearby reconstructed walls, with no invented business wording or new window openings. The stall forecourt, cloth sacks and ties are authored scene assumptions. Static street details are merged by material, rather than issuing one draw per component.

A directional light, hemisphere light and an original sky cubemap establish the look. The cubemap is an artistic sky/ground lighting approximation, not a photograph or a dynamic mirror of the city. Lighting and haze do not reproduce recorded weather. The river uses animated surface normals, a controlled brown-green base, restrained sun highlights and a view-dependent sky colour approximation; it does not compute expensive scene reflections or historical water conditions.

The architecture's shadow map is cached. Balanced mode uses 1024 px, high mode 2048 px, and low mode disables the map. Quality changes trigger one refresh. Moving actors must not cast into the cached map: the application supplies their inexpensive contact shadows. The moving shelter parcel is also excluded from the static map to avoid leaving a fixed ghost shadow after a choice.

## Coordinates and walkable surfaces

The GLB already uses Y-up coordinates. Original Blender `(x,y,z)` corresponds to runtime `(x,z,-y)`. Road surfaces lie near runtime Y = 0.035 m. The bridge deck rises from approximately 0.42 m to 0.64 m. A raycast against preserved road, pavement, apron, bridge-deck and ramp meshes provides standing height. A half-metre cache limits repeated queries. The small authored forecourt is a surface finish, not a change to the movement navigation.

## Dramatic layer and choices

The fire/smoke columns, plaster fragments, stall objects and shelter parcel are fictional staging. Three columns sit across the visible generic west-bank roofline in the final viewpoint. Tapered flame silhouettes and wind-sheared textured smoke replace simple radial glows; the effect object count remains the same. No exact fire position or building loss is presented as a historical record. The fourteen plaster fragments fall near `[145,30.2]`, just outside a generic shop eave and ahead-left of the impact camera. The fall begins during the impact beat; its landing height uses the preserved walkable surface and each fragment’s thickness. The fragments remain clear of the guided path. Named landmark buildings keep their source structure. The visitor remains in Raka's viewpoint. Inactive smoke/flame billboards are hidden rather than submitting transparent zero-opacity objects.

The shelter parcel appears during the shelter/return phase, with an inexpensive contact shadow, and begins at `[114.8,29.3]` in runtime X/Z and moves toward `[113.3,30.5]`. Both positions face the shelter camera instead of placing the response behind it. The response is authored animation, not a physical simulation.

## Runtime interface

`createWorld({scene,renderer,onProgress})` resolves to `model`, `update(dt,elapsed,phase)`, `setPhase(phase)`, `setQuality('balanced'|'high'|'low')`, `groundHeight(x,z)`, `choose(beatId,choiceId,instant)` and `dispose()`.

The application owns camera, scene timing, character animation, contact shadows, sound and interface. The world owns its environment textures, lights, architectural delivery copy and separate authored presentation group.

## Verification limits

The original master was not opened or overwritten during this rebuild. Browser checks must inspect the actual camera views and renderer error console after integration. A successful source/export check is not proof of photographic realism, historical certification, target-device performance or museum readiness. Real-device frame times, network transfer and audience comfort remain deployment checks.
