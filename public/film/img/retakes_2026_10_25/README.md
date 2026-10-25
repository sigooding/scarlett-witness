# Retakes 25 October 2026 — director-voted batch (brief §§2–4, partial)

Made to `docs/image-brief-2026-10-25.md`, each picture chosen by the director from a 2-option vote.
**Not wired into the film** (no `src/` changes), per the brief: the maintainer swaps them in after review.
Nothing was overwritten or deleted; rejected versions are kept beside their picture as `--altN`.
Files are saved at the size the generator produced them and were never downscaled. Several are below
1920 wide or not exact 16:9 (1376×768, 1672×941, 1344×768): the agent sandbox had no ffmpeg, so run
`tools/install-film-picture.mjs` (crop to 16:9 / enlarge to 1920×1080) when swapping them in.

## Made (director's picks)

- `montage18-01-r1.jpg` (2a) 1376×768 — desk in room-master orientation, Jack at right end, no window
  reflection. Flag: the open sketchbook reads as a large ledger with faint unreadable scribbles.
- `271-not-yet-r1.jpg` (2b) 1376×768 — desk and hand-on-closed-sketchbook correct. Flags: Vera standing
  at the left end rather than seated; one mug instead of two paper coffee cups; reads as night, brief
  asks flat grey day.
- `194-he-holds-it-without-drinking-r1.jpg` (2d) 2096×1184 — redone after first pick lost Jack's desk:
  the broad walnut desk and green lamp are back (edited from room master 164), grey daylight, both paper
  cups, closed sketchbook. Flag: Vera's empty chair is cropped at the bottom-left edge.
  `194-...--alt1.jpg` = rejected first pick (slim table, no lamp).
- `249-the-line-r1.jpg` (2e) 1672×941 — receiver at ear at the correct (right) end of the desk. Clean.
- `204-the-tea-she-does-not-want-to-pour-r1.jpg` (3a) 2848×1600 — altar on the RIGHT, Mrs Sakai left,
  Jack right with back to altar. Flags: Jack's back is square to camera; a second teapot sits on the kotatsu.
- `354-the-altar-photograph-r1.jpg` (3b) 1376×768 — Jack added kneeling right, altar/TV right. Flag:
  her gaze lands on Jack more than clearly past him to the photograph.
