# Hotspot trigger policy & masked / scrolling layers

Two engine features added to fix real creator friction found while rebuilding
**Blade Runner: Act One** in HD, plus the exit-audit validator checks that keep
the fixes honest.

---

## 1. Hotspot trigger policy — the "exit under the spawn" trap

### The bug
On a 🚶 stage, any marker the walker stepped on fired automatically. A 👣 exit
marker parked near the spawn point therefore **ejected the player the instant
they took a step**, and a shop whose only door sat by the entrance could not be
crossed without leaving. Reported as *"walking over hotspots activates them so I
can't get around the shop without exiting on the go hotspot."*

### The fix
`StageSettings.hotspotTrigger` selects when **strolling onto** a marker fires it:

| value | behaviour |
| --- | --- |
| `"smart"` *(default)* | objects & characters fire on step-on; **scene-leaving markers need a click** |
| `"walkover"` | legacy — everything fires on step-on (a chain of walk-off doorways) |
| `"aim"` | nothing fires unless the player aimed at it |

A marker's own `Hotspot.walkOver` (true/false) always overrides the room.
`remote` markers and walk-off-screen `exitEdges` are unaffected.

**Spawn guard:** under `smart`/`aim`, a marker the walker was *already* standing
on when the scene mounted never auto-fires for that visit (entry is not a search
action). Under an explicit `walkover` the guard is disabled, so pinned stories
replay the exact legacy behaviour.

Stories authored as walk-off chains (e.g. **Rain Sector**) set
`hotspotTrigger: "walkover"` and/or `walkOver: true` on their door markers.

Studio: **🚶 stage → 🎛 Interaction** picks the room policy; each hotspot has a
"🚪 fires when walked onto" override.

## 2. Masked + scrolling layers — the cockpit-window shot

`ForegroundExtra` gained:

- `maskImage` / `maskFit` / `maskInvert` — clip the layer to another image's
  **alpha** (`mask-mode: alpha`; invert via `mask-composite: exclude`).
- `scroll` (`axis`, `speed`, `crossSpeed`, `repeat`) — the layer's art becomes a
  repeating background that crawls in a seamless one-tile loop (pure `@keyframes`,
  no JS per frame).

The spinner cockpit combines them: a scrolling cityscape clipped to a windscreen
cut-out reads as the vehicle climbing through traffic.
See `br_spinner_flight` in `src/data/bladeRunnerAct1.ts`.

Studio: **🎬 cinematic → foreground layer** has "🪟 Alpha mask" and "🌀 Scroll" panels.

## 3. Exit-audit validator checks

- **One-way door** — a stage you can walk into but never back out of (suppressed
  when the scene has a 🗺 travel-map pin, so a hub never cries wolf).
- **Spawn trap** — a step-on exit parked on the spawn point.
- **Minigame producers** — ESPER regions / VK verdicts now count as flag/item
  producers, so a gate the minigame unlocks no longer reads as unsolvable.

All three are codified in `scripts/validator-audit.mjs` (24 → 27 checks).

## 4. Verification (2026-09-09)

| suite | result |
| --- | --- |
| `tsc --noEmit` | clean (base had 10 errors in `bladeRunnerAct1.ts`) |
| `scripts/engine-tests.mjs` | 1359 / 0 (was 1320; +39 new) |
| `scripts/validator-audit.mjs` | 27 / 0 |
| `scripts/sprite-key-tests.mjs` | 12 / 0 |
| `scripts/dom-smoke.mjs` | PASSED |
| `scripts/ie-roundtrip/run.mjs` | PASSED |
| `vite build` | ✓ single-file 4.3 MB |

**Note:** `scripts/beta/stage-harness.mjs` shows headless frame-budget flakes on
the *base* commit too (verified by stashing and re-running) — its "150/0" note is
stale. The deterministic suites above are the reliable gate.
