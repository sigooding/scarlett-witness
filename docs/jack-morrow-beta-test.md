# Jack Morrow — Part One: an honest test of the engine and the Studio

**Date:** 2026-10-19 · **Branch:** `arena/06bba22a-scarlett-witness`
**Story:** `jack-morrow-witness` — *Jack Morrow*, Episode One: **"Just Listen"**
**Built:** `src/data/jackMorrowWitness.ts` (24 scenes, 7 speaking regulars, 3 endings)
**Plan for the season:** [jack-morrow-season-plan.md](jack-morrow-season-plan.md)

This pass built Part One of a three-part, Telltale-style detective game **and**
wrote down everything that went wrong. Nothing here was fixed: no engine code
and no Studio code was touched. Every finding below is reproducible from the
Studio or the newsstand as the repo stands.

---

## 1. What was built

| | |
| --- | --- |
| Scenes | 24 (20 playable + 3 endings + the recap ledger) |
| Characters | 7 with talking sprite sheets (Jack, Vera, Mara, Ishida, Okada, Kaneko, Sakai) + 3 emoji minor parts |
| Endings | 3 — *THE PROMISE* (gold), *FLOUR SACKS* (silver), *THE CURTAIN* (gameover) |
| Trust | 5 characters moved, clamped −5…+5; gates on Mara's and Kaneko's trust |
| Flags | 70 plain-fact flags, all with a 🏷 flag note |
| Timed conversations | 11 (`timeLimitSeconds` **without** `quickTime`) |
| Quick-time prompts | 3 — the run through the rain, the Hive service door, the hand at the curtain |
| Big trust decisions | 6, three of which move two characters in opposite directions |
| Investigation | 3 hotspot rooms — Jack's office box, the Kanda backstreet, Mara's apartment |
| Order matters | Bar-first or Hive-first; the place left for later is a **different scene** when you arrive |
| Media | The film's own plates, sfx, room tones and **40+ voice takes**, all by path |

**Rule compliance:** no meters, no attitude tags, no Interrogation mode, no
inventory or items anywhere, no walkable stage. `inventoryDisplay.mode` is set
to `hidden` from the Studio (🎮 In-game theme tab).

---

## 2. Bugs found

### ENGINE

**E1 — "Next time on…" never renders. `major`**

*Expected:* the three `nextTimeLines` on `jmw_ep1` to appear after the ending
card, as the episode-to-episode hook.
*Happened:* no teaser, at any ending, however long you wait on the card.
*Repro:* play to any ending (`?story=jack-morrow-witness&scene=jmw_ledger&flags=jmw_out_promise`
is the fast route). The card shows `★★ GOLD CASE ★★ / THE PROMISE /
CHAPTER COMPLETE · JACK MORROW / <recap> / A GASLIGHT REELWORKS PRODUCTION /
↻ NEW GAME+ / BACK TO THE NEWSSTAND` — and nothing else.
*Severity:* major for a season: the carry-over tease is how a Telltale episode
hands you to the next one, and this season is three parts.
*Workaround:* none. The lines are authored and simply unused.
*Screenshot:* `/tmp/jmw-08-ending-jmw_out_promise.png`

**E2 — The investigation prompt is modal over the whole HUD. `major`**

*Expected:* the "🔍 Before you go — look around" panel to be a nudge I can
ignore while I use the menu or pick a choice.
*Happened:* while it is up, the ☰ MENU chip and the choice rail **look
enabled but do not respond to mouse clicks**. Keyboard shortcuts still work —
pressing `T` opens the travel map straight through it.
*Repro:* `?story=jack-morrow-witness&scene=jmw_apartment`, read to the choices,
then try to open ☰ MENU with the mouse. Nothing. Press `T`: the map opens.
*Severity:* major — a player who wants to save mid-scene appears to have a
broken menu.
*Workaround:* the prompt has its own dismiss button
(`aria-label="Dismiss the search prompt"`); the tests use it.
*Screenshot:* `/tmp/jmw-menu-failed.png`

**E3 — Escape over that prompt offers to quit the case. `minor`**

*Expected:* Escape to dismiss the prompt (it is the obvious dismiss key, and
ESC · QUIT is listed *inside* the menu, not as a global).
*Happened:* Escape opens **"Leave the case?"** — a modal over a modal, which
then blocks the choice rail until it is answered.
*Repro:* as E2, then press Escape.
*Workaround:* click "Dismiss the search prompt" instead. Never press Escape
while an investigation prompt is up.

