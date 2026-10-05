import type { SpriteSheet } from "../game/spriteSheet";
import type { DialogueBeat, SceneNode, StageSettings, Story } from "../types";

/* ------------------------------------------------------------------ *
 *  FATHER TED: THE CRAGGY CHALICE
 *
 *  A 🚶 walking-stage comedy adventure set on the island of Craggy
 *  (a loving, entirely unofficial fan homage). Bishop Brennan is five
 *  minutes away to present the parish with the golden "Island Parish of
 *  the Year" cup — and, as ever, nothing is where it should be.
 *
 *  You play Father Ted, walking the parochial house (procedural-bob
 *  walker: a single transparent sprite the engine bobs while he moves).
 *  Dougal has tidied the historic gold chalice into a biscuit tin "for
 *  safekeeping", Mrs Doyle has brewed a cup that could strip paint, and
 *  Father Jack is parked in the front hall refusing to budge. Talk,
 *  pick things up, and USE the right item on the right thing before the
 *  Bishop rings the bell.
 *
 *  Art: public/assets/fatherted/  (paper-cut cartoon; sheets keyed from
 *  magenta plates by scripts/make-sprite-sheet.mjs)
 * ------------------------------------------------------------------ */

const A = "/assets/fatherted";

/* ---------- talking portrait sheets (mouth-cycle animations) --------- */
const talkSheet = (name: string, fw: number, fh: number): SpriteSheet => ({
  image: `${A}/${name}.png`,
  frameWidth: fw,
  frameHeight: fh,
  animations: { rest: { frames: [0] }, talk: { frames: [0, 1, 2, 1], fps: 7 } },
  pixelated: false,
});

const TED_TALK = talkSheet("ted-talk", 381, 360);
const DOUGAL_TALK = talkSheet("dougal-talk", 304, 360);
const DOYLE_TALK = talkSheet("mrsdoyle-talk", 346, 360);
const JACK_TALK = talkSheet("jack-talk", 367, 360);
const BISHOP_TALK = talkSheet("bishop-talk", 338, 360);

/* ---------- full-body NPC sprites (idle single-frame sheets) ---------
 * Pass-2 plates keyed by make-sprite-sheet --frames 1. Frame sizes are
 * finalised there (trimmed to content, then uniform height); the values
 * below are the post-key target. */
const npcIdle = (name: string, fw: number, fh: number): SpriteSheet => ({
  image: `${A}/${name}.png`,
  frameWidth: fw,
  frameHeight: fh,
  animations: { idle: { frames: [0] }, walk: { frames: [0] } },
  pixelated: false,
});
const DOUGAL_BODY = npcIdle("npc-dougal", 110, 360);
const DOYLE_BODY = npcIdle("npc-mrsdoyle", 179, 360);
const JACK_BODY = npcIdle("npc-jack", 182, 360);

/* ---------- shared stage tuning ------------------------------------- */
const floor: StageSettings = {
  keyboard: true,
  speed: 22,
  reach: 5,
  floor: { top: 56, bottom: 94 },
  depthScale: 0.3,
  playerScale: 1.05,
  hints: "proximity",
  verbCoin: true,
  sentenceLine: true,
  objectVerbMenu: true,
};

const stageRoom = (
  id: string,
  title: string,
  bg: string,
  extra: Partial<SceneNode>
): SceneNode => ({
  id: `ft_${id}`,
  title,
  nodeType: "stage",
  background: `${A}/${bg}`,
  prose: "",
  dialogueBeats: [],
  hotspots: [],
  choices: [],
  cinematic: { mode: "static" },
  particles: "none",
  transition: "fade",
  transitionSpeed: 0.3,
  stage: { ...floor, playerImage: `${A}/ted-idle.png` },
  ...extra,
});

const beat = (scene: string, n: number, characterId: string, text: string): DialogueBeat => ({
  id: `ft_${scene}_${n}`,
  characterId,
  text,
});

