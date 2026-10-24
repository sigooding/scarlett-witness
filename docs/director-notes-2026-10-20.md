# The director's notes of 20 October 2026: what was done, what is still to do

The director watched the film and sent eleven notes, then four more marked on a contact sheet of scene 74, one on scene 83 and
one on Kaneko's pipe.
**No pictures are being generated for now (not enough credits): every picture item stays as a brief until there are.** The sound and text
changes are **done** in this repository (rebuilt, checks passing), and so are the scene 74 pictures that had a ready replacement.
The remaining picture problems are written as **retake briefs** for an image generator, in the same form as
`docs/picks-review-2026-10-19.md`. That doc's "How to run any brief" rules apply: a new filename, never over a file; attach the
references; end with the style line; install with `tools/install-film-picture.mjs`. Scene 80's change was written on the
director's go-ahead ("you recommend"); its pictures are still to make.

**For the image generator:** `docs/image-brief-2026-10-20.md` collects every picture still to make from these notes and from the
picks review, in priority order, ready to hand over. Every retake there lands in `public/film/img/retakes_2026_10_20/` and the
scene 80 pictures at their slot paths in `s80/`; where its file names differ from the ones below, use the brief's.

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
| 10 | In Vera's run Jack sometimes turns Japanese (marked 2 and 3 on the contact sheet) | 74 (74-05, 74-10) | Done: shipped pictures with the right Jack |
| 11 | "I have never killed anyone…": Jack hits him | 80 | Text and sound done; four picture slots waiting for their files |
| 12 | His hands are too dirty (marked 1) | 74 (74-03) | Retake brief |
| 13 | The reflection shows her with the blue umbrella she left behind (marked 4) | 74 (74-18) | Done: Vera covering her face |
| 14 | Kurose's office, "It's just a face.": Vera has no coat, and holds a notebook, not the photocopies | 83 (111, 112) | 111 done (archived take); 112 retake brief |
| 15 | A sound for Kaneko banging the pipe with the spanner | Raid run, 86-02: "Kaneko strikes the iron pipe three times" | Done 22 October, from the director's uploads |
| 16 | (21 October) Jack's "Three feet away." should say "Right behind the curtain." | 84, Jack and Vera at Kaneko's | Done; take recorded 24 October |
| 17 | (21 October) Jack's confession goes on "I trusted him. I'm so sorry." | 84 | Done; take recorded 24 October |
| 18 | (21 October) The picks of the brief's 17 pictures: three need redoing | 51, 59, 53A, 72, 74, 78, 80, 82, 83, 6, 61, 2 | 13 in the film; 316, 367, 468 redone 24 October (note 21) |
| 19 | (21 October) Pictures too low resolution; no picture may ever be downscaled | the 26 below | Listed; rule written |
| 20 | (24 October) In the storeroom, Jack's answer to "I don't know if I'm as good as he was." should be "No one's asking you to be." (was "I'm not asking you to be.") | 84 | Done; take recorded |
| 21 | (24 October) Redo 316, 367 and 468 (note 18), and 352 at full size | 78, 59, 53A, 23 | Done; nobody has seen them in the film yet |
| 22 | (24 October) The inn: opening pictures show what hasn't happened yet; the pink payphone has two handsets; Mrs. Noda too calm in the raid | 30–38, 35, 44 | Done; nobody has seen them in the film yet |
| 23 | (24 October) Outside the Hive Vera sees Jack on the green phone; she should see him walking back | 59 | Done (film only) |
| 24 | (24 October) The cut-out picks: 69 kept, 3 out, 4 redone | 1, 2, 72–76 | Done |
| 25 | (24 October) Mrs. Sakai: "Twenty years." becomes "For years." | 29 (and 34's narration) | Done; new take |

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
- **Decided (21 October): the glass case.** It is in six of scene 83's pictures and only 310 and 311 would need redoing, so it
  costs two retakes instead of five or more. The image brief (item 1) takes that route: the sheet shows the model in its case,
  and 310 and 311 are redone into it. The long-table route above stays written in case the director prefers it.
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

### 10 and 13. Scene 74: the wrong Jack and the umbrella reflection (done, no new pictures)
The director marked them on a contact sheet. All three takes are replaced by pictures already made, changed in `PICKS` in
`tools/vera-run-cut.mjs` (the takes stay on disk):
- **74-05 ("She is crying, almost silently"):** the take was the wide of 74-04 again with a different, Japanese-looking Jack.
  The shipped wide (`s74/74-twenty-metres-apart`, the right Jack) now holds through both lines: one picture, two captions.
- **74-10 and 74-11 ("She hits him…", "Her hands just fall"):** the take had the same wrong Jack. The shipped
  `s74/75-one-desperate-blow` is the same composition (her hand at his chest by the shutter) with the right Jack, and plays on
  both beats, with its own depth look.
- **74-18 ("Vera covers her face with her hands"):** the take showed, right under her feet, a reflection of someone with the
  pale blue umbrella, so it read as her own reflection holding an umbrella she left in the lounge. The new set's 74-18, Vera
  covering her face (the screenplay's beat), plays instead.
  - The screenplay's figure under a pale blue umbrella "who could be Mara, or could be no one" is still in 74-17, small and away
    from her in the reflection.
- **74-15** (she pushes him away), flagged as borderline earlier, was not marked by the director and stays.
- **The run now:** 28 new pictures, 15 shipped and 5 earlier takes (was 27, 14 and 8).

### 12. His hands are too dirty (74-03)
- **Plays:** "His hands are dark. He has not washed them." The hands are caked, as if dipped. The jack-that-night sheet has the
  same look, so it should not be attached for the hands.
- **The scene:** it is Mara's blood, hours old, with the rain on it. Dark in the creases of the knuckles and around the nails,
  thinned by rain, not caked.
- **Make:** `vera_run_new/74-03-his-hands-r1.jpg`, as an edit of `vera_run_new/74-03-his-hands.jpg`.
- **Attach:** the picture itself, and `s80/96-hands-close.jpg` for the amount of blood, which is right there.
- **Prompt:** *Keep this picture exactly: the same framing, coat, rain and light. Change only his hands: much cleaner, wet with
  rain, with dark dried blood left only in the creases of the knuckles and around the fingernails, as if he had not washed them
  and the rain had thinned it. No caked mud, no gloves of blood.* + the Vera section's style line.
- **Wire:** install it, then `PICKS["74-03-his-hands"]`. It is a new-set picture, so either save it as a take
  (`vera_run_takes/74-03-his-hands--r1.jpg`, `"take:74-03-his-hands--r1"`) or point the plan's picture at the new file.

---

### 14. Kurose's office: the coat and the photocopies (83)
- **The page:** "She wears a plain dark coat. A plain folder is on her lap, her hands flat on its cover: photocopies of every
  page of her father's notebook." In 82A Harada hands her the copies in a buff folder: "The copies. Not the original." Later in
  83: "Vera stands. She holds up a page of the photocopy."
- **111 ("It's just a face."), done:** she sat there in a grey sweater with no coat; every other shot of the scene has her navy
  coat. Both archived takes of 111 have the coat on. Take v2 (navy coat over the grey sweater and white collar, Kurose's shoulder
  in the foreground) matches the scene and now plays, installed as `s83_picks/111-just-a-face-v2.jpg`. `s83/111` stays on disk.
- **112 ("My father kept notes. He wrote your name on every page."), to make:**
  - **Wrong:** she holds up the dark green bound notebook, the original her father wrote in, which stayed with Harada. The
    archived take v1 has a bound booklet too.
  - **Make:** `s83_picks/112-every-page-r1.jpg`
  - **Attach:** `s83/112-every-page.jpg` (composition), `s82a/302-the-copies.jpg` (the buff folder of copies), `sheets/vera.jpg`
    and `sheets/vera-face.jpg`, `sheets/kurose.jpg`.
  - **Prompt:** *Keep this picture exactly: Kurose's fortieth-floor office, Vera standing by the chair in her navy coat, Kurose
    seated at his desk looking up at her. Change only what she holds: one loose photocopied sheet, white A4 with grey copied
    handwriting, held up toward him at chest height, not threatening; the buff card folder of copies in her other hand. No
    bound notebook.* + the plaza model section's style line.
  - **Wire:** change the step's `src` in scene 83 of `src/film/story.json`.
  - **Check:** a loose sheet, not a book; her coat on.

## Scene 80: Jack hits Ishida

The director asked for a recommendation, with one condition: Ishida still asks for Sakai's thing, because he needs it.

### What was decided, and why
- **Ishida finishes his line.** "I have never killed anyone in my life. I only ever told people where to find them." is the
  confession that sets Jack off, so it plays whole and the blows answer it.
- **"He doesn't." becomes "He does."** The line before it, "Ishida almost seems to want him to.", now pays off.
- **No one steps in.** At the shift change there are only two young detectives, at the far end. They get to their feet, but
  Ishida waves them back from the floor. He wants this, and he does not want it on the record.
- **He still asks for the tape, in the same calm take.** Asked with blood on his hand, the question shows what matters to him.
  He still looks afraid as Jack goes: Jack knows now and has nothing left to lose.

### The scene now (`src/film/story.json`, scene 80)
> **ISHIDA:** I have never killed anyone in my life. I only ever told people where to find them.
> Jack looks at him for a long time. Ishida almost seems to want him to.
> He does.
> Jack hits him. Ishida doesn't lift his hands. Jack hits him again, and again. The chair goes over. Papers slide off the desk.
> At the far end of the room, the two young detectives are on their feet.
> From the floor, Ishida lifts one hand. Not to Jack. To them. They stay where they are.
> Jack stands over him, breathing hard. His knuckles are bleeding again.
> Ishida wipes his mouth with the back of his hand. Looks at the blood on it. Then up at Jack.
> **ISHIDA:** Where is it? Sakai's thing.
> Jack turns and walks away down the long room, past the desks, past the clock.
> Ishida watches him go. For the first time, he looks afraid.

### The blows
- **The effect:** `public/film/sfx/punches-chair.mp3` plays on "Jack hits him." (2.6 s): three blows 0.75 s apart, then the
  chair and papers going over.
- **How it was made:** none of four ElevenLabs takes (about 67 credits) had three separate blows, so it is spliced from take 1's
  opening hit and take 2's two blows and clatter, levelled to −3 dB peak.
- **The takes:** all four are in `public/film/sfx/alternates/punches-chair--v1…v4.mp3`, from flow `dQaLxAPwSGZ9sZWcNmuM`
  (generations `CgSAb3b4bthF70sw2Yz8`, `hdTM6CdvXIyWpUOLiRxE`, `pCcUKvruC4Rmn2TcY6yh`, `S5T3EEKaxOpAhvzdYLMk`).
- **Nobody has listened.**

### Still to make: the pictures (their slots are in the film already)
Each new picture has a **slot**: an entry with `"pending": true` and its brief in `studio-edits.json` → `pictures`, on the beat it
belongs to. Install the file under that name, rebuild, and it comes up by itself; until then the beat keeps the picture before it
(the build lists the slots still waiting). For now the new beats play over 97 (Ishida looking up at Jack), and 98 and 99 show
Ishida unhurt at his desk.
- **Attach for all:**
  - `s80/94-the-long-room.jpg` (the room, the clock, the two detectives at the far end);
  - `s80/97-where-to-find-them.jpg` (Ishida at his desk);
  - `sheets/jack-face.jpg` and `sheets/ishida-face.jpg` (`ishida.jpg` for his charcoal jacket, grey shirt, no tie);
  - `s80/96-hands-close.jpg` (Jack's knuckles).
- **New pictures** (film-only, named like `s25/the-rice-goes-cold.jpg`, so they take no PlayFrame shot number), each with the
  beat its slot puts it on:
  - `s80/jack-hits-him.jpg`, on "Jack hits him. Ishida doesn't lift his hands. …", where the blows are heard: a close, low
    angle across Ishida's desk. Jack's fist landing on Ishida's jaw, Ishida's hands down at his sides, papers lifting off the
    desk.
  - `s80/the-chair-goes-over.jpg`, on "At the far end of the room, the two young detectives are on their feet.": wider.
    Ishida on the floor between the desks, the chair on its side, papers scattered. Jack standing over him. At the far end the
    two young detectives on their feet, frozen.
  - `s80/not-to-jack.jpg`, on "From the floor, Ishida lifts one hand. …": low, from behind Ishida on the floor. His raised
    hand, palm out, toward the detectives at the far end, who stop. It holds through "Jack stands over him, breathing hard."
  - `s80/the-blood-on-his-hand.jpg`, on "Ishida wipes his mouth with the back of his hand. …": close. Ishida looks at the blood
    on the back of his hand, a split lip, then up. It holds through "Where is it? Sakai's thing."
- **Retakes of what follows,** with the same hurt Ishida (split lip, collar pulled open, hair out of place, the chair on its
  side behind him):
  - `s80/98-past-the-clock-r1.jpg`
  - `s80/99-afraid-r1.jpg`
- **Later the same night (93, 94):** Ishida leaves the station and gets into Kurose's car; he should still carry the split lip.
  `kurose_new/` and `s93`/`s94` show him unmarked.
- **Install:** `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs <generated> public/film/img/s80/<name>.jpg`, then
  `FILM_SRC=/nonexistent node tools/build-film-story.mjs`. The retakes of 98 and 99 are swapped in at their steps in scene 80 of
  `src/film/story.json`.
- **Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat fluorescent office light, grey daylight
  through the blinds, restrained 35mm grain. Violence shown in impact and aftermath, no gore. No legible text, signage, logos or
  watermarks.*

### Also outside this repository
PlayFrame's screenplay still has "He doesn't." The same change belongs there (a bible Part 9 item), with the rest listed under
4 and 5.

## 15. Kaneko's pipe: done from the director's uploads (22 October)
- The director uploaded two sounds to `uploads/` ("one metal pipe strike.mp3", 41 s; "metal pipe vibrating after hits
  (needs a fade).mp3", 22 s). Neither is a single hit: the strike rings loud for about 4 s before its next hit, the
  vibration hums for about 7 s. The uploads are untouched; three files were cut from them, levelled to −3 dB peak:
  - `public/film/sfx/pipe-three-strikes.mp3` (6.5 s): the strike's first 0.75 s twice, then a third that rings out with the
    vibration under it, faded to silence. It plays on 86-02 (raid soundtrack cue, volume 0.9) and rings on under the shutter
    coming down.
  - `pipe-strike-faded.mp3` (4.1 s) and `pipe-vibrating-faded.mp3` (7.4 s): each upload up to its next hit, faded off, kept
    for other uses.
- Nobody has listened. The ElevenLabs attempts below stay as they were.

### Before the uploads: waiting for credits
- **Where:** the raid run (85–92). On 86-02, "Kaneko strikes the iron pipe three times: the alarm the Hive has kept for fifty
  years.", nothing is heard. The run's only pipe sound is `pipe-alarm.mp3` far under the masked men coming in (119, volume 0.3)
  and in the pipe gallery (382, 0.12).
- **Tried on 20 October, nothing kept:**
  - Round 1 (an old woman striking a thick iron water pipe three times with a heavy spanner): three takes came back 1 s long,
    because the quick generator cannot set a length, and one 7 s. The director: none violent enough.
  - Round 2 opened its prompt with "Violent emergency alarm", and the director heard a siren. Two of its four takes failed: the
    account ran out of credits (8 left).
  - All six takes are kept, unused, in `public/film/sfx/alternates/pipe-spanner--v1…v6.mp3` (v1–v3 1 s, v4 7 s, v5 and v6 4 s).
    They come from flow `F4TAqTKoPe00fq3fLMNA`. Round one's generations are `LUI6oVuZHzoYw9wwSrnt`, `lz4kP8FRc7xCx5dQ27ou`,
    `lDQrcZPzpPXg5wMuxWKb` and `MKuem3T7JZWSnhLL9T2c` (the 7 s take); round two's are `G7S9tcADoTgzeiOUTguW` and
    `JEzexa03He0SGnfqZSC6`.
- **Next time:**
  - Use a flow node so the length can be set: `duration_seconds` 4, `prompt_influence` about 0.7.
  - Prompt: *A heavy steel spanner smashed hard against a thick cast-iron water pipe in a concrete stairwell, three violent
    metallic impacts a second apart, each a hard dry clang with a short ring that dies in the pipe. No alarm, no siren, no
    music.*
  - Keep "alarm" and "siren" out of the prompt: the model takes them literally.
  - Wire the pick as a cue on 86-02 in `studio-edits.json` → `soundtracks` → `raid` → `cues`:
    `"86-02-three-strikes": [{ "file": "<the pick>", "volume": 0.9 }]`. About 30 to 70 credits a round.
- **Free stopgap, if the director wants something there before then:** the three strikes at the start of `pipe-alarm.mp3`
  (0.45 to 2.85 s), cut to a new file and put on the same cue. They are the pipe the film already uses, but not as hard as the
  note asks.

## 16 and 17. Jack and Vera at Kaneko's (84), 21 October
- **The words, changed in `src/film/story.json`:**
  - Jack's answer to "She was here. The day I came." is now **"Right behind the curtain."** It was "Three feet away.". The
    scene titles of 57 and 84 and the narration of 57 ("On the other side of the curtain, three feet away.") are unchanged.
  - The confession now reads **"I told him. Where she'd be, and when. He arranged the car. It was his driver. That's mine. I
    trusted him. I'm so sorry."** Its recorded take is kept for the first part, so the pause after "I told him." stays as
    recorded. The new sentences are a line of their own after it, so they get their own take.
- **Recorded 24 October** (with note 20's line; see note 20). What follows is how they waited, and the recipe used.
- **The takes were waiting for credits.** Until then both lines were shown silent: Jack's words on screen, no voice. They are never
  read by the browser's voice and never played over the old words. In the hands-off animatic they show as plain captions, without
  Jack's name. Each line carries `takePending` (the direction and words to record) in place of `voice`, and the build lists the
  lines still waiting.
  - **Record:**
    - Voice: Jack's saved voice, "Narrator Lead" (`MZhx7pKflsc0sAwciDEy`), with `eleven_v4`, as all his takes.
    - Prompts: `[flatly] Right behind the curtain.` (as "Three feet away." was read) and `[sadly] I trusted him. I'm so sorry.`
    - Avoid `[quietly]` on Jack: it reads as a whisper.
    - Priced on 21 October: about 136 and 144 credits for four takes each, half that for two.
  - **Install:**
    - Keep every take, picked and unpicked, in `public/film/voice/s84/` under new names, for example
      `118-jack-flatly-right-behind-the-curtain.mp3` and `119-jack-sadly-i-trusted-him-i-m-so-sorry.mp3`. ElevenLabs does
      not keep audio.
    - Level the picks to Jack's other lines in the scene: about −21 dB average, −2 to −4 dB peak.
    - Replace each line's `takePending` with `"voice":[{"src":"/voice/s84/<file>","dur":<seconds>}]` and rebuild.
- **Outside this repository:** PlayFrame's screenplay and voice manifest still have "Three feet away." and the shorter
  confession. Make the same change there, with the rest listed under 4 and 5.

## 18. The brief's pictures, picked (21 October)
The director picked the 17 pictures made from `docs/image-brief-2026-10-20.md` against the film's own.
- **In the film now (13):**
  - 310 and 311 (the model, in its glass case) and the plaza model sheet;
  - 74-03, 72-02 and 72-04, installed as earlier takes of the run: byte copies in `vera_run_takes/<beat>--r1.jpg`, `PICKS` in
    `tools/vera-run-cut.mjs`;
  - 98 and 99, 107, 365, 112, 408, 483 and 19, by their `src` in `src/film/story.json`, pointing into
    `retakes_2026_10_20/`.
- **The film's own kept:** 72-01 (the piano plays on).
- **To redo**, with the director's notes:
  - **316** ("still not the end one like in the next images"): her door must be the last one, as in 88 and 89 that follow it.
    Attach 88 and 89 and say: the door at the very end of the walkway, the end wall just beyond it, nothing past it.
  - **367** ("needs redo again"): Mrs. Sakai's furnished room with nobody in it, as 365-r1 now shows it. Attach 365-r1 for the
    room.
  - **Redone 24 October; see note 21.**
  - **468** ("needs redo again"): the journalist's photo on Harada's own desk in her glass office. Attach 107-r1, which the
    director accepted, so the photograph matches.

## 19. Pictures too low resolution, and no downscaling ever
- **The rule (the director, 17 and 21 October):** no film picture is ever made smaller than it came (see `CLAUDE.md`). An image
  generator's output is installed at the size it came out at. **Ask for the largest size the generator offers** (2730×1536 or
  2752×1536 where it can), never resize before installing, and install with `tools/install-film-picture.mjs`. It crops to
  16:9 and only ever enlarges, below 1920×1080.
- **26 pictures the film plays are below 1920×1080 on disk.** Most are 1365×768 or 1376×768, exactly half the generator's
  2730×1536 or 2752×1536. They were halved somewhere before they reached the film. If the full-size originals can be found (the
  generator's download, an earlier upload), install those over the halves with the install tool, which archives the old file.
  Otherwise they are retake candidates. The player stretches them to the screen, so they look soft.
  - 1365×768: `s17/360-more-than-the-bowl-costs` (remade 1920×1080 on 24 Oct), `s20/346-the-bulb-hums` (remade 2728×1534 on 24 Oct), `s54/220-everything-is-still-there` (remade 2508×1410 on 24 Oct), `s70/393-run` (remade 24 Oct),
    `s90/381-the-plank` (remade 24 Oct), `s90/132-the-gap` (remade 24 Oct), `s93/137-he-knows-this-car` (remade 24 Oct), `s93/138-the-door-opens` (remade 24 Oct),
    `s94/139-only-tea` (remade 24 Oct), `s94/368-the-door-closes` (remade 24 Oct), `s97a/565-they-bow` (remade 2048×1152 on 24 Oct).
  - 1376×768: `s25/the-rice-goes-cold`, `s82/new-empty-newsroom.png`,
    `service_new/556-the-lane-from-above`, `service_new/559-shoes-at-the-step`,
    `service_new/560-jack-at-the-door`, `service_new/extras/mom-01-her-face-at-the-table`, `mom-02-mother-and-daughter`,
    `mom-03-what-she-wears-home`.
  - 1408×768: `montage/m4-railway-rain`.
  - 1672×941: `s73/72-the-lost-heel`.
  - 1536×1024: `s78/88-the-walkway`.
  - **Two of them remade at full size, 24 October, on-model.** The first three candidates came back off-model (a younger, smooth
  hand on Kurose's model, a different blonde in the kiosk, and a pair in the alley who were not Mara and Jack), so each was
  regenerated with the cast sheets attached as likeness references — `sheets/kurose.jpg`, `sheets/vera.jpg`, `sheets/mara.jpg`
  and `sheets/jack.jpg`, plus, for the alley, an already-matched frame of the pair (`s20/346-the-bulb-hums`). Two takes each,
  the director picked one of each; both installed with `tools/install-film-picture.mjs`, the old halves archived.
  - **`s54/220-everything-is-still-there`** now 2508×1410 (was 1365×768); old file
    `archive/s54/220-everything-is-still-there--v1.jpg`. Vera in her charcoal coat and cream turtleneck, as scene 83 has her.
  - **`retakes_2026_10_20/311-the-hand-on-the-model-r1`** now 2730×1536 (was 1360×768); old file
    `archive/retakes_2026_10_20/311-the-hand-on-the-model-r1--v1.jpg`. The hand is now an old man's, in Kurose's charcoal
    sleeve (it was a young hand in navy). The same file is `s51/311-the-hand-on-the-model.jpg`'s parent take in `story.json`.
  - Neither picture has a depth map, so nothing in `film-depth-layers.json` changes.
  - **Three more remade the same day, on-model, for `s70/393-run`, `s90/381-the-plank` and `s93/137-he-knows-this-car`.**
    Same method: the cast sheets plus a matched frame from the same sequence (`hive_raid_takes/382-the-pipe-gallery-playframe`
    for the escape, `s93/93-00-down-the-steps` for the station) so faces *and* wardrobe match — Mara in the grey jumper and
    navy jacket with her hair wet and back, Jack in the wet black leather coat, Ishida in his charcoal suit. Old files
    `archive/s70/393-run--v1.jpg`, `archive/s90/381-the-plank--v2.jpg`, `archive/s93/137-he-knows-this-car--v1.jpg`.
    **Caveat:** the takes the director picked came out of the generator at 1360–1536 wide, so the install tool enlarged them
    to 1920×1080 (house size) rather than installing native 2K like the two above; a 2K-native pass would be sharper still.
  - **Three more the same day, `s93/138-the-door-opens`, `s94/139-only-tea` and `s97a/565-they-bow`.** The station pair are
    held to `sheets/ishida.jpg` (the detective on the pavement) and `sheets/kurose.jpg` (the man in the car: the first
    candidate put a face in the doorway, which the new picture leaves to suggestion — a dark-suited arm and shoulder in the
    amber light); the bow is held to `sheets/vera.jpg`, `service_new/style-sheets/vera-mother.jpg` and the same sequence's
    overhead `service_new/564-the-room-from-above`, so Vera's fringe, her mother's pinned silver hair and the room's props
    match. Old files `archive/s93/138-the-door-opens--v2.jpg`, `archive/s94/139-only-tea--v3.jpg`,
    `archive/s97a/565-they-bow--v1.jpg`. Sizes: 138 now 2730×1536 (native 2K), 565 now 2048×1152 (native), 139 only
    1377×761 from the generator so the install tool enlarged it to 1920×1080.
  - **The newsroom walk, `s82/new-jack-walks-in-1`, `-3` and `-4`, remade 24 October.** Held to the sequence's own full-size
    frame `s82/new-jack-walks-in-2` (Jack's charcoal blazer, open white shirt, the room's grade) and to `sheets/jack.jpg` and
    `sheets/harada.jpg` — Harada's silver bob, thin glasses and rolled white sleeves. `-1` now 1920×1080 (was 1920×1072, so
    eight lines short; enlarged), `-3` 1920×1080 (was 1672×941; enlarged), `-4` 2674×1504 (was 1376×768; native). Old files
    `archive/s82/new-jack-walks-in-1--v1.jpg`, `-3--v1.jpg`, `-4--v1.png`.
    **Watch the lettering:** one candidate came back with the door sign garbled (東面新聞 / 緯偉局) and no Jack in frame, and
    was rejected. `-4` was a PNG; its replacement is a JPEG, so `story.json`, `src/data/nobodysWitnessFilm.ts` and the
    film-backend check now name `…-4.jpg`, and the old PNG is archived.
  - **Three more, closing the escape and the car, 24 October.** `s90/132-the-gap` (Mara in the grey jumper and navy jacket,
    Jack in the leather coat, the lantern man and the girl with the violin), held to `hive_raid_takes/382` and the two cast
    sheets — now 1920×1080, was 1672×941; old file `archive/s90/132-the-gap--v4.jpg`. `s70/396-five-metres-three` (Jack
    letting her go at the dumpster, Mara splashing for the Hive door, the driver and sedan where 393 has them) — now
    1920×1080, was 1344×768; old file `archive/s70/396-five-metres-three--v1.jpg`. `s94/368-the-door-closes` (Kurose and
    Ishida on the back seat, held to `sheets/kurose.jpg`, `sheets/ishida.jpg` and the tea cup from `s94/139`) — now 1920×1080,
    was 1408×736; old file `archive/s94/368-the-door-closes--v1.jpg`.
## 24A. Three content fixes at Kaneko's counter (24 October)
- **`s17/358-the-empty-third-stool`: the man was not Jack.** The face in that picture was a longer-faced man, not
  `sheets/jack.jpg`; he is now the film's Jack (lean, long dark greying hair swept back, stubbled), same pose and place,
  held to `sheets/jack.jpg` and the same counter's `s17/434-i-was-already-old`. 2048×1152, native. Old file
  `archive/s17/358-the-empty-third-stool--v1.jpg`.
- **`s17/360-more-than-the-bowl-costs`: the business card was missing.** The script has *"He puts down a little more than the
  bowl costs, and a business card on top of it"* (scene 17, and Kaneko answers *"He always paid too much, too."*), so the card
  is legitimate and now sits on the note and coins. 1920×1080 (the take came out at 1355×774, so it was enlarged); old file
  `archive/s17/360-more-than-the-bowl-costs--v2.jpg`.
- **`s17/188-something-moves`: too much money.** The thick wad of banknotes on the counter was far more than a bowl of noodles;
  it is now a single folded 1000-yen note and a few coins, the same money as `s17/360`. Kaneko is also held to
  `sheets/kaneko.jpg` (straight grey hair in a low bun, brown cardigan, faded denim apron). 1920×1080 (enlarged from
  1344×768); old file `archive/s17/188-something-moves--v2.jpg`.
- **`service_new/556-the-lane-from-above` left as it was** (the director's call), though `559` and `560` were remade:
  `559` is 1920×1080 (was 1377×761, `archive/service_new/559-shoes-at-the-step--v1.jpg`) and `560` 2076×1168 native
  (was 1376×768, `archive/service_new/560-jack-at-the-door--v1.jpg`).

- **Exactly 1920×1080 does not mean full detail.** The 17 retakes of 20 October were enlarged to 1920×1080 from the
  generator's smaller output, and many older pictures may have been too. A sharpness measurement could not tell those from
  native pictures reliably, so they are not listed. A picture that looks soft at full size is worth reporting by its mark
  (scene, beat and file name in the animatic's corner).

## 20. "No one's asking you to be." (84), and the takes recorded (24 October)
- **The words:** Vera, in the storeroom: "I don't know if I'm as good as he was." Jack now answers **"No one's asking you to be."**
  It was "I'm not asking you to be." The old take stays on disk (`119-jack-gently-i-m-not-asking-you.mp3`), unused.
- **Three takes recorded,** all Jack's saved voice with `eleven_v4`, two takes each, about 210 credits: this line
  (`[gently] No one's asking you to be.`) and the two of notes 16 and 17. No scene 84 line waits any more.
  - Installed: `public/film/voice/s84/118-jack-flatly-right-behind-the-curtain.mp3`,
    `119-jack-sadly-i-trusted-him-i-m-so-sorry.mp3`, `119-jack-gently-no-one-s-asking-you.mp3`, leveled to about −21.5 dB
    average like Jack's other lines in the scene.
  - Both takes of each, as they came, in `public/film/voice/s84/raw/`; prompts, generation ids and measurements in
    `docs/film-voice-generations-2026-10-24.json`.
  - **Picked by measurement, not by ear** (the take with more energy; the two takes of each are the same length, so neither
    says its line twice). Listen to the three in place; swap in the other take from `raw/` if it reads better.
- **The last two waiting lines, recorded the same day:** scene 1's "Hold on, I'll call an ambulance." (Mara's voice,
  `public/film/voice/s1/14-mara-breathless-hold-on-i-ll-call.mp3`) and scene 2's "Are you okay? Where's Sakai?" (the journalist's,
  `public/film/voice/s2/21-journalist-concerned-are-you-okay-where.mp3`), both takes of each in that scene's `raw/`, about 170
  credits. No line in the film waits for a take now.
- **Outside this repository:** PlayFrame's screenplay still has "I'm not asking you to be." with the rest of notes 16 and 17.

## 21. 316, 367 and 468 redone, and 352 at full size (24 October)
Made with `gemini-3-pro-image` as edits of the reference pictures, asked for its **2K** size (2752×1536) and installed as they
came with `tools/install-film-picture.mjs` (cropped to 2730×1536, nothing shrunk). Two takes each; the other take of each is in
`public/film/img/retakes_2026_10_24/<name>--alt1.jpg`, and every replaced picture is archived. About 17,000 credits
(about 1,830 a take, 3,050 for 316's with three references). Picked by eye at contact-sheet size; **nobody has seen them in
the film yet.**
- **316 "Squared to the door" (78):** her door is now in the **end wall**, facing straight down the walkway, as 88 and 89
  have it; the mat and the tied envelope in front of it, Jack walking away from it toward the camera. References: 88, 89 and
  Jack's sheet. Old picture: `archive/s78/316-squared-to-the-door--v2.jpg`. The other take has him still on the mat.
- **367 "The phone rings" (59):** Mrs. Sakai's own room, as 365-r1 shows it (the windows and shoji, the television, the
  altar with the same photograph), nobody in it, the cream telephone ringing on the kotatsu quilt in the foreground.
  Reference: 365-r1. Old picture: `archive/s59/367-the-phone-rings--v1.jpg`. The other take has the phone on the kotatsu
  top but a different, older face in the altar photograph. **Its depth map is remade** with Depth Anything from the new
  picture (the old one was made for the bare room); the move is unchanged (push 0.32 over 5 s).
- **468 "The photograph on her desk" (53A):** the photograph from 107-r1 (the journalist with glasses, laughing at the
  office party) in its dark frame on Harada's desk, her glass office and the newsroom behind. Reference: 107-r1. Old picture:
  `archive/s53a/468-the-photograph-on-her-desk--v1.jpg`.
- **352 "The address" (23):** the same picture made again at full size (it was 1360×768); the napkin now carries a short
  handwritten line in Japanese. Old picture: `archive/s23/352-the-address--v2.jpg`. The other take writes the address out
  in English ("Tokyo, Shinjuku West Alley 3-4"), readable on screen; not used because the script never gives the address.

## 22. The roadside inn (24 October)
- **Why a picture showed something that had not happened yet:** a scene opens on its first picture, and that picture stays up
  through the heading and every line before its own. In the inn that put Jack's car in the lot before he arrives (31), the key
  in his hand before he walks in (32), Mrs. Noda smoking on the step while he is still in the corridor (37) and the four
  sedans before the headlights (38). Each scene now opens on a picture of its own first line:
  - **30** `s30/30-00-the-only-thing-moving.jpg`: Jack's car alone on the highway, no inn yet;
  - **31** `s31/31-00-the-inn-before-he-arrives.jpg`: the inn with an empty lot (169 with the car and Jack taken out);
  - **32** `s32/32-00-the-faded-lobby.jpg`: the lobby from Jack's side of the counter, Mr. Noda at the baseball, Mrs. Noda
    behind the counter (170 with Jack taken out); 170 still plays on the key;
  - **37** `s37/37-00-he-cannot-sleep.jpg`: Jack alone in the dark ground-floor corridor;
  - **38** the unused roadside set's `roadside/s38/38-01-headlights-on-the-highway.jpg` (no car or person in it to clash).
  The roadside set's other openers were not used: its car is not Jack's (dark and newer) and its Mrs. Noda wears the cardigan
  that `continuity.md` retired.
- **207 "The pink payphone" (35):** Jack held a black handset while the phone's own pink one still hung on its hook. Fixed in
  place: he holds the pink handset, the hook is empty. Old picture: `archive/s35/207-the-pink-payphone--v1.jpg`.
- **212 "Stay. Whatever you hear." (44, the raid):** retaken with the raid in it: Mrs. Noda frightened, clutching his sleeve,
  Jack urgent at the pantry door, a pot knocked over, the back door open to the rain. Old picture:
  `archive/s44/212-stay-whatever-you-hear--v1.jpg`; the other take (gunmen in the back doorway, which they are not at that
  moment) in `retakes_2026_10_24/`.
- **New, `s44/44-02-my-husband.jpg`:** Mrs. Noda in the pantry, crying out, gripping his coat. It plays on "My husband —" and
  "I'll get him." (shots 16–17 of the raid cutscene in `studio-edits.json`, and the scene's own step in `story.json`).
- gemini-3-pro-image edits at 2K, installed full size (2730×1536). With note 23, eleven pictures, about 34,000 credits.
- **The same thing elsewhere in the film:** 40 scenes opened on a picture that belongs to a later line. Most are harmless (a
  time card or a description of the place over its establishing shot). The five that gave something away early were fixed the
  same day (the director: "ok"), one take each, about 9,100 credits, each an edit of the scene's own picture:
  - **21** `s21/21-00-he-hasnt-slept.jpg`: Jack alone at his desk in grey morning light, in yesterday's shirt (was Vera
    already on the stairs);
  - **27** `s27/27-00-the-signal-turns-green.jpg`: the empty crossing as the signal turns green (was the two of them
    already crossing);
  - **63** `s63/63-00-the-locker-room.jpg`: the locker room, every locker shut, the caretaker asleep (was Jack at the open
    locker);
  - **63A** `s63a/63a-00-he-comes-out.jpg`: Jack coming out under the arches, no car yet (was the sedan waiting). He carries
    the flat package under his arm, where the script has it under his buttoned coat;
  - **93** `s93/93-00-down-the-steps.jpg`: Ishida coming down the station steps, no car yet (was the sedan at the kerb).

## 23. Scene 59: Vera sees Jack walking back (24 October)
- The director: outside the Hive Vera should not find Jack on the green phone; she should see him walking back.
- **The words, changed in `src/film/story.json` only (narration, no recorded line touched):** the call and the intercut stay;
  then "It rings. Nobody answers. He hangs up. He walks a few steps down the street in the rain, then turns back." comes
  before Vera, who now "comes out of the Hive's narrow entrance, glowing. She sees him walking back to her."; "Jack keeps the
  receiver to his ear. It rings." is now "Jack hardly hears her. He looks back at the payphone."; the later "It rings. Nobody
  answers. He hangs up." is gone.
- **Pictures:** new opening `s59/59-00-jack-at-the-green-phone.jpg` (Jack alone at the phone; the scene used to open on Mrs.
  Sakai's kotatsu); 226 retaken in place (Vera at the door, Jack walking back along the street; old one `--v3`); new
  `s59/477-he-hardly-hears-her.jpg` (beside her, looking back at the phone; the old `477-it-rings.jpg` is no longer used);
  478 retaken in place without the phone (old one `--v1`).
- **Outside this repository:** PlayFrame's screenplay still has Jack on the phone when Vera comes out.

## 24. The automatic cut-outs, picked (24 October)
The director went through all 76 in the picker (each playing its real move beside its review sheet).
- **Kept (69):** as they are.
- **Taken out (3):** `01-backstreet`, `27-the-notebook-v1`, `76-07-the-lighter` play still (`mode: static`); their entries in
  `docs/film-depth-layers.json` and their layers are gone.
- **Redone (4):**
  - **05 "Phone off"** ("she should be cutout too not just the phone") and **16 "The key"** ("her hand missing"): BiRefNet keeps
    the most striking thing in a box, here the phone and the key. `tools/make-depth-layers.py` now takes `"people": true` on a
    cut-out (the U2-Net human mask inside its box is joined to it; needs `--people-model`) and `"close": N` (bridges a gap
    such as a watch strap). 05 is both hands with the phone; 16 is one cut-out, hand, key, wrist and sleeve. Checked at both
    ends of the move.
  - **72-04 "Walking very carefully"** ("wheres the rail come from?"): the 20 October retake had invented a brass standing
    rail; the lounge has none in any other shot. Retaken from the original 72-04: stiff, stricken, a hand on an armchair to
    steady herself. Installed over `vera_run_takes/72-04-walking-very-carefully--r1.jpg` (the rail one archived as
    `archive/vera_run_takes/72-04-walking-very-carefully--r1--v1.jpg`, the other take in `retakes_2026_10_24/`). New cut-out;
    the round plaque behind her head is excluded (a hard edge at the top-left of her hair may show).
  - **74-17 "The reflection"** ("redo picture it has blue umbrella"): she left the umbrella at the lounge. The umbrella is
    taken out of the water; old picture `archive/vera_run_new/74-17-the-reflection--v1.jpg`; cut-out remade for Vera only.
- All three new pictures (and today's others) are 2730×1536. About 5,500 credits.

## 25. Mrs. Sakai: "For years." (24 October)
- Scene 29: "Every January. Cash, in an envelope. Twenty years." is now "… For years." New take in her saved voice
  ("Mrs. Sakai - NEONOIRE", `RWRdNUkZ6UAfbVJPXrFG`, eleven_v4, `[sadly]` as before), two takes in `public/film/voice/s29/raw/`,
  installed `public/film/voice/s29/273-mrssakai-every-january-for-years.mp3` (same level as the old take, about −22 dB). The old take
  stays on disk, unused. About 210 credits.
- Scene 34's narration "Twenty years of Januaries." is now "Years of Januaries." to match (the receipts are the same fact). The
  other "twenty years" lines are the story's timeline and are unchanged.
- Okada's voice was never changed: "Okada - NEONOIRE", picked 29 September, no take re-recorded since.
- Outside this repository: PlayFrame's screenplay still has "Twenty years." in both places.

## 26. Okada's new voice (24 October)
The director: "i think his voice is too deep for old japanese man so redo." The 29 September voice ("Okada - NEONOIRE",
`MhuU9Z2dyWAG6ZjuuKRg`) sat at a median of 89 Hz.
- Three rounds of designs, auditioned on a picker page: the first three (109–123 Hz) were "all too slow"; of the brisker three
  the director liked D best but asked for "a bit wiser older"; from the third round, G (137 Hz, mid 70s, light, aged, calm
  authority, faint Japanese accent) was picked and saved as **"Okada (old) - NEONOIRE"** (`2jGSM3CPT3ls23VwBLPJ`). The voice
  library was full; the director deleted the Barber's saved voice to make room (his takes are already in the film).
- All 19 of his lines (scenes 8, 9, 27A, 64, 81) are re-recorded in it, eleven_v4, two takes each, the old directions kept.
  Picks are measured, not heard, leveled to the old take of each line, installed beside it as `<name>--aged.mp3`; raw takes in
  `public/film/voice/<scene>/raw/*--okada-old-take<N>.mp3`; record in `docs/film-voice-generations-2026-10-24.json`
  (`okada`). The old takes stay on disk, unused. The new reads run about 10% longer than the old ones (27A's long answer
  22.3 s against 19.5 s). About 2,330 credits.
- Outside this repository: PlayFrame's voice manifest still lists the old voice and takes.

## 27. Mara's drawing, and more effects (24 October)
- "369-the-drawing and 445-exactly-where-it-was should have the same drawing as in the 520-excuse-me drawing": done, both
  remade with 520's drawing (2730×1536; old frames archived). The page carries 1:07 in its corner because scene 25's narration
  says "In the corner, small: 1:07"; 520 has none (say if 520 should get it too).
- "if we have credits left add more sfx and make sure none mis-aligned": every beat effect was checked against its beat's
  words (none misplaced, none missing a file). Three effects never reached the bad-guy song and are now its cues. 25 new
  placements and 2 new beds; the one that mattered most is the shot that hits Mara in scene 70, which was silent. Eight new
  effects generated. Details and the full list: FILM.md, "Mara's drawing in 369 and 445; 25 more effects".
- Credits: about 9,740 for the four picture takes, about 250 for the effects. Nobody has heard the new effects.

## 28. Scene 5: the young officer whispers (24 October)
- "when young officer says 'yes, that name, yes, the sister is here now' he should be saying that as if vera cant hear him",
  "may be a cautious whisper?": re-recorded as a cautious whisper into the phone, turned away (about 7 dB under his other lines).
- His voice from 29 September is deleted from the ElevenLabs workspace, so one new line would have changed voice mid-scene. All
  four of his scene 5 lines are re-recorded in "Young Detective - NEONOIRE", the voice designed on 7 October to stand in for him
  (his other three lines keep their old directions). Old takes stay on disk. About 530 credits. Nobody has listened.
- Review page for every picture in play order with its other versions: https://claude.ai/artifact/T2WkAqbiei2XaUMUxf9ngh
  (marks save to its `picks` collection).

## 29. Scene 1's camera always went the same way (24 October)
- "in scene 1 the camera pans left on almost every scene with cutouts its a bit repetative": every depth shot in scene 1 (23),
  scene 2 (10) and scene 72 (4) was a sideways truck with no direction set, so all of them took the default and slid the same way.
  They now alternate: push-ins toward the person on close shots (the focal point from the cut-out), sideways trucks left and right
  on wider ones, never the same move twice in a row (`pictureLook`; `test:film-backend` checks it).
