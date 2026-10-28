# Verification gates

## Preparation-package checks (run before delivery of this ZIP)
- Original map/image files decode and have expected dimensions/hashes.
- Source IDs are unique; claim/asset/feature references resolve.
- JSON parses; CSV headers distinguish authored labels from transcriptions.
- Layout local coordinates agree with stored pixel coordinates and transform.
- Trace review removes unsupported feature identifications.
- Recovery helper and compaction-injection unit checks pass; syntax checks are distinguished from Blender execution.
- Relative file references, licence records and ZIP integrity are checked.

## Local construction checks (must run on the owner's Blender)

### Scene integrity
- Current Blender/MCP environment and exact file paths detected.
- Unrelated scene data preserved; only owned objects updated.
- One scene unit equals1metre; axis convention matches layout.
- Rerunning one owned layer produces no duplicate visible assets or uncontrolled data growth.
- No missing images, broken links, NaN transforms, zero-scale assets or unexpected faraway geometry.
- Final file saved and reopened; an inventory still contains the intended assets.

### Spatial checks
- At least two widely separated reference locations align in the plan view, with method/limitations recorded.
- District/map reference not mirrored, upside down or stretched differently on one axis without documentation.
- River and street topology agrees with inspected map; road and rail symbols distinguished.
- Bridge joins both banks; buildings do not intersect water or close intended street corridors.
- No invented geographic accuracy, terrain elevations or complete footprints from under-specified source symbols.

### Landmark checks
- Each core asset has a brief and source IDs attached.
- Silhouette and visible facade rhythm compared with the actual source image/crop.
- Placement hypotheses and unknown heights/unseen sides remain explicit.
- P.W.D. footprint not silently renamed Internatio.
- Old residency not conflated with later governor's office.
- Modern memorials, modern bridge design/paint and unverified date-specific damage excluded.

### Visual checks
- Overview plus plan, bridge, Internatio, Singa and Kembang corridor views inspected.
- Ground contact, outward normals, geometry intersections, shadow artifacts and z-fighting checked.
- Materials have plausible scale and consistent colour handling; no repeated giant bricks or invalid normal maps.
- No floating props or identically repeated marks/signage that destroy credibility.
- Source-like comparison images stored, with camera/lens limitations noted.

### Performance and resources
- Actual evaluated geometry and material counts captured.
- Repeated parts instanced or otherwise managed; high-detail modifiers kept adjustable.
- Resource use tested on the actual machine. No hardware-derived guarantees invented.
- Final rendering does not require an unapproved external paid asset/service.

### Recovery
- Current operation, saved scene and inventory correspond.
- Checkpoint hashes reconcile; pending/interrupted work not falsely promoted.
- Continuation notes name exact next work and needed evidence.
- Chat compaction cannot erase the only copy of construction code, asset metadata or historical decisions.

## Failure reporting
A failed or unexecuted item is not a pass. Preserve the working scene, state the issue and continue independent work if possible. Fix reversible issues within scope. Report material remaining uncertainty precisely instead of claiming perfect reconstruction.
