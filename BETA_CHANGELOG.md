# Scarlet Reel — BETA CHANGELOG

## Summary
Implements smarter particles, dramatic transitions, 5 new engine visuals, animated HUD, richer NPC idle, plus Studio controls and showcase story. Fixes rain-on-lens (was terrible) and buggy transitions (reverse wipe).

## Files Changed (10)
- NEW `src/game/AmbientParticles.tsx` (1164 lines) — full canvas particle engine
- `src/index.css` (+354) — rain lens, shafts, HUD, NPC idle, transitions fix
- `src/game/Game.tsx` (~274) — particle kinds, DOF toggle, transition overlay
- `src/game/Stage.tsx` (~323) — shadow casting toggle, NPC idle polish
- `src/types.ts` (+73) — CinematicSettings 10 new fields, particles + transitions extended
- `src/studio/Studio.tsx` (+94) — particle picker 12 kinds, transition picker 11 types
- `src/studio/CinematicControls.tsx` (+96) — ✨ Dynamic Visuals section
- NEW `src/data/jackMorrowMidnightReel.ts` (485) — showcase story
- `src/data/stories.ts` (+2) + `src/App.tsx` (+13) — routing

## 1. Smarter Particles — `AmbientParticles.tsx`
**Before:** 3 types (rain/smoke/storm) DOM only.

**Now ParticleKind:** `none | rain | drizzle | snow | smoke | storm | dust | fog | ember | ash | fireflies | motes`

- **rain/drizzle/storm:** `RainCanvas` canvas, wind gusts, depth, variable streak. Storm: `StormLightning` 4 bolt polygon paths, 55% fork, flash tint blue/white, dur 0.32-0.6s, thunder `audio.thunder()` 400-1800ms delay, schedule 3-10s.
- **dust/motes:** `DustCanvas` 54-88 particles, light-reactive (glow + attraction to `resolveLights`), parallax from `--par-x/--par-y` or pointer, twinkle `sin(phase + t*speed)`, depth 0..1 drives size/opacity/shift.
- **fog:** `FogBanks` 3+ density*2 banks, depth fog `depthFactor = 1 - top/100`, `opacity = lerp(0.1,0.6,depthFactor) * rand * (0.7+dim*0.8)`, blur 18-46px, `fog-drift-smart` with `--fog-dir`, `--fog-depth`, `--plane-shift = 4+depth*24`, plus shafts through fog (`parallax-mid`).
- **ember/ash:** rising/falling with lift + flicker, orange/gray, dimAmount glow.
- **snow:** swirl + 6-point flakes, wind gust every 3s, wobble.
- **smoke:** soft plumes.
- **fireflies:** warm pulsing sharp on/off lazy drift.
- **Reduced-motion:** static gradient/dot fallback.

**Rain-on-lens FIXED:**
- Old: 14*intensity circles 6-18px blur 1.5-4.5px `mix-blend: screen` opacity 0.18-0.42 = smudgy.
- New: 22*intensity tiny beads 1.5-4.2px opacity 0.08-0.18 blur 0.2-0.6px + 7*intensity medium drops 6-12px head + tail 18-52px gradient `transparent→rgba(175,205,255,0.18)→0.32→0.55` + 2* large beads 11-17px. Each `--drift` px + `--wobble` deg, head radial at 32% 28% white→blue→transparent, inset shadow, border 0.5px white/28%, `backdrop-filter blur(0.8px)` only on head, `transform-origin 50% 100%`, no screen blend. Anim `rain-lens-slide -24%→132vh` drift*0.3-1.2 + wobble, opacity 0→1 at 8% →0.9 at 78% →0 at 100%; `rain-lens-slide-large -28%→135vh cubic-bezier(0.2,0.6,0.3,1)`. Overall haze 0.035 neutral blur 0.8px.

