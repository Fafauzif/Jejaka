# Jejaka: current decisions

**Updated:** 28 October 2026, Asia/Jakarta. These decisions supersede conflicting earlier brainstorming. Preserve historical asset IDs and original reconstruction evidence even where the product direction has changed.

## User-accepted direction

| Area | Current decision |
|---|---|
| Product name | **Jejaka** |
| First chapter setting | Surabaya, around Jembatan Merah and Kali Mas, with the existing November 1945 reconstruction as its base |
| Perspective | A journalist witnesses events from street level; no god's-eye, tactical, or detached aerial view |
| Experience | Guided story mode with choices; an experience rather than a combat or strategy game |
| Dramatic premise | The journalist arrives to document the city, becomes caught in danger, attempts to escape, is injured, and dies with the burning city still within his limited view |
| Character identity and language | A fictional Indonesian journalist; Indonesian spoken dialogue with English subtitle support |
| Ending treatment | Fixed, non-graphic death ending. Choices affect the account and local actions rather than the battle's outcome |
| Notebook | A persistent personal notebook used for the assignment, observations, choices, and surviving account |
| Nominal duration | The proposed 10–12-minute chapter was accepted; this remains a planning target rather than a measured visitor duration |
| Visual intent | Realistic surroundings and believable human movement with restrained facial detail that avoids an uncanny photorealistic presentation |
| Prototype delivery | A frontend-only playable browser prototype and a detailed route/story specification, delivered as a repository-ready ZIP |
| Work style | Autonomous implementation, alternative approaches after failures, delegated work and independent review, repeated verification, no routine approval interruptions |
| Writing and presentation | Specific natural prose, clean restrained design, genuine sources, no critique scores or process chatter in the player-facing deliverable |
| Deployment | The user intends to deploy to Vercel; this run prepares the source/package and does not establish a live deployment |
| Future use | Reuse across museums is an aspiration, not an existing partnership or rollout |

The user has authorized reversible work needed to implement and verify this scope. Future agents should inspect the current files and continue useful work rather than ask the user to reconfirm the same settled decisions. Ask only where a new material choice changes scope, historical interpretation, external commitments, or a consequential action that the user has not authorized.

## Implementation decisions made within that scope

These are production choices, not claims that the user specified every name, coordinate, or library.

- Fictional protagonist: **Raka Pradana**. Featured fictional residents: **Sari** and **Damar**.
- Chapter title: **Catatan yang tertinggal / The unfinished account**.
- Eleven story beats; nine can add notebook entries. The final resting view and afterword are non-recordable.
- Three binary choices: how to record the Sari encounter; assist at shelter or check the road; pass the notebook directly or add a brief final message first.
- A bounded guided route: authored western bridge approach, crossing, Kembang Djepoen, return toward the eastern bridge approach, final resting view near the river.
- The western starting positions were moved after inspection exposed conflicts with existing landmark geometry. They do not establish a newly researched historical street.
- The runtime uses buildless JavaScript ES modules, local Three.js, HTML/CSS overlays, packaged assets, Web Audio, and local browser state. Earlier Vite/React/TypeScript recommendations were not implemented and are not prerequisites for maintaining this build.
- The original district is compressed for browser delivery without changing its geometry. The source Blender scene remains separate.
- Original scripted characters and five reusable skeletal clips per character support the cast. Detailed facial acting, fabric simulation, and synchronized handoff choreography are outside the present character assets.
- Main Indonesian lines have synthetic voice performances; supplementary dialogue uses text captions. Original procedural effects support the soundscape. These are production audio, not historical recordings.
- Fire, smoke, dust, props, and falling plaster belong to a separate fictional presentation layer. Named landmark geometry is not destroyed to manufacture a historical claim.

## Historical boundaries retained

The working time precision remains **November 1945**, with no exact day or hour locked for the fictional sequence. A major offensive began on 10 November, but that does not date every event or establish the condition of a selected building. September's Hotel Yamato incident, late-October fighting, Mallaby's death, and the November battle remain distinct.

The map-derived coordinate frame is local and approximate, not EPSG georeferencing or survey accuracy. Architecture uses maps and photographs of different dates, with authored completion for unsupported details. Exact casualties, weapon positions, attacker identity, military paths, period weather, and building-specific destruction are not invented as facts.

The journalist's notebook, the civilian dialogue, the route, and the local consequences are fictional. The afterword and context panel identify that boundary. No LLM calculates or validates alternative history in the runtime.

## Superseded ideas

| Earlier idea | Current status |
|---|---|
| PALAGAN as public-facing title | Historical working name; preserve source IDs and paths where useful |
| God's-eye city interface | Superseded by embodied street-level witnessing |
| Civilization/Hearts of Iron-style strategy freedom | Not part of the guided chapter |
| Diponegoro example | An earlier illustrative pitch, not this chapter's historical subject |
| Blender-only output and “do not add a web app” | Superseded by the user's explicit authorization for the browser implementation; evidence and preservation rules remain |
| Mandatory React/Vite application | Earlier recommendation only; current runtime is buildless |
| Generative free-text historical simulation | Not implemented or required for this prototype |
| Broad branching war outcomes | Replaced by local choices and a fixed authored ending |
| “Ask clarification before any implementation” in the old context pack | Resolved for the approved scope; do not restart discovery from that old snapshot |

## Open matters that remain material

- Current official competition rules, template, AI policy, eligibility, and submission status.
- Museum target audience, content policy, accessibility accommodations, procurement, and partnerships.
- Target presentation hardware and browser; hardware performance and sound comfort need real-device testing.
- Timed visitor testing and any resulting duration revision.
- A more precise historical day or incident, if the user later requests one; that would require new source work and a review of staged assets.
- A live Vercel deployment and its actual asset-serving behavior after the user deploys.
- Further character performance and scene refinement beyond the current prototype's verified capabilities.
