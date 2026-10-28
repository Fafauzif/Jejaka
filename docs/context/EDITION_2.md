# Jejaka: field edition design

## Purpose

The field edition replaces long compulsory travel with short first-person transitions and makes observation, photography, decisions and the notebook the centre of the chapter. The original eleven-beat fictional episode and the researched city remain the basis. The visitor can choose ordinary walking and can pause, look around, read captions or revisit notes.

## Runtime responsibilities

- `experience/app.js`: scene progression, first-person viewpoint, staged cast, photograph composition, pause and settings.
- `experience/pacing.js`: separate pause-aware narrative time from bounded animation and movement time; brisk transition envelope.
- `experience/world.js`: optimized district, presentation details, water and atmosphere, static shadow caching and quality controls.
- `experience/notebook-export.js`: portable printable notebook with the visitor’s actual selected photograph and observations.
- `experience/audio.js`: local speech and procedural sound with independent ambience, effects and speech levels.
- Character source scripts and the district optimizer remain under `experience/tools/`. The production master is never overwritten.

## Experience contracts

The default journey contains a nominal 3.4-second eye-level approach and motivated fade. An already-playing principal line can finish before arrival; explicit skip or mute bypasses that wait. The transition envelopes total about half a minute across the route, excluding speech completion and visitor pauses. Holding the walking control or selecting walking permits longer continuous travel. Skip remains available. This transition estimate is not a visitor-tested total chapter duration.

The bridge photograph is an action: raise the camera, drag to compose, capture, and find the same framing in the notebook. Cancelling leaves no observation. Three choices retain their existing effect on local actions and the surviving account; none changes the battle’s outcome.

The ending lasts 18 seconds and can be skipped. Its camera stays above the local bridge surface and in Raka’s viewpoint. Damar’s dialogue, local presence and the notebook transfer are staged together. The historical afterword remains separate from fictional observations.

## Production boundaries

Optimized route geometry is a runtime derivative. Original map-derived layout, Blender master, exported district, references and source provenance remain intact. New environmental detail, character anatomy, cloth, lighting, water, sound and damage are production interpretations; they do not establish exact November 1945 conditions. Source rights are separate from historical evidence.

Visual quality is judged from actual player views. Hardware performance must be reported with device, resolution, quality setting and test duration. Software WebGL measurements can establish workload and functional regressions, but cannot stand in for the presentation laptop’s GPU.

## Release evidence

`experience/docs/VERIFICATION.md` records the checks completed for the packaged edition. The test suites include state/choice/save behavior, clocks, photo export and browser interaction. The release manifest records the exact packaged files and SHA-256 hashes.

## Change from the deployed first edition

The original route required about 389 seconds of walking before dialogue or the 55-second final hold. The field edition provides short transitions, optional walking/skip and an 18-second ending. Photography now requires composition and a shutter action, and the resulting image survives in an exportable book. Choices have visible staged responses and explanatory feedback. Dialogue, cast placement and captions are coordinated with the selected scene.

The browser district separately corrects the wide timber boxes that appeared as floating roof slabs, thickens roof edges, reduces distant detail, batches static parts and resizes embedded images. Refined lanterns, wall finishes, paving, water, smoke and roofline fire are production layers. The cast uses licensed anatomical components, fitted clothing/shoes and fewer material passes. Cached architectural shadows, contact shadows, parallel loading and idle rendering reduce unnecessary work.

The supplied live URL is the first-edition baseline. The field edition is delivered for extraction into the GitHub repository and a new Vercel deployment. Future maintainers should begin with the current verification record and reproduce any reported device-specific problem before changing the quality defaults.

Street civilians are staged ahead of the observation camera and flee continuously when danger begins. Supporting passers are excluded from the last two encounters to preserve the handoff sightline. The delivered Crouch clip contains a legacy pelvis-axis error, so the runtime conditionally retargets its specific track; the generator is corrected for future exports. Do not remove that compatibility guard without rebuilding and rechecking the delivered clips. The character production record documents the measured shoe/head check and the remaining acting limits.
