# Jack Morrow — season plan

**"Jack Morrow"** retells *Nobody's Witness* as a three-part, choice-driven
season in the Scarlet Reel engine. It plays like *The Wolf Among Us* —
conversations under a clock, "…will remember that", trust that opens and
closes doors, quick-time action, an end-of-episode reckoning — and it looks
like the film: the film's own plates (`public/film/img/…`), its
`midnight-teal` grade, and talking sprite portraits of the same cast.

The plot source is the screenplay as the film plays it,
`src/film/story.json` (104 scenes). Scene numbers below are **film scene
ids** in that file. Nothing of the film is edited; the game only points at
its pictures, effects, music and (where a line is kept word-for-word) voice
takes by path.

Story id: `jack-morrow-witness` · file: `src/data/jackMorrowWitness.ts` ·
scene-id prefix: `jmw_` · new art: `public/img/jack-morrow/`.

No meters, no attitude tags, no inventory, no items, no Interrogation mode,
no walkable stage — anywhere in the season. **Trust is the memory.** Flags
are plain facts only: a clue seen, a place visited, a promise made or broken.

---

## The split

### Part 1 — "Just Listen" (this pass; Episode 1)

**Film scenes 1–20.**

- **Opens** in the Kanda backstreet (film 1): Mara Voss, soaked, early for a
  1 a.m. meeting she isn't sure she wants, watches Sakai shot in front of
  her and takes a brass key from his hand — then hides behind the counter
  while the journalist is killed in the small bar (film 2).
- **Middle:** Vera, three days later — the police who won't look (5, 6, 7),
  Okada who will (8, 9), and the card that sends her to a man with no
  surname (10). Jack takes the case for reasons he doesn't give (11),
  walks the backstreet (12), and searches Mara's room (14). Vera follows
  him at forty metres (14A). The sketchbook's noodle counter leads to the
  Hive (15, 16) and to Kaneko, who knew them all (17). Sakai's letter,
  addressed to Vera, surfaces (18).
- **Ends** past midnight in the noodle-shop storeroom (19, 20): Jack finds
  Mara alive, and what she asks of him is the season's loaded gun —
  *"Don't tell her I'm here."* Three endings, all cliffhangers, decided
  mainly by Mara's trust and by what Jack did with what he knew
  (see "Part 1 endings" below).

### Part 2 — "The Number 114" (not built in this pass; Episode 2)

**Film scenes 21–71.**

- **Opens** the morning after the promise (21): Jack now lies to a client
  for a living, and the client is falling for him. The noodle counter under
  the tracks (22), the sea wall and Mrs Sakai (28, 29), the roadside inn
  and the night the four black sedans come (30–50) — the season's big
  action set-piece and the place Part 1's Vera/Ishida trust should decide
  who warns Jack, and how much it costs.
- **Middle:** Mara gives Jack the key itself (60 — *"I want my sister"*),
  Jack trusts Ishida with the move (61), locker 114 gives up Daniel Voss's
  notebook (63), and Vera, in the wine-red dress, goes to the hotel lounge
  to be told nothing (65, 66, 72's other end).
- **Ends** with the move that was an ambush (68–71): Mara is shot in the
  Hive passage and dies holding Jack's hand. Curtain line is Ishida's phone
  call to Vera (72) — *"He had been hiding her for several days, it seems.
  In the Hive. I'm sorry. I thought you knew."* — which detonates whatever
  Part 1's promise built.

### Part 3 — "Until Us" (not built in this pass; Episode 3)

**Film scenes 73–100.**

- **Opens** with Vera running through the rain in one shoe (73) to the
  empty-street confrontation (74) — the scene every Part 1/2 trust ledger
  has been paying into.
- **Middle:** the notebook published (82), Kurose's office (83), the Hive
  defending itself in its own dark (84–92), and the police station the
  morning after (93–96).
- **Ends** as the film ends: the service in Kaneko's room (97A), the rain
  stopped (98), the Hive coming down and the plaza standing where it was
  (99A), and a new counter, with the city going on (100). The season's
  final endings should be read off who is still speaking to Jack — Vera
  above all — not off whether the case was "solved".

---

## What Part 1 hands on

Episode 1's endings snapshot flags + trust (the engine's episode carry).
Part 2 must open by reading exactly these, and its recap lines (Episode 2
`recapLines`, gated on the same flags/trust) should list the player's big
decisions back to them.

