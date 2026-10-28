# Local setup: OpenCode, DeepSeek, Blender MCP

This project targets the user's installed Blender 5.2 and RTX 4060 laptop.
The kit does not install Blender, replace the MCP server, alter global OpenCode
configuration, or contain credentials.

## Record local versions

From the extracted project directory, record:

```powershell
opencode --version
python --version
git --version
```

If the Windows Python launcher is used, `py -3 --version` and `py -3` can replace
`python`. The state helper requires Python 3.10+. Blender's Python is used only
for `bpy` scripts, through MCP. Do not install Python packages into Blender for
these standard-library helpers.

Keep the existing provider/model configuration. Confirm the selected provider
reports the intended DeepSeek model and supports tool use. A model name does
not confirm that this OpenCode installation can inspect images. Perform an
actual screenshot-inspection test.

## Connect the existing Blender MCP

Enable the installed add-on/server using its own instructions. In OpenCode,
list available MCP tools and inspect their schemas. Test read-only scene
inspection, code execution and viewport capture separately. Different server
versions/forks expose different tool names and transports.

Do not configure a second server on the same port merely to match a tutorial.
Do not expose a Blender control socket to the public network. Retain the current
working local configuration when it is sufficient.

For this project, code execution must be able to import project scripts, write
project outputs and save a `.blend`. If a server's restricted mode blocks one
of these, record the exact restriction and use an available supported workflow.
Do not report the operation as completed when a tool rejects it.

## Recommended Blender skills

Upstream: https://github.com/EL4CTEO/blender-skills

Pinned reviewed revision:
`71d031dab8bc6729504d11a78cbe91945401045f`

The repository presents Blender 5.2+ workflows and OpenCode installation support.
Its core routes into task-specific modelling, materials, lighting, rendering,
optimisation and QA skills. The repository and Windows installer were inspected
while preparing the kit. The skill collection has not been executed on this
user's machine and is not included as silently trusted executable code.

Use the complete upstream tree so its sibling skills and support files remain
available. A project-local junction installation avoids a global configuration
change and keeps the full tree in place. The pinned installer accepts `-Agent`,
`-Scope`, `-Project` and `-Link`.

PowerShell, from the extracted kit root:

```powershell
$PalaganProject = (Get-Location).Path
git clone https://github.com/EL4CTEO/blender-skills.git third_party/blender-skills
git -C third_party/blender-skills checkout --detach 71d031dab8bc6729504d11a78cbe91945401045f
git -C third_party/blender-skills rev-parse HEAD
```

Inspect the pinned `install/install.ps1` before running it. It replaces existing
destination skills with matching names, so check the project's
`.opencode/skills/` first. For a fresh project installation:

```powershell
.\third_party\blender-skills\install\install.ps1 -Agent opencode -Scope project -Project $PalaganProject -Link
```

Use the machine's existing permitted PowerShell execution policy; this kit does
not require changing it globally. The installer is an upstream third-party
script, not part of PALAGAN's tests. If execution is blocked, use the upstream
documented installation route supported by that machine rather than bypassing
policy automatically.

Restart OpenCode and verify skill discovery. Load `blender-core` first. For this
project the relevant specialists are `blender-scene-setup`,
`blender-hardsurface-modeling`, `blender-geometry-nodes`,
`blender-pbr-materials`, `blender-lighting-lookdev`, `blender-rendering`,
`blender-game-optimization`, `blender-pipeline-automation`, and
`blender-asset-qa`. Load only the needed skill/reference for each operation.

If an upstream skill conflicts with this project's historical evidence or scope,
the approved PALAGAN brief and user instructions govern. Skill examples are not
historical references and must not inject sample geometry into the map.

## Optional compaction integration

File-based recovery works without an OpenCode plugin. Read
`runtime/STATE_PROTOCOL.md` first. The user's exact OpenCode version was not
supplied when this kit was prepared.

The included hook matches the official documentation inspected on 2026-10-23.
After checking the installed version's plugin contract, install it locally:

```powershell
New-Item -ItemType Directory -Force .opencode/plugins | Out-Null
Copy-Item runtime/palagan-compaction.mjs .opencode/plugins/palagan-compaction.js
```

The `.js` destination follows OpenCode's documented local-plugin file format;
the `.mjs` source allows its dependency-free Node tests to run unambiguously.
Do not overwrite an existing file of the same name without inspecting it.
Restart OpenCode, perform a small manual compaction using that version's normal
UI/CLI, and confirm the continuation summary includes the PALAGAN state excerpt.
If the hook fails to load or is not invoked, remove the copied local plugin and
use the file-based protocol. Do not disable compaction to conceal a hook failure.

No exact token threshold is set here. OpenCode V1/V2 differ; retain the user's
working automatic-compaction setup and use version-matched configuration only.
There is no plugin guarantee of saving a Blender scene or automatically resuming
work. Checkpoints must be written during the work itself.

## Local verification commands

```powershell
python -m unittest discover -s tests -v
node --test tests/test_compaction.mjs
python scripts/palagan_state.py init
python scripts/palagan_state.py reconcile
```

Node is needed only for the optional hook test, not for the Python state helper.
The provided test report distinguishes code tests from checks that still need
Blender and OpenCode on the user's laptop.

Primary documentation links and retrieval status are in
`runtime/tech_sources.json`.
