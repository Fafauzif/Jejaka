# Install the escape revision

This is a repository-root overlay for https://github.com/Fafauzif/Jejaka, based on `8a2701eb74821ee49f164162de4665d3300cfec1`.

1. Keep a commit or backup of your local work.
2. Extract the ZIP at repository root, next to `vercel.json`; there is no enclosing directory.
3. If you edited overlapping files after the documented base, compare and merge those paths using `RELEASE_MANIFEST.json`. An overlay cannot protect arbitrary unseen future edits automatically. No deletion or rename is required.
4. At repository root run `python3 -m http.server 8080`, then open `http://localhost:8080/experience/`. Use a modern WebGL browser; opening the HTML directly with `file://` will not load modules reliably.
5. Vercel's existing output remains `experience`. No build step, backend or external service is required. No push or deployment was performed here.

The previous continuation is available at `/experience/previous/`; the older field edition remains at `/experience/legacy/`. Original master/research assets are preserved.

## Controls

Desktop: WASD moves, drag the scene to look, Shift runs, Ctrl crouches, hold E for the nearby action, Escape pauses. Arrow up/down move and arrow left/right turn.

Phone: the left joystick moves; drag the right side to look at the same time. Lari and Merunduk toggle running/crouching. Hold the contextual action to help; release to stop and resume later. Buttons keep their positions. Sound, pause and settings are always available. Low quality and reduced motion/flashes are selectable. Essential directions and dialogue remain captioned when muted.

Read `experience/docs/ESCAPE_VERIFICATION.md` for exactly what was tested and what remains unknown. Local rule tests: `npm test --prefix experience`. Browser test drivers, where included, require a separate Playwright/Chromium installation; the game itself does not.
