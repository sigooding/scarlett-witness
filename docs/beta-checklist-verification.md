# Beta checklist verification — walkable-stage NPC findings

Claims verified against the engine (Stage.tsx / logic.ts) and what changed.
Date: 2026-09-01.

## 1. Duplicate NPC ids — ✅ CORRECT, now a validator ERROR

`Stage`'s script-control registry is a `Map<string, StageNpcCtrl>`
(`npcCtrlRef` in `src/game/Stage.tsx`): a second actor registering the same
id overwrites the first, so `npcWalkTo` / `npcMotion` / `say` steps drive
only the last-mounted actor, and the script's end-of-cutscene `release()`
loop reached only that one too — the other could stay frozen mid-override.
All silent.

**Fix:** `validateStory` now errors: *"…has N NPCs sharing the id X —
scripted-sequence steps (walk / motion / say) key off the id, so they'd
drive only one of the actors."* (Check tab; engine test:
"npc: duplicate ids are an error".)

## 2. Off-plate spawns/waypoints — ✅ CORRECT, now a validator WARNING

Ambient-NPC coordinates are **world-%** (0–100 on a normal room, up to
`worldWidth` on a wide scrolling room). NPC movement is a straight-line walk
toward each stop with no plate clamp, so a stop past the plate edge walks
the actor where the camera can never reach — silently.

**Fix:** `validateStory` warns for NPC spawns or patrol stops with
`x` outside `0…worldWidth` or `y` outside `0…100`, naming the room's actual
width. The same coordinates validate clean on a 200%-wide world (engine
test: "npc: the same spawn+stop validate clean on a 200% world").

## 3. NPC speed inherited the player's room speed — ✅ CORRECT, fixed

`StageNpcActor` used `npc.speed ?? settings.speed ?? 18` — an NPC with no
authored speed walked at the ROOM's player speed (default 18 %/s), hence the
sprinting beat.

**Fix:** dedicated `STAGE2D_DEFAULT_NPC_SPEED = 12` in `src/logic.ts`; NPCs
with no authored speed now use it, fully decoupled from the player's pace.
Documented in the 🚏 Ambient NPCs section intro, the speed field's tooltip,
and `docs/stage-nodes.md`.

## 4. Confirmed by design (no change needed, now documented)

- **Patrol legs are straight lines.** Ambient NPCs have no obstacle
  avoidance (obstacles constrain only the player); route stops around
  furniture yourself. (`walkToward` — `src/game/Stage.tsx`.)
- **Un-targeted NPCs keep patrolling under the letterbox.** During a
  scripted sequence only actors the script names take script overrides; the
  rest keep their ambient patrol so the room stays alive. Intentional.
- **`once` routes hold the last stop's set motion forever** — including its
  ambient say-line, which therefore hangs permanently. Keep the final stop's
  line empty unless you want the tableau.
- **A `say` step with a ghost npcId paces out the line's read-time** (the
  player wouldn't see anything — Validate already flags the missing-NPC
  reference, so fix it there). The stall exists because the runner can't
  know how long "nothing" should take; the read-time pause is the least
  surprising fallback.

All four are written up for authors in `docs/stage-nodes.md` →
"Ambient NPCs (🚏 section)".
