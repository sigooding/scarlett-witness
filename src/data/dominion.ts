import type { Story } from "../types";

/**
 * DOMINION — a playable noir-rail adaptation of the 1940s pulp science
 * fiction novelette by Arthur J. Burks.
 *
 * Two US Government agents, fever-ridden and lost in the South American
 * jungle, walk into a nightmare: a race of metal men — the New People — and,
 * behind them, a German officer building an army to put the whole world under
 * the swastika. The player steers Agent Jack Leyson through the encounter
 * with Zehn, the dead city, the gold mines, the laboratory of Professor
 * Grosboeck, and the final, nitro-fuelled gamble on the river.
 *
 * Engine features exercised (deliberately, so the case doubles as a test bed):
 *   - Credits node with a montage + slam title card.
 *   - Quick-time choice (draw on Zehn) with a real hesitation branch.
 *   - Hidden/gated choices (requiresItems / excludesItems), reply choices with
 *     memoryLog tags recalled by later beats, and flag-gated beats.
 *   - Examine/collect hotspots that grant clue items; item gates downstream.
 *   - Four endings: gold, silver, and two game-overs.
 *   - Story-wide pulp dialogue-box theme (sepia-pulp HUD, poster headings).
 *
 * Art for this case lives in /img/dominion/ (generated plates + portraits).
 */
