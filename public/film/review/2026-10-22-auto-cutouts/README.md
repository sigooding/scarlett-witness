# Automatic cut-outs, 22 October 2026

Made unattended by `tools/auto-cutouts.py` for the pictures of scenes 1,2,72,73,74,75,76 that had no depth move. **Nobody has
looked at them.** Each picture has a review sheet here (`<picture>.jpg`: the picture, its cut-outs on green, the plate
with the people painted out, and the depth map). Look at the flagged ones first; to take one back out, delete its entry
from `docs/film-depth-layers.json` (`pictures` and `peopleInShot`) and the depth fields from its `pictureLook` in
`src/film/studio-edits.json`, then rebuild. Each gets the suggested move: truck, 0.4, over 14 s.

**8 made, 5 flagged, 4 left alone.**

| Picture | Cut-outs | Flags |
|---|---|---|
| [76-02-the-empty-umbrella-stand](76-02-the-empty-umbrella-stand.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [76-06-the-screen-goes-dark](76-06-the-screen-goes-dark.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [76-07-the-lighter](76-07-the-lighter.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [82-on-the-floor](82-on-the-floor.jpg) | 1 | 1 person-like shape(s) still found in the plate |
| [84-cries-without-a-sound](84-cries-without-a-sound.jpg) | 1 | 3 person-like shape(s) still found in the plate |
| [315-the-number-pressed](315-the-number-pressed.jpg) | 1 |  |
| [76-01-the-walkway](76-01-the-walkway.jpg) | 1 |  |
| [76-05-vera-honey](76-05-vera-honey.jpg) | 1 |  |

## Left alone

- `70-the-call`: its camera is a dolly-zoom (chosen; the engine skips depth there)
- `74-01-no-one-else-is-here`: nobody found: left as it was, since a missed person would stretch on a depth map alone
- `75-04-the-machines-wait`: nobody found: left as it was, since a missed person would stretch on a depth map alone
- `75-05-static-in-a-window`: nobody found: left as it was, since a missed person would stretch on a depth map alone
