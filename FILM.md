# Nobody's Witness on the Scarlet Reel engine

The catalogue (`src/data/stories.ts`) holds one story, the film. It is generated, not hand-written:

    node tools/build-film-story.mjs     # src/film/story.json -> src/data/nobodysWitnessFilm.ts + public/film/*

One scene node per film scene; every shot is a dialogue beat's background, so the dialogue player, Studio flowchart and saves work unchanged. The prologue (Kaneko over the Hive) is the first node and the credits (over `nobodys-witness.mp3`) the ending. `src/film/story.json` is the same data the standalone visual novel on `main` is built from. The other stories are untouched in `src/data/`; import them in `stories.ts` to bring one back.




## Shots 230, 293, 294 and 295: Kato Rental Lockers and the Ueno arches (21 October 2026)

* **230 "No questions" (scene 63)** — Jack opens upper locker **114** and holds the taped kraft padded envelope and
  worn black notebook instead of the earlier draft's cardboard box; the faded `MONTHLY. YEARLY. / NO QUESTIONS.`
  sign above the door is unobstructed behind his head. 2848×1600. Previous take:
  `archive/s63/230-no-questions--v1.jpg`.
* **293 "The sedan waits" (scene 63A)** — Jack walks across the wet pavement toward the open wooden doorway in the
  brick arch on the left; behind him down the rain-slicked street, the black sedan now has its headlights switched on
  and a dark interior showing the silhouettes of a driver and front passenger. 1672×941. Previous take:
  `archive/s63a/293-the-sedan-waits--v2.jpg`.
* **294 "Through the parlour" (scene 63A)** — overhead lighting dimmed under the brick vault and both flanking banks
  rebuilt as brightly lit Japanese pachinko machines casting colourful machine glow across the players and the aisle.
  1672×941. Previous take: `archive/s63a/294-through-the-parlour--v2.jpg`.
* **295 "They give up" (scene 63A)** — reframed over Jack's shoulder as he peeks cautiously around the recessed back
  doorway down the wet alley toward the street, where the two men in dark coats stand beside the black car shrugging
  toward the driver that they have lost him. 1672×941. Previous take: `archive/s63a/295-they-give-up--v2.jpg`.

Nothing was resized — each picture is installed byte for byte at the size the generator produced, and the generated
sources are kept in `public/film/img/retakes_2026_10_21/`. Story paths are unchanged so no rebuild was needed; sync
all four back into PlayFrame before the next `node tools/build-film-story.mjs` run.

## Shots 445, 90-05 and 139; and two new depth maps (21 October 2026)

* **445 "Exactly where it was" (scene 25)** — the page Jack sets down now carries **the same drawing as
  `s84/520-excuse-me.jpg`**: the counter seen from the floor, the crate of bottles, the two pairs of shoes,
  the stool going over, the outflung hand, 1:07 in the corner, and EXCUSE ME in block capitals. 1536×1024.
  Previous take: `archive/s25/445-exactly-where-it-was--v1.jpg`.
* **90-05 "Through the wardrobe" (scene 90)** — Vera had lost her face between takes. Remade against the
  film's own approved Vera (`s10/164-depends-whos-calling.jpg`, `s4/386-at-the-window.jpg` and the escape's
  style sheet): the same woman, shoulder-length dark-blonde hair, dark olive-charcoal coat over the cream
  knit, edging sideways between the hanging coats. 2848×1600. Previous take:
  `archive/thehiveescape/s90/90-05-through-the-wardrobe--v1.jpg`.
* **139 "Only tea" (scene 94)** — the shot is now **over Ishida's shoulder, looking away from the police
  station** (which is behind the camera): the sedan at the far kerb, its near rear door open, **Kurose on the
  far side of the back seat**, and **a driver at the wheel**, right-hand drive. 2752×1536. Previous take:
  `archive/s94/139-only-tea--v2.jpg`.

**Two new depth maps.** `73-05-toward-the-tracks` (1920×1080) and `75-02-the-empty-lounge` (2730×1536) now
play with the depth-map camera, on a truck move at 0.35 over 16 s. They were drawn at random (seed 20261021)
from the 99 pictures the film plays that are at least 1920 wide, have nobody in shot and had no map yet; the
third in the draw, `212-stay-whatever-you-hear`, was left out because its caption is a spoken line and there
is probably somebody in the frame.

The maps were made with **Depth Anything v1 ViT-S (ONNX)** — no torch, no HuggingFace, which this machine
cannot reach — by a new **`tools/make-depth-map-onnx.py`**: it writes the map at the picture's exact size,
grayscale, white = near, smoothed as the other depth-only maps are, registers it in
`docs/film-depth-layers.json` and, with `--wire`, adds the map and the move to the picture's `pictureLook`
entry in `src/film/studio-edits.json`. It only offers pictures with nobody in them: a map on its own
stretches a person as the camera moves, and those want cut-outs and a plate first.
`node tools/build-film-story.mjs` was re-run, and `npm run test:film-depth` (and the 171 film-backend checks)
pass. **The two maps have not been eyeballed against their stills** — that is the next thing to do, and the
note in the registry says so.

**Correction (22 October 2026): 73-05 is not empty.** Vera is in it, running away down the middle of the street, and a
depth map alone would stretch her on the truck move. She is now a cut-out (BiRefNet) with the street painted in behind
her (LaMa), made by `tools/make-depth-layers.py` with the models listed in its header, and 73-05 is in `peopleInShot`.
Frames of the move (`tools/depth-frames.mjs`) show her moving as one piece. The shot is on screen about 5 s of its
16 s move. 75-02 (the empty lounge) is empty and keeps its map.

## Picture pass: 243, 336, 346 and 352 (21 October 2026)

* **243 "The box" (scene 11)** — rebuilt, this time as an **edit of the film's own `s10/413-open-and-shut.jpg`**, so the
  room, the desk and the camera are the shot before it in the same office. Jack has left the chair and stands **behind the
  end of the desk**, bent, lifting the cardboard box out of the grey steel cupboard under the window: dust on the lid,
  files packed tight behind the empty space. The television shows static. 2816×1584. Previous takes:
  `archive/s11/243-the-box--v1.jpg`, `--v2.jpg`, and the frame it replaces, `--v3.jpg`.
* **336 "The lighter" (scene 14A)** — the hatchback now sits **parked along the kerb, parallel with the road and angled a
  few degrees nose-in**, so it reads as a car standing correctly to the street, the wet road running past it and away down
  the street. Jack at the wound-down window with the old steel lighter open and unlit; Vera, both hands on the wheel.
  1920×1072. Previous take: `archive/s14a/336-the-lighter--v2.jpg`.
* **346 "The bulb hums" (scene 20)** — remade against the storeroom's own pictures (`344`, `345`, `371`): Mara on the
  futon with the sketchbook, Jack low on a flour sack, one bare bulb, nothing else. **Its depth rig is gone** —
  `public/film/depth/s20/346-the-bulb-hums/` deleted and the entry removed from `docs/film-depth-layers.json` (both
  `pictures` and `peopleInShot`); the rig was cut from older art and no longer matched the frame (see the review of
  13 October). The shot now plays as a still, like any picture without a map. 1672×941. Previous take:
  `archive/s20/346-the-bulb-hums--v1.jpg`.
* **352 "The address" (scene 23)** — the napkin was scribble. Remade: it lies flat in the lantern light with a short line
  of **neat, evenly spaced longhand**, a carefully written address, and Ishida slides it across the table with two
  fingers, nothing in his face. 1360×768. Previous take: `archive/s23/352-the-address--v1.jpg`.

**Sizes.** Nothing was resized — each file is installed at the size it came out at: 243 2816×1584, 336 1920×1072,
164 and 346 1672×941, 352 1360×768. Three are now below the 1920×1080 the rest of the film uses; regenerate any that
look soft on screen.

No builder run was needed — every path is unchanged and `src/data/nobodysWitnessFilm.ts` already points at them.
All five are local replacements in this checkout; sync them into PlayFrame before the next `build-film-story.mjs`.

## Shot 164, "Depends who's calling": the office rebuilt (21 October 2026)

Scene 10's **164** ("A knock on the frosted glass. Vera comes in, wet, the blue umbrella dripping.") was thrown out and
made again. The director's notes on the way: the first pass put **the door in the wrong place**, and the second had
**the desk at the wrong orientation to the shots around it**. The frame is now built against the scene's own pictures —
`s10/415-four-days.jpg` for the desk's position and orientation, `s11/243-the-box.jpg` for the grey steel cupboard
under the blinded window, `s10/417-at-the-door.jpg` for where the frosted-glass door sits — with Jack turned in his
chair toward the door, his face readable.

* `public/film/img/s10/164-depends-whos-calling.jpg` is the new frame, 1920×1080 (generated 1672×941, centre-cropped
  to 16:9 and enlarged, never shrunk).
* The frame it replaces is `public/film/img/archive/s10/164-depends-whos-calling--v2.jpg`; the older take was already
  `archive/s10/164-depends-whos-calling--v1.jpg`. The retake as generated is
  `public/film/img/retakes_2026_10_21/164-depends-whos-calling-r1.jpg`.
* Story data and asset URLs are unchanged, so no builder run was needed. 164 has no depth map; its `pictureLook`
  still puts a warm lamp glow at 42%/52% and the television's cool flicker at 78%/24% — move those two if the new
  frame has the lamp or the set elsewhere.
* Local replacement in this checkout — sync it into PlayFrame before the next `node tools/build-film-story.mjs`.

## The news reader on Vera's television (shot 386, 21 October 2026)

Scene 4, **386 "At the window"** ("The old television murmurs to itself.") is the beat the NEWS REPORTER's line
plays over, so the set now matches the words: the old boxy CRT in the corner shows **a Japanese male news
reader in his forties, dark suit and tie, behind a news desk, reading the evening news**, a small
Japanese-language caption bar along the bottom of the screen. Nothing else in the frame changed — the
difference against the previous picture is confined to the television (bottom right).

* `public/film/img/s4/386-at-the-window.jpg` is the new frame, 1920×1080.
* Previous take kept at `public/film/img/archive/s4/386-at-the-window-pre-reporter.jpg`;
  the retake as generated is `public/film/img/retakes_2026_10_21/386-at-the-window-r1.jpg`.
* Story data and asset URLs are unchanged (the generated `src/data/nobodysWitnessFilm.ts` already points at
  this path, so no builder run was needed). 386 carries no depth map and no `pictureLook`.
* Local replacement in this checkout — sync it into PlayFrame through its importer before the next
  `node tools/build-film-story.mjs`, which recopies `public/img` from that source.

## Scenes 1–2 and the opening titles: the director's animatic notes (21 October 2026)

