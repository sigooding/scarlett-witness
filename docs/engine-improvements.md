# Engine improvements — twelve proposals (twelve built)

A working list of things the *engine* (playtime runtime, not the authoring UI)
doesn't do yet, ranked by how much authoring pain they remove. Each entry says
what it is, why it matters, roughly what it costs, and where it would live.

---

## 1. ✅ Playtest coverage — **IMPLEMENTED**

**What:** the engine keeps a per-story tally of every scene entered and every
choice picked while a case is in play (`src/game/playtestCoverage.ts`),
persisted in `localStorage` and accumulated across playthroughs. Studio's
**▶ Test** tab shows it as **🧪 Playtest coverage**: scenes entered / choices
taken / endings reached as percentages, completed runs, the last played
timestamp, and a click-to-jump list of everything never exercised.

**Why:** the validator is static — it walks the graph and says what *could* be
reached. It cannot say what you actually reached. The branch nobody has played
is exactly the branch most likely to be broken, and today finding it means
replaying the whole case from the top. Coverage turns "I think I tested it"
into a number.

**Cost:** small. One pure module, two call sites in `Game.tsx` (scene arrival,
choice pick), one Studio panel, 16 engine tests. Nothing is read back into
play, so a missing or corrupt record degrades to "nothing recorded yet".

**Done:** proposal 5 (a bot that plays the game) now writes into the same
tally, so coverage fills in without a human at the keyboard — and reads it
back to weight itself toward the branches you have been missing.

---

## 2. ✅ Deterministic seeded RNG — **IMPLEMENTED**

**Shipped:** `src/game/rng.ts` — mulberry32 + a string seed hash, a shared
module stream (`gameRandom` / `gameRange` / `gamePick` / `gameShuffle`),
`setGameSeed` for tests and future Studio toggles, and a boot-time
`initGameSeedFromUrl` that Game.tsx runs at import: put **?seed=1234** (any
string) on the URL and every gameplay draw pins to one stream — the console
logs a `[seed]` line confirming the run is deterministic. Gameplay call
sites now route through it (PatternPuzzle's row shuffle, RideGame's spawn
timing / lane / sprite); cosmetic randomness — ids, audio noise, storm
particles, Studio canvas — deliberately stays live. 18 engine checks cover
stream determinism, seed parsing and the helpers.

---


## 3. ✅ Rewind one decision — **IMPLEMENTED**

**Shipped:** `src/game/rewind.ts` — a bounded, RAM-only stack of world
snapshots, one per DECISION. An entry *is* a `GameSave`, so undoing is
"restore the snapshot taken just before it" through the same `restoreSave`
path a load slot uses: items un-pick, flags un-set, meters and trust roll
back, the journey log truncates — by construction, not by a second,
drift-prone inverse-effects implementation.

A **↺ Rewind** control sits beside **◂ Back** in the HUD (and on **Backspace**;
← stays "one line", deliberately a different key because undoing a choice is
a much bigger step). Its tooltip names what it will undo.

The rules that make it a feature rather than a cheat:

- **One decision, not one frame.** Snapshots are pushed immediately *before* a
  choice commits, before a quick-time window's expiry consequences land, and
  before a hotspot that hands you something / sets a flag / moves a meter /
  moves you. Reading a line never pushes one.
- **Consecutive duplicates collapse** (re-entry, re-render), and a collapsed
  push still upgrades the label to the more specific decision.
- **Endings are final.** A snapshot at an ending is refused and the stack is
  *sealed* on arrival, so rewind can never be used to re-roll an ending until
  you like the one you got.
- **Bounded** at `REWIND_LIMIT` (25) — the oldest fall off, the newest survive.
- **RAM-only.** Nothing persists; rewind is an undo, not a save system, and
  never competes with slots.

**Cost as built:** one pure module + ~40 lines of wiring in `Game.tsx`.
19 engine checks; the DOM smoke test proves the control is dead before any
decision, goes live the moment one is made, and restores the moment when
pressed.

---

