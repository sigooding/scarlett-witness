# The director's notes of 20 October 2026: what was done, what is still to do

The director watched the film and sent eleven notes. Five were sound or text changes and are **done** in this repository
(rebuilt, checks passing). The picture problems are written as **retake briefs** for an image generator, in the same form as
`docs/picks-review-2026-10-19.md` (whose "How to run any brief" rules apply: a new filename, never over a file; attach the
references; end with the style line; install with `tools/install-film-picture.mjs`). One note changes the story and **needs the
director's word** before anything is made.

| # | Note | Where | Status |
|---|---|---|---|
| 1 | The phone during Jack's escape from the inn should sound distant, indoors | Inn raid run, "Inside, the payphone is still ringing." (the back yard, 49) | Done |
| 2 | The fire door sounds like a gunshot | 63A, Ueno arches: "out through the fire door at the back" | Done |
| 3 | Don't end Bad Guy at Jack, play it to the end | The Bad Guy run (72–77), Jack's office after it | Done |
| 4 | Jack and Ishida in the car: get rid of "He takes it." | 61: "Jack studies the side of his face. It is the answer he needs." | Done |
| 5 | Daniel's diary should not mention Vera | 79: the last diary entry | Done |
| 6 | The plaza model should look the same, and needs a style sheet | 51 (310, 311) against 83 (109, 515, 113) | Retake briefs |
| 7 | The journalist's photo is not on Harada's desk | 53A (468); also 82 (107) | Retake briefs |
| 8 | The empty room is too literal | 59 (365, 367) | Retake briefs |
| 9 | The lobby: the phone is the wrong way round; she leaves the bar calmly | 72 (72-01 to 72-05) | Retake briefs |
| 10 | In Vera's run Jack sometimes turns Japanese | 74 (74-05, 74-10, possibly 74-15) | Reminder + briefs |
| 11 | "I have never killed anyone…": Jack hits him | 80 | Needs the director's word |

---

## Done

### 1. The payphone during the escape sounds distant
In the inn raid run the payphone rings twice: in the lobby (179, "The pink payphone starts to ring", Jack watching from the
corridor) and from the back yard (215, "Inside, the payphone is still ringing", Jack and Vera outside). The second now plays
`public/film/sfx/phone-distant.mp3`: the same ring through a 280–1,300 Hz band (heard through the walls), a short room echo, and
about 11 dB quieter than `phone.mp3` (average −28.5 dB against −16.7 dB). The lobby ring is unchanged, since Jack is in the same
space as the phone there. The change is the shot's `sfx` in `studio-edits.json` → `cutscenes` → `inn-raid`. **Nobody has listened.**

### 2. The fire door no longer sounds like a gunshot
- **The heading in the note:** the only fire door sound in the film is in **63A** (EXT. UENO, UNDER THE RAILWAY ARCHES), where
  Jack slips through the pachinko parlour "out through the fire door at the back". Scene 70 (the service road behind the Hive)
  has no door sound. Its loud hits are the suppressed shots ("From the dark between the pillars: muzzle flashes") and Mara's
  fall through the doorway.
- **Why the old one sounded like a shot:** `fire-door-bang.mp3` is a single hit 0.1 s in: it rises 11 dB in a few milliseconds
  and falls 14 dB within a tenth of a second. That is the shape of the gunshot effect.
- **The new sound:** four new takes were generated (ElevenLabs `eleven_text_to_sound_v2`, about 67 credits). The prompt was a
  steel fire door at the back of a noisy pachinko parlour: the push bar pressed down with a dull clunk, the door swinging open on
  stiff hinges, rain outside, then the door drifting shut on its closer with a soft latch click.
- **The pick:** take 2, chosen by measurement. It runs 5 s: the push bar and the opening, rain, the door easing shut, the latch.
  Its loudest moments rise and fall only 6–7 dB. Takes 1 and 4 are as abrupt as the old bang. The pick is levelled to −6.5 dB
  peak as `public/film/sfx/fire-door-push-bar.mp3`, at the same volume, 0.7.
