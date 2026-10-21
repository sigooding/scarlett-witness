# Image brief, 20 October 2026: the pictures the film still needs

For an image-generating agent working in this repository. It collects every picture the director's notes of 19 and 20 October
still need (`docs/director-notes-2026-10-20.md`, `docs/picks-review-2026-10-19.md`), in priority order, each with the exact file
to make, the references to attach and a prompt to use as it stands. **Make the pictures and save them. Do not wire them into
the film**: the film's maintainer (Claude, in the director's session) swaps them in afterwards. The one exception is the four
scene 80 pictures, which come up by themselves (see 3).

## How to work

1. **Repository and branch:** `sigooding/scarlett-witness`, from `main` (the brief and the scene 80 slots are on it). Work on a
   new branch of your own and open a pull request to `main` when done.
2. **Where pictures go:**
   - Every retake: `public/film/img/retakes_2026_10_20/`, under the exact filename given (each ends `-r1`).
   - The plaza model sheet: `public/film/img/retakes_2026_10_20/style-sheets/`.
   - The four new scene 80 pictures: their exact paths in `public/film/img/s80/`.
   - Paths below are relative to `public/film/img/`.
3. **Never overwrite or delete a file.** Every filename here is new. If one exists already, stop and report it. If you make more
   than one version of a picture, save the best at the exact path and the others beside it as `<name>--alt1.jpg`,
   `<name>--alt2.jpg`.
4. **Format:** JPEG, 16:9, at least 1920×1080. Bigger is better; never smaller, never downscaled. If you can run node, install
   each file with `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs <your file> public/film/img/<exact path>`, which
   crops to 16:9 and enlarges below 1920×1080 but never shrinks.
5. **References:** attach the ones listed for each picture, faces first. Match faces, ages, hair and clothes exactly. Never
   take a face from the picture being redone. If a face drifts from its reference, make it again.
6. **No legible text** anywhere unless a prompt asks for it: no signs, logos, number plates, watermarks, borders or letterbox
   bars. Never mirror a place to fix a framing.
