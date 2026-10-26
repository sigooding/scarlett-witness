# Image brief, 25 October 2026: the director's retakes, with the car beats rewritten

For an image-generating agent working in this repository. It covers every picture the director marked for a retake on
25 October in "Every picture, in order" (listed in `docs/director-picks-2026-10-25.md`), plus one note sent in chat (519).
Each entry gives the exact file to make, the references to attach and a prompt to use as it stands.

**Make the pictures and save them. Do not wire them into the film**: the film's maintainer (Claude, in the director's
session) swaps them in afterwards, once the director has seen them. Section 1, Kurose's car, comes first: the director asked
for its beats to be rewritten so that the getting in and the seats make sense.

## How to work

1. **Repository and branch:** `sigooding/scarlett-witness`, from `main`. Work on a new branch of your own and open a pull
   request to `main` when done.
2. **Where pictures go:** every picture into `public/film/img/retakes_2026_10_25/`, under the exact filename given (each
   ends `-r1`). Paths below are relative to `public/film/img/`.
3. **Never overwrite or delete a file.** Every filename here is new. If one exists already, stop and report it. If you make
   more than one version of a picture, save the best at the exact path and the others beside it as `<name>--alt1.jpg`,
   `<name>--alt2.jpg`.
4. **Format:** JPEG, 16:9, at least 1920×1080. **Ask the generator for its largest size** and keep the file at the size it
   came out at: never resize it down, never save a half-size copy. If you can run node, install each file with
   `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs <your file> public/film/img/<exact path>`, which crops to 16:9
   and enlarges below 1920×1080 but never shrinks.
5. **Edits before new pictures.** Where a prompt begins *Keep this picture exactly*, use an image-edit model on the base
   picture named under Attach and change only what the prompt names. It is cheaper and keeps everything else right.
6. **References:** attach the ones listed, faces first. Match faces, ages, hair and clothes exactly. Never take a face from a
   picture being redone, except as the base of an edit.
7. **No legible text** anywhere unless a prompt asks for it: no signs, logos, number plates, watermarks, borders or
   letterbox bars. **Never mirror** a picture to fix a framing.
