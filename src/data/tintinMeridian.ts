import type { Story } from "../types";
import type { PatternPuzzleConfig } from "../game/PatternPuzzleTypes";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * TINTIN AND THE MERIDIAN LIGHT — a fan-homage adventure with entirely
 * original dialogue and plot, in the spirit of the repo's other homage cases
 * (see pulpReel.ts). Unofficial, non-commercial, drawn in ligne claire by the
 * AI art studio (public/img/*-tt-*.jpg, map-tt-port.jpg, cover-tt-meridian.jpg).
 *
 * A deliberate feature showcase — this case exercises most of the Studio
 * toolbox in one album:
 *
 *  · 🗺 TRAVEL MAP — four pins on a hand-drawn port chart; the harbour pin is
 *    locked-visible behind the curator's tip, the lighthouse pin is a
 *    hiddenWhenLocked secret until the signal is overheard. The wall chart
 *    in the flat is an `openMap` hotspot.
 *  · 🧩 PATTERN PUZZLE minigame — the Peregrine's cargo manifest: flag the
 *    three "machine parts" crates that all weigh exactly the same (marble
 *    doesn't rattle). Solving routes straight into the cargo hold.
 *  · ⏱ QUICK-TIME EVENT — the falling cargo net on the quay, with heartbeat,
 *    shaky-cam and a real "you hesitated" consequence path.
 *  · 🎯 PRESS THE LIE — Krespel's "manifests do not lie" claim breaks against
 *    the manifest page; the gold ending gates on catching him in it.
 *  · 📌 CORKBOARD — Krespel is pinnable against the brass tag and the signal
 *    card.
 *  · 🗣 SPRITE CAST — all five speakers are animated ligne-claire cutouts on
 *    talking sheets (public/assets/sprites/tt-*-talk.png), placed left and
 *    right and flipped to face their scene partner, so every conversation
 *    plays as a two-shot with the listener dimmed.
 *  · 🎞 SPRITE PROPS — Snowy trots along the quay on his 4-frame walk sheet
 *    and the Meridian Astrolabe gleams on the keeper's table (animated
 *    foreground extras).
 *  · Reply choices, hidden gated choices, presentItem, memoryLog + recalls,
 *    rememberLine cards, heat limit with a bust scene, per-story In-Game
 *    Theme (midnight-teal HUD, poster headings), letterbox cutscene framing.
 *
 * The sprite sheets started as magenta plates (character repeated on one row,
 * flat #FF00FF backdrop) and were sliced with scripts/make-sprite-sheet.mjs —
 * see docs/sprite-sheets.md for the pipeline and the frame grids.
 */

/* ------------------------------------------------------------------ */
/*  SPRITE ASSETS — ligne-claire cutouts for the whole cast.            */
/*                                                                     */
/*  Every sheet here started as one AI plate: the character drawn      */
/*  three (or four) times on a row over flat magenta, keyed and        */
/*  sliced with `scripts/make-sprite-sheet.mjs`. Talk sheets share a   */
/*  384px-tall grid: frame 0 is the resting pose, frames 1-2 open      */
/*  the mouth, and `talk` cycles them like the other cases in the      */
/*  catalogue. Cutouts (the astrolabe) sit on their own grids.         */
/* ------------------------------------------------------------------ */

/** A three-frame talking portrait: rest on frame 0, mouth open on 1-2. */
const talkSheet = (image: string, frameWidth: number): SpriteSheet => ({
  image,
  frameWidth,
  frameHeight: 384,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated: true,
});

/** Snowy's trot — a four-frame walk cycle used as a walking extra. */
const SNOWY_WALK: SpriteSheet = {
  image: "/assets/sprites/tt-snowy-walk.png",
  frameWidth: 197,
  frameHeight: 128,
  animations: { loop: { frames: [0, 1, 2, 3], fps: 8 } },
  pixelated: true,
};

/** A gull that crosses the harbour sky. One static cutout, no flight frames:
 *  the MOTION PATH carries it across the plate at a constant speed and the
 *  flutter preset works its wings — see src/game/animation.ts. */
const GULL_FLIGHT = {
  image: "/assets/sprites/tt-gull.png",
  x: 8,
  y: 18,
  scale: 0.07,
  anchor: "50% 50%",
  anim: { preset: "flutter" as const, speed: 0.85, intensity: 0.7 },
  motion: {
    points: [{ x: -14, y: 13 }, { x: 46, y: 21 }, { x: 112, y: 12 }],
    duration: 16,
    ease: "arc" as const,
    loop: "loop" as const,
    holdSeconds: 4,
    faceTravel: true,
  },
};

/** The Meridian Astrolabe, with a slow gleam across its rings. */
const ASTROLABE: SpriteSheet = {
  image: "/assets/sprites/tt-astrolabe.png",
  frameWidth: 135,
  frameHeight: 160,
  animations: { loop: { frames: [0, 0, 0, 1, 0, 1], fps: 3 } },
  pixelated: true,
};

/** The Peregrine's manifest: three crates consigned to "K. Antiquités" are
 *  logged as MACHINE PARTS yet weigh exactly 612 kg each — machine parts
 *  never weigh identical, but three crated marble figures do. */
const MANIFEST_PUZZLE: PatternPuzzleConfig = {
  title: "SS Peregrine — Cargo Manifest, Berth 4",
  instruction:
    "Flag the three crates that don't belong. Snowy keeps growling at something in these columns — same consignee, same impossible weight.",
  targetCount: 3,
  rows: [
    { id: "mf1", date: "Hold 1", description: "Flour, milled — Ets. Boulang", amount: "740 kg", isAnswer: false },
    { id: "mf2", date: "Hold 1", description: "MACHINE PARTS — K. Antiquités", amount: "612 kg", isAnswer: true },
    { id: "mf3", date: "Hold 2", description: "Rope, coiled — Port Authority", amount: "150 kg", isAnswer: false },
    { id: "mf4", date: "Hold 2", description: "MACHINE PARTS — K. Antiquités", amount: "612 kg", isAnswer: true },
    { id: "mf5", date: "Hold 2", description: "Tinned sardines — Frères Marin", amount: "488 kg", isAnswer: false },
    { id: "mf6", date: "Hold 3", description: "Bicycle frames — Cycles Rapide", amount: "305 kg", isAnswer: false },
    { id: "mf7", date: "Hold 3", description: "MACHINE PARTS — K. Antiquités", amount: "612 kg", isAnswer: true },
  ],
  payoffText:
    "Three crates of \"machine parts\", three different holds, one identical weight — 612 kilos to the gram. Gears rattle. Statuary doesn't. You tear the page free just as boots ring on the gangway overhead: time to see Hold 2 for yourself.",
  allowRetry: true,
  wrongMessage:
    "Snowy sneezes at your first guess. Look again — the crates that lie share a consignee AND a weight no honest cargo repeats.",
  rewardConsequences: {
    setFlags: ["tt_manifest_cracked"],
    addItems: ["tt_manifest_page"],
    meterChanges: [{ meter: "Clever", delta: 1 }],
  },
  targetSceneId: "tt_hold",
};

export const TINTIN_MERIDIAN: Story = {
  id: "tintin-meridian",
  title: "Tintin and the Meridian Light",
  tagline: "An empty museum case, a crooked manifest, and a lighthouse that winks three times.",
  coverImage: "/img/cover-tt-meridian.jpg",
  startSceneId: "tt_flat",
  layout: {
    tt_flat: { x: 0, y: 260 },
    tt_museum: { x: 420, y: 100 },
    tt_quay_drop: { x: 420, y: 420 },
    tt_bruised: { x: 700, y: 620 },
    tt_harbour: { x: 840, y: 300 },
    tt_hold: { x: 1260, y: 120 },
    tt_light: { x: 1260, y: 460 },
    tt_end_gold: { x: 1680, y: 260 },
    tt_end_silver: { x: 1680, y: 480 },
    tt_end_bust: { x: 1680, y: 700 },
    tt_end_nabbed: { x: 840, y: 700 },
  },
  briefing: {
    objective:
      "The Meridian Astrolabe has vanished from the Maritime Museum. Follow the brass tag to the harbour, crack the Peregrine's manifest, and catch the collector red-handed at the Meridian Light.",
    winConditions: [
      "Catch Krespel in his lie with the manifest page and signal the harbour police (gold).",
      "Recover the astrolabe even if Krespel slips away (silver).",
    ],
    loseConditions: [
      "Rush Krespel at the lamp rail (game over).",
      "Draw too much suspicion — the harbour police arrest the famous reporter as a common stowaway.",
    ],
    heatLimit: 8,
    heatFailSceneId: "tt_end_nabbed",
  },
  flagNotes: {
    tt_found_tag: "A brass shipping tag was left in the smashed display case — the thief's one mistake.",
    tt_tip_harbour: "The curator read the tag: Peregrine Line, Berth 4. The harbour is on the map.",
    tt_dodged: "Someone dropped a cargo net on you at Berth 4 — and it was no accident.",
    tt_haddock_ally: "The Captain has taken your side: whatever the Peregrine carries, it shames the sea.",
    tt_manifest_cracked: "Three 612-kg 'machine parts' crates for K. Antiquités — the manifest is a forgery.",
    tt_heard_signal: "Krespel sails when the Meridian Light winks three times. The island is on the map.",
    tt_caught_lie: "Krespel claimed manifests do not lie. The torn page in your pocket says otherwise.",
    tt_pinned_krespel: "The brass tag traces to Krespel's import licence — pinned on the corkboard.",
    tt_pinned_signal: "The signal card is in Krespel's own handwriting — pinned on the corkboard.",
  },
  map: {
    title: "The Port — Fold-Out Chart",
    backgroundImage: "/img/map-tt-port.jpg",
    locations: [
      { id: "tt_loc_flat", label: "26 Labrador Road", targetSceneId: "tt_flat", x: 13, y: 22, icon: "🏠" },
      { id: "tt_loc_museum", label: "Maritime Museum", targetSceneId: "tt_museum", x: 40, y: 24, icon: "🏛" },
      {
        id: "tt_loc_harbour",
        label: "Berth 4 — SS Peregrine",
        targetSceneId: "tt_harbour",
        x: 38,
        y: 74,
        icon: "⚓",
        gating: { requiresFlags: ["tt_tip_harbour"] },
        lockedHint: "The brass tag must belong to a shipping line — someone at the museum could read it.",
      },
      {
        id: "tt_loc_light",
        label: "The Meridian Light",
        targetSceneId: "tt_light",
        x: 90,
        y: 17,
        icon: "🗼",
        gating: { requiresFlags: ["tt_heard_signal"] },
        hiddenWhenLocked: true,
      },
    ],
  },
  dialogueBox: {
    hudTheme: "midnight-teal",
    bodyFont: "modern",
    headingFont: "poster",
    reserveLines: 3,
    bordered: true,
  },
  characters: [
    {
      id: "tt_tintin",
      name: "Tintin",
      role: "Reporter",
      avatarUrl: "/img/ch-tt-reporter.jpg",
      trustMeter: 0,
      voice: { pitch: 1.1, rate: 1.02 },
      // Stage left, facing his scene partner: Tintin is the only unflipped
      // talking sprite in the cast, so every conversation reads as a two-shot.
      talkingSheet: talkSheet("/assets/sprites/tt-tintin-talk.png", 224),
      talkingX: 28,
      talkingScale: 1,
      talkingDim: 0.68,
    },
    {
      id: "tt_snowy",
      name: "Snowy",
      role: "A Wire Fox Terrier of Opinions",
      avatarUrl: "emoji:🐕",
      trustMeter: 2,
      voice: { pitch: 1.6, rate: 1.2 },
      // Small and stage right, turned back toward whoever is talking.
      talkingSheet: talkSheet("/assets/sprites/tt-snowy-talk.png", 183),
      talkingX: 74,
      talkingScale: 0.62,
      talkingFlip: true,
      talkingDim: 0.78,
    },
    {
      id: "tt_haddock",
      name: "The Captain",
      role: "Master Mariner (Beached, Furious)",
      avatarUrl: "/img/ch-tt-captain.jpg",
      trustMeter: 0,
      voice: { pitch: 0.7, rate: 0.95 },
      // Stage right, flipped to face in — the broadest silhouette in the cast,
      // so he sits slightly smaller than Tintin to keep their heads level.
      talkingSheet: talkSheet("/assets/sprites/tt-haddock-talk.png", 262),
      talkingX: 74,
      talkingScale: 0.98,
      talkingFlip: true,
      talkingDim: 0.68,
    },
    {
      id: "tt_curator",
      name: "M. Alembert",
      role: "Curator, Maritime Museum",
      avatarUrl: "emoji:🧓",
      trustMeter: 0,
      voice: { pitch: 0.9, rate: 0.9 },
      // Stage right, facing the reporter who has just been kind to him.
      talkingSheet: talkSheet("/assets/sprites/tt-curator-talk.png", 249),
      talkingX: 74,
      talkingScale: 0.96,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "tt_krespel",
      name: "Dr. Krespel",
      role: "Dealer in Maritime Antiques",
      avatarUrl: "/img/ch-tt-krespel.jpg",
      trustMeter: -1,
      voice: { pitch: 0.85, rate: 0.88 },
      // The only other left-hand sprite: Krespel shares Tintin's side of the
      // frame and faces right, so the two of them square up in the lamp room.
      talkingSheet: talkSheet("/assets/sprites/tt-krespel-talk.png", 273),
      talkingX: 28,
      talkingScale: 1,
      talkingDim: 0.66,
    },
  ],
  items: [
    {
      id: "tt_cutting",
      name: "Press Cutting",
      icon: "📰",
      description: "Your own front page: THE MERIDIAN ASTROLABE — JEWEL OF THE COLLECTION.",
      flavorText: "Sometimes the story steals you back.",
      isClue: true,
    },
    {
      id: "tt_brass_tag",
      name: "Brass Shipping Tag",
      icon: "🏷",
      description: "A stamped brass tag on a snapped cord, dropped inside the smashed case. A gull-and-anchor mark, and a number: P-612.",
      flavorText: "Thieves in a hurry always leave one thing behind.",
      isClue: true,
    },
    {
      id: "tt_manifest_page",
      name: "Torn Manifest Page",
      icon: "📄",
      description: "The Peregrine's manifest page listing three 612-kg crates of 'machine parts' consigned to K. Antiquités.",
      flavorText: "Gears rattle. Statuary doesn't.",
      isClue: true,
    },
    {
      id: "tt_signal_card",
      name: "Signal Card",
      icon: "🗼",
      description: "A card nailed inside the hold, in a collector's copperplate hand: 'When the Light winks thrice, the launch comes out.'",
      flavorText: "Even smugglers write themselves reminders.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["tt_krespel"],
    connections: [
      {
        a: "tt_brass_tag",
        b: "tt_krespel",
        flagSet: "tt_pinned_krespel",
        revelation: "P-612 — Peregrine, consignment 612. The tag hangs from Krespel's own import licence.",
      },
      {
        a: "tt_signal_card",
        b: "tt_krespel",
        flagSet: "tt_pinned_signal",
        revelation: "The copperplate on the signal card matches the K. Antiquités ledger hand exactly.",
      },
    ],
  },
  scenes: [
    /* ---------------------------------------------------------------- */
    {
      id: "tt_flat",
      title: "26 Labrador Road",
      background: "/img/bg-tt-flat.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "The wireless crackles through the evening rain: \"…daring theft at the Maritime Museum — the Meridian Astrolabe, pride of the navigation wing, spirited away between the night rounds…\" Snowy's ears go up before the announcer finishes. So do yours.",
      hotspots: [
        {
          id: "tth_chart",
          label: "Study the fold-out chart of the port",
          bounds: { x: 6, y: 14, w: 22, h: 30 },
          cursor: "look",
          action: { type: "openMap" },
        },
        {
          id: "tth_cutting",
          label: "Pocket your press cutting on the astrolabe",
          bounds: { x: 58, y: 58, w: 20, h: 22 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "tt_cutting" },
        },
      ],
      dialogueBeats: [
        { id: "ttb_f1", characterId: "tt_snowy", expression: "alert", text: "Wooah! Wooah!" },
        {
          id: "ttb_f2",
          characterId: "tt_tintin",
          expression: "resolved",
          text: "Yes, Snowy, I heard it too. The Meridian Astrolabe doesn't walk out of a locked gallery by itself. Fetch my coat — we're going to the museum.",
        },
      ],
      choices: [
        { id: "ttc_to_museum", text: "Out into the rain — to the Maritime Museum.", targetSceneId: "tt_museum", attitudeTag: "Clever" },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_museum",
      title: "The Navigation Wing",
      background: "/img/bg-tt-museum.jpg",
      ambientAudio: "drone",
      prose:
        "Moonlight through the tall windows. The astrolabe's case stands open like a pulled tooth, glass across the parquet. M. Alembert the curator wrings his hands beside it, and Snowy is already nosing at something bright among the shards.",
      hotspots: [
        {
          id: "tth_case",
          label: "Follow Snowy's nose — search the smashed case",
          bounds: { x: 38, y: 42, w: 24, h: 28 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "tt_brass_tag", flagSet: "tt_found_tag" },
        },
      ],
      dialogueBeats: [
        {
          id: "ttb_m1",
          characterId: "tt_curator",
          expression: "distraught",
          text: "Ruined, ruined! Four centuries the Meridian Astrolabe survived — storms, wars, careless kings — and it could not survive one night of my watch!",
        },
        {
          id: "ttb_m2",
          characterId: "tt_tintin",
          expression: "reassuring",
          text: "It survived them by being worth saving, monsieur — and it still is. Thieves who cut glass in a hurry always leave something behind. Let's find it.",
        },
        {
          id: "ttb_m3",
          characterId: "tt_curator",
          expression: "startled",
          conditionRule: { requiresFlags: ["tt_tip_harbour"] },
          text: "That mark — the gull and anchor! That is the PEREGRINE LINE, young man. One ship of theirs is in port this very night. Berth 4. Tramp steamer. She was to sail on the morning tide!",
        },
        {
          id: "ttb_m4",
          characterId: "tt_tintin",
          expression: "resolved",
          conditionRule: { requiresFlags: ["tt_tip_harbour"] },
          recalls: { tt_showed_tag: "\"{said}\" — and now the tag has a berth number. Berth 4, before the tide. Come along, Snowy." },
          text: "Berth 4, before the morning tide. Come along, Snowy — the story's gone to sea.",
        },
      ],
      choices: [
        {
          id: "ttc_show_tag",
          text: "Show the curator the brass tag: \"Can you read this mark, monsieur?\"",
          reply: true,
          presentItem: "tt_brass_tag",
          attitudeTag: "Clever",
          memoryLog: "tt_showed_tag",
          consequences: { setFlags: ["tt_tip_harbour"], trustChanges: [{ characterId: "tt_curator", delta: 1 }] },
          rememberLine: "M. Alembert will remember the reporter who treated him kindly.",
        },
        {
          id: "ttc_to_harbour",
          text: "Make for Berth 4 before the tide turns.",
          targetSceneId: "tt_quay_drop",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["tt_tip_harbour"] },
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_quay_drop",
      title: "Berth 4 — The Falling Net",
      background: "/img/bg-tt-harbour.jpg",
      ambientAudio: "rain",
      particles: "storm",
      cinematic: {
        foregroundExtras: [
          // Snowy trotting along the quay — the net is about to fall on him.
          { image: "/assets/sprites/tt-snowy-walk.png", sheet: SNOWY_WALK, x: 22, y: 84, scale: 0.34 },
          // A gull working the updraught off the containers (motion path).
          { ...GULL_FLIGHT, scale: 0.06, anim: { ...GULL_FLIGHT.anim, delay: 1.2 } },
        ],
      },
      letterbox: true,
      prose:
        "The Peregrine looms black against the harbour lamps, rust bleeding down her plates. You are halfway along the quay when a crane chain shrieks overhead — and a loaded cargo net swings free of its hook, right above Snowy.",
      hotspots: [],
      dialogueBeats: [],
      choices: [
        {
          id: "ttc_dive",
          text: "Dive — sweep Snowy clear of the net!",
          targetSceneId: "tt_harbour",
          attitudeTag: "Aggressive",
          quickTime: true,
          timeLimitSeconds: 5,
          qtePrompt: "LOOK OUT ABOVE!",
          qteHeartbeat: true,
          qteShakyCam: true,
          consequences: { setFlags: ["tt_dodged"], meterChanges: [{ meter: "Aggressive", delta: 1 }] },
          rememberLine: "Snowy will remember that.",
          timedOutTargetSceneId: "tt_bruised",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_bruised",
      title: "Fished Out of the Harbour",
      background: "/img/bg-tt-harbour.jpg",
      ambientAudio: "rain",
      prose:
        "The net clips your shoulder and carries you both off the quay edge in a tangle of rope and cold green water. A fist like a dockside bollard closes on your collar and hauls you up onto the stones.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "ttb_b1",
          characterId: "tt_haddock",
          expression: "thunderous",
          text: "Blistering barnacles! Nets don't jump their hooks by themselves, lad — that one was SLIPPED. Somebody aboard that floating scrapyard doesn't care for visitors.",
        },
        {
          id: "ttb_b2",
          characterId: "tt_tintin",
          expression: "wringing wet",
          text: "Then we must be getting close to something worth hiding, Captain. Thank you for the fishing.",
        },
      ],
      choices: [
        { id: "ttc_back_quay", text: "Wring out your coat and walk back to Berth 4.", targetSceneId: "tt_harbour", attitudeTag: "Neutral" },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_harbour",
      title: "Berth 4 — SS Peregrine",
      background: "/img/bg-tt-harbour.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        foregroundExtras: [
          { image: "/assets/sprites/tt-snowy-walk.png", sheet: SNOWY_WALK, x: 16, y: 80, scale: 0.4 },
          // ...and a gull crossing the harbour sky, wings fluttering.
          GULL_FLIGHT,
        ],
      },
      prose:
        "The Peregrine's gangway is chained and her watchman prowls the rail, but the shipping office at the foot of the crane still shows a lamp — and her cargo manifest will be on the spike inside. The bearded captain from the quayside watches the ship the way a man watches a house he was burgled from.",
      hotspots: [
        {
          id: "tth_manifest",
          label: "Slip into the shipping office and read the manifest",
          bounds: { x: 64, y: 48, w: 22, h: 30 },
          cursor: "use",
          action: { type: "patternPuzzle", patternPuzzle: MANIFEST_PUZZLE },
        },
        {
          id: "tth_gangway",
          label: "Follow Snowy up the mooring rope into the hold",
          bounds: { x: 20, y: 30, w: 24, h: 36 },
          cursor: "go",
          gating: { requiresFlags: ["tt_manifest_cracked"] },
          action: { type: "goToScene", targetSceneId: "tt_hold" },
        },
      ],
      dialogueBeats: [
        {
          id: "ttb_h1",
          characterId: "tt_haddock",
          expression: "grim",
          text: "The Peregrine. I know her master — a man who'd sell the lifeboats and log them as 'lost at sea'. Her manifest will be a work of fiction, mark me.",
        },
        {
          id: "ttb_h2",
          characterId: "tt_haddock",
          expression: "conspiratorial",
          conditionRule: { requiresFlags: ["tt_haddock_ally"] },
          text: "Ha! Then it's the two of us and the dog against the tide, lad. The office lamp's lit and the clerk drinks at the Anchor till one. If the paper lies, the CARGO tells the truth — find the crates.",
        },
      ],
      choices: [
        {
          id: "ttc_ask_captain",
          text: "\"Captain — help me prove what she's really carrying.\"",
          reply: true,
          attitudeTag: "Sultry",
          consequences: {
            setFlags: ["tt_haddock_ally"],
            trustChanges: [{ characterId: "tt_haddock", delta: 2 }],
          },
          rememberLine: "The Captain will remember you asked him aboard the adventure.",
        },
        {
          id: "ttc_stow",
          text: "Stow away — up the mooring rope and into the hold.",
          targetSceneId: "tt_hold",
          attitudeTag: "Aggressive",
          hidden: true,
          gating: { requiresFlags: ["tt_manifest_cracked"] },
        },
        {
          id: "ttc_row_out",
          text: "Borrow a dinghy and row for the Meridian Light.",
          targetSceneId: "tt_light",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["tt_heard_signal"] },
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_hold",
      title: "Hold 2 — Among the Crates",
      background: "/img/bg-tt-hold.jpg",
      ambientAudio: "drone",
      prose:
        "Straw, tar, and lantern light. One crate stands open: white marble glows inside the straw — a saint's folded hands, four centuries old, logged on the manifest as machine parts. Voices come down the companionway, and you pull Snowy behind the flour sacks.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "ttb_k1",
          characterId: "tt_krespel",
          expression: "silken",
          text: "Gently with that one, imbecile — 'machine parts' do not chip. The astrolabe travels with ME, in the valise. The rest follows on the tide.",
        },
        {
          id: "ttb_k2",
          characterId: "tt_krespel",
          expression: "instructing",
          text: "The launch comes out when I give the Meridian Light three winks — the keeper is paid, the collector is punctual, and by breakfast none of this beauty will exist on any manifest anywhere. Poetry, is it not?",
        },
        {
          id: "ttb_k3",
          characterId: "tt_snowy",
          expression: "muzzled by a gentle hand",
          text: "(A growl, swallowed heroically.)",
        },
      ],
      choices: [
        {
          id: "ttc_copy_signal",
          text: "Copy the signal card nailed inside the crate lid.",
          reply: true,
          attitudeTag: "Clever",
          consequences: {
            setFlags: ["tt_heard_signal"],
            addItems: ["tt_signal_card"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        {
          id: "ttc_slip_ashore",
          text: "Slip ashore before the tide turns — you know where he's going.",
          targetSceneId: "tt_harbour",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["tt_heard_signal"] },
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_light",
      title: "The Meridian Light",
      background: "/img/bg-tt-light.jpg",
      ambientAudio: "tension",
      letterbox: true,
      cinematic: {
        foregroundExtras: [
          // The Meridian Astrolabe on the keeper's table — the whole prize,
          // sitting in plain sight while Krespel talks.
          { image: "/assets/sprites/tt-astrolabe.png", sheet: ASTROLABE, x: 62, y: 58, scale: 0.52, anchor: "50% 100%" },
          // A gull riding the thermal under the lamp room, in and out again.
          {
            ...GULL_FLIGHT,
            scale: 0.05,
            motion: { ...GULL_FLIGHT.motion, points: [{ x: 12, y: 24 }, { x: 84, y: 30 }], duration: 22, loop: "pingpong", holdSeconds: 6 },
          },
        ],
      },
      prose:
        "Dawn climbs the lamp room glass. On the keeper's table sits the Meridian Astrolabe, brass rings burning in the first light — and behind it, unhurried as a man at his own auction, Dr. Krespel polishes his pince-nez. Far below, a launch idles against the rocks.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "ttb_l1",
          characterId: "tt_krespel",
          expression: "urbane",
          text: "The famous boy reporter. You row well. Do sit — you are just in time to watch nothing whatever happen.",
        },
        {
          id: "ttb_l2",
          characterId: "tt_krespel",
          expression: "smooth as glass",
          text: "Those crates aboard the Peregrine? Machine parts, monsieur. The manifest says so — and manifests do not lie.",
          lie: {
            claim: "\"Machine parts, monsieur. The manifest says so — and manifests do not lie.\"",
            evidenceItemIds: ["tt_manifest_page"],
            contradictedFlag: "tt_caught_lie",
            caughtBeat: {
              id: "ttb_l_caught",
              characterId: "tt_krespel",
              conditionRule: { requiresFlags: ["tt_caught_lie"] },
              text: "He takes the torn page. The pince-nez comes off, very slowly. \"Six hundred and twelve kilos… each.\" For the first time the voice loses its polish. \"You tore this out YOURSELF? You absurd, ruinous child — do you know what a matched set is WORTH?\"",
            },
            wrongBeat: {
              id: "ttb_l_wrong",
              characterId: "tt_krespel",
              text: "He glances at what you're holding and smiles like a closing ledger. \"Sentimental exhibits, monsieur. A court requires PAPER. Have you any? No? Then the tide decides, not you.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 1 }],
              trustChanges: [{ characterId: "tt_krespel", delta: -2 }],
            },
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            rememberLine: "Krespel knows the manifest page hangs him.",
          },
        },
        {
          id: "ttb_l3",
          characterId: "tt_haddock",
          expression: "roaring up the stairs",
          conditionRule: { requiresFlags: ["tt_haddock_ally"] },
          text: "PIRATE! Freshwater FENCE! You'll wink that lamp at nobody, you pin-eyed profiteer — the harbour police are one flag hoist behind me!",
        },
      ],
      choices: [
        {
          id: "ttc_signal_police",
          text: "Hoist the storm flag — signal the harbour police launch. You have him cold.",
          targetSceneId: "tt_end_gold",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["tt_caught_lie"] },
        },
        {
          id: "ttc_grab",
          text: "Snatch the astrolabe and run for the dinghy — the proof can wait.",
          targetSceneId: "tt_end_silver",
          attitudeTag: "Neutral",
        },
        {
          id: "ttc_tackle",
          text: "Tackle him at the lamp rail!",
          targetSceneId: "tt_end_bust",
          attitudeTag: "Aggressive",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "tt_end_gold",
      title: "Front Page — The Whole Ring",
      isEnding: true,
      background: "/img/bg-tt-light.jpg",
      prose:
        "The police launch takes Krespel, the keeper, the collector waiting offshore, and three crates of 'machine parts' in a single morning. The astrolabe goes home under museum guard, and M. Alembert weeps on your sleeve. Snowy gets the sausages.",
      endingData: {
        tier: "victory-gold",
        headline: "REPORTER SINKS SMUGGLING RING — ASTROLABE RESTORED",
        recap:
          "Tag to curator, manifest to hold, signal to lighthouse — and Krespel caught in his own favourite lie, with the paper to prove it.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "tt_end_silver",
      title: "The Astrolabe Comes Home",
      isEnding: true,
      background: "/img/bg-tt-museum.jpg",
      cinematic: {
        foregroundExtras: [
          { image: "/assets/sprites/tt-astrolabe.png", sheet: ASTROLABE, x: 50, y: 72, scale: 0.6, anchor: "50% 100%" },
        ],
      },
      prose:
        "You are over the rail and rowing before Krespel finishes his sentence. The astrolabe is back in its case by opening time — but the Peregrine slips the harbour on the tide, and somewhere a collector's cheque is quietly torn up. Krespel will surface again. Men like him float.",
      endingData: {
        tier: "victory-silver",
        headline: "ASTROLABE RECOVERED — DEALER VANISHES ON THE TIDE",
        recap: "The treasure came home; the proof and the profiteer went to sea. Half a front page is still a front page.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "tt_end_bust",
      title: "The Lamp Rail",
      isEnding: true,
      background: "/img/bg-tt-light.jpg",
      prose:
        "Krespel is thin, but the launch crew on the stairs are not. The last thing you see before the sack goes over your head is the astrolabe, packed neat as an egg — and Snowy, streaking down the rocks toward a bearded silhouette on the quay. The story isn't over. But this page of it ends here.",
      endingData: {
        tier: "gameover",
        headline: "REPORTER MISSING OFF MERIDIAN ROCK",
        recap: "Courage is a fine instrument. So is arithmetic — one reporter, four smugglers, one narrow stair.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "tt_end_nabbed",
      title: "The Harbour Cells",
      isEnding: true,
      background: "/img/bg-tt-harbour.jpg",
      prose:
        "Too many lamps saw you, too many watchmen wondered. The harbour police collect you at the foot of the gangway with polite, immovable apologies — and by the time the paperwork clears, the Peregrine and the Meridian Astrolabe are twelve hours over the horizon.",
      endingData: {
        tier: "gameover",
        headline: "PRESS CARD NO DEFENCE: REPORTER HELD AS STOWAWAY",
        recap: "The city noticed you before you finished noticing it. Quieter feet next time.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
