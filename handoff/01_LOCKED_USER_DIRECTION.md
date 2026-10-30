# Locked direction after the user's answers

**Recorded:** 30 October 2026. **Status:** implementation instructions for the NEXT run; these requirements are not all implemented by the checkpoint code.

Read this file before the older production brief. The user has answered the clarification questions in this chat and explicitly does not want the next chat to ask them again. Their verbatim message is in `02_USER_ANSWERS_VERBATIM.md`. All five supplied images are preserved in `references/`; the reference guide identifies their role.

## Authority and immediate task

The user changed the active task from ongoing development to an early handoff because they were almost out of credits. They then asked for their answers and references to be included in the ZIP so another chat could continue. The current deliverable is that updated handoff. The next chat must implement, test and iteratively improve the game from this code, without a new discovery questionnaire or a planning-only response. The user subsequently explicitly requested an adversarial subagent council, repeated actual play and an evidence-based up-to-four-round review/revision loop. `05_USER_REVIEW_REQUEST.md`, `06_GAME_REVIEW_CONTRACT.md` and `review_roles/` preserve and adapt that instruction.

Authority: this resolved direction and the verbatim answers > checkpoint technical facts in `00_CONTINUE_HERE.md` > repository instructions where consistent > older briefs and archived conversations. The technical handoff remains authoritative about what actually exists and what was tested. A desired feature in this file is not evidence it has been built.

## Decisions

| Area | User's decision | Implementation consequence |
| --- | --- | --- |
| Priorities | Graphics, populated city, movement, character designs, war effects, story/emotion, in that order; all matter | Spend visual effort on composition, light, coherent silhouettes and human-scale detail. Do not optimize one category by making the others empty or unresponsive. |
| Atmosphere | Cloverfield | Ground-level civilian vulnerability, a limited viewpoint, crowded movement, interrupted sightlines and visible danger with coordinated reactions. |
| Art direction | Expedition 33 as inspiration; lower-poly execution is acceptable | Pursue deliberate color, lighting, compositions, recognizable people and emotional staging. Its rendering fidelity is not a promised benchmark. |
| Core play | Sneaking between cover and helping civilians | Make these actions recurring, physical and consequential. Photography and notebook support the journey; repeated modal choices must not carry all gameplay. |
| Culture | Actually learn culture while the city burns | Put cultural knowledge into people, practices, objects, speech and cooperation encountered through play. The ending can connect physical destruction to the loss of cultural memory. |
| Failure | Story continues with different local consequences | No repeated death/checkpoint-reload loop. Exposure or delay changes immediate situations, access, evidence or who reaches safety while preserving forward progress. |
| Space | A compact, densely detailed district with several routes | Polish a small connected space. Use street corners, refuge thresholds and adjacent lanes for choices. The user selected density over map size. |
| War | Super chaotic | Coordinate repeated visible disruptions, multiple civilian responses, debris, smoke, fire, occlusion, directional audio and persistent changes. Gameplay and safe routes must remain readable. |
| People | Lots of believable civilians; a bustling city | Layer foreground/midground/background activity, group behavior and sound. Prioritize credible population over a tiny set of expensive hero assets. |
| Geometry | Substantially reshaping the playable streets is authorized | Original researched source assets remain preserved. Reauthored routes and damage remain clearly identified as production interpretation. |
| Authoring | Original models may be authored/edited, including through Blender | Use available Blender tooling or procedural/native Three assets. The user mentions a previous installation workflow but supplies no new shell commands; inspect the environment and proceed without requiring them. |
| Length | Probably three minutes, super fast-paced | Design an approximately 180-second normal playthrough. Shorten route/actions/lines and combine tasks; do not merely accelerate the old chapter or remove player agency. |
| Language | Indonesian; English subtitles are not important | Default the new experience, prompts, captions and critical controls to Indonesian. An existing optional English setting can remain if it adds no implementation burden. |
| Devices | Phone support essential; middle-level laptop; exact hardware unknown | Core actions must work without keyboard/mouse. Establish and measure quality tiers for a modest laptop and midrange phone class; do not invent tested hardware. |
| Assets/cost | No paid assets; create original assets when needed | Prefer original/procedural art and existing rights-cleared material. Free downloads still require a valid license. No purchases, subscriptions, paid API dependence or copied commercial-game assets. |
| Acceptance | Feels like a city, feels like being in a war, teaches culture | Judge actual play and screenshots against all three. Visual polish without social life or cultural substance fails the user's goal. |

