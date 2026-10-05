# Hollywood sprites — shaded/pre-rendered pass 3

This is another **newly created art pass**, not a relabeling of v2 or a set of extracted original game tiles. It targets the original game's shaded/digitized appearance rather than the outlined illustration style of the earlier attempts.

## Visible changes

- Rebuilt both enemy sets from textured, matte, pre-rendered-style creature source plates: rounded flesh, cloth and metal shading instead of hard drawn outlines.
- A substantially stockier Pig Cop with a stretched navy uniform, broad torso, heavy limbs and L.A.R.D. marking.
- A tan, striped Trooper with a green harness, rounded ridged cranium, claws and visible back thrusters.
- Drawn frontal walking poses, instead of v2's procedural front-leg animation. Each enemy still has 24 atlas frames with consistent floor alignment.
- Rebuilt the pistol/shotgun and eight scenery/pickup sprites with the same material treatment. The final pistol pass corrects the generated two-handed grip back to a single-handed normal stance.
- More shade detail: up to 128 colors in enemy/weapon atlases and 96 in props, with native-resolution pixels and binary alpha retained.
- A manually placed, native-pixel C9 stencil keeps the drum label readable.

The engine keeps the same damage, hit points, movement speed, weapon view settings, entity IDs and collision radii. These remain approximations of the original designs, not a pixel-perfect asset replacement.

## Source preparation

```sh
python scripts/hollywood/prepare-sprites-v3.py
```

Requires Pillow and the optional raw plates under ignored `public/img/hollywood-opening/src/sprites-v3/`. Ten generation calls produced nine retained source plates, including a corrected pistol strip. Prepared `*-v3.png` / `*-v3-sheet.png` files and their hash manifest are committed; raw plates are not runtime dependencies.

The preparation recipe is deliberately versioned independently of v2. It handles the actual generated pose layout, including the Trooper's stacked side-collapse/corpse poses, and uses a floor-level corpse for the rear view rather than displaying a narrow top-down sliver as an upright billboard. Profiles use the existing mirrored left/right convention.

Original design references: [MS-DOS sprite index](https://www.spriters-resource.com/ms_dos/dukenukem3d/), [Assault Trooper reference](https://dukenukem.fandom.com/wiki/Assault_Trooper_(DN3D)), and [Pig Cop reference](https://dukenukem.fandom.com/wiki/Pig_Cop_(DN3D)). Reference imagery is not shipped as game artwork.

## Publication and compatibility

V1 and v2 sprite files are retained unchanged. New built-in Hollywood games and new first-person rooms use v3. Older authored or published copies keep their chosen art until explicitly updated.

If an old publication still appears: export it for safety, import the new `hollywood-opening-sprites-v3.reel.json` into the updated Studio, inspect it and Publish. Do not erase all browser storage to get a newer sprite set. The gameplay saves and the authored reel are separate.

The work is committed and pushed on `arena/01a077ce-scarlet-reel`. **PR #60** exposes the full branch for review against `main`; a pushed branch is not automatically a merge into `main`.

## Regression found while testing the art

The portable-copy playthrough exposed an existing rooftop-edge trap: stopping just after the player's center crossed the ledge allowed a fall while the rear of the collision footprint still overlapped the high floor. Subsequent movement was blocked by that floor behind the player.

Support now samples the same footprint as movement collision. A new deterministic regression stops on that exact boundary, waits, then verifies that the player can finish the drop. The published-copy browser route passed after the fix.

## Checks

`npm run test:fps` validates the v3 PNGs, palette/alpha, grounded nonempty frames, animation indices, actual front-walk differences and preserved v2 hashes, as well as the physical gameplay route and edge fix. The FPS browser suite checks the new files in actual play, both enemies alive, save/load/mobile controls and Studio export/import/publish with embedded media.

See [the first-person guide](first-person.md) for engine capabilities and remaining level-fidelity work.
