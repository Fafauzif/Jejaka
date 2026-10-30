# Jejaka review contract: implement → play → challenge → repair → replay

This contract applies to the NEXT development run. It is an operational instruction, not evidence that the unfinished checkpoint already meets the latest goals. Read it together with `01_LOCKED_USER_DIRECTION.md` and `04_NEXT_RUN_BUILD_TARGET.md`.

## 1. Define success without another questionnaire

Build a small, inhabited, original lower-poly browser district; approximately three minutes of fast-paced normal play; Indonesian-first; fully touch-playable phone path; modest-laptop quality scaling; cover movement and visible civilian helping; chaotic but readable war; cultural learning inside the action; forward progression with local consequences; researched historical boundaries and free/rights-cleared assets; root-extractable ZIP.

Study all five supplied references. Translate Cloverfield's civilian-scale vulnerability and shared reactions, and Expedition33's palette/composition/light/character staging into feasible original art. Judge those concrete qualities rather than matching commercial-game polygon counts.

Write a compact private requirement→implementation→evidence ledger. Separate explicit user requirements from engineering assumptions. Unknown target hardware is not a license to invent benchmarks; the defaults in the locked direction allow work to proceed. Preserve the old edition and original research/master files. No purchases, paid APIs, publication or deployment.

## 2. Produce an integrated first attempt

Reproduce checkpoint behavior and inspect the actual game, then implement a complete coherent revision of the short route. A static scene, a polished title screen, an isolated controller test or a huge design brief is not a complete attempt. The first reviewable version must include the touch route, cultural encounter, helpful action, danger, consequences and ending, with reasonable error/pause/save behavior.

Agents may develop separate modules concurrently with explicit file ownership and shared interfaces. Integration is a lead responsibility. Freeze a named source revision for each review/playtest; critics must identify which revision they evaluated. Record a commit or source-tree hash, browser/version, viewport, input method, renderer, quality, run date, commands and capture paths. Preserve the failed observations and fix history internally rather than rewriting them into an uninterrupted success narrative.

## 3. Use an adversarial council with real independence

Preferred team, adjusted to actual available agent slots:

| Role | What it must challenge | Evidence it must examine |
| --- | --- | --- |
| Playtest critic | Confusion, boring travel, unearned urgency, weak help/cover verbs, repeated gates, pace, visible consequences | Repeated input-driven game sessions, action logs, route/branch differences, timings and captures |
| Art/population critic | Flat lighting, repeated people, empty midground, foot sliding, unclear silhouettes, noise instead of composition, weak before/after | Actual player-view screenshots/video at near/mid/far distances and peak event; supplied reference images |
| Phone/reliability critic | Missing touch verbs, simultaneous-input failures, blocked controls, modal/pause/resume problems, mobile rendering budget, saves | Touch-only sessions in two orientations, keyboard path, persistence/error tests, actual renderer counters and available device profiles |
| Cultural/narrative critic | A culture lecture appended to generic explosions, unsupported local details, stereotypes, mistaken testimony, rushed emotion | Source/claim ledger, visible ordinary practice, helping action, before/after and surviving account |
| Lead/integrator | Requirement gaps, conflicts, unverified claims, regressions, packaging | All findings, actual diffs, test results and release contents |

Reviewers should not author the feature they independently score. If a reviewer helped implement that area, assign another critic for it or label the assessment self-review. If agent slots are limited, batch reviewers or combine roles while retaining an independent playtester. If separate agents are unavailable, perform distinct named review passes and say so. Do not fabricate a council, opinions, play sessions or consensus.

Use the role prompts in `review_roles/`. Critics should form their findings before seeing the author’s scores or being told that a result is already good. A reviewer’s score may fall after a regression; completion of an edit alone is never evidence of improvement. The council's job is to find failure, not reassure the builder. Disagreement stays open until evidence resolves it; averaging a low cultural/mobile score with a high art score does not satisfy the requirement.

## 4. Require repeated actual play, not only scripted assertions

Have a reviewer who did not implement the route play it more than once. Across the run, cover at least these six meaningful sessions, combining cases where that remains clear and honest:

