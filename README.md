# Jejaka — Jangan Lepaskan Tangan Adi

A first-person Indonesian escape story set against the November 1945 fighting in Surabaya. You are Raka, helping Sari and her younger brother Adi reach a school refuge. See a wax-resist cloth demonstration, follow visible changes in the streets, take cover and physically help people through the city.

The active static application is `experience/index.html` → `experience/escape/app.js`. Start `python3 -m http.server 8080` at repository root and open `http://localhost:8080/experience/`. No build, account, API key or runtime service is required; use a modern WebGL browser. Vercel's output remains `experience`.

Read [INSTALL_ESCAPE_REVISION.md](INSTALL_ESCAPE_REVISION.md) for the overlay and controls, [the latest direction](handoff/10_GROUNDED_REVISION.md), [current cultural claim boundaries](experience/docs/GROUNDED_CULTURE.md), [map/history boundaries](experience/docs/GROUNDED_GEOGRAPHY.md), and [actual verification](experience/docs/GROUNDED_VERIFICATION.md). The earlier `ESCAPE_CULTURAL_RECORD.md` remains a historical ledger.

The earlier photo/delivery edition remains at `experience/previous/`; the field edition remains at `experience/legacy/`. The preceding H escape revision is preserved in Git at the documented base commit and in its separately delivered ZIP. All original research, cartography and master/source assets are preserved. Older documentation below describes those previous editions and is not current escape verification.

This is a development checkpoint: **71 native tests pass; no complete grounded journey is verified.** The fourth touch run completed the workshop, then failed its late-crouching strategy. Final label/driver corrections have no browser replay under the four-round cap.

The current main route targets approximately four to five minutes. Kembang Djepoen, the Kali Mas crossing and west-bank quay relationships follow a coarse period-map reading, with distances compressed50%; the people and local escape incidents are fiction. Read [MASTER_AI_CONTEXT.md](MASTER_AI_CONTEXT.md) for the full product, competition, research and continuation context.

<details>
<summary>Archived documentation for the previous edition</summary>

# Jejaka — Catatan yang Tertinggal

An Indonesian-first, first-person browser historical-fiction experience set around an authored Surabaya street and river crossing in November1945. Raka meets Sari folding batik, crosses to recover her cloth, moves between cover during warnings and impacts, helps a family or opens a handcart lane, and passes his notebook to Damar. The non-graphic ending and historical battle outcome remain fixed; local actions change the surviving account and immediate world.

The compact route targets approximately three minutes of ordinary play, without a punishing countdown. This is a tested development checkpoint with material limits; see `experience/docs/CONTINUATION_VERIFICATION.md` for actual completed checks and unverified goals. Automated traversal is not a human pace or learning study.

## Run

Serve the repository root over HTTP, for example `python3 -m http.server 8080`, then open `http://localhost:8080/experience/`. Runtime entry is `experience/index.html` → `experience/game/app.js`. No build, backend, API key, purchase or network asset service is required. Root `vercel.json` retains the existing static hosting setup; no deployment was performed.

Read `INSTALL_CONTINUATION.md` before overlaying the ZIP onto your checkout. It was prepared against commit `417a8a6d259ffb77e11c0bfe2b02bf42b0616fb9`; merge subsequent overlapping edits deliberately. Original research/source/master assets remain in the repository. Previous field edition: `experience/legacy/`.

## Play

Phone: move with the left pad while dragging the street to look. Merunduk crouches; Lari runs. Approach the gold marker and use the contextual action. Hold Bantu at the family or handcart; release to stop. Camera, notebook, settings, pause and ending use visible buttons. Phones default to the low visual tier, retaining the essential people, objects, danger cues and story.

Desktop: WASD moves; drag to look, or arrows to move/turn. E interacts; hold E to physically assist. Ctrl crouches, Shift runs. C raises camera, Space takes photograph, N notebook, M route sketch, Esc pause. Settings include language, quality, volume and reduced motion/flashes. Progress saves locally when storage is available; notebook can be downloaded.

## Evidence boundaries

Raka, Sari, Damar, the street choreography, family story, cloth pattern, danger and precise local destruction are fiction. The game does not claim an exact attack, weapon, address, day or recovered testimony. Batik-process and transmission claims are narrowly sourced in `experience/docs/CULTURAL_RECORD.md`; no claim establishes Sari's workshop in1945. Historical context and original reconstruction records remain separate. Supplied commercial-film/game references informed composition only and are not runtime assets.

## Development

`node --test experience/game/*.test.mjs experience/tests/*.test.mjs`

The active rules are renderer-independent in `simulation.js`; original world/civilian/effect modules use vendored Three.js. Browser harnesses and evidence methods are described in the verification record. Test hooks require `?test=1`; a normal journey requires no developer hook.

</details>
