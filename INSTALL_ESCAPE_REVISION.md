# Install the escape revision

This is a repository-root overlay for https://github.com/Fafauzif/Jejaka, based on `f57363b5543ed3f9428f8ba01b879107e39dc0ab`.

1. Keep a commit or backup of your local work.
2. Before extracting, inspect `RELEASE_MANIFEST.json` inside the ZIP. If you edited any overlapping paths after the documented base, compare and merge them in a temporary folder first. An overlay cannot protect unseen future edits automatically.
3. Extract the checked/merged files at repository root, next to `vercel.json`; there is no enclosing directory. No deletion or rename is required.
4. At repository root run `python3 -m http.server 8080`, then open `http://localhost:8080/experience/`. Use a modern WebGL browser; opening the HTML directly with `file://` will not load modules reliably.
5. Vercel's existing output remains `experience`. No build step, backend or external service is required. No push or deployment was performed here.

The earlier photo/delivery continuation is available at `/experience/previous/`; the older field edition remains at `/experience/legacy/`. The preceding H escape revision is preserved at the documented Git base and in its separately delivered ZIP. Original master/research assets are preserved.

## Controls

Desktop: WASD moves, drag the scene to look, Shift runs, Ctrl crouches, hold E for the nearby action, Escape pauses. Arrow up/down move and arrow left/right turn.

Phone: the left joystick moves; drag the right side to look at the same time. Lari and Merunduk toggle running/crouching. Hold the contextual action to help; release to stop and resume later. Buttons keep their positions. Sound, pause and settings are always available. Low quality and reduced motion/flashes are selectable. Essential directions and dialogue remain captioned when muted.

Read `experience/docs/GROUNDED_VERIFICATION.md` for exactly what was tested and what remains unknown. Local rule tests: `npm test --prefix experience`. Browser test drivers, where included, require a separate Playwright/Chromium installation; the game itself does not.

The current route follows a coarse wartime-map interpretation with uniform 50% distance compression and a 4–5 minute main-play target. People, conversations, local destruction and the school refuge use are fiction. Old escape save coordinates are intentionally not loaded into the new map; sound/quality preferences remain compatible. The separate `MASTER_AI_CONTEXT.md` is the comprehensive project/competition/research/technical handoff.
