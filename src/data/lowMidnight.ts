import type { Story } from "../types";

/**
 * THE LOW MIDNIGHT
 * A neon-noir graphic novella — Quentin Tarantino's pulp energy meets
 * Stephen King's small-town dread. A boy has been missing three days.
 * You play a first-person private detective (V.O.), working the neon from a
 * diner to a derelict carnival, where something on the dead channels has been
 * saving Milo a seat.
 *
 * Exercises the cinematic camera suite end-to-end: slow pan, zoom-to-subject,
 * handheld shake on a per-beat replacement background, a wide rail/dolly track,
 * and the vertigo dolly-zoom with a transparent foreground subject. Plus neon
 * light glows, rain/storm particles, reply dialogue, item gating, and a
 * corkboard deduction.
 */
export const LOW_MIDNIGHT: Story = {
  id: "low-midnight",
  title: "The Low Midnight",
  tagline: "Three days missing. One waitress who saw too much. And a thing on the dead channels that's been saving him a seat.",
  coverImage: "/img/cover-low-midnight.jpg",
  startSceneId: "lm_credits",
  layout: {
    lm_credits: { x: 0, y: 220 },
    lm_diner: { x: 320, y: 220 },
    lm_apartment: { x: 320, y: 540 },
    lm_carnival: { x: 640, y: 220 },
    lm_midway: { x: 960, y: 220 },
    lm_funhouse: { x: 1280, y: 220 },
    lm_end_gold: { x: 1600, y: 0 },
    lm_end_silver: { x: 1600, y: 220 },
    lm_end_gameover: { x: 1600, y: 440 },
  },
  characters: [
    { id: "delia", name: "Delia Reyes", role: "Waitress / The Last Sane Witness", avatarUrl: "emoji:🍽️", trustMeter: 0 },
    { id: "ruth", name: "Ruth Calloway", role: "The Missing Boy's Mother", avatarUrl: "emoji:📼", trustMeter: 0 },
    { id: "floyd", name: "\u201CTwo-Tone\u201D Floyd", role: "Carnival Boss / Informant", avatarUrl: "emoji:🎪", trustMeter: 0 },
    { id: "staticman", name: "The Static Man", role: "The Thing on the Dead Channels", avatarUrl: "emoji:📺", trustMeter: 0 },
  ],
  items: [
    {
      id: "ticket_stub",
      name: "Carnival Ticket Stub",
      icon: "🎟️",
      description: "A damp ticket stub for Two-Tone's Midway, punched 11:47 p.m. three nights ago — the night Milo went missing.",
      flavorText: "Somebody paid to let a kid into the dark.",
      isClue: true,
    },
    {
      id: "child_drawing",
      name: "Milo's Drawing",
      icon: "🖍️",
      description: "A crayon drawing by a six-year-old: a stick-figure Milo, and behind him, a tall man made of angry gray scribbles. Static.",
      flavorText: "Kids draw what scares them. This one drew it twice.",
      isClue: true,
    },
    {
      id: "locket",
      name: "Ruth's Locket",
      icon: "📿",
      description: "A tarnished brass locket. Inside: a photo of Milo at the carnival — and Two-Tone Floyd's arm around his shoulder.",
      flavorText: "The photo's the truth. The brass just holds it together.",
      isClue: true,
    },
  ],
  briefing: {
    objective: "Milo Calloway has been missing three days. Follow the neon from the diner to the carnival — and bring him out of the static.",
    winConditions: [
      "Search the diner, the apartment, and the carnival for what Milo left behind.",
      "Wire the drawing to the Static Man on the corkboard.",
      "Take Ruth's locket to ground yourself, then face the Static Man.",
    ],
    loseConditions: [
      "Face the Static Man without the locket.",
      "Let Suspicion reach its limit — the city stops tolerating questions.",
      "Scream into the static.",
    ],
    heatLimit: 6,
    heatFailSceneId: "lm_end_gameover",
  },
  deduction: {
    suspectIds: ["floyd", "staticman", "ruth"],
    connections: [
      {
        a: "ticket_stub",
        b: "floyd",
        flagSet: "floyd_lying",
        revelation: "Milo's last ticket was for Two-Tone's midway. The carnival has been lying since day one.",
      },
      {
        a: "child_drawing",
        b: "staticman",
        flagSet: "static_true",
        revelation: "The tall man Milo drew is the Static Man — the thing that lives on the dead channels.",
      },
      {
        a: "locket",
        b: "ruth",
        flagSet: "ruth_secret",
        revelation: "Ruth's locket holds a photo of Milo and Two-Tone Floyd together. She sent him to the carnival herself.",
      },
    ],
  },
  scenes: [
    /* ==================== 1. CREDITS ==================== */
    {
      id: "lm_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      credits: { titleEntrance: "typewriter", stagger: 0.5, duration: 0.9, accentColor: "#ff2e88", lines: [{ role: "Starring", name: "The City Itself" }, { role: "Written by", name: "Neon & Rain" }, { role: "Directed by", name: "Gaslight Reelworks" }] },
      background: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "THE LOW MIDNIGHT\n\nA Neon Noir in Three Reels\n\nStarring the city itself\n\nTap Begin",
      choices: [
        { id: "lmc_begin", text: "Begin the Case", targetSceneId: "lm_diner", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE DINER ==================== */
    {
      id: "lm_diner",
      title: "The Neon Diner",
      background: "/img/bg-low-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 9,
        dimAmount: 0.16,
        lights: [
          { x: 62, y: 26, color: "#ff2e88", intensity: 0.3, size: 34, pulseSeconds: 3.2, pulseAmount: 0.9 },
          { x: 30, y: 20, color: "#2ad9d9", intensity: 0.22, size: 30, pulseSeconds: 2.6, pulseAmount: 0.7 },
        ],
      },
      prose:
        "Seventy-two hours since Milo Calloway's mom filed the report, and the cops had already filed him under 'ran away.' They always file the inconvenient ones under 'ran away.' Me, I was on my third cup of coffee at the Neon Diner, watching Delia Reyes wipe the same counter twice, because the third time she'd have to look at me and I'd have to ask the question she didn't want to answer.",
      dialogueBeats: [
        { id: "lmd_d1", characterId: "delia", expression: "wary", text: "You're not a cop. Cops don't tip like they're sorry." },
        { id: "lmd_n1", characterId: "narrator", expression: "V.O.", text: "I put a ten on the counter. In this part of town, a ten buys you the truth and a refill. If you're lucky, only one of them burns you." },
        { id: "lmd_d2", characterId: "delia", expression: "lowering her voice", text: "The kid came in three nights ago. Ordered a chocolate shake. Paid in wet quarters. Nobody pays in wet quarters unless it's been raining on them for a while." },
        { id: "lmd_n2", characterId: "narrator", expression: "V.O.", text: "Three questions, I told myself. That's the whole magazine. Ask all three, then get out before the regulars start wondering whose side the weather's on." },
        /* reply responses */
        { id: "lmd_d3a", characterId: "delia", expression: "guarded", conditionRule: { requiresFlags: ["asked_who"] }, text: "A man in a coat the color of a bruise. He bought the kid the shake. Kept calling him 'little man.' Like he already owned him." },
        { id: "lmd_d3b", characterId: "delia", expression: "sad", conditionRule: { requiresFlags: ["asked_alone"] }, text: "Alone. Milo's always alone. His mom works doubles at the laundry. The whole block raised that kid, and none of us raised him enough." },
        { id: "lmd_d3c", characterId: "delia", expression: "spooked", conditionRule: { requiresFlags: ["asked_weird"] }, text: "The TVs. All three TVs in the booths went to static at once when he left. Not snow — a picture of a man. I told the cops. They wrote 'possible vagrant.'" },
        { id: "lmd_n3", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["asked_who", "asked_alone", "asked_weird"] }, text: "A man in a bruise-colored coat, wet quarters, and every screen in the joint humming the same dead channel. The city was trying to tell me something. The city always tells you something. You just have to pay the cover charge." },
      ],
      hotspots: [
        {
          id: "lmd_hs_ticket",
          label: "Ticket stub under the napkin",
          bounds: { x: 58, y: 38, w: 14, h: 10 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "ticket_stub" },
        },
        {
          id: "lmd_hs_window",
          label: "Rain-streaked window",
          bounds: { x: 4, y: 10, w: 22, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Neon bleeds through the rain — pink and cyan, the colors of a city that never learned to blush." },
        },
      ],
      choices: [
        { id: "lmd_c1", reply: true, targetSceneId: "", text: "\u201CWho took him?\u201D", attitudeTag: "Clever", consequences: { setFlags: ["asked_who"] } },
        { id: "lmd_c2", reply: true, targetSceneId: "", text: "\u201CWas he alone?\u201D", attitudeTag: "Neutral", consequences: { setFlags: ["asked_alone"] } },
        { id: "lmd_c3", reply: true, targetSceneId: "", text: "\u201CAnything weird when he left?\u201D", attitudeTag: "Clever", consequences: { setFlags: ["asked_weird"] } },
        { id: "lmd_c4", text: "Drive out to the carnival.", targetSceneId: "lm_carnival", attitudeTag: "Neutral" },
        { id: "lmd_c5", text: "Go to the mother's place.", targetSceneId: "lm_apartment", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 3. THE APARTMENT ==================== */
    {
      id: "lm_apartment",
      title: "The Calloway Apartment",
      background: "/img/bg-low-apartment.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: {
        mode: "pan",
        panDistance: 5,
        panDirection: "right",
        dimAmount: 0.2,
        lights: [
          { x: 50, y: 30, color: "#2ad9d9", intensity: 0.28, size: 46, pulseSeconds: 2.4, pulseAmount: 0.8 },
        ],
      },
      prose:
        "Ruth Calloway opened the door like she was expecting a bill collector, and maybe she was. The apartment behind her smelled of cold coffee and the kind of loneliness you can rent by the week. And every wall had a television. Every single one was on. Every single one was showing static.",
      dialogueBeats: [
        { id: "lma_r1", characterId: "ruth", expression: "hoarse", text: "You're the private one. I called you because the cops stopped returning my calls and my landlord started." },
        { id: "lma_n1", characterId: "narrator", expression: "V.O.", text: "She didn't look at me. She looked at the televisions, the way other people look at family photos." },
        /* reply responses */
        { id: "lma_r2a", characterId: "ruth", expression: "exhausted", conditionRule: { requiresFlags: ["asked_wait"] }, text: "Three days because they told me to wait. 'He'll come home.' I waited. Now the waiting is the only thing in the room with me." },
        { id: "lma_r2b", characterId: "ruth", expression: "frightened", conditionRule: { requiresFlags: ["asked_tall"] }, text: "The tall man in his drawing? That's the thing on the TV. Every night at three, the set turns itself on, and he's standing there. Watching the door. Like he's waiting for Milo to come back." },
        { id: "lma_r2c", characterId: "ruth", expression: "desperate", conditionRule: { requiresFlags: ["asked_locket"] }, text: "It's his baby picture. And... something else. I should've thrown it away. Take it. If it brings him home, take it and don't ask what the other picture is." },
        { id: "lma_n2", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["asked_wait", "asked_tall", "asked_locket"], requiresAll: false }, text: "The static on those screens wasn't random. I'd swear on my badge, if I still carried one, that it had a pulse. And it was watching me watch it." },
      ],
      hotspots: [
        {
          id: "lma_hs_drawing",
          label: "Milo's crayon drawing",
          bounds: { x: 10, y: 42, w: 16, h: 16 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "child_drawing" },
        },
        {
          id: "lma_hs_tv",
          label: "The wall of televisions",
          bounds: { x: 66, y: 14, w: 28, h: 46 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Every screen shows the same gray snow. In the snow, if you squint, there's a shape. Tall. Patient." },
        },
      ],
      choices: [
        { id: "lma_c1", reply: true, targetSceneId: "", text: "\u201CWhy did you wait three days to call?\u201D", attitudeTag: "Neutral", consequences: { setFlags: ["asked_wait"] } },
        { id: "lma_c2", reply: true, targetSceneId: "", text: "\u201CWho's the tall man in his drawing?\u201D", attitudeTag: "Clever", consequences: { setFlags: ["asked_tall"] } },
        { id: "lma_c3", reply: true, targetSceneId: "", text: "\u201CThat locket. Let me see it.\u201D", attitudeTag: "Neutral", consequences: { setFlags: ["asked_locket"] } },
        {
          id: "lma_c4",
          reply: true,
          targetSceneId: "",
          text: "\u201CGive me the locket. I'll bring him home.\u201D",
          attitudeTag: "Sultry",
          gating: { requiresFlags: ["asked_locket"] },
          consequences: { addItems: ["locket"], setFlags: ["took_locket"] },
        },
        { id: "lma_c5", text: "Head to the carnival.", targetSceneId: "lm_carnival", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 4. THE CARNIVAL LOT ==================== */
    {
      id: "lm_carnival",
      title: "Two-Tone's Midway — Back Lot",
      background: "/img/bg-low-carnival.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "pan",
        panDistance: 7,
        panDirection: "left",
        dimAmount: 0.14,
        lights: [
          { x: 70, y: 24, color: "#ff2e88", intensity: 0.26, size: 34, pulseSeconds: 3.0, pulseAmount: 0.8 },
          { x: 28, y: 18, color: "#e8b23c", intensity: 0.22, size: 30, pulseSeconds: 2.8, pulseAmount: 0.7 },
        ],
      },
      prose:
        "Two-Tone Floyd ran the midway like a man who'd read the manual on charm and decided it was a language for suckers. He was leaning on the ticket booth when I pulled up, drying his hands on a rag like he'd just finished something that needed drying.",
      dialogueBeats: [
        { id: "lmc_f1", characterId: "floyd", expression: "grinning", text: "Detective. Didn't catch the name, but I caught the haircut. What's a private eye want with a broke-down midway at three in the morning?" },
        { id: "lmc_n1", characterId: "narrator", expression: "V.O.", text: "He talked in pop-culture references and old movie quotes, like he was auditioning for a role the city hadn't cast yet. Tarantino would've loved him. So would a jury." },
        { id: "lmc_f2", characterId: "floyd", expression: "cooling", text: "Kid comes around sometimes. Buys a candy apple, plays the ring toss. So what? Half the neighborhood's kids run my midway. I'm practically a day care with a carousel." },
        /* the shake cam beat — Floyd drops the charm */
        {
          id: "lmc_f3",
          characterId: "floyd",
          expression: "menacing",
          background: "/img/bg-low-carnival.jpg",
          cinematic: { mode: "shake", shakeAmount: 0.5, shakeRotation: 0.9, shakeDuration: 0.3, dimAmount: 0.32, lights: [{ x: 50, y: 20, color: "#e23b4e", intensity: 0.3, size: 40, pulseSeconds: 2.2, pulseAmount: 0.9 }] },
          backgroundTransition: "cut",
          text: "But let me be clear, gumshoe. You keep asking questions out here, and the only thing that leaves this lot alive is my reputation. We clear?",
        },
        { id: "lmc_n2", characterId: "narrator", expression: "V.O.", text: "The air got heavy, like right before a lightning strike. Somewhere behind him, the ferris wheel groaned in the wind. The city was done with small talk." },
      ],
      hotspots: [
        {
          id: "lmc_hs_sign",
          label: "Broken neon sign",
          bounds: { x: 62, y: 10, w: 24, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "TWO-TONE'S MIDW—. The last letters are dead. The rest flicker like they're trying to spell a warning." },
        },
      ],
      choices: [
        {
          id: "lmc_c1",
          text: "Lean on Floyd — hard.",
          targetSceneId: "lm_midway",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["floyd_pressed"], meterChanges: [{ meter: "Suspicion", delta: 2 }], trustChanges: [{ characterId: "floyd", delta: -2 }] },
        },
        {
          id: "lmc_c2",
          text: "Slip him a folded bill.",
          targetSceneId: "lm_midway",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["floyd_paid"], trustChanges: [{ characterId: "floyd", delta: 1 }] },
        },
        {
          id: "lmc_c3",
          text: "Ask about the tall man in the snow.",
          targetSceneId: "lm_midway",
          attitudeTag: "Clever",
          consequences: { setFlags: ["asked_static"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        { id: "lmc_c4", text: "Walk the midway.", targetSceneId: "lm_midway", attitudeTag: "Neutral" },
        { id: "lmc_c5", text: "Back to the diner.", targetSceneId: "lm_diner", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 5. THE MIDWAY (wide dolly) ==================== */
    {
      id: "lm_midway",
      title: "The Midway at 3 a.m.",
      background: "/img/bg-low-midway-wide.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "dolly",
        dollyDirection: "right",
        dollyDistance: 14,
        dollyDuration: 16,
        dollyVertical: 3,
        dimAmount: 0.12,
        lights: [
          { x: 20, y: 30, color: "#2ad9d9", intensity: 0.24, size: 32, pulseSeconds: 2.8, pulseAmount: 0.8 },
          { x: 80, y: 26, color: "#ff2e88", intensity: 0.26, size: 30, pulseSeconds: 3.2, pulseAmount: 0.9 },
        ],
      },
      prose:
        "Three in the morning and the midway hummed like a refrigerator full of secrets. The game booths were shuttered, their prizes watching me with glass eyes. And at the far end, past the ring toss, the funhouse sat dark. Waiting. The way an empty chair at a poker table waits.",
      dialogueBeats: [
        { id: "lmm_n1", characterId: "narrator", expression: "V.O.", text: "The rain kept time with my footsteps. Every few seconds a dead bulb over the ticket booth would sputter, and in the dark between flashes, I could've sworn the shapes moved." },
        /* The Static Man appears — this is also how the corkboard 'meets' him. */
        {
          id: "lmm_s1",
          characterId: "staticman",
          expression: "static",
          background: "/img/bg-low-static.jpg",
          cinematic: { mode: "static", dimAmount: 0.22, lights: [{ x: 50, y: 40, color: "#bfe0ff", intensity: 0.3, size: 44, pulseSeconds: 2.0, pulseAmount: 1 }] },
          backgroundTransition: "iris-in",
          backgroundTransitionSpeed: 0.8,
          text: "…the boy is still here… between the channels… he's been asking for you…",
        },
        { id: "lmm_n2", characterId: "narrator", expression: "V.O.", text: "Every TV in the midway snapped on at once — a dozen dead screens, one shape standing in all of them. The tall man from the drawing. He wasn't in the snow. He WAS the snow." },
      ],
      hotspots: [
        {
          id: "lmm_hs_funhouse",
          label: "The funhouse, dark",
          bounds: { x: 78, y: 34, w: 18, h: 40 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "lm_funhouse" },
        },
      ],
      choices: [
        { id: "lmm_c1", text: "Enter the funhouse.", targetSceneId: "lm_funhouse", attitudeTag: "Neutral" },
        { id: "lmm_c2", text: "Back to the lot.", targetSceneId: "lm_carnival", attitudeTag: "Neutral" },
        { id: "lmm_c3", text: "Back to the diner.", targetSceneId: "lm_diner", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 6. THE FUNHOUSE (vertigo) ==================== */
    {
      id: "lm_funhouse",
      title: "Inside the Funhouse",
      background: "/img/bg-low-funhouse.jpg",
      ambientAudio: "tension",
      particles: "storm",
      cinematic: {
        mode: "dolly",
        dollyDirection: "left",
        dollyDistance: 8,
        dollyDuration: 12,
        dimAmount: 0.2,
        lights: [
          { x: 50, y: 30, color: "#ff2e88", intensity: 0.26, size: 40, pulseSeconds: 2.6, pulseAmount: 0.9 },
        ],
      },
      prose:
        "The mirrors stretched me into a hundred wrong shapes as I walked. Some of the reflections were behind me when they shouldn't have been. Some of them weren't mine at all. And at the heart of the maze, past the laughing clown and the warped glass, a room full of televisions was already glowing.",
      dialogueBeats: [
        { id: "lmf_n1", characterId: "narrator", expression: "V.O.", text: "Milo was there. Curled in front of the screens like a kid watching cartoons, except the cartoons were static, and the static was looking back." },
        /* The vertigo reveal: dolly-zoom with the Static Man as a fixed foreground. */
        {
          id: "lmf_s1",
          characterId: "staticman",
          expression: "the picture",
          background: "/img/bg-low-static.jpg",
          cinematic: {
            mode: "dolly-zoom",
            dollyZoomAmount: 1.4,
            dollyZoomDuration: 9,
            foregroundImage: "/img/fg-low-staticman.png",
            foregroundScale: 1,
            foregroundFit: "contain",
            dimAmount: 0.16,
            lights: [{ x: 50, y: 42, color: "#bfe0ff", intensity: 0.28, size: 40, pulseSeconds: 2.0, pulseAmount: 1 }],
          },
          backgroundTransition: "iris-in",
          backgroundTransitionSpeed: 0.9,
          text: "You found him. But the low midnight keeps what it keeps. Say his name, and one of you stays behind.",
        },
        { id: "lmf_n2", characterId: "narrator", expression: "V.O.", text: "The room got tall. The walls slid away and the floor fell out, and still that shape stood perfectly still in the middle of it — the only thing in the whole damned city that wasn't moving. The vertigo wasn't in the room. It was in me." },
      ],
      hotspots: [],
      choices: [
        {
          id: "lmf_c_gold",
          text: "Hold up Ruth's locket — his face grounds you.",
          targetSceneId: "lm_end_gold",
          attitudeTag: "Clever",
          gating: { requiresItems: ["locket"], requiresFlags: ["static_true"] },
          consequences: { setFlags: ["saved_milo"], meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "lmf_c_silver",
          text: "Grab Milo and run for the doors.",
          targetSceneId: "lm_end_silver",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["locket"] },
          consequences: { setFlags: ["ran_with_milo"], meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "lmf_c_gameover",
          text: "Scream his name into the static.",
          targetSceneId: "lm_end_gameover",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["called_his_name"], meterChanges: [{ meter: "Suspicion", delta: 3 }] },
        },
        { id: "lmf_c_back", text: "Back through the mirrors.", targetSceneId: "lm_midway", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== ENDINGS ==================== */
    {
      id: "lm_end_gold",
      title: "The Boy Walks Out of the Static",
      background: "/img/bg-low-end-gold.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 55%", zoomDuration: 7, dimAmount: 0.12 },
      prose:
        "I held up the locket and said his name — not to the static, but to the kid inside it. The tall man's picture went to snow, and out of the snow walked Milo, blinking, like a boy waking from a too-long afternoon. Ruth was under the diner's pink sign when we pulled up. She didn't ask how. Some stories, the city keeps. But the boy was warm, and for one night in the low midnight, the neon wasn't lying.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE BOY WALKS OUT OF THE STATIC",
        recap: "You wired the drawing to the Static Man, took Ruth's locket as an anchor, and brought Milo home whole.",
      },
    },
    {
      id: "lm_end_silver",
      title: "You Saved Him — But Something Followed",
      background: "gradient:linear-gradient(160deg,#3a2a10 0%,#0c0c14 70%)",
      ambientAudio: "tension",
      prose:
        "I grabbed the kid and ran. Behind us the mirrors cracked one by one, like something was walking through them after us. Milo made it home. Ruth made it home. But I still dream in static, and every television in my apartment stays unplugged, face-down, in the closet. You save what you can in the low midnight. The rest saves a seat for you.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE BOY IS SAFE. THE STATIC ISN'T.",
        recap: "You pulled Milo out by instinct, without the full picture. He's home — but something is still looking for a way in.",
      },
    },
    {
      id: "lm_end_gameover",
      title: "You Looked Too Long",
      background: "gradient:linear-gradient(160deg,#1a0505 0%,#000000 100%)",
      ambientAudio: "tension",
      particles: "storm",
      prose:
        "You said his name wrong, or said it too loud, or looked too long — it doesn't matter now. The snow closed over you like water. Somewhere on a dead channel in the Calloway apartment, a new shape stands in the static, waiting for the door. The city filed you under 'ran away.' They always file the inconvenient ones under 'ran away.'",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "YOU LOOKED TOO LONG",
        recap: "You faced the Static Man without the truth to hold onto — and the low midnight kept you.",
      },
    },
  ],
};