- `364-the-kotatsu-r1.jpg` (3c) 1376×768 — empty room, altar right, TV on (pale glow), teacup on its side. Clean.
- `207-the-pink-payphone-r1.jpg` (4a) 1672×941 — exactly one pink handset (at his ear, cradle bare, no
  other phone) AND Mr Noda's desk restored in the right foreground as in 176, Noda asleep behind it
  (director's note in session: "the desk in the inn"). Flag: handset is held low at the mouth.
  `207-...--alt1.jpg` = rejected (second handset still hanging). `207-...--alt2.jpg` = rejected
  (one handset fixed, but desk still missing).
- `538-the-receipts-in-his-hand-r1.jpg` (4b) 1344×768 — one pink handset, receipts in the other hand, desk
  restored. Flag: framing came out as the wide lobby shot (like 207), not the original tight close-up.
- `376-the-coins-run-out-r1.jpg` (4c) 1672×941 — pink handset (no black receiver), exactly two arms, bare
  coin tray, desk restored.
- `177-behind-the-counter-r1.jpg` (4f) 2848×1600 — lobby/desk as 176, Noda dives behind desk (chair
  tipping), masked gunman fires into ceiling, plaster falling. Flag: muzzle flash makes the weapon read
  as an unsuppressed pistol.
- `210-the-third-time-r1.jpg` (4h) 2848×1600 — Jack's long wet overcoat restored; frame/glass moment kept.
- `213-clutch-each-other-r1.jpg` (4i) 2784×1504 — Mr and Mrs Noda clutch each other in the pantry doorway as Jack
  shuts the door. Flags: calmer/less tilted than "rushed"; torch beam appears to come from behind the couple.

## Not made / still to do

- §1 (1a–1g) Kurose's car / Ishida shots — **skipped at the director's request** ("they're not coming out right").
- 2c `87-he-writes-nothing`, 4d `460-parked-crooked` (twice), 4e `175-the-curtain-gap`,
  4g `178-staff-side`, 4j `462-a-finger-to-his-lips` — generated as vote pairs, director selected neither;
  need fresh attempts.
- All of §5 (5a–5u) — not reached in this session.
- Depth layers for any of these that carry them in the film today (see `docs/director-picks-2026-10-25.md`)
  have not been remade.

## Check by the film's maintainer, 25 October

Each picture was compared with the picture it replaces, the shots either side of it and its brief entry.

**Ready to swap in (9):**

| Picture | Check |
|---|---|
| `montage18-01-r1` | Desk the room master's way, no reflection, night. Good. |
| `194-...-r1` | Desk, daylight, paper cups right. One small thing: the sketchbook is dark green; it is cream in 271 and elsewhere. |
| `249-the-line-r1` | Clean. |
| `354-the-altar-photograph-r1` | Jack added, altar right. Good. |
| `364-the-kotatsu-r1` | Clean; matches 365-r1, which plays next. |
| `207-the-pink-payphone-r1` | One handset, two arms, the desk restored. Good. |
| `376-the-coins-run-out-r1` | One handset, two arms, the tray bare. Good. |
| `177-behind-the-counter-r1` | Good. One note: the gunman fires a pistol with a big flash where the script has a suppressed burst. |
| `210-the-third-time-r1` | The coat restored, nothing else changed. Good. |

**Another go needed (briefed as section 6 of `docs/image-brief-2026-10-25.md`):**
- `271-not-yet-r1`: Vera stands, though the script says "She sits"; one mug, not two paper cups; and it is night, in a day
  scene, between two day shots.
- `204-...-r1`: the altar is fixed, but Jack kneels with his back to the camera, facing the wall rather than her. (The brief's
  "his back to the altar" was ambiguous; now reworded.)
- `213-clutch-each-other-r1`: the torch beam comes from inside the pantry, behind the couple.
- `538-...-r1` (optional): right, but it came out as the same wide shot as 207 and lost its close-up on the receipts.

**When swapping in:**
- Eight are under 1920 wide. Give them the Topaz upscale the 17 small pictures had on 25 October rather than a plain enlarge:
  `montage18-01`, 271, 354, 364 and 538 are about 1376×768; 207, 249 and 376 are 1672×941.
- 354 and 364 carry depth layers in the film today (354 cut-outs, 364 a map); make them again for the new pictures.


## In the film, 25 October (later)

The director said yes to the nine above. They are in the film at their old paths, and each old picture is archived first
(`public/film/img/archive/…`).
- **Upscaled with Topaz first:** the six under 1920 wide (`montage18-01`, 354, 364, 207, 249, 376), with the same settings as
  the 17 small pictures that morning.
- **In as they were, cropped to 16:9:** 194, 177 and 210.
- **Depth:** 354's cut-outs were made again from the new picture, now one for Mrs. Sakai and one for Jack. 364's depth map was
  made again too. Both moves were recorded and checked.
- **Record:** `docs/film-picture-upscales-2026-10-25.json`, under `retakes_2026_10_25`.

## Kurose's car (section 1), tried by the film's maintainer, 25 October

The director: "the image generator had trouble doing ishida and kuroso in car do you want to try".
- **How:** GPT Image 2.5 (Sunburst) at its largest size, 3840×2160, against the brief's references, on ElevenLabs flow
  `dsQZzfGrpAo1mBCv7fCI` ("Nobody's Witness: Kurose's car (scenes 93-94)").
- **Cost:** eleven pictures, 14,144 credits. Then the account ran out, with 659 credits left. A 4K picture costs 1,100 to
  1,600, so 1b and most second takes were never made.
- **Not in the film.** The brief's sequence moves 141 and adds 94-01. These go in together once 138 and 139 exist and the
  director has seen them.

| File | Item | Check |
|---|---|---|
| `137-he-knows-this-car-r1.jpg` | 1a | The coat is gone: the charcoal jacket and grey shirt, soaked. Nothing else changed. Good. |
| `140-where-are-we-going-r1.jpg` | 1d | From the road across the car's roof. Ishida, no coat, looks up at the one lit window on the second floor, a figure at a desk in it. Good. Two notes: he stands just forward of the open door rather than in its doorway, and the split lip doesn't show at this distance. |
| `94-01-the-clean-hand-r1.jpg` | 1e | The steel cup held out across the empty seat, with steam and the black-strap watch. But Kurose's face is in full light, where the brief kept it in shadow. Usable if the director doesn't mind seeing him here. |
| `141-he-drinks-r1.jpg` | 1g | 141 with the model's watch (black leather strap) and a small split on Ishida's lip. Good. |
| `368-the-door-closes-r1.jpg` | 1f | Ishida screen-left with the cup in both hands, eyes down, the split lip. Kurose screen-right looking straight ahead, hands folded, the watch showing. The seats match 141. Good. `--alt1` is the same with Kurose's eyes lowered. |
| `139-only-tea-r1.jpg` | 1c | **Not right.** The door now hinges at its front edge and the near seat is empty, but the car is the other way round, its left side at the kerb. That puts Kurose behind the driver, on the side 141 gives Ishida. Ishida also wears a long coat again. |

**Tried and not kept** (ids on the flow):
- a second 137, the same as the first (`kqqvFOLX04LNvgkD8w4b`);
- two edits of the current 139, which kept the door hinged at its back (`vk6WsL2GC6EbcWvvuSuf`, `gFlW8wAhAE1wOWVbhZMH`);
- a second fresh 139, turned round like the one kept and with Kurose in the near seat (`KFgqqguSXU5pkyd9TDOG`).

**Kept ids:**
- 137 `SxftewwtmLfUHTsOm8pl`;
- 140 `POTqUMyvFCzK0YBwenrG`;
- 94-01 `0Q2h8ZNzXShXuYTA2k19`;
- 141 `YmGriq85Zm13cniQBms9`;
- 368 `GVc8c6hCCeu0Ox1XXPcR`, alt `rPyBRRK86juCrNDtQWYL`;
- 139 `09KusjBoEqPbfUQpn1br`.

**Still to make:** 1b (138, an edit of `137-he-knows-this-car-r1.jpg`, now that it exists) and 139 again. The next 139 should
leave the door out of frame: the generator turns the car round whenever the door is in shot. Both are briefed as 6e and 6f in
`docs/image-brief-2026-10-25.md`.

## Second batch, 25 October (evening): from-scratch car set with tinted glass, and the §6 retakes

Director's two new instructions for this batch:
1. **The car has dark tinted windows in every exterior.** The old attempts kept failing because edit models inherited the
   clear-glass look (and, for 139, the wrong door hinge / car orientation). So these were all **generated from scratch** — no
   previous car still used as a base — with only the character sheets (`sheets/ishida*.jpg`, `sheets/kurose.jpg`) attached as
   references, to hold faces and wardrobe. The tint, the seat lock and the camera side are written into every prompt.
2. **Keep character consistency:** Ishida and Kurose are matched to their sheets in every new picture.

The first, edit-based attempts from this session were rejected by the director ("images are bad … generate from scratch") and
are kept beside the new ones as `--alt1-edit.jpg`. Nothing was overwritten or deleted. Per the director, the new files are
**not cropped or resized**; they sit at the generator's native size (mostly 1376×768, so a Topaz/house upscale is still owed
at install time, as for the small 25-October pictures). None is wired into the film — no `src/` changes.

