# Hollywood Holocaust — classic-engine fidelity pass (v6)

The built-in `hollywood-opening` now uses an **opt-in classic presentation**, a reference-guided E1L1 layout, and additive FPS engine features. It is an unofficial reconstruction, **not** the original Build executable or an imported original level. No Duke `.MAP`, `.ART`, `.GRP`, music, voice recordings or original font files are bundled.

## What changed

### Presentation and environment

- Night-time L.A. skyline with warm windows, cylindrical projection and no orange fantasy sky. Buildings remain upright instead of stretching over a sphere.
- Fenced rooftop, steel posts, low parapets, dimensional sloping vent housings and an opening red skycar fly-by. The invented rooftop guard was removed.
- Brown roof panels, concrete/brick exterior palette, window bays with sills/lintels, cornices, sidewalks and faded road markings.
- A projecting, illuminated theatre marquee, correctly facing vertical **CINEMA** sign, boarded entrance, poster cases and a transparent crack decal instead of an unrelated square of wall texture.
- Red carpeting and curtains, wood-panel theatre walls, lobby wainscot, concession counter trim, fluorescent ceiling strips, auditorium proscenium, aisle lights, restroom fixtures and bridge rails.
- Classic metallic status bar: health, ammo, armor, weapon-slot grid, usable inventory, access-card indicators and small kill/secret totals. A newly drawn bitmap font, nuclear motif, compact crosshair, red menu headings and gold title treatment replace the generic FPS styling **only for this level**.
- A line-based automap, motion-driven weapon bob, aspect-correct weapons in portrait, and 4:3-reference FOV which expands horizontally on widescreen.

There are **32 versioned v6 image assets** (about half a megabyte combined) and a small original font. Existing v1–v5 assets and starter presets are retained. `scripts/hollywood/prepare-fidelity-v6.py` draws the surfaces/signs/font and prepares three newly generated, keyed set-piece sprites. The optional raw plates are ignored, never runtime dependencies; shipped images are hash-checked against `fidelity-v6-manifest.json`.

### Gameplay

- Frame-rate-independent gravity keeps jumps consistent at 20/60 fps, including the 1.4-unit bathroom platform.
- The slanted apartment ledge and projection-room ramp are continuous slopes. The renderer and collision use the same height function.
- A start-menu skill selector offers Piece of Cake, Let's Rock and Come Get Some (0.4× / 1× / 1.5× incoming damage). This is damage tuning, not a reproduction of original skill-dependent placements/respawns. The chosen skill persists in saves.
- The box-office and screen cracks require an **explosive**, not repeated pistol shots. The normal first visit goes through the alley; the RPG opens the box-office shortcut. The boarded main entrance stays shut.
- Doors/curtains can split sideways; rising and destroyed panels no longer float in the air after opening. Attached posters/screens disappear or travel with their panels.
- Troopers fire visible, dodgeable green projectiles. The optional roof turrets also fire projectiles. Projectiles stop at walls, slabs and solid cover, and survive save/load. Pig cops retain hitscan attacks with classic-profile distance falloff and first-sight reaction time.
- Mighty-foot quick kick; 48 starting pistol rounds; weapon-specific ammo caps; original-style weapon slot numbers.
- **Portable medkit:** heal only missing health and retain the unused charge.
- **Jetpack:** toggle on/off, rise with Jump, descend with Crouch, hover and consume fuel.
- **Steroids:** temporary movement boost with charge drain.
- **Night vision:** visibly brightens/tints the world and consumes charge.
- **Holoduke:** use the Duke Nukem II arcade cabinet to open an uncounted cache; activate the item to place a decoy which distracts guards.
- **Pipe bombs:** throw physical bouncing charges and remotely detonate them; placed bombs and remaining ammunition persist in saves.
- Shoot a hydrant, then use the water for one health point per use. Toilets and urinals can also provide water. Health does not exceed 100 from drinking.
- The roof above the exit can be reached with the jetpack. It contains two turrets, shells and another jetpack; a finite ceiling slab lets the exit room and its roof occupy the same X/Z.
- All eight counted secret zones have vertical bounds: flying high over one does not award it. The placed population is now **17 enemies**, and the physical 100% regression defeats all 17.

## Controls

| Input | Action |
| --- | --- |
| WASD, Shift | Move, strafe, run |
| Mouse / right-drag / arrows | Aim; right-drag works without pointer lock in embedded previews |
| F / click | Fire current weapon |
| E | Use a door, switch, cabinet or water fixture |
| Space / C or Ctrl | Jump / crouch; jetpack up / down |
| 1 or backtick | Quick kick |
| 2 / 3 / 5 | Pistol / shotgun / RPG, when owned |
| R | Reload pistol |
| J / B / N / M / H | Jetpack / steroids / night vision / medkit / Holoduke |
| 6 / G | Throw pipe bomb / detonate placed bombs |
| [ / ] / Enter | Select previous / next inventory item / use selected item |
| Tab / Esc | Automap / pause, save, load, restart |

On touch, use the on-screen movement/action buttons, weapon shortcuts and inventory arrows/use panel. Landscape remains preferable, but the HUD and controls fit a 390px portrait viewport.

## Engine and authoring

The shared engine remains data-driven; no renderer/simulation code branches on `hollywood-opening`.