export const DOMINION: Story = {
  id: "dominion",
  title: "Dominion",
  tagline: "Deep in the jungle, a race of metal men waits to rule the world.",
  gameKind: "noir-rail",
  coverImage: "/img/dominion/cover.jpg",
  startSceneId: "dm_title",

  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "sepia-pulp",
    accentColor: "#e8a33d",
    reserveLines: 4,
  },

  characters: [
    { id: "horton", name: "Roger Horton", role: "Agent — U.S. Bureau", avatarUrl: "/img/dominion/ch-horton.jpg", trustMeter: 0 },
    { id: "leyson", name: "Jack Leyson", role: "Agent — U.S. Bureau", avatarUrl: "/img/dominion/ch-leyson.jpg", trustMeter: 0 },
    { id: "zehn", name: "Zehn", role: "One of the New People", avatarUrl: "/img/dominion/ch-zehn.jpg", trustMeter: 0 },
    { id: "doctor", name: "Einundzwanzig", role: "The Healer", avatarUrl: "/img/dominion/ch-doctor.jpg", trustMeter: 0 },
    { id: "shama", name: "Shama", role: "The Forest Girl", avatarUrl: "/img/dominion/ch-shama.jpg", trustMeter: 0 },
    { id: "glauber", name: "Von Glauber", role: "Master of the New People", avatarUrl: "/img/dominion/ch-glauder.jpg", trustMeter: 0 },
    { id: "grosboeck", name: "Prof. Grosboeck", role: "The Engineer", avatarUrl: "/img/dominion/ch-grosboeck.jpg", trustMeter: 0 },
  ],

  items: [
    {
      id: "zehn_plate",
      name: "A Shard of Zehn",
      icon: "⚙️",
      isClue: true,
      description: "A palm-sized plate of bright metal knocked from the stranger's shoulder by a bullet. Under it: gears, wires, a tiny glowing eye.",
      flavorText: "No blood. No bone. Whatever walked out of the jungle, it was not a man.",
    },
    {
      id: "gold_dust",
      name: "Gravel & Gold",
      icon: "🪙",
      isClue: true,
      description: "A fistful of river gravel, heavy with yellow dust and flecks of raw gold, scooped from the workings in the deep valley.",
      flavorText: "Somewhere below, machines are chewing a river of gold out of the dark.",
    },
    {
      id: "nitro_vial",
      name: "The Vials",
      icon: "🧪",
      isClue: true,
      description: "Small glass vials of nitroglycerin, smuggled out of the powder magazine and hidden in a girl's golden hair. Handle with terror.",
      flavorText: "One of these, dropped, would put you across the valley in pieces.",
    },
    {
      id: "schematic",
      name: "Grosboeck's Notes",
      icon: "📐",
      isClue: true,
      description: "The professor's own sketches of the New People — their radio brains, their ruby camera eyes, the switch that sets them marching.",
      flavorText: "In the margins, in a shaking hand: 'they were to be so useful.'",
    },
  ],

  flagNotes: {
    kept_nerve: "You ordered Horton to hold fire. Zehn noted it.",
    drew_iron: "You let Horton shoot — and watched the bullets do nothing.",
    froze_gun: "You hesitated on the trigger, and Zehn read the moment.",
    examined_zehn: "You looked close enough to see the machine under the skin.",
    saw_robots: "You watched the metal men thread the dead city like fireflies.",
    trusted_shama: "You trusted the forest girl. It is the only reason she came back for you.",
    refused_shama: "You refused the forest girl. The cell stayed empty when it mattered.",
    saw_mines: "You saw the robot miners pulling gold from the deep valley.",
    saw_army: "You caught the glow of the second cave — the one full of standing metal.",
    fought_glauber: "You fought Von Glauber's men. It cost you.",
    went_quiet: "You went quietly when Von Glauber's men took you.",
    took_nitro: "You took the vials from Shama's hair.",
    played_nitro: "You played the vials — and the whole room went still.",
    robots_turned: "Grosboeck sent his army marching into the trees to break itself.",
    boat_first: "You demanded the boat before the laboratory was wired.",
    spared_glauder: "You left Von Glauber to the justice of the Indians.",
    killed_glauder: "You put a bullet in Von Glauber and walked away.",
  },

  briefing: {
    gameInfo:
      "A playable adaptation of 'Dominion' by Arthur J. Burks. Two US agents, lost and fevered in the South American jungle, discover a hidden city of metal men — and the German master building an army to conquer the world. Collect the evidence, win the forest girl's trust, and get out before the New People march.",
    objective: "Escape the hidden valley, and stop Von Glauber's metal army before it can be turned on the world.",
    winConditions: [
      "Win Shama's trust so she brings you the vials.",
      "Play the vials, turn Grosboeck's army loose to destroy itself, and destroy the laboratory.",
    ],
    loseConditions: [
      "Face Von Glauber with empty hands.",
      "Refuse Shama, and stand in the cell with nothing when the guards come.",
    ],
  },

  layout: {
    dm_title: { x: 0, y: 200 },
    dm_jungle: { x: 360, y: 200 },
    dm_bullets: { x: 360, y: 420 },
    dm_hesitate: { x: 620, y: 420 },
    dm_follow: { x: 720, y: 200 },
    dm_city: { x: 1080, y: 200 },
    dm_doctor: { x: 1440, y: 200 },
    dm_shama: { x: 1800, y: 200 },
    dm_cave: { x: 2160, y: 200 },
    dm_mines: { x: 2520, y: 200 },
    dm_ambush: { x: 2880, y: 200 },
    dm_lab: { x: 3240, y: 60 },
    dm_army: { x: 3600, y: 260 },
    dm_glauder_shama: { x: 3240, y: 460 },
    dm_cell: { x: 3600, y: 460 },
    dm_finale: { x: 3960, y: 260 },
    dm_showdown: { x: 4320, y: 60 },
    dm_bluff: { x: 4320, y: 460 },
    dm_escape: { x: 4680, y: 60 },
    dm_escape_silver: { x: 4680, y: 260 },
    dm_end_gold: { x: 5040, y: 60 },
    dm_end_silver: { x: 5040, y: 260 },
    dm_end_dominion: { x: 5040, y: 460 },
    dm_end_mine: { x: 5400, y: 460 },
  },

  scenes: [
    /* ============================================================ */
    /*  TITLE                                                       */
    /* ============================================================ */
    {
      id: "dm_title",
      title: "Opening Credits",
      nodeType: "credits",
      background: "/img/dominion/bg-title.jpg",
      letterbox: true,
      prose: "",
      credits: {
        title: "DOMINION",
        subtitle: "A Great Science Fiction Novelette",
        font: "pulp",
        style: "cards",
        titleEntrance: "slam",
        titleColor: "#ffd27a",
        accentColor: "#e8a33d",
        cardSeconds: 3.2,
        montage: [
          "/img/dominion/bg-title.jpg",
          "/img/dominion/cover.jpg",
          "/img/dominion/bg-city.jpg",
          "/img/dominion/bg-mines.jpg",
        ],
        montageSeconds: 4.5,
        lines: [
          { role: "Based on the novelette by", name: "Arthur J. Burks" },
          { role: "Adapted for the engine by", name: "Studio" },
          { role: "Starring", name: "Jack Leyson, Roger Horton — and the New People" },
        ],
      },
      autoAdvanceTargetSceneId: "dm_jungle",
      autoAdvanceDelaySeconds: 22,
    },

    /* ============================================================ */
    /*  CHAPTER I — COLD RESCUE                                      */
    /* ============================================================ */
    {
      id: "dm_jungle",
      title: "Chapter I — Cold Rescue",
      background: "/img/dominion/bg-jungle.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 4, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.45 },
      transition: "fade-black",
      prose:
        "Three weeks of fever. The carriers gone like wraiths in the night, the duffel lost to a rapids that did not care. And now, on a trail no map ever drew, the thing both agents had stopped believing in stood in front of them: a white man in skin-tight clothes, square-toed shoes, a fireman's helmet with the brim cut away — and a face so empty of feeling it might have been a mask. The heat said ninety degrees. Jack Leyson went ice-cold anyway.",
      dialogueBeats: [
        { id: "dm_j_b1", characterId: "horton", text: "Holy Mother! Take a look at that, will you? Jack — my teeth are chattering, and it ain't the fever." },
        { id: "dm_j_b2", characterId: "leyson", text: "Steady, Rog. Whatever he is, he hasn't fired. He hasn't even twitched." },
        { id: "dm_j_b3", characterId: "zehn", text: "You are my prisoners, gentlemen. You will offer no resistance. You will follow me." },
        { id: "dm_j_b4", characterId: "horton", text: "He doesn't even disarm us, Jack. What on earth is this, anyway?" },
        { id: "dm_j_b5", characterId: "zehn", text: "You have the choice you have had all along: a place to rest, unmolested — or the jungle. And you cannot last much longer in the jungle." },
      ],
      hotspots: [
        {
          id: "dm_j_h1",
          label: "Study the stranger",
          bounds: { x: 52, y: 28, w: 20, h: 46 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "The face does not breathe. The eyes do not blink. And where the sleeve is torn, there is no skin underneath — only the dull gleam of machined metal.",
            flagSet: "examined_zehn",
          },
        },
      ],
      choices: [
        {
          id: "dm_j_c_hold",
          text: "Order Horton to hold fire. Follow the stranger.",
          targetSceneId: "dm_follow",
          attitudeTag: "Clever",
          consequences: { setFlags: ["kept_nerve"] },
          rememberLine: "Zehn will remember that you kept your nerve.",
        },
        {
          id: "dm_j_c_draw",
          text: "Let Horton shoot him. Find out what this thing is made of.",
          targetSceneId: "dm_bullets",
          attitudeTag: "Aggressive",
          quickTime: true,
          timeLimitSeconds: 6,
          qtePrompt: "Horton's safety clicks off.",
          qteShakyCam: true,
          consequences: { setFlags: ["drew_iron"] },
          timedOutTargetSceneId: "dm_hesitate",
          timedOutConsequences: { setFlags: ["froze_gun"] },
        },
      ],
    },

    {
      id: "dm_hesitate",
      title: "The Moment Passes",
      background: "/img/dominion/bg-jungle.jpg",
      ambientAudio: "drone",
      transition: "fade",
      prose:
        "The seconds stretched like wet rope. By the time Leyson's hand closed on the idea of the gun, the stranger had already read the whole thought out of the air.",
      dialogueBeats: [
        { id: "dm_h_b1", characterId: "horton", text: "I — I couldn't. My hands won't do it, Jack. They just won't." },
        { id: "dm_h_b2", characterId: "zehn", text: "Good. Speech hurts me, gentlemen; gunfire would have been tedious. Follow." },
        { id: "dm_h_b3", characterId: "zehn", text: "And your weapon, Agent Horton — you will keep it. It is of no more use against me than your fever.", conditionRule: { requiresFlags: ["froze_gun"] } },
      ],
      choices: [
        { id: "dm_h_c1", text: "Follow him into the trees.", targetSceneId: "dm_follow" },
      ],
    },

    {
      id: "dm_bullets",
      title: "Lead",
      background: "/img/dominion/bg-bullets.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "shake", shakeAmount: 0.5, shakeDuration: 0.4, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.6 },
      transition: "cut",
      prose:
        "The forest roared three times in quick succession. Leyson heard the bullets strike — heard them smash into the stranger the way they might smash into a steel door — and the man did not go down. He did not even feel it. Horton's automatic dropped from nerveless fingers.",
      dialogueBeats: [
        { id: "dm_b_b1", characterId: "horton", text: "I heard them hit, Jack. I never miss. I HEARD them hit — and he's still standing." },
        { id: "dm_b_b2", characterId: "zehn", text: "Your rifles and automatics are useless against me. I can kill you both with my hands." },
        { id: "dm_b_b3", characterId: "leyson", text: "But who are you? WHAT are you?" },
        { id: "dm_b_b4", characterId: "zehn", text: "One of the New People. Call me Zehn, if you must have a name." },
      ],
      hotspots: [
        {
          id: "dm_b_h1",
          label: "The bright plate in the ferns",
          bounds: { x: 20, y: 62, w: 16, h: 20 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "zehn_plate", flagSet: "examined_zehn" },
        },
      ],
      choices: [
        { id: "dm_b_c1", text: "Follow him. There is nothing else left.", targetSceneId: "dm_follow" },
      ],
    },

    {
      id: "dm_follow",
      title: "Through the Green Dark",
      background: "/img/dominion/bg-follow.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "pan", panDirection: "left", panDistance: 4, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "The stranger walked through the jungle the way water finds downhill — without hurry, without doubt, threading paths that were not there until he made them. The two half-dead agents stumbled after him, listening to the fever and the silence.",
      dialogueBeats: [
        { id: "dm_f_b1", characterId: "leyson", text: "It is not too far, he says. Rog, keep your head. We'll see what he is when we get there." },
        { id: "dm_f_b2", characterId: "horton", text: "Zehn. Zehn is German for ten, Jack. Is that a clue, or a coincidence?" },
        { id: "dm_f_b3", characterId: "zehn", text: "You are the two gentlemen who have been expected. It is not much farther now.", conditionRule: { requiresFlags: ["kept_nerve"] } },
        { id: "dm_f_b4", characterId: "zehn", text: "You have learned what your bullets are worth. Remember it — it will keep you breathing.", conditionRule: { requiresFlags: ["drew_iron"] } },
        { id: "dm_f_b5", characterId: "leyson", text: "Under the torn sleeve there was metal, not skin. He walked through that jungle like he'd walked it a thousand years.", conditionRule: { requiresFlags: ["examined_zehn"] } },
        { id: "dm_f_b6", characterId: "leyson", text: "A shard of his shoulder. Gears and wire and a little glass eye. Not a man, Rog. A machine that talks.", conditionRule: { requiresItems: ["zehn_plate"] } },
      ],
      choices: [
        {
          id: "dm_f_c1",
          text: "Demand to know where he is taking you.",
          targetSceneId: "dm_city",
          attitudeTag: "Aggressive",
          consequences: { trustChanges: [{ characterId: "zehn", delta: -1 }] },
        },
        { id: "dm_f_c2", text: "Keep silent, and march.", targetSceneId: "dm_city", attitudeTag: "Neutral" },
      ],
    },

    /* ============================================================ */
    /*  CHAPTER II — DEEPENING MYSTERY                               */
    /* ============================================================ */
    {
      id: "dm_city",
      title: "Chapter II — The Dead City",
      background: "/img/dominion/bg-city.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade-black",
      prose:
        "The sun went down behind the mountains and a pale, lemonish moon came up over a city of jumbled black stone — all that remained of a forgotten civilization. And through it, in and out of the prehistoric streets, moved figures that seemed to reflect the moon's own light. Luminous, vaguely human. Their eyes were crimson.",
      dialogueBeats: [
        { id: "dm_c_b1", characterId: "horton", text: "It's like being on another planet, Jack. A city that goes back forever." },
        { id: "dm_c_b2", characterId: "leyson", text: "Look at them — like dimmers on ambulances, spraying red light. Mechanical men, Rog. Every one of them." },
        { id: "dm_c_b3", characterId: "zehn", text: "Follow. I will show you where you may rest. You are expected." },
        { id: "dm_c_b4", characterId: "leyson", text: "The eyes are lenses, Rog. Cameras. Whoever drives these things sees through those rubies — and talks through their metal mouths.", conditionRule: { requiresFlags: ["saw_robots"] } },
        { id: "dm_c_b5", characterId: "zehn", text: "The eyes are cameras, gentlemen. Lenses, and nothing more. My pilot is many miles away, and perfectly safe.", conditionRule: { requiresMemories: ["asked_eyes"] } },
        { id: "dm_c_b6", characterId: "horton", text: "And they're spraying red light — scanning the streets, photographing the whole dead place, over and over.", conditionRule: { requiresFlags: ["examined_zehn"] } },
      ],
      hotspots: [
        {
          id: "dm_c_h1",
          label: "Watch the metal men",
          bounds: { x: 30, y: 40, w: 40, h: 40 },
          cursor: "look",
          isRepeatable: false,
          action: {
            type: "showText",
            text: "They go into the jungle and come out again, aimlessly — but nothing here is aimless. Somewhere behind the rubies, a human mind is watching everything at once.",
            flagSet: "saw_robots",
          },
        },
      ],
      choices: [
        {
          id: "dm_c_c1",
          text: "The red eyes — what are they for?",
          reply: true,
          attitudeTag: "Clever",
          memoryLog: "asked_eyes",
        },
        { id: "dm_c_c2", text: "Follow Zehn to the doorway.", targetSceneId: "dm_doctor" },
      ],
    },

    {
      id: "dm_doctor",
      title: "Einundzwanzig",
      background: "/img/dominion/bg-doctor.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.4 },
      transition: "fade",
      prose:
        "Inside the stone building, a second metal man waited with his arms full of tinned food. He was not Zehn — his voice ran a fraction lower, and he called himself Einundzwanzig. Then he laid his metal hands on Horton, and the whole room filled with the smell of electricity.",
      dialogueBeats: [
        { id: "dm_d_b1", characterId: "doctor", text: "I am not Zehn. Call me Einundzwanzig — the Doctor, if it is easier. Give me your hands." },
        { id: "dm_d_b2", characterId: "horton", text: "I feel it — clean through me. Three weeks of fever, and it's... gone. I'm weak as a kitten, Jack, but I'm ALIVE." },
        { id: "dm_d_b3", characterId: "leyson", text: "Who are the New People? What is this place?" },
        { id: "dm_d_b4", characterId: "doctor", text: "We are the New People. The fever was in your blood; I burned it out with current. My vibration differs from yours — that is why speech pains the Zehns.", conditionRule: { requiresMemories: ["asked_people"] } },
        { id: "dm_d_b5", characterId: "horton", text: "Food. Real food. I could sleep for a week — but something tells me the night isn't done with us.", conditionRule: { requiresFlags: ["kept_nerve"] } },
      ],
      choices: [
        {
          id: "dm_d_c1",
          text: "Who are the New People?",
          reply: true,
          attitudeTag: "Clever",
          memoryLog: "asked_people",
        },
        { id: "dm_d_c2", text: "Thank him — and ask about the girl you saw at the door.", targetSceneId: "dm_shama" },
      ],
    },

    /* ============================================================ */
    /*  CHAPTER III — CATS AND MICE                                  */
    /* ============================================================ */
    {
      id: "dm_shama",
      title: "The Girl in the Dark",
      background: "/img/dominion/bg-shama.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 25%", zoomDuration: 12, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.45 },
      transition: "fade",
      prose:
        "In the small hours the door opened on darkness, and Leyson found himself looking at a girl — young, golden-haired, barefoot in a torn white dress, with the jungle in her eyes. She had not used the English tongue in a long time, and the words came out slow and strange.",
      dialogueBeats: [
        { id: "dm_s_b1", characterId: "shama", text: "You are enemies of the metal gods. They will destroy you. My people are afraid of them — and of me." },
        { id: "dm_s_b2", characterId: "leyson", text: "Who are you? Where did you come from?" },
        { id: "dm_s_b3", characterId: "shama", text: "I am Shama. The forest is my people. But I am white, and the metal gods did not harm me — so they think me a goddess." },
        { id: "dm_s_b4", characterId: "leyson", text: "A goddess. And you came here — alone, in the dark — to warn us." },
        { id: "dm_s_b5", characterId: "shama", text: "There is a way out, through the caves, where the metal gods do not go. I can take you. But you must come NOW, before the red eyes find your footprints.", conditionRule: { requiresFlags: ["kept_nerve"] } },
      ],
      hotspots: [
        {
          id: "dm_s_h1",
          label: "Her face in the doorway",
          bounds: { x: 44, y: 30, w: 16, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "She is afraid — and trying very hard not to show it. Whatever she has seen in the jungle, she believes every word of it." },
        },
      ],
      choices: [
        {
          id: "dm_s_c1",
          text: "Trust her. Let her lead you out through the caves.",
          targetSceneId: "dm_cave",
          attitudeTag: "Clever",
          consequences: { setFlags: ["trusted_shama"], trustChanges: [{ characterId: "shama", delta: 2 }] },
          rememberLine: "Shama will remember that you trusted her.",
        },
        {
          id: "dm_s_c2",
          text: "Refuse — you will take your chances with the robots.",
          targetSceneId: "dm_cave",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["refused_shama"], trustChanges: [{ characterId: "shama", delta: -2 }] },
        },
      ],
    },

    {
      id: "dm_cave",
      title: "Through the Roots",
      background: "/img/dominion/bg-cave.jpg",
      ambientAudio: "drone",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 3, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.55 },
      transition: "fade-black",
      prose:
        "The tunnel was older than the city above it, black as a closed fist, and it ran through the gut of the mountain. Shama moved through it by memory and smell, one hand on the stone, the lantern a single amber eye.",
      dialogueBeats: [
        { id: "dm_v_b1", characterId: "shama", text: "Keep right behind me. Smell for the snakes. I have walked this way since I was a child." },
        { id: "dm_v_b2", characterId: "horton", text: "I can't see a thing. Not even a star. How do you know the way?" },
        { id: "dm_v_b3", characterId: "shama", text: "The people of the forest have known of this passage forever — but they never dared enter it. Tabus. The gods did not injure me, so they called me immortal.", conditionRule: { requiresFlags: ["trusted_shama"] } },
        { id: "dm_v_b4", characterId: "leyson", text: "She's leading us out in spite of us. Keep the lantern low and keep moving.", conditionRule: { requiresFlags: ["refused_shama"] } },
        { id: "dm_v_b5", characterId: "shama", text: "The metal gods came out of this same cave, a year ago. So my people think them stronger than me now. That is why I must leave.", conditionRule: { requiresMemories: ["asked_gods"] } },
      ],
      choices: [
        {
          id: "dm_v_c1",
          text: "Why do your people fear the metal gods?",
          reply: true,
          attitudeTag: "Clever",
          memoryLog: "asked_gods",
        },
        { id: "dm_v_c2", text: "Press on — to the deep valley.", targetSceneId: "dm_mines" },
      ],
    },

    /* ============================================================ */
    /*  CHAPTER IV — THE DEEP VALLEY                                 */
    /* ============================================================ */
    {
      id: "dm_mines",
      title: "Chapter IV — The Deep Valley",
      background: "/img/dominion/bg-mines.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 5, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "Where the ancestors of Shama's people had once dug for yellow metal, other miners now worked — men of metal, tireless, hauling gold and gravel out of the dark on legs that never tired. The two agents lay on the high rim and watched the impossible thing happen.",
      dialogueBeats: [
        { id: "dm_m_b1", characterId: "shama", text: "There. The shining ones. They mine for gold and precious stones, and they never rest." },
        { id: "dm_m_b2", characterId: "horton", text: "Robots in the mines. That's really something. They never get tired, Jack. Never." },
        { id: "dm_m_b3", characterId: "leyson", text: "An army that doesn't eat, doesn't sleep, doesn't die. Somebody's been building this for years — and nobody in Washington knows a thing." },
      ],
      hotspots: [
        {
          id: "dm_m_h1",
          label: "Scoop the gravel",
          bounds: { x: 12, y: 60, w: 18, h: 22 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "gold_dust", flagSet: "saw_mines" },
        },
        {
          id: "dm_m_h2",
          label: "Watch the miners",
          bounds: { x: 34, y: 46, w: 34, h: 34 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "They move in silence, and their red eyes are the only light in the workings. Every cart that comes out is loaded with gold." },
        },
      ],
      choices: [
        {
          id: "dm_m_c1",
          text: "Circle toward that second cave — the one with the glow.",
          targetSceneId: "dm_ambush",
          attitudeTag: "Clever",
          consequences: { setFlags: ["saw_army"] },
        },
        { id: "dm_m_c2", text: "Keep to the shadow of the cliffs.", targetSceneId: "dm_ambush", attitudeTag: "Neutral" },
      ],
    },

    {
      id: "dm_ambush",
      title: "The Men with Rifles",
      background: "/img/dominion/bg-ambush.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "shake", shakeAmount: 0.4, shakeDuration: 0.5, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.55 },
      transition: "cut",
      prose:
        "They never heard them come. One moment the rock was empty; the next it was full of men with rifles and the grim, silent machinery of capture. The man in the middle wore the coldest smile Leyson had ever seen on a human face.",
      dialogueBeats: [
        { id: "dm_a_b1", characterId: "glauber", text: "Gentlemen. The two Americans who have been expected. You have walked a long way to meet me." },
        { id: "dm_a_b2", characterId: "leyson", text: "And who might you be?" },
        { id: "dm_a_b3", characterId: "glauber", text: "Von Glauber. You will learn the rest soon enough. Take them." },
      ],
      choices: [
        {
          id: "dm_a_c1",
          text: "Fight.",
          targetSceneId: "dm_lab",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["fought_glauber"] },
        },
        { id: "dm_a_c2", text: "Go quietly.", targetSceneId: "dm_lab", attitudeTag: "Neutral", consequences: { setFlags: ["went_quiet"] } },
      ],
    },

    /* ============================================================ */
    /*  CHAPTER V & VI — THE PLOTTERS                                */
    /* ============================================================ */
    {
      id: "dm_lab",
      title: "The Thousand-Mile Map",
      background: "/img/dominion/bg-lab.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.45 },
      transition: "fade",
      prose:
        "They were marched into a room two hundred feet wide, walled with squared black boards — a map of the whole interior of the continent, marked in quiet, patient squares. Over it presided a small, owl-eyed old man. Von Glauber let Leyson look. Then he began to talk.",
      dialogueBeats: [
        { id: "dm_l_b1", characterId: "glauber", text: "You are looking at Brazil, gentlemen — though Brazil does not know it yet. Gold, oil, diamonds, rubber. Everything a world war will want." },
        { id: "dm_l_b2", characterId: "leyson", text: "And who rules it? You? Your 'New People'?" },
        { id: "dm_l_b3", characterId: "glauber", text: "We have armies mechanized. Perfect soldiers, Leyson. They do not tire, do not fear, do not need food." },
        { id: "dm_l_b4", characterId: "grosboeck", text: "They were to be so useful. To an enlightened civilization. Not to — this." },
        { id: "dm_l_b5", characterId: "leyson", text: "You've been working this valley for years. I saw the metal men threading the city like fireflies — photographing everything.", conditionRule: { requiresFlags: ["saw_robots"] } },
        { id: "dm_l_b6", characterId: "leyson", text: "And the gold is real. I scooped it out of the gravel with my own hands.", conditionRule: { requiresItems: ["gold_dust"] } },
        { id: "dm_l_b7", characterId: "glauber", text: "Your friend has a broken jaw to remember his courage by. You, I am told, went quietly. Sensible.", conditionRule: { requiresFlags: ["fought_glauber"] } },
        { id: "dm_l_b8", characterId: "glauber", text: "You went quietly. Good. There is a place in the new order for men who know when they are beaten.", conditionRule: { requiresFlags: ["went_quiet"] } },
      ],
      hotspots: [
        {
          id: "dm_l_h1",
          label: "The map table",
          bounds: { x: 34, y: 40, w: 34, h: 34 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "A thousand square miles of jungle, plotted square by square. Airfields. Anti-aircraft emplacements. Every one already chosen." },
        },
      ],
      choices: [
        { id: "dm_l_c1", text: "Demand to see the army.", targetSceneId: "dm_army", attitudeTag: "Aggressive" },
        { id: "dm_l_c2", text: "Ask what has happened to the girl.", targetSceneId: "dm_glauder_shama" },
        { id: "dm_l_c3", text: "Say nothing. Watch. Wait for the guards to move you.", targetSceneId: "dm_cell" },
      ],
    },

    {
      id: "dm_army",
      title: "Seventeen Hundred and Thirty",
      background: "/img/dominion/bg-army.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 6, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.55 },
      transition: "fade",
      prose:
        "Von Glauber led them down into the cave below the laboratory, and Leyson understood, all at once, exactly what had been built down here in the dark.",
      dialogueBeats: [
        { id: "dm_y_b1", characterId: "glauber", text: "Seventeen hundred and thirty of them. Ready for operation. Built for airfields and anti-aircraft bases." },
        { id: "dm_y_b2", characterId: "horton", text: "That's not a work crew, Jack. That's an invasion." },
        { id: "dm_y_b3", characterId: "leyson", text: "So this is the glow we saw from the rim — the second cave, full of standing metal.", conditionRule: { requiresFlags: ["saw_army"] } },
        { id: "dm_y_b4", characterId: "grosboeck", text: "They were to clear the forest for the great work. Only that. I did not build them to be — this.", conditionRule: { requiresFlags: ["kept_nerve"] } },
      ],
      choices: [
        { id: "dm_y_c1", text: "Back to the map room.", targetSceneId: "dm_lab" },
      ],
    },

    {
      id: "dm_glauder_shama",
      title: "What He Wants With Her",
      background: "/img/dominion/bg-glauder-shama.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 35%", zoomDuration: 10, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "Leyson asked the question and saw, too late, the answer in Von Glauber's grin.",
      dialogueBeats: [
        { id: "dm_g_b1", characterId: "glauber", text: "The white girl? She rescued you, you know. Then she led you into my hands without having to lift a finger." },
        { id: "dm_g_b2", characterId: "leyson", text: "She didn't betray us. She warned us." },
        { id: "dm_g_b3", characterId: "glauber", text: "Never mind. We'll get her. Your robots have broken her power among her people — but not her natural power as a beautiful woman." },
        { id: "dm_g_b4", characterId: "leyson", text: "If you've hurt her —" },
        { id: "dm_g_b5", characterId: "glauber", text: "You'll do nothing. You are a patriotic man, Leyson, and she is my hostage. Knowing we hold her, you will be amenable to reason." },
      ],
      choices: [
        { id: "dm_g_c1", text: "Ask to be taken to your cell.", targetSceneId: "dm_cell" },
      ],
    },

    /* ============================================================ */
    /*  CHAPTER VII — RETRIBUTION                                    */
    /* ============================================================ */
    {
      id: "dm_cell",
      title: "What She Hid in Her Hair",
      background: "/img/dominion/bg-cell.jpg",
      ambientAudio: "none",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade-black",
      prose:
        "The cell was cut into the living rock below the laboratory. Somewhere far above, the clicking of a thousand machines. Somewhere far below, the miners. And then, after an hour of darkness, the soft sound of someone moving where no one should be.",
      dialogueBeats: [
        { id: "dm_ce_b1", characterId: "shama", text: "Zhack. I came. I knew I might help, if I were free — I can go places neither of you can.", conditionRule: { requiresFlags: ["trusted_shama"] } },
        { id: "dm_ce_b2", characterId: "leyson", text: "Shama — they tore your clothes. Your face is marked. What did they do?" },
        { id: "dm_ce_b3", characterId: "shama", text: "When the men took you away last night, I found the powder magazine in the hill. I took what I could carry.", conditionRule: { requiresFlags: ["trusted_shama"] } },
        { id: "dm_ce_b4", characterId: "shama", text: "Nitro. Small glass vials. I have several of them, twisted up in my hair.", conditionRule: { requiresFlags: ["trusted_shama"] } },
        { id: "dm_ce_b5", characterId: "horton", text: "In her HAIR. Jack, if one of those had dropped while she was fighting the guards —" },
        { id: "dm_ce_b6", characterId: "leyson", text: "She'd have blown them and herself clear out to Africa, in tiny pieces." },
        { id: "dm_ce_b7", characterId: "narrator", text: "But the cell stayed empty. The forest girl did not come. Whatever chance there had been with her, Leyson had spent it back at the doorway in the dark.", conditionRule: { requiresFlags: ["refused_shama"] } },
      ],
      hotspots: [
        {
          id: "dm_ce_h1",
          label: "Take the vials",
          bounds: { x: 42, y: 30, w: 18, h: 40 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          gating: { requiresFlags: ["trusted_shama"] },
          action: { type: "giveItem", itemGranted: "nitro_vial", flagSet: "took_nitro" },
        },
        {
          id: "dm_ce_h2",
          label: "The heavy door",
          bounds: { x: 60, y: 20, w: 22, h: 60 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Steel, and locked from the far side. But Von Glauber will come back. He will want to gloat." },
        },
      ],
      choices: [
        { id: "dm_ce_c1", text: "Wait for Von Glauber's summons.", targetSceneId: "dm_finale" },
      ],
    },

    {
      id: "dm_finale",
      title: "The Ultimatum",
      background: "/img/dominion/bg-finale.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "Von Glauber came back with two of his men and an offer dressed as a command: the agents were to represent him to the Brazilian government — to ask for surrender. The alternative was never spoken aloud. It didn't need to be.",
      dialogueBeats: [
        { id: "dm_fn_b1", characterId: "glauber", text: "Have you made up your minds, gentlemen? Represent us, and live. Or be buried down here with the gold." },
        { id: "dm_fn_b2", characterId: "leyson", text: "I'll give you my answer in a moment." },
        { id: "dm_fn_b3", characterId: "horton", text: "Jack. Whatever you're thinking — do it now, or not at all." },
      ],
      choices: [
        {
          id: "dm_fn_c1",
          text: "Show him the vials — hold the whole room hostage.",
          targetSceneId: "dm_showdown",
          attitudeTag: "Clever",
          gating: { requiresItems: ["nitro_vial"] },
          consequences: { setFlags: ["played_nitro"] },
        },
        {
          id: "dm_fn_c2",
          text: "Refuse him — and see what he does about it.",
          targetSceneId: "dm_bluff",
          attitudeTag: "Aggressive",
        },
      ],
    },

    {
      id: "dm_showdown",
      title: "The Vials",
      background: "/img/dominion/bg-showdown.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "shake", shakeAmount: 0.3, shakeDuration: 0.6, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "cut",
      prose:
        "Leyson took one of the little vials out of his pocket and held it between thumb and forefinger. Von Glauber went the colour of paper and backed away with both hands raised.",
      dialogueBeats: [
        { id: "dm_sd_b1", characterId: "glauber", text: "Careful. Careful, I beg you. That — that is nitro." },
        { id: "dm_sd_b2", characterId: "leyson", text: "From your own magazine. If I so much as stub my toe, something happens to the lot of us. Now — call your men from the mines." },
        { id: "dm_sd_b3", characterId: "glauber", text: "You cannot be serious. None of us wants to go back to civilization, Leyson. You know what it means to us all." },
        { id: "dm_sd_b4", characterId: "grosboeck", text: "Gott sei dank. Let me help. Let me explain to the others — it will be a so very great pleasure.", conditionRule: { requiresFlags: ["played_nitro"] } },
        { id: "dm_sd_b5", characterId: "shama", text: "My people will be crazy with fear, seeing the metal gods run wild through their hunting grounds. Until they find one smashed against a tree.", conditionRule: { requiresFlags: ["took_nitro"] } },
      ],
      choices: [
        {
          id: "dm_sd_c1",
          text: "Make Grosboeck turn the army loose — send the robots crashing into the jungle.",
          targetSceneId: "dm_escape",
          attitudeTag: "Clever",
          consequences: { setFlags: ["robots_turned"], addItems: ["schematic"] },
        },
        {
          id: "dm_sd_c2",
          text: "Demand the boat first. Get out before the place comes apart.",
          targetSceneId: "dm_escape_silver",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["boat_first"] },
        },
      ],
    },

    {
      id: "dm_bluff",
      title: "The Empty Hand",
      background: "/img/dominion/bg-bluff.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 30%", zoomDuration: 8, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.6 },
      transition: "cut",
      prose:
        "There was nothing in Leyson's pockets but fever and heart. He played the only hand he had — and Von Glauber laughed, softly, and shook his head.",
      dialogueBeats: [
        { id: "dm_bl_b1", characterId: "glauber", text: "No vials, Leyson. Your pockets are empty and your eyes give it away. Take them to the mines.", conditionRule: { excludesItems: ["nitro_vial"] } },
        { id: "dm_bl_b1b", characterId: "glauber", text: "A bluff, Leyson? Your eyes are steady, but your hand has nothing in it. Take them to the mines.", conditionRule: { requiresItems: ["nitro_vial"] } },
        { id: "dm_bl_b2", characterId: "horton", text: "Jack — tell me you had a second plan.", conditionRule: { excludesItems: ["nitro_vial"] } },
        { id: "dm_bl_b3", characterId: "leyson", text: "Not this time, Rog.", conditionRule: { excludesItems: ["nitro_vial"] } },
      ],
      choices: [
        {
          id: "dm_bl_c0",
          text: "Produce the vials — now.",
          targetSceneId: "dm_showdown",
          attitudeTag: "Clever",
          gating: { requiresItems: ["nitro_vial"] },
          consequences: { setFlags: ["played_nitro"] },
        },
        { id: "dm_bl_c1", text: "Spit in his eye.", targetSceneId: "dm_end_dominion", attitudeTag: "Aggressive" },
        { id: "dm_bl_c2", text: "Go quietly to the mines.", targetSceneId: "dm_end_mine", attitudeTag: "Neutral" },
      ],
    },

    {
      id: "dm_escape",
      title: "Retribution",
      background: "/img/dominion/bg-escape.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 4, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "They marched Von Glauber and his men down to the trail above the river, the professor's machines clattering in the dark behind them. Then Grosboeck threw the switches, and somewhere below the dead city the jungle filled with a grim, horrible jangling — the sound of seventeen hundred metal men battering their own brains out against the trees.",
      dialogueBeats: [
        { id: "dm_e_b1", characterId: "leyson", text: "Leave the controls set so they keep moving, Professor. Let them march until they meet the forest." },
        { id: "dm_e_b2", characterId: "grosboeck", text: "They will smash themselves to bits against the trees, if no one watches each one of them." },
        { id: "dm_e_b3", characterId: "leyson", text: "Which happens to be the general idea." },
        { id: "dm_e_b4", characterId: "shama", text: "I can see them. Hundreds and thousands of them, crashing against the trees like drunken men, caroming off.", conditionRule: { requiresFlags: ["robots_turned"] } },
        { id: "dm_e_b5", characterId: "leyson", text: "Grosboeck's notes. His own sketches of the radio brains and the ruby eyes — and the switch that sets them marching. If we get out, the Bureau gets these.", conditionRule: { requiresItems: ["schematic"] } },
      ],
      choices: [
        {
          id: "dm_e_c1",
          text: "Leave Von Glauber to the justice of the Indians.",
          targetSceneId: "dm_end_gold",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["spared_glauder"] },
        },
        {
          id: "dm_e_c2",
          text: "Put a bullet in him.",
          targetSceneId: "dm_end_gold",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["killed_glauder"] },
        },
      ],
    },

    {
      id: "dm_escape_silver",
      title: "Too Soon",
      background: "/img/dominion/bg-escape-silver.jpg",
      ambientAudio: "none",
      cinematic: { mode: "pan", panDirection: "left", panDistance: 3, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade",
      prose:
        "They were a mile downstream when the world shook. The whole top of the black butte hurtled skyward, broke apart, and fell back. Grosboeck had stayed behind to wire his laboratory — and had not hurried.",
      dialogueBeats: [
        { id: "dm_es_b1", characterId: "shama", text: "He waited until we were safely away. He wanted it this way." },
        { id: "dm_es_b2", characterId: "leyson", text: "He stayed behind to arrange it. To blow up his own life's work. I told him the boat first — I never asked him to stay." },
        { id: "dm_es_b3", characterId: "horton", text: "The lab's gone, Jack. That's the main thing. But did the army die with it?" },
        { id: "dm_es_b4", characterId: "leyson", text: "We won't know until the explorers of tomorrow start tripping over the wreckage.", conditionRule: { requiresFlags: ["boat_first"] } },
      ],
      choices: [
        { id: "dm_es_c1", text: "Keep going downstream, into the wide river.", targetSceneId: "dm_end_silver" },
      ],
    },

    /* ============================================================ */
    /*  ENDINGS                                                      */
    /* ============================================================ */
    {
      id: "dm_end_gold",
      title: "Ending — The World, Kept",
      isEnding: true,
      background: "/img/dominion/bg-end-gold.jpg",
      ambientAudio: "none",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 3, colorGrade: "spielberg-golden", filmGrade: true, filmGradeStrength: 0.35 },
      transition: "fade-black",
      prose:
        "The motorboat gathered speed and kept to the middle of an ever-widening river. Behind them the top of the black butte had torn itself off the world and fallen back as rubble. The New People were junk in the jungle. The laboratory was a crater. And the girl with the golden hair sat close to Leyson, her face lifted to his whenever the idea occurred to her that she would like to be kissed again.",
      dialogueBeats: [
        { id: "dm_eg_b1", characterId: "horton", text: "I was just picturing the explorers of tomorrow, tripping over the dead robots, wondering what stories about a 'new race' they'll take home." },
        { id: "dm_eg_b2", characterId: "shama", text: "I have always wanted to see the land my people came from. Now I will." },
        { id: "dm_eg_b3", characterId: "leyson", text: "Von Glauber said he wanted dominion over the world. He'll settle for a narrow valley, and no one left to rule.", conditionRule: { requiresFlags: ["spared_glauder"] } },
        { id: "dm_eg_b4", characterId: "leyson", text: "It is over. The machines are broken, and the man who built them is dead. The world never has to know how close it came.", conditionRule: { requiresFlags: ["killed_glauder"] } },
      ],
      endingData: {
        tier: "victory-gold",
        headline: "THE WORLD, KEPT",
        recap: "You won the forest girl's trust, played the vials, turned the robot army to scrap, and destroyed Von Glauber's laboratory. The world will never know the New People almost ruled it.",
      },
    },

    {
      id: "dm_end_silver",
      title: "Ending — The Mission, Half-Finished",
      isEnding: true,
      background: "/img/dominion/bg-end-silver.jpg",
      ambientAudio: "none",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.5 },
      transition: "fade-black",
      prose:
        "The boat slid down the river into the dawn. The laboratory was gone — Grosboeck had seen to that. But Leyson could not shake the feeling that somewhere in the jungle, in a cave he had never fully seen, something with crimson eyes was still standing, still waiting, still counting.",
      dialogueBeats: [
        { id: "dm_es2_b1", characterId: "horton", text: "You did what you could, Jack. We both did." },
        { id: "dm_es2_b2", characterId: "shama", text: "The metal gods are broken. My people will sing about this for a hundred years." },
        { id: "dm_es2_b3", characterId: "leyson", text: "Maybe. But we never turned the army loose. Some of them may still be standing." },
      ],
      endingData: {
        tier: "victory-silver",
        headline: "THE MISSION, HALF-FINISHED",
        recap: "You escaped with your lives and the laboratory was destroyed — but you left before the robot army was broken. Somewhere behind you, the New People may still be standing.",
      },
    },

    {
      id: "dm_end_dominion",
      title: "Ending — Dominion",
      isEnding: true,
      background: "/img/dominion/bg-end-dominion.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 40%", zoomDuration: 14, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.6 },
      transition: "fade-black",
      prose:
        "They took Leyson and Horton apart with the calm efficiency of men who had done it before. And in the months that followed, while the world went about its business and Brazil slept, the New People marched — out of the hidden valley, over the mountains, into the cities of men. The metal men had been made to rise and conquer. And they did.",
      dialogueBeats: [
        { id: "dm_ed_b1", characterId: "narrator", text: "The two agents were never heard from again. Washington closed the file, the way it closes files it does not understand." },
        { id: "dm_ed_b2", characterId: "narrator", text: "And the New People had dominion over all the world." },
      ],
      endingData: {
        tier: "gameover",
        headline: "DOMINION",
        recap: "You stood against Von Glauber with empty hands — and the New People marched. The metal men were made to rise and conquer, and nothing you did stopped them.",
      },
    },

    {
      id: "dm_end_mine",
      title: "Ending — The Mine Is Your Grave",
      isEnding: true,
      background: "/img/dominion/bg-end-mine.jpg",
      ambientAudio: "tension",
      cinematic: { mode: "static", colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.6 },
      transition: "fade-black",
      prose:
        "They put Leyson and Horton to work in the deep valley, alongside the machines that never tired. The robots pulled gold out of the dark in silence, hour after hour, and the two men worked until they could not tell their own breathing from the clatter of the workings. The jungle keeps what it takes.",
      dialogueBeats: [
        { id: "dm_em_b1", characterId: "narrator", text: "The fever would have been kinder. The mine was not built for men." },
        { id: "dm_em_b2", characterId: "narrator", text: "Somewhere far above, the red eyes went on watching. They are watching still." },
      ],
      endingData: {
        tier: "gameover",
        headline: "THE MINE IS YOUR GRAVE",
        recap: "With no vials to play and no way out, you were worked to death in the deep valley. The robots pulled gold, and the jungle pulled you under.",
      },
    },
  ],
};
