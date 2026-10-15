# Studio changes — review notes (15 Oct 2026)

Everything below is on the branch `arena/41bbfdfe-scarlett-witness` and is what the pull request into `main`
contains. Each section says **what changed**, **why**, **where** and **how to check it by hand**.
Automated coverage is listed at the end; nothing here changes the film's data or the game engine's behaviour —
it is Studio work (browsers, speed, guards).

---

## 1. Every image box lists every image, and can upload — the image browser

**What changed.** `src/studio/ImagePicker.tsx` is now the single image box for every picture field (a scene's
background, a beat's replacement shot, the depth-map camera's depth map / clean plate / cut-outs, foreground
layers, masks, portraits, cursors, credits montage, travel map). It lists:

- every built-in file under `/img` and `/assets`;
- **Nobody's Witness's own pictures** under `/film/img` (811 files), labelled by scene and shot
  (`377 The Hive Remembered (s1)`);
- the film's depth maps, clean plates and cut-outs under `/film/depth`, labelled by the shot they belong to;
- the gradient presets;
- every upload in the shared library, whatever story it came from.

The film's pictures and depth layers are *grouped* so a background picker for another story is not swamped by
800 plates. A group is listed when the field's current value is already in it, when the call site asks for it
(the three depth-camera fields ask for `film-depth`), or when the author ticks **“Show every group too”**.
Nothing is unreachable.

**Why.** The film's own art could not be re-picked from the Studio, and the depth fields had no way to upload a
map of your own.

**Where.** `src/studio/ImagePicker.tsx`; the scan lives in `tools/builtin-images.mjs` (new, plain JS + a
`.d.mts`) and is exposed as `virtual:builtin-images` by `vite.config.ts`; the call sites are in
`src/studio/Studio.tsx`, `src/studio/CinematicControls.tsx`, `src/studio/AmbientLayers.tsx` and the other
Studio panels. `/img` and `/assets` do not exist in this repository — a scan that reports only the film's
pictures is correct here.

**Check by hand.** Studio → Scene tab → a Nobody's Witness scene → **Look, atmosphere & camera** → the
background box: open it, the film's pictures are listed on their own heading (a film scene's background is
already a `/film/img/…` picture), or a plain story's box shows them behind “Show every group too (N more …)”.
Type in the filter box, press Enter, hover a row for a full preview, and upload with **⇧ Upload an image…**
or by dropping a file on the box.

## 2. The sound boxes list every sound — the sound browser (this round)

**What changed.** New `src/studio/AudioPicker.tsx`, used by:

- a beat's **🔊 Sound effect on this beat** (it replaced a free-text path box plus a dropdown that only listed
  your own uploads);
- a scene's **Ambient loop** field — the recorded-loop adder under the synth preset (it replaced a dropdown
  that only listed your own uploads; the field's own **⇧ Upload loop** button is unchanged).

