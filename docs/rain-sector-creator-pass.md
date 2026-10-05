# Building RAIN SECTOR as a Studio creator — the friction log

I built a complete playable case ("Rain Sector — The Kael File", a Blade
Runner-flavoured synthetic-hunter investigation: briefing → free-roam street
→ gated alley → lie-detection finale → three endings) end-to-end in the
Studio's data format, beta-testing as a creator would. Everything below is
something I actually hit. Status legend: **FIXED** = engine changed this
pass; **WORKAROUND** = I authored around it; **OPEN** = still bites the
next creator.

## The problems, in the order they bit

### 1. The attitude vocabulary is a trap (OPEN)
The manual's prose says choices carry Charm / Intimidate / Deduce tags. The
actual `AttitudeTag` union is `Sultry | Aggressive | Clever | Neutral`.
Nothing in Studio tells you this — you find out from a `tsc` error after
writing a whole scene's choices. A dropdown in the choice editor (or the
docs listing the real four) would kill an hour of confusion.

### 2. You can't gate an object and still open it (WORKAROUND, OPEN as a gap)
`activateHotspot` resolves the **verb before the gate**: gate a vending
machine on a flag and the very kick that would drop the key becomes
unusable — a self-deadlock. There is no per-verb gating. The pattern that
works: leave the object un-gated, give it verbs that set a flag, and use a
multi-state (`states` + `when:{requiresFlags}`) to re-skin it into the
takeable version. That's a lot of machinery for "kick the machine, take the
card" — perfectly SCUMM-authentic, but the Studio should either support
per-verb gates or warn when an object's gate swallows its own key verb.

### 3. The validator had blind spots — and a bug of its own (FIXED)
Authoring found two false positives in `validateStory`: an exit written as
`useItem` with a `targetSceneId` didn't count as "a way out" (soft-lock
warning fired on a sound scene), and a *verb's* `flagSet`/`giveItem` didn't
count as a flag/item producer (audit errors on a solvable case). Worse, the
NPC-link checks I'd added were accidentally nested inside the hotspots loop
after a `continue`, so they only ran for some scenes. All three fixed and
codified as engine regressions — but the meta-lesson stands: the validator
only got these eyes because a real case kicked them out.

### 4. Walls were only honest for the arrow keys (FIXED — the big one)
Keyboard walking collided with 🚧 barriers, but **click-to-walk's
straight-line fallback ghosted straight through them** — my detective
walked through a chained gate to stand under a bolted stairwell, and once
inside the barrier rectangle every further move was blocked (all slide
options test blocked from *inside* a solid). Now: clicks slide along faces
like keys do, box-in stops the walk, a fully-stuck walk gives up after
~0.75s, and a marker walled off behind a **shut gate refuses from wherever
you stand** (the gate's caption plays — which is also better storytelling
than a silent wall-hug).

