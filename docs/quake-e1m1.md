# Quake — The Slipgate Complex (E1M1 replica)

An authored, fully editable reconstruction of Quake's opening level,
**The Slipgate Complex** (`quake-e1m1` in the story catalogue), built entirely
with the Studio's first-person tools — no extracted MAP/BSP files. Every piece
of art is newly drawn for this engine by `scripts/quake/prepare-art.py`
(deterministic, re-runnable).

## The route (matches the original walkthrough)

1. **Start hall** — hop onto the ledge on the right and **shoot the cracked
   wall** for Secret 1 (shells). Drop back down and open the elevator-room
   door.
2. **Elevator** — ride it down to the yard. Kill the rottweiler and grunts,
   grab the two 25-healths and the 15-health.
3. **Bridge** — cross it to the big building door. Optional **water route**:
   drop into the west trough, wade through the passage to the cave with the
   **100 health (Secret 2)**, ride the water elevator up to the **green
   armor** and return through the hall.
4. **Lobby → pillar room** — blow the radioactive container beside the wall,
   collect the shells behind the pillar.
5. **Globe room** — stand on the globe lift and shoot the globe to ride up.
   Collect the 15-health and shoot the second globe to open the **quad
   damage secret (Secret 3)**.
6. **Stair hall** — take the catwalk elevator up, cross the bridge and take
   the **nailgun** (the alcove wall opens, with a grunt and nails inside).
7. **Overlook** — from the balcony, shoot the two grunts across the slime,
   press the button on the s6 wall to **extend the movable ledge**, cross it
   and shoot the globe to open the **double-barrelled shotgun secret
   (Secret 4)**.
8. **Ramp room** — press the three buttons down the ramps to open the exit
   door. Grab the **biosuit** behind the structure.
9. **Secret 5** — from the third button, jump onto the protruding blocks for
   the **100 health** on the overhang.
10. **Slime swim** — turn the biosuit on, wade into the annex slime, swim
    through the corridor and the channel to the pool, then under the s6
    wall to the lift. Ride it up for the **yellow armor (Secret 6)** — the
    teleporter pad returns you to the lobby overlook.
11. **Exit** — through the three-button door, down the corridor, up the ramp
    into the slipgate room. Shoot the loose wall to unlock Secret 2's back
    door, then **step through the slipgate** to finish.

Six secrets · 23 enemies (5 rottweilers, 18 grunts on Normal) · axe,
shotgun, double-barrelled shotgun and nailgun · shared shell and nail pools ·
Quad Damage and the biosuit.

## Engine features this level adds to Studio (and where to author them)

Everything below is data-driven — each knob is editable under
**Stage → First-person tools**, and Check validates it:

| Feature | Where in Studio |
| --- | --- |
| **Melee enemies** (rottweilers) | Sprite library → Behavior `enemy` → Attack `melee` + Melee reach |
| **Melee weapon** (the axe: no ammo) | Weapons & player → Melee weapon |
| **Shared ammo pools** (shells, nails) | Weapons & player → Ammo pool; pickups add to the pool |
| **Launched projectiles** (nailgun) | Weapons & player → Launched projectile (speed, gravity, bounce, fuse, splash) |
| **Quad Damage** | Sprite library → Pickup type `quad` + duration; the HUD shows the timer |
| **Hazard floors** (slime) | Surfaces & sky → Hazard damage per hit / seconds between hits |
| **Wading water** | Surfaces & sky → Water surface height (bed = tile floor, translucent top) |
| **Biosuit** | Sprite library → Pickup type `item`, item id `biosuit` |
| **Walk-in exits** (the slipgate) | Architecture & zones → a zone with a linked story hotspot |
| **Teleporter pads** | Sprite library → World interaction `teleporter pad` + destination |
| **Quake status bar** | Weapons & player → HUD presentation `Quake status bar`, difficulty names, menu wordmark/kicker |
| **Continuous stairs/ramps** | Per-cell step tiles (≤0.36 rise per cell) — see the `flight` helper in `src/data/quakeE1M1.ts` |
| **Owned-from-start weapons** | Weapons & player → Owned from the start |

### Quake data model notes

- **`FpsTile.hazard`** — `{ damage, every, message }`. Damage only applies
  while the player's feet are within ~0.75 of the tile's floor, so a slab or
  ledge raised above the slime is safe.
- **`FpsTile.water`** — the surface height; movement below it is slowed.
- **`FpsWeapon.ammoPool`** — weapons sharing a pool draw and spend one count;
  `maxAmmo` caps the pool.
- **`FpsWeapon.projectile`** — `{ speed, gravity?, bounce?, fuse?, splash?,
  splashDamage?, color? }`.
- **`FpsWeapon.melee` / `starting`** — swung weapons skip ammo entirely;
  `starting` grants ownership alongside the first weapon.
- **`FpsSprite.attack: "melee"`** + `meleeRange` — dogs, knights, fiends.
- **`FpsSprite.pickup.type: "quad"`** — a timed ×4 damage buff
  (`duration`, default 30s); the multiplier also applies to the kick.
- **`FpsSprite.use: "teleport"`** + `teleport: { x, z, yaw? }` — pads that
  move the player on use.
- **`FpsZone.hotspotId`** — walk-in story triggers (fired once, gated by the
  story's unlock rules; locked triggers stay armed).
- **`FpsSettings.presentation: "quake"`** — the Quake status bar, 4:3 FOV
  framing, difficulty names via `skillLabels`, and `menuWordmark`/
  `menuKicker` for the enter screen.

## Fidelity boundaries

This is a faithful *layout and progression* reconstruction, not a port:

- All art is original (procedurally drawn, Quake-flavoured).
- The engine's grid/tile world has no slopes steeper than the walker's
  step-up per cell, so stairs and ramps are continuous step flights; two
  ramps (the slipgate ramp and the exit-door mouth) are hop-ups, like the
  original's climbable geometry.
- The start-building elevator, yard elevator, globe lift, catwalk elevator,
  movable ledge and slime lift are all authored `FpsDoor` lifts.
- Enemies are the engine's sprite billboards with new hand-drawn art and
  Quake-style stats (grunt hitscan, rottweiler melee charge).
- Difficulty selects incoming-damage scaling (Easy/Normal/Hard); enemy
  placement follows the Normal set.