### Car set (brief §1 and §6e–6g), all with dark tinted glass on the closed windows

| File | Item | Result / flags |
|---|---|---|
| `137-he-knows-this-car-r2.jpg` | 1a, from scratch | Ishida in his sheet face/wardrobe, no coat, soaked; black saloon nose-left at the kerb, all doors shut, rear and side glass near-black and reflective. Blank number-plate panel. Station reads as the same concrete station but is a fresh design, not pixel-matched to the old still. |
| `138-the-door-opens-r1.jpg` | 1b / 6f | Same from-scratch set-up as the new 137. Every near-side door shut; faint amber behind the tint and a warm light spill under/behind the car onto the wet pavement, per "the door opens on the far side". No open door visible. |
| `139-only-tea-r2.jpg` | 1c / 6e | **The four-time failure, now right.** Open doorway fills frame, the open door itself out of shot; near half of the back seat empty (armrest down); Kurose on the far side by the far window, facing the front (right of frame), face in shadow, white hair catching amber; driver's dark silhouette at the right edge; closed glass tinted. Side-on exterior rather than a strict over-shoulder, which is what finally kept the car from turning round. |
| `94-01-the-clean-hand-r2.jpg` | 1e / 6g | Steel cup with steam held across the empty near seat, black-leather-strap watch, white cuff; Kurose's face now in deep shadow (the 6g fix), only his hair lit; closed windows tinted; rain through the doorway. |
| `140-where-are-we-going-r2.jpg` | 1d, from scratch | Across the wet roof, nose-left; windscreen and side glass tinted; open rear door only as a frame above the roofline at right with amber below it; Ishida three-quarter, looking up at the one lit second-floor window with a figure at the desk. |
| `142-taillights-r1.jpg` | new, outside the brief | The saloon driving away down the rain alley (scene 95) remade so its rear and side glass are opaque tint — no driver or interior visible — keeping the taillights and red light trails. |

