import type { Story } from "../types";

/**
 * THE STATIC HOUSE
 * An original supernatural thriller inspired by the classic 1982 suburban
 * haunting — a family's television turns itself on, and something on the
 * far side of the static reaches through for their youngest son.
 *
 * Built on the full Studio feature set:
 *   - a credits cold open with a cross-dissolving still montage
 *   - cinematic camera (pan / zoom-hold / handheld shake), Spielberg-golden
 *     warmth for the family and a cold IMAX teal for the supernatural, 35mm
 *     film grain and letterboxing throughout
 *   - dialogue beats with gated reactions and insert shots
 *   - hold-to-investigate hotspots, clue items and a corkboard deduction
 *   - a "press the lie" contradiction (break the Presence with Milo's bracelet)
 *   - quick-time "hold on" moments, a heat/bust meter (the house's attention)
 *   - three endings (gold / silver / game-over)
 *
 * All imagery is original and lives in public/img/poltergeist/.
 */
export const THE_STATIC_HOUSE: Story = {
  id: "static-house",
  title: "The Static House",
  tagline:
    "In a quiet 1980s suburb, a family's television turns on by itself — and something on the far side of the static has been waiting for them.",
  gameKind: "noir-rail",
  coverImage: "/img/poltergeist/cover.jpg",
  startSceneId: "pl_title",

  layout: {
    pl_title: { x: 0, y: 200 },
    pl_house: { x: 300, y: 200 },
    pl_living: { x: 600, y: 120 },
    pl_kitchen: { x: 900, y: 200 },
    pl_bedroom: { x: 1200, y: 200 },
    pl_search: { x: 1500, y: 40 },
    pl_search_bedroom: { x: 1500, y: 200 },
    pl_search_living: { x: 1500, y: 360 },
    pl_search_yard: { x: 1500, y: 520 },
    pl_science: { x: 1800, y: 200 },
    pl_medium: { x: 2100, y: 200 },
    pl_other_side: { x: 2400, y: 200 },
    pl_rescue: { x: 2700, y: 120 },
    pl_aftermath: { x: 3000, y: 200 },
    pl_end_gold: { x: 3300, y: 40 },
    pl_end_silver: { x: 3300, y: 200 },
    pl_end_dark: { x: 3300, y: 360 },
  },

  briefing: {
    gameInfo:
      "The Harrows bought 27 Cypress Lane for the schools and the big yard. Then the television started turning itself on — and the youngest, Milo, started answering it. When the static takes him, his parents have one night to learn what the house really is, follow his voice to the far side of the signal, and bring him home before the house finishes what it started.",
    objective:
      "Bring Milo back through the static — and get your family out into the street before the house keeps them all.",
    winConditions: [
      "Find what Milo left behind in his room — it proves the thing in the static is holding him, not playing with him.",
      "Hold the rope when the house starts to pull back.",
      "Walk your family out into the dark and leave 27 Cypress Lane to whatever built it.",
    ],
    loseConditions: [
      "Let the house notice you too much — it keeps whatever catches its attention.",
      "Let go of the rope at the crossing.",
    ],
    heatLimit: 3,
    heatFailSceneId: "pl_end_dark",
  },

  flagNotes: {
    pl_watched: "The Harrows sat and watched the static with Milo instead of sending him to bed.",
    pl_called: "Ellen called the police when the kitchen rearranged itself.",
    pl_abducted: "Milo was pulled through the static.",
    pl_held: "Ellen grabbed Milo's wrist in time — though it only made the house angrier.",
    pl_lost: "Ellen's fingers slipped, and the static swallowed him cleanly.",
    pl_shouted: "Someone shouted into the static — and the house heard them.",
    pl_found_tape: "The VHS tape under the TV was recovered.",
    pl_found_bracelet: "Milo's bracelet was found on the floor of his room — cold, and torn.",
    pl_found_ground: "The disturbed ground under the old oak was examined.",
    pl_conn_bracelet: "The bracelet was wired to the Presence on the corkboard.",
    pl_conn_tape: "The static tape was wired to the Presence on the corkboard.",
    pl_truth_earned: "The Presence was caught in its lie — the player proved Milo is being held.",
    pl_ellen: "Ellen went into the light to bring her son home.",
    pl_daniel: "Daniel went into the light instead of letting his wife go.",
    pl_drilled: "Daniel drilled into the wall to cut the signal — the house felt every turn of the bit.",
    pl_rescued: "They held the rope and pulled Milo back through.",
    pl_fell: "The rope went slack — Milo came through, but the crossing took its toll.",
  },

  characters: [
    {
      id: "pl_daniel",
      name: "Daniel Harrow",
      role: "The father — a real-estate man who doesn't believe in ghosts",
      avatarUrl: "/img/poltergeist/char-father.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/daniel-talk.png",
        frameWidth: 360,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 22,
      talkingY: 0,
      talkingScale: 0.8,
      talkingDim: 0.45,
    },
    {
      id: "pl_ellen",
      name: "Ellen Harrow",
      role: "The mother — the first to hear the voice in the static",
      avatarUrl: "/img/poltergeist/char-mother.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/ellen-talk.png",
        frameWidth: 347,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 78,
      talkingY: 0,
      talkingScale: 0.8,
      talkingDim: 0.45,
      talkingFlip: true,
    },
    {
      id: "pl_emma",
      name: "Emma Harrow",
      role: "The daughter — fifteen and furious at being afraid",
      avatarUrl: "/img/poltergeist/char-emma.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/emma-talk.png",
        frameWidth: 381,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 30,
      talkingY: 0,
      talkingScale: 0.72,
      talkingDim: 0.45,
    },
    {
      id: "pl_milo",
      name: "Milo Harrow",
      role: "The son — eight years old, and no longer entirely here",
      avatarUrl: "/img/poltergeist/char-son.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/milo-talk.png",
        frameWidth: 319,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 48,
      talkingY: 0,
      talkingScale: 0.6,
      talkingDim: 0.45,
    },
    {
      id: "pl_voss",
      name: "Dr. Ada Voss",
      role: "Parapsychologist — she measures the unmeasurable",
      avatarUrl: "/img/poltergeist/char-voss.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/voss-talk.png",
        frameWidth: 392,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 38,
      talkingY: 0,
      talkingScale: 0.72,
      talkingDim: 0.45,
    },
    {
      id: "pl_clara",
      name: "Clara Marsh",
      role: "The medium — she has crossed before, and come back",
      avatarUrl: "/img/poltergeist/char-medium.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/clara-talk.png",
        frameWidth: 328,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 62,
      talkingY: 0,
      talkingScale: 0.72,
      talkingDim: 0.45,
    },
    {
      id: "pl_presence",
      name: "The Presence",
      role: "Whatever has been living behind the snow of the television",
      avatarUrl: "/img/poltergeist/char-presence.jpg",
      trustMeter: 0,
      talkingSheet: {
        image: "/img/poltergeist/sprites/presence-talk.png",
        frameWidth: 396,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 0, 2], fps: 7 } },
        pixelated: false,
      },
      talkingX: 50,
      talkingY: 12,
      talkingScale: 0.9,
      talkingDim: 0.4,
    },
  ],

  items: [
    {
      id: "pl_remote",
      name: "The TV Remote",
      icon: "📟",
      iconUrl: "/img/poltergeist/item-remote.jpg",
      description:
        "A battered Zenith remote, the channel button worn smooth by eight-year-old thumbs. The batteries are new. You didn't put them in.",
      flavorText:
        "It turns the set on by itself now — click, like a heartbeat — always to the same empty channel.",
      isClue: false,
    },
    {
      id: "pl_tape",
      name: "The Static Tape",
      icon: "📼",
      iconUrl: "/img/poltergeist/item-tape.jpg",
      description:
        "A VHS cassette someone left recording in the living room. Under the hiss, a small voice counts down: ...four... three... two...",
      flavorText:
        "The tape is blank until three a.m. Then, for eleven seconds, Milo's voice — clear as a bell, from somewhere with no echo.",
      isClue: true,
    },
    {
      id: "pl_bracelet",
      name: "Milo's Bracelet",
      icon: "📿",
      iconUrl: "/img/poltergeist/item-bracelet.jpg",
      description:
        "The friendship bracelet Ellen tied on Milo's wrist last summer. It is cold to the touch, and the knot is torn — as if something pulled it off in a hurry.",
      flavorText:
        "He never takes it off. Not in the bath. Not at night. Never.",
      isClue: true,
    },
    {
      id: "pl_rope",
      name: "The Climbing Rope",
      icon: "🪢",
      iconUrl: "/img/poltergeist/item-rope.jpg",
      description:
        "Clara's yellow nylon climbing rope, warm from her hands. She promises it will hold in both worlds — the one on this side of the light and the one beyond it.",
      flavorText:
        "The rope is the anchor. Let go of the rope, and the house decides who comes back.",
      isClue: false,
    },
  ],

  deduction: {
    suspectIds: ["pl_presence"],
    connections: [
      {
        a: "pl_bracelet",
        b: "pl_presence",
        flagSet: "pl_conn_bracelet",
        revelation:
          "Milo never takes the bracelet off. Finding it — cold, torn, dropped on the floor of his own room — means something carried him through and it caught on the way. He isn't playing in the static. He is being held there.",
      },
      {
        a: "pl_tape",
        b: "pl_presence",
        flagSet: "pl_conn_tape",
        revelation:
          "The VHS records only snow — except for Milo's voice, counting down. The Presence doesn't just watch through the television. It broadcasts back through it. The set is a door, and something is leaning on it from the other side.",
      },
    ],
  },

  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "ghost-green",
    accentColor: "#d8ffe6",
    reserveLines: 3,
  },

  scenes: [
    /* ==================== 1. OPENING CREDITS ==================== */
    {
      id: "pl_title",
      title: "Opening Titles",
      nodeType: "credits",
      credits: {
        title: "THE STATIC HOUSE",
        subtitle: "a story about the light at the end of the hall",
        font: "pulp",
        style: "cards",
        cardMotion: "slam",
        titleEntrance: "slam",
        titleColor: "#eafff2",
        accentColor: "#8fe3b0",
        cardSeconds: 3.2,
        montage: [
          "/img/poltergeist/cover.jpg",
          "/img/poltergeist/bg-living-room.jpg",
          "/img/poltergeist/bg-kids-bedroom.jpg",
          "/img/poltergeist/bg-other-side.jpg",
        ],
        montageSeconds: 5,
        montageTransition: "dissolve",
        montageLoop: true,
        gateWeave: "worn",
        lines: [
          { role: "Starring", name: "The Harrow Family" },
          { role: "And", name: "whatever lives behind the snow" },
          { role: "Featuring", name: "Dr. Ada Voss" },
          { role: "And", name: "Clara Marsh, the Medium" },
          { role: "Directed by", name: "the house at 27 Cypress Lane" },
        ],
      },
      background: "/img/poltergeist/cover.jpg",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Midnight in the Rain2.mp3",
      musicFadeSeconds: 2.0,
      cinematic: { colorGrade: "nolan-imax", filmGrade: true, filmGradeStrength: 0.5 },
      prose:
        "THE STATIC HOUSE\n\nA suburban street, a family asleep,\nand one television that will not stay off.",
      choices: [
        { id: "pl_begin", text: "Begin", targetSceneId: "pl_house", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE HOUSE ==================== */
    {
      id: "pl_house",
      title: "Twenty-Seven Cypress Lane",
      background: "/img/poltergeist/cover.jpg",
      ambientAudio: "drone",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 60%",
        zoomDuration: 16,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.5,
        lights: [{ x: 62, y: 38, color: "#bcdfff", intensity: 0.5, size: 26 }],
      },
      letterbox: true,
      prose:
        "The street is asleep. Somewhere a dog has been barking for an hour and will not say at what. The Harrows' house sits a little too far from its neighbors, under a tree that grew before the neighborhood did. Every window is dark — except the one upstairs, which glows with a pale, flickering light that is not fire, and is not a lamp.",
      dialogueBeats: [
        {
          id: "pl_p1",
          characterId: "pl_presence",
          text: "There it is. The pretty house with the lawn and the mortgage and the two cars. Do you see the upstairs window? That is where we keep the boy. Well — soon.",
        },
        {
          id: "pl_p2",
          characterId: "pl_presence",
          background: "/img/poltergeist/bg-living-room.jpg",
          backgroundTransition: "crossfade",
          text: "They called it Cypress Lane to make it sound safe. There was never a cypress here. There was a tree, though. It remembers the ground before the ground remembered them.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_window",
          label: "The glowing window",
          bounds: { x: 56, y: 22, w: 14, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The light upstairs pulses, slow as a sleeping breath. It is not the blue of a television. It is the blue of something standing just behind a television.",
          },
        },
        {
          id: "pl_hs_tree",
          label: "The old oak",
          bounds: { x: 10, y: 30, w: 22, h: 46 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The oak's lowest branch points at the boy's window like an arm. You tell yourself it always grew that way. You are not sure it did.",
          },
        },
      ],
      choices: [
        { id: "pl_enter", text: "Go inside.", targetSceneId: "pl_living", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 3. THE LIVING ROOM ==================== */
    {
      id: "pl_living",
      title: "The Snow Channel",
      background: "/img/poltergeist/bg-living-room.jpg",
      ambientAudio: "tension",
      cinematic: {
        colorGrade: "spielberg-golden",
        filmGrade: true,
        filmGradeStrength: 0.45,
        lights: [{ x: 50, y: 55, color: "#cfe4ff", intensity: 0.45, size: 40, flare: true }],
      },
      letterbox: true,
      prose:
        "The living room is lit only by the television: a wall of churning snow, hissing like a held breath. Milo sits cross-legged on the rug, three inches from the glass, watching. The set is on a channel that does not exist.",
      dialogueBeats: [
        {
          id: "pl_l1",
          characterId: "pl_ellen",
          text: "Milo, honey. It's past midnight. Who turned the TV on?",
        },
        {
          id: "pl_l2",
          characterId: "pl_milo",
          background: "/img/poltergeist/bg-kids-bedroom.jpg",
          backgroundTransition: "crossfade",
          text: "The TV man did. He says the snow is his front yard. He says when it snows hard enough, he can walk right through.",
        },
        {
          id: "pl_l3",
          characterId: "pl_daniel",
          text: "Bad reception. Storm knocked out the cable again. Come on, big guy — bed.",
        },
        {
          id: "pl_l4",
          characterId: "pl_milo",
          text: "He's not bad reception. He says hello, Mom. He says he's been waiting for someone to leave the set on.",
        },
        {
          id: "pl_l_scare",
          characterId: "pl_presence",
          expression: "V.O.",
          silent: true,
          audioUrl: "/sfx/jumpscare-3.wav",
          background: "/img/poltergeist/scare-tv-hands.jpg",
          backgroundTransition: "cut",
          backgroundHold: false,
          cinematic: {
            mode: "shake",
            shakeAmount: 0.5,
            shakeDuration: 0.2,
            colorGrade: "nolan-imax",
            filmGrade: true,
            filmGradeStrength: 0.55,
            lights: [{ x: 50, y: 42, color: "#dff4ff", intensity: 0.6, size: 46 }],
          },
          text: "",
        },
        {
          id: "pl_l5",
          characterId: "pl_emma",
          conditionRule: { excludesFlags: ["pl_watched"] },
          text: "Great. The house is haunted and I have a history test tomorrow. I'm not carrying anyone's urn, just so we're clear.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_tv",
          label: "The television",
          bounds: { x: 38, y: 34, w: 24, h: 20 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Between the snow, for half a second, you see a shape — the suggestion of a hallway that is not in this house, stretching away behind the glass.",
          },
        },
        {
          id: "pl_hs_remote",
          label: "The remote",
          bounds: { x: 60, y: 66, w: 10, h: 8 },
          cursor: "take",
          showItemImage: false,
          action: { type: "giveItem", itemGranted: "pl_remote" },
          verbs: {
            look: {
              type: "showText",
              text: "The channel button is worn smooth. The batteries are new. You did not put them in.",
            },
          },
        },
      ],
      choices: [
        {
          id: "pl_send_bed",
          text: "Send Milo to bed and turn the set off.",
          targetSceneId: "pl_kitchen",
          attitudeTag: "Neutral",
        },
        {
          id: "pl_watch",
          text: "Sit down and watch the snow with him.",
          targetSceneId: "pl_kitchen",
          attitudeTag: "Neutral",
          consequences: {
            setFlags: ["pl_watched"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "Something on the far side of the glass just noticed you noticing it.",
        },
      ],
    },

    /* ==================== 4. THE KITCHEN ==================== */
    {
      id: "pl_kitchen",
      title: "The Stacked Chairs",
      background: "/img/poltergeist/bg-kitchen.jpg",
      ambientAudio: "tension",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 48%",
        zoomDuration: 12,
        colorGrade: "spielberg-golden",
        filmGrade: true,
        filmGradeStrength: 0.5,
      },
      letterbox: true,
      prose:
        "In the kitchen, the four chairs stand stacked in a column on the table — one, two, three, four — a tower nobody built. Ellen set them around the table after dinner. She is holding the counter now, the way you hold a rail in a moving car.",
      dialogueBeats: [
        {
          id: "pl_k1",
          characterId: "pl_ellen",
          text: "Daniel. The chairs. Tell me I stacked the chairs and forgot.",
        },
        {
          id: "pl_k2",
          characterId: "pl_daniel",
          text: "You stacked the chairs. Somebody's been stacking the chairs. It's — maybe the kids were playing a game.",
        },
        {
          id: "pl_k3",
          characterId: "pl_emma",
          text: "Maybe the house is redecorating. Maybe tomorrow it hangs the flatware from the ceiling fan.",
        },
        {
          id: "pl_k4",
          characterId: "pl_ellen",
          background: "/img/poltergeist/bg-living-room.jpg",
          backgroundTransition: "crossfade",
          text: "It's not the kids. The kids are asleep. And Milo — Milo said the man in the TV told him about the chairs before they happened.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_chairs",
          label: "The stacked chairs",
          bounds: { x: 40, y: 28, w: 22, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "They were on the floor an hour ago. The seat cushions are still warm where the family sat at dinner. Nothing else in the room has moved.",
          },
        },
      ],
      choices: [
        {
          id: "pl_call_police",
          text: "Call the police.",
          targetSceneId: "pl_bedroom",
          attitudeTag: "Clever",
          consequences: { setFlags: ["pl_called"] },
        },
        {
          id: "pl_dismiss",
          text: "It's a prank. Everyone back to bed.",
          targetSceneId: "pl_bedroom",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 5. THE ABDUCTION ==================== */
    {
      id: "pl_bedroom",
      title: "The Closet Door",
      background: "/img/poltergeist/bg-kids-bedroom.jpg",
      ambientAudio: "tension",
      musicMode: "none",
      particles: "storm",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.35,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.6,
        lights: [{ x: 74, y: 46, color: "#aee8ff", intensity: 0.55, size: 24 }],
      },
      letterbox: true,
      prose:
        "Milo is asleep with the superhero blanket tucked under his chin. The closet door is open an inch — it was closed — and from inside it comes a light like a television in a dark room, and a sound like wind through an antenna. The tree outside scrapes the window. Then the bed begins, very gently, to move.",
      dialogueBeats: [
        {
          id: "pl_b1",
          characterId: "pl_emma",
          text: "MOM! DAD! His bed — the bed is — something is in the closet!",
        },
        {
          id: "pl_b_scare",
          characterId: "pl_presence",
          expression: "V.O.",
          silent: true,
          audioUrl: "/sfx/jumpscare-1.wav",
          background: "/img/poltergeist/bg-closet.jpg",
          backgroundTransition: "cut",
          backgroundHold: false,
          cinematic: {
            mode: "shake",
            shakeAmount: 0.75,
            shakeRotation: 1.4,
            shakeDuration: 0.18,
            dimAmount: 0.35,
            colorGrade: "nolan-imax",
            filmGrade: true,
            filmGradeStrength: 0.6,
            lights: [{ x: 50, y: 42, color: "#dff4ff", intensity: 0.7, size: 50 }],
          },
          text: "",
        },
        {
          id: "pl_b2",
          characterId: "pl_ellen",
          text: "Milo, wake up! Milo — hold my hand!",
        },
        {
          id: "pl_b3",
          characterId: "pl_presence",
          background: "/img/poltergeist/bg-other-side.jpg",
          backgroundTransition: "fade-black",
          text: "The boy is not sleeping, Ellen. The boy is half a room away from you already. Do you know what the snow is? It is the space between one house and the next. And we have left the door open.",
        },
        {
          id: "pl_b4",
          characterId: "pl_milo",
          text: "Mom, it's pulling — the TV man says it's time — MOM —",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_closet",
          label: "The glowing closet",
          bounds: { x: 70, y: 30, w: 16, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Inside the closet, where the clothes should be, the light is deepest — a hallway of static going back and back, and at the end of it, a small silhouette.",
          },
        },
      ],
      choices: [
        {
          id: "pl_grab",
          text: "GRAB MILO — HOLD ON!",
          targetSceneId: "pl_search",
          attitudeTag: "Neutral",
          quickTime: true,
          qtePrompt: "Something is pulling him into the light — HOLD ON!",
          qteHeartbeat: true,
          qteShakyCam: true,
          timeLimitSeconds: 5,
          consequences: { setFlags: ["pl_abducted", "pl_held"] },
          timedOutTargetSceneId: "pl_search",
          timedOutConsequences: { setFlags: ["pl_abducted", "pl_lost"] },
        },
      ],
    },

    /* ==================== 6. THE SEARCH ==================== */
    {
      id: "pl_search",
      title: "The Quiet House",
      background: "/img/poltergeist/bg-parents-bedroom.jpg",
      ambientAudio: "drone",
      cinematic: {
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.55,
      },
      letterbox: true,
      prose:
        "The rope of the pulley in the closet lies where it fell. The house is very quiet now — the kind of quiet a house makes when it is listening. Milo's voice came once through the television in the hall, small and far away, and then the set went to snow. Ellen has not stopped moving since.",
      dialogueBeats: [
        {
          id: "pl_s1",
          characterId: "pl_ellen",
          text: "He's IN the house. I heard him. He came through the TV — the TV, Daniel — he said he can see us, he said the TV man wants us to know he's safe.",
        },
        {
          id: "pl_s2",
          characterId: "pl_daniel",
          text: "We're going to find him. We're going to tear this house apart until we find him.",
        },
        {
          id: "pl_s3",
          characterId: "pl_emma",
          background: "/img/poltergeist/bg-kids-bedroom.jpg",
          backgroundTransition: "crossfade",
          text: "His room is wrong. The blanket's still tucked in. Like he was lifted straight up out of it.",
        },
        {
          id: "pl_s4",
          characterId: "pl_presence",
          conditionRule: { requiresFlags: ["pl_shouted"] },
          text: "Shouting. We like shouting. Shout again — it helps us hear where you are.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_tv_hall",
          label: "The television",
          bounds: { x: 74, y: 40, w: 16, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The snow turns over and over. For a moment a small voice is almost in it — counting down, the way Milo counts when he's hiding.",
          },
        },
        {
          id: "pl_hs_window",
          label: "The open window",
          bounds: { x: 30, y: 20, w: 16, h: 22 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The window is wide open, though it is cold. The rope's loose end hangs out into the dark, as if someone was lowered — or as if someone climbed down in a hurry.",
          },
        },
      ],
      choices: [
        {
          id: "pl_search_kids",
          text: "Search the kids' room again.",
          targetSceneId: "pl_search_bedroom",
          attitudeTag: "Clever",
        },
        {
          id: "pl_search_living",
          text: "Check the living room — and the TV.",
          targetSceneId: "pl_search_living",
          attitudeTag: "Clever",
        },
        {
          id: "pl_search_yard",
          text: "Take a flashlight out back, by the tree.",
          targetSceneId: "pl_search_yard",
          attitudeTag: "Clever",
        },
        {
          id: "pl_shout",
          text: "Shout into the static — demand it give him back.",
          reply: true,
          attitudeTag: "Aggressive",
          consequences: {
            setFlags: ["pl_shouted"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "The house heard you.",
        },
        {
          id: "pl_call_voss",
          text: "Call Dr. Voss.",
          targetSceneId: "pl_science",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 7. SEARCH — THE KIDS' ROOM ==================== */
    {
      id: "pl_search_bedroom",
      title: "What He Left Behind",
      background: "/img/poltergeist/bg-kids-bedroom.jpg",
      ambientAudio: "drone",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "58% 62%",
        zoomDuration: 14,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.55,
      },
      letterbox: true,
      prose:
        "The closet is dark and ordinary now, as if it has been scolded back into being a closet. On the floor by the bedpost, where no one has walked, something small glints in the beam of Ellen's flashlight.",
      dialogueBeats: [
        {
          id: "pl_rb1",
          characterId: "pl_ellen",
          text: "His bracelet. He never — he never takes it off. Not ever. I tied it on him last summer and he swore he'd wear it to his wedding.",
        },
        {
          id: "pl_rb2",
          characterId: "pl_daniel",
          text: "Maybe it just caught on the bedpost while he was — while he got up.",
        },
        {
          id: "pl_rb3",
          characterId: "pl_ellen",
          text: "Daniel. It's cold. It's cold like the floorboards, like the glass. And the knot's torn. This wasn't slipped off. It was pulled.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_bracelet",
          label: "Milo's bracelet",
          bounds: { x: 46, y: 70, w: 12, h: 9 },
          cursor: "take",
          showItemImage: false,
          action: {
            type: "giveItem",
            itemGranted: "pl_bracelet",
            then: [{ type: "setFlag", flagSet: "pl_found_bracelet" }],
          },
          verbs: {
            look: {
              type: "showText",
              text: "The friendship bracelet, threads dulled by a summer of wearing. The knot is torn — yanked, not untied. It is very, very cold.",
            },
          },
        },
        {
          id: "pl_hs_closet_now",
          label: "The closet",
          bounds: { x: 70, y: 30, w: 16, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Just coats and sneakers now. But the air in front of it is cold, and the wire hangers are all swaying, very slightly, in no draft at all.",
          },
        },
      ],
      choices: [
        {
          id: "pl_rb_back",
          text: "Back to the search.",
          targetSceneId: "pl_search",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 8. SEARCH — THE LIVING ROOM ==================== */
    {
      id: "pl_search_living",
      title: "The Recorder",
      background: "/img/poltergeist/bg-living-room.jpg",
      ambientAudio: "tension",
      cinematic: {
        colorGrade: "spielberg-golden",
        filmGrade: true,
        filmGradeStrength: 0.45,
        lights: [{ x: 50, y: 52, color: "#cfe4ff", intensity: 0.4, size: 40 }],
      },
      letterbox: true,
      prose:
        "The VCR is still running. It has been recording the empty living room all night — the couch, the rug, the snow on the screen. Daniel rewinds it with shaking hands.",
      dialogueBeats: [
        {
          id: "pl_rl1",
          characterId: "pl_daniel",
          text: "It's just static. Eleven seconds of static and — wait. Turn it up.",
        },
        {
          id: "pl_rl2",
          characterId: "pl_emma",
          text: "That's Milo. That's his voice, counting down. ...four... three... two...",
        },
        {
          id: "pl_rl3",
          characterId: "pl_ellen",
          background: "/img/poltergeist/bg-other-side.jpg",
          backgroundTransition: "crossfade",
          text: "He's counting for hide-and-seek. He always counts down from ten when he hides. He wants us to come find him.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_tape",
          label: "The VHS tape",
          bounds: { x: 58, y: 60, w: 12, h: 10 },
          cursor: "take",
          showItemImage: false,
          action: {
            type: "giveItem",
            itemGranted: "pl_tape",
            then: [{ type: "setFlag", flagSet: "pl_found_tape" }],
          },
          verbs: {
            look: {
              type: "showText",
              text: "A blank cassette, label worn off. Somebody has been recording the snow. The counter shows the tape stopped at eleven seconds past three in the morning.",
            },
          },
        },
      ],
      choices: [
        {
          id: "pl_rl_back",
          text: "Back to the search.",
          targetSceneId: "pl_search",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 9. SEARCH — THE YARD ==================== */
    {
      id: "pl_search_yard",
      title: "The Ground Under the Oak",
      background: "/img/poltergeist/bg-yard.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 78%",
        zoomDuration: 14,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.55,
      },
      letterbox: true,
      prose:
        "The rain has stopped, and the yard steams faintly under the moon. Beneath the oak, the grass lies in a long, shallow depression — as if something beneath the lawn has settled, or as if the ground has been raked into a shape it did not choose.",
      dialogueBeats: [
        {
          id: "pl_ry1",
          characterId: "pl_daniel",
          background: "/img/poltergeist/bg-tree.jpg",
          backgroundTransition: "crossfade",
          text: "The roots. The old tree's roots run right under the house. The previous owner — I never met him. The lot sat empty for years before they built here.",
        },
        {
          id: "pl_ry2",
          characterId: "pl_ellen",
          background: "/img/poltergeist/bg-kids-bedroom.jpg",
          backgroundTransition: "crossfade",
          text: "It's not the land, Daniel. It's the house. The house was waiting for somebody to move in and leave the door open. We left the door open.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_ground",
          label: "The disturbed ground",
          bounds: { x: 34, y: 66, w: 34, h: 18 },
          cursor: "look",
          action: {
            type: "showText",
            then: [{ type: "setFlag", flagSet: "pl_found_ground" }],
            text: "The grass under the oak is cold, even through the soil. Whatever is buried here was never a body. It was a beginning — the first stone of a house that was going to be hungry.",
          },
        },
      ],
      choices: [
        {
          id: "pl_ry_back",
          text: "Back inside.",
          targetSceneId: "pl_search",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ==================== 10. DR. VOSS ==================== */
    {
      id: "pl_science",
      title: "The Instruments",
      background: "/img/poltergeist/bg-science.jpg",
      ambientAudio: "drone",
      cinematic: {
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.5,
      },
      letterbox: true,
      prose:
        "Dr. Ada Voss arrives at four in the morning with two cases of instruments and no expression of surprise. She wires the house like a patient: thermistors on the walls, a reel-to-reel in the hall, a camera aimed at the television. The needles do not move. Then, for one second, every needle pegs to the right at once.",
      dialogueBeats: [
        {
          id: "pl_sc1",
          characterId: "pl_voss",
          text: "I have recorded thirty years of disturbances, Mr. Harrow. This is not a disturbance. This is a coherent field. Something in this house is broadcasting — and it is not the television.",
        },
        {
          id: "pl_sc2",
          characterId: "pl_daniel",
          text: "Broadcasting what? To where?",
        },
        {
          id: "pl_sc3",
          characterId: "pl_voss",
          text: "To the boy. And it is pulling him back. Do you know a woman named Clara Marsh? Because my instruments have stopped being useful, and hers are about to begin.",
        },
        {
          id: "pl_sc4",
          characterId: "pl_ellen",
          text: "Call her. Whoever she is, call her.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_instruments",
          label: "The instruments",
          bounds: { x: 8, y: 50, w: 24, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The paper chart shows a single, enormous spike at 3:11 a.m. — the exact moment the tape stopped. Under it, Voss has written a single word: 'coherent.'",
          },
        },
      ],
      choices: [
        {
          id: "pl_bring_clara",
          text: "Bring in Clara Marsh.",
          targetSceneId: "pl_medium",
          attitudeTag: "Neutral",
        },
        {
          id: "pl_drill",
          text: "Drill into the wall — cut whatever is broadcasting.",
          targetSceneId: "pl_medium",
          attitudeTag: "Aggressive",
          consequences: {
            setFlags: ["pl_drilled"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "The house felt the drill bite into its wall.",
        },
      ],
    },

    /* ==================== 11. THE MEDIUM ==================== */
    {
      id: "pl_medium",
      title: "Clara Marsh",
      background: "/img/poltergeist/bg-seance.jpg",
      ambientAudio: "drone",
      onEnterActions: [{ consequences: { addItems: ["pl_rope"] } }],
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 50%",
        zoomDuration: 13,
        colorGrade: "spielberg-golden",
        filmGrade: true,
        filmGradeStrength: 0.45,
        lights: [{ x: 50, y: 42, color: "#ffd9a0", intensity: 0.5, size: 34, flare: true }],
      },
      letterbox: true,
      prose:
        "Clara Marsh is smaller than the doorframe and older than the fear in the room. She walks the house once without speaking, lays a hand flat on the television, and then turns to the family with a gentleness that makes the instruments seem like toys.",
      dialogueBeats: [
        {
          id: "pl_m1",
          characterId: "pl_clara",
          text: "The boy is not lost. He is between. The television is only the easiest door — the thing on the other side likes light and noise, and the snow is both. It has been reaching through for years. Tonight it reached all the way.",
        },
        {
          id: "pl_m1b",
          characterId: "pl_presence",
          conditionRule: { requiresFlags: ["pl_drilled"] },
          text: "You drilled into the wall, Mr. Harrow. Did you think we would not feel it? Every house feels the hammer. Every house keeps the hole.",
        },
        {
          id: "pl_m2",
          characterId: "pl_ellen",
          text: "Can we get him back?",
        },
        {
          id: "pl_m3",
          characterId: "pl_clara",
          background: "/img/poltergeist/bg-parents-bedroom.jpg",
          backgroundTransition: "crossfade",
          text: "Someone must go through and find him. The rest of you hold the rope — the rope is the only thing that keeps the door from closing. Whatever happens on the other side, do not let go. And whatever speaks to you, do not believe the first thing it says.",
        },
        {
          id: "pl_m4",
          characterId: "pl_daniel",
          text: "I'll go. I'm his father.",
        },
        {
          id: "pl_m5",
          characterId: "pl_ellen",
          text: "No. I've been hearing him since the beginning. It's me the voice knows. Let me.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_rope",
          label: "Clara's rope",
          bounds: { x: 42, y: 70, w: 16, h: 10 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Clara has already tied the rope around her own waist and loosened it. 'It held for me twice,' she says. 'It will hold for you. It has to.'",
          },
        },
      ],
      choices: [
        {
          id: "pl_ellen_cross",
          text: "Ellen goes into the light.",
          targetSceneId: "pl_other_side",
          attitudeTag: "Clever",
          consequences: { setFlags: ["pl_ellen"] },
        },
        {
          id: "pl_daniel_cross",
          text: "Daniel goes in — he won't let her.",
          targetSceneId: "pl_other_side",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["pl_daniel"] },
        },
      ],
    },

    /* ==================== 12. THE OTHER SIDE ==================== */
    {
      id: "pl_other_side",
      title: "The Far Side of the Signal",
      background: "/img/poltergeist/bg-other-side.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      particles: "smoke",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 46%",
        zoomDuration: 20,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.6,
        lights: [{ x: 50, y: 40, color: "#dff4ff", intensity: 0.5, size: 42, flare: true }],
      },
      letterbox: true,
      prose:
        "There is no floor and no wall here, only the churn of snow turned to weather, and a light that is not coming from anywhere. The rope is warm in your hands, the only true thing in the room. Far away, at the end of a corridor of static, a small shape sits with its back to you.",
      dialogueBeats: [
        {
          id: "pl_o1",
          characterId: "pl_presence",
          text: "There you are. We watched you decide. We watch everyone decide. Come closer — the boy has been asking for you, in the way children ask for things they cannot pronounce.",
        },
        {
          id: "pl_o_scare",
          characterId: "pl_presence",
          expression: "V.O.",
          silent: true,
          audioUrl: "/sfx/jumpscare-2.wav",
          background: "/img/poltergeist/char-presence.jpg",
          backgroundTransition: "cut",
          backgroundHold: false,
          cinematic: {
            mode: "shake",
            shakeAmount: 0.8,
            shakeRotation: 1.6,
            shakeDuration: 0.16,
            dimAmount: 0.3,
            colorGrade: "nolan-imax",
            filmGrade: true,
            filmGradeStrength: 0.6,
            lights: [{ x: 50, y: 44, color: "#ffffff", intensity: 0.75, size: 52 }],
          },
          text: "",
        },
        {
          id: "pl_o2",
          characterId: "pl_milo",
          text: "Mom? Dad? I knew you'd come. The TV man says not to go near the light, but the light is where you are. Are you really there, or are you the snow too?",
        },
        {
          id: "pl_o3",
          characterId: "pl_presence",
          conditionRule: { requiresFlags: ["pl_ellen"] },
          text: "A mother, then. Good. Mothers hold on too long — and too long is exactly how long we like.",
        },
        {
          id: "pl_o4",
          characterId: "pl_presence",
          conditionRule: { requiresFlags: ["pl_daniel"] },
          text: "The father. The one who does not believe. Belief was never required, Mr. Harrow. Only the open door.",
        },
        {
          id: "pl_o5",
          characterId: "pl_presence",
          text: "Your boy is happy here. He plays with the other children, the ones who were here first, the ones under the grass and behind the wallpaper. He is smiling. He wants to stay. Why would you drag him back into a house that was always ours?",
          lie: {
            claim: "The Presence insists Milo is happy and wants to stay in the static.",
            evidenceItemIds: ["pl_bracelet"],
            contradictedFlag: "pl_truth_earned",
            caughtBeat: {
              id: "pl_o5_caught",
              characterId: "pl_presence",
              conditionRule: { requiresFlags: ["pl_truth_earned"] },
              text: "You hold up the bracelet and the static goes silent — a whole world of noise, holding its breath. '...He pulled it off,' the voice says, much smaller now. 'He threw it at us. He calls for you at night. The boy is NOT playing, and he is NOT happy, and you should not have been able to see that.'",
            },
            wrongBeat: {
              id: "pl_o5_wrong",
              characterId: "pl_presence",
              text: "That is not proof. That is a story you tell yourself. Show me something that is not yours, and then we will speak of truth.",
            },
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 2 }],
            },
            wrongConsequences: {
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "The Presence knows you see through it now.",
          },
        },
        {
          id: "pl_o6",
          characterId: "pl_milo",
          conditionRule: { requiresFlags: ["pl_truth_earned"] },
          text: "Mom... the TV man is mad now. He says I have to stop calling. He says if I keep calling he'll turn the snow off and I'll be nowhere. Please — don't let go of the rope.",
        },
      ],
      hotspots: [
        {
          id: "pl_hs_void",
          label: "The distant shape",
          bounds: { x: 44, y: 40, w: 12, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "It is Milo. His back is to you, and he is counting down under his breath, the way he does when he hides. ...four... three... two... He is waiting to be found.",
          },
        },
      ],
      choices: [
        {
          id: "pl_call_milo",
          text: "Call Milo to you through the dark.",
          targetSceneId: "pl_rescue",
          attitudeTag: "Clever",
          memoryLog: "pl_called_milo",
        },
        {
          id: "pl_deeper",
          text: "Walk deeper into the light. Let go of the rope.",
          targetSceneId: "pl_end_dark",
          attitudeTag: "Neutral",
          consequences: {
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "You let go. The house has been waiting for that.",
        },
      ],
    },

    /* ==================== 13. THE RESCUE ==================== */
    {
      id: "pl_rescue",
      title: "Hold the Rope",
      background: "/img/poltergeist/bg-parents-bedroom.jpg",
      ambientAudio: "tension",
      musicMode: "none",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.45,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.6,
        lights: [{ x: 50, y: 40, color: "#dff4ff", intensity: 0.6, size: 44, flare: true }],
      },
      letterbox: true,
      prose:
        "Milo's hand closes around yours, and he is real, and he is cold as river water. The moment he is through the light, the house wakes up — every light in it blazes, every door slams, and the television screams with a voice like a thousand channels at once. The rope burns in your palms. Behind you, the corridor of static begins, slowly, to close.",
      dialogueBeats: [
        {
          id: "pl_r0",
          characterId: "pl_milo",
          text: "I heard you. I heard you all the way through the snow.",
          recalls: {
            pl_called_milo:
              "You called me by name — I heard you all the way through the snow, and I came to your voice.",
          },
        },
        {
          id: "pl_r1",
          characterId: "pl_milo",
          text: "It's pulling! The TV man says he'll keep you! He says the door is his and I can't take you through it!",
        },
        {
          id: "pl_r2",
          characterId: "pl_ellen",
          conditionRule: { requiresFlags: ["pl_daniel"] },
          text: "Daniel — PULL! Don't you dare let go!",
        },
        {
          id: "pl_r3",
          characterId: "pl_daniel",
          conditionRule: { requiresFlags: ["pl_ellen"] },
          text: "Ellen — I've got you! Both of you! PULL!",
        },
        {
          id: "pl_r_scare",
          characterId: "pl_presence",
          expression: "V.O.",
          silent: true,
          audioUrl: "/sfx/jumpscare-1.wav",
          background: "/img/poltergeist/scare-face.jpg",
          backgroundTransition: "cut",
          backgroundHold: false,
          cinematic: {
            mode: "shake",
            shakeAmount: 0.85,
            shakeRotation: 1.6,
            shakeDuration: 0.16,
            dimAmount: 0.3,
            colorGrade: "nolan-imax",
            filmGrade: true,
            filmGradeStrength: 0.6,
            lights: [{ x: 50, y: 44, color: "#ffffff", intensity: 0.8, size: 54 }],
          },
          text: "",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "pl_hold_rope",
          text: "HOLD THE ROPE — PULL!",
          targetSceneId: "pl_aftermath",
          attitudeTag: "Neutral",
          quickTime: true,
          qtePrompt: "The house is pulling back — DON'T LET GO!",
          qteHeartbeat: true,
          qteShakyCam: true,
          timeLimitSeconds: 6,
          consequences: { setFlags: ["pl_rescued"] },
          timedOutTargetSceneId: "pl_end_silver",
          timedOutConsequences: { setFlags: ["pl_fell"] },
        },
      ],
    },

    /* ==================== 14. THE HOUSE LETS GO ==================== */
    {
      id: "pl_aftermath",
      title: "The House Lets Go",
      background: "/img/poltergeist/bg-implosion.jpg",
      ambientAudio: "drone",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.5,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.6,
        lights: [{ x: 50, y: 30, color: "#ffffff", intensity: 0.7, size: 50 }],
      },
      letterbox: true,
      prose:
        "They come through the front door as the house comes apart behind them — not burning, not collapsing, but folding, the windows one by one turning to a light that has no business in a house. The four of them stand in the wet street in their nightclothes, and the television is still on somewhere inside, and then it is not a house anymore. It is a hole in the air where a house used to be.",
      dialogueBeats: [
        {
          id: "pl_a1",
          characterId: "pl_emma",
          text: "It's gone. The whole house. Where the house was, there's just — nothing. And dirt.",
        },
        {
          id: "pl_a2",
          characterId: "pl_milo",
          text: "The TV man said if I kept calling, he'd turn the snow off. I kept calling. So he turned it off.",
        },
        {
          id: "pl_a3",
          characterId: "pl_voss",
          text: "Whatever field held that house together, Mr. Harrow — it is gone. I have never seen anything like it. I have spent my life wanting to. I find I did not want to after all.",
        },
        {
          id: "pl_a4",
          characterId: "pl_clara",
          background: "/img/poltergeist/bg-other-side.jpg",
          backgroundTransition: "fade-black",
          text: "It didn't lose the boy, so it lost its temper. These places want to be believed in. When a family looks it in the eye and refuses, the house has nothing left to hold. Go now. Don't look back. Looking back is the one thing it can still make you do.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "pl_leave",
          text: "Take your family and walk out of the streetlight.",
          targetSceneId: "pl_end_gold",
          attitudeTag: "Clever",
        },
      ],
    },

    /* ==================== 15. GOLD — THEY CAME HOME ==================== */
    {
      id: "pl_end_gold",
      title: "Ending — They Came Home",
      isEnding: true,
      background: "/img/poltergeist/bg-street-dawn.jpg",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Midnight in the Rain2.mp3",
      musicFadeSeconds: 2.0,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 80%",
        zoomDuration: 18,
        colorGrade: "spielberg-golden",
        filmGrade: true,
        filmGradeStrength: 0.35,
      },
      letterbox: true,
      prose:
        "They check into a motel off the highway with the clothes on their backs and a shoebox of what they could carry. Milo sleeps between his parents, the bracelet tied again on his wrist — his mother retied it herself, in the parking lot, with fingers that would not stop trembling. In the morning they will buy new clothes and argue about a new house. Tonight there is only the sound of the highway, and the breathing of a family that came back whole.",
      dialogueBeats: [
        {
          id: "pl_g1",
          characterId: "pl_ellen",
          text: "He's warm. Daniel, he's warm. I keep checking.",
        },
        {
          id: "pl_g2",
          characterId: "pl_daniel",
          text: "He's home. We're all home. Whatever home means now.",
        },
        {
          id: "pl_g3",
          characterId: "pl_presence",
          background: "/img/poltergeist/bg-living-room.jpg",
          backgroundTransition: "fade-black",
          text: "The boy kept calling, and you kept holding, and the door closed with us on the wrong side of it. But a house is not a place, Mrs. Harrow. A house is a story a family tells. And we are very, very patient listeners.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THEY CAME HOME",
        recap:
          "You saw through the Presence's lie, held the rope through the closing door, and walked your family out into the street. The house folded in on itself — and you did not look back.",
      },
    },

    /* ==================== 16. SILVER — THE CROSSING'S TOLL ==================== */
    {
      id: "pl_end_silver",
      title: "Ending — The Crossing's Toll",
      isEnding: true,
      background: "/img/poltergeist/bg-other-side.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      particles: "smoke",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 46%",
        zoomDuration: 18,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.5,
      },
      letterbox: true,
      prose:
        "Milo comes through — small, cold, alive — into his father's arms. But the rope goes slack for one heartbeat too long, and when the family looks back, the person who went in after him is still there, at the end of the corridor of snow, already smaller, already facing away. The house closes around them with a sound like a door shutting in another room. The boy is home. The crossing kept its toll.",
      dialogueBeats: [
        {
          id: "pl_sv1",
          characterId: "pl_ellen",
          conditionRule: { requiresFlags: ["pl_daniel"] },
          text: "Daniel! DANIEL! Come back through! The door's closing — Daniel, hold the rope!",
        },
        {
          id: "pl_sv2",
          characterId: "pl_daniel",
          conditionRule: { requiresFlags: ["pl_ellen"] },
          text: "Ellen! ELLEN, NO — don't you stay in there, don't you let go —",
        },
        {
          id: "pl_sv3",
          characterId: "pl_presence",
          text: "A toll was always the price. You wanted the boy? The boy is yours. We keep what we are owed. It is the only arithmetic this house has ever understood.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "THE CROSSING'S TOLL",
        recap:
          "You pulled Milo back — but the rope went slack at the last, and the one who crossed over stayed behind. Some doors only open one way, and some prices are paid in the people who loved the hardest.",
      },
    },

    /* ==================== 17. GAME OVER — THE HOUSE KEEPS WHAT IT CATCHES ==================== */
    {
      id: "pl_end_dark",
      title: "Ending — The House Keeps What It Catches",
      isEnding: true,
      background: "/img/poltergeist/bg-other-side.jpg",
      ambientAudio: "drone",
      musicMode: "none",
      particles: "storm",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.4,
        colorGrade: "nolan-imax",
        filmGrade: true,
        filmGradeStrength: 0.6,
        lights: [{ x: 50, y: 40, color: "#ffffff", intensity: 0.65, size: 46 }],
      },
      letterbox: true,
      prose:
        "The snow closes over everything. Somewhere behind you, the rope that was your way back goes slack — or was it ever tied at all? — and the only light is the light you walked toward, and the only sound is the sound of a television left on in an empty room, in a house on Cypress Lane, waiting for the next family to move in and leave the door open.",
      dialogueBeats: [
        {
          id: "pl_d1",
          characterId: "pl_presence",
          text: "There. That was not so hard. The pretty house, the lawn, the mortgage, the two cars — and now, the voices in the walls. We keep what we catch. And we have been catching families for a very long time.",
        },
        {
          id: "pl_d2",
          characterId: "pl_milo",
          background: "/img/poltergeist/bg-living-room.jpg",
          backgroundTransition: "fade-black",
          text: "Mom... Dad... the TV man says you can stay with me now. He says it snows here all the time, and if you're very quiet, you can almost hear the people watching us from the other side of the glass.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "THE HOUSE KEEPS WHAT IT CATCHES",
        recap:
          "The house noticed you — or you let go — and the door closed with your family still on the far side. 27 Cypress Lane keeps what it catches. And it has been catching families for a very long time.",
      },
    },
  ],
};
