# Scooby-Doo and the Ravenswood Phantom — Studio Beta Test, Pass 1

**Story id:** `scooby-ravenswood` (`src/data/scoobyRavenswood.ts`)
**Beta date:** 2026-09-01 · **Status:** playable, validator-clean, all gates green.
**Re-audit any time:** `node scripts/beta/scooby-harness.mjs` (now 75+ checks: gold run, cold run, heat run, sheets & variants, bookkeeping, and a slicer-recovery regression — see §7 for pass 2).

The case was built end-to-end through the repo's headless authoring pipeline (art plates → key/slice → story data → validator → engine tests → build) as a broad feature-shake of Studio, in the spirit of the Tintin homage case. It is a fan homage with original dialogue and plot; unofficial, non-commercial.

---

## 1. What shipped in this pass

### The case
A full Saturday-morning mystery at a condemned manor: the gang is lured by a second telegram, the caretaker lies about the post, the ledger, and the lower house; a glowing Phantom patrols the upstairs corridor; the cellar hides a projector, a costume rack, and a smuggling manifest. **Five endings** (gold unmask / silver escape / caught / sheriff-bust / quit), heat limit 8, `ghost-green` HUD.

### Art budget — 10 generated images (the agreed cap)
| Asset | Pipeline | Used as |
|---|---|---|
| `plates/sd-scooby-talk.png` | keyed + sliced, 3 frames (205×384) | `character.talkingSheet` — Scooby |
| `plates/sd-shaggy-talk.png` | 3 frames (174×384) | `talkingSheet` — Shaggy (right, flipped) |
| `plates/sd-velma-talk.png` | 3 frames (164×384) | `talkingSheet` — Velma |
| `plates/sd-phantom-talk.png` | **salvaged** — see §3.2, 3 frames (316×384) | `talkingSheet` — the Phantom |
| `plates/sd-scooby-walk.png` | 4 frames (152×160) | `stage.playerSheet` — the walkable grounds |
| `public/img/bg-sd-manor.jpg` | — | grounds plate **and** case cover |
| `public/img/bg-sd-foyer.jpg` | — | caretaker meeting + foyer hub |
| `public/img/bg-sd-library.jpg` | — | library / interrogation |
| `public/img/bg-sd-corridor.jpg` | — | the QTE chase + 2 endings |
| `public/img/bg-sd-cellar.jpg` | — | cellar lair, trap, gold ending |

Fred, Daphne and Grimsby speak this pass with emoji avatars (🧣 💜 🧹) — sprite cutouts for them are the top item for **pass 2**, see §5.

### Studio features exercised by this one case
- 🚶 **Stage 2D** as the *start scene* — Scooby is a sprite-sheet walker on the manor grounds; click-to-walk, obstacle routing around the van, hold-to-EXAMINE markers (sign, mailbox), a `goToScene` exit marker.
- 🗣 **Sprite cast** — 4 talking sheets, stage left/right two-shots with flips and listener dimming.
- 🎯 **Press the Lie ×2** — the telegram postmark lie and the ledger lie, both with wrong-evidence limits, bluff beats, trust/heat swings, and `rememberLine`s.
- 🕵 **Interrogation** — the library runs composure pressure on Grimsby (composure 4, `steadySeconds` 7, `crackTrust` 1); both lies carry `composureDamage: 2`; trust decides crack vs clamp.
- 🧩 **Pattern puzzle** — the estate ledger (3 cash lots to "E.G."), retry allowed, reward = flag + torn-page item.
- ⏱ **Quick-time** — the corridor chase (heartbeat, shaky cam) with a real timeout game-over route.
- 📌 **Corkboard** — three pinnable connections; the gold ending is gated on all three pins.
- 💬 Reply Q&A with `memoryLog` + `{said}` recalls, `presentItem` (hidden until held), `exclusiveGroup` approach pair, hidden gated choices, `partBreak`, `flagNotes`, `openBoard` hotspot, `examine` holds, meter/heat economy, emoji avatars.

