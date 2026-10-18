# The cold open — second pass

*Untitled (working title), the 1975 cold open. Retake of the painted boards: late-1990s cel animation, painted backgrounds, 2.39:1. Generated from `docs/hangar/cold-open-prompts.json` by `node tools/cold-open-prompts.mjs pack` — change the JSON, not this page.*

**Status:** 13/60 plates redrawn, in `public/reels/hangar/img/hangar-v2/`. The playable second pass is `src/data/hangarColdOpenV2Reel.ts`, rebuilt with `node tools/retake-reel-pictures.mjs hangar`.

## How to use this pack

Make the sheets first, then the shots. The sheets are the reference images that keep faces, wardrobe and the crate consistent from shot to shot.

1. Generate the character, vehicle, prop and location sheets. Keep the best take of each.
2. For every shot, attach the matching sheets as reference images, then paste the shot prompt.
3. Every shot and background prompt ends with the Style Block, every sheet prompt with the Sheet Block, and every generation gets the Negative Prompt.
4. Shots are painted 16:9 and composed inside a 2.39:1 centre band — the reel letterboxes the frame. Sheets are 16:9.
5. **Leave all lettering out.** Every stencil panel and sign is painted blank, and the three strings are tracked in over the finished picture in a stencil face:
   - `WRIGHT FIELD 1944 — INERT`
   - `AGRICULTURAL EQUIPMENT`
   - `WEIGH STATION — ALL TRUCKS MUST ENTER`
   Every plate is painted with blank stencil panels and blank signs. The lettering is set in a stencil face and tracked in over the finished picture. Image tools garble type, and a garbled stencil on the crate reads as damage to the one prop the whole film turns on.
6. Don't name the film whose look you're after. The Style Block describes the look instead.

## Blocks

**Style Block** (shots and backgrounds)

```
Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

**Sheet Block** (model sheets)

```
Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

**Negative Prompt**

```
3D render, CGI, glossy plastic shading, photorealistic, anime, manga, chibi, flat vector art, neon colors, oversaturated, heavy lens flare, modern cars, modern clothing, smartphones, text, letters, captions, watermark, logo, signature, extra fingers, distorted faces, cluttered composition
```

## Colour script

| Beat | Light | Key colours |
|---|---|---|
| 2 · Hangar 18 | Sodium-amber work lights in a cold steel dark | #1E2A33 · #3F5563 · #C98A3B · #E8D7B0 · #6B5B45 |
| 3 · Back road | Deep blue night, pale fog, warm dash glow | #0F1B2D · #2E4A62 · #7FA3B8 · #E0A04A · #F3E3B5 |
| 4 · Swerve | Headlights blowing out to white, red taillights | #F7F2E1 · #B23A2E · #6E7B3A · #8A5A35 |
| 5 · Fall | Near-black with cold shards of moonlight | #070B10 · #3C5A78 · #A7BCCB |
| 6 · Topside | Road-flare red swallows the blue fog | #D9381E · #8E1F17 · #F5B7A0 · #1B2B3A |
| 7 · The crate | Red raking light on old gray pine; the fresh stroke glows pale | #9C8A74 · #2A1A1F · #FFD8C2 |
| 8 · Button | The red collapses to black | #3A0E0B · #000000 |

## Model sheets

Faces, wardrobe and the crate, fixed. Every later shot references these.

### sergeant · The Sergeant ✅

`public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

```
Character model sheet, 16:9 widescreen: full-body turnaround of an Air Force master sergeant (front, three-quarter, side, back views, evenly spaced and clearly separated) plus four expression heads in a row. He is in his late fifties, stocky and a little stooped, weathered face, close-cropped gray hair, heavy eyelids, kind tired eyes, big careful hands. Olive-green 1970s Air Force fatigues with sleeves rolled to the elbow, blank name tape, no insignia lettering. He holds a dented white enamel mug with a chipped blue rim. Expressions: tired neutral, faint private smile, wary sideways glance, quiet sorrow.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