## 2. Five New Dynamic Visuals (all toggleable in Studio)
1. **Volumetric shafts:** `volumetricShafts?: boolean`, `shaftsIntensity?: 0-2 default1`. When lights exist. Opacity `0.18*flicker*intensity`. Shafts `parallax-mid` shift `6+size/100*18`, rotate `(x-50)*0.06deg`, blur 22px, gradient `color00→1A→0D→06→transparent`. Extra dust motes in shafts. Flicker when `ambientAudio=tension`: `0.85+sin(t*1.8)*0.15+sin(t*3.1+1.3)*0.07` rAF.
2. **Depth fog:** `depthFog?: bool`, `fogStrength?: 0-1 default0.6`. Density `strength*1.8`. Opacity lerp 0.1-0.6 by y (far hazier).
3. **Shadow casting:** `shadowCasting?: bool`, `shadowIntensity?: 0-1 default0.8`. NPC+walker `skewX((light.x-x)*0.18*intensity)` `scaleY 0.8+depth*0.4+light.intensity*0.3*intensity` opacity `min(0.55,0.25+depth*0.15+light.intensity*0.15)*intensity`.
4. **Rain on lens:** `rainOnLens?: bool`, `rainLensIntensity?: 0-2`. Auto with rain/drizzle/storm, manually toggleable.
5. **DOF on talk:** `dofOnTalk?: bool`, `dofBlur?: px default2`. When `stageConvo=open`, plate `filter: blur(px)` 0.45s ease, foreground extras sharp.

## 3. Dramatic Transitions — FIXED (was buggy)
Old used single transform for enter/exit → black overlay slid back same side (wipe-left looked like wipe-right).

New in `index.css`:
- `iris-in 0%→150% circle`, `iris-out 150%→0%`
- `wipe-left-in 100%→0`, `out 0→-100%`; wipe-right -100%→0 / 0→100%; wipe-up 100%Y→0 / 0→-100%Y; wipe-down -100%Y→0 / 0→100%Y
- `slide-left-in 100% scale1.06 opacity0→0 scale1 opacity1`, `out 0→-24% scale0.96 opacity0`; slide-right mirrored
- `zoom-in 1.32→1`, `zoom-out 1→0.88`
- `scene-glitch-anim` clip-path inset slices + translateX skewX hue-rotate contrast; `scene-burn-anim` radial orange→black brightness 2.4-2.8 blur 1-8px
- Applied `[data-transitioning="1"] animation: in`, `[0] animation: out`
- Beat transitions also: `beatbg-wipe-*` via `clip-path inset`, `beatbg-zoom-in`, `beatbg-glitch-in`, `beatbg-burn-in`

## 4. Animated HUD — `index.css`
- `hud-enter` translateY10 scale0.98 blur4→0 0.42s cubic-bezier(0.22,0.61,0.36,1)
- `hud-corner-draw` scale0.6→1 0.5s 0.15s delay
- `hud-shimmer-sweep` -120%→180% skew -12deg
- `meter-shimmer` bg-pos -200%→200%
- `choice-stagger-in` Y8 X-4→0 delays 0.04/0.11/0.18/0.25/0.32s
- `toast-slide-up` Y14 scale0.96→0 + child delays
- `.hud-frame` entrance, `::before` corners, `.hud-btn::after` shimmer on hover, `.hud-meter-fill::after` shimmer overlay

## 5. Richer NPC Idle — `Stage.tsx` + `index.css`
- Inner handles so outer pos never fights
- `npc-look-pulse` scaleY1→1.03 brightness1→1.08 gold drop-shadow
- `npc-breathe-idle` scaleY1→1.02 (2.8s), `npc-sway-idle` rotate ±0.6deg (3.4s), `npc-fidget-shift` translateX 1.5px
- Classes `.npc-looking` gold glow + dot `::after`, `.npc-fidget-breathe/sway/bob/drift/pulse`
- Ambient chatter bubble `npc-say-fade` 0→1→0 with flip var