## 4. ✅ Inject-a-world-state deep links — **IMPLEMENTED**

**Shipped:** `src/game/deepLink.ts` plus a **🔗 Branch link** builder in
Studio's **▶ Test** tab. A URL carries a fabricated world state and the engine
boots straight into it, at full screen, with real audio and cinematics:

```
?scene=nd_freezer&items=burner&flags=examined_note&meters=Suspicion:5
?scene=booth&trust=lydia:3,marco:-2&memories=alibi:I%20lied&seed=42
?story=<id>&scene=…        pick which case (defaults to the flagship)
```

Meter names are case-insensitive, `?seed=` composes with it so the branch
replays identically for whoever opens the link, and episodic stories open the
episode that owns the scene directly at it.

The two rules that make it trustworthy:

- **Unknown ids warn, never fail.** A renamed flag or a cut item degrades to
  "that part was ignored" and *still boots the scene*. Out-of-range meters and
  trust clamp to the engine's own bounds with a note. The Studio builder shows
  exactly the warnings the runtime will log.
  (One deliberate exception: an unknown *flag* is applied anyway — flags are
  free-form, and testing a gate before writing the content that sets it is the
  point.)
- **Only world state is injectable.** Flags, items, meters, trust, memories and
  the target scene. The journey log, save slots and season progress stay
  read-only, so a link can never fabricate a "previously on…" recap or forge a
  completed season — and it never overwrites a resume.

**Cost as built:** one pure module, a Studio panel, ~30 lines in `GamePlayer`
and a boot branch in `App`. 30 engine checks + two DOM smoke phases (a link
boots into the linked scene holding the injected item; bad ids still render a
playable screen).

---

## 5. ✅ Automated playthrough bot — **IMPLEMENTED**

**Shipped in two halves.**

**The decision surface** (`src/game/decisions.ts`) — the prerequisite. The
branching logic that used to be knowable only by mounting the 8.6k-line
`<CasePlayer>` and clicking is now two pure functions:

```
availableDecisions(story, sim)      → what can happen here?
applyDecision(story, sim, decision) → what does the world look like after?
```

with the runtime's own order of precedence, and `Decision` covering every way
the world can move: choices, replies, **deliberately lapsed quick-time
windows**, hotspots **and the verbs used on them**, 📌 corkboard deductions,
**pressing a lie** (right evidence or called bluff), the **outcome** of a
pattern puzzle or ride minigame, 🚶 walking off a stage's screen edge,
auto-transitions and heat busts.

Crucially `Game.tsx` now **imports** the shared rules from here — `getPerks`,
`adjustedConsequences` (Velvet Tongue / HEAT / Iron Nerve), `choiceRepeats`,
the visible-beat queue — rather than keeping private copies. There is one
definition used by both, so a bot result can never be a lie about the game.
Three engine checks assert the duplicates are actually gone.

**The bot** (`npm run bot`, `scripts/playthrough-bot.mjs`) — a loop over those
two functions. It reports crashes, **dead ends** (a non-ending scene with
nothing left to do), unreached scenes / choices / endings, runs that blew the
step budget, and an ending-frequency histogram.

It explores with weighted randomness that prefers the branch nobody has taken
(`1/(1+n)`, tunable with `--explore`), and `--coverage <file>` warm-starts the
weighting **from the real playtest tally** — so it heads straight for the
branches a human tester has been avoiding, exactly as proposal 1 anticipated.
`--out` writes the accumulated tally back. `--seed` pins the session so a
failing run replays exactly; `--qte-timeout` sets how often it lets a
quick-time window lapse on purpose (that hesitation branch is real content
nobody plays deliberately); `--links` prints a proposal-4 deep link to
reproduce each problem.

```
npm run bot -- --story neon-diner --runs 1000 --links
npm run bot -- --coverage cov.json --out cov.json     # keep filling the gaps
```

