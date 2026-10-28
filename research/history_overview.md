# Historical scope and use of evidence

Prepared 23 October 2026. This is a reconstruction research brief for a Blender environment, not a claim that every street, façade or military position has been reconstructed exactly.

## Working historical frame

- Place: the district around Jembatan Merah and Kali Mas, Surabaya.
- Period: November 1945. No single day or hour is locked for the base environment.
- Base model: geographically grounded streets, water, blocks and selected architecture.
- Later layers: dated damage, barricades, people, vehicles and tactical events.
- A camera angle, lighting treatment, simplified background building or other design choice does not become historical evidence merely because it looks plausible.

Read `history_claims.json` for exact claims and locators, and `history_sources.json` for access status and rights notes. These ledgers are the authority for the historical statements in this folder. Follow the URL to inspect the underlying evidence if a claim becomes a material feature of the model.

## What is established and what remains open

The source set supports a distinction between the September flag incident, late-October arrival and fighting, and the November battle (HC001–HC012). Do not collapse the whole sequence into a single simultaneous diorama.

For this build, priority goes to the map- and photograph-supported physical setting. The evidence reviewed here does not establish exact unit coordinates, a street-by-street damage state, local weather at a particular hour, the paint colour of every façade, or the identity of the person responsible for Mallaby’s death. These remain open, rather than being filled by model inference.

The following should remain unpopulated until separately substantiated:

1. Exact numbers of troops in a scene.
2. Casualty counters, hit probabilities and weapon effectiveness values.
3. Named commanders physically standing at map coordinates.
4. Exact unit paths and movement times.
5. The alleged killer and detailed mechanism of Mallaby’s death.
6. Decorative slogans copied from modern reenactments.
7. Buildings or memorials that only appear in post-war sources.

## Evidence hierarchy for this reconstruction

1. A dated, geolocated contemporary map, photograph or document supports a specific observation within its coverage.
2. A catalogue can support an item’s identity and recorded metadata. It cannot substitute for the unseen photograph or film.
3. Scholarly interpretation helps resolve context, vocabulary, place names and conflicting accounts. A proposed identification remains proposed.
4. Modern heritage records help locate surviving structures. Restoration, widening, replacement and modern memorialisation must be investigated before tracing present geometry backward.
5. Modern reenactments, films, commemorative art and generated pictures are not source evidence for the original scene.

A contemporary document can be firsthand while still being partial, mistaken or shaped by its institutional purpose. A retrospective museum record can be useful while still containing a caption error. Institutional provenance is a reason to investigate a source, not a substitute for source criticism.

## Perspective and representation

The reconstruction should distinguish Indonesian independence fighters, Indonesian civilian residents, British forces and the Indian troops serving within British command structures. Do not use a single national or ethnic label as a substitute for a verified unit or civilian identity. HC017 is sufficient to reject an all-Dutch Allied army, but not sufficient to select every uniform in the finished environment.

Avoid mapping the whole city’s population into an empty battlefield. If people are eventually added, use neutral civilian archetypes and dated evidence for locations. Do not infer ethnicity solely from clothing in a small monochrome frame. Specific hospital, refugee, internment or evacuation scenes require evidence for the location and date.

Public-relations dispatches, private diary entries, wartime film descriptions and later national histories were created for different audiences. Keep those purposes visible in the source ledger. Do not silently convert the wording of one belligerent into the voice of an omniscient narrator.

## Immediate modelling consequences

- Build one separable collection per dated event layer.
- Keep the base buildings independent from rubble and damage meshes.
- Add a custom property for `source_ids`, `claim_ids`, `depicted_date`, `evidence_status` and `assumptions` to important objects.
- Use stable object IDs. A name change in a later source should update an alias, not create a second building.
- Keep exact-looking dimensions editable if they were inferred. Do not hide an assumed height inside applied geometry without recording it.
- Keep contemporary image observations separate from proposed 3D completion of hidden surfaces.
- Exclude Tugu Pahlawan and modern memorial installations from the 1945 model (HC013–HC014).

## Research access achieved

The task inspected the Mani collection record and selected pages of its complete 49-page digitised dispatch/diary file, IWM’s full JFU 437 catalogue description, relevant National Army Museum sections, ANRI records, the relevant sections of a 2024 municipal heritage book, and a full-text scholarly article on photographic historical narration. The article is methodological support, not an independent survey of the district.

Several bibliography leads could not be read reliably. Those are marked as such. Neither a thesis title nor an abstract is evidence for its unread findings. Original restricted or ambiguously licensed documents have not been repackaged as unrestricted reusable art assets.
