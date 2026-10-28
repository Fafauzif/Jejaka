# Checks

From the repository root:

```bash
node --test experience/tests/*.test.mjs
```

The state suite uses only Node's built-in test runner. It covers bilingual schema, valid choices, eight final-account combinations, duplicate prevention, save restoration, invalid saves, storage errors and non-recordable final scenes.

`browser-smoke.cjs` runs an accelerated complete journey through actual DOM controls and test-only staging hooks. It serves the checkout within its own process, checks model/character loading, notebook, bridge photograph, held-key movement, branch state, ending and continuation, and rejects page/HTTP errors. It requires Playwright and an installed Chromium executable. It does not measure a full-duration play session or hardware-GPU performance.

```bash
npm install --no-save playwright
npx playwright install chromium
node experience/tests/browser-smoke.cjs
```

Use `PLAYWRIGHT_MODULE` for a nonstandard module path and `CHROMIUM_EXECUTABLE` for a locally supplied Chromium. Screenshots and results go to a temporary directory, outside the source. `?test=1` exposes chapter jumps for QA; ordinary URLs do not expose those hooks.

For release presentation, also inspect the actual screen on the target laptop and hosted preview, listen to Indonesian pronunciation, check speaker levels, and walk the chapter at human pace. Automated checks cannot establish museum suitability or historical authority.

## Field edition regression

The Node suite also checks real-time story/movement clocks at simulated 1/5/15/30/60 FPS, pause/resume bounds, the fade envelope and safe standalone notebook export.

`v2-browser.cjs` uses actual short transitions and visitor controls for the chapter. It checks viewfinder cancel/drag/capture, saved image pixels and reload, settings and focused Escape, ordinary walking and skip, normal-motion opaque scene cuts, the ending, caption bounds on desktop/phone and paused rendering. Scene jumps are used separately for layout/profile staging. `audio-browser.cjs` tests Web Audio signal, speech ducking, pause/resume/disposal and pending narration.

```bash
node experience/tests/v2-browser.cjs
node experience/tests/audio-browser.cjs
```

Both accept `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE`. The v2 harness accepts `JEJAKA_QA_DIR` for output; otherwise reports/screenshots use a temporary directory. Run software-renderer suites sequentially to avoid measuring competition between browser processes. Do not turn software FPS into a target-laptop claim.

The optimized delivery asset can be rebuilt in the full reconstruction repository with `python experience/tools/optimize_district.py` (NumPy, Pillow and SciPy). It requires the earlier district source copy; playback of the supplied optimized asset needs no Python package.

To verify the Vercel output layout on an extracted release, set `JEJAKA_SITE_ROOT=1` when running `browser-smoke.cjs`. It then serves the extracted `experience/` directory directly at `/` and also confirms that restarting clears a completed nine-entry account.
