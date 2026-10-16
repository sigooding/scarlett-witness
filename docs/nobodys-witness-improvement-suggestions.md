# Nobody's Witness — suggestions to improve the film

16 October 2026 · a pass over the shipped film data. Two items were acted on the same day and are marked
in their sections: the Hive-escape shake (item 2, fixed) and the sub-HD plates (item 3, started —
nine recreations staged in `public/film/img/reshoot-1080/`, nothing wired in).

The film is in good shape: the last recorded state is a coherent 104-scene picture with one grade, no
pans, no black transitions and a depth camera on 43 shots. These are the things I found by *looking at
the data* rather than watching: places where the film contradicts its own notes, where a rig has
outlived its picture, where the sound leaves a real hole, and where a viewer or the director has
nothing to hold on to. Items 1–4 are defects with exact addresses; 5–10 are craft; 11–14 are about the
shape of the release; 15–16 stop this class of thing coming back.

**How this was gathered.** `src/film/story.json` (the screenplay data the film is built from),
`src/film/studio-edits.json` (the director's Studio pass), the built `src/data/nobodysWitnessFilm.ts`
(every camera, sound and picture the film really plays), `docs/film-depth-layers.json`, and the docs in
`FILM.md`. Numbers below were counted in those files, not estimated. The suites could **not** be run
in this checkout (`node_modules` is missing — `npm ci` first), so nothing here is a test result.

---

## The film as it stands (measured)

| | |
|---|---|
| Screenplay scenes | **104** in `src/film/story.json` → **201** player nodes in the built film (scenes, montages, the two cutscene runs, the soundtrack runs, titles, credits, prologue) |
| Pictures | **542** shots in the data, **546** distinct picture URLs in the built film |
| Words | **102,666** characters of narration + dialogue; **554** recorded takes = **33.6 min** of voice |
| Running time | ≈ **1 h 45 min** in the animatic (788 caption cards at `0.3 s + chars/20`, ~54 min, plus the voice), per `docs/animatic-export.md` |
| Depth camera | **43** of 542 pictures (7.9%): 17 with cut-outs and a plate, 26 map-only |
| Sound | 71 scenes add an ambience file, 10 scenes set music, 36 shake blocks left in the film |
| Interactivity | **0** choices, **0** hotspots — it is a film you turn the pages of |
| Weight | `public/` is **733 MB**; the film's own pictures are 467 MB of `public/film/img`; a whole-film animatic export is about 387 MB |

---

## 1. Four more lines where the voice no longer says the words on screen

`docs/handoff-2026-10-13-film-notes.md` already lists two takes that say the old wording:

- `public/film/voice/s14a/342-jack-dryly-i-think-it-s-a.mp3` — take says *"I think it's a plate number."*, subtitle now *"We have a plate number."*
- `public/film/voice/s14a/343-jack-evenly-call-me-when-you-go.mp3` — take says *"Call me when you go somewhere."*, subtitle now *"Call me if you plan on going somewhere next time."*

Checking every take's filename against the line it is attached to (a take's name is generated from the
words it was recorded from) turns up **four more in the same state** — the subtitle and the audio say
different sentences. Every one of them is under six seconds, so each is a few seconds to confirm by
ear:

| Scene | On screen now | The take's own name says | File |
|---|---|---|---|
| 6 | "The officer made a phone call the moment he had my sister's name. Then you came." | "the officer looked at the screen" | `voice/s6/55-vera-the-officer-looked-at-the-screen.mp3` (5.02 s) |
| 6 | "A foreign passport. We like to take care with these things." | "nothing is wrong, we just like…" | `voice/s6/55-ishida-nothing-is-wrong-we-just-like.mp3` (4.00 s) |
| 6 | "Thursday. At my apartment. We had dinner." | "three days ago, at my apartment" | `voice/s6/56-vera-three-days-ago-at-my-apartment.mp3` (3.58 s) |
| 36 | "The coast. An inn off the highway. The phone is pink." | "the countryside, there's no signal" | `voice/s36/210-jack-the-countryside-there-s-no-signal.mp3` (4.39 s) |