### airman · The Airman ✅

`public/reels/hangar/img/hangar-v2/sheets/airman.jpg`

```
Character model sheet, 16:9 widescreen: full-body turnaround of a 19-year-old American airman in 1975 (front, three-quarter, side, back), plus four expression heads in a row. Tall and lanky, prominent Adam's apple, regulation buzz cut, big earnest nervous eyes. Civilian clothes: tan corduroy jacket over a red plaid flannel shirt, jeans, scuffed work boots. Expressions: nervous; lips moving as he counts under his breath; dawning realization; frozen fear. Match the drawing style of the reference sheet exactly.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### trucker · The Trucker ✅

`public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`

```
Character model sheet, 16:9 widescreen: full-body turnaround of a long-haul trucker in 1975 (front, three-quarter, side, back), plus four expression heads in a row. Mid-fifties, big and barrel-chested, gray stubble, long sideburns, a plain faded mesh trucker cap with no logo, denim jacket with a cream sheepskin collar, dark trousers, work boots, a toothpick in the corner of his mouth. Expressions: bored; grumbling; alarmed; shaken and pale. Match the drawing style of the reference sheet exactly.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### nurse-mom · The Mom ✅

`public/reels/hangar/img/hangar-v2/sheets/nurse-mom.jpg`

```
Character model sheet, 16:9 widescreen: full-body turnaround of a nurse in 1975 (front, three-quarter, side, back), plus four expression heads in a row. Late thirties, slim, kind face, tired eyes, brown hair pinned up and coming loose. A 1975 white nurse's uniform dress, white starched nurse's cap pinned in her hair with a small enamel hospital pin, a navy cardigan around her shoulders, white shoes. Expressions: exhausted; eyes drifting shut; startled awake; shaking in shock. Match the drawing style of the reference sheet exactly.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### agents · The Agents ✅

`public/reels/hangar/img/hangar-v2/sheets/agents.jpg`

```
Character model sheet, 16:9 widescreen: two government agents side by side, each in a front view and a three-quarter view, plus two expression heads each. 1975: plain dark suits, narrow ties, short side-parted haircuts, forgettable faces. The first is older and heavyset in a gray raincoat; the second is younger, lean and sharp-featured. Expressions: flat and unreadable, then stunned. Match the drawing style of the reference sheet exactly.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### truck · The Truck ✅

`public/reels/hangar/img/hangar-v2/sheets/truck.jpg`

```
Vehicle model sheet, 16:9 widescreen: side view, front view and three-quarter rear view, evenly spaced and clearly separated. A 1970s American long-nose semi tractor in faded cream with a chrome bumper and rust at the wheel wells, pulling a plain unmarked white box trailer with rear swing doors and vertical lock rods. No company markings, no lettering, no logos.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`
- `public/reels/hangar/s2/04-wright-patterson-night.jpg`

### wagon · The Station Wagon ✅

`public/reels/hangar/img/hangar-v2/sheets/wagon.jpg`

```
Vehicle model sheet, 16:9 widescreen: four views, evenly spaced and clearly separated. First a 1970s full-size American station wagon in faded avocado green with simulated woodgrain side panels and chrome trim, driver's side mirror on a chrome stalk, seen from the side, the front and three-quarter front. Then a second side view of the same wagon after a crash: the driver's mirror snapped off at the stalk, a long bright scrape down the driver's side, no broken glass. No lettering, no logos.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### sedan · The Sedan ✅

`public/reels/hangar/img/hangar-v2/sheets/sedan.jpg`

```
Vehicle model sheet, 16:9 widescreen: side view and three-quarter front view, evenly spaced and clearly separated. A 1970s full-size four-door sedan in flat black, plain steel hubcaps, a small spotlight mounted beside the driver's mirror, no markings, no lettering, no logos.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### crate · The Crate ✅

