# Making the walkable stage a real SCUMM room — assessment & roadmap

**Date:** 2026-09-01 · Written after a code audit of `Stage.tsx`, `logic.ts`
(stage geometry/routing), `Game.tsx` (stage wiring) and the Studio stage tab.

## What you already have (stronger than you may think)

The stage engine already covers a surprising amount of LucasArts ground:

| SCUMM concept | Scarlet Reel today |
|---|---|
| Walk boxes | Floor band + arbitrary walk **polygon** (`floorPoints`), obstacle rects with **A\* routing** (`stageRoutePoly`) |
| Actor scaling | Depth scale by y (`depthScale`, near/far scale), speed scaled with depth |
| Scrolling rooms | Wide worlds (`worldWidth` up to 400%), camera follow, walk-off-screen exits with gating |
| Verbs | Verb coin (verb-first), object-first pie ("skull"), hold-to-open pie, per-hotspot `verbs`, wrong-verb lines |
| Sentence building | USE item-on-object via drag or coin, `acceptsItems` / `itemResponses` |
| Walk-behinds | Foreground extras with `occludeBaseline`, z-sort by feet |
| Actors | Player walker (sheet/frames/poses), ambient NPCs with patrols — now with **set motions** (below) |
| Out-of-scene logic | Flags/items/meters gating, startDialogue topics, captions |
| Remote objects | 🔭 `Hotspot.remote` (out-of-reach zones — look/act from a distance) |

## ✅ Shipped with this commit: NPC SET MOTIONS

The thing SCUMM rooms live and die on is actors *doing things*. `StageNpc`
waypoints are now full motion beats:

- **`patrol[i].anim`** — named sheet animation played during the pause
  ("sweep", "hammer", "drink"); falls back to `idleAnim`, then idle.
- **`patrol[i].facing`** — turn left/right on arrival (face the bar, not the
  camera).
- **`patrol[i].say`** — an ambient line floated over their head while paused
  (SCUMM background chatter; not a dialogue beat, no narration).
- **`idleAnim`** — a named motion at rest for patrol-less standers (the
  barman's "polish").
- **`patrolMode`** — `loop` (default) / `pingpong` / `once` (walk the route a
  single time and hold the last stop's motion forever — an actor who crosses
  the room and settles in).
- **Trick:** one waypoint on the spawn = a standing actor cycling a motion +
  line on a timer, zero walking.

Studio: Stage tab → Ambient NPCs — per-waypoint motion/face/say inputs, idle
motion, route mode. Validator: motion names are checked against the NPC's own
sheet animations (typos warn instead of silently idling). Demo: the Clockwork
Caper plaza (Brain does a sniffing round with chatter; a commuter pingpongs
across the square).

## The gap list — what would move the needle most, in order

### 1. Scripted sequences ("cutscene scripts") — ✅ SHIPPED
SCUMM is a scripting VM; rooms come alive because authors can *sequence*
actions: walk Guybrush to the door, walk the shopkeeper in, two lines, a
flag, hand control back.

**Now in the engine** (`StageScriptStep` in src/types.ts): a step array
runnable on scene enter (`StageSettings.enterScript`, with a save-proof
run-once latch `enterScriptFlag`) or from a hotspot action
(`type: "runScript"`, stage nodes only — classic graphic-novel scenes ignore
it by design). Steps: `walkTo` (player, obstacle-routed like a click),
`npcWalkTo`, `npcMotion`, `say` (floating line over player or NPC, auto
reading time), `face`, `pose`, `wait`, `setFlag`, `goToScene` (ends the
script). Input locks under letterbox bars while it plays; NPCs suspend their
patrols when scripted and resume after. Studio has a step-list editor on
both the runScript action and the stage tab; the validator catches scripts
on classic scenes, missing NPC targets, dead goToScene targets, unreachable
trailing steps and empty scripts; script flags/edges feed collectFlags and
the story graph. Demo: the Clockwork Caper plaza entrance (Brain runs up
with a warning, once per story).

### 2. Interactable NPCs (hotspot pinned to an actor)
Interaction currently lives on static hotspots, so you can't talk to someone
who is *moving*. Add `Hotspot.npcId`: the marker/zone tracks that NPC's live
position each frame; walking up to a patrolling character intercepts them
(pause patrol while engaged, resume after). Small change in `Stage.tsx`
(marker position source) + one Studio dropdown.

### 3. NPC reactions to player proximity
`StageNpc.onApproach` — within N%, play a motion / say a line / face the
player once per visit ("Oi, watch the shoes!"). Cheap, hugely alive.

### 4. Walk-box polish
- Per-region scale override (SCUMM walk-box scale slots) for forced
  perspective — a doorway band where the walker is drawn smaller than the
  y-depth implies.
- Footstep SFX while walking (synth tick per step, surface-flavoured).
- Double-click to run / instant-arrive (LucasArts QoL from CMI onwards).

### 5. Sentence line skin
You have the verbs; SCUMM feel is the **sentence bar** ("Use gauntlet with
service door") assembled at the bottom as you hover. A display-only strip fed
by the existing verb/held-item state — pure UI, big nostalgia payoff. Could be
a per-story theme option next to the verb coin toggles.

### 6. Dialogue trees on the stage
startDialogue topics exist; the SCUMM touch is speech text floating over the
speaking actor's head in their colour (talkie style) rather than the dialogue
panel, for short stage exchanges. The say-line renderer added for NPCs is the
building block.

### 7. Room state persistence
NPC positions / one-shot ambient lines reset on re-entry. A tiny
`stageStateBySceneId` in the session (NPC idx, fired ambient says) would make
rooms feel persistent. Low urgency — most rooms are visited once.

## Suggested order of attack

1. ~~**Scripted sequences**~~ ✅ shipped (see §1)
2. **Interactable/moving NPCs** (`Hotspot.npcId`)
3. **onApproach reactions** (an afternoon)
4. **Sentence line skin + footsteps** (polish pass)
5. **Walk-box scale overrides / room persistence** (when a story needs them)

Each is independently shippable and testable with the existing harness
pattern (`scripts/beta/*`, DOM smoke phases).
