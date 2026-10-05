# Rain Sector: The Kael File — Studio beta test (Blade Runner case)

**Date:** 2026-09-02 · **Branch:** `arena/01a05e45-scarlet-reel`
**Purpose:** beta-test the Studio end-to-end as a creator would — build a
complete, playable neo-noir synthetic-hunter case in the Blade Runner mould,
create all assets and characters/NPCs under a rationed image budget, fix every
engine problem encountered en route, and report the creator friction (see
**`docs/rain-sector-creator-pass.md`** for the full friction log; this file is
the test record).

The case is registered first in the newsstand (`src/data/rainSector.ts`).

---

## 1. The case under test

A three-scene walking adventure with a classic interrogation finale:

| Scene | Type | What it proves |
| --- | --- | --- |
| `rs_brief` — Captain Ostrander's office | classic | beats, three tone choices (flag economy), foreground desk prop |
| `rs_street` — Kowloon Lane | 🚶 stage | verb coin + sentence line + extended verbs, **interactable NPC** (Old Ping, live pursuit), multi-state vending machine (ungated verbs → flag → re-skinned takeable), gated useItem exit, remote billboard look, 12 animated/animating foreground extras, spinner flyby, pedestrian motion path |
| `rs_alley` — Behind Kowloon Lane | 🚶 stage | gate-aware barrier (unbolts on a conversation flag), locker reader (useItem gating), multi-state lockers, **walk-off-screen edge exit** + entrance-as-hotspot back to the street, bolted-stairs refusal, Iris ghost one-shot motion |
| `rs_room` — The K-Wesson Test | classic lie scene | claim/evidence/wrongLimit lie detection, exit hotspot back to the alley until the test concludes |
| Endings ×3 | `isEnding` | gold gated on `rs_caught`, silver, game-over — bespoke plates |

Items: key card (kicked loose), loading-dock photograph (lockers), cigarette
tin. Cast: Mara Vane (player, 4-frame walk sheet), Iris Kael, Captain
Ostrander, Old Ping (patrols, talkable), plus ambient umbrella woman, spinner,
rat, cat, hologram, ghost.

## 2. How it was tested

The full gate, run after every pass:

| Suite | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| Engine tests (`scripts/engine-tests.mjs`) | **1002 passed / 0 failed** (includes Rain Sector validator regressions + sheet-dim pin) |
| Stage beta (`scripts/beta/stage-harness.mjs`, `--max-old-space-size=4096`) | **150 passed / 0 failed** — run twice consecutively on the final build; Part 6 is a full creator playthrough of this case (kick→take→gate→refusal→edge-walk→N-talk→both replies→gate→stairs→lie→endings) |
| DOM smoke (`scripts/dom-smoke.mjs`) | PASSED (walkable-stage stories incl. the spawn-in-obstacle regression trap) |
| Import/export roundtrip | PASSED |
| `node scripts/preflight.mjs` | PASSED on the 2026-09-02 double-check (see §7) |
| `vite build` | 2.58 MB single-file / 690 KB gzip |

## 3. Bugs & traps found while building (the actual beta findings)

All fixed unless marked otherwise:

1. **Click-to-walk ghosted through 🚧 barriers.** The straight-line fallback
   (and floor taps beyond furniture) skipped collision entirely — the
   detective walked through the chained stair gate and stranded inside the
   barrier rectangle. Fixed: clicks now slide/stop/abandon exactly like the
   arrow keys, and a marker walled behind a **shut gate refuses from wherever
   the player stands** (the gate caption plays — better feedback than a
   wall-hug). Regression asserts added to the beta.
