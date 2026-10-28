# Package integration

This archive supplies the active Jejaka browser experience and current project context. It can run independently, or merge into the existing Jejaka reconstruction repository.

## Contents to place at repository root

- `experience/` — runnable app, local assets, source scripts, production documents and tests.
- `docs/context/` — current handoff, accepted decisions, competition context and original discussion snapshot.
- `docs/reconstruction/` — archived original Blender rules and README.
- `AGENTS.md` and `README.md` — current top-level entry points. These replace the earlier Blender-only introductions; archived copies preserve the old text.
- `index.html` — root entry for generic static hosting.
- `vercel.json` — static Vercel output configuration.
- `PACKAGE_MANIFEST.json` — included paths, sizes and SHA-256 hashes.

Merge these paths into the existing repository. Preserve the existing `output/`, `progress/`, `research/`, `references/` and original `assets/` folders. The archive does not replace the city master or delete legacy work. Extract before uploading; storing only the ZIP file on GitHub does not expose its contained application.

For Vercel, import the repository with Root Directory at the repository root. The supplied configuration serves `experience/` without a build or environment variables. A new deployment should be tested for city loading, voice playback, pause/restart and saved continuation before a presentation.

For a local preview, run `python3 -m http.server 8000` from the extracted root and open `/experience/`. The application requires HTTP serving; opening index.html through file:// is unsupported.

Root `.vercelignore` excludes legacy modelling/research directories from CLI uploads while retaining all files under `experience/`. It does not remove them from GitHub. The Vercel output directory also limits the served site to the playable frontend.
