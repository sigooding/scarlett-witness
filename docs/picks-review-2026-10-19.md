# The five picked scenes: what doesn't match, and how to fix it (19 October 2026)

After the director picked scenes 2, 61, 72–76 (Vera's run), 85–92 (the raid) and 97A (Mara's service) shot by shot, each
picked picture was looked at beside its neighbours, its caption and the scene's continuity sheets. This file lists what doesn't
match. Each problem is written as a **retake brief** another image agent (or person) can run as it stands: the file to make,
the references to attach, what to keep, what to change, a prompt to paste, and how the new picture gets into the film.

Nothing below has been generated. The captions that no longer said what their picture shows were rewritten the same day (first
section); every other fix waits for a new picture or a different pick.

## Captions rewritten today

Soundtrack runs show a caption on each silent shot, so a caption has to say what its picture shows.

| Scene | Picture | Was | Now | Why |
|---|---|---|---|---|
| 73 | `vera_run_takes/73-08-…` | Slipping. Stumbling. | She keeps going, slipping, stumbling. | The take shows her running, hand to her chest, not slipping. |
| 74 | `vera_run_takes/74-18-…` | Vera covers her face with her hands. | In the water, someone under a pale blue umbrella. Mara, or no one. | The take is the reflection with the blue umbrella; no picture shows her hands over her face. |
| 86 | `thehiveescape/s86/86-03-…` | Kaneko pulls the shutter down and puts out the light. | Shutter down, light out. Kaneko points: up, through the back. | The picture shows her pointing them out the back, after the shutter. |
| 88 | `s88/126-dark` | Every bulb in the Hive goes out. | The masked men stop. Flashlights snap on. | The picture is the men with their torches lit; the dark itself is 88-01, the picture before it. |
| 97A | `s97a/565-they-bow` | Vera goes to the table. Jack goes with her. They bow. | Vera and her mother bow their heads at the table. | Jack isn't in the picture; Vera and her mother are. |
| 97A | `service_new/587-…` | Later. Vera opens the blue umbrella. | Later. Out in the lane, the blue umbrella opens. | She is already out in the lane with it. |
| 97A | `s97a/569-…` | They come out into the lane. A train goes over. Her mother stays behind with the photograph. | The mourners go up the lane together. A train goes over. | It plays after 587, where Vera is already outside, and her mother isn't in it. |
| 97A | `s97a/573-…` | A while longer. | Her mother stays behind with the photograph a while longer. | The words moved here from 569, onto the picture that shows it. |

The Vera captions are in `TAKE_CAPTION` in `tools/vera-run-cut.mjs`, the service ones in `SHOTS` in `tools/service-cut.mjs`, the
raid ones in `soundtracks` → raid → `captions` in `src/film/studio-edits.json`. Rebuild after any change:
`node tools/vera-run-cut.mjs` / `node tools/service-cut.mjs`, then `FILM_SRC=/nonexistent node tools/build-film-story.mjs`.

## How to run any brief below

1. **Make a new file. Never overwrite one.** Each brief names a new filename (`-r1`, or the next free `-rN`). If it exists, use
   the next number.
2. **Attach the references listed**, faces first. Paths are relative to `public/film/img/`. Never use the picture being
   replaced as a face reference. Never mirror a location to fix a framing (the car is the one exception, see C1).
3. **End the prompt with the scene's style line** (given in each section). No legible text, signage, logos, plates, watermarks
   or borders. 16:9, at least 1920×1080, bigger is better.
4. **Check the result against the brief's "check" line** before installing. If a face drifts from its reference, regenerate.
5. **Install it** (crops to 16:9, enlarges below 1920×1080, never shrinks):
   `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs <generated file> public/film/img/<the new path>`
6. **Wire it in** as the brief says, rebuild, and run `npm run -s test:film-backend` (it counts each scene's pictures, so a
   count may need its expected number changed in `scripts/film-backend.entry.ts`).

---

## Vera's night run (scenes 72–76)

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green
shadows, warm amber practical light only, wet reflective surfaces, restrained 35mm grain, subtle highlight halation. No legible
text, signage, logos or watermarks.*

**Her state through the night** (`vera_run_new/style-sheets/vera-red-dress.jpg`): the **sleeveless** wine-red silk slip dress,
thin straps, bare shoulders, small black velvet bag. **Both wine-red pumps until the crossing** (`s73/72-the-lost-heel`, the
end of scene 73); after it, **left pump on, right foot bare**. Running: always screen left to screen right, the railway ahead.
Under the tracks: Vera screen left, Jack screen right.