It lists every audio file in the project, grouped by section: the film's one-shots and ambience
(`public/film/sfx`, 148 files — where all 166 of the film's `sfxUrl` references live), alternate takes, music
cues, voice takes, the other reels' audio, `public/uploads`, and your uploads (which lead the list). Point at a
row to **hear it** — one shared player, so auditions never stack; click to take it. There is a filter box
(Enter takes the first match), a window of 250 rows with **Show all (N)** past it, **⇧ Upload a sound…**
(audio uploads from the beat field are filed under *sound effects*), drop-a-file, a **▶ Test** button on the
trigger that plays at the beat's own volume, and **✕** to clear. A path or URL the scan does not know is still
usable: type it and press Enter (“Use … as it is”).

**Why.** The request: those two fields “don't show what files already available”. All 245 `public/film/sfx`
files could previously only be set by typing an exact path from memory.

**Where.** `src/studio/AudioPicker.tsx` (new); `tools/builtin-audio.mjs` (new — the scan, extensions, label
rule and section headings, moved out of `vite.config.ts` so it can be run and checked on its own);
`src/studio/Studio.tsx` (the beat field), `src/studio/AmbientLayers.tsx` (the loop adder);
`src/virtual-modules.d.ts` (rows now carry `section`/`rank`).

**Check by hand.** Studio → Beats tab → expand a beat → **Sound effect on this beat**: open the box, the film's
one-shots are the first section. Hover `crossing` to hear it, click it, press **▶ Test**. Then Scene tab →
**Ambient loop**: the dropdown gives the recorded loops a scene already has, ▶ hears one, ✕ removes one, and the
loop adder lists every sound in the project too.

## 3. Studio editing is measurably faster

`npm run perf:studio` (`scripts/studio-perf.mjs`, new) measures what one edit really costs on the real film
(201 scenes) and then mounts the real `<Studio/>` in happy-dom to time a typing burst, the autosave behind it
and opening an image picker — counting media-library reads and naming the code that asked for them.

| | before | after |
|---|---|---|
| open an image picker on a film scene | 830 rows, 812 thumbnail requests, ~3.3 s in the harness | 265 rows, 1 request, ~0.08 s |
| autosave of a draft with nothing embedded | ~10 ms + a whole-library read | ~3.7 ms, no read |
| validator per keystroke | 9–13 ms on the keystroke itself | runs behind the typing |

- **Image picker**: lists build as a window of 250 rows with “Showing 250 of 815 — type to narrow” and a
  **Show all** button; past 120 matches a built-in row draws a placeholder instead of a thumbnail; the picture
  the field is set to is always on screen; the scroll box contains its own scrolling. “Show every group too”
  and “Show all” still list everything.
- **Autosave**: `src/studio/draftAutosave.ts` now serialises once and only runs media compaction when the JSON
  it is about to write actually embeds media (compaction re-reads the whole asset library).
- **Validator**: `src/studio/Studio.tsx` reads a `useDeferredValue(story)` for `validateStory`, so a keystroke
  renders at full priority and the check runs behind it. Badges and the Test tab catch up when typing pauses.

**Check by hand.** Open a film scene's background box — it opens at once and says how many rows it is holding
back. Type into a beat line: the text keeps up; the Continuity/Test counts settle a moment later.

## 4. Guards added (things that will fail if this regresses)

- `npm run test:image-picker` — 45 checks over the real picker and the real scan, including that the film's
  811 pictures and 110 depth layers are all offered, the group rules, uploads (filed in the right folder,
  refusals), the row window, “Show all”, and that the picked row stays visible.
- `npm run test:audio-picker` — 42 checks over the real sound browser and the real scan: the film's sounds are
  listed under their own heading, the count is the whole library, filtering/Enter, hover audition through one
  player, upload + folder + refusal, drop-a-file, clearing, a verbatim path, and the ambient field keeping its
  preset while a loop is added or removed.
- `npm run test:film-backend` — now **111 checks** (was 99): every sound effect, ambience loop and music cue the
  film plays is in the sound browser; the film's pictures and depth layers are in the image browser; the section
  headings are checked.
- `scripts/browser/film-backend.spec.ts` (Playwright, needs a browser — **not runnable in this sandbox**) — the
  two steps that used the old dropdowns now drive the sound browser.

## 5. Docs

`Studio-Instruction-Manual.txt` and `public/Studio-Instruction-Manual.txt` (byte-identical, as before): the
image-browser section now names the film's pictures and the group rule, and there is a new **SOUND BROWSER —
FIELD BY FIELD** section, plus entries for **AMBIENT LOOP** and **SOUND EFFECT ON THIS BEAT**. `docs/film-backend.md`
notes the new check count. `CLAUDE.md` gained “The Studio's image library” and “The Studio's sound library” so
the next person finds the scans. The committed `Studio-Instruction-Manual.pdf` is regenerated from the text by
`node scripts/render-manual.mjs`, which needs a Playwright browser — it is still the older PDF.

## 6. What has been verified, and what has not

Verified in this sandbox (15 Oct 2026, all after the last edit): `tsc --noEmit` clean; `eslint .` 0 errors
(2 pre-existing warnings in `src/game/Game.tsx`); `npm run build` OK; `test:image-picker` 45/0;
`test:audio-picker` 42/0; `test:studio-ship` 174/0; `test:dom` PASSED; `test:film-backend` 111; `test:film-depth`
passed; `studio-beta-harness` 60/0; `npm run perf:studio` runs and prints the table above.
The dev server serves the new scan (1,594 sounds, 921 images).

**Not verified here:** the Playwright suites (`test:film-backend:browser`, `test:browser`) — no browser is
installed in this sandbox, so `scripts/browser/film-backend.spec.ts` changes are by inspection.
Known pre-existing failures elsewhere (identical on the base commit, unrelated to this work): `black-mass-bride`,
`sprite-key` (3), `sledge` (1), `arcade` (missing `public/assets/…cabinet.png`), `scooby` (5),
`foreground` (2) — all of them are missing media files that are not in the repository.

## 7. Things worth a second pair of eyes

1. The **window** sizes are a judgement call: `ROW_WINDOW = 250` rows and `THUMB_WINDOW = 120` thumbnails in
   `ImagePicker.tsx`, `ROW_WINDOW = 250` in `AudioPicker.tsx`. Easy to raise if 250 feels too few.
2. **Hover audition** in the sound browser plays a sound whenever the pointer crosses a row (the voice picker
   already behaved this way). If that is too chatty, the fix is one line in `AudioPicker.tsx`.
3. The **upload folder** for a beat's sound effect is now “sound effects” (`uploadFolder` on the call site) —
   previously uploads from that field were unfiled. Say the word if they should stay unfiled.
4. The sound browser lists **other reels' audio** (`public/reels/…`, 737 files) as well as the film's. It is
   behind its own heading and the filter, but it can be hidden if you would rather only see the film.
5. **Bundle size**: the scan is baked into the app (a browser cannot list a folder over HTTP), so the
   single-file build grew by 79 kB, 5 kB of it gzipped (3,591.83 kB → 3,670.61 kB). That is the price of the
   sound library arriving with no network request. Dropping the repeated section names from every row would
   claw back ~65 kB of the raw size if it matters.
