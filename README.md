# JEJAKA · Field edition

A guided, first-person historical-fiction experience in reconstructed Surabaya, November 1945.

Raka Pradana arrives with a camera and notebook to record civilian life around Jembatan Merah. The visitor meets residents, chooses what to write, witnesses a disruption, and returns toward Kali Mas. His notebook preserves the selected account after a fixed, non-graphic death ending.

## Run

From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/experience/`. No dependency installation or build is required. Use a current browser with WebGL2, ES modules, import maps and DecompressionStream support. Headphones improve the spatial sound cues. Short first-person transitions are the default. The chapter is self-paced: stop to listen, compose a photograph, choose an action, or open the notebook. Ordinary walking is available in the pause menu. Total visit duration depends on those choices; no visitor-tested duration is claimed.

## Deploy on Vercel

Import this GitHub repository. Keep **Root Directory** at the repository root. Select **Other** if Vercel asks for a framework. Root `vercel.json` disables installation/build and serves `experience/` as the output directory. No environment variables are needed. The deployed site opens the experience at `/`.

The existing live baseline is https://jejakaprototype.vercel.app/. This field-edition package is prepared for the next GitHub/Vercel deployment; local verification does not deploy it. Test the updated preview after committing the extracted files.

## Play

| Control | Action |
|---|---|
| On-screen action / E | Record an observation or raise the camera |
| Camera shutter / Space | Capture the composed bridge photograph |
| Choice buttons | Select the account or action |
| Continue button | Short first-person transition to the next encounter |
| Skip travel | Arrive at the next scene through a brief fade |
| Hold W / ↑ | Walk while held |
| Drag the scene / ← → | Look around |
| N | Open/close notebook |
| Esc | Pause or close an overlay |

On touchscreens, use the on-screen controls and drag to look. The notebook stores observations, selected choices and a rendered bridge photograph. Save a standalone, printable HTML book containing the chosen observations and the actual photograph. Browser-local continuation works where storage is available. The final view and historical afterword do not create diary entries after Raka's death.

## Repository guide

- [Start here for another developer or agent](AGENTS.md)
- [Field edition architecture](docs/context/EDITION_2.md)
- [Current project handoff](docs/context/PROJECT_HANDOFF.md)
- [Competition context and limits](docs/context/COMPETITION.md)
- [Detailed story and route](experience/docs/STORY_ROUTE.md)
- [Historical boundaries and references](experience/docs/HISTORICAL_NOTES.md)
- [Verification and limits](experience/docs/VERIFICATION.md)
- [Character sources and animation](experience/docs/CHARACTER_PRODUCTION.md)
- [Audio production and voice provenance](experience/docs/AUDIO_PRODUCTION.md)

The playable frontend lives in `experience/`. The existing `output/`, `research/`, `references/`, `assets/` and `progress/` folders preserve the architectural reconstruction and its evidence. PALAGAN names in those folders are historical asset identifiers. The original Blender-kit README is archived in `docs/reconstruction/README_ARCHIVE.md`.

## Scope and rights

Raka, Sari, Damar, dialogue, choices, sound and damage sequences are fictional. The district draws on wartime maps and architectural references, with reconstructed details. No exact day, attack target or building-damage state is established by the dramatization. The project includes source and licence notices; read `experience/docs/credits/` and the original attribution records before redistributing modified assets.

This edition includes an optimized route district, refined surfaces and bridge fixtures, new character anatomy and authored animation, photo composition, scene choices and a portable notebook. It remains a prototype with a finite guided route and staged effects. Museum deployment, hardware performance and learning outcomes require separate testing.
