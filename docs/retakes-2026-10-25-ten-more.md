# Ten retakes, 25 October 2026: the pictures whose last take still had a fault

Ten shots, ready to paste into the image generator. They are the ten faults the film's maintainer listed at the end of
`public/film/img/retakes_2026_10_25/README.md` — the small ones in pictures already made, which nobody had gone back to
yet. **Every one is an instruction on a picture that exists: no shot is re-invented, so the characters, wardrobe, rooms and
light carry over untouched.** Files are stored beside the takes they follow; nothing is overwritten, nothing is installed in
the film, and no code changes.

The machine-readable version of this page — filenames, pinned reference URLs, prompt text — is
`docs/retakes-2026-10-25-ten-more.json`.

## The ten

| # | File to make | Fixes | Kind |
|---|---|---|---|
| 1 | `retakes_2026_10_25/194-he-holds-it-without-drinking-r2.jpg` | the dark green sketchbook in 194 (cream everywhere else) | edit of `194-…-r1` |
| 2 | `retakes_2026_10_25/87-he-writes-nothing-r2.jpg` | the same green notebook in 87, and the pen touching the paper | edit of `87-…-r1` |
| 3 | `retakes_2026_10_25/462-a-finger-to-his-lips-r4.jpg` | 462-r3's second right hand (two right hands) | edit of `s45/462` — base is the **in-film** picture, not r3 |
| 4 | `retakes_2026_10_25/207-the-pink-payphone-r2.jpg` | 207's handset held low at the mouth instead of at his ear | edit of `207-…-r1` |
| 5 | `retakes_2026_10_25/538-the-receipts-in-his-hand-r3.jpg` | 538's close-up lost: widen the r2 crop back to the receipts | edit of `538-…-r2` |
| 6 | `retakes_2026_10_25/384-the-room-too-big-r2.jpg` | the smartphone on the low table (period-anachronistic) | edit of `384-…-r1` |
| 7 | `retakes_2026_10_25/285-the-inside-pocket-r2.jpg` | Jack's hand up at his lapel, not resting on the counter | edit of the **in-film** `s22/285`, to keep the frame |
| 8 | `retakes_2026_10_25/289-for-making-me-r2.jpg` | the notes read as US dollars, not yen | edit of `289-…-r1` |
| 9 | `retakes_2026_10_25/445-exactly-where-it-was-r2.jpg` | the "1:07" on the drawing that reference 520 does not have | edit of `445-…-r1` |
| 10 | `retakes_2026_10_25/354-the-altar-photograph-r2.jpg` | Mrs. Sakai's gaze on Jack, not past him to the photograph | edit of `354-…-r1` |

Nine of the ten are *keep this picture exactly, change only…* edits of the take they follow, which is the cheapest and the
most reliable way to hold character and set. Only number 3 starts from a different base, and deliberately so: 462-r3 is the
take with two right hands, so editing it inherits the fault. Its base is the in-film `s45/462-a-finger-to-his-lips.jpg`,
with the hand rebuilt from the actor's sheet instead.

## How to run them

1. **One picture at a time, at the largest size.** Attack the base picture first, then the actor sheets, then the room
   reference. Keep the delivered size: no downscale, no resize.
2. **End every prompt with the style line given in its entry.** Where an entry has no style line of its own, use the
   section's.
3. **Save under the filename in the table.** The `rN` is the first free number for that shot: `r1`–`r3` already exist for
   these. If the generator gives two usable versions, the better one keeps the name and the other becomes `--alt1.jpg`.
4. **Check against the listed check.** Each entry says what to look at before it is offered to the director.
5. **Install nothing.** The maintainer wires pictures in after the director has seen them, with
   `FFMPEG=/usr/bin/ffmpeg node tools/install-film-picture.mjs <new file> public/film/img/<scene>/<name>.jpg`, which
   archives the old picture first. Sub-1920 pictures take the Topaz upscale pass first.

**References are pinned to this commit** (`00c86ced04b6e5b39c095e7212e7c4c3c7f2efc6`), so a file cannot change under a
run: `https://raw.githubusercontent.com/sigooding/scarlett-witness/00c86ced04b6e5b39c095e7212e7c4c3c7f2efc6/public/film/img/…`

