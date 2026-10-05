import type { Character, SceneNode, Story } from "../types";
import type { SpriteSheet } from "../game/spriteSheet";
import { fx, img, item, sprite } from "./neonSaltAssets";

/**
 * NEON SALT — Miami, 1986.
 *
 * A Vice reel: two detectives, a bay full of boats, and a shipment that keeps
 * arriving on a night nobody scheduled. Pass 1 of three — the spine of the
 * story, the cast, and the set-piece: a 3D signal triangulation on the water.
 *
 * Plates live under /public/img/neon-salt. Talking sprites are three-pose
 * cutouts (closed / half / open) forged from magenta plates; the FX overlay is
 * a real-alpha PNG, never a JPEG.
 */

/* ── Talking sprites ────────────────────────────────────────────────
 * Frames are 512 tall; each character's frame WIDTH differs because the
 * forge bottom-aligns to a uniform height and keeps aspect ratio. Rest is
 * frame 0, so a silent character holds a closed mouth.                */
const talkSheet = (name: string, frameWidth: number): SpriteSheet => ({
  image: sprite(name),
  frameWidth,
  frameHeight: 512,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated: false,
});

export const NEON_SALT_CHARACTERS: Character[] = [
  {
    id: "sonny",
    name: "Det. Sonny Vance",
    role: "Vice · lives on a boat, works on a hunch, bills the department for neither",
    avatarUrl: img("p010-causeway"),
    talkingSheet: talkSheet("sonny", 171),
    talkingX: 26,
    talkingScale: 0.95,
    trustMeter: 0,
    voice: { pitch: 0.86, rate: 0.98 },
  },
  {
    id: "rico",
    name: "Det. Rico Delgado",
    role: "Vice · the paperwork, the Spanish, and the only adult in the car",
    avatarUrl: img("p040-squadroom"),
    talkingSheet: talkSheet("rico", 176),
    talkingX: 74,
    talkingScale: 0.95,
    trustMeter: 0,
    voice: { pitch: 0.78, rate: 0.95 },
  },
  {
    id: "isabel",
    name: "Isabel Reyes-Marchetti",
    role: "Owns the marina, the club, and the harbormaster's schedule",
    avatarUrl: img("p030-club"),
    talkingSheet: talkSheet("isabel", 144),
    talkingX: 70,
    talkingScale: 0.92,
    trustMeter: 0,
    voice: { pitch: 1.06, rate: 0.96 },
  },
  {
    id: "dexter",
    name: "Dexter Prine",
    role: "Harbormaster, thirty-one years · signs for everything and reads all of it",
    avatarUrl: img("p070-harboroffice"),
    talkingSheet: talkSheet("dexter", 179),
    talkingX: 72,
    talkingScale: 0.93,
    trustMeter: 0,
    voice: { pitch: 0.72, rate: 0.9 },
  },
  {
    id: "ada",
    name: "ASA Camila Ortega",
    role: "State Attorney's office · decides which of your nights becomes a case",
    avatarUrl: img("p120-courthouse"),
    talkingSheet: talkSheet("ada", 182),
    talkingX: 30,
    talkingScale: 0.93,
    trustMeter: 0,
    voice: { pitch: 1.0, rate: 1.02 },
  },
  {
    id: "gio",
    name: "Gio Marchetti",
    role: "The brother-in-law · uses her slips, her signature, and her name",
    avatarUrl: img("p100-penthouse"),
    talkingSheet: talkSheet("gio", 217),
    talkingX: 68,
    talkingScale: 1.0,
    trustMeter: 0,
    voice: { pitch: 0.68, rate: 0.88 },
  },
];

