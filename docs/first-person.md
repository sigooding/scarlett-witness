# First-person Studio & Hollywood opening

**Latest level/engine update:** see [classic-engine fidelity pass v6](hollywood-classic-v6.md) for the night skyline, classic HUD, dimensional architecture, slopes, usable inventory and safe update controls.

**Previous sprite update:** see [shaded/pre-rendered sprite pass 3](hollywood-sprite-pass-3.md) for the latest enemies, weapons and props and safe publication updates. The [v2 notes](hollywood-sprite-pass-2.md) remain available as history.

A **playable first pass**, built on Scarlet Reel's existing Quake-style mode. The new action layer lives at `scene.stage.quake.fps`; rooms without that field still use the legacy renderer.

## Play

Choose **Duke Nukem 3D — Hollywood Holocaust** on the newsstand, then **Enter level**.

| Input | Action |
| --- | --- |
| W/A/S/D | Move and strafe |
| Mouse after clicking the view | Pointer-lock aiming |
| **Right-mouse drag** | Aim without pointer lock; works in embedded previews |
| Left/right arrows | Turn |
| Click or F | Fire |
| E | Use a nearby door, switch or interactive sprite |
| Space | Jump |
| C or Ctrl | Crouch (C avoids browser Ctrl-key shortcuts) |
| Shift | Run |
| 2 / 3 / 5 (Hollywood) | Pistol / collected shotgun / RPG; generic rooms retain their authored slots |
| 1 / backtick (Hollywood) | Mighty-foot quick kick |
| J / B / N / M / H | Jetpack / steroids / night vision / portable medkit / Holoduke |
| 6 / G (Hollywood) | Throw pipe bomb / detonate |
| [ / ] / Enter | Cycle inventory / use selected item |
| R | Reload the pistol; it also reloads automatically when empty |
| Tab | Automap |
| Esc | Pause; save, load, restart or return to the game menu |

On touch devices, swipe the view to aim and use the movement/fire/use/jump buttons. Landscape is more comfortable, but the controls also fit a 390×844 portrait viewport. The level requires **WebGL 2**; an unavailable renderer gives an explicit message instead of quietly substituting an unplayable 2D room.

## Author a first-person game

1. Open **Studio → Kind of game → First-person**.
2. **＋ Scene** now creates a playable first-person room with a weapon, sky, surfaces and example sprites. Changing the game type does **not** silently convert existing scenes.
3. Select a room and open **🚶 Stage**. **First-person tools** are at the top; **Expand editor** gives the map more room.
4. **Map & placement:** paint tiles, place/inspect/duplicate/delete sprites and doors, move the spawn, change facing, and resize the map. Arrow keys move the map cursor; Enter places/paints. Painting also supports dragging.
5. **Sprite library:** choose a shared definition, upload art or enter an image/asset URL, set world dimensions and collision, select billboard/wall/floor orientation, and configure enemy, pickup, explosive, breakable, switch or exit behavior. Instances share their definition. Give deliberately different enemies separate definitions.
6. **Surfaces & sky:** author floor elevations, wall heights, ceilings or outdoor sky, materials, brightness and effects. Ascents up to 0.36 units are stepped automatically; higher ledges need a jump. Low solid columns and platform-marked props can be stood on.
7. **Weapons & player:** tune damage, cadence, ammo, magazines, spread, pellets, animated weapon atlases, movement, health, FOV and render resolution. The first weapon starts owned; other weapons are granted by pickups.
8. Add a normal **Go to scene** hotspot and select it in a placed exit sprite's **Exit hotspot** field. The same field can connect other interactive sprites to the existing story-action pipeline, including its gating. Switches and destroyed explosives can open selected door IDs.
9. Use **Walk-test the room in 3D**, then **Check → Export → Import → Publish**. Test the published copy from the **newsstand**, not just Studio preview.

An old Quake room can opt into the action tools under **Stage → 3D Quake-style mode → Enable first-person action tools**. Its old letter anchors are not automatically converted into action-layer placements; place/link those interactions deliberately. Leave the extension disabled to preserve an existing room exactly.

### Sprite conventions

- World coordinates: **X east, Z south**, Y is elevation. Map cell centers are `x + 0.5, z + 0.5`.
- Spawn/actor facing: 0° north, −90° east, 180° south, 90° west.
- Fixed wall sprites use the plane's normal: 0° faces south, 90° east, 180° north, −90° west. Put them just in front of a wall, not inside it. Back faces are culled so signs do not show reversed text from behind.
- An omitted sprite foot elevation follows its tile floor. An explicit elevation is **absolute**, not added to the floor.
- Atlas frames are indexed left→right, top→bottom. Animations are `idle`, `walk`, `attack`, `death`; directional sets use `idle-0` … `idle-3` (or `-7`) and equivalent names for the other states. Missing directional names fall back to the ordinary animation.
- Weapon atlases use `idle`, `fire`, and optionally `reload`. Both single-row and multi-row grids work.
- **Check** validates map dimensions, headroom, spawn, numbers, IDs, material/sprite/weapon references, door links and exit hotspots. Preview refuses invalid action-layer settings with a readable error.