**E4 — Flags without a note appear as raw ids in the player's journal. `minor`**

*Expected:* the ▤ Case Progress "Story so far" list to read as sentences.
*Happened:* any flag with no `flagNotes` entry is printed as its id with the
underscores turned into spaces: `jmw okada polite`, `jmw okada silent`,
`jmw pledge made`.
*Repro:* play to the ending, open ▤ CASE PROGRESS, read "Story so far".
*Severity:* minor, but it reads as broken text to a player.
*Workaround:* write a note for **every** flag, including plumbing flags that
exist only to gate a scene exit. All 70 flags in this case now have one.

**E5 — There is no gateable end-of-episode recap. `major`**

*Expected:* the Telltale "here's what you did" list, gated per decision.
*Happened:* `endingData.recap` is a single static string per ending, and
`Episode.recapLines` is *"Previously on…"* — it plays **before** an episode's
title card, so it cannot recap the episode that just ended.
*Workaround:* I authored a whole scene (`jmw_ledger`, "What You Did") whose
dialogue beats are narrator lines gated on flags and trust, placed immediately
before the three endings. It works, and it is the right shape — but it is a
hand-built scene, not a feature, and every episode will need one.
*Screenshot:* `/tmp/jmw-09-recap.png`

**E6 — No `maxTrust`, so trust-gated variants cannot be made exclusive. `minor`**

*Expected:* to gate one beat on "Vera trusts you" and another on "Vera does
not", the way I can with `minMeters` / `maxMeters`.
*Happened:* `Gating` has `minTrust` but no `maxTrust`, so `minTrust: {vera: 1}`
and `minTrust: {vera: 0}` both pass at +1 and both beats play.
*Workaround:* every trust gate in this case is expressed as a flag set by a
trust-gated *choice*, and the beats are gated on those flags.
*Studio tab:* Choices tab → 🔒 Gating rules (there is a min-trust row per
character and no max row).

### STUDIO

**S1 — The Check panel and `validateStory()` are different validators, and the
engine's is far weaker. `major`**

*Expected:* "run the engine's validator on the story with no errors" to be the
same gate the Studio shows.
*Happened:* `validateStory(JACK_MORROW_WITNESS)` returns **0 errors and 0
warnings**. The Studio's ✔ Check panel reported **16 notes** (⚠ advisory, no
⛔ blockers) on the same data. All 16 were real:

| Warning | Count | What it caught |
| --- | --- | --- |
| Repeatable choice changes state and can be farmed | 7 | one-way exits I had marked `isRepeatable` while also setting flags |
| Flag is set but never read | 5 | 2 genuinely dead replies, 3 the Studio could not see being read |
| Choices "…" and "…" are the same decision twice | 2 | two pairs of replies with identical effects |
| Every exit from "Prove It" / "What You Did" is gated | 2 | **by design** — both are meant to be gated |

*Repro:* Studio → Choose story to edit → `jack-morrow-witness` → ✔ Check. Read
`#studio-validation`.
*Severity:* major — an author who trusts the engine validator ships these.
*Workaround:* I fixed the content so the count is now 2, both deliberate.
*Note:* the panel's own legend ("red ERROR blocks Publish") contains the word
ERROR, so grepping the panel text for `/ERROR/` is a false positive; ⛔ is the
real error marker.

**S2 — Check does not count map gating as a flag reader. `minor`**

*Expected:* `jmw_leads_open`, which every travel-map pin requires, to count as
"read".
*Happened:* reported "set but never read — … so nothing the player does with it
changes a scene".
*Repro:* as S1; the note names `jmw_leads_open`.
*Workaround:* a flag note silences it, but the flag *is* read — by
`map.locations[].gating.requiresFlags`, which the check does not walk.

**S3 — The protagonist appears in his own relationship ledger. `polish`**

*Expected:* a ledger of the people Jack has crossed.
*Happened:* ☰ MENU → 🎭 RELATIONSHIPS lists **JACK / RESERVED / 0 / "Jack is
still reading you."** above the real cast.
*Repro:* ☰ MENU → 🎭 RELATIONSHIPS in any scene.
*Also:* characters injected by a `?trust=` branch link show **NOT YET MET**
next to a non-zero trust value (`VERA VOSS / NOT YET MET / +3`), because a
branch link does not mark anyone as met.

### ART PIPELINE

**A1 — Two of seven generated portraits keyed out to opaque grey. `minor`**

