# service_new — Mara's service (scene 97A), fresh set

A new, self-contained set of images for **Mara's service** (*Nobody's Witness*, scene 97A,
PlayFrame shots 556–569). **Nothing was replaced:** the film still plays the fourteen
pictures in `public/film/img/s97a/`; `src/film/story.json`, `src/film/studio-edits.json`
and `art/mara-service/` are untouched. Everything new lives here, **under the same
fourteen shot numbers and filenames as `s97a/`**, so any picture can be dropped into the
cut one-for-one.

Loosely scripted, tuned for visual sense: the staging follows the screenplay's stage
directions where they read, and fixes them where they fight the room — Kaneko is in her
own room, the memorial photograph is Mara's face and never changes, the rice-ball parcel
is newspaper-wrapped (as scene 68 set up), the bow keeps all seven mourners, and the
script's "her mother stays behind with the photograph" finally has its picture (569).
The full reasoning is in `style-sheets/continuity.md`.

Character consistency comes **from the original shipped scenes only** — `sheets/vera-face.jpg`,
`thehiveescape/style-sheets/`, and Kaneko's, Okada's and Mara's shipped film frames. No
`_new` folder was used as an identity reference.

## Style sheets

| Sheet | Locks down |
|---|---|
| `style-sheets/vera-mother.jpg` | **Vera's mother** — new sheet: early 60s American, Vera's bone structure, silver-blonde hair loosely pinned, long black coat over black dress, pearl studs, gold band |
| `style-sheets/mara-memorial-photo.jpg` | The memorial photograph: Mara's smiling portrait in the light-wood frame — the same object in every shot |
| `style-sheets/service-neighbours.jpg` | The three Hive neighbours: cane man (80s), stocky man (70s), shawl woman (70s) |
| `style-sheets/loc-service-room.jpg` | Kaneko's tatami room: table set-up, lamp on the left chest, window on the back wall, shoji corner, umbrella stand by the door, six cushions |
| `style-sheets/loc-lane-and-door.jpg` | The lane: ONE doorway on the left wall with step, eave and umbrella rack; viaduct crossing the far end |

The set's face authorities stay the shipped ones: Vera `../sheets/vera-face.jpg`, Jack
`../thehiveescape/style-sheets/jack.jpg`, Kaneko `../thehiveescape/style-sheets/kaneko-and-counter.jpg`,
Okada `../s81/100-the-bar-in-daylight.jpg`, Mara `../s69/279-her-sisters-smile.jpg`.

## Shots

### Arrival in the rain (556–559)
| File | Beat |
|---|---|
| `556-the-lane-from-above.jpg` | The lane from above: mourners gathered at the lit doorway, the one blue umbrella among the black, viaduct over the far end |
| `557-the-umbrellas.jpg` | Six black umbrellas crowd the doorway, beaded with rain; the blue one comes last |
| `558-the-blue-umbrella.jpg` | Vera closes the blue umbrella and stands it in the rack with the black ones |
| `559-shoes-at-the-step.jpg` | Shoes in a row below the step; stockinged feet on the old wood |

### The service (560–566)
| File | Beat |
|---|---|
| `560-jack-at-the-door.jpg` | Jack, last one in, stops at the door and looks back at the rain |
| `561-the-small-service.jpg` | The room, all seven: Vera, her mother, Jack on one side; the three neighbours on the other; Kaneko at the foot, her room |
| `562-kanekos-parcel.jpg` | Kaneko sets a newspaper-wrapped parcel (rice balls) by the photograph |
| `563-the-saved-drawing.jpg` | Jack straightens the photograph; Kaneko's hand steadies the frame, beside Mara's drawing of the arches in the rain |
| `564-the-room-from-above.jpg` | Overhead: the whole room around the table, seating matching 561; the incense goes straight up |
| `565-they-bow.jpg` | Vera and Jack bow at the table; the room bows with them — all seven in frame |
| `566-her-mothers-hand.jpg` | Her mother's hand finds Vera's on the table and holds it; Vera lets her |

### Okada, and out into the rain (567–569)
| File | Beat |
|---|---|
| `567-okada-at-the-door.jpg` | Okada at the door in a black suit, late, umbrella planted like a cane; he doesn't come in |
| `568-kaneko-and-okada.jpg` | Kaneko goes to him; they sit together by the lamp; his hand rests on hers, once |
| `569-after-the-service.jpg` | The walkers move off under the umbrellas (one blue), a train crossing the viaduct above; in the lit doorway behind them, Vera's mother stays a moment with the photograph |

### Extras — the mother (`extras/`)

Close-ups of Vera's mother, beyond the fourteen cut shots, for style and coverage:

