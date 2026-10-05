import type { Story } from "../types";

/**
 * DEMO LAB — "PRESS THE LIE" (the contradiction verb)
 * ───────────────────────────────────────────────────
 * A short, self-contained teaching case for the 🎯 PRESS THE LIE mechanic.
 * Every scene's 📝 note (on the Studio canvas card, editable in the Scene
 * tab's "Author note" box) walks a new author through how it was built.
 *
 * The fantasy: a suspect, MARA VELLE, gives you a ready-made alibi. You've
 * already SEARCHED her office and are carrying three things — but only ONE
 * of them breaks each lie. Holding a clue is not enough; the player has to
 * pick the clue that actually MATTERS.
 *
 * Teaches, in order:
 *   1. THE SETUP — collect the evidence (search hotspots → Give item).
 *   2. LIE ONE (a standalone contradiction on a dialogue beat):
 *      beat.lie → the 🎯 button, the breaking evidence, the caught beat,
 *      the bluff-called line, wrong-evidence limit, trust/heat swings.
 *   3. LIE TWO (a contradiction INSIDE an interrogation): the same verb
 *      with `composureDamage`, so proving the lie shatters her composure
 *      and cracks her open using the existing crack/clamp machinery.
 *
 * Design notes a new author should copy:
 *   · Only name the item(s) that ACTUALLY prove the claim as breaking
 *     evidence. Everything else in the satchel is a bluff she calls —
 *     that's what makes the player reason instead of click.
 *   · The CAUGHT beat is gated on the lie's caught flag, so it only plays
 *     when the player wins it (the engine splices it in right after the
 *     claim). The Check tab warns if you forget the gate.
 *   · Wrong guesses cost trust/heat and, after the limit, shut the claim
 *     for the scene — give the player a way OUT (a "walk away" choice) so
 *     a failed press still routes to an ending instead of soft-locking.
 */
