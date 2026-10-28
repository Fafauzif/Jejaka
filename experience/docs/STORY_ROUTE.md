# Jejaka: Catatan yang tertinggal

## Chapter brief

Raka Pradana, a fictional Indonesian journalist, enters the Jembatan Merah district with a camera and a notebook. He means to record how residents are managing their lives during the fighting. He meets Sari, a shopkeeper waiting near the bridge, and Damar, who is waiting for his younger brother. A nearby attack interrupts the assignment. Raka attempts to return to the river, suffers an unseen injury, passes his notebook to Damar, and dies beside the eastern approach to the bridge.

The visitor stays within Raka’s physical perspective. The story never reveals an attacker, a tactical map, a casualty total, or an aerial account of the city. Three choices change his observations and actions. They do not determine who wins a battle or offer a hidden survival ending.

**Planning assumptions:** an adult protagonist and a fictional episode situated broadly within November 1945. Total visit duration is self-paced and has not been established by visitor testing. Field edition continuation uses about 3.4 seconds per transition; ordinary walking remains optional. The table’s dialogue allowances are optional listening/reading space, not compulsory waits. The final view lasts 18 seconds and can be skipped.

## Narrative and visual rules

- Start amid uncertainty and existing tension. Raka has heard reports of fighting; he does not arrive in an unsuspecting peacetime city.
- Establish ordinary activity before the disruption: packing, waiting, exchanging directions, and recording a name and listening to a concern.
- Use the notebook to distinguish direct observation, attributed testimony, and uncertainty. Raka cannot know an event that he neither sees nor hears about.
- Preserve continuity across the return journey. Reuse a recognizable frontage and sound after the disruption.
- Keep military identities unspecified unless a researched, visible asset supports them. An explosion outside the frame does not establish its weapon or origin.
- Show the cost of Raka’s injury through posture, breath, slowing movement, and loss of grip. Do not display an open wound or turn blood loss into a meter.
- End at Raka’s resting eye height. A fade can close his perception; the camera cannot then rise to show the whole city.
- Keep captions and the notebook available without audio. Reduced motion removes shake, bob, and sharp view changes without suppressing story information.

## Spatial basis

The playable route begins on an authored western approach to Jembatan Merah, crosses Kali Mas, and follows the Kembang Djepoen corridor to the east. The earlier Heerenstraat staging points were moved after mesh inspection showed conflicts with the reconstructed landmarks. The western approach is a production staging area, not a newly verified historical street alignment. The route does not claim to reproduce a historical escape.

Coordinates below use the runtime’s Three.js frame: `[x,z]` in approximate metres, with vertical height stored separately. The Blender-to-runtime conversion is `(x,y,z) → (x,z,-y)`. These are staging positions rather than survey coordinates. The positions below match the revised runtime route. The revision was checked against the exported base meshes; it does not establish historical accessibility. The shelter is an authored roadside staging position, not a documented building interior.

| Beat | Position `[x,z]` | Look toward `[x,z]` | Allowance | Stage purpose |
|---|---:|---:|---:|---|
| Arrival | `[-140,4]` | `[-92,4]` | 45 s | Introduce assignment and notebook |
| Sari | `[-92,4]` | `[-88,8]` | 65 s | Establish a named resident |
| Bridge | `[-25,0]` | `[16,0]` | 55 s | Locate river and crossing at eye level |
| Damar | `[48,6]` | `[51,11]` | 65 s | Establish companion and missing relative |
| Street | `[106,22]` | `[158,42]` | 70 s | Extend observation before disruption |
| Impact | `[132,30]` | `[147,38]` | 45 s | Break routine through sound and reaction |
| Shelter | `[118,28]` | `[110,30]` | 70 s | Give the visitor a practical choice |
| Return | `[66,15]` | `[20,0]` | 65 s | Revisit recognizable surroundings |
| Wounded | `[29,3]` | `[-28,8]` | 65 s | Pass on the unfinished account |
| Last view | `[24,2]` | `[-44,10]` | 18 s | End without leaving Raka’s perspective |
| Afterword | Same resting position | Same direction or fade | 60 s | Read surviving notes and historical boundary |

The approximate planar distance between these staging positions is 387.5 metres. Guided movement connects the revised positions, with camera height sampled from the ground and bridge geometry. This is a checked production route, not a survey. The roadside shelter lies near `[118,28]`; its movable parcel starts at `[114.8,29.3]` ahead of the visitor. Sari stands at `[-88,8]` beside a reconstructed stall. The west-to-east crossing remains on the bridge; the final return stops on the east side.

## Current interaction model