## 1. 194 — the cream sketchbook

**File:** `retakes_2026_10_25/194-he-holds-it-without-drinking-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/194-he-holds-it-without-drinking-r1.jpg` (2096×1184)

**Why:** 194-r1 is right in every way except its sketchbook, which came out dark green. The sketchbook is cream in 271 and
in every other office shot, and the object is the spine of scene 21 — it has to read as the same book.

**Attach:** `194-he-holds-it-without-drinking-r1.jpg` (base), `s21/271-not-yet.jpg` (the cream book, the same room by day),
`sheets/jack-face.jpg`.

**Prompt:**

> Keep this picture exactly: the office, the grey daylight through the blinds, the worn walnut desk, the brass lamp with the
> green shade at the left end, the black rotary telephone, the two paper coffee cups, Jack at the desk's right end in his
> charcoal jacket and off-white shirt, seen side-on, holding his cup without drinking. Change only the closed sketchbook on the
> desk in front of him: a plain, thick, CREAM linen-bound sketchbook, worn and soft at the corners, no lettering, its cover
> the pale cream of the reference 271. Light warm grey daylight from the window, flat; nothing else in the frame moves.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, flat grey rainy daylight through the blinds, restrained 35mm
> grain. No legible text, signage, logos or watermarks.

**Check:** the book is cream, closed, in the same place on the desk; both paper cups still present; Jack's face unchanged;
Vera's empty chair still in frame.

## 2. 87 — the notebook, and the pen held still

**File:** `retakes_2026_10_25/87-he-writes-nothing-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/87-he-writes-nothing-r1.jpg` (2848×1600)

**Why:** two faults in 87-r1. The notebook on the kraft envelope is dark green — the same cream-book fault as 194 — and the
pen tip touches the paper, where the beat is a man holding a pen over a letter he does not write.

**Attach:** `87-he-writes-nothing-r1.jpg` (base), `194-he-holds-it-without-drinking-r1.jpg` (the room by day, the cream
book), `sheets/jack-face.jpg`, `sheets/jack.jpg`.

**Prompt:**

> Keep this picture exactly: the office at night, the rain on the window and the elevated railway beyond, the blinds, the CRT
> on the grey filing cabinet, the brass lamp with the green shade lit at the left end of the desk, the black rotary telephone,
> the worn brown sofa at the right, Jack at the desk's right end in his soaked dark overcoat, side-on and facing left, his
> bloodied knuckles on the kraft envelope. Change only two things. One: the small notebook lying on the envelope is a plain
> CREAM linen-bound sketchbook, worn at the corners, no lettering, as in the reference. Two: the pen is held still in the air
> ABOVE the paper, its tip a clear centimetre above the page — he is not writing anything, and the page beneath it is
> blank. Warm light only from the green-shaded lamp; cold blue-grey from the window.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, restrained 35mm grain. No legible text, signage, logos or
> watermarks.

**Check:** cream book, no lettering; pen visibly clear of a blank page; the bloodied knuckles and the envelope unchanged;
desk still the room master's way — Jack at the right end, facing left, his back to the sofa, not to the window.

## 3. 462 — the hushing hand, rebuilt

**File:** `retakes_2026_10_25/462-a-finger-to-his-lips-r4.jpg` · **Post:** edit of `s45/462-a-finger-to-his-lips.jpg` (the
in-film picture)

**Why:** 462-r3 still shows two right hands, and an edit of r3 would inherit them. This take goes back to the in-film frame
— which has the location, the light and the stance right — and rebuilds the hand and forearm from the actor's sheet, with
the palm turned toward Mr. Noda rather than the camera. It also keeps the vending machine intact: the bullet holes belong to
the next shot only.

**Attach:** `s45/462-a-finger-to-his-lips.jpg` (base, the in-film picture), `sheets/jack-face.jpg`, `sheets/jack.jpg`,
`s45/178-thank-you-very-much.jpg` (the intact vending machine and the lobby as it is just before this beat).

**Prompt:**