**It already earns its keep.** On its first run it found a genuine softlock in
The Neon Diner: `nd_freezer`'s only exit choice carried a meter consequence,
which makes it one-shot, but the room is re-enterable from the kitchen — walk
back in after using the exit once and there was no way out. ~10% of random runs
hit it. **Fixed**: the exit is now repeatable and the Clever point moved to the
already-one-shot ice hotspot, so it still can't be farmed.

Its *other* findings were more interesting: five reports that looked like dead
ends or unreachable endings turned out to be branch mechanisms the simulation
had no model for — stage edge exits, the **verb coin** (Rain Sector's key card
only falls out of the vending machine if you *kick* it), pressing a lie, the
corkboard, and minigame outcomes. That is the more dangerous failure, because
an unmodelled mechanism means everything behind it is silently never tested.
All five are now part of the decision surface, along with two things missing
from scene entry itself (`onEnterActions` never fired, and nobody was recorded
as "met"). The result: **all 30 shipped stories walk clean**, and Rain Sector,
Scooby-Doo and the pattern-puzzle demo went from partial to **100% scene,
choice, ending and marker coverage**. See `docs/testing-tools.md` for the
report-by-report breakdown.

Only dead ends and crashes fail the process; unreached branches are printed as
advice, because a bot that fails CI over exploration luck is a bot people
switch off. A standing engine check does walk **every shipped story** and fails
the build on any crash or dead end.

**Cost as built:** one pure module (the extraction), one bundled script,
~65 engine checks including a sweep of the entire shipped catalogue.

---

## 6. ✅ Per-choice telemetry (pick rates) — **IMPLEMENTED**

**What:** with coverage already counting picks, the engine now also records
*when* a choice was **offered** — i.e. presented pickable in the choice rail —
alongside every pick, and Studio surfaces a per-choice **pick rate** in the
**🧪 Playtest coverage** panel.

**Shipped:** `PlaytestCoverage` gains an `offers` map
(`${sceneId}:${choiceId}` → times presented pickable), purely additively — old
tallies keep their value instead of resetting. `Game.tsx` counts an offer via a
ref-diff each time a pickable choice enters the rail (locked, gated choices are
*shown* but not *offered* — being disabled is not a real chance to take it).
The report sorts pick rates worst-first, so the strongest signal — a choice
offered again and again but never taken — is at the top, flagged crimson in
Studio and printed by `npm run bot` as a "offered but rarely taken" section.

The bot records offers with the same diff semantics as the runtime (a ride is
offered through its source choice; a QTE lapse twin is not a second offer), and
this surfaced a latent double-count: the bot used to tally every taken branch
twice — once from the decision's coverage bucket and once from `applyDecision`'s
coverage — which would have corrupted the rates. The bucket path is gone; the
decision surface is the single source of truth.

**Why:** a choice nobody ever takes is wasted writing, or a tell that its
wording doesn't match its consequence. Pick rates also expose degenerate
design: an early branch that 95% of playthroughs funnel through means the
"branching" story isn't branching.

**Cost:** one field + one `recordVisit` kind, a small diff effect in `Game.tsx`,
a Studio panel section, a bot report line, 14 engine checks. Privacy: the tally
is local-only (localStorage), the same as the rest of the coverage record, and
nothing leaves the device.

---

## 7. ✅ Return traps — the softlock audit, statically — **IMPLEMENTED**

**What:** `auditSceneExits(story, scene)` in `src/logic.ts` splits a scene's
routes into the ones that **survive a return visit** and the ones the first
visit **spends**, and `validateStory` warns when a room the player can walk
back into has nothing surviving:

```
Return trap: the player can walk back into "The Walk-In" (via "⌖ GO — the
freezer door" from nd_kitchen), but every way out is consumed on the first
visit (choice "Out." → nd_kitchen). Mark one route out repeatable — a door
should still be a door the second time — or the returning player is stranded.
```

**Why:** this is proposal 5's most valuable find, promoted from luck to a
check. The bot found the diner's freezer because ~10% of random walks happened
to re-enter it; the same shape was sitting in **eight more rooms across four
shipped cases**, none of which any random walk had reported. A dead end that
needs a specific walk to discover is a dead end that ships.

