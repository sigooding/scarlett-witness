import type { Story } from "../types";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * SOUTH PARK: THE RECESS WARS — beta build.
 *
 * A pure 🚶 walkable-stage game (no prose scenes outside the two ending
 * cards): AI-generated paper-cut backgrounds and sprite sheets, the VERB
 * MENU on in every room, NPCs with patrol routes, one USE-item puzzle, a
 * room-entry cutscene at the pond, and language as wholesome as the real
 * fourth grade's. Assets live in /assets/southpark/ (generated + keyed by
 * scripts/southpark-prep.mjs).
 *
 * PASS-1 ASSET SET (10/10). A second pass (talking sheets, title card,
 * cafe + playground rooms, officer Barbrady, props) lands next; the data
 * below only uses what exists on disk.
 *
 * Sheets: every character is ONE sheet image — a frame grid with named
 * "walk" / "idle" animations. Cartman's mood grid (2x2: arms crossed,
 * point-smug, laugh) is drawn ON his pond marker as object art.
 */

/** Stan — the walker. ONE merged sheet (scripts/southpark-prep.mjs packs
 *  three strips into a uniform 14-frame grid): side walk 0-5, BACK walk
 *  6-11 ("walk-up" — walking away reads correctly instead of a mirrored
 *  profile), front idle blink 12-13. Left is the side sprite mirrored;
 *  walk-toward falls back to the side walk (the classic look). */
const SP_STAN_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-stan-all.png",
  frameWidth: 126,
  frameHeight: 222,
  animations: {
    idle: { frames: [12, 13], fps: 1.2 },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 8 },
    "walk-up": { frames: [6, 7, 8, 9, 10, 11], fps: 8 },
  },
};

/** Cartman — the waddle, merged: side walk 0-5, back waddle 6-11. */
const SP_CARTMAN_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-cartman-all.png",
  frameWidth: 176,
  frameHeight: 179,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 7 },
    "walk-up": { frames: [6, 7, 8, 9, 10, 11], fps: 7 },
  },
};

/** Kyle — merged: side walk 0-5, back walk 6-11. */
const SP_KYLE_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-kyle-all.png",
  frameWidth: 176,
  frameHeight: 238,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 8 },
    "walk-up": { frames: [6, 7, 8, 9, 10, 11], fps: 8 },
  },
};

/** Kenny — the burrito, merged: side walk 0-5, back walk 6-11. */
const SP_KENNY_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-kenny-all.png",
  frameWidth: 150,
  frameHeight: 210,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 8 },
    "walk-up": { frames: [6, 7, 8, 9, 10, 11], fps: 8 },
  },
};

/** Cartman's MOODS — 2x2: (0,1) arms-crossed angry, (2) point-smug, (3) laugh.
 *  Drawn on his pond confrontation marker so the object itself is Cartman. */
const SP_CARTMAN_MOODS: SpriteSheet = {
  image: "assets/southpark/sp-cartman-moods.png",
  frameWidth: 247,
  frameHeight: 290,
  animations: {
    angry: { frames: [0, 1], fps: 1.5 },
    smug: { frames: [2] },
    laugh: { frames: [3] },
  },
};



/** A TALKING sheet — waist-up front-view mouth cycle ("talk"), standing
 *  first frame ("rest"). While a character speaks a beat, the engine cycles
 *  "talk" (fallbacks rest/idle); everyone else holds "rest". */
const talkSheet = (image: string, frameWidth: number, frameHeight: number): SpriteSheet => ({
  image,
  frameWidth,
  frameHeight,
  animations: {
    talk: { frames: [0, 1, 2, 3], fps: 7 },
    rest: { frames: [0] },
  },
});

const SP_STAN_TALK = talkSheet("assets/southpark/sp-stan-talk.png", 335, 441);
const SP_KYLE_TALK = talkSheet("assets/southpark/sp-kyle-talk.png", 315, 396);
const SP_CARTMAN_TALK = talkSheet("assets/southpark/sp-cartman-talk.png", 371, 398);
const SP_KENNY_TALK = talkSheet("assets/southpark/sp-kenny-talk.png", 294, 371);

/** Officer Barbrady — pass-2 patrol sheet + pass-3 talking sheet. */
const SP_BARBRADY_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-barbrady-walk.png",
  frameWidth: 159,
  frameHeight: 268,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 7 },
  },
};
const SP_BARBRADY_TALK = talkSheet("assets/southpark/sp-barbrady-talk.png", 371, 447);

/** The WRONG-CARTOON cameo — a certain scientist & grandson, passing
 *  through. Stage-only characters (no talking cutouts here). */
