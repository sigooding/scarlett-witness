# Sledge Hammer! — "The Caliber of a Gentleman" · Studio Beta Test

**Story id:** `sledge-hammer-caliber` (`src/data/sledgeHammer.ts`)
**Beta date:** 2026-09-05 · **Passes complete:** 2 of 5 · **Status:** playable, validator-clean with **zero warnings**, all gates green.
**Re-audit any time:** `npm run test:sledge` (105 logic checks) and `npm run test:sledge-dom` (the case mounted in happy-dom). Both are wired into `npm test`.

Built end-to-end through the repo's headless authoring pipeline (art plates → key/slice → story data → validator → engine tests → build) as a broad feature-shake of the Studio, in the spirit of the Tintin and Scooby homage cases. A fan homage with original dialogue and plot; unofficial, non-commercial.

---

## 1. What shipped in this pass

### The case
Pawnbroker Marvin Quillan is shot in his own alley with forty dollars still in his hand — nothing taken, no robbery. Detective Sledge Hammer works the evidence (against a direct order to work *only* the evidence), and the trail runs from a match-grade shell casing to a pawn ticket signed by a councilman four weeks from being mayor. **Five endings** (gold talk-down / silver shot / hesitation / heat suspension / desk duty), heat limit 8.

### Art budget — 10 generated images (the agreed cap)
| Asset | Pipeline | Used as |
|---|---|---|
| `plates/sh-sledge-talk.png` | keyed + sliced, 3 frames (260×512) | `character.talkingSheet` — Sledge |
| `plates/sh-doreau-talk.png` | 3 frames (171×512) | `talkingSheet` — Doreau (right, flipped) **and** the squad-room NPC |
| `plates/sh-trunk-talk.png` | 3 frames (298×512) | `talkingSheet` — Captain Trunk |
| `plates/sh-mayor-talk.png` | 3 frames (261×512) | `talkingSheet` — Councilman Vane |
| `plates/sh-sledge-walk.png` | 4 frames (105×200) | `story.playerSprite.sheet` — the walker in all three rooms |
| `public/img/bg-sh-squadroom.jpg` | — | stage 1 + the desk-duty ending |
| `public/img/bg-sh-alley.jpg` | — | stage 2 (crime scene) **and** the case cover |
| `public/img/bg-sh-trunk-office.jpg` | — | the briefing, the interview room, the suspension ending |
| `public/img/bg-sh-firing-range.jpg` | — | stage 3 (ballistics + the ledger puzzle) |
| `public/img/bg-sh-rooftop.jpg` | — | the quick-time finale + 3 endings |

All five plates sliced first time, no bridging, via `scripts/make-sprite-sheet.mjs --key ff00ff`. The pass-2/3 recovery path was never needed.

### Studio features exercised by this one case
- 🚶 **Stage 2D ×3 rooms** — sprite-sheet walker, obstacles, proximity hints, `enterCaption`, `sentenceLine`, `exitEdges` (walk left out of the alley back to the precinct), an ambient NPC wired to a TALK marker, remote hotspots, hold-to-EXAMINE.
- 👢 **Extended verbs** — the `extendedVerbs` kick/punch opt-in, dogfooded hard: Sledge's entire character is a verb. Opted in for two rooms, deliberately *not* the third, to prove the per-room scope holds.
- 🔁 **Multi-state object** — the pawn shop grille (shut → kicked in → ransacked), re-skinning in place with no marker re-mount.
- 🗣 **Topic-list dialogue** — Doreau's squad-room hub (`topics`, `topicPrompt`, a repeatable topic).
- 🎯 **Press the Lie ×2** — the alley denial (broken by the pawn ticket) and the cheques-only denial (broken by the ledger page), with wrong-evidence limits and `composureDamage`.
- 🕵 **Interrogation** — composure pressure on Vane (composure 4, `crackTrust` 1); the two lies deal exactly 4 damage, and trust decides crack vs clamp.
- 🧩 **Pattern puzzle** — the campaign finance ledger (3 cash walk-ins among 5 cheque decoys), retry allowed.
- ⏱ **Quick-time** — the rooftop; *every* option is on the clock, with a real "you hesitated" ending.
- 📌 **Corkboard** — three pins gate the gold ending.
- 💬 Reply Q&A with `memoryLog` + `{said}` recalls, `presentItem`, hidden gated choices, `exclusiveGroup`, chained `then` actions, `acceptsItems`/`itemResponses` gags, heat limit + bust, `partBreak`, flag notes, container inventory.

### Production gates (all re-run this pass)
`npx tsc --noEmit` clean · `npm run check` — every asset this case references on disk · `npm test` **exit 0** (engine 1250/1250, sprite key 12/12, import/export round trip, DOM smoke, stage beta 154/154, studio beta 74/74) · `npm run build` single-file OK · `node scripts/preflight.mjs` → this story **validator clean, zero warnings**, 2 victory / 3 game-over, 10/10 assets · `npm run test:sledge` **86/86**.

---

## 2. Verdict on the studio (short version)

