# The Big Bad — production notes

An original Wolf Among Us–style case for the Scarlet Reel engine. Pass 1
(art) is done; the story data file does **not** exist yet and is deliberately
**not** registered in `src/data/stories.ts` until its assets are all on disk —
`npm run check` verifies every playable asset of every registered story, and
the bot walks all registered stories twelve times. Register it last.

## Concept

**Title:** The Big Bad
**Tagline:** Three landlords are dead. Everyone already knows who did it.
**Logline:** Detective Rufus Wolfe — once the wolf of the stories, now the
sheriff of the Ward — has to solve the murder of the one man whose building
could not be broken, in a district where every witness is a fairy tale hiding
from its own ending, and every one of them is sure the wolf did it.

The Ward is a decaying 1986 district of tenements and neon where exiled
story-folk live hidden among humans under a failing glamour. The engine's
noir-rail shape is the right one: this is a conversation game, not a shooter.

**The trick that makes it Telltale:** nobody in the Ward will talk to a wolf.
The case is solved by being *someone else* — a glamour bought from a toad,
borrowed faces, held favours — and every time Wolfe drops the disguise the
conversation resets to fear. That is the engine's gating and memory system
doing the work the theme needs.

## Tone & look

Painterly comic noir: heavy ink shadow, bold rim light, halftone grain, deep
blacks with cyan/magenta/amber neon. Rain on everything. The wolf is never
shown in full — only shadows, reflections and the eyes. All ten pass-1 plates
share this grade; keep it in later passes.

**Title & credits style: `neon-night`** (the failing-sign neo-noir cold open —
pink flicker, cyan labels, hard cuts between stills), which matches this case's
1986 neon grade. **Not `newsreel-forties`:** the wartime newsreel gate is
explicitly out for this case, so the story data must not select it (nor lean on
any forties-gate look). Set `creditsStyle`/title-card style when the story file
is written in the final pass.

## Cast (pass-1 portraits in `public/img/`)

| Id | Name | Portrait | Notes |
| --- | --- | --- | --- |
| `wolfe` | Det. Rufus Wolfe | `ch-bb-wolfe.jpg` | Player. Amber eyes, trench coat, wolf-shadow. |
| `adaline` | Adaline Frost | `ch-bb-adaline.jpg` | Deputy-mayor. Runs the books and the glamour ration. Trust meter. |
| `ruby` | Ruby Vale | `ch-bb-ruby.jpg` | Owns The Crimson Hood. Knows Wolfe's secret, says nothing. Trust meter. |
| `cobb` | Cobb Renny | `ch-bb-cobb.jpg` | Toad fixer. Sells glamour by the vial. Comic, venal, useful. |
| `hettie` | Mrs Hettie Bramble | `ch-bb-hettie.jpg` | Matriarch of the murdered landlords' family. Grief as a locked door. |
| `piper` | The Piper | `ch-bb-piper.jpg` | Debt collector. Collects people. The case's shadow antagonist. |
| (narrator) | Narrator (V.O.) | — | Reserved speaker; Wolfe's own tired voice-over. |

## Plates