| File | Beat |
|---|---|
| `extras/mom-01-her-face-at-the-table.jpg` | Her face at the table: held-back tears that do not fall |
| `extras/mom-02-mother-and-daughter.jpg` | Two-shot: her hand over Vera's; Vera lets it stay |
| `extras/mom-03-what-she-wears-home.jpg` | Full-length: black coat over black dress, pearls, gold band, leaving |
| `extras/mom-04-the-photograph-while-they-go.jpg` | She stays with the photograph while they go, the blue umbrella walking away under the viaduct |

`contact-sheet.jpg` shows all fourteen cut shots in order.

## Status

**Complete.** 5 style sheets, 14 cut shots (556–569, same filenames as `s97a/`), 4 mother
extras, contact sheet. Nothing outside `public/film/img/service_new/` was touched.

**Mara fix:** the first memorial-photo sheet aged Mara wrong; it was regenerated against
her shipped frame `../s2/21-mara-bursts-in.jpg` (early twenties, soft round face, large
blue-grey eyes, long wavy golden-blonde hair), and every shot holding the photo (561–564,
569, `extras/mom-04`) uses that face.

## Look

Photorealistic contemporary Japanese neo-noir, 16:9 film stills. Cold slate / teal-blue-green
shadows and rain, warm amber practicals only, wet reflective surfaces outside, restrained
35mm grain, natural exposure, subtle highlight halation. No film grade, no volumetric light
shafts, no legible signage or text, no logos, number plates, watermarks or borders.

## The 32-shot cut (17 October 2026)

