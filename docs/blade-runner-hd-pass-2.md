# Blade Runner HD — pass 2 (2026-09-10)

This is a fan-made, AI-illustrated **work in progress**, not a complete or exact
remaster of Westwood's game. Keep `blade-runner-act1` and existing scene IDs
stable so older saves/drafts remain identifiable. Built-in source does not
silently overwrite a user's Studio draft/publication.

## Audit findings and engine checkpoint

- The apartment → LAPD mainframe door already existed. It needs real mouse and
  keyboard regression coverage, not just simulated navigation.
- `smart` protected simple exits, but chained actions/scripts/minigame returns
  could still be classified as incidental objects. These routes now require
  intent too. Keyboard steering cancels a pending click/verb and its route;
  explicit commands cannot be stolen by nearby objects, and only one marker
  fires per arrival.
- The previous scrolling CSS used percentage background alignment. With equal
  image/box dimensions this produces **zero movement**. Layers now measure the
  rendered tile on image load/resize and animate each axis by its actual pixel
  size. Cross drift has an independent period; one-pass mode stops at the end.
- The media schema omitted alpha masks, ESPER photographs/enhancements and VK
  iris images. They now participate in asset collection, resolution and portable
  exports. The minigame images also respect the deployment base URL.
- Stage → **Hide player sprite (cockpit / close-up)** removes walker/shadow art
  without removing interactions. Dashboard controls should be remote.
- Sheet auto-build → **Preserve pose scale / align feet** uses a common scale
  across poses rather than stretching every pose to the tallest height.
- Validator: a hidden map, self-only pin or missing destination is not a way
  out. A self-only map no longer silences the one-way-door warning.

First engine checkpoint: `npm run test:engine` **1519 passed**, `npx tsc --noEmit`
clean. Browser/content/media verification follows in this pass; this is not a
release certification.

## Ten-image allocation

Seven photographic magenta-source NPC plates: McCoy, Runciter, Howie Lee,
Lieutenant Guzza, Officer Leary, Gordo, Zuben. Three empty environment plates:
LAPD mainframe, Howie's kitchen, warehouse hallway. No further image generations
are allocated to this pass. Sheets, portrait crops and compressed backgrounds
are derived from those ten sources, not additional image generations.

## Fidelity reference / scope

The original Act 1 starts outside Runciter's, visits LAPD, and follows the
Chinatown lead into Zuben's kitchen/chase/confrontation. Lieutenant Guzza, not
the film's Bryant, is McCoy's supervisor. Film-derived Tyrell/Rachael/Roy scenes
in the existing project are legacy expansion material, not proof of Act 1
fidelity. The new encounter is an authored approximation; original executable,
recordings, dialogue scripts and voxel animations are not being copied.

