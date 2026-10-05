# 📻 THE HOLLOW SIGNAL — production notes

An original 1984 small-town supernatural **point-and-click adventure**
(`gameKind: "adventure"`), built as a homage to the Stranger Things genre with
no trademarked names, places or characters. Source: `src/data/hollowSignal.ts`.

## Shape

Nine walkable STAGE rooms and three endings.

```
bedroom ──▶ MAIN STREET (hub) ──▶ AV room ──▶ (build the set)
                │      ▲   │
                │      ├───┴──▶ arcade (crystal + 🕹 cabinet)
                │      └──────▶ Pike kitchen (alphabet wall → lights)
                ▼
             woods (Birdie) ──▶ quarry (cutters) ──▶ lab gate
                                                        │
                                    ┌───────────────────┴─── unprepared ──▶ LOST
                                    ▼
                            THE HOLLOW: street ──▶ THE HOLLOW: lab ──▶ GOLD / SILVER / LOST
```

### The critical path

1. **Bedroom** — TAKE walkie + flashlight, USE walkie (`hs_heard_signal`), GO window.
2. **Main Street** — TALK to Marla and Sheriff Halloran. GO to the Pike house.
2b. **The Pike kitchen** — USE the walkie on the alphabet wall; Ollie spells
   QUARRY (`hs_ollie_spelled`), which unlocks TAKE on the string lights.
3. **Arcade** — TAKE the quartz oscillator from the dead cabinet.
4. **AV room** — USE the crystal on Teddy's rig → **Long-Range Set** (`hs_tuner_built`). This item gates the county road.
5. **Woods** — TALK to Birdie (`hs_birdie_met`) → the quarry opens.
6. **Quarry** — TAKE the bolt cutters → the access road opens.
7. **Lab gate** — USE cutters on the fence (`hs_gate_open`). Entering the Hollow *requires flashlight + string lights + long-range set*; walking in without the lights routes straight to the losing ending.
8. **Hollow: street** — hang the lights on the lamppost, call Ollie on the set.
9. **Hollow: lab** — LOOK behind the gurney (find Ollie), USE the flashlight (clear the vines), then choose.

### Endings

| Tier | Scene | Requires |
| --- | --- | --- |
| `victory-gold` | The Lights Are Still On | `hs_ollie_found` + `hs_creature_evaded` |
| `victory-silver` | Something Came Back With You | `hs_ollie_found` only |
| `gameover` | It Hears Shouting | shouting, or entering the Hollow unprepared |

## Art

Backgrounds and items: `public/assets/hollow-signal/`.
Character sheets: `public/assets/hollow-signal/sprites/`, built from the flat
magenta plates in `plates/hs-*.png` with the repo's own pipeline:

```bash
node scripts/make-sprite-sheet.mjs \
  --in plates/hs-birdie-talk.png \
  --out public/assets/hollow-signal/sprites/birdie-talk.png \
  --key ff00ff --height 512 --frames 3
```

Talking portraits are 3-frame (`rest` = frame 0, `talk` = 0-1-2-1). The walker
`mox-walk` is 4-frame (`idle` = frame 1, `walk` = 0-1-2-3). Because the same
sheets are used both as ambient-NPC sprites and as talking portraits, the
`npcSheet()` helper in the story file defines **all four** animation names
(`rest` / `idle` / `walk` / `talk`) — otherwise Studio's Check tab warns that
the ambient-NPC lookup (`idle` / `walk`) falls back.

## Testing

```bash
npm run check                                     # every referenced asset exists
npm test                                          # full engine + DOM suites
npm run bot -- --story the-hollow-signal --runs 400 --max-steps 20000
```

Studio's **Check** tab reports one intentional warning: the final corridor
exits only through choices. That is deliberate — the room is a trap, and the
conversation with Birdie is what arms the three exits.

---

## 🕹 The arcade cabinet mini-game

The Palace Arcade carries a **playable cabinet** — a barrel-dodging climber
in the Donkey Kong tradition. Narratively it's the hook: Teddy has already
opened that machine and found it empty, so a game you can actually beat on it
is the first hard proof that something is reaching into town.