### Production gates (all re-run this pass)
`npx tsc --noEmit` clean · `npm run check` 327 assets ✔ · `npm test` engine **925/925** + import/export round-trip + DOM smoke ✔ · `npm run build` single-file OK · `node scripts/preflight.mjs` → this story **validator clean**, walk ends on an ending, 2 victory / 3 game-over, 10/10 assets on disk · `node scripts/beta/scooby-harness.mjs` **54/54**.

---

## 2. Verdict on the studio (short version)

The authoring model held up under a from-zero case: every feature I reached for existed, typed cleanly, and survived the validator. The two sharp edges were both in **art ingestion** (bridged sprite plates) and **trust economy math** (lie swings vs `crackTrust`) — details below, both with concrete fixes. One pre-existing, unrelated problem surfaced: `npm run preflight` failed on four shipped biker stories (since removed from the catalogue).

---

## 3. Problems found

### 3.1 `npm run preflight` FAILS on four shipped stories (pre-existing — **FIXED in pass 3**, see §8)
> **Fixed 2026-09-01 (pass 3):** the preflight walker now models stage `exitEdges` (walk-off-screen exits) and topic-list dialogues, with the interaction passes looped to a fixpoint. `npm run preflight` → **PASSED, all 28 stories**. Original finding kept for the record.
Those four biker stories (since removed) each reported **"no ending reachable"** even though the validator was clean and the DOM smoke played those scenes. The preflight deep-walker appears unable to progress through those stories' ride/QTE/gated branch structure — it walks 4–6 scenes then gives up. Same walker under-walks this case (7/12 scenes, ending only on the quit route) while the same scenes pass through the real engine in the dedicated harness. **Fix suggestion:** teach the preflight walker to (a) pick timed choices before expiry, (b) treat `ride` choices as winnable, or (c) fall back to the engine-test deep-walker used elsewhere. Right now `preflight` exit code 1 can't be used as a ship gate on this repo at all.

### 3.2 Sprite plates that bridge: `make-sprite-sheet.mjs` cannot recover (tooling gap — **FIXED in pass 2**, see §7)
> **Fixed 2026-09-01 (pass 2):** recovery now lives in `make-sprite-sheet.mjs` itself — merged runs are split at the bridge's narrowest column and the fringe despeckled automatically whenever `--frames N` can't find N gaps. The pass-1 phantom plate recovers unattended (pinned by a permanent regression check in the beta harness), and pass 2's four-frame phantom plate — which arrived as ONE fully-merged run — was sliced by the same path. The original finding is kept below for the record.
The Phantom plate drew its green glow across the gap between poses, so after keying there was **no fully-transparent column gap** — the slicer found 2 "frames", one of them 610 px wide, and `--tolerance/--gap` tuning changed nothing (the bridge is opaque, not near-key). `--frames` then just keeps the N widest runs, i.e. garbage.
**What I added:** `scripts/split-bridged-plate.mjs` — `--probe` prints every merged run and its lowest-occupancy "waist" column; `--cols` takes explicit split columns and also **despeckles** (drops 4-connected components under `--minpx`), which is what actually detaches the bridge slivers. The Phantom sheet was salvaged this way with zero re-generation (image budget intact). **Suggestion:** fold a waist-split fallback (split merged runs at the argmin-occupancy column) into `make-sprite-sheet.mjs`, or at least mention the companion script in `docs/sprite-sheets.md`'s troubleshooting list. Headless authors have no eyes on the plate; the tool needs to be the eyes.