## The story's central idea

The user's own idea: "culture is burning when the city burns."

Develop this through a particular civilian situation, not a generic moral added after the game. The player should experience a living practice before it is threatened, understand why a person values it, help in a way that preserves some continuity, and see what was lost or carried onward. Culture includes people, skills, language, shared routines and memory as well as buildings and objects. Avoid implying that a whole culture disappears with one street or using anonymous civilians merely as scenery for explosions.

The fictional Indonesian journalist, the Surabaya/November 1945 setting, the surviving notebook and the previously approved fixed non-graphic ending remain the default. The latest answers do not explicitly cancel that ending. Preserve the historical battle outcome. Do not ask the user to reconfirm these decisions. Rework the setup so the ending follows from the new three-minute arc and cultural theme.

## Explicitly superseded assumptions

- Three-minute chapter supersedes earlier 10–12 and 20–30 minute targets.
- Essential phone play supersedes desktop-first/mobile-as-fallback priorities.
- Indonesian-first supersedes mandatory bilingual/default-English presentation.
- Culture-through-play is a core success criterion, not optional background exposition.
- Believable civilian density takes priority over a small number of lavish hero meshes.
- The streets can be substantially reshaped; existing render geometry need not dictate every route point.
- The long audit is a menu of techniques, not a promise to implement every expensive system regardless of benefit.

## Defaults the next agent should resolve autonomously

These are production assumptions, not additional user statements:

- Keep the browser/static deployment path and minimize setup. The existing Three.js r169 baseline is available; change architecture only for a demonstrated benefit.
- Keep the fixed non-graphic ending and local-consequence model. No combat system is needed to satisfy the stated stealth/helping focus.
- Retain the roughly three-minute normal-play target; pause, accessibility reading, optional notebook/history inspection and loading do not have to fit within 180 seconds. No hard countdown that punishes a slower reader.
- Target a responsive 30 FPS floor as a profiling goal on selected modest devices; pursue 60 where feasible. These are unverified targets until hardware/browser/resolution/test duration are recorded.
- Support touch movement and look simultaneously, contextual help, crouch/cover, pause and settings. Test both portrait and landscape layouts; desktop retains keyboard/mouse.
- Provide Indonesian captions for all essential information. Additional Indonesian audio is valuable if original/rights-cleared local production is available. Never use an unmatched legacy MP3 just to claim new acting is voiced.
- Preserve reduced-motion/flash options and critical sound captions. Chaos should still read when sound or camera shake is disabled.
- Ground a small number of specific cultural elements in credible local/historical sources. Proposed examples must be checked, not promoted into historical fact by repetition.
- If an asset/tool/voice service is unavailable, use the best original local fallback and record the limitation. Do not turn a missing optional tool into a new questionnaire.

## Acceptance for the next run

1. In the first playable seconds, independent people and ordinary activity make the space feel inhabited; some ordinary cultural meaning is understandable before disruption dominates.
2. A roughly three-minute route contains useful cover movement and a visible civilian-help action, rather than a sequence of reading panels and generic record buttons.
3. At least two local outcomes visibly differ without forcing a reload, changing the historical outcome or blaming the player with an arbitrary moral score.
4. War is legible through anticipation, source/direction, disruption, distinct human reactions and lasting aftermath. It is not only audio or a single smoke column.
5. After play, the player can name at least one specific cultural practice/object/relationship they encountered and explain what helping preserved. Test the content itself; do not claim measured learning outcomes without a study.
6. Phone users can complete the entire journey and ending using touch alone. Narrow layouts and essential actions must be tested, not inferred from CSS.
7. Art, population and effects are profiled together; low quality preserves the human and cultural story, routes and essential danger cues.
8. All historical/source boundaries, free-asset rights and original research/master files remain intact.
