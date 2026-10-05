# Scarlet Reel — Studio-side beta test

**Date:** 2026-09-02 · **Branch:** `arena/01a062a7-scarlet-reel`
**Purpose:** beta-test the **Studio (editor) side itself**, with the assertions
of the previous beta tests (Rain Sector, Inspector Gadget, Scooby Ravenswood,
True Romance Cut) **deliberately not trusted** — every gate was re-run from
scratch and every editor flow was re-verified against the DATA the editor
produces, judged by the engine's own `validateStory()` imported straight from
`src/logic`, never by the Studio's rendering of it.

---

## 1. The probe

New permanent harness: **`scripts/beta/studio-beta-harness.mjs`** bundles
`scripts/beta/studio-beta-probe.ts` (esbuild, same trick as the other beta
harnesses) and mounts the **real `<Studio/>`** in happy-dom. The probe drives
only real UI affordances — toolbar buttons, tab buttons, selects, inputs —
never internal handles — and asserts on the autosaved draft
(`localStorage["scarlet-studio-draft-…"]`) after every step:

| Part | Flow under test |
| --- | --- |
| 1 | boot (no errors, no boundary trip) |
| 2 | ＋ New Story — blank contract (guided-draft validation, no error wall) |
| 3 | author a complete micro-case through the UI: scene, rename, character, item, beat, ending, choice wiring — zero validator errors at the end |
| 4 | Test tab / Playtester sees the authored choice |
| 5 | undo/redo restore the exact prior snapshots (draft-level, not label-level) |
| 6 | ⤓ Export — JSON in the export box deep-equals the draft and validates clean |
| 7 | ⤒ Import — a *marked* export (unique title) lands and round-trips intact, and stays settled (no late clobber) |
| 8a | build a reference graph using **every link kind**: choice, auto-advance, 🏁 ending, stage exit hotspot, walk-off left edge exit, map pin, episode claim — validates clean before the cut |
| 9 | ⧉ Duplicate Story — fresh ids, every scene reference (choices, hotspots, scripts, edge exits, entry spawns, map pins, acts, episodes) rewired **into the copy**, validates clean |
| 8b | delete the middle scene through the UI → Check flags every dangling class → 🛠 Repair → **zero** validator errors |
| 10 | unmount → fresh mount reopens the same draft byte-intact |

Scene selection deliberately avoids the flow canvas: new scenes auto-select,
the Episodes tab's scene buttons reselect, and a fresh mount with
`initialStoryId` reopens a registered case.

## 2. How it was tested (all re-verified this pass, none inherited)

| Suite | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| Engine tests (`scripts/engine-tests.mjs`) | **1114 passed / 0 failed** |
| Stage beta (`scripts/beta/stage-harness.mjs`) | **154 passed / 0 failed** |
| DOM smoke (`scripts/dom-smoke.mjs`) | PASSED |
| Import/export roundtrip | PASSED |
| Studio deep probe (`scripts/studio-deep-probe.mjs`) | **52 passed / 0 failed** |
| **Studio beta (new, this pass)** | **74 passed / 0 failed** — run 4× consecutively on the final build; 8c re-run against the pre-fix build **fails as designed** (proves the check bites) |
| `vite build` | 2.62 MB single-file / 704 KB gzip |

`npm test` now runs the studio beta permanently (after the stage beta).

## 3. Bugs found (all fixed in this pass)

1. **🏁-first authoring left the case with no start scene — silently.**
   `addScene` only claimed the start marker when `scenes.length === 0`, and
   `addEndScene` never does — so an author who sketches the endings first and
   *then* adds their first playable scene got `startSceneId: ""` forever:
   Check shows `Start scene "" does not exist`, Publish stays blocked, and
   nothing auto-fixes until you find the ★ checkbox by hand. **Fixed:** the
   first playable scene claims the start whenever the story has none (both
   `addScene` and `addStageScene`). Probe: 3.2 / 8a.1b.