- Engine: `src/game/ArcadeGame.tsx` (a plain 2D canvas at a fixed 224×256
  internal resolution, scaled to fit — the physics never depend on how big the
  screen hole is).
- Action type: `arcadeGame` on any hotspot, config in `ArcadeGameConfig`.
- Controls: ←/→ or A/D run, ↑/W climb ladders, Space jump, Esc step away.
- Three boards, three lives, barrels speeding up per board. Reaching the caged
  shape on the top girder clears a board.

### How the art and the game line up

The cabinet PNG is drawn on flat magenta with the **monitor filled flat green**.
`scripts/hollow-signal/prep-cabinet.mjs` then does both jobs in one pass:

```bash
node scripts/hollow-signal/prep-cabinet.mjs \
  --in plates/hs-cabinet-c.png \
  --out public/assets/hollow-signal/arcade-cabinet.png
# ✓ …/arcade-cabinet.png  570×950
#   screenRect: {"x":20,"y":26.6,"w":60,"h":28.4}
```

1. keys the magenta backdrop **and** the green monitor to transparent, so the
   screen is a real hole;
2. trims to the cabinet and **measures the hole**, printing it as percentages —
   which is exactly the `screenRect` the config wants.

The game canvas is painted *behind* the cabinet image and positioned with those
percentages, so it shows through the hole. Percentages (not pixels) mean a
differently-sized cabinet plate doesn't invalidate the placement.

Three cabinet variants were generated (`plates/hs-cabinet-a|b|c.png`); **C** was
chosen for its battered, on-style look and the cleanest screen key.

### Fixing the placement in Studio

If the playfield doesn't sit inside the bezel — or you swap in your own cabinet
art — open **Studio → Hotspots → the cabinet hotspot → 🕹 Arcade Cabinet**. It
gives you an image picker plus **Left / Top / Width / Height** sliders with a
**live preview**: a green block over the cabinet art showing exactly where the
playfield will land. Nudge until the block fills the monitor. The same panel
edits boards, lives, barrel interval, phosphor colour, captions and the win flag.

### Testing

```bash
npm run test:arcade     # 32 checks, also part of `npm test`
```

`scripts/beta/arcade-harness.mjs` covers the config contract (the rect is on the
image and big enough to play in, the win flag pays off), the component in a real
DOM (canvas mounts, the wrapper uses the authored percentages, **editing the rect
moves the playfield** — i.e. Studio's sliders demonstrably work, ENTER starts,
ESC closes, no console noise), the engine side (both outcomes surface as
decisions; winning sets the flag and spends the marker; **losing leaves the
cabinet playable**), and non-interference (stories without a cabinet never see an
arcade decision and still validate clean).

---

## Item icons

Item icons render with `object-cover` in the inventory dock, so a non-square
icon is cropped on its long axis. `scripts/hollow-signal/prep-icon.mjs` keys the
magenta off a plate, trims to the subject, then **letterboxes it into a square**
with a small margin — so the crop can never clip the object:

```bash
node scripts/hollow-signal/prep-icon.mjs \
  --in plates/hs-item-walkie.png \
  --out public/assets/hollow-signal/item-walkie.png
# ✓ …/item-walkie.png  256×256  (subject 736×863 → 192×225)
```