## 6. Studio UI
- `Studio.tsx` Particle select: 12 options with emoji + description, helper text per kind (light-reactive, depth, etc.)
- Transition select: 11 types (fade, fade-black, cut, iris, iris-in, wipe-left/right/up/down, slide-left/right, zoom, glitch, burn) + speed 0.1-3s
- `CinematicControls.tsx` NEW section ✨ Dynamic Visuals (gold) — 5 toggles + sliders + notes explaining formula, live preview, respects reduced-motion

## 7. Types — `src/types.ts`
- `CinematicSettings`: 10 new optional fields (volumetricShafts/shaftsIntensity, depthFog/fogStrength, shadowCasting/shadowIntensity, rainOnLens/rainLensIntensity, dofOnTalk/dofBlur)
- `SceneNode.particles`: extended 8 kinds, `particleConfig?`
- `SceneNode.transition` + `DialogueBeat.backgroundTransition`: extended 8 types
- All optional, defaults preserve old scenes

## 8. Showcase Story
`jackMorrowMidnightReel.ts` 6 scenes: credits (fade) → warehouse dust+shafts+depthFog+shadows (iris) → rain alley rain+rainOnLens (wipe-left) → interrogation DOF (slide-left) → rooftop storm+all (zoom/glitch) → finale burn. Each demonstrates toggles.

## 9. Bugfixes
- Rain lens smudgy → realistic glass beads
- Transitions reverse → proper in/out
- Particles static → canvas light-reactive parallax reduced-motion
- HUD static → animated
- NPC static → breathe/sway/fidget/look-pulse
- Stage no shadows → cast shadows

## 10. Backwards Compat / Perf
- Optional fields, defaults on when lights exist, DOF on, rain lens auto
- Old particles/transitions still work
- DPR capped 2, rAF dt max 0.05, will-change only animated, pointer-events none, screen blend only shafts/fog not rain lens
- Reduced-motion disables rAF + canvas + transitions

## Beta Test Checklist
- Particles: Studio Scenes → Particle Effects → test each 12, storm lightning+thunder, dust with lights+mouse parallax, fog depth top thicker
- Dynamic Visuals: Cinematic tab ✨ → toggle shafts off/on + intensity 0-200%, depthFog + strength, shadows off/on + intensity (move NPC near light check skew), rainOnLens even on non-rain + intensity, dofOnTalk + blur 0-6px open conversation
- Transitions: Scenes Transition → iris, wipe-left should cover 100→0 then uncover 0→-100% not reverse, wipe-right/up/down, slide-left 100% scale1.06 opacity0→0 scale1 opacity1 exit -24% scale0.96, slide-right mirrored, zoom 1.32→1 / 1→0.88, glitch, burn — verify black doesn't slide back same side
- Play Jack Morrow — Midnight Reel: warehouse dust reacts to lights shafts drift mouse flicker tension, rain alley droplets tail drift/wobble, interrogation DOF blur plate, rooftop all
- Reduced-motion OS setting → static fallback, transitions instant
- HUD: hud-frame entrance 0.42s corners 0.5s buttons shimmer hover choices stagger toasts slide-up
- NPC Stage: idle breathe/sway/fidget, near player look-pulse gold glow dot, say bubble fade
- Build passes

## Beta Test Results (post-fix)

