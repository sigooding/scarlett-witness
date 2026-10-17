# s1_retakes: scene 1 retakes against the v2 Mara face

Retakes of the five scene 1 shots flagged against the **v2 Mara sheet**
(`../s1_new/style-sheets/mara-voss.jpg`, 17 October 2026), which locks the face of the Hive scenes:
24 years old, soft oval face, clear light-blue eyes, fair skin, long wet **golden-blonde** hair
(centre parting, darker roots), red enamel songbird clip above her LEFT temple.

The five source frames in `../s1/` show an older, thinner-faced Mara with dark-honey hair:

| Source frame | Problem |
|---|---|
| `../s1/03-mara-walks.jpg` | hair shows, too dark |
| `../s1/04-mara-phone.jpg` | face shows clearly, old face / dark hair |
| `../s1/14-she-kneels.jpg` | face shows clearly, old face / dark hair |
| `../s1/329-the-lane-the-watch.jpg` | hair shows, too dark |
| `../s1/330-the-red-clip.jpg` | face shows clearly, old face / dark hair |

## How these were made

Each take was generated from the v2 references (`../s1_new/style-sheets/refs_v2/mara-front.jpg`,
`mara-face.jpg`, `mara-face-close.jpg`, plus `../s1_new/style-sheets/mara-voss.jpg` on the first
pass), with the old frame passed alongside **as a layout reference only**, so each retake keeps the
old shot's camera and staging one for one. Nothing here is installed into the film; `../s1/` is
untouched. House format on install: `tools/install-film-picture.mjs` (never downscales). These
frames stand at the generator's 1376×768 and will be enlarged to 1920×1080 at install time.

## Status

| File | Status | Notes |
|---|---|---|
| `03-mara-walks.jpg` | **accepted** | Landscape restored (the first take came out portrait). Geography correct: vending machine LEFT, barbershop/awning/pole/scooter/crates RIGHT, crosswalk out. Arms folded, no umbrella, Boston bag on a long strap from the left shoulder. The awning lettering is the usual faint plate-B shop name. |
| `04-mara-phone.jpg` | **needs one more take** | Screen reads VERA cleanly and the clip is at her left temple, but the face still trends older and thinner than the refs (the old frame keeps pulling the likeness) and the gold watch sits on the phone-hand wrist; the watch is left-wrist only. To redo from the refs alone, without the old frame. |
| `14-she-kneels.jpg` | **accepted** | Old man in the putty-beige vinyl raincoat, cap by his head; bag open, strap torn, purse/passport/keys spilled. Phone raised is a blank glow — no text, after the first take produced garbled screen letters (the same failure as the old `04`'s "VEBA"). Watch on her LEFT wrist. |
| `329-the-lane-the-watch.jpg` | **accepted** | Full night overhead now (the old frame graded dusk-bright; README records the same note). Hair reads golden blonde with the clip catching light at her left temple; watch face at about 12:45; barber pole a blur at the left edge; amber bar glow far down the lane. No legible signage. |
| `330-the-red-clip.jpg` | **needs one more take** | Composition and the lit red clip are right, but the face is still leaner/older than the refs and the hair too dark-honey for a shot whose whole point is the face. To redo from the refs alone, as with `04`. |

The two frames still to take (`04-mara-phone`, `330-the-red-clip`) will be regenerated next session
with the same references and **no** layout plate, keeping the accepted shots' staging.

## Not done here, on purpose

- Nothing swapped into `../s1/`, and `src/film/story.json` untouched — the film still plays the old
  pictures.
- No depth-map work. If `../s1/` frames are ever replaced, `01`, `02`, `329`, `332` and `383` need
  maps remade from the new picture (`tools/make-depth-layers.py`), and shot 14's lip-synced clip
  needs remaking from the new still.