8. **End every prompt with its section's style line.**
9. **Do not edit** anything under `src/`, `tools/`, `scripts/` or `docs/`.
10. **Report** in `public/film/img/retakes_2026_10_25/README.md`: one line per picture made (file, item number, anything that
    still isn't right). List the items you did not get to.
11. **Credits are short:** work through the sections in order and stop when they run out.

---

# 1. Kurose's car (scenes 93 and 94): the beats, rewritten

**The director's notes:** 138 "car looks wrong, keep doors shut"; 139 "door open wrong way"; 368 "they need to switch
seats". **Found while checking them:**
- 140 and 141 show Ishida already inside the car, holding the tea, before the hand offers it and before "Ishida gets in".
- 139's rear door is hinged at its back edge, like a suicide door.
- In 139, Kurose sits in the open doorway, in the seat Ishida will take.
- 138 opens the wrong door: the front door on the road side.

**The geography the pictures already agree on.** 137 (the director's pick, `reshoot-1080/137-he-knows-this-car.jpg`), 139
and 141 put the sedan in front of the station steps with its right side against the kerb. In 141, Ishida is on the car's
right and Kurose on its left. Everything below follows that, so the pictures that stay still fit.

## The seat lock (never changes between cuts)

```
                       PAVEMENT · the steps · the station
  ══════════════════════════════ kerb ═══════════════════════════════
                                     ╱  REAR RIGHT DOOR, the only one that opens:
                                    ╱   hinged at the centre pillar, its back
           ┌───────────────────────┤    edge swung out toward the pavement
  ◄ nose   │ DRIVER (wheel)        │ ISHIDA'S SEAT (rear right)        │
 (toward   │ front right           │ empty until he gets in            │
 the steps)│                       │                                   │
           │ empty                 │ KUROSE (rear left, the far side)  │
           │ front left            │                                   │
           └───────────────────────┴───────────────────────────────────┘
                 THE ROAD  (137, 138 and 140 are shot from here)
```

- **Japanese right-hand drive.** The driver is in the front RIGHT seat, a dark silhouette at the wheel whose face is never
  seen. Kurose sits in the back on the LEFT, the far side from the pavement. The car's right side is against the kerb; its
  nose points toward the station steps.
- **The one door:** the REAR RIGHT door, on the pavement side. It is an ordinary rear door, **hinged at its front edge on the
  centre pillar**, so it opens with its back edge swinging out toward the pavement. Never hinged at the back. Every other door
  stays shut all scene.
- **Ishida** gets in by that door and sits in the back on the right, behind the driver, beside Kurose.
- **The seats in screen terms, for each camera:**

  | Camera | What it shows |
  |---|---|
  | From the road, facing the station (137, 138, 140) | Nose screen-LEFT. We see the car's left side, all of its doors shut. The open door is on the far side, hidden by the car. |
  | From the pavement, facing the road (139, 94-01) | Nose screen-RIGHT. We see the car's right side: the driver at the wheel in the front seat nearest us, the open rear door nearest us. The door stands out from the right-hand edge of its doorway (the centre pillar), its inside panel facing us. |
  | Inside, looking back from between the front seats (141, 368) | **Ishida screen-LEFT, Kurose screen-RIGHT**, the rear window behind them. |
  | Inside, looking forward from the back seat | **Never used:** it flips them. |

## The beats, rewritten

The screenplay's words stay as they are; what changes is which picture plays on which words, and what each picture shows.

| # | Plays on (the screenplay, unchanged) | Picture | What it shows |
|---|---|---|---|
| 1 | "Rain. Ishida comes down the front steps without an umbrella." | `s93/93-00-down-the-steps.jpg` (keep) | From the road: Ishida coming down the steps. |
| 2 | "At the kerb, a black sedan. Engine running. Wipers beating slowly." / "He stops. He knows this car." | **1a** `137-he-knows-this-car-r1` | The director's pick (`reshoot-1080/`) with Ishida's raincoat taken off. From the road: Ishida on the pavement, the car at the kerb with its nose toward him, every door shut. |
| 3 | "A long moment. Then the rear door opens from inside." | **1b** `138-the-door-opens-r1` | The same set-up as 137. The doors we can see stay shut; the door opens on the far side and shows only as warm light spilling onto the pavement. The film's door sound carries it. |
| 4 | "At the foot of the steps, a black sedan waits at the kerb, engine running, wipers going." / "Its rear door stands open: warm amber light, leather." | **1c** `139-only-tea-r1` | Over Ishida's shoulder from the pavement: the open rear door nearest us (front-hinged), the near seat EMPTY, Kurose on the far side of the back seat in shadow, the driver at the wheel. |
| 5 | "Ishida stands in the rain. He looks back up at the station, at one lit window on the second floor where somebody is still working." | **1d** `140-where-are-we-going-r1` | From the road, across the car's roof: Ishida on the pavement beside the open door, turned back, looking up at the one lit window. |
| 6 | "From inside the car, a man's clean hand holds out a cup of tea. The watch from the model." / KUROSE: "It's only tea." | **1e** `94-01-the-clean-hand-r1` (new) | Ishida's view into the car: across the empty seat, Kurose's clean hand holds out the cup; the watch from the model on his wrist; his face in shadow. |
| 7 | "Ishida gets in. The door closes." | `s94/141-he-drinks.jpg` (keep, **moves here**) | Inside, looking back: Ishida (screen-left) now seated; Kurose (screen-right) hands him the cup he did not take outside. |
| 8 | "The rain is suddenly very far away." | **1f** `368-the-door-closes-r1` | The same set-up as 141: Ishida holds the cup in both hands, eyes down; Kurose looks straight ahead. |

- **The current 140** (Ishida alone inside with the cup, the city passing) has no place in the script as written: scene 95
  is the car seen from outside. It stays on disk as an unused take.
- **A free stand-in for 5** exists in PlayFrame (`public/images/neonoire/s94/140-where-are-we-going.jpg` there): Ishida in
  the rain looking back up at the lit window, the open door behind him. But it puts him on the road side of the car.
- **Two optional words for the page** (the director's call; not needed by the pictures): "Its rear door stands open: warm
  amber light, leather, **an empty seat**." and "Ishida gets in **beside him**."

## Prompt blocks (paste these, in this wording)

**LOOK**
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night in steady rain. Cold slate and teal-blue-green
> shadows; warm amber light only from the car's interior and the station entrance; wet black asphalt with long reflections;
> restrained 35mm grain, subtle highlight halation. No legible text, signage, logos, number plates or watermarks.

**CAR**
> Kurose's car: a black 1990s Japanese luxury four-door saloon with a chrome grille, polished, rain beading on it, RIGHT-HAND
> DRIVE. Engine running, exhaust steam at the back, wipers beating slowly. Inside: tan leather seats with headrests, a
> fold-down armrest in the back, warm amber courtesy lights. A driver in a dark suit at the wheel, front right, a silhouette
> whose face is never seen. Nothing hangs from the mirror.

**LOCATION**
> A small concrete police station on a quiet Tokyo street at night: three wide concrete steps up to glass double doors under
> a flat canopy, a red lamp over the entrance, the ground-floor windows dark; on the second floor, one lit window with
> somebody still working at a desk inside, every other window dark. A narrow pavement, a kerb, wet black asphalt.

**ISHIDA** (as `sheets/ishida.jpg`, `sheets/ishida-face.jpg`)
> Japanese police detective, mid-50s, short salt-and-pepper hair flattened by the rain; clean-shaven, lined tired face; a
> fresh split at the left corner of his mouth (his left), a little dried blood, from earlier that day; charcoal-grey jacket
> and trousers, light grey shirt open at the collar, no tie. No coat, no umbrella: his hair and shoulders soaked.

**KUROSE** (as `sheets/kurose.jpg`)
> Japanese man, early 70s, thick white hair swept straight back, a calm lined face; charcoal three-piece suit, white shirt,
> dark tie; clean, manicured hands. The watch from the model: a slim silver watch with a white dial on a black leather strap,
> exactly as in `retakes_2026_10_20/311-the-hand-on-the-model-r1--alt1.jpg`.

## Shot recipes

**Attach for all of 1:** `reshoot-1080/137-he-knows-this-car.jpg` (the car and the street), `s93/93-00-down-the-steps.jpg`
(the station), `sheets/ishida.jpg`, `sheets/ishida-face.jpg`, `sheets/kurose.jpg`, plus each recipe's own.

**1a.** `retakes_2026_10_25/137-he-knows-this-car-r1.jpg`
- Plays on: "At the kerb, a black sedan. Engine running. Wipers beating slowly." and "He stops. He knows this car." The
  director: it shouldn't be a raincoat.
- An edit of `reshoot-1080/137-he-knows-this-car.jpg`, the director's pick (attach it as the base). Attach also
  `s93/93-00-down-the-steps.jpg` for his clothes.
- Prompt: *Keep this picture exactly: the police station, the black saloon at the kerb with its nose toward him, the rain,
  Ishida standing on the pavement at the foot of the steps looking at the car. Change only Ishida's clothes: no coat. He
  wears his charcoal-grey jacket and trousers and a light grey open-collar shirt, as in the reference 93-00, soaked by the
  rain.* + LOOK.
- Check: no coat; nothing else changed.

**1b.** `retakes_2026_10_25/138-the-door-opens-r1.jpg`
- Plays on: "A long moment. Then the rear door opens from inside." The director: keep the doors shut.
- An edit of 1a once made (attach it as the base), so Ishida has no coat here either.
- Prompt: *Keep this picture exactly: the police station, Ishida standing still on the pavement at the foot of the steps
  looking at the car, the black saloon at the kerb with its nose toward him, every door we can see shut, the rain. Change
  only the light: the car's interior lights are now on, warm amber glowing through its windows, and warm light spills out
  from the far side of the car onto the wet pavement beyond it, as if a door on that side has just opened.* + LOOK.
- Check: no door on the near side open; nobody new in shot.

**1c.** `retakes_2026_10_25/139-only-tea-r1.jpg`
- Plays on: "At the foot of the steps, a black sedan waits at the kerb, engine running, wipers going." and "Its rear door
  stands open: warm amber light, leather." The director: the door opens the wrong way.
- Attach: `s94/139-only-tea.jpg` (composition only), `s94/141-he-drinks.jpg` (the interior).
- Prompt: *Over Ishida's right shoulder from the pavement at the foot of the police station steps, the station behind the
  camera, looking out at the road: his wet hair and shoulder soft in the left foreground. The black saloon waits at the kerb,
  nose screen-RIGHT, its right side toward us. Right-hand drive: the driver, a dark silhouette, at the wheel in the front seat
  nearest us. The rear door nearest us stands open, hinged at its front edge on the centre pillar: the open door stands out
  toward us from the right-hand edge of the doorway, its tan leather inside panel facing us, lit amber. Through the doorway
  the near half of the back seat is empty: tan leather, warm amber light, the armrest down. On the far side of the back seat,
  by the far window, a man sits still, looking ahead, his white hair catching the light, his face in shadow, his hands out of
  sight.* + CAR + LOOK.
- Check:
  - the door hangs from the centre pillar, never from the back;
  - the near seat is empty;
  - the wheel is in front of the nearest front seat.

**1d.** `retakes_2026_10_25/140-where-are-we-going-r1.jpg`
- Plays on: "Ishida stands in the rain. He looks back up at the station, at one lit window on the second floor where somebody
  is still working."
- Attach: `s80/the-blood-on-his-hand.jpg` (the split lip).
- Prompt: *From the road on the far side of the car, at chest height, looking toward the police station across the black
  saloon's wet roof: the roof runs along the bottom of the frame, nose screen-LEFT, its near doors shut. On the far side of
  the car the rear door stands open toward the pavement, the top of its window frame rising above the roofline at frame
  right, angled back toward the rear of the car, amber light from inside. Beyond the car, on the pavement beside the open
  door, Ishida stands in the rain, half turned away from the car, his face lifted toward the station: above the entrance's
  red lamp, on the second floor, one lit window where a figure still works at a desk. His face readable in three-quarter,
  rain on it.* + ISHIDA + LOCATION + LOOK.
- Check: the car is between the camera and Ishida; he is on the pavement side.

**1e.** `retakes_2026_10_25/94-01-the-clean-hand-r1.jpg` (a new picture for the film; it takes the beat 141 played on)
- Plays on: "From inside the car, a man's clean hand holds out a cup of tea. The watch from the model." and "It's only tea."
- Attach: `retakes_2026_10_20/311-the-hand-on-the-model-r1--alt1.jpg` (the hand and the watch), `s94/141-he-drinks.jpg`
  (the cup and the interior), 1c once made (the doorway).
- Prompt: *Ishida's view, standing on the pavement at the open rear door of the black saloon, looking in: the car's front
  screen-RIGHT. Across the empty near seat of tan leather, from the far side of the back seat, a man leans across and holds
  out a small stainless-steel cup of tea toward us, steam rising from it. His clean, manicured hand; a white shirt cuff and a
  charcoal suit sleeve; on his wrist the watch from the reference, a slim silver watch with a white dial on a black leather
  strap. His face is above, in shadow; only his swept-back white hair catches the warm amber light. Rain falls across the
  doorway in the foreground, catching the light.* + KUROSE + LOOK.
- Check: the strap is black leather, not a steel bracelet; nobody else's hands in shot.

**1f.** `retakes_2026_10_25/368-the-door-closes-r1.jpg`
- Plays on: "The rain is suddenly very far away." The director: they need to switch seats.
- An edit of `s94/141-he-drinks.jpg` (attach it as the base), which already has them in the right seats.
- Prompt: *Keep this picture exactly: the same car interior, the same camera between the front seats looking back, Ishida
  screen-LEFT by the door he came in through (now shut), Kurose screen-RIGHT, the rear window behind them. Change only the
  moment: Ishida holds the small steel cup close in both hands, steam rising, his eyes down; Kurose sits upright looking
  straight ahead, his hands folded on his knee, the watch showing. Rain runs down the side windows; through the rear window
  the street is a blur of light.* Give Ishida the split lip (ISHIDA block). + LOOK.
- Check: Ishida screen-left, Kurose screen-right; one cup.

**1g. (optional, small) `retakes_2026_10_25/141-he-drinks-r1.jpg`**, an edit of `s94/141-he-drinks.jpg`. 141 shows Kurose's
watch on a steel bracelet, not the model's black leather strap, and gives Ishida no split lip.
- Prompt: *Keep this picture exactly. Change only Kurose's watch: a slim silver watch with a white dial on a black leather
  strap, as in the reference; and give Ishida a small fresh split at the left corner of his mouth, a little dried blood.*
- Attach: `retakes_2026_10_20/311-the-hand-on-the-model-r1--alt1.jpg`, `s80/the-blood-on-his-hand.jpg`.

**The raincoat:** in 137 as picked, Ishida wears a long dark raincoat he has in no other shot. The director, 25 October: it
shouldn't be a raincoat. 1a takes it off, and 1b is made from 1a.

---

# 2. Jack's office (scenes 18, 21 and 77): the desk the way the room master has it

**The director's notes:**
- 271: "desk wrong orientation compared to earlier shots";
- 87: "desk in wrong orientation";
- montage 18's 01: "remove, replace without reflection and correct desk orientation".

**The director's own swaps show the way:** 189 → `archive/s18/189-after-the-last-train--v2.jpg` and 85 →
`archive/s77/85-the-desk-lamp--v2.jpg`. Both have the desk as the room master `s10/164-depends-whos-calling.jpg` has it:
Jack at the desk's right end, side-on, facing left toward the door. The current 85, 87 and 189 put him behind the desk's
long side with his back to the window; 271 seats Vera there and Jack on the near side, his back to the camera.

> **Warning (26 October).** The director says a plan of the office that Claude drew from this description has the desk the
> wrong way. The office pictures also disagree about the door (`docs/location-references.md`, section 1). Make no office
> picture from this block until the director's own office reference exists. Then attach that reference and follow it,
> not this block.

**OFFICE** (paste in every office prompt)
> Jack's office, one small grey room, never mirrored. Back wall: a wide window with grey venetian blinds, rain on the glass,
> an elevated railway outside. Under the window, a low grey steel cupboard with a few binders on it. Left wall: the door,
> frosted glass in a wooden frame; its lettering is on the outside and cannot be read from inside the room. Right back
> corner: a grey four-drawer filing cabinet with a small old CRT television on top playing a black-and-white samurai film.
> Right wall: a worn brown sofa with a grey blanket. In the middle of the room, free-standing, Jack's desk: worn dark walnut,
> about 1.6 by 0.75 metres, its long side toward the camera. A brass banker's lamp with a green glass shade at its LEFT end;
> one black rotary telephone at its back edge, left of centre. **Jack's chair is at the desk's RIGHT end: he sits side-on to
> the camera, facing LEFT along the desk toward the door, the sofa behind him.** A visitor sits at the desk's left end,
> facing him. The camera stands in front of the desk's long side, as in the room master.

**JACK** (as `sheets/jack.jpg`, `sheets/jack-face.jpg`)
> Western man, late 50s, tall and lean, lined weathered face, swept-back dark hair greying at the sides, collar-length, short
> grey stubble; dark charcoal jacket over an off-white open-collar shirt.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, restrained 35mm grain. No legible text,
signage, logos or watermarks.* At night add: *warm light only from the green-shaded lamp, cold blue-grey from the window.* By
day: *flat grey rainy daylight through the blinds.*

**Attach for all of 2:**
- `s10/164-depends-whos-calling.jpg` (the room master);
- `archive/s18/189-after-the-last-train--v2.jpg` and `archive/s77/85-the-desk-lamp--v2.jpg` (the director's picks);
- `sheets/jack.jpg`, `sheets/jack-face.jpg`.

**2a.** `retakes_2026_10_25/montage18-01-r1.jpg`
- Plays as: the first picture of the montage after scene 18 (to the Hive, after the last train). The director: no reflection,
  and the desk the right way.
- Attach: `montage18/01.jpg` (the mood).
- Prompt: *Night. Jack alone at his end of the desk, side-on to the camera, facing left, very still, waiting. In the lamp's
  pool of light in front of him, Mara's sketchbook lies open and the short letter beside it. Behind the desk the window is
  dark with rain; the lit windows of the last train pass on the elevated line outside. No reflection of Jack in the glass:
  the blinds are half lowered and the room is lit only by the lamp and the CRT.* + OFFICE + JACK + style line (night).

**2b.** `retakes_2026_10_25/271-not-yet-r1.jpg`
- Plays on: "The sketchbook is on the desk between them. Jack's hand rests on its cover."
- Attach: `s10/415-four-days.jpg` (the model: this two-shot already has them at the two ends of the desk),
  `s21/271-not-yet.jpg` (the cups and the sketchbook), `sheets/vera.jpg`, `sheets/vera-face.jpg`.
- Prompt: *Day. A side two-shot from the front of the desk: Vera at the desk's LEFT end, near the door, facing right, in her
  dark charcoal wool coat (still on) over a cream high-neck knit, ash-blonde shoulder-length hair, waiting. Jack at the RIGHT
  end, facing her, his hand resting flat on the cover of Mara's closed sketchbook in the middle of the desk between them. Two
  paper coffee cups. Behind the desk the window is grey with rain, the blinds shivering as a train passes.* + OFFICE + JACK
  + style line (day).

**2c.** `retakes_2026_10_25/87-he-writes-nothing-r1.jpg`
- Plays on: "He picks up a pen to write something on the envelope. He holds it over the paper for a long time."
- Attach: `s77/86-the-clean-envelope.jpg` (the envelope and his hands), `s77/87-he-writes-nothing.jpg` (his wet jacket).
- Prompt: *Night. Jack at his end of the desk, side-on to the camera, facing left, in his rain-darkened jacket. On the desk in
  front of him lies the brown kraft envelope with its string tie, the notebook inside it; he holds a pen still above it, not
  writing. His hands as in the reference: dark dried blood in the creases of the knuckles. The lamp lit at the far (left)
  end, the black rotary phone at the back edge.* + OFFICE + JACK + style line (night).

**2d.** `retakes_2026_10_25/194-he-holds-it-without-drinking-r1.jpg`. The director, 25 October: 194 and the shot before it
(271) both have the desk the wrong way round.
- Plays on: "Jack sits very still. He picks up the coffee she brought him and holds it without drinking, the way he held the
  can at the vending machine." Vera has just left.
- Prompt: *Day. Jack alone at his end of the desk, side-on to the camera, facing left toward the door she went out of, holding
  a paper coffee cup in both hands without drinking. Her empty chair at the desk's left end; her own cup still on the desk;
  the closed sketchbook between.* + OFFICE + JACK + style line (day).

**2e.** `retakes_2026_10_25/249-the-line-r1.jpg`. Found in a check of every office picture: 249 has Jack behind the desk
facing us, like 87. The director, 25 October: redo it too. (Every other office picture already has the room master's
layout, or shows too little of the room to tell.)
- Plays on: "The line goes dead. Jack holds the receiver a moment longer."
- Attach: `s11/249-the-line.jpg` (the moment), `s11/418-it-takes-a-long-time-to-dial.jpg` (the lamp and the phone, from his
  end).
- Prompt: *Night. Jack at his end of the desk, side-on to the camera, facing left, the black receiver still at his ear after
  the line has gone dead, its cord running to the rotary phone on the desk's back edge; the lamp lit at the left end; behind
  the desk the window dark with rain.* + OFFICE + JACK + style line (night).

---

# 3. Mrs. Sakai's room (scenes 29 and 59): the altar on the right

**The director's notes:** 204 and 364, "memorial on wrong side"; 354, "jack is missing".

The room as `s29/354-the-altar-photograph.jpg`, `s29/273-the-receipts.jpg` and `retakes_2026_10_20/365-the-altar-r1.jpg`
have it: **the black-and-gold Buddhist altar on the RIGHT of the back wall**, the old CRT television to its left. In scene 29,
**Mrs. Sakai kneels on the LEFT side of the kotatsu and Jack on the RIGHT**. 204 and 364 put the altar on the left.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey rainy daylight, restrained 35mm grain. No
legible text, signage, logos or watermarks.*

**Attach for all of 3:** `s29/354-the-altar-photograph.jpg`, `s29/273-the-receipts.jpg`,
`retakes_2026_10_20/365-the-altar-r1.jpg`, `s1/07-old-man.jpg` (Sakai's face for the altar photograph).

**3a.** `retakes_2026_10_25/204-the-tea-she-does-not-want-to-pour-r1.jpg`
- Plays on: "MRS. SAKAI (70s), small and hard, pours Jack tea she doesn't want to pour."
- Attach: `s29/204-the-tea-she-does-not-want-to-pour.jpg` (composition), `sheets/jack-face.jpg`.
- Prompt: *Mrs. Sakai's small tatami room, the wide view of the reference: lace-curtained windows along the back wall, the
  kotatsu with its patterned quilt in the middle. Mrs. Sakai (70s, short grey hair, dark navy cardigan) kneels on the LEFT side
  of the kotatsu, pouring tea from a brown clay pot without warmth; Jack kneels on the RIGHT side in profile, facing her across the kotatsu as in the reference 273, the altar behind him. The
  black-and-gold Buddhist altar with its candles and the framed photograph of Sakai stands on the RIGHT of the back wall,
  behind Jack; the old CRT television on its low stand is to the left of the altar, nearer the middle. Nothing on the left of
  the back wall but the window.* + style line.

**3b.** `retakes_2026_10_25/354-the-altar-photograph-r1.jpg`
- Plays on: "She studies him. Then she looks at the photograph on the altar." The director: Jack is missing.
- Attach: `s29/354-the-altar-photograph.jpg` (the base: keep its room and her), `sheets/jack-face.jpg`.
- Prompt: *Keep this picture: the room, the light, Mrs. Sakai kneeling on the left side of the kotatsu, the television and the
  altar on the right. Add Jack, kneeling on the RIGHT side of the kotatsu facing her, as in the reference 273, so that she
  looks past him to the altar photograph beyond him.* + style line.

**3c.** `retakes_2026_10_25/364-the-kotatsu-r1.jpg`
- Plays on: "The kotatsu." (scene 59: the room while her phone rings, nobody in it).
- Attach: `s59/366-teacup-on-its-side.jpg`.
- Prompt: *Mrs. Sakai's small tatami room exactly as the reference 365, nobody in it: the kotatsu with its patterned quilt in
  the foreground; the altar on the RIGHT of the back wall; the old television to its left, on with the sound off, a pale blue
  glow; a teacup on its side on the tatami. Rain on the window.* + style line.

---

# 4. The roadside inn (scenes 35 to 46)

**The lobby, as `s40/176-were-closed.jpg` has it:**
- the front door at the left;
- the pink payphone on the left wall, beside a glass-fronted case of souvenirs and key fobs;
- two old vinyl armchairs;
- a wooden staircase at the back;
- Mr. Noda's plain wooden desk to the right of the stairs;
- a CRT on a high shelf on the right wall, playing baseball.

**Style line:** *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green
shadows, warm amber practical light only, restrained 35mm grain. No legible text, signage, logos or watermarks.*

**4a to 4c, the payphone: one handset.** The director: "theres 2 x receiver phone handset. one to his ear and one hung up"
(and in 376 "he has extra arm"). The pink payphone has one pink handset on a coiled pink cord. When Jack is on the phone, that
handset is at his ear and the cradle is empty. There is no other receiver.

| File | Base to edit | Plays on | Prompt |
|---|---|---|---|
| `retakes_2026_10_25/207-the-pink-payphone-r1.jpg` | `s35/207-the-pink-payphone.jpg` | "Mr. Noda asleep in front of the baseball. Jack at the pink payphone, feeding it coins." | *Keep this picture exactly. Change only the phone: the payphone's own pink handset is at Jack's ear, its coiled pink cord running from the phone to it; the cradle is empty; his other hand feeds a coin into the slot. No second receiver anywhere.* |
| `retakes_2026_10_25/538-the-receipts-in-his-hand-r1.jpg` | `s36/538-the-receipts-in-his-hand.jpg` | "Jack looks at the receipts in his hand." | *Keep this picture exactly. Change only the phone: the pink handset is at his ear on its coiled pink cord, the cradle empty; the receipts in his other hand. No second receiver.* |
| `retakes_2026_10_25/376-the-coins-run-out-r1.jpg` | `s36/376-the-coins-run-out.jpg` | "The coins run out. The line goes dead." | *Keep this picture exactly. Change only Jack's hands and the phone: two arms only. His left hand holds the payphone's pink handset to his ear on its coiled pink cord; his right hand holds the receipts. The cradle is empty, the coin tray bare. No black receiver, no third hand.* |

Attach for each: its base, `sheets/jack-face.jpg`, `sheets/mr-noda.jpg`.

**4d.** `retakes_2026_10_25/460-parked-crooked-r1.jpg`
- Plays on: "She offers the pack anyway. He shakes his head. He stands in the doorway and looks out: a muddy yard, a gate onto a
  farm track, and the old pickup parked crooked across the path." The director: Jack and Mrs. Noda are missing. (For the
  maintainer: move its quote to "She offers the pack anyway.")
- Attach: `s37/542-dont-tell-my-husband.jpg` (her, on the step), `s37/209-the-keys-are-always-in-it.jpg` (the doorway),
  `s37/460-parked-crooked.jpg` (the yard and the pickup), `sheets/mrs-noda.jpg`, `sheets/jack.jpg`.
- Prompt: *From inside the dim inn kitchen, behind them: Jack stands in the open back doorway, his back three-quarters to us,
  in his long dark overcoat. Mrs. Noda (70s, grey hair in a bun, green work jacket, apron) sits on the step outside under the
  eave, holding her cigarette pack up toward him; he shakes his head. Beyond them in the rain, lit by one lamp on a pole: the
  muddy yard, a wooden gate onto a farm track, and the old dark pickup parked crooked across the path.* + style line.

**4e.** `retakes_2026_10_25/175-the-curtain-gap-r1.jpg`
- Plays on: "HIS POV THROUGH THE CURTAIN GAP: four black cars in an arc across the lot, headlights on, rain visible only inside
  the beams. Eight MEN step out…" The director: bad quality. (The current one also puts a building behind the cars; from
  Jack's window the cars face the inn, with nothing behind them but the dark.)
- Attach: `s39/174-he-has-heard-the-gravel.jpg` (the window and the curtain), `sheets/roadside-inn.jpg`,
  `sheets/masked-man.jpg`, `roadside/s38/38-01-headlights-on-the-highway.jpg` (the dark country).
- Prompt: *Jack's point of view from his upstairs window at the roadside inn, through the gap where his fingers lift one corner
  of a thin curtain (the curtain's edge and his fingertips soft in the foreground): below, the inn's gravel lot at night. Four
  black saloons stand in an arc across the lot facing the inn, headlights on and glaring toward us; the rain is visible only
  inside the beams. Eight men in dark clothes, knit caps and lower-face masks, stepping out of the cars and splitting up
  without a word. Beyond the lot, only darkness and the empty highway.* + style line. Make it at the generator's best quality.

**4f.** `retakes_2026_10_25/177-behind-the-counter-r1.jpg`
- Plays on: "A burst of suppressed fire into the ceiling. Plaster rains down. Mr. Noda throws himself behind the counter." The
  director: the desk as in the shot before, and add a bad guy.
- Attach: `s40/176-were-closed.jpg` (the lobby and the desk), `sheets/masked-man.jpg`, `sheets/mr-noda.jpg`.
- Prompt: *The inn lobby exactly as the reference 176. Mr. Noda (70s, grey hair, brown cardigan) throws himself down behind his
  plain wooden desk, in the same place as in the reference, his chair tipping. At the left by the front door, a masked man in
  black fires his suppressed weapon up into the ceiling; plaster and dust rain down through the light.* + style line.

**4g.** `retakes_2026_10_25/178-staff-side-r1.jpg`
- Plays on: "The souvenir case shatters. The CRT keeps playing baseball." The director: add a bad guy walking to the stairs.
- Attach: `s40/176-were-closed.jpg`, 4f once made, `sheets/masked-man.jpg`.
- Prompt: *The inn lobby as the reference 176: the glass souvenir case on the left wall bursting, glass and key fobs in the air;
  Mr. Noda out of sight behind his wooden desk; a masked man in black walking fast toward the wooden staircase at the back, his
  weapon up; the CRT on its high shelf on the right wall still showing baseball.* + style line.

**4h.** `retakes_2026_10_25/210-the-third-time-r1.jpg`
- Plays on: "The third time, he hits it with everything he has. The frame cracks open. Rain pours in." The director: Jack is
  missing his jacket.
- An edit of `s42/210-the-third-time.jpg`; attach also `s41/179-same-wood.jpg` and `s43/211-wet-tin.jpg` (his coat).
- Prompt: *Keep this picture exactly. Change only Jack's clothes: his long charcoal-black wool overcoat on over the off-white
  shirt, as in the references.* + style line.

**4i.** `retakes_2026_10_25/213-clutch-each-other-r1.jpg`
- Plays on: "Jack pushes Mr. Noda into the pantry beside his wife. The old couple clutch each other in the dark." The director:
  more dynamic, more rushed.
- Attach: `s46/213-clutch-each-other.jpg` (the kitchen), `sheets/mr-noda.jpg`, `sheets/mrs-noda.jpg`, `sheets/jack.jpg`.
- Prompt: *The inn kitchen in the dark, a low, close, tilted angle. Jack mid-shove, pushing Mr. Noda through the narrow pantry
  doorway, his other hand already on the pantry door to shut it, his coat swinging, motion blur on his arm. Inside, Mrs. Noda
  pulls her husband in and the old couple clutch each other. A torch beam sweeps in from the corridor behind; dust in the air.
  Seconds left.* + style line.

**4j.** `retakes_2026_10_25/462-a-finger-to-his-lips-r1.jpg` (from the director in chat, 25 October)
- Plays on: "Jack puts a finger to his lips." (Mr. Noda, behind the counter off to the left, has seen him; one gunman stands
  in the middle of the lobby.) The director: his hand is at the wrong angle. (Also: the vending machine behind him already
  has bullet holes; the gunman shoots it in the next shot, after the lights go out.)
- An edit of `s45/462-a-finger-to-his-lips.jpg` (attach it as the base).
- Prompt: *Keep this picture exactly: Jack at the corridor's edge in his dark overcoat, looking off to the left toward the
  counter, his other hand by the light switch on the door frame, the lobby behind him. Change only his right hand: raised
  close to his face, the index finger upright and pressed straight up across the middle of his closed lips, the other
  fingers folded loosely, the back of the hand turned to the left, toward the man he is hushing, the palm toward his own
  chin; the wrist straight, the elbow down by his side. And the vending machine behind him is whole: no bullet holes yet.* +
  style line.
- Check: five fingers; the gesture reads as "quiet" at a glance.

---

# 5. The rest, in film order

**Style line** unless a picture names another: *Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold
slate and teal-blue-green shadows, warm amber practical light only, wet reflective surfaces, restrained 35mm grain, subtle
highlight halation. No legible text, signage, logos or watermarks.*

**5a.** `retakes_2026_10_25/m1-neon-backstreet-r1.jpg` (the opening titles' backstreet)
- The director: poor quality.
- Attach: `montage/m1-neon-backstreet.jpg` (composition), `s1/01-backstreet.jpg`, `sheets/01-backstreet.jpg`,
  `sheets/kanda-alley-layout.jpg`.
- Prompt: *A narrow Kanda backstreet at night in the rain, empty: shuttered shopfronts on both sides, a glowing vending machine
  on the right, small neon signs and paper lanterns with no readable writing, overhead wires, the wet asphalt reflecting every
  light, one streetlight far down the lane. Eye level, deep perspective, every surface crisp.* + style line. The
  generator's largest size and best quality: it opens the film.

**5b.** `retakes_2026_10_25/384-the-room-too-big-r1.jpg`
- Plays on: "VERA VOSS (29) sits at the low table." The director: too wide-angled, the room looks empty.
- Attach: `s4/36-vera-at-the-table.jpg` (the room), `s4/35-the-photograph.jpg`, `sheets/vera.jpg`, `sheets/vera-face.jpg`.
- Prompt: *Vera's small apartment as in the reference 36, seen with a normal lens from across the room at seated height, not
  wide: Vera (ash-blonde shoulder-length hair, cream knit) at the low table with two cups on it; on the left the wooden
  cabinet with its lamp, the framed photograph and the umbrella in its stand; behind her the window with its curtains and the
  building opposite in the rain; the CRT on its stand on the right. Lived-in and close.* + *Photorealistic contemporary Tokyo
  neo-noir film still, 16:9, grey rainy evening light and one warm lamp, restrained 35mm grain. No legible text, signage,
  logos or watermarks.*

**5c.** `retakes_2026_10_25/419-twenty-years-r1.jpg`
- Plays on: "Twenty years, Ishida." The director: he lost character consistency.
- An edit of `s11/419-twenty-years.jpg`; attach `sheets/jack-face.jpg`, `sheets/jack.jpg`, `s11/249-the-line.jpg`.
- Prompt: *Keep this picture exactly: the office, the lamp, the phone at his ear, the light. Change only Jack's face and hair to
  match the references: late 50s, Western, a lined weathered face, swept-back dark hair greying at the sides, short grey
  stubble.* + style line.

**5d.** `retakes_2026_10_25/246-the-can-r1.jpg`
- Plays on: "Jack drops the unopened coffee into the recycling bin. The can CLANKS." The director: it's a beer can, not
  coffee.
- An edit of `s12/246-the-can.jpg`.
- Prompt: *Keep this picture exactly. Change only the can in his hand: a short, slim steel can of hot vending-machine coffee,
  unopened, dark brown with a cream band, no readable label.* + style line.

**5e and 5f, the noodle counter under the tracks (scene 22).** The director: Jack has moved from the main counter. His seat is
the one he has in `s22/348-easy-to-talk-to.jpg` and `s22/440-she-rests-her-head.jpg`: at the right end of the main counter by
the ticket machine and the dark door, beside Vera.
- Attach for both: those two, `sheets/jack-face.jpg`, `sheets/vera-face.jpg`.
- `retakes_2026_10_25/285-the-inside-pocket-r1.jpg`, on "Jack is very still. The letter is in the inside pocket of his coat.
  He doesn't move to touch it.": *Jack in his seat at the main counter as in the references, very still, his hand resting on
  the counter near his chest, not touching the inside pocket of his dark coat; Vera beside him, soft at the edge of frame;
  the tiled arch, the cook behind the counter.* + style line.
- `retakes_2026_10_25/349-paid-to-listen-r1.jpg`, on "I get paid to listen.": *Jack in the same seat, turned to Vera beside
  him (soft in the near foreground), saying it simply; a bowl and a cup in front of him on the counter; the cook and the
  tiled arch behind.* + style line.

**5g.** `retakes_2026_10_25/445-exactly-where-it-was-r1.jpg`
- Plays on: "Jack sets the page down exactly where it was." The director: Jack looks like art, not a film still.
- An edit of `s25/445-exactly-where-it-was.jpg`; attach `sheets/jack-face.jpg`, `s84/520-excuse-me.jpg` (the drawing).
- Prompt: *Keep this picture exactly: the storeroom, the bulb, the flour sacks, the drawing on the page (the same drawing as
  the reference 520), the scoop. Change only Jack: a real man photographed, not painted; film-still skin, light and texture,
  his face as the reference.* + style line.

**5h.** `retakes_2026_10_25/289-for-making-me-r1.jpg`
- Plays on: "For making me." (He is at the till, paying. Too much.) The director: too much money.
- An edit of `s25a/289-for-making-me.jpg`.
- Prompt: *Keep this picture exactly. Change only the money: Jack hands the woman two folded banknotes. No stack of notes.* +
  *Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey morning light, restrained 35mm grain. No legible text,
  signage, logos or watermarks.*

**5i.** `retakes_2026_10_25/374-the-dead-television-r1.jpg`
- Plays on: "Vera looks up at the dead television. Somewhere in the dark glass, her own face." The director: the TV is in
  the wrong place; no reflection.
- Attach: `s27a/292-she-was-here.jpg` (her place on the floor; the TV high at the far end),
  `s2_picks/26-the-variety-show-s2new2.jpg` (the TV's place in the bar), `sheets/vera-face.jpg`, `sheets/kanda-bar.jpg`.
- Prompt: *From low behind the far end of the bar counter: Vera crouched on the floor between the beer crates and the shelves,
  as in the reference 292, looking up at the old CRT television on its high shelf above the end of the counter, where it is in
  the references. It is switched off: dark grey glass, no picture and no reflection of her.* + *Photorealistic contemporary
  Tokyo neo-noir film still, 16:9, dim daylight from the door, restrained 35mm grain. No legible text, signage, logos or
  watermarks.*

**5j.** `retakes_2026_10_25/montage53-05b-light-off-r1.jpg` (a new beat, after montage 53's 05)
- The director: keep 05, and add a beat after it with the light off.
- An edit of `montage53/05.jpg`.
- Prompt: *Keep this picture exactly. Change only the one lit window: now dark, its light switched off like every other
  window.* + style line.

**5k.** `retakes_2026_10_25/469-what-they-are-told-r1.jpg`
- Plays on: "The police say what they are told." The director: she took her glasses off but is still wearing them.
- An edit of `s53a/469-what-they-are-told.jpg`.
- Prompt: *Keep this picture exactly. Change only her face: Harada wears no glasses; the pair in her hand at her chin stays.* +
  *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey office daylight and fluorescent tubes, restrained
  35mm grain. No legible text, signage, logos or watermarks.*

**5l.** `retakes_2026_10_25/231-the-box-r1.jpg`
- Plays on: "In the envelope, a single cassette tape in a cracked plastic case, labelled in a shaking hand: SHIOHAMA." The
  director: remove the box, and the table the right way. (Also: the current one shows DANIEL VOSS on the notebook's cover;
  the name is inside, on the flyleaf, revealed in 312.)
- Attach: `s63/312-daniel-voss-flyleaf.jpg` (the bench to match), `s63/230-no-questions.jpg` (the padded envelope),
  `s63/63-00-the-locker-room.jpg`.
- Prompt: *Jack's view, looking down: his hands hold a torn-open padded brown envelope over the same grey perforated steel
  bench as in the reference 312, seen the same way (the bench's long edge along the bottom of the frame, its row of holes
  down the right side). A cassette tape in a cracked clear plastic case slides out into his palm, its label hand-written in a
  shaky hand: SHIOHAMA (the only readable word). Beside it on the bench, the small black notebook, water-stained, closed, its
  cover plain. No cardboard box. Grey locker doors at the edges, one fluorescent tube's cold light.* + style line.

**5m.** `retakes_2026_10_25/232-the-wine-red-dress-r1.jpg`
- Plays on: "Vera holds it up against herself in the mirror. For a moment she is someone else. Her mother, maybe." The
  director: it looks like she's wearing it.
- Attach: `s65/488-wine-red-silk.jpg` (the dress and the box), `s65/489-out-of-practice.jpg` (the room),
  `vera_run_new/style-sheets/vera-red-dress.jpg` (the dress), `sheets/vera-face.jpg`.
- Prompt: *The camera is the mirror: Vera faces us in her cream knit and dark trousers, holding the sleeveless wine-red silk
  slip dress up against her front by its thin straps, the silk hanging loose over her clothes, her knit sleeves and collar
  plainly showing around it: held, not worn. She looks at herself, at us, for a moment someone else. Behind her, the bed with
  the open cardboard box and the yellowed tissue paper; the window with the last grey light and rain; one warm lamp.* +
  *Photorealistic contemporary Tokyo neo-noir film still, 16:9, the last grey evening light and one warm lamp, restrained 35mm
  grain. No legible text, signage, logos or watermarks.*

**5n.** `retakes_2026_10_25/70-the-call-r1.jpg`
- Plays on: "She knows. From his voice, she already knows. She stands up." The director: she lost character consistency.
- An edit of `s72/70-the-call.jpg`; attach `sheets/vera-face.jpg`, `vera_run_new/style-sheets/vera-red-dress.jpg`,
  `vera_run_new/72-01-the-piano-plays-on.jpg`.
- Prompt: *Keep this picture: the hotel lounge, the clock, the bottles, the pianist in his white jacket. Change only Vera to
  the woman of the references: the same face, ash-blonde hair softly done, red lipstick, the sleeveless wine-red silk slip
  dress; she is rising from the bar stool, the phone at her ear, her face going still.* + style line.

**5o.** `retakes_2026_10_25/73-09-she-cannot-breathe-r1.jpg`
- Plays on: "Stopping for half a second because she can't breathe." The director: too much mascara.
- An edit of `vera_run_new/73-09-she-cannot-breathe.jpg`.
- Prompt: *Keep this picture exactly. Change only her make-up: the mascara has barely run, faint grey smudges under her eyes;
  no black streaks down her cheeks.* + style line.

**5p.** `retakes_2026_10_25/88-the-walkway-r1.jpg`
- Plays on: "Grey light. An open-air walkway along the third floor. Rain dripping from the railing." The director: don't put
  Vera in shot, just the closed door.
- An edit of `s78/88-the-walkway.jpg`; attach `s78/316-squared-to-the-door.jpg` (her door).
- Prompt: *Keep this picture exactly: the walkway, the railing, the rail lines beyond, the grey dawn. Change only her door, the
  last on the walkway: closed, nobody in it; the doormat bare (the envelope comes in the next shot).* + *Photorealistic
  contemporary Tokyo neo-noir film still, 16:9, at grey dawn in light rain. Cold slate and teal-blue-green, wet concrete,
  restrained 35mm grain. No legible text, signage, logos or watermarks.*

**5q.** `retakes_2026_10_25/106-play-r1.jpg`
- Plays on: "Harada presses PLAY." The director: a different cassette player from the shot before.
- Attach: `s82/105-the-tape-between-them.jpg` and `s82/509-twenty-years-younger.jpg` (the recorder), `s82/106-play.jpg`
  (composition), `retakes_2026_10_20/107-her-dead-reporter-r1.jpg` (the frame on her desk).
- Prompt: *Close on Harada's desk: her hand (white blouse cuff) pressing the PLAY key on the same cassette recorder as the
  references: a worn silver-grey portable recorder, its front with the tape window on the left and a round-hole speaker grille
  on the right, piano-key buttons along its top, one of them red. The cassette inside has no readable label. Beside it, the
  dark wooden frame with the journalist's photograph, as in the references.* + *Photorealistic contemporary Tokyo neo-noir
  film still, 16:9, flat grey office daylight and fluorescent tubes, restrained 35mm grain. No legible text, signage, logos
  or watermarks.*

**5r.** `retakes_2026_10_25/512-he-hasnt-stopped-r1.jpg`
- Plays on: "Two hours. He hasn't stopped." The director: they should be looking towards Jack.
- Attach: `s82a/512-he-hasnt-stopped.jpg` (the base: keep both women), `s82a/300-at-the-edge-of-the-newsroom.jpg` and
  `s82/108-not-silent.jpg` (Jack through the glass), `sheets/harada.jpg`, `sheets/jack.jpg`.
- Prompt: *Keep this picture: Harada and Vera standing by the photocopier at the edge of the newsroom. Change where they look:
  both turned toward the glass wall of Harada's office in the background, where Jack sits inside, still talking, one hand
  moving, small but clear through the glass.* + *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey office
  daylight and fluorescent tubes, restrained 35mm grain. No legible text, signage, logos or watermarks.*

**5s.** `retakes_2026_10_25/519-not-all-right-r1.jpg` (from the director in chat, 25 October)
- Plays on: "Vera says nothing for a while. She does not say it's all right." The director: her hair should be in a bun like
  the others in the scene. (Also: she wears a cream turtleneck here and a white collared shirt in 116 and 521.)
- An edit of `s84/519-not-all-right.jpg`; attach `s84/116-thats-me.jpg` and `s84/521-somebody-has-to-look.jpg` (the bun and
  the shirt), `sheets/vera-face.jpg`.
- Prompt: *Keep this picture exactly: the storeroom, the bare bulb, the drawings on the wall, the cloth bag in her hand, her
  face and her look. Change only her hair and collar: her hair pulled back into a low loose bun at the nape, a few strands
  loose by her face, as in the references; under her dark coat a white collared shirt instead of the cream turtleneck.* +
  *Photorealistic contemporary Tokyo neo-noir film still, 16:9, one bare warm bulb, restrained 35mm grain. No legible text,
  signage, logos or watermarks.*

**5t.** `retakes_2026_10_25/303-he-left-a-statement-r1.jpg` (from the director in chat, 25 October)
- Plays on: "He left a note." (the young detective on the phone: "Yes. Where? In his own car. Under the expressway. Sitting
  up, engine off. No marks. He left a note.") The director: the office changes from the shot before.
- Attach: `s96/143-the-box.jpg` (the room to match: the shot before), `s96/303-he-left-a-statement.jpg` (the action),
  `sheets/young-detective.jpg`.
- Prompt: *The detectives' room exactly as the reference 143, from the same camera position: the tall windows down the RIGHT
  wall with grey daylight, the back wall with its serving hatch, the door and the clock, the rows of grey steel desks. The young
  detective (white shirt, dark tie) at Ishida's desk with the open cardboard box and the old radio in it, the desk phone's
  receiver at his ear, listening, very still.* + *Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey
  morning daylight and fluorescent tubes, restrained 35mm grain. No legible text, signage, logos or watermarks.*

**5u.** `retakes_2026_10_25/161-stool-three-r1.jpg` (from the director in chat, 25 October)
- Plays on: "She stands a moment. Then she sits down beside him." The director: Vera has an extra leg. (Also: here she is on
  Jack's right, between him and the door, reaching back across him for the stool; in 160 and 159 she sits on his LEFT, between
  him and Kaneko.)
- Attach: `s100/158-the-third-stool.jpg` (the room, Jack, the doorway), `s100/160-the-clip.jpg` and
  `s100/159-she-doesnt-turn.jpg` (where she sits; her coat, hair and clip), `sheets/vera-face.jpg`, `sheets/kaneko.jpg`.
- Prompt: *Kaneko's new counter in the brick railway arch, exactly as the references: the hand-painted sign, the bare bulb, the
  steam, Kaneko ladling behind the counter on the left, the curtained doorway on the right. Jack sits on his stool near the
  right end of the counter with his bowl. Vera, come in from the doorway, has walked round behind him and is lowering herself
  onto the empty stool on his LEFT (screen-left of him, between him and Kaneko), one hand on the edge of the counter. Two legs,
  both on her side of the stool; her coat, hair and small red bird clip as in the references.* + style line.
- Check: two legs; Vera ends up where she sits in 160.

---

# 6. Second attempts, after the check of 25 October

The first batch is in `retakes_2026_10_25/` and its check is at the end of that folder's `README.md`. These four need another
go. Save each as `<name>-r2.jpg`.

**6a.** `retakes_2026_10_25/271-not-yet-r2.jpg` (2b again)
- r1 had three faults:
  - Vera stands, but the script says "She sits";
  - it shows one mug, not the two paper cups she brought up the stairs;
  - it is night, while scene 21 is grey day, as 193 and 194-r1 on either side of it are.
- Attach: `s10/415-four-days.jpg` (the composition: Vera seated at the desk's left end, Jack at its right end),
  `retakes_2026_10_25/194-he-holds-it-without-drinking-r1.jpg` (this room by day, the paper cups), `sheets/vera.jpg`,
  `sheets/vera-face.jpg`, `sheets/jack-face.jpg`.
- Prompt: as 2b, with *Vera SEATED on a chair at the desk's left end*, *two paper coffee cups, one in front of each of them*,
  and *grey daylight, no lamp lit, nothing outside the window but rain and a passing train in daylight*.

**6b.** `retakes_2026_10_25/204-the-tea-she-does-not-want-to-pour-r2.jpg` (3a again)
- r1 put the altar right, but Jack kneels with his back to the camera, facing the wall instead of her.
- An edit of `retakes_2026_10_25/204-the-tea-she-does-not-want-to-pour-r1.jpg` (attach it as the base) with
  `s29/273-the-receipts.jpg` (how he sits).
- Prompt: *Keep this picture exactly. Change only Jack: he kneels at the right side of the kotatsu, turned to face Mrs.
  Sakai across it, seen in profile from his right, as in the reference 273.* + section 3's style line.

**6c.** `retakes_2026_10_25/213-clutch-each-other-r2.jpg` (4i again)
- r1's torch beam comes from inside the dark pantry, behind the couple, as if someone were in there with them.
- An edit of `retakes_2026_10_25/213-clutch-each-other-r1.jpg` (attach it as the base).
- Prompt: *Keep this picture exactly. Change only the light: the pantry behind the old couple is dark, with no torch in it; a
  torch beam comes instead from off-frame behind the camera, the corridor side, sweeping across the kitchen wall toward Jack.
  The old couple hold each other tightly.* + section 4's style line.

**6d. (optional)** `retakes_2026_10_25/538-the-receipts-in-his-hand-r2.jpg` (4b again)
- r1 is right, but it came out as the same wide shot as 207; the close-up on the receipts is gone.
- An edit of the original `s36/538-the-receipts-in-his-hand.jpg` (attach it as the base).
- Prompt: *Keep this picture exactly: the close-up, the receipts in his hand, the pink handset at his ear. Change only the
  payphone: its cradle is empty; the handset at his ear is its only handset, on its coiled pink cord.* + section 4's style line.

## Kurose's car, after the maintainer's try (25 October)

The film's maintainer made section 1's pictures the same day. Their check is at the end of `retakes_2026_10_25/README.md`:
- **Right:** 137, 140, 141, 368 and 94-01.
- **Failed:** 139, four times. Edits of the current 139 kept the door hinged at its back. Fresh pictures hinged it right but
  turned the car round, with its left side at the kerb. Whenever the door is in shot, the generator puts it on the side it
  likes.
- **Not made:** 138.

**6e.** `retakes_2026_10_25/139-only-tea-r2.jpg` (1c again, with the door out of frame)
- Plays on: "At the foot of the steps, a black sedan waits at the kerb, engine running, wipers going." and "Its rear door
  stands open: warm amber light, leather."
- Attach:
  - `s94/141-he-drinks.jpg` (the interior and Kurose);
  - `sheets/kurose.jpg`;
  - `retakes_2026_10_25/94-01-the-clean-hand-r1.jpg` (the doorway that the next shot of the car, 94-01, looks through).
- Prompt: *From the wet pavement at night, at standing height, looking straight in through the open rear doorway of a black
  1990s Japanese saloon parked at the kerb; the car's front is to the RIGHT. The doorway fills the middle of the frame, framed
  by the black car body and the edge of the roof, rain falling across it; the open door itself is out of frame. Inside, warm
  amber courtesy light and tan leather. The near half of the back seat, nearest us, is EMPTY, the armrest down. On the far side
  of the back seat, by the far window, a white-haired man in a charcoal suit sits still and upright, looking ahead toward the
  front of the car, his face in shadow, his hands out of sight. At the right edge of the doorway, the back of the front seat
  nearest us, and the dark shoulder of the driver at the wheel.* + CAR + LOOK.
- Check: no door in shot; the near seat is empty; the man faces the right of frame; the driver's shoulder at the right.

**6f.** `retakes_2026_10_25/138-the-door-opens-r1.jpg` (1b, not made yet)
- Exactly as 1b in section 1. Its base, `retakes_2026_10_25/137-he-knows-this-car-r1.jpg`, now exists.

**6g. (optional)** `retakes_2026_10_25/94-01-the-clean-hand-r2.jpg` (1e again)
- r1 is right, but Kurose's face is in full light, where the brief keeps it in shadow.
- An edit of r1 (attach it as the base).
- Prompt: *Keep this picture exactly. Change only the light on the man's face: it falls into shadow above the cup, only his
  swept-back white hair catching the amber light.* + LOOK.

---

# 7. After the director's picks (25 October, night): four redos, and the faults left in the film

The director picked every shot on the picker; 33 picks are in the film (see the end of `retakes_2026_10_25/README.md`). These four
were marked "redo", with the note quoted. Save each as the next free `rN` beside its earlier takes, at the generator's largest
size, and never overwrite. For edits, attach the base first, then the references.

**7a.** `retakes_2026_10_25/374-the-dead-television-r2.jpg` (scene 27A). The director: "she has no coat on".
- Plays on: "Vera looks up at the dead television. Somewhere in the dark glass, her own face."
- An edit of `retakes_2026_10_25/374-the-dead-television-r1.jpg`, which has the television in the right place.
- Attach: that base, then `s27a/292-she-was-here.jpg` (the shot just before, her coat) and `sheets/vera.jpg`.
- Prompt: *Keep this picture exactly: the bar's storeroom, the beer crates, the television high on its shelf at the far end, dark
  and switched off, with no reflection in it, and Vera crouched looking up at it. Change only her clothes: she wears her long dark
  charcoal wool coat, open over the cream knit, as in the second image.* + section 5's style line.
- Check: the coat is the one in 292; the screen stays dark with no face in it.

**7b.** `retakes_2026_10_25/175-the-curtain-gap-r2.jpg` (scene 39). The director: "too many bad guys".
- Plays on: "Four black cars in an arc across the lot, headlights on, rain visible only inside the beams. Eight men step out, two
  from each car."
- An edit of `retakes_2026_10_25/175-the-curtain-gap-r1.jpg`.
- Prompt: *Keep this picture exactly: the curtain edge and fingertips in the foreground, the four black saloons, their headlights
  through the rain. Change only the men: exactly eight, two standing by each car, no more. Nobody else anywhere in the lot.* +
  section 4's style line.
- Check: count them, eight; two to a car.

**7c.** `retakes_2026_10_25/213-clutch-each-other-r4.jpg` (scene 46). The director: "ignore the torch it keeps floating mid air".
- Plays on: "Jack pushes Mr. Noda into the pantry beside his wife. The old couple clutch each other in the dark."
- An edit of `retakes_2026_10_25/213-clutch-each-other-r3.jpg`, the most rushed of the three.
- Prompt: *Keep this picture exactly: Jack mid-shove with his coat swinging, the old couple clinging to each other in the pantry
  doorway. Change only the light: there is no torch and no torch beam anywhere in the picture. The only light is the bare bulb
  in the kitchen, hard and low, and the pantry behind them is black.* + section 4's style line.
- Check: no torch, no beam, no glowing object in the air.

**7d.** `retakes_2026_10_25/87-he-writes-nothing-r4.jpg` (scene 77). The director: "lamp to left of him phone to right".
- Plays on: "He picks up a pen to write something on the envelope. He holds it over the paper for a long time."
- An edit of `retakes_2026_10_25/87-he-writes-nothing-r1.jpg` (the director's earlier vote: the desk the room master's way).
- Attach: that base, then `s77/86-the-clean-envelope.jpg` (the shot just before, from above).
- Prompt: *Keep this picture exactly: the room, the desk, Jack's pose with the pen held still above the envelope. Change only the
  things on the desk. The green banker's lamp stands on the desk to the left of him and the black rotary telephone to the right
  of him, as in the second image, where the lamp is top left and the telephone top right. The green notebook is already inside
  the kraft envelope (it shows only as a bulge); nothing lies on top of the envelope.* + section 2's style line.
- Check: the lamp is on his left in the picture and the phone on his right; the pen does not touch the paper; no book on the
  envelope.

**7e.** `retakes_2026_10_25/271-not-yet-r3.jpg` (scene 21). The director, 25 October (night): "the office in that picture
should look like" 194.
- Plays on: "The sketchbook is on the desk between them. Jack's hand rests on its cover." (through "She nods. Believes him.")
- Today's 271 (r2, picked for Vera seated, by day, with the two paper cups) has a different room: a wide window with a train
  outside, no lamp, the phone on the cupboard. `271-not-yet-r1` has 194's room, but it is night and Vera stands.
- An edit of the film's `s21/271-not-yet.jpg`. Attach that base, then `s21/194-he-holds-it-without-drinking.jpg` (the room).
- Prompt: *Keep this picture exactly: the same camera, the same two people in the same places and poses (Vera seated on the
  left in her dark coat and cream knit, hands clasped; Jack seated on the right, his hand on the closed sketchbook), the same
  two paper coffee cups, the same grey daylight. Change only the room, so it is the office in the second picture: one window
  with venetian blinds and rain on the glass; under it the grey steel cupboard with a row of binders; the frosted-glass door
  left of the window; the grey filing cabinet with the small CRT on top, right of the window; the brown sofa on the right;
  the worn dark walnut desk with the green-shaded brass banker's lamp at its left end and the black rotary telephone on the
  desk at its back right corner, and no telephone anywhere else. Match the second picture's light and colour.* + section 2's
  style line (day).
- Cost: about 675 credits at the default size and about 1,100 at 4K. It was priced on 25 October (ElevenLabs flow
  `Cdr6jFrlEMdFCGnXGoOI`, with both pictures attached) but not run: the director stopped it to review the other new pictures
  first, and about 11 credits are left.
- Check: Vera seated, two paper cups, daylight, the lamp at the desk's left end, the phone on the desk.

**7f.** `retakes_2026_10_25/297-the-glass-office-r1.jpg` (scene 53A). The director, 25 October (night): "vera loses character
consistency, her hair is wrong".
- Plays on: the newsroom's opening, through "Vera stands at the door of a glass-walled office at the back, KONDO's card in
  hand." and Harada finishing her call.
- The fault: Vera, standing at the glass office door with her back half to us, has long grey hair, nearly Harada's. Her sheet
  and 298, later in the same scene, have her ash-blonde, shoulder-length, with a fringe.
- An edit of the film's `s53a/297-the-glass-office.jpg`. Attach that base, then `sheets/vera.jpg` and `s53a/298-there-was-no-car.jpg`
  (her in this scene).
- Prompt: *Keep this picture exactly: the newsroom, the desks, every member of staff, the televisions, the glass office at the
  back with the grey-haired editor on the phone, and the young woman in the long dark charcoal coat standing at its door.
  Change only that young woman's hair: ash-blonde, straight, shoulder-length, with a fringe, as in the second and third images.
  She is in her late twenties; nothing about her is grey.* + section 5's style line.
- Check: her hair matches 298; Harada behind the glass stays grey-haired; nobody else changes.
- No depth layers to remake: 297 has none (it is in `peopleInShot`, "the office staff").
- Cost: about 675 credits at the default size and about 1,100 at 4K; about 11 credits are left.

**Faults left in the picks now in the film** (optional; the director chose these takes knowing them):
- **204 (r2):** Mrs. Sakai no longer pours, though the line is "pours Jack tea she doesn't want to pour". An edit of the film's
  `s29/204-the-tea-she-does-not-want-to-pour.jpg` could put the pot in her hands, mid-pour, changing nothing else.
- **70 (r1):** Vera is still seated on "She stands up."
- **140 and 141, kept as they were:** both show Ishida inside the car already, before "Ishida gets in". The director kept them,
  and 94-01 was not added.
- **27 pictures were enlarged, not upscaled:** they went in at 1920×1080, enlarged from about 1376×768 by the install tool. A
  Topaz pass can replace them later. The list is in the README.

---

# 8. Scene 77A, "The black glass" (26 October): a new scene, no pictures yet

**Scene 77A is new:** the night Mara dies, between Jack's office (77) and Vera's door at dawn (78). Its beats are in
`src/film/story.json`, and it plays on black until these pictures exist. The scene, and why it is written this way, is in
`docs/director-notes-2026-10-20.md`, item 45.

**Rules that differ from the rest of this brief:**
- **New pictures, not retakes.** Save them in `public/film/img/s77a/` under the names below, not in `retakes_2026_10_25/`.
  Report them in that folder's README like the rest.
- **A new street.** Attach no street from the film for the place: not the Kanda backstreet, not under the tracks, not the
  station of 93–94.

**Never, in any of these pictures:**
- **Kurose's face:** no face, profile, hair or eyes, not even in shadow. The back seat is black, and only his hand shows.
  Vera is the first to see his face, in 83.
- **His sheet:** do not attach `sheets/kurose.jpg`. It is a face, and the generator will draw it.
- **Light inside the car:** none, unlike 93–94. Nothing in the car is lit, so the back seat stays black.
- **Anyone else on the street, or any other car.**
- **Mirroring.** Never mirror a picture.

**Prompt blocks (paste these, in this wording):**

**LOOK**
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, before dawn in steady rain. Cold slate and teal-blue-green
> shadows; hard white light from tall identical streetlights; wet black asphalt with long mirror reflections; restrained
> 35mm grain, subtle highlight halation. No legible text, signage, logos, number plates or watermarks.

**AVENUE**
> A wide, straight Tokyo avenue before dawn, completely empty: shuttered bank fronts and dark glass office lobbies with
> nobody inside, a long row of tall identical white streetlights running away to a vanishing point, wide wet pavements with
> young bare trees in square iron grates. No traffic, no people, no lit signs. Clean, new, expensive and cold.

**JACK, that night** (as `sheets/jack-face.jpg`, `sheets/jack.jpg` and `s77/85-the-desk-lamp.jpg`)
> Western man, late 50s, tall and lean, lined weathered face, short grey stubble; dark hair greying at the sides, soaked and
> slicked back by the rain. The same dark charcoal jacket as in the third image, open and dark with rain, over an off-white
> open-collar shirt; dark trousers. No coat, no hat, no umbrella. His hands are not washed: dark dried stains in the creases
> of his fingers.

**THE CAR** (as `reshoot-1080/137-he-knows-this-car.jpg`)
> Kurose's car: a long black 1990s Japanese luxury four-door saloon with a chrome grille, polished, rain beading on it,
> right-hand drive, moving at walking pace in the near lane. Every window is black glass. The driver is a dark silhouette
> whose face is never seen. Nothing inside the car is lit.

**THE HAND** (as `s51/311-the-hand-on-the-model.jpg`)
> An old man's clean, manicured hand resting on the sill of a lowered rear car window: the slim silver watch with a white dial
> on a dark leather strap, the dark navy suit sleeve and white shirt cuff, exactly as in the reference. Beyond the hand the
> back seat is pitch black: no face, no profile, no hair.

**The geography:**
- **The pavement.** Jack walks the left-hand pavement, and the sedan comes up the near lane on his right.
- **The window.** Cars keep left in Japan, so the window that comes down is the car's rear LEFT one. That is Kurose's own
  seat, as in the seat lock of section 1.
- **The screen direction.** Hold the same direction in every picture:
  - Jack walks toward the camera.
  - The headlights come up behind him.
  - In the side-on pictures, both move screen-left to screen-right.

| # | File (`s77a/`) | Plays on (the scene's words) | Essential |
|---|---|---|---|
| 8a | `77a-01-the-avenue.jpg` | "Before dawn. A wide avenue of shuttered banks…" and "Jack walks with the envelope flat inside his jacket." | yes |
| 8b | `77a-02-headlights.jpg` | "Headlights behind him. A long black sedan comes up slowly and keeps his pace. He doesn't look at it." | yes |
| 8c | `77a-03-keeping-pace.jpg` | the same line, after 8b | no |
| 8d | `77a-04-the-hand-on-the-sill.jpg` | "The rear window comes down… His face stays in the dark." and KUROSE: "Detective." | yes |
| 8e | `77a-05-not-any-more.jpg` | JACK: "Not any more." up to KUROSE: "Everyone is allowed one." | yes |
| 8f | `77a-06-the-envelope.jpg` | "Jack keeps walking. Inside his jacket, his hand closes on the envelope." | no |
| 8g | `77a-07-the-black-glass.jpg` | "The window rises. In the black glass, Jack sees only his own face." | yes |
| 8h | `77a-08-tail-lights.jpg` | "The sedan pulls ahead without hurry…" and "Jack stands in the rain a moment…" | yes |

**8a. The avenue.** A long lens from far down the pavement. The avenue runs away to its vanishing point; the streetlights
repeat; Jack is small, walking toward us, alone. Attach the Jack sheets and 85. LOOK + AVENUE + JACK.

**8b. Headlights.** The same direction, closer, at Jack's chest height. Jack walks toward us, eyes ahead. Far behind him,
two headlights come up the near lane, low and slow. Attach the Jack sheets, 85 and 137. LOOK + AVENUE + JACK + THE CAR.

**8c. Keeping pace** (optional). Side-on from across the road, both moving screen-left to screen-right: Jack on the far
pavement, seen over the roof of the long black sedan that keeps pace in the lane beside him, every window still up, the
shuttered fronts behind him. Attach as 8b.
LOOK + AVENUE + JACK + THE CAR.

**8d. The hand on the sill.** Close, from the pavement, over Jack's shoulder; his shoulder is soft in the near edge of the
frame. The rear window is down; rain runs down the door. Beyond the hand on the sill, the back seat is black. Attach 311,
137 and `sheets/jack.jpg` (for the shoulder only). LOOK + THE CAR + THE HAND.

**8e. Not any more.** An 85mm close single: Jack walking, three-quarter to the camera, eyes ahead, never toward the car;
rain on his face; the black edge of the car's window soft and out of focus at the frame's edge. His face gives nothing away.
Attach the Jack sheets and 85. LOOK + JACK.

**8f. The envelope** (optional). An insert: inside his open jacket, his unwashed hand closes on a plain white envelope held
flat against his shirt. Attach 85 and `s77/86-the-clean-envelope.jpg` (the envelope). LOOK + JACK.

**8g. The black glass.** The rear window rising, close: black glass, rain on it, and in it the reflection of Jack's own face,
with the streetlights doubled behind him. Nothing of the car's inside shows through. Attach the Jack sheets and 137.
LOOK + THE CAR + JACK.

**8h. Tail lights.** From behind Jack at his shoulder height: Jack stands still on the wet pavement. Far ahead, the sedan's
two red tail lights turn off the avenue into a side street. The streetlights repeat to the vanishing point. Attach the Jack
sheets, 85 and 137. LOOK + AVENUE + JACK + THE CAR.

**Check each picture before saving it:**
- no face in the car;
- no lit interior;
- no legible plate or sign;
- Jack's jacket, hair and stubble as in 85;
- the watch and cuff as in 311;
- the same screen direction as the pictures before it.

**Cost:** about 1,100 credits a picture at 4K, so about 6,600 for the six essential ones; about 11 credits are left.

---

# Not for you: free fixes, no new picture

Listed in `docs/director-picks-2026-10-25.md` and applied by the film's maintainer once the director agrees:
- the 17 swaps to pictures that already exist;
- the 9 unused takes the director wants in;
- 336's first take as an extra beat;
- scene 28's sound;
- moving 141 to "Ishida gets in. The door closes." (section 1).