The tint cannot apply to the interior two-shots `141-he-drinks-r1` and `368-the-door-closes-r1` (the camera is inside the
car); they already pass their checks and keep clear glass, which is correct for an in-car viewpoint.

### §6 second attempts

| File | Item | Result |
|---|---|---|
| `271-not-yet-r2.jpg` | 6a | Now grey DAY (no lamp lit, daylight train through the blinds), Vera **seated** at the desk's left end in her dark coat and cream knit, Jack at the right end with his hand on the closed sketchbook, **two paper cups**, one each. Face matches the Vera sheet. |
| `204-the-tea-she-does-not-want-to-pour-r2.jpg` | 6b | Same room/altar-right composition; Jack now kneels upright at the right of the kotatsu in right profile, facing Mrs. Sakai across it (as 273 has him), not facing the wall. |
| `213-clutch-each-other-r2.jpg` | 6c | Pantry behind the couple now black, no torch inside; the torch beam enters from off-frame behind the camera (corridor side) across the kitchen wall and Jack's shoulder; the couple clutch each other. |
| `538-the-receipts-in-his-hand-r2.jpg` | 6d | Tight close-up restored (receipts fanned in his hand, pink phone, coin tray); one pink handset at his ear on its coiled cord, empty cradle, no second receiver. |

## Third batch, 25 October (night): third attempts, for review only — nothing installed

Another from-scratch round addressing the weaknesses left in the second batch. All seven are saved beside the earlier
takes, not cropped or resized (native 1376×768; 213-r3 is exact 16:9 at 1376×768), and nothing under `src/` changed. The
director reviews and picks before any install.