`public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

```
Prop model sheet, 16:9 widescreen: a 1940s military wooden shipping crate about three feet long, pine boards weathered to silver-gray, steel corner brackets, rope handles, blank stencil panels on the side and on the lid. A dark ring is worn into the lid from decades of a coffee mug set down in the same spot. Show it closed from three angles, evenly spaced and clearly separated, then split open with old matted straw packing inside. No lettering, no text.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### scratched-wall · The Scratched Wall ✅

`public/reels/hangar/img/hangar-v2/sheets/scratched-wall.jpg`

```
Prop detail model sheet, 16:9 widescreen: the inside wall of an old pine crate, covered edge to edge in neat rows of thousands of tiny short vertical scratch marks, each with a short diagonal stroke cut through it. The very last stroke is bright, fresh pale wood. In one far corner, a few marks have no stroke through them yet. Flat even lighting for a model sheet; the marks must read as rows, not as writing. No lettering, no text, no symbols.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`

### small-props · Small Props ▫️

`public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

```
Prop model sheet, 16:9 widescreen, five props evenly spaced and clearly separated on a plain background: a white starched 1970s nurse's cap with a small enamel hospital pin; a chrome car side mirror snapped off its stalk; a lit road flare spitting red magnesium fire and smoke; a dented white enamel mug with a chipped blue rim; a small 1970s portable black-and-white TV with a rabbit-ear antenna. No lettering, no screen image, no logos.

Hand-drawn 2D animation model sheet, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture, flat cel color with simple two-tone shadows, appealing slightly rounded mid-century proportions. Plain warm-gray background, even neutral lighting, views evenly spaced and clearly separated, no labels.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

## Location backgrounds

Painted empty, then characters are composited over them or the plate is used as a reference.

### hangar-ext · Hangar exterior ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/hangar-exterior.jpg`

```
Background painting, no character in the foreground: a huge arched WWII-era aircraft hangar at night, tall doors half open and spilling amber light onto wet tarmac, a small guard booth in the foreground with the blue glow of a TV in its window, fine rain haze, dark sky. A cream semi with a plain white box trailer backs up to the doors, small in frame. The building and the trailer carry no lettering.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`

### hangar-int · Hangar interior ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/hangar-interior.jpg`

```
Background painting, no characters: inside a vast arched hangar at night, rows of crates and canvas-draped shapes receding into darkness, sodium work lights hanging from the steel trusses, puddles on the concrete reflecting amber, dust drifting through shafts of light, a forklift parked to one side. The crates are weathered gray pine with steel corner brackets and blank stencil panels. No lettering.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### weigh-station · Weigh station ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/weigh-station.jpg`

```
Background painting, no characters: a highway weigh station at night beside an empty exit lane, a lit blank sign panel on a post, a small inspection booth with one lit window, black woods behind. The sign panel is blank — the lettering is added in post.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### back-road · The back road ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/back-road.jpg`

```
Background painting, no characters: a narrow two-lane road twisting through wooded Ohio hills at night in early autumn, fog pooling in the hollows below, a hazy moon, trees in deep blue silhouette, a faded centre line.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### curve · The curve ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/curve.jpg`

```
Background painting, no characters: a blind curve on a wooded two-lane road at night, a yellow curve warning sign, no guardrail on the outside edge, the shoulder dropping away into a steep dark wooded bank, fog rising from below.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### wooded-bank · The wooded bank ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/wooded-bank.jpg`

```
Background painting, no characters: a steep wooded slope at night, tall trunks, ferns, mossy rocks and fallen logs, shafts of cold moonlight cutting through drifting mist, a creek glinting far below.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### creek-bottom · The creek bottom ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom.jpg`