### Findings & fixes
- **A. Invalid 9-digit hex colours (all cinematic glows).** `lightColor` hex values were alpha-suffixed (e.g. `#e8b23c33`), producing invalid colours on light pools, glows and shadows. Added `glowColorWithAlpha(color, alpha)` in `src/cinematic.ts` (hex/rgb → proper `rgba()`, named/hsl → `color-mix(…, transparent)`) and used it at every glow/shadow site in `AmbientParticles.tsx` and `Stage.tsx`. (Pre-existing lens-flare hex suffixes in `Game.tsx` left untouched — out of beta scope.)
- **B. Rain-on-lens could not be turned off.** The engine OR-ed the `isRain` default in again (`rainLensOn || isRain`), so Studio's explicit "off" was ignored on rain scenes; the Studio checkbox also wrote `undefined` (= "use default") when unchecked. Now: Studio writes explicit `false`, the engine gates on `rainOnLens` alone, and the checkbox reads/writes the *effective* state (default follows the scene's particle kind).
- **C. Transitions: mid-cover black flash + wrong cover class.** `goToScene` swapped the scene at a fixed 380 ms (mid-cover on a 1.2 s wipe → black flash) and the cover used the SOURCE scene's transition class. Rewritten in `Game.tsx`: the overlay plays the DESTINATION's transition while pending (`sceneTransitionClass` + `pendingScene`), and the plate flips at full cover (duration = `transitionSpeed`). `cut` swaps instantly with no cover. Total travel = 2× authored speed (per the formulas above).
- **D. Iris reveal was a static hold.** `.scene-iris[data-transitioning="0"]` sat on a static `scale(1.15)` circle; now plays `iris-out` (the white ring opens).
- **E. Storm bolt was a 3 px sliver.** `.storm-bolt` is now a 130 px screen-span with a 2-point clip-path (fork path from `StormStrike.forkPath`).
- **F. HUD corner brackets never rendered.** The corner gradients sat on `.hud-frame` inside `@layer components`, where the `hud-corner-draw` animation could never target them. Moved to `.hud-frame::before` (unlayered — wins the cascade).
- **G. Dead NPC fidget class.** `npc-fidget-${fidgetAnim}` duplicated a preset already applied as `.anim-*` (later in the cascade, always won). Removed the dead class; `fidgetAnim` still drives the visible preset.
- **H. Rain wind snapped.** `RainCanvas` wind jumped to a random value every 2.5 s; now eases toward the new target (`dt * 0.8` lerp).
- **I. Studio preview didn't show Dynamic Visuals.** `CinematicPreview` only rendered the plate; it now renders the real `<Particles>` engine (+ atmosphere underlay) for the scene's kind — shafts, depth fog, shadows and rain-on-lens preview live in Studio. `Studio.tsx` passes `particles`/`ambientAudio` through.
- **J. Showcase story's stages were dead.** `jackMorrowMidnightReel`'s four stage scenes carried `stage: {…}` config but no `nodeType: "stage"`, so the engine silently rendered them as classic novel scenes (no walker, no markers, no walk-to-talk — beats played as ordinary dialogue). Added `nodeType: "stage"` to all four.

### Evidence
- `node scripts/beta/visuals-harness.mjs` → **68 passed, 0 failed**:
  - `glowColorWithAlpha` table (8 inputs) + CSS contract (iris-out reveal, 130 px storm bolt, HUD `::before` corners)
  - all 12 particle kinds mount the right layer through the REAL engine (canvas / smoke puffs / fog banks); storm bolt fires within 15 s at computed width 130 px with a forked clip-path
  - rain-on-lens: auto ON for rain, explicit `false` removes droplets, manual ON works on a non-rain kind
  - reduced motion: snow/storm/ember/rain → no canvas; fog → static wash; motes/dust → static dot grid; smoke → empty inert div
  - Studio CinematicControls: preview renders the real engine (canvas, `.cin-light`, shaft plane, droplets, fog banks) and honours `rainOnLens`; the checkbox reads the effective state per scene kind
  - transitions in the real player: a 1.2 s wipe holds the OLD plate until full cover (flip ≥ 1050 ms, not 380 ms), plays the destination's class mid-cover, reveals with the same wipe out; `cut` flips < 600 ms with the overlay at rest
  - Jack Morrow — Midnight Reel: mounts, skips credits, lands on the walking stage (walker + markers) with zero console errors
- `npm run bot -- --story jack-morrow-midnight-reel --runs 12` → **12/12 completed** · 6/6 scenes · 5/5 choices · 11/11 markers · 1/1 endings · no dead ends
- `npm test` → 81/81 · `npx tsc --noEmit` → clean · `npm run check` → passes · `npm run build` → `dist/index.html` 4,651.97 kB (gzip 1,286.53 kB)