## What the Hollywood level contains

The committed story is `src/data/hollywoodOpening.ts`, ID `hollywood-opening`, titled **Duke Nukem 3D — Hollywood Holocaust**. It is a full-progression reconstruction of E1L1 on a **64×50** contiguous map. See [hollywood-e1l1-pass.md](hollywood-e1l1-pass.md) for what changed in the level-fidelity pass, the new textures and the engine features it required.

Route, in walkthrough order:

1. **Rooftop** — pistol ammo behind the crate; two C-9 canisters in the corner by the vent open the shaft; drop onto the large medkit.
2. **Street** — burning dumpster with ammo; crate → sloped ledge → three apartment windows (rockets on the bed, *Biker Bimbos* poster hides steroids) → ledge under the **INNOCENT?** billboard (RPG) → lower ledge with an atomic health.
3. **Front** — boarded double doors and a **cracked wall** that opens the foyer (ammo, monitor, lobby double doors), or the **alley** by the hydrant → alley door → stairs → upper room → theatre side door.
4. **Lobby** — counter (jump it), popcorn/register/soda; storeroom with the **shotgun** and a monitor; the counter-end wall opens onto an atomic; using the **cash register** opens a compartment above the far wall reached by a **hidden lift** (armor); arcade cabinets.
5. **Restroom** — mirror, sinks, couch with shells, urinals, two stalls (one occupied), platform → **air vent** → duct → the **captive woman** room → brick wall into the projector room.
6. **Projector room** — red access card, crate → projector hop for an atomic that opens the RPG wall, curtain switch, window onto the theatre, ramp down to the lobby hall.
7. **Elevator** — trash can hop → wall panel (night vision, pipe bombs, medkit); upper corridor with C-9 that blows a wall down to the ramp.
8. **Theatre** — four seat rows, stage armor, opened curtain, **cracked screen** (RPG) → backstage jetpack and shells.
9. **Exit** — red door, ramp, C-9 blows the bricked wall, bridge over the alley, ledge round to the **bachelor pad**, glass pane, exit switch.

All **eight counted secrets** are zones/pickups with `secret: true` (`s1-billboard` … `s8-bachelor`). **17 enemies**, **26 doors/lifts/slabs**, pistol, shotgun and RPG. The two optional turrets are on the roof above the exit.