The director asked for more shots so each still holds less of the song. The film now plays this set through
`tools/service-cut.mjs` (it rewrites scene 97A in `src/film/story.json` and the "service" soundtrack's captions). The cut
is 32 shots, with the sixteen above and the extras in it. The sixteen below are still to make, and any shot not yet on disk
is left out. Upload a picture under its filename here, run `node tools/service-cut.mjs` and then
`FILM_SRC=/nonexistent node tools/build-film-story.mjs`, and it slots in. With all 32 the song gives each still about 6 s;
with the present 16 it gives about 12 s. `558-the-blue-umbrella.jpg` (her mother with the umbrella) is out of the cut;
`558-vera-closes-the-blue-umbrella.jpg` takes its place.

Cut order: 574, 556, 575, 557, 558 (new), 559, 576, 560, 577, 578, 561, 579, 580, 562, 563, 581, mom-01, 582, 583, 564,
565, 566, mom-02, 584, 567, 585, 568, 586, 587, 569, mom-04, 588.

**Every prompt ends with:** *Photorealistic contemporary Japanese neo-noir film still, 16:9. Cold slate and
teal-blue-green shadows, warm amber practical light only, restrained 35mm grain, subtle highlight halation. No legible
text, signage, logos or watermarks.*

Attachments are paths under `public/film/img/`. The faces come from: Vera `sheets/vera-face.jpg`, her mother
`service_new/style-sheets/vera-mother.jpg`, Jack `thehiveescape/style-sheets/jack.jpg`, Kaneko
`thehiveescape/style-sheets/kaneko-and-counter.jpg`, Okada `s81/100-the-bar-in-daylight.jpg`, the neighbours
`service_new/style-sheets/service-neighbours.jpg`, Mara's photograph `service_new/style-sheets/mara-memorial-photo.jpg`.
The two places are `service_new/style-sheets/loc-lane-and-door.jpg` and `loc-service-room.jpg`.

| File | Attach | Prompt |
|---|---|---|
| `574-the-viaduct-at-dusk.jpg` | loc-lane-and-door | Wide and low in the narrow lane behind the Hive: the concrete railway viaduct crosses the far end against the last blue light of dusk, a commuter train crossing it, its lit windows a smear of warm light. Steady rain, wet stone reflecting the train. The lane is empty; one doorway on the left wall is lit under its eave. |
| `575-vera-and-her-mother-arrive.jpg` | loc-lane-and-door, vera-face, vera-mother | Medium-wide at ground level in the lane: Vera (early 30s, blonde hair in a loose low bun, long charcoal-black wool coat) and her mother (early 60s, silver-blonde hair loosely pinned, long black wool coat) walk side by side toward camera under one pale blue umbrella, Vera holding it, the only blue in frame. Behind them, black umbrellas of other mourners at the lit doorway on the left, the viaduct at the far end. Composed faces, grief held in. |
| `558-vera-closes-the-blue-umbrella.jpg` | loc-lane-and-door, vera-face, service_new/557-the-umbrellas.jpg | Medium close-up under the eave at the doorway: Vera (as above) closes the pale blue umbrella with both hands and stands it in the umbrella stand among the folded black ones. Her face in three-quarter, eyes down, rain on her coat shoulders, warm light from the open door on her face, cold rain behind. |
| `576-onto-the-old-wood.jpg` | service_new/559-shoes-at-the-step.jpg, loc-service-room | Low close-up at floor level just inside the door: a woman's feet in dark stockings step up from the stone onto a worn old wooden step. Behind, black shoes in a row on the wet stone; the hem of a long charcoal coat; warm lamp light from the room. |
| `577-the-window.jpg` | loc-service-room | Kaneko's tatami room, looking at its big back window: pale lace curtains half drawn, the neighbouring concrete building close beyond in the rain with a few lit windows, rain running down the glass, the room's small amber lamp reflected in the pane. No people. |
| `578-maras-photograph.jpg` | mara-memorial-photo, loc-service-room | Close-up on the low wooden table: Mara's memorial photograph in its simple light-wood frame (exactly the smiling portrait on the sheet, never another face), a vase of white chrysanthemums, an incense bowl with one stick sending smoke straight up, a cup of tea. The warm lamp to the left, the room soft behind, no one in focus. |
| `579-her-drawings.jpg` | service_new/563-the-saved-drawing.jpg, mara-memorial-photo | Top-down close-up: three or four of Mara's pencil sketches on white sketch paper laid flat on the dark wood table, rippled and faintly water-stained from being wet and dried: a brick railway arch in the rain with tracks through it, the Hive's crowded passages, a noodle counter. The corner of the light-wood photo frame and a chrysanthemum petal at the edge of frame. |
| `580-the-incense.jpg` | kaneko-and-counter, loc-service-room | Close-up: Kaneko's small old hand, in the sleeve of a black kimono-style jacket, holds a lit match to a stick of incense in the ceramic bowl; the first thin thread of smoke rises. The photograph soft behind, warm lamp light. |
| `581-veras-face.jpg` | vera-face, mara-memorial-photo, loc-service-room | Close-up of Vera (early 30s, blonde hair in a loose low bun, charcoal coat over a white shirt) kneeling at the table, looking down at Mara's photograph off frame. Dry-eyed, jaw set, holding herself together. Warm lamp light on one side of her face, cool window light on the other, incense smoke drifting across the soft background. |
| `582-jacks-face.jpg` | jack, loc-service-room | Close-up of Jack (late 50s American, lined stubbled face, dark swept-back hair greying at the sides, long dark overcoat, white shirt, black tie) kneeling at the table. He looks not at the photograph but at Vera beside him, off frame left: still, quiet concern. Warm lamp light, the window's cool light behind him. |
| `583-the-neighbours.jpg` | service-neighbours, loc-service-room | Medium shot across the table: the three Hive neighbours kneeling on grey cushions on its right side — the man in his 80s with a dark cane across his knees, eyes closed; the stockier man around 70, hands folded; the small woman in her 70s in a grey dress and dark shawl, hands clasped. A chrysanthemum soft in the foreground. |
| `584-the-tea-gone-cold.jpg` | mara-memorial-photo, service_new/561-the-small-service.jpg | Close-up: the cup of tea beside Mara's photograph on the table, no steam now, the surface still; the incense stick burned down to a short stub with a long curl of ash. Time has passed. |
| `585-kaneko-goes-to-him.jpg` | kaneko-and-counter, s81/100-the-bar-in-daylight.jpg, service_new/567-okada-at-the-door.jpg, loc-service-room | From behind Kaneko (small, late 70s, grey hair in a low bun, black kimono-style jacket) as she crosses the tatami toward the open door. In the doorway, a little out of focus, Okada (60s, short silver hair, black suit, white shirt, black tie) stands in the rain with his umbrella planted like a cane. Mourners soft at the edges of frame. |
| `586-his-hand-on-hers.jpg` | service_new/568-kaneko-and-okada.jpg | Insert close-up by the lamp: Okada's weathered old hand, black suit sleeve and white cuff, rests once on the back of Kaneko's small hand on her knee. Warm amber lamp light; nothing else. |
| `587-the-blue-umbrella-opens.jpg` | loc-lane-and-door, vera-face, vera-mother | Medium shot from the lane, now dusk-dark: Vera steps down from the lit doorway and opens the pale blue umbrella into the rain, her mother just behind her in the doorway, the room's warm light behind them, the lane cold blue. |
| `588-it-rains-all-night.jpg` | loc-lane-and-door, service_new/569-after-the-service.jpg | Wide in the lane at night: the lane empty and wet, rain falling through the light of the one doorway on the left, still lit; the umbrella stand under the eave empty; the viaduct dark at the far end. Nobody. |
