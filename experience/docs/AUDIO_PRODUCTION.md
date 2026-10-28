# Audio production

## Listening design

Kali Mas, a subdued changing wind bed and occasional creaks establish the district before the first disruption. Water has a broad wash and a separate upper-frequency detail layer, with sparse individual laps. A distant impact precedes the closer event. The return journey adds fire, loose fragments and reduced river presence. At the final viewpoint, intermittent breath gives the scene a human scale. The soundscape does not simulate a documented recording of Surabaya in 1945.

The revised mix has separate ambience, effects and speech buses. Ambience gently ducks to 42% of its current gain while a principal spoken line plays, then recovers after the line finishes or stops. Foley and important cues remain audible. Slowly changing filters and varied incidental timing avoid a fixed noise-loop drone; danger is conveyed with events rather than a continuous heavy bass tone. Major impacts have a quiet, filtered 105-millisecond reflection and late fragments, an authored outdoor impression rather than a geometry-derived acoustic simulation.

Footsteps separate heel contact, sole and a small scrape, with subtle alternating placement and variation. Stone is the default. Optional wood and earth profiles are available for authored surfaces; their availability does not establish the historical construction of the bridge. Pencil strokes differ from page turns. The camera has a two-part mechanical shutter, while scene transitions use a restrained cloth movement rather than a cinematic whoosh.

The procedural effects use original seeded noise, filtered oscillators and amplitude envelopes. No stock recordings, songs, archival speech or third-party sample libraries are included. The river, wind, cart, footsteps, paper, shutter, impact, debris, fire and breath are authored approximations.

## Spoken lines

The package includes twelve mono MP3 files: an optional introduction and one principal spoken line for each of the eleven story beats. Raka, Sari and Damar are fictional. Their voices are synthetic performances prepared for this chapter using AI Voice Generator. They are not archival recordings or recordings of named historical people. Production use remains subject to that service's applicable terms; this document does not assign a separate Creative Commons licence to the generated files.

The principal lines match the Indonesian story text. Supplementary dialogue uses on-screen captions. English text accompanies Indonesian speech; there is no recorded English dub.

| File | Spoken role | Duration |
|---|---|---:|
| intro-id.mp3 | Raka, optional introduction | 9.240 s |
| arrival.mp3 | Raka | 6.576 s |
| sari.mp3 | Sari | 7.536 s |
| bridge.mp3 | Raka | 6.216 s |
| damar.mp3 | Damar | 7.824 s |
| street.mp3 | Raka | 9.336 s |
| impact.mp3 | Damar | 2.472 s |
| shelter.mp3 | Damar | 5.424 s |
| return.mp3 | Raka | 6.528 s |
| wounded.mp3 | Raka | 5.352 s |
| lastview.mp3 | Damar: “Aku di sini.” | 0.768 s |
| afterword.mp3 | Historical afterword narrator | 12.696 s |

The short final-view line belongs at its scripted time, rather than on entry into the beat. The performance uses a calm delivery; it does not claim professional dramatic direction or a verified regional accent.

## Runtime interface

`Soundscape` creates its AudioContext on `start()`, called from a visitor gesture. If the browser lacks Web Audio, it returns `false`. The visual experience and captions can continue without sound.

- `await start()` starts the generated ambient layers.
- `setVolume(value)` accepts a value from zero to one and ramps the master gain.
- `setPhase(value)` changes the atmosphere from arrival at zero through danger and fire near one.
- `step(speed, surface?)` generates paced footsteps with alternating stereo placement. Supported surfaces are `stone`, `wood` and `earth`; the default is stone.
- `setSurface(surface)` selects the default for subsequent footsteps.
- `setLocation({x, z, chapter})` changes the river's approximate left/right position from authored local staging coordinates. It is not a geographic or head-tracked sound model.
- `cue(name)` plays a short effect.
- `await voice(beatId)` fetches a packaged MP3 once, decodes it and plays it through the same master controls. It stops the previous spoken line before starting another. If a valid pending request finishes decoding while the context is suspended, it is scheduled in suspended audio time and begins when the visitor resumes; opening the notebook does not discard that line. Explicit stop, replacement and disposal still invalidate pending requests.
- `stopVoice()` cancels the current line and pending voice request.
- `await pause()` suspends the AudioContext, including active speech and effects, and clears the ambient scheduling interval.
- `await resume()` resumes it and restores one ambient interval; repeated calls do not create additional intervals.
- `await dispose()` clears the ambient timer, stops loop, voice and tracked transient sources, clears decoded media references and closes the AudioContext.