From the animatic export of scenes 1–2 (beat numbers are the export's joined marks). All done; nobody has watched the new export yet:
- **Scene 1, new beat at SC 1 · BEAT 22:** `s1/11-sakai-mid-fall.jpg` (made for this; Sakai matched to `09-old-man-stops`, `07-old-man` and `14-she-kneels` — grey flat cap, beige raincoat, mid-fall, both masked men pointing suppressed pistols at him). It takes "A suppressed SHOT." and the `suppressed-shot` sound; `10-the-shot` now plays on "Flat and ordinary, like a door closing. The old man folds onto the street."
- **Scene 1, sound:** the thud the director heard as a door shutting is off the fold; a car door shuts instead on "They walk back to the sedan" (SC 1 · BEAT 26, `car-door-heavy`), before the car pulls away. The old `fall-street` step is out of `story.json`.
- **Scene 1, Mara at SC 1 · BEAT 30:** "Hold on, I'll call an ambulance." (the note's "I'll can" read as "I'll call"). No take yet: `takePending` in `story.json`, shown silent like scene 84's lines.
- **Scene 2:** the first two picture beats both play `s2/20-the-journalist.jpg`; the picture files of the door-opening and behind-the-counter beats are swapped, so the men-outside frame (`23-behind-the-counter-s2new2`) plays as the door opens and the stepping-in frame (`25-two-pairs-of-shoes-v2`) plays on "Mara is behind the counter…" — by then the men are coming inside. `24-from-the-floor` (the men inside) now plays on "Two shots."
- **Scene 2, dialogue:** after "He knows her name." the journalist says "Are you okay? Where's Sakai?" (new line, `takePending`, shown silent; "Miss Voss?" stays before it), and his later "Where is he?" is out — picture, words and take. Note: Mara's scene 25 recall still quotes the old words ("the man said, 'Where is he?'"); it wants rewording when its take is next touched.
- **Opening titles:** the montage is twelve stills, not six (the three `montage/` plates m1–m3, the backstreet, the elevated line and the empty lane added between the old six). It still loops inside the 110 s titles.

**Why the marks did not match, fixed the same day:** the animatic joins short action lines into one caption before it plays, and the corner mark counted those joined captions, while the Studio (and the builder) number the authored beats — so the two lists drift apart wherever lines join (scene 1: 43 authored beats, 37 captions; the ambulance line is beat 36 in the scene but showed as BEAT 30). The mark now shows the authored number, and a range (**BEAT 12–13**) where one caption covers two beats; the scene heading no longer borrows BEAT 1 (it reads **BEAT –**). Numbers on the next export will therefore differ from the last one's wherever lines join — that is the fix, not a new drift. `npm run test:film-backend` pins it.

## The director's notes of 20 October 2026

`docs/director-notes-2026-10-20.md` is the list. Done in the film:
- the payphone heard from the inn's back yard is distant (`phone-distant.mp3`);
- the fire door in 63A is a push-bar door, no longer a bang that sounds like a shot (`fire-door-push-bar.mp3`, a new ElevenLabs take);
- *Bad Guy* plays to its own end (`songRunsOn` on the soundtrack);
- "He takes it." is out of scene 61;
- Daniel's diary in 79 no longer mentions Vera (the take is cut before "Tell Vera", as a new file).

Later the same day:
- **Scene 74:** the wrong Jack (74-05, 74-10/74-11) and the umbrella reflection (74-18) were replaced by pictures already made. The
  run now plays 28 new pictures, 15 shipped and 5 earlier takes.
- **Scene 80:** after "I have never killed anyone…", Jack hits him (*"He does."*, with `punches-chair.mp3`). Ishida waves the
  young detectives back and still asks for Sakai's thing.
- **Picture slots:** the four new pictures of scene 80 are slots that wait for their files, in `studio-edits.json` → `pictures`
  with `"pending": true` and a `brief`. The builder never puts up a picture that is not on disk, and lists the slots still
  waiting.

- **Scene 83:** "It's just a face." plays the archived take of 111 with Vera's navy coat on (`s83_picks/111-just-a-face-v2.jpg`).
  The director had noted her missing coat.

Retake briefs for the plaza model (and its style sheet), the photo on Harada's desk, Mrs. Sakai's empty room, Vera leaving the
lounge, Jack's hands (74-03), the notebook Vera holds up in 83 (112: it should be a photocopied page) and scene 80's pictures are
in the same file. None is being generated for now. **`docs/image-brief-2026-10-20.md`** gathers them, and the picks review's,
into one ordered brief to hand to an image generator. It puts every retake in `public/film/img/retakes_2026_10_20/` and the
plaza model in its glass case. Swap the pictures in when they come back; scene 80's come up by themselves.

**Scene 84 (21 October):** Jack's "Three feet away." is now "Right behind the curtain.", and his confession goes on "I trusted him.
I'm so sorry." The takes wait for credits. Until then both lines carry `takePending` in `story.json` and are shown silent (the
build lists them); notes 16 and 17 have what to record.

Kaneko's three strikes on the pipe in the raid (86-02) still have no sound. Six ElevenLabs takes were too soft or read as a
siren, and the account ran out of credits; the takes and the next prompt are under 15 in the notes.

## The Scarlet Reel logo opens the film (22 October 2026)

The director's 10 s "Created with SCARLET ReeL" clip now plays before the whole film, then hands over to scene 1.
- **The node:** `nw_logo`, made by `tools/build-film-story.mjs` before wherever the film starts (it becomes `startSceneId`), a
  cutscene with the clip as its background and nothing else; it moves on after 9.9 s.
- **The files:** the upload is kept as `public/film/video/scarlet-reel-logo-original.mp4` (moved from the repo's top level,
  unchanged). The node plays a silent copy (`scarlet-reel-logo.mp4`, stream-copied) with a VP9 `.webm` beside it for
  browsers without H.264 (the exporter's Chromium among them), and the clip's sound as its music
  (`public/film/audio/scarlet-reel-logo.mp3`), because the animatic exporter rebuilds sound only from `<audio>` elements.
  Picture and sound start together (measured about 40 ms apart), and an export carries both.
- **The engine (`isVideoOnlyScene` in `src/logic.ts`):** a cutscene whose background is a video, with no words, lines or
  choices, that moves on by itself shows only its clip: no panel or Continue button, no checkpoint (so a reload does not
  replay it), and the clip plays once and holds its last frame instead of looping. A scene background video now also falls
  back to a `.webm` beside its `.mp4`, as beat videos already did.
- **What changed for tests and exports:** the film's play order starts `nw_logo`, `nw_s1`; a whole-film export starts on
  the logo; `--from nw_s1` skips it.

## Scenes 1 and 2: the cuts land on the music's beat (22 October 2026)

The director asked for the pictures in scenes 1 and 2 to change with the beat of the song under them
(`glimmering-haze.mp3`), but not on every beat: that would feel mechanical. So when the film plays itself (an animatic,
or the player's Auto) **only a cut to a new picture waits for the next beat** of the song; lines and descriptions on the
same picture keep their own timing, and clicking through is unchanged. The wait is never more than one beat (0.67 s).

- **Where:** `studio-edits.json` → `musicSync` (`scenes`, `bpm`, `firstBeat`) puts a `musicSync` field on those scenes;
  the player (`nextBeatIsCut` and `untilNextMusicBeat` in `src/game/animatic.tsx`) reads the music element's own position,
  which the animatic exporter keeps on its clock, so an export lands the cuts on the beat too. The Studio's scene panel has
  a "Music sync" field (tempo and first beat) for any scene.
- **The song's beat:** 89.27 beats a minute, first beat at 0.645 s, measured from the file's onsets. The grid fits the first
  45 s of the 60.4 s loop well; the last 15 s have no steady beat, so a cut there lands wherever the beat grid says, which
  sounds no different from before. The grid restarts each time the song loops.

## The envelope at dawn (scene 78): the director's picks (20 October 2026)

Scene 78's four shots were picked against their other versions (PlayFrame's 88, the archived first takes of 316, 89 and 90).
The director kept the film's own picture for all four. **Director's note on 316:** "wrong apartment should be end apartment at
door". The retake brief, and a note that 88's envelope is white where 316 and 89 show the brown one, are in
`docs/picks-review-2026-10-19.md`.

## The interview room (scene 6): the director's picks (20 October 2026)

Scene 6 was picked shot by shot against every earlier take of its 21 pictures (the archive and both repositories' git history;
the room has no reshoot set). The director kept the film's own picture everywhere but **55** ("I speak Japanese"), which now
plays the archived first take, cropped from 1912×800 to 16:9 at its centre and enlarged: `s6_picks/55-i-speak-japanese-v1.jpg`.
The camera move on it is the builder's own, as for any picture with no `pictureLook`. **Director's note on 408:** "vera wrong
colour hair" (the back of her head is dark brown there); the retake brief is in `docs/picks-review-2026-10-19.md`. A backend
check pins the pick. Nobody has watched it.

## What doesn't match in the five picked scenes (19 October 2026)

`docs/picks-review-2026-10-19.md` lists every continuity slip found after the picks below (the wrong Jack in two of Vera's
takes, shoes, the car changing sides, the split frame at Okada's door, lights left on in the raid, the men back outside in
scene 2…), each written as a retake brief for an image generator: the new file to make, the references to attach, the prompt
and how to wire it in. Eight captions that no longer said what their pictures show were rewritten; the table is at its top.

## Scene 2, the small bar: the director's picks (19 October 2026)

Scene 2 was picked shot by shot from every version of each picture: the film's own `s2/`, the two reshoots `s2_new/` and
`s2_new2/`, the archived takes and older versions from PlayFrame's history.
- **Kept as they were (4):** 19 (the bar), 20 (the journalist), 22 (not his business), 308 (the clip under the shelf).
- **Archived takes (3):** 21 v1 (Mara bursts in), 25 v2 (two pairs of shoes), 27 v1 (the notebook). 21 v1 and 27 v1 were
  1912×800, so the install tool cropped them to 16:9 at their centre (Mara at the door and the hand on the notebook stay in
  frame) and enlarged them to 1920×1080.
- **From `s2_new2` (4):** 23 (behind the counter), 24 (from the floor), 26 (the variety show), 28 (the blue glow). They are
  copied under their own names because `pictureLook` goes by file name, and the `s2/` pictures of the same names carry lights and
  a depth map placed for those plates.
- All seven are in `s2_picks/`; nothing in `s2/`, `s2_new2/` or the archive changed. `s2_new2`'s 29 (Mara gasps) is not used.
- **Mixed sets:** `s2_new2` is another bar layout with the old scene 1 Mara, and it stages the scene in its own order. 23–28 now
  come from it while 19–22 do not.
- **Director's note on 19:** "journalist should be sat here". Not done: the film's 19 is the empty bar. An older version in
  PlayFrame's history shows him at the counter.
- The change is in scene 2 of `src/film/story.json`; a backend check pins it. Nobody has watched it.

## The raid on the Hive: the director's picks (19 October 2026)

Scenes 85–92 (the raid run, "Coins Measure-Time") were picked position by position from every version of each picture: the
film's own, the `thehiveescape/` set, earlier takes (archive, git history, PlayFrame's older copies) and the `reshoot-1080`
remakes. Nothing was left out. **31 shots, about 3.1 s per silent shot** (was 22 captioned shots).
- **New pictures (11):**
  - **In place of the film's:** 86-03 for 121 (the shutter), 90-02 for 131 (the kitchen by candle), 90-08 for 380 (the shrine
    hatch), 91-03 for 133 (her hand in his on the rail).
  - **Added where the film had none:** 86-02 (three strikes), 86-04 (go now), 88-01 (every bulb out), 89-03 (the beam falls
    away), 90-03 (the dentist), 90-04 (the violin girl), 90-05 (the wardrobe).
- **Earlier versions (5)**, installed full size in `hive_raid_takes/`:
  - archived takes: 119 v1 (single file), 124 v1 (the repairman), 129 v1 (she lets him);
  - PlayFrame's own copies: 123 (fifty years) and 382 (the pipe gallery), which the film had since replaced.
- The rest stay as they were, the plank (381) as redrawn on 16 October among them.
- **Captions, sounds, camera:**
  - Each replacement takes over its picture's caption and sound cue. The shutter and kitchen captions now say what the new
    pictures show, and the added pictures have captions of their own.
  - The zoom-hold camera move carries over to 129, 131's, 133's and 382's replacements. The lights stay with the pictures they
    were placed on.
- The change is in scenes 85–92 of `src/film/story.json` and the "raid" soundtrack in `src/film/studio-edits.json`; a backend
  check pins the counts. Nobody has watched it with the song.

## Jack and Ishida in the car: the director's picks (19 October 2026)

Scene 61 (INT. ISHIDA'S CAR - NIGHT) was picked picture by picture against the `jack_ishida_new/` set (11 shots, right-hand
drive, one screen geography; its README has the reasoning). The director took two of them:
- **61-01 (under the expressway)** opens the scene in place of `s61/228-nine-oclock`, which had Jack behind the wheel and the
  two men looking at each other. 228's lights (`pictureLook`) belonged to that picture and no longer play.
- **61-02 (neither looks)** comes up on "Ishida behind the wheel. Jack in the passenger seat. Neither looks at the other."
- 481 to 484 stay, and the other nine new pictures are not used. Note: the kept pictures are left-hand drive and the new
  two are right-hand drive, so the car changes sides after the opening.
- **Director's note on 483 (eyes on the rain):** "needs character consistency" (Jack's hair is long and dark there, grey and
  swept back elsewhere). Not retaken yet.