| File | Item | Result / flags |
|---|---|---|
| `137-he-knows-this-car-r3.jpg` | 1a, third attempt | Wider street view, fully opaque black tint on every window, all car doors shut, Ishida sheet-consistent and soaked. **Flag: the station's own glass entrance door is standing open** (no car door is). The r2 keeps the entrance shut and may be the safer pick; r3 is the stronger car/tint. |
| `138-the-door-opens-r2.jpg` | 1b/6f, second attempt | Fixes r1's interior bleed: the glass is now solid black with nothing visible through it; the "door opens on the far side" reads only as an amber pool on the wet road around the rear of the car. All near doors shut. |
| `139-only-tea-r3.jpg` | 1c/6e, third attempt | Tighter, more cinematic crop of the same correct geography: doorway fills frame, no door panel, empty near seat with armrest down, Kurose far side facing the front (right), face in shadow, driver silhouette at right, opaque tint on the closed glass. No new faults seen. |
| `94-01-the-clean-hand-r3.jpg` | 1e/6g, third attempt | Stronger shadow on the face, black-strap watch and steaming steel cup clear, empty near seat, opaque tint. **Flag: he reads as half-risen/crouching at the doorway rather than seated leaning across, and the open door's edge intrudes at the bottom-right corner.** r2 keeps him seated and door-free; r3 has the better mood and watch. |
| `140-where-are-we-going-r3.jpg` | 1d, third attempt | Fixes r2's hatch-like raised panel: the open door now stays below the roofline and reads only as a warm amber rectangle low at frame right; tint fully opaque; Ishida three-quarter looking up at the one lit window, figure at the desk visible. |
| `142-taillights-r2.jpg` | scene 95, second attempt | Fixes r1's over-saturated stylized grade and busy signage: muted film-still colour, blank unreadable lanterns and neon, neutral vending machine, opaque rear/side glass, same taillights and red trails. |
| `213-clutch-each-other-r3.jpg` | 6c, third attempt | Fixes the beam direction decisively: the pantry behind the couple is pitch black and a torch cone now enters head-on from off-frame behind the camera, lighting the door frame and the couple's shoulders; they clutch each other, Jack is mid-shove with the coat swinging. **Flags: the torch body peeks into the very bottom-left edge (brief said keep the torch itself out of frame), and a small dark cylindrical wall fitting behind Jack's head could misread — check at review.** |

### Recommendation for the review (not a decision)

- Prefer **137-r2** (shut entrance) unless the wider street of r3 is wanted; **138-r2**, **139-r3**, **140-r3**, **142-r2** and
  **213-r3** are the strongest of their sets; for **94-01** choose r2 for seating/door correctness or r3 for mood.
- The second-batch §6 retakes **271-r2, 204-r2, 538-r2** had no identified faults and were not regenerated.

### Still open after this batch

- Director's review/vote on the from-scratch car pictures (now r1–r3 where they exist) and the §6 retakes before any are installed.

## Fourth batch, 25 October (night): brief §5, the remaining retakes — part 1 (5a–5j)

Made from the briefs in `docs/image-brief-2026-10-25.md` §5, character sheets attached for faces, native sizes, nothing
installed. The per-turn image limit cut the batch at ten pictures; 5k (469) and 5l (231) did not generate and lead part 2.