It downscales with a box filter over premultiplied alpha, which keeps thin
detail (the walkie's antenna, the bolt-cutter jaws) from aliasing away and stops
transparent pixels dragging colour into the edges. All six items now carry real
art; no emoji fallbacks remain.

## The Pike kitchen and the travel map

Two rooms were added once the art existed for them:

- **2b — The Pike kitchen** gives the string lights an origin. Previously they
  were picked up off a truck bed, which made the single most important item in
  the endgame a piece of set dressing. Now Marla's alphabet wall is a real room:
  hold the walkie to it and Ollie spells QUARRY through the bulbs, which is what
  unlocks taking them. The item you carry into the Hollow is the same one you
  watched him talk through.
- **🗺 Teddy's county map** hangs on the AV room chalkboard (`openMap`). Its
  seven pins gate on exactly the story's own milestones, so the map doubles as a
  progress readout. `replaceTravelChoices` is deliberately left off — the
  authored GO hotspots stay the primary way to move, and a player who never
  opens the map can still finish.

The gold ending now lands on `bg-dawn.png` rather than reusing the night street.

## Testing

`npm run test:arcade` grew to **71 checks**. The new parts are:

- **Part 5 — the art contract.** Every `/assets/` reference in the story exists
  on disk; every item icon is square *and* carries an alpha channel; the cabinet
  PNG has alpha (its screen is a real hole); every talking sheet divides into
  whole frames and matches its declared `frameHeight`. This is the suite that
  would have caught the missing icons in the first place.
- **Part 6 — the kitchen and the map.** The lights can't be taken before the
  alphabet-wall beat, entering the Hollow still requires them (so the room is
  load-bearing, not decoration), every map pin points at a real scene, the
  late-game pins start locked and each explains how to earn it.

## Pass 4 — the diorama layer

The rooms were flat: a background, sprites, and nothing between the player
and the picture. Pass 4 adds the depth cues, plus the two bits of chrome the
engine supports but the story wasn't using.

### Foreground overlays

Nine rooms now carry a `cinematic.foregroundExtras` layer — pine boughs and
ferns in the woods, chain-link over the lab gate, cabinet glow in the arcade,
Hollow vines in the Upside-Down rooms. Each was generated as a full 16:9 plate
with a deliberately **empty magenta centre**, so only the frame edges hold art
and the playable middle stays clear.

Two rules make them work, and both are asserted in the test suite:

* **They are never trimmed.** `prep-overlay.mjs` keys in place and keeps the
  original frame. A trimmed overlay stops registering with the background.
* **The scene must also set `parallaxDepth`.** A foreground extra with a high
  `depth` only *moves* if its scene opts into parallax; without it the layer
  is just a static frame. Every room here sets both.

`prep-overlay.mjs` does real spill suppression rather than a distance key.
Fine silhouettes — pine needles, grass — are almost entirely anti-aliased rim,
so nearly every pixel is a magenta/subject blend. Keying on "distance from
#FF00FF" and de-fringing only the translucent pixels leaves the whole layer
purple. Instead it measures `spill = mean(R,B) - G` on every pixel, scales
alpha down as spill rises, and clamps R and B back to the clean green channel.

### Cursor art and the backpack

`cursorArt` gives each verb its own icon (eye, pointing hand, speech bubbles,
key, arrow). The five were generated as one row and cut apart by
`split-row.mjs` — `make-sprite-sheet.mjs` is the wrong tool here, because
`CursorArt.image` wants one file per cursor, not a frame grid. Reticles
(LOOK, GO) anchor `center`; the rest anchor `top-left` at their tip. All are
128px square: larger cursors are refused outright by some browsers.

`inventoryDisplay` gained its container `image` — the backpack art the
`"container"` mode was already asking for.

### Also fixed

* Mojibake in `hs_radio_woods_hs` (`coldâ€”` → `cold—`); the file had a
  double-encoded em-dash and had to be patched at byte level.
* Studio's scene-duplicate remapper ignored `arcadeGame`, so a duplicated
  arcade scene kept routing its win/lose exits into the *original* scene.

## Pass 5 — three playability bugs

Playtest found three things wrong. All three were real, and two of them made
the game unfinishable.

### 1. Unreachable hotspots (the arcade machine, and others)

Seven hotspots across five rooms could be seen and labelled but never
triggered. The cause is worth remembering, because nothing in the validator
or the bot catches it:

A stage hotspot's **walk point** is its bounds' bottom-centre, clamped into
the walk polygon. The player routes there and must finish within `reach`.
The furniture `obstacles` I authored were full-height boxes that covered
that exact point — so the arcade cabinet's marker sat *inside* the arcade
cabinet's own obstacle. `stageRoutePoly` correctly returned "no route", and
the click did nothing.

The rule now: **an obstacle occupies the back of the floor band and always
leaves a clear strip in front of it.** Obstacles were flattened to ~6% tall
and object hotspots extended down so their marker lands on that strip.

### 2. The travel map wouldn't open

`T` is the map shortcut, but the key handler hit

    if (stageWalkingRef.current) return;

*before* the `T`/`L`/`B` cases. `stageWalking` is true in every walkable room
with no overlay open — so the map, dialogue log and corkboard shortcuts were
dead in exactly the rooms you'd want them. The three overlay toggles now run
ahead of that guard (they don't collide with WASD), and each toggles closed.

The bug was engine-wide, not story-specific: any story with a map and a stage
room had it.

### 3. Couldn't find the exit from the first scene

Not a bug in the exit — `hs_window_hs` is gated behind `hs_heard_signal`, so
until you USE the walkie the window only prints a refusal. But the flashlight
next to it was one of the unreachable hotspots from #1, which made the whole
right-hand side of the room feel dead. Fixed by #1.

### The regression guard

**Part 8** of the arcade beta walks every stage hotspot with the engine's own
routing functions and asserts the walker arrives within `reach`, plus asserts
every obstacle leaves floor in front of it. It fails loudly on all seven of
the original bugs. Suite is now **192 checks**.

## Pass 6 — USE on the cabinet did nothing

The arcade hotspot resolved correctly, passed its gate, and still never
opened the minigame. The bug was in the stage's interaction loop, not the
story.

### The zero-length walk

A stage hotspot fires from the walker's ARRIVAL loop, and that loop is
inside a movement branch:

    if (moved && !exiting) { ...fire any marker in reach... }

`walkToMarker` aims the walker at a stand-off point `reach * 0.72` from
the marker. If the player is already closer than that, the target is set
to their CURRENT position — so nothing moves, `moved` stays false, and
the queued verb is never dispatched. The object silently ignores the
click.

It was made worse by a floating-point knife-edge: a completed walk-up
parks the character at exactly `stop`, and the guard compared
`3.600 <= 3.5999999999999996`. The object became unusable at precisely
the spot the engine had just walked them to.

The fix, in `walkToMarker`: if the walker already passes the real
`posReachesMarker` test, fire immediately via `fireFromHere` instead of
queuing a walk that will never produce a frame of movement.

This is engine-wide — it affected any close-range or repeated interaction
on any stage, not just this cabinet.

### Why the tests missed it

Part 2 mounts `<ArcadeGame>` directly. That proves the component works and
says nothing about whether a player can reach it. **Part 9** now drives the
real `<GamePlayer>`: it mounts the arcade room, opens the object's verb pie,
picks USE, and asserts the cabinet appears — then closes it and does the
whole thing again from the same spot, which is the exact regression.

Verified by reverting the one-line fix: Part 9 fails, and passes again with
it restored.

Two gotchas worth recording for future DOM probes:

* The minigame's title is painted into the CANVAS (`ctx.fillText`), so it
  never appears in `textContent`. Assert on the `role="dialog"` whose
  `aria-label` is the title.
* A raw ESC on `window` closes the cabinet AND opens the game's quit prompt,
  which unmounts the stage. Close via the cabinet's own "Step away" button.

Suite is now **199 checks**.

## Pass 7 — narration kept cutting out

Two independent causes, both of which truncated spoken lines mid-sentence.

### 1. Visual timers were killing live speech

Three dismissal timers called `audio.stopSpeech()` when their VISUAL element
expired:

| what | dwell | typical speech |
|---|---|---|
| stage caption bar | capped 5.2s | 8–12s |
| examine card | 7s | up to 12s |
| prose auto-advance | 900ms after typing ends | up to 30s |

Those dwell times are *reading* times. They say nothing about how long the
narrator needs. Measured against this story: **29 of 36 stage lines were
being chopped**, the worst ~7s early, and all three endings died partway
through (the gold ending narrates ~30s but the panel advanced after 0.9s).

Added `audio.stopSpeechIfIdle()` — it releases the music duck and frees the
slot, but returns untouched if speech or a clip is still running. The three
dwell timers now use it. Anything that genuinely supersedes a line (new beat,
scene change, Continue) still calls the hard `stopSpeech()`.

The unmount cleanup deliberately keeps `stopSpeech()`: the component is going
away and its audio must not outlive it.

### 2. Chromium's 15-second utterance bug

Chromium silently stops a synthesis job after roughly 15s. `onend` never
fires, so nothing can detect the truncation. All three endings are past that
line (30.1s, 20.8s, 18.4s).

`speak()` now installs a keepalive that pairs `pause()`/`resume()` every 10s
while `speaking` is true, which resets the watchdog without an audible seam.
It stops itself the moment the queue drains — poking an empty queue makes a
LATER utterance start paused on some builds, which is a worse failure.

### Guarding it

**Part 10** drives the audio engine against a fake `speechSynthesis` to prove
a fading caption does not cancel a live line, that the tidy-up still runs once
the line ends, and that a real supersede still cuts. It also walks `Game.tsx`
tracking `setTimeout` callback depth to assert no dwell timer hard-cancels
narration — teardown timers are exempted deliberately.

Verified by reverting each of the three call sites in turn: the check fails
for each one individually. Suite is now **206 checks**.

## Pass 8 — minigame physics, and a big centred inventory

### Ladders couldn't be climbed

The girders slope (±0.045), but ladder endpoints were pinned to the FLAT
level height, `FLOOR_Y - i * LEVEL_H`. Measured against where the player's
feet actually land:

    board 1 ladder 0: feet at y=240.78, ladder bottom y1=234  -> 2.78px short
    board 3 ladder 2: feet at y=161.10, ladder bottom y1=154  -> 3.10px short

`ladderAt()` allows `y <= l.y1 + 4`, so those ladders were outside the grab
window and pressing UP did nothing. It hit half the ladders on every
odd-numbered board — boards 1 and 3 of a 3-board game.

Ladder endpoints are now measured off the real surfaces with `girderY()`, and
the x is clamped into BOTH girders it joins so a ladder can never hang off an
end.

### Barrels got stuck

Barrels reflected off the SCREEN edge (`x < 4 || x > VW - 4`), but girders
span x=8..216. So a barrel rolled off the girder end, carried on to the wall,
bounced back, landed on the same girder, got re-aimed downhill by the slope,
and rolled at the wall again — forever. Simulated: a barrel on board 1
oscillates between x=4.7 and x=6.4 indefinitely and never reaches the floor.
Since the retire filter only drops barrels below the floor, they accumulated
for the whole game.

Barrels now simply run out of girder and fall, which is what makes them drop
level to level like the arcade original. The screen edge is a last-resort
clamp for a barrel already in free fall.

Verified by simulation: 40 barrels per board, boards 1–6, all drain. A
climbing bot still reaches the win tile on every board.

### The inventory opens big, in the middle

New `inventoryDisplay.mode: "modal"` — a centred overlay with large item art
and names underneath, instead of icons in a corner. `tileSize` (default 132,
this story uses 150) sets how big each object is drawn.

It renders from inside `InventoryDock`, so it inherits every existing drag,
combine, inspect and right-click handler; only the presentation differs. Art
is `object-contain` in this mode — item icons are square but the art inside
them isn't, and `object-cover` would crop it at 150px.

Escape closes it, registered in the CAPTURE phase and stopped there, so the
same keypress can't also reach the game's quit prompt underneath — the exact
trap the arcade cabinet hit in pass 6.

Authorable in Studio → Inventory display → "Big centre screen", with an item
size field. The corner picker hides in this mode, since a centred overlay
has no corner.

### Guarding it

**Part 11** rebuilds the board geometry and asserts every ladder is grabbable
from both ends across 8 boards, that 30 barrels per board always drain, and
that a bot can still climb each board to the win tile. **Part 12** covers the
modal inventory and the fallback for unknown modes.

One lesson worth recording: the barrel simulation alone did NOT catch the
regression, because the probe mirrors the physics rather than importing it —
reverting the fix left the mirror passing. Part 11 now also asserts against
the shipped source that the old screen-edge reflection is gone. Both fixes
were then confirmed to fail their checks when reverted individually.

Suite is now **262 checks**.
