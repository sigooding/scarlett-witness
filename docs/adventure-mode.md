# Adventure mode — point-and-click rooms

> One engine, three kinds of game. A case declares its kind with
> `story.gameKind`: `"noir-rail"` (the house style: prose + choice rail),
> `"adventure"` (walkable rooms, verb cursors, inventory puzzles), or `"vn"`
> (visual novel). Today the switch is a **declaration plus tooling defaults** —
> the interaction models share one engine, so an adventure case still plays
> prose beats the moment a conversation starts. That is deliberate: the mode
> switch should not fork the codebase, it should change what a NEW scene looks
> like and which tools Studio puts in front of you.

## Turning it on

Toolbar (next to the title field): **🕵 Noir Rail · 🚶 Adventure · 🎭 Visual Novel**.

* **Adventure** — every new scene comes out as a 🚶 walkable **stage** node
  (keyboard on, floor band, spawn, proximity hints) instead of a prose plate,
  and Studio's status line tells you the recipe for a room.
* **Noir Rail** — unchanged: prose, beats, a choice rail.
* **Visual Novel** — reserved; build around portraits and dialogue beats for
  now (the pieces are all there, no dedicated tooling yet).

`src/data/rainSector.ts` (**Rain Sector**) is the reference case in the
catalogue: `gameKind: "adventure"`, verb coin, multi-state hotspots and
walk-off-screen edge exits.

## The anatomy of a room

| Piece | Where | What it does |
| --- | --- | --- |
| Plate | `scene.background` | one painted room; the camera never moves |
| Floor band | `stage.floor {top, bottom}` | the strip the walker may stand on |
| Spawn | `stage.spawn {x, y}` | where you enter |
| Furniture | `stage.obstacles [{x,y,w,h}]` | **new** — no-go rectangles the walker routes around, drawn and dragged on the plate (🚧 Barriers) |
| Walker | `stage.playerSheet` | sprite sheet with `idle`/`walk` animations |
| Objects | `scene.hotspots[]` | clickable things, each with a verb cursor |
| NPCs | hotspot → `startDialogue` | walks to them, then the conversation plays |
| Ambience | `cinematic.foregroundExtras[]` | animated props (flickering neon, a gull) — and, with `occludes`, walk-behind masks |

### The verb coin (pick the verb, then the object)

Turn it on per room: `stage.verbCoin: true` (Studio: 🎛 **Verb coin** in the
Walkable Stage panel). The coin sits bottom-left; the player picks a verb —
👁 look · ✋ take · 💬 talk · ⚙ use · ➜ go — then clicks the object. Rooms
without the coin behave exactly as they always did.

**Two extra body-verbs — 👢 kick · 👊 punch — are opt-in.** A room that wants
them (a biker game, a melee-heavy point-and-click) sets `stage.extendedVerbs:
true` (Studio: the **👢 Kick · 👊 Punch** toggle). Off (the default), the coin
stays the classic five regardless of what the hotspots answer, so a visual
novel or a classic case never sees them. Listing them explicitly in
`stage.verbs` also works. Hotspots answer them like any other verb: `cursor:
"kick"` sets the default and the marker icon, and `verbs: { kick: … }` adds
per-verb flavour. `src/data/southPark.ts` is the reference case.

### Object-first verb menu (the "skull pie")

Opt-in per room: `stage.objectVerbMenu: true` (Studio: 💀 **Object-first verb
menu** on the 🎛 Verb-coin panel). Instead of the bottom-left coin (pick a verb,
then click), the player **clicks the object first** and a small pie-style menu
of the verbs *that object* answers pops up next to it. USE expands to the
inventory when the object accepts items. Off (default) the coin and the
classic click-to-activate flow are unchanged. `southPark.ts` opts its stage
scene in.

For the authentic feel, pair it with **hold-to-open** (`stage.objectMenuHold:
true`, Studio: ⏱ **Hold to open**): press **and hold** an object and a *big*
circular menu opens in the **middle of the screen** — the verbs the object
answers ring the centre. Release over a verb to act with it; release over the
skull or outside to cancel; a quick tap just walks to the object. The pie's
centrepiece is the story's `verbMenuIcon` sprite (Studio: 🎮 In-game theme →
💀 **Verb menu icon**): an image / `asset:` / `emoji:` rendered large in the
middle of the ring (default: a skull emoji), so the menu wears the game's own
art. Either way the same verbs are offered; only the gesture and the
presentation change.