- **The files:** all four takes are in `public/film/sfx/alternates/fire-door-push-bar--v1…v4.mp3` (ElevenLabs does not keep
  audio), from flow `p53iu2OofmcHR6K7oHac`, generations `ArS4WUODJy0TjMbLSbbt`, `CIAMGyYBFPibj68zAqiI` (the pick),
  `H5x2IGTwF4BTP8o3y4v7` and `zvWrbyXBM7ORaLFxPHa6`. `fire-door-bang.mp3` stays on disk.
- **Nobody has listened.** If the director heard the bang somewhere else, name the line and it can be looked at.

### 3. Bad Guy plays to its end
The run used to end about 263 s into the 268 s song. Jack's office after it then faded the song out over 3 s, so the song's last
seconds were lost. The run now carries `songRunsOn` (the switch the inn raid's "Hounds" already had, now understood by
soundtracks too in `tools/build-film-story.mjs`). The song plays on under the rest of Jack's office (five click-through beats)
until it ends by itself. Scene 78 still sets music off with a 4 s fade, so a reader who clicks through very fast still gets a
fade rather than a cut.

### 4. "He takes it." is gone from scene 61
"Jack studies the side of his face. It is the answer he needs." Changed in the narration and in picture 481's quote (both in
`src/film/story.json`).

### 5. Daniel's diary no longer mentions Vera
- **The new entry** ends "…If something happens to me, it will not be what they say." It no longer goes on "Tell Vera. When she
  is old enough. Tell her it will not be what they say."
- **The recording:** the take divides into seven pauses that match the entry's seven sentences, and "Tell Vera." starts at
  10.5 s after a pause. It is cut there with a 0.2 s fade, as a **new file**,
  `public/film/voice/s79/94-daniel-quietly-they-followed-me-home-again--no-vera.mp3` (10.3 s). The full take is untouched.
- **The pictures:** neither diary picture (505–508, 92) shows "Tell Vera" legibly. The pages are illegible pseudo-handwriting.

### Still to do for 4 and 5 (outside this repository)
PlayFrame's screenplay (`docs/neonoire/…`, the Fountain and the bible) and the visual novel still have "He takes it." and the
"Tell Vera" sentences. If the film is ever re-imported from them, both come back. Make the same two changes there, as a bible
Part 9 item with the text-sync for saved workspaces, before the next import.

---

## Retake briefs

### 6. The plaza model (51 and 83) and its style sheet
- **What is wrong:** the model changes between the two scenes in Kurose's office.
  - **51, 310 (the model at dawn):** open, on the long dark-wood meeting table the screenplay describes. A white plaza, two or
    three white towers, sponge trees, and the Hive as a small **brown**, patched block at the plaza's edge. Tea on a tray.
  - **51, 311 (the hand on the model):** the Hive Kurose lifts out is **grey**, and the towers are grey glass.
  - **83, 109, 515, 113:** the model is inside a **glass display case on a white plinth** by the window, with a **green lawn and
    a fountain** in the plaza.
  - The screenplay has one model on its long table, and in 83 "Where the Hive stood, there's only the white plaza. Tiny painted
    people cross it." The built plaza in 99A (305) is pale paving with a strip of grass and a bench, so the model's plaza should
    read the same.
- **First make the style sheet:** `sheets/kurose-plaza-model.jpg`
  - **Attach:** `s51/310-the-model-at-dawn.jpg` (the master), `s51/311-the-hand-on-the-model.jpg`, `s99a/305-the-plaza.jpg`
    (the built plaza), `sheets/kurose.jpg` (his hand and watch), `kurose_new/05-s94-only-tea.jpg` (the watch in 94).
  - **Prompt:** *A model-maker's reference sheet on a plain dark grey background for one architectural model, the Kurose
    redevelopment. The model sits on a white base, 1.8 m long, on a long dark-wood meeting table. A broad white plaza of pale
    square paving with a narrow strip of green grass and one bench, tiny painted people crossing it. Two tall glass-and-white
    towers and one lower block behind, round sponge trees along the edge. Panel A: the model at dawn, with the Hive at the
    plaza's front left edge: a small, dark brown, patched, many-windowed tenement block, out of place. Panel B: the same model
    with the Hive lifted out, the plaza underneath already finished, painted people where it stood. Panel C: a close-up of the
    Hive block on a steel tray beside a white cup of tea. Panel D: a man's clean hand with a silver watch on a black leather
    strap, lifting the block. Same model, same angle and same colours in A and B.* + style line.