> Keep this picture: the inn's lobby at night, the corridor behind him leading to the darkened staircase, the lamp glowing
> on the wall, the keys and fobs in their glass case at the left, the CRT at the right, the vending machine in the
> background WHOLLY INTACT — no bullet holes, no damage of any kind — and Jack in the doorway at the right of frame in his
> dark coat and off-white open-collar shirt, his face to match the actor sheets. Change only the gesture: ONE hand, his LEFT,
> comes up to his lips, the palm turned TOWARD the room and toward Mr. Noda behind him, the back of the hand toward the
> camera; index finger vertical against his lips in a natural hush. One hand, one wrist, one forearm, five fingers, correctly
> joined; his other hand stays down at his side, out of the light. Body turned three-quarters away from the doorway, head
> turned back over his shoulder.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green shadows, warm amber
> practical light only, restrained 35mm grain. No legible text, signage, logos or watermarks.

**Check:** count the hands — one at the lips, one at his side, no third; the palm faces the room, not the camera; the
vending machine is undamaged; the face and coat match 178 and the sheets.

## 4. 207 — the handset up at his ear

**File:** `retakes_2026_10_25/207-the-pink-payphone-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/207-the-pink-payphone-r1.jpg` (1672×941)

**Why:** 207-r1 got the count right — one pink handset, empty cradle, no second receiver, Mr. Noda's desk restored — but the
handset is held low, at his mouth. On screen it has to be a man listening.

**Attach:** `207-the-pink-payphone-r1.jpg` (base), `s36/376-the-coins-run-out.jpg` or `retakes_2026_10_25/376-…-r1.jpg`
(the handset at the ear, done right), `sheets/jack-face.jpg`, `sheets/mr-noda.jpg`.

**Prompt:**

> Keep this picture exactly: the inn's lobby at night, the pink payphone on the wall at the left with its empty cradle, the
> glass case of keys and fobs beside it, the two vinyl armchairs, the staircase at the back, Mr. Noda asleep behind his
> wooden desk at the right under the baseball on the CRT. Change only Jack's arms: he holds the payphone's own pink handset UP
> at his EAR, pressed to it, listening, his head slightly tilted into it, the coiled pink cord running from the phone box up
> to the handset; his other hand rests at the coin slot. No second receiver, no second handset.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green shadows, warm amber
> practical light only, restrained 35mm grain. No legible text, signage, logos or watermarks.

**Check:** the handset is at his ear, not his mouth; exactly one handset in the picture; the desk, Noda and the CRT
untouched.

## 5. 538 — the close-up back

**File:** `retakes_2026_10_25/538-the-receipts-in-his-hand-r3.jpg` · **Post:** edit of
`retakes_2026_10_25/538-the-receipts-in-his-hand-r2.jpg` (1376×768)

**Why:** 538-r2 is correct on the phone and correct on the hands, but it came out tight to the payphone and cropped the
receipts — the one thing the shot is about. (The r1 fault was the opposite: it lost the close-up and turned into 207's wide
lobby shot.)

**Attach:** `538-the-receipts-in-his-hand-r2.jpg` (base), `s36/538-the-receipts-in-his-hand.jpg` (the framing to return
to), `sheets/jack-face.jpg`.

**Prompt:**

> Keep this picture exactly: the pink payphone at the left, its empty cradle, the fanned receipt slips lit warm, Mr. Noda
> asleep in the background, the lobby behind. Change only the framing: pull back and shift the frame RIGHT so the whole of
> Jack's raised hand and the FANNED RECEIPTS fill the centre of the picture, every slip complete to its torn edge, the pink
> handset at his ear on its coiled cord at the right of frame. A close-up — the payphone at the left edge, the receipts the
> subject — not the wide lobby shot.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green shadows, warm amber
> practical light only, restrained 35mm grain. No legible text, signage, logos or watermarks.

**Check:** every receipt slip inside the frame; one handset, at his ear; the picture is a close-up, not 207's wide shot;
Noda remains soft in the background.

## 6. 384 — the phone off the table

**File:** `retakes_2026_10_25/384-the-room-too-big-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/384-the-room-too-big-r1.jpg` (1376×768)