### 3.3 Trust-economy trap: a "perfect detective" run clamps the interrogation (balance bug — fixed in this case, guard still worth adding)
`applyLieCaught` applies the lie's `contradictedConsequences` **before** `interrogationOutcome` decides crack vs clamp, and trust decides *after the swing*. My authored numbers (friendly +1, show-telegram +1, each caught lie −1, `crackTrust` 1) meant the model citizen run — charm up, catch **both** lies, then press — hit composure zero at trust 0 and got **CLAMP**, while a run that skipped a lie catch got the CRACK. The fix here: the empathetic press (`sdc_press_soft`) now carries `trustChanges +1`, so the warm path banks enough trust to afford both lie swings (verified by harness check *"four warm presses crack Grimsby (trust 2 vs crackTrust 1)"* and the cold-path clamp check).
**Guard suggestion for the Check tab:** when a scene has both an `interrogation` and lie beats with trust swings, compute the max reachable trust at first possible zero-composure and warn if it's below `crackTrust` (i.e. the crack is authorially impossible). Today nothing flags this until a human plays it.

### 3.4 Reply Q&A gating: `memoryLog` alone doesn't open a flag gate (sharp edge — **HINTED in pass 3**, see §8)
> **Improved 2026-09-01 (pass 3):** the validator error now appends a pointed hint when the flag name is also a recorded memory — *"either gate on requiresMemories instead of requiresFlags, or set the flag in that choice's consequences."* Original finding kept for the record.
Answering beats gated `requiresFlags: [sd_asked_phantom]` with only `memoryLog: "sd_asked_phantom"` on the reply is a validator **error** ("flag required by a gate but nothing sets it"). `requiresMemories` gating would be the idiomatic alternative; the error message is accurate but doesn't hint at the memory-gate option. **Suggestion:** either have the Check-tab message mention `requiresMemories`, or have Studio's beat-gate picker offer "remembers the reply `<tag>`" as a first-class option next to flags. (In this case I set both the memory and the flag on the two ask-replies.)