1. **Fresh desktop run:** start from a cleared save and complete the natural ending, following actual controls with no progression skips, teleports or direct state mutations. Record time to first useful action, time to help/cultural encounter, and end-to-end active play time.
2. **Alternate-consequence run:** choose a materially different route/help/recording outcome. Observe the people, path, evidence and ending-account differences in the world, not just a toast.
3. **Touch-only portrait run:** all essential actions using physical touch or browser-native touch emulation with `pointerType=touch`; simultaneous movement/look; crouch/cover/help; close panels and finish the story. No hidden keyboard or test hook may rescue the playthrough.
4. **Touch-only landscape run:** complete a fresh journey through the natural ending using touch alone, including critical movement/look/help and crowded/impact sections; check safe areas, control reach, captions, menus and an orientation transition.
5. **Readable low/comfort run:** low quality, muted sound and reduced-motion/flash modes. Verify the player can still identify danger, use cover, help and understand the cultural element. If tested as separate cases, list each.
6. **Lifecycle/recovery run:** pause during movement/dialogue/impact, lose focus, resume, save/reload/continue, restart, and finish. Check no duplicate blast, stuck input, missing actor or posthumous note.

After the last changes to input, progression, route, timing or saves, repeat a complete natural desktop journey and complete touch-only portrait and landscape journeys. Isolated scene checks do not revalidate an altered route. After a visual-only change, refresh affected player-view captures and performance checks. Then replay every other substantially affected scenario after repairs. Do not count rerunning the identical happy path six times as diverse playtesting. Also perform at least one short unguided exploration where the critic may intentionally miss prompts, go the wrong way, hesitate, circle an NPC, approach a cart from another side, or open tools during danger.

Measure both wall-clock start-to-natural-ending duration and active play duration, with mandatory dialogue/help included. Identify pauses, loading and optional reading separately. Simulated game time, accelerated clocks, software-renderer slowdowns and real-time user pacing are different evidence; none may silently stand in for the others.

Log the actual method. Keyboard/mouse, browser automation, touch emulation and physical-phone play are different types of evidence. Touch-completion evidence requires physical touch or browser-native touch emulation producing touch contacts, including simultaneous contacts and cancellation. Mouse-only pointer events, DOM `.click()` and direct handler invocation do not count as touch interaction. An agent may use UI clicks to configure a separate desktop test, but must not quietly use them to complete a touch-only journey. An automated browser controlled with ordinary player inputs can establish behavior, but does not establish human learning or real-phone performance. Automated checks that teleport between objectives are useful integration tests; they are not natural traversal, normal pacing, touch completion or a human playtest. If a required session cannot run, mark it unverified and explain why. Do not silently substitute assertions for play.

## Additional paired checks against superficial mechanics

- Compare exposed and sheltered attempts at the same danger segment: warning and direction must be readable; reaching cover must change a meaningful local outcome, and either attempt must permit forward progress without a forced reload.
- Interrupt and resume the helpful action: a person/object/path must visibly change in response to the player. A modal flag or a progress bar alone is not physical assistance.
- Let a critic play without the author’s walkthrough or cultural explanation first. Before reading the source/design ledger, ask them to name what practice/object/relationship they noticed, why it mattered and what helping preserved. Then compare that account with the actual source record. This is a legibility check, not a human learning-outcome study.
- Evaluate crowd/war/cultural composition from multiple normal player views, not only the most flattering still. Confirm the same story survives at the lowest supported quality.

## 5. Make criticism actionable

For each substantive finding record privately:

- revision and session/device/mode;
- exact action or vantage point;
- observed result, including an image/timestamp/log when available;
- how it harms the stated player goal;
- severity and proposed smallest useful correction;
- fix owner, resulting diff, and replay result.

Examples: "At the first blast, all visible people flee at the same instant and the source is behind the camera" or "Phone player can move but cannot crouch, so the central cover mechanic is unavailable." General claims such as "make it cinematic" or "looks bad" are insufficient without a specific diagnosis and correction.

Triage: blockers/crashes/data loss/unreachable interactions → unmet phone/core gameplay/cultural/three-minute requirements → major art/crowd/war weaknesses → secondary polish. Priorities are a guide, not permission to ignore the story or culture because graphics comes first.

## 6. Score honestly and attach evidence

Use 0–10 scores privately for the applicable dimensions below. Record strengths, defects, confidence and evidence references; keep measured facts separate from subjective taste.

