# 🚶 STAGE NODES — the walkable scene

A **Stage node** is a scene that plays as free-roam exploration: no prose panel,
nothing to read before acting. The player walks a character around a floor,
walks up to things to interact with them, talks to characters to open
conversations, and walks to a door to leave.

Set it in **Studio → Scene tab → Node Layout Type → "🚶 Walkable Stage"**
(or the "🚶 Stage" canvas button), then configure the floor / spawn /
character in the **🚶 Stage tab**. Stage settings are grouped into folded
sections — **🗺 Room plate & layout** (the drag-everything visual editor),
**➡ Entrances & exits**, **🎬 Scene opening** (caption + scripted entry
sequence), **🕵️ Player character**, **🚧 Obstacles**, **🚏 Ambient NPCs**,
**🎛 Interaction** (verb coin, marker labels) and **📐 Floor & movement
numbers** — so a long setup stays scannable and each group re-opens where
you left it.

### The NO-HUD variant

**Node Layout Type → "🚶 Walkable Stage — NO HUD"** is the same walkable
stage with zero in-game chrome: no ☰ Menu, no Case Progress meter, no leads
or action panel, no auto/skip chips, no ◂ Back / 🎙 Narration row, no
inventory dock and no sound/help corner — just the plate, the walker, its
markers and the conversation subtitles (credits/cutscene-style cleanliness
for a *playable* room; it stores as `nodeType: "stage"` + `hideHud: true`,
so every stage feature — patrols, entry scripts, edge exits — works
identically). Great for cinematic strolls, title-adjacent vignettes, and
screenshot-friendly rooms. The player is never trapped: **Esc** still opens
Leave the case? with **💾 Save & exit**. The Stage tab shows a gold banner
while a room is no-HUD, with a one-click switch back.

> **Heads-up:** with the dock hidden, equip-and-USE item verbs and
> crafting aren't reachable — keep no-HUD rooms item-free (or gate item
> play behind 💬 talk / ✋ take markers). Ctrl-shift-armed authors: the same
> room flips back to full HUD any time, nothing is duplicated.

---

## How it plays

| Standard node | Stage node |
| --- | --- |
| Prose panel types out a paragraph | **No prose panel.** Narrative is a one-line caption (`enterCaption`) plus short 💬 show-text markers |
| Click a hotspot zone → instant | **Walk to a marker** — the reticle sits ON THE OBJECT, right where you drew the zone (a wall poster keeps its marker on the poster) — and it fires when the character reaches the floor beneath it. **Looks are the exception:** 👁 verbs and 💬 show-text zones fire at a distance, no walk-up |
| Beats play automatically after prose | Beats play only when the player **talks** (a 🗣 marker) — the conversation |
| Choices wait at the bottom | Choices appear **only at the end of a conversation** — give them `timeLimitSeconds` for the "decide now" pressure (a shrinking ring; when it runs out the player says nothing and the reply disappears). Turn on **💬 Interruptible dialogue** in the Scene tab to let them answer *over* the last line instead, so the clock is already running while the speaker is still talking |
| Exits are choices / hotspot zones | Exits are **door markers** (→ Go to scene hotspots) you walk to |

Movement: click the floor to walk (clicks outside the band snap to its
nearest edge) or use **WASD / arrow keys**. The character scales with depth
(`depthScale`) so walking "up" the floor reads as walking away. While a
conversation plays the stage sleeps; when it ends the player is walking
again.

## The five marker verbs (Hotspots tab)

A stage marker is an ordinary hotspot — same gating, same actions, same
one-shot consumption. The marker renders ON the object (bottom-centre of the
zone you drew — nothing "drops" onto the floor any more) and the character
walks to the floor point beneath it before acting — except **looks**, which
read at a distance:

- **💬 Show text** — look/describe. Plays as a bottom caption (auto-fades),
  not the centre exam card. **Fires from where the character stands** — no
  walk-up (same for the 👁 Look verb in verb-coin / object-menu rooms).
  For a thing they could see but never even walk under (a tower clock),
  tick 🔭 out-of-reach instead — same distance fire, for EVERY verb, and
  strolling underneath never triggers it.
- **🎁 Give item / 🚩 Set flag / ⚙ Use item** — pickups and world-state,
  unchanged.
- **🗣 Start conversation** — the heart of the node: walking to this marker
  plays the scene's **dialogueBeats** as a conversation (the normal cinematic
  dialogue panel, portraits, press-the-lie, everything), then the scene's
  **choices** appear. `flagSet` on this action marks "talked to X" once.
  `isRepeatable` keeps the marker for re-talks.
- **→ Go to scene** — the door. Walk to it, scene fades to the target.
- **📌 Corkboard / 🔍 Pattern puzzle** — work too.

Object art (an NPC, a prop) goes in the hotspot's **image** field: the stage
anchors it with its feet on the marker, depth-sorted with the characters.

## The walker's look — four tiers

The player character renders from the first of these that's set
(Scene tab → 🚶 Walkable Stage):

1. **`stage.playerSheet` — a sprite sheet** (best). ONE image holding a grid
   of frames (counted left→right, top→bottom, starting at 0) plus named
   animations. The engine plays `walk` while moving and `idle` at rest, with
   graceful fallback (missing `idle` freezes on `walk`'s first frame; any
   missing name falls back to the first animation defined). Set per-animation
   `fps` (default 8) and `loop` (default true; `false` holds the last frame).
   `pixelated: true` keeps pixel art crisp. Rendered via CSS
   `background-position` stepping — no canvas, zero work while idle on a
   single frame. Demo: `public/assets/sprites/gumshoe-walk.png` (4 frames of
   114×192), wired up in *Anatomy of a Lie*'s stage scene.

   ```ts
   playerSheet: {
     image: "/assets/sprites/gumshoe-walk.png",
     frameWidth: 114, frameHeight: 192,
     animations: { idle: { frames: [1] }, walk: { frames: [0, 1, 2, 3], fps: 8 } },
     pixelated: true,
   }
   ```