### The protagonist, defined once

A story can set its walker **story-wide** via `story.playerSprite` (Studio:
🎮 In-game theme → 🚶 **Player character**): an `image` (emoji / url) and/or a
`sprite sheet`. Every 🚶 stage scene uses it as the default; a scene that sets
its own `stage.playerSheet` / `playerImage` overrides it. Purely additive —
stories that never set it behave exactly as before. (Sheets are cut in
Studio's ⚡ auto-build / Media Tools ▸ ✂ Sprite Cutout Lab, or sliced from a
magenta plate by `scripts/make-sprite-sheet.mjs`.)

**USE arms an item:** pick ⚙ use and the satchel opens in a rail above the
coin; click an item to arm it, then click what you want to use it on.

One object now answers several verbs (`Hotspot.verbs`) instead of needing one
overlapping hotspot per verb:

```ts
{
  id: "advh_fix_bike",
  label: "the bike",
  cursor: "use",                       // the default (and what plays coin-off)
  gating: { requiresItems: ["adv_repair_kit"] },
  acceptsItems: ["adv_repair_kit"],    // USE + this item works…
  itemResponses: { adv_repair_kit: "Two feet of rubber, one bent wrench…" },
  verbs: {                             // …and this is what it says otherwise
    look: { type: "showText", text: "Cut line, dry tank…" },
    talk: { type: "showText", text: "You tell her to start. She does not start." },
  },
  action: { type: "useItem", itemConsumed: "adv_repair_kit", flagSet: "adv_bike_fixed" },
}
```

Rules the engine enforces (`resolveVerbAction` in `src/logic.ts`):

| Situation | Result |
| --- | --- |
| verb = the hotspot's own cursor, no `verbs` entry | the hotspot's `action` |
| verb has a `verbs` entry | that action |
| USE + an item in `acceptsItems` (or with an `itemResponses` line — a written reply implies acceptance) | `verbs.use` ?? the default `action` **when it can answer** (💬 say or 🗝 use-item), with `itemResponses[item]` as the line and `itemAudio[item]` as the clip. A take/move default (`giveItem`, `goToScene`, …) never fires on an item: write an explicit ⚙ use action, the Check tab warns when you don't |
| USE + any other item | refused |
| anything else | refused |

**Spending is author-explicit.** Only a 🗝 use-item action with **Consumes
item** picked spends anything — and only from the satchel when actually
held. A 💬 say-a-line answer, or a use-item action with *consumes nothing*,
never eats the armed item. (The old behaviour quietly spent whatever item
was armed against any use-item hotspot, even ones that only had a reply —
players read it as "the showText ate my item".) Every spoken answer — the
default reply, each verb action, and each per-item reply line — can carry a
recorded clip just like dialogue beats: upload/pick an mp3 or press 🎙 and
any character's ElevenLabs voice reads it.

Refusals read from `Hotspot.wrongVerbText` → `Story.verbResponses[verb]` → the
house lines, varied so a repeated failure doesn't loop. Verb actions are
**flavour and repeatable** — looking at a thing never uses it up; only an
action that takes something (`giveItem`) or moves the player (`goToScene`)
consumes its marker. And a 💬 say-line marker **stays on the scene even
after its line plays** (its flag/meter extras fire exactly once, so they
can't be re-farmed — reading a sign twice can't move a meter twice). In a
coin room only the marker you actually clicked
fires, so brushing past the bar on the way to the door doesn't talk to the bar.

Authoring (Studio): 🎛 **Verb coin** + verb chips on the Walkable Stage
panel; 🎚 **Verb coin — other verbs** and 🎒 **Accepts these items (USE)**
(with the per-item reply line) on each hotspot; 🎛 **Verb coin — refusal
lines** on the 🏷 Flags tab for the story-wide defaults.

Because `hotspot.image` (and the new `hotspot.sheet` + `hotspot.anim`) put real
art on a hotspot, the bike you fix is *drawn in the room* rather than described
in prose, and the Roadhouse sign really flickers
(`anim: { preset: "flicker", speed: 1.1, intensity: 0.85 }`).

### Placing the character

Hotspots tab → **🚶 Player start**. Click (or drag) anywhere on the plate and
the walker stands there — clamped onto the walkable floor band, so you can't
drop them in the sky. The marker draws the actual character (sprite sheet,
image, or 🚶) and stays visible, ghosted, while you place hotspots and barriers
around them. `stage.spawn` is the same value, so the numeric fields still work.