*Expected:* `make-sprite-sheet.mjs --key ff00ff` to key every portrait.
*Happened:* Mara's and Okada's plates generated with a **muted** magenta
(≈ `(200,61,177)` rather than `(255,0,255)`), so the fixed key missed it and the
slicer produced sheets with an opaque grey background.
*Repro:* `node scripts/make-sprite-sheet.mjs --in public/img/jack-morrow/plates/jm-mara-talk-plate.png --out /tmp/x.png --key ff00ff --frames 4 --height 768`
against the un-normalised plate.
*Workaround:* `--auto` (sample the backdrop from the corners) sliced them
correctly. I have since normalised every plate's backdrop to exactly
`#ff00ff` before slicing, so `--key ff00ff` works on all seven.
*Note:* `--auto` is the safer default for AI-generated plates generally.

**A2 — `--height 768` upscales, and the warning is easy to miss. `polish`**

Two portraits came back at ~710px tall, so the shared 768 grid upscaled them
(Kaneko and Sakai). The script does print `⚠ --height 768 UPSCALES the source`,
but it exits 0 and the sheet is written anyway. For photographic art the
softness is subtle; for crisp styles it would not be.

---

## 3. What worked well

- **Talking sprite sheets.** Seven four-frame plates, sliced with
  `scripts/make-sprite-sheet.mjs`, `rest: [0]` + `talk: [1,2,3,2]` at 8fps.
  Bottom-aligned on a shared 768px grid, so heads stay level across the cast
  and two-shots read as two-shots. Verified in the browser: the sprite is on
  stage as a CSS sheet (`background-size: 400% 100%`, `aspect-ratio: 503/768`)
  with no 404s.
- **Conversation timers.** `timeLimitSeconds` *without* `quickTime` really is
  the Wolf Among Us clock: the ring renders, expiry applies
  `timedOutConsequences`, and silence is an answer. Verified: letting
  "Call her back" lapse moves the prologue on with somewhere still to go.
- **Quick-time prompts.** Banner, countdown ring, heartbeat and shaky-cam all
  fire; a lapse routes to a distinct consequence branch, not a game over.
  Verified: missing the Hive service door still gets Jack inside — but noticed.
- **Rewind.** Across a trust decision (Kaneko's counter) it rolled the flag
  back, removed the payoff beat and re-offered the reply. Exactly right.
- **The travel map.** Flag-gated pins verified in three states: both leads
  open → *The Hive — after dark* once the bar is spent → *Okada's — last
  orders* once the Hive is spent. Gating and the "locked" hint both work.
- **Episodes.** Season screen, episode title card, per-episode save slots
  (`…save-jack-morrow-witness-ep-jmw_ep1-slot-0`), and a proper ending card
  with tier, headline, recap and New Game+.
- **Reusing the film's media by path.** Every background, sfx, room tone and
  voice take loads straight from `public/film/` — nothing copied, nothing
  edited. 40+ lines are the film's own takes used word-for-word (the office
  scene and the storeroom are almost entirely the original performances).
- **No meters, no inventory dock.** With no meters authored, none render; the
  empty-dock problem never materialises because `inventoryDisplay.mode =
  "hidden"` is available from the Studio.
- **The playthrough bot.** It caught a genuine dead end on the first run
  (`jmw_ledger`, when the storeroom could be left before the promise was
  answered). That is exactly the class of bug it exists for.

---

## 4. Wolf Among Us mechanics I could NOT build

1. **A gateable end-of-episode recap** (E5). Had to be authored as a scene.
2. **"Next time on…" teasers** (E1). Authored, never shown.
3. **A visible carry-over screen.** Trust and flags do carry (verified in the
   per-episode snapshot), but there is no season screen that shows the player
   what Part Two is inheriting.
4. **Mutually exclusive trust variants** (E6) — no `maxTrust`, so
   "warm"/"cold" versions of the same beat need authored flags.
5. **"X will remember that" for anything that is not a Choice.** `rememberLine`
   lives on `Choice` only, so trust moved by a hotspot or an `onEnterAction`
   gets no impact card.
6. **A per-character trust readout in the flow of play.** 🎭 RELATIONSHIPS
   exists and is good, but it is a menu the player must go and open; nothing on
   the HUD shows trust moving as it moves.
7. **Chapter select / replay a chapter** — the season screen offers episodes,
   but there is no "replay this chapter" for a completed one.
8. **Trust-gated *time*.** A hostile character cannot be given a shorter clock
   than a friendly one; `timeLimitSeconds` is a constant per choice.

---

## 5. What the 10-image budget left undone

