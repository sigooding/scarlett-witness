# Hollywood Holocaust — level-fidelity pass

**Historical pass.** The [classic-engine v6 update](hollywood-classic-v6.md) supersedes the presentation, surface textures, inventory limitations and enemy count below.

Rebuilds the Hollywood first-person game from the earlier "opening slice" into the **complete E1L1 progression**, replaces the texture set, and adds the engine features the original layout needs. Layout was referenced against the StrategyWiki and Duke Nukem Wiki walkthroughs; no MAP/ART/GRP data was extracted.

## Level

- Map grows from 44×36 to **64×50**. Street runs north–south with the rooftop start and apartment building to the west and the cinema block to the east, alley behind, bridge across the alley to the exit.
- Every landmark of the walkthrough is present and physically playable: rooftop C-9 vent, landing medkit, dumpster, crate → sloped ledge → apartment windows, poster compartment, billboard ledge, atomic ledge, boarded entrance + cracked wall, foyer, lobby counter, shotgun storeroom, register-operated hidden lift, counter-end atomic nook, restroom stalls/vent/platform, duct, captive woman, brick wall, projector room with red card, projector atomic → RPG wall, curtain switch, ramp, elevator, trash-can compartment, C-9 corridor wall, theatre seats/stage, cracked screen → backstage jetpack, alley door + stairs, upper room, red door, C-9 blast wall, bridge, ledge to the bachelor pad, glass, exit switch.
- **8 counted secrets**, 15 enemies (trooper/pigcop), pistol/shotgun/RPG.
- `scripts/hollywood/e1l1-route.ts` walks the whole thing deterministically in `npm run test:fps`; the browser driver follows the critical path.

## Textures ("wallpapers")

Ten new plates under ignored `public/img/hollywood-opening/src/tex-v2/`, prepared by `scripts/hollywood/prepare-textures-v2.py` into seamless, palette-reduced 256px `tex2-*.webp` files: facade blocks, alley brick, red curtain, lobby art-deco wallpaper, red carpet, restroom tile, wood panelling, riveted metal, derived concrete; plus `sky-v2.webp` (burning L.A. skyline) and `cover-v2.webp`. The old `tex-*.webp`, `sky.webp` and `cover.webp` stay for older reels. The script also typesets the marquee, *Biker Bimbos* poster and signs and draws the small pickup/prop placeholders (atomic, steroids, pipe bombs, jetpack, goggles, rockets, RPG pickup, vent, glass, cracked wall, RPG view strip).

## Props pass (v4)

Second image pass, prepared by `scripts/hollywood/prepare-props-v4.py` from magenta-keyed plates in ignored `src/props-v4/` into `*-v4.png` (manifest `props-v4-manifest.json`): first-person RPG strip (`rpg-v4-sheet.png`), captive-woman alien pod, apartment bed, restroom couch and mirror, cracked wall / vent / glass squares, atomic health, RPG pickup, rocket box, portable medkit, *Biker Bimbos* poster and the *Attack of the Bleached Blonde Biker Bimbos* marquee. The jetpack, night-vision, pipe-bomb and steroids pickups were regenerated one per plate in pass 3.

## Props pass (v5)

Third image pass, `scripts/hollywood/prepare-props-v5.py` → `*-v5.png` + `props-v5-manifest.json`: jetpack, night-vision goggles, pipe bombs, steroids, security monitor, Duke-style arcade cabinet, burning dumpster (replaces the dumpster+fire pair on the street), 35 mm projector (strict magenta key so its grey body survives), red access card, exit switch panel and the INNOCENT? billboard. Shared preset props are re-skinned inside `hollywoodOpening.ts` only, so other levels keep their art. No drawn placeholders remain in the level.

## Engine additions (additive schema)

- `FpsDoor.depth` — thick slabs for secret walls; `lift` — a rising platform that carries the rider (register lift, elevator); `walkable` — static catwalk (bridge).
- `FpsWeapon.splash` / `splashDamage` — RPG blast radius shared with C-9 detonation.
- `pickup.type: "item"` with `itemId` (inventory shown in the HUD, saved in `.sreel`) and `pickup.max` for atomic health above 100.
- Pickups can `targets:` doors (projector atomic opens the RPG wall).
- Guards no longer walk off ledges; shotgun no longer decrements a non-existent clip.

Validation ranges were widened for thin slabs (height ≥ 0.1) and fast "break" doors (speed ≤ 20).