| File | Item | Result / flags |
|---|---|---|
| `m1-neon-backstreet-r1.jpg` | 5a | Crisp empty rain-soaked Kanda alley, vending machine right, lanterns/neon with no readable writing, deep perspective. Clean. |
| `384-the-room-too-big-r1.jpg` | 5b | Normal-lens lived-in room, Vera at the low table, cabinet/lamp/photo/umbrella left, CRT right. **Flag: a black smartphone lies on the table — period-anachronistic; remove at review/next pass.** Two cups present. |
| `419-twenty-years-r1.jpg` | 5c | Face/hair rebuilt to the Jack sheet (grey-streaked swept-back hair, stubble), office/lamp/phone/rain window kept. Clean. |
| `246-the-can-r1.jpg` | 5d | The dropped can is now a short dark-brown/cream steel coffee can, unopened, no label; everything else kept. Clean. |
| `285-the-inside-pocket-r1.jpg` | 5e | Correct counter end by the ticket machine, cook and tile arch, Vera soft at frame edge. **Flag: his hand is up at his chest/lapel rather than resting on the counter near it; close to the "doesn't touch the pocket" intent but worth a look.** Some menu sheets carry faint unreadable print. |
| `349-paid-to-listen-r1.jpg` | 5f | Same seat, turned to Vera in the near foreground, bowl and cup on the counter, cook behind. Clean. |
| `445-exactly-where-it-was-r1.jpg` | 5g | Jack now photographic, not painted; storeroom/bulb/flour sacks/scoop kept. Checked against `s84/520-excuse-me.jpg`: the drawing's "EXCUSE ME" caption and the sack's "FLOUR" stencil both exist in the in-film reference, so they match. **Only flag: an added "1:07" on the drawing that 520 does not have.** |
| `289-for-making-me-r1.jpg` | 5h | Note count reduced to a small folded pair. **Flag: the notes read as US dollar bills, not Japanese yen.** |
| `374-the-dead-television-r1.jpg` | 5i | Vera crouched among beer crates looking up at the high shelf CRT; screen dark grey, switched off, no reflection of her face. Clean. |
| `montage53-05b-light-off-r1.jpg` | 5j | The one lit window is now dark like every window of the building; rain and framing kept. Clean. |

## Fifth batch, 25 October (night): brief §5 part 2 (5k–5u) — §5 now complete

**Orientation fix.** The director reported portrait outputs. Those were the *rejected* options of the two-option votes and
were discarded; every saved file was re-measured and is landscape, 1.77–1.79:1. From this batch on every prompt opens with
"WIDE 16:9 HORIZONTAL LANDSCAPE FILM FRAME — strictly horizontal, never portrait or square". 469, 231 and 232 were made as
votes; the director picked 469 option 1, 231 option 1, 232 option 2. Rejected alternatives are not kept on disk.

| File | Item | Result / flags |
|---|---|---|
| `469-what-they-are-told-r1.jpg` | 5k, voted | No glasses on her face; the pair is held in her hand at chin level. **Flag: the frame is a wider newsroom set-up with wall TVs, not the original desk close-up.** |
| `231-the-box-r1.jpg` | 5l, voted then superseded | Director: "tape and book too small". Kept as the small-alt. `231-the-box-r2.jpg` is the working take: the SHIOHAMA cassette in its cracked case and the plain black notebook now dominate the frame on the perforated bench, torn padded envelope in his hands, no cardboard box. |
| `232-the-wine-red-dress-r1.jpg` | 5m, voted | Held, not worn: the wine-red slip hangs over her cream knit by its straps, knit collar/sleeves visible; mirror framing, bed/box/window/lamp behind. Clean. |
| `70-the-call-r1.jpg` | 5n, superseded | Face/dress consistent, but chest-up and reads seated. `70-the-call-r2.jpg` is the working take: wide, she is mid-rise off the bar stool, receiver to ear, one hand on the bar; the phone is now a period corded bar phone (no mobile), pianist/clock/bottles kept. |
| `73-09-she-cannot-breathe-r1.jpg` | 5o | Original rain-street frame and pose kept exactly; the black mascara streaks are gone, only faint under-eye smudges. Clean. |
| `88-the-walkway-r1.jpg` | 5p | Last door closed, bare doormat, nobody in frame; dawn walkway, dripping rail, rail lines beyond. Clean. |
| `106-play-r1.jpg` | 5q | Same silver-grey portable recorder as 105/509 (tape window left, round speaker right, red piano key), white cuff pressing PLAY, journalist photo frame beside it. Clean. |
| `512-he-hasnt-stopped-r1.jpg` | 5r | Harada and Vera both turned to the glass office, where Jack talks with a moving hand. Note: Harada keeps her glasses here — the no-glasses note applies only to 469. |
| `519-not-all-right-r1.jpg` | 5s | Hair in a low loose bun with loose strands, white collared shirt under the dark coat, storeroom/bulb/drawings/cloth bag kept. Clean. |
| `303-he-left-a-statement-r1.jpg` | 5t | Same room language as 143: windows right, serving hatch/clock back wall, steel desks; young detective with receiver, open box and radio on the desk. Clean. |
| `161-stool-three-r1.jpg` | 5u | Exactly two natural legs; Vera lowering onto the stool on Jack's LEFT (between him and Kaneko), red bird clip in place. Kaneko matches her sheet (elderly woman, cardigan/apron). **Flag: the location's hand-painted kanji sign is legible, as it is in the s100 plates; confirm that stays.** |