### 3.5 Revisit beat-skip counts *authored* beats, including never-played gated ones (engine quirk — **FIXED in pass 3**, see §8)
> **Fixed 2026-09-01 (pass 3):** revisits now resume after the last **seen** beat (tracked story-wide by id, persisted in saves as `seenBeats`), so a gated beat that never played on the first visit surfaces on a later one once its flag is set. Original finding kept for the record.
`Game.tsx` resets `beatIdx` to `scene.dialogueBeats.length` on revisit — the **authored** count, not the count that actually played. If a first visit ends before a gated beat surfaced (e.g. you enter the library, don't crack the ledger, leave), that beat can never play on later visits even once its flag is set. In this case the exposure is minimal (the puzzle lives in the same scene), but for any hub scene with late-unlocking beats this silently eats content. **Suggestion:** reset to the number of beats that were *visible* at exit (or re-scan on entry for beats never shown).

### 3.6 Smaller notes
- **Hotspot bounds authored blind.** Headless authoring means guessing x/y/w/h against unseen art. All zones are reasonable but a 10-minute drag pass in Studio's Scene tab overlay (hotspot rectangles over the plates) is recommended before calling this art-final. A "zone heat-map" export (dump every scene with zones drawn) would make headless passes verifiable.
- **No cartoon-appropriate music in the library.** Every shipped MP3 is noir; this case ships with synth ambient presets only (`drone`/`tension`/`storm`). A spooky-sweet 30-second loop under the foyer/cellar would lift it — needs a new audio asset, deliberately not in this image-budget pass.
- **The craft linter is good.** It caught my set-but-never-read `sd_saw_sign` and three never-recalled memories before any test run; adding a `flagNote` or a recall resolved each exactly as documented.
- **Positive:** a `stage` node as the *start scene* works everywhere (validator, deep-walker, DOM smoke, build) — no special-casing needed.
- **Positive:** emoji-avatar speakers (Fred/Daphne/Grimsby) coexist cleanly with sheet-animated speakers in the same scenes.

---

## 7. Pass 2 (2026-09-01) — the rest of the cast, every ending gets a plate, and the slicer fix

### 7.1 The §3.2 fix — bridged-plate recovery is now built into `make-sprite-sheet.mjs`
When `--frames N` is given and the gap-finder returns **fewer** than N runs, the script now:
1. computes per-column occupancy of the keyed plate,
2. splits the widest merged run at its **lowest-occupancy interior column** (the bridge's "waist", 10%-margin guards, minimum-segment width `15%` of an expected frame),
3. repeats until the count is right or nothing can split,
4. **despeckles** each recovered region (4-connected components under `--despeckle` px, default 2000 — the largest component per region is always kept), so cut fringe and stray specks disappear,
5. narrates the whole thing to stderr (`♻ bridged plate: split run 49–1392 at column 1019 (waist occupancy 47px)`).

Proof it works, both directions:
- **The pass-1 repro** (`plates/sd-phantom-talk.png`, one bridge) now slices unattended into 3 frames — and the beta harness grew a permanent regression check (§7.4) that spawns the slicer against that committed plate and asserts the recovery path fires.
- **Pass 2's four-frame phantom plate** arrived from the art model as a *single fully-merged run* (49–1392, no gaps at all) and was rescued by three automatic waist splits + despeckle → exactly 4 frames, 247×384. The fix earned its keep on its first day.

`scripts/split-bridged-plate.mjs` stays as the manual override (`--probe` / `--cols`); docs updated (`docs/sprite-sheets.md`, `RUNNING.md`). The stale pass-1 `sd-phantom-talk.png` sheet was removed from `public/assets/sprites/` (superseded by the 4-frame sheet; the *plate* stays — it's the regression fixture).

### 7.2 Art budget — 10 more images (pass-2 cap)
| Asset | Notes |
|---|---|
| `sd-fred-talk.png` | 3 frames, 200×384 — Fred joins the sprite cast (centre-left, facing right) |
| `sd-daphne-talk.png` | 3 frames, 151×384 — stage right, flipped |
| `sd-grimsby-talk.png` | 3 frames, 246×384 — centre-right, flipped, faces Velma |
| `sd-grimsby-caught.png` | 3 frames, 223×384 — the **unmasked variant**, wired as the `"caught"` expression sheet |
| `sd-phantom4-talk.png` | **4 frames**, 247×384 — rest / talk ×2 / **lunge**; sliced via the new recovery (see §7.1) |
| `cover-sd-ravenswood.jpg` | dedicated poster-style cover (manor + looming phantom + the van) |
| `bg-sd-corridor-after.jpg` | post-struggle corridor — the **caught** ending's plate |
| `bg-sd-boathouse.jpg` | the tunnel's far end — the **silver escape** ending's plate |
| `bg-sd-lawn.jpg` | dawn, cruisers, net on the lawn — the **sheriff-bust** ending's plate |
| `bg-sd-van.jpg` | snacks and a distant green window — the **quit** ending's plate |

All five endings now have **distinct plates** (asserted by the harness), and the whole cast of seven speaks as animated cutouts.

### 7.3 Integration details worth remembering
- **Expression variants** (`talkingSheets`) key off `beat.expression.trim().toLowerCase()` **while that character is the active speaker**. The two big threat beats (`sdb_c3` corridor, `sdb_t1` trap) now carry `expression: "lunge"` → the phantom holds the fourth frame; the trap's "glow gutters" beat (`sdb_t3`) carries `expression: "caught"` → Grimsby's hood-down sheet shows *inside* the phantom's glow — the disguise slipping a beat before the net drops.
- **Endings never render stage sprites** (`showStage` is gated on `!scene.isEnding`) — so the unmask *ending* is prose over its plate by design; the unmasked ART lands in the trap scene instead. Good to know when authoring reveal beats.
- **`talkingX` is the sprite's centre line** (`left: x%` + `translateX(-50%)`), bottom-anchored, height = 72%×scale of scene height. The cast was re-staged so the six-speaker foyer crowd reads as a line-up: Scooby 13 · Velma 30 · Fred 46 · Grimsby 64 (flip) · Daphne 81 (flip) · Shaggy 92 (flip) · Phantom 70 (flip, scale 1.05). This also fixes a pass-1 staging bug nobody had played yet: Shaggy and the Phantom both sat at x 74 and would have rendered inside each other in the corridor.

### 7.4 Harness upgrades (`scripts/beta/scooby-probe.ts`)
New checks: 10 sheet configs validated (7 talk + 2 variants + walker) · variant wiring (names, beat expressions, lunge = frame 3) · every referenced image exists under `public/` · all five ending plates distinct · **slicer-recovery regression** (spawns `make-sprite-sheet.mjs` on the committed pass-1 phantom plate; asserts exit 0, "3 frame(s)", and that the recovery log fired).

### 7.5 Gates re-run this pass
`npx tsc --noEmit` clean · `node scripts/beta/scooby-harness.mjs` green · `npm test` (engine + round-trip + DOM smoke) · `npm run build` · `node scripts/preflight.mjs` clean for this story. Still open from pass 1, unchanged: the preflight walker's failures on those four stories (§3.1 — stories since removed), the revisit beat-skip quirk (§3.5), and there is still no cartoon-appropriate music loop in the asset library (audio generation wasn't in either image budget).

### 7.6 Files touched in pass 2

- `scripts/make-sprite-sheet.mjs` — **the §3.2 fix**: waist-split recovery + region despeckle (`--despeckle`).
- `src/data/scoobyRavenswood.ts` — full sprite cast, phantom lunge + grimsby caught variants, dedicated cover, distinct ending plates, cast re-staging (§7.3).
- `plates/sd-{fred,daphne,grimsby,grimsby-caught,phantom4}-talk.png` — 5 new plates.
- `public/assets/sprites/sd-{fred,daphne,grimsby,grimsby-caught,phantom4}-talk.png` — 5 new sheets; stale `sd-phantom-talk.png` sheet removed.
- `public/img/cover-sd-ravenswood.jpg` + `bg-sd-{corridor-after,boathouse,lawn,van}.jpg` — cover + 4 ending plates.
- `scripts/beta/scooby-probe.ts` — §7.4 checks (incl. the slicer regression).
- `docs/sprite-sheets.md`, `RUNNING.md` — recovery documented.

---
 
## 8. Pass 3 (2026-09-01) — the engine/tooling pass: preflight fixed catalogue-wide

No image budget spent — everything left on the queue was engine or tooling work. Three of the five pass-1 findings are now closed at the source, plus one new tool.

### 8.1 §3.1 closed — `npm run preflight` now passes on ALL 28 stories
The walker had two blind spots, both found by tracing (`PF_DEBUG=<storyId>` — now a permanent opt-in trace in the script):
1. **Stage walk-off-screen exits.** A stage scene whose only exit is an `exitEdges` arrow (an edge-exit-only bar) simply had no exits as far as the walker was concerned. An OPEN edge is now taken as an exit (locked edges are not); edges are movement, not one-shots, so they never enter the used-set.
2. **Topic-list dialogues + the one-shot-door trap.** The deeper bug: the walker didn't play `startDialogue` topics, and even with topics added, running them *after* the scenery pass wasn't enough — at a bar the topic set the talked flag, but the keys-grab marker had already been passed over in that step's exploration, and the alley's one-shot door meant the walker could never come back to click it. The interaction passes (topics, then scenery) are now **looped to a fixpoint per visit**, so "ask the bartender → grab the keys" happens in one room. Result: every catalogue story walks to an ending — **`PREFLIGHT PASSED — catalogue is production-ready`**, which means preflight can actually be used as a ship gate now.

### 8.2 §3.5 closed — revisits resume after the last SEEN beat
`Game.tsx` previously reset a revisit's beat cursor to the **authored** beat count, permanently swallowing gated beats that hadn't played on the first visit. Beats are now tracked by id as the player sees them (`seenBeats`, story-wide, persisted in save slots — additive field, old saves load fine), and a revisit resumes at the first **unseen** beat of the entry queue (rebuilt exactly as `visibleBeats` builds it: gated-authored + lie-caught splices + interrogation broke/clamped). Rewind still works (seen ≠ forgotten), stage scenes are unchanged (their conversations are marker-driven), and a fresh run resets the set.

### 8.3 §3.4 improved — the validator now points at the fix
The "flag required by a gate but nothing sets it" error now checks whether that name is also a `memoryLog` tag recorded by a choice, and when it is, appends: *"either gate on requiresMemories instead of requiresFlags, or set the flag in that choice's consequences."* (This is exactly the pass-1 slip on `sd_asked_phantom`/`sd_asked_heirs` — a future author hits a signpost instead of a dead end.)

### 8.4 New tool — `scripts/beta/zone-map.mjs` (closes the §3.6 "authored blind" gap)
Renders every authored hotspot zone onto its scene plate: **solid red** = open zone, **amber dashed** = gated, `HOLD·` = examine, `→` = routing; plus the stage floor band (blue), obstacles (orange) and spawn marker. Output for this case is committed at `zone-maps/scooby-ravenswood/` (sd_gate, sd_foyer, sd_library, sd_cellar — the meeting scene has no zones) so the zones can be eyeballed without opening Studio. Requires ImageMagick (`convert`); regenerates with `node scripts/beta/zone-map.mjs`.

### 8.5 Gates re-run this pass
`npx tsc --noEmit` clean · `npm test` engine **925/925** + import/export round-trip + **DOM smoke** (which exercises the changed Game.tsx beat machinery on real playthroughs) · `npm run build` OK · **`npm run preflight` PASSED (28/28 stories)** · `node scripts/beta/scooby-harness.mjs` 72/72.

### 8.6 Still open
- **§3.3's Check-tab guard** (authorially-impossible interrogation crack) — suggested, not yet built; the balance trap itself is fixed in this case's data.
- **Music**: no cartoon-appropriate loop in the asset library yet (audio generation, not images).
- Zone drag-pass in Studio remains worthwhile if anything in `zone-maps/` looks off to a human eye — I authored the zones against plate descriptions, and the maps are the verification.

---

## 4. Playtest script (5 minutes, in `npm run dev`)

1. **Grounds (walkable):** walk Scooby up the drive; hold the gate sign; check the glowing window; **examine the mailbox** (telegram — keep it!). Walk to the door.
2. **Caretaker:** ask both questions; take the *friendly* line; **show the telegram**; while his "no post from this hill" line is up, press the lie with the telegram. Inside.
3. **Foyer:** examine the slime trail (hold), the portraits, take the keys.
4. **Library:** open the ledger → flag the three **CASH** lots; when he claims he *"couldn't sell a candlestick"*, press with the torn page; run all four presses (watch the composure gauge; hesitate and he *steadies*).
5. **Corridor:** pick an escape inside 6 seconds (let it time out once to see the caught ending, then rewind or replay).
6. **Cellar:** projector, costume rack, crate; open the corkboard from the workbench and **pin all three** clues to Grimsby.
7. **Trap:** spring it with the full corkboard → **gold unmasking** ("…meddling detectives").

---

## 5. Queued for a future pass

1. ~~Talk sprites for Fred, Daphne, Grimsby~~ — **done in pass 2 (§7)**.
2. ~~Unmasked-Grimsby variant, dedicated cover, phantom lunge frame, post-chase corridor plate~~ — **done in pass 2 (§7)**.
3. ~~Preflight walker, memory-gate hint, revisit beat-skip~~ — **done in pass 3 (§8)**.
4. A spooky-sweet **music loop** (foyer/cellar bed) — needs audio, not image, generation.
5. Studio Check-tab guard for authorially-impossible interrogation cracks (§3.3 / §8.6).
6. Zone drag-pass in Studio if `zone-maps/` shows anything off (§8.4).

---

## 6. Files touched in pass 1

- `src/data/scoobyRavenswood.ts` — the case (new).
- `src/data/stories.ts` — catalogue entry (first position).
- `plates/sd-*.png` (5) — raw magenta plates.
- `public/assets/sprites/sd-*.png` (5) — keyed/sliced sheets.
- `public/img/bg-sd-*.jpg` (5) — scene plates.
- `scripts/split-bridged-plate.mjs` — new slicer companion for bridged plates (§3.2).
- `scripts/beta/scooby-harness.mjs` + `scripts/beta/scooby-probe.ts` — the re-runnable beta harness (§1).
- `docs/scooby-ravenswood-beta-test.md` — this report.
---

## 9. Pass 4 (2026-09-01) — playability pass: the Snack economy, hi-res leads, voiced gags

**Beta request:** *"Extend and improve the playability of the Scooby-Doo game
— hi-res characters, and an improved plot in the style of Scooby-Doo."* Two
engine findings surfaced along the way and shipped as fixes first (see
`docs/adventure-mode.md` "Spending is author-explicit"); the case then
dogfoods both.

### 9.1 The two side-effect fixes
- **Say-a-line USE can no longer eat your item.** Consumption is now
  author-explicit: only a 🗝 use-item action with *Consumes item* picked
  spends anything (`itemsConsumedBy` in `src/logic.ts`; the armed item alone
  used to vanish). `resolveVerbAction` also (a) lets a written reply line
  imply acceptance and (b) lets an accepted item fall back to the hotspot's
  own 💬 say / 🗝 use default action — the Studio "Accepts these items"
  panel's promise, previously dead unless you also authored an ⚙ use verb.
  The Check tab now warns on accepts that can never answer (and errors on
  accepts pointing at unknown items).
- **Verb actions can be voiced like beats.** `HotspotAction.audioUrl` and
  `Hotspot.itemAudio` (per-item reply clips) play instead of the TTS reader;
  the Studio hotspot editor now carries the same widgets as beats
  (upload / library / 🎙 ElevenLabs with any character's voice).

### 9.2 What the pass adds to the case
- **🍪 Scooby Snack, Emergency Grade** (new item) — from the van's cooler on
  the grounds (new `✋ Check the van's cooler` hotspot; its LOOK answer is
  the ration-label gag).
- **Two deliberately non-consuming gags** — wave the snack at the gate sign
  (itemResponses implied-accept path) or under the manor door (authored
  ⚙ use action path). Both play their joke and keep the snack.
- **The corridor chase gains a third QTE line** — *"🍪 Scooby — FETCH!"*
  appears only while the snack is held, lifts the chase on `sd_snack_bribe`,
  and SPENDS the snack (the authored-consume demo).
- **Cellar callback** — two beats gated on `sd_snack_bribe` (Shaggy's ration
  mourning; Scooby's unrepentant burp). On a revisit after the toss they
  surface thanks to the pass-3 seen-beat fix.
- **Unmasking tribute beat, route-aware** — the Scooby tribute plays with the
  snack in hand, nods at the legacy if you threw it, and falls back to the
  plain cackle otherwise.
- **Voiced gags** — both grounds replies carry narrator MP3s
  (`public/voices/narrator/sd-*.mp3`) through the new per-item clip channel.
- **Hi-res leads** — Scooby & Shaggy talking portraits re-plated at 2×
  (768px frames, `pixelated` off): `plates/sd-*-talk-hi.png` →
  `public/assets/sprites/sd-*-talk-hi.png`. Velma/Fred/Daphne/Phantom keep
  the pass-1/2 sheets; the walker plate is untouched so the grounds read the
  same.

### 9.3 Gates re-run this pass
`npx tsc --noEmit` clean · `npm test` engine **952/952** (11 new checks: the
say-line fallback, implied accept, strict take/move refusal, the spend
contract ×3/$1, three validator checks) + dom smoke + import/export ✔ ·
`node scripts/beta/scooby-harness.mjs` **81/81** (gold run now dogfoods the
full snack path: cooler grant → both gags probed via `resolveVerbAction` →
QTE bribe → spend asserted gone) · `node scripts/preflight.mjs` → all 28
stories ✔.