```
Background painting, no characters: a shallow rocky creek at the bottom of a wooded ravine at night, low mist over the water, moonlight on wet stones, a small gravel bank at the water's edge.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### creek-bottom-flare · The creek bottom, flare version (beats 6–8) ▫️

`public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom-flare.jpg`

```
Background painting, no characters: the same shallow rocky creek at the bottom of a wooded ravine, now lit only by red road-flare light from above — a deep red glow in the mist, black tree trunks, red reflections in the water, the blue of the night almost gone.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom.jpg`

### key-art · Key art / cover ▫️

`public/reels/hangar/img/hangar-v2/key-art.jpg`

```
Key art for an animated feature, no lettering: the trucker stands in red road-flare smoke on a black wet road, arm raised with the lit flare, his truck stopped crooked across both lanes with its rear doors hanging open; below the shoulder, in the dark, a split-open wooden crate lies at the edge of a creek. The flare is the only light source.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

## Shots

Beat 1 is audio over black and has no picture: those plates are pure black on purpose. The rest run in shooting order.

### 1A · Over Europe, 1944 ✅

`public/reels/hangar/img/hangar-v2/shots/01-black-radio.jpg`

```
A frame of pure film black, nothing in it at all — the pilot's radio and the engine are heard over black, and no picture is ever shown.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### 1B · Three quick, one slow ✅

`public/reels/hangar/img/hangar-v2/shots/02-three-quick-one-slow.jpg`

```
A frame of pure film black, nothing in it at all — only the clicking in the pilot's headset.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### 1C · Gunfire, then silence ✅

`public/reels/hangar/img/hangar-v2/shots/03-gunfire-silence.jpg`

```
A frame of pure film black, nothing in it at all — gunfire and then silence, and we never see what he shot.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

### 2A · Establishing ▫️

`public/reels/hangar/img/hangar-v2/shots/04-wright-patterson-night.jpg`

```
Wide establishing shot, night: a huge arched hangar with its doors half open, spilling amber light across wet tarmac. In the foreground, a small guard booth with a TV glowing blue in its window. A cream semi with a plain white box trailer backs up to the hangar doors. No lettering anywhere.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/backgrounds/hangar-exterior.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`

### 2B · The TV ▫️

`public/reels/hangar/img/hangar-v2/shots/05-guard-booth-tv.jpg`

```
Insert, close on a small 1970s portable TV on a cluttered guard-booth desk, beside a thermos and a logbook. A grainy black-and-white image of a congressional hearing: a long table of men in suits behind microphones, faces indistinct. No readable text on the screen, the logbook or the thermos.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

### 2C · The hangar floor ▫️

`public/reels/hangar/img/hangar-v2/shots/02c-the-hangar-floor.jpg`

```
Wide interior shot: airmen in olive fatigues moving canvas-covered crates with a forklift under hanging sodium work lights, rows of crates disappearing into the dark, amber reflections puddled on the concrete.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/backgrounds/hangar-interior.jpg`

### 2D · The crate ▫️

`public/reels/hangar/img/hangar-v2/shots/06-wright-field-inert.jpg`

```
Medium shot: a single weathered wooden crate sitting apart from the others in a pool of amber light, a blank stencil panel on its side, a dark coffee ring worn into its lid, steel corner brackets and rope handles. The stencil panel is blank; the lettering is painted in post.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/hangar-interior.jpg`

### 2E · The mug ▫️

`public/reels/hangar/img/hangar-v2/shots/07-coffee-ring.jpg`

```
Close-up: an old sergeant's weathered hand setting a dented white enamel mug down exactly inside a dark ring worn into a wooden crate lid, a thread of steam rising, warm amber light. The mug has a chipped blue rim.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 2F · The hand ▫️

`public/reels/hangar/img/hangar-v2/shots/08-hand-on-lid.jpg`

```
Close-up: the same weathered hand resting flat and gentle on the crate lid, the way you'd steady a sleeping animal. The mug is gone; only the ring remains. Soft amber light, shallow focus.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/sergeant.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 2G · The signature ▫️

