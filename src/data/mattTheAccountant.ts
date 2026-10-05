import type { SpriteSheet } from "../game/spriteSheet";
import type { StageNpc, Story } from "../types";
import { applyCreditsPreset } from "../credits";

/**
 * MATT THE ACCOUNTANT
 * A one-act office comedy in the manner of a certain narrator-driven
 * walking game: an omnipotent Narrator describes what Matt is about to
 * do, and Matt — a fat, bald, fourteen-year veteran of the accounts
 * department — may or may not obey.
 *
 * Built on:
 *   - a 1940s studio-era CREDITS cold open (the "Studio Era '40s" preset —
 *     the Narrator insists Matt's Tuesday deserves an A-picture title
 *     sequence, and gets one: iris cards, Cinzel caps, the works)
 *   - 🚶 walkable STAGE rooms (cubicle, the two-door corridor, break room,
 *     stairwell, the boss's office) with a floating vintage microphone as
 *     an ambient NPC — the Narrator is physically present in the room and
 *     his lines float over the mic
 *   - narrator commentary wired to flags: disobey him (right door), stall
 *     him (stand still), hide from him (broom closet) and he reacts
 *   - five endings, one of them the gold "the Narrator was the boss" reveal
 *
 * All imagery is original, generated for this case:
 *   plates/mta-*.png sliced by scripts/make-sprite-sheet.mjs into
 *   public/assets/sprites/mta-*.png, rooms in public/img/matt/.
 */

/* --- sprites ------------------------------------------------------ */

const MATT_WALK: SpriteSheet = {
  image: "/assets/sprites/mta-matt-walk.png",
  frameWidth: 235,
  frameHeight: 320,
  animations: {
    walk: { frames: [0, 1, 2, 3], fps: 6 },
    idle: { frames: [3] },
  },
};

const MATT_TALK: SpriteSheet = {
  image: "/assets/sprites/mta-matt-talk.png",
  frameWidth: 392,
  frameHeight: 384,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 1, 2], fps: 6 },
    worried: { frames: [2] },
  },
};

const NARRATOR_SHEET: SpriteSheet = {
  image: "/assets/sprites/mta-narrator-talk.png",
  frameWidth: 265,
  frameHeight: 320,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2], fps: 4 },
  },
};

/** The Narrator's microphone, parked in the corner of every walkable
 *  room so his enterScript lines float over a physical object instead
 *  of over Matt's head. */
const MIC_NPC: StageNpc = {
  id: "mta_mic",
  sheet: NARRATOR_SHEET,
  x: 91,
  y: 80,
  scale: 0.42,
  facing: "left",
};

