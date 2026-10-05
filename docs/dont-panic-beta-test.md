# DON'T PANIC! — beta notes (gold path green, 127/127)

Run: `node scripts/beta/dont-panic-harness.mjs` (probe: `scripts/beta/dont-panic-probe.ts`).
Covers validation, the full gold path (bedroom → street → pub → vogon hold →
poetry QTE → Heart of Gold → Magrathea finale), all five endings, a map
round-trip, and console/error-boundary silence.

## Important findings (engine + authoring)

**Walk-up goals vs obstacle inflation — the silent killer.** A walk-up aims
at `0.72 × reach` short of the marker's floor point. If that goal lands
inside an obstacle's agent-radius inflation (1.6 units), the router snaps
the destination to the nearest free cell — which can sit *outside* the
reach circle. The walker then arrives cleanly (no stuck, no fire) and an
aimed verb dies silently. That was the pub thumb: goal 1.4 from the bar.
Rule of thumb: keep walk spots clear of obstacles by `0.72 × reach + 1.6`
on every likely approach side, not just the spot itself. Reach value is
otherwise nearly irrelevant — once the goal is reachable, circle entry
mid-walk is structurally guaranteed (steps are ~0.33/frame, the goal is
inside the circle, and the fire loop runs every moved frame). Future
validator check: flag walk-up goals that fall inside inflated obstacles.

**Stale `scriptRequest` replays are fixed (adopt on mount).** Game holds
the last script request across scenes; Stage used to play whatever it
found on mount — replaying the previous room's cutscene *with its input
lock*. `scriptKeyRef` now starts `null` and adopts the mount-time key;
only requests that arrive after mount play (`src/game/Stage.tsx`).

**Choices render behind narration — flush beats before touching hotspots.**
Guarded hotspot clicks (giveItem) during entry narration/beats are
swallowed. Beta pattern that works: advance on a *stable positive* signal
(last-beat text, the examine gate), never on the absence of a transient
button ("continue to dialogue" gaps between beats cause false settles).
Re-query every element after advancing (React churn detaches refs), and
dismiss captions with *verified* loops (typing needs complete + dismiss),
because open captions unmount choices.

**Beta-DOM gotchas, all bitten at least once:** locked choices render
*disabled*, not absent — assert `.disabled`, not absence. Native Space
activates a focused button even though the game handler "never picks a
choice" — unbounded spaces in choice mode can fire things (that's how the
babel fish once granted itself). One-shot markers stay consumed across
remounts (the ridden Drive vanishes on map-travel back — by design; detect
remounts via a repeatable marker instead). Reply-choice consequences *do*
apply (verified in `Game.tsx`, and the gated poetry beat firing proves the
reveal flag landed).

**Authoring order dependencies in this case:** the thumb is gated on
`dp_ford_reveal` (set by the "Starting with Guildford" reply); Zaphod
patrols *behind* the bridge energy field, so he can only be talked to
after the Drive wakes — any playthrough/test must order Drive-wake before
the Zaphod hub. The fish is optional for gold (it only gates "Beg for
mercy" + the notice fiction). Dead beat: Ford's "Fish in" line (`dpb_v4`,
gated on `dp_babel_got`) can never play on the gold path — the hold's
beats run before the dispenser is touchable. Move it or accept it.

## Character animation / spritesheets in this case

Full engine reference: `docs/sprite-sheets.md`. Case specifics:

**What the cast has today.** All walkers are side-on, right-facing, base
clips only — `idle` (2f @3fps) + `walk` (4f @8fps) on a 512-wide grid —
and the engine mirrors right→left (`flip`) for westward headings. Talking
busts are `rest`/`talk` pairs on a 384-tall grid. Arthur carries a `lie`
pose (frames 6–9, played via the pose system for the bulldozer cutscene).
Props (Nutrimatic, Drive, jukebox) run `loop` cycles. See the sheet table
at the top of `src/data/dontPanic.ts` — it documents its own plate
history (magenta keying, the 2×2 reorders, Zaphod's skipped frame 3).

**How headings resolve** (`src/game/stageFacing.ts` → `SheetSprite`).
Moving or not, the engine tries `walk-{dir}` / `idle-{dir}` first, then the
mirrored opposite bank, then the vertical part of a diagonal, then the
base `walk`/`idle`. Anything missing degrades silently: today every
up/down/diagonal heading plays the side-on base clip (mirrored or not).
`freezeOnFallback` holds frame 1 instead of animating when *rest* fell
back to a walk bank — no moonwalking. Single-frame anims never tick; the
sheet image cache + `preloadStageArt` warm-up mean first frames render on
mount with no pop-in.

**Queued: toward/away walks (art Pass 5).** That's `walk-up`/`walk-down`
(+ ideally `idle-up`/`idle-down`) banks for Arthur, possibly Ford — drawn
frame banks, never rotations. Note the opt-in rule: the *presence* of any
`walk-{diagonal}` clip switches a sheet to eight-way headings, so don't
author diagonal names unless the art is real. Ten images per pass (house
rule) — budget accordingly: two directions × N frames fills a pass fast.

**Sheet gotchas that cost real debugging hours:** frame indices past the
decoded grid clamp to the last real frame *silently* (sprite "stops
moving") — the Check tab's `spriteSheetIssues()` warnings are the only
tell, so keep them at zero. Sheet widths within 5% of a frame multiple
round up (downscale drift); genuinely short rows floor and phantom-row
frames render blank (the blink-every-cycle bug). Rebuilt sheets with fewer
frames than the animations reference are the classic trigger — re-check
frame lists after every rebuild. Prefer the headless pipeline
(`scripts/make-sprite-sheet.mjs`, `--frames N` + bridged-plate recovery)
over hand-slicing for rebuildability; the Studio Sheet slicer is the
preview/number-finder.