`public/reels/hangar/img/hangar-v2/shots/09-dont-you-want-to-know.jpg`

```
Medium two-shot: a lanky young airman in a tan corduroy jacket holds out a clipboard, and a big trucker in a faded mesh cap signs it without looking, toothpick in his mouth. Behind them, out of focus, a forklift lifts the crate into the truck. The clipboard paper is blank; no lettering.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 3A · Skipping the scale ▫️

`public/reels/hangar/img/hangar-v2/shots/10-weigh-station.jpg`

```
Wide shot, night: a cream semi with a white box trailer rolls past a lit weigh-station sign without slowing, taillights streaking, black woods behind. The lit sign is a blank panel; the lettering is added in post.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/weigh-station.jpg`

### 3B · The hills ▫️

`public/reels/hangar/img/hangar-v2/shots/11-into-the-hills.jpg`

```
High wide shot: one pair of truck headlights winding along a two-lane road through dark wooded hills, fog filling the hollows, a hazy moon. Far behind, a second, smaller pair of headlights.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/backgrounds/back-road.jpg`

### 3C · The cab ▫️

`public/reels/hangar/img/hangar-v2/shots/12-the-cab.jpg`

```
Interior cab two-shot, night: the trucker driving, lit warm amber by the dashboard; the young airman in the passenger seat twisted around to look at the back wall of the cab, uneasy. Blue fog through the windshield. No lettering on the dash or the papers clipped to it.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`

### 3D · A knock from the trailer ▫️

`public/reels/hangar/img/hangar-v2/shots/13-knock-from-trailer.jpg`

```
Interior cab shot from behind the seats: the trucker and the airman both turned to look back through the cab's rear window at the wall of the trailer behind them, their faces lit rim-light amber from the dash, the night blue outside.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`

### 3E · Counting ▫️

`public/reels/hangar/img/hangar-v2/shots/14-one-two-three-four.jpg`

```
Close-up: the airman's fingers tapping his knee in rhythm, his lips moving as he counts under his breath, warm dash light on his face, the dark cab behind him.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`

### 3F · The missing knock ▫️

`public/reels/hangar/img/hangar-v2/shots/15-slow-one-never-arrives.jpg`

```
Close-up: the airman frozen mid-count with one finger raised, eyes locked on the back of the cab, holding his breath. Total stillness, warm dash light, deep shadow everywhere else.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`

### 4A · Headlights ▫️

`public/reels/hangar/img/hangar-v2/shots/16-headlights-round-bend.jpg`

```
Point of view from a truck cab through the windshield: a station wagon's headlights coming around a blind curve, drifting over the centre line, glare blooming to white.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/wagon.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/curve.jpg`

### 4B · Two more miles ▫️

`public/reels/hangar/img/hangar-v2/shots/17-two-more-miles.jpg`

```
Interior car shot, night: a tired nurse at the wheel of a station wagon, window down, wind pulling strands of hair loose under her white nurse's cap, eyes drifting shut. Pale dashboard glow, dark road ahead, woodgrain door panel beside her.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/nurse-mom.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/wagon.jpg`

### 4C · The near-miss ▫️

`public/reels/hangar/img/hangar-v2/shots/18-yank-the-wheel.jpg`

```
Dynamic wide action shot on a foggy night curve: a cream semi and a green woodgrain station wagon swerve past each other. The wagon's side mirror snaps off in a spray of sparks, and a white nurse's cap tumbles out of its open window. Strong diagonal composition, motion streaks.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/wagon.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/nurse-mom.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/curve.jpg`

### 4D · The cap ▫️

`public/reels/hangar/img/hangar-v2/shots/19-mirror-cap.jpg`

```
Insert on wet asphalt at night, low angle: a chrome car mirror snapped off its stalk lying beside the white nurse's cap, red tail-light glow washing over both, rain-beaded road surface.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/nurse-mom.jpg`

### 4E · The doors ▫️

