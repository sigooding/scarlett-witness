import type { Story } from "../types";

/**
 * GUARDS! GUARDS! — a Discworld-flavoured point-and-click in the spirit of
 * the old Perfect Entertainment games, redrawn in high resolution.
 *
 * You are Lance-Constable Carrot Ironfoundersson (human, raised by dwarfs)
 * on your first days with the Ankh-Morpork City Watch, while a secret
 * brotherhood chalks a very bad idea onto the floor of the Shades.
 *
 * All art lives in public/img/guards/ (high-res painterly plates + keyed
 * character cutouts). Stage scenes use the object-first skull-pie verb menu
 * with a Great A'Tuin at its centre, in respectful memory of Discworld II.
 */

const P = "/img/guards/";

/* Topic hubs, shared by the recruit/onduty states of the TALK markers so the
   first conversation grants the badge & cast exactly once (the default state)
   and every later conversation is reward-free (the gated state). */
const VIMES_TOPICS: import("../types").DialogueTopic[] = [
  {
    id: "gg_t_duty",
    label: "Reporting for duty, sir!",
    beats: [
      { id: "gg_v_b1", characterId: "gg_vimes", text: "Right. You're a constable now. Badge's yours. The pay is terrible, the hours are worse, and the company is us." },
      { id: "gg_v_b2", characterId: "gg_carrot", text: "I shan't let you down, sir! I've memorised the Laws and Ordinances of Ankh-Morpork. All of them. There's a section on dragons." },
      { id: "gg_v_b3", characterId: "gg_vimes", text: "Of course there is. Everything's in the book, lad. That's the trouble. The city just never reads it." },
    ],
  },
  {
    id: "gg_t_claws",
    label: "What's this plaster cast on your desk, sir?",
    beats: [
      { id: "gg_v_c1", characterId: "gg_vimes", text: "Claw print. Found it in the Shades after a 'fire' that left no body, no bones, and one very burnt thief's ladder." },
      { id: "gg_v_c2", characterId: "gg_vimes", text: "Lady Ramkin breeds swamp dragons. She looked at the cast and went the colour of parchment. She said the big ones went away to a dimension where magic holds them up." },
      { id: "gg_v_c3", characterId: "gg_carrot", text: "So someone has brought one back, sir?" },
      { id: "gg_v_c4", characterId: "gg_vimes", text: "Someone with chalk, candles, and a grudge. Take the cast. If you see hooded men buying candles, you've found my arsonist's bookkeeping." },
    ],
  },
  {
    id: "gg_t_watch",
    label: "What does the Watch actually do, sir?",
    repeatable: true,
    beats: [
      { id: "gg_v_w1", characterId: "gg_vimes", text: "We walk about and ring a bell. The Thieves' Guild has quotas, the Assassins' Guild has invoices, and we have the bell. It's a system." },
      { id: "gg_v_w2", characterId: "gg_vimes", text: "Or it was. Then you walked in looking like the cover of a heroic ballad, and now I find myself... hoping. Dangerous thing, hope. Bad for the digestion." },
    ],
  },
];

/* Talking-portrait sheets (3-frame bust rows keyed transparent): frame 0
   rests, frames 1–2 talk. Same contract for every speaker. */
const talkSheet = (file: string, frameWidth: number, frameHeight: number): import("../game/spriteSheet").SpriteSheet => ({
  image: P + file,
  frameWidth,
  frameHeight,
  animations: { rest: { frames: [0] }, talk: { frames: [1, 2, 1, 2], fps: 6 } },
  pixelated: false,
});

const WONSE_TOPICS: import("../types").DialogueTopic[] = [
  {
    id: "gg_t_wonse_plan",
    label: "Right. Explain yourself, then.",
    beats: [
      { id: "gg_w_p1", characterId: "gg_wonse", text: "A CONSTABLE? In my lodge? Do you know who I am? I am the Supreme Grand Master! Soon I shall be king in all but— in ALL!" },
      { id: "gg_w_p2", characterId: "gg_wonse", text: "The dragon crowns a puppet king! The puppet dances to MY chalk! The city kneels! It is flawless! It was flawless until the dragon developed AMBITION!" },
      { id: "gg_w_p3", characterId: "gg_carrot", text: "Right. I'm afraid that's treason, then. Several treasons. I'll be needing a statement, and I should warn you that anything you monologue may be taken down and used against you." },
      { id: "gg_w_p4", characterId: "gg_wonse", text: "GET OUT OF MY SUMMONING." },
    ],
  },
];