### Trust (clamped −5…+5; starting values in brackets)

| Character | What moves it in Part 1 | What Parts 2–3 should do with it |
| --- | --- | --- |
| **Vera** (0) | How Jack takes the case; whether he admits he knew Daniel (office + stakeout); whether he tells her Mara may be alive before he has proof; the forty-metres drive. | The season's central ledger. High Vera trust earns the inn warning and the hotel-lounge honesty in Part 2; the size of the fall at film 74 is the distance from where Part 1 left her. If Jack told her the truth about Daniel in Part 1, Part 3's confrontation is grief; if he hid it, it's betrayal — different scene, different lines. |
| **Ishida** (0) | The midnight phone call (give him the backstreet lead or keep it); whether Jack ever reports the Hive. | Ishida is Part 2's trap. High Ishida trust in Part 1 should make film 61 ("Nine o'clock") *easier to walk into*; low trust opens a Part 2 route where Jack moves Mara without him — and pays differently. Never let Ishida trust read as "good": it's rope. |
| **Okada** (0) | The bar conversation: patience vs pressure; whether Jack names what Okada is afraid of. | Okada is the bar's memory. Part 2 can use him for the journalist's notebook aftermath and Part 3 for "Without a toast" (81) — warm if he was treated gently, shuttered if he was leaned on. |
| **Kaneko** (0) | Eating what she's given, paying too much, not forcing the curtain; what Jack tells her about Daniel. | Kaneko is the Hive. Her trust decides how the Hive receives Jack in Part 3's defence (84–92) and whether Mara's service (97A) opens its door to him. |
| **Mara** (0) | What Kaneko and Okada report of him before they meet; the storeroom itself: proof offered, patience, and the promise. | Mara's trust at carry decides Part 2's whole shape: whether the key is handed over at 60 willingly or has to be earned back, whether she accepts the move at 68, and what her last lines can be. |

### Flags (plain facts only)

