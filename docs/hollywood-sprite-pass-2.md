# Hollywood opening — classic sprite pass 2

This pass replaces the prototype's most visible sprites with **new art closer to the original 1996 designs**, not extracted original game tiles. The level, damage, enemy health, ammo counts and collision radii are unchanged.

## What changed

- **Assault Trooper:** pale tan striped skin, exposed ridged cranium, green torso harness, compact hand blaster, claws and a visible rear jetpack, instead of the bulky ochre suit/rifle.
- **Pig Cop:** brown-grey skin, broader silhouette, torn navy uniform, badge and pale bristles, rather than the smooth pink character in a black tactical vest.
- **Native pixel sprites:** 96×96 enemy frames, 24 frames per atlas, 64-color maximum and binary alpha. Correctly ordered front/left/back/right rows, grounded feet and two-frame collapse/death sequences. The matching left profile is mirrored from the right.
- **Weapons:** new 128×128 pistol/shotgun view frames, cleaner forward perspective, grey metal and tan hands. Smaller, more centered framing is authored per weapon, not hardcoded into every game. The pistol's recoil keeps the forward sight line rather than rotating sideways.
- **Props/pickups:** new C-9 drum, medical box, armor, narrow pistol magazine, shell tray, shotgun pickup, popcorn cabinet and arcade cabinet.
- **Animation:** stationary guards no longer keep playing a walk cycle just because they have been alerted.

There are **12 new versioned PNGs**, plus `sprites-v2-manifest.json`. Nine source plates were generated. The additional frontal-walk request failed at the image limit; the frontal gait therefore uses small leg movements from the new forward-facing idle pose. This avoids the generator's incorrect side-facing front-walk frames. A later art pass can replace that gait with more hand-authored frontal frames.

Visual references were checked against the [original Assault Trooper description/sprite](https://dukenukem.fandom.com/wiki/Assault_Trooper_(DN3D)), [Pig Cop description](https://dukenukem.fandom.com/wiki/Pig_Cop_(DN3D)), and [classic enemy sprite index](https://dukenukem.fandom.com/wiki/Enemies_in_Duke_Nukem_3D). Reference downloads and generation inputs are not shipped as game art.

## See the new art rather than an old publication

New built-in Hollywood games and newly created first-person rooms use the v2 assets. Existing Studio drafts/publications still take precedence over built-ins, intentionally.

**If you previously published the old game:** export it as a backup, import the new `hollywood-opening-sprites-v2.reel.json` into the updated Studio, review it, then Publish. Do not clear all browser storage or reset unrelated author work. Gameplay save files remain separate from the authored reel.

The new `*-v2-sheet.png` and `*-v2.png` paths prevent an old draft with 128/256-pixel frame settings from accidentally loading the new 96/128-pixel atlas layout. V1 assets remain unchanged and available.

## Studio weapon framing

**Stage → First-person tools → Weapons & player** now includes:

- View scale — scales the on-screen weapon, not its damage or collision.
- View horizontal offset — normalized screen coordinates; 0 is centered.
- View vertical offset — normalized screen coordinates; negative is lower.

The new presets use these values to reduce weapon obstruction. An omitted `weapon.view` preserves the previous renderer's exact framing, so older authored reels are not silently repositioned. The values are exported, validated by Check and covered by the real Studio export/import/publish regression.

## Preparation and testing

```sh
# Optional asset preparation; requires the ignored source plates and Pillow.
python scripts/hollywood/prepare-sprites-v2.py

# Fast regression and real FPS workflows.
npm run test:fps
npm run test:browser -- scripts/browser/fps.spec.ts
```

`prepare-assets.py` remains the **v1** pipeline. The v2 script never overwrites those files. New raw inputs are in ignored `public/img/hollywood-opening/src/sprites-v2/`; the prepared PNGs are committed and sufficient to run the game.

`npm run test:fps` includes native PNG decoding without a new dependency. It checks atlas dimensions/hashes, nonempty frames, foot baselines, valid animation indices, color limits, binary alpha/no magenta spill, mirrored directional rows, legacy atlas availability, stationary/attack/death animation selection and old/new weapon view transforms.

The FPS browser suite also checks that the new files are requested, captures both enemy types alive, completes the newsstand-to-exit route, exercises saving/mobile controls, and tests the weapon-framing control through Studio export/re-import/Publish with the original art directory blocked.

The engine/map limitations from [the first-person guide](first-person.md#next-fidelity-pass) still apply. This is a sprite-fidelity improvement, not a claim that the original level is now pixel-perfect.

## Verification

- Setup check: 833 playable local asset paths present.
- TypeScript, full `npm test` Node/DOM chain, production build, lint and whitespace checks: passed.
- Focused FPS suite: **30 checks passed**, including six new art/presentation groups.
- All **three FPS browser workflows passed**, including alive-enemy screenshots, the full newsstand route, mobile/save/load, and Studio edit/export/import/publish with embedded art.
- Canonical reel exported from the built app's actual Studio: **66 assets, 3,281,124 bytes**; 96-pixel trooper frames and the authored compact pistol framing confirmed.

Git's HTTPS credential helper was repaired using the already-authenticated GitHub CLI. The previously local-only engine/game commits were then pushed and the remote branch hash checked; this sprite pass was also committed and pushed. Work is on `arena/01a077ce-scarlet-reel`, not automatically merged into `main`.