`public/reels/hangar/img/hangar-v2/shots/20-the-skid.jpg`

```
Rear three-quarter action shot: a white box trailer fishtailing across the lane, its rear swing doors bursting open, a wooden crate sliding out of the dark interior, tyre smoke glowing in the headlights.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 4F · The empty trailer ▫️

`public/reels/hangar/img/hangar-v2/shots/21-missing-knock.jpg`

```
Wide shot up the empty lane at the fishtailing trailer's dark interior, the crate already gone out of frame, the doors swinging, fog tearing past the headlights.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`

### 4G · Over the edge ▫️

`public/reels/hangar/img/hangar-v2/shots/22-over-the-edge.jpg`

```
Wide shot from the shoulder: a wooden crate tipping over the unguarded edge of a curve into a black wooded drop, the truck's red taillights smeared across the fog.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/curve.jpg`

### 5A · Tumbling ▫️

`public/reels/hangar/img/hangar-v2/shots/23-down-the-bank.jpg`

```
Wide shot, night: a wooden crate tumbling end over end down a steep wooded bank, boards shearing off, splinters and leaves in the air, thin shafts of moonlight through the trees.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/wooded-bank.jpg`

### 5B · Inside the fall ▫️

`public/reels/hangar/img/hangar-v2/shots/24-inside-the-crate.jpg`

```
Abstract view from inside a tumbling wooden crate: near-total darkness slashed by moving stripes of moonlight through gaps between boards, straw and splinters floating. Nothing recognizable inside — no figure, no shape.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 5C · Stillness ▫️

`public/reels/hangar/img/hangar-v2/shots/25-by-the-creek.jpg`

```
Wide, still shot: a wooden crate lying split open on a gravel bank beside a shallow creek, mist settling around it, moonlight on wet stones. The inside of the crate is empty and in shadow.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom.jpg`

### 6A · She didn't stop ▫️

`public/reels/hangar/img/hangar-v2/shots/26-taillights.jpg`

```
Long shot down the road, night: a cream semi stopped crooked across both lanes with its rear doors hanging open. Far down the road, a station wagon's taillights disappear around the bend into fog.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/truck.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/wagon.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/back-road.jpg`

### 6B · The flare ▫️

`public/reels/hangar/img/hangar-v2/shots/27-road-flares.jpg`

```
Medium shot: the trucker striking a road flare, red light blooming and swallowing the blue fog, his shaken face lit from below, the flare spitting sparks and smoke.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

### 6C · The cap ▫️

`public/reels/hangar/img/hangar-v2/shots/28-white-cap.jpg`

```
Low insert on the asphalt: a white nurse's cap with a small enamel pin lying on black wet road, lit deep red by a flare, a snapped-off chrome side mirror beside it. A man's hand in a dark suit sleeve reaches into frame.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/agents.jpg`

### 6D · They don't understand ▫️

`public/reels/hangar/img/hangar-v2/shots/29-where-is-it.jpg`

```
Medium shot, red flare light: an older, heavyset agent in a gray raincoat holding the white nurse's cap in his hand, looking at it; the trucker behind him, shaken, one hand up; the lit flare on the road between them.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/agents.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/trucker.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

### 6E · The descent ▫️

`public/reels/hangar/img/hangar-v2/shots/30-down-through-red-fog.jpg`

```
Wide shot: two men in dark suits and a lanky young man start down a steep wooded bank holding road flares aloft, small silhouettes against a wall of red-lit fog and black tree trunks.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/agents.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/wooded-bank.jpg`

### 7A · Arrival ▫️

`public/reels/hangar/img/hangar-v2/shots/31-empty.jpg`

```
Wide shot at a creek, night: three men holding road flares arrive at a split-open wooden crate, red light reflecting in the water, mist curling, black trees above. The crate is empty; nothing in it or near it reads as a figure.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/agents.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom-flare.jpg`

### 7B · The hollow ▫️