export const FATHER_TED: Story = {
  id: "father-ted-craggy",
  title: "Father Ted: The Craggy Chalice",
  tagline:
    "Bishop Brennan is five minutes away, the parish gold is in a biscuit tin, and tea will be offered. Careful now.",
  gameKind: "adventure",
  coverImage: `${A}/cover.jpg`,
  startSceneId: "ft_sitting",

  briefing: {
    gameInfo:
      "An affectionate, unofficial walking-stage fan comedy. Play Father Ted and sort out the parochial house before Bishop Brennan arrives with the golden Parish of the Year cup.",
    objective:
      "Recover the Craggy Chalice, arm yourself with Mrs Doyle's famous tea, and get past Father Jack before the Bishop rings the bell.",
    winConditions: [
      "Find the gold chalice (Dougal 'safely' tidied it into the kitchen biscuit tin).",
      "Take a cup of Mrs Doyle's tea — and keep one for the road.",
      "Use the tea to coax Father Jack out of the front hall.",
      "Greet the Bishop with the chalice (or charm him with tea).",
    ],
    loseConditions: [
      "Let the Bishop arrive to find no chalice and an empty house.",
    ],
  },

  flagNotes: {
    ft_dougal: "Dougal admitted he tidied the chalice into the kitchen biscuit tin.",
    ft_jack_moved: "Father Jack has shuffled off toward the kitchen for a refill.",
  },

  layout: {
    ft_sitting: { x: 40, y: 160 },
    ft_kitchen: { x: 420, y: 60 },
    ft_hall: { x: 420, y: 300 },
    ft_road: { x: 820, y: 160 },
    ft_end_gold: { x: 1160, y: 60 },
    ft_end_silver: { x: 1160, y: 200 },
    ft_end_fail: { x: 1160, y: 340 },
  },

  dialogueBox: {
    hudTheme: "sepia-pulp",
    headingFont: "poster",
    bodyFont: "type",
    accentColor: "#3f8f4f",
  },

  characters: [
    { id: "c_ted", name: "Father Ted", role: "You — parish priest, mostly in control", avatarUrl: "emoji:🧔‍♂️", trustMeter: 0, talkingSheet: TED_TALK, talkingX: 24, talkingY: 0, talkingScale: 0.62 },
    { id: "c_dougal", name: "Dougal", role: "Young priest, sheriff of the sitting room", avatarUrl: "emoji:🤠", trustMeter: 0, talkingSheet: DOUGAL_TALK, talkingX: 66, talkingY: 0, talkingScale: 0.6 },
    { id: "c_doyle", name: "Mrs Doyle", role: "Housekeeper, tea lobbyist", avatarUrl: "emoji:☕", trustMeter: 0, talkingSheet: DOYLE_TALK, talkingX: 68, talkingY: 0, talkingScale: 0.62 },
    { id: "c_jack", name: "Father Jack", role: "Retired. In the way.", avatarUrl: "emoji:🥃", trustMeter: 0, talkingSheet: JACK_TALK, talkingX: 64, talkingY: 0, talkingScale: 0.6 },
    { id: "c_bishop", name: "Bishop Brennan", role: "Arriving shortly, already disappointed", avatarUrl: "emoji:⛪", trustMeter: 0, talkingSheet: BISHOP_TALK, talkingX: 30, talkingY: 0, talkingScale: 0.62 },
  ],

  items: [
    {
      id: "it_chalice",
      name: "The Craggy Chalice",
      icon: "🏆",
      description: "The historic gold parish cup. Worth of an award, currently entombed in custard creams.",
      flavorText: "Solid, gold-coloured, and the only thing on the island Bishop Brennan has ever approved of.",
      isClue: true,
    },
    {
      id: "it_tea",
      name: "Mrs Doyle's Tea",
      icon: "🍵",
      description: "One of Mrs Doyle's cups. It can strip paint, straighten hair and (famously) move a retired priest.",
      flavorText: "Go on, go on, go on, go on.",
    },
  ],

  scenes: [
    /* ───────────────────────── SITTING ROOM ───────────────────────── */
    stageRoom(
      "sitting",
      "The Sitting Room",
      "bg-sitting.jpg",
      {
        stage: {
          ...floor,
          playerImage: `${A}/ted-idle.png`,
          spawn: { x: 42, y: 88 },
          enterCaption: "Bishop Brennan is due in — deep breath — and Dougal is standing very, very still over by the mantelpiece, which is never a good sign.",
          npcs: [
            {
              id: "npc_dougal",
              sheet: DOUGAL_BODY,
              x: 72,
              y: 90,
              scale: 1.0,
              facing: "left",
              talkHotspotId: "ft_sitting_dougal",
            },
          ],
        },
        dialogueBeats: [
          beat("sitting", 1, "c_dougal", "Ted! Good. Right. You're here. And before you say anything — the chalice is fine. It's safe. I've put it somewhere nobody would ever think to look."),
          beat("sitting", 2, "c_ted", "Dougal. The chalice is a gold religious artefact. Where, exactly, is 'nobody would ever think to look'?"),
          beat("sitting", 3, "c_dougal", "The biscuit tin. In the kitchen. Because — and hear me out — nobody steals biscuits, Ted. Biscuits are sacred."),
          beat("sitting", 4, "c_ted", "…and the Bishop? He's going to open the biscuit tin looking for biscuits, Dougal, and find the gold cup next to the custard creams."),
          beat("sitting", 5, "c_dougal", "See, that's the genius of it. If he finds it by accident, it looks like we keep the cup somewhere humble. Humble is what wins Parish of the Year, Ted. I've read brochures."),
        ],
        hotspots: [
          {
            id: "ft_sitting_dougal",
            label: "Dougal, sheriff of the sitting room",
            bounds: { x: 62, y: 40, w: 24, h: 42 },
            cursor: "talk",
            isRepeatable: false,
            action: { type: "startDialogue", flagSet: "ft_dougal" },
          },
          {
            id: "ft_sitting_reliquary",
            label: "The empty reliquary",
            bounds: { x: 26, y: 34, w: 14, h: 16 },
            cursor: "look",
            isRepeatable: true,
            action: { type: "showText", text: "The velvet stand where the Craggy Chalice is meant to live. It holds a small explanatory card instead, in Dougal's handwriting: 'RELOCATED FOR SAFETY. ASK NO FURTHER QUESTIONS.'" },
          },
          {
            id: "ft_sitting_bishop_photo",
            label: "Framed photograph of the Bishop",
            bounds: { x: 46, y: 20, w: 12, h: 16 },
            cursor: "look",
            isRepeatable: true,
            action: { type: "showText", text: "Bishop Brennan, mid-inauguration, already looking personally let down by something in the future." },
          },
          {
            id: "ft_sitting_tele",
            label: "The television",
            bounds: { x: 76, y: 44, w: 16, h: 18 },
            cursor: "look",
            isRepeatable: true,
            verbs: { kick: { type: "showText", text: "You give the telly a gentle, priestly kick. It does not improve the situation, and now Dougal has 'seen you do a violence.'" } },
            action: { type: "showText", text: "Dougal has taped a note to it: 'Do NOT put chalice in telly.' Encouraging, if you squint." },
          },
          {
            id: "ft_sitting_kitchen_door",
            label: "Door to the kitchen",
            bounds: { x: 2, y: 30, w: 10, h: 40 },
            cursor: "go",
            isRepeatable: true,
            action: { type: "goToScene", targetSceneId: "ft_kitchen" },
          },
        ],
      }
    ),

    /* ────────────────────────── KITCHEN ──────────────────────────── */
    stageRoom(
      "kitchen",
      "The Kitchen",
      "bg-kitchen.jpg",
      {
        stage: {
          ...floor,
          playerImage: `${A}/ted-idle.png`,
          spawn: { x: 20, y: 88 },
          enterCaption: "Mrs Doyle is already pouring. Somewhere behind her, a biscuit tin hums with misplaced holiness.",
          npcs: [
            {
              id: "npc_doyle",
              sheet: DOYLE_BODY,
              x: 48,
              y: 92,
              scale: 1.0,
              facing: "right",
              talkHotspotId: "ft_kitchen_doyle",
            },
          ],
        },
        dialogueBeats: [
          beat("kitchen", 1, "c_doyle", "Father! You look peaky. Sit down there and I'll wet you a cup. You'll have one. Go on."),
          beat("kitchen", 2, "c_ted", "I'm grand, Mrs Doyle, honestly — I just need the biscuit tin. It's for—"),
          beat("kitchen", 3, "c_doyle", "The biscuit tin is for biscuits, Father. That's what the word biscuit tin means. Now — tea."),
          beat("kitchen", 4, "c_ted", "…I'll take a small one. If it gets me to the tin."),
        ],
        hotspots: [
          {
            id: "ft_kitchen_doyle",
            label: "Mrs Doyle, pouring",
            bounds: { x: 40, y: 34, w: 26, h: 44 },
            cursor: "talk",
            isRepeatable: true,
            action: { type: "startDialogue" },
          },
          {
            id: "ft_kitchen_tea",
            label: "The tea tray",
            bounds: { x: 24, y: 52, w: 14, h: 16 },
            cursor: "take",
            isRepeatable: false,
            showItemImage: true,
            action: { type: "giveItem", itemGranted: "it_tea" },
          },
          {
            id: "ft_kitchen_tin",
            label: "The biscuit tin",
            bounds: { x: 60, y: 44, w: 16, h: 16 },
            cursor: "use",
            acceptsItems: ["it_tea"],
            isRepeatable: false,
            itemResponses: { it_tea: "You rest the cup of tea on the tin lid. Mrs Doyle gasps and lunges to rescue it, and in the kerfuffle you lift the lid — and there, wedged between the custard creams and the shortbread, is the Craggy Chalice." },
            verbs: {
              look: { type: "showText", text: "A reassuringly dented biscuit tin. From inside comes the faint, offended clink of solid gold against a penguin biscuit." },
              use: {
                type: "giveItem",
                itemGranted: "it_chalice",
                text: "Chalice recovered. Mrs Doyle, mid-rescue of her cup, has not noticed. You feel almost guilty. Almost.",
              },
            },
            gating: { requiresFlags: ["ft_dougal"], requiresAll: true },
            action: { type: "showText", text: "The tin is shut tight. Dougal's note on the side reads: 'HUMBLE PLACE. CUSTARD CREAMS ON TOP.' You'll need both hands and a distraction." },
          },
          {
            id: "ft_kitchen_lourdes",
            label: "A bottle on the windowsill",
            bounds: { x: 82, y: 30, w: 12, h: 16 },
            cursor: "look",
            isRepeatable: true,
            action: { type: "showText", text: "A bottle labelled, in Mrs Doyle's hopeful hand, 'WATER FROM LOURDES.' Father Jack has written underneath in biro: 'NEEDS SOMETHING IN IT.'" },
          },
          {
            id: "ft_kitchen_sitting_door",
            label: "Door back to the sitting room",
            bounds: { x: 2, y: 30, w: 10, h: 40 },
            cursor: "go",
            isRepeatable: true,
            action: { type: "goToScene", targetSceneId: "ft_sitting" },
          },
          {
            id: "ft_kitchen_hall_door",
            label: "Door to the front hall",
            bounds: { x: 90, y: 30, w: 9, h: 42 },
            cursor: "go",
            isRepeatable: true,
            action: { type: "goToScene", targetSceneId: "ft_hall" },
          },
        ],
      }
    ),

    /* ────────────────────────── FRONT HALL ───────────────────────── */
    stageRoom(
      "hall",
      "The Front Hall",
      "bg-hall.jpg",
      {
        stage: {
          ...floor,
          playerImage: `${A}/ted-idle.png`,
          spawn: { x: 72, y: 88 },
          enterCaption: "Father Jack is wedged in his armchair in the middle of the hall, directly between you and the front door, at the exact centre of the only route the Bishop can take.",
          npcs: [
            {
              id: "npc_jack",
              sheet: JACK_BODY,
              x: 52,
              y: 90,
              scale: 1.0,
              facing: "right",
              talkHotspotId: "ft_hall_jack",
            },
          ],
        },
        dialogueBeats: [
          beat("hall", 1, "c_jack", "FEED ME! …FEED ME!"),
          beat("hall", 2, "c_ted", "Jack, the Bishop is coming to present the cup. You can't sit in the middle of the hall."),
          beat("hall", 3, "c_jack", "DRINK! DRINK! DRINK!"),
          beat("hall", 4, "c_dougal", "He'll only move for a drink, Ted. It's the only currency he respects. We tried offering him Jesus once. He said he'd already got one of those and it was rubbish."),
        ],
        hotspots: [
          {
            id: "ft_hall_jack",
            label: "Father Jack, immovable",
            bounds: { x: 44, y: 40, w: 24, h: 40 },
            cursor: "talk",
            isRepeatable: true,
            acceptsItems: ["it_tea"],
            itemResponses: { it_tea: "You hand Father Jack the cup. He sniffs it, drains it in one go, and his eyes go wide with something approaching respect. 'That's the stuff,' he declares, and — miracle of miracles — he shuffles off toward the kitchen." },
            verbs: {
              look: { type: "showText", text: "Father Jack. Retired, resting, and physically occupying the one square foot of floor you need." },
              use: { type: "showText", text: "The tea does the trick — Jack's off to the kitchen for a refill, and the front hall is yours.", flagSet: "ft_jack_moved" },
            },
            action: { type: "startDialogue" },
          },
          {
            id: "ft_hall_clock",
            label: "The grandfather clock",
            bounds: { x: 12, y: 26, w: 10, h: 30 },
            cursor: "look",
            isRepeatable: true,
            action: { type: "showText", text: "It says the Bishop is officially 'late' now, which on Craggy Island means he is approximately ninety seconds from the door." },
          },
          {
            id: "ft_hall_kitchen_door",
            label: "Door back to the kitchen",
            bounds: { x: 2, y: 30, w: 9, h: 42 },
            cursor: "go",
            isRepeatable: true,
            action: { type: "goToScene", targetSceneId: "ft_kitchen" },
          },
          {
            id: "ft_hall_front_door",
            label: "The front door",
            bounds: { x: 90, y: 22, w: 9, h: 50 },
            cursor: "go",
            isRepeatable: true,
            gating: { requiresFlags: ["ft_jack_moved"], requiresAll: true },
            wrongVerbText: "You can't get to the front door — Father Jack is still parked right in the way, and he's begun humming 'Faith of Our Fathers' to annoy you.",
            action: { type: "goToScene", targetSceneId: "ft_road" },
          },
        ],
      }
    ),

    /* ────────────────────── OUTSIDE · THE BISHOP ─────────────────── */
    {
      id: "ft_road",
      title: "The Bishop Arrives",
      background: `${A}/bg-road.jpg`,
      prose:
        "You make it to the gravel out front just as the Bishop's black car draws up, all the way from the mainland to hand over the golden cup that means the whole island can finally lord it over the mainland parish. Bishop Brennan steps out into the wind, already frowning at a sheep.",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 40%", zoomDuration: 14 },
      dialogueBeats: [
        beat("road", 1, "c_bishop", "Crilly. I have driven four hours across the island, against the wind, to present this parish with a cup it does not deserve and will not keep clean. Where is the relic we are honouring?"),
        beat("road", 2, "c_bishop", "I was told there would be a historic chalice on display. And tea. Is there tea? I have been promised tea for the entire crossing."),
      ],
      hotspots: [],
      choices: [
        {
          id: "ft_road_chalice",
          text: "Present the Craggy Chalice — recovered, humble, and gleaming.",
          targetSceneId: "ft_end_gold",
          attitudeTag: "Clever",
          presentItem: "it_chalice",
          gating: { requiresItems: ["it_chalice"] },
        },
        {
          id: "ft_road_tea",
          text: "Greet him with Mrs Doyle's tea and hope the cup is forgotten.",
          targetSceneId: "ft_end_silver",
          attitudeTag: "Neutral",
          presentItem: "it_tea",
          gating: { requiresItems: ["it_tea"] },
        },
        {
          id: "ft_road_hide",
          text: "Dive behind the hedge and pretend the whole parish is out.",
          targetSceneId: "ft_end_fail",
          attitudeTag: "Aggressive",
        },
      ],
    },

    /* ────────────────────────── ENDINGS ──────────────────────────── */
    {
      id: "ft_end_gold",
      title: "Parish of the Year",
      isEnding: true,
      background: `${A}/bg-road.jpg`,
      prose:
        "You present the Craggy Chalice with both hands and a beatific smile. Bishop Brennan inspects it, finds the tiniest smudge, wipes it on his sleeve — and then, grudgingly, hands over the golden cup of Island Parish of the Year. Dougal appears with the biscuit tin 'for the celebration,' Mrs Doyle has somehow produced a tray of a hundred cups, and even Father Jack has wandered out to stand in the photo. 'Well,' the Bishop concedes, 'it's more than the mainland lot manage.'",
      dialogueBeats: [
        beat("end_gold", 1, "c_ted", "To the Craggy Chalice — which was, this morning, in a biscuit tin."),
        beat("end_gold", 2, "c_dougal", "Humble, Ted. I told you. Humble wins."),
      ],
      endingData: {
        tier: "victory-gold",
        headline: "PARISH OF THE YEAR",
        recap:
          "The chalice is on display, the cup is yours, and the whole island is insufferable about it. Gold.",
      },
    },
    {
      id: "ft_end_silver",
      title: "The Tea Did It",
      isEnding: true,
      background: `${A}/bg-road.jpg`,
      prose:
        "There is, in the end, no chalice to present — but there is tea. Bishop Brennan takes the cup, drinks, and goes very still. 'Crilly,' he says quietly, 'who made this?' By the time Mrs Doyle is introduced the cup is forgotten entirely, the Bishop is on his third, and the parish 'wins' by the simple exhaustion of the adjudicator. It is not Parish of the Year, but nobody mentions the missing relic, which on this island is close enough to a win.",
      dialogueBeats: [
        beat("end_silver", 1, "c_bishop", "This tea could convert a county. Where is the woman who made this?"),
        beat("end_silver", 2, "c_ted", "Coming, Your Grace. Go on, Mrs Doyle."),
      ],
      endingData: {
        tier: "victory-silver",
        headline: "THE TEA DID IT",
        recap:
          "The relic stayed in the biscuit tin, but the Bishop was charmed by the tea. Nobody checks the tin. Silver.",
      },
    },
    {
      id: "ft_end_fail",
      title: "The Empty House",
      isEnding: true,
      background: `${A}/bg-road.jpg`,
      prose:
        "Bishop Brennan stands alone on the gravel, cup in hand, facing a hedge behind which, he suspects, a full parish is hiding. He rings the bell. He knocks. He waits. Finally he sets the cup down on the step with a note: 'Come to the mainland when you're ready to be a parish again.' The wind takes the note. Somewhere inside, Father Jack begins shouting for the drink again.",
      dialogueBeats: [
        beat("end_fail", 1, "c_ted", "…I think that went all right, considering."),
        beat("end_fail", 2, "c_dougal", "He left the cup, though. That's basically a participation certificate."),
      ],
      endingData: {
        tier: "gameover",
        headline: "THE EMPTY HOUSE",
        recap:
          "You hid. The Bishop hid the cup on the doorstep and drove off. The island is, briefly, the least awarded parish in Ireland.",
      },
    },
  ],
};