2. **`walkFrames`** — 2–4 loose frame images cycled while walking (frame 1
   doubles as the idle pose).
3. **`playerImage`** — a single sprite image, procedurally bobbed.
4. **`emoji:…`** — the zero-asset placeholder (also bobbed).

`playerSheet.image` is a media-bearing field: it's wired into all three
`mediaLibrary.ts` walkers (visit / resolve / compact), the voice-pack
bundler, the import/export round-trip seed, and the preflight asset-exists
check. `spriteSheetIssues()` (src/game/spriteSheet.ts) validates sheets and
surfaces problems as Check-tab warnings.

> Sprite sheets also drive **talking portraits** (`character.talkingSheet`)
> and **animated foreground extras** (`foregroundExtra.sheet`), and the
> Media Tools tab has a **Sheet slicer** for working out any sheet's grid — see
> `docs/sprite-sheets.md` for the full picture.

## Authoring recipe (the walkable loop)

1. **Floor & spawn** — drag the neon band and 🕵️ dot in the Scene tab's
   mini-plate (or type the numbers). Markers can be dragged there too.
   **🚧 Obstacles** the same: arm *🚧 Draw obstacle* and drag a box, then
   drag boxes to move them and pull the selected box's **↘ corner** to
   resize — the x/y/w/h fields in the list below update as you drag.
2. **A look pass** — 2–4 💬 show-text markers with one-liner captions.
   Keep lines SHORT; captions hold ~3–6 seconds.
3. **One conversation** — a character sprite (hotspot image) + 🗣 marker +
   the scene's beats. End the conversation with choices; time-limit the ones
   that should panic the player.
4. **A door** — one → Go to scene marker so the scene can't soft-lock
   (the validator enforces this).
5. **Gating for reactivity** — a beat/choice gated on the flag the 🗣 marker
   sets is how the room "remembers" you talked to someone.

## Ambient NPCs (🚏 section)

Stage life that idles, patrols and performs set motions between pauses —
drag actors and numbered stops on the plate preview, give each stop a motion
/ facing / ambient say-line / arrival **size**, and pick the route mode
(loop / pingpong / once). The things beta testers trip on:

- **Ids must be unique.** Scripted sequences target actors BY ID and the
  control registry keys on it — two actors sharing an id means steps drive
  only the last-mounted one (and a script's cleanup leaves the other frozen).
  The validator errors on duplicates.
- **Coordinates are WORLD-%**, not viewport-%: on a 200%-wide room, x=90 is
  45% across the strip. Spawns/stops past the plate edge are invisible and
  now warn in Validate (the same stop validates clean on a wide world). You
  never type those coordinates: drag the actor's spawn dot and the numbered
  stop dots on the plate preview.
- **Looks are picked, not typed.** The per-actor *art* row has the image
  picker (uploads, cutouts and built-ins, with hover previews) next to the
  emoji box — same as the player sprite, walk-cycle frames and scene
  backgrounds. No field anywhere needs a hand-typed image URL.
- **Blank speed = 12 %/s, the ambient default** — deliberately slower than
  the player's walk (default 18) and never inherited from it. A fast player
  must not make every bystander sprint their beat; set the field for
  anything brisker.
- **Patrol legs are straight lines** — no obstacle avoidance for ambient
  actors; route stops around furniture yourself (obstacles only constrain
  the player).
- **Scripted sequences don't freeze un-targeted NPCs** — while the letterbox
  is down, actors the script never mentions keep patrolling. By design: the
  room stays alive behind the cutscene.
- **`once` holds the final stop's set motion forever** — including its
  say-line, which stays floated permanently. Also by design (a tableau), but
  keep the last stop's line empty if you don't want it hanging over heads.
- A **`say` step aimed at a missing npcId** still paces out the line's
  read-time (the cutscene can't know how long "nothing" takes) — Validate
  flags the ghost reference, so fix it there.

## Validation rules (Check tab)

- Stage nodes with **prose** → warning (prose never shows in play).
- **No way out** (no door marker, no auto-advance, no choices) → error.
- **Duplicate ambient-NPC ids** → error (script steps key off the id and
  would drive only one of the actors).
- **Off-plate NPC spawn or patrol stop** (x outside 0–worldWidth, y outside
  0–100) → warning.
- **NO-HUD on a non-stage scene** → warning (the flag only applies to the
  walkable-stage layout).
- **🗣 marker with no beats** → error; **beats with no 🗣 marker** → warning.
- **Choices-only exits** on a stage with a conversation → deliberate-pattern
  heads-up (the player must talk before they can leave).
- Spawn outside the floor band, thin floor bands, single-frame walk cycles →
  warnings.
- **Sprite-sheet problems** (no image, non-positive frame size, empty/negative
  frame lists, missing `walk`/`idle` names) → warnings via `spriteSheetIssues`.
- **Scripted-sequence steps** aimed at a missing NPC / scene, emptied
  scripts, steps after a goToScene → warnings/errors (see the 🎬 sequence
  editor's inline help).

## Legacy

Old exports with the bolt-on `stage2d` setting import as stage nodes
automatically (`stage2d` → `nodeType: "stage"` + `stage`). The old
walk-on-a-standard-scene behaviour is gone — the stage node replaces it.

## Desktop

Nothing new to package — stage nodes are ordinary scenes in the same Vite
bundle; the Electron shell (and `npm run desktop:dist`) ships them as-is.
