# Automatic cut-outs, 22 October 2026

Made unattended by `tools/auto-cutouts.py` for the pictures of scenes 1,2,72,73,74,75,76 that had no depth move. **Nobody has
looked at them.** Each picture has a review sheet here (`<picture>.jpg`: the picture, its cut-outs on green, the plate
with the people painted out, and the depth map). Look at the flagged ones first; to take one back out, delete its entry
from `docs/film-depth-layers.json` (`pictures` and `peopleInShot`) and the depth fields from its `pictureLook` in
`src/film/studio-edits.json`, then rebuild. Each gets the suggested move: truck, 0.4, over 14 s.

**10 made, 8 flagged, 1 left alone.**

| Picture | Cut-outs | Flags |
|---|---|---|
| [01-backstreet](01-backstreet.jpg) | 1 | cut-out 1 runs to its box edge (may be clipped); 1 person-like shape(s) still found in the plate |
| [03-mara-walks](03-mara-walks.jpg) | 1 | 2 person-like shape(s) still found in the plate |
| [04-mara-phone](04-mara-phone.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [05-phone-off](05-phone-off.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [06-barbershop-doorway](06-barbershop-doorway.jpg) | 2 | 1 person-like shape(s) still found in the plate |
| [07-old-man](07-old-man.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [328-the-scrap](328-the-scrap.jpg) | 1 | 2 person-like shape(s) still found in the plate |
| [383-the-empty-lane](383-the-empty-lane.jpg) | 2 | cut-out 1 runs to its box edge (may be clipped) |
| [02-vending](02-vending.jpg) | 1 |  |
| [329-the-lane-the-watch](329-the-lane-the-watch.jpg) | 1 |  |

## Left alone

- `70-the-call`: its camera is a dolly-zoom (chosen; the engine skips depth there)
