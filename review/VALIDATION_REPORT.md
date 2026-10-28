# Preparation-package validation

Prepared2026-10-23 for the approved OpenCode/DeepSeek/Blender5.2 workflow.

## Executed checks
| Check | Result |
|---|---|
| Recovery-state unit tests |14passed: interruption, missing/empty outputs, invalid transitions, copy/hash association, corrupted checkpoint/state, orphan candidate, locking, path handling |
| Map geometry unit tests |3passed: polygon winding, source-pixel/local transforms, degenerate polygon rejection |
| Optional compaction-hook Node tests |3passed: bounded state injection, missing-state recovery, unknown-contract no-op |
| Python syntax parsing |8filespassed |
| JSON/data/reference validation |44unique source records,34JSONdocumentsparsed,17layoutfeatureschecked; no errors |
| Image decode/verification |39included imagespassed |
| Historical-image checksums |Verified against the included image register |
| Map-source/derivative checksums |Verified against the included map register |
| Reusable production assets |26cataloguefile referenceschecked; upstream hashes where provided; all image/model dependencies present |
| Model structures |4modelsinspected asglTF/GLBdata; headers/accessors/dependencieschecked |

Reproduction commands from the project root:

```text
python -m unittest discover -s tests -v
node --test tests/test_compaction.mjs
python scripts/validate_package.py
```

Node is needed only for the optional plugin test. The package validator does not require Blender or a network connection. Image decoding was additionally performed using Pillow in the preparation environment; Pillow is not required for the state helper.

## Independent review changes
Historical review corrected a candidate mosquefootprint association and an authored-label/transcription distinction. Runtime integration review corrected seed-object ownership/source metadata, normalised footprint winding, prevented orphanmesh accumulation, and aligned the seed collection/asset IDs with the runtime helper conventions. The final source and layout validators were run after these corrections.

## Not executed here
- Blender5.2scene creation, live MCP calls or screenshot inspection.
- Actual import/material appearance of the supplied models inside Blender.
- OpenCodeplugin loading or a real local compaction event.
- GPU/VRAM/viewport benchmarks on the owner's RTX4060laptop.
- World georeferencing, surveyed building dimensions, exactNovember1945condition or independent professional historical sign-off.

These are local build/review tasks, not package-preparation passes. Unit tests use small fixture files for recovery state; they do not prove that a real `.blend` opens. Model-structure checks do not prove a Blender render looks correct. The package is a validated preparation kit with explicitly stated historical approximations.

## Final archive verification
The delivery process generates `PACKAGE_CONTENTS.json` with per-file SHA256hashes and checks the resulting ZIP's CRC integrity. The manifest excludes itself to avoid a circular hash. Temporary duplicate downloads, caches and test scratch directories are excluded.