const SCENES: SceneNode[] = [
  /* ---------------------------------------------------------------- */
  /* TITLES                                                           */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s000",
    title: "NEON SALT",
    nodeType: "credits",
    background: img("cover"),
    ambientAudio: "jazz",
    noTypewriter: true,
    transition: "fade-black",
    transitionSpeed: 1.4,
    letterbox: true,
    choiceDelaySeconds: 3,
    credits: {
      title: "NEON SALT",
      subtitle: "Miami, 1986 — the tide brings everything back",
      style: "cards",
      cardSeconds: 2.6,
      font: "poster",
      cardMotion: "letterspace",
      titleEntrance: "slam",
      accentColor: "#ff2e88",
      montage: [img("p010-causeway"), img("p020-marina"), img("p030-club"), img("p050-warehouse")],
      montageSeconds: 3.0,
      montageTransition: "cut",
      lines: [
        { role: "starring", name: "Det. Sonny Vance" },
        { role: "and", name: "Det. Rico Delgado" },
        { role: "the city", name: "plays itself" },
      ],
    },
    prose: "",
    choices: [{ id: "ns_c000", text: "Roll it", targetSceneId: "ns_s010", attitudeTag: "Neutral" }],
  },

  /* ---------------------------------------------------------------- */
  /* 1 — THE CAUSEWAY                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s010",
    title: "1. The Causeway",
    note: "Beat 1. Michael Mann wide — the car is small and the sky is enormous. Let the bay do the talking before anybody says a word.",
    nodeType: "cutscene",
    background: img("p010-causeway"),
    ambientAudio: "jazz",
    transition: "fade-black",
    transitionSpeed: 1.5,
    letterbox: true,
    choiceDelaySeconds: 2,
    cinematic: {
      mode: "pan",
      panDistance: 6,
      panDirection: "right",
      dimAmount: 0.12,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.45,
      foregroundExtras: [
        {
          image: fx("fx-fronds"),
          x: 14,
          y: 0,
          scale: 0.95,
          depth: 0.95,
          anim: { preset: "sway", intensity: 0.35, speed: 0.8 },
        },
        {
          image: fx("fx-fronds"),
          x: 88,
          y: 2,
          scale: 0.85,
          flip: true,
          depth: 0.95,
          anim: { preset: "sway", intensity: 0.3, speed: 0.7 },
        },
      ],
    },
    prose: "Six in the evening, ninety-one degrees, and the bay has gone pink and keeps going.",
    dialogueBeats: [
      {
        id: "ns_b010a",
        characterId: "sonny",
        expression: "driving, one hand",
        text: "Harbormaster logged eleven boats out last night. Marina says nine came back.",
      },
      {
        id: "ns_b010b",
        characterId: "rico",
        expression: "reading the sheet, not the water",
        text: "Two boats. Could be weather. Could be a man who finally left his wife.",
      },
      {
        id: "ns_b010c",
        characterId: "sonny",
        text: "Weather was flat. And the two that didn't come back are registered to the same marina office.",
      },
      {
        id: "ns_b010d",
        characterId: "rico",
        expression: "closing the folder",
        text: "Isabel's office.",
      },
    ],
    choices: [
      {
        id: "ns_c010a",
        text: "Start at the marina — look at the water first.",
        targetSceneId: "ns_s020",
        attitudeTag: "Clever",
        memoryLog: "went to the marina first",
      },
      {
        id: "ns_c010b",
        text: "Start at the squad room — pull the paperwork first.",
        targetSceneId: "ns_s040",
        attitudeTag: "Neutral",
        memoryLog: "went to the paperwork first",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 2 — THE MARINA                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s020",
    title: "2. The Marina",
    note: "Beat 2. Night, sodium and cyan. The empty slips are the evidence — hold on them.",
    background: img("p020-marina"),
    ambientAudio: "drone",
    transition: "fade",
    letterbox: true,
    particles: "smoke",
    cinematic: {
      mode: "dolly",
      dimAmount: 0.2,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.5,
      foregroundExtras: [
        {
          image: fx("fx-seamist"),
          x: 50,
          y: 78,
          scale: 1.3,
          opacity: 0.5,
          depth: 0.85,
          anim: { preset: "drift", intensity: 0.25, speed: 0.4 },
        },
      ],
    },
    prose: "Slip 14 and slip 19. Two rectangles of black water with nothing in them.",
    dialogueBeats: [
      {
        id: "ns_b020a",
        characterId: "rico",
        expression: "crouched at the cleat",
        text: "Lines cut, not untied. Whoever took these was in a hurry, and whoever owns them hasn't called it in.",
      },
      {
        id: "ns_b020b",
        characterId: "sonny",
        text: "You don't report a stolen boat when the boat's the crime.",
      },
    ],
    hotspots: [
      {
        id: "ns_h020_log",
        label: "Harbormaster's log",
        bounds: { x: 8, y: 58, w: 18, h: 16 },
        cursor: "look",
        action: {
          type: "giveItem",
          itemGranted: "log_page",
          text: "A photocopied page. Eleven out, nine back — and a line at the bottom in different ink: 03:40, no call sign.",
          flagSet: "f_has_log",
        },
      },
      {
        id: "ns_h020_slip",
        label: "Slip 19",
        bounds: { x: 62, y: 62, w: 22, h: 18 },
        cursor: "look",
        isRepeatable: true,
        action: {
          type: "showText",
          text: "Fresh scoring on the piling, waist height. Something heavy came alongside fast and didn't care about the paint.",
        },
      },
    ],
    choices: [
      {
        id: "ns_c020c",
        text: "The harbormaster's office is still lit. Knock.",
        targetSceneId: "ns_s050",
        attitudeTag: "Neutral",
        memoryLog: "talked to the harbormaster",
      },
      {
        id: "ns_c020a",
        text: "Take it to Isabel at the club.",
        targetSceneId: "ns_s030",
        attitudeTag: "Clever",
      },
      {
        id: "ns_c020b",
        text: "Back to the squad room and run the registrations.",
        targetSceneId: "ns_s040",
        attitudeTag: "Neutral",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 2b — THE HARBOUR OFFICE                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s050",
    title: "2b. The Harbor Office",
    note: "Beat 2b. The honest witness. Dexter is the only person in this story with nothing to gain, which is exactly why nobody has asked him anything. He hands over the 03:40 line and the name that goes with it.",
    background: img("p070-harboroffice"),
    ambientAudio: "drone",
    transition: "fade",
    letterbox: true,
    cinematic: {
      mode: "pan",
      panDistance: 4,
      panDirection: "left",
      dimAmount: 0.14,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.4,
    },
    prose: "Thirty-one years of tide charts and a man who has read every one of them.",
    dialogueBeats: [
      {
        id: "ns_b050a",
        characterId: "dexter",
        expression: "not surprised to see police",
        text: "Took you two days. I logged it the night it happened and I've been sitting here with it since.",
      },
      {
        id: "ns_b050b",
        characterId: "sonny",
        text: "Logged what, exactly?",
      },
      {
        id: "ns_b050c",
        characterId: "dexter",
        expression: "finds the page without looking",
        text: "Oh-three-forty. Two hulls out of fourteen and nineteen, running dark, no call sign. I put it in the book because that's what the book is for.",
      },
      {
        id: "ns_b050d",
        characterId: "rico",
        text: "Nobody radioed it in?",
      },
      {
        id: "ns_b050e",
        characterId: "dexter",
        expression: "the closest he gets to angry",
        text: "I radioed it in. Called the marina office and a man picked up who does not work for the marina office. Told me it was authorized and to go back to sleep.",
      },
      {
        id: "ns_b050f",
        characterId: "sonny",
        text: "You get a name?",
      },
      {
        id: "ns_b050g",
        characterId: "dexter",
        expression: "he has been waiting two days to say this",
        text: "Didn't have to. Man's been coming down my dock for six years telling everyone whose brother he is. Marchetti. And before you ask — no, Mrs Reyes wasn't with him, and she's never once been down here at four in the morning.",
      },
    ],
    hotspots: [
      {
        id: "ns_h050_book",
        label: "The logbook",
        bounds: { x: 30, y: 55, w: 22, h: 18 },
        cursor: "look",
        action: {
          type: "giveItem",
          itemGranted: "log_page",
          text: "He tears the page out himself and flattens it on the desk. The 03:40 line is in darker ink — added at the time, not after.",
          flagSet: "f_has_log",
        },
      },
      {
        id: "ns_h050_radio",
        label: "The VHF set",
        bounds: { x: 66, y: 48, w: 18, h: 16 },
        cursor: "look",
        // Pass 3: this was a showText tease, which meant the single most
        // load-bearing fact in the story — that a man answered the marina
        // phone at 03:52 — was something the player READ but could never
        // HOLD. It is the thing that breaks Gio's lie, so it has to be an
        // item you can put on the table.
        action: {
          type: "giveItem",
          itemGranted: "call_log",
          text: "The call log, taped to the housing. 03:52 — MARINA OFC — NO ACTION. Dexter's handwriting, and Dexter's underline. He peels it off and hands it over without being asked.",
          flagSet: "f_has_calllog",
        },
      },
    ],
    choices: [
      {
        id: "ns_c050a",
        text: "Take the name to Isabel at the club.",
        targetSceneId: "ns_s030",
        attitudeTag: "Clever",
      },
      {
        id: "ns_c050b",
        text: "Squad room — put it on the board.",
        targetSceneId: "ns_s040",
        attitudeTag: "Neutral",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 3 — THE CLUB                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s030",
    title: "3. The Club",
    note: "Beat 3. Isabel gets the warm side of the room and the cold side of the conversation. She never lies — she just answers a different question.",
    background: img("p030-club"),
    ambientAudio: "jazz",
    transition: "fade",
    letterbox: true,
    cinematic: {
      mode: "pan",
      dimAmount: 0.15,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.4,
    },
    prose: "Glass block, pink light, and a woman who owns the schedule everybody else has to keep.",
    dialogueBeats: [
      {
        id: "ns_b030a",
        characterId: "isabel",
        expression: "not getting up",
        text: "Detectives. You've come about my boats.",
      },
      {
        id: "ns_b030b",
        characterId: "sonny",
        text: "Your boats. So you know they're gone.",
      },
      {
        id: "ns_b030c",
        characterId: "isabel",
        expression: "a small correction, delivered kindly",
        text: "I know everything that leaves my marina. That's not the same as knowing where it went, and it isn't a crime either.",
      },
      {
        id: "ns_b030d",
        characterId: "rico",
        text: "Somebody cut the lines on a boat you own and you didn't call us. That's the part I keep reading twice.",
      },
      {
        id: "ns_b030e",
        characterId: "isabel",
        expression: "a closed door, politely held",
        text: "If I called you every time this city took something from me, Detective, we'd be on the phone all night. Was there anything else?",
      },
      // ── the evidence beats. Gated, so what she gives up depends entirely
      // on what you are carrying when you walk in. With nothing, you leave
      // with nothing.
      {
        id: "ns_b030f",
        characterId: "isabel",
        expression: "she reads the whole page before she answers",
        conditionRule: { requiresFlags: ["f_has_log"] },
        text: "…Oh-three-forty. Running dark. That is not a theft, Detective, that is a schedule. Somebody had my slips on a timetable.",
      },
      {
        id: "ns_b030g",
        characterId: "rico",
        conditionRule: { requiresFlags: ["f_has_log"] },
        text: "Your slips. Your signature on the mailbox. Starting to look like your timetable.",
      },
      {
        id: "ns_b030h",
        characterId: "isabel",
        expression: "the first crack in thirty years of composure",
        conditionRule: { requiresFlags: ["f_has_card"] },
        text: "That card is three years old and there is a second name on it. You have already read it or you wouldn't be standing there like that.",
      },
      {
        id: "ns_b030i",
        characterId: "isabel",
        expression: "quiet — she is choosing, and it costs",
        conditionRule: { requiresFlags: ["f_has_card", "f_has_log"] },
        text: "Try the water. Whatever's out there is still transmitting — that is how they find each other. And Detective: when you find it, I would like it on the record that I told you where to look.",
        recalls: {
          "talked to the harbormaster":
            "Dexter told you, didn't he. Thirty-one years and that man has never once mis-logged a tide. Try the water — whatever's out there is still transmitting. That is how they find each other.",
        },
      },
      {
        id: "ns_b030j",
        characterId: "isabel",
        expression: "she looks at you properly for the first time",
        conditionRule: { requiresFlags: ["f_isabel_believed"] },
        text: "Thirty years in this city and you are the second person to say that out loud. The first was my husband, and he said it the week before he died.",
      },
      {
        id: "ns_b030k",
        characterId: "isabel",
        expression: "the shutters come down",
        conditionRule: { requiresFlags: ["f_isabel_accused"] },
        text: "Then charge me. You won't, because you can't, and we both know which of those two it is. Goodnight, Detective.",
      },
    ],
    choices: [
      {
        id: "ns_c030a",
        text: "Take a boat out and find the signal.",
        targetSceneId: "ns_s060",
        attitudeTag: "Clever",
        memoryLog: "went out on the water",
        // She only gives up the water when you have BOTH the sailing and the
        // name — otherwise there is nothing to make her talk.
        gating: { requiresFlags: ["f_has_log", "f_has_card"] },
      },
      {
        id: "ns_c030b",
        text: "Squad room — put what you have on the board.",
        targetSceneId: "ns_s040",
        attitudeTag: "Neutral",
      },
      {
        id: "ns_c030d",
        text: "\"You're not running this. Somebody is running it through you.\"",
        reply: true,
        attitudeTag: "Clever",
        gating: { requiresFlags: ["f_has_card"] },
        // The whole Isabel thread in one line: say the true thing out loud and
        // she stops treating you as the other side.
        consequences: {
          setFlags: ["f_isabel_believed"],
          trustChanges: [{ characterId: "isabel", delta: 2 }],
        },
      },
      {
        id: "ns_c030e",
        text: "\"Six years of your slips. You knew exactly what was on them.\"",
        reply: true,
        attitudeTag: "Aggressive",
        consequences: {
          setFlags: ["f_isabel_accused"],
          trustChanges: [{ characterId: "isabel", delta: -2 }],
        },
      },
      {
        id: "ns_c030c",
        text: "The harbormaster logged that night. Go and ask him.",
        targetSceneId: "ns_s050",
        attitudeTag: "Neutral",
        gating: { excludesFlags: ["f_has_log"] },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 4 — THE SQUAD ROOM                                               */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s040",
    title: "4. The Squad Room",
    note: "Beat 4. Fluorescent and blinds. The procedural beat — this is where the audience gets the map.",
    background: img("p040-squadroom"),
    ambientAudio: "drone",
    transition: "fade",
    letterbox: true,
    cinematic: {
      mode: "static",
      dimAmount: 0.1,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.35,
      foregroundExtras: [
        {
          image: fx("fx-blinds"),
          x: 50,
          y: 40,
          scale: 1.4,
          opacity: 0.4,
          blendMode: "screen",
          depth: 0.9,
          anim: { preset: "breathe", intensity: 0.12, speed: 0.3 },
        },
      ],
    },
    prose: "Somebody's coffee has been on the burner since Tuesday.",
    dialogueBeats: [
      {
        id: "ns_b040a",
        characterId: "rico",
        expression: "at the corkboard",
        text: "Both hulls registered to a holding company. The holding company's registered to a mailbox in Coral Gables.",
        recalls: {
          "went to the marina first":
            "You smelled the water first, so here's the part the water doesn't tell you: both hulls are registered to a holding company, and the holding company's a mailbox in Coral Gables.",
          "went to the paperwork first":
            "Paper before pilings — good. Both hulls registered to a holding company, and the holding company's a mailbox in Coral Gables.",
        },
      },
      {
        id: "ns_b040b",
        characterId: "sonny",
        text: "And the mailbox?",
      },
      {
        id: "ns_b040c",
        characterId: "rico",
        expression: "tapping the card",
        text: "Rented by the marina office. Isabel's signature, three years old, and a second name underneath that somebody tried to scratch out.",
      },
      {
        id: "ns_b040d",
        characterId: "sonny",
        text: "So she's either running it or she's carrying it for somebody. Either way the answer's on the water tonight.",
      },
      {
        id: "ns_b040e",
        characterId: "rico",
        conditionRule: { requiresFlags: ["f_has_log"] },
        text: "Carrying it. Prine called the office at three fifty-two and a man answered who doesn't work there. You don't need a warrant to hear that, you just need to ask the one guy nobody thought to ask.",
      },
      {
        id: "ns_b040f",
        characterId: "sonny",
        conditionRule: { requiresFlags: ["f_has_log", "f_has_card"] },
        text: "Then wire it. Sailing, signature, name — if those three make a line on that board, we know where to point the antenna.",
        // Insert shot: push in on the board itself, so the thing the player is
        // about to open is on screen before they open it. backgroundHold is
        // false so the squad-room plate comes straight back afterwards.
        background: img("p080-corkboard"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 0.9,
        backgroundHold: false,
        cinematic: {
          mode: "dolly",
          dimAmount: 0.18,
          colorGrade: "tarantino-35mm",
          filmGrade: true,
          filmGradeStrength: 0.45,
        },
      },
    ],
    hotspots: [
      {
        id: "ns_h040_board",
        label: "Corkboard",
        bounds: { x: 55, y: 20, w: 30, h: 34 },
        cursor: "look",
        action: {
          type: "giveItem",
          itemGranted: "mailbox_card",
          text: "The rental card. Isabel's signature — and beneath it, scratched but legible under the lamp: MARCHETTI, G.",
          flagSet: "f_has_card",
        },
      },
      {
        id: "ns_h040_wire",
        label: "Wire it up",
        bounds: { x: 20, y: 22, w: 26, h: 30 },
        cursor: "use",
        isRepeatable: true,
        // The board is the THINK beat: the clues stop being objects you are
        // carrying and become an argument you can make out loud.
        gating: { requiresFlags: ["f_has_log", "f_has_card"] },
        action: {
          type: "openBoard",
          text: "Two pieces of paper and a length of red string.",
        },
      },
    ],
    choices: [
      {
        id: "ns_c040a",
        text: "Take a boat out and triangulate the signal.",
        targetSceneId: "ns_s060",
        attitudeTag: "Clever",
        memoryLog: "went out on the water",
        // The water costs a night. You do not spend it on a hunch — you spend
        // it once the board says WHERE.
        gating: { requiresFlags: ["f_board_wired"] },
      },
      {
        id: "ns_c040b",
        text: "Push Isabel at the club.",
        targetSceneId: "ns_s030",
        attitudeTag: "Aggressive",
      },
      {
        id: "ns_c040c",
        text: "Nobody's asked the harbormaster yet. Go and do that.",
        targetSceneId: "ns_s050",
        attitudeTag: "Neutral",
        gating: { excludesFlags: ["f_has_log"] },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 5 — THE FIX (three.js minigame)                                  */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s060",
    title: "5. The Fix",
    note: "Beat 5. THE SET PIECE. Own plate now (open water) rather than a reused marina shot — the boat has actually gone somewhere. The triangulation minigame launches from the choice below: a fix routes to the warehouse, the clock routes to the cold ending.",
    background: img("p090-openwater"),
    ambientAudio: "drone",
    transition: "fade-black",
    letterbox: true,
    cinematic: {
      mode: "dolly",
      dimAmount: 0.25,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.55,
      foregroundExtras: [
        {
          image: fx("fx-seamist"),
          x: 50,
          y: 82,
          scale: 1.5,
          opacity: 0.55,
          depth: 0.88,
          anim: { preset: "drift", intensity: 0.3, speed: 0.35 },
        },
      ],
    },
    prose: "Three listening posts around the bay and one transmitter that doesn't know it's talking.",
    dialogueBeats: [
      {
        id: "ns_b060a",
        characterId: "rico",
        expression: "headphones on, one ear",
        text: "Coast Guard's lending us three posts. Sweep the antenna, find the peak, mark the bearing. Two lines cross, three lines are a fact.",
      },
      {
        id: "ns_b060b",
        characterId: "sonny",
        text: "And if I mark it sloppy?",
      },
      {
        id: "ns_b060c",
        characterId: "rico",
        expression: "already knows the answer",
        text: "Then the lines cross somewhere in the Gulf and we spend the night looking at empty water. Take your time on the peak, Sonny.",
        // Insert: at the wheel, instruments lit — the last thing on screen
        // before the minigame takes over, so the bay you sweep is the one you
        // were just standing in.
        background: img("p150-boatcockpit"),
        backgroundTransition: "fade",
        backgroundTransitionSpeed: 1.0,
        cinematic: {
          mode: "dolly",
          dimAmount: 0.28,
          colorGrade: "tarantino-35mm",
          filmGrade: true,
          filmGradeStrength: 0.55,
        },
      },
    ],
    choices: [
      {
        id: "ns_c060_game",
        text: "📡 Sweep for the signal and call the fix.",
        targetSceneId: "ns_s070",
        timedOutTargetSceneId: "ns_end_cold",
        attitudeTag: "Clever",
        memoryLog: "made the fix on the water",
        consequences: { setFlags: ["f_made_fix"] },
        triangulate: {
          prompt: "Triangulate the transmitter",
          durationSeconds: 60,
          bearingsRequired: 3,
          bearingsAllowed: 5,
          toleranceMeters: 9,
          posts: [
            { x: -38, z: 34, label: "Post A — Dinner Key" },
            { x: 40, z: 30, label: "Post B — Rickenbacker" },
            { x: 2, z: -40, label: "Post C — Coast Guard cutter" },
          ],
          winText: "Fix confirmed",
          failText: "Signal lost",
        },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 6 — THE WAREHOUSE                                                */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s070",
    title: "6. The Warehouse",
    note: "Beat 6. The payoff. Wide, quiet, then loud. Isabel is here because she was always going to be here.",
    background: img("p050-warehouse"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.2,
    letterbox: true,
    particles: "smoke",
    cinematic: {
      mode: "dolly",
      dimAmount: 0.3,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "The lines crossed on a loading door two miles from where anybody said to look.",
    dialogueBeats: [
      {
        id: "ns_b070a",
        characterId: "sonny",
        expression: "quiet, gun down",
        text: "Both hulls. Cut lines still on the cleats.",
        recalls: {
          "went out on the water":
            "Both hulls, right where the bearings said. Cut lines still on the cleats.",
        },
      },
      {
        id: "ns_b070b",
        characterId: "isabel",
        expression: "from the dark, not running",
        text: "You found it faster than they said you would.",
        recalls: {
          "made the fix on the water": "You found it faster than they said you would. Somebody out there taught you to read a peak.",
        },
      },
      {
        id: "ns_b070c",
        characterId: "rico",
        text: "They. Give me a name and it's a conversation. Don't, and it's a charge sheet.",
      },
      {
        id: "ns_b070d",
        characterId: "isabel",
        expression: "the name costs her everything and she says it anyway",
        text: "Marchetti. My husband's brother. He's been using my slips for six years and my signature for three, and the night I said no he took the boats instead of the answer.",
      },
      {
        id: "ns_b070e",
        characterId: "sonny",
        text: "Then say it again tomorrow with a stenographer in the room.",
      },
    ],
    choices: [
      {
        id: "ns_c070a",
        text: "Bring Marchetti in. Do it by the book.",
        targetSceneId: "ns_s080",
        attitudeTag: "Clever",
        consequences: { setFlags: ["f_by_the_book"] },
      },
      {
        id: "ns_c070b",
        text: "Let her walk — and follow the boats instead.",
        targetSceneId: "ns_end_tide",
        attitudeTag: "Aggressive",
        consequences: { setFlags: ["f_let_her_walk"] },
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 7 — THE BOX                                                      */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s080",
    title: "7. The Box",
    note: "Beat 7. THE INTERROGATION. Gio's composure is 3. He tells one flat lie — that he has never been down to the marina at night — and the harbormaster's log page is the thing that breaks it. Press him and he cracks; miss and he clamps and you close on the paperwork alone.",
    background: img("p060-interrogation"),
    ambientAudio: "drone",
    transition: "fade-black",
    transitionSpeed: 1.2,
    letterbox: true,
    cinematic: {
      mode: "dolly",
      dimAmount: 0.32,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.6,
    },
    prose: "One bulb, one table, and a man who has never once had to sit on this side of it.",
    interrogation: {
      characterId: "gio",
      composure: 3,
      crackTrust: 0,
      steadySeconds: 10,
      brokeFlag: "f_gio_broke",
      clampFlag: "f_gio_clamped",
      brokeBeat: {
        id: "ns_int_broke",
        characterId: "gio",
        conditionRule: { requiresFlags: ["f_gio_broke"] },
        text: "The cigar has been out for ten minutes and he finally notices. \"Six years. Her slips, her name, her brother-in-law's smile at the Christmas party. She never took a dollar and she never asked, because asking would have meant knowing.\" He pushes the page back across the table. \"Write it down. All of it. She doesn't go down for my route.\"",
      },
      clampedBeat: {
        id: "ns_int_clamp",
        characterId: "gio",
        conditionRule: { requiresFlags: ["f_gio_clamped"] },
        text: "He leans back and the chair complains. \"You've got a boat, a page and a name on a mailbox. That's a filing error, detective. Charge me with it.\" And then nothing, for a very long time.",
      },
      brokeConsequences: { trustChanges: [{ characterId: "gio", delta: 2 }] },
      clampConsequences: { trustChanges: [{ characterId: "gio", delta: -2 }] },
    },
    dialogueBeats: [
      {
        id: "ns_b080a",
        characterId: "rico",
        expression: "sitting, unhurried",
        text: "Two hulls out of your sister-in-law's marina at oh-three-forty. Both found where you tied them.",
      },
      {
        id: "ns_b080b",
        characterId: "gio",
        expression: "expansive, enjoying himself",
        text: "Isabel's boats, Isabel's marina, Isabel's paperwork. I sell restaurant equipment. I have never been down that dock at night in my life — ask anybody.",
        // The lie. The log page is the only thing that touches it, because
        // Prine's 03:52 call log puts a man on the marina phone that night.
        lie: {
          claim: "\"I have never been down that dock at night in my life.\"",
          // The call log is the true breaker — it is the only document that
          // puts HIM on the phone. The sailing page also lands, because it is
          // the same night in the same book.
          evidenceItemIds: ["call_log", "log_page"],
          contradictedFlag: "f_gio_caught",
          composureDamage: 3,
          wrongEvidenceLimit: 2,
          caughtBeat: {
            id: "ns_b080_caught",
            characterId: "gio",
            conditionRule: { requiresFlags: ["f_gio_caught"] },
            text: "You put the page on the table and turn it round so he can read it the right way up. Oh-three-fifty-two. MARINA OFC. NO ACTION. \"…Prine wrote that down?\" It is the first sentence he has said quietly.",
          },
          wrongBeat: {
            id: "ns_b080_wrong",
            characterId: "gio",
            text: "He barely looks at it. \"That's a piece of paper with a lady's name on it. You want to arrest the mailbox?\" The cigar comes back up.",
          },
          contradictedConsequences: { trustChanges: [{ characterId: "gio", delta: -1 }] },
          wrongConsequences: { trustChanges: [{ characterId: "gio", delta: -1 }] },
          rememberLine: "Gio Marchetti was on that dock at 03:52 and the harbormaster wrote it down.",
        },
      },
      {
        id: "ns_b080c",
        characterId: "sonny",
        conditionRule: { requiresFlags: ["f_gio_caught"] },
        text: "Prine writes everything down. Thirty-one years. That's the whole job.",
      },
    ],
    choices: [
      {
        id: "ns_c080_press1",
        text: "💬 \"Six years of her slips. Say the number out loud.\" (press)",
        reply: true,
        attitudeTag: "Aggressive",
      },
      {
        id: "ns_c080_press2",
        text: "💬 \"She never asked, did she. That was the arrangement.\" (press)",
        reply: true,
        attitudeTag: "Clever",
      },
      {
        id: "ns_c080_take",
        text: "He's cracked. Take the statement to the State Attorney.",
        targetSceneId: "ns_s090",
        attitudeTag: "Clever",
        gating: { requiresFlags: ["f_gio_broke"] },
      },
      {
        id: "ns_c080_charge",
        text: "He's not talking. Charge what you can prove and go home.",
        targetSceneId: "ns_end_paper",
        attitudeTag: "Neutral",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 8 — THE STATE ATTORNEY                                           */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s090",
    title: "8. What Will Actually Stick",
    note: "Beat 8. The cold shower. A confession is not a case — Ortega decides what survives contact with a courtroom, and what she can do for Isabel depends entirely on what the player is carrying and how they treated her at the club.",
    background: img("p120-courthouse"),
    ambientAudio: "drone",
    transition: "fade",
    letterbox: true,
    cinematic: {
      mode: "pan",
      panDistance: 4,
      panDirection: "right",
      dimAmount: 0.12,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.4,
    },
    prose: "Nine in the morning and the building smells like floor polish and other people's worst days.",
    dialogueBeats: [
      {
        id: "ns_b090a",
        characterId: "ada",
        expression: "reading, not looking up",
        text: "Four hours of confession from a man whose lawyer arrived in hour two. I can hold him on the boats. The route is a different animal.",
      },
      {
        id: "ns_b090b",
        characterId: "rico",
        text: "He gave us six years of it.",
      },
      {
        id: "ns_b090c",
        characterId: "ada",
        expression: "the professional kindness of someone about to say no",
        text: "He gave you six years of a story. What I take into a room is documents. Show me paper that puts him somewhere he swore he never was, and I have a case. Otherwise I have a man who talked too much on a bad night.",
      },
      {
        id: "ns_b090d",
        characterId: "ada",
        expression: "she puts the glasses on — this is the part she likes",
        conditionRule: { requiresFlags: ["f_has_calllog"] },
        text: "…Oh-three-fifty-two, marina office, no action, in the harbormaster's own hand, logged the night of. That is not a story. That is a witness with a book. Now I have a case.",
      },
      {
        id: "ns_b090e",
        characterId: "ada",
        expression: "and this is the part she doesn't",
        conditionRule: { excludesFlags: ["f_has_calllog"] },
        text: "Bring me the harbormaster's own record or bring me nothing. Right now his lawyer walks in and says a frightened man agreed with two tired detectives, and twelve people believe him.",
      },
    ],
    choices: [
      {
        id: "ns_c090a",
        text: "\"Prine wrote it down. It's in the file.\" — close it properly.",
        targetSceneId: "ns_s100",
        attitudeTag: "Clever",
        gating: { requiresFlags: ["f_has_calllog"] },
        consequences: { setFlags: ["f_case_stands"] },
      },
      {
        id: "ns_c090b",
        text: "Take what's on the table and close on the boats alone.",
        targetSceneId: "ns_end_paper",
        attitudeTag: "Neutral",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* 9 — THE ROOF                                                     */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_s100",
    title: "9. The Roof",
    note: "Beat 9. The last scene is not the arrest, it's this. What Isabel says depends on whether the player believed her at the club — the trust thread finally pays. Both routes reach the gold ending; only the temperature differs.",
    background: img("p140-rooftop"),
    ambientAudio: "jazz",
    transition: "fade-black",
    transitionSpeed: 1.3,
    letterbox: true,
    cinematic: {
      mode: "dolly",
      dimAmount: 0.16,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.45,
      foregroundExtras: [
        {
          image: fx("fx-neonglow"),
          x: 50,
          y: 60,
          scale: 1.6,
          opacity: 0.35,
          blendMode: "screen",
          depth: 0.92,
          anim: { preset: "breathe", intensity: 0.18, speed: 0.35 },
        },
      ],
    },
    prose: "Two chairs, two glasses, and a city that has been lit like this the whole time.",
    dialogueBeats: [
      {
        id: "ns_b100a",
        characterId: "isabel",
        expression: "she poured before you got here",
        text: "They struck the company off my name this morning. Thirty-one minutes, one clerk, no apology.",
      },
      {
        id: "ns_b100b",
        characterId: "isabel",
        expression: "warm — you were the one who said it first",
        conditionRule: { requiresFlags: ["f_isabel_believed"] },
        text: "You said it in my own club before you could prove it. Do you know what that is worth, to be the second person in thirty years? Sit down, Detective. The glass is for you.",
      },
      {
        id: "ns_b100c",
        characterId: "isabel",
        expression: "civil, and nothing more",
        conditionRule: { requiresFlags: ["f_isabel_accused"] },
        text: "You thought it was me. For two days you were certain, and you were wrong, and you got there anyway. I'm not going to thank you for the second part.",
      },
      {
        id: "ns_b100d",
        characterId: "sonny",
        text: "He kept saying it. Twice, unprompted — she never took a dollar and never asked.",
      },
      {
        id: "ns_b100e",
        characterId: "isabel",
        expression: "the truest line she has",
        text: "Never asked. That was the arrangement, and I made it every single day for six years by not saying one sentence out loud. Don't put that in your file. Just know that I know it.",
      },
    ],
    choices: [
      {
        id: "ns_c100a",
        text: "Take the glass. Watch the sun come up on somebody else's city.",
        targetSceneId: "ns_end_book",
        attitudeTag: "Clever",
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* ENDINGS                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: "ns_end_book",
    title: "Ending — By The Book",
    isEnding: true,
    endingData: {
      tier: "victory-gold",
      headline: "BY THE BOOK",
      recap:
        "Gio Marchetti talked for four hours and signed every page. Six years of her slips, her signature and her Christmas-party smile — and the one line he insisted on, twice, was that she never took a dollar and never asked. Isabel got the holding company struck off her name by Friday. The boats went back in the water the week after.",
    },
    background: img("p100-penthouse"),
    ambientAudio: "jazz",
    transition: "fade-black",
    letterbox: true,
    prose:
      "He signed every page in a hand that didn't shake once. Rico filed it before lunch, which for Rico is a kind of poem.",
    choices: [],
  },
  {
    id: "ns_end_tide",
    title: "Ending — What The Tide Owes",
    isEnding: true,
    endingData: {
      tier: "victory-silver",
      headline: "WHAT THE TIDE OWES",
      recap:
        "You let her walk and put a man on the boats instead. Six weeks later the whole route came apart at once — Marchetti, the mailbox, two harbormasters and a customs clerk. Isabel's name is on none of it, which was the price, and you knew that when you paid it.",
    },
    background: img("p130-emptyoffice"),
    ambientAudio: "jazz",
    transition: "fade-black",
    letterbox: true,
    prose: "She walked out past the crates and didn't look back, which is how you knew she'd expected to.",
    choices: [],
  },
  {
    id: "ns_end_paper",
    title: "Ending — A Filing Error",
    isEnding: true,
    endingData: {
      tier: "victory-silver",
      headline: "A FILING ERROR",
      recap:
        "Gio Marchetti never said a word. You charged him on the registration, the mailbox and a torn page from a harbormaster's log, and it stuck — eighteen months and a fine he paid in cash. Isabel's name stayed on the holding company, because he never took it off, and she has been answering for it ever since.",
    },
    background: img("p060-interrogation"),
    ambientAudio: "drone",
    transition: "fade-black",
    letterbox: true,
    prose:
      "He signed for his own property at the desk on the way out, and took the cigar with him.",
    choices: [],
  },
  {
    id: "ns_end_cold",
    title: "Ending — Empty Water",
    isEnding: true,
    endingData: {
      tier: "gameover",
      headline: "EMPTY WATER",
      recap:
        "The bearings crossed somewhere off Fowey Rocks and you spent the night looking at it. By dawn the boats were gone, the transmitter was silent, and the marina office had a new signature on the mailbox card.",
    },
    background: img("p110-dawn"),
    ambientAudio: "drone",
    transition: "fade-black",
    letterbox: true,
    cinematic: {
      mode: "static",
      dimAmount: 0.22,
      colorGrade: "tarantino-35mm",
      filmGrade: true,
      filmGradeStrength: 0.5,
      foregroundExtras: [
        {
          image: fx("fx-rain"),
          x: 50,
          y: 50,
          scale: 1.6,
          opacity: 0.4,
          blendMode: "screen",
          depth: 0.95,
          anim: { preset: "drift", intensity: 0.4, speed: 1.4 },
        },
      ],
    },
    prose:
      "Rico took the headphones off at four and didn't say anything, which was worse than if he had.",
    choices: [],
  },
];

export const NEON_SALT: Story = {
  id: "neon-salt",
  title: "Neon Salt",
  tagline: "Miami, 1986 — the tide brings everything back.",
  coverImage: img("cover"),
  startSceneId: "ns_s000",
  scenes: SCENES,
  characters: NEON_SALT_CHARACTERS,
  items: [
    {
      id: "log_page",
      name: "Harbormaster's Log",
      icon: "📋",
      isClue: true,
      iconUrl: item("logpage"),
      description: "Eleven out, nine back — and a 03:40 entry with no call sign, written in different ink.",
      flavorText: "The ink is the tell. Somebody added that line after the fact.",
    },
    {
      id: "mailbox_card",
      name: "Mailbox Rental Card",
      icon: "🗂",
      isClue: true,
      iconUrl: item("mailboxcard"),
      description: "Isabel's signature, three years old. A second name scratched out beneath it: MARCHETTI, G.",
      flavorText: "You can scratch out a name. You can't scratch out the indentation it left.",
    },
    {
      id: "call_log",
      name: "VHF Call Log",
      icon: "📻",
      isClue: true,
      iconUrl: item("calllog"),
      description:
        "Dexter Prine's own log, taped to the radio housing. 03:52 — MARINA OFC — NO ACTION, underlined twice.",
      flavorText: "He called it in. Somebody who doesn't work there told him to go back to sleep.",
    },
  ],
  briefing: {
    objective:
      "Two boats left Isabel Reyes-Marchetti's marina at 03:40 and never came back. Find where they went — and who signed for them.",
    winConditions: [
      "Make the fix on the water and follow it to the warehouse.",
      "Get a name on the record — or get the route, and let the name go.",
    ],
    loseConditions: ["Call a sloppy bearing and lose the signal before dawn."],
  },
  deduction: {
    suspectIds: ["isabel", "gio", "dexter"],
    connections: [
      {
        a: "log_page",
        b: "gio",
        flagSet: "f_link_sailing",
        revelation:
          "Oh-three-forty, running dark, no call sign — and the man who answered the marina phone four minutes later telling the harbormaster it was authorized. Gio Marchetti put those boats to sea.",
      },
      {
        a: "mailbox_card",
        b: "gio",
        flagSet: "f_link_signature",
        revelation:
          "Her signature on top, his name scratched out underneath. Three years of a holding company that exists to keep his hands clean and her name on the paperwork.",
      },
      {
        a: "log_page",
        b: "isabel",
        flagSet: "f_board_wired",
        revelation:
          "She was not on the dock at four in the morning — Prine is certain, and Prine has never mis-logged a tide. She is not running this. She is being used as an address.",
      },
    ],
  },
  flagNotes: {
    f_has_log: "Holds the harbormaster's log page with the unlogged 03:40 sailing.",
    f_has_card: "Holds the mailbox rental card with Marchetti's scratched-out name.",
    f_made_fix: "Triangulated the transmitter on the water — earned the warehouse.",
    f_link_sailing: "Corkboard: the 03:40 sailing wired to Gio Marchetti.",
    f_link_signature: "Corkboard: the scratched-out signature wired to Gio Marchetti.",
    f_board_wired: "Corkboard: worked out Isabel is the address, not the operator — unlocks the water.",
    f_gio_broke: "Gio cracked in the box and gave up the route.",
    f_gio_clamped: "Gio shut down in the box and said nothing.",
    f_has_calllog: "Holds Prine's VHF call log — the 03:52 call that breaks Gio's alibi.",
    f_isabel_believed: "Told Isabel she was being used, before it could be proved. She remembers.",
    f_isabel_accused: "Accused Isabel of running it. She remembers that too.",
    f_case_stands: "The State Attorney has a case that survives a courtroom, not just a confession.",
    f_gio_caught: "Broke Gio's 'never been down that dock' alibi with the paperwork.",
    f_by_the_book: "Took Isabel's statement properly.",
    f_let_her_walk: "Let Isabel go to get the whole route instead.",
  },
};