Cues: `paper`, `page`, `notebook`, `write`, `pen`, `camera`, `shutter`, `photo`, `impact`, `explosion`, `boom`, `blast`, `distant`, `distant-impact`, `debris`, `collapse`, `breath`, `injury`, `ending`, `heartbeat`, `fire`, `crackle`, `door`, `shutter-close`, `transition`, `cloth`, and `intro`.

Stereo panning provides approximate left/right placement. This implementation does not calculate obstruction, room acoustics, distance attenuation from world geometry or head-related transfer functions. It does not require headphones to convey story information.

## Comfort and controls

A master gain, a dynamics compressor, separate speech/ambience/effect buses and short onset/decay envelopes control the mix. There is no continuous tinnitus tone. Audio does not begin before the visitor starts the experience. Caption text conveys spoken information when sound is muted. A quiet playback level is the intended default.

Impact cues contain low-frequency sound. Comfort on museum loudspeakers and headphones still needs an on-site listening test; numerical signal checks do not replace that test.

## File verification

FFmpeg/ffprobe decoded all twelve packaged MP3 files. Each file uses one channel at 24 kHz. Measured sample peaks range from −8.9 to −4.6 dBFS; no file reached digital full scale. Those measurements describe the source files, not a calibrated sound-pressure level at a listener's ear. Runtime mixing can change signal levels.

## Technical references

Mozilla. (n.d.). *Web Audio API best practices*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

Mozilla. (n.d.). *StereoPannerNode*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode

A Chromium 133 headless test exercised the audio graph after a start gesture. The generated effect mix produced a nonzero signal at the master bus (sampled peak 0.0540, RMS 0.0292). The packaged arrival narration fetched, decoded and started with a decoded duration of 6.576 seconds. Pause, resume, context disposal and volume clamping passed without browser JavaScript errors. These are functional signal checks; pronunciation, acting quality, speaker calibration and the complete chapter mix still require a listening review.


## Revision verification

The revised audio module was exercised alone in Chromium 133 with actual Web Audio nodes and the packaged arrival MP3. Before the start gesture there was no AudioContext. Start created six loop sources and three mix buses; the arrival line decoded to 6.576 seconds and played. The measured ambience gain reached 0.438 during speech and recovered to 0.965 after speech stopped.

Pause suspended audio time, removed the ambient interval and rejected new effects. Repeated resume calls restored a single interval. Stone, wood and earth footsteps, impact, debris, camera, transition and pencil cues produced output without JavaScript errors. An analyser at the master bus measured sampled peaks below 0.09 and RMS near 0.011 during the executed cue sequences; this is a signal check, not a listening-level or loudness certification. Disposal during twelve scheduled transient sources left zero tracked transients, no loop sources, no timer and a closed context. A disposed soundscape correctly refused to restart.

No external sound files were added in this revision. Sound design remains procedural, and pronunciation, performance quality, real-device reproduction and the complete chapter mix require a listening review. The unchanged MP3 files retain the source terms and transcripts recorded above.


The portable regression harness is `tests/audio-browser.cjs`. It accepts `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE`, starts a temporary server on an available local port, and writes results to a system temporary directory. Run it from the repository root with `node experience/tests/audio-browser.cjs` after installing Playwright and Chromium. It also checks a resume/pause race so the latest pause remains authoritative while the browser resumes its audio device.


A delayed-network regression reproduced the lost-line issue before the correction: the Sari request returned false when paused before its MP3 arrived. After the correction, the same test accepted and retained the source while the context was suspended, then confirmed audio time advanced with that source after resume. Separate delayed requests confirmed that explicit stop and disposal still cancel the pending line. These checks run in the portable audio harness; they do not rely on fast local network timing.
