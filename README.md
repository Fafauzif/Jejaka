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