export const DEMO_LIE: Story = {
  id: "demo-lie-lab",
  title: "Demo Lab: Press the Lie",
  tagline: "Catch a suspect in a lie — the contradiction verb.",
  coverImage: "gradient:linear-gradient(160deg,#1a0d0d 0%,#220f18 55%,#07070c 100%)",
  startSceneId: "dl_office",
  layout: {
    dl_office: { x: 40, y: 240 },
    dl_alibi: { x: 460, y: 120 },
    dl_interrogation: { x: 880, y: 120 },
    dl_end_gold: { x: 1300, y: 60 },
    dl_end_cold: { x: 1300, y: 300 },
  },
  briefing: {
    objective: "Break Mara Velle's alibi with the evidence you actually found.",
    winConditions: [
      "Press her 'home by ten' lie with the pawn ticket.",
      "In the back room, break her second lie and crack her composure.",
    ],
    loseConditions: [
      "Wave the wrong evidence until she shuts down, or walk away.",
    ],
  },
  flagNotes: {
    dl_pawn_lie_broken: "You proved she was near the club at 11:40 — her 'home by ten' alibi is dead.",
    dl_tab_lie_broken: "You put her signed bar tab in front of her — she signed for two drinks at 1:15.",
    dl_she_broke: "Mara cracked under the contradiction and started talking.",
    dl_she_clamped: "Mara clamped down and stopped talking.",
  },
  characters: [
    {
      id: "dl_mara",
      name: "Mara Velle",
      role: "The suspect — smooth, prepared, and lying about last night",
      avatarUrl: "emoji:🥃",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 1.0 },
    },
  ],
  items: [
    {
      id: "dl_ticket",
      name: "Pawn Ticket",
      icon: "🎟️",
      description: "A pawn-shop ticket for a gold bracelet, stamped 11:40 PM — the shop is two doors down from the club.",
      flavorText: "She hocked the bracelet forty minutes AFTER she says she was home in bed.",
      isClue: true,
    },
    {
      id: "dl_receipt",
      name: "Signed Bar Tab",
      icon: "🧾",
      description: "A club bar tab in Mara's handwriting: two whiskeys, signed 'M.V.' at 1:15 AM.",
      flavorText: "She claimed she drank alone and left early. This says she bought for two and stayed late.",
      isClue: true,
    },
    {
      id: "dl_matchbook",
      name: "Charred Matchbook",
      icon: "🔥",
      description: "A burnt matchbook from the club. Half the crowd had one in their pocket last night.",
      flavorText: "It puts her nowhere. It puts ANYONE at the club — which is exactly why it's a trap.",
      isClue: true,
    },
  ],
  scenes: [
    /* ── SCENE 1 — the search ─────────────────────────────────────── */
    {
      id: "dl_office",
      title: "Velle's Back Office",
      note:
        "STEP 1 — STOCK THE EVIDENCE (this scene is a 🚶 WALKABLE STAGE node). A press only works if the player is HOLDING the right item, so first you give it to them. " +
        "① Node Layout Type is '🚶 Walkable Stage': no prose panel — the stage.enterCaption line plays as a subtitle and the player WALKS. " +
        "② Each hotspot below is a 'take' marker with action Give item; the stage draws them as gold reticles at the zone's base and the character walks to them. " +
        "③ There are THREE items on purpose: the 🎟 Pawn Ticket breaks lie #1, the 🧾 Bar Tab breaks lie #2, and the 🔥 Matchbook is a RED HERRING — it shows in the evidence bag but proves nothing. " +
        "④ The exit is a DOOR MARKER: a hotspot with action '→ Go to scene' (cursor 'go') — on a stage node choices only appear after a conversation, so exits must be walk-to markers. " +
        "⑤ The lesson: handing the player every clue doesn't make it easy; they still have to pick the one that matters. " +
        "⑥ The walker here uses stage.playerSheet — ONE sprite-sheet image sliced into a frame grid with named 'walk'/'idle' animations (it beats loose walkFrames files: proper standing pose, one download). ▶ Play: walk the floor, grab all three, then walk out the door to confront her.",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      nodeType: "stage",
      stage: {
        playerImage: "emoji:🕵️", // fallback if the sheet fails to load
        playerSheet: {
          image: "/assets/sprites/gumshoe-walk.png",
          frameWidth: 114,
          frameHeight: 192,
          animations: {
            idle: { frames: [1] },
            walk: { frames: [0, 1, 2, 3], fps: 8 },
          },
          pixelated: true,
        },
        spawn: { x: 50, y: 88 },
        speed: 20,
        reach: 4,
        keyboard: true,
        floor: { top: 58, bottom: 94 },
        depthScale: 0.35,
        hints: "proximity",
        enterCaption:
          "Mara Velle's office smells of cigarette smoke and cheap rye. She's gone down to the club to give her statement — which means the desk is unguarded.",
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "dl_hs_ticket",
          label: "A pawn ticket sticking out of the ledger",
          bounds: { x: 30, y: 50, w: 16, h: 20 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "dl_ticket" },
        },
        {
          id: "dl_hs_receipt",
          label: "A bar tab pinned under the blotter",
          bounds: { x: 50, y: 54, w: 15, h: 19 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "dl_receipt" },
        },
        {
          id: "dl_hs_matchbook",
          label: "A charred matchbook in the ashtray",
          bounds: { x: 8, y: 56, w: 13, h: 17 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "dl_matchbook" },
        },
        {
          id: "dl_hs_exit",
          label: "Follow her down to the club",
          bounds: { x: 84, y: 74, w: 12, h: 18 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "dl_alibi" },
        },
      ],
      choices: [],
    },

    /* ── SCENE 2 — LIE ONE: a standalone contradiction ─────────────── */
    {
      id: "dl_alibi",
      title: "The Ready-Made Alibi",
      note:
        "STEP 2 — BUILD THE LIE. Open the beat that speaks her alibi (beat 1), then the '🎯 Press the Lie (contradiction)' panel. " +
        "① 'This line is a lie the player can catch.' ② The CLAIM is what gets challenged. ③ BREAKING EVIDENCE = tick ONLY the 🎟 Pawn Ticket — the tab and the matchbook stay un-ticked, so presenting them is a called bluff. " +
        "④ CAUGHT FLAG = dl_pawn_lie_broken; the CAUGHT reaction auto-gates on it. ⑤ Write the BLUFF-CALLED line and set the wrong-limit (2) and consequences (trust −1 / heat +1 on a miss; trust +2 / clever +1 on a catch). " +
        "⑥ The gold path ('Press her harder') is GATED on dl_pawn_lie_broken — break the lie to advance. The cold path ('walk away') is always open so a failed press can't soft-lock. " +
        "⑦ Set dressing: the flickering CLUB sign is a 🎬 cinematic FOREGROUND EXTRA animated by a SPRITE SHEET — one image, three frames, a looping 'loop' animation. Any extra can animate this way (neon, rain-lashed flags). ▶ Play: press her, try the matchbook first (bluff!), then the ticket.",
      background: "/img/bg-dressing.jpg",
      cinematic: {
        foregroundExtras: [
          {
            image: "/assets/sprites/club-neon.png", // static fallback (shows the whole strip only if the sheet is cleared)
            sheet: {
              image: "/assets/sprites/club-neon.png",
              frameWidth: 115,
              frameHeight: 256,
              animations: {
                // lit → lit → dim → lit → dark → lit: an uneven, faulty-tube flicker
                loop: { frames: [0, 0, 0, 1, 0, 0, 2, 0, 1, 0], fps: 7 },
              },
              pixelated: true,
            },
            x: 11,
            y: 46,
            scale: 0.62,
            depth: 0.35,
          },
        ],
      },
      ambientAudio: "tension",
      prose:
        "Mara Velle sits at the club bar with a drink she hasn't touched, the picture of a woman who rehearsed this. She doesn't wait for the question.",
      dialogueBeats: [
        {
          id: "dl_alibi_claim",
          characterId: "dl_mara",
          expression: "easy-smile",
          text: "Last night? Detective, I was home in my rooms by ten o'clock. Door locked, radio on, all alone. I never came near this club after dark. You can turn the place upside down — there's not a scrap of paper puts me here.",
          lie: {
            claim: "Mara says she was home by ten and never came near the club after dark.",
            evidenceItemIds: ["dl_ticket"],
            contradictedFlag: "dl_pawn_lie_broken",
            caughtBeat: {
              id: "dl_alibi_caught",
              characterId: "dl_mara",
              conditionRule: { requiresFlags: ["dl_pawn_lie_broken"] },
              text: "She turns the pawn ticket over twice. The stamp catches the light — 11:40 PM. The smile doesn't drop so much as freeze. \"…that's a two-minute walk from here.\" Her voice goes quiet. \"Fine. I was in the neighborhood. But I didn't DO anything — and you can't make the rest of it stick in a bar. Take me in the back if you're so sure.\"",
            },
            wrongBeat: {
              id: "dl_alibi_wrong",
              characterId: "dl_mara",
              text: "She doesn't even flinch. \"A burnt matchbook? Half my regulars carry one of those. That proves I was nowhere, detective. Come back with a TIME and a PLACE on it — or sit down and have a drink.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "dl_mara", delta: 2 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "dl_mara", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Mara Velle knows you caught the lie in her alibi.",
          },
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dl_alibi_press_on",
          text: "\"Back room. Now.\" — you've broken her alibi, press the rest. (needs the pawn ticket catch)",
          targetSceneId: "dl_interrogation",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["dl_pawn_lie_broken"] },
        },
        {
          id: "dl_alibi_walk",
          text: "Let her keep the smile and walk out.",
          targetSceneId: "dl_end_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── SCENE 3 — LIE TWO: contradiction inside an interrogation ──── */
    {
      id: "dl_interrogation",
      title: "The Back Room",
      note:
        "STEP 3 — A LIE THAT CRACKS HER. This scene ALSO has an Interrogation (Scene tab → Interrogation): composure 3, a broke beat on dl_she_broke and a clamp beat on dl_she_clamped. The attitude-tagged 💬 replies are PRESSURE — each chips a point of composure. " +
        "But the contradiction on beat 1 sets COMPOSURE DAMAGE = 3: present the 🧾 Signed Bar Tab and the lie doesn't just flip a flag, it SHATTERS her composure in one move and runs the normal crack/clamp resolution (trust decides — she's at +2 trust from the first catch, so she breaks). " +
        "The matchbook is still a bluff here too. The confession choice is gated on dl_she_broke; 'walk out' is the permanent exit. ▶ Play: present the bar tab and watch her crack open.",
      background: "/img/bg-basement.jpg",
      ambientAudio: "tension",
      prose:
        "The back room is a single hanging bulb, a metal table, and nowhere for her eyes to go. She sits; you lay the evidence between you like a hand of cards.",
      dialogueBeats: [
        {
          id: "dl_int_claim",
          characterId: "dl_mara",
          expression: "cornered",
          text: "Alright, I was near the club. That's all you've got. I drank ALONE, I talked to NOBODY, and I was home before the trouble started. There's no piece of paper with my name on it from last night. You're bluffing.",
          lie: {
            claim: "Mara says she drank alone, talked to nobody, and no paper bears her name from last night.",
            evidenceItemIds: ["dl_receipt"],
            contradictedFlag: "dl_tab_lie_broken",
            caughtBeat: {
              id: "dl_int_caught",
              characterId: "dl_mara",
              conditionRule: { requiresFlags: ["dl_tab_lie_broken"] },
              text: "You slide the bar tab across the table, her own signature up — M.V., two whiskeys, 1:15 AM. She stares at it the way you stare at a door you forgot to lock. \"…two drinks.\" A breath. \"I didn't think anyone kept those.\"",
            },
            wrongBeat: {
              id: "dl_int_wrong",
              characterId: "dl_mara",
              text: "She almost laughs. \"The matchbook AGAIN? I told you downstairs — that's not my NAME on anything. You're reaching, detective. Reach again and this conversation's over.\"",
            },
            wrongEvidenceLimit: 2,
            composureDamage: 3,
            contradictedConsequences: {
              trustChanges: [{ characterId: "dl_mara", delta: 1 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "dl_mara", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Mara Velle is out of lies.",
          },
        },
      ],
      hotspots: [],
      interrogation: {
        characterId: "dl_mara",
        composure: 3,
        crackTrust: 0,
        steadySeconds: 8,
        brokeFlag: "dl_she_broke",
        clampFlag: "dl_she_clamped",
        brokeBeat: {
          id: "dl_int_broke",
          characterId: "dl_mara",
          conditionRule: { requiresFlags: ["dl_she_broke"] },
          text: "Her shoulders drop, and the rehearsed woman walks out of the room for good. \"Two drinks. One of them wasn't for me. It was for the man who did it — and I'll tell you his name, because you've already got the rest of it. Get me a glass of water, detective. We're going to be a while.\"",
        },
        clampedBeat: {
          id: "dl_int_clamp",
          characterId: "dl_mara",
          conditionRule: { requiresFlags: ["dl_she_clamped"] },
          text: "Her mouth closes like a trap. \"I'm done talking. You've got nothing with my name on it and you know it.\" The bulb sways. You've lost her.",
        },
        brokeConsequences: {
          trustChanges: [{ characterId: "dl_mara", delta: 2 }],
        },
        clampConsequences: {
          trustChanges: [{ characterId: "dl_mara", delta: -2 }],
          meterChanges: [{ meter: "Suspicion", delta: 2 }],
        },
      },
      choices: [
        {
          id: "dl_int_press_1",
          text: "💬 \"Cut the act — who were the two drinks for?\" (press)",
          reply: true,
          attitudeTag: "Aggressive",
        },
        {
          id: "dl_int_press_2",
          text: "💬 \"We both know that tab has a story. Start it.\" (press)",
          reply: true,
          attitudeTag: "Clever",
        },
        {
          id: "dl_int_confess",
          text: "She's cracked — take the confession and close the case.",
          targetSceneId: "dl_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["dl_she_broke"] },
        },
        {
          id: "dl_int_walk",
          text: "Leave her in the back room with the bulb and walk.",
          targetSceneId: "dl_end_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── ENDING — gold ─────────────────────────────────────────────── */
    {
      id: "dl_end_gold",
      title: "Case Closed — The Name on the Tab",
      isEnding: true,
      note:
        "GOLD ENDING. Reached only from the back room once dl_she_broke is set — which the contradiction triggers by shattering her composure. Mark the scene 🏁 Ending and fill Ending Data (tier, headline, recap).",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "She talks until the bulb's gone yellow and the rain outside has stopped. A pawn ticket cracked the alibi; a bar tab cracked the woman. The name she gives you is the one the whole city was too polite to say out loud.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE NAME ON THE TAB",
        recap:
          "You didn't interrogate her into a corner — you PROVED she was already in one. The pawn ticket killed the alibi, and the signed bar tab shattered her composure and cracked her open. Press the Lie turns reading into proving: the player has to hold the right evidence and know what it means.",
      },
    },

    /* ── ENDING — game over ────────────────────────────────────────── */
    {
      id: "dl_end_cold",
      title: "Case Closed — She Kept the Smile",
      isEnding: true,
      note:
        "GAME OVER. The always-available 'walk away' exit — and the place a player lands if they bluff the wrong evidence until she clams. Every press scene needs an out so a failed contradiction routes somewhere instead of soft-locking. Tier gameover.",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "none",
      prose:
        "Mara Velle watches the door swing shut behind you, the smile perfectly back in place. Somewhere a matchbook burns in an ashtray. You left with three clues and not one of them ever touched the lie it was meant to break.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "SHE KEPT THE SMILE",
        recap:
          "You carried the evidence that could have broken her — the pawn ticket, the bar tab — but you never put the RIGHT one on the table at the RIGHT line. A contradiction only counts when the proof fits the claim. Replay and press her with the ticket, then the tab.",
      },
    },
  ],
};
