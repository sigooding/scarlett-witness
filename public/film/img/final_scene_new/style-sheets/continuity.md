# The end, redone: continuity lock (`final_scene_new`)

A non-destructive redo of the Vera-and-Jack ending — **scene 100, INT. KANEKO'S NEW COUNTER –
NIGHT**, plus a new 8-shot dream sequence. Nothing in `s100/` or anywhere else is touched; all new
work lives in this folder.

## 1. What changes vs the shipped ending

Shipped 100: Jack already sits at the counter; Vera enters; they eat; hold on the three of them.

New ending, per direction:

1. **Jack does not go in.** He is a silhouette in the doorway, contemplating it; then he walks off
   into the rainy Tokyo distance. Vera feels it, looks back at the doorway — there is no one there.
2. **Eight extra shots.** The camera pulls out of the noodle bar. The bar slowly becomes a **bubble**;
   the bubble is slowly surrounded by other bubbles, each holding an **alternate scene — something
   that could have happened instead**. It is Tokyo as a memory, a constellation of alternate truths.

## 2. Characters (locked to the shipped film)

- **VERA** (`refs/vera-face.jpg`): white woman, late 20s, chin-length blonde bob with side-swept
  fringe, blue eyes. The **red enamel bird clip** in her hair (returned to her in 98). Cream knit
  turtleneck under a **dark olive wool coat**.
- **JACK** (`refs/jack-face.png`): Western man, late 50s, lean, swept-back dark hair greying at the
  sides, collar-length, short grey stubble; long charcoal-black wool overcoat over an off-white
  open-collar shirt. No plaster.
- **KANEKO** (`refs/kaneko.jpg`): elderly Japanese woman, white hair tied back, warm lined face,
  rust-brown cotton top, dark apron.
- **MARA** (`refs/mara-face.jpg`): Vera's younger sister, 24, blonde, dark coat, the red bird clip
  (s1). In the film she dies (97A service). In the bubbles she is alive.
- **DANIEL VOSS** (`refs/father-and-son.jpg`): Jack's father, from the in-story photograph s11/167 —
  lean American, 50s, grey suit, at the old noodle counter with a younger Jack.

## 3. The counter (location lock)

Tiny noodle counter in a **brick railway arch** near the station (the new place from 98/99A). Night.
Rain outside. One warm hanging bulb; steam from the pot; old wooden counter with a row of old stools;
a small dark old television on a shelf; a small hand-painted wooden sign with the kanji 金子 (KANEKO)
and a noodle-bowl drawing; brick arch wall; open glass panels/doorway at the far end onto the wet
street. Warm amber inside, cold blue-grey rain light outside. This must stay identical in every
interior shot and in the central bubble.

## 4. The bubble language (dream-sequence lock)

- A bubble is a **round, luminous, soap-like sphere** of light with a **thin iridescent rim**
  (subtle violet-blue-pink sheen) and a soft inner glow, floating in very dark blue-black rainy air.
- **Inside** each bubble: a crisp, warm, self-contained miniature film scene, like a lit diorama —
  fully in focus, its own light.
- **Outside** everything: the rainy Tokyo night dissolves into soft blue bokeh, faint streetlights,
  soft rain streaks — memory, not street. No crisp buildings, no legible text.
- The **central bubble** always holds the counter scene (Vera at the counter, the empty stool,
  Kaneko, steam, the bulb) and is always the warmest and brightest.
- The sequence is a **continuous slow pull-back**: each shot the bubbles are slightly smaller/higher
  and one more bubble has appeared. The bubbles never change once introduced; they only stay.
- Alternate bubbles are slightly smaller than the central one and a touch softer.
- The 7 alternates, in order of appearance (shot 07 → 12):

| Bubble | Alternate truth | Source look |
|---|---|---|
| 1 (07) | **Mara alive.** Vera's small apartment, the low table by the window, both tea cups full and steaming; Mara and Vera across the table, mid-laugh, drinking. The night that didn't happen. | `s4/36` + `s1/04` |
| 2 (08) | **The father alive.** The old noodle counter: a younger Jack (late 30s, dark hair, no stubble, dark overcoat) and his father Daniel (50s, grey suit) at the counter, laughing over two steaming bowls. | `s11/167` |
| 3 (09) | **They stayed.** The rainy crossing: Jack and Vera crossing together under his cheap small umbrella, laughing, green light. | `s27/202` |
| 4 (10) | **Ishida lived.** Under the expressway in the rain, the green saloon: Ishida turned to Jack with the tired kind half-smile. | new `jack_ishida_new/61-10` |
| 5 (11) | **The quiet alley.** The Kanda backstreet, the night with no shooting: just the vending machine's amber light and Mara walking home alone in the rain, safe, her reflection on the wet street. | `s1/03`, `s1/02` |
| 6 (12) | **She stayed on the rooftop.** Day, pale sky: Jack and Vera at the railing; Vera has turned back to Jack and is laughing, they are close; a train passing below. | `s98/523`, `s98/155` |
| 7 (13) | final frame adds two more faint, small, distant bubbles (one: Okada's bar, warm and full; one: Kaneko's counter in daylight, six stools, a small crowd) to fill the sky. | `s2/19`, `s99a/531` |

## 5. Shot recipes

### Part A — "he doesn't come in" (realism)