### Sizing the character to a scene

One scene's plate may be a cramped dumpster interior and the next a vast
alleyway, and the same 96px sprite reads oversized in one and lost in the
other. **Character size** on the Walkable Stage panel (`stage.playerScale`,
default 1, range 0.15–4×) is the flat whole-scene multiplier: the walker on
the editor plate grows and shrinks live as you drag the slider, and the game
draws the exact same size. It multiplies the near/far perspective scale, so a
room that needs a smaller character keeps its walk-toward-camera depth — you
just fit the character to the plate once.

```ts
stage: {
  playerScale: 1.35,   // a big presence for a small room (or 0.6 for a giant one)
}
```

The walker stays anchored at its feet while scaling, and the value is clamped
so the character can never vanish or overflow the plate (logic `stagePlayerScale`).

### Wide worlds — one room, several screens, a camera that follows

A room is usually one plate, but a LucasArts alley is a *strip*: you walk
right and the camera scrolls past the side of the building to the front. Set
**World width** on the Walkable Stage panel (`stage.worldWidth`, in
viewport-%, default 100):

```ts
stage: {
  worldWidth: 200,                       // two screens side by side
  spawn: { x: 30, y: 90 },               // a % of the WIDE WORLD, not the plate
  // …every coordinate (hotspots, obstacles, entrySpawns) is world-% too.
}
```

The engine draws the plate's background inside the strip and pans it with the
camera, which follows the walker with light smoothing and never shows past
the world's ends. The Studio's floor editor shows the whole strip shrunk to
fit, with dashed **viewport frames** marking each screen the camera holds, so
you can lay a marker out on screen two and see exactly what the player will
see. Use a wide background image (2:1 or wider) so the pan has art to show.

### Walk-off-screen exits — the red/yellow edge arrow

The classic adventure's exit: the player walks into the world's edge (or
clicks the chevron) and the character *strides off the plate* into the next
scene. Opt in per room via `stage.exitEdges` (Studio: the **➡ Walk-off-screen
exits** box on the Walkable Stage panel):

```ts
exitEdges: {
  left:  { targetSceneId: "ft_alley", label: "the alley" },
  right: { targetSceneId: "ft_ride",  label: "the road",
           gating: { requiresItems: ["ft_keys"] },
           lockedLine: "Not without the keys, you're not." },
}
```

* A **red** chevron arrow sits at the plate edge while the exit is open;
  **yellow** while `gating` shuts it. Clicking a yellow arrow says
  `lockedLine` instead of leaving. On a wide world each arrow only appears
  while the camera is parked at that end of the strip.