Both halves are audited with the runtime's own consumption rules
(`routeEdgeRepeats`): walk-off-screen edges, travel-map pins, auto-advances,
entry scripts and repeatable markers are permanent ways in *and* out; a single
one-shot route in cannot strand anybody (it is spent bringing the player there
the first time), while two of them can (each buys one entry). An **after-beat
cut counts as spent** — a return visit skips the beats the player has seen, so
the cut never replays, which is a trap shape nothing else in the codebase was
aware of.

**Found and fixed:** `sh_squadroom` (Sledge Hammer), `sd_gate` (Scooby-Doo:
Ravenswood), `pct_workshop` (the Point-Click Starter Template — the shape every
new author copies) and five Matt the Accountant corridor rooms
(`mta_doors`, `mta_break`, `mta_stairs`, `mta_server`, `mta_parking`). Every
one was pure navigation with no reward to farm, so each fix is the freezer's:
`isRepeatable: true`.

**Cost as built:** one pure audit + one validator warning. The repeatability
rules it needs (`choiceRepeats`, `hotspotRepeats`) moved from `decisions.ts` to
`logic.ts` — `decisions.ts` imports `logic.ts`, so the validator could not reach
them without a cycle — and are re-exported unchanged, so there is still exactly
one definition, now shared by the runtime, the bot, the media lookahead and the
validator. ~25 engine checks, including a sweep that asserts the whole shipped
catalogue is clean and names the five fixed doors so a reverted fix fails.

---

## 8. ✅ Stranded — the player is told, and given a way out — **IMPLEMENTED**

**What:** `src/game/stranded.ts`. The validator says a scene *could* trap the
player and the bot says a random walk *did*; neither is standing next to the
player when it happens. So the runtime asks the same question —
`strandedNow(story, sim)` is `availableDecisions(...).length === 0` on a scene
that isn't exempt — and after `STRANDED_GRACE_MS` of the world staying empty it
says **⚠ Nothing left to do here**, with the real escapes on the card:
↺ Rewind, ⤴ Last checkpoint, 📂 Load a save, ⏏ Quit and, last because it costs
the run, ⤺ Restart episode.

**Why:** it replaces a private `isSoftlocked` memo in `Game.tsx` — a second,
narrower copy of the same question that could not see corkboard deductions,
pressing a lie, stage walk-off edges, quick-time lapses, minigame outcomes or
after-beat routes, so it could call a dead end playable and a playable room
dead. Same rule as proposal 5's extraction: **one definition, used by both**, so
the player and the bot can never disagree about whether a room is finished. The
card also sits outside the narrative panel, which is invisible while walking a
🚶 stage — and a stage room with every marker spent is exactly the dead end
proposal 7 keeps finding.

**Deliberately conservative.** A false "you're stuck" is worse than no message,
so `strandedExemption` skips endings, credits and cutscene nodes (their own
Begin/Continue chrome), note nodes (bypassed), first-person rooms (the Quake
stage walks its own exits), mid-dialogue and any moment a panel is open. The
grace period means a scene about to auto-advance never flashes it. And a dead
end is **never checkpointed** — the mid-scene refresh (proposal 10) skips a
stranded scene, or "⤴ Last checkpoint" would restore the very room the player
is stuck in.

**Cost as built:** one pure module, ~60 lines of wiring, one panel. 20 engine
checks plus two DOM smoke phases: a locked room raises the card (announced to
screen readers, dismissible, offering the checkpoint and quit) and a healthy
room never does.

---

## 9. ✅ A seeded run survives save, load and rewind — **IMPLEMENTED**

**What:** the gameplay RNG stream now has a *position*, and the position is
world state. `rngSnapshot()` returns `{ seed, draws }`, `GameSave.rng` carries
it, and `restoreRngSnapshot()` re-seeds and fast-forwards so the next draw is
the one the run was going to make.

