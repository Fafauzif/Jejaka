# Jejaka continuation — local overlay

This archive is an implementation overlay for https://github.com/Fafauzif/Jejaka at base commit `417a8a6d259ffb77e11c0bfe2b02bf42b0616fb9`. The remote checkout inspected for this release was still exactly this commit. The supplied continuation checkpoint was applied and then revised. Research, master Blender files and unrelated source assets were preserved; the ZIP does not duplicate those large source files.

1. Commit or back up your current work first.
2. Extract this ZIP **at repository root**, next to `vercel.json`. There is no enclosing project folder.
3. Replace overlapping files only if you are on the documented base/checkpoint. If your branch has subsequent edits, compare/merge the listed paths using `RELEASE_SHA256SUMS.txt`; an overlay cannot safely preserve arbitrary unseen future edits.
4. No file deletion or rename is required. No push or deployment has been performed.
5. Run `python3 -m http.server 8080` at repository root and visit `http://localhost:8080/experience/`. A modern browser with WebGL is required; do not open `index.html` using `file://`.
6. The previous field edition remains at `/experience/legacy/`. All runtime dependencies, fonts and permitted assets are local. There is no build step, account, API key or paid dependency.

## Controls

Phone: left pad moves; drag the street to look while moving. Merunduk toggles crouch; Lari toggles running. Interact near the gold marker. At the shelter family or handcart, **hold Bantu** to move them; release to interrupt. When pushing the cart, move with it if it travels beyond your reach; approach the cart itself to resume. Use the camera shutter on screen. Notebook, pause, settings and ending all have buttons.

Desktop: WASD or arrow keys, drag to look; E interacts, hold E near the family/cart to assist; Ctrl crouches, Shift runs; C camera, Space shutter, N notebook, M route sketch, Esc pause. Essential captions and danger cues remain when muted. Settings offer low quality and reduced motion/flashes.

## Verification

Read `experience/docs/CONTINUATION_VERIFICATION.md` for the exact checks actually executed and material gaps. `RELEASE_SHA256SUMS.txt` binds the shipped files. Developer test hooks are available only at `?test=1`; normal play does not require them.

Local tests: `node --test experience/game/*.test.mjs experience/tests/*.test.mjs`.

Browser checks use an installed Chromium and Playwright, with `CHROMIUM_PATH` and `PLAYWRIGHT_MODULE` when needed. `browser-test.cjs` is a staged integration test with disclosed teleports. `natural-play.cjs` and `touch-play.cjs` use normal inputs plus read-only navigation telemetry; these are automated functional checks, not human learning studies or physical-device benchmarks.
