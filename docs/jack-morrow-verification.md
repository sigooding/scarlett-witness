# Jack Morrow, Part One — independent verification

**Date:** 2026-10-19 · **Verified commit:** `34cce2d` (merge of PR #122)
**Base:** `539b31e` · **Feature commits:** `05b8704` (the case) and `3ee88f8` (Studio click fix)
**Story:** `jack-morrow-witness`, Episode One, *"Just Listen"*
**Findings log under test:** [jack-morrow-beta-test.md](jack-morrow-beta-test.md)

This pass re-tested the case and every claim in the findings log against the
merged tree. **Nothing was fixed** — not the engine, the Studio, the story or
the art. The only files this pass adds are this report and the screenshots in
`docs/jack-morrow-verification/`.

**Method.** Every player test ran in a **fresh Chromium profile with no saved
Studio drafts and no save slots** (opening a story in the Studio writes
`scarlet-studio-draft-<id>`, which the newsstand then prefers over the built-in
story — see §7.4). All three endings were reached by **playing from the
newsstand with no `?scene=`/`?flags=`/`?trust=` links**; branch links were used
only afterwards, for focused checks. Screenshots are referenced inline and
committed beside this file.

---

## 1. Verdict

**The case is real, plays to three different endings from the newsstand, and is
broadly Studio-authorable. The findings log is not a reliable audit of it.**

- **Play:** three complete runs from the newsstand, fresh profile, no branch
  links, reached **THE PROMISE**, **FLOUR SACKS** and **THE CURTAIN**
  (`ending-promise.png`, `ending-flour.png`, `ending-bolt.png`). The 16-case
  browser spec passes 16/16 in 8.2 min, including one 5.2-minute full run. The
  bot reaches 24/24 scenes, 92/93 choices, 3/3 endings over 400 runs.
- **Log accuracy:** the log numbers **11 findings, not 13**. Of those eleven,
  **5 are confirmed, 2 are partly confirmed, and 4 do not reproduce at
  `34cce2d`**. Two of the four (E2, S1) rest on premises the code contradicts;
  one (A1) no longer reproduces because the plates were normalised; one (E4)
  is fixed by the flag notes the log says were added.
- **The art accounting is wrong, and it hides a rule breach.** The log says
  "used 7 of 10" generated images and "sheets built from them [the portraits]".
  The tree contains **14 generated images** — seven portraits *and* seven
  four-up talking plates — plus seven derived sheets. The sheets are sliced
  from the **talking plates**, not the portraits. Fourteen images against a
  ten-image cap is **over budget by four**.
- **Two further rule breaches:** four of 87 voiced lines are **not**
  word-for-word the film take's line, and the jack/vera sheets are **downscaled**
  (0.67× and 0.69×) on a build that was told not to downscale art.
- **One authoring gap:** `onEnterActions` — used by seven scenes of this case —
  has **no Studio control**. It survives export/import, but a Studio author
  cannot create or edit it.

None of these stop the case from playing. The engine and the Studio are not
what is wrong here; the write-up is. Every confirmed item stands up as
described, and the two engine limitations the log names (E1, E5/E6) are real.

---

## 2. Claims table — every number and behaviour in the log

| # | Log claim | Measured at `34cce2d` | Verdict |
|---|---|---|---|
| 1 | 24 scenes (20 playable + 3 endings + the ledger) | 24 total = 20 playable + `jmw_ledger` + 3 ending scenes | ✅ |
| 2 | 7 characters with talking sprite sheets | 7 named `talkingSheet`s + 3 emoji-only minor parts = 10 characters | ✅ |
| 3 | 3 endings — gold / silver / game-over | `jmw_end_promise` (gold), `jmw_end_flour` (silver), `jmw_end_bolt` (gameover) | ✅ |
| 4 | Trust on 5 characters, clamped −5…+5 | 5 characters move: vera 16, mara 8, okada 6, ishida 5, kaneko 3 entries (incl. timeouts); clamp is in `applyConsequences` | ✅ |
| 5 | "Gates on Mara's and Kaneko's trust" | Six `minTrust` gates: mara ≥1 (promise), kaneko ≥1 ×3 (beats), **vera ≥1** (stakeout choice), **vera ≥2** (a beat) | ❌ incomplete |
| 6 | "70 plain-fact flags, all with a 🏷 note" | **77** flags used, **77** notes, 0 missing, 0 stray; 67 are read by a gate/beat, 10 are note-only | ❌ count |
| 7 | "11 timed conversations" | **14** timed choices (8/9/10 s) across 13 scenes **+ 3 QTEs** (5/6 s) = 17 timed prompts | ❌ count |
| 8 | 3 quick-time prompts | 3: rain run, Hive service door, her hand at the curtain | ✅ |
| 9 | "6 big trust decisions, three of which move two characters" | **3** choices move two characters; **2** deltas of +2; **28** choices move trust at all | ❌ count |
| 10 | 3 hotspot rooms, 11 hotspots | 3 rooms; 11 hotspots (box 3, backstreet 4, apartment 4) | ✅ |
| 11 | "40+ voice takes, all by path" | 87 voiced lines, 84 unique files, all under `/film/voice/`; **83** are word-for-word | ✅ (but see §5g) |
| 12 | No meters, no inventory/items, no walkable stage | `meters` null, `items` 0, `inventoryDisplay.mode = "hidden"`, 0 stage-node scenes, 0 attitude tags, 0 interrogations | ✅ |
| 13 | "No engine code and no Studio code was touched" | **False.** `src/studio/studioLeaves.tsx` +34/−1 and `scripts/browser/studio.spec.ts` +31 | ❌ |
| 14 | "Every finding is reproducible from the Studio or the newsstand" | 4 of 11 numbered findings do not reproduce; 2 more are only partly true | ❌ |
| 15 | Check panel's 16 notes were all real; "count is now 2" | At head both `validateStory` and the Studio report the **same 2** gated-exit advisories — they are the same function | ⚠️ count true, premise false (§3 S1) |
| 16 | Bot 400 runs: 24/24 scenes, 92/93 choices, 3/3 endings, 0 dead ends | Reproduced exactly: 24/24, 92/93, 3/3, 195 Curtain / 188 Flour / 17 Promise | ✅ |
| 17 | 16 browser tests in 8.2 min | 16/16, 8.2 min (full run 5.2 min; Studio round-trip 36.2 s; save/load 44.0 s) | ✅ |
| 18 | "Used 7 of 10" generated images | **14** generated plates: 7 portraits + 7 four-up talking plates; 7 derived sheets; 0 new backgrounds | ❌ |
| 19 | "Sheets built from them [the portraits]" | Sheets are cut from the **talk plates** (`--in …-talk-plate.png`); portraits are only `avatarUrl`s | ❌ |
| 20 | "No new backgrounds. All 24 plates are the film's own" | 23 unique backgrounds (24 scenes), all under `public/film/img/`, all 23 present; 0 new | ✅ (23 unique, not 24) |

Counts used above: 303 dialogue beats, 93 choices, 87 voiced lines, 67 choices
that set flags (101 set entries), 23 `rememberLine`s, 0 `clearFlags`, 0 items. The story has 3
`nextTimeLines` on `jmw_ep1`, 0 `recapLines`, and a static `endingData.recap`
string on each ending.

---

## 3. The logged bugs — 13 claims from 11 headings

The log's own count does not add up: it has **11 numbered headings**
(E1–E6, S1–S3, A1–A2). The brief asks about 13, and the log carries two extra
inline claims — S3's `?trust=` label and A2's "warning is easy to miss / exits 0" —
so the table below splits those two and tests **13 claims**.

### 3.1 Full runs to all three endings (evidence for E1 and the ending cards)

Three runs, each in a **new browser context** (empty localStorage), started by
clicking the **JACK MORROW** card on the newsstand → **PLAY EPISODE** →
**BEGIN EPISODE ONE**. No branch links, no saves, no Studio visits.
Each run took the same 19 scenes — `jmw_p_alley → p_shot → p_key → p_bar →
v_wait → station → okada → office → box → backstreet → apartment → bar →
hive_late → passage → counter → stakeout → letter → storeroom → ledger` — and
clicked 66 choices. At the storeroom the script chose the QTE catch, then:

| Ending | Run | Terminal scene | Card |
|---|---|---|---|
| **THE PROMISE** | 161 s | `jmw_end_promise` | `★★ GOLD CASE ★★` |
| **FLOUR SACKS** | ~160 s | `jmw_end_flour` | `★ SILVER CASE ★` |
| **THE CURTAIN** | ~160 s | `jmw_end_bolt` | `✖ GAME OVER ✖` |

After each card had been on screen for **12 seconds**, the body text contained
none of the three `nextTimeLines` ("A brass key…", "A sister who has not
stopped calling…", "Next time: …"). That is E1, reproduced at all three
endings, with the exact card content the log quotes (`ending-*.png`).

### 3.2 Status table

| # | ID | Finding (abridged) | Test | Result | Status |
|---|---|---|---|---|---|
| 1 | E1 | `nextTimeLines` never render | Sat 12 s on each of the three ending cards; searched for all three lines | No teaser, all three endings. Card ends at `A GASLIGHT REELWORKS PRODUCTION` | **Confirmed** |
| 2 | E2 | Investigation prompt is modal over the HUD; MENU and choice rail ignore the mouse | Apartment + box scene, 1280×720 and 390×844: read to the nudge, wait 3 s, `elementFromPoint` at the MENU centre, mouse-click MENU, mouse-click first choice | Nudge is a **234×72 px panel at (1023,107)**, below the MENU (1176,12). MENU opens; first choice (768×46 at y=504) takes. Same at 390 and in `jmw_box` | **Not reproduced** |
| 3 | E3 | Escape over the prompt offers to quit; "modal over a modal" | Same state, press Escape | `LEAVE THE CASE?` opens with SAVE & EXIT / HANG UP THE HAT / STAY ON IT — but the prompt is not modal, and this is the same quit confirm the menu documents | **Partly** — behaviour yes, premise no |
| 4 | E4 | Un-noted flags print as raw ids in "Story so far" | Opened Case Progress in `jmw_box` with `jmw_okada_polite`, `jmw_okada_silent`, `jmw_pledge_made`, `jmw_clue_clipping`; read "STORY SO FAR — FLAGS SET" | Renders four sentences; all 77 flags have notes; the three flags the log names have notes | **Not reproduced** |
| 5 | E5 | No gateable end-of-episode recap | Story data + engine: `jmw_ep1.recapLines` length 0, `recapFromMemories` false; `resolveRecap` is used on the "Previously on…" path; endings carry a static `recap` string; the gated ledger has 23/23 beats gated | Confirmed exactly; the workaround scene is real | **Confirmed** |
| 6 | E6 | No `maxTrust` | `Gating` type and whole `src/` tree | `minTrust` only; zero occurrences of `maxTrust` | **Confirmed** |
| 7 | S1 | Studio Check and `validateStory()` are different validators; engine's is far weaker | Read the Studio's import/call sites; ran the validator; opened Check in the live Studio on this story | `Studio.tsx:69` imports and `:3724` calls `validateStory`; both report **the same 2** advisories verbatim. The 16-note state is not recoverable — it was content, not a second validator | **Not reproduced** |
| 8 | S2 | Check does not count map gating as a flag reader | Removed `jmw_leads_open`'s flag note from a clone and ran `validateStory` | Warning appears: *"Flag `jmw_leads_open` is set but never read…"* although it is read by `map.locations[].gating`. The consumer walker never visits map pins | **Confirmed in code** (masked at head by the note) |
| 9 | S3a | The protagonist is in his own relationship ledger | Opened ☰ MENU → RELATIONSHIPS in `jmw_apartment` | JACK / RESERVED / 0 / "Jack is still reading you." is the first entry of 10 | **Confirmed** |
| 10 | S3b | A `?trust=` branch shows `NOT YET MET` beside a non-zero trust | `?trust=vera:1` and `?trust=vera:3` | Vera shows **WARMING +1** and **TRUSTS YOU +3**, not `NOT YET MET` | **Not reproduced** |
| 11 | A1 | Two of seven plates keyed out to opaque grey; `--key ff00ff` missed a muted magenta | Ran the shipped slicer on all 7 plates with `--key ff00ff`; checked output alpha and sha1 | All 7 exit 0; alpha means 0.65–0.74 (transparent backdrop); no grey. 5/7 byte-identical to the committed sheets | **Not reproducible at head** |
| 12 | A2a | `--height 768` upscales ~710 px portraits (Kaneko, Sakai) | Frame log from the slicer | kaneko `srcH 708` → scale **1.0847**; sakai `srcH 717` → **1.0711**; both warn. ishida 759 → 1.0119 slips under the 1.05 guard | **Confirmed** |
| 13 | A2b | The warning is easy to miss and the script exits 0 | Ran the commands; checked status | Both warnings print, both runs exit **0**, sheets are written | **Confirmed** |

**Tally, 11 numbered findings:** 5 confirmed (E1, E5, E6, S2, A2) ·
2 partly (E3, S3) · 4 not reproduced (E2, E4, S1, A1).
**Tally, 13 split claims:** 7 confirmed · 1 partly · 5 not reproduced.

Screenshots for these rows: E2 → `ui-investigation-nudge.png` and
`ui-phone-nudge.png`; E3 → `ui-escape-quit.png`; E4 → `ui-story-so-far.png`;
S3a → `ui-relationships.png`.

---

## 4. New findings

Written in the findings log's shape. None was fixed.

### N1 — The art budget is exceeded 14 to 10, and the log's accounting hides it. `major`

*Expected:* at most **10 generated images** for the pass; the log claims
"Used: 7 of 10. Three portraits unspent."
*Happened:* `34cce2d` commits **fourteen** generated plate images under
`public/img/jack-morrow/plates/` — seven single portraits (used as
`avatarUrl`s) **and** seven four-up talking plates (the actual source of the
sheets). The sheets are derived, but the plates are generations. Fourteen
images is four over the cap, and the log never counts the talk plates at all.
*Repro:* `git ls-tree -r --name-only 34cce2d -- public/img/jack-morrow` →
14 plates + 7 sheets. Each talk plate is a 4-up strip on magenta (the slicer
finds four frames); e.g. `jm-jack-talk-plate.png` is 3668×1280.
*Screenshot:* `art-portrait-vs-frame.png` (each portrait beside its plate frame:
same character, different render); `art-backgrounds-1.png` / `-2.png` show the
reused film plates.
*Owner area:* art / production accounting.

### N2 — Two sheets are downscaled from the delivered plates. `minor`

*Expected:* no image downscaled.
*Happened:* the shared 768 px sheet grid resamples jack at **0.6725×**
(1142 → 768) and vera at **0.6944×** (1106 → 768); mara is 0.9961 and okada
0.9796 (technically down, visually negligible). Three of seven are above 1.0
and two more are within 2% below.
*Repro:* `node scripts/make-sprite-sheet.mjs --in …/jm-jack-talk-plate.png
--out /tmp/x.png --key ff00ff --frames 4 --height 768` prints
`frameWidth: 484, frameHeight: 768`; divide 768 by the frame's `srcH`.
*Evidence:* the scale column in §8.2 and `art-portrait-vs-frame.png`.
*Owner area:* art pipeline / sheet scale policy.

### N3 — Four voiced lines are longer than the film take's line. `minor`

*Expected:* a voice take is used only where the game line is **word-for-word**
the take's line.
*Happened:* 83 of 87 are exact; four add text the take does not say:

| Beat | Game line | Film take's line |
|---|---|---|
| `jmw_pb_b4` | "Shitsurei shimasu." | "Shitsurei shimasu. (Excuse me.)" — take includes the gloss, game drops it |
| `jmw_ap_b_wall` | …"Those were the last things I said to her." | ends at "…the one who ran." |
| `jmw_co_b3` | …"Everything is going. We are just slower." | ends at "…with the American." |
| `jmw_sr_b16` | …"He wrote back one line. \"You have his face.\"" | ends at "…so it couldn't be buried again." |

*Repro:* `/tmp/audit2.mjs` over the bundled story + film data (87 voiced,
83 equal, 4 differ); the film's own text is `nobodysWitnessFilm.ts`.
*Screenshot:* none — the evidence is the text/audio pair; the four rows above
are the whole difference.
*Owner area:* story data.

### N4 — The jack and vera sheets are not reproducible from the committed plates. `polish`

*Expected:* every committed sheet can be rebuilt with the documented command.
*Happened:* five of seven rebuild **byte-identically** (sha1); jack and vera
differ from the committed files by RMSE 1732.74/65535 (**2.64%**) and
2474.89/65535 (**3.78%**). `--auto` produces exactly the same output as
`--key ff00ff`, so this is not a keying choice — consistent with the plates
being normalised after those two sheets were cut.
*Repro:* slicer runs into `/tmp/repro/`, `sha1sum` against
`public/img/jack-morrow/sprites/`, `compare -metric RMSE`.
*Screenshot:* `art-portrait-vs-frame.png` (the jack and vera pairs, whose sheets differ).
*Owner area:* art pipeline.

### N5 — `onEnterActions` has no Studio control. `minor`

*Expected:* a Studio author can author everything the shipped case uses.
*Happened:* seven scenes set flags on entry via `onEnterActions`
(`jmw_vera_card`, `jmw_took_case`, `jmw_leads_open` + `jmw_bar_first`,
`jmw_bar_done` ×2, `jmw_leads_open` + `jmw_hive_first`, `jmw_hive_done`).
`grep -rn onEnterActions src/studio` finds only a *reader* in `EpisodeEditor.tsx`;
there is no editor. Export/import preserves the field, but it cannot be created
or changed in the Studio.
*Repro:* open the story in the Studio; the scene inspector's sections are
Scene basics, Title & notes, Look/atmosphere/camera, Prose/pacing/structure and
Interrogation. No on-enter panel.
*Screenshot:* `studio-hand-built-scene.png` (the same inspector on a new scene).
*Owner area:* Studio inspector.

---

## 5. Rules a–h

The eight build rules, checked against the merged tree.

| Rule | Observed | Verdict |
|---|---|---|
| **a.** No meters | `story.meters` is null; no meter HUD is authored; 0 meter deltas | **Pass** |
| **b.** No attitude tags | 0 choices carry `attitude` (the Studio offers the control; this story never uses it) | **Pass** |
| **c.** No Interrogation mode | 0 scenes carry `interrogation` | **Pass** |
| **d.** No inventory or items | `items.length === 0`; `inventoryDisplay.mode === "hidden"`; 0 items granted or presented | **Pass** |
| **e.** No walkable stage | 0 scenes with `nodeType: "stage"`; 0 `stage` configs | **Pass** |
| **f.** Voice takes only where the game line is word-for-word | 83/87 exact; 4 lines longer than the take (N3) | **Fail (4)** |
| **g.** Art: ≤10 generated images, no downscaling, sheets via `scripts/make-sprite-sheet.mjs`, new art only under `public/img/jack-morrow/` | **14** generated plates (N1); jack 0.6725× and vera 0.6944× downscaled (N2); all 7 sheets built with the shipped script; all 21 art files under `public/img/jack-morrow/` | **Fail (budget + downscale)** |
| **h.** Nobody's Witness untouched | `git diff --name-only 539b31e 34cce2d` changes **no** file under `src/film/`, `public/film/`, `src/data/nobodysWitness*` or `tools/build-film-story.mjs` | **Pass** |

Rule **h** also disposes of the log's "no Studio code was touched" claim: the PR
*does* change Studio code (`studioLeaves.tsx`), but it does **not** touch the
film. The change is the Field click-capture fix and its browser regression test;
it is unrelated to Jack Morrow and does not affect the film.

---

## 6. What actually changed between `539b31e` and `34cce2d`

`git diff --stat 539b31e 34cce2d` → **28 files, +3732 / −2**.

| Group | Files |
|---|---|
| Story | `src/data/jackMorrowWitness.ts` (new, 2713 lines), `src/data/stories.ts` (+1 import, +1 catalogue entry) |
| Browser test | `scripts/browser/jack-morrow.spec.ts` (new, 477 lines) |
| Studio fix | `src/studio/studioLeaves.tsx` (+34/−1: `keepFieldClicksLocal`), `scripts/browser/studio.spec.ts` (+31) |
| Docs | `docs/jack-morrow-beta-test.md`, `docs/jack-morrow-season-plan.md` |
| Art | 14 plates + 7 sheets under `public/img/jack-morrow/` |
| **Not touched** | everything under `src/film/`, `public/film/`, `src/data/nobodysWitness*`, `tools/build-film-story.mjs` |

The Studio fix is real and narrow: a `<label>` wrapping the whole inspector
field was forwarding dead-space clicks to its first control, so placing a light
in a beat's camera editor focused the background-path box and scrolled the
inspector. The fix cancels only dead-space clicks; real controls, nested labels
and caption clicks keep their behaviour.

---

## 7. Studio recreatability

### 7.1 Export and import

- Studio → **Export** on `jack-morrow-witness` produced a **44,190,899-byte**
  `.reel.json` (the dialog reads `43155 KB`; `studio-export.png`).
- It embeds **129 assets** (38 images, 91 audio) and carries **136 `asset:`
  references**; every embedded blob is sha1-identical to the file it replaces,
  and there are **0 non-media differences** from the built-in story. The export
  is faithful and self-contained.
- Importing the reel into a **cleared** Studio context and running Check again
  returns the same **2** advisories; the spec's Studio case does this in a fresh
  browser context in 36.2 s (`studio-check.png`).

### 7.2 Field-to-control table

Every field this case actually uses, and where the Studio edits it. "Seen"
means exercised in the live Studio during this pass; "source" means the control
exists in the editor code but was not driven in this pass.

| Story field (as used) | Studio control | Evidence |
|---|---|---|
| `title` | top bar **Story title** | seen |
| `tagline`, `seasonTitle`, `coverImage` | Case File / Newsstand theme panels | source |
| `startSceneId` | Scene basics → **★ start scene** | seen |
| `characters[].name/role/avatarUrl` | Characters tab | seen |
| `characters[].talkingSheet` + `talkingX/Scale/Dim/Flip` | Characters tab → sheet picker + per-character sprite fields | source (`Studio.tsx:1727–1917`) |
| `episodes[]` (`title`, `number`, `kicker`, `tagline`, poster/title-card images, `sceneIds`, `startSceneId`, `nextTimeLines`) | Episodes tab (`EpisodeEditor.tsx`) | source (`:427`) |
| `flagNotes` | Flags tab → note per flag | source (`Studio.tsx:6337–6395`) |
| `map.locations[]` (`label`, `x/y`, `targetSceneId`, `gating`, `icon`, `lockedHint`) | Map tab | source |
| `inventoryDisplay.mode` | In-Game Theme tab | source (`Studio.tsx:6135`) |
| `briefing` | Case File tab | source (`Studio.tsx:7106`) |
| `dialogueBox` | Dialogue box tab | source (`Studio.tsx:6478`) |
| scene `title` | Scene basics → **Title?** | seen |
| scene `prose` | **Prose, pacing & structure** → prose | seen |
| scene `background` | Look, atmosphere & camera → image picker | seen (preview) |
| scene `ambientAudio` | Audio tab | source (`Studio.tsx:8126`) |
| scene `cinematic` (`mode`, `colorGrade`), `letterbox` | Look & camera → CinematicControls | source (`CinematicControls.tsx`) |
| scene `particles` / `particleConfig` | Look & camera → particles | source |
| scene `isEnding` + `endingData` (`tier`, `headline`, `recap`) | **🏁 this scene is an ending** → tier / pulp headline / recap | seen |
| scene `dialogueBeats` (`characterId`, `text`, `audioUrl`, `conditionRule`, `sfxUrl`) | Beats tab | source; beats visible on the canvas |
| scene `hotspots` (`label`, `bounds`, `cursor`, `isRepeatable`, `action`, `gating`) | Hotspots tab | source (`Studio.tsx:9877–10244`) |
| scene `choices` (`text`, `reply`, `hidden`, `targetSceneId`, `timeLimitSeconds`, `quickTime` + QTE fields, `memoryLog`, `rememberLine`, `exclusiveGroup`, `isRepeatable`, `gating`) | Choices tab | seen |
| `consequences.setFlags` / `timedOutConsequences` | Choices → **Sets flags** (and the timeout block) | seen (flags commit on Enter) |
| `consequences.trustChanges` | Choices → **Trust deltas — how this reply moves each person's trust (−5…+5)** | source (`Studio.tsx:12937–12955`) |
| choice `gating.minTrust` | 🔒 Gating rules → per-character min-trust row | source |
| beat `conditionRule` | Beats → gating rules | source |
| **`onEnterActions`** | **No control** | **gap — N5** |

### 7.3 A scene built by hand

Built from a blank Studio, without touching the repo:

1. **＋ New Story** → title "Verification Scratch".
2. **＋ Scene** → *The Scratch Room*: prose filled, ★ start scene.
3. **＋ Scene** → *Out*: prose filled, **🏁 this scene is an ending** (tier
   silver).
4. Back to *The Scratch Room* via **Jump to scene** → **Choices** →
   **＋ ADD CHOICE**: "Take the scratch key.", target *Out*, **Sets flags**
   `vs_took_key`.
5. **▶ Play**: the room rendered with its prose and the one choice; choosing it
   moved to *Out* and showed `★ SILVER CASE ★ / HEADLINE! / CHAPTER COMPLETE ·
   VERIFICATION SCRATCH`.

Screenshots: `studio-hand-built-scene.png` (the two cards, the choice, and the
Continuity panel already flagging the unread `vs_took_key`), and
`studio-hand-built-ending.png` (the played ending). This is enough to show the
prose → choice → consequence → ending loop is authorable by hand. It does **not**
cover sprites, hotspots or on-enter effects; N5 is the one this case needs that
the UI lacks.

### 7.4 Draft shadowing

Opening any story in the Studio writes `scarlet-studio-draft-<story-id>`
immediately — verified: opening `jack-morrow-witness` created
`scarlet-studio-draft-jack-morrow-witness`, and opening the default Studio
created a draft of the film. `loadPublishedCatalog()` reads
**published → draft → built-in** (`App.tsx`), so the newsstand plays the draft.
That is why every player test in this pass used a fresh profile: a Studio visit
in the same profile would have changed what "the build" meant. It also explains
why a Check count taken against a draft cannot be compared with
`validateStory()` on the committed data — the likely source of S1's "16 notes".

---

## 8. Art audit

### 8.1 Inventory

| Kind | Count | Notes |
|---|---|---|
| Generated plates | **14** | 7 portraits (`jm-*-portrait.png`) + 7 four-up talking plates (`jm-*-talk-plate.png`) |
| Derived sprite sheets | 7 | 4 frames, 768 px tall, built with `scripts/make-sprite-sheet.mjs --key ff00ff --frames 4 --height 768` |
| New backgrounds | **0** | 23 unique backgrounds across 24 scenes, all reused from `public/film/img/` and all present |
| Other new images | 0 | — |

All 23 backgrounds were reviewed on two contact sheets
(`art-backgrounds-1.png`, `art-backgrounds-2.png`): rain, alleys, office,
apartment, bar, Hive, passage, storeroom, and the three ending plates. All are
usable; none is stretched or letterboxed beyond the game's normal framing, and
the game grades them all `midnight-teal` at render.

### 8.2 Per-character sheets

`scale = 768 / tallest source frame`; widths are the committed sheet's frame
widths. "Rebuild" is sha1 against the committed sheet using the shipped command
and the shipped plate.

| Character | Portrait | Talk plate | Sheet | Scale | Rebuild | Mouth diff bbox (frame vs 0) |
|---|---|---|---|---|---|---|
| Jack | 877×1216 | 3668×1280 | 1936×768 (4×484) | **0.6725** | differs (2.64% RMSE) | 98×65–76 @ +188,+175–179 |
| Vera | 880×1196 | 3680×1260 | 1368×768 (4×342) | **0.6944** | differs (3.78% RMSE) | 68–77×53–60 @ +113–122,+145–146 |
| Mara | 1264×843 | 5216×907 | 2012×768 (4×503) | 0.9961 | byte-identical | 132×68–78 @ +177,+217–219 |
| Ishida | 1232×864 | 5088×928 | 2180×768 (4×545) | 1.0119 | byte-identical | 131–135×82–99 @ +211–212,+205–213 |
| Kaneko | 1365×768 | 5620×832 | 1932×768 (4×483) | **1.0847** ⚠️ | byte-identical | 131×87–96 @ +163,+211–212 |
| Okada | 1200×896 | 4960×960 | 1512×768 (4×378) | 0.9796 | byte-identical | 104×68–81 @ +129,+166–172 |
| Sakai | 1408×768 | 5792×832 | 2612×768 (4×653) | **1.0711** ⚠️ | byte-identical | 145×93–104 @ +239,+267–268 |

The mouth bbox is the trimmed region that differs from frame 0 by more than 10%
in a packed sheet frame; it is confined to the lower face. But the frames do not
read as open/close mouth shapes: `art-jack-mouths.png` shows four **visually
near-identical** mouths (frame crops at 200%). The sheet is correct; the plate
is weak. The talk animation is therefore a small jaw/tongue flicker rather than
a speaking mouth. This is a design note, not a crash.

### 8.3 Portrait vs plate frame

`art-portrait-vs-frame.png` places each portrait beside its talk plate's first
frame. They are clearly **different generations** (framing, collar, lighting,
hands differ), which is why they count separately against the ten-image budget
(N1). The portraits do their job as `avatarUrl`s in the relationship ledger and
HUD; the plates do theirs as sheet sources.

---

## 9. Design notes

- **Talking portraits, engine side.** `Game.tsx`'s `onStage` memo
  (6330–6346) collects every scene speaker with a `talkingSheet`, `rest` and
  `sheet`; `StageSprite` (6550–6600) draws them, and only `activeSpeakerId`
  animates (`anim={animate ? "talk" : "rest"}`, 1316). Everyone else dims to
  `talkingDim` (0.7) and holds their pose. `talkingSheets` variants are
  supported for expression changes; this case authors none.
- **Coverage.** 16 of 24 scenes put 1–3 sprites on stage: alley (Mara), shot
  (Sakai), key (Mara+Sakai), Vera's wait, station (Ishida+Vera), Okada's bar
  (Okada+Vera), office (Vera+Jack), box (Jack+Ishida), backstreet (Jack),
  apartment (Jack+Vera), bar and bar_late (Okada), counter (Kaneko+Jack),
  stakeout (Vera+Jack), letter (Kaneko+Vera+Jack), storeroom (Jack+Mara).
  Eight have none: the prologue bar, the Hive, the Hive after dark, the
  passage, the ledger, and the three ending cards. The two Hive scenes and the
  passage are voiced but faceless — in exactly the stretch where the case is
  trying to be most claustrophobic. Deliberate or not, it is the clearest
  "voice with no mouth" case after the three emoji minor parts.
- **Emoji minor parts.** Five voiced lines belong to the Masked Man (3) and the
  Journalist (2), whose `avatarUrl`s are emoji — no mouth ever appears while
  they speak. The log notes this under "Not made"; it is worth either keeping
  as a deliberate radio-voice style or giving them plates in Part Two.
- **The four-frame cycle.** With frames this similar, `talk: [1,2,3,2]` at 8 fps
  reads as a twitch. A plate with a real open mouth on 1 and 3 and closed on 2
  would do more for the "they are speaking" illusion than any engine change.
- **The gated ledger works.** `jmw_ledger` is 23/23 gated beats and produces a
  genuinely personal "What You Did" run; it is the strongest argument that E5's
  missing feature is worth building, not a reason to skip the recap.
- **Order matters** and is authored as different scenes: `jmw_bar` vs
  `jmw_bar_late`, `jmw_hive` vs `jmw_hive_late`, with the map pins opening and
  closing on `jmw_leads_open` / `jmw_bar_done` / `jmw_hive_done`. Played both
  orders; both are coherent.
- **Draft shadowing is a testing trap.** A single Studio visit changes what the
  newsstand plays, silently. Every future verification pass should use a fresh
  profile (as this one did) or clear `scarlet-studio-draft-*` first.

---

## 10. Recommended fixes, in priority order (none applied)

1. **Reconcile the art budget (N1).** Either the pass is over its ten-image
   limit by four (14 generated plates) and needs an explicit exception, or four
   images must be removed/merged. The log must count the talk plates.
2. **Fix the four voice lines (N3).** Cut the game lines back to what the take
   actually says, or source longer takes. Word-for-word is a hard rule; four
   breaks is not "40+ lines, all word-for-word".
3. **Decide the downscale policy (N2).** Re-slice jack and vera at 1142/1106
   (or accept 768-based softness and record the exception). The other five are
   within 2% of native or above.
4. **Add an `onEnterActions` control to the Studio (N5).** Seven scenes of this
   case depend on it; an author cannot reproduce the case without it.
5. **Render `nextTimeLines` on the ending card (E1).** The lines exist and are
   the season's hook; this is the one confirmed engine bug with a trivial
   surface.
6. **Teach the validator that map gating reads a flag (S2).** It already knows
   map pins *require* flags for its impossible-gate check; the consumer walker
   should also visit them.
7. **Correct the findings log.** 77 flags, not 70; 14 timed choices + 3 QTEs,
   not 11; 3 two-character trust choices, not 6 big ones; 14 generated images,
   not 7 of 10; "no Studio code was touched" is false; "every finding is
   reproducible" is false (E2, E4, S1, S3b, A1 are not).
8. **Make `--height` upscaling a failure, not a warning (A2b).** Exit non-zero,
   or refuse to write, when the requested height exceeds the source by >5%.
9. **Improve the talking plates (design).** Regenerate the plates — Jack's
   first — with an unmistakable open-mouth frame; the current four frames are
   too similar to read as speech at 8 fps.

Items 1–4 are the ones that affect the brief's rules; 5–9 are quality and
process. **None has been applied.**

---

## 11. Every command that produced a result

Environment: repo `/home/user/scarlett-witness` at `34cce2d`;
`npm ci --no-audit --no-fund` (496 packages); Chromium from
`@sparticuz/chromium` 153.0.8010.0 (`/tmp/chromium`, `LD_LIBRARY_PATH=/tmp/al2023/lib`)
because `npx playwright install chromium` failed with ECONNRESET; Vite dev server
on `http://127.0.0.1:5174`.

### 11.1 Baseline checkout and diff

| Command | Result |
|---|---|
| `git status --short` | clean at `34cce2d`; only `docs/jack-morrow-verification/` untracked at the end |
| `git log --format='%h %s' 539b31e..34cce2d` | `3ee88f8`, `05b8704`, merge `34cce2d` |
| `git diff --stat 539b31e 34cce2d` | 28 files, +3732/−2 |
| `git diff --name-status 539b31e 34cce2d` | 21 A art, 2 A docs, 1 A story, 1 A spec; M `stories.ts`, `studioLeaves.tsx`, `studio.spec.ts` |
| `git diff --name-only 539b31e 34cce2d > /tmp/changed.txt` then `grep -E -e '^src/film' -e '^public/film' -e nobodysWitness -e build-film /tmp/changed.txt` | no output (rule h) |
| `git fetch --unshallow` | resolved `539b31e` in the originally shallow clone |
| `git worktree add ../sw-before 539b31e && cd ../sw-before && npm ci` | base checkout for the A/B runs |

### 11.2 Static checks and unit suites (head, and base where noted)

| Command | Head | Base `539b31e` |
|---|---|---|
| `npx tsc --noEmit` | exit 0 | — |
| `npm run lint` | 0 errors, 2 warnings (`Game.tsx:4067` `primedMusic`, `:5974` `markCoverage`) | — |
| `npm run test:validator` | 32 passed, 0 failed | — |
| `npm run test:studio-ship` | 174 passed, 0 failed | — |
| `npm run test:engine` | 1698 passed, 0 failed | — |
| `npm run test:studio-beta` | 60 passed, 0 failed | — |
| `npm run test:screel` | 23 passed, 0 failed | — |
| `npm run test:sledge-dom` | passed | — |
| `npm run test:sprites` | 9 passed, 3 failed | **identical** failure (diff of ok/FAIL lines empty) |
| `npm run test:dom` | `=== DOM SMOKE FAILED ===` — credits end-roll `landed on the ending card: false` | **identical** assertions; only rendered char counts differ |
| `npm run test:film-depth` | "film depth: all checks passed" | — |
| `node scripts/film-backend-tests.mjs` | exit 1: `the run is timed to the song's 3:19 (170 s)` after 19 passing checks | **exit 1, same assertion**; `diff /tmp/fb-{before,after}.log` differs only in temp bundle paths |

`test:dom` prints `DOM SMOKE FAILED` **and exits 0**; judge it by output, not
status. `test:sprites`, `test:dom` and `scripts/film-backend-tests.mjs` all fail
identically at `539b31e`, so all three are pre-existing and none is a Jack
Morrow regression.

### 11.3 Story validation, bot, and the browser spec

| Command | Result |
|---|---|
| `node /tmp/bundle.mjs /tmp/issues.mjs` (esbuild bundle of story + `logic.ts`, then `validateStory`) | 0 errors, 2 warnings: *Every exit from "Prove It" is gated…* (`jmw_storeroom`) and *Every exit from "What You Did" is gated…* (`jmw_ledger`) |
| `npm run bot -- --story jack-morrow-witness --runs 400 --seed jmw-pass2` | 24/24 scenes, 92/93 choices, 3/3 endings, 0 dead ends; 195 Curtain / 188 Flour Sacks / 17 Promise |
| `npm run bot -- --story jack-morrow-witness --runs 2000 --seed jmw-seed-a` | 968 / 945 / 87 |
| `… --seed jmw-seed-b` | 996 / 914 / 90 |
| `… --seed jmw-seed-c` | 989 / 923 / 88 |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 LD_LIBRARY_PATH=/tmp/al2023/lib PLAYWRIGHT_CHROMIUM_PATH=/tmp/chromium npx playwright test scripts/browser/jack-morrow.spec.ts` | **16 passed (8.2 m)** — full run 5.2 m, save/load 44.0 s, Studio round-trip 36.2 s (`/tmp/jmw-spec.log`) |

### 11.4 Full playthroughs from the newsstand (fresh profile, no branch links)

`node /tmp/fullrun.mjs promise|flour|bolt` — one fresh Chromium context per run;
newsstand → PLAY EPISODE → BEGIN EPISODE ONE; 66 choices; screenshots
`ending-promise.png`, `ending-flour.png`, `ending-bolt.png`.

| Run | Terminal scene | Duration |
|---|---|---|
| promise | `jmw_end_promise` | 161 s |
| flour | `jmw_end_flour` | ~160 s |
| bolt | `jmw_end_bolt` | ~160 s |

### 11.5 Focused browser probes

| Probe | Result |
|---|---|
| `/tmp/e2check.mjs` at 1280×720 (apartment, box) and 390×844 (apartment) | nudge panel 234×72.5 at (1023,107) at 1280 (234×87.5 in the box); MENU opens by mouse; first choice clickable; Escape → `LEAVE THE CASE?` |
| `/tmp/e1e4.mjs` (all three endings via branch links) | headings, `CHAPTER COMPLETE`, gold/silver/game-over all present; no `nextTimeLines` after 12 s; no `Story so far` on the ending card |
| `/tmp/e4b.mjs` (`jmw_box` with four flags) | "STORY SO FAR — FLAGS SET" renders four sentences; no raw ids |
| `/tmp/s3.mjs` (`?trust=vera:1` and `:3`) | ledger lists 10 entries incl. **JACK**; Vera shows WARMING +1 / TRUSTS YOU +3 |
| `/tmp/e2probe.mjs` at 1280/1440/390 | `elementFromPoint` at the MENU is the MENU button; no overlay |
| `/tmp/studio-check.mjs` | Continuity panel: **2 NOTE(S)** — the two gated-exit advisories |
| `/tmp/studio2.mjs` | `?studio=1` opens the last story; opening `jack-morrow-witness` creates `scarlet-studio-draft-jack-morrow-witness`; navigator 24/24; Check 2 |
| `/tmp/handbuilt.mjs` | built 2 scenes, a choice with a target and `vs_took_key`, an ending; ▶ Play → choice → `★ SILVER CASE ★` |
| `/tmp/export.mjs` | 44,190,899-byte reel export |
| `/tmp/compare-export2.mjs` | 129 embedded assets; 136 `asset:` refs sha1-identical; 0 non-media diffs |

### 11.6 Data audits (esbuild bundle + Node)

| Script | Result |
|---|---|
| `/tmp/audit1.mjs` → `/tmp/audit1.json` | 24 scenes, 303 beats, 93 choices, 87 voiced lines, 23 backgrounds, 0 items |
| `/tmp/audit2.mjs` | 87 voiced lines; 83 exact, 4 longer; 5 emoji-speaker lines |
| `/tmp/audit3.mjs`, `/tmp/audit4.mjs` | 77 flags used, 77 noted; 129 asset paths, 0 missing |
| `/tmp/audit5.mjs` | 67 flags read by content; 10 note-only (`jmw_vera_card`, `jmw_clue_sakai_name`, `jmw_clue_clipping`, `jmw_clue_notebook_old`, `jmw_took_case`, `jmw_clue_drains`, `jmw_watcher_plate`, `jmw_plate_missed`, `jmw_mara_half`, `jmw_mara_gone`); 0 read-never-set |
| `/tmp/counts.mjs` | 14 timed choices, 3 QTEs, 28 trust choices, 3 multi-character, 23 unique backgrounds, 0 items |
| `/tmp/counts3.mjs` | trust entries incl. timeouts: vera 16, mara 8, okada 6, ishida 5, kaneko 3 |
| `/tmp/rules.mjs` | 0 attitudes, 0 interrogations, 0 stage scenes, 0 items, `meters` null |
| `/tmp/e5.mjs` | `jmw_ep1` 0 `recapLines`, 3 `nextTimeLines`; ledger 23/23 gated; ending recaps are strings |
| `/tmp/s2.mjs` | with `jmw_leads_open`'s note removed, validator emits the "set but never read" warning |
| `/tmp/flagnotes.mjs` | 77/77 flags noted; 0 missing, 0 stray |
| `/tmp/bgcheck.mjs` | 23 unique backgrounds, 23 exist, all under `/film/img/` |
| `/tmp/onstage.mjs` | 16 scenes stage sprites; 8 do not |
| `/tmp/keys.mjs` | field inventory used for §7.2 |
| `/tmp/maratrust.mjs` | mara: −1 at `jmw_so_c_truth`, −1 at `jmw_le_c_vera`, +1 catch, +1 block, −1 letgo, +1 promise, −1 tell |

### 11.7 Art commands

| Command | Result |
|---|---|
| for each character: `node scripts/make-sprite-sheet.mjs --in public/img/jack-morrow/plates/jm-<name>-talk-plate.png --out /tmp/repro/jm-<name>-talk.png --key ff00ff --frames 4 --height 768` | all exit 0; frame widths 484 / 342 / 503 / 545 / 483 / 378 / 653; `srcH` 1142 / 1106 / 771 / 759 / 708 / 784 / 717 |
| `sha1sum /tmp/repro/*.png public/img/jack-morrow/sprites/*.png` | 5/7 byte-identical; jack and vera differ |
| `compare -metric RMSE /tmp/repro/jm-jack-talk.png public/img/jack-morrow/sprites/jm-jack-talk.png null:` | 1732.74 (0.0264) |
| same for vera | 2474.89 (0.0378) |
| `--auto` variants for jack and vera | identical output to `--key ff00ff` (same RMSE) |
| `convert <sheet> -alpha extract -format '%[fx:mean]' info:` | 0.65–0.74 on all seven rebuilt sheets (transparent backdrop) |
| per frame: `convert <frame> <frame0> -alpha off -compose difference -composite -threshold 10% -trim -format '%wx%h%O'` | bboxes in §8.2, all in the lower face |
| `montage` of four jack frame crops at 200% → `art-jack-mouths.png` | four near-identical mouths |
| `montage` of 12 then 11 backgrounds → `art-backgrounds-1/2.png` | all usable |
| `montage` of each portrait beside its plate frame → `art-portrait-vs-frame.png` | different generations |

### 11.8 Commands that were expected but could not run

- `npx playwright install chromium` — **failed** (ECONNRESET). Worked around with
  the `@sparticuz/chromium` package; no test was skipped.
- No test was run against a deployed URL; everything ran against the local Vite
  server on port 5174.
- Screenshots are Chromium at 1280×720 (player), 1440×960 (Studio) and 390×844
  (phone); none of the committed screenshots was downscaled.

---

*Verification only. No engine, Studio, story or art change was made by this pass;
the findings above are recommendations, not patches.*