**Wiring:** a retake goes in `vera_run_takes/<beat>--r1.jpg` and its beat's entry in `PICKS` (`tools/vera-run-cut.mjs`)
becomes `"take:<beat>--r1"`. It keeps the beat's caption and sound (or set one in `TAKE_CAPTION`). Then
`node tools/vera-run-cut.mjs` and rebuild.

### V1. The wrong Jack in 74-05 and 74-10 (most visible)
- **Update 20 October 2026: resolved without new pictures.** The director marked both; 74-05 now holds the shipped wide
  (`s74/74-twenty-metres-apart`) and 74-10/74-11 play the shipped `s74/75-one-desperate-blow`, the same compositions with the
  right Jack (`docs/director-notes-2026-10-20.md`, items 10 and 13). The brief below stands only if a retake is still wanted.
- **Plays:** 74 "She is crying, almost silently." and "She hits him. One desperate blow against his chest." (74-10 also holds
  through "her hands fall").
- **Wrong:** both takes (`…74-twenty-metres-apart-v2`, `…75-one-desperate-blow-v2`) show a younger man with short black hair
  in a short dark jacket. Jack is late 50s, grey at the sides, in a long black overcoat, his hands dark with dried blood. The
  feet are right (left pump, right foot bare), so keep that.
- **Quick alternative, no generation:** pick the new pictures instead (`PICKS` `"74-05-crying-almost-silently": "new"`,
  `"74-10-one-desperate-blow": "new"`). They follow the Jack sheet.
- **Make:** `vera_run_takes/74-05-crying-almost-silently--r1.jpg`, `vera_run_takes/74-10-one-desperate-blow--r1.jpg`
- **Attach:** `vera_run_new/style-sheets/jack-that-night.jpg`, `sheets/jack-face.jpg`, `sheets/vera-face.jpg`,
  `vera_run_new/style-sheets/vera-red-dress.jpg`, `vera_run_new/style-sheets/loc-the-route.jpg` (panel e), and the take itself
  for layout only.
- **Prompt (74-05):** *The long empty street beside the elevated railway at night, exactly as the location sheet: two lit
  vending machines on the left, shuttered shops, the road shining black. Wide, eye level. Vera Voss (29, face as the reference)
  stands screen left, soaked, in the sleeveless wine-red slip dress, left wine-red pump on, right foot bare on the wet road,
  crying almost silently, arms at her sides. Twenty metres away, screen right, Jack (late 50s, tall and lean, swept-back dark
  hair greying at the sides, lined stubbled face, long black wool overcoat over an off-white open-collar shirt, his hands dark
  with dried blood, not bright red), standing still, facing her.* + style line.
- **Prompt (74-10):** *Same street, same layout, closer: a medium two-shot. Vera, screen left, hits Jack once in the chest
  with the side of her fist, her face breaking. Jack, screen right, takes it and doesn't move, his dark-stained hands open at
  his sides. Same costumes and feet as before: her left pump on, right foot bare.* + style line.
- **Check:** grey at Jack's temples, long overcoat, dark hands; Vera screen left; one shoe.

### V2. Barefoot before she loses the shoe (73-10)
- **Plays:** 73 "A car passes, its tyres hissing."
- **Wrong:** Vera runs barefoot on both feet, three beats before the crossing where the heel skids and the shoe comes off.
- **Make:** `vera_run_takes/73-10-a-car-passes--r1.jpg`
- **Attach:** `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state B, mid-run),
  `vera_run_new/style-sheets/loc-the-route.jpg` (panel a), `vera_run_new/73-10-a-car-passes.jpg` (layout and car only).
- **Prompt:** *Keep this exact picture: the wide avenue of shut grey office buildings at night, the dark saloon car passing
  on the left with its headlights on and its tyres throwing spray, Vera running on the right of the frame. Change only her
  feet: she wears both wine-red high-heeled pumps,
  wet, one heel lifting as she runs. Sleeveless wine-red slip dress, soaked, hair plastered, phone in her left hand, small
  black velvet bag on her right shoulder.* + style line.
- **Check:** two pumps, nothing else changed.

### V3. The same picture twice (73-06 and 73-08)
- **Plays:** 73 "Rain plasters her hair to her face." and, two beats later, the slip (now "She keeps going, slipping,
  stumbling.").
- **Wrong:** both beats use one file (`70-not-elegantly-badly-playframe`, identical bytes), so the same frame comes back
  about ten seconds later. And no picture shows her slipping.
- **Make:** `vera_run_takes/73-08-she-slips--r1.jpg` (keep 73-06 as it is)
- **Attach:** `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state B),
  `vera_run_new/style-sheets/loc-the-route.jpg` (panel a or b).
