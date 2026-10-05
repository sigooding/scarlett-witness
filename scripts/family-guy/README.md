# Family Guy fan-test assets

The game is `src/data/familyGuy.ts`. The 17 small, ready-to-use files are committed in `public/assets/family-guy/`; Python is **not** required to build or play the app.

The dialogue is original, unofficial fan-test writing. Room/cast images were AI-generated for this fixture. The four WAVs are short synthetic tones, not recordings or imitations of the show's actors. SVG inventory icons are simple local drawings. This test content is not an official/licensed Family Guy game.

## Optional art preparation

```sh
python3 -m venv .venv
.venv/bin/pip install Pillow numpy
.venv/bin/python scripts/family-guy/prepare-assets.py \
  --rooms /path/outside/repo/family-guy-rooms.png \
  --cast /path/outside/repo/family-guy-cast.png
```

Inputs:

- A 2×2 room contact sheet: living room, basement, Clam, yard, in reading order.
- A magenta-backed cast sheet ordered Peter, Lois, Brian, Stewie, with clear vertical gutters between characters.

The script writes four 960×540 WebP backgrounds, four alpha PNG characters, a deliberately simple four-frame Peter test sheet and four synthetic WAVs. It leaves the four authored SVG item icons in place.

Cast extraction uses **transparent column gutters**, not equal quarters. Equal-quarter cropping cuts off a wide Peter and leaves his arm in Lois's tile. If four substantial, separate silhouettes cannot be found, preparation fails rather than silently shipping damaged cutouts.

Keep raw input plates and Python environments outside versioned assets. Changing art is followed by a real-browser visual check; mathematical alpha bounds alone do not establish correct composition. See `docs/studio-ship-check.md` for the game route and test matrix.
