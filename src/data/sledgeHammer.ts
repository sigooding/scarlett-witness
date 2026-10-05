import type { Story } from "../types";
import type { PatternPuzzleConfig } from "../game/PatternPuzzleTypes";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * SLEDGE HAMMER! — "THE CALIBER OF A GENTLEMAN"
 *
 * A fan-homage 1980s cop-comedy point-and-click with entirely original
 * dialogue and plot, in the spirit of the repo's other homage cases
 * (tintinMeridian.ts, scoobyRavenswood.ts). Unofficial, non-commercial.
 *
 * Built end-to-end through the repo's headless authoring pipeline as a
 * BETA TEST of the Studio (art plates -> make-sprite-sheet -> story data ->
 * validator -> engine tests). See docs/sledge-hammer-beta-test.md.
 *
 * Pass 1 art budget — 10 generated images:
 *   plates/sh-sledge-talk.png   3 frames (296x640)  talkingSheet — Sledge
 *   plates/sh-doreau-talk.png   3 frames (221x640)  talkingSheet — Doreau
 *   plates/sh-trunk-talk.png    3 frames (298x640)  talkingSheet — Trunk
 *   plates/sh-mayor-talk.png    3 frames (288x640)  talkingSheet — Vane
 *   plates/sh-sledge-walk.png   4 frames (105x200)  stage.playerSheet
 *   public/img/bg-sh-squadroom.jpg · bg-sh-alley.jpg · bg-sh-trunk-office.jpg
 *   public/img/bg-sh-firing-range.jpg · bg-sh-rooftop.jpg
 *
 * Studio features exercised in this one case:
 *   · 🚶 STAGE 2D ×3 rooms — sprite-sheet walker, obstacles, proximity hints,
 *     verb coin, exitEdges + entrySpawns (two-way room travel), an ambient
 *     NPC wired to a TALK marker, enterCaption, remote hotspots.
 *   · 👢 EXTENDED VERBS — the kick/punch opt-in (extendedVerbs), dogfooded on
 *     the office door and the dumpster: Sledge's whole character is a verb.
 *   · 🔁 MULTI-STATE OBJECT — the pawn shop grille (shut → kicked → searched).
 *   · 🧩 PATTERN PUZZLE — the campaign finance ledger (3 cash lots).
 *   · 🎯 PRESS THE LIE ×2 — the alley denial and the cheques-only denial.
 *   · 🕵 INTERROGATION — composure pressure on Councilman Vane.
 *   · ⏱ QUICK-TIME — the rooftop, with a real "you hesitated" route.
 *   · 📌 CORKBOARD — three pins gate the gold ending.
 *   · 💬 reply Q&A with memoryLog + {said} recalls, presentItem, hidden gated
 *     choices, exclusiveGroup, heat limit + bust ending, part break, item
 *     USE responses, itemResponses gags, flag notes, 5 endings.
 */

/* ------------------------------------------------------------------ */
/*  SPRITE SHEETS                                                      */
/* ------------------------------------------------------------------ */

/** Three-frame talking portrait: rest on 0, mouth open on 1-2. The pass-1
 *  plates are 512px tall and smooth-scaled (they are painted cel art, not
 *  pixel art, so `pixelated` stays off). */
const talkSheet = (image: string, frameWidth: number): SpriteSheet => ({
  image,
  frameWidth,
  frameHeight: 640,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated: false,
});

/** Sledge's walk — the stage walker in all three rooms (4-frame side cycle). */
const SLEDGE_WALK: SpriteSheet = {
  image: "/assets/sprites/sh-sledge-walk.png",
  frameWidth: 274,
  frameHeight: 512,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 9 },
  },
  pixelated: false,
};

/* ------------------------------------------------------------------ */
/*  PATTERN PUZZLE — the campaign finance ledger                       */
/* ------------------------------------------------------------------ */

const LEDGER_PUZZLE: PatternPuzzleConfig = {
  title: "VANE FOR MAYOR — Campaign Receipts, Q3",
  instruction:
    "Doreau spreads the disclosure sheet on the range bench. A clean campaign banks cheques from people with addresses. Flag the three receipts that came in as CASH from the same initials.",
  targetCount: 3,
  rows: [
    { id: "shl1", date: "Jul 02", description: "Rotary Club luncheon — 41 plates", amount: "$820 cheque", isAnswer: false },
    { id: "shl2", date: "Jul 14", description: "Anonymous — walk-in, receipt initialled Q.T.", amount: "$5,000 CASH", isAnswer: true },
    { id: "shl3", date: "Jul 28", description: "Bayside Dental PAC", amount: "$1,500 cheque", isAnswer: false },
    { id: "shl4", date: "Aug 05", description: "Anonymous — walk-in, receipt initialled Q.T.", amount: "$5,000 CASH", isAnswer: true },
    { id: "shl5", date: "Aug 19", description: "Printing refund — Delano Signs", amount: "$212 cheque", isAnswer: false },
    { id: "shl6", date: "Sep 01", description: "Ladies' Auxiliary bake sale", amount: "$96 cheque", isAnswer: false },
    { id: "shl7", date: "Sep 09", description: "Anonymous — walk-in, receipt initialled Q.T.", amount: "$5,000 CASH", isAnswer: true },
    { id: "shl8", date: "Sep 22", description: "Teamsters Local 219 endorsement dinner", amount: "$2,400 cheque", isAnswer: false },
  ],
  payoffText:
    "Fifteen thousand dollars, walked in through the front door in an envelope, three times, initialled Q.T. — Quality Time Pawn & Loan. The dead man's own shop was funding the man who wanted it condemned.",
  rewardConsequences: {
    setFlags: ["sh_ledger_cracked"],
    addItems: ["sh_ledger_page"],
    meterChanges: [{ meter: "Clever", delta: 2 }],
  },
  wrongSubmissionConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
  allowRetry: true,
  wrongMessage:
    "Doreau takes the sheet back. \"Those are cheques, Sledge. Cheques have names on them. We want the ones that don't.\"",
};

/* ------------------------------------------------------------------ */
/*  THE CASE                                                           */
/* ------------------------------------------------------------------ */

