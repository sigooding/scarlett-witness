# THE LATE SHIFT — script notes (Scenes 1–2)

Reimagined pulp, rural noir. Jack Morrow (32, out of Tecumseh Correctional)
comes home to Loyal, Nebraska; four empty days, then a job at Weller's
garage; Monday night he finds the Loyal Diner and Vera Voss.

## What's already working

- **The voice.** Hardboiled on the outside, tender underneath — the hardest
  noir register to pull off. "A name that sounded like a promise nobody
  kept," "missing a place while you're standing in it," "booths are for
  people with somewhere to be after." These are keepers.
- **Vera introduced in motion.** We hear her before we meet her — the
  meatloaf line thrown at the coffee pot. Character-as-force-of-nature,
  established in one stroke. Then she clocks the stranger *without breaking
  stride*. That's textbook.
- **Concrete world-building.** The burned-out R on OYAL INN, the
  PROPERTY OF STATE bag, Billy's pie count, Dale always out by seven,
  the wheat mural nobody believes in anymore. Nothing is described as
  sad; everything *is* sad. That's the difference.
- **The grilled cheese.** "Made by somebody who wasn't thinking about
  making it special" does the entire emotional scene's work with a
  sandwich. Best piece of writing in the two scenes.
- **Research holds up.** Tecumseh Correctional is real (the state prison
  *is* in Tecumseh, NE), and Loyal, NE is a real dot on the map. That
  matters in this register — pulp credibility lives in the specifics.

## Improvements, roughly in priority order

### 1. Give chapter one its pulp incident (the big one)
Right now this is excellent rural character drama *with noir voice but no
noir engine*. A pulp serial — 1940s readers, or modern ones — expects a
body, a debt, or a threat by the end of part one. Scene 2 ends on warmth;
it should end on warmth **with a wrong note under it**:

- a car that circles the diner lot twice while Vera's talking;
- Weller himself in the back booth, who "didn't know Jack was coming in
  tonight" — except he's the man who gave him the job;
- a question Vera asks that she shouldn't know to ask.

The hook into Scene 3 is already sitting in the script: *"The planning was
somebody else's."* That's not backstory — that's the plot. The planner is
the man who owns this town's only garage, or someone sitting at that
counter. End Part One on a knock, not a fade.

### 2. Decide what Vera knows
"I know every face in a thirty-mile radius" — so Vera would clock a
Morrow the second he sits down. Does she know who he is *before* he says
"grew up here"? Two very different stories:

- **she doesn't know** → she's just that warm to everyone, and Jack is
  the one assigning meaning;
- **she knows and doesn't care** → mercy;
- **she knows and is waiting for something** → the planner sent her, or
  she's the planner's daughter, or she has her own score.

Pick one deliberately and plant the tell in Scene 2 (a half-second look
at his duffel; a name she doesn't quite say). The ambiguity is gold, but
it has to be *engineered* ambiguity, not authorial undecidedness.

### 3. Vera's one flaw
She's currently perfect: funny, kind, perceptive, unfazed by prison,
philosophically wise. Perfect characters don't survive pulp. Give her one
edge that's also human: she gossips and it hurts people; she's been
waitressing for eleven years because she's afraid to leave; she drinks
the end of her shift from the wrong cup. The "I can tell when people are
lying" line is the place — let her be *wrong* once, small, in Scene 2, so
we can't be sure about her later.

### 4. Make Jack's V.O. earn fewer speeches
The aphorisms are great, but there are three in a row in Scene 1 and they
blur together. Cut one and convert one into a *choice* — this is an
interactive reel. The childhood house is the perfect spot:

- **Walk past like you said you would.**
- **Slow down. Just look.**
- **Somebody's truck's in the drive. Keep moving.**

Set a flag on the middle one and let Vera — or Weller — reference it in
Scene 3 ("Heard you stood on Maple Street for a while Monday"). In a
reel, the best V.O. lines are the ones the player *acts*.

### 5. The robbery line needs its contradiction to be intentional
"The robbing part was me. The planning was somebody else's. I was just
there." — "just there" and "the robbing part was me" contradict each
other. It's good voice (a con minimizing), but pulp logic means the
listener — Vera — should catch it:

> **VERA:** Robbing part was you, but you were just there. That's a lot
> of man for one sentence, honey.

Then she lets it go. That exchange does three jobs: shows her smarts,
shows Jack's shame, and foreshadows the planner.

### 6. Smaller line notes
- *"Sorry, forgot you were new. Brain's like Swiss cheese today."* — she
  didn't forget; she's running ten stools solo. The line undersells the
  competence the scene just spent two pages building. Either cut it or:
  "New faces get the same service, sugar — I just don't always get the
  name first."
- Vera's "Everything's better when you've been away" speech is the
  story's theme spoken aloud. It works because it's *her* to say it — but
  consider letting half of it surface as Jack's V.O. later, after he's
  earned the feeling. Thesis statements land harder at chapter three
  than chapter one.
- Timeline: he arrives morning with "four days" until Monday; at the
  diner (Monday 6 PM) he says "week." That math works (Tue→Mon is six
  days), but state it on purpose once — and the parole officer is in the
  *next county*; did he check in before Weller's? A parolee starting
  work without the PO sign-off is a detail a reader who knows will
  catch. One line fixes it.
- "PROPERTY OF STATE" on the bag — keep that visible; it's the image
  the engine should turn into a clue item (examine hotspot on the duffel).

### 7. Serial structure
Pulp magazines ran cliffhangers. Part One's last beat should be the
thing the player has to come back for. Suggested ladder:

1. Bus station / town / room (now — atmosphere, isolation).
2. Diner, Vera (now — the human warmth).
3. **The late tow.** Weller's garage, 2 AM. A car comes in that should
   be in a junkyard — and Jack knows the man driving. End on the
   driver's face.
4. The diner off-hours — Vera's real shift, and what she knows.
5. The robbery, three years ago, retold from the wrong end.

## What's in the playable reel now

`src/data/theLateShift.ts`, registered first in the catalogue:

- Title/credits card → bus station → Main Street → Royal Inn sign →
  motel room → the Loyal Diner (three linked scenes) → Part One end card.
- Player choices wired in Scene 2: **grilled cheese vs. meatloaf** (both
  fully written with Vera reactions) and **"staying for Weller's" vs.
  "just passing through"** (Vera answers differently; the passing-through
  branch gets the callback "nobody orders a second cup to pass through").
- Flags are recorded for every branch (`ls_took_the_grilled_cheese`,
  `ls_said_staying`, `ls_told_vera_just_passing`, `ls_told_vera_robbery`)
  so Scene 3 can recall what the player did.
- A standalone note node `ls_scene3_note` sits on the Studio canvas with
  the Scene 3 hook written on it — wire its right handle into Scene 3
  when written; it bypasses in play until then.
- Art: pulp paperback–style painted plates for every scene plus Jack and
  Vera character portraits (`public/img/ls-cover.jpg`, `bg-ls-*.jpg`,
  `ch-ls-jack.jpg`, `ch-ls-vera.jpg`).
- sepia-pulp HUD theme, pulp display type, letterbox frames, low-drone
  ambience in Scene 1 giving way to the smoky jazz pad in the diner.