| Dimension | What a strong result must show |
| --- | --- |
| Task fulfillment/completeness | Locked requirements implemented coherently in the shipped route; known gaps remain visible in the ledger |
| Correctness/reliability | Movement/collision, interactions, progression, consequences, pause, save/restore and ending behave consistently |
| Movement/gameplay/usability | Responsive navigation; useful cover/help; clear feedback; actual agency; no empty forced waits |
| Art direction/execution | Intentional lower-poly silhouettes, materials, light, color and layered compositions informed by the references |
| Population/animation | The street feels inhabited; varied readable activities/reactions and acceptable motion at intended viewing distances |
| War/event readability | Chaos has cause, anticipation, direction, response and aftermath; safe routes and actions remain legible |
| Cultural/narrative value | A specific credible cultural meaning is encountered through action and changes what helping/preserving means |
| Pace/emotion/clarity | Approximately three-minute normal play, concise Indonesian information, human stakes and a coherent ending |
| Phone accessibility/performance | Essential touch play works; readable layouts and comfort options; truthful profiles for available target classes |
| Delivery/provenance | Browser/static launch, local assets and licenses, historical boundaries, preserve/restore path and verified extraction ZIP |

Calibration: 5 = substantial revision; 7 = usable but visibly weak; 8.5 = strong with minor issues; 9+ needs exceptional supporting evidence; 10 is reserved for a demonstrated breakthrough, not completion. Do not lower the standard or raise numbers to end the task. A score increase requires an implemented correction or new confirming evidence. A passing unit suite does not automatically raise art/culture/pace scores.

Unknown verification is not a pass. Do not label an essential requirement N/A to evade the bar. An unavailable physical device must remain an explicit evidence gap; distinguish functional touch-emulation results from hardware claims. Maintain separate columns for design judgment and verification status where necessary.

## 7. Run up to four concrete review-and-revision rounds

For each round:

1. Freeze the candidate revision and update the evidence ledger.
2. Council examines the actual result; playtester runs the applicable sessions.
3. Score and rank observed problems with concrete supporting evidence.
4. Lead resolves conflicting findings, fixes the highest-impact issues and completes integration.
5. Replay affected scenarios, re-run relevant regression checks and inspect new rendered output. Refresh captures when visuals change.

Stop early only if every applicable scored dimension reaches at least8.5, no known critical error/unmet explicit requirement remains, and the required verification is present. Stop after four rounds even if the bar is not reached: deliver the strongest verified checkpoint and clearly disclose the remaining blockers/gaps. Do not extend the loop endlessly or claim success by renaming scope. If a round identifies no useful code change, investigate unresolved verification gaps or a different remaining requirement. Stop before four rounds only under the acceptance rule, or because a concrete external limitation prevents further useful work; disclose that limitation. A vague claim that the work is good enough is not a stop condition. Do not add features purely to fill a round.

Maintain author/reviewer independence when a previously reviewed feature is rewritten. Do not let reviewers edit the same file simultaneously or review a moving target. Run software-WebGL checks sequentially to avoid artificial rendering contention.

## 8. Verify the deliverable, not just the working tree

Create a repository-root extraction ZIP without .git, caches, credentials, test-only saves, transient browser binaries or unnecessary master/source duplication. Preserve required local dependencies, licenses and a viable old-edition path. Check relative URLs at both root and subpath hosting. Test extracting onto a disposable checkout of the documented base, follow the installation instructions, and run relevant smoke/unit checks from that extracted copy. Inspect newer remote changes before overwriting user work. Compare the current checkout to the documented base417a8a6d259ffb77e11c0bfe2b02bf42b0616fb9 (or the base deliberately adopted for the next release), preserve unrelated/newer work, and merge changed overlaps deliberately. An overlay ZIP cannot remove obsolete files: include an explicit rename/removal list when necessary, with a safe documented migration. Do not claim Replace All is safe against arbitrary future revisions.

Keep QA ratings, council exchanges, speculative process notes and debug/test hooks out of ordinary player UI. Developer hooks must be opt-in; no hook should be required to finish the game. Keep bulky internal review evidence out of the final product unless requested; a concise verified test record and production limitations are appropriate.

Bind the final evidence to the exact final tree/asset hashes and archive manifest. Any later code/asset change invalidates affected checks until re-run; inherited screenshots must remain labeled historical evidence. Report checks from the extracted package separately when performed.

The final response should state what changed, actual tests/play sessions, and material unresolved limitations. Do not call the result perfect, historically exact, visitor-validated, real-device tested or 60FPS unless the corresponding evidence exists.