export const GUARDS_GUARDS: Story = {
  id: "guards-guards",
  title: "Guards! Guards!",
  tagline:
    "A dragon over Ankh-Morpork, a sausage inna bun, and the finest law enforcement the city can afford. A Discworld-flavoured point-and-click.",
  gameKind: "adventure",
  coverImage: P + "gg-cover.jpg",
  startSceneId: "gg_cold_open",
  inventoryDisplay: { mode: "container", label: "Watch Kit" },
  playerSprite: {
    image: P + "gg-carrot-keyed.png",
    sheet: {
      image: P + "gg-carrot-walk-keyed.png",
      frameWidth: 344,
      frameHeight: 768,
      animations: { walk: { frames: [0, 1, 2, 3], fps: 7 }, idle: { frames: [0] } },
      pixelated: false,
    },
  },
  verbMenuIcon: "emoji:🐢",
  dialogueBox: {
    bodyFont: "elegant",
    headingFont: "epic",
    reserveLines: 3,
    bordered: true,
  },
  cursorArt: {
    look: { image: P + "gg-cursor-look-keyed.png", size: 40, anchor: "center" },
    take: { image: P + "gg-cursor-take-keyed.png", size: 40, anchor: "center" },
    talk: { image: P + "gg-cursor-talk-keyed.png", size: 40, anchor: "center" },
    use: { image: P + "gg-cursor-use-keyed.png", size: 40, anchor: "center" },
    go: { image: P + "gg-cursor-go-keyed.png", size: 40, anchor: "center" },
  },
  map: {
    title: "Ankh-Morpork — City Plan & Survey",
    backgroundImage: P + "gg-map.jpg",
    locations: [
      { id: "gg_map_watch", label: "The Watch House", targetSceneId: "gg_watchhouse", x: 37, y: 71, icon: "🔔" },
      { id: "gg_map_street", label: "Treacle Mine Road", targetSceneId: "gg_street", x: 29, y: 50, icon: "🌭" },
      {
        id: "gg_map_kennels",
        label: "Pseudopolis Yard Kennels",
        targetSceneId: "gg_kennels",
        x: 79,
        y: 54,
        icon: "🐉",
        gating: { requiresItems: ["gg_cast"] },
        lockedHint: "A plaster claw cast needs an expert eye — Lady Ramkin's, perhaps.",
      },
      {
        id: "gg_map_lodge",
        label: "The Shades",
        targetSceneId: "gg_lodge",
        x: 67,
        y: 72,
        icon: "🕯️",
        gating: { requiresFlags: ["gg_lodge_rumor"] },
        lockedHint: "Nobody has given you a reason to walk the Shades at night.",
      },
      {
        id: "gg_map_cell",
        label: "The Palace Cells",
        targetSceneId: "gg_cell",
        x: 52,
        y: 30,
        icon: "",
        gating: { requiresFlags: ["gg_jailed"] },
        lockedHint: "Nobody has been arrested for refusing to kneel. Yet.",
      },
      {
        id: "gg_map_park",
        label: "The Park",
        targetSceneId: "gg_stake",
        x: 45,
        y: 60,
        icon: "🌹",
        gating: { requiresFlags: ["gg_freed"] },
        lockedHint: "The park is just a park until the dragon picks a sacrifice.",
      },
      {
        id: "gg_map_palace",
        label: "The Palace",
        targetSceneId: "gg_throne",
        x: 52,
        y: 22,
        icon: "👑",
        gating: { requiresFlags: ["gg_throne_visit"] },
        lockedHint: "The Palace is closed for tyranny. Probably.",
      },
    ],
  },
  verbResponses: {
    look: [
      "You look. Looking is free, which is more than most things are in Ankh-Morpork.",
      "Nothing further to see here. The city keeps its secrets the way a dog keeps a bone.",
    ],
    take: [
      "That is not yours. Technically nothing in Ankh-Morpork is yours, but this is less yours than most.",
      "You are a constable, not a kleptomaniac. There is a difference, and it is the badge.",
    ],
    talk: ["It does not appear to be the talking sort.", "You address it politely. It declines to reply."],
    use: [
      "That combination of things is not recognised by the Laws and Ordinances of Ankh-Morpork.",
      "No. The universe objects, and the universe outranks you.",
    ],
    go: ["There is no sensible path that way.", "You consider going that way, and decide against it with your whole body."],
  },
  briefing: {
    gameInfo:
      "A point-and-click adventure in the old Discworld game tradition, redrawn in high resolution. Walk the rooms, click objects and pick verbs from the turtle menu, talk to everyone twice, and keep an eye on the sky.",
    objective: "Join the Watch, find out what the hooded Brethren are summoning, and deal with the dragon.",
    winConditions: [
      "Take the oath and the badge.",
      "Learn where the Brethren meet.",
      "Witness the summoning and take the book.",
      "Survive the distillery ambush.",
    ],
    loseConditions: ["Stand too long, admiring the dragon."],
  },
  flagNotes: {
    gg_on_duty: "Carrot took the oath and received the Lance-Constable's badge.",
    gg_errol_taken: "Carrot adopted Errol, the Watch's swamp dragon mascot.",
    gg_lodge_rumor: "Someone told Carrot where the hooded Brethren meet in the Shades.",
    gg_ritual_seen: "Carrot witnessed the Brethren summon the dragon.",
    gg_wonse_plan: "The Supreme Grand Master explained his plan, at length, to a constable.",
    gg_met_ramkin: "Carrot met Lady Ramkin at the dragon kennels. Mind the smoke.",
    gg_ramkin_lore: "Lady Ramkin confirmed it: someone has SUMMONED a real dragon, which is forbidden by the oldest laws of the city.",
    gg_early: "The Watch fired the ballista early and got lucky.",
    gg_roasted: "Carrot hesitated at the distillery.",
    gg_intro_seen: "The Watch House entrance played once.",
    gg_jailed: "Carrot refused to kneel to the new king, and the new king has a cell for that.",
    gg_rat_intel: "The Patrician's rats report the dragon's route: river, distillery, eight o'clock, never varies.",
    gg_freed: "The Librarian picked the Palace lock. Ook.",
    gg_dragon_dozes: "Cited at with the park by-laws, the Dragon King sulked into a doze.",
    gg_sybil_free: "Lady Ramkin is untied, unimpressed, and planning words about the stake.",
    gg_throne_visit: "Carrot escorted the Patrician home after the dragon came down.",
    gg_rewarded: "The Watch got a pay rise, a kettle, and a dartboard. With rules.",
  },
  characters: [
    {
      id: "gg_narrator",
      name: "Narrator",
      role: "The voice of the city",
      avatarUrl: P + "gg-cover.jpg",
      trustMeter: 0,
    },
    {
      id: "gg_carrot",
      name: "Carrot",
      role: "Lance-Constable Carrot Ironfoundersson (human, raised by dwarfs)",
      avatarUrl: P + "gg-carrot-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-carrot-talk-keyed.png", 469, 768),
    },
    {
      id: "gg_vimes",
      name: "Vimes",
      role: "Captain Samuel Vimes, City Watch",
      avatarUrl: P + "gg-vimes-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-vimes-talk-keyed.png", 456, 614),
    },
    {
      id: "gg_colon",
      name: "Colon",
      role: "Sergeant Fred Colon, City Watch",
      avatarUrl: P + "gg-colon-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-colon-talk-keyed.png", 456, 567),
    },
    {
      id: "gg_dibbler",
      name: "Dibbler",
      role: "Cut-Me-Own-Throat Dibbler, purveyor of fine sausages",
      avatarUrl: P + "gg-dibbler-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-dibbler-talk-keyed.png", 435, 620),
    },
    {
      id: "gg_wonse",
      name: "Supreme Grand Master",
      role: "Leader of the Elucidated Brethren of the Ebon Night",
      avatarUrl: P + "gg-wonse-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-wonse-talk-keyed.png", 462, 690),
    },
    {
      id: "gg_vetinari",
      name: "The Patrician",
      role: "Havelock Vetinari, Patrician of Ankh-Morpork",
      avatarUrl: P + "gg-vetinari-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-vetinari-talk-keyed.png", 424, 570),
    },
    {
      id: "gg_ramkin",
      name: "Lady Ramkin",
      role: "Lady Sybil Ramkin, breeder of swamp dragons",
      avatarUrl: P + "gg-ramkin-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-ramkin-talk-keyed.png", 469, 768),
    },
    {
      id: "gg_nobbs",
      name: "Nobbs",
      role: "Corporal Nobby Nobbs (dispossessed of several human traits)",
      avatarUrl: P + "gg-nobbs-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-nobbs-talk-keyed.png", 442, 693),
    },
    {
      id: "gg_librarian",
      name: "The Librarian",
      role: "Head of the Library of Unseen University. An orangutan. Ook.",
      avatarUrl: P + "gg-librarian-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-librarian-talk-keyed.png", 450, 601),
    },
    {
      id: "gg_dragon",
      name: "The Dragon",
      role: "Draco nobilis. Very large. Very cross. Recently crowned.",
      avatarUrl: P + "gg-dragonking-keyed.png",
      trustMeter: 0,
      talkingSheet: talkSheet("gg-dragonking-talk-keyed.png", 443, 768),
    },
  ],
  items: [
    {
      id: "gg_badge",
      name: "Lance-Constable's Badge",
      icon: "🎖️",
      description: "Shiny tin. Enormous authority, in theory.",
      flavorText: "Polished every morning, per regulations you wrote yourself.",
    },
    {
      id: "gg_errol",
      name: "Errol",
      icon: "🐉",
      description: "A small swamp dragon. Biologically improbable, emotionally sincere.",
      flavorText: "Follows you around in a basket. Eats kettles.",
    },
    {
      id: "gg_cast",
      name: "Plaster Claw Cast",
      icon: "🐾",
      description: "A plaster cast of an enormous talon print. Nothing in the city made this.",
      flavorText: "Vimes found it in the Shades, where a fire left no remains. Only opinions.",
      isClue: true,
    },
    {
      id: "gg_book",
      name: "The Summoning of Dragons",
      icon: "📖",
      iconUrl: P + "gg-book-item-keyed.png",
      description: "Stolen from the Library of Unseen University. The Library wants it back.",
      flavorText: "Heavy. Four stone of bad ideas. Also useful for throwing.",
      isClue: true,
    },
    {
      id: "gg_sausage",
      name: "Sausage-inna-Bun",
      icon: "🌭",
      description: "Two pennies. No horse. Mostly.",
      flavorText: "It smells enthusiastic.",
    },
  ],
  layout: {
    gg_cold_open: { x: 40, y: 40 },
    gg_watchhouse: { x: 320, y: 40 },
    gg_street: { x: 640, y: 40 },
    gg_lodge: { x: 960, y: 40 },
    gg_burning: { x: 640, y: 320 },
    gg_coronation: { x: 960, y: 160 },
    gg_cell: { x: 320, y: 560 },
    gg_stake: { x: 640, y: 560 },
    gg_throne: { x: 640, y: 700 },
    gg_committee: { x: 320, y: 320 },
    gg_distillery: { x: 960, y: 320 },
    gg_plaza: { x: 960, y: 560 },
    gg_end_gold: { x: 640, y: 800 },
    gg_end_silver: { x: 960, y: 800 },
    gg_end_ash: { x: 1280, y: 560 },
  },
  scenes: [
    /* ------------------------------------------------ cold open -------- */
    {
      id: "gg_cold_open",
      title: "Prologue — The City",
      nodeType: "standard",
      letterbox: true,
      background: P + "gg-cover.jpg",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 1.4, parallaxDepth: 0.15 },
      prose:
        "The city of Ankh-Morpork does not so much wake up as come to, like a man who has slept in his armour and is cross about it. Somewhere above the rooftops, something very large has discovered the city, and the city is about to discover it.",
      dialogueBeats: [
        {
          id: "gg_open_b1",
          characterId: "gg_narrator",
          text: "This is a story about guards. Mostly one guard. He is six foot six of sincerity in a breastplate, and he has just arrived to make the city safe, which is the funniest joke in the story.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "gg_open_c1", text: "Take the oath and join the Night Watch", targetSceneId: "gg_watchhouse" },
      ],
    },

    /* ------------------------------------------------ watch house ------ */
    {
      id: "gg_watchhouse",
      title: "The Watch House",
      nodeType: "stage",
      note: "Walkable room one. Vimes grants badge+cast via the TALK action; Errol is a TAKE; the door is a GO.",
      background: P + "gg-watchhouse.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.12 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 44, y: 92 },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 64, bottom: 95 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE WATCH HOUSE. HOME OF THE FINEST LAW ENFORCEMENT ANKH-MORPORK CAN AFFORD.",
        enterScriptFlag: "gg_intro_seen",
        enterScript: [
          { do: "walkTo", x: 44, y: 90 },
          { do: "npcMotion", npcId: "gg_npc_vimes", facing: "right", say: "Ah. The new one. You're taller than the paperwork said." },
          { do: "wait", seconds: 3 },
          { do: "npcMotion", npcId: "gg_npc_colon", facing: "left", say: "Welcome to the Watch, lad. Mind the kettle." },
          { do: "wait", seconds: 2.2 },
        ],
        /* Reachability: the reach test scales dy by the plate aspect, so a
           walker must be able to stand almost level with each marker's
           floor-clamped foot. Furniture the player interacts OVER (desk,
           stove, basket) is therefore a walk-behind OCCLUDER (visual cover,
           no collision) instead of an obstacle, and only the crates keep
           collision. Pass 1 walled these off with solid obstacles — the
           "out of reach" bug. */
        obstacles: [{ x: 86, y: 76, w: 14, h: 12 }],
        occluders: [
          { id: "gg_oc_desk", label: "duty desk", baseline: 82, points: [{ x: 2, y: 66 }, { x: 38, y: 66 }, { x: 38, y: 82 }, { x: 2, y: 82 }] },
          { id: "gg_oc_stove", label: "stove", baseline: 78, points: [{ x: 45, y: 64 }, { x: 61, y: 64 }, { x: 61, y: 78 }, { x: 45, y: 78 }] },
          { id: "gg_oc_basket", label: "Errol's basket", baseline: 80, points: [{ x: 52, y: 66 }, { x: 62, y: 66 }, { x: 62, y: 80 }, { x: 52, y: 80 }] },
        ],
        npcs: [
          { id: "gg_npc_vimes", image: P + "gg-vimes-keyed.png", x: 30, y: 88, scale: 1.0, facing: "right", talkHotspotId: "gg_talk_vimes" },
          { id: "gg_npc_colon", image: P + "gg-colon-keyed.png", x: 78, y: 88, scale: 0.92, facing: "left", talkHotspotId: "gg_talk_colon" },
          {
            id: "gg_npc_nobbs",
            image: P + "gg-nobbs-keyed.png",
            sheet: {
              image: P + "gg-nobbs-walk-keyed.png",
              frameWidth: 342,
              frameHeight: 638,
              animations: { walk: { frames: [0, 1, 2, 3], fps: 7 }, idle: { frames: [0] } },
              pixelated: false,
            },
            x: 62,
            y: 82,
            scale: 0.8,
            facing: "left",
            talkHotspotId: "gg_talk_nobbs",
            /* single waypoint = standing actor that mutters on a timer */
            patrol: [
              { x: 62, y: 82, pause: 4, say: "Shouldn't be 'ere. Nobody should be 'ere." },
              { x: 66, y: 84, pause: 3, facing: "right", say: "Who left a kettle about, then." },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_hs_posters",
          label: "wanted board",
          bounds: { x: 4, y: 18, w: 21, h: 45 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: {
            type: "showText",
            text: "WANTED: vampires and undead. WANTED: people who look like vampires and undead. WANTED: C.M.O.T. Dibbler, for being C.M.O.T. Dibbler.",
          },
          verbs: {
            look: {
              type: "showText",
              text: "WANTED: vampires and undead. WANTED: people who look like vampires and undead. WANTED: C.M.O.T. Dibbler, for being C.M.O.T. Dibbler.",
            },
          },
        },
        {
          id: "gg_hs_desk",
          label: "duty desk",
          bounds: { x: 3, y: 64, w: 33, h: 32 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The duty ledger lies open. The last entry, in Vimes' handwriting, reads: 'Nothing to report. Thank the gods.'" },
          verbs: {
            look: { type: "showText", text: "The duty ledger lies open. The last entry, in Vimes' handwriting, reads: 'Nothing to report. Thank the gods.'" },
            use: { type: "showText", text: "You sign the ledger, in a neat hand. It feels extremely official. Somewhere, a form is satisfied." },
          },
        },
        {
          id: "gg_hs_bell",
          label: "patrol bell",
          bounds: { x: 56, y: 28, w: 7, h: 24 },
          cursor: "use",
          isRepeatable: true,
          action: { type: "showText", text: "You ring the patrol bell. Somewhere in the city, a cat is mildly startled, which is the full extent of the bell's recorded achievements." },
        },
        {
          id: "gg_hs_errol",
          label: "basket by the stove",
          bounds: { x: 52, y: 62, w: 10, h: 21 },
          cursor: "take",
          showItemImage: false,
          sheet: {
            image: P + "gg-errol-keyed.png",
            frameWidth: 416,
            frameHeight: 413,
            animations: { loop: { frames: [0, 1, 2, 1], fps: 1.5 } },
            pixelated: false,
          },
          action: { type: "giveItem", itemGranted: "gg_errol", flagSet: "gg_errol_taken", text: "The small swamp dragon opens one hopeful eye and one pessimistic eye, and decides in your favour. You are now carrying Errol." },
          verbs: {
            look: { type: "showText", text: "A small swamp dragon asleep in a basket, breathing tiny smoke rings. Lady Ramkin's kennels donated him. He eats kettles and emits gratitude." },
          },
        },
        {
          id: "gg_hs_dartboard",
          label: "dartboard",
          bounds: { x: 89, y: 24, w: 11, h: 27 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "The dartboard. Corporal Nobbs' name is written in the treble twenty, which is against at least four regulations." },
        },
        {
          id: "gg_talk_vimes",
          label: "Vimes",
          bounds: { x: 24, y: 52, w: 13, h: 40 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: VIMES_TOPICS,
            topicPrompt: "Captain Vimes looks up from the ledger.",
            topicLeaveLabel: "Carrot snaps a salute and steps away.",
          },
          states: [
            {
              id: "gg_v_recruit",
              action: {
                type: "startDialogue",
                itemGranted: "gg_badge",
                flagSet: "gg_on_duty",
                then: [{ type: "giveItem", itemGranted: "gg_cast" }],
                topics: VIMES_TOPICS,
                topicPrompt: "Captain Vimes looks up from the ledger.",
                topicLeaveLabel: "Carrot snaps a salute and steps away.",
              },
            },
            {
              id: "gg_v_onduty",
              when: { requiresFlags: ["gg_on_duty"] },
              action: {
                type: "startDialogue",
                topics: VIMES_TOPICS,
                topicPrompt: "Captain Vimes looks up from the ledger.",
                topicLeaveLabel: "Carrot snaps a salute and steps away.",
              },
            },
          ],
        },
        {
          id: "gg_talk_colon",
          label: "Colon",
          bounds: { x: 73, y: 54, w: 13, h: 36 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
            {
              id: "gg_t_rumor",
              label: "Heard anything strange on the streets, Sarge?",
              flagSet: "gg_lodge_rumor",
              beats: [
                { id: "gg_c_r1", characterId: "gg_colon", text: "Well. Nobbs says hooded folk have been buying up chalk and black candles by the crate. Up the old chandler's shop in the Shades, after dark." },
                { id: "gg_c_r2", characterId: "gg_colon", text: "And they pay in old coins, Nobbs says. Old coins. You don't see many of them about, do you." },
                { id: "gg_c_r3", characterId: "gg_carrot", text: "Chalk, candles, and old coins. That's a summoning kit, Sarge. There's a whole section in the book." },
                { id: "gg_c_r4", characterId: "gg_colon", text: "A what now? I said it was weird, didn't I. I knew it was weird." },
              ],
            },
            {
              id: "gg_t_kettle",
              label: "How's the kettle, Sarge?",
              repeatable: true,
              gating: { requiresFlags: ["gg_errol_taken"] },
              beats: [
                { id: "gg_c_k1", characterId: "gg_colon", text: "Errol ate it. Digestion like a furnace in that little thing. Lovely mascot, though. Cheers the room up." },
              ],
            },
            {
              id: "gg_t_nobbs",
              label: "Where's Corporal Nobbs?",
              repeatable: true,
              beats: [
                { id: "gg_c_n1", characterId: "gg_colon", text: "Out on patrol. Which is to say, out. We don't ask where. It's a Watch tradition, like the dartboard." },
              ],
            },
            {
              id: "gg_t_summoning_law",
              label: "What does the law say about summoning dragons?",
              gating: { requiresFlags: ["gg_ramkin_lore"] },
              beats: [
                { id: "gg_c_l1", characterId: "gg_colon", text: "The book of laws, is it? Section something: 'No dragon shall be summoned, harboured, or knowingly toasted.' Old book, that. Thick as a sheep. Wouldn't like to be the bloke it lands on." },
                { id: "gg_c_l2", characterId: "gg_carrot", text: "(The Laws and Ordinances of the Cities of Ankh and Morpork. Carrot has read every clause. He remembers the smell of the pages, too.)" },
              ],
            },
          ],
              topicPrompt: "Sergeant Colon leans on his crossbow like a man leaning on retirement.",
              topicLeaveLabel: "Carrot leaves the Sarge to his thoughts.",
          },
        },
        {
          id: "gg_talk_nobbs",
          label: "Nobbs",
          bounds: { x: 58, y: 56, w: 10, h: 30 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
            {
              id: "gg_t_nobbs_found",
              label: "Nobbs, what have you found this time?",
              repeatable: true,
              beats: [
                { id: "gg_n_f1", characterId: "gg_nobbs", text: "A brass thing what fell off a dragon over the Shades, I found it. I'll be keeping it. Finder's keepers is in the book of laws, page — somewhere." },
                { id: "gg_n_f2", characterId: "gg_carrot", text: "Corporal Nobbs, that's evidence. Evidence belongs to the Watch." },
                { id: "gg_n_f3", characterId: "gg_nobbs", text: "I AM the Watch. I'm a corporal. That's three promotions this year, this is." },
              ],
            },
          ],
              topicPrompt: "Nobbs looks up with the expression of a man caught holding something.",
              topicLeaveLabel: "Carrot decides not to search Nobbs' pockets.",
            },
        },
        {
          id: "gg_hs_door",
          label: "out to the street",
          bounds: { x: 61, y: 26, w: 14, h: 56 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "gg_street" },
          verbs: { look: { type: "showText", text: "The door. Beyond it: the city, its problems, and Dibbler's sausages." } },
        },
      ],
      choices: [],
    },

    /* ------------------------------------------------ the street ------- */
    {
      id: "gg_street",
      title: "The Street, Dusk",
      nodeType: "stage",
      note: "Dibbler grants the Shades lead. Signpost and tower are remote looks. Right edge to the lodge once the rumor flag is set.",
      background: P + "gg-street.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.14 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 14, y: 92 },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 66, bottom: 96 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE STREETS OF ANKH-MORPORK. PERFECTLY SAFE. THE THIEVES' GUILD HAS QUOTAS.",
        entrySpawns: { gg_watchhouse: { x: 10, y: 92 }, gg_lodge: { x: 92, y: 92 }, gg_kennels: { x: 12, y: 92 } },
        /* The sausage cart is a walk-behind occluder: the walker can stand at
           the grill's foot line (hidden behind the cart art) and reach the
           TAKE hotspot; Dibbler stands in front of it. */
        obstacles: [
          { x: 9, y: 66, w: 7, h: 12 },
          { x: 70, y: 66, w: 22, h: 14 },
          { x: 88, y: 76, w: 12, h: 12 },
        ],
        occluders: [
          { id: "gg_oc_cart", label: "sausage cart", baseline: 84, points: [{ x: 18, y: 66 }, { x: 42, y: 66 }, { x: 42, y: 84 }, { x: 18, y: 84 }] },
        ],
        npcs: [
          { id: "gg_npc_dibbler", image: P + "gg-dibbler-keyed.png", x: 31, y: 88, scale: 0.95, facing: "right", talkHotspotId: "gg_talk_dibbler" },
        ],
        exitEdges: {
          left: { targetSceneId: "gg_watchhouse", label: "the Watch House" },
          right: {
            targetSceneId: "gg_lodge",
            label: "the Shades",
            gating: { requiresFlags: ["gg_lodge_rumor"] },
            lockedLine: "The Shades, after dark? Not without a reason, and right now all you have is appetite.",
          },
        },
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
            id: "gg_kennels_door",
            label: "the dragon kennels door",
            /* foot line sits below the left wall obstacle band (y 66–78) so
               the walker can stand at the door step and reach the marker */
            bounds: { x: 8, y: 44, w: 8, h: 36 },
          cursor: "go",
          gating: { requiresItems: ["gg_cast"] },
          customFailMessage: "The Pseudopolis Yard kennels. Carrot promised to show Lady Ramkin the scale cast first — he never breaks a promise.",
          action: { type: "goToScene", targetSceneId: "gg_kennels" },
          verbs: { look: { type: "showText", text: "A door with scorch marks at nose height, and the smell of sulphur and warm biscuits drifting through." } },
        },
        {
          id: "gg_hs_signpost",
          label: "signpost",
          bounds: { x: 9, y: 18, w: 13, h: 44 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "UNSEEN UNIVERSITY. PSEUDOPOLIS YARD. MENDED DRUM. NIGHT WATCH. Somewhere in that list is a career, and three are places to avoid it." },
        },
        {
          id: "gg_hs_tower",
          label: "Unseen University",
          bounds: { x: 55, y: 3, w: 26, h: 42 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "The tower of Unseen University, where the wizards are doing absolutely nothing about the dragon. It is what they are best at." },
        },
        {
          id: "gg_hs_chickens",
          label: "chickens",
          bounds: { x: 38, y: 86, w: 24, h: 13 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Chickens, pecking at the cobbles with the confidence of animals that have never once been arrested. They look like they know something." },
        },
        {
          id: "gg_hs_sausage",
          label: "sausage on the grill",
          bounds: { x: 27, y: 44, w: 9, h: 9 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "gg_sausage", text: "You take a sausage-inna-bun straight off Dibbler's grill. It is hot, it is heavy, and it is possibly a sausage." },
          verbs: { look: { type: "showText", text: "Sausages, sizzling with intent. The sign says FINE SAUSAGES. CHEAP. NO HORSE. The sign is doing a lot of work there." } },
        },
        {
          id: "gg_talk_dibbler",
          label: "Dibbler",
          bounds: { x: 27, y: 40, w: 16, h: 52 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
            {
              id: "gg_t_odd",
              label: "Seen anything odd lately?",
              flagSet: "gg_lodge_rumor",
              beats: [
                { id: "gg_d_o1", characterId: "gg_dibbler", text: "Odd? HOODED ONES, that's what. Bought me out of sausages, they did, then off up the alley behind the old chandler's. Chalk all over their boots. CHALK, mark you." },
                { id: "gg_d_o2", characterId: "gg_carrot", text: "Hooded ones. Chalk. Thank you, Mr Dibbler, you've been a great help to the Watch." },
                { id: "gg_d_o3", characterId: "gg_dibbler", text: "I'm a great help to everyone, that's my trouble. That'll be two pennies for the bun you've already taken, by the way." },
              ],
            },
            {
              id: "gg_t_dragons",
              label: "What do you know about dragons?",
              repeatable: true,
              beats: [
                { id: "gg_d_d1", characterId: "gg_dibbler", text: "Dragons? Never seen one! Not me! There was a fella selling 'genuine dragon eggs' down the Shades. They were turnips. TURNIPS. Where's the enterprise in turnips?" },
              ],
            },
            {
              id: "gg_t_sausage",
              label: "These sausages smell... distinctive.",
              repeatable: true,
              beats: [
                { id: "gg_d_s1", characterId: "gg_dibbler", text: "Distinctive! That's a kind word for it, that is. Recipe's a family secret. Mostly the secret is the recipe." },
              ],
            },
          ],
              topicPrompt: "Dibbler grins like a man who has already added up what you owe him.",
              topicLeaveLabel: "Carrot backs away, checking his fingers.",
          },
        },
      ],
      choices: [],
    },

    /* ----------------------------------------- dragon kennels (p3) ---- */
    {
      id: "gg_kennels",
      title: "The Dragon Kennels",
      nodeType: "stage",
      note: "Pass 3 stage. Lady Ramkin among the swamp dragons; the scale cast unlocks her lore. Left edge back to the street.",
      background: P + "gg-kennels.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.14 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 9, y: 88 },
        entrySpawns: { gg_street: { x: 9, y: 88 } },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 72, bottom: 96 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "LADY SYBIL RAMKIN'S DRAGON KENNELS. SMELLS OF SULPHUR AND WARM BISCUITS.",
        obstacles: [],
        occluders: [],
        npcs: [
          {
            id: "gg_npc_ramkin",
            image: P + "gg-ramkin-keyed.png",
            sheet: {
              image: P + "gg-ramkin-walk-keyed.png",
              frameWidth: 335,
              frameHeight: 603,
              animations: { walk: { frames: [0, 1, 2, 3], fps: 7 }, idle: { frames: [0] } },
              pixelated: false,
            },
            x: 66,
            y: 88,
            scale: 1.0,
            facing: "left",
            talkHotspotId: "gg_talk_ramkin",
            /* feeding rounds between the terrariums — a standing-to-patrol
               actress, so the walk sheet actually gets used */
            patrol: [
              { x: 66, y: 88, pause: 4, facing: "left" },
              { x: 40, y: 80, pause: 3, facing: "left", say: "Shh, shh. Mind the sparks, Mabel." },
              { x: 20, y: 76, pause: 3, facing: "right", say: "No, Barnaby, you may not have the kettle." },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_kennels_exit",
          label: "back to the street",
          bounds: { x: 0, y: 50, w: 2, h: 45 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "gg_street" },
        },
        {
          id: "gg_talk_ramkin",
          label: "Lady Ramkin",
          bounds: { x: 60, y: 52, w: 13, h: 40 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_ramkin_greet",
                label: "Good evening, Lady Ramkin",
                beats: [
                  { id: "gg_r_g1", characterId: "gg_ramkin", text: "Oh! A visitor. Mind the smoke — swamp dragons, you know. They cough, they glow, and occasionally they simply pop, like overinflated paper bags with opinions." },
                  { id: "gg_r_g2", characterId: "gg_carrot", text: "Corporal Carrot Ironfoundersson, City Watch. We saw something in the sky over the Shades, ma'am. Something big, and it breathed fire." },
                  { id: "gg_r_g3", characterId: "gg_ramkin", text: "Big, you say? Then it wasn't one of mine. Nothing of mine gets big. That is the whole point of swamp dragons." },
                ],
                flagSet: "gg_met_ramkin",
              },
              {
                id: "gg_t_ramkin_cast",
                label: "Show her the cast of the scale",
                gating: { requiresItems: ["gg_cast"] },
                beats: [
                  { id: "gg_r_c1", characterId: "gg_carrot", text: "We made a cast of a scale it shed, ma'am. We thought you ought to see it." },
                  { id: "gg_r_c2", characterId: "gg_ramkin", text: "Oh. Oh dear. That's not a swamp dragon scale, corporal — that is a REAL dragon. They're supposed to be extinct. Someone has gone and SUMMONED one." },
                  { id: "gg_r_c3", characterId: "gg_ramkin", text: "Summoning dragons is forbidden by the oldest laws of the city — the sort of laws nobody reads, right up until something very large is roosting over your house." },
                  { id: "gg_r_c4", characterId: "gg_ramkin", text: "Bring me anything else you find, corporal. And mind your eyebrows." },
                  { id: "gg_r_c5", characterId: "gg_carrot", text: "(So it IS a summoned dragon. Someone at the University would know about summoning — though wizards never volunteer anything.)" },
                ],
                flagSet: "gg_ramkin_lore",
              },
              {
                id: "gg_t_ramkin_dragons",
                label: "Tell me about swamp dragons",
                beats: [
                  { id: "gg_r_d1", characterId: "gg_ramkin", text: "They are sweethearts. Fragile, explosive, devoted sweethearts. I feed them, I keep their terrariums warm, and I stand well back on cold mornings." },
                  { id: "gg_r_d2", characterId: "gg_ramkin", text: "There are those who call it a dangerous hobby. I call it character-building for the eyebrows." },
                ],
              },
              {
                id: "gg_t_ramkin_errol",
                label: "How is Errol settling in?",
                gating: { requiresFlags: ["gg_errol_taken"] },
                beats: [
                  { id: "gg_r_e1", characterId: "gg_ramkin", text: "Errol! Oh, he is a puzzle. All my dragons inhale to breathe fire — he seems to do it the other way round. No one has the faintest idea why." },
                  { id: "gg_r_e2", characterId: "gg_ramkin", text: "Perhaps he's simply polite. Dragons are very sensitive to etiquette, corporal. Remember that, if you ever meet one." },
                  { id: "gg_r_e3", characterId: "gg_carrot", text: "(The other way round. He says nothing. He just files the thought away, carefully, like a good watchman.)" },
                ],
              },
            ],
            topicPrompt: "Lady Ramkin is feeding something small and smoky.",
            topicLeaveLabel: "Carrot waves to the smoke.",
          },
        },
        {
          id: "gg_hs_terrariums",
          label: "dragon terrariums",
          bounds: { x: 6, y: 30, w: 52, h: 42 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Dozens of glass terrariums, each with a little green dragon dozing in the warmth. One of them is glowing gently. You decide not to ask." },
        },
        {
          id: "gg_hs_kettle",
          label: "the famous kettle",
          bounds: { x: 27, y: 70, w: 10, h: 16 },
          cursor: "look",
          action: { type: "showText", text: "The Watch's kettle, on loan to the kennels. A small dragon is gnawing the spout affectionately. It survived the Shades and two explosions; it may not survive the teething." },
        },
        {
          id: "gg_hs_hearth",
          label: "the hearth",
          bounds: { x: 64, y: 36, w: 12, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "A low fire, a sleeping dog, and a warm stone wall. Half the kennels' heating budget is 'a dog called Garry', according to the ledger." },
        },
        {
          id: "gg_hs_moon",
          label: "the window",
          bounds: { x: 6, y: 8, w: 24, h: 24 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "The moon over Ankh-Morpork, seen through leaded glass. Somewhere out there, something big is roosting on a roof and eating sheep." },
        },
        {
          id: "gg_hs_registry",
          label: "the dragon registry",
          bounds: { x: 78, y: 64, w: 20, h: 26 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "ANKH-MORPORK DRAGON REGISTRY, in a firm hand: Snifter, Mabel, Barnaby, Errol (adopted, Watch). Below that, a letter sealed in red wax. Lady Ramkin's correspondence is nobody's business but her own." },
        },
        {
          id: "gg_hs_basket",
          label: "Errol's basket",
          bounds: { x: 46, y: 56, w: 12, h: 16 },
          cursor: "look",
          isRepeatable: true,
          gating: { requiresFlags: ["gg_errol_taken"] },
          customFailMessage: "An empty basket with scorch marks. Someone small and polite lived here once.",
          action: { type: "showText", text: "Errol's basket, lined with fireproof asbestos (a gift from Lady Ramkin). Errol himself is off doing whatever it is Errols do, which nobody knows." },
        },
      ],
      choices: [],
    },

    /* ------------------------------------------------ the lodge -------- */
    {
      id: "gg_lodge",
      title: "The Lodge in the Shades",
      nodeType: "stage",
      note: "Eavesdrop on the ritual (TALK the circle) to set gg_ritual_seen; the book unlocks after; Wonse gloats after; right edge opens onto the burning city.",
      background: P + "gg-lodge.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.1 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 88, y: 93 },
        speed: 19,
        reach: 8,
        keyboard: true,
        floor: { top: 62, bottom: 96 },
        depthScale: 0.28,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE UNIQUE AND SUPREME LODGE OF THE ELUCIDATED BRETHREN OF THE EBON NIGHT. (SHH.)",
        /* Lectern is a walk-behind occluder so the chained book's foot line is
           reachable; Wonse stands in front of it. */
        obstacles: [],
        occluders: [
          { id: "gg_oc_lectern", label: "lectern", baseline: 82, points: [{ x: 2, y: 60 }, { x: 28, y: 60 }, { x: 28, y: 82 }, { x: 2, y: 82 }] },
        ],
        npcs: [
          { id: "gg_npc_wonse", image: P + "gg-wonse-keyed.png", x: 17, y: 86, scale: 1.0, facing: "right", talkHotspotId: "gg_talk_wonse" },
        ],
        exitEdges: {
          left: { targetSceneId: "gg_street", label: "back to the street" },
          right: {
            targetSceneId: "gg_coronation",
            label: "the city",
            gating: { requiresFlags: ["gg_ritual_seen"] },
            lockedLine: "Something is very wrong on the other side of that door. But first: evidence.",
          },
        },
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_talk_circle",
          label: "eavesdrop on the circle",
          bounds: { x: 40, y: 52, w: 30, h: 34 },
          cursor: "talk",
          action: {
            type: "startDialogue",
            flagSet: "gg_ritual_seen",
            topics: [
            {
              id: "gg_t_ritual",
              label: "Listen to the chanting (what could go wrong)",
              repeatable: false,
              beats: [
                { id: "gg_w_r1", characterId: "gg_wonse", text: "BRETHREN! The city sleeps on its coins like a dog on a grave. Tonight we summon! Tonight, the Ebon Night becomes... considerably more ebon!" },
                { id: "gg_w_r2", characterId: "gg_wonse", text: "O great worm of the void! Accept our humble chalk! Accept our candles! Accept—" },
                {
                  id: "gg_w_r3",
                  characterId: "gg_narrator",
                  text: "The circle ignites. Something vast leans against the inside of the world, considers the chalk, and pushes through.",
                  background: P + "gg-rooftops.jpg",
                  backgroundHold: false,
                  backgroundTransition: "fade",
                  cinematic: { mode: "shake", shakeAmount: 0.4 },
                },
                { id: "gg_w_r4", characterId: "gg_wonse", text: "It WORKED! It worked! Now it does exactly as I command! It will— ...it is not doing as I. Brethren? BRETHREN, why is everyone running?" },
                { id: "gg_w_r5", characterId: "gg_carrot", text: "I should perhaps write all of this down. Word for word. It'll be the easiest paperwork of my career." },
              ],
            },
          ],
              topicPrompt: "The chanting rises. The candles lean in to listen.",
              topicLeaveLabel: "Carrot stops taking mental notes.",
          },
        },
        {
          id: "gg_hs_book",
          label: "the chained book",
          bounds: { x: 6, y: 40, w: 22, h: 26 },
          cursor: "take",
          gating: { requiresFlags: ["gg_ritual_seen"] },
          customFailMessage: "The Brethren are mid-chant and mid-circle. Best not.",
          action: { type: "giveItem", itemGranted: "gg_book", text: "You lift The Summoning of Dragons off the lectern. The chains were decorative, which says a great deal about the Brethren's security thinking." },
          verbs: { look: { type: "showText", text: "THE SUMMONING OF DRAGONS, stolen from the Library of Unseen University. The Library wants everything back, eventually." } },
        },
        {
          id: "gg_hs_chalk",
          label: "chalk circle",
          bounds: { x: 42, y: 62, w: 26, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Chalk runes in a confident pentagon. The geometry is self-assured in a way only truly bad intentions can be." },
        },
        {
          id: "gg_hs_candles",
          label: "black candles",
          bounds: { x: 84, y: 40, w: 12, h: 34 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "Black candles, bought in crates from a man who asked no questions, because Dibbler asked them all instead." },
        },
        {
          id: "gg_talk_wonse",
          label: "Supreme Grand Master",
          bounds: { x: 11, y: 46, w: 13, h: 40 },
          cursor: "talk",
          isRepeatable: true,
          gating: { requiresFlags: ["gg_ritual_seen"] },
          customFailMessage: "He would notice you. You would be noticed. Not yet.",
          action: {
            type: "startDialogue",
            topics: WONSE_TOPICS,
            topicPrompt: "The Supreme Grand Master regards you like a stain on the chalk.",
            topicLeaveLabel: "Carrot leaves him to his summoning.",
          },
          states: [
            {
              id: "gg_w_gloat",
              action: {
                type: "startDialogue",
                flagSet: "gg_wonse_plan",
                topics: WONSE_TOPICS,
                topicPrompt: "The Supreme Grand Master regards you like a stain on the chalk.",
                topicLeaveLabel: "Carrot leaves him to his summoning.",
              },
            },
            {
              id: "gg_w_after",
              when: { requiresFlags: ["gg_wonse_plan"] },
              action: {
                type: "startDialogue",
                topics: WONSE_TOPICS,
                topicPrompt: "The Supreme Grand Master regards you like a stain on the chalk.",
                topicLeaveLabel: "Carrot leaves him to his summoning.",
              },
            },
          ],
        },
      ],
      choices: [],
    },

    /* ------------------------------------------------ the burning ------ */
    {
      id: "gg_burning",
      title: "The City Burns",
      nodeType: "standard",
      letterbox: true,
      background: P + "gg-rooftops.jpg",
      cinematic: { mode: "pan", panDirection: "left", panDistance: 1.6, parallaxDepth: 0.18 },
      particles: "smoke",
      prose:
        "By the time you reach the high rooftops, Ankh-Morpork is a torch relay with citizens. The dragon circles the palace the way a cat circles a particularly good nap.",
      dialogueBeats: [
        { id: "gg_b_b1", characterId: "gg_wonse", text: "PEOPLE OF ANKH-MORPORK! The dragon has graciously accepted the position of KING! It requires tribute! Gold! And a monthly— a monthly PERSON!" },
        { id: "gg_b_b2", characterId: "gg_vimes", text: "Right. It flies over the river and past the distillery every night at eight, like clockwork. It's a creature of habit. Like arsonists. Like everyone." },
        { id: "gg_b_b3", characterId: "gg_vimes", text: "Colon, the ballista goes on the distillery roof, behind a thousand gallons of the strongest whisky in the city. Carrot— try not to be heroic. You're always being heroic. It's a bad habit, like jogging." },
        { id: "gg_b_b4", characterId: "gg_carrot", text: "Yes, sir! I'll be entirely unheroic, sir! Heroism isn't in the book, sir!" },
      ],
      hotspots: [],
      choices: [
        { id: "gg_b_c1", text: "To the whisky distillery — ambush it over the vats", targetSceneId: "gg_distillery" },
        { id: "gg_b_c2", text: "Suggest the Watch refer the matter to a committee", targetSceneId: "gg_committee" },
        {
          id: "gg_b_c3",
          text: "Refuse to kneel to the new king",
          targetSceneId: "gg_cell",
          consequences: { setFlags: ["gg_jailed"] },
        },
      ],
    },

    /* ----------------------------------------- coronation (p5) ------ */
    {
      id: "gg_coronation",
      title: "The Crowning",
      nodeType: "standard",
      letterbox: true,
      background: P + "gg-coronation.jpg",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 1.4, parallaxDepth: 0.18 },
      particles: "smoke",
      prose:
        "By the time the Watch reaches the square, the ceremony is underway. The city kneels with the careful enthusiasm of people who have read the terms and conditions.",
      dialogueBeats: [
        { id: "gg_co_b1", characterId: "gg_wonse", text: "PEOPLE OF ANKH-MORPORK! Your new KING! Long may he— long may he ANYTHING!" },
        { id: "gg_co_b2", characterId: "gg_dragon", text: "TRIBUTE. GOLD. AND A MONTHLY PERSON, CHOSEN BY LOT. THIS IS MY FIRST DECREE. I AM VERY GOOD AT DECREEING." },
        { id: "gg_co_b3", characterId: "gg_vimes", text: "Right. Note the route it flies when it's showing off: river, distillery roof, eight o'clock. Creatures of habit. Like arsonists. Like everyone." },
        { id: "gg_co_b4", characterId: "gg_carrot", text: "It's crowned, sir. It's actually crowned. Is there a section in the book for arresting a king, sir?" },
        { id: "gg_co_b5", characterId: "gg_vimes", text: "There's a section for everything, lad. Tonight we start with arson. To the rooftops." },
      ],
      hotspots: [],
      choices: [
        { id: "gg_co_c1", text: "To the rooftops — the city musters", targetSceneId: "gg_burning" },
      ],
    },

    /* ----------------------------------------- palace cell (p4) ------- */
    {
      id: "gg_cell",
      title: "The Palace Cells",
      nodeType: "stage",
      note: "Pass 4 stage. Vimes and the Patrician share a cell; the Librarian picks the lock once asked. Door to the park.",
      background: P + "gg-cell.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.12 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 30, y: 90 },
        entrySpawns: { gg_burning: { x: 30, y: 90 } },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE PALACE CELLS. GUESTS OF THE NEW KING.",
        obstacles: [],
        occluders: [],
        npcs: [
          { id: "gg_npc_vimes_cell", image: P + "gg-vimes-keyed.png", x: 45, y: 88, scale: 1.0, facing: "left", talkHotspotId: "gg_talk_vimes_cell" },
          { id: "gg_npc_vetinari_cell", image: P + "gg-vetinari-keyed.png", x: 20, y: 86, scale: 1.0, facing: "right", talkHotspotId: "gg_talk_vetinari_cell" },
          { id: "gg_npc_librarian", image: P + "gg-librarian-keyed.png", x: 88, y: 88, scale: 0.95, facing: "left", talkHotspotId: "gg_talk_librarian" },
          {
            id: "gg_npc_rat",
            image: P + "gg-rat-keyed.png",
            x: 33,
            y: 80,
            scale: 0.22,
            facing: "right",
            patrol: [
              { x: 33, y: 80, pause: 3, say: "Squeak." },
              { x: 58, y: 84, pause: 2, facing: "right", say: "Squeak, squeak." },
              { x: 40, y: 88, pause: 3, facing: "left", say: "(The rats of the Palace send their regards.)" },
            ],
          },
        ],
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_cell_door",
          label: "the cell door",
          bounds: { x: 76, y: 40, w: 16, h: 50 },
          cursor: "go",
          gating: { requiresFlags: ["gg_freed"] },
          customFailMessage: "Locked. The lock regards you with something like professional pride.",
          action: { type: "goToScene", targetSceneId: "gg_stake" },
          verbs: { look: { type: "showText", text: "Palace oak, fitted with a lock that has never once been picked. Until tonight, presumably." } },
        },
        {
          id: "gg_cell_bars",
          label: "the barred window",
          bounds: { x: 25, y: 10, w: 28, h: 42 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "Moonlight, iron bars, and the rooftops of a city that now has a dragon for a king. The rat has a better view than anyone, and knows it." },
        },
        {
          id: "gg_cell_tally",
          label: "the tally marks",
          bounds: { x: 30, y: 55, w: 16, h: 12 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Thirty-one days of scratches. None of them yours. You add one more, for the record." },
        },
        {
          id: "gg_cell_spoon",
          label: "the spoon",
          bounds: { x: 27, y: 88, w: 10, h: 8 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Somebody has been eating very politely. The spoon is bent into a question mark. Hope, however, is not." },
        },
        {
          id: "gg_talk_vimes_cell",
          label: "Vimes",
          bounds: { x: 40, y: 54, w: 12, h: 38 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_vc_out",
                label: "How do we get out, sir?",
                beats: [
                  { id: "gg_vc_o1", characterId: "gg_vimes", text: "The lock opens from the outside, lad. That is the entire business model of a lock." },
                  { id: "gg_vc_o2", characterId: "gg_carrot", text: "Then we need someone outside, sir. Someone small, clever, and not employed by the Palace." },
                  { id: "gg_vc_o3", characterId: "gg_vimes", text: "I would settle for anyone not employed by the Palace. Look who's at the door." },
                ],
              },
              {
                id: "gg_t_vc_patrician",
                label: "The Patrician seems... comfortable.",
                beats: [
                  { id: "gg_vc_p1", characterId: "gg_vimes", text: "He's redeploying the straw. Says the previous tenant had it wrong. I've stopped arguing; he's usually right, and it saves time." },
                ],
              },
            ],
            topicPrompt: "Captain Vimes sits on the cot like a man waiting for a bus that owes him money.",
            topicLeaveLabel: "Carrot leaves Vimes to his sulk.",
          },
        },
        {
          id: "gg_talk_vetinari_cell",
          label: "The Patrician",
          bounds: { x: 14, y: 52, w: 13, h: 38 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_vet_ok",
                label: "Are you quite alright, sir?",
                beats: [
                  { id: "gg_vt_o1", characterId: "gg_vetinari", text: "I share a cell with the only honest cop in the city and a rat with impeccable manners. It is the best staff arrangement I have had in years." },
                  { id: "gg_vt_o2", characterId: "gg_vetinari", text: "Do not fret. Tyrants are like bad weather: the city will endure mine, learn from it, and bill me for the experience." },
                ],
              },
              {
                id: "gg_t_vet_rats",
                label: "The rats seem fond of you.",
                beats: [
                  { id: "gg_vt_r1", characterId: "gg_vetinari", text: "The rats of the Palace have always been my most reliable department. They inform me the dragon roosts over the plaza at eight, flies the river route, and never, ever varies. Habit, corporal, is the tyrant's only weakness." },
                ],
                flagSet: "gg_rat_intel",
              },
            ],
            topicPrompt: "The Patrician has arranged the straw into a better bed than the palace ever gave him.",
            topicLeaveLabel: "Carrot leaves the Patrician to his court of rats.",
          },
        },
        {
          id: "gg_talk_librarian",
          label: "The Librarian",
          bounds: { x: 82, y: 54, w: 13, h: 38 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_lib_unlock",
                label: "Ook? (Can you open the lock?)",
                beats: [
                  { id: "gg_l_u1", characterId: "gg_librarian", text: "Ook. Ook ook. (He produces a bent hairpin and the dignified air of a man who has picked better locks for worse reasons.)" },
                  { id: "gg_l_u2", characterId: "gg_librarian", text: "OOK. (The lock opens with a click that sounds, somehow, apologetic.)" },
                  { id: "gg_l_u3", characterId: "gg_carrot", text: "Thank you, sir. Er — ook. Right. The park, then, before the dragon finishes its dinner arrangements!" },
                ],
                flagSet: "gg_freed",
              },
              {
                id: "gg_t_lib_who",
                label: "Who sent you?",
                beats: [
                  { id: "gg_l_w1", characterId: "gg_librarian", text: "Ook. (He points at the rat, who tips an imaginary hat. The Library and the Palace rats have an understanding, it transpires. Books travel.)" },
                ],
              },
            ],
            topicPrompt: "The Librarian hangs from the door hatch, radiating quiet competence.",
            topicLeaveLabel: "Carrot salutes the Librarian, who ooks back.",
          },
        },
      ],
      choices: [],
    },

    /* ----------------------------------------- the stake (p4) --------- */
    {
      id: "gg_stake",
      title: "The Park, At Dusk",
      nodeType: "stage",
      note: "Pass 4 stage. Sybil staked; the crowned dragon gloats until cited at with by-laws. Then the distillery.",
      background: P + "gg-park.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.14 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 50, y: 94 },
        entrySpawns: { gg_cell: { x: 50, y: 94 } },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 72, bottom: 96 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE PARK. THE CITY'S FIRST MONTHLY PERSON IS NOT IMPRESSED.",
        obstacles: [],
        occluders: [],
        npcs: [
          { id: "gg_npc_sybil", image: P + "gg-sybil-stake-keyed.png", x: 50, y: 84, scale: 0.95, facing: "left", talkHotspotId: "gg_talk_sybil" },
          { id: "gg_npc_dragon", image: P + "gg-dragonking-keyed.png", x: 76, y: 90, scale: 1.6, facing: "left", talkHotspotId: "gg_talk_dragon" },
        ],
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_stake_exit",
          label: "race to the distillery",
          bounds: { x: 97, y: 55, w: 3, h: 41 },
          cursor: "go",
          gating: { requiresFlags: ["gg_dragon_dozes"] },
          customFailMessage: "The dragon is watching the park like a creditor. Not yet.",
          action: { type: "goToScene", targetSceneId: "gg_distillery" },
        },
        {
          id: "gg_stake_rope",
          label: "the ropes",
          bounds: { x: 46, y: 66, w: 9, h: 14 },
          cursor: "use",
          gating: { requiresFlags: ["gg_dragon_dozes"] },
          customFailMessage: "Not while the dragon is watching. It considers the stake its dinner table.",
          action: { type: "showText", text: "The ropes fall away. Lady Ramkin rubs her wrists and files the stake under 'things to have words about'.", flagSet: "gg_sybil_free" },
        },
        {
          id: "gg_stake_crowd_l",
          label: "the crowd",
          bounds: { x: 2, y: 40, w: 14, h: 20 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "The crowd keeps a respectful distance, and a respectful volume, and occasionally waves at the dragon, because you do not upset a king." },
        },
        {
          id: "gg_stake_crowd_r",
          label: "the other crowd",
          bounds: { x: 86, y: 40, w: 13, h: 20 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "Someone is selling programmes. Someone else is selling 'genuine dragon scale' offcuts, which are shavings of a park bench." },
        },
        {
          id: "gg_talk_sybil",
          label: "Lady Ramkin",
          bounds: { x: 44, y: 48, w: 12, h: 40 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_syb_ok",
                label: "Lady Ramkin! Are you alright?",
                beats: [
                  { id: "gg_s_o1", characterId: "gg_ramkin", text: "I am tied to a stake in my own park with hemp rope, corporal. Hemp. Against a dragon. The rope is the greater insult." },
                  { id: "gg_s_o2", characterId: "gg_ramkin", text: "My dragons are fed, my terrariums are locked, and Garry has the run of the house. If I am eaten, see that he keeps the armchair." },
                ],
              },
              {
                id: "gg_t_syb_plan",
                label: "We'll have you out in a moment.",
                beats: [
                  { id: "gg_s_p1", characterId: "gg_ramkin", text: "Of course you will. And when this is over, the Watch is having a kettle, whether it wants one or not." },
                ],
              },
            ],
            topicPrompt: "Lady Ramkin tests the ropes with the air of a health-and-safety inspector.",
            topicLeaveLabel: "Carrot steps back to think.",
          },
        },
        {
          id: "gg_talk_dragon",
          label: "The Dragon King",
          bounds: { x: 66, y: 30, w: 28, h: 58 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_drg_tribute",
                label: "You can't just EAT people!",
                beats: [
                  { id: "gg_d_t1", characterId: "gg_dragon", text: "THE CITY VOTED. THE CITY KNELT. THE CITY PAYS TRIBUTE. THIS IS WHAT KINGS ARE FOR. I HAVE READ THE BOOK." },
                  { id: "gg_d_t2", characterId: "gg_carrot", text: "Then you'll know the book also says a king who eats his voters is a tyrant, sir. Dragon. Your Majesty. Sir." },
                ],
              },
              {
                id: "gg_t_drg_bylaws",
                label: "Cite the park by-laws at it",
                beats: [
                  { id: "gg_d_b1", characterId: "gg_carrot", text: "By-law nine: no combustion within park limits. By-law fourteen: no livestock grazing on the flower beds. By-law thirty-one: no sovereign, crowned or otherwise, loitering with intent to devour." },
                  { id: "gg_d_b2", characterId: "gg_dragon", text: "…THE SMALL SHINY ONE RECITES THE ORDINANCES. HOW DULL. HOW PERFECTLY, CRUSHINGLY DULL." },
                  { id: "gg_d_b3", characterId: "gg_narrator", text: "Boredom is older than fire. The dragon coils up on the flower bed to sulk, crown askew, one eye shut, tail flicking like a cat's. Now, while it dozes." },
                ],
                flagSet: "gg_dragon_dozes",
              },
            ],
            topicPrompt: "The Dragon King regards you the way a cat regards a scheduled meal.",
            topicLeaveLabel: "Carrot backs away slowly, hat in hand.",
          },
        },
      ],
      choices: [],
    },

    /* ------------------------------------------------ committee -------- */
    {
      id: "gg_committee",
      title: "A Brief Detour Into Bureaucracy",
      nodeType: "standard",
      background: P + "gg-street.jpg",
      prose:
        "You suggest a committee. Vimes looks at you the way a man looks at a wet sausage. 'The Patrician's committees,' he says, 'have been studying the damp in the palace since before you were born. The dragon will be retired of old age before the sub-committee finds a chair.' Somewhere overhead, a roof becomes lava. The point makes itself.",
      dialogueBeats: [],
      hotspots: [],
      choices: [{ id: "gg_cm_c1", text: "Right — the distillery. NOW.", targetSceneId: "gg_distillery" }],
    },

    /* ------------------------------------------------ distillery ------- */
    {
      id: "gg_distillery",
      title: "The Distillery Roof",
      nodeType: "standard",
      letterbox: true,
      background: P + "gg-distillery.jpg",
      cinematic: { mode: "zoom-hold", focalPoint: "60% 30%", zoomDuration: 6 },
      particles: "smoke",
      prose: "The distillery roof smells of oak, copper, and a thousand gallons of highly flammable decision. Below, the river carries the dragon's reflection towards you like a rumour.",
      dialogueBeats: [
        { id: "gg_ds_b1", characterId: "gg_narrator", text: "Eight o'clock. The dragon arrives exactly on time. Punctuality is the politeness of arson." },
        { id: "gg_ds_b2", characterId: "gg_vimes", text: "When it's over the vats— on my mark. Colon—" },
        { id: "gg_ds_b3", characterId: "gg_colon", text: "S'cuse me, sir. It's looking right at us, sir." },
      ],
      hotspots: [],
      choices: [
        {
          id: "gg_ds_c1",
          text: "DUCK behind the casks!",
          quickTime: true,
          qtePrompt: "DUCK!",
          qteHeartbeat: true,
          qteShakyCam: true,
          timeLimitSeconds: 7,
          targetSceneId: "gg_plaza",
          timedOutTargetSceneId: "gg_end_ash",
          timedOutConsequences: { setFlags: ["gg_roasted"] },
        },
        {
          id: "gg_ds_c2",
          text: "Stand your ground and fire the bolt early",
          targetSceneId: "gg_plaza",
          consequences: { setFlags: ["gg_early"] },
        },
      ],
    },

    /* ------------------------------------------------ the plaza -------- */
    {
      id: "gg_plaza",
      title: "The Plaza, Afterwards",
      nodeType: "standard",
      letterbox: true,
      background: P + "gg-plaza.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.12 },
      particles: "smoke",
      prose:
        "The fireball catches the dragon mid-monologue. It descends into the plaza with the dignity of a chandelier, and lies dazed among the cabbages while the mob advances with the particular courage of people who have just found a stick.",
      dialogueBeats: [
        { id: "gg_p_b1", characterId: "gg_vimes", text: "Carrot. It's your collar. Do it properly." },
        { id: "gg_p_b2", characterId: "gg_carrot", text: "You are hereby placed under arrest for arson, trespass, and demanding tribute. You have the right to remain silent. Anything you incinerate may be taken down and used against you." },
        {
          id: "gg_p_b3",
          characterId: "gg_wonse",
          text: "FOOLS! The ritual continues! I am the Supreme— I am the LAW around here! I shall summon ANOTHER!",
          conditionRule: { requiresFlags: ["gg_wonse_plan"] },
        },
        {
          id: "gg_p_b4",
          characterId: "gg_vimes",
          text: "Throw the book at him, Carrot.",
          conditionRule: { requiresItems: ["gg_book"] },
        },
        {
          id: "gg_p_b5",
          characterId: "gg_carrot",
          text: "Yes, sir! The Summoning of Dragons— and, as it happens, the Laws and Ordinances of Ankh-Morpork. Both. At once. Directly.",
          conditionRule: { requiresItems: ["gg_book"] },
        },
        {
          id: "gg_p_b6",
          characterId: "gg_narrator",
          text: "Wonse, mid-summoning, discovers that the Laws and Ordinances weigh four stone, and that the lodge floorboards, rotten for decades, take the hint. The city files it under 'resolved'.",
          conditionRule: { requiresItems: ["gg_book"] },
        },
        {
          id: "gg_p_b7",
          characterId: "gg_dragon",
          text: "RRRAAAUUM?",
          conditionRule: { requiresFlags: ["gg_errol_taken"] },
        },
        {
          id: "gg_p_b8",
          characterId: "gg_carrot",
          text: "Errol! You came! Oh, you've been polishing your scales, haven't you—",
          conditionRule: { requiresFlags: ["gg_errol_taken"] },
        },
        {
          id: "gg_p_b9",
          characterId: "gg_narrator",
          text: "Errol hangs in the air on a reversed flame, silver and impossible, making the noise swamp dragons make when showing off for a lady. Because the great dragon IS a lady. Errol was never fighting. Errol was flirting.",
          conditionRule: { requiresFlags: ["gg_errol_taken"] },
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "gg_p_c1",
          text: "Stand back, everyone — Errol is courting",
          targetSceneId: "gg_end_gold",
          gating: { requiresFlags: ["gg_errol_taken"] },
        },
        {
          id: "gg_p_c2",
          text: "Read the dragon her rights. Twice, slowly.",
          targetSceneId: "gg_end_silver",
        },
        {
          id: "gg_p_c3",
          text: "Escort the Patrician back to his palace first",
          targetSceneId: "gg_throne",
          consequences: { setFlags: ["gg_throne_visit"] },
        },
      ],
    },

    /* ----------------------------------------- throne room (p5) ----- */
    {
      id: "gg_throne",
      title: "The Throne Room, Restored",
      nodeType: "stage",
      note: "Pass 5 epilogue stage. The Patrician rewards the Watch; then the endings.",
      background: P + "gg-throne.jpg",
      cinematic: { mode: "static", parallaxDepth: 0.12 },
      stage: {
        plateAspectRatio: 1.79,
        spawn: { x: 50, y: 92 },
        entrySpawns: { gg_plaza: { x: 50, y: 92 } },
        speed: 20,
        reach: 8,
        keyboard: true,
        floor: { top: 70, bottom: 95 },
        depthScale: 0.3,
        hints: "proximity",
        objectVerbMenu: true,
        sentenceLine: true,
        enterCaption: "THE THRONE ROOM. SOMEONE HAS ALREADY PUT THE KETTLE ON.",
        obstacles: [],
        occluders: [],
        npcs: [
          { id: "gg_npc_vetinari_throne", image: P + "gg-vetinari-keyed.png", x: 50, y: 78, scale: 1.0, facing: "right", talkHotspotId: "gg_talk_vetinari_throne" },
          { id: "gg_npc_vimes_throne", image: P + "gg-vimes-keyed.png", x: 30, y: 88, scale: 1.0, facing: "right", talkHotspotId: "gg_talk_vimes_throne" },
          { id: "gg_npc_colon_throne", image: P + "gg-colon-keyed.png", x: 72, y: 88, scale: 0.95, facing: "left", talkHotspotId: "gg_talk_colon_throne" },
        ],
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "gg_throne_gold",
          label: "stand back — Errol is courting",
          bounds: { x: 4, y: 40, w: 10, h: 40 },
          cursor: "go",
          gating: { requiresFlags: ["gg_errol_taken"] },
          customFailMessage: "Nothing to stand back from. Not yet.",
          action: { type: "goToScene", targetSceneId: "gg_end_gold" },
          verbs: { look: { type: "showText", text: "The palace doors, opening on a sky full of stars and one very familiar contrail." } },
        },
        {
          id: "gg_throne_silver",
          label: "read the dragon her rights",
          bounds: { x: 88, y: 40, w: 10, h: 40 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "gg_end_silver" },
          verbs: { look: { type: "showText", text: "The long way round: a desk, a statute book, and forty pages of rights." } },
        },
        {
          id: "gg_throne_look",
          label: "the throne",
          bounds: { x: 42, y: 30, w: 16, h: 34 },
          cursor: "look",
          isRepeatable: true,
          remote: true,
          action: { type: "showText", text: "A modest throne on three steps, freshly scrubbed. The dartboard is propped against it, still in its wrapper. With rules, this time." },
        },
        {
          id: "gg_throne_broom",
          label: "the broom and cabbages",
          bounds: { x: 84, y: 62, w: 12, h: 20 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "The last of the plaza cabbages is being swept out with great dignity. The city's problems, in summary form." },
        },
        {
          id: "gg_talk_vetinari_throne",
          label: "The Patrician",
          bounds: { x: 44, y: 46, w: 13, h: 36 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_vt_reward",
                label: "The city owes you nothing, I believe?",
                beats: [
                  { id: "gg_vt_rw1", characterId: "gg_vetinari", text: "The city owes the Watch a debt, which is a dangerous thing for a city to owe. Ask for anything." },
                  { id: "gg_vt_rw2", characterId: "gg_carrot", text: "A small pay rise, sir. A new kettle. And a dartboard. With rules, this time." },
                  { id: "gg_vt_rw3", characterId: "gg_vetinari", text: "Granted. All of it. Guards, indeed." },
                ],
                flagSet: "gg_rewarded",
              },
              {
                id: "gg_t_vt_dragon",
                label: "What happens to the dragon?",
                beats: [
                  { id: "gg_vt_d1", characterId: "gg_vetinari", text: "The dragon has signed an undertaking to leave the city and write. I understand there are two specks over the rim of the world by now. I shall miss the tribute arrangements. Not the dragon. The paperwork." },
                ],
              },
            ],
            topicPrompt: "The Patrician stands where the throne is, without touching it, which is the whole trick.",
            topicLeaveLabel: "Carrot salutes, and means it.",
          },
        },
        {
          id: "gg_talk_vimes_throne",
          label: "Vimes",
          bounds: { x: 24, y: 54, w: 13, h: 38 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_vt2_proud",
                label: "Did we do well, sir?",
                beats: [
                  { id: "gg_v2_p1", characterId: "gg_vimes", text: "You arrested a dragon, out-read a tyrant, and never once jogged. We do what we can with what the book provides, lad." },
                ],
              },
            ],
            topicPrompt: "Captain Vimes looks at the throne the way a cat looks at a cucumber.",
            topicLeaveLabel: "Vimes goes to find the good biscuits.",
          },
        },
        {
          id: "gg_talk_colon_throne",
          label: "Colon",
          bounds: { x: 66, y: 54, w: 13, h: 38 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "gg_t_c2_birthmark",
                label: "Sarge, about Carrot's birthmark…",
                beats: [
                  { id: "gg_c2_b1", characterId: "gg_colon", text: "Shaped like a crown, it is. And that sword of his, plain as plain, that's the old king's sword-shape, that is. I've thought about it, right here where the throne used to sit." },
                  { id: "gg_c2_b2", characterId: "gg_colon", text: "And I've decided the Watch can't afford a king who files his own reports. So: not my problem. Pass the kettle." },
                ],
              },
            ],
            topicPrompt: "Sergeant Colon guards the new dartboard like it's already owed him money.",
            topicLeaveLabel: "Colon starts drafting the dartboard rules.",
          },
        },
      ],
      choices: [],
    },

    /* ------------------------------------------------ endings ---------- */
    {
      id: "gg_end_gold",
      title: "Ending — Two Specks In The Sky",
      isEnding: true,
      background: P + "gg-errol-flight.jpg",
      cinematic: { mode: "zoom-hold", focalPoint: "55% 30%", zoomDuration: 9 },
      prose:
        "Errol and the lady depart over the city walls, breaking the sound barrier and several by-laws, and become two specks flying off the edge of the world into the star-dotted dark. The Patrician returns to his palace as if he had merely been out for a walk.",
      dialogueBeats: [
        { id: "gg_e_g1", characterId: "gg_vetinari", text: "The city owes the Watch a debt, which is a dangerous thing for a city to owe. Ask for anything." },
        { id: "gg_e_g2", characterId: "gg_colon", text: "A small pay rise, sir. A new kettle. And a dartboard. With rules, this time." },
        { id: "gg_e_g3", characterId: "gg_vetinari", text: "Granted. All of it. Guards, indeed." },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "GUARDS! GUARDS!",
        recap:
          "You joined the Watch, adopted a swamp dragon, clocked the Brethren, threw the book at the Supreme Grand Master, and found the dragon a husband. Sergeant Colon calls it the finest policing he has ever seen. Captain Vimes calls it Tuesday.",
        endsSeason: true,
      },
    },
    {
      id: "gg_end_silver",
      title: "Ending — The Law, Applied",
      isEnding: true,
      background: P + "gg-rooftops.jpg",
      prose:
        "You read the dragon her rights, all forty pages of the relevant statutes, until she signs an undertaking to leave the city and write. The Patrician returns, mildly amused. Somewhere in a basket at the Watch House, Errol dreams of kettles, unaware that he was the hero of a better ending.",
      dialogueBeats: [
        { id: "gg_e_s1", characterId: "gg_vetinari", text: "You arrested a dragon with paperwork. I am... almost disturbed by how sensible that is." },
        { id: "gg_e_s2", characterId: "gg_vimes", text: "We do what we can with what the book provides, sir." },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "THE LAW, APPLIED",
        recap:
          "You arrested a dragon with paperwork. Vimes says it's the most Ankh-Morpork thing anyone has ever done. Colon says the kettle is still gone. Errol remains, for now, a mascot.",
        endsSeason: true,
      },
    },
    {
      id: "gg_end_ash",
      title: "Ending — Roasted",
      isEnding: true,
      background: P + "gg-rooftops.jpg",
      cinematic: { mode: "shake", shakeAmount: 0.3 },
      prose:
        "You stand, briefly, transfixed by the sheer scale of the dragon, which is understandable, and then briefly on fire, which is less so. The Watch's newest constable learns that dragons are most dangerous up close, and that whisky vapour is extremely democratic.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "ROASTED",
        recap: "You hesitated on the distillery roof. The kettle outlives you. Corporal Nobbs gets your dartboard.",
        endsSeason: true,
      },
    },
  ],
};