## Merge Notes
- No deps, additive only, new file AmbientParticles.tsx no conflict, types optional, ready to merge → tag beta

## Pass 1 (post-beta) — subtle rain, honest transitions, the dice, and a new case

### 1. Rain-on-lens — pass 2: visible, not a smudge
The pass-1 droplets were still too opaque — they read as smudged glass. All alphas halved again in `RainLensOverlay` (`AmbientParticles.tsx`):
- beads: opacity 0.08–0.18 → **0.035–0.08**; head core 0.9/0.45/0.18 → **0.5/0.24/0.1**; glow 0.25 → 0.1
- drops: opacity 0.22–0.38 → **0.10–0.17**; tail 0.18/0.32/0.55 → **0.08/0.15/0.28**; head 0.95/0.75/0.42/0.22 → **0.5/0.36/0.2/0.1**; insets 0.5/0.18/0.18 → **0.22/0.1/0.1**; border 0.28 → 0.13; head blur 0.8 → 0.5px
- large drops: opacity 0.18–0.32 → **0.09–0.16**; tail/head/insets/border/blur all halved (border 0.32 → 0.15, blur 1 → 0.6px)
- overall haze 0.035 → 0.02

### 2. Transitions — the screen no longer goes full black
Question asked: "the transitions are black screen — should they be?" Answer: the black-family ones (fade, fade-black, iris, wipe, glitch, burn) are intentional identities and keep their black. The two that only *travelled* through a solid black plate now keep the picture up:
- **slide-left / slide-right** (`index.css`): the overlay is now a directional `linear-gradient` (solid leading edge, dissolving to transparent at the trailing edge) and the travel shrinks from ±100% to ±55% — a shadow sweep across the frame. The plate stays visible at the reveal edge for the whole move; the swap still happens behind the solid part. Mirrored for slide-right (`270deg` gradient).
- **zoom**: the overlay is now a radial **vignette** (`transparent 16% → rgba(0,0,0,0.55) 42% → 0.92 68% → #000 100%`) that tightens as it scales — the centre of the plate is visible dead-centre through the whole move, so a zoom reads as a lens, not a blackout.
- Reduced-motion (which disables all `scene-*` animations) is unaffected.

### 3. NEW FEATURE — the chance gamble (🎲 odds on a choice)
A choice can now be a **bet**: on pick, one seeded gameplay draw (`gameRandom() * 100 < chance`) decides the route. A **hit** takes the normal `targetSceneId` + `consequences`; a **miss** takes the authored `failTargetSceneId` + `failConsequences`. Either way the engine sets the flag `chance:<scene>:<choice>:hit|miss` so later beats/gates can branch on *how* the dice landed. The roll is part of the seeded stream, so `?seed=` replays the exact dice, and save/load/rewind snapshots resume them.

- `src/types.ts` — `Choice.chance?: number (0–100)`, `Choice.failTargetSceneId?`, `Choice.failConsequences?`
- `src/game/decisions.ts` — `rollGamble()` + `gambleFlag()` (the SINGLE roll rule); `applyDecision` rolls it, so **the playthrough bot exercises the fail routes exactly as a player would** (previously the bot only ever followed the happy target — the miss paths were invisible to it)
- `src/game/Game.tsx` — `pickChoice` uses the shared roll; 🎲 odds chip on the choice button; 🎲 hit/fail toasts; miss routes through `leaveFor` (falls back to the normal target when unwired)
- `src/sceneRoutes.ts` — the miss route is a first-class graph edge (`…(missed roll)`), so the Studio canvas, dangling-link check and reachability all see it
- `src/logic.ts` — validator: odds outside 0–100 are an **error**; 0%/100% and reply-gambles warn; `collectFlags` + `grantableFlags` now see `failConsequences` (no more phantom "flag note doesn't match" warnings)
- `src/studio/Studio.tsx` — the choice editor gains a 🎲 **Chance gamble** block: odds input (0–100), miss-route scene select, miss flag picker, miss Heat delta
- `scripts/engine-tests.entry.ts` — 27 new checks: roll-rule table (100/0/gamble-less), seeded 40% split + exact replay, a run of four gambles replays the same fate, the simulation path routes 0% to the fail scene with fail consequences + flag, 50% splits across 200 seeded sims, odds 150% is a validator error, and the wiring scans proving Game.tsx has no private roll copy
- `scripts/beta/visuals-probe.ts` — PART 6 mounts the real `<GamePlayer>`: the 🎲 chip renders, 100% always lands, 0% always fails, a seeded 60% coin replays the same dice across fresh mounts

