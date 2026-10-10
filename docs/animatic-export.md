# Exporting an animatic of Nobody's Witness

Asked on 10 October 2026: *"add export option for nobodys witness animatics with the effects, depth styles … and
subtitles and descriptions"*. The film, or any run of its scenes, renders to an MP4 that looks and sounds as the game
plays it: every picture effect (grades, glows, shakes, rain on the lens, the letterbox bars), the depth camera, the
voices, effects, room loops and songs, with the spoken lines burned in as **subtitles** and the screenplay's action and
scene headings as **descriptions**. Beside the MP4: the same captions as an `.srt` and a chapter per scene.

## Three ways to make one

1. **Home screen → 🎞 Export animatic** (the app running on your own computer with `npm run dev`). Pick the first and
   last scene, tick subtitles and descriptions, choose the size, frame rate and reading pace, press **⏺ Render MP4**,
   and download the MP4 and the `.srt` when it is done. The dev server runs the exporter below as a job
   (`tools/vite-animatic-export.mjs`); on the deployed site there is no server, so the dialog shows the command instead.
2. **The command line**:

       npm run export:animatic -- --from nw_s65 --to nw_s66

   | Option | |
   |---|---|
   | `--from <scene id>` | first scene (default: the start of the film) |
   | `--to <scene id>` | last scene, its continuation parts (`nw_s65_b`) included; leave it out to play to the credits |
   | `--size 1280x720` or `1920x1080` | picture size |
   | `--fps 24` | frame rate |
   | `--no-subs`, `--no-desc` | leave out the subtitles or the descriptions |
   | `--pace 1` | reading holds: 0.8 brisker, 1.25 slower |
   | `--out <folder>` | default `exports/animatics/<from>-<to>/` (git ignores `exports/`) |
   | `--url <server>` | use a dev server that is already running instead of starting one |
   | `--gpu` | draw with the graphics card instead of software rendering (much faster where there is one) |
   | `--debug` | also write `debug.json`: every caption, scene change and sound event the page logged |

   Needs ffmpeg (on the PATH, or `FFMPEG=<path>`) and Playwright's Chromium (`npx playwright install chromium`, or
   `PLAYWRIGHT_CHROMIUM_PATH=<path>`).
3. **Watch it hands-off in a browser** and record the tab with any screen recorder: the dialog's **▶ Play hands-off in
   a new tab**, or a link like

       /?story=nobodys-witness-film&scene=nw_s65&animatic=1&to=nw_s66&subs=1&desc=1&pace=1

   It waits for one click (so the browser lets the sound start), then plays with no controls and stops after `to`.

## What the animatic shows

* **Pace.** The game moves on by itself: a silent line stays up for its reading time (0.8 s plus 14 characters a
  second, between 2.2 and 10 s, times the pace), a spoken line until 0.7 s after its voice ends, a scene heading for
  2.4 s; a scene's last line gets its reading time before the cut. Cuts timed to a song (the raid, the opening titles)
  keep their own timing.
* **Captions** are drawn by the game over the picture (`src/game/animatic.tsx`, styles at the end of `src/index.css`):
  subtitles with the speaker's name above the line, descriptions in italics in a dark box, the scene heading at the
  top left. The reading panel, the HUD, the toasts and the checkpoint flash are hidden. The credits play as they do in
  the game.
* **Files** in the output folder: `animatic.mp4` (H.264, CRF 18, AAC 192 kb/s, chapters), `captions.srt`,
  `report.json` (length, captions, chapters, sound counts and any warnings), and the intermediates `picture.mp4` and
  `sound.wav`, which can be deleted.

## How it works

`tools/export-animatic.mjs` runs the real game in headless Chromium in animatic mode on a **paused test clock**: for
each frame the clock moves on 1/fps of a second, every CSS animation and video is set to that moment, the pictures and
depth maps are waited for, and a screenshot goes to ffmpeg. So the picture is exact however slow the machine is.

Sound cannot be recorded that way, so it is rebuilt (`tools/animatic-mix.mjs`): the page's `<audio>` elements play on
the same clock (each ends after its file's length, measured by ffmpeg) and every play, pause, seek and volume change is
logged, which keeps the fades, the music ducking under a voice and songs that play once; the sound engine's ambience
changes and synthesised sounds (the transition thumps) are logged and rendered by the engine itself in an
`OfflineAudioContext` (`audio.renderOffline`, `renderAmbient` in `src/audio.ts`), then mixed sample by sample at the
game's own levels. A part of the film fades its sound out over its last second.

**Do not edit files under `src/` while an export runs from a dev server**: Vite reloads the page and the capture
breaks. Edits under `tools/` and `docs/` are safe.

## Limits

* **It is slow**: it renders frame by frame. Measured here without a graphics card at 1280×720 and 24 fps:
  scene 65 (1 min 42 s of film) rendered at 8 fps in 2.2 minutes, about 6 frames a second, so at 24 fps a render takes about four times as long as the film runs (the whole film: most of a working day). Use `--gpu` on a machine with one, a lower `--fps` for a quick look, or render the film in parts.
* The sound is rebuilt, not recorded: anything a page plays outside `<audio>` elements and the sound engine (speech
  synthesis; the film uses none) is not in it. The film's only video, the shot-14 lip-sync clip, has no sound of its
  own.
* Recording a tab from inside the page (`getDisplayMedia`) could not be started in the sandbox this was built in, so
  the browser route plays only; record it with a screen recorder.
