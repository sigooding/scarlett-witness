# Nobody's Witness on the Scarlet Reel engine

The catalogue (`src/data/stories.ts`) holds one story, the film. It is generated, not hand-written:

    node tools/build-film-story.mjs     # src/film/story.json -> src/data/nobodysWitnessFilm.ts + public/film/*

One scene node per film scene; every shot is a dialogue beat's background, so the dialogue player, Studio flowchart and saves work unchanged. The prologue (Kaneko over the Hive) is the first node and the credits (over `nobodys-witness.mp3`) the ending. `src/film/story.json` is the same data the standalone visual novel on `main` is built from. The other stories are untouched in `src/data/`; import them in `stories.ts` to bring one back.

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

## The radio song, the credits, no saxophones, the animatic export (10 October 2026)

* **Scene 65:** the director's song *It ain't easy* is the neighbour's radio through Vera's wall, as an AM radio: `it-aint-easy-radio.mp3` is the upload (`public/film/audio/It ain't easy.mp3`, untouched) through mono, 280–3,200 Hz, light compression and faint hiss, loudness-matched to the song it replaced on 11 October 2026 (`soundtrack_nobodys_witness.mp3`). It starts on "the neighbour's radio begins to play" (the scene splits there into `nw_s65_b`, which also keeps the room tone and the window rain), plays once at 0.48 (0.6 before 11 October) under the rest of the scene (the make-up, the umbrella, "Borrowing it."), and fades over 4 s as the hotel lounge (66) begins. Cue `radio` in `tools/build-film-story.mjs`; the visual novel's importer puts it in `src/film/story.json`.
* **Credits:** "Written by Scott Gooding" and "All music written by Scott Gooding · enhanced with suno.ai" in the end credits (`creditLines` in the builder) and on the opening titles (the `nw_title` Studio edit in `src/film/studio-edits.json`).
* **No saxophones:** the director wants none. The screenplay no longer mentions one (scenes 4 and 65, changed in PlayFrame), and the `dj-through-wall` effect (scene 4), whose take had a saxophone in it, is gone with its files.
* **Depth moves made stronger:** every `depthAmount` raised (cut-out shots about 1.8 times, up to 0.8; map-only shots about 1.6 times, up to 0.6), and push and truck now move most in their first seconds (`docs/depth-camera.md`).
* **🎞 Export animatic** on the home screen renders the film or a run of scenes to an MP4 with the effects, the depth camera, the sound, subtitles and descriptions burned in: `docs/animatic-export.md`.

## Every picture gets its own words (9 October 2026)

Several shots often cover one paragraph of the screenplay. The visual novel holds each for 2.2 seconds; this film used to let the last one win, so **16 of the 365 pictures were never shown** (Mara walking in scene 1, the journalist turning in scene 2, the laundry in 3, Mrs. Sakai's empty house in 59, and more). Now the builder cuts the paragraph where the next shot's quoted beat begins (each picture step in `src/film/story.json` carries `quote`, the words PlayFrame's board says the shot covers), shares a spoken line's takes between the pictures whose beat it is, and gives a picture left with no words of its own a short caption: `"pictureCaptions"` in `src/film/studio-edits.json` (picture file name to text), else the shot's title. All 365 pictures play. A closing CUT TO BLACK no longer leaves a "·" beat to click.

## Songs play once (9 October 2026)

The engine loops a scene's music until another cue changes or silences it; that suits a bed but not a song: "Bad Guy" (4:28) under scenes 72–77 would start again in scene 77 if the reader took longer than the song, and the opening titles (set to 300 s over a 3:53 song) restarted theirs. A scene can now set `musicLoop: false` (`src/types.ts`): the track it starts plays once, and a click or the sound toggle never restarts a song that has finished. The film's songs (the opening titles, the scene-72 song, the raid) carry it; the opening titles now last 232 s, the song's length, and the end credits run for their roll.

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

**Scene 78.** The "midnight in the rain" cue is removed (the scene is music-off, 4 s fade); the opening-scene score `midnight-in-the-rain-v6.mp3` is a different file and stays.

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

Fields: `from`, `to` (node ids, parts included), `stopBefore` (the text of the first beat that is left to the ordinary scene), `musicUrl`, `seconds`, `fadeIn`, `fadeOut`, `slack`, `endHold`, `captionSeconds`, `lag`, `captions`, `cues`. `node tools/build-film-story.mjs` applies it after the Studio edits; the original scenes stay in `src/film/story.json`. Deep link: `?story=nobodys-witness-film&scene=nw_song_raid_01`.

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
| `fire-door-bang` | 63A |
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