* The exit fires when the walker reaches the world edge with the gate open —
  input drops, Ben walks past the edge and off-frame, and the scene routes to
  `targetSceneId` (with the engine's fade). `flagSet` applies the moment he
  steps off.
* The story validator counts edge exits as real ways out, and the flowchart
  draws them as `➜ walk off … edge` branches.

### Entry spawns — where you appear depends on where you came from

`stage.entrySpawns` (Studio: **🚪 Entry spawns**, cyan dots on the floor
editor, draggable) overrides the spawn point per *previous* scene:

```ts
entrySpawns: {
  ft_dump: { x: 30, y: 90 },   // climbed out of the dumpster → stand by it
  ft_bar:  { x: 162, y: 90 },  // left the bar → stand at the front door
}
```

Essential on a wide world with several doors. Unset scenes fall back to
`spawn`.

### Cursors — art per verb

Because in a point-and-click **the verb is the cursor**, the cursor is authorable
per case (`Story.cursorArt`, edited on the 🎮 **In-game theme** tab, previewed at
real size in your own theme over a scrap of plate):

```ts
cursorArt: {
  default: { image: "/assets/ui/cursor-hand.png", size: 34 },  // plain arrow
  look:    { image: "/assets/ui/cursor-eye.png",  size: 30 },
  take:    { image: "/assets/ui/cursor-hand.png" },
  use:     { sheet: HAND_TAP, size: 40, anchor: "center" },     // animated!
}
```

* **Static art** (`image`) becomes a real CSS cursor — keep it ≤128px.
* **Sprite sheet** (`sheet`) is drawn as a small looping sprite that tracks the
  mouse: a reaching hand, a turning key, a blinking eye. No size limit.
* `anchor` sets the pixel that clicks: `top-left` (pointing) or `center`
  (reticle). `default` covers every verb you don't give its own art, and **no art
  at all means the game keeps its system cursors** — nothing changes unless you
  opt in. In a coin room the selected verb drives the cursor.

### Perspective — big up close, small in the distance

The walker is scaled by where they stand in the floor band, and their *step*
scales with them (walking into the distance covers less screen per second,
otherwise it reads as skating).

```ts
stage: {
  floor: { top: 66, bottom: 95 },
  playerNearScale: 1.15,   // sprite scale at the FRONT of the band
  playerFarScale: 0.62,    // …and at the back (default 1 - depthScale)
}
```

`depthScale: 0.35` still works exactly as before — it just means "shrink to
0.65 at the back". Set either end explicitly for a stronger room.

### Directional sprites and multi-bank atlases

Base `walk`/`idle` art keeps the legacy right-facing/mirror-left convention.
Optional suffixes are `-up`, `-down`, `-left`, `-right`, `-up-left`, `-up-right`,
`-down-left`, `-down-right`. Adding a diagonal **walk** clip opts the Stage player
into eight-way headings; otherwise dominant-axis four-way movement remains.
Explicit left art is not double-mirrored. Missing opposite angles can mirror;
missing diagonals fall back to vertical, then base. Missing idle holds a walk
frame rather than moonwalking. Eight selections are not eight drawn views.

Studio's directional walk preview uses the same resolver, supports inherited
sheets and `asset:` references, and shows eight headings. The Frame player
previews named idle/action clips. **Combine pose banks into this atlas** adds an
already-keyed grid, preserves clip indices/timing, and offsets the new clip. Set
source columns/rows, new clip name, FPS and output canvas height. Keep headroom
inside duck frames: a common canvas cannot recover scale lost by tight crops.
Duplicate names and oversize canvases are refused. A failed save keeps the old
sheet; lower output size or adjust Media library limits.

Auto-build's **Separate sprite islands** keeps each disconnected silhouette's
own pixels even where boots/pots overlap in x; it cannot unmix touching figures.
**Flat key / retain dark props** is an optional RGB key for unshadowed plates;
the default chroma mode still handles shadowed backdrops. Preview/build share
both options. Inspect every sole, cane and hat; frame counts are not visual QA.

NPC `talkAnim` / **conversation motion** temporarily overrides idle/waypoint
motion while its linked conversation is open. It is a gesture, not lip-sync.
A hotspot state's optional `isRepeatable` overrides its parent (Studio:
**Repetition in this state**). This supports a one-shot briefing followed by a
repeatable, reward-free review. `showText` always repeats. Last matching state
wins, so place the final aftermath state last.

Concave floors (stairs/L-shaped rooms) use A* around their bends even without
rectangular obstacles. Test every marker from **every entry spawn**: having a
working door somewhere in the room does not prove its progression route works.

### Walk-behind masks — the foreground art IS the mask

You do **not** need a separate mask asset. Any foreground extra in a 🚶 room
can be turned into an occluder:

```ts
cinematic: {
  foregroundExtras: [
    {
      image: "/assets/sprites/adv-truck.png",
      x: 52, y: 84, scale: 0.3, anchor: "50% 100%",
      occludes: true,        // draw this OVER the walker when they're behind it
      occludeBaseline: 84,   // the invisible depth line (default: the extra's y)
    },
  ],
},
```

While the walker's feet are **above** the baseline (further from the camera)
the cutout is drawn over them — they vanish behind the truck, the counter, the
pillar. Step below the line and they're in front of it again. The cutout's own
alpha does the hiding, so antialiased edges and gaps (under the chassis,
between chair legs) are respected for free. The switch is one `useMemo`: the
occluder is drawn in a pass above the stage (`z-58`) while it's in front, and
skipped from the normal extras pass — so it is never drawn twice.

Pair it with a 🚧 barrier of the same footprint so they can't walk *through* it
either (see the parked truck in `adv_street`).

### Inventory — the pouch, and drag-and-drop

How the inventory LOOKS is a per-case choice, so a point-and-click can carry a
leather pouch while every other game keeps the dock it has today:

