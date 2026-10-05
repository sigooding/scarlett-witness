# Nobody's Witness: True Romance Cut — Beta Test Report & Production Pass

**Story id:** `nobodys-witness-true` (`src/data/nobodysWitnessTrue.ts`)
**Beta date:** 2026-08-30 · **Status:** production cut, re-audited same day (three sittings: §2c Act Three endings audit — all playthroughs end on Act Three, one clock fix; §5 Studio canvas completed to a 29-slot serpentine; final sitting — Doc Sato surname at first mention, §5c.2 closed, all gates re-run). Soundtrack, leftover copy, newsstand Play button, and content revision r36 shipped in this pass. Re-audit any time with `node scripts/beta/beta-harness.mjs` (72 checks). Cue sheet: `docs/nwt-soundtrack.md`. **r37 (2026-08-31): dialogue polish pass — five line-level edits, one real plot flaw fixed (Jack's career math), anachronism note retired. See §6.**

---

## 1. What shipped in this pass

### Jack is no longer kind to David — David is one of Solomon's people
David's character card now reads straight: *"Fourteen years Solomon Reyes's money man — the books, the skim, all of it. Then he stole from the one man in the county you don't steal from. The bakery was the story he told himself to keep his hands steady."* Jack's behavior matches:

| Scene | Before | After |
|---|---|---|
| Warehouse (new) | Solomon treats Voss as a stranger who owed money | `nwt_w_sol9`: Solomon says David **counted his money for fourteen years**, skimmed the pile for fourteen months, and "the pile doesn't miss anything. I do inventory." |
| Rental V.O. | "Part of him still thought he'd have to run. **I know that feeling from the inside.**" | Jack reads the bag like a cop: a man who counted a crime boss's money can't be caught holding the count. |
| Rental | Jack: "Client list's competitive this week. **Try me.**" | "Don't worry. I've got my own ledger this week. Talk." |
| Rental V.O. | "That's the one thing I'd take back… **I let him put the bag down.**" | He let him rest anyway — and names it "**the most expensive forty minutes I ever paid for**." |
| Yard (bakery) | "My week's been full of stupid. Go ahead." / "You know how to bake?" | "My week's been full of stupid. **Make it quick.**" / "**That's a nice story. You don't know the first thing about bread, do you.**" |
| Yard (killers arrive) | "Go. **I'll slow them down.**" … "**Don't thank me yet.**" | "**I'm not your lookout, David. Use it or don't.**" … David tries "Tell her—", Jack: "**I won't.**" |

His "DAVID— no, no, no" at the shot stays (it's a man losing his only witness, not his friend), and the bakery stays on screen — but as David's self-mythology, which Jack sees through.

### The days-of-week confusion — cleaned up
The verifiable canon is: diner **Friday 11:47 p.m.** → pool hall Saturday → office/abduction Sunday ~1 a.m. → warehouse/laundromat Sunday night→Monday small hours → Vera at the office Monday 3 a.m. → pumps Tuesday morning → rental & killing Tuesday night → mill lot **Wednesday** night → pool hall Thursday → trade & final diner **Friday**. Lines that floated nonsense days or made no reference:

- "Means you've got a client and now we've got a **Tuesday**" (Act 1, never paid off) → "Means you've got a client and now **you've got our full attention**."
- "some part of you has known that **since Tuesday**" → "every single one of the days she hasn't called."
- Denny: "doing her hair on a **Tuesday**" → "on a **workday and lying about it**" (and he now cops "I don't know what hat" before Gary can).
- Jack's pumps V.O. "**It's a Tuesday** and you decide not to ask" → "**There's a night like that in every life — and you don't know you're in it until it's behind you.**" Same theme, no day stamp.
- Rosa: "she's got him **by Tuesday**" → "inside a week."
- Mill bag beat: "ready to leave **since Tuesday morning**" → just "ready before either of us gave her a reason to stay."

Kept on purpose (these are the load-bearing countdown, and they're correct): every **Friday** in the Ted scene and the trade; "**Doc Sato sold it to them Tuesday**" (the leak — a fact); "**It's Wednesday.** / **It's Wednesday.**"; the Blue Cue 2 prose "**Thursday night**"; "**Tuesday night**" in Solomon's trade speech; the "bus at six, another one **till Tuesday**" idiom; the act tagline "It's Wednesday. Friday's coming."

### The missing 48-hour ultimatum — now on screen
Act Two's card promises "Solomon's forty-eight hours" but the warehouse scene cut from "Who said anything about letting you go" straight to escape. Four beats added to `nwt_warehouse`:

- **`nwt_w_sol10`** — the terms, as a mortgage: "You find him. You bring me him, or the money, either one… Forty-eight hours. After that I stop being polite and start being owed." (And Moe cuts him loose after — "Not out of kindness — out of office hours," which also fixes the old "zip-tied chair escapes like an action hero" soft spot while keeping the four-seconds escape V.O.)
- **`nwt_w_sol11a` / `nwt_w_sol11b`** — the name, gated. In the **named-client** branch Solomon reveals he **already had the name** ("it was mine already… which is why you're breathing — a man who gives his client up for nothing can't be used for anything; a man who does it to see a face? That man can be sent places") — that's now *why* he grants the two days. In the silent branch he explains the town tells him everything ("I own its debts… people confess to what they owe"), closing the Act One mystery of how Moe knew.
- **`nwt_w_sol12`** — the deadline stamped: "Forty-eight hours from the moment that chair hits the ground… That's not a threat. That's the payment schedule."
- **`nwt_wo_vo5b`** — Jack in the rain, clock ticking: "His forty-eight hours were running in my chest…" This is the dev-notes idea #5 (the gated name variant), adapted to the cut that actually exists; it was never previously merged.

Rental line "that clock's down to about thirty" (arithmetically wrong — Sunday grab + 48h = Tuesday, hours not thirty) → "The clock's just about out — we might already be on borrowed time."

### The $211k now changes hands on screen
The unopened duffel never left the rental house in the old cut, yet Vera has the $211k in every ending. Two beats added to `nwt_yard` after the phone-buzzing hold: an SFX beat (the unopened bag dragged out and into a trunk in the rain) and Jack's V.O. — "Two hundred and eleven thousand dollars and it didn't occur me to leave it… I'd just been the one to drive the other one to her. She didn't ask me to. She didn't have to." Also fixes the 211 leak where Jack named the figure *before* David confesses it (he now says "you've got Solomon's money in a bag by the door"; the bags hotspot no longer prints the number).

### Vera = Alabama (the dev's rewrite #4, applied in her own voice)
Her confession used to claim "I tracked every dime" — impossible for the woman who twice says she never understood the mechanics. Now: "**Fourteen months of creeping around, being so careful I wasn't even allowed to know how careful. David moved the money. I tracked the shape of the empty spaces he left — never the numbers, he kept those between his teeth.**"

The mill confession also now plays as Alabama's charm *coming out wrong* — same facts, wrong order, self-correcting in the middle, furious about crying — and lands the "I killed him with HOMEWORK" line the earlier note wanted. **"Why me"** no longer gets a spec-sheet answer; Vera says **"I picked a man because he looked lonely enough to say yes."** She also swears four times in Act Three now (the True Romance register: `fucking`, `God damn it`, `fucking`, `eleven fucking hours`).

### Continuity fixes
- The warehouse escape shout "He's loose! Get the fuck—" was tagged to **Desh**, one scene after Jack says the guards are "not Moe and Desh — a different pair." Re-tagged narrator (unnamed guard).
- "sitting around **this country**" → "this county" (he hid four hours north, same state).
- "**Denny** told me at the pumps" named the two-hours-north gas-station bit player Blackwood Vera never met → nameless pumps clerk.
- Mill scene: the back-seat bag V.O. played *after* Jack's closing "she was going to try to save me" — the scene summed up then kept talking. Bag beat moved ahead of the closing V.O. (dev note #3).

### Flag cleanup
Seven flags audited via full-graph walk. **Removed** (set but never read by anything — dead wiring): `nwt_asked_shape`, `nwt_told_her`, `nwt_david_protected_her` (set identically by both pool-hall exits — it was just "on exit"), plus the inert `meterChanges: { Suspicion +3 }` on the fight choice (Suspicion was never initialized or read). `nwt_named_client` **kept and promoted** — it now gates the two warehouse name-variant beats, so the Act One choice actually changes Act Two. All consumed flags have producers; zero orphaned.

### The two optional improvements — now applied

**Swinging on Moe now costs a kindness.** The Blue Cue 2 gift (Desh: "He didn't give her up…") no longer auto-plays before the choice. Walk out and Desh still hands it to you, and SHE STAYS stays open. Fight, and the scene breaks into a new `nwt_bluecue_fight`: Moe takes the glass, Desh starts to say the line, and Moe cuts him off ("Desh. No. He didn't want it."). Jack never learns David protected her, so `nwt_vera` only offers "There's nothing to give her" and routes to NOBODY'S WITNESS. The violent branch still gets Moe's lip beat in the trade, but now also gets Jack's V.O. in the fight and in She Walks: *"…the price was a sentence I didn't know existed."* This is the thematically exact version — violence doesn't hurt you here, it shuts you out of a kindness.

**Vera's sin level softened to the hung-up-phone version.** The "eleven hours of arithmetic" is now "I called it. Three rings. I hung up before anybody answered — then I told myself the arithmetic made it a decision." It's still eleven hours and still her fault, but the sin is weakness and fear rather than cold calculation. `nwt_m_v16` ("It's the same one with a door on it") and the SHE STAYS confessional both updated. Same plot; the confession still lands hard. The Blue Cue 2 walk V.O. now pays that off explicitly ("It was that she called. Three rings, and she hung up before anybody answered").

**The 48-hour expiry is now on screen.** Rosa tells him in "The Cost": *"Your forty-eight went out this morning. I know you know. You've been carrying that thing around dead on your back all day and you never once said it. That's not stealth, Jack. That's just where you put the weight."* This closes the gap where Act Two's deadline was spoken but never paid off, and separates it cleanly from the Friday deadline Solomon puts on Vera.

### Dev notes assessed and NOT applied (with reasons)
- **"Rosa: three people knew her name… her, me, and you"** — can't port as written: Rosa didn't know Jack was even on the case until the 2 a.m. payphone call, and Sato (not one of her three) is the leak. The *idea* is covered by Solomon's new warehouse beats (he knew via the town/his debts) without contradicting the timeline.
- **Rental "what's left to be scared of?" rewrite (dev note #2)** — checked against the actual cut: the line runs after David explains Vera going quiet, i.e. in the correct order in the shipped version. No change needed.
- The "severed exchanges in nwt_cost" fixes (#1) — those were from the dev's own reordering of lines that don't exist in the shipped True cut; the Wed/Fri exchange is intact here.

## 2. Machine audit

`node scripts/beta/beta-harness.mjs` on the merged cut: 29 scenes, all reachable; zero dead ends; all choice targets resolve; 2,560 complete playthroughs; She Stays 512 paths / Nobody's Witness 1,024 / A Stopped Watch 1,024; every flag consumed is producible; conditional beats order after their hotspots; both clues grantable; `tsc --noEmit` clean; 544/544 engine tests pass; production build passes; all 265 assets present. The only warnings are the cut's declared NO DEAD ENDS rule ("no game-over ending") and the advisory that every exit from "She Walks In" is gated — that's by design, since each branch always has exactly one available exit (tell/keep for the peaceful path, nothing-to-give-her for the violent path).

## 2b. Production pass (this commit)

Leftover copy from the $200k / "don't thank me yet" draft:

- `nwt_y_vo2` — Jack no longer quotes a line he never said. Now: "I said I wouldn't."
- `nwt_r_hs_bags` — no longer prints "two hundred grand" before David confesses the number.

Soundtrack (engine inherit bug: a scene without `musicMode: "none"` keeps the previous bed, so the Blue Cue jukebox used to follow Jack into the office, warehouse, rental, and yard):

- Titles + She Walks In + SHE STAYS: `/nobodys-witness.mp3`
- Act 1 diner: `/Midnight in the Rain2.mp3` (track, 0.45)
- Blue Cue (both visits): `/nwt-bluecue-jukebox.mp3` (track, 0.4)
- Office / warehouse / laundromat / pumps / interlude / rental / yard / call / Rosa / mill / cost / trade / final diner / dry endings: `musicMode: "none"`
- Cold-open gunshot: `/nwt-gunshot.wav`
- HUD: `dialogueBox` sepia-pulp (same as Late Shift / Final Draft)
- Newsstand Play button and `#play` hash target the True Romance cut; badge reads **★ Production — True Romance Cut**
- `CONTENT_REVISION` 36 retires cached True-cut Studio snapshots
- `package.json` version `1.0.0`

Licensed needle-drop references stay in §4 and `docs/nwt-soundtrack.md`. The engine cannot start a new bed mid-scene, so Zimmer / Chet Baker / Chris Isaak remain supervisor notes, not files.

## 2c. Re-audit — Act Three question ("do all playthroughs end on act 3, same style of dialogue?")

**Question posed:** are all playthroughs ending on Act Three, in the same style of dialogue — or not?
**Answer: yes.** A second full beta pass (this commit) added a machine audit — harness **section 12, "Act Three endings audit"** — so the answer is re-verifiable, not just asserted. Result: **72 passed, 0 failed.**

- **All 2,560 complete playthroughs end on Act Three**, at one of exactly three endings: `She Stays` (512 paths), `Nobody's Witness` (1,024), `A Stopped Watch` (1,024). Zero dead ends; every scene reachable. No playthrough can stop short, and there is no Act One/Two exit to a terminal.
- **All three endings are the same *style* of dialogue.** Each is a true ending (no choices, letterboxed) carrying a complete `endingData` (tier / headline / recap), written in the cut's spare register (Jack V.O. + silent parenthetical narrator beats), and **each closes on the same device**: a silent-narrator main-street bookend ("same as the first frame. Neon smearing teal and magenta"). They differ only in tier, score, and which character speaks last — that's the intended variation, not a drift in voice.
  - `She Stays` — gold, 31 beats / 537 words, Vera last ("Doors."), theme keeps playing.
  - `Nobody's Witness` — silver, 12 beats / 440 words, Jack last (drinks the cold coffee), cut at the door bell.
  - `A Stopped Watch` — silver, 23 beats / 489 words, Rosa last (delivers the watch), unscored.
- **Clock-rhyme integrity** is now checked per ending (the 11:47 booth time must stay monotonic into the ending's own stamps) — see the one bug this caught below.
- **Vera's True Romance register** is still intact in Act Three (×4 documented profanity floor held).

### One bug found and fixed
The re-audit's clock check caught a real continuity slip in **`nwt_fa_vo1`** ("She Walks In"): it read **"Twenty-two minutes later the door bell."** The call is placed at 11:47, so a 22-minute walk means Vera arrives 12:09 a.m. — *after* the SHE STAYS ending stamps "Eleven forty-nine" and "eleven fifty-one" (the bag going back down). She can't be put down at 11:51 if she arrives at 12:09.

**Fix:** "Twenty-two minutes" → **"Two minutes."** Now the arrival (11:49) lands exactly on the ending's first clock stamp, and "I said one hour… two minutes later the door bell — nobody in this town has hurried for anything in fifty years" reads sharper, not looser. The 11:47 → 11:49 → 11:51 rhyme the recap ("eleven fifty-one on a Friday") is built on is now internally consistent.

The harness gained this as a permanent regression check (`She Walks In arrival … lands on or before SHE STAYS' first clock stamp`) — it **fails** on the old "Twenty-two" text and **passes** on "Two." All day-of-week references were re-swept against the §1 keep-list and remain clean.

### Production gates (re-run this pass)
`node scripts/beta/beta-harness.mjs` → 72/72 · `npx tsc --noEmit` → clean · `npm test` → engine 544/544 + import/export round-trip end-to-end · `npm run build` → single-file build OK. `package.json` 1.0.0, `CONTENT_REVISION` 36, newsstand badge **★ Production — True Romance Cut**, Play button + `#play` hash → this cut.

## 3. Still open — your call, not defects
1. **Anachronism note — RETIRED in r37.** The old note claimed the self-checkout/barcode rants sit ~1998–2005 while the mill/furnace/watch math dates the film ~2024. Re-deriving the dates from the text's own anchors: the mill closed in '09 and Jack says it "closed when I was thirty-two" while he's "forty-four" — that pins the film to **2021** (born 1977), and every other anchor agrees (2011 furnace + "six years later" death + Vera "doing arithmetic since I was nineteen" → she's 29; the father's watch "forty years ago" → 1981). In 2021 the self-checkout rants and the "nineteen ninety-something" recording gag are a period joke, not an anachronism — the best comedy in the picture stays untouched.

Both of the previous open items are now applied in §1: the swing-at-Moe branch costs Desh's gift, and Vera's sin level is the hung-up-phone version. If you want the colder Vera back (the eleven-hours-of-arithmetic version), that's a two-line revert — say the word.

## 4. Music cue sheet — suggestions, True Romance / Tarantino style

You already score the titles with `/nobodys-witness.mp3` and the pool hall with the draft beds. The cuts below are the licensed-record references I'd hand a music supervisor — diegetic-jukebox logic where possible (Tarantino rule: the characters should half-hear the song). Clearance is on you; all are placeholders for "this exact energy."

| Scene | Suggested | Why it works |
|---|---|---|
| **Cold open** (fence, rain, gunshot) | Hans Zimmer — *"You're So Cool"* (True Romance theme), but low, slowed, under rain — the melody almost buried | The film's thesis is that motif arriving warm at the end; plant it broken at the start |
| **Titles** | keep `/nobodys-witness.mp3` | It's yours and it's already doing the job |
| **Blackwood Diner, Act 1** | keep the smoky jazz (`Midnight in the Rain2`), or Nino Rota-ish lounge — think *"Girl, You'll Be a Woman Soon"* energy if you ever want Vera's entrance needle-drop | Alabama walked into Clarence's booth in that register |
| **Blue Cue, Act 1** (self-checkout rant) | a warped 7-inch country shuffle on the jukebox — George Jones *"He Stopped Loving Her Today"* or, for the joke, something cheery like John Prine *"Illegal Smile"* | Desh's rant over a sad country classic = the exact Pulp-Fiction-diner-in-a-pool-hall dissonance |
| **Office night** (the folder) | low drone only; let the phone V.O. play dry | Silence makes the ambush land |
| **Warehouse — Ted** | nothing. Heater hum. | Solomon polite with zero music is scarier than any score |
| **Warehouse — the terms (new beats)** | one slow, ironic needle as Moe cuts him loose: Jim Reeves *"He'll Have to Go"* ("put your sweet lips a little closer to the phone") | A crooner over "the payment schedule" — Solomon administers to a love song |
| **Laundromat / Rosa** | keep drone; one dryer-buzzer diegetic beat | Done |
| **Three a.m. (Vera at the office)** | sparse piano — think *"Out of Reach"* Gabrels/Smith from the TR soundtrack, or a Chet Baker vocal like *"Almost Blue"* | The closest two people get in the story; one lamp, one pool of light |
| **Pumps (Gary & Denny)** | a badly-tuned country radio *actually in the scene* — Merle Haggard *"If We Make It Through December"* or anything Bakersfield | It's diegetic, it's 2 a.m. radio, and "we were gonna make it" hangs over the glovebox marriage |
| **Interlude (shoebox / watch)** | a single muted-trumpet jazz ballad — Chet Baker *"I Fall in Love Too Easily"* | The only omniscient scene; give it the film's warmest light and its loneliest horn |
| **Rental / David's kitchen** | kettle ticking, nothing else, until the bakery speech — then a faint, wrong dream of a music box lilt | "Six tables and bread in the morning" should sound like a man remembering a life he never got to earn — and it cuts mid-phrase when headlights hit |
| **The yard (killing)** | music cuts out entirely with the screen door. Crickets. The gunshot is the cue. Then: the Zimmer *"You're So Cool"* motif starts its return, sadder, under the bag-in-trunk beats | The theme's first real appearance is at the murder. That's the picture. |
| **The call / Rosa's car** | rain and wipers only | Don't score confessions |
| **Mill lot (the confession)** | long drone that thins to nearly nothing at "I hadn't decided" — then the *"You're So Cool"* motif quietly underneath the last V.O. ("she was going to try to save me") | The motif is now *hers* — and it lands wrong, which is right |
| **Blue Cue 2** | same warped record as Act 1 (same jukebox, same song) — Jack's V.O. even notes it | Deliberate rhyme; the player should feel the joke curdle |
| **The trade (Solomon's office)** | space heater only until "Take the deal off the table" — then, faintly, the Jim Reeves track from the warehouse callback | He softens to a love song both times; his humanity has a playlist |
| **Final diner / She Walks In** | *"You're So Cool"* full statement, from Vera's footsteps to the end | Earn it here, exactly where True Romance does |
| **SHE STAYS (gold)** | the motif keeps playing under "Doors" and the bookend — don't resolve it | The sentence finished; the town didn't |
| **NOBODY'S WITNESS (walks)** | cut the music when the door bell shuts; ten seconds of fan-and-rain; then the cold coffee beat lands dry; let *"You're So Cool"* come in only for the empty-street bookend, minor | He drank the coffee; the melody gets no warmth |
| **A STOPPED WATCH** | no music until Rosa leaves. Then a needle-drop with lyrics — Alabama-level directness: Chris Isaak *"Two Hearts"* (it's literally on the True Romance soundtrack) over the watch-in-hand and the one-figure bookend | You've earned one song that says it out loud |

If licensing is impossible, the synth-composed equivalent is: one 4-note "You're So Cool"-style glockenspiel motif stated broken at the cold open, developed at the mill, stated whole at the final diner — plus the two diegetic country beds (pool hall, pumps) the warped-jukebox audio is already faking.

---

## 5. Beta pass 2 — second sitting, same day

Re-ran the full gate on the production cut: beta harness 12/12 (same 6,086 states / 2,560 plays), `tsc --noEmit` clean, 544/544 engine tests, import/export round trip, preflight, production build, `npm run check` (264/264 playable assets), dev-server boot smoke test.

### 5a. Studio canvas: four scenes stacked at the origin — fixed
`story.layout` had 25 entries for 29 scenes. The continuation/branch nodes added by the earlier fixes — `nwt_diner_take`, `nwt_bluecue_out`, `nwt_bluecue_named`, `nwt_warehouse_out` — had no slot, so Studio rendered them piled at (0, 0). The layout is now a complete 29-slot serpentine in the same visual grammar (left→right then right→left rows, branches trailing their parent, the endings fanning out below Vera). The coldopen/titles/diner cards keep their original slots; everything downstream shifts one row-band to absorb the four new nodes. Player-facing play is unaffected — the in-game route chart is journey-based, not canvas-based.

### 5b. Music wiring — independently re-derived, confirmed, no further changes
The three misalignments this sitting set out to fix (office inheriting the pool-hall jukebox, the walks ending carrying the full motif past the door bell, and the Act 1 diner playing a buried draft-upload bed) were **already corrected by the production pass**: the diner plays `/Midnight in the Rain2.mp3` (track, level 0.45), the office and every dry scene carry explicit `musicMode: "none"`, the jukebox bed lives at `/nwt-bluecue-jukebox.mp3`, the gunshot at `/nwt-gunshot.wav`, and NOBODY'S WITNESS cuts at the door (fade 1.8s). Verified end-to-end against the cue sheet — wiring now matches it exactly, including A STOPPED WATCH going `none` (the engine can't drop a song mid-scene after Rosa leaves; silence is the correct authoring choice). Cue sheet: `docs/nwt-soundtrack.md`.

### 5c. Still open — your call, not defects
1. **The anachronism note (§3.1) is now RETIRED** — see §3.1 for the 2021 dating derivation. Nothing in the text is anachronistic; the comedy stays.
2. **"Doc" surname — resolved.** The rental V.O. used to say "Doc came through on the motel" while every later mention is "Doc Sato" (mill confession, final diner, A STOPPED WATCH). First mention now reads **"Doc Sato came through on the motel"** — one clarifying surname that primes the load-bearing confession; no timeline change (the Tuesday canon is untouched). Closed in the final re-audit sitting.
3. **A STOPPED WATCH** wants the licensed *"Two Hearts"* needle-drop once Rosa leaves; without clearance the scene runs silent (see the cue sheet's licensed-reference table).

---

## 6. Dialogue polish pass (r37, 2026-08-31)

A line-level pass over all 29 scenes — full read-through of every beat (Vera 69, Jack 222, Rosa 43, Solomon 27, Moe 22, Desh 15, David 16, Ted 3, Gary 12, Denny 11, narrator 46). The cut was already in strong register, so the pass stayed surgical: five changes, each fixing a real defect rather than re-styling.

1. **Jack's character card career math corrected — the one plot flaw found.** The card said "Sixteen years a cop", which cannot be true alongside the cut's own canon: Jack is 44; the story states four separate times that he has been a private investigator for sixteen years ("Sixteen years of knowing things for a living", "I put sixteen years on a desk in a room over a feed store", "Sixteen years of files", "Sixteen years I never gave a client up"); and Rosa watched the file stand when he was "twenty-six years old". The only timeline that makes all of those true at once: force 18→28 (ten years), P.I. 28→44 (sixteen), booth 34→44 (ten). Card now reads **"Ten years a cop, ten years a booth."** (David's card was already corrected in the production pass; this was the last card carrying draft-era math.)
2. **Bus-ticket canon.** The three-a.m. show-and-tell read "Nervous is one big withdrawal and a **plane** ticket" while the office read (and the actual plot) is a **bus** ticket — the depot is load-bearing. Now "bus ticket" in both, and the doubled "nervous" tightened.
3. **Diner census disambiguated.** "Four thousand people left, a clinic with a waiting list…" read as though 4,000 people had *departed*; canon (Blue Cue 2: "Blackwood's four thousand people") is that 4,000 *remain*. Now "**What came after:** four thousand people, a clinic with a waiting list…"
4. **Rental V.O. redundancy trimmed.** The duffel V.O. restated what the spoken beat lands a minute later ("You've got Solomon's money in a bag by the door"). The V.O. now reads the bag instead: "I'd have known it blind. Fourteen years is a long time to count a man's money before you take it."
5. **Rosa-duration fix.** "Six years she's been saying some version of it" was arbitrary against an 18-year friendship (she watched the file stand when Jack was 26; he's 44). Now "since before I had a booth" — anchored to canon (the booth is ten years).

### Also closed this pass
- **The §3.1 anachronism note is retired.** Deriving the date from the text's own anchors (mill '09 + "closed when I was thirty-two" + "I'm forty-four") pins the film to **2021**, and every other anchor agrees. The "nineteen ninety-something" recording gag is a period joke, not a mismatch. The best comedy in the picture is untouched.

### Gates (re-run after every edit)
`node scripts/beta/beta-harness.mjs` → **72/72** · `npx tsc --noEmit` → clean · `npm test` → **544/544** + import/export round trip · `npm run check` → 266/266 · `npm run preflight` → passed · `npm run build` → OK. `CONTENT_REVISION` bumped **36 → 37** (`"37": ["nobodys-witness-true"]`) so cached Studio snapshots retire to the new lines.