The visitor follows a bounded guided path. A continuation button makes a short first-person transition to the next staging point. Holding W or the up arrow chooses ordinary walking along that path; a pause-menu setting also makes walking the default. Skip travel ends either journey through a brief fade. The visitor can stop and drag to look around, or use left/right arrows. There is no unrestricted walking, tactical navigation, or overhead camera.

The notebook appears as a first-person object and as a readable overlay. Recording adds one entry per recordable beat. The bridge interaction opens the camera. The visitor drags to compose, can cancel without recording, and presses the shutter to store the matching viewfinder crop in the notebook; it is a fictional in-experience photograph, not an archive image. Three choice beats save their selected entry. The visitor can save a standalone printable HTML notebook containing both text and the photograph.

Pause, notebook, and historical-context overlays stop progression and pause the sound. Volume and English translation controls are available. Reduced motion suppresses head bob, sharp flashes, and writing jitter while retaining the route and information. A completed session can be restarted; a saved session can be continued when browser storage is available.

## Implementation and extended direction

| Area | Current runtime | Further staging work |
|---|---|---|
| Navigation | Guided movement between revised eye-level positions; stop and look controls | Additional route variants would need new geometry checks |
| Notebook | Visible notebook, observation/choice entries, rendered bridge photograph, text download | Full finger-to-page writing and handoff choreography |
| People | Separate woman/man models; idle, walk, run, crouch, and gesture clips; staged Damar and supporting cast | Individual facial performance, detailed parcel tying, synchronized receiving hands |
| Shelter choice | A parcel moves after the help choice; checking changes the view and notebook account | A full two-person carrying animation |
| Disruption | Authored sound, smoke/fire progression, dust, falling plaster, civilian movement | Building-specific collapse and evidence review for any named landmark damage |
| Dialogue | Main Indonesian voice lines with matching English text and automatic ambience ducking; secondary timed captions | Complete voiced performance of every secondary line |
| Ending | Ground-relative first-person resting view, 18-second close with skip, separate afterword, saved notebook access | Subtle custom hand relaxation and fully synchronized companion performance |

The beat direction below records the narrative and staging plan. Where it describes a performance beyond the current-runtime column, it is extended direction rather than a claim that the animation has shipped.

## Beat-by-beat direction

### 01 / Sampai di kota

**Arrival:** Stand on the authored western bridge approach at `[-140,4]`, looking toward the crossing. Keep the river initially partly occluded by the district. Introduce no detached establishing shot.

**Action:** Open the notebook. Its first page contains the assignment, Raka’s name, and the month. Teach one control at a time. Let the visitor look before moving.

**Performance direction:** Keep supporting movement asynchronous. The runtime uses walking and idle actors; a future packing performance can add activity without increasing crowd density. Raka’s visible notebook supplies the immediate first-person object.

**Sound:** Footsteps and quiet activity nearby; a wider outdoor bed; a distant, indistinct disturbance. The scene should already carry tension without an immediate close explosion.

**Notebook entry:** Raka records his arrival and intention to find someone willing to talk. No invented newspaper affiliation or official assignment is presented as a historical fact.

**Exit:** A clear continuation affordance becomes available after the assignment appears. The visitor can reopen the notebook later without losing the current beat.

### 02 / Sebelum menutup toko

**Arrival:** Stop at `[-92,4]`, looking toward Sari at `[-88,8]`. The runtime places a plain reconstructed stall and bundles behind her. The encounter takes place beside the bridge approach, rather than claiming this stall is her documented shop.

**Action:** Listen, then choose between recording her words and recording the encounter. Neither earns a moral score.

**Performance direction:** The runtime presents Sari with an idle animation near the stall. A later bespoke performance can add parcel tying, a brief look at Raka, and a return to work. That extension needs hand/object contact inspection.

**Sound:** Cloth, string, the door, and conversation. The background continues during her account. Captions identify her by the name she supplies.

**Branch:** `testimony` records an attributed sentence; `place` records the meeting near the bridge and Sari’s reason for waiting. The selected entry remains in the final notebook. Neither entry establishes the condition of an unseen shop as an observation.

**Continuity:** Keep Sari’s name and concern in the final account. Her later fate is unknown. A future return to her stall would need its own route and performance checks.

### 03 / Di atas Kali Mas

**Arrival:** Travel across the checked bridge approach and stop within the railings. Keep the view near standing eye height, accounting for the bridge deck’s camber.

**Action:** Look along the river and toward the eastern street. An observation or optional camera gesture can record the view without implying a genuine historical photograph has been recovered.

**Performance:** One or two people cross at separate times. Keep their path on the deck. Keep characters away from clipping railings and prevent them intersecting the visitor.

**Sound:** Footsteps become different on the deck; river ambience becomes clearer. Introduce Damar’s direction from ahead.

