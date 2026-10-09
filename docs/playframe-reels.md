# PlayFrame reels (works in progress)

Two PlayFrame projects play here the way the Nobody's Witness film does, each marked **(work in progress)** in its title, its tagline, its badge on the home screen ("🚧 Reel — work in progress") and a first card:

| Reel | Source in PlayFrame | Nodes | Beats | Text |
|---|---|---|---|---|
| Untitled: the cold open (work in progress) | `public/projects/hangar-cold-open.json` + `docs/hangar/cold-open.fountain` | 25 | 61 | the whole screenplay, aligned to the 39 shots; 17 voiced lines |
| Let the Raptures Commence (work in progress) | `public/projects/let-the-raptures-commence.json` + two screenplay pages | 64 | 1,373 | 65,000 characters; 668 voiced lines under 31 named speakers |

**How they play.** A scene opens on its slugline (`▸ continue to dialogue`); then every beat waits for **▸ continue (click or Space)**, with ◂ back and ⏩ auto as in the film. Action is Narrator text; every spoken line is under its speaker's name (Nina, Kath, Ray, Brian, Red Two…) with its recorded take; the picture changes on the beat where the shot begins; effects and beds play under it. The last beat of a node hands over to the next on ▸ continue; the reel is one line from the first card to "End of what exists". Open a node directly with `?story=let-the-raptures-commence-reel&scene=lr_rapture_ep1_st_judes` (any node id; the first cards are `lr_wip` and `hg_wip`).

## Rebuilding

```
FFMPEG=/path/to/ffmpeg node tools/build-playframe-reel.mjs hangar      # reads ../PlayFrame (or --from <path>, or PLAYFRAME=<path>)
FFMPEG=/path/to/ffmpeg node tools/build-playframe-reel.mjs rapture     # add --stats for a table per scene and any warnings
```

This writes `src/data/hangarColdOpenReel.ts` and `src/data/letTheRapturesCommenceReel.ts` (generated: change the storyboard in PlayFrame, or the tool, not these) and copies what each needs to `public/reels/<name>/` (pictures cut to 1280 or 1024 px, character sheets to 256 px, the voice takes, the sound effects, the baked beds and mixes). Both are in `STORIES` (`src/data/stories.ts`). Files under `public/reels/` that no story references can be deleted; a rebuild writes what is used.

## How a PlayFrame frame becomes beats

* **Text.** The Rapture's boards carry a `NUMBERED SCRIPT` block in each frame's notes (a header line, action lines, `SPEAKER: (direction) words` lines); the cold open's frames carry a `Script:` quote and `NAME: (delivery) words` lines, and the action itself is read from the screenplay (`docs/hangar/cold-open.fountain`, each shot taking the sentences from its quote to the next shot's). Action is cut at sentence ends into Narrator beats of at most about 150 characters; a changed INT./EXT. slugline is a card of its own (the scene's first one is the node's prose); `(direction)` is the beat's `expression`.
* **Voices.** Each spoken line is matched to the frame's recorded take by speaker and words (a take that matches no line is reported as a warning). A line with no take is text only. Takes the PlayFrame manifest marks `fx` (the cold open's radio and television voices) are baked with PlayFrame's chain, `scripts/neonoire/voice-fx.mjs`.
* **Pictures.** The first beat of a frame carries its picture (`backgroundTransition` from the frame's own transition). A shot with no picture yet keeps the one before it, and starts black at the beginning of a scene.
* **Effects.** One-shot effects ride the beat nearest their time in the frame (the unvoiced beats between two voices share out the stretch by length); several on one beat are mixed with their delays and gains into `public/reels/<name>/audio/sfx/mix-<hash>.mp3`. Loops are the node's `ambientAudio`, baked at the mean of the gains the node's frames gave them; a node breaks where a new bed starts (the Rapture lets a frame without a bed join the node before it), and the engine carries a bed that is still wanted into the next node without a restart.
* **Legacy boards.** A Rapture frame with no story text (the ordered legacy reference boards of episode two) plays as a montage (a `credits` node; "Skip title sequence" is on screen) after a card with the scene's outline.
* **Outline-only scenes** (no frames: most of episodes two to eight) are a text card carrying the outline.
* **Written but never boarded:** episode one's storage facility (its 24 legacy pictures laid in order on the page's paragraphs, Martin's one line voiced) and the 1980 tag are read from `docs/rapture/screenplay/ep1-06-storage-facility.md` and `ep1-09-hotel-room.md` in PlayFrame; the page's `ON SCREEN:` blocks are cards.

## What the reels carry of the screenplay

* **Episode one: all of it.** All 169 spoken lines of the draft (checked against `docs/rapture/ep1-screenplay.md`) and 467 of its 522 action sentences and sluglines; the rest are sluglines the boards word differently ("INT. HALL — CONTINUOUS" for "ST JUDE'S HOUSE - HALL - CONTINUOUS") and a few fragments the boards fold into a shot's camera note.
* **Episodes two to five:** the twelve boarded scenes (502 voiced lines) with their action; the legacy boards and outlines of the rest.
* **Episodes six to eight, and the unboarded parts of two to five:** outlines only, as cards. PlayFrame holds no screenplay for them.
* The first version of this reel (8 October) was timed to the storyboard and showed only the voiced lines and the shot titles, which is why most of it looked dialogue-free. An earlier hand-made episode-one reel (`src/data/letTheRaptures.ts`, left out of the catalogue on 5 October) carried the same screenplay as captions and is still in the repository.

## Known limits

* Nobody has listened to the voices, the effects or the beds. A node's beds have one level each, the engine's loops are not the storyboard's single plays, and an effect is placed by the nearest beat, not by ear.
* 40 shots of the Rapture still have no picture (the therapy class's 26, 11 of the washing-up's, three legacy slots); they hold the picture before them, or black at the start of a scene. The mugging (15), St Jude's (22) and 12 of the washing-up's 23 shots lie on existing studies from earlier boards: the nearest pictures, not drawn for these shots.
* The 28 characters of `nobodys-witness-film` have blank avatars and `scripts/dom-smoke.mjs` fails on that already on `main` ("An empty string was passed to the src attribute"); the reels use emoji avatars (or the character sheet) and add nothing to it. `scripts/studio-ship-tests.mjs` fails on `main` for missing Family Guy assets. `scripts/engine-tests.mjs` runs to the end since Blade Runner was removed (9 October 2026); 31 checks fail there for other reasons (30 South Park pictures that are not in the repository, one timer wiring pattern).
* About 65 MB of pictures and audio sit under `public/reels/`.
