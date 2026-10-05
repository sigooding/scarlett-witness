# Foreground layers — beta test record

**Date:** 2026-09-03 · **Branch:** `arena/01a0686e-scarlet-reel`
**Purpose:** verify the sprite-sheet/foreground-layer feature set end to end
against the ten-point beta checklist — sheet layers (1/2/many frames), every
animation preset, the full-screen frame player, layer reorder/hide/rotate/
opacity, all six blend modes, composite parity across Studio preview · Stage
tab · game playback, parallax + occlusion with a moving actor, undo/redo,
save/reload/export/import, and the object-first verb pie.

**Harness:** `npm run test:foreground` → `scripts/beta/foreground-harness.mjs`
bundles `scripts/beta/foreground-probe.ts` (happy-dom + fake-indexeddb +
esbuild) and drives the real Studio and the real `GamePlayer` headlessly.
Result: **146 checks passed, 0 failed** (~110 s). Companion suites stayed
green: `npx tsc --noEmit` clean, `npm run test:stage` 154/154,
`npm run test:media` round-trip ✔.

`FGB_DEBUG=1 npm run test:foreground` additionally dumps the game DOM order
of the composite layers (Part B1.2) for eyeball debugging.

## The fixture

The probe authors a throwaway story (`fgx_*` rooms) through the REAL Studio
UI — sprite-sheet picker, SheetEditor grid, preset buttons, foreground layer
stack, blend/rotate/opacity knobs, undo/redo, autosave, export/import — then
publishes it and plays it back in the real game: a stage room with five
foreground extras (occluder with `occludes` + baseline, blend layers, hidden
layer, animated 1/2/many-frame sheet layers), a parallax classic scene, and
verb-pie/hold-pie rooms.

## Coverage map (checklist → checks)

| # | Checklist item | Where verified |
| --- | --- | --- |
| 1 | Sheets with 1, 2, many frames | A1 (sheet grid math, SheetEditor seeds; 1/2/8-frame fixtures) |
| 2 | Every animation preset adapts to short sheets | A2 (all presets applied; frame indices clamped to real cols×rows) |
| 3 | Scrub / play / pause / loop in frame player | A3 (player transport, loop fidelity incl. `loop:false` hold) |
| 4 | Reorder, hide, rotate, opacity on several layers | A4/A7 (stack rows, visibility toggle, knobs, undo/redo of each) |
| 5 | All blend modes vs. contrasting background | A5 (normal, screen, multiply, overlay, soft-light, difference) |
| 6 | Same composite in Studio · Stage tab · game | A6 + B1/B6 (three-way parity, blend/rotation/opacity included) |
| 7 | Parallax + occlusion with moving actor | B3 (stage pins parallax), B4 (walk behind → occluder paints over walker, walks out → normal), B6 (classic-scene planes, depth-derived shifts) |
| 8 | Undo/redo after layer edits + preset creation | A7 (byte-exact snapshot undo/redo, incl. Ping-pong preset edit) |
| 9 | Save / reload / export / re-import preserve everything | A8 (autosave settle, export/import id parity, reload draft equality) |
| 10 | Skull-pie verb menu selects the right object | B5 (object pie, verb firing, item pickup + USE, hold-pie sector hit/cancel, zero console errors) |

## Bugs found and fixed

1. **React nested-update storm during walks in occluder rooms**
   (`src/game/Game.tsx`). The Stage reported the walker's feet on every
   animation frame and Game stored each report in state — re-rendering the
   entire Game ~60×/s for every walk in any room with a walk-behind extra,
   cascading passive updates until React logged *“Maximum update depth
   exceeded … setState inside useEffect”* (surfaced as console errors
   mid-B5 of the probe; bisected with a minimal stage + occluder + ArrowUp
   repro, and the React-internal owner trace pointed at Stage's rAF `tick`).
   **Fix:** the live position stays in a ref; the callback diffs the
   occlusion-membership set and calls `setState` only when an `occludes`
   extra actually gains/loses the walker behind it (plus a reset on scene
   entry). Walk-behind behavior is unchanged (B4.3/B4.5 still green), and
   occluder-room walks no longer re-render the whole game per frame — a
   real-device perf win, not just a warning silencer.

2. **Stage-tab preview drifted from game playback** (`src/studio/Studio.tsx`).
   The Stage tab's composite preview rode parallax planes the pinned stage
   never draws; it now pins `parallaxDepth`/`parallaxLayers` exactly like
   the game's stage pin (A6.5 ↔ B3 parity both directions).

3. **SheetEditor preview/preset fidelity** (`src/studio/SheetEditor.tsx`).
   The preview looped `loop:false` animations (promising motion the game
   never plays) and now holds the last frame, replay restarts from frame 1;
   animation presets size their frame lists from the sheet image's REAL
   cols×rows (decoded natural size), so 1-frame uploads get frame 0 in every
   preset instead of indices that don't exist.

## Notes for authors (verified behavior)

- Stage playback **pins** foreground parallax by design (extras sit on fixed
  plates over the walker); classic scenes ride depth planes
  (`--plane-shift` = 4 + depth·26 px Studio-side, 6 + depth·22 in-game).
- `occludes` extras flip to a front pass (`z-[58]`) while the walker's feet
  are above the extra's `occludeBaseline` — the boot/spawn frame counts as
  in front until the first position report lands.
- Undo/redo is byte-exact on the whole cinematic draft; export/import
  round-trips preserve every foreground property (let autosave settle
  ~1.5 s before exporting).