**Still a reconstruction, not an original-file port.** The v6 pass adds continuous slopes, dimensional architecture, finite roof slabs, working inventory, projectile troopers/turrets, a usable arcade cache and water fixtures. See [current fidelity boundaries](hollywood-classic-v6.md#fidelity-boundaries) for the remaining differences: grid-derived plan, decorative mirrors/monitors, non-destructible bridge, hitscan RPG and no campaign continuation.

## Saves, export and not losing work

**Studio autosave and Publish are browser storage, not a repository backup.** Export the `.reel.json` and commit the canonical story plus its shipped media. This pass's source and prepared assets are versioned; no essential game content exists only in a browser draft.

Gameplay saves include per-room position, velocity, health/armor, weapons/ammo, keys, actor health/positions/cooldowns, doors, secrets and visited zones. The normal save/load slots and `.sreel` serialization carry `fpsRooms`. A live auto checkpoint is refreshed every five seconds; a dead state does not overwrite that live auto. Manual slots remain independent. Returning from a shell dialog may show **Resume level** while the saved renderer is rebuilt.

Keep stable entity/door/weapon IDs when revising a published map. Saves match authored IDs, discard obsolete entities, and fall back to spawn when an old player position is no longer valid.

Portable export traverses **all FPS materials, sprite/weapon sheets, sky and effect frames** including broken-fixture images through `src/data/storyMedia.ts`. The Studio browser regression imports its exported self-contained copy, publishes it, blocks `/img/hollywood-opening/`, and plays to the exit. Its test copy has one extra placed prop and small inspector edits to prove real editing/export behavior.

## Fast development checks

```sh
npm run test:fps
npm run test:browser -- scripts/browser/fps.spec.ts --grep 'pause, real'
npm run test:browser -- scripts/browser/fps.spec.ts --grep 'newsstand rooftop'
npm run test:browser -- scripts/browser/fps.spec.ts --grep 'Studio type'
```

`test:fps` includes a deterministic physical tour through the full E1L1 route (`scripts/hollywood/e1l1-route.ts`): all seventeen enemies, all eight secrets and the exit, plus collision, saves, validation and media-reference checks. It takes roughly a second here. **The ordinary story bot does not verify first-person movement/combat.** The browser driver observes `data-fps-*` attributes but drives actual keyboard, mouse and touch controls; it never injects game progress.

The browser cases cover:

1. Fresh newsstand start → rooftop → street → alley → theatre → lobby/shotgun → restroom vent → projector room → theatre → red door → bridge → exit.
2. Quick fire/jump taps, pause, actual slot save/load, persistence and portrait controls.
3. Actual Studio first-person room creation, map placement/inspector edits, export/re-import, Check, Publish and a newsstand playthrough of the portable copy.

Use a warm server, one worker and a targeted case during iteration. Playwright clears its output folder: copy wanted exports/screenshots elsewhere first. See [speedy testing](fast-testing.md) for the inner loop and full release gate. Native Windows/macOS installer smoke is a separate sign-off; browser success is not that sign-off.

### Software WebGL in a sandbox

Normal setup: `npm ci`, then `npx playwright install chromium`. With an existing compatible browser:

```sh
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium \
PLAYWRIGHT_SOFTWARE_WEBGL=1 \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 \
  npm run test:browser -- scripts/browser/fps.spec.ts
```

`PLAYWRIGHT_SOFTWARE_WEBGL=1` opts the FPS specs into ANGLE/SwiftShader WebGL for headless environments; it is not forced onto unrelated 2D Studio tests or normal GPU-backed development. In this Arena workspace the alternative Chromium is `/tmp/chromium`, with `LD_LIBRARY_PATH=/tmp/al2023/lib`. Those are **temporary**, not repository dependencies. If rebuilding that workaround, the external `@sparticuz/chromium` package contains `al2023.tar.br`: decompress it and extract **into `/tmp/al2023`**, because the archive entries start with `lib/`. Extracting into `/tmp` and then pointing at `/tmp/al2023/lib` does not work.

## Artwork and implementation

Eight original generated source plates produced **71 shipped files** under `public/img/hollywood-opening/`: two directional enemy atlases, two weapon atlases, street/cinema props, pickups/effects, eight tiled materials, a sky, signage and a cover. Sign lettering is deliberately typeset. No original Duke `.GRP`, `.ART`, `.MAP` files or recordings were extracted.

`scripts/hollywood/prepare-assets.py` keys, slices and sizes the atlases using Pillow. Its optional raw inputs live in ignored `public/img/hollywood-opening/src/`; they are not required to run the game. The shipped outputs are committed. The image browser excludes raw `src/` folders. Preparation uses a local DejaVu font on Linux; change the font path if regenerating elsewhere.

Code map:

- `src/game/fps/types.ts` — additive authored schema and save state.
- `simulation.ts` — DOM-free physics, AI, hitscan, pickups, doors and snapshots.
- `geometry.ts` / `renderer.ts` — shared sloped floor math, batched dimensional geometry, alpha-tested sprites, directional animation, sky, effects and weapon view.
- `FpsStage.tsx` / `fps.css` — real input, HUD, pause/accessibility, touch and shell integration.
- `audio.ts` — original procedural effects, including enemy laser bolts.
- `inventory.ts` / `ClassicHud.tsx` — charged equipment and the opt-in classic status bar.
- `presets.ts` — reusable first-person starter and sprite/material library.
- `validate.ts` — Studio Check integration.
- `src/studio/FpsEditor.tsx` — visual authoring panels.

Quake-style room compatibility, the existing story action pipeline and Black-Mass Bride are retained.

### Quake E1M1 (second first-person campaign)

The same engine and Studio now also ship **Quake — The Slipgate Complex**
(`quake-e1m1`), a second authored FPS replica with a new set of authoring
knobs — all validated by Check and exercised by the fast gate
(`scripts/quake/e1m1-route.ts`):

- Melee enemies (`attack: "melee"` + `meleeRange`) and melee weapons
  (`melee: true` — no ammunition).
- Shared ammo pools (`ammoPool`), launched weapons (`projectile` with speed,
  gravity, bounce, fuse, splash) and owned-from-start weapons (`starting`).
- Quad Damage pickups (`pickup.type: "quad"`), hazard floors
  (`FpsTile.hazard`), wading water (`FpsTile.water`), the biosuit item and
  teleporter pads (`use: "teleport"`).
- Walk-in zone hotspots (`FpsZone.hotspotId`) and the Quake status bar
  (`presentation: "quake"`, `skillLabels`, `menuWordmark`/`menuKicker`).

See `docs/quake-e1m1.md` for the level guide and the feature/Studio map.

## Original engine-pass verification receipt

- `npm run check`: **833** playable local assets found, including computed paths and FPS atlases. Four missing retired-story files remain harmless.
- `npx tsc --noEmit`, complete `npm test`, production build, lint and `git diff --check`: passed.
- Focused first-person suite: **24 checks**, including the complete physical tour, enemy collision and post-landing medkit collection.
- Full browser suite: **25/25 passed** (22 existing cases plus the three FPS workflows).
- Built-app smoke: a real newsstand start, street/cinema combat and red-key exit passed on the production preview. The canonical game was then exported from Studio in a separate fresh browser context: **66 embedded assets, 4,736,289 bytes**.
- Native Windows/macOS installer execution was not part of this pass.

Software WebGL is scoped to the FPS browser fixture: forcing software GPU rasterization on all Studio tests caused screenshot stalls. Keep ordinary 2D cases on the default browser path.