### Remaining after §5

- The five unchosen retakes, fresh attempts: 2c `87-he-writes-nothing-r1`, 4d `460-parked-crooked-r1`, 4e `175-the-curtain-gap-r1`,
  4g `178-staff-side-r1`, 4j `462-a-finger-to-his-lips-r1`.
- Small faults in pictures already in the film (no scene rebuilds): 194 cream sketchbook, 177 suppressed burst without flash,
  207 handset up at the ear, 354 Mrs. Sakai's gaze past Jack to the altar photo.
- Director's review of all parked takes before any install; then upscale + `install-film-picture.mjs`, depth remakes (374,
  73-09, 512, 460), and the story.json/lamp-glow wiring from the 25-October handoff.

## Sixth batch, 25 October (night): first three unchosen retakes, director-voted

Made as two-option votes; rejected options were discarded by the vote tool and are not on disk. All three saved files
verified landscape 16:9.

| File | Item | Vote / flags |
|---|---|---|
| `87-he-writes-nothing-r1.jpg` | 2c | Director picked option 2 (2848×1600). Correct room-master layout: Jack side-on at the desk's right end facing left, green lamp at the left end, rotary phone, CRT on the filing cabinet, railway through rainy blinds, blood in his knuckles. **Flags: the notebook on the kraft envelope is dark green — same cream-sketchbook issue noted for 194; and the pen tip nearly touches the paper where the brief has it held still above, not writing.** |
| `460-parked-crooked-r1.jpg` | 4d | Director picked option 1 (1376×768). Both characters restored: Jack in the back doorway in his long coat, back three-quarters, head shaking; Mrs. Noda on the step offering the cigarette pack; muddy yard, farm-track gate, old pickup parked crooked under the pole lamp in rain. Clean. (Maintainer: move its quote to "She offers the pack anyway.") |
| `175-the-curtain-gap-r1.jpg` | 4e | Director picked option 1 (1672×941). Curtain edge and fingertips in the foreground, four black saloons in an arc facing the inn with headlights glaring, rain only inside the beams, eight masked men stepping out and splitting up, nothing beyond but darkness and the highway. Clean. |

### Still queued

- 4g `178-staff-side-r1` and 4j `462-a-finger-to-his-lips-r1` (the last two unchosen retakes).
- The four small in-film faults: 194 cream sketchbook (the same green-book issue appears in the new 87), 177 suppressed
  burst, 207 handset height, 354 gaze.