### 5. A spawn inside furniture broke the router — via a sealed pocket (FIXED)
An earlier shipped alley dropped the biker inside the dumpster
obstacle, which only worked because of #4's ghosting. The real fix
uncovered a deeper router flaw: `nearestFreePoly` snapped a start in a
solid to the nearest free cell — which could be a **sealed sliver** between
the obstacle and the world edge (free space nothing can route out of, and
which heuristics can't distinguish from open floor). `stageRoutePoly` now
flood-fills the goal's reachable component (and, for free starts, the
start's own component) and only accepts escape candidates that can actually
reach the goal. Sealed clicks correctly return "no route" again — the
Studio's 🥾 Walk-test tool caught that regression before it shipped, which
is exactly what that tool is for.

### 6. N inherited whatever verb was armed (FIXED)
With 👁 LOOK armed, pressing N (talk to nearest character) "examined" Old
Ping from across the street instead of walking over — the armed verb
short-circuited the walk. N and NPC clicks now force a TALK intent; linked
markers answer it through their cursor, which the validator's NPC-link
check already required.

### 7. Every scene remount resets the armed verb (WORKAROUND, mild)
The verb coin re-arms to its default on each scene change. Fine for
players, but anything scripted (a walkthrough, a playtest bot, a cutscene
that assumes "Go to") must re-arm per scene. Bit my own probe twice.

### 8. Choice buttons swallow clicks during the typewriter (OPEN, small)
A choice button renders before its line finishes typing and is *disabled*
until then — clicking it silently does nothing. The player learns to click
again; an automation (or an impatient player) sees a dead button. A visible
"still typing" state would be kinder.

### 9. Linear conversations have no leave button (OPEN, design)
A beats-conversation opened from a stage marker auto-closes only when
**every** usable reply is spent. Two farewell options means the player must
click both before the room comes back. Topic-list conversations get a
"Walk away" — linear ones should too.

### 10. Ambient NPCs default to emoji (WORKAROUND pending pass 2)
Every actor without a sheet is an emoji (🧑‍🍳 Ping, 🌂 the umbrella woman).
Real sprites need the full pipeline per actor — magenta plate → chroma-key
→ slice → wire `sheet` — so the art budget scales with the cast, and you
plan plates *first*, not last. The pipeline itself (generate on magenta,
`make-sprite-sheet.mjs`) worked first try, which I can't say for most
sprite tooling.

### 11. Smaller scratches
- **Headless art is unverifiable**: happy-dom can't decode images, so tests
  assert frame dimensions and DOM presence, never pixels. Sprite bugs only
  show in a real browser.
- **Coin hotkey order is implicit**: 1–9 map to the verbs array order, so
  playtests must discover the order rather than address verbs by name.
- **The harness OOMs at the default heap** since the Rain Sector suite
  landed — run the beta with `--max-old-space-size=4096`.
- **Stage-beat scenes need Space-advance in tests** (by design, but every
  new playtest rediscovers it).

## What this pass actually changed in the engine
- `Stage.tsx`: wall-honest click-walks (slide/stop/abandon), locked-walled
  markers refuse from standing, escape-from-inside-furniture, N forces TALK.
- `logic.ts`: `stageRoutePoly` reachability floods (goal component + start
  component), multi-candidate sealed-pocket-proof starts, BFS bounds fix.
- `logic.ts` validator: useItem exits and verb producers count (plus the
  NPC-link placement fix from the same pass).
- Tests: engine 1002/0, stage beta 150/0 (incl. the full Rain Sector
  creator pass and new wall-regression asserts), DOM smoke, roundtrip,
  build — all green.

## Pass 2 — dressing the walking stage (art + foreground sprites)

Second art pass (10 images), foreground sprite layer, exits as hotspots,
1.7× cast. New notes:

- **`HotspotState.image` exists but `imageFit` doesn't.** State art can't
  set its fit — the hotspot-level `imageFit` isn't inherited. Harmless
  here (contain is what I wanted anyway) but surprising.
- **Prop sprites don't need the sheet machinery.** One-frame "sheets" from
  `make-sprite-sheet.mjs --frames 1` key the magenta out and hand back a
  transparent PNG that `foregroundExtras` takes directly. The 4-frame walk
  plates (Ping, umbrella woman, the crossing pedestrian) slice clean — the
  bridging/recovery in the slicer handled connected silhouettes (apron,
  bubble umbrella) first try.
- **The foreground editor layer is the cheapest set-dressing in the
  engine**: `cinematic.foregroundExtras` on any scene — static props,
  `anim` presets (flicker neon, drifting steam), walk-behind `occludes`,
  and full motion paths for a pedestrian who crosses the near plane every
  half minute. On stage scenes the occluders respect the walker's feet.
- **Exits as hotspots** (go back the way you came): a repeatable
  `goToScene` marker costs nothing, the validator is happy, and it
  composes with the walk-off-screen edge (both routes work). This should
  be the documented default for every authored transition.
- **Cast size** is one number (`stage.playerScale`, NPCs get `scale`) —
  clamped 0.15–4, so 1.7× was trivial.
- Positioning art blind (no vision on generated plates) means the
  foreground extras are placed by marker-map reasoning, not by eye —
  expect to nudge x/y in Studio's foreground editor. The plates
  themselves (magenta cutouts) keyed perfectly.

## Pass 3 — everything moves (final art pass)

- **Animated props need either a preset or real frames.** Transform
  presets (bob/shake/flicker) dress a static prop for free; the things
  that READ as alive (steam billowing, ripples, electric arcs, a
  spinning fan, a scurrying rat) need multi-frame plates and an
  `animations.loop` sheet on the extra. Both work on the same
  `foregroundExtras` entry; a motion path rides on top for crossings
  (the rat, and a one-shot "ghost" of the suspect who crosses the alley
  once a minute and dissolves — `loop:"once", fadeTo:0`).
- **Keying strength vs. art**: re-keyed every sprite at tolerance 130 /
  softness 18 (was 90/12) — the magenta fringing reported around soft
  edges went with it. Thin bright art (rain streaks) still survives the
  stronger key; very faint semi-transparent art would not.
- **High-res reprocessing is free**: the plates are ~1400×700, so the
  first pass's 190–230px frames were my downscale, not the model's.
  Re-slicing at 85–95% of source (walker 293×560, props up to 1300×700)
  cost no image budget — only the sheet `frameWidth/Height` numbers
  (and the engine test that pins them) changed.
- **Headless load is a test-budget problem, not an engine one.** Fifteen
  animated extras slow happy-dom's rAF enough to blow a 12s walk
  timeout intermittently — the fix was budget (20s), not code. Worth
  remembering when a suite grows: flakes clustered around *new
  animation* are usually frame-budget flakes.

## Ranked wants for the Studio, from the creator's chair
1. Per-verb gating (or a warning when a gate swallows its own key verb).
2. A leave button on linear stage conversations.
3. Visible "typing" state on not-yet-enabled choice buttons.
4. A Studio lint for spawns/entry-spawns inside barriers (the engine
   rescues it now, but the rescue walk looks like a bug to players).
5. `imageFit` (and `imageAnchor`) on multi-state art, matching the
   hotspot-level controls.