**Why:** proposal 2 shipped `?seed=1234` with the claim "same seed + same
inputs = same run", and proposal 4 repeats it for branch links ("so the branch
replays identically for whoever opens the link"). Neither was true past the
first save: the seed is module state, so loading a slot, importing a `.sreel` or
pressing ↺ Rewind restarted the dice from the top. A bug behind an unlucky roll
was reproducible only until you loaded — and rewind, whose whole contract is
"restore the moment before the decision", handed back a world whose next
shuffle had already been rolled.

Purely additive, so `SAVE_SCHEMA` stays at 1: an older save has no `rng` field,
an unseeded run snapshots nothing (`null`, not `{ seed: null }`), and a
hand-edited one degrades — a blank seed is refused, a negative/NaN position
clamps to zero, and an absurd one is capped at `RNG_MAX_RESTORE_DRAWS` rather
than hanging the load.

**Cost as built:** ~50 lines in `rng.ts` (a counted `draw()` every helper goes
through), one optional `GameSave` field, two lines in `buildSave`/`restoreSave`.
20 engine checks, including that shuffle/pick/range all count as draws, that
restoring twice is idempotent, and that the position survives a real
`writeSave`/`readSave` round trip.

---

## 10. ✅ Saves that fail, and slots that aren't empty — **IMPLEMENTED**

**What:** two related honesty fixes around persistence.

- **`readSaveDetailed`** (`src/logic.ts`) returns *why* a slot didn't yield a
  save — `empty`, `corrupt`, `wrong-story`, `newer-schema`,
  `unsupported-schema` — and `saveReadMessage` turns that into a line for the
  player. `readSave` is now that, dropping the reason, so every existing caller
  is untouched.
- **The checkpoint reports.** The invisible AUTO slot is written on arrival *and*
  now refreshed mid-scene (throttled by `CHECKPOINT_QUIET_MS` /
  `CHECKPOINT_MIN_GAP_MS`), and a failed write says so once per case instead of
  failing silently behind a flashing "saved" indicator.

**Why:** four different situations all used to arrive as the same `null`, and
the Load screen translated every one of them into "That slot is empty." —
including the one that matters, a save written by a **newer build**, which is
not empty at all and has exactly one remedy (update the app). That gap was left
by the migration work in the backlog below: refusing a future save is correct,
refusing it *wordlessly* is not. Meanwhile the autosave's return value was
discarded, so a full or unavailable localStorage quietly left "▶ Resume"
pointing at an older scene while the HUD kept confirming checkpoints that were
never written; and a long room's pickups, flags and place in the dialogue were
lost on a reload because the only write was on arrival.

**Cost as built:** one result type + one message function + a
`writeCheckpoint` callback with two throttling constants. 20 engine checks
(each status, each message, throwing storage, a failing write, and the rng
position riding along in a real round trip).

---

## 11. ✅ Conversation timers — the Wolf Among Us dialogue clock — **IMPLEMENTED**

**What:** `timeLimitSeconds` on its own is now a real clock. Any timed choice
renders a shrinking ring, ticks on screen, and *expires* — into silence.
`src/game/conversationTimer.ts` decides which clock a choice carries
(`timerFlavour`: `qte` or `conversation`) and what the silence does
(`silenceOutcome`): the authored `timedOutConsequences` apply, the choice
routes to `timedOutTargetSceneId` (falling back to its own target), and a
reply with neither simply disappears from the rail, because you never said it.
The player is told — "The moment passes. You said nothing." — with a quiet
string snap rather than the quick-time failure sting.

**Why:** this was the one Telltale signature the engine had only half of. It
had the *loud* clock — a `quickTime` prompt with its banner, heartbeat and
shaky cam — and not the *quiet* one, which is the Wolf Among Us' actual
signature: an ordinary conversation with a ring shrinking around each reply,
where running out means Bigby says nothing and the moment passes without you.

The gap was worse than missing, because three surfaces already promised it:

- `types.ts` documented `timeLimitSeconds` as "the choice evaporates when it
  hits zero".
- `docs/stage-nodes.md` told authors to "give them `timeLimitSeconds` for the
  'decide now' pressure".