7. **End every prompt with its section's style line.**
8. **Do not edit** anything under `src/`, `tools/`, `scripts/` or `docs/`.
9. **Report** in `public/film/img/retakes_2026_10_20/README.md`: one line per picture made (file, item number, anything that
   still isn't right). List the items you did not get to.
10. **Credits are short.** Work through Priority 1 in order and stop when they run out. Priority 2 can wait.

---

# Priority 1: what the director pointed at

## 1. Kurose's plaza model (scenes 51 and 83)
The model must be the same object in both scenes. In scene 83 (six pictures) it stands in a **glass display case on a white
plinth** by the window. Scene 51's two pictures had it open on a meeting table, so they are redone into the case.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9. Grey light through a fortieth-floor window, cool
slate tones, restrained 35mm grain. No legible text, signage, logos or watermarks.*

**1a. The style sheet, first:** `retakes_2026_10_20/style-sheets/kurose-plaza-model.jpg`
- Attach: `s83/109-the-fortieth-floor.jpg`, `s83/113-very-clean.jpg`, `s83_picks/111-just-a-face-v2.jpg` (the model in its
  case), `s51/310-the-model-at-dawn.jpg` (the Hive block), `s51/311-the-hand-on-the-model.jpg` (the hand and watch),
  `sheets/kurose.jpg`.
- Prompt: *A model-maker's reference sheet on a plain dark grey background for one architectural model, the Kurose
  redevelopment, exactly as it stands in the attached office pictures: inside a glass display case on a white plinth. White
  towers (two tall, lower blocks behind), a pale plaza of white paving with a central lawn and a round fountain, small white
  trees, tiny painted people. Panel A: the model with the Hive at the plaza's front edge: a small, dark brown, patched,
  many-windowed tenement block, out of place among the white. Panel B: the glass cover lifted off and set aside, a man's clean
  hand with a silver watch on a black leather strap lifting the Hive block out. Panel C: the model after: where the Hive stood,
  only white paving, painted people crossing it. Panel D: the Hive block alone on a steel tray beside a white cup of tea. Same
  model, same colours, same layout in every panel.* + style line.

**1b.** `retakes_2026_10_20/310-the-model-at-dawn-r1.jpg`
- Plays on: "At the plaza's edge sits one small, dark, patched block, out of place among the towers. The Hive."
- Attach: the sheet (1a), `s51/310-the-model-at-dawn.jpg` (composition), `s83/109-the-fortieth-floor.jpg` (the office).
- Prompt: *Kurose's fortieth-floor office at dawn, empty. The redevelopment model in its glass case on the white plinth by the
  window, as the sheet's panel A: white towers, the pale plaza, and at its front edge the small dark brown patched Hive block.
  A steel tray with a white cup of tea on the low table beside the case. Grey dawn light.* + style line.

**1c.** `retakes_2026_10_20/311-the-hand-on-the-model-r1.jpg`
- Plays on: "A man's hand, clean, with an expensive watch, lifts the Hive out of the model and sets it on a tray beside a cup
  of tea. The plaza underneath is already finished."
- Attach: the sheet (1a), `s51/311-the-hand-on-the-model.jpg` (composition and hand).
- Prompt: *Close: the glass cover of the case lifted off, a man's clean hand in a dark suit cuff, a silver watch on a black
  leather strap, setting the small dark brown patched Hive block down on a steel tray beside a white cup of tea. In the model
  behind, where it stood, the plaza is already finished: white paving, tiny painted people crossing it.* + style line.

## 2. Vera's night run (scenes 72 and 74)
**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green
shadows, warm amber practical light only, wet reflective surfaces, restrained 35mm grain, subtle highlight halation. No legible
text, signage, logos or watermarks.*

Vera wears the **sleeveless** wine-red silk slip dress (thin straps, bare shoulders) and carries a small black velvet bag. In
the lounge she is dry, with softly done hair and red lipstick.

**2a.** `retakes_2026_10_20/74-03-his-hands-r1.jpg`
- Plays on: "His hands are dark. He has not washed them." The director: his hands are too dirty.
- Attach: `vera_run_new/74-03-his-hands.jpg` (keep everything but the hands), `s80/96-hands-close.jpg` (how much blood is
  right).
- Prompt: *Keep this picture exactly: the same framing, the long black overcoat, the rain and the light. Change only his hands:
  much cleaner, wet with rain, dark dried blood left only in the creases of the knuckles and around the fingernails, thinned
  by the rain. No caked mud, no gloves of blood.* + style line.

**2b.** `retakes_2026_10_20/72-01-the-piano-plays-on-r1.jpg`
- Plays on: "Vera doesn't move. The piano plays on." (she has just stood up, knowing from Ishida's voice)
- Attach: `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state A),
  `vera_run_new/style-sheets/loc-hotel.jpg` (the lounge), `vera_run_new/72-01-the-piano-plays-on.jpg` (the room).
- Prompt: *The old hotel lounge as the reference: the long dark-wood bar, bottles glowing amber, the round clock above it, the
  pianist in his white jacket at the black upright piano. Vera standing frozen beside her bar stool, the phone still at her ear,
  her face white and still with shock, eyes fixed on nothing; the pianist plays on, unaware.* + style line.

**2c.** `retakes_2026_10_20/72-02-the-phone-lowers-r1.jpg`
- Plays on: "The phone slowly lowers from her ear." The director: the phone is the wrong way round.
- Attach: `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state A),
  `vera_run_new/style-sheets/loc-hotel.jpg`, `vera_run_new/72-02-the-phone-lowers.jpg` (composition).
- Prompt: *Keep this composition: Vera close in the hotel lounge, the bottles glowing amber behind her, the pianist soft in the
  background. She is lowering the black phone slowly from her ear, its back toward the camera and its screen turned toward her
  and down, its cold light on her collarbone and chin. Her eyes fixed on nothing.* + style line.
- Check: no phone screen or text visible.

**2d.** `retakes_2026_10_20/72-04-walking-very-carefully-r1.jpg`
- Plays on: "Vera walks out of the lounge. Not running yet. Walking very carefully, as if the floor might tilt." The director:
  the pictures show her leaving calmly.
- Attach: as 2b, and `vera_run_new/72-04-walking-very-carefully.jpg` (the route through the room).
- Prompt: *Vera walking out of the hotel lounge stiffly and very carefully, one hand trailing along the brass bar rail as if
  the floor might tilt, her face white and blank with shock, eyes unfocused, the phone forgotten in her hand; the pianist and
  the few guests behind her notice nothing.* + style line.

## 3. Scene 80: Jack hits Ishida (four new pictures and two retakes)
The scene now reads: Ishida says "I have never killed anyone in my life. I only ever told people where to find them." Jack
hits him, again and again; the chair goes over. The two young detectives at the far end get to their feet; from the floor
Ishida raises a hand to stop them. He wipes the blood from his mouth and asks, calmly, "Where is it? Sakai's thing." Jack walks
out; Ishida watches him go, afraid for the first time.

**Save the four new pictures at their exact paths in `s80/`.** Each has a slot in the film and appears on its beat by itself at
the next build.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat fluorescent office light, grey daylight
through the windows, restrained 35mm grain. Violence shown in impact and aftermath, no gore. No legible text, signage, logos or
watermarks.*

**Attach for all of 3:**
- `s80/94-the-long-room.jpg` (the detectives' room: rows of grey desks, the clock, two young detectives at the far end);
- `s80/97-where-to-find-them.jpg` and `s80/95-ishida-doesnt-look-up.jpg` (Ishida at his desk);
- `sheets/ishida.jpg` and `sheets/ishida-face.jpg` (Japanese, fifties, short salt-and-pepper hair, charcoal jacket, light grey
  open-collar shirt, no tie);
- `sheets/jack.jpg` and `sheets/jack-face.jpg` (late fifties, Western, lined stubbled face, swept-back dark hair greying at the
  sides, long dark coat over a white shirt, unshaven);
- `s80/96-hands-close.jpg` (his knuckles with dried blood).

| File | Prompt |
|---|---|
| `s80/jack-hits-him.jpg` | *Close, low across Ishida's desk: Jack's fist landing on Ishida's jaw, Ishida's hands down at his sides, not defending himself, papers lifting off the desk.* |
| `s80/the-chair-goes-over.jpg` | *Wider: Ishida on the floor between the desks, his chair on its side, papers scattered; Jack standing over him; at the far end of the long room the two young detectives on their feet, frozen.* |
| `s80/not-to-jack.jpg` | *Low, from behind Ishida on the floor: his raised hand, palm out, toward the two young detectives at the far end of the room, who stop where they are; Jack's legs and coat at the edge of frame.* |
| `s80/the-blood-on-his-hand.jpg` | *Close: Ishida on the floor, a split lip, looking at the blood on the back of his hand, then up toward Jack, out of frame above him. Calm.* |
| `retakes_2026_10_20/98-past-the-clock-r1.jpg` | Keep `s80/98-past-the-clock.jpg`'s composition (Jack walking away down the long room past the clock). Change Ishida: *on the floor by his overturned chair, propped on one arm, a split lip, collar pulled open, watching Jack go.* |
| `retakes_2026_10_20/99-afraid-r1.jpg` | Keep `s80/99-afraid.jpg`'s composition. Change Ishida: *the same hurt man (split lip, collar open, hair out of place), sitting on the floor against his desk, afraid for the first time.* |

## 4. The newspaper (scenes 53A and 82)
**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey office daylight and fluorescent tubes,
restrained 35mm grain. No legible text, signage, logos or watermarks.*

**4a.** `retakes_2026_10_20/468-the-photograph-on-her-desk-r1.jpg`
- Plays on: "On her desk, a framed photograph of the journalist from the bar, laughing at an office party." The director:
  it's not her desk. The frame stood on a cluttered newsroom desk; it belongs on Harada's own desk in her glass office.
- Attach: `s53a/297-the-glass-office.jpg`, `s53a/299-the-card-on-the-desk.jpg` (her desk and the frame), `sheets/harada.jpg`,
  `s2_new/style-sheets/refs/journalist-face.jpg` and `s2_new/style-sheets/the-journalist.jpg` (the face in the photo).
- Prompt: *Inside the editor's glass-walled office at the back of an old Tokyo newsroom: on Harada's own uncluttered desk, in
  the foreground, a dark wooden frame holding a photograph of the journalist (40s Japanese, short receding dark hair, wire-rim
  glasses), laughing at an office party. Beyond the glass, soft, the busy newsroom and its televisions.* + style line.

**4b.** `retakes_2026_10_20/107-her-dead-reporter-r1.jpg`
- Plays on: "Then she looks at the photograph of her dead reporter on the desk." The photo shows a different man.
- Attach: `s82/107-her-dead-reporter.jpg` (keep everything else), the journalist's face sheets as 4a,
  `s53a/299-the-card-on-the-desk.jpg` (the frame).
- Prompt: *Keep this picture exactly. Change only the photograph in the frame: the journalist (40s Japanese, short receding
  dark hair, wire-rim glasses) laughing at an office party, the same photograph as on her desk in 4a.* + style line.

## 5. Mrs. Sakai's empty house (scene 59)
The INTERCUT while Jack lets her phone ring: "The kotatsu. The altar. The television on with the sound off. A teacup on its side
on the tatami. The phone rings in the empty room." The director: too literal. **Empty means nobody is there, not that the
furniture is gone.** It is her furnished room from scene 29.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey rainy daylight, restrained 35mm grain. No
legible text, signage, logos or watermarks.*

- **Attach for both:** `s29/354-the-altar-photograph.jpg` and `s29/273-the-receipts.jpg` (her room), `s1/07-old-man.jpg`
  (Sakai's face for the altar photograph), `s59/366-teacup-on-its-side.jpg`.
- **5a.** `retakes_2026_10_20/365-the-altar-r1.jpg`: *Mrs. Sakai's small tatami room exactly as in the reference, nobody in
  it: the kotatsu with its quilt, the old television on with the sound off (a pale blue glow), the Buddhist altar with the new
  photograph of Sakai, younger and smiling. Rain on the window. Hold on the altar.* + style line.
- **5b.** `retakes_2026_10_20/367-the-phone-rings-r1.jpg`: *The same room, the same furniture, nobody in it: a cream telephone
  on the low chest beside the kotatsu, ringing, its receiver in the cradle; the teacup on its side on the tatami.* + style
  line.

## 6. Kurose's office: the photocopy (scene 83)
**6a.** `retakes_2026_10_20/112-every-page-r1.jpg`
- Plays on: "My father kept notes. He wrote your name on every page." The director: she has the notebook, not the photocopies.
  The original notebook stayed at the newspaper; she brought the copies in a buff folder.
- Attach: `s83/112-every-page.jpg` (composition), `s82a/302-the-copies.jpg` (the buff folder), `s83_picks/111-just-a-face-v2.jpg`
  (her coat), `sheets/vera.jpg`, `sheets/vera-face.jpg`, `sheets/kurose.jpg`.
- Prompt: *Keep this picture exactly: Kurose's fortieth-floor office, Vera standing by the chair in her navy coat, Kurose
  seated at his desk looking up at her. Change only what she holds: one loose photocopied sheet, white A4 with grey copied
  handwriting, held up toward him at chest height, not threatening; the buff card folder of copies in her other hand. No bound
  notebook.* + section 1's style line.

## 7. The envelope at Vera's door (scene 78)
**7a.** `retakes_2026_10_20/316-squared-to-the-door-r1.jpg`
- Plays on: "He sets the envelope on the mat, squares it to the door, and goes." The director: wrong apartment. Hers is the
  last door, at the end of the walkway.
- Attach: `s78/88-the-walkway.jpg` (her door, the last on the left, the walkway ending at it), `s78/89-no-name.jpg` (the
  envelope and the mat), `vera_run_new/style-sheets/loc-veras-apartment.jpg`, `thehiveescape/style-sheets/jack.jpg`,
  `s78/316-squared-to-the-door.jpg` (composition).
- Prompt: *Low, close to the floor at the end of an open-air third-floor walkway: Vera's front door, the last door on the
  walkway, in the left foreground, the walkway's end wall just beyond it. On her coir doormat, a large brown kraft envelope
  tied with string, squared to the door. At the right edge, Jack's long charcoal-black wool overcoat and bare hand as he turns
  to go, walking away back along the walkway: the other doors recede behind him, the rusted railing and the rail lines beyond
  on the right. Grey dawn, rain dripping from the walkway roof.* + *Photorealistic contemporary Tokyo neo-noir film still,
  16:9, at grey dawn in light rain. Cold slate and teal-blue-green, wet concrete, restrained 35mm grain. No legible text,
  signage, logos or watermarks.*

## 8. The interview room (scene 6)
**8a.** `retakes_2026_10_20/408-a-matter-between-criminal-groups-r1.jpg`
- The director: Vera has the wrong colour hair. The back of her head is dark brown here; she is ash-blonde.
- Attach: `s6/408-a-matter-between-criminal-groups.jpg` (composition), `sheets/vera.jpg`, `sheets/vera-face.jpg`,
  `sheets/ishida.jpg`, `s6/56-three-days-ago.jpg` (the room).
- Prompt: *Keep this composition exactly: over Vera's shoulder onto Ishida (Japanese, fifties, short salt-and-pepper hair,
  charcoal jacket, light grey open-collar shirt, no tie) speaking to her across the grey laminate table, the frosted rainy
  window behind him. Change only Vera, soft in the left foreground, seen from behind: dry ash-blonde shoulder-length hair, the
  collar of her charcoal wool coat over a cream high-neck knit.* + *Photorealistic contemporary Tokyo neo-noir film still,
  16:9, a small grey-green police interview room under one green-white fluorescent fixture, restrained 35mm grain. No legible
  text, signage, logos or watermarks.*

## 9. Jack and Ishida in the car (scene 61)
**9a.** `retakes_2026_10_20/483-eyes-on-the-rain-r1.jpg`
- Plays on: "Jack turns and looks at him. Ishida keeps his eyes on the rain on the windscreen." The director: needs character
  consistency (Jack's hair is long and dark here).
- This is an edit of `jack_ishida_new/61-02-neither-looks.jpg`. Attach it as the base, with
  `jack_ishida_new/style-sheets/refs/jack-face.jpg`, `jack_ishida_new/style-sheets/refs/ishida-face.jpg` and
  `jack_ishida_new/style-sheets/car-seating-plan.jpg`.
- Prompt: *Keep everything in this picture: right-hand drive, Ishida behind the wheel on the LEFT of the frame, Jack in the
  passenger seat on the RIGHT. Jack turns his head and shoulders to look at Ishida. Ishida keeps looking straight ahead at the
  rain, hands on the wheel.* Then paste the LOOK, CAR, LOCATION, ISHIDA and JACK blocks from
  `jack_ishida_new/style-sheets/continuity.md` (section 2) at the end of the prompt, word for word.
- Check: the wheel in front of Ishida only; Jack's hair swept back, grey at the sides; nothing hangs from the mirror.

## 10. The small bar (scene 2)
**10a.** `retakes_2026_10_20/19-the-bar-r1.jpg`
- Plays on: "Six stools and a counter. Shelves of bottles glowing amber." The director: the journalist should be sitting here.
- **A version with him seated exists in PlayFrame's history and costs nothing. Skip this item if the director takes that one.**
- Attach: `s2_new/style-sheets/the-journalist.jpg`, `s2_new/style-sheets/refs/journalist-seated.jpg`, `s2/19-the-bar.jpg`.
- Prompt: *Keep this room and composition: six stools and the counter, shelves of bottles glowing amber, rain on the windows. On
  the far stool sits the journalist (40s Japanese, short receding dark hair, wire-rim glasses, raincoat over a charcoal suit),
  alone, a brown notebook and a short glass of flat beer beside him.* + *Photorealistic contemporary Tokyo neo-noir film still,
  16:9, at night. Cold slate and teal-blue-green shadows, warm amber practicals only, rain-streaked shopfront glass,
  restrained 35mm grain. No legible text, signage, logos or watermarks.*

---

# Priority 2: found in review, not yet flagged by the director

Each of these is written up in full in `docs/picks-review-2026-10-19.md`, under the code in brackets: attachments, prompt and
check. Save them in `retakes_2026_10_20/` as `<the original file name>-r1.jpg`.

- **Vera's run:**
  - 73-10, she is barefoot before she loses her shoe (V2);
  - 73-08, she slips (V3);
  - 76's 82, 315 and 84, the right dress, at home against the bed (V5).
- **Mara's service (97A):**
  - 567, a single picture of Okada at the door (S1);
  - 565, they bow with Jack present and nobody standing (S2);
  - 570, mom-02, mom-03 and 573 in Kaneko's room (S3);
  - 563, Mara's photograph with her face (S4).
- **The car (61):** 481, 482 and 484 as right-hand drive (C1; follow recipes 03, 06 and 09 in
  `jack_ishida_new/style-sheets/continuity.md`).
- **The Hive raid:**
  - 86-03 with the light out (R1);
  - 88-01 with no bulb lit (R2);
  - 119 and 126 with four masked men (R3).
- **The small bar:** 23 with no men outside the window (T1).
- **The envelope (78):** 88 with the brown envelope tied with string, as in 89, instead of a small white one (W2).
- **Ishida after scene 80:** in 93 and 94 (`s93/`, `s94/`), wherever his face is readable, give him the split lip from scene
  80.
- **Lower still:**
  - 72-03 and 72-05, Vera less calm, as 2d;
  - 364, the kotatsu room laid out as scene 29's (item 5);
  - 73-03, one hotel exit (V6);
  - 20, the journalist in a raincoat (T3).

## Not for you: free fixes already on disk
These need no new picture. The director decides, and the film's maintainer applies them:
- 19, with the journalist seated, from PlayFrame's history;
- the car's 481, 482 and 484 from the `jack_ishida_new` set;
- 567 from `service_new`;
- the home pictures (76) from the `vera_run_new` set.