- **Then retake to match it** (attach the sheet and the picture being redone, for composition):
  - `s51/311-the-hand-on-the-model-r1.jpg`: the block he lifts is the brown, patched Hive of 310.
  - `s83/109-the-fortieth-floor-r1.jpg`, `s83/515-he-pours-her-tea-himself-r1.jpg`, `s83/113-very-clean-r1.jpg`: the model
    stands on its long table as in 310, with no glass case, no plinth, no lawn and no fountain; in 113, Vera looks down at the
    white plaza where the Hive stood (panel B). Check scene 83's other pictures (110, 111, 112, 114) too, wherever the model
    is in view.
  - **Or the other way:** if the director prefers the glass case of 83, the sheet shows the case and 310/311 are redone into
    it. Choose one.
- **Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9. Grey daylight through a fortieth-floor window,
  cool slate tones, one warm desk lamp, restrained 35mm grain. No legible text, signage, logos or watermarks.*

### 7. The journalist's photograph is on the wrong desk (53A) and has the wrong face (82)
- **53A, 468 ("On her desk, a framed photograph of the journalist…"):** the frame stands on a cluttered desk out in the open
  newsroom, with Harada small in the background. It belongs on **Harada's own desk inside her glass-walled office** at the back,
  where Vera sits across from her and leaves the card beside it (299).
  - **Make:** `s53a/468-the-photograph-on-her-desk-r1.jpg`
  - **Attach:** `s53a/297-the-glass-office.jpg` (the office), `s53a/299-the-card-on-the-desk.jpg` (her desk and the frame),
    `sheets/harada.jpg`, `s2_new/style-sheets/refs/journalist-face.jpg` (the face in the photo).
  - **Prompt:** *Inside the editor's glass-walled office at the back of an old Tokyo newsroom: on Harada's own uncluttered
    desk, in the foreground, a dark wooden frame holding a photograph of the journalist (40s Japanese, short receding dark hair,
    wire-rim glasses), laughing at an office party. Beyond the glass, soft, the busy newsroom and its televisions.* + style
    line.
- **82, 107 ("Then she looks at the photograph of her dead reporter"):** the photo shows a different man, younger, with curly
  hair and no glasses.
  - **Make:** `s82/107-her-dead-reporter-r1.jpg`, keeping 107's composition.
  - **Attach:** the journalist's face sheet as above, and 468 or 299 for the frame.
  - **Prompt:** *Keep this picture exactly. Change only the photograph in the frame: the same journalist and the same party
    photograph as on her desk in the earlier scene.* + style line.
- **Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey office daylight and fluorescent
  tubes, restrained 35mm grain. No legible text, signage, logos or watermarks.*

### 8. Mrs. Sakai's empty house: empty of her, not of furniture (59)
- **Plays:** the INTERCUT while Jack lets the payphone ring: "The kotatsu. The altar. The television on with the sound off. A
  teacup on its side on the tatami. The phone rings in the empty room."
- **Wrong:** the pictures take "empty" literally.
  - **365 (the altar):** the room is stripped bare. No kotatsu, no television, just the altar on bare tatami.
  - **367 (the phone rings):** another, bare room, with only a phone on a low table under the window.
  - It should be **her room as in scene 29** (`s29/354-the-altar-photograph.jpg`), everything in its place, with nobody in it.
  - Smaller: 364's layout differs from 29's: the altar and television have changed sides.
- **Make:** `s59/365-the-altar-r1.jpg`, `s59/367-the-phone-rings-r1.jpg` (and `s59/364-the-kotatsu-r1.jpg` if the layout is
  to match).
- **Attach:** `s29/354-the-altar-photograph.jpg` and `s29/273-the-receipts.jpg` (her room), `s1/07-old-man.jpg` (Sakai's face
  in the altar photograph), `s59/366-teacup-on-its-side.jpg`.
- **Prompts:**
  - **365:** *Mrs. Sakai's small tatami room exactly as in the reference, nobody in it: the kotatsu with its quilt, the old
    television on with the sound off (a pale blue glow), the Buddhist altar with the new photograph of Sakai, younger and
    smiling. Grey afternoon rain on the window. Hold on the altar.*
  - **367:** *The same room, the same furniture, nobody in it; a cream telephone on the low chest beside the kotatsu, its
    receiver in its cradle, ringing; the teacup on its side on the tatami.*
  - Then the style line: *Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey daylight, restrained 35mm grain.
    No legible text, signage, logos or watermarks.*
