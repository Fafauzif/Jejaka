# Audio production

## Listening design

Kali Mas, a low wind bed and occasional wooden creaks establish the district before the first disruption. A distant low-frequency impact precedes the closer event. The return journey adds fire, debris and reduced river presence. At the final viewpoint, breath gives the scene a human scale. The soundscape does not simulate a documented recording of Surabaya in 1945.

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
- `step(speed)` generates paced footsteps with alternating stereo placement.
- `cue(name)` plays a short effect.
- `await voice(beatId)` fetches a packaged MP3 once, decodes it and plays it through the same master controls. It stops the previous spoken line before starting another.
- `stopVoice()` cancels the current line and pending voice request.
- `await pause()` suspends the AudioContext, including active speech and effects.
- `await resume()` resumes it.
- `await dispose()` clears the ambient timer, stops sources and closes the AudioContext.

Cues: `paper`, `page`, `notebook`, `write`, `pen`, `camera`, `shutter`, `photo`, `impact`, `explosion`, `boom`, `blast`, `distant`, `distant-impact`, `debris`, `collapse`, `breath`, `injury`, `ending`, `heartbeat`, `fire`, `crackle`, `door`, `shutter-close`, and `intro`.

Stereo panning provides approximate left/right placement. This implementation does not calculate obstruction, room acoustics, distance attenuation from world geometry or head-related transfer functions. It does not require headphones to convey story information.

## Comfort and controls

A master gain, a dynamics compressor and short onset/decay envelopes control the mix. There is no continuous tinnitus tone. Audio does not begin before the visitor starts the experience. Caption text conveys spoken information when sound is muted. A quiet playback level is the intended default.

Impact cues contain low-frequency sound. Comfort on museum loudspeakers and headphones still needs an on-site listening test; numerical signal checks do not replace that test.

## File verification

FFmpeg/ffprobe decoded all twelve packaged MP3 files. Each file uses one channel at 24 kHz. Measured sample peaks range from −8.9 to −4.6 dBFS; no file reached digital full scale. Those measurements describe the source files, not a calibrated sound-pressure level at a listener's ear. Runtime mixing can change signal levels.

## Technical references

Mozilla. (n.d.). *Web Audio API best practices*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

Mozilla. (n.d.). *StereoPannerNode*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode

A Chromium 133 headless test exercised the audio graph after a start gesture. The generated effect mix produced a nonzero signal at the master bus (sampled peak 0.0540, RMS 0.0292). The packaged arrival narration fetched, decoded and started with a decoded duration of 6.576 seconds. Pause, resume, context disposal and volume clamping passed without browser JavaScript errors. These are functional signal checks; pronunciation, acting quality, speaker calibration and the complete chapter mix still require a listening review.
