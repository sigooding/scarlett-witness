# Blade Runner HD — pass 3 (10 September 2026)

**Status: this pass is implemented, documented and verified.** Delivery is in
[PR #73](https://github.com/sigooding/Scarlet-reel/pull/73), from
`arena/01a08857-scarlet-reel`; it has **not** been merged into `main`. The earlier
sections below are a chronological checkpoint log, not current pending work.
See **Final verification** for the final result and remaining fidelity gaps.

This is an AI-illustrated fan recreation in progress, not an exact remaster or a
complete recreation of Westwood's game. Source dialogue, recordings and voxel
animations are not being copied. Saved user drafts/publications are not silently
overwritten; use the current built-in reel to see these changes.

## Previous-pass visibility verified

Local and GitHub branch HEAD were both
`cb3d7da3c9a35039df96ee043c6eaf26bd33fe8f` when this pass began. A push confirmed
**Everything up-to-date** and established tracking. There was no pull request:
being committed/pushed to `arena/01a08857-scarlet-reel` is not being merged into
`main`. This pass will use pushed checkpoints and a pull request.

## Ten-source allocation and provenance

All ten source PNGs are retained in `plates/blade-runner-pass3/`; its
`manifest.json` records dimensions and SHA-256 hashes. Six images were already
present, untracked, at the start of this pass and were preserved unchanged:

- McCoy rest (four poses), walking away (six), walking near (four).
- Gaff (four poses, with cane).
- Chinatown alley and warehouse stairs.

Four additional AI images fill the allocation: McCoy front/back/duck/weapon
poses, Zuben's pot/throw/run poses, Runciter surveillance, Howie's street.
**10/10 allocated source plates; no more image generation in this pass.**
Atlas assembly, colour-keying, crops, overlays and compressed derivatives do not
constitute additional image generations. The plates have been visually reviewed;
this does not certify that all animation, clue details or room geometry work yet.

## Implementation plan (not yet a completion claim)

- Assemble McCoy's side, near, away, rest and action banks into one atlas; select
  distinct directional/idle clips and show the successful pot dodge on stage.
- Add reusable Studio atlas assembly and conversation-pose support, checking
  existing named clips, enter-script latches and navigation before duplicating
  features. The Stage already supports four-way player animation.
- Use actual alley/stairs plates, the locked-door ambush and a Gaff aftermath
  encounter. Preserve old scene/hotspot IDs and unconditional recovery exits.
- Replace the shop-wide ESPER placeholder with clue-specific surveillance and a
  readable enhancement; keep earned evidence gates and portable media working.
- Extend pure/simulation and real-browser regressions; update the actual manuals,
  push checkpoints, and create a PR with honest results/remaining gaps.

Original-game flow reference: alley → right-hand warehouse stairs → locked door
→ Zuben blocks the exit; holstering spares him, retiring permits corpse evidence;
Gaff is outside near Howie's afterwards, before the dumpster plate and apartment.
This is a reference for authored approximation, not verbatim source dialogue.

- [1](https://curiousconstructs.com/bladerunner/game/BRG-Walk.html)
- [2](https://media.bladezone.com/contents/game/walkthrough/bz_walkthrough.html)

## QA baseline (previous pass, not new-pass results)

Pass 2: Blade Runner focused **20/20**, Blade Runner browser **11/11**, isolated
Stage beta **155/155**; full `npm test`, lint, TypeScript, setup and production
build passed. Full browser suite was **35/37**: two first-person combat tours
remain failing and were not fixed or skipped to call it green. One loaded Stage
beta run timed out; the unchanged isolated rerun passed. See the pass-2 report
for details. New-pass results will be recorded below after implementation.

## Sprite-tool checkpoint

The first actual preparation exposed two defects that a sheet-count test alone
would miss: even bands amputated rear-walk boots and included neighbouring
hands/pots; shadow-tolerant chroma keying erased sections of Gaff's dark cane.
They are addressed in the reusable Studio tools, not hidden with a reel-specific
renderer:

- **Separate sprite islands** groups connected silhouettes and nearby detached
  props, keeping only their own pixels even when x-projections overlap. It drops
  isolated border specks and refuses impossible requested counts. It cannot
  reconstruct touching/occluded people. Preview and build use the same pixels.
- **Flat key / retain dark props** offers RGB-distance keying for genuinely flat
  backdrops. The existing shadow-tolerant chroma mode remains the default; flat
  mode can leave shadowed backdrop, so inspect the result and use edge despill.
- **Combine pose banks into this atlas** assembles an additional transparent grid
  through the same canvas assembler used by `prepare-pass3.mjs`, preserves old
  clip indices/timing, and offsets the new clip. It centres frames on a shared
  canvas-height/foot baseline and bounds the canvas. Existing clip names cannot
  be overwritten accidentally; failed library saves keep the old sheet. The
  older auto-forge also now tells the truth if it has to keep its result inline
  rather than claiming the library save succeeded.
- Stage player headings automatically opt into eight-way selection when a
  diagonal walk clip exists. Explicit left clips are not double-mirrored;
  missing directions fall back and missing idle clips hold a walk frame.
  This is eight-way **selection**, not eight independently photographed angles:
  the McCoy art has side/near/away banks, mirrored diagonals and front/back rests.
- An NPC can author a **conversation motion** (`talkAnim`) while its linked
  conversation is open. It restores idle afterwards. This is not lip-sync.

`node scripts/blade-runner/prepare-pass3.mjs` now produces a 22-frame McCoy atlas
(316×704 cells, 11×2), eight-frame Zuben atlas (332×704, 4×2) and four-frame Gaff
atlas (245×704, 4×1), portraits, three room plates and real surveillance crops.
All 34 newly assembled frames were visually reviewed after correcting the cuts.
Source PNGs remain unchanged. Final integration/browser review follows.

Checkpoint checks: sprite-atlas/direction regressions **12/12**, existing engine
**1546/0**, existing Blade Runner **20/20**, strict lint and TypeScript clean.
These are engine/asset checkpoint results, not completed content/browser QA.

## Playable-content checkpoint

The reel now has **25 scenes**, **54 poses across eight HD actors**, and **83
referenced media assets**. The successful dodge performs as a short normal Stage
script; a miss still offers follow/regroup. Dedicated alley and stair rooms lead
to a door-triggered warehouse ambush. Gaff appears on the new street after either
outcome; his debrief reveals the dumpster plate. Retirement permits a one-shot
photograph pickup and an additional Gaff topic. The photograph is an inventory
record, not a newly illustrated group photograph; that remains future art work.

The real surveillance still/crops now show the wrapper/reflection and dragonfly
pin. Wrong-sector inspection does not grant the restaurant clue. The original
scene/choice IDs and direct HQ/home recovery shortcuts are retained. Filing still
requires ESPER + KIA upload + Zuben resolution; the apartment/mainframe return
remains unconditional. These shortcuts mean this is not yet an exact reproduction
of all original-game pacing.

Content checkpoint: focused Blade Runner **20/20**, including all four earned
spare/retire × dodge/timeout simulation routes, valid PNG grids, and real portable
media round-trip. Real-browser verification and manual updates
were still pending; the draft PR is a visibility checkpoint, not a release claim.

## Browser-discovered routing and review corrections

The actual earned playthrough stopped at the stairs. `stageRoutePoly` incorrectly
returned no path for a concave floor with no rectangular obstacles unless the
direct line was clear. It now uses A* around the floor's own bends. The original
stair polygon is retained; no fake obstacle or floor-widening workaround hides
the defect. Tests now check every new-room interaction from every authored entry
across pre-chase, ambush and both outcomes, including the upstairs return.

A one-shot Gaff introduction needs to become a repeatable conversation review.
Hotspot states previously inherited repetition unconditionally. The schema,
resolver and real Studio state editor now expose an optional repetition override,
with validator coverage for replayable state rewards. The most-specific door
aftermath state is last (last matching state wins), so revisiting after resolution
never says that Zuben is still behind you. The directional Studio preview also
uses the runtime resolver, eight headings, inherited sheets and media references.

Focused checks now **23/23**, engine **1569/0** before the extra repetition-unit
cases, strict lint/TypeScript clean. Both real-browser earned/seeded Zuben tours
now pass, including visible dodge/draw, stairs and return, Gaff branch dialogue,
plate pickup and real save/load. The 54-frame pixel check, real forge, real atlas
assembly and eight-direction/rest/conversation checks also pass individually.
The complete focused browser run and full final non-browser checks follow.

Root/public text, PDF and in-app manuals now describe these workflows and limits.

## Final verification

- **Full `npm test`: PASS.** Includes sprite-atlas/direction **12/12**, Blade
  Runner **23/23**, engine **1574/0**, Stage beta **155/155**, Studio beta
  **76/76**, and all the remaining configured non-Playwright suites.
- **Complete Blade Runner Playwright file: 14/14 PASS**, in one final run
  (approximately 5.6 minutes). This includes actual newsstand-to-ending progress,
  a separately labelled seeded timeout/retire/save/load run, both Gaff responses
  and repeatable review, all 54 frames, eight-way/rest/conversation selection,
  the real Studio forge/assembler, navigation audit and an 83-asset portable
  export/reimport/publish with original art requests blocked.
- Strict ESLint: **PASS**. TypeScript `--noEmit`: **PASS**. Production Vite build:
  **PASS** (single HTML approximately 4.44 MB / 1.23 MB gzip). Setup check: **PASS**,
  all **1032 playable local assets** present; four missing retired-story assets
  are reported separately by the existing setup checker.
- Root/public instruction text match; the **PDF and in-app manual are updated**.
  Source-manifest hashes still match all **10/10** source plates. `git diff
  --check` is clean. No additional generations were used for derivatives/tests.
- Screenshots reviewed: HD kitchen cast, Gaff aftermath, Studio atlas result,
  plus the frame contact sheets and actual surveillance detail used during prep.
  Browser images/traces and the large exported reel stay in ignored test output,
  not in Git.

**Not a claim that every browser test is green:** the unrelated full browser
suite was not rerun in this pass. Its previous result remains **35/37** with two
FPS combat-tour failures. This pass neither fixes nor skips those failures.
The complete focused 14-test result above and full `npm test` are the new runs.

## Remaining fidelity work / next art pass

Another art/fidelity pass is needed. Eight-way selection currently shares
side/near/away banks and mirrored diagonals; it is not eight independent views
or a smooth original voxel cycle. More in-betweens, dedicated firing/fall poses,
the photograph's actual subjects, remaining first-act rooms/cast, and finer
conversation spacing/occlusion would improve fidelity. Exact original branching,
all dialogue, complete LAPD/city coverage and later acts are not finished.
Legacy film-inspired expansion and direct recovery shortcuts remain clearly
outside the claim of an exact Act-1 remake. Saved user drafts/publications are
still not silently overwritten; select the current built-in reel for this pass.

## Delivery checkpoints

- `ca46710` — ten source plates preserved, budget/provenance and delivery plan.
- `fb494ae` — shared Studio sprite tools, directional/conversation support, art.
- `b858801` — playable pursuit / stairs / Gaff / ESPER integration.
- `47a4bad` — browser-discovered routing/review fixes, authoring previews/tests,
  actual manuals.
- Final documentation checkpoint records these completed QA results. All work
  remains on `arena/01a08857-scarlet-reel`; PR #73 includes the earlier pass too.