```ts
inventoryDisplay: {
  mode: "container",   // "classic" (default, unchanged) | "container" | "hidden"
  label: "Saddlebags",
  image: "/assets/ui/inventory-case.png",  // any transparent cutout — yours
  anchor: "bottom-left", columns: 3, inset: 20, height: 220,
}
```

* **classic** — the chip rail, exactly as before. Default: no case changes.
* **container** — a pouch / case / saddlebag sprite that **pops open with the
  items laid out inside it**. `image` is any transparent cutout (a bag, a
  briefcase, a tool roll, a freezer bag) — `inset` keeps the icons off the
  strap. Without art you get a stitched leather panel in the house style, so the
  mode never looks half-built. `sheet` gives it an animated sprite instead.
* **hidden** — no on-screen dock at all.

**Drag and drop:** drag an item **onto a scene object** to USE it there (the
prototype: drag the repair kit onto the bike). In a 🚶 room the walker walks over
first and *then* uses it — the splice happens at the bike, not across the road.
Drag one item **onto another** to combine them. Both work with a mouse or a
finger (pointer events, not HTML5 drag), and a movement threshold keeps
click-to-inspect working. Objects that don't accept the item answer with the
story's refusal line, so a wrong guess is a joke rather than a dead end.

### The inventory puzzle

1. ✋ take the **wrench** (street) and the **fuel line** (garage, gated on
   `adv_met_dell` + holding the wrench).
2. Combine them in the satchel → **repair kit**
   (`Item.combinableWith { targetItemId, resultItemId }`).
3. ⚙ use the kit on the bike at the edge of town → `adv_bike_fixed`.
4. The exit hotspot for the gold ending is gated on `adv_bike_fixed` **and**
   `adv_exposed`; the silver one on `adv_bike_fixed` with
   `excludesFlags: ["adv_exposed"]`.

### Catching Cutter (the "present" verb)

The Blue Plate hands you a **siphon receipt** (gated on having asked Nee). In
the Roadhouse a *reply* choice carries `presentItem: "adv_receipt"` → sets
`adv_exposed`, which unlocks Cutter's reaction beats and lets you lift his keys
after the coffee-in-the-jukebox distraction. Swing instead and you get the
bust ending.

### Multi-state objects (a lever up/down, a drawer full/empty)

One marker that **changes with the story** instead of being faked with
flag-gated duplicate hotspots. A hotspot may carry `states: […]`; states are
checked in order and the **last one whose gate passes wins** — so list the
unconditional default *first* (or rely on the base object as the default) and
put the specific ones after it:

```ts
{
  id: "bench",
  label: "the workbench",
  cursor: "look",
  action: { type: "showText", text: "…there's a fresh coil on the pegboard…" },
  states: [
    {
      id: "bare",
      when: { requiresFlags: ["adv_has_line"] },   // once the coil is taken
      label: "the bare pegboard hook",
      action: { type: "showText", text: "…nothing but a bright clean ring…" },
    },
  ],
}
```