**Why:** 384-r1 fixed the wide-angle emptiness and the lived-in room, but a black smartphone lies on the low table. The film
is set before them: Vera's world here is the CRT, the radio-cassette and the landline, and a smartphone on the table breaks
the shot.

**Attach:** `384-the-room-too-big-r1.jpg` (base), `s4/36-vera-at-the-table.jpg` (the room's props as they are),
`sheets/vera-face.jpg`.

**Prompt:**

> Keep this picture exactly: Vera's small apartment in grey rainy evening light, the normal lens, the room close and
> lived-in, Vera at the low table in her cream knit with two cups on it, the wooden cabinet with the lamp and the framed
> photograph at the left, the umbrella in its stand, the window with the building opposite in the rain, the CRT on its stand
> at the right. Change only what lies on the table: the black smartphone is GONE. In its place, a small open notebook and a
> pencil, and nothing modern or electronic anywhere in the room — no phone, no tablet, no charger, no cable.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey rainy evening light and one warm lamp, restrained 35mm
> grain. No legible text, signage, logos or watermarks.

**Check:** no phone anywhere in frame; the two cups, the umbrella, the lamp and the CRT unchanged; Vera's face and knit
untouched; the room still reads close, not wide.

## 7. 285 — the hand at rest on the counter

**File:** `retakes_2026_10_25/285-the-inside-pocket-r2.jpg` · **Post:** edit of the **in-film** `s22/285-the-inside-pocket.jpg`

**Why:** the in-film 285 has the seat and the frame right, and the brief's note is about the letter: "The letter is in the
inside pocket of his coat. He doesn't move to touch it." In 285-r1 his hand came up to his chest and lapel, which reads as
touching it. This take starts from the in-film picture so the counter, the arch and Jack's place stay exactly as the rest of
scene 22 has them.

**Attach:** `s22/285-the-inside-pocket.jpg` (base, the in-film frame), `s22/348-easy-to-talk-to.jpg` and
`s22/440-she-rests-her-head.jpg` (his seat at the counter's right end, by the ticket machine), `sheets/jack-face.jpg`,
`sheets/vera-face.jpg`.

**Prompt:**

> Keep this picture exactly: the tiled underground noodle counter under the brick arch, the cook behind it in the steam, the
> menu sheets on the tiles, the radio, the ticket machine at the right end, Jack's stool at that end with Vera soft at the edge
> of frame. Change only Jack's hand: it rests FLAT AND STILL on the counter in front of him, fingers relaxed and slightly
> apart, well away from his coat — nothing near the lapel or the chest, no hand at the inside pocket. He does not move.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, warm tungsten light in a tiled underground noodle counter,
> restrained 35mm grain. No legible text, signage, logos or watermarks.

**Check:** the hand is on the counter, not at the coat; his seat is the one in 348 and 440; the coat is still closed over the
inside pocket; Vera soft at the edge, unchanged.

## 8. 289 — yen, not dollars

**File:** `retakes_2026_10_25/289-for-making-me-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/289-for-making-me-r1.jpg` (1376×768)

**Why:** 289-r1 cut the money down to two folded notes, as asked, but the notes read as American dollars. He is at a
Japanese till, paying for breakfast; the notes have to be yen.

**Attach:** `289-for-making-me-r1.jpg` (base), `s25a/448-breakfast-nobody-asked-for.jpg` (the same counter, the till),
`sheets/vera-face.jpg`, `sheets/jack-face.jpg`.

**Prompt:**

> Keep this picture exactly: the little shop's wooden counter, the coffee siphon, the plates and paper napkins, the CRT high
> in the right corner, the woman behind the counter, Vera seated at the left, Jack standing at the till with his back
> three-quarters to us, the grey morning light at the door. Change only the notes in Jack's hand: TWO folded JAPANESE banknotes,
> the pale green-cream and light brown paper of yen, plain and worn, with no readable numbers, portraits or lettering — not
> dollar bills, and no other money anywhere.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey morning light, restrained 35mm grain. No legible text,
> signage, logos or watermarks.

**Check:** the paper reads as yen (colour, proportion, folded); two notes only; no greenback engraving; the counter, the
siphon and Vera unchanged.

## 9. 445 — no "1:07"

**File:** `retakes_2026_10_25/445-exactly-where-it-was-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/445-exactly-where-it-was-r1.jpg` (1365×768)

**Why:** 445-r1 made Jack photographic rather than painted, which was the director's note, and kept the storeroom and the
drawing — but it added "1:07" to the drawing, which reference 520 does not have. The drawing is a prop the audience has
already seen; it must match.

**Attach:** `445-exactly-where-it-was-r1.jpg` (base), `s84/520-excuse-me.jpg` (the drawing, as it is in the film),
`sheets/jack-face.jpg`.

**Prompt:**

> Keep this picture exactly: the flour store, the one bare bulb, the flour sacks with their stencil, the scoop, the stack of
> pages, Jack crouched at the left in his dark coat, a real man photographed rather than painted, his hand setting the page
> down. Change only the drawing: it is the drawing of the reference 520 and nothing else — the toppled stool, the shoes, the
> counter and bottles, the hand hanging down, and the single caption EXCUSE ME along the bottom. Remove the figures "1:07"
> entirely; no other numbers, timestamps or marks anywhere on the page, and no lettering anywhere else in the frame.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, at night. Cold slate and teal-blue-green shadows, warm amber
> practical light only, restrained 35mm grain. No legible text, signage, logos or watermarks other than the drawing's caption.

**Check:** the drawing matches 520 line for line, including its folds, with no "1:07"; the sacks and scoop unchanged; Jack
still photographic.

## 10. 354 — her gaze past him, to the photograph

**File:** `retakes_2026_10_25/354-the-altar-photograph-r2.jpg` · **Post:** edit of
`retakes_2026_10_25/354-the-altar-photograph-r1.jpg` (1376×768)

**Why:** 354-r1 has Jack kneeling on the right, the altar and its photograph on the right — the composition is right. What
is wrong is the look: Mrs. Sakai's eyes land on Jack, where the script has her looking past him, at her dead husband's
photograph. It changes what the shot means: she is not talking to Jack, she is talking to the photograph.

**Attach:** `354-the-altar-photograph-r1.jpg` (base), `s29/273-the-receipts.jpg` (her face and her stillness),
`sheets/sakai.jpg` (the man in the photograph), `sheets/jack-face.jpg`.

**Prompt:**

> Keep this picture exactly: the tatami room, the shoji screens, the old CRT to the left of the altar, the kotatsu in the
> foreground, the black-and-gold Buddhist altar at the right of the back wall with the framed portrait of her husband on it
> and the candle beside it, Mrs. Sakai kneeling at the left of the kotatsu in her dark blue kimono, Jack kneeling at the right
> in his charcoal jacket. Change only her eyes and the set of her head: she looks PAST Jack, over his shoulder, to the framed
> photograph of her husband on the altar — her gaze on the photograph, off frame-right of Jack's head, her face still and
> hard, speaking to the dead man and not to the visitor. Jack stays exactly as he is.
> Photorealistic contemporary Tokyo neo-noir film still, 16:9, grey rainy daylight, restrained 35mm grain. No legible text,
> signage, logos or watermarks.

**Check:** her eye-line ends on the photograph, not on Jack's face; Jack's pose unchanged; the altar still on the right; the
candle, CRT and kotatsu unchanged.

## What is still not made after these ten

- **The whole of brief §1 and §6e–6g again** — the car set (137–142, 368, 94-01) — is out of scope here: those takes are
  already two to five deep, stored and uninstalled, and they are waiting on the director's vote, not on another pass.
- **Depth layers** for 374, 73-09, 512, 460, 354 and 364 have still not been re-made; they wait until the final pictures are
  chosen, then go through `tools/make-depth-layers.py --find-people`.
- **Wiring** — the story.json / `studio-edits.json` changes in `docs/handoff-2026-10-25.md` §1 — is untouched by this batch,
  per the brief's "do not wire them into the film".
- Nothing here is installed and nothing under `src/`, `tools/` or `scripts/` was changed.
