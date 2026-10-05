import type { Story } from "../types";
import type { PatternPuzzleConfig } from "../game/PatternPuzzleTypes";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * SCOOBY-DOO AND THE RAVENSWOOD PHANTOM — a fan-homage Saturday-morning
 * mystery with entirely original dialogue and plot, in the spirit of the
 * repo's other homage cases (see tintinMeridian.ts / pulpReel.ts).
 * Unofficial, non-commercial.
 *
 * Beta-test pass 1 (10 images): Scooby/Shaggy/Velma/Phantom talk sheets,
 * Scooby trot walker, grounds/foyer/library/corridor/cellar plates.
 * Beta-test pass 2 (10 images): Fred/Daphne/Grimsby talk sheets, the
 * unmasked-Grimsby "caught" variant, a 4-frame Phantom (rest/talk/lunge —
 * its plate arrived fully bridged and was split by the NEW automatic
 * recovery in make-sprite-sheet.mjs), dedicated cover art, and a distinct
 * plate for every ending (corridor-after, boathouse, lawn, van).
 * Playability pass (this pass): the EMERGENCY SCOOBY SNACK economy — the
 * van's cooler grants it, waving it at the gate sign / manor door answers
 * with gags that spend NOTHING (dogfooding the say-line USE fallback), and
 * the corridor chase gains a third QTE line that hurls it at the Phantom
 * (authored consume — one-time hero discount) with a cellar callback beat
 * gated on sd_snack_bribe; the unmasking tribute beat now plays only when
 * a snack survives to be tributed (fallback variants for every route).
 * Art pipeline: magenta plates → scripts/make-sprite-sheet.mjs (automatic
 * bridged-plate recovery) — see docs/sprite-sheets.md. This pass also
 * moved Scooby & Shaggy's talking portraits to 768px hi-res plates
 * (plates/sd-*-talk-hi.png, pixelated off — twice the vertical detail at
 * the same silhouettes).
 *
 * Feature coverage exercised in this one case:
 *   · 🚶 STAGE 2D — the manor grounds are a walkable scene (Scooby is the
 *     sprite-sheet walker; hold-to-EXAMINE markers; a goToScene exit marker;
 *     an obstacle to route around).
 *   · 🗣 SPRITE CAST — talking sheets, stage left/right two-shots, dimmed
 *     listeners, the Phantom as the big silhouette.
 *   · 🎯 PRESS THE LIE ×2 — Grimsby's telegram denial (broken by the
 *     postmark) and his ledger denial (broken by the torn ledger page).
 *   · 🕵 INTERROGATION — the library runs composure pressure on Grimsby;
 *     a proven lie dumps 2 composure; trust decides crack vs clamp.
 *   · 🧩 PATTERN PUZZLE — the estate ledger (three cash lots to "E.G.").
 *   · ⏱ QUICK-TIME — the phantom in the corridor, with a real
 *     "you hesitated" game-over route.
 *   · 📌 CORKBOARD — three pinnable connections gate the gold ending.
 *   · 💬 reply Q&A with memoryLog + {said} recalls, presentItem,
 *     exclusiveGroup approach, hidden gated choices, heat limit with a
 *     bust ending, part break, emoji avatars, flag notes.
 */

/* ------------------------------------------------------------------ */
/*  SPRITE SHEETS                                                      */
/* ------------------------------------------------------------------ */

/** A three-frame talking portrait: rest on frame 0, mouth open on 1-2.
 *  defaults match the pass-1/2 plates (384px, pixel-crisp); the pass-4
 *  hi-res plates pass 768px frames with smooth scaling instead. */
const talkSheet = (image: string, frameWidth: number, frameHeight = 384, pixelated = true): SpriteSheet => ({
  image,
  frameWidth,
  frameHeight,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated,
});

/** The Phantom — FOUR frames this pass: rest 0, talk 1-2, and a lunging
 *  fourth pose swapped in (as the "lunge" expression variant) on the two
 *  big threat beats — the corridor chase and the trap. Built from a plate
 *  that arrived fully bridged; make-sprite-sheet.mjs's recovery split it
 *  into 4 frames at the bridge waists automatically. */
const PHANTOM_TALK: SpriteSheet = {
  image: "/assets/sprites/sd-phantom4-talk.png",
  frameWidth: 247,
  frameHeight: 384,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated: true,
};
const PHANTOM_LUNGE: SpriteSheet = {
  image: "/assets/sprites/sd-phantom4-talk.png",
  frameWidth: 247,
  frameHeight: 384,
  animations: { lunge: { frames: [3] } },
  pixelated: true,
};

/** Scooby's trot — the walker on the manor grounds (4-frame side cycle). */
const SCOOBY_WALK: SpriteSheet = {
  image: "/assets/sprites/sd-scooby-walk.png",
  frameWidth: 152,
  frameHeight: 160,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 9 },
  },
  pixelated: true,
};

/* ------------------------------------------------------------------ */
/*  PATTERN PUZZLE — the estate ledger                                 */
/* ------------------------------------------------------------------ */

/** Two years of quiet cash sales to "E.G.", hidden between honest credit
 *  repairs a dying estate actually makes. The odd lots share a buyer,
 *  initials, and a payment method — no honest ledger pays cash. */
const LEDGER_PUZZLE: PatternPuzzleConfig = {
  title: "Ravenswood Estate Ledger — Master Volume",
  instruction:
    "Flag the three entries that don't belong. A estate this broke puts every tradesman on credit — Velma wants the lots that were sold for CASH.",
  targetCount: 3,
  rows: [
    { id: "lg1", date: "Mar 12", description: "Grounds — gravel, 3 loads — County Hwy Dept", amount: "$210 credit", isAnswer: false },
    { id: "lg2", date: "Mar 30", description: "LOT 14 — Ravenswood silver service — buyer E.G.", amount: "$1,900 CASH", isAnswer: true },
    { id: "lg3", date: "Apr 04", description: "Roof repair, east wing — Halvorsen & Sons", amount: "$340 credit", isAnswer: false },
    { id: "lg4", date: "Apr 19", description: "LOT 22 — library Persian rug — buyer E.G.", amount: "$800 CASH", isAnswer: true },
    { id: "lg5", date: "May 02", description: "Lantern oil, kerosene (12 tins) — Emery's Feed", amount: "$96 credit", isAnswer: false },
    { id: "lg6", date: "May 21", description: "LOT 31 — portrait miniatures — buyer E.G.", amount: "$2,400 CASH", isAnswer: true },
    { id: "lg7", date: "Jun 07", description: "Plumbing, cellar drain — Halvorsen & Sons", amount: "$180 credit", isAnswer: false },
  ],
  payoffText:
    "E.G. — Elias Grimsby. Two years of quiet cash sales folded between honest repairs: the silver, the rug, the miniatures. The estate wasn't dying of neglect — it was being SOLD, entry by entry, by the one man left holding the keys. Velma tears the page free.",
  allowRetry: true,
  wrongMessage:
    "Velma adjusts her glasses. \"Look again — the lots that lie share a buyer AND a payment method. Cash is loud in a house this broke.\"",
  rewardConsequences: {
    setFlags: ["sd_cracked_ledger"],
    addItems: ["sd_ledger"],
    meterChanges: [{ meter: "Clever", delta: 1 }],
  },
};

/* ------------------------------------------------------------------ */
/*  THE STORY                                                          */
/* ------------------------------------------------------------------ */

