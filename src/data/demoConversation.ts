import type { Story } from "../types";

/**
 * DEMO 1 — "THE CONVERSATION LAB"
 * ───────────────────────────────
 * A five-scene teaching case for PEOPLE & DIALOGUE. Every scene's 📝 note
 * (visible on the Studio canvas node card, and editable in the Scene tab's
 * "Author note" box) walks a new author through exactly how the scene was
 * built in Studio, step by step.
 *
 * Teaches:
 *   · Characters (People tab) — avatar, role, trust meter
 *   · Dialogue beats — speakers, lines, expression, the reserved "narrator"
 *   · REPLY choices (💬) — answer in place + a flag, instead of navigating
 *   · Hidden sequential choices — questions appear one at a time
 *   · memoryLog tags + DialogueBeat.recalls — the NPC remembers YOUR words
 *   · presentItem verb — show a clue; the beat reacts and names it ({said})
 *   · rememberLine — the "… will remember that" card
 *
 * Studio path: 🎬 Open Studio Editor → pick "Demo Lab: Conversation" in the
 * story dropdown → press ▶ Play (or click a scene and "▶ Play from here").
 */
export const DEMO_CONVERSATION: Story = {
  id: "demo-conversation-lab",
  title: "Demo Lab: Conversation",
  tagline: "A teaching scene on dialogue — replies, memory, and showing evidence.",
  coverImage: "gradient:linear-gradient(160deg,#140b1e 0%,#1d0c22 55%,#07070c 100%)",
  startSceneId: "dc_office",
  layout: {
    dc_office: { x: 40, y: 220 },
    dc_sidle: { x: 440, y: 60 },
    dc_club: { x: 440, y: 220 },
    dc_evidence: { x: 440, y: 400 },
    dc_alibi: { x: 880, y: 40 },
    dc_ending_gold: { x: 1300, y: 140 },
    dc_ending_cold: { x: 1300, y: 340 },
  },
  briefing: {
    objective: "Learn the dialogue tools by talking to Frankie: reply in place, get remembered, and show evidence.",
    winConditions: [
      "Find the envelope on the desk and PRESENT it to Frankie.",
    ],
    loseConditions: [
      "Walk out without showing the evidence.",
    ],
  },
  flagNotes: {
    dc_asked_soft: "You opened the interview softly (smooth line).",
    dc_asked_hard: "You opened the interview with a hard press.",
    dc_asked_shadow: "You asked about the man in the shadow of the bar.",
    dc_showed_envelope: "You showed Frankie the envelope before leaving.",
    dc_alibi_broken: "You caught Frankie in a lie with the register slip.",
  },
  characters: [
    {
      id: "dc_frankie",
      name: "Frankie Voss",
      role: "Club bookkeeper — knows more than he says",
      avatarUrl: "emoji:🎩",
      trustMeter: 0,
      voice: { pitch: 0.95, rate: 1.0 },
    },
  ],
  items: [
    {
      id: "dc_envelope",
      name: "Sealed Envelope",
      icon: "✉️",
      description: "A cream envelope with Frankie's name on the flap, sealed with black wax.",
      flavorText: "It was sitting on the desk like it was meant to be found.",
      isClue: true,
    },
    {
      id: "dc_slip",
      name: "Bar Register Slip",
      icon: "🧾",
      description: "A carbon-copy register slip: two drinks and a phone call logged to Frankie's tab at 2:07 a.m.",
      flavorText: "Says he was standing right here. Last night. At the hour he claims he was home.",
      isClue: true,
    },
  ],
  scenes: [
    /* ── SCENE 1 ───────────────────────────────────────────────────── */
    {
      id: "dc_office",
      title: "The Rainy Office",
      note:
        "STEP 1 — YOUR FIRST SCENE. ① ＋Scene to add a node; click it, open the Scene tab. " +
        "② Set Title 'The Rainy Office'. ③ Background → Image picker → choose bg-office.jpg (or any art). " +
        "④ Ambient audio → 'rain' synth. ⑤ Type the PROSE — it types in on arrival. " +
        "⑥ The hotspot: Hotspots tab → ＋, drag the zone over the desk, cursor 'take', action 'Give item' → Sealed Envelope, tick 'Show item image in zone'. " +
        "⑦ Choices tab: the three exits are plain NAVIGATION choices — drag each handle to the scene it goes to, and tag each with an ATTITUDE (Sultry=Charm, Aggressive=Press, Clever=Deduce). " +
        "Run ▶ Play and click the glowing envelope before you leave.",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "Rain streaks the office window. On your desk sits a sealed cream envelope with Frankie Voss's name on the flap — evidence, waiting to be pocketed. Downstairs, the club is open and Frankie is holding court at the bar.\n\nThree ways to walk up to him. Pick your opening.",
      dialogueBeats: [],
      hotspots: [
        {
          id: "dc_hs_envelope",
          label: "Sealed envelope on the desk",
          bounds: { x: 34, y: 52, w: 18, h: 22 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "dc_envelope" },
        },
        {
          id: "dc_hs_slip",
          label: "A carbon-copy register slip tucked under the blotter",
          bounds: { x: 8, y: 58, w: 14, h: 18 },
          cursor: "take",
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "dc_slip" },
        },
      ],
      choices: [
        {
          id: "dc_go_smooth",
          text: "Saunter down and buy him a drink first (Charm).",
          targetSceneId: "dc_sidle",
          attitudeTag: "Sultry",
        },
        {
          id: "dc_go_direct",
          text: "Walk straight up and lay into him (Press).",
          targetSceneId: "dc_club",
          attitudeTag: "Aggressive",
        },
        {
          id: "dc_go_clever",
          text: "Watch from the corner first, then approach (Deduce).",
          targetSceneId: "dc_club",
          attitudeTag: "Clever",
        },
      ],
    },

    /* ── SCENE 2 — charm opening (reply + flag + hidden chain) ──────── */
    {
      id: "dc_sidle",
      title: "Buying the First Round",
      note:
        "STEP 2 — REPLY CHOICES (answer in place). ① Dialogue tab → add beats: speaker Frankie Voss. " +
        "② Choices tab → add a choice, tick the 💬 REPLY box so it does NOT navigate. " +
        "③ In Consequences → Set flag: dc_asked_soft. ④ Add Frankie's RESPONSE as another dialogue beat with a CONDITION RULE (the little gate icon on the beat) → Requires flag: dc_asked_soft. The beat stays hidden until the reply lands. " +
        "⑤ The follow-up question is a second reply choice ticked HIDDEN (the eye icon) — it doesn't appear until you ask the opener. " +
        "⑥ 'You remembered' works via the last choice's memoryLog tag 'dc_opening_line' — see the club scene's note.",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "You slide onto the stool next to Frankie Voss like you belong there and order two of whatever he's having. He watches you over the rim of his glass, amused.",
      dialogueBeats: [
        {
          id: "dc_sidle_f1",
          characterId: "dc_frankie",
          expression: "amused",
          text: "Well, well. You don't look like the usual entertainment. You buying, detective, or just decorative?",
        },
        {
          id: "dc_sidle_f2",
          characterId: "dc_frankie",
          expression: "warming",
          conditionRule: { requiresFlags: ["dc_asked_soft"] },
          text: "Ha! A drink AND a sense of humour. Maybe I do remember a thing or two. Ask me something worth answering.",
        },
        {
          id: "dc_sidle_f3",
          characterId: "dc_frankie",
          expression: "cagey",
          conditionRule: { requiresFlags: ["dc_asked_shadow"] },
          text: "The man by the jukebox? Didn't see him. Never see anybody in here, me. …But a sealed envelope says a lot more than I can. You got one, show it.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dc_sidle_reply_soft",
          text: "💬 \"Just thirsty. And curious about a name in your books.\"",
          reply: true,
          attitudeTag: "Sultry",
          memoryLog: "dc_opening_line",
          consequences: { setFlags: ["dc_asked_soft"], trustChanges: [{ characterId: "dc_frankie", delta: 1 }] },
        },
        {
          id: "dc_sidle_ask_shadow",
          text: "💬 \"Who's the gentleman watching us from the shadow by the bar?\"",
          reply: true,
          attitudeTag: "Neutral",
          hidden: true,
          consequences: { setFlags: ["dc_asked_shadow"] },
        },
        {
          id: "dc_sidle_to_evidence",
          text: "Let him see you have something to show him.",
          targetSceneId: "dc_evidence",
          attitudeTag: "Neutral",
          hidden: true,
          gating: { requiresFlags: ["dc_asked_soft"] },
        },
      ],
    },

    /* ── SCENE 3 — direct opening + MEMORY RECALL ───────────────────── */
    {
      id: "dc_club",
      title: "The Club Floor",
      note:
        "STEP 3 — NPCs REMEMBER WHAT YOU SAID. The first beat here has a RECALL (Dialogue tab → 'Memories recalled'): key = the memoryLog tag dc_opening_line from scene 2; the recall text uses {said} to echo your EXACT line. " +
        "Arrive from the Press or Deduce choices and Frankie answers the opening normally; arrive via the Charm route and he quotes you back — the flag isn't enough, the memory is. " +
        "Also note: both attitude-tagged entrances set their own flag (dc_asked_hard etc.), which the ending scene reads.",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "The club is smoke and low brass. Frankie Voss holds court at the bar, and the moment you close the distance his smile gets careful.",
      dialogueBeats: [
        {
          id: "dc_club_f1",
          characterId: "dc_frankie",
          expression: "guarded",
          text: "Straight to it, huh? I admire that in a person. Almost as much as I distrust it.",
          recalls: {
            dc_opening_line:
              "He grins, slow. \"{said}\" — yeah, I remember how you walked up. Smooth as the house bourbon. Alright. You've earned a straight answer.",
          },
        },
        {
          id: "dc_club_f2",
          characterId: "dc_frankie",
          expression: "pointing",
          text: "Here's the thing, detective: talk is free in my place, but it don't prove nothing. If you've got paper on me — an envelope, a ledger page, a photograph — you put it on the bar. Otherwise we're just two people enjoying the music.",
        },
        {
          id: "dc_club_lie",
          characterId: "dc_frankie",
          expression: "shrugging",
          text: "And don't go looking for me in any of this. Last night? I was home in my rooms by eleven, door locked, stone cold sober. Didn't come near the club. Ask anyone.",
          // PRESS THE LIE: the 🎯 button appears on this line. The player must
          // produce the register slip (or be wrong and lose the chance).
          lie: {
            claim: "Frankie claims he was home by eleven and never came near the club last night.",
            evidenceItemIds: ["dc_slip"],
            contradictedFlag: "dc_alibi_broken",
            caughtBeat: {
              id: "dc_club_lie_caught",
              characterId: "dc_frankie",
              conditionRule: { requiresFlags: ["dc_alibi_broken"] },
              text: "He reads the carbon slip twice, and the smile drains out of him. \"…two drinks and a phone call, two-oh-seven. That's my tab. My HANDWRITING.\" He sets it down slow. \"Alright, detective. You didn't just walk in here — you walked in READY. What do you want to know?\"",
            },
            wrongBeat: {
              id: "dc_club_lie_wrong",
              characterId: "dc_frankie",
              text: "He doesn't even look at it. \"An envelope with my NAME on it? I've got a hundred of those. That doesn't put me in the bar last night. Try again with something that actually means something — if you've got it.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "dc_frankie", delta: 2 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "dc_frankie", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Frankie Voss knows you've caught him in a lie.",
          },
        },
        {
          id: "dc_club_after_lie",
          characterId: "dc_frankie",
          expression: "guarded",
          conditionRule: { requiresFlags: ["dc_alibi_broken"] },
          text: "You want the truth? Fine. The twelfth, the money, the man by the jukebox — that's a conversation for the back booth, not the bar. Come on. You've earned it.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dc_club_press",
          text: "\"The books, Frankie. Tonight.\" (+heat, opens hard)",
          targetSceneId: "dc_club",
          attitudeTag: "Aggressive",
          reply: false,
          consequences: { setFlags: ["dc_asked_hard"], meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "dc_club_to_alibi",
          text: "\"Home by eleven, were you?\" — corner him about last night.",
          targetSceneId: "dc_alibi",
          attitudeTag: "Clever",
        },
        {
          id: "dc_club_to_evidence",
          text: "Reach into your coat — you've got paper to show.",
          targetSceneId: "dc_evidence",
          attitudeTag: "Clever",
        },
      ],
    },

    /* ── SCENE 3b — PRESS THE LIE (contradiction verb) ─────────────── */
    {
      id: "dc_alibi",
      title: "The Alibi",
      note:
        "STEP 3b — PRESS THE LIE (the contradiction verb). This beat's line is a FALSE CLAIM and carries a 🎯 'Press the Lie' panel (Dialogue tab → beat → '🎯 Press the Lie'). " +
        "① Tick 'This line is a lie the player can catch'. ② Pick the BREAKING EVIDENCE — here the Bar Register Slip (the office hotspot gives it; without it the player has nothing to show). " +
        "③ Write the CAUGHT reaction — it auto-gates on the caught flag, so it only plays when the right evidence lands. ④ The WRONG line + wrong consequences fire on a bad guess, and after the wrong-limit they shut down. " +
        "▶ Play: take BOTH clues from the office, hit 🎯 on Frankie's alibi, and present the register slip — the envelope is a deliberate red herring.",
      background: "/img/bg-club.jpg",
      ambientAudio: "tension",
      prose:
        "The bar noise drops around the two of you. Frankie polishes the same glass he's polished all night and gives you an answer he's had ready since before you walked in.",
      dialogueBeats: [
        {
          id: "dc_alibi_claim",
          characterId: "dc_frankie",
          expression: "easy-smile",
          text: "Last night? Home by eleven. Door locked, radio off, all alone. You can check — there's not a slip of paper in this city puts me near the club after midnight.",
          lie: {
            claim: "Frankie says he was home by eleven with nothing to put him near the club.",
            evidenceItemIds: ["dc_slip"],
            contradictedFlag: "dc_alibi_broken",
            caughtBeat: {
              id: "dc_alibi_caught",
              characterId: "dc_frankie",
              conditionRule: { requiresFlags: ["dc_alibi_broken"] },
              text: "His eyes lock on the carbon slip. He goes very still. \"Two-oh-seven a.m. Two drinks. A phone call.\" A breath. \"That's my handwriting.\" He folds the rag slowly. \"You actually DID your homework. The back booth, detective. Before I change my mind.\"",
            },
            wrongBeat: {
              id: "dc_alibi_wrong",
              characterId: "dc_frankie",
              text: "He smirks. \"A wax envelope? Sweetheart, half the city's got my name on paper. That doesn't put me at this bar at two in the morning. Bring me something with a TIME on it, or sit down and drink.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "dc_frankie", delta: 2 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "dc_frankie", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Frankie Voss knows you've caught him in a lie.",
          },
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dc_alibi_caught_to_evidence",
          text: "Take him to the back booth.",
          targetSceneId: "dc_evidence",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["dc_alibi_broken"] },
        },
        {
          id: "dc_alibi_cold",
          text: "Leave him to his glass and walk.",
          targetSceneId: "dc_ending_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── SCENE 4 — PRESENT ITEM + rememberLine ──────────────────────── */
    {
      id: "dc_evidence",
      title: "Put It on the Bar",
      note:
        "STEP 4 — THE PRESENT VERB (show an item). ① Choices tab → add a choice. ② Tick 'PRESENT item' and pick the Sealed Envelope. The engine auto-locks it until the item is in the satchel (try ▶ Play without taking it from the office — the choice isn't there). " +
        "③ 'Hands item over' is left UNticked here, so you flash it and keep it; tick it and the item leaves inventory. " +
        "④ rememberLine = 'Frankie Voss will remember that.' — the impact card after the choice. " +
        "⑤ The response beat is gated on dc_showed_envelope, which the present choice sets automatically. The {said} in the recall would print the ITEM NAME.",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "tension",
      prose:
        "The back booth is quiet. Frankie folds his hands on the table and waits. Whatever you came in with, this is where it goes on the record.",
      dialogueBeats: [
        {
          id: "dc_ev_narr",
          characterId: "narrator",
          text: "Present choices are greyed out — actually hidden — until you hold the item. The hotspot back in the office put it in your satchel; this is the payoff.",
        },
        {
          id: "dc_ev_f1",
          characterId: "dc_frankie",
          expression: "stunned",
          conditionRule: { requiresFlags: ["dc_showed_envelope"] },
          text: "That's my seal. Black wax, see — I've not used it in three years. You didn't just walk in here, detective. You walked in PREPARED. Alright. Ask me anything.",
        },
        {
          id: "dc_ev_f2",
          characterId: "dc_frankie",
          expression: "relenting",
          conditionRule: { requiresFlags: ["dc_showed_envelope"] },
          text: "The books say the money went out the night of the twelfth. The man by the jukebox carried it. That's the name you want. Now get out before he remembers your face.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dc_ev_present",
          text: "Pull out the sealed envelope and lay it on the table.",
          targetSceneId: "dc_ending_gold",
          attitudeTag: "Clever",
          presentItem: "dc_envelope",
          consumePresentedItem: false,
          rememberLine: "Frankie Voss will remember that.",
          consequences: { setFlags: ["dc_showed_envelope"] },
        },
        {
          id: "dc_ev_leave",
          text: "Keep the envelope in your coat and walk out.",
          targetSceneId: "dc_ending_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── ENDING 1 — gold ────────────────────────────────────────────── */
    {
      id: "dc_ending_gold",
      title: "Case Closed — A Name on the Bar",
      isEnding: true,
      note:
        "STEP 5 — ENDINGS. Mark the scene 🏁 End (right-click → Add end scene, or the 'Is ending' toggle), then fill Ending Data: tier GOLD, a headline, and a recap. " +
        "The end screen shows the route chart automatically. The gated choice below only appears if you asked the soft question — different players see different end beats for free.",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "Frankie watches you pocket the envelope again. Somewhere a glass is set down a little too hard. The name's in your head now; the night is yours.",
      dialogueBeats: [
        {
          id: "dc_end_g1",
          characterId: "dc_frankie",
          expression: "farewell",
          conditionRule: { requiresFlags: ["dc_asked_soft"] },
          text: "Buy a girl a drink first, show the paper second. You're alright, detective. Come back when you've got something else to wave around.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE NAME ON THE BAR",
        recap:
          "You learned the dialogue toolkit: a reply choice that answered in place, a hidden follow-up that appeared on cue, a memory that quoted your own line back, and a present-item verb that only worked because you'd earned the clue.",
      },
    },

    /* ── ENDING 2 — game over ───────────────────────────────────────── */
    {
      id: "dc_ending_cold",
      title: "Case Closed — The Unopened Envelope",
      isEnding: true,
      note:
        "Every branch should end somewhere — the Studio Check flags dead ends. This is the GAME OVER tier for walking out without showing evidence. " +
        "You also need at least one ending of each tier you reference; the win/lose panel (🗂 Win/Lose tab) is where you write the objective the player sees.",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "none",
      prose:
        "The envelope stays in your coat. Frankie watches the door swing shut behind you and says nothing at all. Some cases end with a name — this one ends with a seal you never broke.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "UNOPENED",
        recap:
          "Evidence only works if you present it. Replay and take the envelope from the office desk, then use the PRESENT choice at the back booth.",
      },
    },
  ],
};
