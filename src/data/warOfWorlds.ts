import type { Story } from "../types";

/**
 * THE WAR OF THE WORLDS
 * An original pulp-noir retelling of H.G. Wells' 1898 novel (public domain).
 * Told first-person by a hard-bitten newspaperman: the cylinders fall on
 * Horsell Common, the tripods rise, the heat-ray burns, the red weed spreads —
 * and in the end the invaders are beaten by the smallest, oldest thing on
 * Earth. You are the reporter who lives to file the story.
 */
export const WAR_OF_THE_WORLDS: Story = {
  id: "war-of-the-worlds",
  title: "The War of the Worlds",
  tagline: "The cylinders fell on a Thursday. By Sunday, the red weed owned the streets — and the Martians owned the sky.",
  coverImage: "/img/cover-war-of-worlds.jpg",
  startSceneId: "wotw_credits",
  layout: {
    wotw_credits: { x: 0, y: 220 },
    wotw_newsroom: { x: 320, y: 220 },
    wotw_common: { x: 640, y: 220 },
    wotw_tripod: { x: 960, y: 220 },
    wotw_street: { x: 1280, y: 220 },
    wotw_hiding: { x: 1600, y: 220 },
    wotw_end_gold: { x: 1920, y: 0 },
    wotw_end_silver: { x: 1920, y: 220 },
    wotw_end_gameover: { x: 1920, y: 440 },
  },
  characters: [
    { id: "frank", name: "Frankie Doyle", role: "Staff Photographer", avatarUrl: "emoji:📷", trustMeter: 0 },
    { id: "professor", name: "Professor Ogilvy", role: "Astronomer", avatarUrl: "emoji:🔭", trustMeter: 0 },
    { id: "martian", name: "A Martian", role: "The Invader", avatarUrl: "emoji:👽", trustMeter: 0 },
  ],
  items: [
    {
      id: "press_pass",
      name: "Press Credentials",
      icon: "📰",
      description: "Your byline, pressed into a leather card. The license to be where the story is — and, when it's over, the right to write the ending.",
      flavorText: "Ink and nerve. The only two things that never stopped a heat-ray.",
      isClue: true,
    },
    {
      id: "field_glass",
      name: "Field Glasses",
      icon: "🔭",
      description: "A pair of field glasses dropped by a fleeing onlooker. For watching the end of the world in close-up.",
      flavorText: "You'd rather see it coming than hear it coming.",
    },
    {
      id: "red_weed",
      name: "Red Weed",
      icon: "🌿",
      description: "A cutting of the red weed. It spreads like fire, drinks rivers dry, and turns a green Earth the color of a wound.",
      flavorText: "It isn't a plant. It's a sentence.",
      isClue: true,
    },
  ],
  briefing: {
    objective: "The cylinders have landed at Horsell. Cover the invasion, survive the heat-ray, and live to file the story of how the Martians were beaten by the smallest thing on Earth.",
    winConditions: [
      "Grab your press pass in the newsroom.",
      "Reach the common and witness the first tripod rise.",
      "Outlast the invasion from the cellar, then walk out with your notebook.",
    ],
    loseConditions: [
      "Walk into the heat-ray.",
      "Wade into the red weed.",
      "Let the panic get you before the Martians do.",
    ],
    heatLimit: 6,
    heatFailSceneId: "wotw_end_gameover",
  },
  scenes: [
    /* ==================== 1. CREDITS ==================== */
    {
      id: "wotw_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      credits: { titleEntrance: "typewriter", stagger: 0.5, duration: 0.9, accentColor: "#ff4d2e", lines: [{ role: "Starring", name: "The City Itself" }, { role: "From the novel by", name: "H.G. Wells" }, { role: "The Invaders", name: "Mars" }] },
      background: "gradient:linear-gradient(160deg,#140404 0%,#1a0a04 55%,#050505 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "THE WAR OF THE WORLDS\n\nA Pulp Retelling of the Invasion\n\nStarring the City Itself\n\nTap Begin",
      choices: [
        { id: "wotwc_begin", text: "Begin the Case", targetSceneId: "wotw_newsroom", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE NEWSROOM ==================== */
    {
      id: "wotw_newsroom",
      title: "The City Room, Thursday Night",
      background: "/img/bg-wotw-newsroom.jpg",
      ambientAudio: "rain",
      particles: "smoke",
      cinematic: {
        mode: "pan",
        panDistance: 5,
        panDirection: "left",
        dimAmount: 0.12,
        lights: [
          { x: 70, y: 22, color: "#e8b23c", intensity: 0.24, size: 34, pulseSeconds: 3.0, pulseAmount: 0.8 },
        ],
      },
      prose:
        "THE FIRST CYLINDER FELL ON A THURSDAY. The wire came in at ten past eleven: 'METEOR STRIKES HORSell COMMON.' By midnight the copy desk had a better word for it. Not meteor. Machine. I had my hat on before the rewrite was done. Some stories you cover. This one was covering us.",
      dialogueBeats: [
        { id: "wotwn_f1", characterId: "frank", expression: "loading his camera", text: "If this thing's got a story in it, I want the picture. And if it's got teeth, I want a bigger lens." },
        { id: "wotwn_p1", characterId: "professor", expression: "gravely", text: "Gentlemen, I have watched Mars through my glass for twenty years. Whatever fell tonight, it did not fall. It was aimed." },
        { id: "wotwn_n1", characterId: "narrator", expression: "V.O.", text: "Aimed. The word went through the city room like a draft under a door. The teletype kept hammering. Nobody looked at it. Nobody could look away from the professor." },
      ],
      hotspots: [
        {
          id: "wotwn_hs_pass",
          label: "Your press pass on the desk",
          bounds: { x: 50, y: 52, w: 14, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "press_pass" },
        },
      ],
      choices: [
        { id: "wotwn_c1", text: "Race to the common.", targetSceneId: "wotw_common", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 3. THE COMMON ==================== */
    {
      id: "wotw_common",
      title: "The Common at Horsell",
      background: "/img/bg-wotw-common.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 58%",
        zoomDuration: 9,
        dimAmount: 0.16,
        lights: [
          { x: 50, y: 58, color: "#2aff88", intensity: 0.3, size: 44, pulseSeconds: 2.8, pulseAmount: 1 },
        ],
      },
      prose:
        "The common was full of people who'd come to see a fallen star — farmers with lanterns, boys on bicycles, a policeman who kept saying 'stand back' like it was a prayer. In the middle of the scorched grass lay the cylinder: a thing of dull metal, thirty yards across, humming. And then, very slowly, the lid began to turn.",
      dialogueBeats: [
        { id: "wotwc_p1", characterId: "professor", expression: "terrified", text: "It's unscrewing. Good God — something inside is unscrewing it." },
        { id: "wotwc_n1", characterId: "narrator", expression: "V.O.", text: "The crowd went quiet the way a crowd goes quiet before a thing nobody can believe. Somebody dropped a pair of field glasses in the grass and didn't bend to pick them up." },
        /* the unscrewing — handheld shake */
        {
          id: "wotwc_n2",
          characterId: "narrator",
          expression: "V.O.",
          background: "/img/bg-wotw-common.jpg",
          cinematic: { mode: "shake", shakeAmount: 0.55, shakeRotation: 1.0, shakeDuration: 0.3, dimAmount: 0.28, lights: [{ x: 50, y: 55, color: "#2aff88", intensity: 0.32, size: 44, pulseSeconds: 2.0, pulseAmount: 1 }] },
          backgroundTransition: "cut",
          text: "THE LID SCREWED OFF AND FELL WITH A CLANG. And out of the dark inside the cylinder, something wet and grey and wrong began to climb.",
        },
      ],
      hotspots: [
        {
          id: "wotwc_hs_glass",
          label: "Field glasses in the grass",
          bounds: { x: 20, y: 55, w: 14, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "field_glass" },
        },
      ],
      choices: [
        { id: "wotwc_c1", text: "Watch from the ridge.", targetSceneId: "wotw_tripod", attitudeTag: "Clever" },
        { id: "wotwc_c2", text: "Back to the office.", targetSceneId: "wotw_newsroom", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 4. THE TRIPOD (vertigo) ==================== */
    {
      id: "wotw_tripod",
      title: "The Heat-Ray",
      background: "/img/bg-wotw-tripod.jpg",
      ambientAudio: "tension",
      particles: "rain",
      cinematic: {
        mode: "dolly-zoom",
        dollyZoomAmount: 1.3,
        dollyZoomDuration: 9,
        dollyZoomDirection: "both",
        dollyZoomBlur: 3,
        foregroundImage: "/img/fg-wotw-tripod.png",
        foregroundScale: 0.85,
        foregroundFit: "contain",
        dimAmount: 0.16,
        lights: [
          { x: 50, y: 30, color: "#ff4d2e", intensity: 0.32, size: 44, pulseSeconds: 2.2, pulseAmount: 1 },
        ],
      },
      prose:
        "They rose on three legs, higher than the church steeple, and the city — my city, with its presses and its pawnshops and its morning editions — was suddenly a doll's house under a stranger's boot. Then the heat-ray came on, and the doll's house began to burn.",
      dialogueBeats: [
        { id: "wotwt_n1", characterId: "narrator", expression: "V.O.", text: "It moved like nothing made by men. A smooth, terrible stride, each step a block wide. And it did not look for us the way a hunter looks for game. It looked the way you look at weeds before you pull them." },
        { id: "wotwt_m1", characterId: "martian", expression: "the war-cry", text: "ULLA. ULLA. ULLA." },
        { id: "wotwt_f1", characterId: "frank", expression: "shaking", text: "I got the shot. God help me, I got the shot. Now can we please be somewhere the light doesn't reach?" },
      ],
      hotspots: [],
      choices: [
        { id: "wotwt_c1", text: "Follow the evacuation to the river.", targetSceneId: "wotw_street", attitudeTag: "Neutral" },
        { id: "wotwt_c2", text: "Back to the common.", targetSceneId: "wotw_common", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 5. THE STREET (wide dolly) ==================== */
    {
      id: "wotw_street",
      title: "The Red Weed",
      background: "/img/bg-wotw-street-wide.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "dolly",
        dollyDirection: "right",
        dollyDistance: 14,
        dollyDuration: 16,
        dollyVertical: 2,
        dimAmount: 0.14,
        lights: [
          { x: 30, y: 30, color: "#ff4d2e", intensity: 0.24, size: 32, pulseSeconds: 2.8, pulseAmount: 0.8 },
          { x: 80, y: 26, color: "#2aff88", intensity: 0.2, size: 30, pulseSeconds: 3.0, pulseAmount: 0.7 },
        ],
      },
      prose:
        "By dawn the city was a river of people, and through the broken streets came the red weed — growing where the cylinders had spat, a crimson creeper that crawled up lampposts and drank the gutters dry. It was the color of a wound. It was, I think, what Mars looks like from the inside.",
      dialogueBeats: [
        { id: "wotws_n1", characterId: "narrator", expression: "V.O.", text: "Frankie was still beside me, camera around his neck like a good-luck charm. Somewhere ahead, a child was crying, and the crowd was moving around the sound the way water moves around a stone." },
        { id: "wotws_p1", characterId: "professor", expression: "urgent", text: "Take a cutting of the weed if you can. If we live, someone must explain what it is. If we don't — someone must explain what it was." },
        { id: "wotws_n2", characterId: "narrator", expression: "V.O.", text: "The bridge was jammed. The river road was worse. And the only shelter for miles was a cellar on Cedar Street with a door that still locked." },
      ],
      hotspots: [
        {
          id: "wotws_hs_weed",
          label: "A cutting of red weed",
          bounds: { x: 40, y: 44, w: 14, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "red_weed" },
        },
      ],
      choices: [
        { id: "wotws_c1", text: "Find shelter under the bridge.", targetSceneId: "wotw_hiding", attitudeTag: "Neutral" },
        { id: "wotws_c2", text: "Back to the ridge.", targetSceneId: "wotw_tripod", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 6. THE CELLAR ==================== */
    {
      id: "wotw_hiding",
      title: "The Cellar on Cedar Street",
      background: "/img/bg-wotw-hiding.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: {
        mode: "pan",
        panDistance: 4,
        panDirection: "right",
        dimAmount: 0.2,
        lights: [
          { x: 50, y: 30, color: "#e8b23c", intensity: 0.24, size: 40, pulseSeconds: 2.8, pulseAmount: 0.8 },
        ],
      },
      prose:
        "We hid in the dark and listened to the war. The red weed pushed against the little window until the glass sang. The heat-rays wrote their terrible shorthand on the sky. And then, on the fifth day, the machines began to move slower. By the seventh, they had stopped moving at all.",
      dialogueBeats: [
        { id: "wotwh_p1", characterId: "professor", expression: "whispering", text: "Bacteria. Putrefactive bacteria — the smallest, oldest life on Earth. They've no immunity, no defense. The Martians are dying of the common cold of the whole world." },
        { id: "wotwh_n1", characterId: "narrator", expression: "V.O.", text: "The invaders came forty million miles to conquer us, and they were undone by the one thing we could never have aimed at them — the germs in the very air we breathe. The smallest life on Earth had simply... refused to be conquered." },
        { id: "wotwh_f1", characterId: "frank", expression: "awed", text: "So we just... wait? We wait, and the whole invasion catches a cold and dies?" },
        { id: "wotwh_n2", characterId: "narrator", expression: "V.O.", text: "Outside, the red weed was turning grey and crumbling. The sky was clearing. And I realized I was still wearing my press pass — and that there was one story left to file." },
      ],
      hotspots: [],
      choices: [
        {
          id: "wotwh_c_gold",
          text: "Walk out to the dead machine, notebook in hand.",
          targetSceneId: "wotw_end_gold",
          attitudeTag: "Clever",
          gating: { requiresItems: ["press_pass"] },
          consequences: { setFlags: ["filed_the_story"], meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        { id: "wotwh_c_silver", text: "Stay hidden until the all-clear.", targetSceneId: "wotw_end_silver", attitudeTag: "Neutral" },
        {
          id: "wotwh_c_gameover",
          text: "Wade into the red weed for a closer look.",
          targetSceneId: "wotw_end_gameover",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["into_the_weed"], meterChanges: [{ meter: "Suspicion", delta: 3 }] },
        },
        { id: "wotwh_c_back", text: "Back to the street.", targetSceneId: "wotw_street", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== ENDINGS ==================== */
    {
      id: "wotw_end_gold",
      title: "The War Ends with a Sneeze",
      background: "/img/bg-wotw-end.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 55%", zoomDuration: 7, dimAmount: 0.1 },
      prose:
        "I walked out with my notebook and my press card and the whole terrible story behind me. The tripod lay on its side in the grey dead weed, a monument to an invasion that had been conquered by the common cold. I wrote the lead the way the city taught me to write leads — short, and true: THE MARTIANS ARE DEAD. THE EARTH IS STILL OURS. I filed it, and for the first time in weeks, the presses ran with good news.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE WAR ENDS WITH A SNEEZE — MARTIANS CONQUERED BY EARTH'S GERMS",
        recap: "You kept your press pass, survived the invasion, and filed the greatest story ever written — how the smallest life on Earth beat the invaders.",
      },
    },
    {
      id: "wotw_end_silver",
      title: "The City Is Ash",
      background: "gradient:linear-gradient(160deg,#2a1a0a 0%,#0c0c14 70%)",
      ambientAudio: "tension",
      prose:
        "You stayed in the cellar until the silence was total. When you climbed out, the city was ash and grey weed, the sky empty. The Martians were dead — the germs had won the war nobody aimed. But you never filed the story. Somebody else's byline will carry it. You survived. The city didn't.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE CITY IS ASH — BUT THE EARTH IS STILL OURS",
        recap: "You survived the invasion by staying hidden. The Martians died, but the greatest story of all slipped through your fingers.",
      },
    },
    {
      id: "wotw_end_gameover",
      title: "Taken by the Red Weed",
      background: "gradient:linear-gradient(160deg,#2a0505 0%,#000000 100%)",
      ambientAudio: "tension",
      particles: "storm",
      prose:
        "The red weed didn't need a heat-ray. It took you at the knees and held on, drinking the warmth out of you while the world went a soft, terrible red. The last thing you thought, strangely, was a headline: LOCAL REPORTER MISSING. And somewhere far away, a tripod stopped moving, and fell, and did not get up.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "LOCAL REPORTER MISSING — PRESUMED TAKEN",
        recap: "You waded into the red weed. The invasion was ending — you just didn't live to file it.",
      },
    },
  ],
};