const SP_RICK_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-rick-walk.png",
  frameWidth: 181,
  frameHeight: 291,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 7 },
  },
};
const SP_MORTY_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-morty-walk.png",
  frameWidth: 169,
  frameHeight: 245,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 9 },
  },
};

/** Tweek — jittery pass-3 patrol sheet (faces right natively). */
const SP_TWEEK_SHEET: SpriteSheet = {
  image: "assets/southpark/sp-tweek-walk.png",
  frameWidth: 147,
  frameHeight: 260,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3, 4, 5], fps: 9 },
  },
};

/** Shared stage tuning: snow town floor band, brisk fourth-grade walk.
 *  playerScale 1.5 — the beta's cast plays bigger on the plate. */
const stageBase = {
  speed: 20,
  reach: 4,
  keyboard: true,
  floor: { top: 58, bottom: 94 },
  depthScale: 0.35,
  hints: "proximity" as const,
  verbCoin: true,
  extendedVerbs: true,
  // OBJECT-FIRST verb wheel: click an object (or right-click) and the pie
  // of its verbs pops up under the story's snowflake icon.
  objectVerbMenu: true,
  playerScale: 1.5,
};

export const SOUTH_PARK: Story = {
  id: "south-park-beta",
  title: "South Park: The Recess Wars",
  tagline: "Cartman repoed the sled. The fourth grade will burn. Language may occur.",
  startSceneId: "sp_bus",
  coverImage: "assets/southpark/sp-title.png",
  // the verb-wheel centrepiece: the paper snowflake
  verbMenuIcon: "assets/southpark/sp-verbicon.png",
  verbMenuEnabled: true,
  playerSprite: { sheet: SP_STAN_SHEET },
  characters: [
    { id: "sp_stan", name: "Stan", role: "Fourth grader with a sled grudge", avatarUrl: "emoji:🧢", trustMeter: 0, talkingSheet: SP_STAN_TALK, talkingX: 35, talkingY: 0, talkingScale: 0.6 },
    { id: "sp_kyle", name: "Kyle", role: "The sane one (barely)", avatarUrl: "emoji:🧒", trustMeter: 0, talkingSheet: SP_KYLE_TALK, talkingX: 65, talkingY: 0, talkingScale: 0.6 },
    { id: "sp_cartman", name: "Cartman", role: "King of Recess (self-declared)", avatarUrl: "emoji:🤬", trustMeter: 0, talkingSheet: SP_CARTMAN_TALK, talkingX: 52, talkingY: 0, talkingScale: 0.62 },
    { id: "sp_kenny", name: "Kenny", role: "Mmph mmph", avatarUrl: "emoji:🥶", trustMeter: 0, talkingSheet: SP_KENNY_TALK, talkingX: 46, talkingY: 0, talkingScale: 0.58 },
    { id: "sp_barbrady", name: "Officer Barbrady", role: "The law, at a simmer", avatarUrl: "emoji:👮", trustMeter: 0, talkingSheet: SP_BARBRADY_TALK, talkingX: 24, talkingY: 0, talkingScale: 0.6 },
    { id: "sp_rick", name: "Rick (wrong cartoon)", role: "Multiversal tourist", avatarUrl: "emoji:🧪", trustMeter: 0 },
    { id: "sp_morty", name: "Morty (wrong cartoon)", role: "Reluctant multiversal tourist", avatarUrl: "emoji:😰", trustMeter: 0 },
  ],
  items: [
    {
      id: "sp_snowball",
      name: "A Perfect Snowball",
      icon: "❄️",
      iconUrl: "assets/southpark/sp-item-snowball.png",
      description: "Hand-packed at the bus stop. Legally a weapon inside South Park city limits.",
      flavorText: "It's the good snow. The packing kind.",
    },
    {
      id: "sp_key",
      name: "Frozen Locker Key",
      icon: "🗝️",
      iconUrl: "assets/southpark/sp-item-key.png",
      description: "Cartman's sled key, pulled out of locker 27's vent solid as a puck.",
      flavorText: "Cold as a dump in January.",
    },
    {
      id: "sp_sled",
      name: "Lightning Muscle 3000",
      icon: "🛷",
      iconUrl: "assets/southpark/sp-item-sled.png",
      description: "The fastest sled on the fourth-grade black market. Repossessed by right of conquest.",
      flavorText: "'FOR OFFICIAL KING DUTIES ONLY' — fat magic marker, Cartman's handwriting.",
    },
  ],
  scenes: [
    /* ── SCENE 1 — THE BUS STOP ───────────────────────────────────── */
    {
      id: "sp_bus",
      title: "The Bus Stop",
      note:
        "BETA SCENE 1. Verb menu is ON (stage.verbCoin + extendedVerbs): pick a verb, click the world. " +
        "Cartman and Kyle are INTERACTABLE NPCs — walk to Cartman (or press N) to talk; the conversation sets sp_met_cartman. " +
        "The snow pile is the TAKE marker (a Perfect Snowball). Kick the black ice for a gag. Exit: walk off the RIGHT edge to school.",
      background: "assets/southpark/sp-bg-busstop.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 50, y: 88 },
        enterCaption: "Monday. Minus twenty. The sled is gone, and Cartman's smug waddle echoes across the snow.",
        enterScript: [{ do: "wait", seconds: 0.8 }, { do: "say", text: "Another shit-tastic Monday in South Park." }],
        enterScriptFlag: "sp_seen_bus",
        exitEdges: { right: { targetSceneId: "sp_hall", label: "South Park Elementary" } },
        npcs: [
          {
            id: "sp_cartman_npc",
            image: "emoji:😡",
            sheet: SP_CARTMAN_SHEET,
            x: 32,
            y: 86,
            scale: 1.5,
            speed: 6,
            talkHotspotId: "sp_bus_cartman",
            patrol: [
              { x: 32, y: 86, pause: 3, say: "Bow before the king, peasants." },
              { x: 66, y: 88, pause: 3, say: "The sled stays with the crown. Crown rules." },
            ],
          },
          {
            id: "sp_kyle_npc",
            image: "emoji:🧒",
            sheet: SP_KYLE_SHEET,
            x: 72,
            y: 91,
            scale: 1.5,
            speed: 6,
            facing: "left",
            patrol: [
              { x: 72, y: 91, pause: 4, say: "This is some bogus bullshit, Stan." },
              { x: 46, y: 92, pause: 4, say: "Just take the damn sled back." },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_bus1", characterId: "sp_cartman", text: "Screw you guys — the sled is REPOED. Coon and Friends needs it for patrols. Also I'm King of Recess now. Those are the rules. I don't make the rules. Yes I do." },
        { id: "sp_b_bus2", characterId: "sp_stan", text: "It's OUR sled, you fat fuck. Your mom bought it with MY dad's money." },
        { id: "sp_b_bus3", characterId: "sp_cartman", text: "Fuck you, Stan. Possession is nine-tenths of the law, and I have all ten tenths. It's padlocked in my lair, and the key is hidden SO brilliantly even I don't know where it is." },
        { id: "sp_b_bus4", characterId: "sp_kyle", text: "That's not brilliant, that's a concussion with extra steps." },
        { id: "sp_b_bus5", characterId: "sp_cartman", text: "Whatever, hippie. Come take it. I daaaaare you." },
      ],
      hotspots: [
        {
          id: "sp_bus_cartman",
          label: "Cartman, gloating",
          bounds: { x: 30, y: 52, w: 22, h: 26 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue", flagSet: "sp_met_cartman" },
        },
        {
          id: "sp_bus_snow",
          label: "A pile of perfect packing snow",
          image: "assets/southpark/sp-obj-snow.png",
          bounds: { x: 12, y: 66, w: 12, h: 14 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "sp_snowball" },
        },
        {
          id: "sp_bus_ice",
          label: "A sheet of black ice",
          image: "assets/southpark/sp-obj-ice.png",
          bounds: { x: 58, y: 74, w: 14, h: 10 },
          cursor: "look",
          isRepeatable: true,
          customFailMessage: "The ice ignores your verbs, as ice does.",
          action: { type: "showText", text: "Black ice. The only honest politician in town." },
          verbs: {
            kick: { type: "showText", text: "Stan drop-kicks the ice. The ice wins. The ice always wins." },
            punch: { type: "showText", text: "You punch the black ice. Somewhere, a hip files a complaint." },
          },
        },
      ],
      choices: [],
    },

    /* ── SCENE 2 — THE SCHOOL HALLWAY ─────────────────────────────── */
    {
      id: "sp_hall",
      title: "South Park Elementary — Hallway",
      note:
        "BETA SCENE 2 and the USE-item puzzle: arm the snowball (verb coin, USE), then click Cartman's locker. " +
        "The snowball detonates, the vent pops, the frozen key drops. The trophy case is pure set dressing with opinions. " +
        "The janitor's stairs (marker) drop to the basement; the LEFT edge walks back to the bus stop.",
      background: "assets/southpark/sp-bg-hallway.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 12, y: 88 },
        enterCaption: "Twenty years of government-issue floor wax. Somewhere in here: locker 27, Cartman's starving vault.",
        entrySpawns: { sp_bus: { x: 10, y: 88 }, sp_basement: { x: 55, y: 88 }, sp_cafe: { x: 80, y: 88 } },
        exitEdges: {
          left: { targetSceneId: "sp_bus", label: "back to the bus stop" },
          right: { targetSceneId: "sp_cafe", label: "Tweek's coffee" },
        },
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "sp_hall_locker",
          label: "Locker 27 (the one with the fat face drawn on it)",
          image: "assets/southpark/sp-obj-locker.png",
          bounds: { x: 30, y: 48, w: 14, h: 22 },
          cursor: "use",
          isRepeatable: true,
          // The USE-item puzzle: arm the snowball, click the locker. The
          // engine answers only when the accepted item is armed (and
          // consumes it), replying with the authored itemResponses line.
          action: { type: "useItem", itemConsumed: "sp_snowball", itemGranted: "sp_key", flagSet: "sp_got_key" },
          acceptsItems: ["sp_snowball"],
          itemResponses: {
            sp_snowball: "The snowball detonates against the vent. Something clinks, rattles, and drops: a key frozen solid — Cartman's sled padlock key. He hid it in his SCHOOL locker. Nobody said he was smart.",
          },
          verbs: {
            look: { type: "showText", text: "Locker 27. It hums with the gravitational pull of half-eaten Cheesy Poofs. The vent above the handle looks loose." },
            punch: { type: "showText", text: "You punch the locker. The locker feels nothing. Somewhere, Cartman's chin wobbles in sympathy." },
            talk: { type: "showText", text: "You tell locker 27 about your feelings. It stores them with everything else Cartman hides." },
          },
          customFailMessage: "Arm the snowball (USE) and click the locker — that vent isn't going to blow itself.",
        },
        {
          id: "sp_hall_trophy",
          label: "The trophy case",
          image: "assets/southpark/sp-obj-trophy.png",
          bounds: { x: 62, y: 46, w: 14, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Kyle's science fair trophy: 'Most Radioactive Volcano, Grade 4.' The volcano later sued." },
          verbs: {
            kick: { type: "showText", text: "One day that trophy will be worth money. Today it just judges you." },
          },
        },
        {
          id: "sp_hall_basement",
          label: "The janitor's stairs (they lead to Cartman's basement somehow)",
          bounds: { x: 84, y: 62, w: 11, h: 18 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "sp_basement" },
        },
      ],
      choices: [],
    },

    /* ── SCENE 3 — CARTMAN'S BASEMENT ─────────────────────────────── */
    {
      id: "sp_basement",
      title: "Cartman's Basement (The Lair)",
      note:
        "BETA SCENE 3. The sled is gated on the frozen key: TAKE is refused until sp_key is in the satchel. " +
        "Cartman stands in his lair as an interactable NPC — talk first for the full Cartman experience. " +
        "Taking the sled sets sp_got_sled, which unlocks the RIGHT edge to Stark's Pond (yellow arrow until then).",
      background: "assets/southpark/sp-bg-basement.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 12, y: 88 },
        enterCaption: "The lair smells like Cheesy Poofs and tyranny. The Lightning Muscle 3000 sits under a padlock that has never known love.",
        entrySpawns: { sp_hall: { x: 10, y: 88 } },
        exitEdges: {
          left: { targetSceneId: "sp_hall", label: "back up to school" },
          right: {
            targetSceneId: "sp_pond",
            label: "Stark's Pond",
            gating: { requiresFlags: ["sp_got_sled"] },
            lockedLine: "Walk to Stark's Pond WITHOUT the sled? And break the whole third act? Get the sled.",
          },
        },
        npcs: [
          {
            id: "sp_cartman_lair",
            image: "emoji:😡",
            sheet: SP_CARTMAN_SHEET,
            x: 62,
            y: 84,
            scale: 1.5,
            speed: 4,
            talkHotspotId: "sp_base_cartman",
            patrol: [{ x: 62, y: 84, pause: 5, say: "It's not a basement, it's a LAIR, you poor piece of shit." }],
          },
        ],
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_base1", characterId: "sp_cartman", text: "Respect my authoritah! This is my fortress of solitude. Mom says I can have the basement until she needs the dryer." },
        { id: "sp_b_base2", characterId: "sp_stan", text: "Give us the sled back, Cartman, or I swear to God—" },
        { id: "sp_b_base3", characterId: "sp_cartman", text: "SWEAR TO WHO? Also there is DEFINITELY no key in my locker at school. Locker 27? Never heard of her. Ignore this entire sentence, which I am saying out loud." },
        { id: "sp_b_base4", characterId: "sp_cartman", text: "Get out of my lair before I unleash my entire army of nobody on you." },
      ],
      hotspots: [
        {
          id: "sp_base_cartman",
          label: "Cartman, defending his lair",
          bounds: { x: 52, y: 54, w: 20, h: 26 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "sp_base_sled",
          label: "The Lightning Muscle 3000 (HIS, allegedly)",
          image: "assets/southpark/sp-obj-sled.png",
          bounds: { x: 18, y: 66, w: 18, h: 16 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          customFailMessage: "A fat little padlock guards the sled. The key is hidden back at school — because of course it is.",
          action: { type: "giveItem", itemGranted: "sp_sled", flagSet: "sp_got_sled" },
          gating: { requiresItems: ["sp_key"] },
          verbs: {
            look: { type: "showText", text: "Fastest sled in the fourth grade. Nine.speed settings and a cassette deck. He never once waxed the runners." },
            kick: { type: "showText", text: "You kick the padlock. The padlock files it under 'cute'." },
          },
        },
        {
          id: "sp_base_chest",
          label: "A toy chest marked PROPERTY OF MANKIND",
          image: "assets/southpark/sp-obj-chest.png",
          bounds: { x: 76, y: 62, w: 12, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Inside: a Dark Lord action figure, still in the box. Mint. He will never know joy like this again, and honestly, neither will it." },
          verbs: {
            use: { type: "showText", text: "You reach in. Something bites you. It's Cartman's anger, manifest as a stapler." },
          },
        },
      ],
      choices: [],
    },

    /* ── SCENE 3b — TWEEK BROS. COFFEE ────────────────────────────── */
    {
      id: "sp_cafe",
      title: "Tweek Bros. Coffee",
      note:
        "BETA SCENE 3b (pass-2 room). Officer Barbrady patrols the floor as an interactable NPC — try the right-click " +
        "verb menu on him, or just talk (N). The espresso machine and the community board are look gags.",
      background: "assets/southpark/sp-bg-cafe.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 12, y: 88 },
        enterCaption: "Tweek Bros. Coffee: where the whole town self-medicates. Officer Barbrady is 'on patrol' by the pastries.",
        entrySpawns: { sp_hall: { x: 8, y: 88 } },
        exitEdges: {
          left: { targetSceneId: "sp_hall", label: "back to school" },
          // Something crashed out past the treeline. It talks.
          right: { targetSceneId: "sp_crash", label: "whatever that explosion was" },
        },
        npcs: [
          {
            id: "sp_barbrady_npc",
            sheet: SP_BARBRADY_SHEET,
            x: 40,
            y: 88,
            scale: 1.5,
            speed: 5,
            talkHotspotId: "sp_cafe_barbrady",
            patrol: [
              { x: 40, y: 88, pause: 3, say: "Nothing to see here. Official police business. Mm, donuts." },
              { x: 74, y: 92, pause: 3, say: "I am SO on top of this sled thing. Top. Of. It." },
            ],
          },
          {
            id: "sp_tweek_npc",
            sheet: SP_TWEEK_SHEET,
            x: 58,
            y: 78,
            scale: 1.5,
            speed: 7,
            facing: "left",
            patrol: [
              { x: 58, y: 78, pause: 2, say: "NGGH! Too much pressure! Sleds are heavy, man!" },
              { x: 30, y: 82, pause: 2, say: "I don't even KNOW what a notary IS!" },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_cafe1", characterId: "sp_cartman", text: "Officer, this man is harassing a king. Sled-related treason. I'd like to file a report, a complaint, and a croissant." },
        { id: "sp_b_cafe2", characterId: "sp_stan", text: "He STOLE our sled, officer. In front of everybody. There's even a black market manifest." },
        { id: "sp_b_cafe3", characterId: "sp_kyle", text: "The 'manifest' is a crayon drawing of a sled with 'MINE' written on it forty times." },
        { id: "sp_b_cafe4", characterId: "sp_cartman", text: "It's NOTARIZED." },
        { id: "sp_b_cafe5", characterId: "sp_barbrady", text: "Now hold on, everyone. I saw the whole thing. I'm going to need... one of those donuts first. Police business takes energy." },
        { id: "sp_b_cafe6", characterId: "sp_barbrady", text: "Okay! Reviewing the crayon document... yep, that's a legally binding notarized sled. This is what the forefathers wanted. Case closed, everybody out." },
        { id: "sp_b_cafe7", characterId: "sp_stan", text: "Unbelievable. This town's police force is one guy and he's eating the evidence." },
      ],
      hotspots: [
        {
          id: "sp_cafe_barbrady",
          label: "Officer Barbrady (on patrol, technically)",
          bounds: { x: 34, y: 54, w: 20, h: 28 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
          verbs: {
            look: { type: "showText", text: "Officer Barbrady. The law, at a comfortable simmer. His badge says 'protect and snack'." },
            punch: { type: "showText", text: "Assaulting an officer is illegal, baby! ...He reads the statute out loud. He reads it wrong. Twice." },
            use: { type: "showText", text: "You can't USE a police officer. He's not jurisdictionally an object." },
          },
        },
        {
          id: "sp_cafe_machine",
          label: "The espresso machine",
          image: "assets/southpark/sp-obj-espresso.png",
          bounds: { x: 16, y: 48, w: 12, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The machine cost more than the police budget. It hisses like Tweek asked a question." },
          verbs: {
            use: { type: "showText", text: "One sip. Your eye twitches for an hour. Worth it." },
            kick: { type: "showText", text: "You do NOT kick the espresso machine. Tweek would die. Again." },
          },
        },
        {
          id: "sp_cafe_board",
          label: "The community board",
          bounds: { x: 66, y: 44, w: 14, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Flyers: 'MISSING: ONE SLED (reward: nothing)', 'BAND PRACTICE CANCELLED FOREVER', and a crayon notice of royal decree. Cartman's been busy." },
          verbs: {
            take: { type: "showText", text: "You pocket the royal decree. It's not evidence if it's art." },
          },
        },
      ],
      choices: [],
    },

    /* ── SCENE 3c ─ THE WRONG CARTOON (wide-world cameo) ──────── */
    {
      id: "sp_crash",
      title: "The Shoreline Past the Trees",
      note:
        "BETA SCENE 3c \u2014 THE WIDE REEL. worldWidth 200: a two-screen shoreline, the camera panning with the walker. " +
        "The room-entry cutscene is the multiversal cameo: Rick & Morty crashed here, decide they are in the wrong " +
        "cartoon, and portal out (the portal marker wakes once you have talked to them). Both are talk-linked \u2014 " +
        "talk to Rick and ONLY Rick freezes while Morty keeps pacing.",
      background: "assets/southpark/sp-bg-pond.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        // THE EXTENDED REEL \u2014 one scrolling strip, twice the plate wide.
        worldWidth: 200,
        spawn: { x: 20, y: 88 },
        enterCaption: "The shoreline runs on for two screens past the treeline. So does the smoke.",
        entrySpawns: { sp_cafe: { x: 16, y: 88 }, sp_pond: { x: 30, y: 88 } },
        enterScript: [
          { do: "wait", seconds: 0.8 },
          { do: "say", text: "A green tear opens over the pond. Something falls out of it. Something... parked badly." },
          { do: "npcWalkTo", npcId: "sp_rick_cameo", x: 150, y: 84 },
          { do: "wait", seconds: 0.6 },
          { do: "say", text: "Morty. Morty! Th-this is\u2014 you parked us in the wrong CARTOON, Morty!" },
          { do: "npcWalkTo", npcId: "sp_morty_cameo", x: 160, y: 86 },
          { do: "say", text: "Oh jeez. Oh man, Rick, it's SOUTH Park. Th-they kill the kid here, Rick! The little one in the orange\u2014 they just DO it!" },
          { do: "say", text: "Yeah, well their whole gig is a bunch of eight-year-olds swearing while a fat kid gets humiliated, Morty. It's\u2014 it's basically our show with ski caps. Legally I cannot say another word." },
          { do: "npcMotion", npcId: "sp_rick_cameo", facing: "left" },
          { do: "say", text: "Oh, sorry. Wrong scene. Wrong cartoon. Bye." },
          { do: "wait", seconds: 0.8 },
        ],
        enterScriptFlag: "sp_crash_seen",
        npcs: [
          {
            id: "sp_rick_cameo",
            sheet: SP_RICK_SHEET,
            x: 150,
            y: 84,
            scale: 1.5,
            speed: 6,
            talkHotspotId: "sp_crash_rick",
            patrol: [
              { x: 150, y: 84, pause: 3, say: "The ship's a rental, Morty. RENTAL." },
              { x: 138, y: 88, pause: 3, say: "Wubba lubba\u2014 no. No, that's their thing. Ugh." },
            ],
          },
          {
            id: "sp_morty_cameo",
            sheet: SP_MORTY_SHEET,
            x: 160,
            y: 86,
            scale: 1.5,
            speed: 8,
            facing: "left",
            patrol: [
              { x: 160, y: 86, pause: 2, say: "I-I don't wanna be a background character, Rick!" },
              { x: 170, y: 90, pause: 2, say: "Th-the snow here is drawn with PAPER, Rick!" },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_crash1", characterId: "sp_rick", text: "Wh\u2014what? Yeah, the sled thing sounds like a real you problem, kid. We do this at a multi-multiversal scale." },
        { id: "sp_b_crash2", characterId: "sp_stan", text: "Your ship is on fire. In our pond. That's a protected pond." },
        { id: "sp_b_crash3", characterId: "sp_rick", text: "It's a RENTAL, buddy. Tell the pond\u2014 y'know what, tell the fat kid. He's clearly the one with the lawyer." },
        { id: "sp_b_crash4", characterId: "sp_morty", text: "Rick, the kid's giving us the LOOK, Rick, the\u2014 oh jeez, portal us, portal us NOW." },
      ],
      hotspots: [
        {
          id: "sp_crash_rick",
          label: "Rick, blaming the parking",
          bounds: { x: 138, y: 54, w: 20, h: 28 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue", flagSet: "sp_cameo_talked" },
          verbs: {
            look: { type: "showText", text: "An old man in a lab coat. He appears to be drooling confidence." },
            punch: { type: "showText", text: "He threatens to turn you into a smaller, angrier version of yourself. Portal science." },
            use: { type: "showText", text: "You can't USE Rick. Rick uses Rick. That's the whole show." },
          },
        },
        {
          id: "sp_crash_ship",
          label: "The smoking wreck (definitely a rental)",
          bounds: { x: 142, y: 58, w: 26, h: 22 },
          cursor: "look",
          isRepeatable: true,
          occludes: true,
          image: "assets/southpark/sp-obj-ship.png",
          action: { type: "showText", text: "A battered flying saucer, nose-down in a snowbank. The glovebox holds eleven unused portal guns and a magnet for a plumbing van that operates across dimensions." },
          verbs: {
            take: { type: "showText", text: "You try to take the ship. The ship's insurance company files a claim on your SOUL." },
            kick: { type: "showText", text: "You kick the hull. Somewhere, a warranty gets violated in fourteen realities." },
            use: { type: "showText", text: "You turn the steering wheel. It makes a 'wubba' noise and nothing else." },
          },
        },
        {
          id: "sp_crash_portal",
          label: "The portal home (for them, anyway)",
          bounds: { x: 168, y: 50, w: 12, h: 20 },
          cursor: "go",
          isRepeatable: true,
          image: "assets/southpark/sp-obj-portal.png",
          customFailMessage: "The portal spits sparks. Rick waves from the wreck. 'Not til we've talked, kid \u2014 insurance needs a witness!'",
          gating: { requiresFlags: ["sp_cameo_talked"] },
          action: { type: "goToScene", targetSceneId: "sp_cafe" },
        },
      ],
      choices: [],
    },

    /* ── SCENE 4 — STARK'S POND ───────────────────────────────────── */
    {
      id: "sp_pond",
      title: "Stark's Pond",
      note:
        "BETA SCENE 4 — the finale. The room-entry cutscene (enterScript) walks Kenny onto the thin ice and does what the show does: " +
        "'Oh my God, the ice killed Kenny!' / 'You bastards!' Kenny's NPC keeps patrolling anyway — nobody in South Park ever learns. " +
        "Cartman's confrontation marker draws his MOODS sprite sheet as object art (smug frame). Talk to him with the sled; " +
        "the conversation ends, the scene's two CHOICES appear, and each walks you into a different ending card.",
      background: "assets/southpark/sp-bg-pond.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 16, y: 90 },
        enterCaption: "Stark's Pond. Romantic. Historic. Frozen to a depth nobody has ever bothered to measure. Until today.",
        entrySpawns: { sp_basement: { x: 12, y: 90 } },
        enterScript: [
          { do: "wait", seconds: 0.8 },
          { do: "say", text: "Kenny! The ice is thin, dude, get off it!" },
          { do: "npcWalkTo", npcId: "sp_kenny_npc", x: 62, y: 78 },
          { do: "wait", seconds: 1.2 },
          { do: "say", text: "Oh my God! The ice killed Kenny!" },
          { do: "say", text: "You bastards!" },
          { do: "wait", seconds: 0.8 },
        ],
        enterScriptFlag: "sp_pond_seen",
        npcs: [
          {
            id: "sp_kenny_npc",
            image: "emoji:🥶",
            sheet: SP_KENNY_SHEET,
            x: 55,
            y: 80,
            scale: 1.5,
            speed: 5,
            patrol: [
              { x: 55, y: 80, pause: 3 },
              { x: 62, y: 78, pause: 3, say: "Mmph mmph mmph!" },
              { x: 48, y: 82, pause: 3 },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_pond1", characterId: "sp_cartman", text: "Put. The sled. Down, Stan. That is KING'S property. Interfering with the king is treason, and treason is a butt-whooping I am legally allowed to deliver." },
        { id: "sp_b_pond2", characterId: "sp_stan", text: "It's over, Cartman. We have the key, we have the sled, and we're done with your stupid kingdom. Fuck you, Cartman." },
        { id: "sp_b_pond3", characterId: "sp_cartman", text: "...What did you just say to me? Say it again. Say it into these mittens." },
        { id: "sp_b_pond4", characterId: "sp_kenny", text: "(Muffled, from under the ice: something surprisingly supportive.)" },
        { id: "sp_b_pond5", characterId: "sp_stan", text: "Kenny gets it. So what's it gonna be — do we settle this the old way, or do we act like it never happened?" },
      ],
      hotspots: [
        {
          id: "sp_pond_cartman",
          label: "Cartman, smug across the ice",
          bounds: { x: 66, y: 50, w: 16, h: 24 },
          cursor: "talk",
          isRepeatable: true,
          customFailMessage: "Cartman waves from the bank. 'Come back with the sled, you goddamn thieves!'",
          gating: { requiresFlags: ["sp_got_sled"] },
          sheet: SP_CARTMAN_MOODS,
          image: "assets/southpark/sp-cartman-moods.png",
          action: { type: "startDialogue" },
        },
        {
          id: "sp_pond_sign",
          label: "The Stark's Pond sign",
          image: "assets/southpark/sp-obj-sign.png",
          bounds: { x: 6, y: 54, w: 10, h: 14 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "'STARK'S POND — EST. FOREVER. NO SWIMMING. NO SKATING. (One signature: K. McCormick, age 6, in crayon.)'" },
          verbs: {
            kick: { type: "showText", text: "You kick the sign. The town logs it as free speech." },
          },
        },
      ],
      choices: [
        {
          id: "sp_c_punch",
          text: "Sled first. Punch him now.",
          targetSceneId: "sp_end_fight",
        },
        {
          id: "sp_c_talk",
          text: "Take the high road — and still tell him fuck you on the way out.",
          targetSceneId: "sp_end_friend",
        },
      ],
    },

    /* ── ENDING A — THE PLAYGROUND PURGE ──────────────────────────── */
    {
      id: "sp_end_fight",
      title: "The Playground Purge",
      note: "BETA ENDING A (silver): you chose violence. Correctly.",
      background: "assets/southpark/sp-bg-playground.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 50, y: 88 },
        enterCaption: "The swing set. High noon. The sled between you like a line in the snow that can't be uncrossed.",
      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_fight1", characterId: "sp_cartman", text: "MOM! MOM! STAN'S BEING A WAR CRIMINAL! THIS IS A HATE CRIME AGAINST A KING!" },
        { id: "sp_b_fight2", characterId: "sp_stan", text: "Sled. Home. Recess. Saved. Some things you don't need a verb menu for." },
      ],
      hotspots: [],
      choices: [],
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE PLAYGROUND PURGE",
        recap:
          "You chose violence. Correctly. Cartman cried to his mom, the sled came home, and the fourth grade drafted a new constitution at the swing set. Kenny is still technically on the ice. Detention is on Tuesday. Worth it.",
      },
    },

    /* ── ENDING B — PEACE IN OUR TIME ─────────────────────────────── */
    {
      id: "sp_end_friend",
      title: "Peace in Our Time (Until Lunch)",
      note: "BETA ENDING B (gold): diplomacy, with the sled secured and the profanity delivered.",
      background: "assets/southpark/sp-bg-busstop.png",
      nodeType: "stage",
      stage: {
        ...stageBase,
        spawn: { x: 50, y: 88 },
        enterCaption: "You walk away with the sled and the last word. Cartman respects exactly one of those.",
        // background swap: the walk home

      },
      prose: "",
      dialogueBeats: [
        { id: "sp_b_friend1", characterId: "sp_cartman", text: "Respect. You spoke to me in my love language: profanity, delivered cold." },
        { id: "sp_b_friend2", characterId: "sp_kyle", text: "This changes nothing and absolutely everything." },
      ],
      hotspots: [],
      choices: [],
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "PEACE IN OUR TIME (UNTIL LUNCH)",
        recap:
          "You told Cartman to fuck off WITH the sled secured — diplomacy AND firepower. The fourth grade signed a truce at the swings; Cartman keeps his crown as long as everyone remembers it's made of paper. Kenny got a long nap under the ice. Everybody won, mostly.",
      },
    },
  ],
};