**Notebook entry:** Raka records the river, people passing, and his photograph. The entry does not infer the pedestrians’ destinations.

**Exit:** Continue east. No orbit camera or overhead navigation becomes available.

### 04 / Orang yang tahu jalan

**Arrival:** Meet Damar beyond the eastern bridgehead. Raka stops at `[48,6]`; Damar starts at `[51,11]`, off the central line of travel.

**Action:** Learn that Damar is waiting for his brother. Damar points out a nearby place to shelter, not a guaranteed safe route.

**Performance:** Damar shifts his attention between Raka and the road. A pointing gesture should indicate the shelter’s actual direction. His cloth or small bag establishes later practical action.

**Sound:** Keep the scene conversational. A sound outside the visitor’s view draws Damar’s attention without supplying an omniscient explanation.

**Notebook entry:** Attribute Damar’s account. Avoid inventing an organization, military rank, hospital function, or verified rescue service.

**Continuity:** Damar remains identifiable through silhouette, clothing, and voice caption. Do not spawn interchangeable copies at later beats without hiding the transition.

### 05 / Halaman berikutnya

**Arrival:** Continue only a short distance along Kembang Djepoen. Keep the bridge direction spatially recoverable through the street alignment.

**Action:** Add an observation. This beat should reward looking rather than require finding a tiny hotspot.

**Performance:** Closing a door, adjusting a bundle, and turning toward a sound provide the transition. Stagger reactions: one person stops first, another responds after looking at them.

**Sound:** Interrupt a small activity with a distant impact. Reduce nearby conversation before increasing the overall sound level. Do not use continuous maximum-volume battle noise.

**Notebook entry:** Raka records the interruption, moving people, and the pencil still in his hand. His text does not name an artillery unit or target.

**Exit:** Damar calls Raka toward the street edge. The visitor has a clear route affordance before the close disruption.

### 06 / Suara yang dekat

**Arrival:** A short move brings the visitor to the most exposed staging point. The close event occurs beyond the immediate view.

**Action:** Move toward shelter. Allow automatic guided movement as the primary route so visitors unfamiliar with games are not penalized during a stressful scene.

**Performance:** Damar crouches, steps toward shelter, and beckons. Raka’s notebook closes. Dust and a limited falling-object event should make the road feel threatened without simulating a district-wide collapse.

**Sound:** One controlled close impact, debris, then changing ambience. In reduced-intensity audio, soften the transient while preserving its caption.

**Accessibility:** Caption `[Ledakan dekat] / [Nearby explosion]`; do not rely on stereo direction alone. Reduced motion replaces any view jolt with a slower lowering movement.

**Notebook entry:** Raka did not see the attacker or impact point. Preserve that uncertainty.

### 07 / Di tepi jalan

**Arrival:** Settle at the revised roadside position `[118,28]`. This is a small open staging area near the frontage, not a traversable interior or a newly invented long alley.

**Action:** Choose to help Damar clear belongings or look toward the bridge. Both are useful under uncertainty.

**Performance, help:** The runtime moves the parcel from `[114.8,29.3]` toward `[113.3,30.5]` within the default view and uses a gesture. The nearby Damar gesture is staged with the movement; a contact-solved two-person carry is extended direction. The changed parcel position supplies a visible local consequence.

**Performance, check:** Raka looks from the shelter edge toward the visible return path. Show only the portion the camera can see. Damar remains with the belongings.

**Branch:** The help entry records the time spent without street observation. The check entry records a partially visible route and uncertain far side. No score, guilt message, or casualty counter follows either option.

**Sound:** Close breathing and cloth; battle activity remains outside. Give the visitor a short low-intensity interval.

**Exit:** Return along the familiar road. Damar’s brother remains unaccounted for; the story does not imply a confirmed death.

### 08 / Jalan yang tadi

**Arrival:** Retrace the street toward the river. Preserve at least one identifiable frontage from beats 04–05.

**Action:** Continue toward the bridge while keeping close to the buildings. Keep the continuation control visible through the smoke.

**Performance:** Changed shutters, displaced belongings, debris, and a damaged secondary element establish consequence. Keep major landmark destruction out unless separately supported or explicitly designated fictional staging.

**Sound:** Familiar earlier activity is absent or replaced. Damar calls. A further unseen impact precedes Raka’s difficulty standing.

**Injury:** Convey injury through movement and sound. Avoid revealing a shooter, wound anatomy, or exact weapon mechanism. The injury happens after the branches converge and is not a punishment for helping or checking.

**Notebook entry:** Raka records retracing his route through smoke and keeping the street edge in view. The runtime offers no overhead or tactical map.

### 09 / Catatan terakhir