| Scene | Plate | Status |
| --- | --- | --- |
| The Ward, rain | `bg-bb-street.jpg` | ✅ pass 1 |
| Otto's brick flat (crime scene) | `bg-bb-brickflat.jpg` | ✅ pass 1 (normalised to 1376×768 in pass 2) |
| The Crimson Hood | `bg-bb-crimsonhood.jpg` | ✅ pass 1 |
| Cover | `cover-big-bad.jpg` | ✅ pass 1 |
| Adaline's office (frost on the glass) | `bg-bb-office-frost.jpg` | ✅ pass 2 |
| Bramble tenement hallway | `bg-bb-hallway.jpg` | ✅ pass 2 |
| The Ward in daylight — the glamour's seam | `bg-bb-street-day.jpg` | ✅ pass 2 |
| Wolfe's office / case board | `bg-bb-wolfe-office.jpg` | ✅ pass 2 |
| The Crimson Hood back room | `bg-bb-backroom.jpg` | ✅ pass 2 |
| Cobb's pawnshop | `bg-bb-pawnshop.jpg` | ✅ pass 2 |
| Subway mouth | `bg-bb-subway.jpg` | ✅ pass 2 |
| Records / ledger room | `bg-bb-ledgerroom.jpg` | ✅ pass 2 |
| The flat revisited at dawn | `bg-bb-flat-dawn.jpg` | ✅ pass 2 |
| The Piper's platform | `bg-bb-pipertunnel.jpg` | ✅ pass 2 |
| ENDING gold — named in his own face | `bg-bb-end-gold.jpg` | ✅ pass 3 |
| ENDING silver — the buried ledger | `bg-bb-end-silver.jpg` | ✅ pass 3 |
| ENDING cold — he takes the fall | `bg-bb-end-cold.jpg` | ✅ pass 3 |
| ENDING fear — the glamour fails | `bg-bb-end-fear.jpg` | ✅ pass 3 |
| ENDING debt — the Piper collects | `bg-bb-end-debt.jpg` | ✅ pass 3 |
| Insert — the glamour vial | `insert-bb-vial.jpg` | ✅ pass 3 |
| Insert — the inward-torn hinge | `insert-bb-hinge.jpg` | ✅ pass 3 |
| Rooftop at first light | `bg-bb-roof-dawn.jpg` | ✅ pass 3 |
| The Ward from above (act cards) | `bg-bb-ward-aerial.jpg` | ✅ pass 3 |
| Insert — the ledger's Piper column | `insert-bb-ledger.jpg` | ✅ pass 4 (abstract ink marks only — no letters, no numbers) |
| Talk frame ×6 (second frame of each portrait's talk cycle) | `ch-bb-{wolfe,adaline,ruby,cobb,hettie,piper}-talk.jpg` | ✅ pass 4, generated as edits of their own portraits |
| The bodega with the dead sign | `bg-bb-bodega.jpg` | ✅ pass 6 (sign lettering killed by a same-composition edit) |
| The coin laundry (borrowed faces drying) | `bg-bb-laundry.jpg` | ✅ pass 6 |
| The glamour ration office | `bg-bb-ration.jpg` | ✅ pass 6 |
| Failing-sign title plate (cold open + act card) | `bg-bb-end-credits.jpg` | ✅ pass 6 |
| Solly Marsh, portrait + talk frame | `ch-bb-solly.jpg`, `ch-bb-solly-talk.jpg` | ✅ pass 6 (portrait edit killed mirrored neon text) |
| Insert — the ration sign-out book | `insert-bb-ration-book.jpg` | ✅ pass 6, abstract ink marks + one pale flourish column |

Every scene in all three acts now has a plate. Pass 2's eight ultrawide
generations (and pass 1's brick flat) were centre-cropped to the house
1376×768 — the engine cover-crops plates to the viewport anyway, so the crop
is what the player would have seen, and the catalogue stays one ratio.

## Structure (the whole case, for later passes)

Three acts, following the engine's `episodes`/acts shape:

- **ACT ONE — BRICK.** The flat: a door broken *inward* on the one building
  that was supposed to hold. Hettie Bramble will not speak to a wolf. Adaline
  gives Wolfe 24 hours and a rationed glamour vial. *Teaches: memory tags +
  recalls, the rememberLine card.*
- **ACT TWO — THE HOOD.** The Crimson Hood at closing time. Ruby sells Wolfe
  three names for three favours. Cobb's vial is fake; the real one is owed to
  the Piper. *Teaches: interruptible dialogue + conversation timers (a lie
  held too long collapses), press-the-lie against Cobb's alibi, trust swings.*
- **ACT THREE — PAPER.** The ledgers say Otto was paying the Piper to keep a
  door *shut*, and the glamour ration has been short since winter. The brick
  wasn't broken from outside — someone Otto trusted was let in. *Teaches:
  corkboard deductions tying the ration to the Piper to the flat.*

**Endings (five):**
1. `gold` — Wolfe names the Piper with the ledger, in his own face, in front of
   the Ward. Costs the disguise; keeps the name.
2. `silver` — The Piper walks on a technicality; Adaline buries the ledger and
   the Ward is a little safer and a little more afraid.
3. `cold` — Wolfe takes the fall to keep the Ward's secret; the case closes on
   the only suspect everyone already believed.
4. `gameover-fear` — The glamour fails mid-question and the Ward turns on him.
5. `gameover-debt` — The Piper collects.

## Mechanics the case must exercise (all engine, all present)

- `memoryLog` + `recalls` + `{said}` — what Wolfe says in Act One is quoted
  back in Act Three.
- `rememberLine` — the Wolf Among Us card. Use it on the trust swings.
- `timeLimitSeconds` **conversation timers** (pass-11 engine work) on Ruby's
  three favours — silence is an answer she prices.
- `interruptibleDialogue` on the Cobb interrogation-adjacent scene.
- `press-the-lie` against Cobb's alibi, with `wrongEvidenceLimit`.
- Trust meters on `adaline` and `ruby`; heat as the Ward's suspicion of Wolfe.
- Corkboard deductions in Act Three (ration shortfall + Piper's ledger +
  the inward-broken door).
- A stage room: the Ward street, walkable, with the alley and the bodega.

## Pass plan

- **Pass 1 ✅** — ten images: cover, six portraits, three plates. All
  `1376×768` (the house size; four portraits were generated ultrawide and
  centre-cropped with ImageMagick to match).
- **Pass 2 ✅** — the remaining seven scene plates plus three Act Two/Three
  plates: Adaline's office, the tenement hallway, the daylight street with the
  glamour seam, Wolfe's case-board office, the bar back room, Cobb's pawnshop,
  the subway mouth, the ledger room, the flat at dawn and the Piper's platform.
  All scene plates for all three acts now exist.
- **Pass 3 ✅** — the five ending plates, two of the three deduction inserts
  (the vial, the inward-torn hinge), the rooftop at first light and the aerial
  Ward for act cards. Nine of ten: the ledger insert's generation came back
  empty twice on the "illegible handwriting" ask and the pass budget ran out,
  so it heads pass 4 as abstract ink marks only. Five ultrawide generations
  were centre-cropped to 1376×768 as before.
- **Pass 4 ✅** — `insert-bb-ledger.jpg` (re-asked as *abstract ink marks
  only*: "no letters, no numbers, no words anywhere" — the generator returns an
  empty response when asked for illegible handwriting), plus a second talk frame
  for each of the six principals. Seven of ten.
  - **Talk cycles are image pairs, not sheets.** Expression variants need a
    `SpriteSheet` (`talkingSheets`); a second portrait per character feeds
    `talkingFrames: [rest, talk]` + `talkingRest` + `avatarUrl` and
    `StageSprite` cycles them while the line is being spoken at
    `talkingFrameDuration` (0.12–0.22 s, characterised: Cobb snaps, Hettie
    drawls, the Piper barely moves). Each `-talk` frame was generated as an
    *edit* of its own portrait, so composition and palette are identical and the
    only difference is the mouth and brow.
  - **No walk/idle sheet, no street stage room.** A rectangular jpg
    `playerImage` over a plate reads as a box — the engine has no chroma key and
    the background remover is browser-only Studio tooling. The street is a
    standard scene with `look` hotspots instead, which is what a noir-rail case
    wants anyway.
- **Pass 5 ✅ — SHIPPED.** `src/data/bigBad.ts`, registered in `stories.ts`
  directly after `DONT_PANIC` (the catalogue's default story is untouched;
  promote it by swapping the two lines if the front page should open on it).
  15 scenes across 3 episodes, 25 choices, 5 endings, 4 items, 2 deduction
  connections, 1 press-the-lie, 1 interruptible scene, 3 conversation clocks.
- **Pass 6 ✅ — the neon-night cold open + more of the Ward.** Nine of ten
  generations (one held in reserve): three new scene plates (the bodega with
  the dead sign, the coin laundry where glamour is washed out, the glamour
  ration office), a new face (Solly Marsh, portrait + talk frame), the
  failing-sign title plate, and the ration sign-out book insert.
  - **Two of the nine were EDITS to kill legible text.** The first Solly
    portrait and the first bodega plate both came back with garbled mirrored
    neon lettering; each was re-sent as a same-composition edit replacing the
    letterforms with abstract unlit tubing. The house rule stands: plates and
    portraits carry no words.
  - **New content:** `bb_title` (a `nodeType: "credits"` cold open), `bb_bodega`
    (Solly + a conversation clock whose silence branch is the payoff),
    `bb_laundry` (the drying line of borrowed faces), `bb_ration` (the office
    whose hours Cobb's cheap clock kept — and the new end-of-Part-Two route
    chart). 19 scenes, 31 choices, a fifth item (Solly's rent receipt) and a
    third corkboard pin (receipt → Piper). Average playthrough length went from
    14 to 23 steps.
  - **The four inserts are finally WIRED, as gated insert shots:** a beat with
    `background: "/img/insert-bb-*.jpg"` gated on the flag that put the thing in
    his pocket — hinge in the flat, vial in the office, ledger in the records
    room, ration book in the office. An insert is a cutaway, so it is a beat,
    not a hotspot action.
  - **The cold open is `applyCreditsPreset("neon-night", {content})`.** A preset
    is a LOOK and writes only style knobs, so the directive ("not on newsreel")
    is now enforced in data: pink #ff2e88 flickering title, cyan labels, hard
    cuts over four Ward stills, and the wartime gate nowhere in the file.

## How the case is wired (the engine facts worth keeping)

- **Endings and the three tiers the engine allows.** `EndingData.tier` is only
  `victory-gold | victory-silver | gameover`, so: In His Own Face → gold; Behind
  the Glamour → silver; The Only Suspect (he takes the fall, still a *win* for
  the Ward) → silver with its own plate and headline; The Glamour Fails and What
  Is Owed → gameover. That gives the win/lose audit both a victory and a bust.
- **`partBreak` names the part that just ENDED** — it is the end-of-part route
  chart shown when the player *leaves* the scene (`demoStructure` documents it).
  So it sits on `bb_office` ("Part One — Brick"), `bb_subway` ("Part Two — The
  Hood") and `bb_face` ("Part Three — Paper"), not on the acts' first scenes.
- **Every clock has teeth.** The Piper's trade is a `quickTime` conversation
  clock with `targetSceneId: bb_end_debt` *and* `timedOutConsequences`
  (`held_off`, +1 Clever): take it in twelve seconds and the case ends in his
  favour, let it lapse and Wolfe keeps the ledger. This is the check that caught
  the first draft — a 12 s timer with no silence branch is dead weight, and the
  craft audit refused to ship it.
- **Flags that are never gated get a `flagNotes` entry** (the bodega sign, the
  placed shoe, the lying clocks, the two hands compared, the vial refused) so
  the case file reads as a case file and the flag audit stays silent. `giveItem`
  hotspots set no flag at all: the item *is* the state.
- **Memories have an audience by construction:** episodes 2 and 3 set
  `recapFromMemories: true`, and Hettie, Adaline and Ruby each quote Wolfe's own
  words back through `recalls` + `{said}` — the hallway truth, the Hood promise,
  the ration question.
- **Credits/title look:** `neon-night`, never `newsreel-forties`. Presets are
  Studio authoring state (`CREDITS_PRESETS` is consumed by `src/studio`), so
  they reach a story as concrete `CreditsSettings` on a `credits` node — this
  case has no credits node yet. If one is added, style it from the neon-night
  preset; the wartime newsreel gate is out for this district.

## Validation at ship (all green, story included)

| gate | result |
| --- | --- |
| `tsc --noEmit` | clean |
| `eslint src/data/bigBad.ts src/data/stories.ts` | clean |
| `npm run test:engine` | **1762 / 0** (53 stories through the craft audit) |
| `npm run test:validator` | **32 / 0** |
| `npm run test:dom` | passed, no console errors |
| `npm test` | **81 / 0** |
| `npm run check` | **1175** playable assets present, 0 missing for live stories |
| `npm run bot -- --story big-bad --runs 1000` | **1000/1000** runs, no crashes, no dead ends; scenes 19/19, choices 31/31, endings 5/5, avg 23 steps |

The bot's ending spread over 1000 greedy runs — 702× The Only Suspect, 119× What
Is Owed, 101× Behind the Glamour, 58× In His Own Face, 20× The Glamour Fails —
is the shape of the design rather than a defect: taking the fall is ungated (the
self-sacrifice is always available), while the gold ending has to be *built*
(hinge + ledger in hand, board pinned, the Piper named), the glamour ending
needs a vial taken under a ten-second clock, and the fear ending only happens
when the eight-second hold lapses at 15% deliberate QTE failure. A player who
works the case gets the gold plate; a player who drifts gets the wolf in cuffs.

## House rules to keep

- Images `1376×768`, `public/img/`, prefixes `cover-` / `ch-` / `bg-`.
- No bodies, no gore on plates — the crime scene is told by the broken door,
  the open safe and the scuffed floor.
- Every timed choice needs a real silence payoff (`timedOutConsequences`), or
  the validator's conversation-timer check will (correctly) refuse it.
- Every `rememberLine` needs a payload (`memoryLog` or consequences) — the
  craft audit enforces the promise.
