import type { Story } from "../types";

/**
 * THE LAST STOP
 * An original tale in the tradition of the classic black-and-white
 * anthology: a commuter, a train that is never on time, and the one stop
 * he has spent a lifetime refusing to make.
 *
 * Built as a compact, self-contained "visual novel" reel so it can serve
 * as both a playable episode and a copy-friendly template:
 *   - a typewriter credits cold open (the show's title-card rhythm)
 *   - a narrator ("The Host") who frames the tale in the anthology voice
 *   - one clue item (the one-way ticket) collected from a hotspot
 *   - a gated moral choice: the gold ending only opens if the player
 *     honestly faces the memory instead of looking away
 *   - three endings (victory-gold / victory-silver / gameover), each with
 *     its own closing narration
 *
 * All imagery is original black-and-white art generated for this episode
 * and lives in public/img/twilight-zone/.
 */
export const THE_LAST_STOP: Story = {
  id: "twilight-zone-the-last-stop",
  title: "The Last Stop",
  tagline:
    "A commuter boards the last train home and wakes to find it stops only where he is, and only for him.",
  gameKind: "vn",
  coverImage: "/img/twilight-zone/tz-cover.jpg",
  startSceneId: "tz_title",

  layout: {
    tz_title: { x: 0, y: 240 },
    tz_cold: { x: 340, y: 240 },
    tz_train: { x: 680, y: 240 },
    tz_memory: { x: 1020, y: 240 },
    tz_doors: { x: 1360, y: 240 },
    tz_end_gold: { x: 1700, y: 60 },
    tz_end_silver: { x: 1700, y: 240 },
    tz_end_refuse: { x: 1700, y: 420 },
  },

  briefing: {
    gameInfo:
      "An original tale in the spirit of the classic anthology: a tired commuter boards the last train home, falls asleep, and wakes to find the train is empty, the stations are wrong, and the conductor knows his name. Between this world and wherever the rails end, one passenger must finally face the stop he has spent a lifetime avoiding.",
    objective:
      "Ride the last train to its final stop — and choose what kind of man you get off as.",
    winConditions: [
      "Pick up the one-way ticket on the empty seat.",
      "At the station you missed, watch the memory to the end — don't look away.",
      "At the final stop, open the dark door and face the truth.",
    ],
    loseConditions: [
      "Refuse to choose, and ride the last train forever.",
      "Step through the bright door into a life you never actually lived.",
    ],
  },

  flagNotes: {
    tz_asked: "Frank asked the Conductor where the train was going.",
    tz_faced_memory: "Frank watched the memory of his daughter's recital to the end.",
    tz_looked_away: "Frank turned away from the one stop he couldn't face.",
    tz_truth_earned: "Frank pressed the Conductor's lie and proved the truth himself.",
    tz_truth_connected: "Frank wired the one-way ticket to the Conductor on the corkboard.",
  },

  characters: [
    {
      id: "tz_host",
      name: "The Host",
      role: "Your guide through the dimension of imagination",
      avatarUrl: "/img/twilight-zone/tz-host.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/twilight-zone/tz-host-sheet.png",
        frameWidth: 228,
        frameHeight: 677,
        animations: { rest: { frames: [0] }, talk: { frames: [0, 1, 2, 3, 4], fps: 7 } },
        pixelated: false,
      },
      talkingX: 50,
      talkingY: 0,
      talkingScale: 1.0,
      talkingDim: 0.5,
    },
    {
      id: "tz_frank",
      name: "Frank Merrick",
      role: "The passenger",
      avatarUrl: "/img/twilight-zone/tz-frank.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/twilight-zone/tz-frank-sheet.png",
        frameWidth: 266,
        frameHeight: 701,
        animations: { rest: { frames: [0] }, talk: { frames: [0, 1, 2, 3, 4], fps: 7 } },
        pixelated: false,
      },
      talkingX: 22,
      talkingY: 0,
      talkingScale: 1.0,
      talkingDim: 0.5,
    },
    {
      id: "tz_conductor",
      name: "The Conductor",
      role: "Collector of the last fare",
      avatarUrl: "/img/twilight-zone/tz-conductor.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/twilight-zone/tz-conductor-sheet.png",
        frameWidth: 229,
        frameHeight: 664,
        animations: { rest: { frames: [0] }, talk: { frames: [0, 1, 2, 3, 4], fps: 7 } },
        pixelated: false,
      },
      talkingX: 78,
      talkingY: 0,
      talkingScale: 1.0,
      talkingDim: 0.5,
    },
  ],

  items: [
    {
      id: "tz_ticket",
      name: "One-Way Ticket",
      icon: "🎟️",
      iconUrl: "/img/twilight-zone/tz-ticket-closeup.jpg",
      description:
        "A single ticket, punched 11:59. The destination line is blank. It feels heavier than paper should.",
      flavorText:
        "The punch mark isn't a departure time. It's the moment the train of a man's life was due — and never arrived.",
      isClue: true,
    },
  ],

  deduction: {
    suspectIds: ["tz_conductor"],
    connections: [
      {
        a: "tz_ticket",
        b: "tz_conductor",
        flagSet: "tz_truth_connected",
        revelation:
          "The ticket is punched 11:59 — the moment the train never came for Frank, twenty years ago. The Conductor didn't sell him a ticket; he's collecting on one that was never used. Frank never boarded tonight.",
      },
    ],
  },

  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "classic",
    accentColor: "#e8e4d8",
    reserveLines: 3,
  },

  scenes: [
    /* ==================== 1. OPENING CREDITS ==================== */
    {
      id: "tz_title",
      title: "Opening Titles",
      nodeType: "credits",
      credits: {
        titleEntrance: "typewriter",
        stagger: 0.6,
        duration: 1.0,
        accentColor: "#e8e4d8",
        lines: [
          { role: "Starring", name: "Frank Merrick" },
          { role: "A passenger", name: "forty-one years late" },
          { role: "Featuring", name: "The Conductor" },
          { role: "Presented in", name: "the dimension of imagination" },
        ],
      },
      background: "/img/twilight-zone/tz-cover.jpg",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Midnight%20in%20the%20Rain2.mp3",
      musicFadeSeconds: 1.5,
      cinematic: { colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "THE LAST STOP\n\nA journey through another dimension —\nnot of sight and sound,\nbut of the last train home.",
      choices: [
        { id: "tz_begin", text: "Begin", targetSceneId: "tz_cold", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE COLD OPEN ==================== */
    {
      id: "tz_cold",
      title: "Eleven Fifty-Nine",
      background: "/img/twilight-zone/tz-platform.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 3, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "The platform is empty except for you. The clock over the tracks reads 11:59, and it has read 11:59 for as long as you can remember standing here. The last train home is late. Or perhaps — and the thought sits in your chest like a cold coin — you are.",
      dialogueBeats: [
        {
          id: "tz_h1",
          characterId: "tz_host",
          text: "For your consideration: one Frank Merrick, a man who spent forty-one years believing there would always be one more train. He was wrong about a great many things. Tonight he is about to discover the most important one.",
        },
        {
          id: "tz_h2",
          characterId: "tz_host",
          background: "/img/twilight-zone/tz-clock.jpg",
          backgroundTransition: "crossfade",
          text: "You are looking at the last platform of the last line, on a night with no moon. The train that stops here appears on no timetable — because it does not stop here for the living.",
        },
        {
          id: "tz_h3",
          characterId: "tz_host",
          background: "/img/twilight-zone/tz-boarding.jpg",
          backgroundTransition: "crossfade",
          text: "Mr. Merrick is about to board it anyway. And in the dimension of imagination, the fare is collected in a currency no bank can count.",
        },
      ],
      hotspots: [
        {
          id: "tz_hs_clock",
          label: "The station clock",
          bounds: { x: 40, y: 8, w: 18, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The second hand does not move. It hasn't moved. But somewhere, something is waiting for you to move.",
          },
        },
      ],
      choices: [
        { id: "tz_board", text: "Board the train.", targetSceneId: "tz_train", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 3. THE LAST CAR ==================== */
    {
      id: "tz_train",
      title: "The Last Car",
      background: "/img/twilight-zone/tz-train.jpg",
      ambientAudio: "tension",
      cinematic: { colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "The doors close behind you with the soft, final sound of a decision. The car is empty — polished seats, brass fittings, not a soul — yet you are certain you were not alone a moment ago. On the seat beside you, where no one sat, there is a ticket stub.",
      dialogueBeats: [
        {
          id: "tz_f1",
          characterId: "tz_frank",
          background: "/img/twilight-zone/tz-train-exterior.jpg",
          backgroundTransition: "crossfade",
          text: "I've been riding this line for twenty years. I know every stop.",
        },
        { id: "tz_c1", characterId: "tz_conductor", text: "Do you, now? Then you'll know the next one." },
        { id: "tz_f2", characterId: "tz_frank", text: "I didn't see you come in." },
        {
          id: "tz_c2",
          characterId: "tz_conductor",
          background: "/img/twilight-zone/tz-empty-seat.jpg",
          backgroundTransition: "crossfade",
          text: "I was here before you were, Mr. Merrick. Ticket, please.",
        },
      ],
      hotspots: [
        {
          id: "tz_hs_ticket",
          label: "The ticket stub",
          bounds: { x: 46, y: 60, w: 14, h: 10 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "tz_ticket" },
          verbs: {
            look: {
              type: "showText",
              text: "A one-way ticket. Punched 11:59. The destination line is blank — and somehow that's the most unsettling part.",
            },
          },
        },
        {
          id: "tz_hs_window",
          label: "The passing window",
          bounds: { x: 8, y: 30, w: 20, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The stations sliding past have names you used to know — names from a town that only exists in the wrong half of your memory.",
          },
        },
      ],
      choices: [
        {
          id: "tz_hand",
          text: "Hand over the ticket.",
          targetSceneId: "tz_memory",
          attitudeTag: "Neutral",
          gating: { requiresItems: ["tz_ticket"] },
          consequences: { setFlags: ["tz_asked"] },
        },
        {
          id: "tz_ask",
          text: "Ask him where this train is going.",
          targetSceneId: "tz_memory",
          attitudeTag: "Clever",
          consequences: {
            setFlags: ["tz_asked"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
      ],
    },

    /* ==================== 4. THE STATION YOU MISSED ==================== */
    {
      id: "tz_memory",
      title: "The Station You Missed",
      background: "/img/twilight-zone/tz-memory.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 55%", zoomDuration: 12, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "The train glides to a stop at a platform that is on no map. Through the glass you see a corridor you know by heart, and at the end of it, a stage with a single spotlight on an empty chair. You have been here before. You have been leaving this place for twenty years.",
      dialogueBeats: [
        {
          id: "tz_c3",
          characterId: "tz_conductor",
          text: "Every passenger rides to the one stop they spent their life trying not to face. For some it's a debt. For some it's a name. For you, Mr. Merrick, it's that empty chair.",
        },
        {
          id: "tz_f3",
          characterId: "tz_frank",
          background: "/img/twilight-zone/tz-daughter.jpg",
          backgroundTransition: "crossfade",
          text: "That's my daughter's recital. I was supposed to be there. The night train — I told myself there'd be another.",
        },
        {
          id: "tz_c4",
          characterId: "tz_conductor",
          background: "/img/twilight-zone/tz-recital.jpg",
          backgroundTransition: "crossfade",
          text: "There was always another. Until tonight.",
        },
        {
          id: "tz_c5",
          characterId: "tz_conductor",
          conditionRule: { requiresItems: ["tz_ticket"] },
          text: "Your ticket, Mr. Merrick. Punched 11:59. That was never your departure time. That was the moment the last train of your life was due — and never arrived.",
        },
      ],
      hotspots: [
        {
          id: "tz_hs_chair",
          label: "The empty chair",
          bounds: { x: 52, y: 34, w: 12, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The chair is empty because you never sat in it. Some absences, once you've made them, you carry forever.",
          },
        },
        {
          id: "tz_hs_corridor",
          label: "The corridor",
          bounds: { x: 22, y: 40, w: 18, h: 32 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "You could walk it now, but it only runs one way — and you've already walked it once.",
          },
        },
      ],
      choices: [
        {
          id: "tz_watch",
          text: "Watch the memory to the end.",
          targetSceneId: "tz_doors",
          attitudeTag: "Clever",
          consequences: {
            setFlags: ["tz_faced_memory"],
            meterChanges: [{ meter: "Clever", delta: 2 }],
          },
          rememberLine: "You won't forget what you just watched.",
        },
        {
          id: "tz_away",
          text: "Look away.",
          targetSceneId: "tz_doors",
          attitudeTag: "Neutral",
          consequences: {
            setFlags: ["tz_looked_away"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "You'll never know what you refused to see.",
        },
      ],
    },

    /* ==================== 5. THE LAST STOP ==================== */
    {
      id: "tz_doors",
      title: "The Last Stop",
      background: "/img/twilight-zone/tz-doors.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 50%", zoomDuration: 14, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "The train ends where all lines end: in a place with no platform, no tracks, and no stars. Before you stand two doors. One is open a crack, and a warm, impossible light spills from it. The other is closed, and dark, and somehow patient. The Conductor folds his hands.",
      dialogueBeats: [
        {
          id: "tz_c6",
          characterId: "tz_conductor",
          background: "/img/twilight-zone/tz-void-train.jpg",
          backgroundTransition: "fade-black",
          text: "Don't look so pale, Mr. Merrick. You boarded tonight like any other passenger — alive, with a ticket and somewhere to be. There is nothing here to face. Step through the bright door and be done with it.",
          lie: {
            claim: "The Conductor insists Frank boarded tonight — alive and ordinary.",
            evidenceItemIds: ["tz_ticket"],
            contradictedFlag: "tz_truth_earned",
            caughtBeat: {
              id: "tz_c6_caught",
              characterId: "tz_conductor",
              conditionRule: { requiresFlags: ["tz_truth_earned"] },
              text: "You slide the ticket across and the Conductor goes very still. 'You kept it. Punched eleven fifty-nine.' He turns the punch over in his hands. 'That was the moment the train never came for you, Mr. Merrick — twenty years ago tonight. You didn't board this train. You've been dead since then. This is the crossing.'",
            },
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 2 }],
            },
            rememberLine: "The Conductor knows you earned the truth.",
          },
        },
        {
          id: "tz_c6_fallback",
          characterId: "tz_conductor",
          conditionRule: { excludesFlags: ["tz_truth_earned"] },
          text: "The Conductor watches your empty hands and sighs. 'Very well — the truth unearned, then. That ticket was punched eleven fifty-nine, twenty years ago tonight: the moment the train never came for you. You didn't board this train, Mr. Merrick. You've been dead since then. This is the crossing.'",
        },
        {
          id: "tz_c7",
          characterId: "tz_conductor",
          background: "/img/twilight-zone/tz-bright-door.jpg",
          backgroundTransition: "crossfade",
          text: "The bright door is the life you should have had. Walk through, and you'll wake in it — the man who got off early, who sat in that chair, who kept every promise. It will be real in every way but one.",
        },
        {
          id: "tz_f4",
          characterId: "tz_frank",
          background: "/img/twilight-zone/tz-late.jpg",
          backgroundTransition: "crossfade",
          text: "And the dark one?",
        },
        {
          id: "tz_c8",
          characterId: "tz_conductor",
          backgroundRevert: true,
          text: "That one is the truth. And the truth is the only stop with no return. But it only opens for the ones who did not look away.",
        },
        {
          id: "tz_c9_looked_away",
          characterId: "tz_conductor",
          conditionRule: { requiresFlags: ["tz_looked_away"] },
          text: "And yet you looked away from the one stop that mattered, Mr. Merrick. Small wonder the truth seems so hard to see now.",
        },
        {
          id: "tz_c10_connected",
          characterId: "tz_conductor",
          conditionRule: { requiresFlags: ["tz_truth_connected"] },
          text: "You pieced it together on your own, I see — the ticket, the punch mark, eleven fifty-nine. A man who does his own thinking is a rare passenger on this line.",
        },
      ],
      hotspots: [
        {
          id: "tz_hs_bright",
          label: "The bright door",
          bounds: { x: 22, y: 30, w: 18, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Through the gap you can almost hear it — applause, and a child's laugh. It is everything you ever told yourself you'd go back for.",
          },
        },
        {
          id: "tz_hs_dark",
          label: "The dark door",
          bounds: { x: 60, y: 30, w: 18, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "No light, no sound. Only the quiet of a thing that has waited for you as long as you have been running.",
          },
        },
        {
          id: "tz_hs_board",
          label: "Lay out what you know",
          bounds: { x: 50, y: 84, w: 14, h: 10 },
          cursor: "use",
          isRepeatable: true,
          action: { type: "openBoard" },
        },
      ],
      choices: [
        {
          id: "tz_choose_silver",
          text: "Step through the bright door into the life you should have had.",
          targetSceneId: "tz_end_silver",
          attitudeTag: "Neutral",
          consequences: {
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
        },
        {
          id: "tz_choose_gold",
          text: "Open the dark door and face the truth.",
          targetSceneId: "tz_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["tz_faced_memory"] },
          memoryLog: "tz_chose_truth",
          consequences: {
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
          rememberLine: "The truth, at last, will not be turned away.",
        },
        {
          id: "tz_choose_refuse",
          text: "Refuse to choose.",
          targetSceneId: "tz_end_refuse",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 6a. GOLD — THE RIGHT STOP ==================== */
    {
      id: "tz_end_gold",
      title: "Ending — The Right Stop",
      isEnding: true,
      background: "/img/twilight-zone/tz-afterlife.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "pan", panDirection: "left", panDistance: 2, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.35 },
      prose:
        "You reach for the dark door, and it opens before you touch it — not into darkness, but into a morning you have never once been on time for. The truth was never a punishment. It was only the stop you kept passing.",
      dialogueBeats: [
        {
          id: "tz_h_gold",
          characterId: "tz_host",
          text: "The doors opened on a platform Frank Merrick had never been able to find in forty-one years — the one where the truth waits quietly, and asks nothing but that you finally look at it. He stepped through, and for the first time in his life, he was exactly on time.",
          recalls: {
            tz_chose_truth: "And when the moment came, he did not flinch. He chose the truth — {said} — and the truth, at last, did not turn away.",
          },
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE RIGHT STOP",
        recap:
          "You faced the memory you'd spent a lifetime avoiding, opened the dark door, and stepped off the last train as the man who finally made it home.",
      },
    },

    /* ==================== 6b. SILVER — THE LIFE YOU SHOULD HAVE HAD ==================== */
    {
      id: "tz_end_silver",
      title: "Ending — The Life You Should Have Had",
      isEnding: true,
      background: "/img/twilight-zone/tz-perfect-life.jpg",
      ambientAudio: "drone",
      cinematic: { colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.35 },
      prose:
        "The bright door is warm, and for a long moment it is enough. You step into applause, into a filled chair, into every promise kept. It is real in every way but one — and the one way it isn't real is the only way that ever mattered.",
      dialogueBeats: [
        {
          id: "tz_h_silver",
          characterId: "tz_host",
          background: "/img/twilight-zone/tz-street.jpg",
          backgroundTransition: "crossfade",
          text: "He stepped into the light and woke to the life he'd always told himself he deserved — the applause, the chair filled, every promise kept. But every night, at eleven fifty-nine, some part of him remembered that he had never actually been there. A man can live forever in a life he didn't earn. The ones he left behind simply call that... the last stop.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "THE LIFE YOU SHOULD HAVE HAD",
        recap:
          "You chose the bright door — a perfect life that could never be entirely real. Some doors open onto everything you wanted, and it turns out to be a hall of mirrors.",
      },
    },

    /* ==================== 6c. GAME OVER — THE NEW CONDUCTOR ==================== */
    {
      id: "tz_end_refuse",
      title: "Ending — The New Conductor",
      isEnding: true,
      background: "/img/twilight-zone/tz-train.jpg",
      ambientAudio: "tension",
      cinematic: { colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "You do not choose. And the train, which has no patience and no timetable, finds its answer for you. The Conductor tips his cap, places the punch in your hand, and steps off into the light you would not face.",
      dialogueBeats: [
        {
          id: "tz_h_refuse",
          characterId: "tz_host",
          background: "/img/twilight-zone/tz-new-conductor.jpg",
          backgroundTransition: "crossfade",
          text: "Frank Merrick refused to choose, and so the last line chose for him. He rides it still — the last car, the last line — punching the tickets of the next passenger who is always, always running late. Because the worst stop of all is the one where you refuse to get off.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "THE NEW CONDUCTOR",
        recap:
          "You refused to choose, and the train kept its schedule anyway. Some fares are paid whether you reach for your ticket or not.",
      },
    },
  ],
};