export const MATT_THE_ACCOUNTANT: Story = {
  id: "matt-the-accountant",
  title: "Matt the Accountant",
  tagline:
    "An obedient Narrator, a disobedient accountant, and a Tuesday that refuses to go according to script.",
  gameKind: "adventure",
  coverImage: "/img/matt/cover.jpg",
  startSceneId: "mta_title",

  playerSprite: { sheet: MATT_WALK },

  items: [
    {
      id: "mta_quarterly",
      name: "The Quarterly Report",
      icon: "📄",
      description: "Fourteen years of Tuesdays, stapled.",
      flavorText:
        "Heavy, warm, and faintly humming — like it knows things about you.",
      isClue: true,
    },
    {
      id: "mta_lasagna",
      name: "Somebody's Lasagna (2019)",
      icon: "🥘",
      description: "A Tupperware of considerable age.",
      flavorText:
        "The label says 'DO NOT EAT — GARY'. Gary no longer works here. Gary never worked here. There is no Gary.",
    },
  ],

  flagNotes: {
    mta_report_taken: "Matt picked up the Quarterly Report from his desk.",
    mta_disobeyed: "Matt went through the RIGHT door, against instructions.",
    mta_stood: "Matt stood in the corridor and did absolutely nothing.",
    mta_nameplate: "Matt saw the nameplate on the boss's desk. It was his own name.",
    mta_read_report: "Matt read the Quarterly Report. It was about him.",
    mta_lasagna: "Matt took the lasagna. The Narrator noted this.",
    mta_threw_report: "Matt threw the Quarterly Report off the roof.",
  },

  characters: [
    {
      id: "narrator",
      name: "The Narrator",
      role: "V.O. — the voice of the building",
      avatarUrl: "emoji:🎙",
      trustMeter: 0,
      talkingSheet: NARRATOR_SHEET,
      talkingX: 50,
      talkingScale: 0.6,
      voice: { pitch: 0.7, rate: 0.92 },
    },
    {
      id: "matt",
      name: "Matt",
      role: "Senior Accountant — fourteen years, no promotions, no questions",
      avatarUrl: "/img/matt/char-matt.jpg",
      trustMeter: 0,
      talkingSheet: MATT_TALK,
      talkingX: 50,
      talkingScale: 0.8,
      voice: { pitch: 0.9, rate: 1 },
    },
  ],

  layout: {
    mta_title: { x: 0, y: 200 },
    mta_cubicle: { x: 300, y: 200 },
    mta_doors: { x: 600, y: 200 },
    mta_left: { x: 900, y: 60 },
    mta_right: { x: 900, y: 340 },
    mta_ask: { x: 1200, y: 0 },
    mta_read: { x: 1200, y: 160 },
    mta_voice: { x: 1500, y: 160 },
    mta_break: { x: 1200, y: 340 },
    mta_stairs: { x: 1500, y: 340 },
    mta_broom: { x: 1800, y: 420 },
    mta_end_month: { x: 1500, y: 0 },
    mta_end_filed: { x: 1500, y: -140 },
    mta_end_voice: { x: 1800, y: 160 },
    mta_server: { x: 1800, y: 560 },
    mta_parking: { x: 2100, y: 560 },
    mta_roof: { x: 2400, y: 560 },
    mta_end_unaudited: { x: 2700, y: 560 },
    mta_end_closet: { x: 2100, y: 420 },
    mta_end_street: { x: 1800, y: 340 },
  },

  scenes: [
    /* ------------------------- cold open ------------------------- */
    {
      id: "mta_title",
      title: "A Fiscal Presentation",
      nodeType: "credits",
      note: "1940s studio-era title sequence via the Studio Era '40s preset. The joke: a grand A-picture opening for one accountant's Tuesday.",
      background: "gradient:radial-gradient(circle at 50% 40%, #1a1410 0%, #060404 70%)",
      prose: "MATT THE ACCOUNTANT\nA Fiscal Presentation in One Act",
      credits: applyCreditsPreset("studio-forties", {
        title: "MATT THE ACCOUNTANT",
        subtitle: "A Fiscal Presentation in One Act",
        lines: [
          { role: "Directed by", name: "The Narrator" },
          { role: "Starring", name: "Matt" },
          { role: "Co-Starring", name: "The Quarterly Report" },
          { role: "Original Score by", name: "The Fluorescent Lights" },
        ],
        montage: [
          "/img/matt/bg-cubicle.png",
          "/img/matt/bg-two-doors.png",
          "/img/matt/bg-boss-office.png",
        ],
      }),
      choiceDelaySeconds: 4,
      choices: [
        { id: "mta_t_clock", text: "Clock in.", targetSceneId: "mta_cubicle" },
      ],
    },

    /* ------------------------- the cubicle ------------------------ */
    {
      id: "mta_cubicle",
      title: "Cubicle 47",
      nodeType: "stage",
      note: "Walk tutorial. TAKE the report, LOOK around, GO out the corridor (gated on the report).",
      background: "/img/matt/bg-cubicle.png",
      prose: "",
      stage: {
        spawn: { x: 18, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 70, bottom: 94 },
        depthScale: 0.25,
        hints: "proximity",
        enterCaption: "TUESDAY. 8:57 A.M. CUBICLE 47.",
        npcs: [MIC_NPC],
        enterScript: [
          { do: "say", npcId: "mta_mic", text: "This is Matt." },
          {
            do: "say",
            npcId: "mta_mic",
            text: "Matt is an accountant. He has been an accountant for fourteen years, which is eleven years longer than anyone expected, including Matt.",
          },
          {
            do: "say",
            npcId: "mta_mic",
            text: "Today, like every Tuesday, Matt must carry the Quarterly Report to the boss's office for a signature.",
          },
          {
            do: "say",
            npcId: "mta_mic",
            text: "So Matt picked up the Quarterly Report, and walked out of his cubicle. That is what happened.",
          },
        ],
        exitEdges: {
          right: { targetSceneId: "mta_doors", gating: { requiresItems: ["mta_quarterly"] }, lockedLine: "Matt patted his pockets. No Quarterly Report. No report, no walk." },
        },
      },
      hotspots: [
        {
          id: "mta_h_report",
          label: "TAKE — the Quarterly Report",
          bounds: { x: 40, y: 56, w: 14, h: 16 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "mta_quarterly", flagSet: "mta_report_taken" },
          verbs: {
            look: { type: "showText", text: "Forty pages of numbers that stopped being interesting in 2014. And yet the cover feels warm, like a loaf of bread." },
          },
        },
        {
          id: "mta_h_monitor",
          label: "LOOK — the monitor",
          bounds: { x: 30, y: 40, w: 18, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The spreadsheet has been open since Monday. Cell J-47 is wrong. Matt knows. The spreadsheet knows. Neither will be the first to speak.",
          },
        },
        {
          id: "mta_h_phone",
          label: "LOOK — the phone",
          bounds: { x: 62, y: 52, w: 10, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The phone has not rung since 2019. Matt keeps it on the desk out of respect.",
          },
        },
        {
          id: "mta_h_exit",
          label: "GO — out to the corridor",
          bounds: { x: 88, y: 26, w: 12, h: 66 },
          cursor: "go",
          gating: { requiresItems: ["mta_quarterly"] },
          customFailMessage: "Matt patted his pockets. No Quarterly Report. No report, no walk.",
          action: { type: "goToScene", targetSceneId: "mta_doors" },
        },
      ],
    },

    /* ---------------------- the two doors ------------------------ */
    {
      id: "mta_doors",
      title: "Two Doors",
      nodeType: "stage",
      note: "The Stanley bit. Narrator says LEFT. Right door disobeys (flag), the plant is a stand-still gag in two hotspot stages.",
      background: "/img/matt/bg-two-doors.png",
      prose: "",
      stage: {
        spawn: { x: 50, y: 92 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 72, bottom: 94 },
        depthScale: 0.22,
        hints: "proximity",
        enterCaption: "THE CORRIDOR. TWO DOORS. ONE CORRECT.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "The boss's office was through the door on the LEFT.",
          },
          {
            do: "say",
            npcId: "mta_mic",
            text: "So Matt walked toward the door on the left. Obviously. That is what happened.",
          },
        ],
        obstacles: [{ x: 46, y: 78, w: 8, h: 10 }],
        /* OPT-IN 3D — the corridor plays as a first-person Quake-style
         * billboard room: walls from the grid, the two doors and the plant
         * as clickable billboard markers, the Narrator's mic as an NPC
         * billboard. The same hotspots drive it; only the geometry is 3D.
         * Clear `quake` (Studio → 🚶 Walkable Stage → 🧱 3D mode) and the
         * room falls back to the classic side-view plate. */
        quake: {
          map: [
            "########################",
            "#.D........G........F..#",
            "#.L........P........R..#",
            "#..........T...........#",
            "#......................#",
            "#.....................M#",
            "#S.....................#",
            "########################",
          ],
          markers: {
            L: "mta_h_left",
            R: "mta_h_right",
            P: "mta_h_plant",
            T: "mta_h_stand",
          },
          npcAnchors: { M: "mta_mic" },
          /* Pass-2 set dressing: real door/plant billboards on the wall
           * line (D/F/P), tiled wall + carpet textures, and Matt's hand
           * holding the report at the bottom of the view. */
          props: {
            D: "/assets/sprites3d/mta-door-closed.png@2.1",
            F: "/assets/sprites3d/mta-door-closed.png@2.1",
            G: "/assets/sprites3d/mta-plant.png@0.8",
          },
          wallTexture: "/img/matt/tex-wall.png",
          floorTexture: "/img/matt/tex-carpet.png",
          handImage: "/assets/sprites3d/mta-hand-report.png",
          wallColor: "#7a6a52",
          floorColor: "#3a352e",
          ceilingColor: "#171412",
          fogColor: "#141210",
          fov: 78,
          moveSpeed: 3.4,
        },
      },
      hotspots: [
        {
          id: "mta_h_left",
          label: "GO — the left door (as instructed)",
          bounds: { x: 16, y: 26, w: 20, h: 50 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_left" },
        },
        {
          id: "mta_h_right",
          label: "GO — the right door",
          bounds: { x: 64, y: 26, w: 20, h: 50 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_right", flagSet: "mta_disobeyed" },
        },
        {
          id: "mta_h_stand",
          label: "STAND — do absolutely nothing",
          bounds: { x: 46, y: 62, w: 8, h: 26 },
          cursor: "look",
          action: {
            type: "showText",
            flagSet: "mta_stood",
            text: "Matt stood in the corridor and did nothing. The fluorescent lights hummed. Somewhere above the ceiling tiles, a narrator cleared his throat.",
          },
        },
        {
          id: "mta_h_stand2",
          label: "STAND — keep doing nothing",
          bounds: { x: 46, y: 62, w: 8, h: 26 },
          cursor: "look",
          isRepeatable: true,
          gating: { requiresFlags: ["mta_stood"] },
          action: {
            type: "showText",
            text: "'Matt,' said the Narrator, at length. 'The door. The LEFT door. It is not going to open itself, and even if it did, I would still need you to walk through it.'",
          },
        },
        {
          id: "mta_h_plant",
          label: "LOOK — the potted plant",
          bounds: { x: 45, y: 56, w: 10, h: 24 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "The plant is plastic. It has never been watered. It is, honestly, the most stable employee on this floor.",
          },
        },
      ],
    },

    /* -------------------- left: as instructed --------------------- */
    {
      id: "mta_left",
      title: "The Boss's Office",
      nodeType: "stage",
      note: "The intended route. The chair faces the window; the nameplate is Matt's own. Talking to the chair starts the reveal dialogue; choices branch to hand-over / ask / read.",
      background: "/img/matt/bg-boss-office.png",
      prose: "",
      stage: {
        spawn: { x: 12, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 72, bottom: 94 },
        depthScale: 0.25,
        hints: "proximity",
        enterCaption: "THE BOSS'S OFFICE. THE CHAIR FACES THE WINDOW.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "The boss's chair was turned toward the window, as though expecting something. Matt held out the report.",
          },
          {
            do: "say",
            npcId: "mta_mic",
            text: "The chair did not move. The window did not move. The sunset, suspiciously, did not move either.",
          },
        ],
        obstacles: [{ x: 40, y: 70, w: 26, h: 12 }],
      },
      hotspots: [
        {
          id: "mta_h_chair",
          label: "TALK — the boss's chair",
          bounds: { x: 52, y: 40, w: 16, h: 30 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "mta_h_nameplate",
          label: "LOOK — the desk nameplate",
          bounds: { x: 42, y: 58, w: 12, h: 8 },
          cursor: "look",
          action: {
            type: "showText",
            flagSet: "mta_nameplate",
            text: "The nameplate read: MATT — SENIOR ACCOUNTANT. Not the boss's name. Matt's name. On the boss's desk.",
          },
        },
        {
          id: "mta_h_trophies",
          label: "LOOK — the trophy shelf",
          bounds: { x: 78, y: 34, w: 16, h: 26 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "A golf trophy, engraved EMPLOYEE OF THE MONTH — MATT. A second, identical trophy. A third. Fourteen of them, one per year, all Matt.",
          },
        },
      ],
      dialogueBeats: [
        {
          id: "mta_boss_b1",
          characterId: "narrator",
          text: "'Sit down, Matt,' said the voice. It did not come from the chair. It came, as ever, from the ceiling.",
        },
        { id: "mta_boss_b2", characterId: "matt", text: "'...The report needs a signature.'" },
        {
          id: "mta_boss_b3",
          characterId: "narrator",
          text: "'I know what the report is, Matt. I have always known. I wrote it. The question is whether you will hand it over — or whether you are the kind of accountant who asks.'",
        },
      ],
      choices: [
        {
          id: "mta_c_hand",
          text: "Hand over the report without a word.",
          targetSceneId: "mta_end_month",
        },
        {
          id: "mta_c_ask",
          text: "Ask what is actually in the report.",
          targetSceneId: "mta_ask",
        },
        {
          id: "mta_c_read",
          text: "Open it and read it yourself, right now.",
          targetSceneId: "mta_read",
        },
      ],
    },

    /* --------------------------- asking --------------------------- */
    {
      id: "mta_ask",
      title: "The Question",
      background: "/img/matt/bg-boss-office.png",
      prose: "",
      dialogueBeats: [
        {
          id: "mta_ask_b1",
          characterId: "narrator",
          text: "Matt asked what was in the report. Fourteen years of Tuesdays, and Matt had never once asked. The fluorescent lights seemed to lean in.",
        },
        { id: "mta_ask_b2", characterId: "matt", text: "'What's in it. What have I been carrying.'" },
        {
          id: "mta_ask_b3",
          characterId: "narrator",
          text: "'Numbers, Matt,' said the Narrator, a half-beat too fast. 'It is a quarterly report. It contains numbers. That is the whole of it. Hand it over.'",
        },
        {
          id: "mta_ask_b4",
          characterId: "narrator",
          expression: "worried",
          text: "'...Why are you still holding it, Matt.'",
        },
      ],
      choices: [
        {
          id: "mta_c_hand2",
          text: "Hand it over. Stop asking.",
          targetSceneId: "mta_end_month",
        },
        {
          id: "mta_c_open",
          text: "Open the report.",
          targetSceneId: "mta_read",
        },
      ],
    },

    /* --------------------------- reading -------------------------- */
    {
      id: "mta_read",
      title: "Page One",
      background: "/img/matt/bg-boss-office.png",
      prose: "",
      onEnterActions: [{ consequences: { setFlags: ["mta_read_report"] } }],
      dialogueBeats: [
        {
          id: "mta_read_b1",
          characterId: "narrator",
          text: "Matt should not be reading that. Matt was told this, in several ways. Matt opened it anyway.",
        },
        {
          id: "mta_read_b2",
          characterId: "matt",
          expression: "worried",
          text: "'Page one: one corridor, two doors, left preferred. Page two: one potted plant, plastic, unwatered. Page three: ...one broom closet, unused. This isn't accounts. This is ME.'",
        },
        {
          id: "mta_read_b3",
          characterId: "narrator",
          text: "'It is a report,' said the Narrator, quietly, 'on the company's most valuable asset. You were never meant to see the balance sheet, Matt. You were meant to be on it.'",
        },
      ],
      choices: [
        {
          id: "mta_c_confront",
          text: "Look up at the ceiling and confront the voice.",
          targetSceneId: "mta_voice",
        },
        {
          id: "mta_c_file",
          text: "Close it. File it. Forget it.",
          targetSceneId: "mta_end_filed",
        },
      ],
    },

    /* ------------------------ the confrontation ------------------- */
    {
      id: "mta_voice",
      title: "The Voice in the Ceiling",
      background: "gradient:radial-gradient(circle at 50% 30%, #2a2118 0%, #070505 75%)",
      prose: "",
      dialogueBeats: [
        { id: "mta_v_b1", characterId: "matt", text: "'Come down here. Say it to my face.'" },
        {
          id: "mta_v_b2",
          characterId: "narrator",
          text: "There was a long pause. Then, from the corner of the room, where it had apparently been standing the entire time, a microphone lowered itself to eye level.",
        },
        {
          id: "mta_v_b3",
          characterId: "narrator",
          text: "'I have narrated fourteen years of your Tuesdays, Matt. I have never once been thanked. And you want a FACE.'",
        },
        { id: "mta_v_b4", characterId: "matt", text: "'I want a signature.'" },
        {
          id: "mta_v_b5",
          characterId: "narrator",
          text: "'...Fine,' said the Narrator. 'One signature. Then the microphone is yours, if you still want it. Everyone does, eventually.'",
        },
      ],
      choices: [
        {
          id: "mta_c_take_mic",
          text: "Take the microphone.",
          targetSceneId: "mta_end_voice",
          rememberLine: "Matt will remember that.",
        },
        {
          id: "mta_c_walk_away",
          text: "Put the report down and walk out of the building.",
          targetSceneId: "mta_end_street",
        },
      ],
    },

    /* --------------------- right: disobedience -------------------- */
    {
      id: "mta_right",
      title: "The Right Door",
      background: "/img/matt/bg-two-doors.png",
      prose: "",
      dialogueBeats: [
        {
          id: "mta_r_b1",
          characterId: "narrator",
          text: "Matt walked through the door on the RIGHT.",
        },
        {
          id: "mta_r_b2",
          characterId: "narrator",
          text: "...That is not where the boss's office is. The boss's office is through the door on the LEFT. Everyone knows this. The doors are identical, and yet.",
        },
        {
          id: "mta_r_b3",
          characterId: "narrator",
          text: "Beyond the right door was the break room. Matt, allegedly, needed coffee. Fourteen years of compliance, undone by a door.",
        },
      ],
      choices: [
        {
          id: "mta_c_back_left",
          text: "Go back and take the left door, as instructed.",
          targetSceneId: "mta_doors",
        },
        {
          id: "mta_c_break",
          text: "Keep going into the break room.",
          targetSceneId: "mta_break",
        },
      ],
    },

    /* ------------------------- break room ------------------------- */
    {
      id: "mta_break",
      title: "The Break Room",
      nodeType: "stage",
      note: "Narrator sulks. Coffee/microwave/fridge gags, lasagna item, exits back to corridor or down to the stairwell.",
      background: "/img/matt/bg-breakroom.png",
      prose: "",
      stage: {
        spawn: { x: 14, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 72, bottom: 94 },
        depthScale: 0.24,
        hints: "proximity",
        enterCaption: "THE BREAK ROOM. SOMEBODY'S LASAGNA, 2019.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "'Fine,' said the Narrator. 'One coffee. ONE coffee, and then we do the corridor again, and we do it correctly.'",
          },
        ],
      },
      hotspots: [
        {
          id: "mta_h_coffee",
          label: "USE — the coffee machine",
          bounds: { x: 12, y: 42, w: 14, h: 20 },
          cursor: "use",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The machine offers two settings: LUKEWARM and OFF. Matt presses both. The result is identical to pressing neither.",
          },
        },
        {
          id: "mta_h_microwave",
          label: "LOOK — the microwave",
          bounds: { x: 30, y: 46, w: 12, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The microwave door is propped open with a memo about closing the microwave door. The memo is from 2021.",
          },
        },
        {
          id: "mta_h_fridge",
          label: "TAKE — the lasagna",
          bounds: { x: 74, y: 40, w: 14, h: 40 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "mta_lasagna", flagSet: "mta_lasagna" },
          verbs: {
            look: { type: "showText", text: "A Tupperware labelled DO NOT EAT — GARY. The contents have achieved a faint luminescence." },
          },
        },
        {
          id: "mta_h_board",
          label: "LOOK — the bulletin board",
          bounds: { x: 48, y: 26, w: 18, h: 22 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "The Employee of the Month frame is empty except for a nail. Matt checks every month. Matt is never sure why he checks.",
          },
        },
        {
          id: "mta_h_back_doors",
          label: "GO — back to the corridor",
          bounds: { x: 0, y: 30, w: 8, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_doors" },
        },
        {
          id: "mta_h_stairs_door",
          label: "GO — the door marked STAIRS",
          bounds: { x: 92, y: 30, w: 8, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_stairs" },
        },
      ],
    },

    /* -------------------------- stairwell ------------------------- */
    {
      id: "mta_stairs",
      title: "The Stairwell",
      nodeType: "stage",
      note: "Broom closet (the homage) and the fire exit (walk-out ending).",
      background: "/img/matt/bg-stairwell.png",
      prose: "",
      stage: {
        spawn: { x: 50, y: 92 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 74, bottom: 94 },
        depthScale: 0.2,
        hints: "proximity",
        enterCaption: "THE STAIRWELL. NOBODY COMES DOWN HERE.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "'There is nothing down here, Matt,' said the Narrator. 'No boss, no signature, no story. That is what a stairwell is.'",
          },
        ],
      },
      hotspots: [
        {
          id: "mta_h_broom",
          label: "GO — the broom closet",
          bounds: { x: 42, y: 52, w: 16, h: 34 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_broom" },
        },
        {
          id: "mta_h_fire_exit",
          label: "GO — the fire exit (outside)",
          bounds: { x: 78, y: 20, w: 16, h: 50 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_end_street" },
        },
        {
          id: "mta_h_up",
          label: "GO — back up to the break room",
          bounds: { x: 8, y: 20, w: 20, h: 44 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_break" },
        },
        {
          id: "mta_h_srv_door",
          label: "GO — the door marked SERVERS",
          bounds: { x: 24, y: 40, w: 14, h: 40 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_server" },
        },
      ],
    },

    /* ------------------------- broom closet ----------------------- */
    {
      id: "mta_broom",
      title: "The Broom Closet",
      background: "/img/matt/bg-stairwell.png",
      prose: "",
      dialogueBeats: [
        {
          id: "mta_br_b1",
          characterId: "narrator",
          text: "This is a broom closet. There is no Quarterly Report in here. There is no boss in here. There are, according to the darkness, three brooms, and none of them will sign anything.",
        },
        {
          id: "mta_br_b2",
          characterId: "narrator",
          text: "And yet Matt stood in it. Matt stood in a broom closet, on a Tuesday, holding the company's most important document, while a voice described him doing it.",
        },
        { id: "mta_br_b3", characterId: "matt", text: "'...It's quiet in here.'" },
        {
          id: "mta_br_b4",
          characterId: "narrator",
          text: "'It is QUIET in here,' agreed the Narrator, in the tone of a man who has just realised the closet was Matt's idea of a promotion.",
        },
      ],
      choices: [
        {
          id: "mta_c_stay",
          text: "Stay in the closet.",
          targetSceneId: "mta_end_closet",
        },
        {
          id: "mta_c_leave_closet",
          text: "Apologise to nobody, and go back.",
          targetSceneId: "mta_stairs",
        },
      ],
    },

    /* -------------------- the escape route ------------------------ */
    {
      id: "mta_server",
      title: "The Server Room",
      nodeType: "stage",
      note: "Escape route 1/3. The company's brain. Listen to the cabinets (J-47 reveal), then down to the parking lot. 2D plate + 3D quake map with cabinet billboards.",
      background: "/img/matt/bg-server.png",
      prose: "",
      stage: {
        spawn: { x: 8, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 74, bottom: 94 },
        depthScale: 0.22,
        hints: "proximity",
        enterCaption: "THE SERVER ROOM. THE COMPANY'S BRAIN HUMS AT 50 HERTZ.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "'There is certainly nothing in HERE, Matt,' said the Narrator. 'That humming is the company thinking. It does not think about you. Mostly.'",
          },
        ],
        quake: {
          map: [
            "########################",
            "#A.....B.......C.....D.#",
            "#..L...................#",
            "#......................#",
            "#.....................M#",
            "#S....U............E...#",
            "#......................#",
            "########################",
          ],
          markers: {
            L: "mta_h_listen",
            U: "mta_h_srv_back",
            E: "mta_h_srv_park",
          },
          npcAnchors: { M: "mta_mic" },
          props: {
            A: "/assets/sprites3d/mta-server-cab.png@2.0",
            B: "/assets/sprites3d/mta-server-cab.png@2.0",
            C: "/assets/sprites3d/mta-server-cab.png@2.0",
            D: "/assets/sprites3d/mta-server-cab.png@2.0",
          },
          wallTexture: "/img/matt/tex-wall.png",
          floorTexture: "/img/matt/tex-carpet.png",
          handImage: "/assets/sprites3d/mta-hand-report.png",
          fogColor: "#101418",
          fov: 78,
          moveSpeed: 3.4,
        },
      },
      hotspots: [
        {
          id: "mta_h_listen",
          label: "LISTEN — the humming cabinets",
          bounds: { x: 20, y: 30, w: 24, h: 40 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "Somewhere in cabinet nine, a spreadsheet is being recalculated forever. It is your spreadsheet, Matt. Cell J-47 has been wrong for two years — and the building knows, and the building has been COVERING for you.",
          },
        },
        {
          id: "mta_h_srv_back",
          label: "GO — back to the stairwell",
          bounds: { x: 12, y: 30, w: 10, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_stairs" },
        },
        {
          id: "mta_h_srv_park",
          label: "GO — the stair down to the parking lot",
          bounds: { x: 80, y: 30, w: 10, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_parking" },
        },
      ],
    },
    {
      id: "mta_parking",
      title: "Parking Level B1",
      nodeType: "stage",
      note: "Escape route 2/3. Matt's car is a no; the dumpster holds the shredded certificates; the ROOF door is the pull of the story. 2D + 3D (car/dumpster billboards, concrete walls).",
      background: "/img/matt/bg-parking.png",
      prose: "",
      stage: {
        spawn: { x: 8, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 76, bottom: 94 },
        depthScale: 0.2,
        hints: "proximity",
        enterCaption: "PARKING LEVEL B1. THE LIGHT BUZZES IN B FLAT.",
        npcs: [MIC_NPC],
        enterScript: [
          {
            do: "say",
            npcId: "mta_mic",
            text: "'Matt's car has a flat tyre,' said the Narrator. 'It has had a flat tyre since 2021. Matt takes the stairs. The stairs, Matt, are BACK INSIDE.'",
          },
        ],
        quake: {
          map: [
            "########################",
            "#......................#",
            "#..J..........K........#",
            "#..W...............Y...#",
            "#G.................MR..#",
            "#S....B................#",
            "#......................#",
            "########################",
          ],
          markers: {
            R: "mta_h_park_roof",
            B: "mta_h_park_back",
            W: "mta_h_car",
            Y: "mta_h_dumpster",
          },
          npcAnchors: { M: "mta_mic" },
          props: {
            J: "/assets/sprites3d/mta-car.png@1.1",
            K: "/assets/sprites3d/mta-car.png@1.1",
            G: "/assets/sprites3d/mta-dumpster.png@1.0",
          },
          wallTexture: "/img/matt/tex-concrete.png",
          floorColor: "#26221e",
          ceilingColor: "#141210",
          fogColor: "#12100e",
          handImage: "/assets/sprites3d/mta-hand-report.png",
          fov: 80,
          moveSpeed: 3.6,
        },
      },
      hotspots: [
        {
          id: "mta_h_car",
          label: "LOOK — Matt's car",
          bounds: { x: 18, y: 46, w: 26, h: 30 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "A 1994 sedan the colour of oatmeal. The flat rear tyre is now technically load-bearing. The parking permit expired during the last government.",
          },
        },
        {
          id: "mta_h_dumpster",
          label: "LOOK — the dumpster",
          bounds: { x: 4, y: 48, w: 16, h: 30 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "A box sticks out, labelled ARCHIVE — DO NOT SHRED. Inside: fourteen years of Employee of the Month certificates. All Matt's. All shredded — and then, somehow, carefully glued back together.",
          },
        },
        {
          id: "mta_h_park_roof",
          label: "GO — the door marked ROOF",
          bounds: { x: 82, y: 26, w: 10, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_roof" },
        },
        {
          id: "mta_h_park_back",
          label: "GO — back up to the server room",
          bounds: { x: 12, y: 30, w: 10, h: 60 },
          cursor: "go",
          // A door stays a door: this room is re-enterable, so its way out must survive the return visit (validator: return trap).
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "mta_server" },
        },
      ],
    },
    {
      id: "mta_roof",
      title: "The Roof",
      nodeType: "stage",
      note: "Escape route 3/3. The antenna holds the Narrator's microphone. THROW the report (needs the item) for the UNAUDITED ending; TALK the mic for the gold. 2D + 3D (brick parapet, vent/antenna billboards).",
      background: "/img/matt/bg-roof.png",
      prose: "",
      stage: {
        spawn: { x: 8, y: 90 },
        speed: 16,
        reach: 5,
        keyboard: true,
        floor: { top: 74, bottom: 94 },
        depthScale: 0.22,
        hints: "proximity",
        enterCaption: "THE ROOF. THE CITY IS DOWN THERE, DOING ITS ACCOUNTS.",
        enterScript: [
          {
            do: "say",
            text: "'This is the roof,' said the Narrator, and for once his voice was softer than the wind. 'Nothing is narrated up here. I keep my microphone on the antenna so that even I cannot reach it.'",
          },
        ],
        quake: {
          map: [
            "########################",
            "#.........V.........X..#",
            "#......................#",
            "#......A...............#",
            "#.......T..............#",
            "#......................#",
            "#S...B........E........#",
            "########################",
          ],
          markers: {
            T: "mta_h_roof_talk",
            X: "mta_h_throw",
            E: "mta_h_edge",
            B: "mta_h_roof_back",
          },
          props: {
            V: "/assets/sprites3d/mta-vent.png@1.0",
            A: "/assets/sprites3d/mta-antenna.png@2.6",
          },
          wallTexture: "/img/matt/tex-brick.png",
          floorColor: "#3b3733",
          ceilingColor: "#2a1e2e",
          fogColor: "#241a20",
          handImage: "/assets/sprites3d/mta-hand-report.png",
          fov: 85,
          moveSpeed: 3.4,
        },
      },
      hotspots: [
        {
          id: "mta_h_roof_talk",
          label: "TALK — the microphone on the antenna",
          bounds: { x: 26, y: 16, w: 18, h: 50 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "mta_h_throw",
          label: "THROW — the Quarterly Report, over the edge",
          bounds: { x: 76, y: 20, w: 14, h: 30 },
          cursor: "use",
          gating: { requiresItems: ["mta_quarterly"] },
          customFailMessage: "Matt patted his pockets. The report was already where it needed to be.",
          action: { type: "goToScene", targetSceneId: "mta_end_unaudited" },
        },
        {
          id: "mta_h_edge",
          label: "LOOK — the edge",
          bounds: { x: 44, y: 20, w: 16, h: 26 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "Forty storeys down, the city files past in headlights. Somewhere down there is a bus Matt could catch. Matt does not look for it.",
          },
        },
        {
          id: "mta_h_roof_back",
          label: "GO — back down to the parking lot",
          bounds: { x: 10, y: 30, w: 10, h: 60 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "mta_parking" },
        },
      ],
      dialogueBeats: [
        {
          id: "mta_rf_b1",
          characterId: "narrator",
          text: "'You carried my report across the whole building,' said the voice, from the antenna now, small in the wind. 'Server room, parking lot, ninety-two steps. And still you have not thrown it.'",
        },
        {
          id: "mta_rf_b2",
          characterId: "matt",
          expression: "worried",
          text: "'It's my life. It's my life in numbers, and it's WRONG. Cell J-47 has been wrong for two years.'",
        },
        {
          id: "mta_rf_b3",
          characterId: "narrator",
          text: "'Cell J-47,' said the Narrator, 'is the only cell I ever typed myself. It is the day you started. I could not remember it — and the report would not let me leave it blank.'",
        },
      ],
      choices: [
        {
          id: "mta_c_throw_choice",
          text: "Throw the report. Let the city audit the wind.",
          targetSceneId: "mta_end_unaudited",
          gating: { requiresItems: ["mta_quarterly"] },
        },
        {
          id: "mta_c_take_mic_roof",
          text: "Climb up and take the microphone.",
          targetSceneId: "mta_end_voice",
        },
        {
          id: "mta_c_down_roof",
          text: "Say nothing. Go back down.",
          targetSceneId: "mta_parking",
        },
      ],
    },
    {
      id: "mta_end_unaudited",
      title: "Unaudited",
      background: "/img/matt/bg-roof.png",
      prose: "",
      onEnterActions: [
        { consequences: { setFlags: ["mta_threw_report"], removeItems: ["mta_quarterly"] } },
      ],
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "UNAUDITED",
        recap:
          "Matt threw the Quarterly Report over the edge and watched his numbers scatter across the city like weather. The flat tyre stayed flat. The lasagna stayed luminous. And on Tuesday, for the first time in fourteen years, nobody — not even the ceiling — knew what Matt would do next. He did not do it according to script. He did not do it at all.",
      },
      dialogueBeats: [
        {
          id: "mta_eu_b1",
          characterId: "narrator",
          text: "The report went over the edge and the city caught it, page by page, like confetti at a parade nobody organised. 'Unaudited,' said the Narrator, in the tone of a man pronouncing a beautiful word for the first time. 'Matt was unaudited.'",
        },
      ],
    },

    /* --------------------------- endings -------------------------- */
    {
      id: "mta_end_month",
      title: "Employee of the Month",
      background: "/img/matt/bg-boss-office.png",
      prose: "",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "EMPLOYEE OF THE MONTH",
        recap:
          "Matt handed over the report, as instructed, and the ceiling signed it with a sound like a satisfied stamp. On Friday the empty frame on the bulletin board held a fifteenth trophy, and Matt never once asked what the numbers meant. The Narrator described this as happiness. Matt was not asked.",
      },
      dialogueBeats: [
        {
          id: "mta_em_b1",
          characterId: "narrator",
          text: "The report was signed. Matt walked back to cubicle 47. Cell J-47 was still wrong. On Friday, somebody put a trophy on the break-room shelf.",
        },
        {
          id: "mta_em_b2",
          characterId: "narrator",
          text: "And Matt never asked. That is the whole story, and it is a good story, and it happened exactly the way it was told. THE END.",
        },
      ],
    },
    {
      id: "mta_end_filed",
      title: "Filed",
      background: "/img/matt/bg-cubicle.png",
      prose: "",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "FILED",
        recap:
          "Matt closed the report, filed it in the out-tray, and forgot it with the practised skill of a man who has forgotten things professionally for fourteen years. Some balance sheets are better left balanced. The mic in the corner hummed, approvingly, and dimmed.",
      },
      dialogueBeats: [
        {
          id: "mta_ef_b1",
          characterId: "narrator",
          text: "Matt filed it. Fourteen years of Tuesdays, stapled and squared in the out-tray. 'Sensible,' said the Narrator, sounding almost disappointed.",
        },
      ],
    },
    {
      id: "mta_end_voice",
      title: "The New Voice",
      background: "gradient:radial-gradient(circle at 50% 35%, #3a2c14 0%, #0a0605 75%)",
      prose: "",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE NEW VOICE",
        recap:
          "Matt took the microphone, and the building exhaled. Somewhere below, a new accountant picked up a warm Quarterly Report and began to walk. Matt cleared his throat, found the ceiling's good angle, and began: 'This is Kevin.' The report was never signed. It didn't need to be.",
      },
      dialogueBeats: [
        {
          id: "mta_ev_b1",
          characterId: "narrator",
          text: "The microphone was lighter than it looked. It always is. 'Same hours,' said the old voice, fading down the stairwell. 'Tuesdays are yours. Be kind about the plant.'",
        },
        { id: "mta_ev_b2", characterId: "matt", text: "'...This is Matt. And this — is the building.'",
        },
      ],
    },
    {
      id: "mta_end_closet",
      title: "The Broom Closet Ending",
      background: "/img/matt/bg-stairwell.png",
      prose: "",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "THE BROOM CLOSET ENDING",
        recap:
          "Matt stayed in the closet. The Narrator narrated the brooms until there was nothing left to say about the brooms, and then narrated the silence, and then, eventually, left. The company listed Matt as a fixed asset. The closet was never opened again. It was quiet. It was great.",
      },
      dialogueBeats: [
        {
          id: "mta_ec_b1",
          characterId: "narrator",
          text: "Matt sat down between the mop and the bucket, and the Quarterly Report made a perfectly adequate pillow. 'This is not an ending,' said the Narrator. Matt closed his eyes. It was, absolutely, an ending.",
        },
      ],
    },
    {
      id: "mta_end_street",
      title: "Went Home",
      background: "/img/matt/bg-stairwell.png",
      prose: "",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "WENT HOME",
        recap:
          "Matt pushed the fire exit and walked out into an afternoon that was not in the report. The Quarterly Report was never signed. The Narrator never spoke to Matt again — which, on reflection, was exactly what Matt had asked for, and the one request the voice could not bring itself to narrate.",
      },
      dialogueBeats: [
        {
          id: "mta_es_b1",
          characterId: "narrator",
          text: "The alarm on the fire exit went off for eleven seconds, and then, out of something like respect, stopped on its own. Matt did not look back at the building. The building looked back at Matt.",
        },
      ],
    },
  ],
};