- **Check:** the same room as scene 29, furnished, with no one in it.

### 9. The lounge: the phone, and Vera leaving too calmly (72)
- **The phone (72-02):** already briefed as **V4** in `docs/picks-review-2026-10-19.md`: the screen faces the camera; the back
  of the phone should face us, its light on her collarbone.
- **Too calm.** The page says she knows from Ishida's voice. "She stands up. Vera doesn't move. The piano plays on." Then "Vera
  walks out of the lounge. Not running yet. Walking very carefully, as if the floor might…" The pictures show composure:
  - **72-01:** she is still seated on her stool, phone to ear, at ease.
  - **72-03:** she drops the lighter into her bag, unhurried.
  - **72-04, 72-05:** an easy stroll out of the lounge.
- **Make:**
  - `vera_run_takes/72-01-the-piano-plays-on--r1.jpg`: standing, frozen beside the stool, the phone still at her ear, the
    pianist playing on behind her.
  - `vera_run_takes/72-04-walking-very-carefully--r1.jpg`: walking out stiffly, very carefully, one hand trailing along the
    bar rail as if the floor might tilt, her face white and blank with shock, eyes unfocused, the phone forgotten in her hand.
  - 72-03 and 72-05 if they still read calm beside those two.
- **Attach:** `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state A),
  `vera_run_new/style-sheets/loc-hotel.jpg`, the picture being redone (composition).
- **Wire:** `PICKS` in `tools/vera-run-cut.mjs`, `"take:<beat>--r1"`; style line and rules as in the picks review's Vera
  section.

### 10. Jack turns Japanese in Vera's run (reminder)
- **74-05 and 74-10** (the earlier takes the director picked): Jack is a younger man with short black hair in a short jacket.
  This is **V1** in `docs/picks-review-2026-10-19.md`, which has the brief and a no-generation option (pick the new set's
  pictures).
- **74-15** (she pushes him away, new set): seen in profile, he has all-black hair and no grey at the sides; he can read as
  someone else. Borderline. If it is redone: `vera_run_takes/74-15-she-pushes-him-away--r1.jpg`, attaching
  `vera_run_new/style-sheets/jack-that-night.jpg` and `sheets/jack-face.jpg`, with *"Jack, late 50s, Western, lined stubbled
  face, swept-back dark hair greying at the sides"*.
- The rest of 74 and 77 (74-06, 74-09, 74-13, 503, 85, 87…) match his sheet.

---

## Needs the director's word

### 11. Scene 80: does Jack hit Ishida?
- **The scene as written:** after "Twenty years ago. Daniel. Was that you?", Ishida answers "I have never killed anyone in my
  life. I only ever told people where to find them." Then "Jack looks at him for a long time. Ishida almost seems to want him
  to." / "He doesn't." / Ishida: "Where is it? Sakai's thing." Jack walks away, and Ishida, watching him go, looks afraid for the
  first time.
- **The pictures** (94–99) agree with that. No picture shows Jack hitting him.
- **The note:** "skip line, Jack hits him constantly". This reads as a change to the story: drop "He doesn't." (and perhaps
  "Ishida almost seems to want him to."), and have Jack hit him, again and again.
- **Two questions to settle first:**
  1. Does Ishida's line stay, with the blows after it, or is he cut off mid-line?
  2. What happens to the beats after it: Ishida's "Where is it? Sakai's thing." and his fear as Jack goes? Both read
     differently once Jack has beaten him in a room full of detectives.
- **Nothing is changed** until that is settled. Once it is, it needs:
  - the text in `src/film/story.json` (and PlayFrame);
  - new pictures of the blows: brief them on `s80/96-hands-close.jpg` and `s80/97-where-to-find-them.jpg` (the room) with
    `sheets/jack-face.jpg` and `sheets/ishida-face.jpg`, and note that Jack's knuckles already carry dried blood (94, 96);
  - a sound effect or two (punches; ElevenLabs).