These four were rewritten after they were recorded — each take is 12–16 characters a second against its
*new* words, so nothing is out of time; only the words give them away. The first two in the handoff were
re-recorded once already ("I think it's a plate number" → "We have a plate
number"; the officer "looked at the screen" → "made a phone call") and someone stopped at the words
without catching the audio. Three of the four are in **scene 6, the interview room** — the film's
second-longest scene (3,938 characters) and the one a first-time viewer meets earliest. Either
re-record them, or change the words back; either way it is one pass.

**Add the check, not another pass** (item 15).

## 2. ~~The 13 October "shake cam off in the Hive escape" never reached the film~~ — fixed 16 October

The handoff of 13 October says: *"Shake cam off in the Hive escape. The shake modes on 128, 129, 131,
132, 133, 378, 379, 381 and 382 are now `zoom-hold`."* Its own later review section says the same
change *"no longer shakes"* in `pictureLook`.

In the tree today those nine shots are still `"mode": "shake"` in **both** places — `pictureLook` in
`src/film/studio-edits.json` and the built film's inline cameras:

```
128-by-touch  0.1   129-she-lets-him 0.2   131-she-jumps 0.12   132-the-gap 0.2
133-inches-apart 0.35   378-the-barbers-shop 0.12   379-the-laundry 0.15 (plus a drift depth move)
381-the-plank 0.2   382-the-pipe-gallery 0.2
```

The builder's only shake suppression is `noShake` over `nw_s1`/`nw_s2` (the 15 October "no handheld
shake in scenes 1 and 2" pass), so nothing else can have taken them out — the 13 October change was
lost before it was committed.

**Fixed 16 October 2026 (this pass).** The nine `pictureLook` entries in `src/film/studio-edits.json` are
`"mode": "zoom-hold"` with `shakeAmount`/`shakeDuration` removed, and the film was rebuilt:
`node tools/build-film-story.mjs` printed `201 scenes, 1643 beats, 28 characters`. A structural diff of
the built film against the previous build shows **only** those nine blocks: shake blocks fell from 36 to
27 across the film, and nothing else changed (the nine raid nodes `nw_song_raid_13`–`_25` are
`zoom-hold`; `379-the-laundry` keeps its drift depth move). The remaining 27 shakes (the inn raid's and
the songs' other beats, the Hive escape's own elsewhere) are untouched, exactly as the builder's comment
describes them. If the shake should return, it is one line per shot here.

Two things to know about the fix: the **inverse risk** — the nine shots now play as `zoom-hold`, a slow
zoom-to-subject over 14–22 s while the raid's timed nodes give each about 4 s on screen, so their move
barely reads (item 5's problem; `static` or a short `zoomDuration` may be the better hold here). And it
was rebuilt without running the suites, because `node_modules` is missing in this checkout: `npm ci`,
then `npm test`, `npm run test:film-backend` and `npm run test:film-depth` should be run before this
counts as shippable.

## 3. Fifteen plates are below 1080p, and three newsroom inserts are not 16:9

643 of the film's plates are 1920×1080. These are not, and the engine fits pictures with
`background-size: cover` (`src/game/Game.tsx`), so a 16:9 plate below 1080p is simply upscaled onto a
1080p screen, while anything off 16:9 has its edges cropped to fit:

| Plate | Size | Note |
|---|---|---|
| `s20/346-the-bulb-hums.jpg` | 1365×768 | **also a depth shot** — see item 4; the rig was cut from this art |
| `s17/360-more-than-the-bowl-costs.jpg` | 1365×768 | |
| `s54/220-everything-is-still-there.jpg` | 1365×768 | |
| `s70/393-run.jpg`, `s70/396-five-metres-three.jpg` | 1365×768 / 1376×768 | |
| `s73/70-not-elegantly-badly.jpg` | 1365×768 | |
| `s86/123-fifty-years.jpg` | 1365×768 | the spanner retake of 13 October |
| `s90/381-the-plank.jpg`, `s90/382-the-pipe-gallery.jpg` | 1365×768 | the two new Hive-escape frames |
| `s93/137-he-knows-this-car.jpg`, `s93/138-the-door-opens.jpg` | 1365×768 | |
| `s94/139-only-tea.jpg`, `s94/140-where-are-we-going.jpg`, `s94/368-the-door-closes.jpg` | 1365×768 | |
| `s97a/565-they-bow.jpg` | 1365×768 | |
| `s82/new-jack-walks-in-1/-2/-3.jpg` | 1920×1072 / 2784×1504 / 1672×941 | 1.79:1, 1.85:1, 1.78:1 — cropped top and bottom; two are also not plate-sized |

That is fifteen shots where the picture goes soft next to a 1080p shot on either side of it. Cheap
to fix one at a time with the image tools, and one of them (123, the spanner) is a picture the director
asked for on 13 October, so it is current work rather than history.

**Done 16 October 2026.** All eighteen are recreated — **not upscaled**, per the director — in
`public/film/img/reshoot-1080/`, each named after the picture it replaces, with a `README.md` beside them
giving the scene, the beat, the original path, and what to check before a swap (the depth rig on `346`,
the sedan's continuity across 93–94, a two-car frame in `140`, brand signage in `70`), plus
`_contact-sheet.jpg` for reviewing the set at a glance. The plank shot (`381`) is staged to the director's
note: Vera on the plank, Jack behind her, one elderly Japanese neighbour steadying it. Nothing is wired in:
the originals are untouched and no scene data points at the new plates.

## 4. A depth rig can outlive its picture, and nothing fails

`docs/handoff-2026-10-13-film-notes.md` (review section) recorded: *"`s20/346-the-bulb-hums.jpg` was
regenerated but its depth rig was not, so the moving shot draws the old art's plate and cut-out."*
Nothing has changed since — the plate in `public/film/depth/s20/346-the-bulb-hums/plate.jpg` still
carries the old composition (I opened both): the picture has Mara on the left and Jack on the right, the
plate has an empty seat and a blurred shoulder at the right edge, and the picture is 1365×768 while the
plate is 1920×1080. It plays today as a drift at 0.54.

This is CLAUDE.md rules 1 and 2 in slow motion: the map and the cut-outs no longer follow their picture,
and no test can see it because the map is still a real map. **Put the source picture's hash in the
ledger** — `docs/film-depth-layers.json` already records `picture`, `depthMap`, `plate`, `cutouts` and
every cut-out box; add `pictureSha256` and let `npm run test:film-depth` fail when a rigged picture's
hash changes (item 15). Then 13 October's failure can't happen twice, and `346` is re-cut with
`tools/make-depth-layers.py` from the current art in one go.

## 5. Ten depth moves that cannot read

`FILM.md` already names ten shots whose depth move is longer than the time on screen, and already
proposes the fix (*"Shorten their `depthSeconds` if the move should read there"*). The values are
unchanged, so today seven of them cut away about a second after the line (the eighth, `179-same-wood`,
lost its map on 11 October and shakes instead) and two (the timed raid stills) are on screen about 4 s,
while their moves run **14–26 s**:

| Shot | Move | On screen |
|---|---|---|
| `379-the-laundry` | drift, 26 s | ~4 s (raid still) |
| `134-the-walkway-is-empty` | truck, 18 s | ~4 s (raid still) |
| `307-the-gardener` | push, 24 s | cut ~1 s after the line |
| `173-four-black-sedans` | truck, 18 s | cut ~1 s after the line |
| `205-a-light-ahead` | push, 18 s | cut ~1 s after the line |
| `31-the-lit-window` | truck, 16 s | cut ~1 s after the line |
| `234-a-different-clock` | push, 16 s | cut ~1 s after the line |
| `278-the-clock-reads-ten` | push, 14 s | cut ~1 s after the line |
| `68-the-clock` | push, 14 s | cut ~1 s after the line |
| `179-same-wood` | *(map removed on 11 Oct; shake only)* | — |

Setting `depthSeconds` to about 5–6 s on the nine that still have a map (the push and truck ease out, so
most of the travel lands in the first seconds) turns nine invisible moves into nine visible ones — no
new art.

## 6. Depth coverage is 43 of 542 — the next batch is already written down

`docs/film-depth-layers.json` lists **34 pictures that have people in them** (`peopleInShot`). Sixteen
have a rig. **Eighteen are waiting**, and every one of them is a picture the plan already knows needs a
map plus cut-outs and a plate:

```
88-the-walkway          91-grey-light            109-the-fortieth-floor
130-the-roof            135-below-the-viaduct    153-the-rain-has-stopped
160-were-closed         179-same-wood            184-a-gap-in-someones-teeth
203-the-sea-wall-steps  206-the-window-swollen-shut  207-the-pink-payphone
211-wet-tin             228-nine-oclock          229-like-a-date
290-daylight-again      297-the-glass-office     337-engine-off
```

Seventeen of the eighteen lost their maps on 10 October when the guesser was removed, so they currently
play a plain push or hold — the flattest shots in a film that has otherwise trained the viewer's eye to
expect parallax. Two or three a session with `tools/make-depth-layers.py` and `tools/review-depth-maps.py`
is the whole process (`docs/depth-camera.md`), and 179 needs a fresh map anyway because the picture was
reshot with Jack running.

After those, the best value is the **empty locations the film lingers on** — the ones with the most
pictures and the most words that have no depth yet: scenes 6 (interview room), 10 and 11 (Jack's office),
27A (the bar), 14 (Mara's apartment), 84/90 (the Hive's rooms). Map-only, so they are the cheap ones.

## 7. 73 of 104 scenes play with no music, no ambience file and no rain

The rain bed is automatic for exteriors with rain, but on the interiors the film is genuinely dry. Some
of that is the point — `docs/nwt-soundtrack.md` says silence is the cue for the confessions and the
killing — and scene 8's room tone shows the alternative. The longest dry scenes are the ones to decide
about, because a still picture plus a reader's own silence is a long time in a big room:

| Scene | | Characters |
|---|---|---|
| 6 | The interview room | 3,938 |
| 10 | Depends who's calling (Jack's office) | 2,839 |
| 98 | The rain has stopped (rooftop, dry by design) | 2,414 |
| 14 | Someone who meant to come back | 2,347 |
| 90 | Through the rooms | 2,296 |
| 25 | The number 114 | 2,148 |
| 84 | Three feet away | 2,145 |
| 79 | Her father's handwriting | 2,124 |
| 22 | Somewhere like this | 2,066 |
| 20 | Prove it (the storeroom) | 2,064 |
| 82 | Start with my part (newsroom) | 2,012 |
| 27A | She was here | 1,968 |

`public/film/sfx/amb-room-tone.mp3` and `amb-office.mp3` already exist and are used elsewhere, so the
fix is one `ambientAdd` entry per scene in `src/film/studio-edits.json` plus a rebuild — the same shape
as the scene 8 change on 12 October.

## 8. Scene 98's song hand-off is still undecided

`docs/handoff-2026-10-13-film-notes.md` leaves it open: Mara's service uses 191 s of *What Made You,
You*'s 196 s, so about 5 s is left when the rooftop (98) begins; the review that evening set `nw_s98`
in `studio-edits.json` back to `{}`, which hands the decision back to the builder's default (the
rooftop fades the song out). The three options in the notes are still the three options; the middle one
is the cheapest and needs no new audio: **re-time the service run** (the fourteen service stills are
about 13.5 s each) so the song's last section lands on the first rooftop beats — that is a change to one
`soundtrack` entry in `studio-edits.json`, and the film's own test (`test:film-backend`, check 17)
already guards that the song starts exactly once.

## 9. Two read-pace passes the animatic would pay for

Nineteen scenes read a quarter faster in the animatic (`readPace`, 0.75) — but the list is not the
longest scenes. `nw_s10`, `nw_s14`, `nw_s14a`, `nw_s25`, `nw_s22` and `nw_s26` are covered; these are
the big ones that are not, and they are where the render's minutes are:

```
6 (3,938 characters) · 1 (2,800) · 74 (2,786) · 98 (2,414) · 90 (2,296) · 84 (2,145)
79 (2,124) · 20 (2,064) · 82 (2,012) · 27A (1,968)
```

Adding those ten to `readPace`, or giving the whole film a floor (say 0.85) whenever a picture would
hold for more than 20 s, trims the render without touching the game.

## 10. The camera grammar is one move, and its duration is longer than most shots

Across the built film: **zoom-hold 249, static 167, dolly 118, shake 36, dolly-zoom 4** — and
`zoomDuration` is 14–22 s on 561 blocks while the average picture is on screen about 12 s. The push
eases out, so it still reads, but the last 20 % of every one of those moves (the part that holds) almost
never plays. Lowering the default to 10–12 s in `tools/build-film-story.mjs` (`camera()`) would make
every shot's move land, and would give the 118 dollies a little more room to be the "movement" shots
they are meant to be. Optional, but it is a one-line change with a whole film behind it.

## 11. Nothing lets a viewer move around a 201-node film

There are no choices and no hotspots, and the player has no scene index; the only ways in are ▶ Resume
and the beginning. The engine already has the feature — twice:

- **`acts`** (`src/types.ts`): act title cards and a route map scoped to the act, with membership
  *derived* by walking the graph, which `scenesInAct` (`src/game/routeGraph.ts`) does over auto-advance
  and after-beat edges as well as choices — so a linear film qualifies. The film already cuts itself into
  parts with its own four card nodes (`nw_title`, the two montage cards `nw_m18` and `nw_m53`, and
  `nw_credits`); nominating a start scene at each of those joints gives the film "Part Two" cards and a
  "where am I" chart for nothing.
- **`episodes`**: a season screen, per-episode title cards and recaps, per-episode save slots and
  per-episode endings. Heavier, but it is exactly what a long picture split at the montages wants, and
  it is what `ashfordVanishing.ts`, `bigBad.ts` and `moonlighting.ts` already do.

Either way, a "Parts" screen on the newsstand with a resume point inside each is the single biggest
change to how the film *feels* to a viewer, and it is configuration, not code.

## 12. About 366 MB of the shipped folder is material the film never plays

`public/` is 733 MB and Vite copies `public/` verbatim into the build (and into the Electron asar).
Counting what the built film actually references:

| Folder | Unused by the film | Size |
|---|---|---|
| `public/film/img` (1,257 files, 466.8 MB) | **701 files** never referenced | **287.6 MB** |
| — `archive/` (older plates, 70 folders) | 320 files | 107.5 MB |
| — `reviews/` (contact sheets, before/after) | 78 files | 67.8 MB |
| — `roadside/`, `thehiveescape/`, `sheets/`, `s1_new/`, `s2_new/`, `s2_new2/`, `service_new/`, `jack_ishida_new/`, `kurose_new/`, `final_scene_new/`, `props/`, `service/` and a few small folders (retake sources and production sheets) | 303 files | 112.3 MB |
| `public/film/audio` (21 files) | 9 raw director uploads (`Hounds (3) (1).mp3`, `Dark Hills Blues (1).wav`, `It ain't easy.mp3`, `Glimmering%20Haze (1).mp3`, …) | 66.4 MB |
| `public/film/sfx` (245 files) | 112 effects that no beat plays | 9.9 MB |
| `public/film/voice` (583 files) | 20 takes (the prologue's alternates) | 1.8 MB |

The retake sources are worth keeping — `FILM.md` keeps them as the record of the reshoots, and the
old plates are in git — but nothing says they have to be *served*. There is already a home for
production material beside the film: `art/` (`art/mara-service/` holds the service stills), and a
`.gitignore` precedent for exactly this reasoning (`public/img/*/src/` — regenerable sources stay out
of the shipped tree). Moving `archive/`, `reviews/`, the retake sources and the raw music uploads
into `art/` would:

- take roughly **355 MB** off every build, package and (if the Pages workflow is ever activated) deploy;
- cut the Studio's image library by 700 entries — `tools/builtin-images.mjs` scans all of
  `public/film/img`, and CLAUDE.md already records that the film's 800+ pictures made an unwindowed
  picker cost seconds to open;
- remove the standing risk that a beat is pointed at a retake source instead of the plate.

(The 9.9 MB of unused effects and 1.8 MB of prologue alternates are small enough to leave where they
are; several are deliberate alternates.)

## 13. Export the film in parts, not only whole

The animatic exporter already takes `--from nw_s65 --to nw_s65`; the whole film is ~387 MB. Presets in
the export dialog for the runs between the film's own card nodes (item 11) turn "render the film, wait"
into "render the part I'm working on", and give the director something to watch in ten minutes. No
engine work: the dialog already lists the shipped film and passes `--from/--to`.

## 14. The generated story file is 705 KB, and the repo already fights that ceiling

`src/data/nobodysWitnessFilm.ts` is 705 KB / ~16,000 lines — the same size class as `Studio.tsx`'s
844 KB, which `notes.txt` describes as being *1.7× over* the 500 KB point where Babel deoptimises and
Fast Refresh stops hot-swapping (the film is 1.4× over). Worth measuring with a build before doing
anything: if the film's module is part of the reload cost, splitting the generated file by act
(one module per part, imported by a thin index) is mechanical inside `tools/build-film-story.mjs` and
changes nothing else.

## 15. Make these checks so none of it comes back

Four checks, each one a failure the film would have caught for us:

1. **Take vs line** (`npm run test:film-voice`, new), two rules over the **built film's beats** (not the
   story data: `splitLine` splits a multi-take line between its takes by duration, so the text a take
   really covers is the slice the beat carries, and that is what its name has to match):
   * *Words*: the take's own words (its filename, speech tags like `-dryly-`/`-evenly-` dropped) must
     have something in common with its line. Flags the four takes in item 1, plus `342` (whose name
     shares no content word with the line at all). `343` slips through here only because its old words —
     "call", "go" — happen to occur in the new sentence.
   * *Length*: characters a second. Across the film's 329 takes on lines of 20 characters or more the
     rate is 5.7–19.3 with a median of 13.0 — **except `343` at 25.7**, the known audio/subtitle
     mismatch. A band of 5–22 a second flags that one take and nothing else.
2. **Rig vs picture** (`npm run test:film-depth`, extend): a `pictureSha256` per rigged picture in
   `docs/film-depth-layers.json`; fail when the picture on disk no longer hashes to it. Catches item 4
   and every future retake of a depth shot (it would have caught 179 on 11 October too).
3. **Plate resolution** (new, or part of `npm run check`): every picture the film shows must be
   1920×1080, with an explicit, documented exception list. Items 3's fifteen plates are the list on day
   one; the point is that sixteen can never quietly become seventeen.
4. **Counts, printed by the builder**: scenes, nodes, pictures, endings, shake blocks, depth rigs. The
   docs currently say "187 scenes" and "365 pictures" where the data says 201 nodes and 546 pictures, and
   that drift is how a lost instruction (item 2) survives in the notes.

## 16. While you are in there: a documentation drift to fix in `FILM.md`

- *"The film has 187 scenes"* (13 October) vs **201** scene nodes in the built film.
- *"All 365 pictures play"* (9 October) vs **542** shots in the story data / **546** picture URLs in the
  built film.
- *"Shake cam off in the Hive escape"* (13 October handoff) vs the nine shake blocks in item 2.
- *"Twenty-eight empty locations with a map alone"* (10 October) vs **43** rigged pictures today, 26 of
  them map-only.
- The depth-camera section of `FILM.md` still lists `179-same-wood` among the fourteen shots with
  people, while its map was removed on 11 October and the file sits unused in
  `public/film/depth/s41/179-same-wood/`. A reader cannot tell whether that is intended.

None of this makes the film worse; it just means the next session has to re-derive what is true. One
"counts" line from the builder (item 15.4) plus a note in each section that has been overtaken would fix
the whole class.

---

## Suggested order of work

1. **One listen, then fix:** the four takes in item 1 (five minutes of checking each, then one
   re-record pass or a text revert) and the question in item 2 (is the Hive-escape shake wanted?).
2. **The two rig repairs:** re-cut `346-the-bulb-hums`'s layers from the current art (item 4), and set
   `depthSeconds` to 5–6 s on the eight shots in item 5.
3. **One configuration change worth a lot:** the film's own card nodes as `acts` (item 11) — title
   cards and a "where am I" chart, no engine work.
4. **The housekeeping that pays every build:** move `archive/`, `reviews/`, the retake sources and the
   raw music uploads from `public/` to `art/` (item 12), then look at the package size and the image
   picker.
5. **The four checks** (item 15) so 1–4 cannot silently return.
6. **Then the long passes:** the eighteen waiting depth shots (item 6), the dry interiors (item 7), the
   plate res-up batch (item 3), the scene-98 hand-off (item 8).

## What I could not check here

- **No suites, no build, no browser.** `node_modules` is absent in this checkout; `npm ci`, then
  `npm test`, `npm run test:film-backend`, `npm run test:film-depth`, `npm run check` are the ones that
  would confirm items 15 and the current health of the tree. (The 13 October review recorded
  `Black Mass Bride` media checks failing in this checkout because its files are not here.)
- **No listening.** The six takes in item 1 are inferred from their filenames and durations; each is
  under six seconds and wants an ear before anyone re-records anything.
- **No watching.** Every claim about pacing, movement and silence is arithmetic over the film's own data
  (`src/film/story.json`, `studio-edits.json`, the built film), not a viewing.
- **Picture checks were spot checks:** I opened `s20/346-the-bulb-hums.jpg` and its plate, and read
  image headers for all 1,257 files under `public/film/img`; the other 1,256 pictures were not looked at.