| # | File | Camera | Pass | Status |
|---|---|---|---|---|
| 01 | `100-01-the-empty-stool` | Low angle along the counter: Kaneko at the pot in the bulb light; Vera three-quarter from behind at the third stool, **empty stool beside her**, looking out the glass at the dark rainy street. | s100/158, s100/160, s98/524 | made |
| 02 | `100-02-his-silhouette-in-the-doorway` | From inside the counter toward the doorway: Jack's dark figure at the threshold in the blue street light, rimmed warm, hand on the door frame, head bowed, hesitating. Counter edge + stool foreground. | s100/158, jack-face | made |
| 03 | `100-03-into-the-rain` | From behind: Jack walking away down the long wet street under the viaduct into the distance, no umbrella; the counter's warm glow small at frame left. | jack-face, s74/74 | made |
| 04 | `100-04-she-feels-it` | Close-up: Vera at the counter, teacup half-raised, head turned toward the doorway, a barely readable tremor in her eyes — the sense of someone leaving. Amber on one side of her face, blue from the doorway on the other. | s98/525, s100/160 | **to make** |
| 05 | `100-05-the-empty-doorway` | Over Vera's shoulder (her shoulder + the red clip soft at frame left): the doorway is **empty** — swaying panel, rain, one sodium lamp, wet street, no one there. | s100/158, s100/320 | **to make** |

### Part B — "Tokyo as a memory" (the 8 bubble shots)

| # | File | What's in frame | Pass | Status |
|---|---|---|---|---|
| 06 | `100-06-the-bar-becomes-a-bubble` | The pull-back begins: the counter's warm light gathers into ONE round glowing sphere; inside it the counter (Vera, empty stool, Kaneko, steam); the street and lamps dissolve to blue bokeh, rain into light streaks. | new 100-01, s100/158 | **to make** |
| 07 | `100-07-the-tea-still-warm` | Edit of 06: central bubble kept; camera slightly back; + bubble LEFT: the sisters' tea (Mara alive, both cups steaming). | 06, s4/36, s1/04 | **to make** |
| 08 | `100-08-father-and-son` | Edit of 07: + bubble RIGHT: the old counter, Daniel and young Jack laughing over bowls. | 07, s11/167 | **to make** |
| 09 | `100-09-the-small-umbrella` | Edit of 08: + bubble LEFT (lower): the rainy crossing, Jack and Vera laughing under the small umbrella. | 08, s27/202 | **to make** |
| 10 | `100-10-youve-done-well` | Edit of 09: + bubble UPPER RIGHT: under the expressway, the green car, Ishida's kind smile to Jack. | 09, jack_ishida_new/61-10 | **to make** |
| 11 | `100-11-the-quiet-alley` | Edit of 10: + bubble LOWER RIGHT: the quiet backstreet, Mara walking home safe, vending-machine light. | 10, s1/03, s1/02 | **to make** |
| 12 | `100-12-she-stays` | Edit of 11: + bubble LOWER LEFT: the rooftop, Vera turning back to Jack and laughing, the train below. | 11, s98/523 | **to make** |
| 13 | `100-13-the-city-as-memory` | Final: the full constellation — central counter bubble + 7 alternates + two small faint ones high up; the camera fully withdrawn; below, all of Tokyo as a soft blurred memory: viaduct, street grid, faint lights, rain; the cluster drifting. | 12, s2/19, s99a/531 | **to make** |

## 6. Prompt blocks

**LOOK (Part A)**
> Contemporary Japanese neo-noir film still, photographic realism, 16:9. Warm amber tungsten inside,
> cold blue-grey rain light outside, amber smeared on wet asphalt. Restrained 35mm film grain,
> natural exposure, subtle halation. No legible text (the small hand-painted 金子 sign is the only
> lettering), no logos, no watermark, no border.

**BUBBLE (Part B)**
> A dreamlike pull-back shot, 16:9, photographic realism with a soft, memory-like air. One or more
> round luminous soap-like spheres float in very dark blue-black rainy air. Each sphere has a thin
> iridescent rim (subtle violet-blue-pink sheen) and a soft inner glow; inside each sphere, a crisp,
> warm, self-contained miniature film scene, like a lit diorama, fully in focus and lit from within.
> Around everything: the rainy Tokyo night dissolved into soft blue bokeh, faint streetlights, soft
> rain streaks — memory, not street; no crisp buildings, no legible text. Restrained 35mm film
> grain, subtle halation, no watermark, no border.

**For every edit-shot (07–13):** open with "Edit reference image 1. Keep every bubble and everything
inside it EXACTLY as it is — same bubbles, same scenes, same sizes, same positions, same light."
then: "The camera has moved slightly farther back, so the whole group is a little smaller and a
little higher in frame." then: "One new bubble has appeared at [position], slightly smaller and a
touch softer than the central one: inside it, [the miniature scene from reference image N]."

## 7. Check every frame

- Part A: the counter must match shot 01 in every detail (sign, bulb, stools, TV, brick arch).
  Vera: red clip in hair, olive coat, cream turtleneck. Jack: no plaster, long overcoat.
- Part B: the central bubble always shows the counter with the EMPTY stool and Vera; bubbles never
  change once introduced; each new bubble's miniature matches its source look; no legible text
  anywhere (not even the 金子 sign once the bubbles are small enough for it to garble — prefer
  keeping the sign only while the central bubble is large in 06–07).
- Clean frame: no watermark, no border, no legible lettering.
- Conform: 1920×1080 sRGB JPEG q92, Lanczos cover-resize, centre crop, light unsharp.