### 4. NEW STORY — Jack Morrow: The Second Reel (`jack-morrow-second-reel`)
A full noir case that showcases the pass and puts **the assistant in the story as a character**: **AG-3NT — "the voice in the static"**, a pattern that arrives on the office shortwave and talks Jack through the case (it has lines in every act, including the final bluff and both endings). 13 scenes: office → rain-slick street → fog docks → captain's office → city archive → rooftop confrontation, with **four gambles** (60% press Vera · 40% slip the manifest · 50% sneak the guard · 35% call the bluff on the roof), two miss-route scenes each, **three endings** (Gold — the signal signed off; Silver — the reel kept; Busted — a full-miss run hits Heat 5 and the city closes in), depth fog, shadow casting, rain-on-lens and DOF on talk throughout.
- 10 pass-1 assets (the full budget): 7 backgrounds (`sr-credits/office/street/docks/archive/rooftop/sneak.jpg`) + 3 portraits (`ch-jack/ch-vera/ch-agent.png`). The precinct scenes reuse `bg-bb-office-frost.jpg` to stay inside the budget.
- `src/data/stories.ts` — registered in the catalogue (second slot, next to the Midnight Reel)

### Evidence
- `node scripts/beta/visuals-harness.mjs` → **82 passed, 0 failed** (was 68; +14: PART 6 gamble probe, PART 7 Second Reel smoke incl. rain-lens droplets on the office stage)
- `node scripts/playthrough-bot.mjs --story jack-morrow-second-reel --runs 400` → **400/400 completed** · **13/13 scenes · 14/14 choices · 3/3 endings · 14/14 markers** · no crashes, no dead ends · endings: 283× Silver, 60× Busted, 57× Gold (the 35% bluff landing at its authored rate)
- The dice audit that caught the real bug: the first 1000 bot runs showed **100% of gambles hitting** — the roll lived only in `Game.tsx`'s `pickChoice`, but the bot drives `decisions.ts`, so the simulation never rolled. Moving the roll into the shared decision surface (`rollGamble`) fixed it; post-fix, miss scenes, the Heat bust and the Busted ending are all covered.
- `npm test` → **81/81** (engine tests 1791, +24 for the gamble) · `npx tsc --noEmit` → clean · `npm run check` → passes · `npm run build` → `dist/index.html` 4,682.67 kB (gzip 1,294.45 kB)

## Pass 2 (post-beta) — transitions carry the next scene's art

### 1. Slide / zoom overlays now show the destination scene's background
Question asked: "shouldn't transitions include next scene bg image." Answer: they should — a slide or zoom used to sweep a black shape (gradient shadow / vignette) across the frame, so the next scene only appeared *after* the move. Now the slide-left / slide-right / zoom overlay contains the **destination scene's background art**, frozen at its t=0 cinematic frame, and the whole move is visible over it:

- `src/game/Game.tsx` — `cinematicLayer()` gains a `still` option: no camera motion, but **frozen at the plate's t=0 keyframe frame** (pan starts zoomed in, dolly starts offset, dolly-zoom starts at its start scale — a bare identity transform would not line up), same grade/dim/vars, dolly keeps its `auto 122%` sizing. The scene-transition overlay render (slide-left / slide-right / zoom only) mounts the destination art inside the overlay: `cinematicLayer(dest.cinematic, dest.background, { still: true })` + `LightGlow` + `LensFlareLayer` + `CinematicOverlays` — the exact layer stack the plate uses, so the art is pixel-identical to the plate at the swap instant. `pendingScene` now carries the target `sceneId`.
- `src/index.css` — the slide/zoom covers ramp to **full opacity mid-move** (45–50%) so the new scene reads as a push, not a crossfade; the reveal is a plain `scene-art-reveal` fade (re-sliding the art would double-expose the identical frame). The old `slide-*-out` / `zoom-out` keyframes are gone. The gradient/vignette backgrounds stay as the fallback layer behind the art (and the cover's shadow lead-in).
- **Unchanged by design:** fade / fade-black / iris / glitch / burn keep their black identities; wipe already reveals the new plate directly; `cut` stays a hard cut; reduced motion stays a pure cut (no overlay at all); **video** backgrounds can't be frozen to a frame, so their slide/zoom falls back to the old black shape.

### Evidence
- `node scripts/beta/visuals-harness.mjs` → **100 passed, 0 failed** (was 82; +18 in PART 4: a charlie→delta **slide-left** leg and a delta→echo **zoom** leg on the live player — mid-cover the overlay plays the destination's class with **no `bg-black`**, carries the destination scene's background image in an art child with the cinematic treatment, the OLD plate is still mounted (no early flip); post-flip the reveal settles over the *same* destination image, no mid-reveal re-swap)
- `npm run bot` → Midnight Reel **200/200** (6/6 scenes, 5/5 choices, 11/11 markers); `--story jack-morrow-second-reel --runs 400` → **400/400** · 13/13 scenes · 14/14 choices · 3/3 endings (283× Silver, 60× Busted, 57× Gold) · 14/14 markers · no crashes, no dead ends
- `npm test` → **81/81** (engine tests 1791) · `npx tsc --noEmit` → clean · `npm run check` → passes · `npm run build` → `dist/index.html` 4,683.36 kB (gzip 1,294.79 kB)

## Pass 3 (post-beta) — the move makes a sound + overlay hygiene + the Third Reel

### 1. Transitions are no longer silent — synthesized, zero asset budget
The engine had a WebAudio module (clicks, ambience, thunder) but a slide/zoom/wipe landed with no sound at all. `src/audio.ts` gains a **transition sound bed**: a band-passed noise **whoosh** that swells across the cover (directional — it pans the way the card travels and settles to centre at the landing) and a **sub-hit impact scheduled on the AudioContext clock for the swap instant**, so the thud lands on the frame, not near it. Every recipe is synthesized from the existing noise buffer — no files, no asset budget; everything rides the **sfx bus**, so the mixer's Effects fader and the sound toggle already control it.

- `src/audio.ts` — `noiseSweep()` (filter glide + late gain swell + optional pan), `subHit()`, and `transitionSfx(kind, coverSec, dir)` with seven recipes: **whoosh** (slide: wide air + cushioned land), **swish** (wipe/iris: tight card pass + edge tick), **riser** (zoom: air AND pitch climb, hard sub-drop at the swap), **thump** (fade-black: weight, no air), **zap** (glitch: steps(1) square-burst stutter, deliberately unclean landing), **sizzle** (burn: crackle over a warm low swell), **swell** (fade: barely-there air). Pure helpers `resolveTransitionSound()` (the AUTO table — an unknown transition or `cut` resolves to `none`) and `transitionTravelDir()` are exported for testing without a browser.
- `src/types.ts` — `SceneNode.transitionSound?: "auto" | "whoosh" | "swish" | "riser" | "thump" | "sizzle" | "zap" | "swell" | "none"` (undefined = auto; the author pick overrides the table in either direction).
- `src/game/Game.tsx` — `goToScene` fires the bed for the **destination's** settings (same shared table as the overlay class), gated on the sound toggle; the reduced-motion and cut paths return before it — a cut is a cut, and if a player prefers no motion they get no whoosh.
- **Studio option** — `src/studio/Studio.tsx`: the 🎞 Letterbox & transition block gains a **🔊 Transition sound** picker (Auto + the seven recipes + None), each labelled with what it does; "Auto" writes back an absent field so the JSON stays minimal. Scene-split copies carry the pick along.

### 2. Micro-hygiene — the overlay's art stack no longer outlives the move
Pass 2 left the destination-art stack (image + `LightGlow` + `LensFlareLayer` + `CinematicOverlays`) mounted inside the transition overlay for as long as the CURRENT scene's entry transition was slide/zoom — faded to opacity 0 behind the plate, invisible, but still a composited art stack with pulsing lights for the whole visit.

- `src/game/Game.tsx` — the art now lives exactly as long as a move plays: forced on through the cover (`fading`) and re-armed for each arrival (entry or swap) with a reveal window of `transitionSpeed + 160ms`, after which it dismounts. At rest the overlay is one empty invisible div again — the Pass-1 shape — with the reveal animation's `both` fill still holding it at 0.
- Probe coverage for the gap: `scripts/beta/visuals-probe.ts` PART 4b asserts (a) the art child is **gone** once the reveal settles, and (b) under **reduced motion** the art path NEVER mounts — a slide scene cuts instantly (<400ms with a 1.0s authored speed), the resting overlay carries the `scene-cut` class, and there is no art div at all.

### 3. NEW STORY — Jack Morrow: The Third Reel (`jack-morrow-third-reel`)
The third showcase, and the full-kit one: **gambles + art transitions + stage** (plus the new sound bed, demoed as a studio option IN the content). Lot 13 — the missing reel's negative — goes to auction at the Rialto with a one-dollar reserve, which is not a price, it's a tripwire. 10 scenes: alley → lobby → booth → roof, with **three walkable stages** (patrol NPCs, obstacles, proximity markers, an item in the trash can, a roof-hatch shortcut), **three gambles** (55% win the bid · 45% cut the print at the splice bench · 35% call the auction's bluff) plus a priced walk past the desk (+1 Heat, so the full-miss run busts AT the roof — the fifth point lands on a non-ending scene, which is where the bust engine can actually catch it), two miss-route scenes, a Heat-5 full-miss bust, and **three endings** (Gold — the block closes on a blank; Silver — you walk with the story; Busted — the house files you away with its receipts).
- The transitions are a walking demo of the kit: `slide-left` into the alley and `slide-right` out of the roof (art-carrying, auto whoosh), `zoom` into the lobby (auto riser + sub-hit), `glitch` when the floor turns (auto zap) — and two authored picks: a **fade given a deliberate THUMP** on the booth, and the catch in **total silence** (`transitionSound: "none"` over a fade-black): the one move in the reel the room doesn't hear.
- Zero new assets: reuses the pass-1 `sr-*` plates (the alley borrows the rain street, the booth the archive, the lobby the office) + the three noir portraits.
- `src/data/stories.ts` — registered third, next to the other two reels.

### Evidence
- `node scripts/beta/visuals-harness.mjs` → **119 passed, 0 failed** (was 100; +9: PART 4b lifecycle + reduced-motion art path, PART 8 Third Reel smoke — slide entry carrying the real destination art, stage markers, the two authored sound picks)
- `scripts/engine-tests.entry.ts` — 22 new checks: the full AUTO mapping table (slides/wipes/iris/zoom/glitch/burn/fade family), explicit overrides both ways, `cut`/unknown → silence, travel-direction, the goToScene + Studio wiring scans, the art-lifecycle source contract, and the Third Reel (ships, 0 validator errors, 3 gambles with real fail routes, art transitions in play, authored sound picks present, full-miss run busts at Heat 5) → engine tests **1813**
- `npm run bot` → Midnight 200/200 · Second Reel 400/400 · **Third Reel 300/300** — all scenes, choices, endings and markers covered, no dead ends, no crashes
