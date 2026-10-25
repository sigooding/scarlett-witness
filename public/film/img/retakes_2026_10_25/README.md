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
