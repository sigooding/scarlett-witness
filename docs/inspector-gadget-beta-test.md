# Inspector Gadget: The Clockwork Caper — Studio beta test

**Date:** 2026-09-01 · **Branch:** `arena/01a05c8b-scarlet-reel`
**Purpose:** beta-test the Studio end-to-end by authoring a brand-new case from
scratch, and prove out the new **🔭 OUT OF REACH** hotspot option
(`Hotspot.remote`) that ships alongside it.

The case is registered in the newsstand (`src/data/inspectorGadget.ts`, first
card in `stories.ts`). Art generated for it: `/img/cover-inspector-gadget.jpg`,
`/img/bg-ig-plaza.jpg`, `/img/bg-ig-lair.jpg`.

---

## 1. The new option under test: 🔭 OUT OF REACH (`Hotspot.remote`)

**What it is.** On a 🚶 walkable stage, the character normally walks to a
zone's marker before it fires — and the marker itself is clamped down into the
walkable floor. That makes "things you can see but never reach" (a clock high
on a tower, a sign across the water) unauthorable: the reticle slides down to
the pavement and the look reads as if the character inspected the cobbles.

**The option** (Hotspots tab → "🔭 out of reach — works from a distance"):

- clicking the zone fires its action **from wherever the character stands** —
  no walk-up, the walker just turns to face it;
- the marker reticle stays **on the object** instead of clamping to the floor;
- strolling underneath never triggers it by accident (remote zones fire only
  by clicking);
- any verb the zone answers works at range (👁 look is the natural fit); the
  flag/gating economy is identical to walked-to zones.

**Reference usage:** "The tower clock" on the Clockwork Caper plaza — a remote
👁 look zone whose bottom edge (36%) sits fully above the floor band (top 66%).
It sets `ig_clock_stuck`, which (with the gauntlet item) gates the tower
service door — proving a remote look feeds normal progression.

## 2. How it was tested

| Layer | Harness | Result |
|---|---|---|
| Types + Studio + engine compile | `tsc --noEmit`, `vite build` | ✅ clean |
| Structural probe (validator, wiring, gold-path sim, remote contract) | `node scripts/beta/gadget-harness.mjs` (new) | ✅ 41/41 |
| Real mounted app (happy-dom): boot case → HQ → plaza, click the clock | `npm run test:dom` (new INSPECTOR GADGET phase) | ✅ remote look fired in <400ms with **no walk-up**; door marker shows 🔒 |
| Full suite regression | `npm test` (engine 925 ✅ · media roundtrip ✅ · DOM smoke ✅) | ✅ |

The DOM phase is now permanent, so the remote-hotspot contract is regression-
tested on every `npm test`.

## 3. Bugs & traps found while authoring (the actual beta findings)

1. **Dead `ambientAudio` values play as silence, unflagged.** The synth
   registry knows only `rain / jazz / drone / tension`, and `buildAmbient()`
   returns `null` for anything else — no error, no sound. The shipped Scooby
   Ravenswood gate scene had `ambientAudio: "storm"` (that's a *particles*
   preset, not an ambient loop): its storm was mute. **Fixed:** the scene now
   uses `rain` (thunder still comes from `particles: "storm"`), and
   `validateStory()` gained a warning for unknown ambient ids, so the Check
   tab catches this class of typo from now on. (First draft of this very case
   hit the same trap with `"street"`.)

2. **`attitudeTag` is presentation-only — meters move only via explicit
   `meterChanges`.** Gating a choice on `minMeters: { Clever: 1 }` while every
   Clever-flavoured choice merely carries the *tag* produces a permanently
   locked choice, and the validator does not flag the unsatisfiable gate.
   Caught by the probe's gold-path simulation; the case now grants Clever +1
   via real `consequences`. *Open suggestion:* a validator pass that checks
   `minMeters` gates against the story's actual meter sources.

3. **Validator quality is genuinely good on flags:** it caught
   `ig_found_gauntlet` being set-but-never-read on the first run, with an
   actionable message (wire it, note it, or drop it). Fixed per its advice.

4. **Confirmed by design (documented, not bugs):** a non-remote zone drawn
   above the floor clamps its marker to the floor top (the probe asserts the
   clamp as the counterfactual for `remote`); `showItemImage` needs the item
   to exist before the zone renders its icon; QTE timeout branches need their
   own target or the choice silently falls through.

## 4. Studio surfaces exercised by the case

Stage node (spawn / floor band / obstacle routing / proximity hints /
enterCaption) · all five marker verbs (👁 look, ✋ take + `showItemImage`,
💬 startDialogue, ➜ go, and the new 🔭 remote look) · gated hotspot with
`customFailMessage` (flag **and** item) · flag-gated dialogue beat ·
QTE choice (heartbeat, shaky cam, `timedOutTargetSceneId`,
`timedOutConsequences`) · meter-gated choice · attitude tags · `flagNotes` ·
briefing · three endings (gold / silver / game-over) · gradient and image
plates · canvas `layout` map.

## 5. How to replay the beta

```
npm run dev                       # newsstand → "Inspector Gadget: The Clockwork Caper"
node scripts/beta/gadget-harness.mjs   # structural probe (41 checks)
npm test                               # full suite incl. the DOM phase
```

In Studio: open the case → **Hotspots** tab → plaza scene → "The tower clock"
to see the 🔭 checkbox, and drag/resize any zone directly on the plate (the
move/resize handles shipped in the previous change).
