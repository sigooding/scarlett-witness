# Songs for the silence — Nobody's Witness

16 October 2026. Where the film is dry, what each dry stretch needs, and five lyrics to work from.
**Nothing here is wired in.** Every placement below is a one-line change in `src/film/studio-edits.json`
plus `node tools/build-film-story.mjs`.

**The rule that governs all of it:** no saxophones, anywhere (`CLAUDE.md`). That includes sax-like synth
leads and "smoky" pads. Everything below uses piano, strings, guitar, bass, glockenspiel, harmonium and
voice instead.

---

## 1. What the film plays now

The music is not evenly spread — it comes in blocks, and the blocks are the film's structure:

| Where | What plays |
|---|---|
| Titles | *Nobody's Witness* (house theme) |
| 1–2 | *Glimmering Haze*, looping |
| 4 | *It ain't easy* (through the wall) |
| 18 (+ montage) | *Dark Hills Blues* |
| 39–49 | *Hounds* (the inn raid) |
| 52–53 (+ montage) | *Dark Hills Blues* |
| 65 | *It ain't easy* (the neighbour's radio) |
| 66–71 | *Bad Guy* (piano) |
| 72–77 | *Bad Guy* (the song) |
| 82 | *Baby Fool* |
| 85–92 | *Coins Measure Time* (the raid on the Hive) |
| 97A | *What Made You, You* (Mara's service) |
| 100 + credits | *The Show* |

Everything else is dry. The dry runs, in order of how much film they are:

| Run | Scenes | The film it covers | Words |
|---|---|---|---|
| **19–38** | 20 | the Hive act: the storeroom, Mara, the drawing, breakfast, Mrs Sakai, the road, the inn, the payphone | ~20,000 chars |
| **5–17** | 12 | the interview room, the detectives' room, Jack's office, the bar, the apartment, Kaneko's counter | ~21,000 chars |
| **54–64** | 11 | the kiosk, "they match", nine o'clock, the crossing, the lockers, the bar | ~8,400 chars |
| **78–84** | 7 | the envelope, her father's handwriting, the newsroom, "it's just a face" | ~8,300 chars |
| **93–96** | 4 | the sedan, the lit window, taillights, the empty chair | ~1,200 chars |
| **98–99A** | 2 | the rooftop, the Hive coming down | ~3,500 chars |
| 50–51 | 2 | the hand shaking, the model corrected | ~1,200 chars |

## 2. The doctrine, and where it should bend

The film already uses silence as a cue — the confessions and the killing play dry on purpose, and
`docs/nwt-soundtrack.md` records that logic for the other cut. That is right for **5–17** and **50–51**,
and I would not change either. The interview room is the strongest scene in the picture partly because
there is nothing under it; put a ballad there and it becomes television.

The three runs that are actually a *problem* are the ones where the silence is not a choice but a gap:

* **19–38** — twenty scenes of the film's world with no score at all, and the biggest emotional surface
  in the picture (Mara's nights, the drawing, Mrs Sakai, the drive).
* **54–64** — eleven scenes of waiting, ending on "Not another day". A countdown with no tick.
* **98–99A** — the resolution. It currently comes out of a song (the service), sits dry, and hands over to
  *The Show* at 100. The ending should have its own music, not a hand-off.

So: **four songs and two or three instrumentals**, placed as *runs* rather than beds, so the words land on
the pictures that earn them, and the silence returns where it belongs.

## 3. Recommendations at a glance

| Run | Cue | Type | Why there |
|---|---|---|---|
| 19–26 | **"Slower"** — song | communal folk-noir processional, 6/8, ~66 BPM, A minor | It is the Hive's own voice, and it pays off the prologue's "we are just slower" |
| 20–25 | **"You Have His Face"** — song | music-box ballad, 3/4, ~76 BPM, E minor | The two sisters; plants the motif the service song answers at 97A |
| 30–38 | **"Twenty Years of Januaries"** — song | winter duet, 4/4, ~70 BPM, D minor | The road, the receipts, the pink payphone — Jack and Vera waiting in two different ways |
| 54–64 | **"Nine O'Clock"** — instrumental | ticking, patient, one held organ note | The countdown; a third ballad here would turn the middle into a musical |
| 78–81 | **"No Name"** — instrumental | low pulse, bowed bass, tape hiss | Jack walking the city with a dead man's notebook |
| 93–96 | **"Taillights"** — instrumental | the chorus motif on glockenspiel, slowed and detuned; no drums | The betrayal; ends on one struck note for the empty chair |
| 98–99A | **"The Rain Has Stopped"** — song | the theme at last in the light, 4/4, ~84 BPM | The promise kept; nothing triumphant, an exhale |
| 5–17, 50–51 | *nothing* | — | Silence is the cue. Optional single-note texture under 6 and 10 only if the rooms test dead in the mix |

Levels, to match the film: beds 0.2–0.35 (*Glimmering Haze* is 0.3), songs 0.8–0.9 (*Coins* is 0.9,
*What Made You, You* is 0.85), radios 0.48. A song that carries silent pictures should be a `soundtrack`
run (the mechanism *What Made You, You* and *Coins Measure Time* already use: timed nodes, `musicLoop:
false`, fade out on the node after the run). A song under spoken lines should be a scene bed at 0.3 and
instrumental at that point.

---

## 4. The lyrics

### 4.1 "Slower" — for 19–26 (the Hive)

*Type:* a work song, not a musical number. Male lead (the film's narrator register: worn, plain, close),
joined on the last chorus by a low mixed choir — the neighbours, not a gospel choir. Upright bass, felt
piano, a single frame drum, low strings, one harmonium pad. Starts with bass and voice alone.
*Suno prompt:* "slow 6/8 folk-noir processional, warm male baritone, upright bass, felt piano, frame drum,
low strings, small neighbourhood choir on final chorus, no saxophone, restrained, 66 bpm, minor key".

**VERSE 1**
We put a room on for a daughter,
a shop on for a brother,
a stair that goes where nobody planned,
a balcony bolted on a balcony.

**CHORUS**
We are slower, we are slower,
slower than the cranes, slower than the rain.
We are slower, we are slower —
we were busy, we were here, we are not gone.

**VERSE 2**
A bulb that hums above the flour,
a spanner laid against the stove,
a plank across the gap,
a hand that holds it till the last of us is over.

**CHORUS**

**BRIDGE**
The city grew up around us
and forgot that we were here.
All right. All right.
We were busy. That's all right.

**FINAL CHORUS** *(choir in)*
We are slower, we are slower,
slower than the cranes, slower than the rain.
We are slower, we are slower —
one rap on the pipe means clear.

*Notes:* the last line is the Hive's own alarm (86, 382), sung before the raid — a small knife. Keep
the choir low and untrained-sounding; this should sound like people who know each other.

### 4.2 "You Have His Face" — for 20–25 (the storeroom nights)

*Type:* a lullaby, female voice (Vera's register — plain, airy, no big notes, almost spoken in the verse).
Glockenspiel/celesta carrying the house motif in a broken form, nylon-string guitar, harmonium, low
strings. Nothing percussive.
*Suno prompt:* "slow 3/4 lullaby ballad, soft female voice close-mic'd, music box and celesta, nylon
guitar, harmonium, low strings, no drums, no saxophone, 76 bpm, minor key, intimate".

**VERSE 1**
He wrote one line and put it in the post;
you read it once and put it in the bin.
I fished it out and read it on the stair —
*you have his face*, he wrote, *you have his face*.

**CHORUS**
You have his face, you have his name,
you have the stubborn hands, the going-quiet.
Whatever they say about him now,
you have his face. Keep it. Keep it.

**VERSE 2**
A drawing done from floor level, 1:07,
a stool going over, an outflung hand,
two pairs of shoes, a crate of bottles,
and in careful capitals: excuse me.

**BRIDGE**
Rice on both hands, four years old.
You bossed me round my own kitchen.
Liar — the clip was mine —
keep it anyway. Keep it.

**CHORUS**

*Notes:* this is the motif that *What Made You, You* answers at 97A — quote this song's first three notes
in that score and the service stops being a separate piece of music and becomes the answer to this one.
The bridge is scene 98's exchange, sung early, so the ending lands as an echo rather than a twist.

### 4.3 "Twenty Years of Januaries" — for 30–38 (the road)

*Type:* a duet that never quite becomes a duet — Jack's verses low and dry, Vera's chorus from a phone
line (slight band-pass, as if she is on the other end). Fingerpicked guitar, upright bass, brushed kit,
pedal steel *without* slide theatrics, harmonium. Winter country-noir; think a hymn played by people who
have never been in a church.
*Suno prompt:* "winter country-noir ballad, male baritone verse and female chorus, fingerpicked acoustic
guitar, upright bass, brushed drums, pedal steel, harmonium, no saxophone, 70 bpm, D minor, sparse".

**VERSE 1** *(Jack)*
Every January, cash in an envelope,
left on a step for twenty years.
Last month he wrote a letter in English
and made her check the spelling of the words.

**PRE-CHORUS**
Twenty years of Januaries,
twenty years of paper envelopes.

**CHORUS** *(Vera, on the line)*
Come back safe.
It's just an inn, an old couple, a baseball game.
Come back safe anyway.
Come back safe anyway.

**VERSE 2** *(Vera)*
I keep the phone face up beside the cold tea.
I call and listen to you not be there.
The coins run out. The line goes dead.
I hold on a moment longer than I need.

**PRE-CHORUS / CHORUS**

**BRIDGE** *(both, overlapping)*
Neither of us hangs up.
Neither of us hangs up.
Twenty years of Januaries —
neither of us hangs up.

**CHORUS** *(Jack answers it, late, under her line: "come back safe anyway…")*

*Notes:* place the bed on 34 ("Twenty years of Januaries" — Sakai's receipts), and let the run carry
35–36 so the chorus lands on the pink payphone. Scene 36's last beat is the coins running out; the song
should be down to guitar and voice by then.

### 4.4 "The Rain Has Stopped" — for 98–99A (the rooftop)

*Type:* the theme, whole, in daylight for the first time — the way *You're So Cool* logic works in the
film it is standing next to: broken at the titles, wrong in the middle, whole here. Glockenspiel motif
played plainly, piano, warm strings, small wordless "ah" choir under the last chorus. Jack and Vera
alternate the verses; both on the final chorus, no harmony showpiece — one line each, overlapping.
*Suno prompt:* "gentle cinematic ballad, two voices, glockenspiel motif, felt piano, warm strings,
wordless choir, no saxophone, 84 bpm, resolving but not triumphant".

**VERSE 1** *(Jack)*
The rain has stopped.
The sky is pale and washed and enormous.
The trains go past at eye level
and the roof holds a lake of light.

**CHORUS**
He left a note. It says he acted alone.
That's what the police say it says.
Put the clip in your hair, put the money down,
and let the city go on.

**VERSE 2** *(Vera)*
You told me you were with her at the end.
You told me everything, when it was over.
I said the clip was mine for twenty years —
liar. Keep it. It was always mine.

**BRIDGE** *(both)*
Nobody looks up at the news.
The bottles tick against each other and settle.
A space beside a bowl, filled.

**FINAL CHORUS** *(both, one line each, overlapping)*
He left a note. Let the city go on.
Let the city go on.

*Notes:* resolve to instrumental for its last eight bars so 99A (the Hive coming down) has room, then end
it before the credits and let *The Show* take over at 100. Do not crossfade the two: the silence between
them is the last thing the film says.

---

## 5. If you want a fifth song: "Twenty Years of Silence" (for 5–17)

I would not put this in the film, and I have written it anyway in case the interview room tests dead in
the mix. If it goes anywhere, it goes under scene 10–11 (Jack's office, the two men laughing) as a bed at
0.25, never under 6.

*Type:* a monologue with a band — almost spoken, 60 BPM, felt piano, bowed bass, tape hiss, one sustained
organ note low in the mix, no reverb on the voice.
*Suno prompt:* "spoken-word noir monologue over sparse piano and bowed bass, close dry male voice, tape
hiss, low sustained organ, no drums, no saxophone, 60 bpm, very restrained".

**VERSE 1**
Twenty years of silence sit behind his eyes.
He was the only foreign face on the force.
Japanese papers, American face,
a cheap suit in a room with no windows.

**CHORUS**
What did you do? What did you find?
Nothing that anybody signed.
Nothing a court would ever take.
Twenty years of silence — I can wait.

**VERSE 2**
Nobody comes here who isn't lost.
The building is listening. It always is.
He puts down a little more than the bowl costs
and a card on top of it, and goes.

---

## 6. The instrumental cues (no lyrics)

1. **"Nine O'Clock"** (54–64) — a metronome-strict left hand on piano, brushed kit, a bass walking at
   half speed, one organ note held through the whole run. A wordless female hum of the house motif the
   first time the signal chimes (62). ~3 minutes; loops once; must never resolve — the run ends on
   "Not another day".
2. **"No Name"** (78–81) — bowed bass, tape hiss, a low synth pulse, occasional single piano notes
   minutes apart. For Jack walking the city with the notebook. No melody: it is a mood, not a tune.
3. **"Taillights"** (93–96) — the house motif on glockenspiel, slowed to half speed and pitched down a
   tone, over a low drone; no drums. It ends on a single struck note held while the young detective looks
   at the empty chair and the clock that runs a minute fast. If you only make one instrumental, make
   this one: it is the film's coldest scene and it currently has nothing.

## 7. Practical notes for wiring any of this in

* **A song that must carry silent pictures** (the service, the raid, *Bad Guy*) is a `soundtrack` run in
  `src/film/studio-edits.json`: `from`/`to` scenes, `musicUrl`, `seconds` (the song's true length),
  `captions` for the silent shots, `stopBefore` if the last scene should finish click-through. The
  builder stretches the caption shots to fit the song and the node after the run fades it out.
* **A song under a scene** is a scene edit: `musicUrl`, `musicLevel`, `musicFadeSeconds`,
  `musicLoop: false` (so a finished song never restarts), and the *next* scene's `musicMode: "none"` to
  end it where you want it ended.
* One bed per scene; **no mid-scene needle-drop**. If a cue must start halfway through a scene, the scene
  splits into a continuation node (`_b`) — which 65 already does for the radio.
* The animatic export and the game use the same cues, so anything wired here plays in both; a scene's
  `readPace` is unaffected.
* Keep the credit honest: the titles and end credits already carry *"All music written by Scott Gooding ·
  enhanced with suno.ai"*. Originals avoid the clearance problem entirely — the licensed energies in
  `docs/nwt-soundtrack.md` are for the other cut, not this film.
* **Nobody has listened to any of this.** These are words and arrangements to react to, not a finished
  score; the levels and the run boundaries above are proposals.