**Used: 7 of 10.** Three portraits unspent.

| File | Shows | Matches its references? |
| --- | --- | --- |
| `plates/jm-jack-portrait.png` | Jack, waist-up, charcoal overcoat, steel lighter | Yes — `sheets/jack.jpg`, `jack-face.jpg` |
| `plates/jm-vera-portrait.png` | Vera, blonde, charcoal coat over cream turtleneck | Yes — `sheets/vera.jpg`, `vera-face.jpg` |
| `plates/jm-mara-portrait.png` | Mara, rain-wet, denim jacket, red bird clip | Yes — `s1_new/style-sheets/mara-voss.jpg`, `sheets/mara.jpg` |
| `plates/jm-ishida-portrait.png` | Ishida, grey suit, untired authority | Yes — `sheets/ishida.jpg`, `ishida-face.jpg` |
| `plates/jm-kaneko-portrait.png` | Kaneko, 70s, denim apron, bun | Yes — `sheets/kaneko.jpg` |
| `plates/jm-okada-portrait.png` | Okada, 60s, bar apron, sleepless | Yes — `sheets/okada.jpg` |
| `plates/jm-sakai-portrait.png` | Sakai, 70s, translucent raincoat | Yes — `sheets/sakai.jpg` |

All seven matched on the first generation; the three spares were not needed.

**Sheets built from them** (no extra image budget — assembled and keyed
locally): `sprites/jm-{jack,vera,mara,ishida,kaneko,okada,sakai}-talk.png`.

**Not made:**

- **Expression variants.** `talkingSheets` for Mara *crying* (the storeroom's
  last third) and Jack *angry* are the two this episode actually wants. They
  were explicitly deferred to a later pass.
- **Portraits for the three minor parts** — the Journalist, the Masked Man and
  the Barber are emoji stand-ins (🎭 📰 💈). They speak voiced lines, so they
  are the clearest "mouth moving with no face" cases in the episode.
- **Mara's hiding variant and Vera's wine-red dress** — both belong to Part 2.
- **No new backgrounds.** All 24 plates are the film's own, which is the point
  of the look; but it does mean the game has no picture the film does not.

---

## 6. Test commands and results

| Command | Result |
| --- | --- |
| `validateStory(JACK_MORROW_WITNESS)` | **0 errors, 0 warnings** |
| `npm run test:engine` | **1698 passed, 0 failed** (this suite walks every shipped story) |
| `npm run bot -- --story jack-morrow-witness --runs 400 --seed jmw-pass2` | **24/24 scenes, 3/3 endings, 0 dead ends, 0 crashes**; endings 195 Curtain / 188 Flour Sacks / 17 Promise |
| `npm run test:browser -- scripts/browser/jack-morrow.spec.ts` | **16 passed** (8.2 min) |
| `npx tsc --noEmit` | clean |
| `npm run test:studio-ship` | 174 passed, 0 failed |
| `npm run test:studio-beta` | 60 passed, 0 failed |
| `npm run test:validator` | 32 passed, 0 failed |
| `npm run test:screel`, `test:sledge-dom` | pass |
| `npm run test:sprites` | 9 passed, 3 failed — **pre-existing**, identical without these changes |
| `npm run test:dom` | fails — **pre-existing**, identical without these changes |

The 16 browser cases cover: the newsstand card, the film plate, the talking
sprite and its voice take, a timed choice lapsing, a QTE lapsing, the map in
its three gating states, Rewind across a trust decision, save → reload → load,
all three ending cards, the gated recap, the episode snapshot, phone width
(390×844, no horizontal overflow), Studio Check → export → import into a
**fresh browser context** → Check again, and one full start-to-finish run from
the newsstand to an ending.

---

## 7. Notes for Part Two

- Part Two opens on the morning after the promise. The three endings leave Mara
  at trust **+2** (promise), **0** (flour) or **−1** (bolt) — Part 2's first
  storeroom scene should read that number before it writes a line for her.
- `jmw_key_seen` is the hinge for film 63 (locker 114). It is only set by the
  gold promise, so a player who ends Part One on *FLOUR SACKS* or *THE
  CURTAIN* reaches Part Two knowing only that "something small and brass"
  exists. Part Two must have a route for that player.
- `jmw_told_vera_alive` / `jmw_told_vera_letter` are the detonators at film 72
  and 74. Both cost Mara a point at the time; the bill comes due in Part Two.
- Because E1 and E5 are still open, Part Two will need its own
  `jmw_ledger`-style recap scene, and the teaser for it will not render.