- The change is two steps in scene 61 of `src/film/story.json`.
- Also: the Vera-run cut had split the paragraph the heels effect looked for, so that effect's `find` (studio-edits `sfx`) is
  now "In heels, in the red dress". It plays nothing in the run either way (the run's sounds are its `cues`); it only stops a
  build warning.

## Mara's service plays the director's picks (19 October 2026)

Scene 97A plays what the director picked, shot by shot, from every version of each shot: the service_new cut, the fourteen
stills of `art/mara-service/` as the film first installed them (`s97a/`), the director's uploads in `service/`, the set's
left-out takes and an extra never in the cut. Nothing was left out and one shot was added: **35 shots, about 5.4 s each** under
*What Made You, You*. `tools/service-cut.mjs` holds the cut (its header has the picks).
- **The director's own pictures (12):**
  - **From `s97a/` (10):** 557, 561, 562, 563, 564, 565, 566, 567, 568, 569. The 565 there is the picture as corrected on
    13 October (Vera, her mother, a standing man), not the first install made from `art/mara-service/07`.
  - **From `service/` (2):** 570 and 573, installed full size (enlarged to 1920×1080) as `s97a/570-before-he-kneels.jpg` and
    `s97a/573-her-mother-stays.jpg`.
- **576** plays `extras/mom-02` (left out on 17 October for its other room).
- **`extras/mom-03`** (her mother leaving, in her coat) is added after 573, so she goes only after she has stayed a while
  longer. Caption "Then she goes too, in her black coat."
- **Known differences between the pictures:**
  - 567 is one of the two stills with a split frame glued in.
  - 561 and 565 are near the same wide.
  - 570, 573 and mom-02 are in another room than the rest, and 573 has Vera in a cream sweater.
  - mom-03 is a warmer interior with a lane outside.
- Captions, the train over 569 and the song's timing are as before; no picture of the service has a depth map or a look of its
  own, so none carries over between same-named files.
- This is the film only: PlayFrame's board for 97A still lists 556–569 on the `s97a` pictures. Nobody has watched it with the song.

## Vera's night run plays the director's picks (19 October 2026)

Scenes 72 (from the song's cue) to 76 play what the director picked, picture by picture. Each of the 54 pictures of the
`vera_run_new/` set (made 18 October from the brief on branch `film-vera-run-brief`, `vera_run_new/BRIEF.md` there: one Vera,
one dress, one route, the crossing from scenes 27 and 62) was shown beside the picture the film played at that beat and that
picture's earlier takes, and the director chose one.
- **What plays:** 27 new pictures, 14 of the shipped ones and 8 earlier takes. Bad Guy carries 50 shots (the run and Jack's
  office), about 4.9 s per silent shot.
  - **Shipped pictures kept**, with the captions and sounds they had: `69-vera-runs`, `547-the-call-still-lit`,
    `549-the-crossing-chimes` (the crossing chime), `72-the-lost-heel` (the shoe splash), `74-twenty-metres-apart`, `501-one-shoe`,
    `502-why-didnt-you-tell-me`, `503-she-holds-on`, `73-two-small-figures`, `504-nobody-looks-down` (the train),
    `314-the-empty-crossing`, `82-on-the-floor`, `315-the-number-pressed`, `84-cries-without-a-sound`.
  - **Earlier takes**, in `vera_run_takes/`, one file per beat named `<beat>--<the take>.jpg` so each carries its own caption:
    69 v2 as she starts to run; PlayFrame's 70 (the version the film replaced on 13 October) on "Rain plasters her hair" and
    again on "Slipping. Stumbling."; 71 v2 at the vending machine; 74 v2 as she cries; 75 v2 for both blows; 76 v1 as she
    covers her face; 79 v1 for the Hive shut. Installed with `tools/install-film-picture.mjs` (all 1920×1080, so byte copies;
    the archive is untouched). They shake like the new picture of their beat; none has a depth map or lights, which stay with
    the pictures they were made from.
  - **No picture of its own:** the beat of `74-02` (Jack out of the dark). 74-01 holds, as an empty street held there before.
  - **502** comes up on "Why didn't you tell me?", as it always did, one line before the new set's beat for it.
  - The 27 new pictures not picked stay on disk.
- **The tool:** `tools/vera-run-cut.mjs` holds the picks (`PICKS`) and the kept shipped pictures' steps, captions and cues
  (`ORIGINALS`). It puts each picture in front of the screenplay beat it covers, so the voice takes stay where they were, and
  rewrites the "bad-guy" soundtrack's captions and sound cues for these scenes. Run it, then
  `FILM_SRC=/nonexistent node tools/build-film-story.mjs`.
- **Notes on what plays:** the director picked `72-02` (the phone lowers) with the note "phone facing wrong way"; `72-01`'s
  umbrella reads more white than pale blue. The new set's other slips from the brief (73-11 and 73-12 running right to left,
  74-11's bigger overpass, 74-16 mirrored) were not picked.
- **Media walker fix:** the credits montage's camera looks (`credits.montageLooks`) carry depth maps, and `visitStoryMediaFields`
  did not visit them. `80-the-machine-waits` is now only in the credits montage, so its map went unvisited (a Studio export
  would have left it behind). The walker visits them now; a backend check guards it.
- **Builder fix** (18 October): a node that continues a scene after a music cue now opens on its own first picture, or on the
  one showing when it began, not on the scene's last picture. That also fixes `nw_s20_b`, which opened on 371 before 192, and
  `nw_s65_b`, which opened on 277 (Vera leaving) before she had dressed.
- **Test fix** (18 October): the service's timing check now counts each node's fade-in. It had failed since the cut grew to 34
  pictures: the delays alone add up to 170 s of a run that plays about 190 s.
- This is the film only: PlayFrame's boards for 72 to 76 and the visual novel still have the shipped pictures. Nobody has
  watched the new run with the song.

## Mara's service plays the 34-shot cut (17 October 2026)

The director asked for more shots in the service so each still holds less of "What Made You, You". Scene 97A plays the
`service_new/` set, not the first `s97a/` stills: those had two glued split frames (560, 567), the same wide twice (561,
565) and no picture of her mother staying behind. `tools/service-cut.mjs` holds the whole 34-shot cut and writes the
shots that are on disk into scene 97A of `src/film/story.json` and the "service" soundtrack's captions. 15 shots play now
(about 12.6 s each), and every new picture slots in when it is uploaded (all 34: about 5.6 s each). The nineteen still to
make, with their prompts and what to attach, are in `public/film/img/service_new/README.md`, "The 34-shot cut".

The same day the director asked whether the cut made logical and visual sense, and it did not quite:
- 556 shows the blue umbrella at the door and 557 shows it still coming, so 557 now plays first.
- 568 shows Kaneko and Okada alone in an emptied room, so it now plays at the end.
- Two extras showed another room (`mom-02`) and another lane with a different face in the photograph (`mom-04`), so both are out.
- The three beats of the director's own stills in `service/` were missing. They are now in the cut: 571 as the director made
  it; 570, 572 and 573 to be redone in this room.
- The incense is lit before it is seen burning, and the train goes over once, at the end.

This is the film only: PlayFrame's board for 97A still lists 556–569 on the `s97a` pictures, and its branch's three
service lines (Jack over the photograph, Okada's umbrella, the circle) are not merged.

## Scene 1 plays the whole reshoot (17 October 2026)

The director: *"check scene 1 and make sure perfect"*. Since 15 October the film had played thirteen of the `s1_new` reshoot's
plates beside ten from the old set, and the two sets disagree: the old 328–333, 383 and 14–16 have another lane, its sides
mirrored (vending machine and barbershop swapped when looking out to the road), and a different Mara (curly hair, leather
jacket). **The other ten `s1_new` plates are now in `public/film/img/s1/` too** (328, 329, 330, 331, 332, 333, 383, 14, 15,
16), so all 23 pictures are one set: the same lane both ways (barbershop left, vending machine right looking in), the same
Mara (denim jacket, the red clip, the gold watch, the brown bag) and the same Sakai. The old plates are in git history.

* **Lights and flares moved onto the new pictures** (`pictureLook`): 02's vending-machine glow and lit window, 17's bar
  glow and vending machine (both were still placed on the old plates after the 15 October swap), 329's bar sign and street
  lamp, 383's vending machine and lamp, and the sedan's headlight flares in 332 and 333.
* **383's depth move is off**: its map was made from the old plate (rule 1). 329 and 332 had no depth entry. Their old maps
  stay in `public/film/depth/s1/` and want remaking from the new plates with `tools/make-depth-layers.py`, like 01 and 02.
* **Shot 14's lip-sync clip is off** (`src/film/clips.json`): it was made from the old still and showed the other Mara; the
  line plays over the new still until a clip is made from it. The video files stay in `public/film/video/`.
* **Built from this repo's own media** (`FILM_SRC=/nonexistent node tools/build-film-story.mjs`): a build with the visual
  novel's checkout next door copies its `public/img` over `public/film/img` and would put the old scene 1 plates back.

**Installing a retake:** `FFMPEG=... node tools/install-film-picture.mjs <source> public/film/img/s1/<name>.jpg`
(crops to 16:9, never downscales, archives the old picture; CLAUDE.md, "Pictures are never downscaled").

**Still to fix, needs image credits (the ElevenLabs account has 238; a referenced frame costs 433):**
* ~~**04-mara-phone**~~ done 17 October: the director's retake (1536×1024, cropped to 16:9 and enlarged) has her
  eyes down and the call screen reading VERA. Her gaze reads down rather than squarely on the screen, and the phone's
  glow does not light her face from below. Previous take `archive/s1/04-mara-phone--v4.jpg`.
* ~~**328-the-scrap**~~ done 17 October: the director's second, larger retake (1672×941), "just listen." underlined
  twice and the watch on its thin brown strap as the props sheet has it (the first retake, 1020×572, had a gold
  bracelet; it is `archive/s1/328-the-scrap--v2.jpg`, the take before it `--v1`). The hands read a little older than 24.
* **Mara's v2 face (17 October):** `04-mara-phone`, `330-the-red-clip` and `14-she-kneels` are the director's retakes
  against the v2 sheet (`s1_new/style-sheets/mara-voss.jpg`, `refs_v2/`), installed from `s1_retakes/` byte for byte
  (14 at its full 2730×1536). Earlier takes: `archive/s1/04-mara-phone--v5.jpg`, `330-the-red-clip--v1.jpg`,
  `14-she-kneels--v4.jpg`. Still to redo for her hair: `03-mara-walks`, `329-the-lane-the-watch`.
* **14**: a new lip-sync clip from the new still.


## The plank, redrawn (16 October 2026)

The director: *"A plank across the gap, hauled in after — change the image, should have a Japanese man holding the plank while Jack waits for Vera to pass."* `public/film/img/s90/381-the-plank.jpg` is remade from the old picture (same framing, rain and balconies): a Japanese Hive resident in the work vest braces the near end, Vera crosses in the blue coat, and Jack waits on the far balcony with a hand out for hers. The file keeps its number and name, so the raid run, its caption and `pictureLook` are untouched. **Note for a PlayFrame re-import:** shot 381 there still has the old picture; the build copies `public/img` over the top when the visual novel checkout is next door, which would bring the old one back.

## Hounds plays once and runs on past the raid (16 October 2026)

The director: *"hounds plays only once, no loop, then continue playing through; it should finish anyway before Vera's apartment."* The inn raid cutscene no longer stretches its shots to the song: `songRunsOn: true` on the `inn-raid` entry in `src/film/studio-edits.json` → `cutscenes`. The 35 shots now play at their own pace (about 87 s), *Hounds* (106 s, `musicLoop: false`, as before) keeps playing under **50, Hand starts to shake** and **51, The model, corrected** and ends by itself; scene 50 no longer fades it. **52, Vera's apartment** starts *Dark Hills Blues* as before, so a fast reader who gets there first hears a crossfade rather than a cut. Builder flag in `tools/build-film-story.mjs`; backend checks.

## You Never Call at the inn, the lullaby louder, the rice goes cold (16 October 2026)

The director's **You Never Call** (`public/film/audio/You Never Call (2).mp3`, 3:25, here `you-never-call.mp3`): *"needs to go somewhere, can go between 3 scenes max, you decide."* It takes the longest near‑wordless stretch the film had left: it starts on **35, The pink payphone** (level 0.5, `musicLoop: false`, 2 s in), runs under **36, Come back safe anyway** (ducked under the call) and **37, The keys are always in it**, and **38, Four black sedans** cuts it dead (`musicMode: "none"`, 0.4 s). *Hounds* follows on 39 as before, so the sedans sit in one scene of silence between the two songs. The run is shorter than the song; it is meant to be cut, not finished. `scenes` edits in `src/film/studio-edits.json`; backend checks.

**Mara's lullaby** (scene 20) was a tad too quiet: `musicLevel` 0.35 → 0.5 (`CUE_FIELDS.lullaby` in `tools/build-film-story.mjs`).

**Scene 25, The number 114:** the beat *"The rice goes cold in Mara's lap. They talk quietly…"* has a picture of its own now, Jack and Mara under the bulb, made here from shots 344 and 444 (`public/film/img/s25/the-rice-goes-cold.jpg`, not a PlayFrame shot, so no number). New Studio edit `pictures: [{ scene, find, file }]` puts a picture made in this repo on the beat whose text contains `find`, the same way `sfx` places a sound; a rebuild keeps it.

Also fixed: a Studio **Play from here** (the in-place playtest) primed the story's *start* scene's track inside the click, so *Glimmering Haze* started on every mid-film playtest and faded out when the entered scene found the stray primer. `play()` in `src/App.tsx` now primes the entered scene's music.

## Newsroom staff restored, Mara's lullaby, complete closing song (16 October 2026)

The “empty” newsroom meant **without Jack**, not without staff: `new-empty-newsroom.png` is corrected from the original still to keep the editor and reporters at their desks and leave Jack's visitor chair empty.

Imported `public/film/audio/Maras Lullaby.mp3` from main. It plays once, quietly, starting at the red bird clip/sketchbook reveal in scene 20, and fades out before “Silence. The bulb hums.” The two music cues split scene 20 into three linked nodes; the original still and bulb light remain, with no depth cutouts.

The final song is **The Show**, 217.44 seconds (MP3 metadata). Its scene-100 and credits entries now both have `musicLoop: false`. The end credits have an explicit **218-second minimum hold**, replacing the shorter card-roll clock: this gives the song time to finish even when exporting only the credits. A whole-film run keeps the existing song from scene 100 without restarting it, so it may finish before that hold expires. The exporter already honours `autoAdvanceDelaySeconds`, as does the player. No export render was run here.

## Newsroom entrance and song hand-off (16 October 2026)

Scene 82 now opens on `s82/new-empty-newsroom.png`, an empty-office version of the newsroom, rather than showing Jack seated before he arrives. A new walking still, `new-jack-walks-in-4.png`, plays on “He reaches the glass office without slowing.” before the cassette scene. Both are AI-generated from the existing newsroom stills; neither uses the old plate's depth layers. The source shot sequence is in `src/film/story.json`.

Baby Fool still starts once in 82 (`musicLoop: false`), continues unchanged through **82A, The notebook photocopied**, and fades out over 3 seconds on entry to 83, before the Kurose meeting. The hand-off overrides live in `studio-edits.json`; backend checks guard the two pictures and the music boundary. Mara's newly uploaded lullaby was not located at this point; see the later correction above.

Checked: film backend (114 checks), film depth (all passed). Not watched in sequence.

## The new backstreet, no slow pan, one grade, no shake in scenes 1 and 2 (15 October 2026, the director)

* **Scene 1's reshoot is in the film — thirteen of its twenty-three plates.** `public/film/img/s1_new/` (the 14 October
  reshoot; same filenames as `s1/`, so the sets swap one for one) is copied over `public/film/img/s1/` for shots
  **1–13 and 17–18**: `01-backstreet`, `02-vending`, `03-mara-walks`, `04-mara-phone`, `05-phone-off`,
  `06-barbershop-doorway`, `07-old-man`, `09-old-man-stops`, `10-the-shot`, `12-masked-man-radio`,
  `13-taillights-gone`, `17-she-runs`, `18-the-flashlight`. Nothing else in `s1/` changed (328, 329, 330, 331, 332,
  333, 383 and 14/15/16 stay the old plates — 14 keeps the still its `14-lipsync.mp4` clip was made from). The old
  plates are in git; `s1_new/` keeps its README, style sheets and contact sheet for the rest.
* **Two depth maps no longer fit and are switched off.** `01-backstreet` and `02-vending` had depth maps made from the
  old plates (`public/film/depth/s1/…`), so the 2.5D camera would warp the new picture against the old shape
  (CLAUDE.md rule 1). Their depth entries are out of `src/film/studio-edits.json` (`pictureLook`) — the shots hold
  still — until new maps are made from the new plates with `tools/make-depth-layers.py` (`docs/depth-camera.md`).
  `329-the-lane-the-watch` and `383-the-empty-lane` also have maps from the old plates but were not swapped, so they
  are untouched and still play.
* **No slow pan, anywhere.** The builder's last pass (`noSlowPan` in `tools/build-film-story.mjs`) turns every
  `mode: "pan"` into `"static"` on every scene, every beat and every credits-montage look, after the Studio edits.
  `camera()` no longer hands out a pan either (its rotation is push, push, hold, dolly) and no longer writes
  `panDistance`/`panDirection`. The zoom-to-subject (249 blocks), the rail dolly (118), the four vertigo dolly-zooms
  and the depth-map camera are their own moves and stay.
* **One grade over the film: Midnight Teal — Lab Cold** (`midnightTeal`, the same last pass; preset
  `"midnight-teal"`). Scene and beat alike, whatever a picture's look says: the five warm-photograph beats
  (`35-the-photograph`, `165-face-up`, `166-by-its-edges`, `167-two-men-laughing`, `244-daniel-voss-41`, all
  `spielberg-golden`) and the nine ending beats in 98/99A (`nolan-imax`) were graded differently until now. The three
  inn-raid scenes that already were teal (19–21) are unchanged in effect. All 577 camera blocks carry it (573
  scene/beat cinematics + the 4 credits-montage looks).
* **No handheld shake in scenes 1 and 2** (`noShake`, `nw_s1`/`nw_s2` only): the four beats that had it —
  `10-the-shot` (0.3), `17-she-runs` (0.2), `21-mara-bursts-in` (0.2), `26-the-variety-show` (0.3) — hold still
  instead. The cut into `10-the-shot` (a "zoom" background transition) is not a shake and stays, as does every shake
  elsewhere (the inn raid, the songs, the Hive escape: 36 shake blocks left).
* **Checked:** `npm run test:film-depth` (all checks passed), `npm run test:film-backend` (111 checks),
  `npm run test:validator` (32 passed, 0 failed), `npm run check` (all 2,612 story assets present). Nobody has watched
  the new scene 1 in sequence.

## A music fade now always lands, even when no frame is drawn (13 October 2026, review)

Reported while reviewing the day's notes: *"song in scene one loops throughout movie but should end after scene 2."* The cue itself was right — Glimmering Haze (61 s) on scenes 1 and 2 only, `musicLoop: true`, replaced by the title song on the credits node — but the **fade that was supposed to take it out never finished**. The fade was a `requestAnimationFrame` loop on the old element's `.volume`, and the music code pauses and releases that element from the ramp's completion callback. Frames stop when the page stops drawing (a hidden tab, a minimised window, a locked screen) and slow down on a busy machine, so the ramp stalled, `onDone` never ran and the **looping** cue played on under the film (and the incoming track's fade-up stalled at 0 too, on the same hidden page).

The fade engine is now `src/game/audioFade.ts`: the same equal-power curves and the same mixer behaviour, plus a wall-clock deadline (`ms` + one frame of slack) that settles the ramp, and a `visibilitychange` hook that settles every ramp in flight the moment the page is hidden. `fadeAudio`, `isFading` and `MUSIC_FADE_MS` are imported into `Game.tsx` from there. `npm run test:engine` gained six checks ("Music fades land without a frame"): a ramp with no frames at all, the hidden-page settle, an ordinary frame-driven ramp, and a cancelled ramp. The harness that proved the film-level hand-off (`scripts/.tmp-music-trace/`, a hidden-tab emulation that mounts the real player on the real film) is a throwaway; the checks in the suite are not.

## "What Made You, You" carries Mara's service (13 October 2026, later)

The director: *"song for service what made you,you.mp3"* (uploaded as `public/film/audio/What Made You, You (2).mp3`, 3:19; the build copies it from the visual novel as `what-made-you-you.mp3`). Scene 97A plays hands-off for the song's length, like the "Bad Guy" run: a `service` soundtrack in `src/film/studio-edits.json`, the fourteen stills each about 13.5 s with a short caption (the last split in two, the train passing over it), 191 s of the song's 196, and the rooftop (98) fades it out. The visual novel plays the same song through 97A (nobodys-witness#36). Backend check 17. Nobody has watched it with the song.

## The rooftop rewritten, "He left a note.", and Mara's service (13 October 2026)

Re-imported from PlayFrame (sigooding/PlayFrame#118, through nobodys-witness#35). **Scene 98** is the director's rewrite: her mother flying home with Mara, Jack's statement on Monday, Ishida's note, the clip, the promise kept, and Vera staying. Its twelve new lines play with their takes, and the train effects still land on their lines. **Scene 96** ends "He left a note." **Scene 97A, Mara's service**, is new and silent, between 96 and 98: the director's fourteen stills from `art/mara-service/` (PlayFrame shots 556–569) under the screenplay's stage directions, with the Hive bed under it. No song was added to it. The film has 187 scenes. Nobody has watched the new scene in sequence.

## Opening titles 1:50; no film grade, no light shafts; scenes 1 and 2 always first (12 October 2026, evening)

* **Opening titles:** 110 s (1 min 50 s, `nw_title.autoAdvanceDelaySeconds` in `src/film/studio-edits.json`), down from the 3:53 song. The card roll is 27.6 s and the montage loops under the rest; the song is faded out by the prologue's 3 s fade, so it is cut at 1:50, not played to its end. The delay may only stretch the roll, never cut it short (`static check 14`).
* **No 35mm film grade and no volumetric light shafts, anywhere.** The builder's last pass (`noGradeNoShafts` in `tools/build-film-story.mjs`) sets `filmGrade: false` and `volumetricShafts: false` on every scene's and every beat's look, whatever a Studio edit or a picture's look says; the three scenes (16, 55, 69) that switched shafts up are gone from `studio-edits.json`. The neon-noir colour tint (`colorGrade`), the light glows and the credits' gate weave stay. The engine still has both effects for other stories (a plate flickers a veil, never its own opacity).
* **Scenes 1 and 2 first.** On a clean browser, and in the exporter, the film has opened on scene 1, scene 2, the titles, the prologue and scene 3 since 7 October (`static check 13` pins the order). Two things in a browser could still send it to the titles, both fixed:
  * **A saved Studio copy of an older build.** The Studio writes a draft the moment the film is opened in it, and the newsstand plays a saved copy in preference to the built-in, so a copy made before 7 October (when the start moved from the titles to scene 1) kept playing the old order however often the film was rebuilt. The builder now stamps each build (`Story.builtinRevision`); the newsstand shows a notice when the browser holds a copy with another stamp, with **Use the current film** (the copy is kept under `scarlet-studio-backup-<time>-…`) and **Keep my saved copy**. A copy the Studio saves from the current build raises no notice (browser spec, "a saved copy of the film from an older build is flagged").
  * **The export dialog read that copy too.** It listed the saved copy's scenes while the exporter renders the shipped film in a browser of its own, so "whole film" could be sent as `--from nw_title`. The dialog now lists the shipped film, and a whole-film job passes no `--from` at all (the exporter starts where the film starts).
* **A reload never resumes into a credits roll.** The automatic checkpoint is no longer written on a credits node, and an older checkpoint left on one is ignored by ▶ Resume and the session restore (a manual save there is kept). Before, closing the tab on the opening titles and reloading sent you past scenes 1 and 2.

## Scenes 1 and 2 to *Glimmering Haze*; the inn raid to *Hounds*, with Jack running (11 October 2026, late)

* **Scenes 1 and 2:** the director's *Glimmering Haze* loops under the backstreet and the bar.
  * The upload is `public/film/audio/Glimmering%20Haze (1).mp3` (61 s), left as uploaded.
  * `glimmering-haze.mp3` is the same song with its 0.45 s of leading silence cut off, so each loop comes back without a gap.
  * Both `nw_s1` and `nw_s2` set it in `src/film/studio-edits.json` (`musicLoop: true`, level 0.3, 2 s fade). Scene 2 keeps the track running instead of restarting it, and a reader who opens the film at scene 2 still hears it.
  * The title song still cuts in on the opening titles.
* **The inn raid** (the `inn-raid` cutscene, 39–49) plays to the director's *Hounds* (`public/film/audio/hounds.mp3`).
  * The builder stretches the caption shots so the raid ends with the song.
  * Scene 50 fades it out.
* **Jack runs instead of walking while he is shot at.** PlayFrame reshot the three upstairs frames:
  * `177-boots-below`: he runs from the stair-top as the masked man charges up.
  * `178-the-screens`: he sprints at camera as the screens burst.
  * `179-same-wood`: he runs through the bathroom door.
  * 177 and 179 get a running shake; 178 keeps its gunfire shake.
  * 179 was one of the fourteen depth shots on the director's own maps (below). Its map, plate and cut-out were made from the old picture, with Jack walking, so they no longer fit. The shot now plays the running shake instead. The files stay in `public/film/depth/s41/179-same-wood/` unused; a new map would have to be made from the new picture.

## The closed bar, Jack's office, three effects removed (12 October 2026)

* **Scene 8 (the closed bar):** it played `amb-bar.mp3`, a crowd of customers (about -20 dB). It is now a room tone and rain on the window (`amb-room-tone`, `loop-window-rain`; `nw_s8` in `studio-edits.json`). Scenes 2, 27A, 64 and 81 keep the customers.
* **Jack's office (10, 11, 18, 21, 77):** `loop-neon-office` is off. Measured, it had about 7 clicks a second (a crackling neon buzz); `amb-office` alone is left. The file stays in `public/film/sfx/`, unused.
* **Removed effects:** the breath on "Vera stops breathing." (9, `vera-gasp`) and `landline-dead` on "The line goes dead." (11) and "The line clicks dead." (18): it was button presses. The clips stay in `public/film/sfx/`.
* **Scene 10:** Jack's reply is Draft 1's "Depends who's calling." again (PlayFrame bible item 25). `src/film/story.json` was also behind on the breathless takes' durations (scenes 44, 46, 48, 92); they are current now.

## Space skips the credits again (12 October 2026)

* **The director:** *"if you press space bar on credits you can no longer skip them."* On a credits node Space (or Enter) went to the page-turning keys: the first press finished the "typing", the second "acknowledged" the roll, which also hid the **Skip title sequence** button, so a four-minute title sequence could not be left (the mouse button vanished too). Space / Enter now skips the roll exactly as the button does (`skipCredits` in `src/game/Game.tsx`), on the opening titles, the two mid-film title cards and the end credits; a held key does not chain into the next credits node. `scripts/dom-smoke.mjs` ("Space skipped the title sequence") fails without it.

## Breaths, breathless lines and the Hive escape's shake (11 October 2026, later)

* **Breathless lines** (PlayFrame's re-recordings, through the visual novel): the inn raid's "Stay. Whatever you hear.", "My husband —", "I'll get him.", "I'm sorry.", "Come on. Come on." and scene 92's three lines.
* **Breaths and sighs** in `public/film/sfx/` (from PlayFrame `public/audio/neonoire/breaths/`):
  * On the screenplay beats that write them (`sfx` in `studio-edits.json`): Jack's sigh (14A), Ishida's sigh (23), Vera's gasp at the clip (9), Jack's shaky breath (50), Vera's breath catching (56) and Vera's breath as she runs in heels (73).
  * Running breaths on the inn raid's 177 and 179, and a grunt on 180. **Thinned on 12 October 2026** (the director: *"too many breath effects on Jack in there, just remove a couple"*): Jack's breaths came every couple of seconds (the running breaths two shots apart, then a grunt, over the four breathless lines), so 179's running breath and 180's grunt are out; the one on 177 ("Boots on the stairs. Jack goes the other way.") stays. The clips stay in `public/film/sfx/`; to bring one back, add `"sfx": "jack-running"` (or `"jack-grunt"`) to that shot in `studio-edits.json`'s `cutscenes`.
  * In the Hive escape, cues on 128, 378, 379 and 381.
* **Shake cam in the Hive escape:** a running shake (0.2) on 129, 381, 382 and `132-the-gap`. 378 keeps its existing shake, and 379 and 380 keep their own looks.
* Nobody has listened.

## The lounge piano; no gunshot in Mara's memory (11 October 2026)

* **Scene 66** (Vera waiting in the lounge, the pianist playing) starts the director's piano version of "Bad Guy"
  (`public/film/audio/bad-guy-piano.mp3`, uploaded as `bad guy best (Section).mp3`, 4:32), looping at 0.8, and it plays
  on through 67–72 until "Bad Guy" itself comes in at 72 ("The piano plays on"). A Studio edit on `nw_s66`.
* **Scene 70**: the two shots and the fall played on Mara's memory, "From the floor of a bar, before two shots", as
  Jack and Mara came out of the Hive. The visual novel's importer matched "two shots" anywhere; it now matches only
  scene 2's own "Two shots." (`tools/import-playframe.mjs` there, with a test).

## No black bars; shot changes without a ghost (11 October 2026)

* **No letterbox bars.** They were drawn over the picture and hid its top and bottom (131 of 133 nodes had them). The
  builder now takes `letterbox` off every node after the Studio edits and the soundtracks; the pictures fill the frame.
* **A true dissolve between shots** (`BeatBackground` in `src/game/Game.tsx`): the picture going out stays solid while
  the new one fades in over it, then is removed; a dip to black goes through black. Before, both faded at once, so the
  scene's own picture (its first shot) showed through mid-dissolve at a quarter strength: the flicker of "the previous
  shot overlayed", in the game and in the animatic alike.
* **Depth fog** ("thicker at back") is off unless a scene ticks it.

## The scene's own picture no longer flickers between shots (12 October 2026)

* **Cause.** `BeatBackground` mounted a shot's picture as a CSS `background-image` the moment its beat began. The image
  loads asynchronously, so on a slow connection (or the first time through a scene) the new layer was transparent while
  the outgoing one was pruned after about a second, and the scene's own plate underneath showed through: the "main
  background flickering over the beat images". The existing preloader only warms the next beat and stands down on
  slow connections, which is exactly when pictures arrive late.
* **Fix** (`src/game/preloadPicture.ts`, `BeatBackground`): a beat's picture is mounted only once it has decoded
  (`pictureReady`, else `preloadPicture`, with a six-second timeout so a missing file cannot hold the film), so the
  outgoing shot stays solid until the next one is really there. The next five beats' pictures, and the next scene's
  first two, are warmed ahead (respecting the data-saver / 2g stand-down).
* **Test:** `scripts/browser/film-backend.spec.ts` plays the film under 1.5 s of emulated latency and records every
  `[data-beat-bg]` layer as it is added; none may be added before its picture is complete. It fails on the old code.
* **The 35mm film grade was the second cause.** Every beat picture in the film carries the film grade, and its flicker
  animated the picture's own opacity (0.95 to 1 every 0.38 s). A picture that is not fully opaque shows what is under
  it: the scene's own, ungraded picture, a different shot, so about 2 to 5 % of the main background flickered over each
  beat picture. The flicker is now a black veil above the picture (`.film-flicker`, drawn with the scratches by
  `CinematicOverlays`): it dims by the same amount and reveals nothing. The picture itself stays fully opaque, and the
  weave is scaled up 0.4 % so a half-pixel shift never shows its edge. Grain, halation, weave and scratches are as they
  were. A second browser test samples the picture's effective opacity for 2.5 s and fails on the old code (0.95).
  (Noticed, not changed: `.film-grade`'s `animation` replaces the plate's own pan / dolly / zoom, so a film-graded
  picture holds still apart from the weave.)

## The radio song, the credits, no saxophones, the animatic export (10 October 2026)

* **Scene 65:** the director's song *It ain't easy* is the neighbour's radio through Vera's wall, as an AM radio: `it-aint-easy-radio.mp3` is the upload (`public/film/audio/It ain't easy.mp3`, untouched) through mono, 280–3,200 Hz, light compression and faint hiss, loudness-matched to the song it replaced on 11 October 2026 (`soundtrack_nobodys_witness.mp3`). It starts on "the neighbour's radio begins to play" (the scene splits there into `nw_s65_b`, which also keeps the room tone and the window rain), plays once at 0.48 (0.6 before 11 October) under the rest of the scene (the make-up, the umbrella, "Borrowing it."), and fades over 4 s as the hotel lounge (66) begins. Cue `radio` in `tools/build-film-story.mjs`; the visual novel's importer puts it in `src/film/story.json`.
* **Credits:** "Written by Scott Gooding" and "All music written by Scott Gooding · enhanced with suno.ai" in the end credits (`creditLines` in the builder) and on the opening titles (the `nw_title` Studio edit in `src/film/studio-edits.json`).
* **No saxophones:** the director wants none. The screenplay no longer mentions one (scenes 4 and 65, changed in PlayFrame), and the `dj-through-wall` effect (scene 4), whose take had a saxophone in it, is gone with its files.
* **The default move is `truck` (12 October 2026, the director: "default depth maps to truck").** A depth map with no `depthMotion` now trucks (it was a push), and the Studio starts a newly added map on a truck. Every depth map the film already has names its move in `studio-edits.json` (28 push, 14 truck, 4 drift), so the film plays as before; change one there, or in the Studio's Move menu, to switch it.
* **Depth moves made stronger:** every `depthAmount` raised (cut-out shots about 1.8 times, up to 0.8; map-only shots about 1.6 times, up to 0.6), and push and truck now move most in their first seconds (`docs/depth-camera.md`).
* **🎞 Export animatic** on the home screen renders the film or a run of scenes to an MP4 with the effects, the depth camera, the sound, subtitles and descriptions burned in: `docs/animatic-export.md`.

## Every picture gets its own words (9 October 2026)

Several shots often cover one paragraph of the screenplay. The visual novel holds each for 2.2 seconds; this film used to let the last one win, so **16 of the 365 pictures were never shown** (Mara walking in scene 1, the journalist turning in scene 2, the laundry in 3, Mrs. Sakai's empty house in 59, and more). Now the builder cuts the paragraph where the next shot's quoted beat begins (each picture step in `src/film/story.json` carries `quote`, the words PlayFrame's board says the shot covers), shares a spoken line's takes between the pictures whose beat it is, and gives a picture left with no words of its own a short caption: `"pictureCaptions"` in `src/film/studio-edits.json` (picture file name to text), else the shot's title. All 365 pictures play. A closing CUT TO BLACK no longer leaves a "·" beat to click.

## Songs play once (9 October 2026)

The engine loops a scene's music until another cue changes or silences it; that suits a bed but not a song: "Bad Guy" (4:28) under scenes 72–77 would start again in scene 77 if the reader took longer than the song, and the opening titles (set to 300 s over a 3:53 song) restarted theirs. A scene can now set `musicLoop: false` (`src/types.ts`): the track it starts plays once, and a click or the sound toggle never restarts a song that has finished. The film's songs (the opening titles, the scene-72 song, the raid) carry it; the opening titles last 110 s (they were 232 s, the song's length, until 12 October 2026), and the end credits run for their roll.

## Notes on the pictures, clips and sound (as of 6 October 2026)

**Canonical pictures come from PlayFrame** (`sigooding/PlayFrame`, `public/images/neonoire/`) by way of the visual novel's importer; this repo normally copies them into `public/film/img/`. The decisions behind them are in PlayFrame's `docs/neonoire/story-bible.md` (Part 9, items 19 and 20) and `docs/neonoire/handoff.md`. The 6 October retakes made in this checkout (shots 10, 12, 13, 361, 158–161, 320, 86, 87, 316, 89, 90) have been **synced back into PlayFrame** (earlier versions archived there) and re-imported, so rerunning `node tools/build-film-story.mjs` reproduces them unchanged. Do not hand-edit images here; make retakes in PlayFrame, or sync any local retake back first.

- **Shot 73 (the vending-machine frame) is retired.** Vera's run is three handheld frames, then the lost heel.
- **Retaken to one lane layout** (barbershop doorway, scooter and crates left; vending machine right; bar at the far end; sedan gone after the men leave): shots **14, 17, 18**, and **333** (sedan broadside across the lane mouth, old man between camera and men).
- **New frames:** 383 (the empty lane), 384–386 (Vera in her apartment, for emptiness), 387–388 (Vera's run in the red dress: the long street and the crossing).
- **Car-scene retakes (6 October 2026, synced to PlayFrame):** shots **10, 12 and 13** have been replaced at 1920×1080. Shot 10 keeps the old man down in the lane with exactly two masked men and one sedan broadside across the mouth; Mara stays hidden. Shot 12 is the radio man touching his earpiece, with the same broadside sedan and only two masked men. Shot 13 shows the sedan reversing out into the wet street; the lane is empty, with no yellow road markings. Scene data and asset URLs are unchanged.
- **Vera continuity retake (shot 361, 6 October 2026, synced to PlayFrame):** replaced the black-haired woman at the wall of drawings with Vera's shoulder-length dark-blonde/light-brown hair and matching dark coat/cream knit from shot 182. The frame is 1920×1080 and keeps the same scene and URL.
- **Final-scene retakes — scene 100, "The city goes on" (6 October 2026, synced to PlayFrame):** shots **320, 158, 265 and 260** and shot **159** have been replaced at 1920×1080 so the last scene is unmistakably one place and one night. Every frame now shares the same location kit: the brick railway arch with its low vault, the same worn plank counter and its six old stools, the bare bulb on its cord, the same hanging bowls, chopstick holders and condiment bottles, the doorway with the blue noren and the cold street beyond, and the one faded hand-painted 金子 sign above the counter. The room is a counter and stools and nothing else — **no tables anywhere**, Vera sits on the stool beside Jack rather than at a table — and the **single** small CRT television above the door (there is exactly one, on the right-hand shelf; the left shelf holds only crockery and the radio) is **switched on with the news in every frame**, as its caption requires. **Jack sits at the counter in every frame** — he was missing from 320, 265 and 260, which is the continuity break this pass fixes; he wears the same dark charcoal wool overcoat and pale shirt as shots 153–155 and 164. Vera wears the same dark olive-charcoal coat, cream knit turtleneck and red enamel bird hair clip she wears in shot 182 and on the rooftop. Shot **320 is now the close-up its caption asks for**, on the small old television on the shelf with the room soft behind it: Kurose leaving a building between lawyers, cameras flashing, Ishida's photograph inset, the sound down and nobody looking up. Shot 159 is the wide hold on the three of them in the steam. Story data and asset URLs are unchanged. These are local replacements in this checkout; sync them into PlayFrame through its importer before the next builder run (see the source-of-truth note above).
- **Notebook handoff envelope (6 October 2026, synced to PlayFrame):** shots **86, 87, 316, 89 and 90** now carry one aged kraft/manila string-tie envelope sized for the cloth-covered notebook and folded letter. It is shown open while Jack loads it and tied shut on the doormat. Shot 89 looks outward from inside the threshold; shot 90 shows Vera staying inside her apartment as she opens the parcel. All five frames are 1920×1080; story data and asset URLs are unchanged.

**Video beats.** A beat's `background` may be `video:<path>`: a silent clip that plays once and holds its last frame (`BeatBackground` in `src/game/Game.tsx`). The Studio beat editor has a 🎞 Video upload button and a preview. The clip lists a `.webm` beside the `.mp4` so browsers without H.264 still play it. The only clip is shot 14's lip-synced take of Mara's line (OmniHuman 1.5 from the still and her recorded voice, 5.6 s); the builder reads the list from the visual novel's `src/story/clips.ts`, so adding a talking shot there adds it here. The clip carries no sound; the beat's own voice file plays.

**Sound.** `ambientAudio` may layer built-in presets and recorded loops with `+`: `rain+file:/film/sfx/amb-hive.mp3`. The builder picks one bed per scene from its slugline (vending hum for the backstreet, city traffic for other exteriors, room tone, the Hive, a bar, an office). Recorded with ElevenLabs sound effects (`amb-*.mp3` and `car-pass.mp3` in `public/film/sfx/`). **No rain, sound or particles, in `INT.` scenes** (an `INT./EXT.` slugline still counts as outdoors). The running-in-heels effect was tried and cut.

**Auto-continue (7 October 2026).** The film's scenes all carry an authored route, so they used to play themselves with no way to stop them. The ⏩ AUTO button on the dialogue panel now switches that on and off (remembered per browser, `scarlet-reel-auto-continue`). Off, each line waits for a click or Space and a scene ends on a **▸ Next scene** button. The credits keep their own roll either way.

**Autosave and Resume (7 October 2026).** A checkpoint was already written on every scene arrival, but resuming from it started the film over and then overwrote it: the automatic checkpoint is slot 0 and the resume code treated slot 0 as "no slot". It is fixed in `App.tsx` and `Game.tsx` (`resumeSlot !== undefined`). A browser reload and the newsstand's ▶ Resume both now return to the last scene reached.

**Studio edits (7 October 2026).** `src/film/studio-edits.json` holds edits made in the Studio that `tools/build-film-story.mjs` applies over the generated scenes, so a rebuild keeps them: the opening-titles design (montage, fonts, colours, timing), the title song (`public/film/audio/title-song.mp3`) and the music for scenes 1 (`midnight-in-the-rain-v6.mp3`, level 0.35) and 3 (music off). The Studio export they came from is `nobodys-witness-film.reel.nodata.json` (media blobs stripped; the `*.reel.json` ignore rule keeps full exports out of git). Also applied: the running order (scene 1 → scene 2 → opening titles/credits → prologue → scene 3, start scene 1) and `dropBeats` (scene 2's "Over black: RAIN." and "NOBODY'S WITNESS" cards). Every scene with beats now ends with "After this beat — cut to scene" on its last beat (generator default) instead of a scene-level auto-advance, so the default background never shows between scenes. Not applied: the stray "New choice" stubs on the title and prologue scenes and the flowchart layout positions.


**Montages (7 October 2026; image direction in `FILM-montage-image-brief.md`).** `nw_m18` plays after scene 18 (Jack returning to the Hive); `nw_m53` plays after scenes 52 and 53 have run in full. `studio-edits.json` → `montages` inserts six auto-cycling stills per sequence, 5 s apiece, over `public/film/audio/dark-hills-blues.mp3`. The images follow the finished film's grounded, cool-toned Tokyo neo-noir look rather than the earlier amber-period handoff. All 12 frames are new, and all paths are 1920×1080. Montage 53 is now night throughout and includes an exterior apartment-block establishing shot (`montage53/05.jpg`). These local montage replacements have not been synced to PlayFrame; sync them before rebuilding, since the builder recopies `public/img` from that source.

**Sound effects (7 October 2026).** The new effects in `public/film/sfx/` are renamed (`tv-murmur`, `coin-insert`, `coins-in`, `car-engine-start`, `car-start-idle`, `car-driving-away`, `car-interior-driving`, `rain-tin-roof`, `vending-hum`, `train-inside-1/2`) and placed from `src/film/studio-edits.json`: `ambientAdd` layers a loop under a scene's atmosphere; `sfx` puts a one-shot on the beat whose text contains `find`. `car-start-idle` is not placed yet.

**Music cues (7 October 2026, later).** The engine now fades to a new `musicLevel` when the next scene keeps the same track (it used to ignore it), so a cue can build: *Dark Hills Blues* starts quietly in scene 18 (0.2), swells to 0.7 over 10 s as the montage begins; the same under 52 → 53 → montage. *The Show* (`public/film/audio/the-show.mp3`) comes in under scene 100 (0.3) and swells to full over 12 s into the credits. The levels and fade lengths are in `src/film/studio-edits.json` (`musicLevel` 0–1, `musicFadeSeconds`).

**Narration.** Every scene has `autoNarrate: false` (Studio → Audio → "Auto-play prose voice on first scene entry" off), set in the generator, so the browser voice never reads the scene prose; the recorded takes still play.

**Scene 78.** The "midnight in the rain" cue is removed (the scene is music-off, 4 s fade): removed on 7 October, **tried as a song-timed run through scenes 77–79 on 12 October 2026 and taken out again on 13 October** (the director: *"remove the midnight song"*); the opening-scene score `midnight-in-the-rain-v6.mp3` is a different file and stays.

**Text and theme (7 October 2026, later).** Every scene has `noTypewriter: true` (the words appear at once; the recorded voice sets the pace). The reading panel uses the in-game theme options through `dialogueBox` in `studio-edits.json`: Playfair Display (`elegant`) for body and headings, the `midnight-teal` HUD scheme (it sits with the cool slate grade of the pictures), text 10% larger, no panel box (the default gradient scrim under the text). Change those in Studio (In-game theme) or in the file.
**Ambient loops (7 October 2026, later).** Ten looping beds generated with ElevenLabs sound effects (24 s, `loop`, levelled to about -30 dB mean) in `public/film/sfx/loop-*.mp3`, placed through `ambientAdd`: Yamanote carriage (26), police station (5, 6, 7, 80, 96), newsroom (53A, 82, 82A), noodle counter (17, 19, 22, 56, 58, 86, 100), hotel lounge (66, 72), roadside at night (30, 31, 38, 47, 49), harbour (28), rooftop wind (98), yakitori grill (23), idling car in rain (61, 94; 61 no longer layers the tin-roof rain). Ambient files play at a fixed gain, so level a loop in the file itself.

**Text fit (7 October 2026, later).** Silent narration is cut at sentence ends into beats of at most ~140 characters (`chunkText` in the generator), so a long action paragraph no longer fills the screen (1452 beats became 1605); a recorded line stays whole because its take is one file (13 voiced lines run past 200 characters). On phones the reading panel loses its 96 px left gutter, so the text uses the full width. `dropBeats` entries can now be exact beat text as well as numbers.

**Backstreet (scene 1).** The opening score `midnight-in-the-rain-v6.mp3` is removed from scene 1 (music off); nothing plays until the title song. The file stays in `public/film/audio/`, unused.

**Ambient loops, round two (8 October 2026).** Ten more generated beds, levelled to about -30 to -38 dB mean, in `public/film/sfx/loop-*.mp3` and placed with `ambientAdd`: railway viaduct (63, 63A, 67, 70, 92), high-rise chairman office (51, 83), window rain indoors (4, 36, 52, 65, 76, 79), neon office hum (10, 11, 18, 21, 77), breakfast counter (25A), pickup truck moving (50 only: the engine starts during 48), old inn at night (32 to 46 interiors), wet street with passing cars (73, 95), Hive stairwell (85, 88, 89), street crossing (27, 62).

**Hushed takes re-recorded (8 October 2026).** Twelve Jack and Vera takes that read as whispers were re-recorded at speaking volume in PlayFrame (PR 84) and re-imported through the visual novel (nobodys-witness PR 12): `public/film/voice/` s10 (167 x2, 168), s12 (247), s14 (270 x2), s17 (189 x2), s44 (214 x2), s53 (275), s60 (229). Same lines and ids; the generator re-cut one of Vera's scene 14 beats so the spoken line "I told her to go, then. Go home. Those were the last things I said to her." now sits in one beat. Mara's four `[weakly]` scene 71 lines are unchanged on purpose.

**Laugh and cry takes, phone/TV voices, body falls, a subtitle (8 October 2026, later).** All arrive through the visual novel's importer, so rerun `node tools/build-film-story.mjs` after a re-import.
- *Laugh and cry/upset takes:* 13 lines re-recorded in PlayFrame (scenes 6, 36, 58, 60, 69, 71, 74, 84, 98; in the v4 descriptive-direction style). Scene 58's line is now 12 s, so Kaneko's answer comes later; nothing else about the scenes changed.
- *Phone, TV and tape voices:* the 26 PlayFrame takes marked `fx` (Ishida, Kaneko and Jack on the phone, Vera's voicemails, Mara's voicemail greeting, the vending machine, the Mother, the news and weather on the television, the cassette in scene 82) are filtered copies: the visual novel's importer bakes the same ffmpeg chains PlayFrame's animatic uses (`scripts/neonoire/voice-fx.mjs` there) into `public/voice/`, and this build copies that folder. They played clean before.
- *Body falls:* `public/film/sfx/body-fall-street.mp3` (scene 1, the old man folds onto the lane, cue `fall-street`), `body-fall-doorway.mp3` (scene 70, Mara hit, through the Hive door, cue `fall-door`) and `shot2-fall.mp3` (scene 2: `shot2.mp3` with the journalist's fall from his stool mixed in a second later, ffmpeg `adelay=1000` + `amix`; the generator maps the `shot2` cue to it). Source files and the 12 variations: PlayFrame `public/audio/neonoire/sfx/`.
- *Subtitle:* the masked men's "Shitsurei shimasu." (scenes 2 and 70) shows "Shitsurei shimasu. (Excuse me.)": the story step carries `sub`, and the generator appends it to the line's one text box.

## Soundtracks: a song that carries a run of scenes (9 October 2026)

`src/film/studio-edits.json` → `"soundtracks"` turns a run of scenes into a hands-off cutscene for the length of a song. The first entry is **the raid on the Hive**: "Coins Measure-Time" (`public/film/audio/coins-measure-time.mp3`, 2:00.67) starts when the masked men enter the passages (scene 85) and the run plays on its own to the street below the viaduct, then stops **before** "She nods." (the rest of scene 92, Vera's "Mara was safe here. Until us.", plays as an ordinary click-through node, `nw_s92_after`, while the song fades out over 3 s).

* **Every shot is its own node with the cutscene bars** (`letterbox: true`, no HUD) and a one-line **caption** saying what is happening ("Kaneko sounds the alarm and pulls the shutter down.", "He pulls the main switch."), from `captions` (keyed by the picture's file name). A shot with spoken lines gets its caption for 2.6 s, then the lines with their subtitles; the other shots share the rest of the song (about 4 s each).
* **Effects** are `cues` (picture file name → effect and volume): the pipe alarm on the first shot and under the pipe gallery, doors closing, the shutter crash, boots, the main switch, flashlights snapping on, the train and rails over the gap, the ladder rungs, distant sirens. Eight were generated for this (`public/film/sfx/*.mp3`; the first takes, the second takes and the ElevenLabs ids are in `docs/raid-sfx-generations.json`); the train is the film's own.
* **Timing.** Every node runs about 0.18 s longer than its delay says (`lag`, measured in headless Chromium), which the builder subtracts. Measured from the song's first request to "She nods.": 115.9 s, then the fade (the song is 120.67 s, so it never loops). A few seconds either way does not matter.
* **Vera's line** in the kitchen scene (86) is "They don't know me." (was "I know them."), a new take; the change is in PlayFrame's screenplay and `docs/neonoire/voice/manifest.json` first.

Fields: `from`, `to` (node ids, parts included), `stopBefore` (the text of the first beat that is left to the ordinary scene), `musicUrl`, `seconds`, `fadeIn`, `fadeOut`, `slack`, `endHold`, `captionSeconds`, `lag`, `captions`, `cues`, `songRunsOn` (the scene after the run does not fade the song; it plays on until it ends by itself). `node tools/build-film-story.mjs` applies it after the Studio edits; the original scenes stay in `src/film/story.json`. Deep link: `?story=nobodys-witness-film&scene=nw_song_raid_01`.

### Bad Guy carries the night; "Baby Fool" carries the newsroom (12–13 October 2026)

*"the whole scene needs to be timed to the playing song up until end of jack sitting in office"* (12 October). One more `"soundtracks"` entry:

* **`bad-guy`**, "Bad Guy" (`public/film/audio/bad-guy.mp3`, 4:28.27), from `nw_s72_b` (the continuation node that starts the song in the hotel lounge, "Vera doesn't move. The piano plays on.") through scenes 73 to 77, `stopBefore: "He opens the drawer."`: the run ends when Jack has sat down at his desk with the notebook and Vera's voice in his head. 34 timed nodes over 29 shots (22 captioned, 7 with 11 recorded lines). The rest of Jack's office (the clean envelope, the pen that writes nothing) follows as an ordinary click-through node, `nw_s77_after`; since 20 October 2026 (the director: *"don't end bad guy song at jack just play till end"*, `songRunsOn: true`) the song plays on under it to its own end instead of being faded there; scenes 78 and 79 are click-through and **music-off** (a second run, "Midnight in the Rain" through the notebook scene, was added the same day and **removed on 13 October**: *"remove the midnight song"*). It is planned to 265 s of the song's 268 s because the voiced shots run a few seconds past the plan; measured in headless Chromium, the run ends 263.3 s into the song.

It runs hands-off like the raid: every shot is its own node with a one-line caption (`captions`), the recorded lines keep their takes and subtitles, and effects are `cues` per picture (the heels, the car passing, the crossing melody, the shoe splash, the train, the lighter, the drawer, the envelope on the mat). The narration under the pictures is left out. **A shot's `captions` entry may be a list**: the shot is then cut into that many parts on the same picture (a straight cut between them, the shot's time shared), each with its own caption and its own entry in the picture's `cues` list. Picture 70 is two parts: "Not elegantly. Badly. In heels…" with the heels, then "A car passes, its tyres hissing…" with `car-pass` (13 October 2026, the director: *"when she was running before there was sfx of car driving past"*; the first version of the run kept one effect a shot and dropped it). Still not carried by the run: the lounge's clock and glass (scene 72, "The clock ticks. Somewhere a glass is set down.", under the pianist), which fell inside a voiced shot. **The silent shots hold about 10 s each**, because the song is long and the pictures few (scene 73 has eight pictures for a minute of song); more pictures in scene 73 (PlayFrame's queued frames, `docs/neonoire/passes/vera-run-queued-2026-10-12.md` there) shorten those holds. Builder change: a node a run leaves behind (`…_after`) no longer reopens the picture the earlier run ended on when its first beat has a picture of its own. Deep link: `?story=nobodys-witness-film&scene=nw_song_bad-guy_01`. `scripts/film-backend.entry.ts` check 16 holds it.

**"Baby Fool"** (13 October 2026; the director's upload to nobodys-witness, `Baby Fool Elec (28).mp3`, 2:23.78, here `public/film/audio/baby-fool.mp3`): *"when jack goes into the reporters … a determined walk to the office while baby fool is playing"*, *"song play through the scene"*. It is the story's own music cue (`{"t":"music","id":"babyfool"}`, written by the visual novel's importer, mapped in `MUSIC`/`CUE_FIELDS` in the builder: level 0.75, 2 s fade in, plays once, the engine ducks it under the voices) on the newsroom scene's first node, `nw_s82`, so it starts as Jack walks in and plays through the scene; scene 82A's own cue fades it out. The three shots of Jack's walk are **placements in PlayFrame with no pictures yet** (550–552, behind Jack at shoulder height), so the film shows the newsroom master (106) over the first lines until they exist.

**Scene 73 (12 October 2026):** three pictures were added in PlayFrame (547 the phone still lit, 548 the vending machine, 549 the crossing signal); 388's beat is now the second half of its sentence.

## Scene effects, TV and radio voices, picture effects (9 October 2026)

Asked: *"add special effects where needed in the game ... make sure they are appropriate for the scene ... add the remaining sound effects and voices missing using elevenlabs ... make sure everything created is also replicable in the game engine."* Every effect sits on the screenplay line that calls for it, and everything is in `src/film/studio-edits.json`, so the Studio and a rebuild (`node tools/build-film-story.mjs`) both carry it. **Nobody has listened to any of it.**

* **71 new effects and 4 TV/radio voices**, generated in one ElevenLabs flow (`fAjXLLwYkar3WzG6dFlj`): `eleven_text_to_sound_v2`, one take each, two for the effects that recur or carry a moment (the lighter, the rotary dial, the ringtone, the inn's gunfire, the door in 71). Six first takes came back near-silent (the TV laugh, the paper cup, the tea, the clock, the cassette stop key, the sumo broadcast) and were re-prompted louder and closer, two takes each. Every take, prompt and generation id is in `docs/film-sfx-generations-2026-10-09.json`, and the raw takes are in `public/film/sfx/alternates/` and `public/film/voice/tv-radio/raw/` (ElevenLabs does not keep them). About 1,250 credits in all.
* **`tools/level-film-sfx.mjs`** (`FFMPEG=... node tools/level-film-sfx.mjs`) picks each effect's take by measurement (the most energy among takes that are not mostly silence), levels it (a hit to a -3 dBFS peak with a 40 ms fade, a loop to an average of -24 dB, never more than +14 dB) and writes `public/film/sfx/<id>.mp3`; it writes the pick and the levels back into the generations file. `tea-pour` is still quiet after +14 dB (a pour is a small sound).
* **The voices** are diegetic only, never a character's line, in two stock character voices (the director's rule for stock voices): the baseball on the radio under the arch (22) and on the inn's CRT (32) in "World Wrestling Announcer", the morning cooking show (25A, two clips, the second on "a chef lifts a lid") in "Sugar Lin". They are heard through a television or a radio (the chains PlayFrame uses for the screenplay's phone/TV/tape lines), brought back to their clean level.
* **Five effects come from PlayFrame's shared library** (`public/audio/sfx/` there): `footsteps-wet`, `car-doors-open`, `door-lock-handle`, `landline-dead`, `gravel-tyres`. **Two are mixes**, because a beat carries one effect: `vending-coin-can` (the coin, then the can dropping, scene 12, replacing `coin-insert` there) and `lounge-clock-glass` (the clock, then a glass set down, scene 72).
* **Placed:** 110 new one-shots (`"sfx"`: scene, the words of the beat, file, volume) and four room loops (`"ambientAdd"`): the police radio in the detectives' room (7), the radio repairman's dozen stations in the Hive corridors (16, 55), the salarymen at the yakitori stall (23). The crossing melody now plays where 27, 62, 73 and 75 call for it, and the train where 3, 74 and 98 do.
* **Picture effects** (new `"pictureLook"`, keyed by the picture's file name, merged into that picture's camera wherever it shows; the Studio sees it as the beat's camera): a handheld shake on the gunfire and the crash pictures (1's shot, 2's two shots, the inn raid 40–49, the shooting in 70), a lighter running shake on Mara's and Vera's runs (1, 73), a zoom punch on the cut to each shooting (1, 2), headlight lens flares on the sedan in the lane (332, 333), and the lobby gone dark and blue when Jack kills the light (45). **Rain on the lens** (scene `cinematic.rainOnLens`) in the truck cab (48, 50) and in Ishida's parked car (61); the engine already draws it in every rain scene.
* **Not done:** the visual novel does not have these effects (its importer reads PlayFrame; the effects live here). The scene 4 neighbour's radio ballad and the scene 72 pianist are music, not effects (see the music note in PlayFrame's CLAUDE.md).

| Effect | Scenes |
|---|---|
| `vending-coin-can` | 12 |
| `phone-vibrate` | 1 |
| `footsteps-wet` | 1 |
| `car-stop-wet` | 1 |
| `car-doors-open` | 1 |
| `bag-spill` | 1 |
| `crates-clatter` | 2 |
| `door-burst-bell` | 2 |
| `door-open-rain` | 2 |
| `earpiece-word` | 2 |
| `tv-laugh` | 2 |
| `train` | 3, 74, 98 |
| `voicemail-beep` | 4 |
| ~~`dj-through-wall`~~ | removed 10 October (it had a saxophone in it; the director wants none) |
| `keyboard-typing` | 5 |
| `desk-phone-pickup` | 5 |
| `phone-hang-up` | 5, 11 |
| `paper-cup-crumple` | 6 |
| `drawer-open` | 7, 77, 96 |
| `drawer-close` | 7 |
| `mop-floor` | 8 |
| `lighter-flick` | 10, 11, 14A, 26, 72, 76 |
| `knock-glass-door` | 10 |
| `tv-static` | 11, 18, 75, 77 |
| `rotary-dial` | 11 |
| `landline-dead` | 11, 18 |
| `shutter-rattle-up` | 12 |
| `shutter-pull-down` | 12 |
| `knock-car-window` | 14A |
| `car-window-down` | 14A |
| `umbrella-shake` | 14A |
| `door-lock-handle` | 14A |
| `paper-bag-rustle` | 14A |
| `sumo-tv` | 16, 55 |
| `bowl-set-down` | 17, 56 |
| `radio-baseball` | 22 |
| `tv-cooking-show` | 25A |
| `tv-cooking-lid` | 25A |
| `cash-register` | 25A |
| `crossing` | 27, 62, 73, 75 |
| `tea-pour` | 29, 83 |
| `gravel-tyres` | 31, 38 |
| `tv-baseball-inn` | 32 |
| `key-wooden-tag` | 32 |
| `mobile-ring` | 36, 72 |
| `payphone-cutoff` | 36 |
| `tv-crowd-cheer` | 39 |
| `smg-burst-suppressed` | 40, 41, 45, 47 |
| `glass-case-shatter` | 40 |
| `window-forced` | 42 |
| `tin-roof-slide` | 43 |
| `main-switch-blackout` | 45 |
| `vending-machine-buzz` | 45 |
| `bullets-car` | 47 |
| `engine-cough-die` | 48 |
| `windscreen-crack` | 48 |
| `gate-smash` | 49 |
| `door-knock-wood` | 52 |
| `cloth-wring` | 53 |
| `ringback-tone` | 59 |
| `locker-open` | 63 |
| `pachinko-parlour` | 63A |
| `fire-door-push-bar` (was `fire-door-bang` until 20 October 2026: it sounded like a gunshot) | 63A |
| `sleeve-murmur` | 63A, 70, 84 |
| `cash-drawer` | 64, 81 |
| `pour-drink` | 64, 81 |
| `violin-practice` | 69 |
| `ricochets` | 70 |
| `door-pounding-shots` | 71 |
| `windows-neighbours` | 71 |
| `sirens-distant` | 71 |
| `lounge-clock-glass` | 72 |
| `heels-running-wet` | 73 |
| `shoe-splash` | 73 |
| `envelope-mat` | 77, 78 |
| `cassette-play` | 82 |
| `cassette-stop` | 82 |
| `photocopier` | 82A |
| `car-door-heavy` | 94 |
| `demolition-site` | 99A |

**Levels, later on 9 October 2026 (director: "things like the tv effects are too loud").** Only the sounds heard through a TV, a radio or a wall were turned down, by measurement: each one's placement volume now plays it at -34 to -44 dB average, well under the dialogue (about -19 dB) and the room beds (about -30 dB). That covers the static (was about -24 dB, now -40), the laugh track and the crowd cheer, the DJ through the wall, the baseball and cooking-show voices, the sumo, the ringback tone, the sleeve murmurs, the violin, the neighbours and the phone's buzz. The three new scene beds (police radio, radio repairman, yakitori crowd) are leveled to -33/-34 dB in `tools/level-film-sfx.mjs` (`BED_MEAN`), down from -24. Gunfire, doors, glass and the other hits are unchanged.

## More engine effects: light glows, running shake, grades, dolly pushes (9 October 2026, night)

Asked: *"use some more Scarlet engine effects, add some light glows maybe and shake cam when running, you decide on others, only for Nobody's Witness."* Everything is in `src/film/studio-edits.json` → `"pictureLook"` (now 111 pictures) and `"scenes"`, so the Studio shows it as each picture's camera and a rebuild keeps it. The raid's song-timed shots now take `pictureLook` too (`tools/build-film-story.mjs`).

* **Light glows (132 lights on 70 pictures)**, each placed on the light the picture actually shows (read off gridded contact sheets): the vending machines (cold white, a faint hum), the bar signs and the amber bottle shelf, every CRT (blue, flickering; the static ones flicker faster), the desk lamps in Jack's office and the inn, the bare bulbs in the storeroom (humming in 20, **swinging** in 84 as the script says), the fluorescent tube that flickers in 5 and 63, the yakitori stall's red lanterns (they sway faster when the train goes over in 23), the café's CRT and siphon flame, the altar candle, the green crossing signals in 27, 62 and 75 (and the green on the wet crossing), the inn's sign "half its bulbs dead" (flickering) and Jack's two headlights (one dimmer, as written) in 30, four sets of headlights in the curtain gap (39), the inn lobby's blue TV after the lights go out (45), the dashboard in Ishida's car (61), the pachinko parlour (63A), the hotel lounge lamp (66, 72), the sodium lamp and the 8:52 sign (67), the photocopier's bar of light (82A), the police station's lit window and the sedan's warm open door (94), the tail lights (95), the news on the final scene's TV with the cameras flashing (100). In the raid: the neon at the Hive's entrance, the repairman's lamps, the lamp that flickers as the main switch goes, the flashlight, the family's one candle, the train windows over the gap, the lit building and the sirens' red and blue.
* **Running shake** (handheld, slow) added to Mara bursting into the bar (2), the dark stairwell and the rooms the Hive opens for Vera and Jack in the raid (128, 131, 378, 379); 1 and 73 already had it. A harder shake on the train roaring over the gap (133).
* **Grades:** the old photographs and the clipping (35, 165, 166, 167, 244) in a warm, faded golden grade (*"its colors gone warm and faded"*); the first dry day on the roof (98) and the winter after (99A) in a clean, cool grade, the only scenes out of the rain-city look.
* **Dolly push (vertigo):** Jack seeing Daniel's photograph (165), Vera on the phone when she already knows (72, `70-the-call`), Vera understanding the smoothed-flat letter (79, `286-smoothed-flat`).
* **A glitch cut** into the static in the shop window (75). **Smoke** instead of rain particles at the yakitori stall (23, "Smoke. Red paper lanterns."). **Stronger light shafts** in the Hive's corridors (16, 55, 69: "daylight ... in thin cold shafts").
* Checked in headless Chromium (scenes 2, 10, 23, 30, 72, 74, 84 and the raid): the glows sit on their lights and move with the camera, no page errors. Nobody has watched it through yet.

## Depth-map camera (9 and 10 October 2026)

**How to add depth to a picture, check it and wire it in is in `docs/depth-camera.md`; read it before touching a depth map.** This section records what the film has.

A still picture paired with a grayscale depth map (white = near, black = far) plays as a slow camera move with depth: a push (a dolly in that eases out and holds), a truck (a sideways slide round the still plane, then holds) or a drift (a slow loop). A picture with people in it also has a **plate** (the picture with the people painted out) and the people as **cut-outs** (transparent PNGs), so the plate moves through the map and each person moves as one solid layer and never stretches. The engine is `src/game/DepthParallax.tsx` (fields in `docs/depth-camera.md`; the canvas sits inside the plate's own layer under the grade, glows and flares; the still picture shows until every layer has loaded, without WebGL, and with reduced motion; never in the 🛤 dolly mode). The Studio's Camera has a 🧊 Depth-map camera panel. `npm run test:film-depth` checks every map, plate and cut-out, and fails if a picture listed in `peopleInShot` (`docs/film-depth-layers.json`) has depth without cut-outs.

**What the film has:**

* **Scene 74, the first three** (9 October): `74-twenty-metres-apart` (truck right round Vera and Jack), `75-one-desperate-blow` (push in on them) and `73-two-small-figures` (push on the wide). Depth Anything maps, cut-outs (BiRefNet) and plates (LaMa), from `tools/make-depth-layers.py`. `76-the-reflection` has no depth: a reflection moving like the street looked wrong.
* **Fourteen shots with people, on the director's own maps** (10 October): `104-the-newsroom`, `144-empty` (the hand at the drawer), `179-same-wood`, `195-somewhere-like-this`, `198-the-lanterns-sway`, `200-the-number-114`, `240-the-far-end`, `249-the-chair`, `340-the-shuttered-door`, `346-the-bulb-hums`, `354-the-altar-photograph`, `374-the-dead-television`, `379-the-laundry` and `387-the-street-too-long`. Their maps were good but had been used alone, so the people would have stretched; the people are now cut out and painted out of a plate, and each map is kept as it was made in `source-depth.png` beside the `depth.png` with the people filled in. The boxes round the people are in `docs/film-depth-layers.json` (found with `--find-people`, then checked by eye): 23 cut-outs holding 23 people and a hand, every shot's own move kept. Left in their plates on purpose, on moves too small to stretch them: the diners behind Ishida and Jack in `198` (a truck round the still plane at their depth, 0.25 since the moves were made stronger, 0.14 before) and the laundry's woman on the right in `379`, half behind a sheet (a drift, 0.16, 0.09 before; she moves a pixel or two against it). The face on the dead television in `374` is a reflection and moves with the screen.
* **Twenty-eight empty locations with a map alone** (10 October, the director's maps): `01-backstreet`, `02-vending`, `19-the-bar`, `29-apartment-block`, `30-the-elevated-line`, `31-the-lit-window`, `32-laundry-in-the-rain`, `43-the-front-counter`, `51-the-interview-room`, `63-the-detectives-room`, `68-the-clock`, `78-the-empty-lounge`, `79-the-hive-shut`, `80-the-machine-waits`, `81-static-in-a-window`, `134-the-walkway-is-empty`, `142-taillights`, `173-four-black-sedans`, `205-a-light-ahead`, `234-a-different-clock`, `278-the-clock-reads-ten`, `307-the-gardener`, `313-drawings-in-the-water`, `314-the-empty-crossing`, `335-the-lane-mouth`, `364-the-kotatsu`, `377-the-hive-remembered` (also on the prologue's backdrop: `pictureLook` now reaches it) and `383-the-empty-lane`, plus the opening titles' `m4-railway-rain`.
* **Camera under the depth:** most run `mode: "pan"` with a 2% drift (`panDistance` 2, `zoomDuration` equal to `depthSeconds`), added on 10 October so the restrained moves read; amounts are 0.14 to 0.45.
* **Time on screen:** most depth shots wait for the reader's click, so their move plays out. Eight end their scene with the automatic cut a second after the line (`31-the-lit-window`, `68-the-clock`, `173-four-black-sedans`, `179-same-wood`, `205-a-light-ahead`, `234-a-different-clock`, `278-the-clock-reads-ten`, `307-the-gardener`) and two are backdrops in the timed raid, about 4 s a shot (`379-the-laundry`, `134-the-walkway-is-empty`): only the first seconds of their 14 to 26 s moves are seen, which on an eased move is hardly any movement. Shorten their `depthSeconds` if the move should read there.
* **Removed on 10 October:** 17 maps made by a tool that guessed depth without a model (`tools/make-depth-map.py`, removed with them). They did not follow their pictures (blobby; in `228-nine-oclock` the two men came out farther away than the dashboard), and 16 of the 17 shots had people in them: `88-the-walkway`, `91-grey-light`, `109-the-fortieth-floor`, `130-the-roof`, `135-below-the-viaduct`, `153-the-rain-has-stopped`, `160-were-closed`, `184-a-gap-in-someones-teeth`, `203-the-sea-wall-steps`, `206-the-window-swollen-shut`, `207-the-pink-payphone`, `211-wet-tin`, `228-nine-oclock`, `229-like-a-date`, `290-daylight-again`, `297-the-glass-office` and `337-engine-off` play with their usual camera again. They can have depth later the way `docs/depth-camera.md` describes.
* **The generated film was hand-edited** on 10 October (the sessions could not run the builder), and had drifted from `studio-edits.json`: old focal points and timings on several beats, depth typed straight onto scene backdrops. It is rebuilt with `node tools/build-film-story.mjs` again; never edit `src/data/nobodysWitnessFilm.ts` by hand.

## The film is reproducible from the Studio (12 October 2026)

A depth map, a beat sound effect and a recorded ambience loop uploaded in the Studio reach the saved draft, the exported reel and the player: `docs/film-backend.md`, `npm run test:film-backend` (43 checks), `npm run test:film-backend:browser`. The film's whole export is about 387 MB. Before this pass the export dropped 135 sfx and ambience files, the validator gave 143 false warnings on the film and `particleConfig` did nothing.

## Scene 4: the neighbour's radio through the wall (12 October 2026)

The screenplay has "through the thin wall, a neighbour's radio plays an old ballad, muffled" under Vera's voicemail call in scene 4, and the film had nothing there. The director's song (`It ain't easy`, the same one as the radio in scene 65) now plays under it as `public/film/audio/it-aint-easy-wall.mp3`: the 65 radio baked once more through a 170 Hz to 1.3 kHz band and 5.5 dB down (mean about -20 dB; made with ffmpeg from `it-aint-easy-radio.mp3`, which is untouched), at level 0.4 (0.48 in 65), once, fading in over 4 s. Scene 5 (`musicMode: "none"`, 3 s) ends it as the door closes. Both are `scenes` edits in `src/film/studio-edits.json` (`nw_s4`, `nw_s5`), so they can be changed in the Studio's scene Music controls. **Not changed on purpose:** scenes 66, 72 and 73 keep *Bad Guy* (piano in the lounge, the full song from 72 on), which is the director's own instruction of 11 October; the screenplay's ballad would be *It ain't easy* there too, but no piano version of it exists. Swapping 72 and 73 is one `scenes` edit each.

## Kitchen and doorway escape redrawn (16 October 2026)

The director requested more action and corrected characters in `s90/131-she-jumps.jpg` and `s90/132-the-gap.jpg`. Both plates are replaced with the director's selected AI-generated takes, using Jack's established face sheet, Vera's face-authority sheet and the corrected plank shot for wardrobe continuity. The kitchen and interconnected-doorway settings remain faithful to scene 90 despite the legacy filenames; the pair now move urgently through them rather than standing still. Filenames and playback settings are unchanged. No depth layers were added. As with the plank, a future PlayFrame import must not overwrite these replacements with the older source images.

## Handwriting corrected and Kaneko arrival added (16 October 2026)

` s6/322-her-handwriting.jpg` is replaced with the director's selected take: Vera writes on the flat form while Ishida sits normally opposite and reads across the table, rather than peering below its edge. Scene 71 gains `s71/kaneko-comes-to-help.jpg`, the selected cutaway of Kaneko hurrying in her apron through the waking passage. A `pictures` Studio edit places it on Mara's “Everyone's awake.” line, immediately after “Mara looks up at all the light.” The existing dialogue, subsequent shots and Kaneko's later page-gathering and folded-apron actions remain unchanged. Rebuilt the film data; backend and depth tests could not start because the checkout lacks the `esbuild` dependency. No depth layers added.

## Vera's hurried steps, reflections and doorway (16 October 2026)

The director's selected vending-machine replacement is installed in both `s73/71-the-machine-glows.jpg` and `s73/548-the-machine-glows.jpg` (previously the same plate). Vera's movement is a panicked, unsteady short step in high heels rather than an athletic sprint; the wet pavement carries stronger reflections of her red dress and the machine's light. `s78/88-the-walkway.jpg` is replaced with the selected correction keeping Vera inside the apartment doorway, with the envelope on the exterior mat. Existing filenames and shot timing remain unchanged. Future PlayFrame imports must preserve these replacements.

## Pickup aftermath at night (16 October 2026)

The director selected nighttime replacements for `s50/216-hand-starts-to-shake.jpg` and `s50/464-soaked-and-creased.jpg`. Jack, the injuries, receipts and cracked windscreen retain continuity, with headlight and dashboard lighting instead of daylight. Scene 50's heading, time and opening narration now say night rather than dawn/grey light. A selected new exterior rear view, `s50/the-pickup-drives-on.jpg`, appears on “He drives on. The wipers beat.” after the interior shots, through the existing Studio `pictures` override. Film data rebuilt; no new depth layers. Future source-media imports must not overwrite the replacement interiors.

## Lost heel continuity and session verification (16 October 2026)

`s73/72-the-lost-heel.jpg` now uses the director's selected night reshoot: Vera approaches the camera in the matching red dress, phone in hand, panicked and uneven, one foot bare and the matching black heel left behind. No vending machine remains in this shot. All selected replacements from this session are installed at the film's existing paths; the Kaneko and departing-pickup additions are wired through Studio overrides and the generated film. Installed locked dependencies and verified: film backend **126 checks passed**, film depth **all checks passed**, production build **passed** (existing unresolved `/assets/UI/evidence_board.jpg` warning). These successful checks supersede the earlier dependency-blocked test attempts recorded above.
