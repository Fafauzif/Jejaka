# JEJAKA — Master AI Context Pack

**Context date:** 31 October 2026, Asia/Jakarta (WIB, UTC+7).  
**Repository:** <https://github.com/Fafauzif/Jejaka>  
**Working baseline for this revision:** `f57363b5543ed3f9428f8ba01b879107e39dc0ab`.  
**Latest execution limit:** four review/play/refinement rounds maximum, with two to three hours maximum **in total, including work already under way**. The lead has adopted hard caps of four rounds and three hours. The user first reduced 10–20 to 5–6, then explicitly reduced the maximum to ROUND FOUR. This latest four-round limit is authoritative.

**Snapshot status:** Final development checkpoint after the four-round cap: 71 native tests pass, but no complete grounded journey is verified. G04 completed the workshop and reached the first local cover sequence, then failed its late-crouching test strategy. The corrected driver and shorter cloth label have native/static verification only. See [Release and verification status](#14-release-and-verification-status) for exact coverage.

This is the project-wide continuity document requested by the user. It gathers product intent, competition context, decisions, history, evidence boundaries, implementation, review obligations and handoff instructions. It concerns Jejaka only. It is not a new competition submission, a replacement for an official rulebook, or evidence that educational impact has been measured.

## Contents

1. [Authority and reading order](#1-authority-and-reading-order)
2. [Product and central idea](#2-product-and-central-idea)
3. [Latest settled direction](#3-latest-settled-direction)
4. [Decision history and superseded ideas](#4-decision-history-and-superseded-ideas)
5. [Competition: Idea Champion 3.0](#5-competition-idea-champion-30)
6. [Story, people and intended journey](#6-story-people-and-intended-journey)
7. [Geography, history and reconstruction boundaries](#7-geography-history-and-reconstruction-boundaries)
8. [Culture and dialogue](#8-culture-and-dialogue)
9. [Art, city, movement and sound](#9-art-city-movement-and-sound)
10. [Technical architecture and controls](#10-technical-architecture-and-controls)
11. [Research, assets and rights](#11-research-assets-and-rights)
12. [Agent workflow and review contract](#12-agent-workflow-and-review-contract)
13. [Delivery and preservation](#13-delivery-and-preservation)
14. [Release and verification status](#14-release-and-verification-status)
15. [New-chat start instructions](#15-new-chat-start-instructions)
16. [Open matters and safe claims](#16-open-matters-and-safe-claims)

## 1. Authority and reading order

Use these sources in order:

1. The user's latest direct instructions and answers. They override earlier defaults, including duration and the old death/notebook premise.
2. Actual current source files, frozen source/asset hashes, test reports and release manifest for facts about what exists or was tested. A desired feature, a design document or an agent's claim does not override contrary runtime evidence.
3. This context pack, the latest numbered continuation handoff, and current grounded source/verification documents, interpreted at their stated dates and revision scopes.
4. [AGENTS.md](AGENTS.md), [handoff/06_GAME_REVIEW_CONTRACT.md](handoff/06_GAME_REVIEW_CONTRACT.md), and the remaining applicable locked direction in [handoff/01_LOCKED_USER_DIRECTION.md](handoff/01_LOCKED_USER_DIRECTION.md).
5. Historical research and rights ledgers, which remain authoritative about their actual sources and limits even when product direction changes.
6. Older production briefs and context snapshots. They explain previous decisions; they do not silently reactivate superseded requirements.

The old [28 October context pack](docs/context/ORIGINAL_CONTEXT_PACK_2026-10-28.md), [CURRENT_DECISIONS.md](docs/context/CURRENT_DECISIONS.md), [PROJECT_HANDOFF.md](docs/context/PROJECT_HANDOFF.md) and [field-edition record](docs/context/EDITION_2.md) contain important history but describe older products. In particular, do not restore compulsory photography, notebook delivery, a forced death, synthetic voice tracks or a three-minute target merely because one of those files calls itself current.

The user has settled the major questions and authorized autonomous reversible implementation, specialist delegation and independent review. Do not restart a broad clarification questionnaire. Ask only if a genuinely new consequential choice cannot be resolved from the session and evidence. No push, deployment, competition submission, organizer contact, purchase or institutional commitment is authorized by the current request.

## 2. Product and central idea

**Jejaka** is a first-person, Indonesian-first browser experience in which the visitor moves through a civilian city during the November 1945 fighting in Surabaya. The active story follows Raka, neighbour of Sari and her younger brother Adi, helping them reach refuge. It is an embodied civilian escape, with cover and assistance, rather than a tactical command interface or combat game.

The user's central idea is **“culture is burning when the city burns.”** The experience should first make ordinary cultural life meaningful, then show what destruction threatens: people, livelihoods, tools, working places, skills, relationships and chances to practise or teach. A patterned cloth alone is insufficient. Neither the loss of one cloth nor the rescue of one tool represents the extinction or salvation of an entire culture.

The desired experience is fun and understandable while teaching a few concrete ideas. It should feel like leaving a real inhabited district under pressure, with legible causes for detours and visible consequences for helping. The visitor must understand who they are, who the other people are, why they need to leave and where they are going. Ordinary life and danger should belong to the same world.

The playable chapter supports a competition concept and possible future museum use. A reusable multi-museum product, museum adoption, partnerships, procurement, measured retention gains and deployment at an institution remain aspirations or hypotheses. They are not existing achievements.

## 3. Latest settled direction

The user reviewed the tested escape build, found the story better, and requested a larger next revision. They specifically questioned the two bridges and historical geography, asked for more meaningful dialogue/cultural explanation, and noted visible out-of-bounds scenery. After an analysis-only turn, they answered the three new choices and explicitly said to proceed autonomously while they slept.

| Area | Latest decision | Consequence |
| --- | --- | --- |
| Geography — answer **1 A** | Real street, river and landmark relationships, with disclosed distance compression | Use period cartography and evidence-led topology. Do not present the old invented two-bridge stage as a reconstruction. Compression is a presentation choice, not survey accuracy. |
| Duration — answer **2 B** | Approximately **four to five minutes** for the main route | Allow more useful travel, cultural action and short sheltered exchanges. Do not pad the route with an invisible timer or force a slower reader to rush. |
| Dialogue — answer **3 A** | Indonesian captions and environmental sound | Improve the writing and visual staging without adding voiceover, TTS or unmatched old MP3 performances. |
| Core play | Sneak/move between cover and physically help civilians | Preserve direct movement, local threat, interruptible assistance, group continuity and forward progress. |
| City | More credible buildings, surrounding blocks and continuous views | Repair exposed edges, gaps, empty river views and flimsy scenery. More pedestrians alone will not solve the user's concern. |
| Culture | Learn during the experience | Make tool, technique and threatened livelihood visible and understandable through people and actions, not only an optional document. |
| Story | Clear civilian escape with the same family reaching refuge | The arbitrary old death and notebook-delivery chain remain superseded. The historical battle outcome is not changed by local player choices. |
| Devices | Phone play is essential; desktop also works | Use simultaneous movement/look, run, crouch, contextual hold-help, pause, sound and settings. Verify portrait, landscape and orientation change. Exact consumer hardware is unknown. |
| Rendering | More 3D construction and heavier rendering are permitted | Improve the world substantially. Keep bounded systems and useful quality tiers; optimize from actual evidence rather than claiming hardware performance. |
| Work pattern | **Latest cap: four review/play/refinement rounds maximum; two to three hours maximum total, counting work already under way** | Preserve independent critique and actual replay within hard caps of four rounds/three hours. The earlier 10–20-pass/several-hour request is superseded. A retry, component assertion or source edit is not automatically a complete journey or a successful review round. |
| Outputs | Another tested repository-root ZIP **and a separate Markdown master AI context pack** | Include this file with the source overlay and provide it as its own downloadable `.md` artifact. |

The original priority ordering placed graphics, inhabited city, movement, character design, war effects, and story/emotion high, while requiring all of them. Subsequent feedback makes coherent history/geography and cultural learning explicit priorities as well. Do not sacrifice a working phone route or understandable story to add visual spectacle.

## 4. Decision history and superseded ideas

| Period / stage | What it established | What must not be inherited as current |
| --- | --- | --- |
| PALAGAN reconstruction preparation | Research kit, map, photographs, landmark briefs, local tracing and Blender/source preservation | A Blender-only restriction, public title PALAGAN, or a claim of completed survey reconstruction |
| Early Jejaka discovery, 28 October | Browser/frontend concept, Surabaya setting, competition and future museum aspirations | Unresolved discovery questions after the user later answered them; React/Vite/TypeScript as mandatory architecture |
| Journalist/notebook field edition | Raka Pradana, street-level witnessing, guided choices, photography/notebook export, a fixed non-graphic death | Compulsory camera/notebook/delivery gameplay, forced death, old eleven-beat route, old synthetic voice lines, 10–12-minute duration |
| 30 October locked direction and continuation | Indonesian-first, essential touch, civilian vulnerability, low-poly cinematic art, cover/help, culture-through-play | Its nominal three-minute length and retained-death default where later feedback explicitly changed them |
| Tested escape candidate H | Raka helping Sari and Adi reach school; no compulsory photos; visible cloth comparison; cart consequence; functional touch and companion navigation repairs | Its invented city/river/two bridges as historical geography, its old target coordinates, or its test results as proof of changed grounded source |
| Current grounded revision, 31 October | Real map relationships with disclosed compression; four-to-five-minute main route; more cultural dialogue; captions/environment only; master context deliverable | Any assumption that new code has already passed final natural journeys before the current evidence says so |
| Latest execution-budget correction, 31 October | Four review/play/refinement rounds maximum; two to three hours maximum total, including work already under way | Earlier 10–20-pass/several-hour requests are historical, not permission to exceed the latest cap |

The user's analysis-only instruction was subsequently lifted by their explicit “Proceed” message after answers 1 A / 2 B / 3 A. The current task is implementation and verification, not another plan-only response. Their later request for this master context pack adds an output; it does not cancel the game revision.

## 5. Competition: Idea Champion 3.0

### 5.1 Status and evidence

The repository's [competition record](docs/context/COMPETITION.md) carries information from a participant booklet supplied earlier in the project: **Idea Champion 3.0**, organized by the **Culture and Learning Center, Universitas Islam Indonesia**, with the theme **“Empowering Culture, Inspiring Innovation.”** The original booklet, official submission template and organizer's generative-AI guidelines were not found in the repository during this context-pack pass.

**Fresh check on 31 October 2026:** public web searches, including the university domain, did not locate an authoritative current 3.0/2026 rulebook, template, AI policy or schedule. An [official UII departmental archive](https://economics.uii.ac.id/category/akademik/) contains an announcement for **Idea Champion 2.0 in 2025**, and [another official page](https://economics.uii.ac.id/idea-champion-2024/) describes the 2024 competition. These confirm earlier editions only. Their themes, dates, fees and eligibility must not be transferred into the 3.0 rules. Failure to locate a page is not proof that the 3.0 competition or supplied booklet is invalid.

Every 3.0 detail below is therefore **a prior-booklet record, not a freshly confirmed organizer statement**. Before an actual submission, obtain the current official documents or organizer clarification and record the edition, date and source. This build does not establish registration, eligibility, submission, finalist status or an award.

### 5.2 Prior-booklet brief and framework

| Item | Recorded information; not freshly confirmed |
| --- | --- |
| Competition | Idea Champion 3.0 |
| Organizer | Culture and Learning Center, Universitas Islam Indonesia |
| Theme | “Empowering Culture, Inspiring Innovation” |
| Eligible levels | Active D3, D4 or S1 students |
| Team | Individual or up to three members from the same university |
| Framework length | 500–700 words, excluding title and entrant identity |
| Language / format | Clear professional English; Microsoft Word `.doc` or `.docx`; abstract-style prose |
| Expected content | Background, root-cause/problem-tree analysis, proposed solution, expected impact and theme relevance |
| Citations | Described as optional in the previous booklet record; data-informed examples encouraged |
| External documents | Official template and generative-AI guidelines were linked earlier but not successfully inspected; do not invent their requirements |

The user's actual student status, university, entrant identity, team membership and registration/submission status remain unknown. Do not infer them from a GitHub account or unrelated conversations. There is no authorization here to register, submit or contact organizers.

### 5.3 Prior-booklet schedule

All dates below are recorded for **2026**, in **WIB/GMT+7** where a time was given. The dates are retained for continuity and remain subject to current official confirmation.

| Event | Recorded date |
| --- | --- |
| Registration and Idea Framework | **1 November 2026, 23:59 WIB** |
| Announcement | 6 November |
| Finalist confirmation / technical meeting | 7 November |
| Poster | 8 November |
| Mentoring | 12 November |
| Optional visual aids | 17 November |
| Final presentation / exhibition | 18 November |
| Checkout | 19 November |

Exact presentation duration, venue logistics, revised deadlines, fees, submission links and organizer acceptance are not freshly verified. Do not make a competition or travel decision from an old date without checking its current status.

### 5.4 Prior-booklet assessment and Jejaka's proposition

| Criterion | Recorded weight |
| --- | ---: |
| Creativity and originality | 25% |
| Innovation and solution detail | 20% |
| Relevance and problem understanding | 20% |
| Potential impact | 20% |
| Sustainability | 15% |
| Total | 100% |

The defensible current proposition is a short browser cultural-history experience: a legible historical place, fictional civilian relationships, visible cultural practice, physical cooperation, and a clear boundary between evidence and staging. A working demonstration can show that interaction pattern. It cannot prove that immersion improves retention, that conventional museums/textbooks have failed, or that Jejaka is already adopted or scalable across museums.

The playable chapter is supporting demonstration material, not a substitute for the required Idea Framework. A future submission should identify a narrow audience and use case, explain the problem with evidence, compare feasible alternatives, describe maintenance/content provenance, and frame educational impact as a testable hypothesis. No current authority certifies compliance with unread AI rules. The generic innovation-essay workflow appended to the old context pack is a discussion aid, not the competition's official rules.

## 6. Story, people and intended journey

| Person | Current role and boundary |
| --- | --- |
| Raka / Raka Pradana | First-person player; Indonesian neighbour of Sari in the current escape. Earlier journalist identity is project history, not a requirement to restore reporting errands. |
| Sari | Fictional batik worker and Adi's older sister; packing to leave and showing prepared samples, then helping him escape. |
| Adi | Fictional younger brother; asks concrete questions, needs assistance during the escape, and remains recognizable through refuge arrival. |
| Pak Wiryo | Fictional resident at the cart obstruction; local assistance changes the passage available to the waiting community. |
| Other residents / refuge attendant | Fictional people whose ordinary activity, cooperation and reactions make the city socially readable. |
| Damar | Important in the older notebook/death edition; not a compulsory current escape character or notebook recipient. |

The intended main arc is: understand the role and destination → encounter a working practice before destruction dominates → hear/see approaching danger → move along the mapped street environment and use cover → free Adi with Sari's assistance → reach the single playable crossing and choose whether to help the cart/community → turn south along the west-bank quay → use a sheltered conversation interval → reach the school area and allow the family to settle before closure.

The player's local actions do not decide the historical battle's outcome. Exposure may change immediate feedback or the state of belongings while allowing forward progress; there is no arbitrary repeated-death loop. Cart assistance should visibly open movement for residents; bypass should leave a different world state. Do not credit help that the player did not perform. A progress flag or moral score is not sufficient evidence of an assisted person or cleared path.

The same family must physically reach refuge. Gratitude and final conversation should not play while Sari is still far away, stuck against a rail or crossing the bridge. The title's handholding language does not establish a continuous handholding simulation. Do not claim body contact, hand IK, cloth simulation or complete technique learning unless the actual implementation and player view support it.

## 7. Geography, history and reconstruction boundaries

### 7.1 What is changing

Candidate H used an authored theatrical district with two generic bridges, an invented river layout, scripted closures, a fictional school and a short straight final route. That was not a validated map of Surabaya. The user specifically identified this gap. Retaining original research files alone did not make that active game world geographically accurate.

The new route uses the existing wartime cartography and explicit map-to-game transformation. Its intended relationships are **Kembang Djepoen, the Jembatan Merah crossing, the west-bank Willemskade quay, a minor/local access connection, and the mapped school area**. There is **one playable crossing on this route**, not a claim that all Surabaya had one bridge. Do not add a convenient adjacent parallel road bridge merely to provide a game branch.

The new [layout module](experience/escape/layout.js) is the shared coordinate contract. Consult its current anchors and route indices instead of copying numbers from older drivers. [GROUNDED_GEOGRAPHY.md](experience/docs/GROUNDED_GEOGRAPHY.md) is the new geography ledger when present. Minor access lanes, safe offsets, pavement widths, heights, building completion and crowd movement remain authored or approximate even where the street/bank topology follows the map.

### 7.2 Map and transform

- M001 is the preserved original [Soerabaja map image](references/maps/Soerabaja_1943_original.jpg), 7452 × 10970 pixels, with a March 1943 aerial revision in its imprint. Its SHA256 is `3cc62f945bac6e82772fdd3b0bd52df256d1fdc61d4004e27f9a2cab9ae1e36a`.
- The kit's approximate local scale is 1.19 metres per original pixel, based on its graphic scale, not a survey registration. A British Library catalogue of a comparable HIND1072 first edition dates it `[1944]` and corrects a suspect printed denominator. Do not collapse image metadata, aerial date and catalogue edition date into a false exact publication date.
- The grounded presentation uses **50% horizontal distance compression**: 0.595 game metres per source pixel. In the corrected `school63-r2` frame, map west is game `−Z`, map north is game `+X`, and map south is game `−X`. The source-pixel formula is `x=−(v−4330)×0.595−20`, `z=(u−3050)×0.595−196`.
- This is a uniform disclosed scale and rotation. It does not create EPSG georeferencing, exact historical metres, a known river level or a map of November 1945 damage. Source pixels remain the audit trail.
- The initial route proposal was about 1.22 km at the kit's approximate scale, or about 610 m after compression; final route measurements must be taken from the finalized layout. Normal human duration cannot be derived from this distance alone.
- An independent source-map review caught two real errors in the initial proposal: an axis exchange mirrored the map, and the first school-access segment crossed mapped masses 62/81. The corrected r2 frame is a proper rotation; the school approach follows the adjacent map-visible street instead of deleting the inconvenient footprints. Source pixels remain unchanged. This source/topology acceptance is not a survey certificate or final rendered-play acceptance.
- The r2 layout inspected for this context update has ID `kalimas-kembang-willems-school63-r2` and SHA256 `f46d1703a466d98312ebf5a648731663dd335bbff380c593362f755e4ed487ee`. That hash is a dated module snapshot, not proof that a later edited runtime or final archive is unchanged.

Original method and data: [SPATIAL_METHOD.md](docs/SPATIAL_METHOD.md), [HISTORICAL_LAYOUT.json](data/HISTORICAL_LAYOUT.json), [map sources](research/map_sources.json), [map derivatives](references/maps/MAP_DERIVATIVES.json). Do not overwrite source tracing or source pixels merely to make a game route convenient.

### 7.3 Important identification and event cautions

- The current geography review identifies **Juliana School as map index 63**, not 81. Index 81 is an R.C. Church. The school's use as this family's refuge is fiction, even if its location is map-supported.
- Map index 1 is P.W.D. Offices / Burg Genesk Dienst. Do not rename it Internatio merely because it lies near the bridge. Other landmark placements require their own source comparisons.
- Do not reuse a generic clock tower as an authenticated governor's office. Old photographs, modern visiting pins and known landmark names are discovery leads, not interchangeable survey control points.
- The workshop, family, dialogue, cart, trapped child, local refuge activity, specific collapses, fire and attacks are authored fiction. A real bridge or road does not authenticate a blockade, demolition or rescue at a particular date.
- November 1945 is the established period; the fictional sequence has no verified exact day, hour, attacker position, weapon, weather or unit movement.
- Keep the September Hotel Yamato flag incident, late-October fighting/Mallaby episode and November battle distinct. Do not combine them into one dramatic day.
- The broad setting includes Indonesian fighters and British/Indian forces under British command. Do not label every opposing soldier Dutch or imply all fighting began on 10 November.
- Archival film without original sound cannot authenticate a production soundtrack. New sound and effects are production work.

Research starting points: [history overview](research/history_overview.md), [chronology](research/history_chronology.md), [claims](research/history_claims.json), [sources](research/history_sources.json), [source criticism](research/history_source_criticism.md), [source register](research/SOURCE_REGISTER.csv), and [landmark briefs](landmarks/README.md).

## 8. Culture and dialogue

The grounded culture/text record is [GROUNDED_CULTURE.md](experience/docs/GROUNDED_CULTURE.md). The earlier [ESCAPE_CULTURAL_RECORD.md](experience/docs/ESCAPE_CULTURAL_RECORD.md) and [CULTURAL_RECORD.md](experience/docs/CULTURAL_RECORD.md) retain their historical access states; newer successful retrieval does not rewrite what an earlier pass actually read.

The new script is intended to communicate a small, specific set of ideas:

1. A **canting** carries hot **malam** (batik wax) to form dots and lines; it is not a dye dispenser.
2. Wax resists dye during a colouring stage. Pale lines are an example, not a rule that every batik is white-lined or uses one dye bath.
3. Wax can be removed with hot water (**nglorod**); wax/colour stages may be repeated. Prepared dyed and finished samples must be identified as such, rather than portraying full cloth production in seconds.
4. Work requires materials, space, practice and people who can teach. Sari's family experience is personal fiction, not a claim about every batik maker or all Indonesian culture.
5. Independence did not instantly end the fighting. Brief history belongs in the playable narrative as well as the source panel, without turning characters into lecturers reciting future museum labels.

The authoring pass added three workshop exchanges totalling **53.5 seconds of scripted caption durations**: opening/canting, prepared dyed sample/resist, and prepared finished sample/wax removal. This is script data, not measured visitor attention or proof of final pacing. New sheltered history, livelihood/memory and refuge recall exchanges are available for integration. Danger calls should take priority; interrupted teaching should be resumed appropriately rather than silently credited as seen.

Dialogue should sound like people addressing one another: short, specific Indonesian, natural calls during danger, quieter questions in shelter, and no generic moral speech about saving an entire culture. Do not add exaggerated regional dialect or unsupported historical slogans as decoration. No new voiceover, TTS or mismatched legacy speech is authorized in this revision.

The `fact` markers in story data are observation tags, not a human learning score. A queued line is not necessarily a displayed line; a displayed line is not proof of understanding or retention. An independent critic should describe what they noticed before reading author notes. That is an AI legibility check unless actual human participants and a study are documented.

Institutional sources include [Museum Batik Indonesia](https://artsandculture.google.com/story/batik-indonesia-101-museum-batik-indonesia/CwWRz0YynMZ-yQ?hl=id), [BBKB / Ministry of Industry](https://bbkb.kemenperin.go.id/index.php/post/read/malam_bekas__daur_ulang_aja__rahasia_ramah_lingkungan_para_pembatik_0), [Australian Museum](https://australian.museum/learn/cultures/international-collection/balinese/the-batik-process/) and [UNESCO's batik record](https://ich.unesco.org/en/RL/indonesian-batik-00170). The current culture author read accessible museum/BBKB text; UNESCO's direct page still returned a challenge, while indexed text was available. Retain these access distinctions. Modern UNESCO recognition is not knowledge held by characters in 1945.

## 9. Art, city, movement and sound

The five supplied reference images are documented in [handoff/03_REFERENCE_GUIDE.md](handoff/03_REFERENCE_GUIDE.md). Cloverfield informs civilian-scale vulnerability, interrupted sightlines, shared reactions and danger with direction. Expedition 33 informs restrained palette, light, silhouette, group staging and visual hierarchy. They do not authorize copied costumes, fantasy objects, modern vehicles, bitmap backgrounds, source models or an AAA-fidelity claim.

The user accepts a deliberate lower-poly execution and has allowed more extensive 3D work. The world should feel continuous from ordinary playable positions: front, side, behind, across the river, while crouching, and through gaps between buildings. Use connected blocks, rear buildings, rooflines, courtyards, shop recesses, warehouses and river continuation. Fog can support depth; it must not be the sole repair for exposed stage edges. No out-of-bounds screenshot should be dismissed merely because it is not the preferred camera angle.

People need varied ordinary activity and reactions across foreground, midground and background. More expensive hero meshes do not compensate for an empty street. Running, turning, acceleration and feet must be assessed in motion. Rescue contact, the trapped limb, the lifting action and the child's recovery must be readable from ordinary player approaches. Avoid bodies, hats, bundles or interface bands masking essential actions. An animation mode called `run`, an IK helper or an asset loaded without error is not proof of convincing acting.

War should have anticipation, source/direction, coordinated reactions, readable cover, persistent obstruction and aftermath. Avoid unrelated explosions, arbitrary all-at-once crowd reactions, fire on water, damage presented as an authenticated landmark event, or noise that makes the route incomprehensible. Comfort settings should retain essential meaning while reducing shake/flashes.

The original procedural environmental mix replaces the loud water-loop problem; active escape audio has no water loop and no reused dialogue MP3. Keep restrained ambient beds, useful near/far positioning, volume, mute, pause, caption ducking and bounded voices. Synthetic effects remain production sound, not historical recordings. Objective signal checks do not prove pleasantness on phone speakers or constitute an independent listening review.

## 10. Technical architecture and controls

### 10.1 Runtime and preservation map

The application is **buildless HTML/CSS and JavaScript ES modules**, using vendored **Three.js r169** and local assets. It is not a React/Vite project. There is no required backend, API key, user account, live language model, runtime CDN, paid asset service or new voice service. Serve it over HTTP(S); direct `file://` launch is not supported for modules/assets.

| Path | Responsibility / scope |
| --- | --- |
| `index.html` | Repository-root redirect/entry |
| `experience/index.html` | Active title, HUD, captions, touch controls, pause/settings/history and ending markup |
| `experience/escape.css` | Responsive active-game presentation, safe areas, focus, captions and controls |
| `experience/escape/app.js` | Renderer/camera, input, progression integration, captions, hazards, save/Continue, settings, ending and opt-in read-only test evidence |
| `experience/escape/layout.js` | New shared map-derived/compressed coordinates, routes, anchors, source pixels and evidence metadata |
| `experience/escape/rules.js` | Renderer-independent movement, collision, actions, phases, consequences, saved-state validation |
| `experience/escape/world.js` | Current district geometry/materials, colliders, props, cultural samples, bridge/cart, refuge and quality controls |
| `experience/escape/actors.js` | Crowd, named people, rigs, animation, helper staging, navigation, snapshots and restoration |
| `experience/escape/story.js` | Authored Indonesian dialogue, chapter copy, history/source links and cultural observation tags |
| `experience/escape/effects.js` | Bounded original smoke/fire/debris/dust and reduced-motion presentation |
| `experience/escape/audio.js` | Original WebAudio ambience/effects, spatial response and user sound controls |
| `experience/escape/controls.js` | Shared reliable button/touch activation support |
| `experience/escape/grounded-test.cjs` | Current optional browser driver; its post-G04 cover-strategy correction has not been replayed |
| `experience/escape/desktop-test.cjs`, `browser-test.cjs` | Earlier H-coordinate drivers; do not assume they validate the new map without adaptation |
| `experience/previous/` and `experience/game/` | Earlier photo/delivery continuation and its runtime; preceding H escape remains in the Git base/separate tested ZIP |
| `experience/legacy/` | Earlier field edition |
| `experience/lib/`, `experience/assets/` | Vendored dependencies, local hero models, fonts and older-edition assets; preserve licences |
| `experience/tools/` | Source/build helpers for existing character and optimized geometry derivatives |
| `research/`, `references/`, `landmarks/`, `data/`, `output/`, `progress/` | Historical research, source cartography/photos, architectural evidence, original masters and recovery records; preserve unrelated content |

Vercel's existing static output is `experience`. The supplied historical live baseline was <https://jejakaprototype.vercel.app/>; this revision does not establish that it contains the latest local files or that it was deployed/tested there. No service-worker/offline-relaunch guarantee is implied by local assets.

### 10.2 Run and control contract

From repository root:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/experience/` in a modern WebGL browser. Optional native code tests use:

```sh
npm test --prefix experience
```

These tests are separate from playing the build and do not require a runtime package installation for visitors. Optional browser-driver tests need a separately installed Playwright and Chromium. Use the current test-driver document and final command examples; do not install browser binaries into the delivery ZIP.

Desktop controls: WASD to move, drag the scene to look, Shift to run, Ctrl to crouch, hold E for the nearby contextual action, Escape to pause. Arrow keys are additional movement/turn controls in the existing runtime. Phone controls: left joystick movement and simultaneous right-side look; Lari/Merunduk toggles; hold the contextual button to help; release to interrupt; sound, pause, settings, Continue and restart through visible controls. Run/crouch must not become contradictory simultaneous modes. Orientation change, cancellation and pause must release held input.

Quality tiers and reduced shake/flashes are production settings, not tested hardware classes. Critical directions and dialogue must remain usable when muted. Save data is browser-local. The final grounded root run-state schema is version 3 (earlier development V2 was superseded after the action-triggered teaching fix) and uses save key `jejaka.escape.v3`; the corrected layout identity is `kalimas-kembang-willems-school63-r2`. Old H or experimental mirrored-frame positions must not be restored into this different city, even if their numbers fall inside new bounds. Preferences retain the compatible `jejaka.escape.preferences.v1` key. Preserve old source/history rather than silently migrating invalid world positions.

### 10.3 Authoring safeguards

Use the shared layout rather than hardcoded duplicate coordinates in world, actors, effects, rules, audio or tests. Keep root/prop/player-help anchor conventions explicit. A bridge rail, river collider, cart load and companion capsule must agree geometrically; native path tests alone do not establish visual contact. Preserve finite motion, pause stability, bounded pools and correct cleanup.

Original production Blender masters were reported from Blender 5.2.2; temporary authoring used Blender 4.0.2 in earlier sessions. That does not establish safe round-trip compatibility. Do not overwrite a newer master through an older Blender or mistake a historical tool path for a currently installed tool. No Blender/MCP availability, browser binary path or local host process is guaranteed after a new execution environment starts.

## 11. Research, assets and rights

Use the source hierarchy consistently: inspected original object → evidence of what is actually visible/readable; catalogue → metadata/discovery; full text → only the inspected sections; abstract → limited scope; failed retrieval → no new content claim. A trace/crop of one map is not an independent second witness. A photograph's capture date, a building's survival date and an event date are different facts.

Core references and registers:

- [Research overview](research/RESEARCH_OVERVIEW.md), [reading guide](research/history_reading_guide.md), [source register](research/SOURCE_REGISTER.csv), [claims](research/history_claims.json), [material culture](research/history_material_culture.md), and [source criticism](research/history_source_criticism.md).
- [Spatial method](docs/SPATIAL_METHOD.md), [map-source register](research/map_sources.json), [original map](references/maps/Soerabaja_1943_original.jpg), [mapped local layout](data/HISTORICAL_LAYOUT.json), [landmark briefs](landmarks/README.md).
- [Rights and attribution](RIGHTS_AND_ATTRIBUTION.md), [historical image credits](references/images/IMAGE_CREDITS.md), [asset catalogue](assets/ASSET_CATALOG.json), [asset-use record](docs/ASSET_USAGE.md), and [runtime credits](experience/docs/credits/).
- [National Army Museum — November 1945](https://www.nam.ac.uk/explore/november-1945), [August 1945](https://www.nam.ac.uk/explore/august-1945), [UTS P. R. S. Mani collection](https://opus.lib.uts.edu.au/handle/10453/28090), and the institutional sources recorded in the current cultural/geography ledgers. Institutional framing still requires source criticism; one British account is not a complete Indonesian civilian history.

The map's upstream record identifies a UK Government public-domain artistic work; retain its creator/source/derivative attribution. Individual historical photographs have their own CC BY / CC BY-SA or other conditions. Keep creator, holding institution, source link, licence and modifications. Do not assume an article's licence covers every third-party photograph reproduced in it.

Existing local hero meshes, rigs, skins, fonts, Three.js and reusable materials have recorded licences and credits. Original procedural geometry, cloth diagrams, effects and audio are production work. Free download is not a licence, and a modern material/prop asset is not evidence of presence in 1945. Preserve the licences even where attribution is not legally mandatory.

No separate production/redistribution licence was supplied for the five commercial-game/film reference images. They inform analysis and art direction only; do not ship them as runtime backgrounds, textures, models or marketing screenshots. Do not include restricted archival films, full books or linked PDFs merely because they were readable. Source links do not grant image rights.

## 12. Agent workflow and review contract

The user wants autonomous implementation with independent specialists and actual play → critique → fix → replay. Their **latest** instruction limits this run to **four review/play/refinement rounds maximum and two to three hours maximum total, including work already under way**. The lead acknowledged hard caps of four rounds and three hours. Earlier four-round and later 10–20-pass/several-hour instructions remain history only. Do not reset the time/run count when a session, candidate or agent changes. Plan remaining review and packaging within the latest cap, deliver the strongest actually verified checkpoint, and clearly disclose any verification that could not be completed. Do not prolong work artificially or invent passing scores to end it.

Use [the review contract](handoff/06_GAME_REVIEW_CONTRACT.md) and its role briefs. Appropriate independent roles include ordinary-input play, touch/phone interaction, history/geography, culture/narrative, art/population/animation, sound/usability and release/preservation. Reviewers should not author the feature they independently score. If they did, label that assessment author verification and use a separate reviewer for independent judgment. Do not fabricate a council or hide disagreement by averaging scores.

Freeze a named candidate for each meaningful play/review. Record source, assets and driver hashes; command/configuration; date; browser/version; viewport; native keyboard/mouse or touch method; renderer; quality; captures; errors; timing scope; and cleanup. Keep concrete failed actions, severity, proposed repair and replay evidence. Source edits invalidate affected evidence until rechecked. A test on an older candidate must retain that label.

The review contract's desired actual coverage includes fresh desktop, materially different local consequence, native-touch portrait, native-touch landscape, low/muted/comfort readability and lifecycle/recovery. The latest time/run cap controls the feasible execution budget; if coverage cannot all be completed, retain its unverified status and report the actual scope rather than exceeding the cap or inheriting old passes. Combine cases only when the record makes their scope clear. The full review contract requests complete natural desktop, portrait and landscape journeys after changing input, progression, route, timing or saves. Within the latest four-round cap, report any missing final-source coverage explicitly; do not exceed the cap or substitute a rotated viewport for a separate complete portrait journey. Include an unguided/bounded exploration before the critic reads the walkthrough or cultural ledger. Motion needs actual motion evidence, not only flattering stills.

Natural journeys use ordinary browser-native inputs. Read-only navigation telemetry is acceptable when disclosed. Teleports, state writes, direct game-handler calls, accelerated clocks or forced endings are staged checks, not natural play. Genuine browser-native touch contacts and simultaneous/cancelled contacts can establish touch behaviour; mouse-only input or DOM `.click()` cannot quietly substitute. No hidden keyboard rescue may complete a claimed touch-only journey.

Native rules, scene-graph geometry, loaded-rig probes, bounded visual checks, complete journeys, extracted-package tests and human studies are different evidence. Separate them. Software-renderer wall time, clamped application time, loading, screenshots, pauses, reload and optional reading must not be collapsed into a human completion-time claim. Native touch emulation is not a physical-phone GPU test. AI reading/play is not a visitor learning/retention study.

Private scoring uses the contract's calibrated dimensions, with 8.5 meaning strong with minor issues, not mere task completion. Unknown verification is not a pass. Do not relabel an essential requirement N/A to evade a gap. Keep QA ratings and internal critique out of ordinary player UI; a concise verified record and honest limits belong with delivery.

Run one software-WebGL renderer at a time. Long browser sessions and source freezes need clear ownership; do not let simultaneous review browsers manufacture a slowdown. Retain atomic partial reports, an immediate natural-ending seal, and full finalization only after optional checks and browser/server cleanup. An interrupted run or sealed ending without full finalization must not be counted as a fully successful driver run.

## 13. Delivery and preservation

The authorized outputs are a **tested ZIP extracting at repository root** and this **standalone `MASTER_AI_CONTEXT.md`**. There must be no enclosing repository directory inside the ZIP. Include install instructions, local runtime dependencies/licences, current grounded verification, exact manifest/SHA256 records and a viable older-edition path. Keep bulky private QA exchanges, browser binaries, caches, credentials, test saves, private reference imagery and redundant master copies out of the product archive.

The remote changed from `8a2701eb74821ee49f164162de4665d3300cfec1` to **`f57363b5543ed3f9428f8ba01b879107e39dc0ab`** before this revision. The lead compared all 29 changed remote paths with the last delivered ZIP and found them identical. The new baseline was adopted without discarding in-progress working-file edits. This check does not authorize overwriting arbitrary future user changes.

Recheck the remote before final packaging; inspect and merge any new overlapping work deliberately. Preserve original research, map/photo sources, master `.blend`, exported geometry, recovery checkpoints, unrelated files and old editions. An overlay cannot delete obsolete files or automatically protect unseen future overlapping edits. If a migration genuinely requires removal/rename, document the exact safe action rather than pretending a ZIP overwrite performs it.

Validate archive CRC, unique safe paths, complete hashes, root structure and payload. Extract onto a disposable checkout of the documented base, compare all payload bytes, confirm unchanged outside-payload user/master files, run relevant tests/resource checks there and complete an actual extracted-runtime journey. Preserve the exact archive bytes between validation and delivery. Save the final ZIP and Markdown as user-downloadable artifacts. No push or deployment is authorized by the request to deliver them.

## 14. Release and verification status

### 14.1 Historical tested baseline H — not evidence for changed grounded code

The preceding delivered file was `Jejaka_Escape_Revision_Tested.zip`, SHA256 `05614ca24eb778714e9ed7820f71577d52fbbfd14c479736313eed2c24b7a630`, 24,857,587 bytes, 139 members / 137 manifest payloads. It was based on `8a2701eb74821ee49f164162de4665d3300cfec1` and is the content subsequently committed at the new remote baseline.

Actual H evidence included **57/57 native tests**, three complete final-source journeys (desktop assistance, native-touch portrait assistance, native-touch landscape bypass), and a fourth complete alternate keyboard/mouse journey from the exact extracted ZIP. Browser/server finalization and source/driver/listed-asset bindings were verified. Extraction retained 482 outside-payload files, including 63 master/source files; 48 root/nested resource requests passed. These are recorded checks, not a human pacing or educational study.

Genuine focus-loss autopause was **unverified** in the headless blank-tab attempt because no trusted blur/hidden event was observed. It was not counted as passed; explicit pause and Continue were separate tests. Physical-phone performance, Safari/iOS, phone-speaker pleasantness, human three-minute pacing and human learning outcomes remained unverified. Art critics retained stiff acting, sparse/flat views, synthetic effects, tiny-tool legibility and action occlusion limits. An 8.5+ consensus or AAA quality was not claimed.

H repaired a real companion deadlock: close cart/backtracking displaced Sari outside the bridge rail, where rail and river blocked forward motion. The repair physically realigned and walked her through the existing approach rather than teleporting her or bypassing the arrival gate. It also addressed paused personal-space adjustment. New map coordinates must revalidate the analogous behaviour rather than copy old coordinate fixtures and claim inheritance.

The repository's [ESCAPE_VERIFICATION.md](experience/docs/ESCAPE_VERIFICATION.md) and [ESCAPE_TEST_EVIDENCE.json](experience/docs/ESCAPE_TEST_EVIDENCE.json) contain that earlier scope until a new record explicitly replaces or distinguishes it. Eleven distinct frozen source manifests and multiple failed/incomplete attempts belonged to that prior development record; they are not eleven completed current-grounded journeys.

### 14.2 Grounded revision 4.0.0 — final four-round record

Final development checkpoint after the four-round cap: 71 native tests pass, but no complete grounded journey is verified. G04 completed the workshop and reached the first local cover sequence, then failed its late-crouching test strategy. The corrected driver and shorter cloth label have native/static verification only.

Current base: `f57363b5543ed3f9428f8ba01b879107e39dc0ab`. Entry: `experience/index.html` → `escape/app.js`. Root saves use schema 3 / `jejaka.escape.v3`; actor snapshots use version 2 and layout `kalimas-kembang-willems-school63-r2`. Preferences remain version 1. Exact methods/hashes and scope are in [GROUNDED_TEST_EVIDENCE.json](experience/docs/GROUNDED_TEST_EVIDENCE.json); readable verification is in [GROUNDED_VERIFICATION.md](experience/docs/GROUNDED_VERIFICATION.md).

| Round | Actual scope and result |
| --- | --- |
| G01 | Bounded initial street, four native headings, older pre-r2 source. No recorded errors, frozen source and closure; no natural ending. Found empty/repetitive lookback composition. |
| G02 | Bounded desktop three-sample workshop: seven passed checks, zero recorded errors, frozen source and closure. No full route. Critique found readable sample states but abstract contact, early explanation/reveal and sample-continuity problems. |
| G03 | Portrait native-touch diagnostic, four saved checks; deliberately stopped after late workshop assistance exposed teaching/release/camera-return problems. No natural ending or finalized error-total claim. |
| G04 | Failed partial at the first cover approach: nine passed checks, zero recorded runtime/resource errors, frozen source/driver/listed assets, browser/server closed. No natural ending. |

G04 used actual CDP touch contacts, 844×390 landscape, low/muted preferences, software WebGL and nested `/package` hosting, from a clean candidate-ZIP extraction. It verified held-joystick secondary controls, simultaneous move/look/cancellation, all three assistance-camera returns, and completion of the three prepared-sample stages. The cleaned final sample stayed visible. It reached the warning/blast and first local attack. Rescue, cart/bridge, quay, paired-school arrival, orientation transition, later Continue and natural ending were not reached in this run. No complete final-source desktop or portrait journey was recorded. Historical H passes do not fill these gaps. No fifth play round occurred.

**The cover failure remains visible.** Warning began at application time 105.866 at (-57.483589,-8.457062), 27.31 m from the named cover target; impact followed at 112.883 while the scripted player was still standing at (-53.768111,-28.418993). The driver waited to crouch until very close to the target. Initial timing analysis suggested a longer warning, but a native movement experiment and an exact-position world probe showed crouching already protects at the recorded impact point, while standing exposes it. The proposed timing extension was rejected. Production warning time, radius, cover geometry and consequences remain unchanged. A new native regression checks this same phase-2 world root and stance-dependent damage without changing progression.

The optional driver now crouches when cued; the first player action is clarified to **“Tahan ujung kain”**, addressing a blind reader's holding-versus-tracing ambiguity. Neither edit has a browser replay under the cap. Only that label changes the eleven production runtime files relative to G04; the browser driver also changes. All game assets and the other ten runtime files remain identical. This is a precise component boundary, not a final-source full-journey claim.

Implemented revisions include corrected map handedness and school access; one playable Jembatan Merah crossing and the southward Willemskade route with disclosed 50% horizontal compression; surrounding blocks, stocked recesses and physically present market activity; revised companion routes/gait/gestures; action-triggered batik explanations; sheltered history/livelihood and refuge exchanges; restrained spatial environmental sound; and reliable physical help-release/camera handling. The later route/exchanges exist in source and native coverage; G04 did not browser-verify all of them. Prepared samples do not simulate manufacture of an entire cloth in seconds.

**Final native checks: 71/71 passed**, including retained older-edition tests, meaningful map/interaction/companion regressions and the actual-impact stance check. These are repeated after final extraction. **Audio: 10/10 actual post-master PCM checks** on unchanged audio/layout, not human listening. Independent source/map review accepted r2 after preserving the mirror and footprint-crossing failures. Native geometry/pose/source checks are separate from rendered play.

Independent image review confirmed an occupied lookback, readable sample changes, persistent cleaned sample, local timber obstruction, and smoke/fire/civilian shielding in the aftermath. Repeated facades, simple gestures and abstract tool contact remain. A blind AI reader inspected eight actual opening/workshop PNGs and displayed-caption events before source/ledger: they identified canting, heated wax and the resist/sample sequence, with tiny-tool, caption-dependence and holding/tracing limits. This subset excluded the title and later story; it is not a human comprehension or learning study. No 8.5+ consensus is claimed.

The provisional extraction passed 70 native tests and preserved **481 outside-payload files** (480 tracked plus an unrelated sentinel), including 63 master/source/research files. The final archive receives a new integrity/path/hash/extraction/native/resource/preservation check on the final 71-test source. That is not an extracted final-runtime playthrough. Final archive identity is bound externally; a ZIP cannot include its own final hash in a file it hashes.

Remaining verification: complete final-source desktop/portrait/landscape journeys, materially different branch, corrected cover strategy, rescue/Continue, orientation, bridge/companion arrival, ending, genuine focus-loss lifecycle, physical-phone/Safari/iOS performance, human 4–5 minute pacing and measured learning. Later stages have native logic/geometry coverage, not inherited current browser passes. Art/contact/gait/portrait framing/repetition and synthetic effects still need polish. The four-round cap stops this delivery before the full review contract's acceptance bar.

## 15. New-chat start instructions

1. Read this file's date, status, latest choices and release evidence first. Then read `AGENTS.md`, the latest numbered handoff, the current grounded geography/culture/verification documents and relevant source. Treat old “current” labels as historical where superseded here or by a later user message.
2. Inspect the latest remote and local working tree. Adopt a documented base, preserve newer overlapping edits, verify the actual source/assets and retain the previous tested checkpoint. Never overwrite master/research files to make a package convenient.
3. Keep the settled direction: real geographic relationships with disclosed compression; a four-to-five-minute main route; Indonesian captions/environment only; essential phone play; civilian cover/help; readable chaos; cultural knowledge inside action; same-family refuge ending; no forced photos/notebook delivery/death.
4. Reproduce the current reported build and actual evidence before announcing a new improvement. A claim from a prior chat, a renderer-independent test or an old image is not current rendered completion.
5. Work autonomously within this scope. Delegate bounded modules with explicit ownership and use independent critics. Freeze source during each review/play session and run software WebGL sequentially. Fix observed blockers before secondary polish; preserve failed records.
6. Keep the latest total execution caps: FOUR review/play/refinement rounds maximum and no more than three hours including already completed work. The latest reduction to round four supersedes the earlier five-to-six-run request; a reset does not grant a fresh allowance. Deliver an actually tested root-overlay ZIP and this updated standalone Markdown context pack. Update installation, rights, source access and verification to match the final files. Do not publish, submit or contact anyone without a separate explicit instruction.

Do not ask again whether the user wants a browser game, Indonesian, phone support, historical grounding with compression, four-to-five-minute main length, caption-only dialogue, civilian escape, a large autonomous revision, or the latest total execution cap. Those answers are settled. A later user correction can of course supersede them.

## 16. Open matters and safe claims

| Subject | Known / settled | Still unknown or requiring evidence |
| --- | --- | --- |
| Product | Jejaka; civilian cultural-history browser experience; current user choices above | Whether the final build meets the intended quality in actual visitor use |
| Competition | Earlier supplied booklet information is preserved | Current 3.0 official rules/template/AI policy, actual eligibility/team, registration, submission, revised deadlines, venue and presentation format |
| History | November 1945 context; evidence-led map/landmark relationships | Exact day/attacks/weapon positions, every building's 1945 condition, precise survey geometry and detailed civilian testimonies not inspected |
| Culture | Narrow sourced canting/wax/resist/removal/transmission ideas | A verified local workshop/motif/family address, full craft simulation, human understanding/retention |
| Geography | Shared source-pixel route and disclosed presentation transform | Survey accuracy, all road widths/heights, minor-access exactness and historical refuge use |
| Platforms | Local static runtime and available automated evidence | Physical target phone/laptop GPU, Safari/iOS, broader accessibility/browser matrix and deployed-site current behaviour |
| Sound | Original procedural environmental audio, user controls, no new voiceover | Independent listening quality on the actual presentation device/phone speakers |
| Museum use | Future reusable chapter concept | Named partnerships, adoption, procurement, content approvals, operational maintenance cost or visitor-study results |
| Business / impact | Proposed educational/cultural mechanism can be demonstrated | Superiority to text/film/exhibits, validated willingness to adopt/pay, measured education or empathy effect |

Safe language is specific: “implemented,” “observed in this recorded journey,” “map-derived with disclosed compression,” “authored fictional incident,” “native-touch emulation,” “source read,” “catalogue only,” or “unverified.” Avoid “historically exact,” “all devices,” “human-tested,” “visitor-validated,” “museum-ready,” “60 FPS,” “perfect,” “proven learning” or “competition compliant” without the corresponding evidence.

This pack should let the next assistant continue useful work without losing the project's purpose or repeating settled questions. Its role is continuity and evidence discipline, not to make uncertainty disappear.