2. **A late import silently clobbered everything done meanwhile.** Reading a
   `.reel.json` + compacting its media is async (IndexedDB round-trips);
   `importJson` committed the bundle whenever that finished — overwriting any
   edit made in between (add scene, ＋ New Story…) with no warning. The probe
   hit it as "New Story" reverting mid-flight. **Fixed:** `importJson`
   snapshots the story at start and **cancels loudly** ("the case changed
   while the file was reading") if the reel moved on, instead of losing work.
   Probe: 7.2–7.4.

3. **⧉ Duplicate Story left half the graph pointing at the ORIGINAL case.**
   Choices, hotspots and beats were remapped — but walk-off **edge exits**,
   **entry-script / run-script `goToScene` steps**, **entry-spawn keys** and
   **travel-map pins** kept the original's scene ids. The copy opened with
   `Map location → missing scene` / `Dangling link (➜ walk off left edge)`
   errors that blocked its Publish. **Fixed:** all four classes remap into the
   copy (probe asserts a story using every link kind duplicates with **zero**
   dangling references and validates clean).

4. **🛠 Repair couldn't fix what the validator flagged.** Deleting a scene
   dangles six kinds of references; Repair handled choices, hotspots,
   auto-advances, gates and recipes — but not **episode scene lists** (left
   `Episode "…" lists missing scene` errors with no auto-fix), **map pins**,
   **stage edge exits**, **entry/run-script steps** or **entry spawns**.
   **Fixed:** Repair now re-points edge exits, script steps and map pins to
   the start scene (same policy as choices), removes deleted ids from episode
   lists (dropping episodes left empty, keeping the unlock/handoff graph
   consistent), scrubs stale entry-spawn keys and re-points acts. Probe 8b:
   after delete → 4 dangling classes flagged; after Repair → **0 errors**.

5. **🛠 Repair "fixed" healthy stage rooms.** The validator counts a
   walk-off edge exit (and after-beat routes, entry scripts, puzzle
   branches) as a way out; Repair's guaranteed-exit check counted only
   auto-advance/choices/hotspot targets. A structurally sound stage whose
   only door was the edge arrow got a bogus `"Move on."` choice injected —
   and a clean reel reported "Repaired 1 issue". **Fixed:** Repair's exit
   accounting now mirrors the validator (multi-state hotspot actions and
   script steps included). Probe 8c builds an edge-exit-only stage, runs
   Repair, and asserts the reel comes back **byte-identical** — verified
   against the pre-fix build, where 8c fails with the injected choice
   visible in the output.

## 4. Traps that were NOT app bugs (recorded so the next probe doesn't bite)

- **Two buttons say "🚶 Stage"** — the toolbar one *creates* a stage scene,
  the inspector tab one switches panels. A naive text-match click creates a
  second stage whose seeded-but-unwired "The way out" exit hotspot then fails
  validation (by design — the toast even says "wire the exit marker's
  target"). The probe now scopes tab clicks to the tab grid.
- **A fresh 🚶 stage intentionally validates with errors** until its exit is
  wired (seeded `goToScene` hotspot ships with an empty target on purpose).
- **Scene buttons in the Episodes tab carry ★/🏁 badges** before the title —
  exact-text matching misses them.
- **Hotspot/edge editors live in collapsed `CollapsibleSection`s** (⌖/➡
  headers) — their selects don't exist until the header is clicked.
- One earlier run printed React `NaN cx/cy/r` SVG warnings during a
  malformed probe sequence (zero-size geometry in happy-dom); investigated,
  not reproducible through the real UI in 4 subsequent runs.

## 5. Verified-good contracts worth keeping

- Blank-case validation is a guided draft (one warning, no error wall).
- The micro-case authored purely through the UI validates with **zero
  errors**; export deep-equals the draft and re-imports byte-identical.
- Undo/redo round-trips the exact autosaved snapshot (title in → undo →
  redo), including the 600 ms commit-coalescing window.
- Draft reload across a fresh mount is byte-identical for scenes and start
  scene (layout may self-heal by design).
- Duplicate ids are fresh across scenes; `(copy)` title; layout offset.