- the ⏱ readout rendered for **any** timed choice, so an author who followed
  that advice watched a countdown tick to zero in front of them and do nothing
  at all.

The ring, the expiry and the audit were each independently gated on
`quickTime`, so a plain timed choice was invisible, immortal and unchecked.
Now all three read `timeLimitSeconds`, and the loud treatment stays
`quickTime`-only — a conversation under a clock should feel like a
conversation, not an action set piece.

**Cost as built:** one pure module (~140 lines with the docs), four small
`Game.tsx` edits (ring, expiry, sting, silence toast), and the validator's
fake-deadline check un-gated from `quickTime` so a conversation clock that
costs nothing is audited too — with wording that tells the author a flag a
later beat reacts to is enough, since the character *noticing your silence* is
the payoff. 30 engine checks, including a shipped-catalogue sweep proving the
wider audit retroactively flags nothing, and four DOM smoke phases (the ring
draws cool rather than gold, the clock ticks, the reply vanishes, the silence
is acknowledged, the quick-time banner stays away — and a real QTE still gets
the loud treatment).

---

## 12. ✅ Interruptible dialogue — answer over the last line — **IMPLEMENTED**

**What:** opt-in per scene (`scene.interruptibleDialogue`, a 💬 checkbox in the
Scene tab): the replies surface over the **final** line of the conversation
instead of waiting for it to finish, so the player can cut the speaker off and
a `timeLimitSeconds` clock is already running while they're still talking.
`interruptibleNow()` decides; `pickCutIn()` performs the interruption — their
line stops mid-word (`stopSpeech` + finish the typing) and the reply's own
gated response beat plays next, which is exactly what a reply picked *after*
the line already does, so a cut-in cannot desync the beat queue.

**Why:** proposal 11 makes the clock real, but a clock that only starts once
the other character has finished talking is a timer, not pressure. Telltale's
conversations are interruptible: the options arrive while the line is still
playing, and answering early is a character choice in itself.

**Deliberately narrow, because the state machine is not.** Only the *last*
visible beat can be interrupted — earlier lines belong to the speaker, so a
conversation still plays as a conversation. It is suppressed while the prose is
still being acknowledged, behind any panel or fade, and above all on
`onRoutingBeat`: an after-beat cut on that final line owns the exit, and
surfacing choices over an insert shot that is about to route away would offer
the player a decision the scene has already made. That last case is also
audited — `interruptBlockedByBeatRoute()` feeds a validator warning, so the
flag is never a silent no-op (as is an interruptible scene with no beats at
all).

Everything else about the room is untouched: hotspots, the stage floor and the
keyboard's scene verbs still wait for `interactive`. A cut-in can only ever pick
a reply, never wander the room mid-line. Enter still belongs to the beat while
a line is playing — cutting in is a **number key**, which is how the
quick-time prompts have always been answered.

**Cost as built:** one pure predicate + one validator warning + a Studio
checkbox + a `pickCutIn` callback, threaded through a single new derived
boolean (`choicesLive = interactive || cutInLive`) that the choice rail, the
clock and the number keys share. 22 engine checks and two DOM smoke phases:
with the flag the rail and its ring are up *while the final line is on screen*
and cutting in spends the reply; without it the line finishes first, exactly as
before. No shipped story opts in yet, so nothing existing changes behaviour.

---

## 13. ✅ Speed-matched walk cycles — the legs keep up with the floor — **IMPLEMENTED**

**What:** a sprite sheet's animation rate is no longer frozen at the fps it was
drawn for. The cycle is re-rated by the ratio of the sprite's *real ground
speed* to the speed the frames were drawn for, so depth, ambient patrol pace and
the double-click jog all reach the legs. `speedMatchedFpsScale(ratio)` supplies
the number (clamped), `jogAnimation(sheet, dir)` picks a RUN bank when the sheet
drew one, `STAGE2D_JOG_MULT` is the single constant both the movement step and
the animation rate read, and `SheetSprite` accumulates phase by delta-time
instead of reading a wall clock started at mount.