- Review, upscale, install, depth remakes and wiring as above.
- At install: upscale the sub-1920 pictures (Topaz, as the morning batch had), then `tools/install-film-picture.mjs`; the
  story.json/`studio-edits.json` wiring in the 25-October handoff still applies (94-01 new step, 141 moved onto "Ishida gets
  in. The door closes.", 368 quote trimmed, lamp glows re-placed for 139/140).
- §5 (5a–5u) and the unchosen 2c/4d/4e/4g/4j retakes remain unmade; 161's extra leg, 303's office and 519's bun among them.
- Depth remakes (374, 73-09, 512, 460, and 354/364 if their new takes change again) still wait on the final pictures.

## Tinted-window car retakes, director-voted (25 October 2026)

The director requested retakes with voting, tinted car windows, and consistent characters. Three distinct shots were
made with two-option votes; originals were not overwritten. These are review takes, **not installed in the film**.
Generator was asked for its largest landscape 16:9 output; files are preserved as delivered, without resizing.

| File | Vote | Continuity instructions / references |
|---|---|---|
| `137-he-knows-this-car-r4.jpg` | Option 2 | Edit of 137-r3, with Ishida's body and face sheets attached. Dark smoked glazing hides occupants; all doors shut; no raincoat. |
| `138-the-door-opens-r3.jpg` | Option 1 | Uses the selected 137-r4 plus Ishida's body and face sheets. Same setup and opaque tint; only far-side pavement light changes, visible doors stay shut. |
| `139-only-tea-r4.jpg` | Option 2 | Selected 137-r4 for car/look plus Ishida body/face and Kurose sheet. Close doorway crop excludes hinge/door panel; near seat empty, Kurose far rear-left; tinted background glazing. |

Remaining work: review full-resolution outputs for geometry/identity, continue the other requested retakes and car
continuity shots (140, 94-01, interiors and 142 as needed). Film installation, dimension checks/upscaling, story wiring
and any depth rebuilds remain pending. No application code or live-film assets were changed in this batch.

## Next three tinted-window continuity shots (25 October 2026)

Director requested storage only: no overwrite, deletion or installation. Saved original generator outputs at new paths:

| File | Vote | References / intended continuity |
|---|---|---|
| `140-where-are-we-going-r5.jpg` | Option 2 | Selected 137-r4 plus Ishida body/face sheets; outside looking up at station, opaque tinted glazing. |
| `94-01-the-clean-hand-r4.jpg` | Option 1 | Selected 139-r4, Kurose sheet, model-hand/watch reference; near seat empty, tea offered across it, black leather watch strap. |
| `141-he-drinks-r2.jpg` | Option 2 | Ishida body/face, Kurose sheet, selected 139-r4 cabin, watch reference; inside looking back, Ishida screen-left, Kurose screen-right, dark tinted windows. |

All prompts requested largest available landscape output. No resizing or film installation performed.
The vote tool returned selected files only; its documented “Unselected files” folder was not found under /home/user,
so unselected candidates could not be copied into the repository. Do not describe them as preserved locally.
Full-resolution quality/dimension checks and remaining retakes are pending.

## Later inn shots, director-voted (25 October 2026)

Storage only; new filenames, no overwrite, deletion, resizing or film installation. All three votes selected option 2.

| File | Brief | References / requested correction |
|---|---|---|
| `177-behind-the-counter-r2.jpg` | 4f follow-up | Existing 177-r1, lobby 176, masked-man and Mr Noda sheets. Suppressed upward burst without muzzle flash, same desk and character continuity. |
| `178-staff-side-r1.jpg` | 4g | Lobby 176, selected 177-r2, masked-man sheet. Souvenir case shattering, masked gunman advancing toward stairs, Noda hidden, CRT baseball. |
| `462-a-finger-to-his-lips-r1.jpg` | 4j | Original 462 and Jack face/body sheets. Natural vertical shushing finger, intact vending machine before later gunfire. |

Largest available landscape resolution requested; delivered files retained unchanged. Detailed visual/dimension review
remains pending. Vote tool returned selected files only, not local paths for rejected alternatives.

### 462: looser original-shot reference

`462-a-finger-to-his-lips-r3.jpg`: director selected option 1. Original s45/462 supplied only as loose framing/location/
atmosphere reference, plus Jack face/body sheets. New prompt allowed stance, head angle and framing changes and requested
fresh hand/wrist/arm anatomy rather than preserving the faulty original gesture. Stored as delivered under a new filename;
no overwrite, deletion, resizing or installation. Previous sheets-only r2 vote selected neither option and saved no file.

**Director review of 462-r3:** still has two right hands. This take is faulty, retained for review/history only,
not approved for installation. Director requested merging the stored assets as-is without further generation.