- [1](https://media.bladezone.com/contents/game/walkthrough/bz_walkthrough.html)
- [3](https://www.xboxachievements.com/forum/topic/490651-100-text-walkthrough/)


## Content checkpoint — 10 September 2026

All **10/10** generations are consumed and retained in `plates/blade-runner-pass2/`.
`node scripts/blade-runner/prepare-assets.mjs` uses the live Studio forge to rebuild
seven transparent, smooth-rendered four-pose sheets/portraits and three environment
WebPs. The shop is a derivative crop of the old plate, removing a baked-in giant
policeman; this is not an eleventh generation. No claim of eight-direction animation.

The opening now starts at Runciter's, with Leary and McCoy's equipment. Guzza keeps
his legacy internal ID for save/draft compatibility. Six new scenes connect Howie,
Zuben's pot (six-second choice, recoverable timeout), alley evidence and the
spare/retire warehouse decision. Filing needs ESPER, KIA upload and resolution of
Zuben; the apartment/mainframe elevator remains unconditional and repeatable.
Lucy is no longer standing in the shop. The older film-inspired extension is
retained for compatibility, not presented as a faithful chapter of Westwood's game.

Studio/runtime additions: gated NPC visibility, optional hidden-when-locked object
markers, scroll starting offsets (also honoured under reduced motion), bottom-origin
sprite scaling, a photographic story default without pulp halftone, and a **Walking
room navigation audit** in Playtest. The latter probes current-state gates and
spawn-to-marker geometry and excludes maps by default. It is not an exhaustive
state-space/minigame/obstacle proof; browser interaction checks are still required.

Checkpoint checks: engine 1546/0; new Blade Runner suite 16/0 (four earned golden
branches, negative exit mutations, required evidence, art geometry, real portable
media round-trip with a non-root base). Browser QA and full-suite/manual completion
are separate steps, not implied by these pure/runtime-simulation results.


## Browser-discovered corrections and documentation checkpoint

The real control-driving tests found additional issues, now corrected:

- Wide invisible label boxes intercepted neighbouring controls. Labels now
  float outside compact marker hitboxes. Pointer-down plus click no longer
  dispatches remote/already-there actions twice. Transparent satchel gaps no
  longer intercept floor/exit input, and this reel's KIA starts collapsed.
- The security disk's old approach lay against the counter. It has moved into
  accessible floor space. The Studio audit now also probes pickups and
  conversations, using the runtime wall-slide step; negative tests retain the
  old broken disk bounds. A naive straight-route audit falsely rejected the
  rooftop's valid wall-slide, so the shared step matters.
- The 77-asset HD export exposed a textarea layout freeze and a Chromium crash
  on bulk IndexedDB reads. A labelled, bounded preview preserves full Download /
  Copy; cursor-based reads avoid one huge IPC response. The real Studio
  export/import/publish now works, and its cockpit/ESPER/VK run with original
  artwork requests blocked. The tiny Vite sheet-metadata module is application
  code, not an artwork fallback.
- Existing multi-megabyte inventory PNGs now have 768px WebP derivatives,
  reducing their transfer cost without another generation. All 28 pose frames
  and seven portraits were visually reviewed. This exposed magenta rim spill,
  especially on Runciter: the Studio forge now has optional **Reduce edge colour
  spill**, used by this rebuild without changing frame geometry or alpha.

The canonical manual, public text, PDF and in-app manual now explain safe
triggers, audit limitations, actor/marker gates, feet alignment, HD forge options,
correct mask polarity, offsets, reduced-motion behaviour and portable export.
Regenerate the PDF/public copy with `node scripts/render-manual.mjs` (standard
Playwright executable or `PLAYWRIGHT_CHROMIUM_PATH` override).

At this checkpoint the full `npm test`, setup check, lint, TypeScript and build
have passed; targeted Blade Runner coverage is now **20 tests** after the
edge-spill check. The complete final browser regression run is recorded below
once finished (individual new routes already passed; do not infer the full
suite from those results).


## Final regression results and remaining work

- Full `npm test`: **pass**. Engine **1546/0**; Blade Runner **20/0**; Studio ship
  **186/0**; Stage beta **155/0**; the other media, DOM, first-person simulation,
  story and validator suites also passed.
- Complete browser run: **35/37 passed**, including **all 11 new Blade Runner
  tests** and all existing Black-Mass Bride / general Studio cases. The two
  failing cases are `fps.spec.ts`'s **newsstand rooftop…** and **Studio type…**
  combat tours: the driver dies in/near the theatre before its later medkit.
  Focused reruns also failed. A short-burst re-aim experiment did not solve it
  and was reverted; no gameplay health/difficulty changes, fabricated progress,
  retry-hiding, or disabled tests were used. **The whole browser suite is not
  green.** These first-person combat-driver failures remain follow-up work.
- `npm run check`, `npm run lint:strict`, `npx tsc --noEmit`, production build
  and `git diff --check`: pass at the tested checkpoint.
- Final screenshot inspection found two more visual bugs: mirrored NPC/player
  captions were shifted a full label-width, and the old windscreen aperture
  had a rectangular left crop plus a small leak into the cabin monitor. Fixed
  caption centering and derived registered HD masks from the existing masks
  (no generation). Strengthened browser assertions check left-facing caption
  centering and the full dashboard/monitor pixels, not only the centre console.
  Focused geometry/cockpit checks: **6/6**. These are local fixes, not changes to
  the first-person combat simulation.

The desktop shop, kitchen, cockpit, both first-act outcomes and mobile portable
ESPER screens were inspected. The masks now keep the cabin, wipers, dashboard
and monitor stationary while scenery moves in the glass; zero speeds and
reduced motion preserve a static, correctly positioned view.

**Another art/content pass is needed.** Priorities: proper directional walk /
idle / talk / dodge and chase animation (four poses are not a full walk cycle),
a dedicated Chinatown alley and chase/stair/warehouse coverage, Gaff's original
post-Zuben encounter, remaining legacy actors/rooms, and clue-specific ESPER
photographs. The existing generic legacy photos and later film-inspired scenes
are not exact Westwood content. This remains a 22-scene fan WIP, not the whole
game or a verified exact remaster. All **10/10** authorised generations are used;
there were no extra generations for the crop, mask repairs or colour-spill fixes.

Final post-mask/caption recheck: Blade Runner browser **11/11**, focused content /
media **20/20**, isolated Stage beta **155/155**, strict lint, TypeScript, setup
check and production build all passed. One Stage-beta run performed concurrently
with the browser tour hit the Rain Sector moving-NPC timing timeout; the
unchanged isolated rerun passed. That harness remains load-sensitive: preserve
the failure output when diagnosing it rather than treating repeated retries as
coverage. No test was skipped or marked expected-failure.