2. **A spawn inside furniture broke the router via a sealed pocket.** An
   earlier shipped alley spawned the biker inside the dumpster obstacle —
   legal only under the old ghosting. The honest-collision fix exposed
   `stageRoutePoly` snapping starts into the sealed sliver between the
   dumpster and the world edge. Fixed with component flood-fills: a start
   inside furniture escapes the side that can actually reach the goal; a free
   start sealed away from the goal correctly gets "no route" (caught by the
   Studio 🥾 Walk-test tool's own assert before it could ship).
3. **N inherited the armed verb.** With 👁 LOOK armed, N "examined" the
   talkable NPC from across the street instead of walking over. Fixed: N and
   NPC clicks force a TALK intent.
4. **Validator false positives** (found headlessly, codified as engine
   regressions): a `useItem` exit didn't count as "a way out"; a verb's
   `flagSet`/`giveItem` didn't count as a producer; the NPC-link checks were
   mis-nested inside the hotspots loop.
5. **`HotspotState.image` exists but `imageFit` doesn't** — multi-state art
   can't set its fit. Worked around; on the Studio wants list.
6. **Sprite keying too weak / frames downscaled.** Magenta fringing reported
   on soft edges; first slicing pass also threw away ~70% of the plate
   resolution. Fixed: everything re-keyed at tolerance 130 / softness 18 and
   re-sliced at 85–95% of source (walker 109×208 → 293×560) — no image budget
   spent.
7. **Headless frame-budget flakes.** Fifteen animated foreground extras slow
   happy-dom's rAF enough to intermittently blow a 12s walk timeout.
   Test-budget fix (20s), not an engine change — browsers are nowhere near.

## 4. Studio surfaces exercised

Walkable-stage authoring (floor bands, obstacles, gates, entry spawns,
wide-world %, walk-off edges), hotspots (all cursor verbs, remote, repeatable,
multi-state with art, useItem exits, custom fail lines), verb coin + sentence
line + extended verbs, interactable NPCs (talk link, patrol, sheets, scale),
ambient NPCs, foreground sprite editor layer (statics, anim presets, occluders,
motion paths, once/fadeTo one-shots, full-plate cover overlays), items,
characters/portraits, lie-detection classic scenes, gating with
`excludesFlags`, endings, the validator, the 🥾 Walk-test tool, and the
magenta-plate → `make-sprite-sheet.mjs` → sheet pipeline (14 sheets).

## 5. Art budget spend

| Pass | Images | What |
| --- | --- | --- |
| 1 | 10 | cover, 4 scene plates, 4 portraits, Mara walk plate |
| 2 | 16 | Ping + umbrella walk plates, spinner fly cycle, vending tray, 2 ending plates, 10 foreground cutouts (turn-limit split the delivery; the queued set completed on the reset) |
| 3 | 10 | 10 multi-frame animated props (steam, puddle, rain overlay, hologram, splashes ×2 placements, drip, transformer, fan, rat, Iris ghost) |

All plates keyed from flat magenta; plates kept in `plates/`, sheets in
`public/assets/sprites/`.

## 6. How to replay the beta

```bash
npm ci
node --max-old-space-size=4096 scripts/engine-tests.mjs   # 1002/0
node --max-old-space-size=4096 scripts/beta/stage-harness.mjs  # 150/0 (Part 6 = this case)
node scripts/dom-smoke.mjs && node scripts/ie-roundtrip/run.mjs && npm run build
```

In the app: newsstand → **Rain Sector — The Kael File**. Walking rooms:
arrows/WASD or click, H reveals markers, N talks to the nearest character,
1–9 pick coin verbs, double-click jogs.

---

## 7. Double-check pass (2026-09-02) — preflight fixed, spinner clamped

Re-audit of the merged beta results found one real gap and one off-plate NPC,
both now fixed.

1. **`node scripts/preflight.mjs` was failing on this story.** `no ending
   reachable (stuck at rs_street)` — the deep-walker never got past Kowloon
   Lane. Root cause: the preflight walker simulated only top-level hotspot
   actions (giveItem / setFlag / meter on `h.action`), so it never KICKED the
   vending machine (an extended-verb effect), never took the card from the
   multi-state tray, never answered Ping's linear conversation, and treated
   the repeatable alley door as a one-shot — so the `rs_keycard` gate could
   never open. **Fixed in `scripts/preflight.mjs`:** the walker now also
   applies verb-coin effects and multi-state object actions in its scenery
   fixpoint, lands in-place conversation replies before walking out, and
   treats repeatable room exits as re-crossable while preferring an exit into
   an unvisited scene (so "up the stairs" beats "back to the street" when
   both are open). `npm run preflight` now passes all 30 stories.
2. **Validator warning: `rs_npc_spinner` patrol stop 1 at (104, 11) — off
   the plate.** Kowloon Lane is a 100%-wide room (`worldWidth` unset), so the
   spinner's right-hand waypoint was outside every coordinate the camera can
   show. **Fixed in `src/data/rainSector.ts`:** the stop is now (98, 11) —
   it still sweeps the full skyline and ping-pongs back, but stays on-plate.
   This story is now validator-clean (0 warnings) as well as playable.