| Flag | Set where | Part 2/3 should… |
| --- | --- | --- |
| `jmw_answered_vera` / `jmw_declined_vera` | Prologue: Mara answers Vera's call, or declines it (canon). | Colour Vera's voicemail guilt; if she answered, Vera heard the bar sign mentioned — Part 2 Vera can find the lane herself. |
| `jmw_sakai_words` | Prologue: Mara stayed with Sakai to his last words. | Let Mara quote "After twenty years" / "Don't let them have it" as testimony in Part 2. |
| `jmw_clip_lost` | Prologue QTE fail: the red bird clip is lost under the counter (canon). | The clip exists as evidence Okada can produce; without it, Jack's storeroom proof leans on the sketchbook. |
| `jmw_told_vera_daniel` | Jack admits he knew Daniel Voss (office or stakeout). | Gates Part 2/3 Vera scenes — see Vera's row above. |
| `jmw_told_ishida_lead` | Jack gives Ishida the backstreet/bar lead on the phone. | Ishida knows Jack is walking the lane; Part 2 surveillance beats can be attributed. |
| `jmw_clue_strap`, `jmw_clue_one_car_twice`, `jmw_clue_sightline` | Backstreet investigation hotspots. | Testimony Jack can spend in Part 2 conversations (each opens a reply; none is an item). |
| `jmw_bar_first` / `jmw_apartment_first` | The order the player works the two leads. | Written into both places in Part 1 (the second place has changed); Part 2 recaps should name the cost of the order chosen. |
| `jmw_clue_sketchbook` | Mara's apartment: the noodle-counter drawings. | The road into the Hive; Part 2's Vera should be able to find the counter from the same drawing (film 54–58). |
| `jmw_letter_found` | Sakai's letter, if the apartment is searched before it is searched *by someone else*. | Daniel's papers become speakable in Part 2 instead of rumour; without it, Jack is working from Sakai's word alone. |
| `jmw_clue_notebook` | Okada, handled gently: the journalist's notebook page. | A second source for the 1 a.m. meeting — Part 2 press route (53A, 82). |
| `jmw_okada_warned` | Okada handled hard, or the bar left for second. | The bar goes quiet in Part 2; somebody got to him. |
| `jmw_watcher_plate` | Stakeout: the white car's plate is taken down. | Part 2 can let Jack recognise the car at the inn (38) a beat early. |
| `jmw_vera_followed` | Stakeout: Vera is allowed to stay / sent home. | Whether Vera starts Part 2 as a partner or a client being managed. |
| `jmw_hive_noticed` | Forcing the Hive's service door (QTE fail). | The Hive's eyes are a cost in Part 3's defence — or a warning system, spent once. |
| `jmw_promised_mara` | **The** promise: Jack agrees not to tell Vera. | The detonator at film 72/74. Part 2 must track every scene where keeping it costs something. |
| `jmw_told_vera_alive` | Jack breaks (or refuses) the terms and tells Vera Mara lives, before the end. | Reroutes Part 2's middle: Vera comes to the Hive (54–60) as a participant, not a mourner-in-waiting. |
| `jmw_key_seen` | Storeroom: Mara shows Jack the brass key and its tag. | Locker 114 (63) is Part 2's hinge; without `jmw_key_seen`, Jack knows only that "something small and brass" exists. |
| `jmw_mara_bolted` | Dark Part 1 ending only. | Part 2 opens colder: Kaneko moves her without Jack, and trust has to be rebuilt from below zero. |

### Part 1 endings (all three are Episode 1 endings; none ends the season)

1. **`jmw_end_promise` — "THE PROMISE"** (gold). Mara believes him: proof
   offered, patience kept, promise made. She shows him the key. Somewhere
   above them, a train goes over, and the Hive keeps its secret one more
   night.
2. **`jmw_end_flour` — "FLOUR SACKS"** (silver). Mara accepts protection
   without trust: one night, no key, no names. Jack has found her and
   bought nothing but time.
3. **`jmw_end_bolt` — "THE CURTAIN"** (dark). Jack pushes, or hesitates at
   the wrong second, or has already told the wrong person: Mara is through
   the curtain and gone into the passages while somebody's shoes are
   already on the Hive stairs.

All three carry their trust + flags into Episode 2; the difference Part 2
inherits is *how much of Mara Jack still has*.

---

## Build notes for Part 1 (this pass)

- 20 scenes: a two-scene Mara prologue, a Vera interlude, then Jack —
  office, backstreet, apartment/bar in player order, stakeout, the Hive,
  the storeroom, a recap, and the three endings.
- Investigation is by hotspot: Jack's office box, the backstreet, Mara's
  apartment. Clues are flags, never items.
- Most conversation scenes run one timed, pivotal reply (the
  `timeLimitSeconds` conversation clock) beside untimed alternatives and
  an explicit "…" — letting the clock run out *is* the silence answer and
  moves trust like one.
- Three quick-time beats: ducking Vera under the headlights / keeping
  distance in the follow, getting through the Hive's service door, and
  catching Mara's hand at the curtain. Failure always continues the story
  and always costs somebody's trust.
- Every background is a film plate by path; every speaking regular is a
  talking sprite sheet (`character.talkingSheet`, `rest` [0],
  `talk` [1,2,3,2] ≈ 8 fps), placed with `talkingX` / `talkingFlip` so
  two-shots face each other.
