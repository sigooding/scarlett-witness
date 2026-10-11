# Exporting an animatic of Nobody's Witness

Asked on 10 October 2026: *"add export option for nobodys witness animatics with the effects, depth styles … and
subtitles and descriptions"*, then *"can you make the export the whole film"*. The whole film (the default), or any run
of its scenes, renders to an MP4 that looks and sounds as the game plays it: every picture effect (grades, glows, shakes, rain on the lens, the letterbox bars), the depth camera, the
voices, effects, room loops and songs, with the spoken lines burned in as **subtitles** and the screenplay's action and
scene headings as **descriptions**. Beside the MP4: the same captions as an `.srt` and a chapter per scene.

## Three ways to make one

1. **Home screen → 🎞 Export animatic** (the app running on your own computer with `npm run dev`). **The whole film** is
   chosen; pick **Some scenes** for a first and last scene instead. Tick subtitles and descriptions, choose the size,
   frame rate and reading pace, press **⏺ Render MP4**, and download the MP4 and the `.srt` when it is done. The dev
   server runs the exporter below as a job (`tools/vite-animatic-export.mjs`), so the dialog can be closed: open it again
   to see how much of the film is done and about how long is left. Leave `npm run dev` running until it finishes. On the
   deployed site there is no server, so the dialog shows the command instead.
2. **The command line**:

       npm run export:animatic                                 # the whole film
       npm run export:animatic -- --from nw_s65 --to nw_s66    # some scenes

   | Option | |
   |---|---|
   | `--from <scene id>` | first scene (default: the film's first, scene 1: the film opens on scenes 1 and 2, then the titles, set in the Studio) |
   | `--to <scene id>` | last scene, its continuation parts (`nw_s65_b`) included; leave it out to play to the end of the credits. The raid is one run of nodes: `--to nw_s92_after` ends after it |
   | `--size 1280x720` or `1920x1080` | picture size |
   | `--fps 24` | frame rate |
   | `--no-subs`, `--no-desc` | leave out the subtitles or the descriptions |
   | `--pace 1` | reading holds: 0.8 brisker, 1.25 slower |
   | `--out <folder>` | default `exports/animatics/whole-film/`, or `exports/animatics/<from>-<to>/` (git ignores `exports/`) |
   | `--url <server>` | use a dev server that is already running instead of starting one |
   | `--gpu` | draw with the graphics card instead of software rendering (much faster where there is one) |
   | `--debug` | also write `debug.json`: every caption, scene change and sound event the page logged (and keep the parts) |
   | `--gpu` and `--parts N` | faster renders: see "Faster renders" below |
   | `--keep-parts` | keep `picture.mp4` and `sound.wav`, which are otherwise deleted once `animatic.mp4` is made |

   Needs ffmpeg (on the PATH, or `FFMPEG=<path>`) and Playwright's Chromium (`npx playwright install chromium`, or
   `PLAYWRIGHT_CHROMIUM_PATH=<path>`).
3. **Watch it hands-off in a browser** and record the tab with any screen recorder: the dialog's **▶ Play hands-off in
   a new tab**, or a link like

       /?story=nobodys-witness-film&scene=nw_s65&animatic=1&to=nw_s66&subs=1&desc=1&pace=1

   It waits for one click (so the browser lets the sound start), then plays with no controls and stops after `to`.

## What the animatic shows

* **Pace.** The game moves on by itself: a silent line stays up for its reading time (0.5 s plus 18 characters a
  second, an ordinary subtitle speed, between 1.8 and 9 s, times the pace), a spoken line until 0.45 s after its voice
  ends, a scene heading for 1.6 s; a scene's last line gets its reading time before the cut. Short action lines that
  follow each other on the same picture are shown together as one description (up to 200 characters). The whole film
  runs about **2 h 03 min** at Normal, **1 h 48 min** at Brisk (`--pace 0.8`) and 2 h 21 min at Slow; until 10 October
  (14 characters a second, nothing joined) it ran 2 h 36 min. Only the animatic is paced this way: in the game the
  reader still sets the pace, and the screenplay is unchanged. Cuts timed to a song (the raid, the opening titles)
  keep their own timing.
