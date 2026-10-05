# NOBODY'S WITNESS (FINAL DRAFT) — editorial notes on Scenes 1–2

The final-draft script, added as a brand-new catalogue entry
(`src/data/nobodysWitnessFinal.ts`, id `nobodys-witness-final`). The other
Nobody's Witness versions and the Late Shift family stay in the catalogue
untouched, as instructed. Scenes 1–2 only, True Romance style, Loyal,
Nebraska, October 1994. Part One ends on a fade to black — no ending yet —
with a Part Two note node on the canvas waiting for Scene 3.

## The short version

This is the right version of the piece and it was nearly ready to lock. The
voice is on — hardboiled outside, tender underneath — and Vera is the best
character the project has written: she does comedy and menace in the same
sentence and the "Bullshit" beat lands with zero heat, which is harder than
it looks. The only structural thing Part One still owes the serial form is a
*pulp incident* — a wrong note under the warmth that makes the reader have to
come back. The empty truck is a good image, but right now nothing *happens*
to it.

## What's working (keep verbatim)

- **The opening question.** "You want coffee or you want to tell me why
  you're here?" — character in one line, warm and direct, and it sets up the
  whole scene's dynamic without announcing it.
- **"Everybody's your own personal FBI."** — the thesis line lands as a
  shrug, which is exactly how a thesis should land. It's also the story's
  title given a body.
- **"Bullshit."** — the flat, zero-heat delivery is the correct choice. She
  doesn't accuse him; she files him. That's Vera.
- **The grilled cheese.** "The look of a man who hasn't been asked what he
  wants in a real long time" does the emotional work with a sandwich. Best
  beat in the two scenes. "It's good." — perfect.
- **The two Daryls.** "There's four Daryls. It's a real problem." The town is
  made of jokes like this, and it's why the empty truck at the end can be
  creepy instead of corny: the warmth has to be real first.
- **"One truck. Nobody in it."** — the right closer. Nothing happens, and
  that's the threat. Keep it exactly as written.

## Suggested improvements for the next pass

### 1. Give Part One its pulp incident (the big one)
A pulp serial — 1940s readers or 1994 ones — wants one wrong note *under* the
warmth by the end of part one. The truck is a start, but it's inert; nobody
in it, nothing does anything. Options, cheapest first:
- The truck was already in the lot when Jack walked to Weller's that morning
  — "same make, same spot, different day" — so the empty truck stops being
  atmosphere and starts being *someone's*.
- A beat of engine noise while Vera's talking, and it never pulls in.
- Or commit to the knock (the Late Shift redux proved it works): the truck
  pulls in at close, lights off, and someone knocks on the glass. Don't show
  who. That's your "have to come back" button.

### 2. Ground Vera's omniscience with one tell
She knows he got off the bus Thursday, where he's staying, that he walked
Weller's lot twice. In a grounded scene that's a miracle — and miracles in
noir read as authorial laziness. Plant one cheap thing: in her recognition
beat she glances at the duffel (STATE PROPERTY, stenciled "MORROW, J."), and
that's the fast, small, gone thing in her face. Now "Bullshit" and the
Weller's knowledge are *earned* — she read the name and she remembers the
Morrows. Then her knowledge becomes a question, not a glitch.

### 3. Vera is one flaw short of pulp-proof
She's funny, kind, perceptive, unfazed by prison, philosophically wise.
Perfect characters don't survive a serial. The "Cody" line is the natural
place to let one small human crack show *through* the charm: after Jack
answers, her count of the till goes quiet a half-beat too long before she
pivots. As if the name costs her something too. Now the reader starts asking
whose side that puts her on.

### 4. Let Jack's V.O. earn fewer speeches
"Three years and you forget how to be alone in a room…" is a keeper. But the
walk down Main Street is the place the reel should *ask the player* instead
of narrating: walk past / slow down / stop at the house. Set a flag on the
middle one and let Vera — or Weller, or whoever owns the truck — reference it
in Scene 3 ("Heard you stood on Maple Street a while Monday"). The best V.O.
lines in a reel are the ones the player acts.

### 5. Timeline: one deliberate count
He arrives Thursday morning ("four days"), diner is Monday 6 PM — that math
holds (Thu→Mon is four days). But the closing V.O. says "Five days out." Pick
one number and commit. Also: he's out of Tecumseh and starts at Weller's — a
reader who knows will wonder whether the parole officer (next county over,
in Beatrice) signed off first. One line fixes it.

### 6. Scene 3 must pay the truck immediately
Pulp serials never open the next installment on the answer. However you
resolve it — the truck belongs to Weller, or to the man Jack's brother Cody
owes, or it was never a truck at all — Part Two's first line should be whoever
is on the other side of that glass. Don't cut to the next morning.

### 7. Small line notes
- The tagline uses Vera's "personal FBI" line. Good. Keep.
- "Started at Weller's this morning" is doing a lot of work in one sentence
  — it tells Jack (and us) the job is real. Fine as is; just make sure
  Weller's gets paid off in Scene 3.
- The four-seconds/recognition beats from the other Nobody's Witness
  treatments don't exist here yet — that's correct, this is a fresh start.
  Don't import them.

## Flags already wired for Part Two

- `nwnf_walked_past_the_house` — the Maple Street walk (set on arriving at
  the Royal Inn).
- `nwnf_vera_poured_first` — she poured before he asked, and kept refilling.
- `nwnf_kept_the_story_folded` — Jack never told the story; she pivoted to
  the water tower instead.
- `nwnf_truck_in_the_lot` — end of Part One: one truck, nobody in it.

## Art

Scenes and characters use the existing `nwn-*.jpg` 16:9 plates. Per request,
the four plates that carried stray baked-in magazine text from the first
generation pass were re-rendered clean: `nwn-cover.jpg`, `nwn-diner.jpg`,
`nwn-vera.jpg`, `nwn-daryl.jpg`. Style is gouache/oil pulp-cover with
halftone grain, 1990s rural America, muted sepia/amber — landscape 1365×768.

## Music

- Credits card: `/nobodys-witness.mp3`.
- Scene 2 (the diner): `/Midnight in the Rain2.mp3` — the smoky jazz pad
  underneath the conversation.