The authoring model held up under a from-zero case in an unfamiliar genre: every feature I reached for existed, typed cleanly, and the type system caught my one bogus field (`verbs: { knock: … }`) instantly. The validator is genuinely good — it caught four real authoring mistakes of mine that would each have shipped as silent dead content.

But this pass found **four problems in the tooling itself**, and one of them is serious: **`npm test` could not pass on this repo at all.** All four are fixed in this pass.

---

## 3. Problems found

### 3.1 🔴 `npm test` always failed — the studio beta harness could never exit 0 (**FIXED**)

`scripts/beta/studio-beta-harness.mjs` prints `=== STUDIO BETA: 74 passed, 0 failed ===` and then exits **1**. Because it is the last command in the `npm test` chain, `npm test` exited 1 on a completely clean tree — verified against unmodified `main`, so this predates this pass.

**Root cause.** The harness writes a *generated* `entry.mjs` to a scratch dir and imports it. It passed the probe's exit callback as **source text** embedded in that generated file:

```js
await probe.run({ …, exit: (code) => { probeExitCode = code; } });
```

`probeExitCode` is a `let` in the *harness's* module scope. `entry.mjs` is a separate module and cannot close over it, so the callback threw `ReferenceError: probeExitCode is not defined` on **every** run. The harness's own `catch` then set the exit code to 1.