* **Captions** are drawn by the game over the picture (`src/game/animatic.tsx`, styles at the end of `src/index.css`):
  subtitles with the speaker's name above the line, descriptions in italics in a dark box, the scene heading at the
  top left. The reading panel, the HUD, the toasts and the checkpoint flash are hidden. The credits play as they do in
  the game.
* **Files** in the output folder: `animatic.mp4` (H.264, CRF 18, AAC 192 kb/s, a chapter per scene), `captions.srt` and
  `report.json` (length, captions, chapters, sound counts and any warnings). The picture and the sound are made
  separately first and deleted once they are put together (`--keep-parts` keeps them).

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

**Working on the app while a render runs is safe.** The page being filmed ignores the dev server's live reload (it
keeps its connection to Vite but drops update and reload messages), so it carries on with the code it started with;
tested on 10 October by editing `src/index.css` and `src/AnimaticExport.tsx` in the middle of two renders. If the page
reloads anyway, or the browser or the exporter fails, the export stops with a message saying so rather than filming
the film again from its first scene.

## Faster renders

Two things make a render several times faster; both are in the dialog (**Use the graphics card**, ticked, and
**Render at once**, 3 parts) and on the command line:

    npm run export:animatic -- --gpu --parts 3 --size 1920x1080

* **`--gpu`** draws the frames with the graphics card: it uses Playwright's full Chromium (installed by
  `npx playwright install chromium`), whose headless mode can use the card, instead of the slim headless shell that
  draws in software. The exporter prints what it is drawing with: on an NVIDIA card it should name the card (for example
  `ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 …)`); if it says SwiftShader, the card was not used. With `--gpu`, the video
  is also encoded on the card (NVIDIA's NVENC) when ffmpeg has it (the usual Windows builds do), else on the processor.
* **`--parts N`** renders N stretches of the film at once, each in its own browser, then joins the pictures, the sound,
  the subtitles and the chapters into one MP4 (`tools/animatic-parts.mjs`). The film is only cut at a scene that sets its
  own music (or comes when none is playing) and its own room sound, so no song that carries across scenes is lost; at a
  join the room sound fades in over a second as it does on any scene change. Tested on 11 October: scenes 19–23 in two
  parts, 532 s of film in 3.8 minutes against about 6.7 in one, the chapters and subtitles continuous across the join.
  Each part is a browser with the game in it: 3 or 4 parts suit an 8-core processor with 16 GB of memory.

On an RTX 3070 with an 8-core processor, `--gpu --parts 3` should take the whole film to about the length of the film
itself or less (not measured: the sandbox this was built in has no graphics card).

## Limits

* **It is slow**: it renders frame by frame. Measured here without a graphics card at 1280×720 and 24 fps:
  scene 65 (1 min 42 s of film) rendered at 8 fps in 2.2 minutes, about 6 frames a second, so at 24 fps a render takes about four times as long as the film runs. The whole film is about 2 h 03 min at Normal (the exporter estimates it at the start and the dialog shows the time left), so at 24 fps without a graphics card it takes about 8 hours; 12 fps halves that. The opening titles, a montage and the end credits were each rendered on their own on 10 October to check they start and stop where they should. Use `--gpu` on a machine with one, a lower `--fps` for a quick look, or render the film in parts.
* The sound is rebuilt, not recorded: anything a page plays outside `<audio>` elements and the sound engine (speech
  synthesis; the film uses none) is not in it. The film's only video, the shot-14 lip-sync clip, has no sound of its
  own.
* Recording a tab from inside the page (`getDisplayMedia`) could not be started in the sandbox this was built in, so
  the browser route plays only; record it with a screen recorder.