export const SCOOBY_RAVENSWOOD: Story = {
  id: "scooby-ravenswood",
  title: "Scooby-Doo and the Ravenswood Phantom",
  tagline: "A condemned manor, a glowing green ghost, and the only mailbox on the hill.",
  gameKind: "adventure",
  coverImage: "/img/cover-sd-ravenswood.jpg",
  startSceneId: "sd_gate",
  layout: {
    sd_gate: { x: 0, y: 320 },
    sd_meet: { x: 320, y: 120 },
    sd_foyer: { x: 640, y: 320 },
    sd_library: { x: 980, y: 140 },
    sd_corridor: { x: 980, y: 500 },
    sd_cellar: { x: 1320, y: 320 },
    sd_trap: { x: 1640, y: 320 },
    sd_end_unmask: { x: 1960, y: 160 },
    sd_end_escape: { x: 1960, y: 360 },
    sd_end_quit: { x: 1960, y: 540 },
    sd_end_caught: { x: 640, y: 600 },
    sd_end_busted: { x: 1320, y: 600 },
  },
  briefing: {
    objective:
      "Ravenswood Manor is condemned, haunted by a glowing green Phantom, and about to be demolished — unless Mystery Inc. proves the heirs were scared off by something with a pulse. Find the truth before the county bulldozers arrive.",
    winConditions: [
      "Pin all three clues to the caretaker on the corkboard, then spring Fred's trap and unmask the Phantom (gold).",
      "Drive the Phantom off with what you have, even without the full case (silver).",
    ],
    loseConditions: [
      "Get caught by the Phantom in the corridor.",
      "Rattle around loudly enough that Sheriff Stone runs the gang in for the night.",
      "Quit the case and drive home.",
    ],
    heatLimit: 8,
    heatFailSceneId: "sd_end_busted",
  },
  flagNotes: {
    sd_found_telegram: "The mailbox at the gate still holds a telegram — postmarked RAVENSWOOD HILL, the night before the gang arrived.",
    sd_caught_telegram: "Grimsby's 'no post on this hill' story is finished — the postmark proves the sender lives on the hill.",
    sd_showed_telegram: "The gang laid the second telegram on the hall table in front of Grimsby.",
    sd_asked_phantom: "The gang asked Grimsby straight out what the Phantom is.",
    sd_asked_heirs: "The gang asked Grimsby where the Ravenswood heirs actually went.",
    sd_grimsby_broke: "Pressed to the limit, Grimsby cracked — the manor is the only house he ever kept.",
    sd_grimsby_clamped: "Pressed too hard, too cold — Grimsby shut like a cellar door.",
    sd_found_slime: "A sample of the glowing green trail, scraped off the foyer marble.",
    sd_peeked_eyes: "The foyer portraits have holes drilled at pupil height — someone watches the hall through the walls.",
    sd_took_keys: "The caretaker's key ring, lifted off its hook by the cellar door.",
    sd_cracked_ledger: "Three cash lots to 'E.G.' — the estate ledger is a two-year estate sale in disguise.",
    sd_caught_ledger: "Grimsby's 'I couldn't sell a candlestick' claim is torn apart by his own ledger page.",
    sd_chase_done: "The corridor chase is over — the phantom has been seen, and the house has changed.",
    sd_found_film: "The projector reel is still warm. Every 'haunting' on this hill has been filmed.",
    sd_found_robe: "The costume rack holds the Phantom's spare robe — its hem wears the same marine paint as the trail.",
    sd_found_manifest: "A steamship manifest: crates of 'farm machinery' consigned to E. Grimsby, inbound from Le Havre.",
    sd_pin_slime: "PINNED: the slime is marine phosphor — the kind a lighthouse keeper orders, not a ghost.",
    sd_pin_ledger: "PINNED: the cash lots in the ledger are initialled E.G. — the caretaker's own hand.",
    sd_pin_film: "PINNED: the film reel was shot from the boathouse stair — the Phantom has a cameraman.",
    sd_saw_sign: "The gate sign's warning about the Phantom is painted in a fresh, different hand — someone stood at the gate to write it.",
    sd_saw_light: "The green glow in the topmost window pulses — like breathing.",
  },
  dialogueBox: {
    hudTheme: "ghost-green",
    bodyFont: "modern",
    headingFont: "poster",
    reserveLines: 3,
    bordered: true,
  },
  characters: [
    {
      id: "sd_scooby",
      name: "Scooby-Doo",
      role: "Great Dane. Coward. Hero.",
      avatarUrl: "emoji:🐶",
      trustMeter: 3,
      voice: { pitch: 0.55, rate: 0.85 },
      // Far stage left, facing right — the biggest head in the cast.
      talkingSheet: talkSheet("/assets/sprites/sd-scooby-talk-hi.png", 484, 768, false), // pass 4: 768px plate — twice the vertical resolution, smooth scaled
      talkingX: 13,
      talkingScale: 0.95,
      talkingDim: 0.72,
    },
    {
      id: "sd_shaggy",
      name: "Shaggy",
      role: "Snack Architect",
      avatarUrl: "emoji:🥪",
      trustMeter: 2,
      voice: { pitch: 0.8, rate: 0.95 },
      // Far stage right, flipped to face the gang huddle.
      talkingSheet: talkSheet("/assets/sprites/sd-shaggy-talk-hi.png", 484, 768, false), // pass 4: hi-res plate
      talkingX: 92,
      talkingScale: 0.75,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "sd_velma",
      name: "Velma",
      role: "Case Cracker",
      avatarUrl: "emoji:🔍",
      trustMeter: 2,
      voice: { pitch: 1.25, rate: 1.05 },
      // Stage left-centre, facing right — she squares up against Grimsby.
      talkingSheet: talkSheet("/assets/sprites/sd-velma-talk.png", 164),
      talkingX: 30,
      talkingScale: 0.74,
      talkingDim: 0.7,
    },
    {
      id: "sd_phantom",
      name: "The Phantom",
      role: "Ghost of Ravenswood (Glows. Growls. Lunges.)",
      avatarUrl: "emoji:👻",
      trustMeter: -3,
      voice: { pitch: 0.35, rate: 0.75 },
      // Centre-right, flipped, the tallest silhouette in the cast. The
      // "lunge" variant holds the fourth frame on the threat beats.
      talkingSheet: PHANTOM_TALK,
      talkingSheets: [{ name: "lunge", sheet: PHANTOM_LUNGE }],
      talkingX: 70,
      talkingScale: 1.05,
      talkingFlip: true,
      talkingDim: 0.66,
    },
    {
      id: "sd_fredd",
      name: "Fred",
      role: "Trap Enthusiast",
      avatarUrl: "emoji:🧣",
      trustMeter: 2,
      voice: { pitch: 0.9, rate: 1 },
      // Centre-left, facing right.
      talkingSheet: talkSheet("/assets/sprites/sd-fred-talk.png", 200),
      talkingX: 46,
      talkingScale: 0.8,
      talkingDim: 0.7,
    },
    {
      id: "sd_daphne",
      name: "Daphne",
      role: "Danger Magnet",
      avatarUrl: "emoji:💜",
      trustMeter: 2,
      voice: { pitch: 1.4, rate: 1.05 },
      // Stage right, flipped to face the huddle.
      talkingSheet: talkSheet("/assets/sprites/sd-daphne-talk.png", 151),
      talkingX: 81,
      talkingScale: 0.7,
      talkingFlip: true,
      talkingDim: 0.7,
    },
    {
      id: "sd_grimsby",
      name: "Elias Grimsby",
      role: "Caretaker, Ravenswood Estate",
      avatarUrl: "emoji:🧹",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.9 },
      // Centre-right, flipped to face Velma. The "caught" variant is the
      // unmasked man — hood down, hands up — and plays the moment the
      // phantom's glow gutters in the trap scene.
      talkingSheet: talkSheet("/assets/sprites/sd-grimsby-talk.png", 246),
      talkingSheets: [{ name: "caught", sheet: talkSheet("/assets/sprites/sd-grimsby-caught.png", 223) }],
      talkingX: 64,
      talkingScale: 0.85,
      talkingFlip: true,
      talkingDim: 0.68,
    },
  ],
  items: [
    {
      id: "sd_telegram",
      name: "Second Telegram",
      icon: "📜",
      description:
        "A telegram addressed to MYSTERY INC., found in the gate mailbox — postmarked the night before the gang arrived, from RAVENSWOOD HILL itself. The client who hired them wrote from the city, forty miles away.",
      flavorText: "Somebody on this hill wanted the club here. In writing.",
      isClue: true,
    },
    {
      id: "sd_slime",
      name: "Phosphor Sample",
      icon: "🧪",
      description:
        "A scrape of the glowing green trail from the foyer marble. Under Velma's penlight it settles like paint — marine phosphor, the kind that coats lighthouse buoys.",
      flavorText: "Ghosts don't have a supplier. Painters do.",
      isClue: true,
    },
    {
      id: "sd_keys",
      name: "Caretaker's Keys",
      icon: "🗝",
      description:
        "A brass ring of keys from the hook by the cellar door — nineteen years of Ravenswood locks, worn shiny at the cellar and boathouse bows.",
      flavorText: "A caretaker's whole life weighs about half a kilo.",
      isClue: true,
    },
    {
      id: "sd_ledger",
      name: "Torn Ledger Page",
      icon: "📄",
      description:
        "The master ledger page Velma tore free: three cash lots — silver, rug, miniatures — sold to buyer 'E.G.' while every tradesman waited on credit.",
      flavorText: "Cash is loud in a house this broke.",
      isClue: true,
    },
    {
      id: "sd_filmreel",
      name: "Spooky Footage Reel",
      icon: "🎞",
      description:
        "A loaded film reel, still warm, from the cellar projector. Hold it to the light: the manor's windows, filmed from the boathouse stair — with a grey-robed figure issuing directions in a familiar hunch.",
      flavorText: "Every haunting on this hill is a premiere.",
      isClue: true,
    },
    {
      id: "sd_manifest",
      name: "Steamship Manifest",
      icon: "📦",
      description:
        "A shipping manifest from the pried crate: 'FARM MACHINERY — CONSIGNED E. GRIMSBY, RAVENSWOOD' — inbound Le Havre, insured as antiques.",
      flavorText: "Farm machinery doesn't need insurance against water damage.",
      isClue: true,
    },
    {
      id: "sd_snack",
      name: "Scooby Snack, Emergency Grade",
      icon: "🍪",
      description:
        "One foil-wrapped Scooby Snack from the mystery cooler — the box Shaggy swears is 'rationed, inventory-managed, and absolutely not for dogs' before breaking the seal for a dog every time. Still good. Probably. The foil survived the rain.",
      flavorText: "Courage, in a box. Handle with ceremony.",
    },
  ],
  deduction: {
    suspectIds: ["sd_grimsby"],
    connections: [
      {
        a: "sd_slime",
        b: "sd_grimsby",
        flagSet: "sd_pin_slime",
        revelation:
          "Marine phosphor, ordered by the crate through Emery's Feed — and Emery's delivery book shows it signed for, nineteen times, by the caretaker.",
      },
      {
        a: "sd_ledger",
        b: "sd_grimsby",
        flagSet: "sd_pin_ledger",
        revelation:
          "Buyer 'E.G.' — and the lot numbers run in the caretaker's own inventory hand, right down to the cellar shelving. He wasn't robbing the house. He was running it.",
      },
      {
        a: "sd_filmreel",
        b: "sd_grimsby",
        flagSet: "sd_pin_film",
        revelation:
          "The reel was shot from the boathouse stair — and only one key on the hill still opens the boathouse. The Phantom has a cameraman, and he wears the caretaker's hunch.",
      },
    ],
  },
  scenes: [
    /* ---------------------------------------------------------------- */
    {
      id: "sd_gate",
      title: "Ravenswood Gate",
      nodeType: "stage",
      note: "STAGE — walk Scooby up the drive. Markers: the gate sign (hold to EXAMINE), the glowing window, the mailbox (telegram), the front door (exit). The van is an obstacle to walk around.",
      background: "/img/bg-sd-manor.jpg",
      ambientAudio: "rain",
      particles: "storm",
      prose: "",
      stage: {
        playerSheet: SCOOBY_WALK,
        spawn: { x: 10, y: 84 },
        speed: 15,
        reach: 5,
        hints: "proximity",
        floor: { top: 64, bottom: 92 },
        depthScale: 0.35,
        playerNearScale: 1.15,
        obstacles: [{ x: 56, y: 70, w: 16, h: 18 }],
        enterCaption: "Ravenswood Manor. The client's paying double — and Shaggy still almost locked the van.",
      },
      hotspots: [
        {
          id: "sdh_sign",
          label: "Read the gate sign",
          bounds: { x: 6, y: 34, w: 16, h: 24 },
          cursor: "look",
          examine: true,
          examineSeconds: 2,
          // The snack's reply line plays WITHOUT spending it — ticked here
          // with no ⚙ use verb action at all, so it exercises the
          // say-line-default USE fallback end to end.
          itemResponses: {
            sd_snack: "You hold the snack up to the fresh paint. The paint declines. The paint, if anything, seems OFFENDED. Shaggy would have bribed first and read later. The snack stays in the satchel.",
          },
          itemAudio: { sd_snack: "/voices/narrator/sd-sign-offended.mp3" },
          action: {
            type: "showText",
            flagSet: "sd_saw_sign",
            text: "Two signs on the gate. The old one, county-stamped: 'RAVENSWOOD MANOR — CONDEMNED. KEEP OUT.' And below it, in fresh white paint, in a different hand entirely: '...OR THE PHANTOM WILL KEEP YOU OUT.' The fresh paint has run in the rain. Whoever wrote it stood exactly here.",
          },
        },
        {
          id: "sdh_cooler",
          label: "Check the van's cooler",
          bounds: { x: 44, y: 58, w: 8, h: 10 },
          cursor: "take",
          showItemImage: true,
          verbs: {
            look: {
              type: "showText",
              text: "The Mystery Machine's cooler, strapped behind the seat since the swamp job. On the lid, in Shaggy's careful hand: 'EMERGENCY RATIONS — OPEN ONLY IN CASE OF PHANTOM.' Then, underneath, in what is obviously also Shaggy's hand: '…or hunger.'",
            },
          },
          action: { type: "giveItem", itemGranted: "sd_snack", flagSet: "sd_got_snack" },
        },
        {
          id: "sdh_window",
          label: "Study the glowing window",
          bounds: { x: 42, y: 6, w: 16, h: 14 },
          cursor: "look",
          action: {
            type: "showText",
            flagSet: "sd_saw_light",
            text: "Lightning stutters across the hill — but the green glow in the topmost gable doesn't flicker with it. It pulses, slow and even. Like something up there is breathing.",
          },
        },
        {
          id: "sdh_mailbox",
          label: "Check the mailbox",
          bounds: { x: 78, y: 52, w: 14, h: 16 },
          cursor: "take",
          examine: true,
          examineSeconds: 2,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sd_telegram", flagSet: "sd_found_telegram" },
        },
        {
          id: "sdh_door",
          label: "The front door",
          bounds: { x: 44, y: 26, w: 18, h: 26 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          acceptsItems: ["sd_snack"],
          itemResponses: {
            sd_snack:
              "You wave the snack under the manor door like bait. Somewhere inside, a floorboard answers with a low, interested creak. Scooby's ears come to full attention. Ruh-roh. (The snack stays — the house doesn't get a free meal.)",
          },
          itemAudio: { sd_snack: "/voices/narrator/sd-door-bait.mp3" },
          verbs: {
            use: {
              type: "showText",
              text: "The door takes no offerings. The snack returns to the satchel, unbitten.",
            },
            look: {
              type: "showText",
              text: "Oak older than the county, someone has oiled the hinges — recently. Nobody oils a condemned house.",
            },
          },
          action: { type: "goToScene", targetSceneId: "sd_meet" },
        },
      ],
      choices: [],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_meet",
      title: "The Caretaker",
      background: "/img/bg-sd-foyer.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      prose:
        "The front door gives with a groan of hinges that has had nineteen years of practice. Inside, the foyer is a cathedral of dust — and crossing it with a storm lantern is a stooped old man in a caretaker's coat, who stops dead at the sight of five trespassers and one dog.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "sdb_m1",
          characterId: "sd_grimsby",
          expression: "cold",
          text: "Closed hours. The county closed this house, the heirs abandoned it, and the PHANTOM — he clears his throat like a door dragging — keeps it. You'd all do well to be back down that hill before the light goes.",
        },
        {
          id: "sdb_m2",
          characterId: "sd_shaggy",
          expression: "nervous",
          text: "Like, we absolutely will! Right after we, uh... don't. He said 'before the light goes', Scoob. Why'd it have to be LIGHT?",
        },
        { id: "sdb_m3", characterId: "sd_scooby", expression: "grim", text: "Ruh-roh." },
        {
          id: "sdb_m4",
          characterId: "sd_velma",
          expression: "level",
          text: "Mr. Grimsby. Our client's telegram said the Phantom drove three sets of heirs off this property in a single year. We'd like to help. May we look around?",
        },
        {
          id: "sdb_m5",
          characterId: "sd_grimsby",
          expression: "sour",
          text: "Look around. It's a condemned house; the county owns the worry now. But mind the lower stair — and mind the post. There's been no post up this hill since the heirs ran, and nothing mailed from Ravenswood in nineteen years. Whatever paper anybody waved at you came from town.",
          lie: {
            claim: "\"Nothing mailed from Ravenswood in nineteen years — whatever paper anybody waved at you came from town.\"",
            evidenceItemIds: ["sd_telegram"],
            contradictedFlag: "sd_caught_telegram",
            caughtBeat: {
              id: "sdb_m5_caught",
              characterId: "sd_grimsby",
              conditionRule: { requiresFlags: ["sd_caught_telegram"] },
              expression: "cornered",
              text: "He looks at the postmark a long moment — RAVENSWOOD HILL, dated the night before a certain club drove up. The lantern shakes, once. \"...The county means to flatten this house. The legend needed witnesses it couldn't ignore. Who'd believe a ghost that only scares the help? But MY phantom chased out heirs, lawyers, surveyors — and, if the night had gone my way, the famous Mystery Inc. I sent the wire. Both copies.\"",
            },
            wrongBeat: {
              id: "sdb_m5_wrong",
              characterId: "sd_grimsby",
              text: "He squints at whatever you're holding, unimpressed. \"Papers from town. The city prints anything. Up here we only keep the ones that matter.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 1 }],
              trustChanges: [{ characterId: "sd_grimsby", delta: -1 }],
            },
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            composureDamage: 2,
            rememberLine: "Grimsby knows the postmark is his.",
          },
        },
        {
          id: "sdb_m6",
          characterId: "sd_grimsby",
          expression: "tired",
          conditionRule: { requiresFlags: ["sd_caught_telegram"] },
          recalls: {
            sd_showed_telegram: "\"{said}\" — the hall table between you is suddenly the most honest thing in the house.",
          },
          text: "Well. You've the run of the ground floor and the wing. The library door sticks — lift the handle as you push. I'll be in my lodge. The house and I have an arrangement: I keep it standing, and it keeps its opinions to after dark.",
        },
        {
          id: "sdb_m7",
          characterId: "sd_fredd",
          expression: "bright",
          conditionRule: { requiresFlags: ["sd_caught_telegram"] },
          text: "Then it's a plan, gang. Pairs: Velma and Daphne take the ground floor, Shaggy and Scooby take the kitchen — somebody has to check the snacks for clues — and I'll take the high hall. We meet back at the stairs.",
        },
        /* Q&A replies — the flags they set unlock the answers below. */
        {
          id: "sdb_m_phantom",
          characterId: "sd_grimsby",
          expression: "flat",
          conditionRule: { requiresFlags: ["sd_asked_phantom"] },
          text: "The Phantom is the reason the county seal went up. Green as pond light, tall as the door frame, and it walks THROUGH walls — I've watched it cross the east lawn at midnight without bending one blade of grass.",
        },
        {
          id: "sdb_m_phantom_v",
          characterId: "sd_velma",
          expression: "dry",
          conditionRule: { requiresFlags: ["sd_asked_phantom"] },
          recalls: {
            sd_asked_phantom: "\"{said}\" — and note what he didn't say, gang: not 'I think', not 'once'. He described it like a schedule.",
          },
          text: "Noted: our witness describes the ghost like a man reading off a timetable. That's a detail, not a haunting.",
        },
        {
          id: "sdb_m_heirs",
          characterId: "sd_grimsby",
          expression: "shuttered",
          conditionRule: { requiresFlags: ["sd_asked_heirs"] },
          text: "Gone. The last of them, young Josiah the third, ran in the night — left his motor car in the drive with the engine warm. The estate's in the county's hands now. Demolition order signed and everything.",
        },
        {
          id: "sdb_m_heirs_d",
          characterId: "sd_daphne",
          expression: "gentle",
          conditionRule: { requiresFlags: ["sd_asked_heirs"] },
          recalls: {
            sd_asked_heirs: "\"{said}\" — and nobody runs from a house that fast unless something followed them to the car.",
          },
          text: "He says it like a man reading a telegram himself. Nobody runs from a house that fast unless something followed them to the car.",
        },
      ],
      choices: [
        {
          id: "sdc_ask_phantom",
          text: "\"What IS the Phantom, exactly? You've seen it?\"",
          reply: true,
          attitudeTag: "Neutral",
          memoryLog: "sd_asked_phantom",
          consequences: { setFlags: ["sd_asked_phantom"] },
        },
        {
          id: "sdc_ask_heirs",
          text: "\"Where did the Ravenswood heirs actually go?\"",
          reply: true,
          attitudeTag: "Neutral",
          memoryLog: "sd_asked_heirs",
          consequences: { setFlags: ["sd_asked_heirs"] },
        },
        {
          id: "sdc_show_telegram",
          text: "Lay the second telegram on the hall table: \"Mail from town, Mr. Grimsby?\"",
          reply: true,
          presentItem: "sd_telegram",
          hidden: true,
          attitudeTag: "Clever",
          memoryLog: "sd_showed_telegram",
          consequences: {
            setFlags: ["sd_showed_telegram"],
            trustChanges: [{ characterId: "sd_grimsby", delta: 1 }],
          },
          rememberLine: "Grimsby has seen his own postmark.",
        },
        {
          id: "sdc_friendly",
          text: "\"Nineteen years keeping a condemned house standing — that's devotion, Mr. Grimsby.\"",
          reply: true,
          attitudeTag: "Sultry",
          exclusiveGroup: "sd_approach",
          memoryLog: "sd_approach_kind",
          consequences: { trustChanges: [{ characterId: "sd_grimsby", delta: 1 }] },
          rememberLine: "Grimsby will remember someone finally noticed the keeping.",
        },
        {
          id: "sdc_blunt",
          text: "\"Cut the spook show, grandpa. Who's really paying the light bills around here?\"",
          reply: true,
          attitudeTag: "Aggressive",
          exclusiveGroup: "sd_approach",
          memoryLog: "sd_approach_hard",
          consequences: {
            trustChanges: [{ characterId: "sd_grimsby", delta: -1 }],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
          rememberLine: "Grimsby will remember the tone.",
        },
        {
          id: "sdc_into_foyer",
          text: "Split up and search the ground floor.",
          targetSceneId: "sd_foyer",
          attitudeTag: "Clever",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_foyer",
      title: "The Foyer",
      background: "/img/bg-sd-foyer.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      prose:
        "The foyer waits the way a held breath waits. Moonlight falls through the tall windows in grey bars; the chandelier hangs inside its own cobweb like a fly. And crossing the marble from the under-stairs shadow to the front door — a trail of green glowing slime, still faintly wet.",
      hotspots: [
        {
          id: "sdh_slime",
          label: "Follow the glowing trail",
          bounds: { x: 28, y: 60, w: 28, h: 18 },
          cursor: "take",
          examine: true,
          examineSeconds: 3,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sd_slime", flagSet: "sd_found_slime" },
        },
        {
          id: "sdh_portrait",
          label: "Examine the family portraits",
          bounds: { x: 66, y: 16, w: 18, h: 28 },
          cursor: "look",
          action: {
            type: "showText",
            flagSet: "sd_peeked_eyes",
            text: "Old Josiah Ravenswood and his line, stern in their oval frames. The paint behind two sets of eyes is fresh — and each pupil holds a tiny, clean hole drilled clean through the canvas. Somebody has been watching this hall through the walls.",
          },
        },
        {
          id: "sdh_keys",
          label: "The key rack by the cellar door",
          bounds: { x: 12, y: 56, w: 14, h: 16 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sd_keys", flagSet: "sd_took_keys" },
        },
        {
          id: "sdh_celldoor",
          label: "The cellar door under the stairs",
          bounds: { x: 18, y: 70, w: 14, h: 18 },
          cursor: "go",
          gating: { requiresFlags: ["sd_chase_done"] },
          customFailMessage:
            "Locked — from the INSIDE. The bolt's on the cellar face of the door. Whatever uses that stair doesn't want company.",
          action: { type: "goToScene", targetSceneId: "sd_cellar" },
        },
      ],
      dialogueBeats: [
        {
          id: "sdb_f_slime",
          characterId: "sd_velma",
          expression: "gleaming",
          conditionRule: { requiresFlags: ["sd_found_slime"] },
          text: "Jinkies — hold it under the penlight. See how it settles? That's not ectoplasm, that's MARINE PHOSPHOR — buoy paint. Lighthouses order it by the drum. Ghosts don't have a supplier.",
        },
        {
          id: "sdb_f_slime_s",
          characterId: "sd_shaggy",
          expression: "green",
          conditionRule: { requiresFlags: ["sd_found_slime"] },
          text: "It's paint? Like, PAINT paint? Man, I've been afraid of a COLOR this whole time.",
        },
        {
          id: "sdb_f_peek",
          characterId: "sd_daphne",
          expression: "creeped",
          conditionRule: { requiresFlags: ["sd_peeked_eyes"] },
          text: "Holes at pupil height. When I was eleven I thought it would be glamorous to be watched through a painting. I was misinformed.",
        },
        {
          id: "sdb_f_keys",
          characterId: "sd_fredd",
          expression: "thoughtful",
          conditionRule: { requiresFlags: ["sd_took_keys"] },
          text: "Nineteen keys and two of them worn to shine — the cellar bow and a long gate key. A caretaker's whole life is in which keys he POLISHES.",
        },
        {
          id: "sdb_f_quiet",
          characterId: "sd_scooby",
          expression: "alert",
          conditionRule: { requiresFlags: ["sd_chase_done"] },
          text: "(Scooby's ears stand straight up at the cellar stair. The green smell is stronger down there. Ruh-roh.)",
        },
      ],
      choices: [
        {
          id: "sdc_to_library",
          text: "Push through the leather double doors — the library.",
          targetSceneId: "sd_library",
          attitudeTag: "Neutral",
        },
        {
          id: "sdc_to_corridor",
          text: "Up the grand staircase — the bedchamber wing.",
          targetSceneId: "sd_corridor",
          attitudeTag: "Neutral",
        },
        {
          id: "sdc_to_grounds",
          text: "Slip back out to the grounds.",
          targetSceneId: "sd_gate",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_library",
      title: "The Ravenswood Library",
      background: "/img/bg-sd-library.jpg",
      ambientAudio: "drone",
      prose:
        "Leather, dust, and the ghost of cigar smoke. The library runs the length of the west wing — shelves to the ceiling, a rolling ladder, a stone fireplace still holding orange embers against the storm. On the desk squats the estate's master ledger under a banker's lamp, and one bookshelf along the north wall stands a hand's width proud of its neighbours, breathing cold air.",
      interrogation: {
        characterId: "sd_grimsby",
        composure: 4,
        steadySeconds: 7,
        crackTrust: 1,
        pressReactions: [
          "The lantern handle creaks in his grip.",
          "Grimsby's eyes go to the cellar door, and back.",
          "He starts polishing a key with his thumb, hard.",
          "For the first time, the caretaker looks his actual age.",
        ],
        brokeBeat: {
          id: "sdb_l_broke",
          characterId: "sd_grimsby",
          conditionRule: { requiresFlags: ["sd_grimsby_broke"] },
          expression: "hollow",
          text: "...It is the only house I ever kept. Forty-one years I have been under this roof — bootboy, footman, caretaker. The heirs would have sold it to the county for wrecking, lot by lot, down to the DOORKNOBS. I only sold what was already sold. Somebody had to pay the light bills. Somebody had to keep it STANDING.",
        },
        brokeFlag: "sd_grimsby_broke",
        brokeConsequences: { trustChanges: [{ characterId: "sd_grimsby", delta: 1 }] },
        clampedBeat: {
          id: "sdb_l_clamped",
          characterId: "sd_grimsby",
          conditionRule: { requiresFlags: ["sd_grimsby_clamped"] },
          expression: "shut",
          text: "No. No more tonight. Ask your questions of the walls, detective club — they were here for all of it, and they keep their opinions.",
        },
        clampFlag: "sd_grimsby_clamped",
        clampConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
      },
      hotspots: [
        {
          id: "sdh_ledgerbook",
          label: "Open the master ledger under the lamp",
          bounds: { x: 56, y: 44, w: 22, h: 20 },
          cursor: "use",
          action: { type: "patternPuzzle", patternPuzzle: LEDGER_PUZZLE },
        },
        {
          id: "sdh_shelf",
          label: "The bookshelf that stands proud of the wall",
          bounds: { x: 10, y: 22, w: 16, h: 42 },
          cursor: "look",
          action: {
            type: "showText",
            text: "A thread of cold, cellar-smelling air. The shelf sits on hinges — but there is no handle on this side, only a scratch plate at knee height. It opens from somewhere else.",
          },
        },
        {
          id: "sdh_fireplace",
          label: "Check the fireplace chair",
          bounds: { x: 78, y: 40, w: 16, h: 26 },
          cursor: "look",
          action: {
            type: "showText",
            text: "Cigar ash in the pan — and the wingback's arm is warm. Somebody sits in this chair, in this locked library, on nights the caretaker claims to spend in his lodge.",
          },
        },
      ],
      dialogueBeats: [
        {
          id: "sdb_l1",
          characterId: "sd_grimsby",
          expression: "guarded",
          recalls: {
            sd_approach_kind: "He straightens a little, despite himself — \"{said},\" he heard, and nineteen years is a long time between compliments.",
            sd_approach_hard: "The cold from the door follows you in — \"{said},\" as far as he's concerned, ended the conversation before it began.",
          },
          text: "The library is not part of the ground floor I mentioned. The county surveyor's word for this room was 'structurally unjustifiable'. I'd thank you not to lean on anything.",
        },
        {
          id: "sdb_l2",
          characterId: "sd_velma",
          expression: "level",
          text: "Then we'll lean on the paperwork instead. This is the estate's master ledger, isn't it? A house this broke keeps careful books — or careful SOMETHING.",
        },
        {
          id: "sdb_l3",
          characterId: "sd_grimsby",
          expression: "hard",
          conditionRule: { requiresFlags: ["sd_cracked_ledger"] },
          text: "Put it DOWN. That book is the heirs' business and the county's, and neither has visited in a year. And before you get ideas — I couldn't sell so much as a CANDLESTICK from this house. The county owns every stick of it. A caretaker keeps; he does not sell.",
          lie: {
            claim: "\"I couldn't sell so much as a candlestick — the county owns every stick of it.\"",
            evidenceItemIds: ["sd_ledger"],
            contradictedFlag: "sd_caught_ledger",
            caughtBeat: {
              id: "sdb_l3_caught",
              characterId: "sd_grimsby",
              conditionRule: { requiresFlags: ["sd_caught_ledger"] },
              expression: "broken",
              text: "He stares at the torn page — LOT 14, LOT 22, LOT 31, buyer E.G., cash — and something in his shoulders finally lets go of nineteen years of posture. \"...The miniatures went first. They were the least Ravenswood thing in the house. You cannot know what it is, keeping a museum nobody visits, watching the county circle it like weather. Every sale kept the boilers legal one more winter. I sold to SAVE, detective. What did the heirs ever keep?\"",
            },
            wrongBeat: {
              id: "sdb_l3_wrong",
              characterId: "sd_grimsby",
              expression: "acid",
              text: "He glances at what you're waving and stamps it with a flat look. \"Receipts from town. The city keeps better books than it keeps promises. Bring me a page with my name on it or bring me nothing.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 1 }],
              trustChanges: [{ characterId: "sd_grimsby", delta: -1 }],
            },
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            composureDamage: 2,
            rememberLine: "Grimsby's ledger is no longer his secret.",
          },
        },
        {
          id: "sdb_l4",
          characterId: "sd_shaggy",
          expression: "pale",
          conditionRule: { requiresFlags: ["sd_cracked_ledger"] },
          text: "Like — 'E.G.'? As in the gentleman currently blocking the ONLY EXIT? No offense, sir. Some. A little.",
        },
        {
          id: "sdb_l5",
          characterId: "sd_grimsby",
          expression: "shuttered",
          conditionRule: { requiresFlags: ["sd_cracked_ledger"], excludesFlags: ["sd_caught_ledger"] },
          text: "Initials. HALF this county's dead men were called E.G. Take your page and your theories upstairs, where the county's ghosts live. The lower stair is not on your tour.",
        },
      ],
      choices: [
        {
          id: "sdc_press_where",
          text: "\"Where were you tonight, Mr. Grimsby? Really.\"",
          reply: true,
          attitudeTag: "Aggressive",
          memoryLog: "sd_pressed_whereabouts",
        },
        {
          id: "sdc_press_who",
          text: "\"Who else has keys to a locked library that stays warm?\"",
          reply: true,
          attitudeTag: "Aggressive",
          memoryLog: "sd_pressed_keys",
        },
        {
          id: "sdc_press_soft",
          text: "\"You're protecting this room like it's a person. Who hurt it, Elias?\"",
          reply: true,
          attitudeTag: "Sultry",
          memoryLog: "sd_pressed_soft",
          consequences: { trustChanges: [{ characterId: "sd_grimsby", delta: 1 }] },
        },
        {
          id: "sdc_press_sell",
          text: "\"Sell often, Mr. Grimsby? The ash pan says somebody smokes here nightly.\"",
          reply: true,
          attitudeTag: "Clever",
          memoryLog: "sd_pressed_selling",
        },
        {
          id: "sdc_l_corridor",
          text: "Leave him to his books — upstairs, the bedchamber wing.",
          targetSceneId: "sd_corridor",
          attitudeTag: "Neutral",
        },
        {
          id: "sdc_l_foyer",
          text: "Back to the foyer.",
          targetSceneId: "sd_foyer",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_corridor",
      title: "The Bedchamber Corridor",
      background: "/img/bg-sd-corridor.jpg",
      ambientAudio: "tension",
      particles: "storm",
      letterbox: true,
      partBreak: "Part One — The House on the Hill",
      prose:
        "The upstairs corridor runs the manor's length like a throat. A red carpet runner, worn to the weave. Oval portraits — and every painted pair of eyes wide, as if the sitters had all seen the same thing at the same moment. At the far end, lightning detonates inside a leaded window, and in the half-second of white: a suit of armor standing sentinel, a sagging tapestry... and under the far door, a green line of light, breathing.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "sdb_c1",
          characterId: "sd_shaggy",
          expression: "whisper",
          conditionRule: { excludesFlags: ["sd_chase_done"] },
          text: "Okay. OKAY. Everybody saw the armor, right? Armor is normal. Armor is FINE. It's the paintings that have opinions, and I would like to leave before they vote.",
        },
        {
          id: "sdb_c2",
          characterId: "sd_scooby",
          expression: "pointing",
          conditionRule: { excludesFlags: ["sd_chase_done"] },
          text: "RHOST! R-R-RA RHOST!! (Scooby is pointing at the far door — the green line under it is widening. The door is opening. Nothing is opening it.)",
        },
        {
          id: "sdb_c3",
          characterId: "sd_phantom",
          expression: "lunge",
          conditionRule: { excludesFlags: ["sd_chase_done"] },
          text: "LEAVE... THIS... HOUSE. THE HOUSE KEEPS WHAT IT IS OWED — AND TONIGHT IT IS OWED... YOU.",
        },
        {
          id: "sdb_c4",
          characterId: "sd_fredd",
          expression: "flat calm",
          conditionRule: { requiresFlags: ["sd_chase_done"] },
          text: "Corridor's clear. The armor's still dented where the phantom clipped it. Nobody touches anything without gloves.",
        },
      ],
      choices: [
        {
          id: "sdc_dive",
          text: "DIVE behind the suit of armor — and pull Scooby in after you!",
          targetSceneId: "sd_cellar",
          attitudeTag: "Clever",
          quickTime: true,
          timeLimitSeconds: 6,
          qtePrompt: "THE PHANTOM!",
          qteHeartbeat: true,
          qteShakyCam: true,
          gating: { excludesFlags: ["sd_chase_done"] },
          hidden: true,
          consequences: {
            setFlags: ["sd_chase_done"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
          rememberLine: "The armor will remember being an accomplice.",
          timedOutTargetSceneId: "sd_end_caught",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "sdc_slide",
          text: "GRAB the banister rail and slide for the back stair!",
          targetSceneId: "sd_cellar",
          attitudeTag: "Aggressive",
          quickTime: true,
          timeLimitSeconds: 6,
          qtePrompt: "THE PHANTOM!",
          qteHeartbeat: true,
          qteShakyCam: true,
          gating: { excludesFlags: ["sd_chase_done"] },
          hidden: true,
          consequences: {
            setFlags: ["sd_chase_done"],
            meterChanges: [{ meter: "Aggressive", delta: 1 }],
          },
          rememberLine: "Shaggy will remember that banister forever.",
          timedOutTargetSceneId: "sd_end_caught",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          // The snack bribe: a third QTE line that only exists while the
          // satchel holds it — and it SPENDS the snack (authored consume),
          // unlike the wave-at-the-door gag. Scooby's one-time hero discount.
          id: "sdc_snack_toss",
          text: "🍪 Scooby — FETCH! (hurl the Snack down the corridor and BOTH of you dive the other way)",
          targetSceneId: "sd_cellar",
          attitudeTag: "Clever",
          quickTime: true,
          timeLimitSeconds: 6,
          qtePrompt: "THE PHANTOM!",
          qteHeartbeat: true,
          qteShakyCam: true,
          gating: { requiresItems: ["sd_snack"], excludesFlags: ["sd_chase_done"] },
          hidden: true,
          consequences: {
            removeItems: ["sd_snack"],
            setFlags: ["sd_chase_done", "sd_snack_bribe"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
          rememberLine: "The Phantom will remember being out-packeted.",
          timedOutTargetSceneId: "sd_end_caught",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "sdc_c_foyer",
          text: "Retreat downstairs to the foyer.",
          targetSceneId: "sd_foyer",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_cellar",
      title: "Under the House",
      background: "/img/bg-sd-cellar.jpg",
      ambientAudio: "tension",
      prose:
        "The phantom's glide clips the armor, spins it — and for one heartbeat the corridor's lantern light runs THROUGH the grey robe like fog through a fence. Then the thing pours itself behind the tapestry, and the tapestry tears away a door. Stone screws of a stair. Cold. At the bottom, the cellar spreads out under the whole manor — and it is no ruin. A projector on a tripod. A costume rack. Pried crates. A workbench with drums of green paint. Someone has been RUNNING this haunting like a theater.",
      hotspots: [
        {
          id: "sdh_projector",
          label: "The projector, aimed at a hanging sheet",
          bounds: { x: 28, y: 40, w: 20, h: 18 },
          cursor: "look",
          examine: true,
          examineSeconds: 2.5,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sd_filmreel", flagSet: "sd_found_film" },
        },
        {
          id: "sdh_rack",
          label: "The costume rack",
          bounds: { x: 64, y: 34, w: 16, h: 30 },
          cursor: "look",
          action: {
            type: "showText",
            flagSet: "sd_found_robe",
            text: "One hooded robe, brushed and mended, and a pair of gloves with ladder-hook grips. Along the hem: the same green as the trail upstairs — MARINE PHOSPHOR, painted on to leave glowing footprints where a ghost should FLOAT.",
          },
        },
        {
          id: "sdh_crate",
          label: "The pried crate by the archway",
          bounds: { x: 8, y: 60, w: 20, h: 20 },
          cursor: "take",
          examine: true,
          examineSeconds: 2.5,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sd_manifest", flagSet: "sd_found_manifest" },
        },
        {
          id: "sdh_tunnel",
          label: "The bricked archway and its tunnel",
          bounds: { x: 82, y: 42, w: 14, h: 36 },
          cursor: "go",
          action: {
            type: "showText",
            text: "The tunnel runs dead straight toward the boathouse — a hundred yards of lantern hooks and fresh footprints, both directions. The haunted house has a TRADE ROUTE.",
          },
        },
        {
          id: "sdh_bench",
          label: "Spread the case out on the workbench",
          bounds: { x: 44, y: 64, w: 18, h: 18 },
          cursor: "use",
          action: { type: "openBoard" },
        },
      ],
      dialogueBeats: [
        {
          id: "sdb_ce_snack",
          characterId: "sd_shaggy",
          expression: "deep personal loss",
          conditionRule: { requiresFlags: ["sd_snack_bribe"] },
          text: "Like, that was my rationed, inventory-managed, NOT-for-dogs snack, man. …Okay, maybe that ONE was for dogs. Scoob, you owe me a sandwich. Full height. No substitutions.",
        },
        {
          id: "sdb_ce_snack2",
          characterId: "sd_scooby",
          expression: "unrepentant",
          conditionRule: { requiresFlags: ["sd_snack_bribe"] },
          text: "Rehehehehe. (Somewhere upstairs, a grey-robed ghost is discovering exactly what a Scooby Snack does to a phosphor paint job. It is not ghost-friendly. It is BOY-friendly.)",
        },
        {
          id: "sdb_ce1",
          characterId: "sd_velma",
          expression: "gleaming",
          recalls: {
            sd_pressed_keys: "And the keys — \"{said}\" — the warm chair answers that one all by itself.",
            sd_pressed_soft: "You asked who hurt the house, back in the library — \"{said}\". Down here, that question has an owner.",
            sd_pressed_selling: "\"{said}\" — the ash pan told the truth before the caretaker did.",
          },
          text: "Paint, projector, robe, manifest. Gang — this ghost has a SUPPLY CHAIN. Nobody runs a haunting this professional for a hobby. Somebody is being PAID, or paying themselves.",
        },
        {
          id: "sdb_ce2",
          characterId: "sd_shaggy",
          expression: "hurt",
          text: "A costume rack, Velma. A RACK. Like he's got a whole SEASON of spooks planned. What's next year — a swamp thing with a dressing room?",
        },
        {
          id: "sdb_ce3",
          characterId: "sd_scooby",
          expression: "sniffing",
          conditionRule: { requiresFlags: ["sd_found_manifest"] },
          text: "(Scooby puts his nose to the manifest, then to the robe hem, then looks up with the whole case solved in dog order.) Ri-rIMSBY! R-IT'S RIMSBY!",
        },
        {
          id: "sdb_ce4",
          characterId: "sd_fredd",
          expression: "plan forming",
          conditionRule: { requiresFlags: ["sd_found_robe"] },
          text: "Then here's the play. The phantom patrols that archway on the quarter hour — I heard the timing in the corridor. Rope across the arch at ankle height, drum of phosphor on the trigger line, the fan to kill the glow, and the net DROPS when he trips. We pin the corkboard, we set the trap, we end this tonight.",
        },
      ],
      choices: [
        {
          id: "sdc_set_trap",
          text: "Set the trap in the archway.",
          targetSceneId: "sd_trap",
          attitudeTag: "Clever",
        },
        {
          id: "sdc_ce_foyer",
          text: "Climb back up to the foyer — the case needs more clues.",
          targetSceneId: "sd_foyer",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_trap",
      title: "The Trap",
      background: "/img/bg-sd-cellar.jpg",
      ambientAudio: "tension",
      letterbox: true,
      prose:
        "Quarter to midnight. The archway is rigged: ankle line, phosphor drum balanced on the trigger, Daphne's fan wired to a bicycle frame, and the net coiled in the dark above. Fred taps his watch twice. Then the tunnel breathes — and the Phantom comes up the stair like cold water rising, green light washing the walls ahead of it.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "sdb_t1",
          characterId: "sd_phantom",
          expression: "lunge",
          text: "CHILDREN. YOU BRING LAMPS INTO A DARK HOUSE AND CALL YOURSELVES BRAVE. THE HOUSE KEEPS WHAT IT IS OWED — AND IT HAS BEEN OWED A VERY LONG TIME.",
        },
        {
          id: "sdb_t2",
          characterId: "sd_velma",
          expression: "level",
          recalls: {
            sd_pressed_whereabouts: "\"{said}\" — he never did answer, did he. The ash pan answered for him.",
          },
          text: "Funny thing about debts, Phantom — this one's been paid in CASH. Lot fourteen. Lot twenty-two. Lot thirty-one. Do you keep books, or does your caretaker do that for you?",
        },
        {
          id: "sdb_t3",
          characterId: "sd_grimsby",
          expression: "caught",
          conditionRule: { requiresFlags: ["sd_grimsby_broke"] },
          text: "The glow gutters. Under it, small and tired: \"...Mind the line, would you. I just strung it level.\"",
        },
      ],
      choices: [
        {
          id: "sdc_spring",
          text: "SPRING IT — and Velma lays the whole corkboard out under the lights!",
          targetSceneId: "sd_end_unmask",
          attitudeTag: "Clever",
          hidden: true,
          gating: { requiresFlags: ["sd_pin_slime", "sd_pin_ledger", "sd_pin_film"] },
        },
        {
          id: "sdc_confront",
          text: "Confront him with what you have — no trap, no speeches.",
          targetSceneId: "sd_end_escape",
          attitudeTag: "Neutral",
        },
        {
          id: "sdc_quit",
          text: "Nope. NOPE. Back to the van — some mysteries can keep.",
          targetSceneId: "sd_end_quit",
          attitudeTag: "Neutral",
        },
      ],
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_end_unmask",
      title: "The Unmasking",
      isEnding: true,
      background: "/img/bg-sd-cellar.jpg",
      ambientAudio: "jazz",
      prose:
        "The phantom's next stride finds the ankle line. The drum tips — a wave of green paint swallows the robe's glow — the fan roars — and the net drops a fluttering, furious grey parcel onto the stone. The hollow hood collapses. And out of it, blinking under a deputy's flashlight, comes the last caretaker of Ravenswood.",
      hotspots: [],
      dialogueBeats: [
        {
          id: "sdb_u1",
          characterId: "sd_velma",
          expression: "laying it out",
          text: "Elias Grimsby. The slime was marine phosphor — signed for at Emery's Feed nineteen times, in your hand. The 'hauntings' were filmed off this reel, shot from the boathouse stair — the one key on the ring nobody else polishes. And the ledger: three cash lots to 'E.G.' while the tradesmen waited on credit. You weren't haunting this house, Mr. Grimsby. You were LIQUIDATING it — and shipping the manor out through the boathouse, crate by crate.",
        },
        {
          id: "sdb_u2",
          characterId: "sd_grimsby",
          expression: "caught",
          text: "And I would have gotten away with it, too... if it wasn't for you meddling detectives. And that nosy Great Dane.",
        },
        {
          id: "sdb_u3",
          characterId: "sd_scooby",
          expression: "magnanimous",
          conditionRule: { requiresItems: ["sd_snack"] },
          text: "Rand rhose RETECTIVES retter rhare RAREFUL. (Shaggy produces the emergency snack with the ceremony it deserves. It disappears. Tribute accepted.) Rooby-Rooby-DOO!",
        },
        {
          id: "sdb_u3b",
          characterId: "sd_scooby",
          expression: "magnanimous",
          conditionRule: { requiresFlags: ["sd_snack_bribe"] },
          text: "Rand rhose RETECTIVES retter rhare RAREFUL. (He points at the corridor ceiling with one paw: SOMETHING up there knows what a thrown snack can do. Legacy secured.) Rooby-Rooby-DOO!",
        },
        {
          id: "sdb_u3c",
          characterId: "sd_scooby",
          expression: "magnanimous",
          conditionRule: { excludesItems: ["sd_snack"], excludesFlags: ["sd_snack_bribe"] },
          text: "Rand rhose RETECTIVES retter rhare RAREFUL. Rooby-Rooby-DOO!",
        },
        {
          id: "sdb_u4",
          characterId: "sd_daphne",
          expression: "satisfied",
          conditionRule: { requiresFlags: ["sd_caught_telegram"] },
          text: "The telegram, the trail, the ledger, the reel — you even invited us here to make the legend stick. Next time, maybe just hire a security guard, hm?",
        },
      ],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "RAVENSWOOD PHANTOM UNMASKED — SMUGGLING RING RUN BY THE CARETAKER",
        recap:
          "Postmark, phosphor, ledger, film reel — every pin on the corkboard through one man's hands. The heirs get their house back; the gang gets the good kind of goosebumps.",
      },
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_end_escape",
      title: "The Phantom Keeps the House",
      isEnding: true,
      background: "/img/bg-sd-boathouse.jpg",
      ambientAudio: "drone",
      prose:
        "The net takes him at the shoulder — and the robe tears clean away from whatever is inside it, a grey flood going up the stair and out along the tunnel toward the boathouse. By the time the gang fights through to the water, the rowboat is a dot and the drum of paint is swinging from a hook, still dripping. The reel and the manifest go into an envelope addressed to the sheriff. But Ravenswood's demolition order is signed, and legends don't extradite.",
      hotspots: [],
      dialogueBeats: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "PHANTOM FLEES RAVENSWOOD — MANOR'S FATE SEALED",
        recap:
          "Half a case is still a case: the projector, the paint, the shipping manifest — all of it in the mail to the sheriff. Somewhere down the coast, a caretaker is already polishing somebody else's keys.",
      },
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_end_caught",
      title: "Caught by the Phantom",
      isEnding: true,
      background: "/img/bg-sd-corridor-after.jpg",
      ambientAudio: "tension",
      particles: "storm",
      prose:
        "Six seconds is a long time in a hallway. The green light reaches you first, then the cold, then the grey — and the last thing anybody hears is Shaggy, muffled through robe fabric: 'Like... he hugs??' The gang wakes at dawn on the front lawn, netted, stickered with green handprints, every shoe missing. The Mystery Machine is still at the gate. The phantom kept the shoes.",
      hotspots: [],
      dialogueBeats: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "MYSTERY INC. EVICTED FROM RAVENSWOOD — BY THE GHOST",
        recap:
          "You hesitated, the house didn't. Next time trust the dog: when Scooby runs, the running IS the plan.",
      },
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_end_busted",
      title: "The Sheriff's Radishes",
      isEnding: true,
      background: "/img/bg-sd-lawn.jpg",
      ambientAudio: "rain",
      particles: "none",
      prose:
        "Headlights at the gate: Sheriff Stone, two deputies, and a county warrant with the gang's make and model already filled in. Rummaging a condemned landmark, frightening its caretaker, and — per the sheriff — 'communicating with a known spectral entity.' The night ends in a cell that smells of radishes and reports. By morning the Phantom has the manor to itself, and the demolition crew has a schedule.",
      hotspots: [],
      dialogueBeats: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "MEDDLING KIDS HELD OVERNIGHT — RAVENSWOOD DEMOLITION PROCEEDS",
        recap:
          "Too loud, too soon. The county noticed the club before the club noticed the county.",
      },
    },
    /* ---------------------------------------------------------------- */
    {
      id: "sd_end_quit",
      title: "Another Mystery, Some Other Night",
      isEnding: true,
      background: "/img/bg-sd-van.jpg",
      ambientAudio: "rain",
      prose:
        "There is a special kind of courage in knowing when a house is simply not your business. The van doors slam; the gate's white paint grins in the rear lights; and somewhere behind the boards a green glow pulses, slow and even, like breathing — patient now, because a house that has kept itself for nineteen years can certainly outlast five trespassers and a dog. The case goes in the drawer marked UNSOLVED, and stays there.",
      hotspots: [],
      dialogueBeats: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "MYSTERY INC. LEAVES RAVENSWOOD — CASE UNSOLVED",
        recap:
          "Some doors you walk away from. This one locked itself behind you.",
      },
    },
  ],
};