export const SLEDGE_HAMMER: Story = {
  id: "sledge-hammer-caliber",
  title: "Sledge Hammer! — The Caliber of a Gentleman",
  tagline: "Trust him. He knows what he's doing.",
  gameKind: "adventure",
  coverImage: "/img/cover-sh-featured.jpg",
  startSceneId: "sh_squadroom",
  // PASS 3 — the container now has ART. `image` is the panel the items are
  // laid out inside; without it the dock falls back to DEFAULT_INVENTORY_IMAGE.
  // No `anchor` on purpose: this room uses the verb coin, and Game.tsx now
  // slides an un-anchored dock to bottom-right so it can't sit on the coin.
  inventoryDisplay: {
    mode: "container",
    label: "Trench Coat",
    image: "/assets/sprites/sh-inv-coat.png",
    columns: 4,
    inset: 16,
    height: 250,
  },
  playerSprite: { sheet: SLEDGE_WALK },
  layout: {
    sh_squadroom: { x: 40, y: 260 },
    sh_trunk: { x: 420, y: 60 },
    sh_alley: { x: 420, y: 470 },
    sh_drive: { x: 630, y: 470 },
    sh_range_crashed: { x: 630, y: 640 },
    sh_range: { x: 830, y: 260 },
    sh_interview: { x: 1230, y: 260 },
    sh_rooftop: { x: 1620, y: 260 },
    sh_end_gold: { x: 2020, y: 40 },
    sh_end_silver: { x: 2020, y: 240 },
    sh_end_hesitated: { x: 2020, y: 440 },
    sh_end_suspended: { x: 2020, y: 640 },
    sh_end_desk: { x: 830, y: 620 },
  },
  briefing: {
    gameInfo:
      "A 1980s cop-comedy point-and-click. Walk three illustrated rooms as Detective Sledge Hammer, kick what will not open, collect the evidence Captain Trunk's blood pressure depends on, crack a campaign ledger, break a councilman's two lies in an interrogation, and survive a rooftop that only rewards people who aim before they talk.",
    objective:
      "Prove who really shot the owner of Quality Time Pawn & Loan — and bring him in with the paperwork intact.",
    winConditions: [
      "Recover all three pieces of physical evidence (casing, pawn ticket, ledger page).",
      "Pin all three connections on the corkboard.",
      "Break both of Vane's lies and take him alive on the roof.",
    ],
    loseConditions: [
      "Let Suspicion reach 8 — Trunk takes your badge and your gun.",
      "Hesitate on the roof.",
    ],
    heatLimit: 8,
    heatFailSceneId: "sh_end_suspended",
  },
  flagNotes: {
    sh_has_coffee: "You are holding precinct coffee. It is holding you back.",
    sh_saw_board: "You noticed the Vane campaign poster on the wanted board. Somebody drew your moustache on it.",
    sh_heard_case: "Doreau briefed you: Quillan, one shot, nothing taken, forty dollars still in his hand.",
    sh_saw_outline: "The chalk outline says Quillan faced whoever walked in. He knew the man.",
    sh_kicked_door: "You kicked in a door that was already open. Again.",
    sh_qualified: "You requalified on lane three, unasked.",
    sh_grille_kicked: "You kicked in the pawn shop's security grille. Nobody will ever prove it was you.",
    sh_briefed: "Trunk gave you the case, and one direct order you have already forgotten.",
    sh_has_casing: "You bagged the odd shell casing from the alley.",
    sh_has_ticket: "You found pawn ticket 4471 — the councilman's own signature.",
    sh_ledger_cracked: "The campaign ledger gave up three cash walk-ins initialled Q.T.",
    sh_ballistics: "The range confirmed the casing came from a presentation piece, not street iron.",
    sh_caught_alley: "You broke Vane's claim that he had never set foot in that alley.",
    sh_caught_cash: "You broke Vane's claim that the campaign only ever took cheques.",
    sh_vane_cracked: "Vane's composure gave out in the interview room.",
    sh_doreau_briefed: "Doreau knows the plan, which is more than can be said for you.",
    sh_took_the_shot: "You fired on the roof.",
    sh_hesitated: "You let the quick-time window close on the roof.",
  },
  verbResponses: {
    look: [
      "Nothing there but civic decay.",
      "You have seen better. You have shot better.",
    ],
    take: ["That is evidence, or trash, and today you cannot tell."],
    talk: ["It does not answer. Most things do not, after you talk to them."],
    use: ["The two objects decline to cooperate. Unlike suspects."],
    go: ["No door that way. You checked. Twice."],
    kick: ["You kick it. It absorbs the kick with the dignity of municipal property."],
    punch: ["You punch it. Your hand files a formal complaint."],
  },

  /* ---------------- cast ---------------- */
  characters: [
    {
      id: "sh_sledge",
      name: "Det. Sledge Hammer",
      role: "The blunt instrument of the law",
      avatarUrl: "/assets/sprites/sh-sledge-talk.png",
      trustMeter: 0,
      talkingSheet: talkSheet("/assets/sprites/sh-sledge-talk.png", 296),
      talkingX: 26,
      talkingScale: 1.05,
    },
    {
      id: "sh_doreau",
      name: "Det. Dori Doreau",
      role: "Partner. The reason anyone survives",
      avatarUrl: "/assets/sprites/sh-doreau-talk.png",
      trustMeter: 2,
      talkingSheet: talkSheet("/assets/sprites/sh-doreau-talk.png", 221),
      // PASS 3 — Doreau's beat at sh_alley is authored expression:"warning"
      // but had no variant to swap to, so it played the neutral sheet.
      talkingSheets: [{ name: "warning", sheet: talkSheet("/assets/sprites/sh-doreau-alarmed.png", 391) }],
      talkingX: 74,
      talkingFlip: true,
      talkingScale: 1.02,
    },
    {
      id: "sh_trunk",
      name: "Capt. Trunk",
      role: "Captain. Blood pressure: classified",
      avatarUrl: "/assets/sprites/sh-trunk-talk.png",
      trustMeter: -1,
      talkingSheet: talkSheet("/assets/sprites/sh-trunk-talk.png", 298),
      // PASS 3 — same gap: the captain's expression:"furious" beat now
      // actually turns him purple.
      talkingSheets: [{ name: "furious", sheet: talkSheet("/assets/sprites/sh-trunk-apoplexy.png", 420) }],
      talkingX: 70,
      talkingFlip: true,
      talkingScale: 1.06,
    },
    {
      id: "sh_vane",
      name: "Councilman Rex Vane",
      role: "Candidate for mayor. Very helpful",
      avatarUrl: "/assets/sprites/sh-mayor-talk.png",
      trustMeter: 0,
      talkingSheet: talkSheet("/assets/sprites/sh-mayor-talk.png", 288),
      // EXPRESSION VARIANT — the engine swaps this sheet in on any beat whose
      // `expression` matches the variant name (Game.tsx:6329). Every beat that
      // already said expression:"cornered" now visibly loses the campaign
      // smile: tie askew, sweat, the practised hand gone defensive.
      talkingSheets: [
        { name: "cornered", sheet: talkSheet("/assets/sprites/sh-mayor-cornered.png", 353) },
      ],
      talkingX: 72,
      talkingFlip: true,
      talkingScale: 1.04,
    },
  ],

  /* ---------------- evidence ---------------- */
  items: [
    {
      id: "sh_gun",
      name: "The .44",
      icon: "🔫",
      description: "A stainless magnum revolver with a worn grip and no sense of proportion.",
      flavorText: "You have named it. You will not say the name in front of Internal Affairs.",
    },
    {
      id: "sh_casing",
      name: "Odd Shell Casing",
      icon: "🧨",
      iconUrl: "/assets/sprites/sh-icon-casing.png",
      description: "A nickel-plated casing, headstamped with a match-grade load nobody buys by accident.",
      flavorText: "Street guns eat cheap brass. This is brass that goes to fundraisers.",
      isClue: true,
    },
    {
      id: "sh_ticket",
      name: "Pawn Ticket 4471",
      icon: "🎫",
      iconUrl: "/assets/sprites/sh-icon-ticket.png",
      description:
        "Quality Time Pawn & Loan, ticket 4471: one cased presentation revolver, redeemed in person. Signature: R. Vane.",
      flavorText: "People sign things. It is the single most helpful habit in law enforcement.",
      isClue: true,
    },
    {
      id: "sh_ledger_page",
      name: "Ledger Page — Q3",
      icon: "📄",
      iconUrl: "/assets/sprites/sh-icon-ledger.png",
      description: "Three anonymous cash walk-ins of $5,000, each receipt initialled Q.T.",
      flavorText: "Fifteen thousand dollars with no name on it, from a shop with no owner left.",
      isClue: true,
    },
    {
      id: "sh_coffee",
      name: "Squad Room Coffee",
      icon: "☕",
      description: "Precinct coffee. It has a skin. The skin has a skin.",
      flavorText: "Chemically, a stimulant. Legally, a threat.",
    },
  ],

  /* ---------------- corkboard ---------------- */
  deduction: {
    suspectIds: ["sh_vane"],
    connections: [
      {
        a: "sh_casing",
        b: "sh_ticket",
        flagSet: "sh_pin_gun",
        revelation:
          "Match-grade nickel brass, and a cased presentation revolver redeemed in person by R. Vane four days before the shooting. The gun that emptied a pawn shop was bought back from that same pawn shop.",
      },
      {
        a: "sh_ledger_page",
        b: "sh_vane",
        flagSet: "sh_pin_money",
        revelation:
          "Fifteen thousand in cash walk-ins initialled Q.T. The dead man was not being robbed by the campaign. He was bankrolling it — until he wanted a receipt.",
      },
      {
        a: "sh_ticket",
        b: "sh_vane",
        flagSet: "sh_pin_motive",
        revelation:
          "The ticket puts Vane inside the shop; the ledger puts the shop inside his campaign. One signature turns a donor into a witness — and Vane is four weeks from an election.",
      },
    ],
  },

  scenes: [
    /* ================================================================ */
    /*  1 — SQUAD ROOM (stage)                                          */
    /* ================================================================ */
    {
      id: "sh_squadroom",
      title: "Precinct — Squad Room",
      nodeType: "stage",
      note: "STAGE 1. Walk Sledge in, take the coffee, LOOK at the corkboard, TALK to Doreau (ambient NPC wired to a TALK marker) and GO through Trunk's door. The door also answers 👢 KICK — extendedVerbs is on in this room.",
      background: "/img/bg-sh-squadroom-wide.jpg",
      ambientAudio: "drone",
      prose: "",
      cinematic: {
        mode: "static",
        parallaxDepth: 0.14,
        // PASS 3 — DEPTH. Cabinets in the near-left corner that Sledge walks
        // BEHIND: occludes+occludeBaseline means the art draws over him once
        // his feet are higher up the plate than the baseline.
        foregroundExtras: [
          {
            image: "/assets/sprites/sh-fg-counter.png",
            // world-pinned: the booking counter belongs to the room, not the screen
            worldX: 124,
            x: 62,
            y: 106,
            scale: 2.4,
            fit: "contain",
            depth: 1,
            occludes: true,
            occludeBaseline: 100,
          },
          {
            image: "/assets/sprites/sh-fg-cabinets.png",
            worldX: 26,
            x: 13,
            y: 104,
            scale: 2.6,
            fit: "contain",
            depth: 1,
            occludes: true,
            occludeBaseline: 99,
          },
        ],
      },
      stage: {
        // PASS 6 — EXTENDED STAGE. Two screens of precinct: the coffee and
        // corkboard end on screen one, Trunk's door and the windows on screen
        // two. Every coordinate here is a % of the 200-wide WORLD (foreground
        // extras are NOT — they stay viewport-%).
        worldWidth: 200,
        playerSheet: SLEDGE_WALK,
        spawn: { x: 16.0, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 72, bottom: 95 },
        depthScale: 0.22,
        hints: "proximity",
        verbCoin: true,
        extendedVerbs: true,
        sentenceLine: true,
        // PASS 4 — WALK-BEHIND REGIONS. The squadroom's desks are painted
        // into the plate, so there is no cutout to layer: these shapes redraw
        // the background itself, clipped, at the depth of their front edge.
        // Walk Sledge up past the desks and the desks cover him from the
        // waist down, which is the whole trick of the LucasArts squad room.
        //
        // The furniture obstacles used to sit on y 76–90 and eat the entire
        // behind-desk band (floor top is 72), so the walker could never get
        // behind the baseline. Shrink them to the desk FRONT and raise the
        // depth line into the floor so walking UP actually covers.
        occluders: [
          {
            id: "sh_occ_centre_desk",
            label: "the centre desk cluster",
            points: [
              { x: 50.0, y: 60 },
              { x: 108.0, y: 60 },
              { x: 108.0, y: 86 },
              { x: 50.0, y: 86 },
            ],
            // front edge of the desk: above this line he's behind it
            baseline: 86,
          },
          {
            id: "sh_occ_right_desks",
            label: "the right-hand desk bank",
            points: [
              { x: 134.0, y: 57 },
              { x: 188.0, y: 57 },
              { x: 188.0, y: 86 },
              { x: 134.0, y: 86 },
            ],
            baseline: 86,
          },
        ],
        obstacles: [
          { x: 50.0, y: 84, w: 58.0, h: 10 },
          { x: 134.0, y: 84, w: 54.0, h: 10 },
        ],
        enterCaption:
          "MONDAY. A man is dead in an alley behind a pawn shop, and the only detective awake before ten is the one nobody wants awake at all.",
        npcs: [
          {
            id: "sh_npc_doreau",
            sheet: {
              image: "/assets/sprites/sh-doreau-talk.png",
              frameWidth: 221,
              frameHeight: 512,
              // NPC sheets are looked up as idle/walk (talkingSheet is the one
              // that uses rest/talk) — name them for the call site that reads
              // them, or the validator rightly warns that nothing matches.
              animations: { idle: { frames: [0] }, walk: { frames: [1, 2, 0, 2], fps: 6 } },
              pixelated: false,
            },
            x: 92.0,
            y: 90,
            scale: 0.5,
            facing: "right",
            idleAnim: "idle",
            talkHotspotId: "sh_talk_doreau",
          },
        ],
      },
      dialogueBeats: [],
      hotspots: [
        {
          id: "sh_coffee_hs",
          label: "TAKE — the coffee pot",
          bounds: { x: 2, y: 38, w: 22, h: 34 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "sh_coffee",
            flagSet: "sh_has_coffee",
            text: "You pour a cup. It pours like it has opinions.",
          },
          verbs: {
            look: {
              type: "showText",
              text: "The pot has been on the burner since Friday. Somebody has labelled it EVIDENCE, which is closer to true than funny.",
            },
          },
        },
        {
          id: "sh_board_hs",
          label: "LOOK — the wanted board",
          bounds: { x: 34, y: 26, w: 22, h: 26 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            flagSet: "sh_saw_board",
            text: "Nine faces you have already met and one campaign poster somebody pinned up as a joke: VANE FOR MAYOR — A SAFER CITY. Somebody has drawn a moustache on him. It is a good moustache. It is your moustache.",
          },
        },
        {
          id: "sh_talk_doreau",
          label: "TALK — Detective Doreau",
          bounds: { x: 104, y: 58, w: 22, h: 34 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topicPrompt: "Doreau looks up from the file. \"Before you go in there.\"",
            topicLeaveLabel: "I've heard enough. (Go see Trunk.)",
            topics: [
              {
                id: "sh_t_case",
                label: "\"What have we got?\"",
                flagSet: "sh_heard_case",
                beats: [
                  {
                    id: "sh_tb_case1",
                    characterId: "sh_doreau",
                    text: "Marvin Quillan, sixty-one, owner of Quality Time Pawn & Loan. Shot once in his own alley at eleven-forty last night. Register untouched, watches untouched, forty dollars still in his hand.",
                  },
                  {
                    id: "sh_tb_case2",
                    characterId: "sh_sledge",
                    text: "So it's not a robbery. Robbers take things. It's practically the definition. I looked it up once, by accident, while looking up something else.",
                  },
                ],
              },
              {
                id: "sh_t_trunk",
                label: "\"What kind of mood is the Captain in?\"",
                beats: [
                  {
                    id: "sh_tb_trunk1",
                    characterId: "sh_doreau",
                    text: "He has been holding the phone against his forehead for twenty minutes. The Councilman's office called first — before we released the name. Think about that on your way in.",
                  },
                ],
              },
              {
                id: "sh_t_gun",
                label: "\"Want to see the new grip on my gun?\"",
                repeatable: true,
                beats: [
                  {
                    id: "sh_tb_gun1",
                    characterId: "sh_doreau",
                    expression: "warning",
                    text: "No. Sledge. Put it away. We are indoors, there are civilians, and you have already shot this ceiling once this year.",
                  },
                  {
                    id: "sh_tb_gun2",
                    characterId: "sh_sledge",
                    text: "Twice. But the second one was a mercy killing. That light was suffering.",
                  },
                ],
              },
            ],
          },
        },
        {
          id: "sh_office_door_hs",
          label: "GO — Captain Trunk's office",
          bounds: { x: 132, y: 27, w: 18, h: 45 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "sh_trunk" },
          verbs: {
            look: {
              type: "showText",
              text: "Frosted glass, stencilled CAPT. TRUNK. Behind it, a silhouette is pacing at a speed no doctor would approve.",
            },
            kick: {
              type: "showText",
              text: "You kick the door open. The door was unlocked. The door has always been unlocked. Somewhere behind the glass, a man's blood pressure files for overtime.",
              flagSet: "sh_kicked_door",
              then: [{ type: "meterChange", meterChange: { meter: "Suspicion", delta: 1 } }],
            },
          },
        },
      ],
      choices: [],
    },

    /* ================================================================ */
    /*  2 — TRUNK'S OFFICE                                              */
    /* ================================================================ */
    {
      id: "sh_trunk",
      title: "The Captain's Office",
      background: "/img/bg-sh-trunk-office.jpg",
      ambientAudio: "drone",
      prose:
        "The office smells of cigars, carpet shampoo and imminent cardiac event. Captain Trunk is standing behind his desk with a phone in one hand and a blood-pressure cuff in the other, and he is using neither correctly.",
      dialogueBeats: [
        {
          id: "sh_b_t1",
          characterId: "sh_trunk",
          expression: "furious",
          text: "HAMMER. Sit down. Do not touch the plant. Do not shoot the plant.",
        },
        {
          id: "sh_b_t1k",
          characterId: "sh_trunk",
          conditionRule: { requiresFlags: ["sh_kicked_door"] },
          text: "And that door was OPEN. It is always open. It has been open since 1979 because YOU broke the latch in 1979.",
        },
        {
          id: "sh_b_t2",
          characterId: "sh_sledge",
          text: "The plant and I have an understanding, Captain. It doesn't grow, and I don't ask why.",
        },
        {
          id: "sh_b_t3",
          characterId: "sh_trunk",
          text: "Marvin Quillan. Pawnbroker. One shot, close range, nothing taken. And in the last ninety minutes I have had three calls from Councilman Vane's campaign office asking how the investigation is progressing. The investigation that started at seven this morning. That nobody announced.",
        },
        {
          id: "sh_b_t4",
          characterId: "sh_doreau",
          text: "That's what I said, sir.",
        },
        {
          id: "sh_b_t5",
          characterId: "sh_trunk",
          expression: "warning",
          text: "So here is my order, and I want it repeated back. You work the EVIDENCE. Paper, ballistics, receipts. Nobody kicks anything. Nobody shoots anything. The man is four weeks from being my boss's boss.",
        },
        {
          id: "sh_b_t6",
          characterId: "sh_sledge",
          text: "Understood, Captain. Evidence. Paper. Nobody gets shot.",
          recalls: { sh_promise: "You told the Captain: {said}" },
        },
      ],
      hotspots: [
        {
          id: "sh_plant_hs",
          label: "LOOK — the doomed plant",
          bounds: { x: 5, y: 40, w: 12, h: 34 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "A ficus with the posture of a witness. It has survived four captains and one ricochet.",
          },
        },
      ],
      choices: [
        {
          id: "sh_c_promise",
          text: "\"You have my word, Captain. I'll do it by the book.\"",
          attitudeTag: "Clever",
          memoryLog: "sh_promise",
          exclusiveGroup: "sh_briefing",
          targetSceneId: "sh_alley",
          consequences: {
            setFlags: ["sh_briefed"],
            addItems: ["sh_gun"],
            trustChanges: [{ characterId: "sh_trunk", delta: 1 }],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
          rememberLine: "Captain Trunk will remember that. Briefly. Hopefully.",
        },
        {
          id: "sh_c_boast",
          text: "\"Relax. I'll have a confession before your cuff deflates.\"",
          attitudeTag: "Aggressive",
          memoryLog: "sh_promise",
          exclusiveGroup: "sh_briefing",
          targetSceneId: "sh_alley",
          consequences: {
            setFlags: ["sh_briefed"],
            addItems: ["sh_gun"],
            trustChanges: [{ characterId: "sh_trunk", delta: -1 }],
            meterChanges: [
              { meter: "Aggressive", delta: 2 },
              { meter: "Suspicion", delta: 1 },
            ],
          },
        },
        {
          id: "sh_c_desk",
          text: "\"Actually, Captain — reassign me. I'll take the desk.\"",
          attitudeTag: "Neutral",
          exclusiveGroup: "sh_briefing",
          targetSceneId: "sh_end_desk",
        },
      ],
    },

    /* ================================================================ */
    /*  3 — THE ALLEY (stage)                                           */
    /* ================================================================ */
    {
      id: "sh_alley",
      title: "Alley — Quality Time Pawn & Loan",
      nodeType: "stage",
      note: "STAGE 2. The crime scene. The casing is a hold-to-EXAMINE marker; the grille is a MULTI-STATE object (shut → kicked in → searched) that only opens to 👢 KICK; the neon sign is a remote LOOK. Walking off the left edge returns to the squad room (exitEdges + entrySpawns).",
      background: "/img/bg-sh-alley-wide.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose: "",
      letterbox: false,
      cinematic: {
        mode: "pan",
        panDirection: "right",
        panDistance: 2,
        parallaxDepth: 0.2,
        // FOREGROUND EXTRA — the strung police tape, animated on a 3-frame
        // sheet (the engine plays a foreground extra's "loop" animation) and
        // drawn OVER the walker, so Sledge passes behind the cordon.
        foregroundExtras: [
          {
            image: "/assets/sprites/sh-fg-tape.png",
            sheet: {
              image: "/assets/sprites/sh-fg-tape.png",
              frameWidth: 148,
              frameHeight: 120,
              animations: { loop: { frames: [0, 1, 2, 1], fps: 4 } },
              pixelated: false,
            },
            // the cordon is strung across the alley itself — pin it to the room
            worldX: 100,
            x: 50,
            y: 62,
            scale: 3.4,
            fit: "contain",
            depth: 0,
            occludes: true,
            // PASS 3 FIX — the tape hangs at y:62, ABOVE this room's floor top
            // (74%). An occluder whose baseline is above the floor can never
            // fire: the walker's feet never get that high, so `occludes` was a
            // silent no-op all through pass 2. Pin the baseline down into the
            // floor band so Sledge really does duck behind the cordon.
            occludeBaseline: 88,
          },
          // PASS 3 — three depth planes in front of the walker. The chain-link
          // run sits furthest back of the three (low baseline, so Sledge is in
          // front of it for most of the alley); the dumpster and the bush are
          // hard near-corner occluders he passes behind.
          {
            image: "/assets/sprites/sh-fg-fence.png",
            worldX: 144,
            x: 72,
            y: 84,
            scale: 1.5,
            fit: "contain",
            depth: 0.7,
            opacity: 0.97,
            occludes: true,
            occludeBaseline: 84,
          },
          {
            image: "/assets/sprites/sh-fg-dumpster.png",
            worldX: 176,
            x: 88,
            y: 106,
            scale: 2.2,
            fit: "contain",
            depth: 1,
            occludes: true,
            occludeBaseline: 101,
          },
          {
            image: "/assets/sprites/sh-fg-patrolcar.png",
            // world-pinned: the patrol car is parked in the alley, not on the camera
            worldX: 60,
            x: 30,
            y: 108,
            scale: 2.5,
            fit: "contain",
            depth: 1,
            occludes: true,
            occludeBaseline: 102,
          },
          {
            image: "/assets/sprites/sh-fg-bush.png",
            worldX: 16,
            x: 8,
            y: 105,
            scale: 2.1,
            fit: "contain",
            depth: 1,
            occludes: true,
            occludeBaseline: 100,
          },
        ],
      },
      stage: {
        // PASS 6 — EXTENDED STAGE. The alley is now TWO screens wide: the
        // camera pans with Sledge and every coordinate below is a % of the
        // 200-wide WORLD, not the viewport. exitEdges close off both ends.
        worldWidth: 200,
        playerSheet: SLEDGE_WALK,
        spawn: { x: 24.0, y: 90 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 74, bottom: 95 },
        depthScale: 0.2,
        hints: "proximity",
        verbCoin: true,
        extendedVerbs: true,
        sentenceLine: true,
        obstacles: [
          // the dumpsters are solid furniture — walk around them
          { x: 126, y: 78, w: 26, h: 13 },
          // PASS 4 — A DOOR (gated barrier). The grille isn't just a hotspot
          // that refuses: while it's shut it is a SOLID WALL across the back
          // of the alley, so Sledge physically cannot reach the far corner.
          // Kick it in (the multi-state object sets sh_grille_kicked) and the
          // barrier ceases to exist. Lock-and-key made spatial — you can SEE
          // the far side the whole time and simply cannot walk there.
          {
            id: "sh_door_grille",
            x: 78,
            y: 74,
            w: 24,
            h: 22,
            gating: { requiresFlags: ["sh_grille_kicked"] },
          },
        ],
        enterCaption:
          "THE ALLEY. Rain, chalk, and forty dollars still in a dead man's hand. Whoever did this wanted a conversation, not a wallet.",
        exitEdges: { left: { targetSceneId: "sh_squadroom", label: "back to the precinct" } },
      },
      dialogueBeats: [],
      hotspots: [
        {
          id: "sh_casing_hs",
          label: "TAKE — something bright in the grate",
          bounds: { x: 26, y: 76, w: 14, h: 12 },
          cursor: "take",
          examine: true,
          examineSeconds: 2.2,
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "sh_casing",
            flagSet: "sh_has_casing",
            text: "Nickel-plated, match-grade, headstamped by a maker who sells to gun clubs and nobody else. Street iron does not eat this well.",
          },
          verbs: {
            look: {
              type: "showText",
              text: "Something is winking at you out of the storm grate, and it is not the city.",
            },
          },
        },
        {
          id: "sh_outline_hs",
          label: "LOOK — the chalk outline",
          bounds: { x: 74, y: 82, w: 34, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            flagSet: "sh_saw_outline",
            text: "Quillan went down facing the mouth of the alley — facing whoever walked in. No defensive marks. He knew the man, and he stood there and finished the sentence.",
          },
          verbs: {
            use: { type: "showText", text: "You cannot use a chalk outline. You have tried. There was paperwork." },
          },
        },
        {
          id: "sh_neon_hs",
          label: "LOOK — the PAWN sign",
          bounds: { x: 116, y: 14, w: 22, h: 22 },
          cursor: "look",
          remote: true,
          isRepeatable: true,
          action: {
            type: "showText",
            text: "QUALITY TIME PAWN & LOAN, in neon, missing its L. Somewhere in this city a man is telling a joke about that, and he is about to be arrested for it.",
          },
        },
        {
          id: "sh_dumpster_hs",
          label: "SEARCH — the dumpster",
          bounds: { x: 126, y: 60, w: 26, h: 22 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Rain, rats, and a campaign flyer gone to paste. Nothing a lab could hold up in court.",
          },
          verbs: {
            punch: {
              type: "showText",
              text: "You punch the dumpster. The dumpster rings like a church bell. Two blocks away, a man with a warrant starts running for no reason he can explain.",
              then: [{ type: "meterChange", meterChange: { meter: "Aggressive", delta: 1 } }],
            },
          },
        },
        {
          id: "sh_grille_hs",
          label: "The shop's security grille",
          bounds: { x: 82, y: 34, w: 16, h: 44 },
          // PASS 3 — the zone now has ART instead of being an invisible
          // rectangle over the painted background.
          image: "/assets/sprites/sh-obj-grille.png",
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Steel mesh over the back door, padlocked by a man who is no longer available to unlock it.",
          },
          states: [
            {
              id: "sh_grille_shut",
              label: "KICK — the padlocked grille",
              cursor: "look",
              action: {
                type: "showText",
                text: "Steel mesh, one padlock, and a warrant that will take until Thursday. Thursday is a coward's day.",
              },
            },
            {
              id: "sh_grille_kicked",
              when: { requiresFlags: ["sh_grille_kicked"] },
              label: "TAKE — the spike of unpaid tickets",
              cursor: "take",
              gating: null,
              action: {
                type: "giveItem",
                itemGranted: "sh_ticket",
                flagSet: "sh_has_ticket",
                text: "On a spike beside the register, the unredeemed and the redeemed-in-person. Ticket 4471: one cased presentation revolver, redeemed four days ago. Signature — and it is a beautiful signature, the kind a man practises for ballots — R. Vane.",
              },
            },
            {
              id: "sh_grille_done",
              when: { requiresFlags: ["sh_has_ticket"] },
              label: "LOOK — the ransacked back room",
              cursor: "look",
              gating: null,
              action: {
                type: "showText",
                text: "Nothing left on the spike but old paper and a bent nail. You have what you came for, and roughly one third of a legal basis for having it.",
              },
            },
          ],
          verbs: {
            kick: {
              type: "showText",
              flagSet: "sh_grille_kicked",
              text: "You kick the grille. The grille, the padlock and the door frame hold a brief meeting and resign together. Doreau, from the mouth of the alley: \"SLEDGE!\" You: \"It was like that when we got here.\"",
              then: [
                { type: "meterChange", meterChange: { meter: "Aggressive", delta: 2 } },
                { type: "meterChange", meterChange: { meter: "Suspicion", delta: 2 } },
              ],
            },
            punch: {
              type: "showText",
              text: "You punch the steel mesh. The steel mesh wins on points. Try a foot.",
            },
          },
        },
        {
          id: "sh_range_exit_hs",
          label: "GO — the precinct range (run ballistics)",
          bounds: { x: 180.0, y: 44, w: 18.0, h: 48 },
          cursor: "go",
          gating: { requiresItems: ["sh_casing"] },
          customFailMessage:
            "Doreau blocks the car door. \"Ballistics need something to ballist, Sledge. Find the brass first.\"",
          // PASS 5 — the cross-town trip now goes through the DRIVE. Note the
          // squadroom→Trunk's-office door does NOT: you don't drive down a
          // corridor. The minigame only guards journeys that are actually
          // journeys.
          action: { type: "goToScene", targetSceneId: "sh_drive" },
        },
      ],
      choices: [],
    },

    /* ================================================================ */
    /*  THE DRIVE — the ride minigame between the alley and the range   */
    /* ================================================================ */
    {
      id: "sh_drive",
      title: "Cross Town — Doing Sixty in a Forty",
      nodeType: "standard",
      note: "RIDE MINIGAME. Sledge drives to the range. Steer ← → between three lanes for 16 seconds, dodging traffic and roadworks. Near misses fire his deadpan commentary. Survive → the range. Crash → you still arrive (this is a comedy, not a fail state) but Doreau's trust takes the hit and the heat goes up.",
      background: "/img/bg-sh-drive.jpg",
      ambientAudio: "drone",
      prose:
        "Doreau puts her seatbelt on before the engine turns over. She has learned to do this early.",
      dialogueBeats: [
        {
          id: "sh_b_drive1",
          characterId: "sh_doreau",
          expression: "warning",
          text: "Speed limit's forty, Sledge.",
        },
        {
          id: "sh_b_drive2",
          characterId: "sh_sledge",
          text: "Then somebody should have written it bigger.",
        },
      ],
      choices: [
        {
          id: "sh_c_drive",
          text: "🚗 Drive to the range",
          targetSceneId: "sh_range",
          // A CRASH still gets you there — losing should cost something, not
          // wall off the case. The consequences below are the real penalty.
          timedOutTargetSceneId: "sh_range_crashed",
          ride: {
            lanes: 3,
            durationSeconds: 16,
            spawnMs: 1050,
            speed: 0.62,
            prompt: "CROSS TOWN — ← → TO STEER",
            vehicleImage: "/assets/sprites/sh-car-rear.png",
            traffic: [
              "/assets/sprites/sh-traffic-1.png",
              "/assets/sprites/sh-traffic-2.png",
              "/assets/sprites/sh-traffic-3.png",
              "/assets/sprites/sh-hazards-1.png",
              "/assets/sprites/sh-hazards-2.png",
              "/assets/sprites/sh-hazards-3.png",
            ],
            roadImage: "/img/sh-road-tile.jpg",
            horizonImage: "/img/bg-sh-drive.jpg",
            dashboardImage: "/assets/sprites/sh-dashboard.png",
            crashImage: "/img/sh-crash.jpg",
            driverName: "Sledge",
            driverSheet: talkSheet("/assets/sprites/sh-sledge-driving.png", 594),
            startLines: [
              "Hold on to something.",
              "I know a shortcut. It's this road, but faster.",
            ],
            // The gag lands on the DODGE, not the crash — a crash ends the
            // ride, so a line there is barely seen.
            nearMissLines: [
              "He'll buff out.",
              "That man waved at me.",
              "Relax, Doreau. I do this every day.",
              "Trust me. I know what I'm doing.",
              "Cones are a suggestion.",
              "That was a legal manoeuvre in three states.",
              "I've had worse Tuesdays.",
              "The city put that there to test me.",
            ],
            winText: "You arrive. The car arrives. Doreau's coffee does not.",
            crashText: "You arrive anyway. Sideways, mostly, but you arrive.",
          },
          consequences: { trustChanges: [{ characterId: "sh_doreau", delta: -1 }] },
        },
      ],
    },

    /* A crash still reaches the range — the cost is trust and heat, not a
       dead end. This node just delivers the aftermath and hands over. */
    {
      id: "sh_range_crashed",
      title: "Cross Town — Insurance Will Have Notes",
      nodeType: "note",
      note: "The RIDE's crash branch. Applies the penalty, then continues to the range.",
      background: "/img/sh-crash.jpg",
      prose:
        "The car comes to rest against a stack of the city's own traffic cones, which Sledge regards as the city's fault. Doreau writes something in her notebook. It is not about the case.",
      dialogueBeats: [
        {
          id: "sh_b_crash1",
          characterId: "sh_doreau",
          expression: "warning",
          text: "That was a fire hydrant, Sledge.",
        },
        {
          id: "sh_b_crash2",
          characterId: "sh_sledge",
          text: "It was in the road.",
        },
        {
          id: "sh_b_crash3",
          characterId: "sh_doreau",
          text: "It was on the pavement.",
        },
        {
          id: "sh_b_crash4",
          characterId: "sh_sledge",
          text: "Then it shouldn't have been so close to the road.",
        },
      ],
      choices: [
        {
          id: "sh_c_crash_on",
          text: "Walk the last block",
          targetSceneId: "sh_range",
          consequences: {
            trustChanges: [{ characterId: "sh_doreau", delta: -1 }],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
          },
        },
      ],
    },

    /* ================================================================ */
    /*  4 — THE FIRING RANGE (stage + puzzle)                           */
    /* ================================================================ */
    {
      id: "sh_range",
      title: "Precinct Firing Range",
      nodeType: "stage",
      partBreak: "Part One — Paper, Brass and a Bad Signature",
      note: "STAGE 3. Ballistics + the 🧩 pattern puzzle (campaign ledger) on the bench. The lane hotspot accepts the .44 as an item USE. The interview-room exit is gated on having done the work.",
      background: "/img/bg-sh-firing-range.jpg",
      ambientAudio: "drone",
      prose: "",
      cinematic: {
        mode: "static",
        parallaxDepth: 0.12,
        // PASS 3 — a safety rail across the front of the lane. Sledge walks
        // behind it the whole time, which is what sells the bench as a space
        // he is standing IN rather than on top of.
        foregroundExtras: [
          {
            image: "/assets/sprites/sh-fg-railing.png",
            x: 50,
            y: 103,
            scale: 1.35,
            fit: "cover",
            depth: 1,
            occludes: true,
            occludeBaseline: 99,
          },
        ],
      },
      stage: {
        playerSheet: SLEDGE_WALK,
        spawn: { x: 9, y: 91 },
        speed: 18,
        reach: 5,
        keyboard: true,
        floor: { top: 76, bottom: 96 },
        depthScale: 0.18,
        hints: "proximity",
        verbCoin: true,
        sentenceLine: true,
        obstacles: [{ x: 55, y: 79, w: 10, h: 12 }],
        enterCaption:
          "THE RANGE. Where the department keeps its comparison microscope, its ear defenders, and the only paperwork Sledge Hammer has ever volunteered for.",
        exitEdges: { left: { targetSceneId: "sh_alley", label: "back to the alley" } },
      },
      dialogueBeats: [],
      hotspots: [
        {
          id: "sh_scope_hs",
          label: "USE — the comparison microscope",
          bounds: { x: 22, y: 62, w: 12, h: 18 },
          // PASS 3 — object art, so the ballistics bench reads as a bench.
          image: "/assets/sprites/sh-obj-scope.png",
          cursor: "use",
          gating: { requiresItems: ["sh_casing"] },
          customFailMessage: "Nothing to compare. The microscope stares back, unimpressed.",
          acceptsItems: ["sh_casing", "sh_gun"],
          itemResponses: {
            sh_casing:
              "Firing-pin strike: off-centre, deep, the signature of a heavy single-action presentation piece — the sort sold cased, in velvet, to men who will never fire it twice. Not one gun in this precinct's armoury makes that mark.",
            sh_gun:
              "You put your own gun under the scope. The technician goes very still. \"Detective, this is a comparison microscope, not a mirror.\"",
          },
          action: {
            type: "useItem",
            flagSet: "sh_ballistics",
            text: "Off-centre firing-pin strike. A cased presentation revolver, not street iron.",
            then: [{ type: "meterChange", meterChange: { meter: "Clever", delta: 1 } }],
          },
          verbs: {
            // The accepted items are armed and USEd here, so the zone needs a
            // real ⚙ use action to answer them — a bare setFlag default would
            // arm the item and then refuse it.
            use: {
              type: "useItem",
              flagSet: "sh_ballistics",
              text: "Off-centre firing-pin strike. A cased presentation revolver, not street iron.",
            },
            look: {
              type: "showText",
              text: "A comparison microscope: two barrels, one truth. The technician has already labelled a slide for you, which is either professionalism or fear.",
            },
          },
        },
        {
          id: "sh_ledger_hs",
          label: "USE — the disclosure sheet on the bench",
          bounds: { x: 40, y: 64, w: 13, h: 14 },
          cursor: "use",
          action: {
            type: "patternPuzzle",
            patternPuzzle: LEDGER_PUZZLE,
          },
          verbs: {
            look: {
              type: "showText",
              text: "Doreau has laid out the councilman's public campaign filings, because Doreau does the reading in this partnership.",
            },
          },
        },
        {
          id: "sh_lane_hs",
          label: "USE — lane three",
          bounds: { x: 66, y: 48, w: 16, h: 34 },
          cursor: "use",
          isRepeatable: true,
          acceptsItems: ["sh_gun", "sh_coffee"],
          itemResponses: {
            sh_gun:
              "You put six rounds into the silhouette's tie knot from twenty-five yards, one-handed, while explaining to nobody that the sights are for tourists. The range officer signs your requalification without looking up. He stopped looking up in 1985.",
            sh_coffee:
              "You set the coffee on the shooting bench. It vibrates towards the edge under its own power. You let it go. Some things have to make their own choices.",
          },
          action: {
            type: "showText",
            flagSet: "sh_qualified",
            text: "Lane three, paper silhouette, twenty-five yards. Therapy, in its purest municipal form.",
          },
        },
        {
          id: "sh_interview_exit_hs",
          label: "GO — the interview room",
          bounds: { x: 88, y: 42, w: 10, h: 50 },
          cursor: "go",
          gating: { requiresFlags: ["sh_ballistics", "sh_ledger_cracked"] },
          customFailMessage:
            "Doreau, without looking up: \"We get one interview with a councilman before his lawyers arrive. We do it holding everything, or we don't do it.\"",
          action: { type: "goToScene", targetSceneId: "sh_interview" },
        },
      ],
      choices: [],
    },

    /* ================================================================ */
    /*  5 — THE INTERVIEW (lies + interrogation)                        */
    /* ================================================================ */
    {
      id: "sh_interview",
      title: "Interview Room Two — Councilman Vane",
      background: "/img/bg-sh-interview.jpg",
      ambientAudio: "drone",
      prose:
        "Councilman Rex Vane came in voluntarily, with a photographer outside and a lawyer forty minutes away. He sits like a man being sculpted. Somewhere behind the glass, Captain Trunk is watching with a cuff on his arm and a hand over his eyes.",
      interrogation: {
        characterId: "sh_vane",
        composure: 4,
        steadySeconds: 8,
        pressReactions: [
          "Vane smooths his tie and smiles at the mirror rather than at you.",
          "\"Detective, my schedule is a matter of public record. So is my patience.\"",
          "The smile stays. Something behind it begins to sit down.",
        ],
        crackTrust: 1,
        brokeFlag: "sh_vane_cracked",
        brokeBeat: {
          id: "sh_b_broke",
          characterId: "sh_vane",
          expression: "cornered",
          text: "\"He wanted a RECEIPT.\" The candidate voice is gone; what is left is a man from a smaller street. \"Fifteen thousand dollars, and forty years of my life four weeks out, and Marvin wanted a piece of paper with my name on it. I brought the gun back to sell it. I brought it back. And then he took out a pen.\"",
        },
        brokeConsequences: {
          setFlags: ["sh_confession"],
          meterChanges: [{ meter: "Clever", delta: 2 }],
        },
        clampFlag: "sh_vane_clammed",
        clampedBeat: {
          id: "sh_b_clamp",
          characterId: "sh_vane",
          text: "\"I think we've reached the part of the morning where I say the word 'attorney' and you say nothing at all.\" He stands. He is very good at standing.",
        },
        clampConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
      },
      dialogueBeats: [
        {
          id: "sh_b_v1",
          characterId: "sh_vane",
          text: "Detectives. Terrible business. Marvin Quillan was a fixture of that neighbourhood — which is exactly the neighbourhood my safety programme was written for. I'll say so at the press conference at noon.",
        },
        {
          id: "sh_b_v2",
          characterId: "sh_doreau",
          text: "You were briefed on the victim's name before we released it, Councilman.",
        },
        {
          id: "sh_b_v3",
          characterId: "sh_vane",
          expression: "smooth",
          text: "A city has phones, Detective. And let me stop one rumour before it starts: I have never set foot in that alley in my life. I know the shop from the campaign trail — from the SIDEWALK, waving — and that is the whole of my acquaintance with Quality Time Pawn and Loan.",
          lie: {
            claim: "\"I have never set foot in that alley — or in that shop — in my life.\"",
            evidenceItemIds: ["sh_ticket"],
            contradictedFlag: "sh_caught_alley",
            caughtBeat: {
              id: "sh_b_v3_caught",
              characterId: "sh_vane",
              conditionRule: { requiresFlags: ["sh_caught_alley"] },
              expression: "cornered",
              text: "He reads ticket 4471 twice, and the second time his thumb finds his own signature. \"...Redeemed in person. Yes. I collected a gift. A presentation piece, from a gun club dinner, that I had been carrying a small debt against. That is not a crime, Detective, it is a Tuesday.\"",
            },
            wrongBeat: {
              id: "sh_b_v3_wrong",
              characterId: "sh_vane",
              text: "He glances at what you are holding and gives it the warm, empty half-second he gives babies at rallies. \"I'm not sure what I'm meant to be looking at.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 1 }],
              trustChanges: [{ characterId: "sh_vane", delta: -1 }],
            },
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            composureDamage: 2,
            rememberLine: "Vane knows you have his signature.",
          },
        },
        {
          id: "sh_b_v3b",
          characterId: "sh_doreau",
          conditionRule: { requiresMemories: ["sh_showed_ticket"] },
          text: "For the tape, Councilman: the detective just did something. He said — {said} — and you picked it up and read your own name off it.",
          recalls: { sh_showed_ticket: "{said}" },
        },
        {
          id: "sh_b_v4",
          characterId: "sh_vane",
          conditionRule: { requiresFlags: ["sh_caught_alley"] },
          expression: "recovering",
          text: "\"And before you go rummaging through my finances — every dollar of that campaign came in by cheque. Cheques, Detective. Audited, disclosed, dull. We have never accepted a cash donation, not once, not a dollar.\"",
          lie: {
            claim: "\"Every dollar came in by cheque. We have never taken cash. Not once.\"",
            evidenceItemIds: ["sh_ledger_page"],
            contradictedFlag: "sh_caught_cash",
            caughtBeat: {
              id: "sh_b_v4_caught",
              characterId: "sh_vane",
              conditionRule: { requiresFlags: ["sh_caught_cash"] },
              expression: "cornered",
              text: "Three walk-ins. Five thousand each. Initialled Q.T. \"...Those are anonymous contributions, lawfully recorded—\" He hears it as he says it. Anonymous, and recorded, and initialled. \"—by a volunteer. Who is new.\"",
            },
            wrongBeat: {
              id: "sh_b_v4_wrong",
              characterId: "sh_vane",
              text: "\"Detective, if you're going to wave things at me, wave something with a number on it.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              meterChanges: [{ meter: "Clever", delta: 2 }],
              trustChanges: [{ characterId: "sh_vane", delta: -1 }],
            },
            wrongConsequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
            composureDamage: 2,
            rememberLine: "Vane's campaign just became evidence.",
          },
        },
        {
          id: "sh_b_v5",
          characterId: "sh_doreau",
          expression: "warning",
          conditionRule: { requiresFlags: ["sh_confession"] },
          text: "Sledge — the noon press conference. He's not going to a podium. He's going to the roof of the campaign office, and he took the case out of his car this morning.",
        },
        {
          id: "sh_b_v6",
          characterId: "sh_sledge",
          conditionRule: { requiresMemories: ["sh_promise"] },
          text: "I told the Captain something this morning. I said: {said}. I intend to keep about sixty percent of that.",
          recalls: { sh_promise: "You told the Captain: {said}" },
        },
      ],
      hotspots: [
        {
          id: "sh_board_open_hs",
          label: "OPEN — the corkboard",
          bounds: { x: 4, y: 12, w: 14, h: 22 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "openBoard",
            text: "You step out to the hall board and start pinning string between things that already knew each other.",
          },
        },
      ],
      choices: [
        {
          id: "sh_c_show_ticket",
          text: "Slide pawn ticket 4471 across the table.",
          reply: true,
          presentItem: "sh_ticket",
          attitudeTag: "Clever",
          memoryLog: "sh_showed_ticket",
          gating: { requiresFlags: ["sh_caught_alley"] },
          hidden: true,
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "sh_c_board",
          text: "Step out and work the corkboard before he lawyers up.",
          reply: true,
          isRepeatable: true,
          attitudeTag: "Clever",
        },
        {
          id: "sh_c_roof",
          text: "\"Doreau. The roof. Now.\"",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["sh_confession"] },
          hidden: true,
          targetSceneId: "sh_rooftop",
          consequences: { setFlags: ["sh_doreau_briefed"] },
          rememberLine: "Doreau will remember that you said 'we', for once.",
        },
        {
          id: "sh_c_walk",
          text: "Let him walk out to his press conference. (No confession.)",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["sh_vane_clammed"] },
          hidden: true,
          targetSceneId: "sh_rooftop",
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 1 }] },
        },
      ],
    },

    /* ================================================================ */
    /*  6 — THE ROOFTOP (quick-time)                                    */
    /* ================================================================ */
    {
      id: "sh_rooftop",
      title: "Campaign Office — Rooftop",
      background: "/img/bg-sh-rooftop.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      letterbox: true,
      prose:
        "Eleven minutes to noon. Vane is on the parapet edge of his own campaign office with the cased presentation revolver open in his hands and a city of voters below him. Doreau is on the stair door. There is no third detective coming.",
      dialogueBeats: [
        {
          id: "sh_b_r1",
          characterId: "sh_vane",
          expression: "cornered",
          text: "\"Four weeks, Hammer. Four weeks and a whole city, and it comes apart over a man with a pen and a receipt book.\" He lifts the revolver — not at you. Not yet. \"You know what the papers do to a man who resigns? Nothing. They do NOTHING. But a man who goes out on his own roof —\"",
        },
        {
          id: "sh_b_r2",
          characterId: "sh_doreau",
          text: "Sledge. Alive, he does thirty years and Quillan gets a verdict. Dead, he gets a boulevard named after him. Alive.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "sh_c_qte_talk",
          text: "Holster it. Talk him down like a person.",
          quickTime: true,
          qtePrompt: "HE IS DECIDING. SO ARE YOU.",
          qteHeartbeat: true,
          qteShakyCam: true,
          timeLimitSeconds: 9,
          attitudeTag: "Clever",
          targetSceneId: "sh_end_gold",
          gating: { requiresFlags: ["sh_pin_gun", "sh_pin_money", "sh_pin_motive", "sh_confession"] },
          consequences: {
            meterChanges: [{ meter: "Clever", delta: 2 }],
            trustChanges: [{ characterId: "sh_doreau", delta: 2 }],
          },
          timedOutTargetSceneId: "sh_end_hesitated",
          timedOutConsequences: { setFlags: ["sh_hesitated"] },
          rememberLine: "Doreau will remember that you holstered it.",
        },
        {
          id: "sh_c_qte_shoot",
          text: "Shoot the revolver out of his hand. You have done it before. Mostly.",
          quickTime: true,
          qtePrompt: "HE IS DECIDING. SO ARE YOU.",
          qteHeartbeat: true,
          qteShakyCam: true,
          timeLimitSeconds: 9,
          attitudeTag: "Aggressive",
          targetSceneId: "sh_end_silver",
          consequences: {
            setFlags: ["sh_took_the_shot"],
            meterChanges: [
              { meter: "Aggressive", delta: 3 },
              { meter: "Suspicion", delta: 2 },
            ],
          },
          timedOutTargetSceneId: "sh_end_hesitated",
          timedOutConsequences: { setFlags: ["sh_hesitated"] },
        },
      ],
    },

    /* ================================================================ */
    /*  ENDINGS                                                         */
    /* ================================================================ */
    {
      id: "sh_end_gold",
      title: "Ending — By the Book, Roughly",
      isEnding: true,
      background: "/img/bg-sh-end-gold.jpg",
      letterbox: true,
      prose:
        "You put the .44 away first. That is the part nobody at the precinct will believe. Vane comes off the parapet talking, because talking is the only thing he ever learned to do, and he is still talking when Doreau closes the cuffs and reads him a right he has voted to fund. The confession holds. The signature holds. The ledger holds. At noon the press conference happens exactly on schedule, and it is Captain Trunk who gives it, in a tie Doreau chose, with a blood-pressure reading in the merely alarming range.",
      dialogueBeats: [
        {
          id: "sh_b_g1",
          characterId: "sh_trunk",
          text: "Nobody kicked anything. Nobody shot anything. Hammer — I want it on the record that I am UNCOMFORTABLE.",
        },
        {
          id: "sh_b_g2",
          characterId: "sh_sledge",
          text: "That's the job, Captain. Sometimes the gun stays in the coat. It's a big coat. It understands.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE CALIBER OF A GENTLEMAN",
        recap:
          "Casing, ticket and ledger page in evidence; all three pins on the board; both lies broken; a confession on tape and a councilman alive to answer for it. Marvin Quillan got a verdict.",
      },
    },
    {
      id: "sh_end_silver",
      title: "Ending — The Shot",
      isEnding: true,
      background: "/img/bg-sh-end-silver.jpg",
      letterbox: true,
      prose:
        "One round, twenty feet, into the cylinder gap of a cased presentation revolver held by a man four weeks from being mayor. The gun goes over the parapet in two pieces. Vane goes down clutching a hand that will heal, screaming about a lawsuit that will not. He lives. He is charged. And then, for eleven months, a very good attorney explains to a jury about the detective who fired first, and the confession that a shaken man gave afterwards, and the security grille in the alley that somebody kicked in without a warrant.",
      dialogueBeats: [
        {
          id: "sh_b_s1",
          characterId: "sh_doreau",
          text: "He's alive, Sledge. I'll give you that. I'll be giving you that in a deposition for the next year, but I'll give you it.",
        },
        {
          id: "sh_b_s2",
          characterId: "sh_sledge",
          text: "The man was holding a firearm on a rooftop over a school zone. I performed a municipal service. You're welcome, ninth grade.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "HE'LL LIVE. THE CASE MIGHT NOT.",
        recap:
          "You took the shot and took him alive — but a fired round, a kicked grille and a pressured confession give the defence three years of daylight. Quillan gets a plea, not a verdict.",
      },
    },
    {
      id: "sh_end_hesitated",
      title: "Ending — Noon",
      isEnding: true,
      background: "/img/bg-sh-end-hesitated.jpg",
      letterbox: true,
      prose:
        "You wait. It is one second, maybe two, and it is the only two seconds of your career you will ever be able to remember in order. The revolver comes up, and it does not come up at you. Doreau is already moving and Doreau is not fast enough, and at eleven fifty-two the city loses a candidate, a witness and a case, in that order. The press conference happens anyway. It is about you.",
      dialogueBeats: [
        {
          id: "sh_b_h1",
          characterId: "sh_doreau",
          text: "You had him. You HAD him, Sledge. You just had to say something first.",
        },
        {
          id: "sh_b_h2",
          characterId: "sh_sledge",
          text: "...I know. I was still choosing the line.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "YOU HESITATED",
        recap:
          "The quick-time window closed with Sledge Hammer still deciding. Vane took the only exit that avoids a trial, and the case died on the roof with him.",
      },
    },
    {
      id: "sh_end_suspended",
      title: "Ending — Badge and Gun",
      isEnding: true,
      background: "/img/bg-sh-trunk-office.jpg",
      // the fifth ending keeps the office plate; the desk-duty ending uses the
      // squad room, so all five endings are now visually distinct.
      prose:
        "It is not one thing. It is a door, a grille, a dumpster that will need replacing and a councilman's attorney who has learned all of it before lunch. Trunk does not shout. That is the frightening part. He puts his hand out flat across the desk and waits, and the room is very quiet while you put the badge in it.",
      dialogueBeats: [
        {
          id: "sh_b_x1",
          characterId: "sh_trunk",
          text: "The gun too, Hammer. — No. Not that one. The OTHER one. ...And the one in the boot.",
        },
        {
          id: "sh_b_x2",
          characterId: "sh_sledge",
          text: "You're making a mistake, Captain. Out there, right now, is a city full of people who need someone to kick a door.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "SUSPENDED PENDING REVIEW",
        recap:
          "Suspicion hit the heat limit. Every kicked, punched and shot-at piece of municipal property arrived on the Captain's desk at once, and the case went to a detective who owns a briefcase.",
      },
    },
    {
      id: "sh_end_desk",
      title: "Ending — Desk Duty",
      isEnding: true,
      background: "/img/bg-sh-squadroom.jpg",
      prose:
        "You take the desk. It is a good desk. It has a drawer that locks and a chair that swivels, and for one hour and ten minutes it is the most peaceful assignment in the history of the department. Then somebody double-parks outside, and the desk is found later, in the alley, in a condition the report describes as 'consistent with a fall'.",
      dialogueBeats: [
        {
          id: "sh_b_d1",
          characterId: "sh_trunk",
          text: "Hammer wanted a DESK. He asked me for a desk. I want that in the file, because nobody is ever going to believe me.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "THE SHORTEST CASE OF YOUR CAREER",
        recap:
          "You turned down the case in Trunk's office. An alternate exit, one scene deep — proof that a point-and-click can fail fast if the author wires it that way.",
      },
    },
  ],
};
