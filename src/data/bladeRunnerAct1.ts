import type { Story } from "../types";
import { BR_HD_SHEETS, brHd, brHd3 } from "./bladeRunnerHdAssets";
import { BR_CHAPTER_ONE_CAST, BR_CHAPTER_ONE_FLAGS, BR_CHAPTER_ONE_SCENES } from "./bladeRunnerAct1Encounters";
import type { EsperConfig } from "../game/EsperTypes";
import type { VkConfig } from "../game/VkTypes";

/* HD cast and assembled directional/action banks are authored with the real
 * Studio tools. This is limited photographic pose animation, not original
 * voxel/motion-captured art. The legacy expansion remains outside Act-1 fidelity. */
const MCCOY_WALKER_SHEET = BR_HD_SHEETS.mccoy;

const BRYANT_SHEET = BR_HD_SHEETS.guzza;

const GAFF_SHEET = BR_HD_SHEETS.gaff;

const TYRELL_SHEET = {
  image: "/assets/blade-runner/br-tyrell-talk.png",
  frameWidth: 289,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

const RACHAEL_SHEET = {
  image: "/assets/blade-runner/br-rachael-talk.png",
  frameWidth: 634,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

const ROY_SHEET = {
  image: "/assets/blade-runner/br-roy-talk.png",
  frameWidth: 297,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

/** Roy Batty's walk — the Nexus-6 leader paces Early Q's bar himself
 *  (the talk sheet is his portrait; this is how he crosses the room). */
const ROY_WALK_SHEET = {
  image: "/assets/blade-runner/br-roy-walk.png",
  frameWidth: 175,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

const RUNCITER_SHEET = BR_HD_SHEETS.runciter;

const HOWIE_SHEET = BR_HD_SHEETS.howie;

const LUCY_SHEET = {
  image: "/assets/blade-runner/br-lucy-talk.png",
  frameWidth: 361,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

/** Ambient pedestrian — the closed-umbrella long-coat walker that makes the
 *  rain-soaked streets of 2019 Los Angeles feel lived-in (the original's
 *  animated backgrounds are full of passers-by). */
const STREET_WALKER_SHEET = {
  image: "/assets/blade-runner/br-street-walk.png",
  frameWidth: 220,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 7 },
  },
  pixelated: false,
};

/** Dektora — Early Q's cabaret headliner. Her 4-frame routine loops on the
 *  stage as an ambient SET MOTION: the club's whole reason for being. */
const DEKTORA_SHEET = {
  image: "/assets/blade-runner/br-dektora-dance.png",
  frameWidth: 280,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    dance: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

/** Dektora's speaking portrait — the 2-frame talk plate gives the cabaret
 *  headliner a FACE in the dialogue box (she was an emoji up to now). */
const DEKTORA_TALK_SHEET = {
  image: "/assets/blade-runner/br-dektora-talk.png",
  frameWidth: 619,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

/** Gaff's walk — the veteran paces the far side of Guzza's desk. */
const GAFF_WALK_SHEET = {
  image: "/assets/blade-runner/br-gaff-walk.png",
  frameWidth: 179,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

/** Dr. Tyrell's walk — measured steps across the golden penthouse. */
const TYRELL_WALK_SHEET = {
  image: "/assets/blade-runner/br-tyrell-walk.png",
  frameWidth: 176,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

/** Rachael's walk — the prototype by the windows, always composed. */
const RACHAEL_WALK_SHEET = {
  image: "/assets/blade-runner/br-rachael-walk.png",
  frameWidth: 171,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

/** Lucy's walk — the girl in the dragonfly coat crosses her hotel room. */
const LUCY_WALK_SHEET = {
  image: "/assets/blade-runner/br-lucy-walk.png",
  frameWidth: 191,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: false,
};

/** Runciter's walk — the shopkeeper steps out from behind his counter. */
const RUNCITER_WALK_SHEET = BR_HD_SHEETS.runciter;

/** Howie's walk — the chef moves from his woks to the bar rail. */
const HOWIE_WALK_SHEET = BR_HD_SHEETS.howie;

/** The SECOND street pedestrian — the teal-raincoat woman with the closed
 *  umbrella. Two walker variants keep the rain-soaked streets from feeling
 *  like one body cloned (the original's animated crowds varied). */
const STREET_WALKER2_SHEET = {
  image: "/assets/blade-runner/br-street-walk2.png",
  frameWidth: 195,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 7 },
  },
  pixelated: false,
};

/** The Carson Street cop — the constable who holds the tape line at the
 *  Runciter crime scene and interviews the crowd (the original's
 *  two-step: run the witness round, then ask what they said). */
const COP_TALK_SHEET = BR_HD_SHEETS.leary;

/** Dino — the third-floor lab tech. The original's mainframe lab visit is
 *  a one-beat meeting: "you'll never see him again." */
const DINO_TALK_SHEET = {
  image: "/assets/blade-runner/br-dino-talk.png",
  frameWidth: 310,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

/** Moraji — the animoid snake man, speaking portrait for the interrogation. */
const MORAJI_TALK_SHEET = {
  image: "/assets/blade-runner/br-moraji-talk.png",
  frameWidth: 258,
  frameHeight: 384,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1], fps: 4 },
  },
  pixelated: false,
};

const ESPER_SECURITY_PHOTO_CONFIG: EsperConfig = {
  title: "ESPER 3D PHOTO RECONSTRUCTION // DISK #2019-RUNCITER",
  instruction: "EXAMINE THE COUNTER, ITS REFLECTION AND THE WOMAN'S DRAGONFLY PIN. SELECT A SECTOR, THEN TRACK & ENHANCE.",
  photoImage: brHd3("runciter-security.webp"),
  winText: "ESPER ANALYSIS SUCCESSFUL: DRAGON CHOPSTICK WRAPPER IDENTIFIED AT THE COUNTER.",
  targetSceneId: "br_mainframe_hub",
  regions: [
    {
      // Keep the old region ID for existing replays; the registered box now
      // actually contains the wrapper and its reflection in the source still.
      id: "sec_mirror", label: "Sector 3-B (Counter Reflection)",
      x: 75, y: 52, w: 23, h: 28,
      enhancedImage: brHd3("esper-wrapper.webp"),
      clueText: "ENHANCED: The red dragon emblem appears on the chopstick wrapper and in the glass beside it. A restaurant lead: compare it with Howie Lee's in Chinatown.",
      flagSet: "br_esper_dragon_revealed", itemGranted: "br_item_dragon_clue", isTarget: true,
    },
    {
      id: "sec_cage", label: "Sector 1-A (Animal Cages)",
      x: 3, y: 35, w: 46, h: 55,
      enhancedImage: brHd3("esper-cages.webp"),
      clueText: "ENHANCED: Rows of animal enclosures establish the camera angle. No legible attacker identification in this sector. Try the counter and the woman's shoulder.",
      flagSet: "br_esper_cage_analyzed",
    },
    {
      id: "sec_shadow", label: "Sector 2-C (Dragonfly Pin)",
      x: 59, y: 27, w: 19, h: 34,
      enhancedImage: brHd3("esper-dragonfly.webp"),
      clueText: "ENHANCED: A gold dragonfly pin on the young woman's coat. Ask Runciter about Lucy; a photograph alone cannot tell you whether someone is human.",
      flagSet: "br_esper_suspect_coat",
    },
  ],
};

const ESPER_YUKON_PHOTO_CONFIG: EsperConfig = {
  title: "ESPER 3D PHOTO RECONSTRUCTION // DISK #2019-YUKON",
  instruction: "EXAMINE YUKON HOTEL SECURITY DISK. SELECT GRID SECTORS TO TRACK AND ENHANCE CLUES.",
  photoImage: "/assets/blade-runner/esper-photo2.jpg",
  winText: "ESPER ANALYSIS SUCCESSFUL: REPLICANT LICENSE PLATE & PHOTO ENVELOPE IDENTIFIED.",
  targetSceneId: "br_mainframe_hub",
  regions: [
    {
      id: "sec_desk",
      label: "Sector 2-A (Desk License Plate)",
      x: 10,
      y: 38,
      w: 26,
      h: 20,
      enhancedImage: "/assets/blade-runner/esper-photo2.jpg",
      clueText: "ENHANCED: Spinner License Plate #9942 registered to Moraji animoid supplier.",
      flagSet: "br_esper_license_revealed",
      itemGranted: "br_item_license_clue",
      isTarget: true,
    },
    {
      id: "sec_mattress",
      label: "Sector 3-C (Photo Envelope)",
      x: 58,
      y: 68,
      w: 34,
      h: 30,
      enhancedImage: "/assets/blade-runner/yukon-hotel.jpg",
      clueText: "ENHANCED: Envelope contains photographs of Nexus-6 Replicant Zhora at Early Q's Nightclub.",
      flagSet: "br_esper_zhora_photo",
    },
  ],
};

const ESPER_CHINATOWN_PHOTO_CONFIG: EsperConfig = {
  title: "ESPER 3D PHOTO RECONSTRUCTION // DISK #2019-CHINATOWN",
  instruction: "EXAMINE CHINATOWN ALLEY DISK. SELECT GRID SECTORS TO TRACK AND ENHANCE CLUES.",
  photoImage: "/assets/blade-runner/esper-photo3.jpg",
  winText: "ESPER ANALYSIS SUCCESSFUL: SYNTHETIC SNAKE SCALE & MORAJI TAG IDENTIFIED.",
  targetSceneId: "br_mainframe_hub",
  regions: [
    {
      id: "sec_trash",
      label: "Sector 4-A (Trash Container)",
      x: 28,
      y: 25,
      w: 36,
      h: 58,
      enhancedImage: "/assets/blade-runner/esper-photo3.jpg",
      clueText: "ENHANCED: Microscopic scale reveals serial #26354 matching Moraji's synthetic python lab.",
      flagSet: "br_esper_snake_revealed",
      itemGranted: "br_item_scale",
      isTarget: true,
    },
  ],
};

const VK_TEST_LUCY_CONFIG: VkConfig = {
  title: "VOIGHT-KAMPFF PROTOCOL // SUBJECT: LUCY DEVLIN",
  subjectName: "Lucy Devlin",
  subjectIsReplicant: true,
  eyeImage: "/assets/blade-runner/vk-eye-lucy.jpg",
  tensionThreshold: 55,
  targetSceneId: "br_mainframe_hub",
  replicantFlagSet: "br_vk_lucy_replicant",
  humanFlagSet: "br_vk_lucy_human",
  questions: [
    {
      id: "vk_q1",
      prompt: "You find a bird with a broken wing on the pavement. What do you do?",
      type: "baseline",
      replicantTensionDelta: 15,
      humanTensionDelta: 5,
      humanResponse: "Find a vet. It might still be possible to help it.",
      replicantResponse: "I look for someone responsible for it.",
    },
    {
      id: "vk_q2",
      prompt: "You're walking in a desert and you look down and see a tortoise crawling toward you. You reach down and flip the tortoise over on its back...",
      type: "empathy",
      replicantTensionDelta: 25,
      humanTensionDelta: 10,
      humanResponse: "Why would I do that? I'd help it right side up!",
      replicantResponse: "What's a tortoise? Is it like a turtle? How long does it stay on its back?",
    },
    {
      id: "vk_q3",
      prompt: "Your little boy shows you his butterfly collection, including his display case and his killing jar...",
      type: "replicant",
      replicantTensionDelta: 30,
      humanTensionDelta: 8,
      humanResponse: "I'd take him to the park to see live ones instead.",
      replicantResponse: "I'd take the jar from him and show him how to pin them tighter.",
    },
  ],
};

const VK_TEST_RACHAEL_CONFIG: VkConfig = {
  title: "VOIGHT-KAMPFF PROTOCOL // SUBJECT: RACHAEL (TYRELL CORP)",
  subjectName: "Rachael",
  subjectIsReplicant: true,
  eyeImage: "/assets/blade-runner/vk-eye-rachael.jpg",
  tensionThreshold: 70,
  targetSceneId: "br_tyrell_office",
  replicantFlagSet: "br_vk_rachael_replicant",
  humanFlagSet: "br_vk_rachael_human",
  questions: [
    {
      id: "vk_rq1",
      prompt: "You have a little boy. He shows you his butterfly collection...",
      type: "baseline",
      replicantTensionDelta: 12,
      humanTensionDelta: 4,
      humanResponse: "I'd teach him to respect living things.",
      replicantResponse: "I'd ask him where he collected them.",
    },
    {
      id: "vk_rq2",
      prompt: "You're watching a stage play. A wasp lands on your arm...",
      type: "empathy",
      replicantTensionDelta: 22,
      humanTensionDelta: 6,
      humanResponse: "I'd brush it off gently.",
      replicantResponse: "I'd swat it instantly.",
    },
    {
      id: "vk_rq3",
      prompt: "You recall an old childhood memory with your mother...",
      type: "replicant",
      replicantTensionDelta: 35,
      humanTensionDelta: 5,
      humanResponse: "I remember the smell of her perfume and the summer rain.",
      replicantResponse: "I remember spider webs in the attic... but Elden says those were implanted memories.",
    },
  ],
};

export const BLADE_RUNNER_ACT1: Story = {
  id: "blade-runner-act1",
  title: "Blade Runner: Act One — The Rep-Detect",
  tagline: "A photoreal fan-made Act One investigation — Runciter’s, LAPD, Chinatown and the Zuben decision. Work in progress.",
  gameKind: "adventure",
  pulpPaper: false,
  coverImage: "/assets/blade-runner/roof.jpg",
  startSceneId: "br_runciter_ext",
  inventoryDisplay: { mode: "container", label: "KIA Database & Satchel", startClosed: true },
  playerSprite: { sheet: MCCOY_WALKER_SHEET },
  verbResponses: {
    look: ["The rain blurs the details, but you take mental note."],
    take: ["That won't help the investigation."],
    talk: ["No response. Just the hum of neon in the rain."],
    use: ["Those pieces don't fit into the case file."],
    go: ["The alley leads nowhere useful."],
  },
  briefing: {
    gameInfo: "LOS ANGELES, 2019. A fan-made work-in-progress inspired by Westwood's 1997 adventure. Start at Runciter's crime scene, work the LAPD evidence systems, then follow the Chinatown lead to Zuben. Legacy film-inspired expansion locations remain optional and are not part of the recreated first-act spine.",
    objective: "Collect Runciter's security disk, enhance the restaurant clue on ESPER, upload the evidence to LAPD, and resolve the confrontation with Zuben before filing your report at home.",
    winConditions: [
      "Recover the security disk and process the restaurant lead with ESPER.",
      "Upload/download your crime-scene evidence at the LAPD mainframe.",
      "Question Howie's cook, follow him to the warehouse, and choose whether to spare or retire Zuben.",
      "Return home and file the first-act report. You can always return to LAPD from the apartment.",
    ],
    loseConditions: ["Choose to abandon the investigation and file the report unsolved. Missing the kitchen dodge only delays the chase; it does not trap the case."],
  },
  // TRAVEL MAP — the Spinner's destination computer. This is what makes
  // scene 3 (the mainframe) an actual HUB: without it the case is a one-way
  // chain and Tyrell HQ / the Yukon Hotel are orphaned scenes nothing routes
  // to. Pins gate on case progress so the city opens up as leads land.
  map: {
    title: "SPINNER — LAPD DESTINATION COMPUTER",
    backgroundImage: "/assets/blade-runner/spinner-skyline.jpg",
    locations: [
      { id: "map_lapd", label: "LAPD HQ — Mainframe Lab", targetSceneId: "br_mainframe_hub", x: 18, y: 30, icon: "🏛" },
      { id: "map_roof", label: "LAPD Rooftop Pad", targetSceneId: "br_roof", x: 10, y: 16, icon: "🚁" },
      { id: "map_bryant", label: "Lieutenant Guzza's Office", targetSceneId: "br_bryant_office", x: 24, y: 44, icon: "🗄" },
      { id: "map_carson", label: "Carson Street", targetSceneId: "br_runciter_ext", x: 42, y: 62, icon: "🌧" },
      { id: "map_chinatown", label: "Chinatown Noodle Bar", targetSceneId: "br_chinatown", x: 62, y: 72, icon: "🥢" },
      {
        id: "map_tyrell",
        label: "Tyrell Corporation",
        targetSceneId: "br_tyrell_ext",
        x: 68,
        y: 24,
        icon: "🔺",
        gating: { requiresFlags: ["br_briefed"] },
        lockedHint: "Clearance pending — finish the briefing at LAPD HQ first.",
      },
      {
        id: "map_yukon",
        label: "Yukon Hotel",
        targetSceneId: "br_yukon_hotel",
        x: 82,
        y: 58,
        icon: "🏨",
        gating: { requiresFlags: ["br_photo_collected"] },
        lockedHint: "No address on file — recover a lead from the Runciter scene first.",
      },
      {
        id: "map_moraji",
        label: "Moraji's Animoid Supply",
        targetSceneId: "br_moraji_lab",
        x: 30,
        y: 80,
        icon: "🐍",
        gating: { requiresFlags: ["br_chinatown_investigated"] },
        lockedHint: "Supplier unknown — work the Chinatown lead first.",
      },
      {
        id: "map_nightclub",
        label: "Early Q's Cabaret",
        targetSceneId: "br_nightclub",
        x: 56,
        y: 86,
        icon: "🎷",
        gating: { requiresFlags: ["br_moraji_visited"] },
        lockedHint: "No suspect sighted there yet.",
      },
      {
        id: "map_apt",
        label: "McCoy's Apartment",
        targetSceneId: "br_mccoy_apt",
        x: 88,
        y: 86,
        icon: "🏢",
      },
    ],
  },
  flagNotes: {
    ...BR_CHAPTER_ONE_FLAGS,
    br_briefed: "Lieutenant Guzza briefed McCoy on the Runciter Animal Shop case.",
    br_badge_granted: "McCoy holds his official LAPD Rep-Detect Badge.",
    br_photo_collected: "Security photo disk retrieved from Runciter's shop.",
    br_crowd_interviewed: "The Carson Street cop finished the witness round at the crime scene.",
    br_esper_dragon_revealed: "ESPER photo analysis revealed the dragon chopstick wrapper clue.",
    br_chinatown_investigated: "Interviewed Howie Lee and found the animal scale in Chinatown.",
    br_vk_lucy_replicant: "Voight-Kampff test confirmed Lucy Devlin is a Nexus-6 Replicant.",
    br_tyrell_visited: "Met Elden Tyrell and conducted VK test on Rachael.",
    br_yukon_investigated: "Searched Yukon Hotel room and retrieved security disk #2.",
    br_moraji_visited: "Interrogated Moraji at Animoid Supply.",
    br_nightclub_visited: "Investigated Early Q's Nightclub and Dektora's dressing room.",
  },
  characters: [
    ...BR_CHAPTER_ONE_CAST,
    {
      id: "br_bryant",
      name: "Lieutenant Guzza",
      role: "LAPD lieutenant / McCoy’s supervisor",
      avatarUrl: brHd("guzza-portrait.png"),
      trustMeter: 10,
      talkingSheet: BRYANT_SHEET,
      talkingX: 25,
      talkingScale: 1.1,
    },
    {
      id: "br_gaff",
      name: "Gaff",
      role: "Veteran Blade Runner",
      avatarUrl: brHd3("gaff-portrait.png"),
      trustMeter: 5,
      talkingSheet: GAFF_SHEET,
      talkingX: 75,
      talkingScale: 1.05,
      talkingFlip: true,
    },
    {
      id: "br_tyrell",
      name: "Dr. Elden Tyrell",
      role: "CEO of Tyrell Corporation",
      avatarUrl: "/assets/blade-runner/br-tyrell-talk.png",
      trustMeter: 0,
      talkingSheet: TYRELL_SHEET,
      talkingX: 30,
      talkingScale: 1.1,
    },
    {
      id: "br_rachael",
      name: "Rachael",
      role: "Tyrell Assistant / Nexus-6 Prototype",
      avatarUrl: "/assets/blade-runner/br-rachael-talk.png",
      trustMeter: 0,
      talkingSheet: RACHAEL_SHEET,
      talkingX: 70,
      talkingScale: 1.05,
      talkingFlip: true,
    },
    {
      id: "br_roy",
      name: "Roy Batty",
      role: "Nexus-6 Leader",
      avatarUrl: "/assets/blade-runner/br-roy-talk.png",
      trustMeter: -10,
      talkingSheet: ROY_SHEET,
      talkingX: 50,
      talkingScale: 1.1,
    },
    {
      id: "br_runciter",
      name: "Runciter",
      role: "Pet Shop Owner",
      avatarUrl: brHd("runciter-portrait.png"),
      trustMeter: 0,
      talkingSheet: RUNCITER_SHEET,
      talkingX: 50,
      talkingScale: 1.05,
    },
    {
      id: "br_howie",
      name: "Howie Lee",
      role: "Chinatown Noodle Chef",
      avatarUrl: brHd("howie-portrait.png"),
      trustMeter: 0,
      talkingSheet: HOWIE_SHEET,
      talkingX: 50,
      talkingScale: 1.05,
    },
    {
      // Early Q's headliner. No talking portrait of her own — she is seen
      // DANCING on stage; the conversation is her one-beat set piece.
      id: "br_dektora",
      name: "Dektora",
      role: "Early Q's Cabaret Performer",
      avatarUrl: "/assets/blade-runner/br-dektora-talk.png",
      trustMeter: 0,
      talkingSheet: DEKTORA_TALK_SHEET,
      talkingX: 50,
      talkingScale: 1.15,
    },
    {
      // A crowd extra — a voice over the rain, no portrait of his own
      // (the long-coat pedestrian paces the street as set dressing).
      id: "br_onlooker",
      name: "Street Onlooker",
      role: "Carson Street Crowd",
      // No face of his own — the anonymous-voice emoji convention.
      avatarUrl: "emoji:👤",
      trustMeter: 0,
    },
    {
      // The VK subject of the mainframe test — now a real person in the
      // cast instead of a name on a machine. Her sheet also dresses the
      // figure haunting the Yukon Hotel room ("Lucy & Clovis stayed here").
      id: "br_lucy",
      name: "Lucy Devlin",
      role: "Nexus-6 Replicant / The Girl in the Dragonfly Coat",
      avatarUrl: "/assets/blade-runner/br-lucy-talk.png",
      trustMeter: 0,
      talkingSheet: LUCY_SHEET,
      talkingX: 60,
      talkingScale: 1.1,
      talkingFlip: true,
    },
    {
      // The crime-scene constable — the original's cop who interviews the
      // crowd at Runciter's exterior.
      id: "br_cop",
      name: "Officer Leary",
      role: "Carson Street Crime Scene",
      avatarUrl: brHd("leary-portrait.png"),
      trustMeter: 0,
      talkingSheet: COP_TALK_SHEET,
      talkingX: 30,
      talkingScale: 1.1,
    },
    {
      // Third-floor lab tech — one meeting, then he's gone.
      id: "br_dino",
      name: "Dino",
      role: "LAPD Mainframe Lab Tech",
      avatarUrl: "/assets/blade-runner/br-dino-talk.png",
      trustMeter: 0,
      talkingSheet: DINO_TALK_SHEET,
      talkingX: 70,
      talkingScale: 1.05,
    },
    {
      // The animoid snake man — his plate finally dresses the interrogation.
      id: "br_moraji",
      name: "Moraji",
      role: "Animoid Supply — Synthetic Serpent Man",
      avatarUrl: "/assets/blade-runner/br-moraji-talk.png",
      trustMeter: 0,
      talkingSheet: MORAJI_TALK_SHEET,
      talkingX: 50,
      talkingScale: 1.1,
    },
  ],
  items: [
    { id: "br_item_zuben_photo", name: "Zuben's photograph", icon: "📷", isClue: true,
      description: "A snapshot recovered from Zuben's coat after the warehouse retirement.",
      flavorText: "Evidence for the case file, not another Runciter camera disk. Ask Gaff about it." },
    { id: "br_item_alley_plate", name: "Discarded vehicle plate", icon: "🔎", iconUrl: brHd("items/license.webp"),
      description: "A license plate recovered from the service-alley dumpster after Gaff's tip.",
      flavorText: "Physical evidence. Upload the number at the LAPD mainframe.", isClue: true },
    {
      id: "br_item_badge",
      name: "LAPD Rep-Detect Badge",
      icon: "🛡️",
      iconUrl: brHd("items/badge.webp"),
      description: "Official LAPD Blade Runner Badge #0994.",
      flavorText: "Gives authority during witness interrogations.",
      isClue: false,
    },
    {
      id: "br_item_blaster",
      name: "Standard Issue Blaster",
      icon: "🔫",
      iconUrl: brHd("items/blaster.webp"),
      description: "SteAT .44 Magnum dual-barrel blaster pistol.",
      flavorText: "The primary tool for retiring illegal Replicants.",
      isClue: false,
    },
    {
      id: "br_item_photo_disk",
      name: "Runciter's Security Photo Disk",
      icon: "💾",
      iconUrl: brHd3("runciter-security.webp"),
      description: "High-resolution optical disk from Runciter's pet shop security camera.",
      flavorText: "Load this into the ESPER machine at LAPD Mainframe to analyze hidden sectors.",
      isClue: true,
    },
    {
      id: "br_item_photo_disk2",
      name: "Yukon Hotel Security Photo Disk",
      icon: "💾",
      iconUrl: "/assets/blade-runner/esper-photo2.jpg",
      description: "Optical photo disk recovered from the Yukon Hotel room.",
      flavorText: "Process on ESPER machine to trace Spinner license plates.",
      isClue: true,
    },
    {
      id: "br_item_casing",
      name: "Shell Casing (.223 caliber)",
      icon: "🪙",
      iconUrl: brHd("items/casing.webp"),
      description: "Spent bullet casing found on the floor at Runciter's.",
      flavorText: "Fired from a military-grade sidearm.",
      isClue: true,
    },
    {
      id: "br_item_dragon_clue",
      name: "Dragon Chopstick Wrapper",
      icon: "🐉",
      iconUrl: brHd("items/wrapper.webp"),
      description: "Chopstick wrapper carrying a gold dragon motif from Howie Lee's Noodle Bar.",
      flavorText: "Discovered via ESPER photo analysis. Points directly to Chinatown.",
      isClue: true,
    },
    {
      id: "br_item_scale",
      name: "Animoid Fish Scale",
      icon: "🐟",
      iconUrl: brHd("items/scale.webp"),
      description: "A microscopic synthetic fish scale found in Chinatown alley trash.",
      flavorText: "Serial number matches Tyrell Corporation synthetic animal production.",
      isClue: true,
    },
    {
      id: "br_item_license_clue",
      name: "Spinner License Log #9942",
      icon: "📋",
      iconUrl: brHd("items/license.webp"),
      description: "License plate record linking Spinner #9942 to Moraji's Animoid Supply.",
      flavorText: "Identified during ESPER analysis of Yukon Hotel disk.",
      isClue: true,
    },
    {
      id: "br_item_origami",
      name: "Paper Crane (Gaff's Origami)",
      icon: "🦢",
      iconUrl: brHd("items/crane.webp"),
      description: "A small paper crane folded by Gaff.",
      flavorText: "'You've done a man's job, sir.'",
      isClue: false,
    },
    {
      // The original's crime-scene find: a piece of chrome in the gutter
      // below the fire hydrant on Carson Street.
      id: "br_item_chrome",
      name: "Chrome Headlight Trim",
      icon: "🔩",
      iconUrl: brHd("items/chrome.webp"),
      description: "A bent fragment of chrome headlight trim from the gutter at Runciter's crime scene.",
      flavorText: "Somebody's sedan clipped this street tonight — white paint, fresh scrape, plates #9942.",
      isClue: true,
    },
    {
      // Lucy's Corner, Runciter's shop: the wind-up dog on the corner desk.
      id: "br_item_toydog",
      name: "Wind-up Tin Dog",
      icon: "🐕",
      iconUrl: brHd("items/toydog.webp"),
      description: "A battered wind-up tin dog from the corner desk at Runciter's Fine Animals.",
      flavorText: "You wind it. It walks two steps and stops — exactly like the real thing would.",
      isClue: true,
    },
    {
      // Runciter's handshake: he writes letters of recommendation for
      // anybody who asks.
      id: "br_item_reference",
      name: "Letter of Recommendation",
      icon: "📜",
      iconUrl: brHd("items/reference.webp"),
      description: "A folded letter of recommendation from Runciter's Fine Animals, red dog stamp and all.",
      flavorText: "Whichever door you walk through, detective — this opens it.",
      isClue: false,
    },
  ],
  scenes: [
    {
      id: "br_roof",
      title: "1 — LAPD HQ Rooftop Landing Pad",
      nodeType: "stage",
      note: "OPTIONAL LAPD HUB: the playable case opens outside Runciter’s; this roof connects the station. Walk across the rain-slicked roof to the elevator down to Guzza's office.",
      background: "/assets/blade-runner/roof.jpg",
      prose: "",
      cinematic: { mode: "static", parallaxDepth: 0.25, colorGrade: "neon-noir" },
      particles: "storm",
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 15, y: 88 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        depthScale: 0.25,
        hints: "proximity",
        enterCaption: "LOS ANGELES, NOVEMBER 2019. THE RAIN NEVER STOPS.",
        obstacles: [{ x: 30, y: 75, w: 20, h: 15 }],
      },
      hotspots: [
        {
          id: "br_roof_hs_spinner",
          label: "LOOK — LAPD Spinner",
          bounds: { x: 28, y: 55, w: 22, h: 32 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Your standard-issue LAPD Spinner. The turbine engine hums softly in the downpour." },
        },
        {
          id: "br_roof_hs_city",
          label: "LOOK — Neon Skyline",
          bounds: { x: 65, y: 20, w: 30, h: 40 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "Giant holographic advertisements flicker across towering megastructures: 'A new life awaits you in the Off-World colonies!'" },
        },
        {
          id: "br_roof_hs_elevator",
          label: "GO — Elevator to Guzza's Office",
          bounds: { x: 82, y: 48, w: 14, h: 45 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_bryant_office" },
          verbs: { look: { type: "showText", text: "The elevator shaft down to LAPD Lieutenant Guzza's office level." } },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_bryant_office",
      title: "2 — Lieutenant Guzza's Office",
      nodeType: "stage",
      note: "CASE BRIEFING: Talk to Lieutenant Guzza to receive your assignment, badge, and blaster.",
      background: "/assets/blade-runner/bryant-office.jpg",
      prose: "",
      cinematic: {
        mode: "pan",
        panDirection: "right",
        panDistance: 3,
        parallaxDepth: 0.15,
        colorGrade: "noir-1940s",
        // Guzza's desk: walk behind it to reach the chief (y85).
        foregroundExtras: [
          {
            image: "/assets/blade-runner/br-prop-office-desk.png",
            x: 48,
            y: 103,
            scale: 0.47,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
        ],
      },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        depthScale: 0.2,
        hints: "proximity",
        enterCaption: "LIEUTENANT GUZZA'S OFFICE. THE AIR IS THICK WITH CIGARETTE SMOKE.",
        npcs: [
          {
            id: "br_npc_bryant",
            sheet: BRYANT_SHEET,
            x: 48,
            y: 85,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "br_bryant_talk_hs",
          },
          {
            // GAFF — the quiet veteran is on stage now instead of a diamond:
            // he paces the far side of Guzza's desk (y84-86 = behind it,
            // baseline 88) and OWNS the one-shot crane marker, so the
            // origami is handed by a man, not a blinking hotspot.
            id: "br_npc_gaff",
            sheet: GAFF_WALK_SHEET,
            x: 66,
            y: 84,
            scale: 0.95,
            facing: "left",
            speed: 10,
            talkHotspotId: "br_bryant_hs_gaff",
            patrol: [
              { x: 66, y: 84, pause: 6, facing: "left" },
              { x: 58, y: 86, pause: 6, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        {
          // ONE-SHOT by design: the briefing hands the badge and blaster, and
          // re-talking must not re-grant them (the validator flags a
          // repeatable marker that can replay its rewards).
          id: "br_bryant_talk_hs",
          label: "TALK — Lieutenant Guzza",
          bounds: { x: 42, y: 50, w: 16, h: 40 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            flagSet: "br_briefed",
            // LucasArts topic dialogue: the briefing is ONE askable topic on
            // the chief — not a scene-wide beat queue that Gaff's
            // conversation would also play (and vice versa).
            topicPrompt: "Lieutenant. What do I need to know?",
            topicLeaveLabel: "I'm on my way.",
            topics: [
              {
                id: "br_t_briefing",
                label: "The Runciter case",
                beats: [
                  { id: "br_b1", characterId: "br_bryant", text: "McCoy! Glad you made it. What have you got from Carson Street?" },
                  { id: "br_b2", characterId: "br_bryant", text: "The animals are dead, the shopkeeper is alive. Start with the evidence before you decide who did it." },
                  { id: "br_b3", characterId: "br_bryant", text: "Use ESPER on the security disk, then upload what you find to the mainframe. Howie Lee's is worth a visit if the restaurant lead checks out." },
                ],
              },
            ],
            then: [
              { type: "giveItem", itemGranted: "br_item_badge" },
              { type: "giveItem", itemGranted: "br_item_blaster", flagSet: "br_badge_granted" },
            ],
          },
        },
        {
          // One crane, one hand-off — Gaff does not dispense origami. The
          // action is a real conversation now: Gaff the stage NPC IS this
          // marker (talkHotspotId), which requires a start-conversation
          // action; the crane rides the follow-up, one-shot by design.
          id: "br_bryant_hs_gaff",
          label: "TALK — Gaff",
          bounds: { x: 72, y: 52, w: 15, h: 38 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "br_t_gaff",
                label: "You and the paper birds",
                beats: [
                  { id: "br_gb1", characterId: "br_gaff", text: "Gaff doesn't look up from his fold. 'Skin job, huh. Don't get friendly with the chrome — they always end up in the rain.' He slides the finished crane to the center of the desk, between you both." },
                ],
              },
            ],
            then: [
              {
                type: "giveItem",
                itemGranted: "br_item_origami",
                text: "Gaff glances up silently, hands you a freshly folded paper crane, and continues watching.",
              },
            ],
          },
        },
        {
          id: "br_bryant_hs_hallway",
          label: "GO — Mainframe Lab Hub",
          bounds: { x: 88, y: 40, w: 11, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_mainframe_hub" },
        },
      ],
      // Scene beats are EMPTY: the briefing and Gaff's line now live in the
      // two markers' topic lists, so each conversation only plays its own
      // speaker (a shared scene queue would have Gaff reading Guzza's
      // briefing).
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_mainframe_hub",
      title: "3 — LAPD Mainframe & Analysis Lab",
      nodeType: "stage",
      note: "ANALYSIS HUB: Access the ESPER photo analyzer terminal or Voight-Kampff testing apparatus, then take the Spinner into the city.",
      background: brHd("mainframe.webp"),
      prose: "",
      cinematic: { mode: "static", dimAmount: 0 },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "LAPD MAINFRAME LAB. ESPER PHOTO TERMINAL AND VK UNIT ONLINE.",
        npcs: [
          {
            // DINO — the third-floor lab tech. The original's lab visit is a
            // one-time meeting ("you'll never see him again"): the marker is
            // one-shot, and he stays on stage as set dressing afterwards.
            id: "br_npc_dino",
            sheet: DINO_TALK_SHEET,
            x: 72,
            y: 84,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "br_hs_dino_talk",
          },
        ],
      },
      hotspots: [
        { id: "br_hs_mainframe_sync",
          states: [{ id: "synced", when: { requiresFlags: ["br_mainframe_synced"] }, action: { type: "showText", text: "KIA synchronized. Your crime-scene evidence is already on the LAPD mainframe. The case remains available for review." } }],
          label: "USE — KIA upload / download", cursor: "use", bounds: { x: 43, y: 48, w: 15, h: 41 },
          gating: { requiresItems: ["br_item_photo_disk"] }, customFailMessage: "Recover the security disk from Runciter's before uploading the case.",
          action: { type: "setFlag", flagSet: "br_mainframe_synced", text: "KIA evidence uploaded. LAPD comparison downloaded. The laboratory has a copy of your crime-scene record; the investigation remains open." } },
        { id: "br_hs_mainframe_home", label: "GO — Spinner to McCoy's apartment", cursor: "go", bounds: { x: 4, y: 58, w: 11, h: 33 },
          isRepeatable: true, action: { type: "goToScene", targetSceneId: "br_mccoy_apt" } },
        { id: "br_hs_mainframe_guzza", label: "GO — Lieutenant Guzza's office", cursor: "go", bounds: { x: 71, y: 61, w: 10, h: 31 },
          isRepeatable: true, action: { type: "goToScene", targetSceneId: "br_bryant_office" } },
        {
          id: "br_hs_esper_terminal",
          label: "USE — ESPER Photo Analyzer",
          bounds: { x: 22, y: 45, w: 18, h: 42 },
          cursor: "use",
          isRepeatable: true,
          gating: { requiresItems: ["br_item_photo_disk"] },
          customFailMessage: "You need a security photo disk from a crime scene to load into ESPER.",
          action: {
            type: "esperPhoto",
            esperPhoto: ESPER_SECURITY_PHOTO_CONFIG,
          },
          verbs: { look: { type: "showText", text: "ESPER 3D photo reconstruction terminal for enhancing digital surveillance disks." } },
        },
        {
          id: "br_hs_vk_terminal",
          gating: { requiresFlags: ["br_yukon_investigated"] },
          customFailMessage: "This legacy archive is not part of the first-act investigation. Question Zuben in Howie’s kitchen.",
          label: "USE — Archived VK demonstration (legacy)",
          bounds: { x: 50, y: 45, w: 18, h: 42 },
          cursor: "use",
          isRepeatable: true,
          action: {
            type: "vkTest",
            vkTest: VK_TEST_LUCY_CONFIG,
          },
          verbs: { look: { type: "showText", text: "Voight-Kampff apparatus for measuring capillary dilation and iris fluctuation." } },
        },
        {
          // ESPER disk #2 — the Yukon Hotel recovery. Was authored but never
          // wired to a terminal, so the disk was an item that did nothing.
          id: "br_hs_esper_terminal2",
          label: "USE — ESPER: Yukon Hotel Disk",
          bounds: { x: 40, y: 72, w: 14, h: 20 },
          cursor: "use",
          isRepeatable: true,
          gating: { requiresItems: ["br_item_photo_disk2"] },
          customFailMessage: "ESPER slot B is empty. Recover the Yukon Hotel security disk first.",
          action: { type: "esperPhoto", esperPhoto: ESPER_YUKON_PHOTO_CONFIG },
        },
        {
          // ESPER disk #3 — the Chinatown alley recovery, same story.
          id: "br_hs_esper_terminal3",
          label: "USE — ESPER: Chinatown Alley Disk",
          bounds: { x: 60, y: 72, w: 14, h: 20 },
          cursor: "use",
          isRepeatable: true,
          gating: { requiresItems: ["br_item_license_clue"] },
          customFailMessage: "ESPER slot C is empty. Recover the Chinatown alley disk first.",
          action: { type: "esperPhoto", esperPhoto: ESPER_CHINATOWN_PHOTO_CONFIG },
        },
        {
          // ONE-SHOT by design — the original's third-floor lab visit
          // happens exactly once and sets nothing on the case, so this is a
          // pure "you cannot ask again" marker (no reward to replay).
          id: "br_hs_dino_talk",
          label: "TALK — Dino (Lab Tech)",
          bounds: { x: 66, y: 48, w: 14, h: 40 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "br_t_dino_file",
                label: "Runciter's file",
                beats: [
                  { id: "br_dn1", characterId: "br_dino", text: "Dino doesn't look up from the terminal. 'Runciter's file is in the queue, detective — ESPER first, printouts after. And save the small talk: once you're out there you'll never see me again. That's the rule. The third floor doesn't exist. Neither do we.'" },
                ],
              },
            ],
          },
        },
        {
          id: "br_hs_spinner_takeoff",
          label: "GO — Board Spinner to Carson Street",
          bounds: { x: 80, y: 40, w: 16, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_spinner_flight" },
        },
        {
          id: "br_hs_hub_roof",
          label: "GO — Elevator to Rooftop Pad",
          bounds: { x: 2, y: 42, w: 10, h: 50 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_roof" },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      // SPINNER FLIGHT — a transit beat that shows off the masked-layer
      // engine feature: the windscreen cut-out is an ALPHA MASK and the
      // cityscape behind it SCROLLS endlessly, so the cabin reads as
      // climbing through traffic instead of sitting on a still plate.
      id: "br_spinner_flight",
      title: "3b — Spinner En Route",
      nodeType: "stage",
      hideHud: true,
      note: "MASKED COCKPIT: alpha-masked windscreen over an endless scrolling skyline.",
      background: "/assets/blade-runner/spinner-cockpit.jpg",
      prose: "",
      cinematic: {
        mode: "static",
        dimAmount: 0,
        foregroundExtras: [
          {
            // The moving world, clipped to the glass: a slow skyline crawl.
            // The window mask is cut from the cabin plate itself (alpha),
            // so glass and cut-out agree to the pixel.
            image: "/assets/blade-runner/spinner-city-tile.png",
            fit: "cover",
            anchor: "50% 50%",
            x: 50,
            y: 50,
            maskImage: brHd("spinner-windscreen-window.png"),
            maskFit: "cover",
            scroll: { axis: "y", speed: 3, crossSpeed: 5, offsetY: -34 },
            depth: 0.2,
          },
          {
            // A closer second plane: the elevated traffic lane the spinner
            // rides. It crawls through the LOWER band of the glass (its own
            // banded window mask keeps it from smearing the skyline above),
            // faster than the skyline — that speed gap is what sells the climb.
            image: "/assets/blade-runner/spinner-highway-tile.jpg",
            opacity: 0.28,
            blendMode: "screen",
            fit: "fill",
            anchor: "50% 50%",
            x: 50,
            y: 50,
            maskImage: brHd("spinner-highway-window.png"),
            maskFit: "cover",
            scroll: { axis: "x", speed: 22, crossSpeed: 2 },
            depth: 0.5,
          },
          {
            // McCoy's LAPD spinner cockpit, re-cut: the SAME window mask
            // INVERTED, so the cabin keeps its dashboard, A-pillars and
            // wiper blades and loses only the glass — which now really
            // shows the two scrolling planes instead of a baked-in photo.
            image: "/assets/blade-runner/spinner-cockpit.jpg",
            fit: "cover",
            anchor: "50% 50%",
            x: 50,
            y: 50,
            maskImage: brHd("spinner-windscreen-window.png"),
            maskFit: "cover",
            maskInvert: true,
            depth: 0.9,
          },
        ],
      },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 50, y: 90 },
        speed: 0,
        hidePlayer: true,
        keyboard: false,
        reach: 6,
        floor: { top: 86, bottom: 96 },
        enterCaption: "SPINNER CLIMBING. TRAFFIC LANE 4 — CARSON STREET EXIT AHEAD.",
      },
      hotspots: [
        {
          id: "br_hs_flight_dash",
          label: "LOOK — Spinner Dashboard",
          bounds: { x: 26, y: 62, w: 48, h: 28 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "Lane indicators scroll past. The city falls away under the traffic lane.",
          },
        },
        {
          // REPEATABLE: the flight is a transit room the player crosses
          // several times in the act — a one-shot descent marker would
          // vanish after the first landing and strand every later flight
          // with only the abort and the map.
          id: "br_hs_flight_arrive",
          remote: true,
          label: "GO — Descend to Carson Street",
          bounds: { x: 76, y: 66, w: 20, h: 26 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_runciter_ext" },
        },
        {
          // RETURN ROUTE — a flight is a journey, not a trap: cutting it gets
          // McCoy back to the mainframe lab (the validator reads a one-way
          // transit room as a soft-lock otherwise, and so should a player).
          id: "br_hs_flight_abort",
          remote: true,
          label: "GO — Abort, Return to HQ Pad",
          bounds: { x: 2, y: 40, w: 10, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_mainframe_hub" },
          verbs: {
            look: { type: "showText", text: "The traffic lane back to LAPD HQ, lane 2, holding." },
          },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_runciter_ext",
      title: "4 — Carson Street (Runciter's Animals Exterior)",
      nodeType: "stage",
      note: "CRIME SCENE EXTERIOR: Carson Street in pouring rain. Talk to onlookers or enter Runciter's Shop.",
      background: "/assets/blade-runner/runciter-ext.jpg",
      prose: "",
      onEnterActions: [{ consequences: { addItems: ["br_item_badge", "br_item_blaster"], setFlags: ["br_badge_granted"] } }],
      cinematic: {
        mode: "pan",
        panDirection: "right",
        panDistance: 4,
        colorGrade: "neon-noir",
        // Walk-behind street furniture: the damaged sedan at the scene
        // (taillights and plate #9942 — the original's inspectable car) and
        // the red fire hydrant the chrome came out from.
        foregroundExtras: [
          {
            // Parked left-of-centre so the spawn point (x8) and the left
            // exit stay clear of its silhouette.
            image: "/assets/blade-runner/br-prop-sedan.png",
            x: 22,
            y: 102,
            scale: 0.20,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
          {
            image: "/assets/blade-runner/br-prop-firehydrant.png",
            x: 66,
            y: 98,
            scale: 0.16,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
        ],
      },
      particles: "rain",
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 8, y: 92 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        enterCaption: "CARSON STREET. POLICE TAPE SEALS OFF RUNCITER'S FINE ANIMALS.",
        exitEdges: {
          left: { targetSceneId: "br_mainframe_hub", label: "LAPD Headquarters" },
        },
        npcs: [
          {
            // The "Street Onlooker" is a living passer-by now: a closed-
            // umbrella long-coat walker pacing the wet sidewalk. Linked to
            // the old static marker, so the diamond hides and the character
            // IS the hotspot — walk up to him wherever he's pacing and talk.
            id: "br_npc_pedestrian",
            sheet: STREET_WALKER_SHEET,
            x: 70,
            y: 90,
            scale: 0.9,
            facing: "left",
            speed: 10,
            talkHotspotId: "br_hs_ext_crowd",
            patrol: [
              { x: 70, y: 90, pause: 3, facing: "left" },
              { x: 16, y: 92, pause: 3, facing: "right" },
              { x: 82, y: 88, pause: 3, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
          {
            // THE COP — the original's crime-scene constable who interviews
            // the crowd. Static by design: he holds the tape line and does
            // not wander off his post.
            id: "br_npc_cop",
            sheet: COP_TALK_SHEET,
            x: 40,
            y: 88,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "br_hs_cop",
          },
          {
            // Second walker variant — the crowd is two bodies, not one
            // clone: the teal-raincoat woman crosses against the traffic.
            id: "br_npc_ped2",
            sheet: STREET_WALKER2_SHEET,
            x: 40,
            y: 91,
            scale: 0.85,
            facing: "right",
            speed: 10,
            patrol: [
              { x: 84, y: 89, pause: 3, facing: "left" },
              { x: 14, y: 93, pause: 4, facing: "right" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        { id: "br_hs_ext_lapd", label: "GO — Spinner to LAPD headquarters", cursor: "go", bounds: { x: 2, y: 55, w: 12, h: 37 },
          isRepeatable: true, walkOver: false, action: { type: "goToScene", targetSceneId: "br_roof" } },
        {
          id: "br_hs_ext_door",
          label: "GO — Enter Runciter's Shop",
          bounds: { x: 42, y: 38, w: 18, h: 54 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_runciter_int" },
        },
        {
          // A conversation, not a popup: the linked pedestrian IS this
          // marker, and a shouting crowd extra is a one-beat scene.
          id: "br_hs_ext_crowd",
          label: "TALK — Street Onlooker",
          bounds: { x: 18, y: 60, w: 15, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          // The original's two-step crowd interview: first the constable
          // runs the witness round (one ask, sets the flag), then he can be
          // pressed for what they said — and that second topic is the
          // "fat man in red" clue that points at the noodle bar.
          id: "br_hs_cop",
          label: "TALK — Officer Leary",
          bounds: { x: 30, y: 48, w: 16, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topicPrompt: "Officer Leary. What's the word from the witnesses?",
            topicLeaveLabel: "Thank you.",
            topics: [
              {
                id: "br_t_cop_witnesses",
                label: "The witnesses",
                beats: [
                  { id: "br_cb1", characterId: "br_cop", text: "The constable checks his badge against yours. 'Word from the crowd, detective: glass went at half past, two long coats ran toward Chinatown, and the whole block smelled of noodles and ozone. You want the rest, stand here while I finish the round.'" },
                ],
                flagSet: "br_crowd_interviewed",
              },
              {
                id: "br_t_cop_fatman",
                label: "What did they say?",
                gating: { requiresFlags: ["br_crowd_interviewed"] },
                repeatable: true,
                beats: [
                  { id: "br_cb2", characterId: "br_cop", text: "'One witness keeps coming back to one thing. A fat man in a red coat — bought noodles in bulk at the corner bar, tipped in Tyrell credits, and left through the alley with two quiet men behind him. The noodle bar, detective. That's the thread I'd pull.'" },
                ],
              },
            ],
          },
        },
        {
          // The sedan at the scene — the original's inspectable car
          // (taillights and plate). Repeatable: looking again costs nothing.
          id: "br_hs_sedan_look",
          label: "LOOK — Damaged Sedan",
          bounds: { x: 16, y: 62, w: 24, h: 30 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "A white sedan, stopped where the glass broke. The rear bumper is dented, one tail light smashed — the plate reads #9942. It's been here long enough to rust a shadow into the wet asphalt.",
          },
        },
        {
          id: "br_hs_sedan_trunk",
          label: "LOOK — Sedan Trunk",
          bounds: { x: 28, y: 58, w: 10, h: 34 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "The trunk is closed and locked. A fresh scrape of white paint on the corner — this car ran into something before it stopped. Someone left it here to be seen.",
          },
        },
        {
          // The original's fire-hydrant find: a piece of chrome in the
          // gutter below the hydrant at the Runciter scene.
          id: "br_hs_take_chrome",
          label: "TAKE — Chrome under the Fire Hydrant",
          bounds: { x: 61, y: 82, w: 10, h: 13 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_chrome",
            text: "Down in the gutter beneath the hydrant: a fragment of chrome headlight trim, scored with fresh impact marks. Somebody's car clipped this street tonight.",
          },
        },
        {
          id: "br_hs_chinatown_travel",
          label: "GO — Travel to Chinatown Noodle Bar",
          bounds: { x: 85, y: 45, w: 14, h: 48 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_chinatown" },
        },
      ],
      dialogueBeats: [
        {
          id: "br_ob1",
          characterId: "br_onlooker",
          text: "An onlooker shouts over the rain: 'I saw two people in long coats run toward Chinatown right after the glass broke!'",
        },
      ],
      choices: [],
    },
    {
      id: "br_runciter_int",
      title: "5 — Runciter's Fine Animals (Crime Scene)",
      nodeType: "stage",
      note: "CRIME SCENE INVESTIGATION: Collect bullet casing, dragon wrapper, and the security photo disk. Interview shopkeeper Runciter.",
      background: brHd("runciter-room.webp"),
      prose: "",
      cinematic: { mode: "static", dimAmount: 0 },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 3 / 2,
        playerScale: 1.7,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 74, bottom: 96 },
        obstacles: [{ x: 20, y: 68, w: 43, h: 15 }],
        // The door marker sits on the spawn side of the shop: under
        // walk-over triggering the player was ejected before reaching the
        // counter. All first-act rooms now use aim: walking is only walking.
        enterCaption: "RUNCITER'S PET SHOP. BROKEN CAGES AND SCATTERED DNA LABELS.",
        npcs: [
          {
            // The grieving shopkeeper himself — the TALK marker was a static
            // diamond over his counter; now he stands there, head bowed, and
            // the player walks up to HIM.
            id: "br_npc_runciter",
            sheet: RUNCITER_WALK_SHEET,
            x: 82,
            y: 87,
            scale: 1.65,
            facing: "left",
            talkHotspotId: "br_hs_runciter_talk",
          },
        ],
      },
      hotspots: [
        {
          // Topic hub (the shared scene queue is gone): the two case beats
          // live under "what happened here", and the corner-desk pointer
          // under "your clerk".
          id: "br_hs_runciter_talk",
          label: "TALK — Runciter (Shopkeeper)",
          bounds: { x: 48, y: 48, w: 16, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topicPrompt: "Mr. Runciter. Can you help me?",
            topicLeaveLabel: "I understand.",
            topics: [
              {
                id: "br_t_runciter_case",
                label: "What happened here",
                repeatable: true,
                beats: [
                  { id: "br_rb1", characterId: "br_runciter", text: "Look at what they did! My real chinchilla... slaughtered! And they didn't take cash, they took the synthetic animal genetic tags!" },
                  { id: "br_rb2", characterId: "br_runciter", text: "Check my security camera console on the desk. You can take the disk to ESPER if you've got clearance." },
                ],
              },
              {
                id: "br_t_runciter_lucy",
                label: "Your clerk",
                repeatable: true,
                beats: [
                  { id: "br_rb3", characterId: "br_runciter", text: "Her desk is over there. Lucy hasn't come back since the attack. She kept a wind-up dog on the blotter and never says a word about it. Nobody works the night shift in this district for nothing, detective." },
                ],
              },
            ],
          },
        },
        {
          // Lucy is missing at this point in the investigation.
          id: "br_hs_lucy_talk", label: "LOOK — Lucy's empty station", bounds: { x: 80, y: 52, w: 14, h: 25 },
          cursor: "look", remote: true, isRepeatable: true,
          action: { type: "showText", text: "The clerk is missing. Her empty station and belongings are evidence, not a witness waiting to be questioned." },
        },
        {
          id: "br_hs_take_toydog",
          label: "TAKE — Wind-up Toy Dog",
          bounds: { x: 74, y: 68, w: 9, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_toydog",
            text: "A battered wind-up tin dog from the corner desk. You wind it. It walks two steps and stops, exactly like the real thing would.",
          },
        },
        {
          id: "br_hs_look_wrapper",
          label: "LOOK — Candy-bar Wrapper",
          bounds: { x: 87, y: 70, w: 8, h: 10 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A candy-bar wrapper, twisted and rain-warm, under the desk's edge. Tyrell-issue ration bar — the same grey foil as the colony advertisements.",
          },
        },
        {
          id: "br_hs_look_lucydesk",
          label: "LOOK — The Corner Desk",
          bounds: { x: 72, y: 60, w: 16, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Lucy's corner: a desk worn smooth by one pair of hands. A wind-up tin dog, a candy wrapper, a stamp pad, and a stack of folded letters of recommendation in Runciter's own handwriting.",
          },
        },
        {
          // Runciter's handshake from the original: he gives you a letter of
          // recommendation. One-shot — a letter, not a fountain. Aim-only
          // (walkOver: false): it sits on the main aisle, and the pickup
          // must be deliberate, not a stray footstep from the door.
          id: "br_hs_take_reference",
          label: "TAKE — Letter of Recommendation",
          bounds: { x: 48, y: 84, w: 9, h: 12 },
          cursor: "take",
          showItemImage: true,
          walkOver: false,
          action: {
            type: "giveItem",
            itemGranted: "br_item_reference",
            text: "Runciter presses a folded letter into your hand, red dog stamp and all. 'For my best customer. Whichever door you walk through, detective — this opens it.'",
          },
        },
        {
          id: "br_hs_take_disk",
          label: "TAKE — Security Camera Photo Disk",
          bounds: { x: 22, y: 67, w: 10, h: 22 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_photo_disk",
            flagSet: "br_photo_collected",
            text: "You retrieve the security camera optical disk. Take this to the ESPER terminal in the LAPD Mainframe Lab.",
          },
        },
        {
          id: "br_hs_take_casing",
          label: "TAKE — Bullet Casing",
          bounds: { x: 36, y: 82, w: 8, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_casing",
            text: "A spent military .223 bullet casing. The Replicants were armed.",
          },
        },
        {
          id: "br_hs_runciter_exit",
          label: "GO — Return to Carson Street",
          bounds: { x: 2, y: 40, w: 10, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_runciter_ext" },
        },
      ],
      // The Runciter beats live in his marker's topic list (above), not in
      // a scene queue — a shared queue would have the corner clerk read the
      // shopkeeper's lines.
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_tyrell_ext",
      title: "6 — Tyrell Corporation Headquarters",
      nodeType: "stage",
      note: "TYRELL CORP: Fly your Spinner to the Tyrell Corporation pyramid.",
      background: "/assets/blade-runner/tyrell-building.jpg",
      prose: "",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 5, colorGrade: "spielberg-golden" },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        enterCaption: "TYRELL CORPORATION HQ. THE GOLDEN PYRAMID TOWERS INTO THE STORMY CLOUDS.",
      },
      hotspots: [
        {
          id: "br_hs_tyrell_penthouse",
          label: "GO — Enter Dr. Tyrell's Penthouse Office",
          bounds: { x: 45, y: 40, w: 20, h: 50 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_tyrell_office" },
        },
        {
          id: "br_hs_tyrell_return",
          label: "GO — Return to Spinner",
          bounds: { x: 5, y: 50, w: 12, h: 42 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_mainframe_hub" },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_tyrell_office",
      title: "7 — Dr. Elden Tyrell's Penthouse Office",
      nodeType: "stage",
      note: "TYRELL INTERVIEW: Interview Dr. Elden Tyrell and conduct a Voight-Kampff test on Rachael.",
      background: "/assets/blade-runner/tyrell-office.jpg",
      prose: "",
      cinematic: {
        mode: "static",
        colorGrade: "spielberg-golden",
        // The art-deco pedestal (bonsai + a GOLDEN origami crane — a quiet
        // echo of Gaff's paper one): Tyrell paces behind it.
        foregroundExtras: [
          {
            image: "/assets/blade-runner/br-prop-penthouse-stand.png",
            x: 32,
            y: 102,
            scale: 0.4,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
        ],
      },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "DR. TYRELL'S PENTHOUSE. SUNLIGHT STREAMS THROUGH MASSIVE SOARING WINDOWS.",
        npcs: [
          {
            // TYRELL — the TALK marker was a diamond over empty air; now the
            // father of the replicants paces his own office and owns it.
            id: "br_npc_tyrell",
            sheet: TYRELL_WALK_SHEET,
            x: 36,
            y: 84,
            scale: 1.0,
            facing: "left",
            speed: 10,
            talkHotspotId: "br_hs_tyrell_talk",
            patrol: [
              { x: 36, y: 84, pause: 7, facing: "left" },
              { x: 46, y: 86, pause: 7, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
          {
            // RACHAEL — the prototype by the windows. She is not the talk
            // target (the VK unit is), she is the presence that makes the
            // room the original's Tyrell penthouse: composed, watching.
            id: "br_npc_rachael",
            sheet: RACHAEL_WALK_SHEET,
            x: 70,
            y: 84,
            scale: 0.95,
            facing: "left",
            speed: 9,
            patrol: [
              { x: 70, y: 84, pause: 9, facing: "left" },
              { x: 78, y: 86, pause: 9, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        {
          // ONE-SHOT by design: the interview opens the Tyrell pin on the
          // Spinner map (br_tyrell_visited), and a repeatable
          // start-conversation marker setting a flag would warn the
          // validator (reward replay). After the first word, Tyrell stays
          // on stage as set-dressing — you can always run the VK unit.
          id: "br_hs_tyrell_talk",
          label: "TALK — Dr. Elden Tyrell",
          bounds: { x: 28, y: 45, w: 16, h: 44 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            flagSet: "br_tyrell_visited",
            topics: [
              {
                id: "br_t_tyrell",
                label: "Tyrell Corporation",
                beats: [
                  { id: "br_tb1", characterId: "br_tyrell", text: "Dr. Tyrell smiles smoothly: 'Commerce is our goal here at Tyrell. More human than human is our motto.' His white hand lifts a bonsai branch an inch, then lets it settle — a man who owns everything except his own clock." },
                ],
              },
            ],
          },
        },
        {
          id: "br_hs_rachael_vk",
          label: "USE — VK Test on Rachael",
          bounds: { x: 68, y: 45, w: 16, h: 44 },
          cursor: "use",
          isRepeatable: true,
          action: {
            type: "vkTest",
            vkTest: VK_TEST_RACHAEL_CONFIG,
          },
          verbs: { look: { type: "showText", text: "Rachael stands near the window, serene and elegant. Perform a Voight-Kampff test to check her emotional responses." } },
        },
        {
          id: "br_hs_tyrell_exit",
          label: "GO — Leave Penthouse",
          bounds: { x: 2, y: 45, w: 10, h: 50 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_tyrell_ext" },
        },
      ],
      // The motto line lives in the marker's topic list (see above).
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_yukon_hotel",
      title: "8 — Yukon Hotel (Replicant Hideout)",
      nodeType: "stage",
      note: "REPLICANT HIDEOUT: Search the Yukon Hotel room where Lucy & Clovis stayed.",
      background: "/assets/blade-runner/yukon-hotel.jpg",
      prose: "",
      cinematic: { mode: "static", colorGrade: "neon-noir" },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "YUKON HOTEL ROOM. NEON BLEEDS THROUGH TORN VENETIAN BLINDS.",
        npcs: [
          {
            // LUCY DEVLIN — the VK test subject from the mainframe machine,
            // rendered as the presence in the room she and Clovis stayed in.
            // (The old anonymous "replicant" sheet was declared but never
            // actually this person.) Long pauses: she mostly stands at the
            // window, occasionally crossing the room.
            id: "br_npc_lucy",
            sheet: LUCY_WALK_SHEET,
            x: 72,
            y: 80,
            scale: 0.85,
            facing: "left",
            speed: 11,
            patrol: [
              { x: 72, y: 80, pause: 9, facing: "left" },
              { x: 40, y: 84, pause: 7, facing: "right" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        {
          id: "br_hs_yukon_disk",
          label: "TAKE — Yukon Photo Disk #2",
          bounds: { x: 55, y: 62, w: 14, h: 20 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_photo_disk2",
            flagSet: "br_yukon_investigated",
            text: "You retrieve security photo disk #2 hidden under the mattress. Take this to ESPER at LAPD HQ.",
          },
        },
        {
          id: "br_hs_yukon_exit",
          label: "GO — Leave Hotel Room",
          bounds: { x: 2, y: 40, w: 10, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_runciter_ext" },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_chinatown",
      title: "9 — Howie Lee's Chinatown Noodle Bar",
      nodeType: "stage",
      note: "CHINATOWN INVESTIGATION: Interview Howie Lee, inspect alleyway for clues.",
      background: "/assets/blade-runner/chinatown.jpg",
      prose: "",
      cinematic: {
        mode: "pan",
        panDirection: "left",
        panDistance: 3,
        colorGrade: "neon-noir",
        // The noodle bar — walk behind it to the cook (y84).
        foregroundExtras: [
          {
            image: "/assets/blade-runner/br-prop-noodle-counter.png",
            x: 52,
            y: 103,
            scale: 0.48,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
        ],
      },
      particles: "rain",
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "CHINATOWN NOODLE BAR. STEAM RISES FROM BOILING CAULDRONS.",
        npcs: [
          { id: "br_npc_gordo", sheet: BR_HD_SHEETS.gordo, x: 26, y: 85, scale: 1.12, facing: "right", talkHotspotId: "br_hs_gordo", talkAnim: "talk" },
          {
            // Howie Lee behind his woks — the TALK marker was a floating
            // diamond; the chef now owns it and leans in to share the gossip.
            id: "br_npc_howie",
            sheet: HOWIE_WALK_SHEET,
            x: 52,
            y: 84,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "br_hs_howie_talk",
            talkAnim: "talk",
            // Woks (y84, behind the bar — baseline 88) to the rail (y89,
            // in front of it): the chef really crosses his own bar.
            patrol: [
              { x: 52, y: 84, pause: 4, facing: "left" },
              { x: 40, y: 89, pause: 3, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
          {
            // Rain-slick street passers-by keep the block alive.
            id: "br_npc_chinatown_ped",
            sheet: STREET_WALKER_SHEET,
            x: 30,
            y: 92,
            scale: 0.85,
            facing: "left",
            speed: 10,
            patrol: [
              { x: 78, y: 90, pause: 2, facing: "left" },
              { x: 12, y: 93, pause: 2, facing: "right" },
              { x: 70, y: 91, pause: 3, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
          {
            // The umbrella woman works the opposite direction of the long
            // coat — the alley block reads as a street with a crowd.
            id: "br_npc_chinatown_ped2",
            sheet: STREET_WALKER2_SHEET,
            x: 60,
            y: 92,
            scale: 0.8,
            facing: "left",
            speed: 9,
            patrol: [
              { x: 16, y: 93, pause: 3, facing: "right" },
              { x: 80, y: 90, pause: 3, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        { id: "br_hs_gordo", label: "TALK — Gordo Frizz", cursor: "talk", bounds: { x: 20, y: 48, w: 14, h: 41 }, isRepeatable: true,
          action: { type: "startDialogue", topicPrompt: "The man in the red coat looks up from his dinner.", topicLeaveLabel: "Enjoy the noodles.", topics: [
            { id: "br_t_gordo_intro", label: "Seen anything unusual?", flagSet: "br_gordo_interviewed", beats: [
              { id: "br_gordo_line", characterId: "br_gordo", text: "A detective asking a comedian for a straight answer. That's a new one. Your cook looks more nervous than I do. Try him." },
            ] },
          ] } },
        { id: "br_hs_howie_street", label: "GO — Street and parked Spinner", cursor: "go", bounds: { x: 85, y: 45, w: 12, h: 48 },
          isRepeatable: true, walkOver: false, action: { type: "goToScene", targetSceneId: "br_howie_street" } },
        { id: "br_hs_howie_kitchen", label: "GO — Howie's rear kitchen", cursor: "go", bounds: { x: 64, y: 44, w: 12, h: 47 },
          isRepeatable: true, gating: { requiresFlags: ["br_esper_dragon_revealed"] }, customFailMessage: "Process Runciter’s security disk on ESPER at LAPD first. The restaurant clue gives you a reason to question the cook.",
          action: { type: "goToScene", targetSceneId: "br_howie_kitchen" } },
        { id: "br_hs_chinatown_lapd", label: "GO — Spinner back to LAPD", cursor: "go", bounds: { x: 2, y: 53, w: 11, h: 39 },
          isRepeatable: true, action: { type: "goToScene", targetSceneId: "br_mainframe_hub" } },
        {
          // A REAL interview now (the original's Chinatown NPC is
          // questionable, not a text popup): Howie owns the marker as a
          // linked stage NPC. The investigation flag is NOT set here —
          // the interview is repeatable (you can ask him again) and the
          // case counts when the alley evidence is actually recovered.
          id: "br_hs_howie_talk",
          label: "TALK — Howie Lee",
          bounds: { x: 40, y: 45, w: 18, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topicPrompt: "Howie Lee wipes his hands on the steam and leans in.",
            topicLeaveLabel: "I'll find her.",
            topics: [
              { id: "br_t_howie_cook", label: "The cook in your kitchen", flagSet: "br_zuben_lead", beats: [
                { id: "br_howie_cook_line", characterId: "br_howie", text: "Zuben. Good worker, keeps to himself. He's in the back. No shooting in my restaurant, detective." },
              ] },
              {
                id: "br_t_howie_dragonfly",
                label: "The girl in the dragonfly coat",
                repeatable: true,
                beats: [
                  { id: "br_hb1", characterId: "br_howie", text: "Howie Lee glances around the steam, lowers his voice: 'He say you Blade Runner, huh? You want know about the dragon chopstick wrapper?'" },
                  { id: "br_hb2", characterId: "br_howie", text: "'Yes, girl in dragonfly coat — bought noodles ten minutes ago, paid in Tyrell credits, then ran down the alley. Fish market alley. Go quick, she still has the trash to sort.'" },
                ],
              },
              {
                // The fat-man clue lands here: the cop's witness thread
                // ("a fat man in a red coat") points at this bar, and Howie
                // owns the answer — the man who doesn't eat at his bar.
                id: "br_t_howie_fatman",
                label: "The fat man in red",
                repeatable: true,
                beats: [
                  { id: "br_hb3", characterId: "br_howie", text: "'Fat man in red? ...I see all kinds at the bar. Big fella, bought noodles in bulk, tipped Tyrell credits, and left through the fish alley with two quiet men behind him. Didn't touch his food. A man who doesn't eat at my bar, detective — that's the tell.'" },
                ],
              },
            ],
          },
        },
        {
          // The investigation flag drops HERE — with the physical evidence
          // (the interview is repeatable and sets nothing).
          id: "br_hs_alley_scale",
          label: "TAKE — Fish Scale in Alley Trash",
          bounds: { x: 70, y: 75, w: 12, h: 18 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "br_item_scale",
            flagSet: "br_chinatown_investigated",
            text: "An animoid fish scale carrying a Tyrell Corporation serial number.",
          },
        },
        {
          id: "br_hs_moraji_travel",
          label: "GO — Moraji's Animoid Supply",
          bounds: { x: 88, y: 40, w: 11, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_moraji_lab" },
        },
      ],
      // Howie's beats live in his marker's topic list (above) — the old
      // scene queue predated the topic hub and would double-play them.
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_moraji_lab",
      title: "10 — Moraji's Animoid Supply Lab",
      nodeType: "stage",
      note: "ANIMOID LAB: Interrogate Moraji about the synthetic snake and fish scales.",
      background: "/assets/blade-runner/moraji-lab.jpg",
      prose: "",
      cinematic: { mode: "static", colorGrade: "midnight-teal" },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "MORAJI'S ANIMOID LAB. ILLUMINATED TANKS GLOW WITH SYNTHETIC LIFE.",
        npcs: [
          {
            // MORAJI — the snake man on stage at last: a man behind the
            // tanks instead of a diamond over them. Static — he stands by
            // his stock and waits for the question.
            id: "br_npc_moraji",
            sheet: MORAJI_TALK_SHEET,
            x: 54,
            y: 84,
            scale: 1.05,
            facing: "left",
            talkHotspotId: "br_hs_moraji_talk",
          },
        ],
      },
      hotspots: [
        {
          // ONE-SHOT by design: the interrogation sets br_moraji_visited
          // (the nightclub pin gates on it), so a repeatable marker can't
          // replay the flag. The row of tanks is the insert shot the
          // beat gets while Moraji answers.
          id: "br_hs_moraji_talk",
          label: "TALK — Moraji",
          bounds: { x: 45, y: 45, w: 18, h: 42 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            flagSet: "br_moraji_visited",
            topicPrompt: "Moraji adjusts his gold glasses. The tanks glow behind him.",
            topics: [
              {
                id: "br_t_moraji_serial",
                label: "Serial #26354",
                beats: [
                  { id: "br_mb1", characterId: "br_moraji", text: "Moraji adjusts his glasses: 'Serial #26354? That scale belongs to a synthetic python sold to Early Q's Cabaret Nightclub!' The row of illuminated tanks behind him keeps its own time — each one a small, lit coffin.", background: "/assets/blade-runner/animoid-row.jpg" },
                ],
              },
            ],
          },
        },
        {
          id: "br_hs_nightclub_travel",
          label: "GO — Early Q's Nightclub",
          bounds: { x: 85, y: 40, w: 12, h: 50 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_nightclub" },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "br_nightclub",
      title: "11 — Early Q's Cabaret Nightclub",
      nodeType: "stage",
      note: "NIGHTCLUB INVESTIGATION: Track Dektora at the cabaret stage.",
      background: "/assets/blade-runner/nightclub.jpg",
      prose: "",
      cinematic: {
        mode: "pan",
        panDirection: "right",
        panDistance: 4,
        colorGrade: "neon-noir",
        // The walk-behind bar: Roy paces its rail (y86 = behind, y89 = in
        // front of it, baseline 88) and the player works the near band.
        // Dektora's stage (x52) stays clear of its left edge (x60).
        foregroundExtras: [
          {
            image: "/assets/blade-runner/br-prop-club-bar.png",
            x: 88,
            y: 103,
            scale: 0.30,
            anchor: "50% 100%",
            occludes: true,
            occludeBaseline: 88,
          },
        ],
      },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "EARLY Q'S CABARET CLUB. NEON SPOTLIGHTS CUT THROUGH DENSE SMOKE.",
        npcs: [
          {
            // DEKTORA — the club's whole reason for being. She never stops:
            // a single in-place waypoint with her 4-frame routine as SET
            // MOTION loops the dance forever, and the LOOK marker now IS her
            // (the diamond hides, she's clickable wherever the stage is).
            id: "br_npc_dektora",
            sheet: DEKTORA_SHEET,
            x: 52,
            y: 78,
            scale: 0.8,
            facing: "right",
            talkHotspotId: "br_hs_dektora_stage",
            patrol: [{ x: 52, y: 78, pause: 8, facing: "right", anim: "dance" }],
          },
          {
            // ROY BATTY — the Nexus-6 leader, finally on stage. He keeps to
            // the bar at the right of the room and paces it slowly; the
            // interview is repeatable and sets no flag (the case is about
            // the Lucy/Clovis/Zhora cell - he is what it points TOWARD).
            id: "br_npc_roy",
            sheet: ROY_WALK_SHEET,
            x: 80,
            y: 86,
            scale: 0.95,
            facing: "left",
            speed: 12,
            talkHotspotId: "br_hs_roy_talk",
            patrol: [
              { x: 80, y: 86, pause: 5, facing: "left" },
              { x: 68, y: 89, pause: 5, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        {
          // ONE-SHOT by design: you watch her set, the club is marked
          // investigated, and a repeatable marker can't replay that flag.
          id: "br_hs_dektora_stage",
          label: "LOOK — Dektora (Cabaret Performance)",
          bounds: { x: 40, y: 35, w: 25, h: 45 },
          cursor: "look",
          action: {
            type: "startDialogue",
            flagSet: "br_nightclub_visited",
            topics: [
              {
                id: "br_t_dektora_set",
                label: "The performance",
                beats: [
                  { id: "br_db1", characterId: "br_dektora", text: "Dektora's set swells under the violet spotlights — her synthetic python slithering the stage edge, sequins catching the smoke. She finishes to scattered applause and catches your eye. 'Detective. You're not here for the show.'", background: "/assets/blade-runner/dektora-stage.jpg" },
                ],
              },
            ],
          },
        },
        {
          // Repeatable by design: no reward on it, so asking again costs
          // nothing and the validator's replay rule is satisfied.
          id: "br_hs_roy_talk",
          label: "TALK — Roy Batty",
          bounds: { x: 72, y: 45, w: 14, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            // Two topics on the Nexus-6 leader — the hotel question, and the
            // warning. Both re-askable: the marker is repeatable and sets no
            // reward, so replaying a line costs nothing.
            topicPrompt: "Roy. What do you want to ask him?",
            topics: [
              {
                id: "br_t_roy_hotel",
                label: "The girl at the hotel",
                repeatable: true,
                beats: [
                  { id: "br_ro1", characterId: "br_roy", text: "Roy Batty doesn't turn from the bar. 'You're the new one. McCoy, right? The girl at the hotel asks about you. So does everybody else in that coat. They're frightened of the ones who come asking.'" },
                ],
              },
              {
                id: "br_t_roy_city",
                label: "Advice, detective",
                repeatable: true,
                beats: [
                  { id: "br_ro2", characterId: "br_roy", text: "At last he looks over his shoulder, pale eyes catching the violet. 'This city eats men like you, detective. Finish your file — or become part of the evidence.'" },
                ],
              },
            ],
          },
        },
        {
          id: "br_hs_mccoy_apt_travel",
          label: "GO — McCoy's Apartment",
          bounds: { x: 88, y: 40, w: 11, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_mccoy_apt" },
        },
        {
          // Dektora's back room — a two-way door into her dressing room.
          id: "br_hs_dressing_travel",
          label: "GO — Dektora's Dressing Room",
          bounds: { x: 2, y: 40, w: 10, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_dressing_room" },
        },
      ],
      // Scene beats are EMPTY: Dektora's set and Roy's lines live in their
      // markers' topic lists, so each conversation only plays its own
      // speaker (the old shared queue made Dektora read Roy's lines).
      dialogueBeats: [],
      choices: [],
    },
    {
      // DEKTORA'S DRESSING ROOM — the club's back room, from the
      // original's Early Q's: the performer off-stage, the vanity, and the
      // maintenance-card clue that ties her python to Tyrell Corp. Two-way
      // door: the club floor is always reachable.
      id: "br_dressing_room",
      title: "11b — Dektora's Dressing Room",
      nodeType: "stage",
      note: "NIGHTCLUB INTERIOR: Dektora off stage. A quiet word and the Tyrell maintenance clue.",
      background: "/assets/blade-runner/early-q-dressing.jpg",
      prose: "",
      cinematic: { mode: "static", colorGrade: "neon-noir" },
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 10, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 68, bottom: 95 },
        enterCaption: "BEHIND THE MIRROR-STRIPED WALL. MAKEUP LIGHTS HUM.",
        npcs: [
          {
            // Off-stage Dektora, speaking portrait sheet: she paces the
            // room and owns the talk marker. (On the main floor she is the
            // 4-frame dancer — a different sheet per role.)
            id: "br_npc_dektora_dressing",
            sheet: DEKTORA_TALK_SHEET,
            x: 48,
            y: 84,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "br_hs_dektora_dressing",
            patrol: [
              { x: 48, y: 84, pause: 5, facing: "left", anim: "talk" },
              { x: 60, y: 87, pause: 5, facing: "left" },
            ],
            patrolMode: "pingpong",
          },
        ],
      },
      hotspots: [
        {
          id: "br_hs_dektora_dressing",
          label: "TALK — Dektora (Dressing Room)",
          bounds: { x: 40, y: 45, w: 18, h: 42 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "br_hs_dressing_mirror",
          label: "LOOK — The Vanity Mirror",
          bounds: { x: 20, y: 40, w: 18, h: 35 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A cracked vanity mirror. Under the glass: a butterfly hairpin, half a lipstick, and a TYRELL CORP maintenance card — the name tag reads 'Z.' Her python sings in a very well-funded cage.",
          },
        },
        {
          id: "br_hs_dressing_exit",
          label: "GO — Back to the Club Floor",
          bounds: { x: 88, y: 40, w: 11, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_nightclub" },
        },
      ],
      dialogueBeats: [
        {
          id: "br_dd1",
          characterId: "br_dektora",
          text: "Off her violet lights, Dektora is a tired woman powdering a bruised cheekbone. 'The club's my cage, detective. Cages have keys — and Tyrell's maintenance men come to fix my stage. Ask yourself whose python sings in that cage.'",
        },
      ],
      choices: [],
    },
    {
      id: "br_mccoy_apt",
      title: "12 — Ray McCoy's Apartment",
      nodeType: "stage",
      note: "APARTMENT REFUGIUM: Review case progress, check VidPhon messages, and prepare for Act 1 conclusion.",
      background: "/assets/blade-runner/mccoy-apartment.jpg",
      prose: "",
      cinematic: { mode: "static", colorGrade: "neon-noir" },
      particles: "rain",
      stage: {
        hotspotTrigger: "aim",
        plateAspectRatio: 16 / 9,
        playerScale: 1.15,
        spawn: { x: 12, y: 88 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        enterCaption: "MCCOY'S APARTMENT. BALCONY OVERLOOKS THE NEON CITYSCAPE.",
      },
      hotspots: [
        {
          id: "br_hs_vidphon",
          states: [
            { id: "mercy_message", when: { requiresFlags: ["br_zuben_spared"] }, action: { type: "showText", text: "VIDPHON — LUCY, leaving no return number: 'You let him go. I wanted you to know somebody noticed.' The line goes quiet before you can ask her name." } },
            { id: "retirement_message", when: { requiresFlags: ["br_zuben_retired"] }, action: { type: "showText", text: "VIDPHON — GUZZA: 'Your retirement report from the warehouse came through. Keep the physical evidence with the file. We still have work to do.'" } },
          ],
          label: "USE — VidPhon Terminal",
          bounds: { x: 28, y: 52, w: 16, h: 36 },
          cursor: "use",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "MESSAGE FROM GUZZA: 'McCoy. Log the evidence at the mainframe, follow the restaurant lead, and put your decision about the cook in the report. The file stays open until then.'",
          },
        },
        {
          id: "br_hs_balcony_view",
          label: "LOOK — Balcony View",
          bounds: { x: 60, y: 25, w: 32, h: 48 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The endless neon cityscape glimmers through heavy rain. An off-world colony blimp floats slowly past.",
          },
        },
        {
          // RETURN ROUTE — scene 12 was a dead end: the only way out was the
          // case-file terminal, gated on an ESPER flag, so a player who
          // walked in without it was stranded with no route back to the
          // mainframe lab. An apartment door is never a trap.
          id: "br_hs_apt_return",
          label: "GO — Elevator back to LAPD Mainframe",
          bounds: { x: 2, y: 40, w: 10, h: 52 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "br_mainframe_hub" },
        },
        {
          id: "br_hs_conclude_act1",
          label: "GO — Complete Act 1 Case File",
          bounds: { x: 82, y: 60, w: 15, h: 32 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresFlags: ["br_esper_dragon_revealed", "br_mainframe_synced", "br_zuben_resolved"] },
          customFailMessage: "Before filing: enhance the Runciter disk on ESPER, upload the evidence at LAPD, and resolve the Zuben confrontation. The elevator always takes you back to the mainframe.",
          action: { type: "goToScene", targetSceneId: "br_act1_conclusion" },
        },
        {
          // THE STAKES — a case you can walk away from is a case you can lose.
          // Filing the report un-solved closes Act One with a defeat ending,
          // the same way the original's case file ends when the cell goes
          // un-identified.
          id: "br_hs_giveup",
          label: "GO — File the Report Un-solved (Case Closed)",
          bounds: { x: 60, y: 66, w: 16, h: 26 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "br_act1_failed" },
          verbs: {
            look: {
              type: "showText",
              text: "The case file's final page, waiting to be signed. 'Recommendation: close file, no further action.'",
            },
            talk: { type: "showText", text: "There is no one in the apartment to talk to. The file, though. The file is waiting." },
          },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },
    ...BR_CHAPTER_ONE_SCENES,
    {
      id: "br_act1_conclusion",
      title: "Act One Conclusion — The Rep-Detect",
      background: "/assets/blade-runner/br-act1-victory.jpg",
      prose: "The Runciter photograph is processed, your evidence is in the LAPD archive, and the warehouse encounter is on record. The report preserves the decision you made about Zuben. This first-act recreation ends here; the larger investigation is unfinished.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "ACT ONE REPORT FILED — THE ZUBEN DECISION",
        recap: "You followed the security-photo lead from Runciter's to Chinatown, uploaded the case to LAPD, and resolved the confrontation with Zuben. Your choice to spare or retire him remains in the case history.",
      },
      dialogueBeats: [{ id: "br_report_memory", characterId: "narrator", text: "The file records what you chose.", recalls: { br_zuben_choice: "Your report records the decision: {said}" } }],
      hotspots: [],
      choices: [],
    },
    {
      // DEFEAT — the case filed un-solved. This is the lose path the briefing
      // promises ("abandon the investigation"): without it Act One had no
      // stakes and the story's win/lose audit read it as a case you can't
      // fail.
      id: "br_act1_failed",
      title: "Act One — Case Unsolved",
      background: "/assets/blade-runner/br-act1-defeat.jpg",
      prose: "You sign the page. 'Close file, no further action.' The VidPhon chirps once — Guzza's file, accepted, the assignment reassigned before the ink dries. Somewhere over Carson Street, a spinner with the plates you never traced slips the traffic lane. The Nexus-6 cell walks. Act One ends with the rain, and the case, still open in the dark.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "CASE CLOSED — UNSOLVED",
        recap: "You filed the report without identifying the cell. The dragon wrapper, the Tyrell scale and the Moraji python went unmatched, and the Nexus-6s you were sent to run keep running.",
      },
      dialogueBeats: [],
      hotspots: [],
      choices: [],
    },
  ],
};