- **Prompt:** *Full figure, low angle from the kerb, at night on the wet avenue. Vera, soaked, in the sleeveless wine-red slip
  dress and both wine-red pumps, mid-stumble: her right heel skidding out on the wet paving, her body pitching forward, one
  hand flung out to a shop shutter to catch herself, her phone still in the other hand. Running screen left to screen right,
  the elevated railway glowing far ahead. Not graceful: awkward, desperate.* + style line.
- **Then:** put the old caption back for this beat ("Slipping. Stumbling.") by deleting its `TAKE_CAPTION` entry.
- **Check:** both shoes on; a different frame from 73-06.

### V4. The phone faces the wrong way (72-02, the director's note)
- **Plays:** 72 "The phone slowly lowers from her ear."
- **Wrong:** the call screen (ISHIDA and its buttons) faces the camera, as if she is showing it to us.
- **Make:** `vera_run_takes/72-02-the-phone-lowers--r1.jpg`
- **Attach:** `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state A, dry),
  `vera_run_new/style-sheets/loc-hotel.jpg` (lounge panel), `vera_run_new/72-02-the-phone-lowers.jpg` (composition only).
- **Prompt:** *Keep this composition: Vera in the hotel lounge, close, the bar's bottles glowing amber behind her, the pianist
  in his white jacket soft in the background. Change the phone: she is lowering it slowly from her ear, the back of the black
  phone toward the camera, its screen turned toward her and down, its cold light on her collarbone and chin. Her eyes fixed on
  nothing. Dry hair softly done, red lipstick, the sleeveless wine-red dress.* + style line.
- **Check:** no screen and no text visible.

### V5. The ending at home: another dress, another room (82, 315, 84)
- **Plays:** 76 "Vera sits on the floor with her back against the bed…", "The phone lights her face. A contact: MOM.", "She
  holds it against her chest instead…". These are the film's own pictures, kept by the director.
- **Wrong:** all three show a different garment: wine-red **with sleeves** (short sleeves in 82, long sleeves in 315 and
  84), dry and clean, not the soaked, dirty sleeveless slip. 82 has her against a **sofa** beside a low table with
  two cups, not against the bed; 84 has the bed and frosted window from the apartment sheet.
- **Quick alternative:** the new set has all three beats (`76-03-on-the-floor`, `76-04-mom`, `76-08-cries-without-a-sound`):
  `PICKS` `"new"` for those keys.
- **Make:** `vera_run_takes/76-03-on-the-floor--r1.jpg`, `…/76-04-mom--r1.jpg`, `…/76-08-cries-without-a-sound--r1.jpg`
  (wire as `"take:…"`; they replace the `"original:…"` picks).
- **Attach:** `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg` (state C, after),
  `vera_run_new/style-sheets/loc-veras-apartment.jpg`, and the shipped picture (pose and light only).
- **Prompt (82, keep its pose):** *Vera's one-room apartment at night, lit only by the city through the rain-streaked window
  with frosted lower panes; wooden floor, the bed with a grey cover. Vera sits on the floor with her back against the side of
  the bed, legs out, still in the ruined sleeveless wine-red slip dress, wet and dark, the hem and knees dirty from the road,
  left pump on, right foot bare and grey with street dirt, mascara streaks drying, hair half-dry and tangled. No sofa, no cups.*
  + style line.
- **Prompt (315):** *Same room, same state, closer: the phone in both hands at her chest, its cold light on her face, the
  screen turned to her (the word MOM may show, nothing else).* + style line.
- **Prompt (84):** *Same room and state: she holds Jack's old brushed-steel flip-top lighter against her chest with both hands
  and cries without a sound, eyes closed.* + style line.
- **Check:** bare shoulders and thin straps; the bed, not a sofa; the same room in all three.

### V6. Two different hotel exits (73-01 and 73-03)
- **Plays:** 73 "Vera comes out of the hotel into the rain" (`s73/69-vera-runs`, a brass-and-glass hotel front on a wide lit
  avenue) and, on the next beat, "and starts to run" (the `69-vera-runs-v2` take: a plain modern doorway on a narrow street of
  shutters).
- **Fix without generating:** play the new `73-03-she-runs` (`PICKS` `"new"`), or keep the take and accept the jump.
- **Or make:** `vera_run_takes/73-03-she-runs--r1.jpg`. Attach `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg`
  (state A turning to B), `vera_run_new/style-sheets/loc-hotel.jpg` (entrance panel), `s73/69-vera-runs.jpg`. **Prompt:** *The
  same hotel entrance as the reference, a stone front with a short canopy of warm light, from across the avenue: Vera, a few
  steps out from under the canopy into the rain, breaking into a run screen left to screen right, both pumps, the wine-red
  dress already darkening with rain.* + style line.

### V7. No picture of her covering her face (74-18)
- **Update 20 October 2026: resolved.** The director marked the reflection take (it read as Vera holding the umbrella she left
  behind); the new set's 74-18, Vera covering her face, plays there now.
- The beat "Vera covers her face with her hands." now plays the reflection take with a new caption. If the beat should be
  seen: **make** `vera_run_takes/74-18-she-covers-her-face--r1.jpg`; attach `sheets/vera-face.jpg`,
  `vera_run_new/style-sheets/vera-red-dress.jpg` (state C), `vera_run_new/style-sheets/loc-the-route.jpg` (panel e).
  **Prompt:** *Vera on her knees on the wet street under the tracks, screen left, both hands over her face, shoulders shaking;
  the vending machines glow behind her; Jack's legs and long dark coat soft at the right edge of frame.* + style line. Then
  delete its `TAKE_CAPTION` entry so the screenplay caption comes back.

---

## Mara's service (scene 97A)

**Style line:** *Photorealistic contemporary Japanese neo-noir film still, 16:9. Cold slate and teal-blue-green shadows, warm
amber practical light only, restrained 35mm grain, subtle highlight halation. No legible text, signage, logos or watermarks.*

**The room** (`service_new/style-sheets/loc-service-room.jpg`, rules in `service_new/style-sheets/continuity.md`): Kaneko's
back room; tatami; the low wooden table at centre with, left to right, white chrysanthemums, the incense bowl with one stick,
Mara's framed photograph, a cup of tea, her drawings; the chest of drawers and lamp on the left wall; the big window with lace
curtains at the back; the arched shoji screen and cupboard in the right corner. Cushions: Vera, her mother, Jack on the left;
the three neighbours on the right; Kaneko at the foot. **Mara's photograph is the same object with the same face in every
shot** (`service_new/style-sheets/mara-memorial-photo.jpg`).

**Wiring:** save in `service_new/` under the new name, and point that shot's row in `SHOTS` (`tools/service-cut.mjs`) at it
(`N + "<name>"`). Then `node tools/service-cut.mjs` and rebuild.

### S1. 567 is two pictures glued together
- **Plays:** "Okada from the bar, late, at the door. He doesn't come in."
- **Wrong:** a split frame: Okada in the rain on the left, the room through a doorway on the right, joined at a hard vertical
  edge.
- **Quick alternative:** `service_new/567-okada-at-the-door.jpg` already exists (`N + "567-okada-at-the-door"`).
- **Make:** `service_new/567-okada-at-the-door-r1.jpg`
- **Attach:** `s81/100-the-bar-in-daylight.jpg` (Okada's face), `service_new/style-sheets/loc-lane-and-door.jpg`,
  `service_new/style-sheets/loc-service-room.jpg`.
- **Prompt:** *From inside Kaneko's room, low behind the backs of the mourners kneeling at the low table (soft, out of focus in
  the foreground), looking toward the open entry door: Okada (60s Japanese, short silver hair, weathered still face, black
  suit, white shirt, black tie) stands just outside on the wet step in the dusk rain, his black umbrella planted like a cane,
  not coming in. The umbrella stand inside the door with the folded black umbrellas and the one pale blue umbrella.* + style
  line.
- **Check:** one continuous picture; Okada outside the threshold.

### S2. 565: a standing man before Okada arrives, and no Jack
- **Plays:** "Vera and her mother bow their heads at the table." (caption rewritten, see above)
- **Wrong:** an older man in a black suit stands behind the table (he reads as Okada, who only arrives at 567); the kneeling
  men aren't the neighbours on the sheet; Jack isn't there; the neighbour woman is missing.
- **Make:** `service_new/565-they-bow-r1.jpg`
- **Attach:** `sheets/vera-face.jpg`, `service_new/style-sheets/vera-mother.jpg`, `thehiveescape/style-sheets/jack.jpg`,
  `service_new/style-sheets/service-neighbours.jpg`, `service_new/style-sheets/loc-service-room.jpg`,
  `service_new/style-sheets/mara-memorial-photo.jpg`.
- **Prompt:** *Kaneko's room at dusk, as the room sheet, from the side at kneeling height. On the left cushions, Vera (long
  charcoal-black coat, white shirt, pale grey sweater), her mother (silver-blonde hair, black coat, pearl studs) and Jack (long
  dark overcoat, white shirt, black tie) bow their heads to the table. On the right, the three neighbours from the sheet kneel,
  heads lowered. Kaneko kneels at the foot. Nobody stands. Mara's framed photograph on the table.* + style line. Then the
  caption can go back to "Vera goes to the table. Jack goes with her. They bow."
- **Check:** nobody standing; Jack present; the photograph matches the sheet.

### S3. Three pictures in other rooms (570, mom-02, mom-03)
- **Wrong:** 570 (Jack standing over the photograph) has another window, lamp and photograph; mom-02 (mother and daughter)
  is a shoji-walled room at a dark counter-height table; mom-03 (her mother goes) is a lantern-lit entry hall that isn't
  Kaneko's. 573 is in another room too (a television in the corner), and Vera wears a cream sweater with no coat.
- **Make:** `service_new/570-before-he-kneels-r1.jpg`, `service_new/extras/mom-02-mother-and-daughter-r1.jpg`,
  `service_new/extras/mom-03-what-she-wears-home-r1.jpg`, `service_new/573-her-mother-stays-r1.jpg`
- **Attach (all):** `service_new/style-sheets/loc-service-room.jpg`, `service_new/style-sheets/mara-memorial-photo.jpg`, the
  face sheets of whoever is in it (`thehiveescape/style-sheets/jack.jpg`, `sheets/vera-face.jpg`,
  `service_new/style-sheets/vera-mother.jpg`), and the picture being redone for pose only.
- **Prompts:** *Keep the pose and framing of the attached picture; move it into Kaneko's room exactly as the room sheet: tatami,
  the low table with chrysanthemums, incense, Mara's framed photograph (as the photo sheet), tea and drawings; lace-curtained
  window behind; the lamp on the chest of drawers on the left.* Then, per picture: **570** *Jack, in his long dark overcoat,
  white shirt and black tie, stands over the photograph before he kneels.* **mom-02** *Vera and her mother kneel side by side
  at the low table; her mother's hand rests on Vera's.* **mom-03** *Her mother, in her long black coat, steps down from the
  wooden entry step by the umbrella stand toward the open door and the rain.* **573** *Her mother kneels alone at the table with
  the photograph; Vera, in her charcoal-black coat, waits soft by the door.* + style line.
- **Check:** the same room in all of them; one photograph.

### S4. Mara's photograph changes face (563)
- **Plays:** "Jack straightens the photograph. Beside it, Mara's drawing of the arches in the rain."
- **Wrong:** the photograph shows a straight-haired, unsmiling woman, not the warm, smiling, wavy-haired Mara of the photo sheet.
- **Make:** `service_new/563-the-saved-drawing-r1.jpg`
- **Attach:** `service_new/style-sheets/mara-memorial-photo.jpg`, `s2/21-mara-bursts-in.jpg`, `s69/279-her-sisters-smile.jpg`,
  `s97a/563-the-saved-drawing.jpg` (composition).
- **Prompt:** *Keep this composition exactly (the pencil drawing of the railway arches in the rain, Jack's hands straightening
  the light-wood frame, the incense stick, the white chrysanthemums). Change only the photograph in the frame: it is the
  memorial photograph from the reference, Mara in her early twenties, long wavy golden-blonde hair, large blue-grey eyes, a
  warm genuine smile, dark top.* + style line.

### S5. The way out (587 before 569)
- The cut plays 587 (Vera already out in the lane under the blue umbrella, her mother on the step) before 569 (the mourners
  going up the lane). The captions now read in that order. If the director would rather they come out first, swap the two rows
  in `SHOTS` and put the earlier captions back.

---

## Jack and Ishida in the car (scene 61)

**Style line and blocks:** paste LOOK, CAR, LOCATION, ISHIDA and JACK from `jack_ishida_new/style-sheets/continuity.md`
(section 2) into every prompt, in that wording.

**The seat lock:** Japanese **right-hand drive**. Ishida drives from the right seat. Seen from the front, **Ishida is
screen-LEFT behind the wheel, Jack screen-RIGHT**. Generators default to left-hand drive, so say "right-hand drive" *and* where
the wheel lands in the frame.

**Wiring:** scene 61 in `src/film/story.json`: change the step's `src` to the new file, then rebuild.

### C1. 481–484 are left-hand drive; 483 has the wrong Jack (the director's note)
- **Plays:** "Jack studies the side of his face…" (481), "I need a safe car…" (482), "Jack turns and looks at him. Ishida
  keeps his eyes on the rain…" (483), "Jack looks at Ishida's hands on the wheel." (484).
- **Wrong:** the film opens on 61-01/61-02 with the wheel on the right, then 481–484 put it on the left: the car changes sides
  and the men change places. In 483 Jack's hair is long, dark and loose (it is swept back and grey at the sides everywhere
  else).
- **Quick alternative:** the new set has these beats drawn to the lock: `jack_ishida_new/61-03-the-side-of-his-face`,
  `61-06-just-you`, `61-08-eyes-on-the-rain`, `61-09-hands-on-the-wheel`.
- **Cheapest repair of the kept pictures:** the lock allows mirroring for this scene (no legible text in these frames). A
  mirrored 481 or 484 puts the wheel on the right; check Ishida's watch is still on his left wrist. Mirroring doesn't fix 483's
  hair.
- **Make:** `jack_ishida_new/61-08-eyes-on-the-rain-r1.jpg` (for 483), as an **edit of `61-02-neither-looks.jpg`**: *Keep
  everything in this picture. Jack, screen-RIGHT in the passenger seat, turns his head and shoulders to look at Ishida
  (screen-LEFT). Ishida, behind the wheel on the left of the frame, keeps looking straight ahead at the rain, hands on the
  wheel.* + the JACK block + LOOK. **Attach:** `61-02-neither-looks.jpg` (base), `jack_ishida_new/style-sheets/refs/jack-face.jpg`,
  `jack_ishida_new/style-sheets/refs/ishida-face.jpg`. For 481, 482 and 484 follow recipes 03, 06 and 09 in the continuity
  file's table, naming the files `…-r1.jpg`.
- **Check:** the wheel in front of Ishida, none in front of Jack; Jack's hair swept back, grey at the sides; nothing hangs
  from the mirror.

---

## The raid on the Hive (scenes 85–92)

**Style line:** *Photorealistic contemporary Tokyo neo-noir, 16:9 film still. Cold slate/blue-green shadows, warm amber
practicals only, wet surfaces, steady rain outside, restrained 35mm grain. No legible signage or text in frame.*
(`thehiveescape/style-sheets/continuity.md`, which also has the character locks.)

**Wiring:** save in `thehiveescape/s8N/` under the new name; change the step's `src` in that scene of `src/film/story.json`,
and move the picture's caption, cue and any `pictureLook` in `src/film/studio-edits.json` to the new file name (they go by file
name). Rebuild.

### R1. "Light out" with the light on (86-03)
- **Wrong:** the shutter is down and Kaneko points them out the back, but the ceiling lights and the blue gas ring under the
  pot are still on.
- **Make:** `thehiveescape/s86/86-03-shutter-down-light-out-r1.jpg`
- **Attach:** `thehiveescape/style-sheets/kaneko-and-counter.jpg`, `thehiveescape/style-sheets/vera.jpg`,
  `thehiveescape/style-sheets/jack.jpg`, `thehiveescape/s86/86-03-shutter-down-light-out.jpg` (composition).
- **Prompt:** *Keep this composition: the corrugated shutter pulled down on the left, Kaneko pointing toward the back passage,
  Vera and Jack going past the counter. Change the light: the overhead lights are off and the gas ring is out; the counter is
  lit only by a dim blue-green spill from the back passage and a last wisp of steam from the pot. Faces just readable.* +
  style line.

### R2. "Every bulb out" with a bulb lit (88-01)
- **Wrong:** a bare bulb burns in the corridor behind Vera and Jack in the picture captioned "In the black, Vera's hand finds
  the wall."
- **Make:** `thehiveescape/s88/88-01-every-bulb-out-r1.jpg`
- **Attach:** `thehiveescape/style-sheets/vera.jpg`, `thehiveescape/style-sheets/jack.jpg`,
  `thehiveescape/style-sheets/hive-locations.jpg`, `thehiveescape/s88/88-01-every-bulb-out.jpg` (composition).
- **Prompt:** *Keep this composition. Every bulb is out: the corridor is almost black, the only light a faint cold spill from
  a window at the far end catching the wet pipes, Vera's hand flat on the wall and the edge of Jack's face behind her.* + style
  line.

### R3. Three masked men, not four (119, 126)
- The screenplay and `masked-men-hive-team.jpg` have **four** men in knitted balaclavas with eyes visible; 119 v1 and 126 show
  three, and 126's masks are full face covers. If retaken: **make** `hive_raid_takes/119-single-file-r1.jpg` /
  `thehiveescape/s88/126-dark-r1.jpg`, attach `thehiveescape/style-sheets/masked-men-hive-team.jpg` and
  `thehiveescape/style-sheets/hive-locations.jpg`, and say *exactly four masked men in single file, black knitted balaclavas
  with a wide eye opening, long wet black coats, gloves, compact suppressed pistols, the leader with an earpiece wire* + style
  line. Minor; Jack's coat (overcoat in most shots, a leather jacket in one or two) is the same kind of small slip.

---

## Scene 2, the small bar

Scene 2 isn't a soundtrack run: it plays the screenplay's own words, so nothing there was re-captioned.

**Style line** (the set has none written down; this one matches its pictures): *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and
teal-blue-green shadows, warm amber practicals only, rain-streaked shopfront glass, restrained 35mm grain. No legible text,
signage, logos or watermarks.* Rules in `s2_new2/style-sheets/continuity.md`.

**Wiring:** save in `s2_picks/` under the new name, change the step's `src` in scene 2 of `src/film/story.json`, rebuild, and
update the scene 2 count in `scripts/film-backend.entry.ts` if it changes.

### T1. The men are outside again after they came in (23 after 25)
- **Plays:** 25 v2 ("Before she can answer, the door opens behind her.") shows their boots already inside by the journalist's
  stool; the next picture, 23 from `s2_new2` ("Mara is behind the counter before she knows she's moved."), shows the two
  masked men still outside the window. `s2_new2` staged them outside in 23 and coming in at 24; the film's order plays its 25
  first.
- **Make:** `s2_picks/23-behind-the-counter-r1.jpg`
- **Attach:** `s2_new2/style-sheets/location-current-bar.jpg`, `s2_new2/style-sheets/bar-props-continuity.jpg`,
  `s1/03-mara-walks.jpg` and `s1/04-mara-phone.jpg` (Mara), `s2_picks/23-behind-the-counter-s2new2.jpg` (composition).
- **Prompt:** *Keep this composition: low, customer side, Mara crouched under the near entrance end of the counter, wet, the
  red bird clip at her left temple. Change the windows: no figures outside, only rain on the glass; instead, at the right edge
  of frame, the wet black boots and coat hems of two men who have just stepped in through the door.* + style line.

### T2. The journalist should be sat in 19 (the director's note)
- **Plays:** "Six stools and a counter. Shelves of bottles glowing amber." (the film's `s2/19-the-bar`, an empty bar)
- **Option, no generation:** PlayFrame's history has a version of 19 with him at the counter (blob `ced1febb`, from PlayFrame
  commit `9c7d484`, 30 September; the one the scene 2 picker showed). Take it out full size and install it:
  `git -C ../PlayFrame cat-file blob ced1febb > /tmp/19.jpg`, then
  `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs /tmp/19.jpg public/film/img/s2_picks/19-the-bar-pf-ced1feb.jpg`,
  and point the step at it. It is an older bar layout than `s2_new2`'s.
- **Or make:** `s2_picks/19-the-bar-r1.jpg`. **Attach:** `s2_new/style-sheets/the-journalist.jpg`,
  `s2_new/style-sheets/refs/journalist-seated.jpg`, `s2/19-the-bar.jpg` (composition and room). **Prompt:** *Keep this room
  and composition: six stools and the counter, shelves of bottles glowing amber, rain on the windows. On the far stool sits
  the journalist (40s Japanese, short receding dark hair, wire-rim glasses, raincoat over a charcoal suit), alone, a brown
  notebook and a short glass of flat beer beside him.* + style line.

### T3. Small: the journalist's coat and stool
- The screenplay has "a man in a raincoat on the far stool"; 20 shows him in a charcoal suit nearest the camera. If 19 is redone
  with the raincoat, redo 20 to match (`s2_picks/20-the-journalist-r1.jpg`, same attachments).

---

## The interview room (scene 6), picked 20 October 2026

The director kept the film's own picture for 20 of the 21 shots and took the archived first take for **55** ("I speak
Japanese"). It was a 1912×800 frame, so the install tool cropped it to 16:9 at its centre and enlarged it to 1920×1080
(`s6_picks/55-i-speak-japanese-v1.jpg`). 325 was left undecided and stays as it is.

**Style line** (the room's lock is `interviewLook` in PlayFrame's `scripts/neonoire/interview-look.mjs`; this follows it):
*Photorealistic contemporary Tokyo neo-noir film still, 16:9, full bleed. A small worn grey-green police interview room under
one steady green-white fluorescent fixture, restrained 35mm grain. No legible text, signage, logos or watermarks.*

**Wiring:** save in `s6_picks/`, change the step's `src` in scene 6 of `src/film/story.json`, rebuild, and add the file to
the scene 6 check in `scripts/film-backend.entry.ts`.

### I1. Vera's hair is dark in 408 (the director's note)
- **Plays:** ISHIDA: "What I know is that two men were killed in Kanda, and that it is a matter between criminal groups…"
- **Wrong:** an over-the-shoulder single on Ishida; the back of Vera's head in the left foreground is **dark brown**. Vera is
  ash-blonde in every other shot of the room.
- **Make:** `s6_picks/408-a-matter-between-criminal-groups-r1.jpg`
- **Attach:** `sheets/vera.jpg`, `sheets/vera-face.jpg`, `sheets/ishida.jpg`, `s6/56-three-days-ago.jpg` (the room and
  blocking master), `s6/408-a-matter-between-criminal-groups.jpg` (composition).
- **Prompt:** *Keep this composition exactly: over Vera's shoulder onto Ishida (Japanese, fifties, short salt-and-pepper
  hair, charcoal suit, light grey open-collar shirt, no tie), speaking to her across the grey laminate table, the frosted rainy
  window behind him on the right. Change only Vera, soft in the left foreground, seen from behind: dry ash-blonde
  shoulder-length hair, the collar of her charcoal wool coat over a cream high-neck knit.* + style line.
- **Check:** the hair is ash-blonde, the same as 55 and 61; Ishida's face is unchanged.

---

## The envelope at dawn (scene 78), picked 20 October 2026

The director kept the film's own picture for all four shots (88, 316, 89, 90), so nothing in the film changed. The other
versions were the picture PlayFrame still uses for 88 and the archived first takes of 316, 89 and 90.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at grey dawn in light rain. Cold slate and
teal-blue-green, one weak amber walkway lamp, wet concrete, restrained 35mm grain. No legible text, signage, logos or
watermarks.*

**Wiring:** save in `s78/` under the new name (never over a file), change the step's `src` in scene 78 of
`src/film/story.json`, rebuild.

### W1. The envelope is left at the wrong door (316, the director's note)
- **Plays:** "He sets the envelope on the mat, squares it to the door, and goes."
- **Wrong:** the mat is at a door partway along the walkway, with the walkway running on past it. Vera's is the **end
  apartment**: in 88 her door is the last one on the left, with the walkway ending at it and the railing on the right.
- **Make:** `s78/316-squared-to-the-door-r1.jpg`
- **Attach:** `s78/88-the-walkway.jpg` (the door and the walkway's end), `s78/89-no-name.jpg` (the envelope and the mat),
  `vera_run_new/style-sheets/loc-veras-apartment.jpg`, `thehiveescape/style-sheets/jack.jpg` (his coat),
  `s78/316-squared-to-the-door.jpg` (composition).
- **Prompt:** *Low, close to the floor at the end of the open-air third-floor walkway: Vera's front door, the last door on the
  walkway, in the left foreground, the walkway's end wall just beyond it. On her coir doormat, a large brown kraft envelope
  tied with string, squared to the door. At the right edge, Jack's long charcoal-black wool overcoat and bare hand as he turns
  to go, walking away back along the walkway: the other doors recede behind him, the rusted railing and the rail lines beyond
  on the right. Grey dawn, rain dripping from the walkway roof.* + style line.
- **Check:** her door is the last one; nothing past it but the end wall.

### W2. Small: the envelope changes in 88
- 88 (Vera at her open door) shows a small **white** envelope on the mat; 316 and 89 show the large **brown** envelope tied with
  string, and 90 has her opening it. If 88 is retaken, attach `s78/89-no-name.jpg` and ask for the brown envelope
  (`s78/88-the-walkway-r1.jpg`).