`public/reels/hangar/img/hangar-v2/shots/32-hollow-in-straw.jpg`

```
Insert looking down into a broken crate: old matted straw with a small hollow pressed into it, the curled shape of something no longer there. Red flare light. The hollow is only a dent in straw — no figure, no body, nothing recognizable.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`

### 7C · INERT ▫️

`public/reels/hangar/img/hangar-v2/shots/33-inert-in-creek.jpg`

```
Insert: a broken crate board half-sunk in a shallow creek, a blank stencil panel on it, water flowing around it, red reflections on the surface. The stencil panel is blank; the word is added in post.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/backgrounds/creek-bottom-flare.jpg`

### 7D · The wall ▫️

`public/reels/hangar/img/hangar-v2/shots/34-rows-of-marks.jpg`

```
Close shot: a hand holding a road flare low against the inside wall of a wooden crate. The red light rakes across neat rows of thousands of tiny scratch marks covering every inch of the wood. One far corner stays in deep shadow.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/scratched-wall.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/crate.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

### 7E · The fresh stroke ▫️

`public/reels/hangar/img/hangar-v2/shots/35-newest-stroke.jpg`

```
Extreme close-up: one tiny scratch mark with a diagonal stroke cut through it, the stroke bright pale fresh-cut wood against old gray pine, glowing in red light.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/scratched-wall.jpg`

### 7F · The far corner ▫️

`public/reels/hangar/img/hangar-v2/shots/36-far-corner.jpg`

```
Close shot: the far inside corner of the crate, mostly in deep shadow, a few uncrossed marks just catching the red edge of the flare light, the rest of the wall falling into black.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/scratched-wall.jpg`

### 8A · The woods ▫️

`public/reels/hangar/img/hangar-v2/shots/37-far-off.jpg`

```
Wide shot: the dark woods beyond a creek at night, layers of black trunks fading into mist. Empty, nothing visible — no figure, no eyeshine, no shape among the trees.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/backgrounds/wooded-bank.jpg`

### 8B · He hears it ▫️

`public/reels/hangar/img/hangar-v2/shots/38-only-airman-hears.jpg`

```
Close-up: the young airman's face lit red from below by a flare, lips moving as he silently counts, eyes searching the dark woods. Two agents out of focus behind him, staring into the crate.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/airman.jpg`
- `public/reels/hangar/img/hangar-v2/sheets/agents.jpg`

### 8C · Burnout ▫️

`public/reels/hangar/img/hangar-v2/shots/39-flare-sputters-out.jpg`

```
Close-up: a road flare sputtering out in a man's hand, the red light collapsing, the frame falling to black. The hand is in shadow — no face.

Hand-drawn 2D feature animation still, late-1990s traditional cel animation. Clean, confident ink linework with a slight pencil texture. Characters in flat cel color with simple two-tone shadows and appealing, slightly rounded mid-century proportions. Painterly gouache and watercolor backgrounds with visible brushwork, in the spirit of mid-century American magazine illustration. Strong graphic lighting: warm practical light against cool night tones. Restrained, limited palette, atmospheric haze for depth, subtle film grain, cinematic widescreen composition. Small-town Ohio, autumn 1975.
```

Reference plates:
- `public/reels/hangar/img/hangar-v2/sheets/small-props.jpg`

## Consistency checklist

- The airman's corduroy jacket, the trucker's cap and the mom's white cap never change.
- The wagon is always avocado green with woodgrain panels, and its driver's mirror is gone from 4C on.
- The crate's coffee ring, corner brackets and rope handles match in every shot.
- Fog and moonlight hold steady through beats 3 to 5; from 6B on, the flares own the light.
- Nothing in the woods or the crate looks like a figure. If a generation sneaks one in, regenerate: the robot stays unseen.
- No lettering anywhere except what is added in post.
- Beat 1 stays black. A picture there is a generation mistake, not a shot.
