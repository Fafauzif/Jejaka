# Technical references

The runtime pins Three.js r169 to match the supplied city viewer modules. Newer API examples must be adapted deliberately rather than pasted into this pinned build.

- Three.js Authors. (2024). *Three.js, release169* [Software]. https://github.com/mrdoob/three.js/tree/r169 . MIT licence bundled in `lib/LICENSE`. GLTFLoader, SkeletonUtils and the renderer come from this release.
- Three.js Authors. (n.d.). *GLTFLoader*. https://threejs.org/docs/pages/GLTFLoader.html . Loading and animation data contracts.
- Three.js Authors. (n.d.). *AnimationMixer*. https://threejs.org/docs/pages/AnimationMixer.html . Independent character mixers and clip playback.
- Vercel. (n.d.). *Configuring a build*. https://vercel.com/docs/builds/configure-a-build . Static deployment with Other framework preset, empty build command and an explicit output directory.
- Vercel. (n.d.). *Static configuration with vercel.json*. https://vercel.com/docs/project-configuration/vercel-json . Deployment configuration fields.
- gamedev-skills. (n.d.). *Awesome game-dev agent skills*. https://github.com/gamedev-skills/awesome-gamedev-agent-skills . Reviewed the glTF-loading and materials/lighting guidance: independent animation mixers, skeleton cloning, explicit lighting and shadow setup, and preserving a project's pinned release. This repository's executable scripts are not part of the runtime.

Local typefaces use DejaVu Sans and DejaVu Serif, repacked as WOFF without changing their outlines or internal font names. The bundled `credits/DEJAVU_FONT_LICENSE.txt` preserves copyright and redistribution terms.

Historical evidence and its limits belong in `HISTORICAL_NOTES.md`; software documentation does not support a historical claim.