**Why:** the walk cycle played at one authored fps no matter how fast the sprite
actually crossed the floor. Depth already slows a distant walker — the movement
step is scaled, and the code comment says so, "so a distant NPC doesn't skate" —
but the legs never got any of it. Worst of all the double-click jog is five times
the room speed, so the most-used fast-travel gesture in a wide room made the
character moonwalk: feet sliding at 5x under a cycle that never changed.

**Deliberately narrow, because the alternative is a strobe.** The re-rating is
clamped `0.45–2.5`: a distant crawl must not freeze mid-step, and five times an
8 fps cycle is a 40 fps strobe, not a run. The jog only re-rates the WALK cycle
when there is no run art — a run bank is drawn *for* the jog, a walk bank is not,
so preferring a run bank when one exists is the honest reading of the sheet (and
it resolves in the same candidate order as the walk bank, so a run-right-only
sheet still jogs correctly facing left). Phase accumulation means a jog beginning
mid-stride re-rates the legs *without snapping the pose* — the foot on the ground
stays on the ground — and the cycle restarts on an animation change, never on a
speed change, with the timer rated for the fastest the cycle can be re-rated to
so a mid-walk speed change never rebuilds it. `dt` is clamped so a backgrounded
tab cannot fast-forward the walk on return.

**Cost as built:** wired for the player (depth scale × jog) and for ambient NPCs
(authored patrol speed × depth). `sheetFrameAt`'s new `fpsScale` parameter
defaults to `1`, so the first-person renderer, the Quake stage and the sheet
editor's preview keep exactly the arithmetic they have always had. 33 engine
checks: the clamps, phase/frame equivalence with the old elapsed model, run-bank
resolution and mirroring, and wiring guards that the jog multiplier is shared
and that the renderer accumulates phase rather than reading a wall clock.

---

## Backlog (smaller, but cheap wins)

- ✅ **Honour `prefers-reduced-motion`** — done. `src/game/useReducedMotion.ts`
  (a `matchMedia` hook plus `reducedMotionCinematicMode` /
  `reducedMotionTransition`) drives the engine side — shake/dolly/pan/zoom
  cinematics fall to static, scene transitions become pure cuts, parallax and
  looping idle motion stop — and `src/index.css` carries the blanket
  `@media (prefers-reduced-motion: reduce)` rules for credits, flares and the
  flowchart.
- ✅ **Skip-read-text fast-forward** — done. Skip only fast-forwards beats in
  `seenBeats` (the same set that resumes a revisit after the last seen line)
  and stops dead at a line the player hasn't read, so turning it on by accident
  can't spoil a first playthrough. The control says as much in its tooltip.
- ✅ **Preload the next scene's background** — done. `src/game/scenePreload.ts`
  (`nextSceneMediaPlan`) reads the same gating, repeatability and beat-queue
  rules as the decision surface to work out which scene comes next, and warms
  its plate, talking sheets, music and narration while the current line is
  still playing.
- ✅ **Save-schema migration tooling** — done. `SAVE_SCHEMA` now has a
  `SAVE_MIGRATIONS` registry plus an exported, unit-testable chain runner
  (`migrateSaveTo`) in `src/logic.ts`: each entry turns a v-`n` save into its
  v-`n+1` shape, gaps refuse the load rather than leaping, and a save newer
  than the build is still refused. Nothing has needed a real migration yet
  (every change so far has been purely additive, schema still v1), but the next
  breaking `GameSave` change is a two-line edit — an entry in the registry and
  a `SAVE_SCHEMA` bump — instead of a save-loss incident. Proposal 10 makes the
  refusal legible: the player is told the save came from a newer build.
