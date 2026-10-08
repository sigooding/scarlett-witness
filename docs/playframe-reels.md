# PlayFrame reels (works in progress)

Two PlayFrame storyboards play here as reels, each marked **(work in progress)** in its title, its tagline, its badge on the home screen ("🚧 Reel — work in progress") and a first card:

| Reel | Source in PlayFrame | Scenes | Run time |
|---|---|---|---|
| Untitled: the cold open (work in progress) | `public/projects/hangar-cold-open.json` | 79 | about 5 min |
| Let the Raptures Commence (work in progress) | `public/projects/let-the-raptures-commence.json` | 1,202 | about 76 min |

Each plays straight through at the storyboard's own pace, hands off; Space skips ahead. Nobody has listened to the voices or the effects, the Rapture has 72 shots without a picture yet (they show a black card with the shot's title and "(picture to come)"), and the cold open's lines are American voices (Jack, Vera and Daniel from NEONOIRE plus four stock character voices).

## Rebuilding

```
FFMPEG=/path/to/ffmpeg node tools/build-playframe-reel.mjs hangar      # reads ../PlayFrame (or --from <path>, or PLAYFRAME=<path>)
FFMPEG=/path/to/ffmpeg node tools/build-playframe-reel.mjs rapture
```

This writes `src/data/hangarColdOpenReel.ts` and `src/data/letTheRapturesCommenceReel.ts` (generated: change the storyboard in PlayFrame, or the tool, not these) and copies what each needs to `public/reels/<name>/` (pictures cut to 1280 or 1024 px wide, the voice takes, the sound effects). Both are in `STORIES` (`src/data/stories.ts`).

## How a PlayFrame frame becomes scenes

A PlayFrame frame is a picture held for `duration` seconds with audio clips at offsets. The engine advances a beat by a click or Space and routes itself to the next scene after `afterBeatDelaySeconds`, so each frame becomes a short chain of scenes, one per stretch between two events (a spoken line or a one-shot effect starting), each holding the same picture and routing on after that stretch.

* **Voices** are the beats' `audioUrl`, text and speaker nameplate. Takes the PlayFrame manifest marks `fx` (the radio and television voices of the cold open) are baked with PlayFrame's own chain, `scripts/neonoire/voice-fx.mjs`.
* **One-shot effects** are a beat's `sfxUrl` at the clip's `gain`. An effect that would start inside a spoken line moves to the line's start (otherwise its scene would end the voice).
* **Beds** (the looped effects) are the scene's `ambientAudio`: baked at the frame's gain into `public/reels/<name>/audio/sfx/<id>--g<gain>.mp3` and looped by the engine, so a bed still wanted in the next scene carries on without a restart.
* **Timing, measured in the engine:** a beat routes its `afterBeatDelaySeconds` *after its voice has ended* (about 0.4 s after the take's own length), or, on a silent beat, after the scene's entry transition. So the delay written is the stretch minus the take's length minus 0.4 s (voiced) or minus the transition and 0.1 s (silent). The cold open's first 60 seconds were checked against the storyboard's offsets in headless Chromium: the lines start within 0.3 s of their offsets.
* Shots with no picture yet (`image` empty in PlayFrame) are a black card carrying the shot's title.

## Known limits

* A frame's loops play for the whole frame (PlayFrame plays them once); the engine's looping is smoother than PlayFrame's own single play, but it is the engine's loop, not checked by ear.
* The 28 characters of `nobodys-witness-film` have blank avatars and `scripts/dom-smoke.mjs` fails on that already on `main` ("An empty string was passed to the src attribute"); the reels use emoji avatars and add nothing to it. `scripts/studio-ship-tests.mjs` and `scripts/engine-tests.mjs` fail on `main` for missing Family Guy and Blade Runner assets.
* About 65 MB of pictures and audio were added under `public/reels/`.