A state only overrides what you fill in — `label`, `image` (an empty string
means "no object art in this state"), `cursor`, `action`, and `gating`
(`null` = always unlocked: the door's *open* state), plus `acceptsItems`
(`null` or `[]` = no item picker; omitted = inherit). For example, a machine
that consumes a key can switch to a direct-use puzzle instead of asking for
that already-consumed key again. Everything else —
identity, zone bounds, verb answers, `isRepeatable` — is
shared, so **the marker re-skins in place**: it never duplicates, never
re-mounts, and the walk animation never resets. That's the whole point: one
object, one `used` history, many faces.

The machinery reasons about states everywhere the base object goes:

- **Play** — the marker, its lock and its fired action follow the active
  state live (stage rooms *and* classic novel scenes; the scene-action list
  re-labels too).
- **Visibility** — a used marker hides only if what it would do *now* is a
  real take/route: a picked-up safe disappears, but the same object's later
  "empty drawer" look state can bring the marker back as a readable line.
- **Validator** — a state's `flagSet` counts as a flag producer, its `when`
  flags as consumers (an impossible state is an error), a
  `goToScene`-without-target warns, duplicate state ids and an
  unconditional-state-listed-after-a-gated-one are errors (the latter would
  permanently shadow everything above it).
- **The flowgraph** — a route that only exists in a later state (the door's
  open state) is a real edge: its destination counts as reachable, and a
  stage room may legally exit *only* through a state's action.
- **Exports** — state images and every hotspot voice clip (base action,
  verb actions, per-item replies, per-state actions) are bundled in
  `.reel.json` exports and compacted to `asset:` refs like all other media.

Studio: the hotspot's inspector has a **🔁 States** section — add states,
reorder them (↑/↓; order = specificity), and edit each state's label, art,
cursor, action, `when` gate, lock override and accepted items. The hotspot's canvas card
shows a `🔁n` badge. `rainSector.ts` ships reference cases, and
`npm run test:stage` plays a full locked → opened →
emptied safe puzzle through the real UI.

### Doors as real doors (gate-aware barriers)

A barrier may carry a gate: while the gate is **shut** the barrier is a solid
wall the router respects, and the instant it opens the barrier *ceases to
exist*. That makes lock-and-key puzzles **spatial** — the walker physically
cannot reach the far side of the room, no matter what the menus say — instead
of a hotspot that merely refuses.

```ts
stage: {
  obstacles: [
    // furniture: always blocks
    { x: 20, y: 70, w: 26, h: 12 },
    // the door: blocks until bs_alley_clear is set
    { x: 176, y: 56, w: 7, h: 40, gating: { requiresFlags: ["bs_alley_clear"] } },
  ],
}
```

The gate is the full `Gating` vocabulary (items too — the crowd parts once
you hold the badge). The opening flag can come from anywhere: a key hotspot's
`flagSet`, a conversation choice's consequences, a puzzle reward, or a
**multi-state object's** state action — the natural pairing is a door object
whose *open* state re-skins the art while the barrier's gate lets the body
through. Everything downstream just works: markers behind a shut door stay
visible (you can see the exit, you can't reach it), click-to-walk slides the
walker up against the wall, and the validator flags a door whose gate flag
nothing can ever set.

Studio: Hotspots tab → 🚧 **Barriers** → click a barrier → the **🚪 Door**
gate editor. `npm run test:stage` plays the whole thing live — an alley the
kid and his crates seal until you talk him into moving.

### The sentence line (SCUMM's bottom strip)

Opt-in per room: `stage.sentenceLine: true` (Studio: 🎛 **Interaction** → 💬
**Sentence line**). A strip along the bottom of the room reads the pending
interaction out as you hover — **"Look at the drop-safe"**, **"Use wrench on
the bike"** with an item armed, the coin's verb with nothing hovered, or
plain **"Walk to"** on the floor — and **right-clicking an object is a quick
👁 Look**, exactly like picking look off the coin. Rooms without it (the
default) render nothing new, keep the browser's right-click menu, and classic
novel scenes are untouched.

### The walk test (🥾) — proof the room walks

The Stage tab's plate toolbar has **🥾 Walk test**: a live walker drops onto
the plate at spawn, driven by the **real engine router** — the same
`stageRoutePoly` A* the game uses, against the floor/path and barriers you've
authored, wide worlds included.

- **Click the floor** → the dashed gold polyline is the planned route and the
  walker walks it (depth-scaled speed, barrier sliding — the works).
- **Click a marker** → the walker walks to that marker's stand-point and the
  chip reports **✓ reached** — an unreachable marker says
  **✗ No route**, so a layout mistake is caught here, not in playtest.
- **WASD / arrows** drive the walker live, exactly like the player will.
- **🚪 Doors: shut/open** toggles every gated barrier at once — prove the
  locked room seals and the unlocked one flows, without setting a flag.

Rooms without the test running render nothing extra; nothing about the test
touches story data — it's a sandbox over the authored geometry.

### Interaction QoL (and clicking a moving NPC)

Four player-facing conveniences, all stage-side, all opt-in-safe:

- **H — reveal markers.** Pressing H pulses every marker (and every
  interactable NPC's chip) for a couple of seconds — the modern adventure
  "where can I click?" key.
- **Double-click — jog.** A second press on the same floor spot or marker
  within 320ms puts the walker into a 5× jog until they arrive or steer.
  Crossing a 200%-wide alley no longer means watching a stroll.
- **1-9 — coin hotkeys.** Number keys pick the verb coin's verbs in order
  (the SCUMM verb grid's muscle memory). Only while the coin is on screen —
  choice lists keep their digits during conversations.
- **N — nearest character.** With interactable NPCs in the room, N walks to
  and talks with the nearest one. No mouse, no chasing.
- **Talk zoom.** While a conversation with a character plays, the camera
  eases in on the walker (origin at their chest, ~1.22×) and eases back out
  when the floor is handed back. Purely visual — input is inert during
  conversations, so nothing about the coordinate math changes.
- **Prop occlusion (`hotspot.occludes`).** Stage object art normally
  depth-sorts *under* the walkers. Set `occludes: true` on a marker whose
  art is a big foreground prop — the crashed saucer — and its art draws
  OVER the characters, so they believably pass behind it. Default off.

**Walls are honest everywhere (Rain Sector hardening).** Click-to-walk
used to honour 🚧 barriers only when a route existed — the straight-line
fallback (and floor taps beyond furniture) ghosted straight through them.
Now every walk respects the same collision as the arrow keys: slide along
blocked faces, stop dead when boxed in, and give the walk up after ~0.75s
of no progress so a click beyond a wall can't pin the walker against it.
A marker that is walled off **behind a closed gate** refuses from wherever
the player stands (the gate's caption plays; no doomed wall-hug). And a
walker that *starts inside* furniture — a spawn dropped on an obstacle —
may always step OUT: walls bind from outside, and the router will not snap
them into a sealed pocket (the sliver between a dumpster and the world
edge is free space no grid can leave). A free walker sealed away from the
clicked side simply gets "no route".

**N talks, regardless of the armed verb.** Pressing N (or clicking an
interactable NPC) is a *talk* intent. It used to inherit the verb coin's
armed verb — with 👁 LOOK armed, N "examined" the character from across
the street instead of walking over. The walk now forces TALK; linked
markers answer it through their cursor (the validator's NPC-link check
already requires exactly that).

**Interactable NPCs.** An ambient NPC (`stage.npcs[]`) can carry
`talkHotspotId` — a link to a 🗣 start-conversation marker. When linked, the
actor **becomes** that marker: the static diamond hides, the character
carries a 💬 chip, and clicking them (or pressing N) sends the walker after
their **live** position — the pursuit re-routes ~3×/second while the actor
patrols, and the conversation fires the moment they're caught. Walking into
them works too. The validator flags dangling links (error) and links to
non-conversation markers (warning); Studio's NPC row has a **talk marker**
picker. Ambient NPCs without a link are untouched set-dressing.

## What the mode is missing (ranked)

1. **No drag-to-world inertia.** Dropping works, but the items don't have
   weight: no "you can't reach that from here", no throwing, no giving an item
   to an NPC by handing it over.
2. **One plate = one room.** ✅ **DONE** — `stage.worldWidth` (a camera that
   follows the walker across a strip wider than the viewport) and
   `stage.exitEdges` (walk-off-screen exits with red/yellow edge arrows) are
   in, with Studio authoring for both (see **Wide worlds** and
   **Walk-off-screen exits** above) — `rainSector.ts` uses both.
3. **Linear conversations.** NPC talk is beats + replies; a topic *list*
   (ask about X, ask about Y, leave) needs a
   `dialogue.topics[]` model with per-topic gates and exhausted states.
4. **Static NPCs.** Only the player has a walk cycle / idle animation. NPCs
   need `schedules` (room + position per flag) and their own sheets.
5. **No use-item-on-item at the cursor.** You can drag an item onto another
   item to combine them, and onto an object to use it — but you can't combine
   two items *while* one is in the world, and there's no "combine in hand".
6. **No pixel-perfect walk boxes.** The floor is a band, not a polygon. A
   `polygon` floor (or a painted walk-mask) buys diagonal rooms.
7. **One baseline per mask.** A mask flips on a single horizontal line, so a
   long counter the walker can stand in front of *and* behind is right at both
   ends and slightly wrong in the middle. A per-extra polygon (or painting a
   real depth buffer) would fix it.

## Testing it

```
npm run test:engine     # engine checks — includes the stage/adventure math
                        # and the multi-state resolver/validator/graph checks
npm run test:stage      # the walking stage's own beta harness — engine math,
                        # a full stage↔novel play-through, and a live
                        # multi-state safe puzzle in the real UI
npm run build
```

Authoring the room (Studio): the **Hotspots** tab has a 🚶 **Player start** mode
(drop the character on the plate), a
`⌖ Hotspots / 🚧 Barriers (no-go)` switch — in barrier mode you drag boxes
straight onto the plate, see the walkable floor band and every existing
barrier, click one to select it, and drag a new box to reshape it. The **Walkable
Stage** panel still carries the numeric rows, the 🎛 verb coin, near/far sliders
and the 🚧 list. Foreground extras get a 🚶 **Walk-behind mask** toggle plus a
depth-line slider on the Cinematic tab.

Engine-side pieces this mode depends on (all in `src/logic.ts`, all tested):
`stageBlocked`, `stageLineClear`, `stageRoute` (A* on a 2% grid, string-pulled,
sealed-room safe, aspect-aware clearance), `stageSpriteScale` / `stageSpeedScale`
for perspective, `extraOccludes` for walk-behind, `resolveVerbAction` /
`verbsForScene` / `wrongVerbLine` for the coin, plus `hotspotAtPoint` for the
click-to-walk target, `resolveCursor` / `cursorArtFor` for cursor art, and
`presetStyle` for idle animation on room art.

## Keep an illustrated room aligned on narrow screens

An optional `stage.plateAspectRatio` locks a 2D room's width/height ratio.
**🚶 Stage → Room plate & layout → Room aspect ratio** edits it; the floor editor and
layer composite preview use the same value. For a 1345 × 742 illustration:

```ts
stage: {
  plateAspectRatio: 1345 / 742,
  floor: { top: 83, bottom: 96 },
  spawn: { x: 40, y: 94 },
}
```

The game fits the background, walkers, object markers and walk-behind layers
in the same centered box. It does **not** crop the artwork independently of
its interaction coordinates. Remaining screen area becomes letterbox space;
HUD controls and captions remain on the surrounding screen. On portrait
phones (up to 640px wide), numbered pins replace long overlapping labels;
tap a pin, or focus it and press Enter, for the full object name and verbs.

Leave the field blank for existing fill-screen behavior. Valid ratios are
0.25–6. First-person Quake rooms do not use this 2D framing option. On a wide
scrolling room, the ratio describes one viewport; the Studio floor editor
fits the entire strip. For background dimming, **0 means full brightness**,
not 1; Studio now warns when an image is completely blacked out.


## HD point-and-click rooms: input, visibility, masks and audit

Use `stage.hotspotTrigger: "aim"` for deliberate interactions. Merely walking
through a shop exit must not leave the room. An explicit marker owns its walk
in every policy; a key direction or empty-ground command cancels it. Marker
labels are tooltips, not invisible wide click targets; a pointer command fires
once, not once on pointer-down and again on click. Deliberate edge exits remain
independent of marker policy. Test overlap with the inventory open, too.

In **Test → Walking room navigation audit**, select the return hub and run the
fresh-state audit. It excludes the map, probes approach to exits AND pickups /
conversations using the same `stageWalkStep` as play, and links to suspect rooms.
It does not simulate the full plot, every entry spawn, moving NPCs or scripted
movement. Keep ungated, repeatable local returns. The Blade Runner apartment's
`br_hs_apt_return` and mainframe's `br_hs_mainframe_home` demonstrate this.

`stage.npcs[].gating` controls actor visibility. Pair a departing NPC's gate with
its talk hotspot gate and `hiddenWhenLocked: true`; leave ordinary locked doors
visible. `stage.hidePlayer` hides the walker, not the approach rules: cockpit
controls should also be remote. Player/NPC x/y stay anchored at their feet when
scaled. The sprite forge's **Preserve pose scale / align feet** avoids stretching
crouching poses. `story.pulpPaper: false` seeds a photographic default, while
saved player preferences still win.

**Scene → Cinematics → Foreground sprites** supplies the reusable cockpit:
mask the moving scenery with an opaque-window/transparent-cabin alpha mask;
place the stationary cabin (transparent glass) on a separate fixed layer.
Alpha opacity reveals the scenery; transparency hides it. Match anchor, fit and
framing. `scroll.offsetX/Y` are percentages of the rendered tile (negative up /
left); resize remeasures it, and zero-speed/reduced-motion retain the same static
composition. `repeat:false` paints a single tile; `loop:false` plays once.
Do not call a scroll seamless unless the art's edges genuinely tile.

Portable export covers these masks, sheets, ESPER photos/enhancements and VK eye
art. Large JSON previews are explicitly truncated; Download/Copy retain the full
payload. Media library reads use cursors, avoiding a single huge IndexedDB IPC
response. Keep master art outside story JSON; rebuild this pass's derivatives
with `scripts/blade-runner/prepare-assets.mjs` while Vite is running.