Worse, the failure was **invisible**. The catch block reports via `console.error`, but the probe replaces `console.error` (to capture React's output into its `problems` array) and never restores it — so the crash report was swallowed and the harness looked green while failing. It took a patched copy writing to `process.stderr` to see it at all.

**Fix (in this pass).** The probe now reports its code through a sidecar file the parent reads back after the import, so no cross-module closure is involved; a missing file is itself treated as a failure. The harness's crash path writes straight to `process.stderr` rather than the hijacked `console.error`. Verified both directions: clean tree → exit 0; with one deliberately failing check injected → `74 passed, 1 failed` and exit 1. The gate is live again rather than merely quiet.

> **Lesson for the other harnesses:** never pass a callback into a generated entry as source text. Any `${}` interpolation of a function body silently loses its scope.

### 3.2 🔴 `npm run preflight` died on the whole catalogue — missing `--resolveJsonModule` (**FIXED**)

`node scripts/preflight.mjs` failed instantly with:

```
src/data/stories.ts(38,26): error TS2732: Cannot find module '../../undertow.reel.json'.
Consider using '--resolveJsonModule' …
```

Preflight compiles the catalogue with a standalone `npx tsc` invocation that lists its flags by hand, and that list omitted `--resolveJsonModule` — which the repo's own `tsconfig.json` sets. Since UNDERTOW is imported straight from a `.reel.json`, preflight could not compile a tree that `npx tsc --noEmit` accepts. **Fixed** by adding the flag to the invocation, with a comment explaining why it must track the tsconfig.

Note the shape of this bug: a second, hand-maintained copy of the compiler configuration drifting from the real one. It is worth auditing the other scripts that spawn `tsc`/esbuild by hand for the same drift.

### 3.3 🟠 Validator false positive: `interrogation.brokeConsequences` flags counted as ungrantable (**FIXED**)

Gating the rooftop on `sh_confession` — a flag set by the interrogation's `brokeConsequences` — produced a hard validator **error**:

> Flag "sh_confession" is required by a gate but no choice, hotspot, puzzle, or board connection sets it.

This is wrong. `Game.tsx` genuinely applies `brokeConsequences` / `clampConsequences` at the crack/clamp outcome, and `collectFlags` (logic.ts:817) already counts them. Only the *grantable-flag* walker in `validateStory` omitted them: it added `brokeFlag` and `clampFlag` but stopped there. The natural way to author "the confession unlocks the finale" was therefore reported as an impossible gate, pushing authors toward the workaround of gating on `brokeFlag` and duplicating state.

**Fixed** in `src/logic.ts` — the walker now also collects `setFlags` from both consequence blocks, with a comment. Pinned by a check in the new harness (`the crack sets sh_confession via brokeConsequences`).

### 3.4 🟡 Duplicated word in the NPC animation warning (**FIXED**)

The NPC sheet check emitted:

> NPC "sh_npc_doreau" idle motion **motion** "rest" is not an animation on its sheet

The `where` label already contained the word "motion" and the template appends it again. Cosmetic, but this is the string an author reads while confused. Trimmed the label to `"idle"`.

---

## 4. Authoring mistakes the validator caught (working as intended)

Worth recording, because these are the ones the tooling got *right* — each would otherwise have shipped as content that silently never fires:

1. **`acceptsItems` with no way to answer.** The comparison microscope accepted the casing and the gun but its default action was `setFlag`, which cannot resolve an armed item — the player would arm evidence and be refused by content I had written. The warning named the exact fix (add a ⚙ `use` action or a `useItem` default).
2. **NPC sheet animation names.** I reused the talking sheet (`rest`/`talk`) for an ambient NPC, which is looked up as `idle`/`walk`. The engine would have fallen back silently; the validator named the mismatch and the call site.
3. **Write-only flags ×5.** `sh_has_coffee`, `sh_saw_board`, `sh_heard_case`, `sh_saw_outline`, `sh_hesitated` were set and never read. Each became a `flagNote`, so they now surface in the player's Case Progress readout instead of being dead state.
4. **A recorded memory nothing recalls.** `sh_showed_ticket` was logged by the present-item choice with no beat echoing it — so the dramatic beat of sliding the ticket across the table had no payoff. Added Doreau's for-the-tape line with a `{said}` recall.

The type system also caught a stray `verbs: { knock: undefined }` immediately — `CursorKind` is a closed union and there is no `knock` verb.

---

## 5. Smaller observations (no fix needed this pass)

- **The preflight deep-walker under-walks this case** (5/11 scenes; the shallow walk terminates on the desk-duty ending after 3). It does not model hotspot-driven stage travel, pattern-puzzle rewards, press-the-lie or interrogation outcomes, so it cannot reach the interview room or the roof. The same gap is documented in the Scooby pass §3.1. Not a blocker — the dedicated harness covers those routes through the real engine — but `preflight`'s coverage number should be read as "graph reachability", not "playability", on any case built around stage rooms.
- **`playerSprite` at story level is the right default.** Authoring the walker once on the story and letting all three stages inherit it removed three duplicated sheet blocks. Worth surfacing more prominently in the stage tab's UI copy, since the per-scene `playerSheet` field is the one an author meets first.
- **Multi-state ordering is easy to get wrong and well-guarded.** Listing the unconditional default first is load-bearing; the doc comment says so, and the validator warns on a later unconditional state. That combination worked exactly as advertised.

---

---

# PASS 2 — art completion, and a DOM harness for the case

**Focus:** close the pass-1 art gaps, exercise three Studio surfaces pass 1 never touched, and mount the case in a real DOM — because a pure-logic probe cannot see a sprite that fails to render.

## P2.1 What shipped

### Art budget — 10 generated images
| Asset | Pipeline | Used as |
|---|---|---|
| `public/img/cover-sh-hammer.jpg` | — | dedicated cover art (was reusing the alley plate) |
| `public/img/bg-sh-interview.jpg` | — | the interview room (was reusing Trunk's office) |
| `public/img/bg-sh-end-gold.jpg` | — | the gold ending — dawn roof, empty cuffs, open gun case |
| `public/img/bg-sh-end-silver.jpg` | — | the silver ending — the revolver in two pieces |
| `public/img/bg-sh-end-hesitated.jpg` | — | the hesitation ending — cold, grey, empty parapet |
| `plates/sh-mayor-cornered.png` | keyed + sliced, 3 frames (283×512) | `talkingSheets` — Vane's **"cornered"** expression variant |
| `plates/sh-fg-tape.png` | 3 frames (148×120) | animated `foregroundExtras` — the alley cordon tape |
| `plates/sh-icon-casing.png` | 1 frame (294×128) | `item.iconUrl` — the shell casing |
| `plates/sh-icon-ticket.png` | 1 frame (125×128) | `item.iconUrl` — pawn ticket 4471 |
| `plates/sh-icon-ledger.png` | 1 frame (209×128) | `item.iconUrl` — the ledger page |

All ten sliced first time. Notably `--frames 1` (a single object on magenta, for the inventory icons) works cleanly — a slicer path neither previous homage case had used.

### New Studio surfaces exercised
- 🎭 **Expression variants** (`character.talkingSheets`) — Vane's composed campaign face swaps to a sweating, tie-askew "cornered" sheet on all four beats that already said `expression: "cornered"`, including the interrogation crack. The engine matches variant name to beat expression (Game.tsx:6329).
- 🌫 **Animated foreground extra** (`cinematic.foregroundExtras`) — the police tape across the alley, a 3-frame `loop` sheet with `occludes: true`, so Sledge walks *behind* the cordon.
- 🎒 **Item icon art** (`item.iconUrl`) — painted icons for all three clues, each keeping its emoji as fallback.
- 🖼 **Distinct ending plates** — the bar the Scooby harness sets and pass 1 missed: all five endings, and now every non-ending scene too, have their own plate.

## P2.2 A DOM harness for the case — `npm run test:sledge-dom`

The pass-1 probe proves the *logic*. It cannot prove a sheet renders, and a talking portrait that silently fails to mount produces no validator error and no engine-test failure. So this pass adds `scripts/beta/sledge-dom.mjs`: the real `GamePlayer` mounted in happy-dom on every room, the extras layer and all five endings, asserting markers, walker, sprites and plates — and failing on **any** `console.error`, warning, uncaught throw or error-boundary trip.

Result: all rooms, the extras layer, the two-shot and all five endings render **with zero console errors and zero warnings**.

### A note on how it is built
`dom-smoke.mjs` embeds its mounted program as an interpolated template literal, so every backtick and `${}` in the test body must be hand-escaped. I hit exactly that wall porting the prelude — a syntax error in generated code that no linter, editor or type-checker ever sees. So the mounted program here lives in **`scripts/beta/sledge-dom-entry.jsx` as a real file** that the harness copies into its scratch dir. Same technique, but greppable, diffable and lintable.

This is the second time in two passes that generated-source-as-a-string has cost real debugging time (see §3.1 — the studio harness's invisible exit-code bug lived in exactly this pattern). **Recommendation: the harnesses should move their entry programs to real files.**

## P2.3 What the DOM harness caught

Both findings turned out to be **my tests being wrong, not the engine** — which is itself the useful result, since both looked like bugs at first:

1. **"The squad room renders 3 markers, not the 4 hotspots I authored."** Correct behaviour: the TALK zone is bound to Doreau via `talkHotspotId`, so the *actor becomes the marker* (Stage.tsx:2042) and no floating pip is drawn. That is the point of the feature — you click the person, not a hovering icon. The test now asserts the *inverse* (that the NPC-bound zone draws no pip, and that the NPC sprite is on stage), which is the property actually worth pinning.
2. **"Vane's portrait never mounts."** The scene opens on prose; portraits mount when the beats begin. The test was asserting before advancing. It now clicks through and additionally checks that the two-shot mounts **both** speakers' sheets, not just the active one.

I have left both as explicit, commented checks rather than deleting them — the documented behaviour is now pinned against regression in each case.

## P2.4 Regression risk reviewed (no bug found)

`foregroundExtras` and `item.iconUrl` are precisely the media-bearing fields RUNNING.md warns about: they must appear in all of `visitStoryMediaRefs`, `resolveStoryMedia`, `compactStoryMedia`, the voice-pack bundler, the round-trip seed and preflight's asset check, or an `asset:` reference reaches the browser as a literal URL and renders nothing, silently. I audited all six call sites for `foregroundExtras`, `talkingSheets` and `iconUrl` — **every one is correctly wired**. No fix needed; recording the audit so the next pass need not repeat it.

## P2.5 Gates

`npx tsc --noEmit` clean · `npm run check` — every asset resolves · **`npm test` exit 0** (engine 1250, sprite key 12, round trip, DOM smoke, stage 154, studio 74, **sledge 105**, **sledge-dom PASSED**) · `npm run build` OK · `preflight` → validator clean, zero warnings, 19 assets on disk.

---

## 6. Suggested pass 3

*(Pass 2 delivered the cover, the ending plates, the "cornered" variant and the item icons. Remaining:)*

Art (next 10 images): a 4-frame Trunk "apoplexy" sheet; a Doreau "alarmed" variant; scene-object art for the grille/dumpster/microscope so the alley reads without marker labels; a cutscene plate for the part break.

Engineering, in priority order:
1. **Move the beta harnesses' entry programs out of template strings into real files** (see P2.2). Two passes, two bugs from this pattern.
2. Audit the other harnesses for the §3.2 hand-copied-compiler-flag drift.
3. Teach the preflight walker about stage hotspot travel, so its coverage number means something on adventure-mode cases (still 5/11 here).
4. Consider a shared `scripts/beta/dom-prelude.mjs` — this pass copied ~120 lines of happy-dom setup out of `dom-smoke.mjs`, which is duplication that will drift.

---

## PASS 3 — depth, sprite scale, and the unreachable verb coin

Ten images: five foreground props (`sh-fg-{fence,bush,railing,cabinets,dumpster}`),
an inventory container panel (`sh-inv-coat`), two expression sheets
(`sh-trunk-apoplexy`, `sh-doreau-alarmed`) and two object sprites
(`sh-obj-{grille,scope}`).

### Studio bugs found and fixed

**#5 — the inventory dock sat on top of the verb coin and ate its clicks.**
The verb coin is hardcoded to `bottom-3 left-3 z-[200]` (`Stage.tsx`), and
`inventoryDisplay()` defaults the dock to `anchor: "bottom-left"`
(`logic.ts:1506`), rendered at `z-50` (`InventoryDock.tsx:328`). Both land in
the same corner. The dock is lower in the stack so the coin *drew* on top, but
the dock's buttons still occupied the space and swallowed the pointer — on a
verb-coin room the coin was decorative. Any story using the default dock plus
a coin hit this; it is not specific to this story.

Fixed in `Game.tsx`: the resolved display is now wrapped in a `useMemo` that
moves the dock to `bottom-right` when the scene is a coin room **and** the
author set no explicit anchor. An explicit anchor is always respected — the
guard only fills in a better default.

**#6 — the whole cast was rendered at a fixed 96 px.**
`Stage.tsx` passed `height={96}` to `SheetSprite` for both the player
(`:1984`) and ambient NPCs (`:385`), while the plate itself scales with the
viewport. On a laptop the characters were roughly half the height the room was
drawn for, and on a large monitor they were doorknobs. The depth maths
(`stageSpriteScale` × `stagePlayerScale`) was fine — it was multiplying a
constant.

Fixed by measuring the plate with a `ResizeObserver` and deriving the sprite
height from it: `stageSpritePx()` / `STAGE_SPRITE_FRACTION` in `logic.ts`.
The fraction (0.22) reproduces the old 96 px at the ~440 px plate the layout
used to assume, so existing rooms are unchanged at that size and simply stop
shrinking above it. The non-sheet fallback paths (`h-24`, `text-5xl`) had the
same bug and now follow the same measurement.

**#7 — the chroma keyer had no despill, so every fine-detail sprite got a pink halo.**
`make-sprite-sheet.mjs` cut alpha by distance from the key but left the
surviving pixels' RGB alone. Anti-aliased edges are blends *toward the key*, so
they kept their magenta. Invisible on a chunky silhouette; on chain-link mesh,
railings and stray leaves nearly every pixel is an edge pixel and the sprite
renders fringed. Added a despill pass that pulls the key's dominant channels
back to the neutral channel's level. Affects every sprite the repo builds.

**#8 — an occluder above the floor line is a silent no-op.**
Caught by a new probe assertion, in my own pass-2 art: the alley's cordon tape
had `occludes: true` at `y: 62`, but that room's floor starts at 74%. The
walker's feet can never get above the baseline, so the flag never fired and
the tape had been drawing behind Sledge all along with no error anywhere.
Pinned the tape's `occludeBaseline` to 88, and the probe now checks this
invariant for every occluder in every stage room. **Studio should surface this
as an authoring warning** — it is undetectable by eye if you don't already
know the answer.

Also found: `expression: "warning"` and `"furious"` were authored on beats with
no matching `talkingSheets` variant, and the engine silently plays the neutral
sheet. A missing expression variant is another good validator warning.

### Story-side work
Walk-behind depth in all three stage rooms (cabinets in the squadroom; fence,
dumpster and bush in the alley; a safety rail across the range), object art on
the grille and microscope hotspots, and the trench-coat inventory container.

Probe grew to **129 checks**; sledge-dom still passes; `npm test` exits 0.

---

## PASS 4 — doors, and walk-behind regions

No images this pass; both items were engine/Studio work.

### Where the door setting is

**Hotspots tab → 🚧 Barriers (no-go) → click a barrier → 🚪 Door.**
It's a *gate on a barrier*, not a separate "door" object, which is why it's
easy to miss — the vocabulary is the full `Gating` (flags, items, memories).
While the gate is shut the barrier is a solid wall the router respects; the
moment it opens the barrier ceases to exist. That makes a lock **spatial**:
the player can see the far side of the room the whole time and simply cannot
walk there, instead of a hotspot that merely refuses.

There is also a **🚪 Doors: open/shut** toggle on the stage preview, so you can
flip between the locked and unlocked layout while authoring.

I tried it and **found no defects** — it is wired correctly end to end:
`activeStageObstacles` (logic) → `Game.tsx:5880` → `Stage`'s router, and the
validator already flags a door whose flag nothing can set. The gap was that
nothing in this story used it, so it had no regression coverage. The alley
grille is now a real door: shut, it walls off the back of the alley; kick it
in (`sh_grille_kicked`) and the barrier vanishes. Pinned in both harnesses.

### New: walk-behind regions (🪟)

What you described — draw around the desk that's *already in the background*
and have it cover the character — did not exist. The closest things were
`foregroundExtras.occludes` (needs a **separate cutout image**) and
`hotspot.occludes` (needs **object art**). Neither helps when the desk is
simply painted into the plate.

Added `stage.occluders`: a polygon plus a depth line. The region redraws the
**room's own background**, clipped to the shape, at the depth of its baseline.
Because the fill *is* the plate, sized identically, it registers with the art
pixel-for-pixel at every viewport size — there is no cutout to export and
nothing to keep in sync.

Sorting is what makes it cheap: regions get a z on the **same `50 + y` scale
the walkers already use**, so the browser decides who is in front, frame by
frame, with no per-frame JS. Feet above the line → covered; step forward →
you're in front. The layer is `pointerEvents: "none"` **inline** (not just via
a class) — it covers the walker and every marker, so it must not be able to
eat clicks even if the stylesheet fails to load.

- Types: `StageOccluder`, `StageSettings.occluders` (`types.ts`).
- Logic: `activeStageOccluders`, `occluderBaseline`, `occluderZ`,
  `occluderPolygonCss`.
- Studio: **Hotspots → 🪟 Walk-behinds** — drag around the desk, then set the
  label, the depth-line slider (defaults to the shape's front edge) and a
  visibility toggle. The depth line is drawn across the plate, because that is
  the part you cannot see from the shape alone.
- The three neighbouring features now read as a set: `obstacles` = where you
  may **walk**; `occluders` = what **covers** you; `foregroundExtras` = the
  same as occluders but for art that **isn't in the plate**.

**Studio fix #9 — the dead-occluder trap is now a validator warning.**
This is the bug that bit me in pass 3 (the cordon tape) and it applies equally
to the new regions: a depth line above the walkable floor can never be
crossed, so the occluder is either always-on or never-on, with nothing on
screen to say which. The validator now warns for both `occluders` and
`foregroundExtras`, naming the region and both numbers. Verified it fires on a
sabotaged baseline and stays silent otherwise.

Two walk-behinds are authored in the squad room (the centre desk cluster and
the right-hand bank). Probe 147 checks; the DOM harness pins that each region
renders, is filled with the plate, is clipped, carries the right z, and sorts
correctly in front at the spawn and behind at the back wall.

---

## PASS 5 — the drive minigame, sprite resolution, NPC previews, featured cases

Ten images: the car rear, a tiling road plate, three oncoming vehicles, three
road hazards, a driving portrait sheet, a dashboard overlay, a crash card, a
police light bar, a drive-street plate and a banner cover.

### 🚗 The drive

`RideConfig` — a lane-dodging ride — **already existed** and was never used by
this story. It had no art hooks and played in silence, so this pass extended
it rather than building a new node type:

- `roadImage` — a seamless tiling plate scrolled toward the player, replacing
  the built-in CSS asphalt. Tied to the ride's `speed` so road and traffic
  agree about how fast this is.
- `horizonImage` / `dashboardImage` — scenery behind, cockpit in front. The
  dashboard turns a top-down dodge into a first-person drive **without
  changing any of the play**.
- `crashImage` — the wreck on the crash card.
- `driverName` / `driverSheet` / `nearMissLines` / `startLines` — the running
  commentary, with a portrait.

The quips fire on the **near miss**, not the crash. A crash ends the ride, so
a line there is barely seen; the dodge is where the joke lands. Lines are
consumed in order and only recycled when exhausted, so one run doesn't repeat.

The drive sits on the **alley → range** trip only. Walking into Trunk's office
still routes directly, because that is a corridor, not a journey — the probe
pins this so nobody later wraps every transition in a car.

Crashing still gets you to the range. Losing costs a trust point and a heat
point rather than walling off the case, which is the right shape for a comedy;
the probe pins both that the crash route *reaches* the range and that it
*costs* something.

### Sprite resolution — you were right, it's the slicing step

`--height` on `make-sprite-sheet.mjs` is the sheet's real pixel resolution and
a hard ceiling on sharpness. Sledge's walk cycle had been sliced at **200px**
while the engine now asks for 300–400px on a large display, so it was being
upscaled and going soft. Every character sheet was re-sliced from the original
plates: the walk cycle at 512 and all talking sheets at 640 (2.5× the pixels).

**Studio fix #10 — the slicer now warns instead of failing silently.** It
warns when `--height` *upscales* the source (naming the tallest frame, so you
know the ceiling) and when it is below 256 for a stage character. Both were
verified to fire. This is the kind of defect that reads as "the sprites look
wrong" for an hour before anyone suspects the build step.

`STAGE_SPRITE_FRACTION` also went 0.22 → **0.30**. 0.22 reproduced the
historical size exactly, and the historical size was itself too small.

### Studio fix #11 — the NPC tab preview showed the wrong character

The ambient-NPC plate preview read `npc.image` and **ignored `npc.sheet`
entirely**. Most ambient actors are sheet-only, so the whole cast rendered as
the 🚶 placeholder emoji — you were positioning glyphs, not people. It now
draws the real actor with `SheetSprite`, idling as the game draws it.

### Studio fix #12 — the ambient cast is now on the main stage plate too

The Hotspots canvas drew the player start but no NPCs, so you placed markers
and barriers with no idea who would be standing there. The cast now appears as
ghosts (same treatment as the player start), labelled and non-interactive —
the NPC tab still owns positioning.

### ★ Featured cases

`TitleTheme.featuredStoryIds` — full-width banner cards above the ordinary
grid, set in **Studio → Global Title Page Theme → ★ Featured cases**. Tick
order is the running order. Unresolvable ids are skipped so a hidden or
deleted case can't leave a hole on the front page, and a featured case is
removed from the grid below rather than appearing twice.

Two bugs caught while wiring it, both from `stories` no longer being the whole
list: resuming a featured case would have failed, and the "last case on the
stand" guard would have miscounted. Both now read the full catalogue.

Probe **168 checks**; sledge-dom passes; `npm test` exits 0.

### Known issue for a later pass
The generated car sprite came back with the word "SPRITE" written on it and a
baked-in ground shadow. The corrective regeneration hit this turn's image cap,
so `plates/sh-car-rear.png` still needs one re-render. **Done in pass 6.**


---

## PASS 6 — the invisible verb coin, extended stages, draggable walk-behinds

Pass 6 was driven by a player-side report that the game had become
**unplayable**: foreground art was covering the inventory and the choice menu,
the verb coin was invisible, and Captain Trunk's office could not be reached at
all. Alongside that, the Studio crashed on load and a featured reel could not
be un-featured. Four Studio bugs, all fixed.

### Bug #13 — the Studio crashed on load

`Cannot read properties of undefined (reading 'id')` at `StudioInner`, on
`baseStories[0].id`. `App.tsx` was handing the Studio `baseStories={stories}` —
but `stories` is the **grid** list, which by then had featured cases *filtered
out of it*. With the only case featured, the Studio received `[]` and the
subscript threw before the first paint.

Fixed by passing `allStories`. The hero button had the same flaw
(`play(stories[0])` on an empty list) and now falls back through
`featuredStories[0] ?? stories[0] ?? catalog[0]`. `export function Studio` also
gained an empty-catalogue guard panel instead of dying on the subscript.

> **This is the fourth time the same mistake has shipped.** A list filtered for
> *presentation* keeps getting reused as the *canonical catalogue*.
> `featuredStoryIds` has now broken resume, the last-case guard, the hero
> button, and boot. Anything that means "all cases" must read `allStories`.

### Bug #14 — a featured reel could not be un-featured

Same root cause, different symptom: the ★ Featured picker only listed cases
present in `baseStories`, so once a case was featured it vanished from the
list that would have let you untick it. The picker now renders an **orphan
row** for any featured id it cannot resolve (red, `⚠ {id} — no longer in the
catalogue`, with a `remove` button) plus a **clear featured strip** button.
Un-featuring no longer depends on the case still being visible.

### Bug #15 — foreground art ate every click (the blocker)

The reported symptom was cosmetic-sounding — "art covering the inventory" —
but the cause was input, not paint. The three `ForegroundExtraImage` roots in
`Game.tsx` were marked `aria-hidden` and nothing else. **`aria-hidden` hides an
element from assistive tech; it does not stop it receiving pointer events.** A
prop scaled up to 2.5× spread its (mostly transparent) box across the whole
room and swallowed the verb coin, the dock and every stage marker beneath it.
Trunk's office was unreachable because his door marker was underneath a
transparent PNG.

All three roots and the `parallax-mid` wrapper are now `pointer-events-none`
(`ForegroundLayer` already had it). Decorative overlays must be
**`pointer-events-none`, not merely `aria-hidden`.**

The regression test is in `sledge-dom`: it walks every `sh-fg-*` image up its
ancestor chain and fails if none of them disables pointer events. Flipping the
guard back off in `Game.tsx` turns it red (`2 of 2 props would eat input`), so
it genuinely pins the bug rather than the fix. A second test clicks the office
door marker, opens the coin and picks GO, proving the office is reachable
through the real DOM.

### Bug #16 — walk-behinds could only ever be rectangles

Occluder polygons support any number of points, but the Studio could only
draw a 4-point box — so a walk-behind could never follow a staircase or a
desk's actual silhouette. `HotspotCanvas` now renders **draggable violet
corner handles** on the selected region, with:

* live vertex preview while dragging (the `clipPath` updates under the cursor),
  committed on release as **one** undo step;
* **edge-midpoint dots** that insert a new corner;
* double-click to delete a corner, refused below 3 points;
* a `data-occ` guard on the canvas pointer-down, so grabbing a handle no
  longer starts drawing a new region.

### Bug #17 — a stale `frameWidth` silently slices portraits mid-face

Found while wiring up the improved likeness art. A sprite sheet's authored
`frameWidth` must divide the PNG exactly, but the number lives in the story
while the width lives on disk — regenerate the art at a different size and
nothing complains. Every frame is then sampled off-centre. Three of the four
new talking sheets were wrong (Sledge 325→296, Trunk 372→298, Vane 326→288),
and the check immediately caught four more I was about to ship (the walker at
268→274, Doreau's stage sheet at 171→221).

Neither the type system nor the runtime validator can see this, because only
the file knows how wide it is. `scripts/preflight.mjs` now reads the PNG
header for every `talkingSheet`, `talkingSheets`, `playerSheet`, NPC sheet and
foreground extra, and fails with the arithmetic:

```
FAIL  sprite geometry: sh_squadroom: playerSheet — frameWidth 268 does not
      divide the 1096px sheet (4.09 frames; try 274)
```

### Extended stages

`stage.worldWidth` existed but **no story had ever set it**, so the wide-world
camera path was completely untested. The squad room and the alley are now
`worldWidth: 200` — two screens each, on new 32:9 panoramas
(`bg-sh-squadroom-wide.jpg`, `bg-sh-alley-wide.jpg`), with the camera panning
as Sledge walks. Trunk's door now sits out on the far screen, which is what
made bug #15 so visible.

This surfaced a genuine authoring trap worth writing down:

> **A wide stage mixes two coordinate spaces.** Hotspots, obstacles,
> occluders and spawns are a % of the **world** (`0..worldWidth`). Foreground
> extras are a % of the **viewport** and are clamped to `0..100` by the
> renderer. Rescaling a room to a wide world and scaling the extras with it
> pins every prop to the right-hand edge — silently, with no error anywhere.

I made exactly this mistake mid-pass. The validator now warns:

```
foreground layer #1 has x=150, but foreground extras are a % of the VIEWPORT
(0–100), not the 200-wide world — it will be clamped to the right edge.
```

Note also that a mechanical ×2 rescale is *not* enough on its own: the new
panoramas have their own composition, so every hotspot had to be realigned to
the art by hand.

### Art

Ten images: two 32:9 panoramas; improved-likeness talking plates for Sledge,
Doreau, Trunk and Mayor Vane; a 4-frame walk cycle; the corrected
`sh-car-rear` (no lettering, no baked shadow); and two foreground props
(`sh-fg-counter`, `sh-fg-patrolcar`) placed in the two wide rooms.

The regenerated car came back black rather than maroon, but clean.

### Verification

`npx tsc --noEmit` clean · probe **205 checks, 0 failed** · `sledge-dom`
**62 ok, 0 failed** · `studio-beta-harness` **74/0** · `npm test` exits 0 ·
`npm run build` ok. `preflight` reports the same 6 pre-existing non-Sledge
failures as before (missing `/img/moonlighting/*` art, three unreachable
endings in other stories) and no new ones.

### Still open
* `bg-sh-squadroom-wide.jpg` letters Trunk's door **"CAPT. R. DAVIS"** — the
  image model's invention. Needs one re-render with the lettering suppressed.
* `Studio.tsx` is still a single 794 KB file, over Babel's 500 KB ceiling.

---

## PASS 7 — four regressions from one stacking context, and grey skin

Player report: *"foreground images moving with scene, characters now black and
white, no verb menu, foreground images in front of inventory."* Four symptoms,
two causes.

### Bug #18 — the chroma key was eating skin tone

Every character came out olive grey. Not a filter, not a colour grade — the
**slicer** was destroying the art at build time.

`make-sprite-sheet.mjs` despills the key colour out of pixels it bled into.
For magenta the "hot" channels are R and B and the "cold" one is G, and the
old rule clamped *any* hot channel that sat above the cold reference. But
**skin is R > G > B** — its red is legitimately high — so every warm pixel had
its red pulled down to exactly its green. Trunk's face went from
`155,148,137` on the plate to `174,174,148` in the sheet: R and G forced
equal, which is the definition of a grey-green.

The fix is to only despill pixels that are *actually* spilled. Real magenta
spill lifts **both** hot channels above the cold one together; skin's blue
sits *below* its green, so it is not spill and must be left alone:

```js
const spilled = [0, 1, 2].every((j) => !hot[j] || c[j] > ref);
if (!spilled) continue;
```

Re-sliced all nine Sledge character sheets. Trunk's face is `242,174,148`
again, and a sampled sweep finds **0 residual magenta pixels** — the halo the
despill existed to remove is still gone. The probe pins the rule against three
colours (warm skin, true spill, cool blue) so it cannot regress.

This one had been corrupting every keyed sheet in the repo since the despill
was written; the Sledge cast is simply where it finally became obvious.

### Bugs #19–21 — one stacking context, three symptoms

The missing verb menu, the foreground covering the inventory, and the props
sliding around were all the **same** structural mistake.

The walk-behind pass was a **sibling** of `<Stage>` at `z-[58]`:

* The stage wrapper carries `talkZoomStyle`, and **a `transform` creates a
  stacking context.** Everything inside it — including the verb coin's
  `z-[200]` — is sealed in and sorts against siblings *as one unit*, and the
  wrapper had no `z-index` of its own. So the z-58 pass painted straight over
  the verb coin. The coin was never missing; it was behind a transparent PNG.
* The inventory dock was `z-50`, genuinely **below** z-58, so foreground props
  rendered in front of the inventory exactly as reported.
* The pass was viewport-locked while the room panned, so on the new wide
  stages every prop drifted across the artwork.

Fixed by moving the walk-behind pass **inside** the stage wrapper (`z-[160]`:
clear of the tallest walker at `50 + y`, under the stage's own `z-[200]`
controls), giving that wrapper an explicit `z-[47]`, and raising the dock to
`z-[60]`. Inside the wrapper the pass also pans with the room for free.

> **Lesson: `z-index` only sorts within a stacking context.** A `transform`,
> `filter`, or `opacity < 1` silently creates one. A big z-index on a child
> means nothing to the outside world — the ancestor is what sorts.

### `worldX` — foreground props that belong to the room

Pass 6 noted that extras are viewport-% while everything else is world-%. That
is fine for rain and vignettes but wrong for scenery, so `ForegroundExtra`
gains **`worldX`**: pin the prop to the room (`0..worldWidth`) and it pans with
the camera. Screen-% is just `worldX - cam`; `Stage` reports the camera through
a new `onCamChange`, and only fires it when a scene actually has a pinned
layer.

The probe requires every **occluding** prop in a wide room to be pinned — a
prop the player walks behind cannot be allowed to drift. That check
immediately caught five more unpinned props (the tape, cabinets, fence,
dumpster and bush) that I had not spotted by eye.

Authors get a **📌 Pin to the room** control in the foreground-layer editor,
next to the walk-behind mask.

### Verification

`npx tsc --noEmit` clean · probe **142 checks, 0 failed** · `sledge-dom`
**68 ok, 0 failed** · `studio-beta-harness` **74/0** · `npm test` exits 0 ·
`npm run build` ok · preflight shows the same 6 pre-existing non-Sledge
failures and no new ones.

Both new DOM tests were confirmed to fail against the old code before the fix
landed (dropping the dock back to `z-50` reproduces `dock z=50`).