| Additive field | Purpose |
| --- | --- |
| `FpsTile.slope` | Rise east/south from each cell's north-west corner |
| `FpsTile.roof` | Accessible top of a finite ceiling slab |
| `FpsDetail[]` | Batched boxes, sloping tops, trim, transparent fences, cover and walkable supports |
| `FpsMaterial.repeat/opacity/alphaTest/fullbright` | Consistent world-scale textures, glass, cutout mesh and light strips |
| `FpsDoor.motion/sealed` | Rising, splitting, destroyed or intentionally sealed panels |
| `FpsEntity.attachedTo/flyby` | Moving wall art and time-based introductory set pieces |
| `FpsZone.bottom/top` | Vertical trigger bounds |
| `FpsSprite.damageType/use/brokenImage` | Explosive-only cracks and persistent interactive fixtures |
| `FpsSprite.attack/projectileSpeed/projectileColor` | Projectile enemies alongside legacy hitscan actors |
| `FpsWeapon.slot/maxAmmo` | Keyboard slots and ammunition limits |
| `FpsSettings.presentation/skyMode` | Classic HUD and cylindrical skyline, both optional |

`geometry.ts` is a DOM-free mesher. Full-height interior wall faces use the **adjoining room's** palette and brightness, low counters/parapets keep their own material, and soffits seal different ceiling heights. Material batching includes the dimensional details instead of creating a draw call for every trim piece.

Studio exposes slopes/roofs/material controls, door motion/lifts/attachments, pickup inventory IDs/charge, projectile attacks, ammo limits/slots and presentation. **Surfaces & sky → Architecture & vertical trigger zones** edits the dimensional pieces as validated structured data. Studio Check rejects malformed slopes, inverted detail tops, bad links, invalid ranges and invalid slots before preview.

## Saves and getting the update safely

- The snapshot version remains additive `1`. Names-only inventory from older saves receives default charge; unrecognized author item IDs are retained. Active items, selected inventory, charge, decoy position, bombs and enemy projectiles now persist.
- Existing publications/drafts **still override the built-in**. They are not erased on an app update.
- If an earlier Hollywood publication/draft is active, the newsstand displays **Hollywood update available**. **Play updated Hollywood** launches the new built-in without replacing authored files; **Export updated built-in** produces a portable reel for review/import. Export an old draft before deliberately replacing it in Studio.
- The regular newsstand Play button still opens the saved publication. Unrelated stories and manual save slots are not reset.
- Portable export includes all FPS material, sprite, broken-fixture, weapon, sky and effect references. Architectural details reference these materials by ID. The browser regression blocks built-in Hollywood image URLs while playing the exported/imported/published copy.

## Verification

```sh
npm run test:fps        # 59 checks, including the full physical 8-secret/17-enemy tour
npx tsc --noEmit
npm run lint
npm run check
npm run build
npm test

# Production or warm-dev-server browser checks (software WebGL only if needed)
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5175 \
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium \
PLAYWRIGHT_SOFTWARE_WEBGL=1 \
  npm run test:browser -- scripts/browser/fps.spec.ts
```

Browser tests drive real keyboard/mouse/touch controls, actual save/load slots and Studio export/import/publish. The critical-path driver now enters through the alley rather than relying on a pistol to destroy the box-office wall. Its health recovery uses the placed stage armor/lobby medkit and the usable portable medkit, not injected state. Browser tours select Piece of Cake through the real menu; the fast all-secrets tour runs at the default normal skill. Set `PLAYWRIGHT_FPS_TRACE=1` for detailed traces; screenshots stay enabled by default, avoiding hundreds of MB of continuous telemetry/DOM tracing.

### Completed checks (2026-09-07)

- `npm run test:fps`: **59 passed**, including the normal-skill physical 100% tour.
- `npm test`: the complete repository regression chain passed.
- TypeScript, ESLint, local asset Check and production build passed.
- **4 production-browser flows passed**: full newsstand-to-ending run; pause/save/load/mobile; Studio edit/Check/export/import/publish and full copied-level run with built-in images blocked; safe launch of the update while retaining an older authored publication.
- Screenshots from those runs are generated under ignored `test-results/`, not shipped game art.

## Fidelity boundaries

This is appreciably closer in visual language, traversal and interaction, but it is **not a pixel-perfect or byte-identical port**. The base plan is still a hand-authored 64×50 height-cell reconstruction, not arbitrary Build sectors; a finite roof slab is supported, not unrestricted stacked interior sectors. Placement counts and combat tuning are this reconstruction's rather than an exact original difficulty setting. The mirror and security monitors are still decorative. The bridge is not destructible, the additional vent Holoduke compartment is not implemented, and RPG fire remains a hitscan blast rather than a traveling player rocket. Music/voices are not original recordings. There is no playable Red Light District/campaign handoff in this request's level.

## Reference basis (not shipped art)

- Official 3D Realms E1L1 walkthrough and eight secrets: [3](https://legacy.3drealms.com/duke3d/walkthrough/e1m1.html).
- Duke Nukem Wiki's description, rooftop equipment and uncounted Holoduke compartments: https://dukenukem.fandom.com/wiki/Hollywood_Holocaust.
- Classic rooftop screenshot (night skyline, fence, vents, falling skycar): https://biobreak.wordpress.com/2017/02/04/duke-nukem-3d-hollywood-holocaust/.

Downloaded reference images and raw generation plates are **not** shipped as runtime game art.