**Arrival:** Reach the eastern bridge approach and settle beside a checked edge or low cover. Damar approaches within Raka’s remaining field of view.

**Action:** Open the notebook. Choose to pass it directly or add a short message about its incompleteness before Damar takes it.

**Performance:** The runtime lowers/hides Raka’s notebook after the final choice while Damar approaches and gestures. The dialogue represents the transfer; a synchronized hand-to-hand animation remains extended direction. Chosen entries stay accessible in the reading overlay.

**Branch:** `notebook` records immediate transfer. `page` records an additional message, not a magical increase in evidence quality. Both preserve the notebook through the same fictional companion.

**Sound:** Keep Damar understandable; reduce competing noise during essential dialogue. Do not add a sentimental speech over the transfer.

**Exit:** Continue to the final view. Allow an early fade through the pause/accessibility controls without erasing the final account.

### 10 / Dari tempat ia jatuh

**Arrival:** Lower smoothly to Raka’s final eye height, then hold. Fire and smoke remain within this view across or along the riverfront. The visitor cannot fly toward them.

**Action:** Look within a restrained range or hold the existing view. No button demands that the visitor cause the death.

**Performance direction:** The runtime uses the low resting view, ending sound cue, and Damar’s brief line without showing a face or graphic wound. The narrative describes weakening breath and death; more detailed breath performance remains a sound/animation refinement. Damar’s line does not imply rescue succeeded.

**Sound:** Thin the mix toward breath and nearby detail. Let distant fire continue. Avoid celebratory music, a score sting, or a “mission failed” message.

**Exit:** Fade to the afterword or keep the resting view beneath it. Do not rise, cut to a skyline, or reveal information Raka could not perceive.

### 11 / Yang sempat ditulis

**Presentation:** Show the selected notebook entries in their original order, with the short closing page. Let visitors read without time pressure.

**Historical boundary:** The afterword states that the three named people, their words, choices, and exact episode are fictional. The context panel explains the map/photo basis and wider chronology, with source links. This curatorial text appears outside Raka’s notebook. It is not a posthumous diary entry.

**Controls:** Read notes, download notes, view historical context, or restart. Restart clears the current visitor’s choices and observations. The runtime does not automatically replay while the visitor reads. A future museum deployment still needs a separately tested inactivity/reset policy.

**Outcome:** Raka dies in the authored story. Sari’s eventual fate and Damar’s brother’s whereabouts remain unknown. The notebook preserves only what this visitor chose to record and what Raka could observe.

## Choice and state contract

| Choice key | Values | Persistent consequence |
|---|---|---|
| `sari` | `testimony`, `place` | Attributed words or an account of meeting Sari near the bridge |
| `shelter` | `help`, `check` | Practical action and matching limitation in the account |
| `wounded` | `notebook`, `page` | Direct transfer or transfer after a brief final message |

Each choice is made once per session. Notebook reopening does not record another entry or advance the chapter. Nine beats are recordable. `lastview` and `afterword` are deliberately non-recordable: Raka has already passed on the notebook, and the afterword belongs to the presentation rather than his writing. Restart, resume, and effects have dedicated verification checks in the application review; code paths alone do not establish target-device behavior.

## Animation direction inventory

**Shared civilian clips:** relaxed idle; alert idle; walk; short run; turn-and-look; crouch; directional gesture. Variation comes from timing, speed, clothing, and staging rather than adding random movement.

**Sari:** tie/hold parcel; pause work; brief look at Raka; resume packing. No required full facial close-up.

**Damar:** wait/look down road; point toward shelter; crouch/beckon; move object; approach injured Raka; receive notebook.

**First-person extension:** the runtime already carries, lowers, and hides a notebook. Bespoke raise/open, steady-page, assist-reach, protective lowering, impaired hold, and release movements remain a future animation set. Keep a full handoff masked until the hands and receiving object align.

**Environment:** one closing shutter or door; limited falling secondary element; cloth movement if present; dust burst; staged smoke/fire with a stable final composition. Preserve important events in sound and captions when visual effects are reduced.

## Route verification points

- Inspect each arrival above the ground and outside building/railing geometry, including added runtime props.
- Inspect the guided segments between the revised positions; crossing the river remains confined to the bridge.
- The bridge camera accounts for deck height; the visitor does not sink into or float above its surface.
- Each spoken cue has a caption and each essential choice has a keyboard-operable control.
- Text remains legible against smoke, fire, and bright facades.
- All three choice pairs produce distinguishable notebook records; final view and afterword produce no diary entries.
- Reduced motion preserves information and the same ending.
- The final camera never leaves first-person physical perspective.
- The afterword distinguishes fiction, reconstruction, and historical context.
- Suggested duration remains labelled a planning allowance until timed visitor tests establish it.