- ✅ **The validator's graph walks — one index, not 20,000 rebuilds** — done.
  `validateStory` walks the story from a dozen angles (dangling links,
  reachability from the start, one-way doors, and proposal 7's return-trap
  audit for EVERY scene), and each walk used to call `storyEdges(story)` — and
  build its own `scenes.find` Map — for itself, once per scene and once per
  edge. On the film (201 scenes, 1643 beats) one validation rebuilt the edge
  list **~20,000 times and allocated ~4,000,000 edge objects** — about **4.5
  seconds**, on the main thread, on **every keystroke** in the Studio
  (`issues` is a plain `useMemo([story])`, and prose/beat/title inputs commit
  per character). `storyGraph(story)` in `src/logic.ts` now builds the whole
  graph once per call — edges by source and by target, raw and note-resolved
  adjacency, and memoised `reaches()` / `routesFrom()` walks — and
  `auditSceneExits(story, scene, graph)` takes it as an optional third
  argument, so every external caller (engine tests, Studio, the bot) keeps the
  old one- and two-argument signature. Cost, measured on this repo:

  | | old | new |
  |---|---|---|
  | film, 201 scenes | 4,489 ms | **~14 ms** |
  | Let the Raptures Commence, 64 | 245 ms | 2.1 ms |
  | Hangar cold open, 25 | 8.8 ms | 0.4 ms |
  | `npm run test:engine` | 13 s | **7 s** |
  | synthetic 400-scene chain | 110,110 ms | 24 ms |

  The old cost grew ~8.5× per doubling of scene count; the new one grows ~2.2×
  — the cubic term is gone, not just its constant. 73 engine checks pin it: the
  index is compared against the edges it claims to describe, `reaches()` and
  `routesFrom()` are compared against the old walks rewritten inline, the
  indexed and unindexed exit audits must agree scene-for-scene, and the film
  must validate inside a deliberately loose 2 s bound. A differential harness
  over all 37 stories in `src/data` (991 scenes, three library states, every
  scene's audit) found the new implementation byte-identical to the old one,
  crash-for-crash.

  What is left per keystroke is linear work, not graph walks (film): one edge
  rebuild 0.75 ms, the media-reference walk 2.2 ms, flags/memories 1.5 ms, the
  undo-coalescing signature 3.1 ms, the autosave `JSON.stringify` 4.1 ms. The
  next win there is the one step 1's profile listed — the Studio's per-keystroke
  React work (every card's `data` object is rebuilt, so `memo(SceneFlowNode)`
  never hits) and the draft clone/write — not the validator.

### Next (unclaimed)

- **A "what changed" diff on load.** Loading a slot silently rewinds the world;
  a one-line summary (scene, items, heat) would make an accidental overwrite
  visible.
- **Coverage for hotspots' verbs.** Pick rates count choices; the verb coin
  (kick vs look) is only counted as a marker, so "nobody ever kicks the
  vending machine" is invisible in Studio.
- **Return traps as an error, not a warning.** The audit is conservative on
  purpose (it ignores gating, so a route that needs an unobtainable item still
  counts as a way out). Once a few authored drafts have been through it without
  a false positive, promoting it would block publishing a softlock — which is
  what the dead-end error already does for the obvious case.
- **The Studio canvas still re-renders every card per keystroke.** `nodes` and
  `edges` in `src/studio/Studio.tsx` depend on `[story, …]` and build a fresh
  `data` object per node, so `memo(SceneFlowNode)` never hits and all 201 cards
  re-run their own `sceneRoutes` + `ResizeObserver` on every character. Per-node
  data keyed on the scene's identity (plus the handful of story-level badges)
  fixes it; the validator's index is no longer the reason a keystroke costs
  anything.
- **Drafts, undo and the asset list.** `DraftAutosave.write` does a synchronous
  `JSON.stringify` + `localStorage.setItem` of the whole story (4 ms on the film,
  and the film's own export is ~387 MB of media), `compactStoryMedia` deep-clones
  the story and re-reads the story's entire asset library on every autosave, the
  undo stack keeps up to 100 full stories in RAM, and `useAllAssets()` cursors
  every library row (with its `dataUrl`) just to answer "does this asset id
  still exist?". Move drafts to IndexedDB, keep a light metadata store for
  pickers and the dangling-asset check, and cap undo by bytes.
