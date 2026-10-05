import type { SpriteSheet } from "../game/spriteSheet";
import type { Story } from "../types";

/**
 * DON'T PANIC! — A HITCHHIKER'S COMEDY
 *
 * An unofficial, entirely affectionate fan parody of the towel-loving,
 * poetry-fearing, improbability-driven universe of Douglas Adams. All
 * dialogue here is original — the jokes are ours, the love is his.
 *
 * Engine coverage (this case is a deliberate workout):
 *  · 🚶 Four STAGE rooms (bedroom, street, pub, Heart of Gold) with verb
 *    coin + sentence line + object-first menu, obstacles, an occluder,
 *    a gated energy-field barrier, interactable + ambient NPCs, remote
 *    looks, a hold-to-EXAMINE spot, a hidden-until-met marker, and one
 *    WIDE (200%) scrolling world with walk-off edges + entry spawns.
 *  · 🔁 MULTI-STATE objects (drawer, Nutrimatic, Drive), 👢 extended verbs
 *    (kick the Nutrimatic), USE-item puzzles, and a crafting recipe
 *    (towel + thumb = towel signal) the finale genuinely requires.
 *  · 💬 Topic-hub conversations (barman, Zaphod) alongside linear beats,
 *    🎯 press-the-lie (Ford's Guildford claim), ⏱ QTE poetry survival,
 *    memoryLog + recalls, present-item branches, exclusive reply groups,
 *    meter-gated gold, conditional on-enter, a room-entry script, and a
 *    🗺 travel map whose pins unlock from play, never from storage.
 *
 * Art: public/assets/dont-panic/ — painted plates (pass 1) + magenta-keyed
 * sprite sheets (pass 2) built by scripts/make-sprite-sheet.mjs from
 * plates/dont-panic/. Emoji stays as the static fallback everywhere.
 */

const A = "/assets/dont-panic/";
const sheet = (image: string, frameWidth: number, frameHeight: number, animations: SpriteSheet["animations"]): SpriteSheet => ({
  image: A + image, frameWidth, frameHeight, animations, pixelated: false,
});

// Pass-2 art: AI plates on magenta, keyed by scripts/make-sprite-sheet.mjs.
// Walkers face right; the engine mirrors for left. Talkers idle/talk in place.
// Lie frames 6-9 share the sheet on a 512x512 grid (a lying man needs a wide
// cell); the standing frames are pixel-identical, centered in the new cells.
const ARTHUR = sheet("arthur-sheet.png", 512, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [2, 3, 4, 5], fps: 8 }, lie: { frames: [6, 7, 8, 9], fps: 2 },
});
const FORD = sheet("ford-sheet.png", 225, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [2, 3, 4, 5], fps: 8 },
});
const PROSSER = sheet("prosser-sheet.png", 261, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [2, 3, 4, 5], fps: 8 },
});
const BARMAN = sheet("barman-sheet.png", 249, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [0, 1], fps: 4 }, talk: { frames: [2, 3], fps: 4 },
});
const ZAPHOD = sheet("zaphod-sheet.png", 280, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [0, 1], fps: 4 }, talk: { frames: [2, 3], fps: 4 },
});
const MARVIN = sheet("marvin-sheet.png", 207, 512, {
  idle: { frames: [0] }, walk: { frames: [0, 1, 2, 3], fps: 5 },
});
const TRILLIAN = sheet("trillian-sheet.png", 206, 512, {
  idle: { frames: [0, 1], fps: 3 }, walk: { frames: [0, 1], fps: 4 }, talk: { frames: [2, 3], fps: 4 },
});
const VOGON = sheet("vogon-sheet.png", 186, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const NUTRI = sheet("nutrimatic-sheet.png", 209, 384, {
  loop: { frames: [0, 1, 2, 3], fps: 4 },
});
const DRIVE = sheet("drive-sheet.png", 160, 384, {
  loop: { frames: [0, 1, 2, 3], fps: 3 },
});

// Pass-3 art: talking busts (rest/talk) + prop loops. *-talk plates that came
// back as 2x2 grids were reordered TL,TR,BL,BR so rest=[0,1] talk=[2,3] holds.
// Zaphod's 4th quad grew a third head, so his talk cycle skips frame 3.
const ARTHUR_TALK = sheet("arthur-talk-sheet.png", 191, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const FORD_TALK = sheet("ford-talk-sheet.png", 214, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const PROSSER_TALK = sheet("prosser-talk-sheet.png", 227, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const BARMAN_TALK = sheet("barman-talk-sheet.png", 392, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const ZAPHOD_TALK = sheet("zaphod-talk-sheet.png", 660, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [1, 2], fps: 5 },
});
const TRILLIAN_TALK = sheet("trillian-talk-sheet.png", 313, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const MARVIN_TALK = sheet("marvin-talk-sheet.png", 311, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const MICE_TALK = sheet("mice-talk-sheet.png", 285, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});
const JUKEBOX = sheet("jukebox-sheet.png", 229, 384, {
  loop: { frames: [0, 1, 2, 3], fps: 4 },
});

// Pass-4 art: the dog trots (last emoji NPC gone), the Guide gets a voice.
const DOG = sheet("dog-sheet.png", 1222, 384, {
  idle: { frames: [0] }, walk: { frames: [0, 1, 2, 3], fps: 6 },
});
const GUIDE_TALK = sheet("guide-talk-sheet.png", 170, 384, {
  rest: { frames: [0, 1], fps: 3 }, talk: { frames: [2, 3], fps: 5 },
});

const G = {
  bedroom: `${A}bg-bedroom.jpg`,
  street: `${A}bg-street.jpg`,
  pub: `${A}bg-pub.jpg`,
  vogon: `${A}bg-vogon.jpg`,
  poetry: `${A}bg-poetry.jpg`,
  heart: `${A}bg-heart.jpg`,
  magrathea: `${A}bg-magrathea.jpg`,
  gold: `${A}bg-gold.jpg`,
  silver: `${A}bg-silver.jpg`,
  doom: `${A}bg-doom.jpg`,
};

export const DONT_PANIC: Story = {
  id: "dont-panic",
  title: "DON'T PANIC! — A Hitchhiker's Comedy",
  tagline:
    "Your house is being demolished. So is your planet. Bring a towel.",
  gameKind: "adventure",
  coverImage: `${A}cover.jpg`,
  startSceneId: "dp_title",

  inventoryDisplay: { mode: "container", label: "Dressing-Gown Pockets" },
  playerSprite: { image: "emoji:🧍‍♂️" },
  verbMenuIcon: "emoji:🐬",

  briefing: {
    gameInfo:
      "An unofficial fan parody in five improbable parts. You are Arthur Dent, a perfectly ordinary human having a perfectly awful Thursday: the council wants your house and the Vogons want your planet. Survive poetry, befriend a depressed robot, and never — ever — panic.",
    objective:
      "Survive Thursday: keep your towel, get off the planet, survive Vogon poetry, and reach Magrathea with your wits (and your towel) intact.",
    winConditions: [
      "Leave the house with your towel and Ford's Guide.",
      "Survive the Vogon poetry reading — by wit, by fish, or by towel.",
      "Power the Improbability Drive (towel + thumb, combined) and ask the right question on Magrathea.",
    ],
    loseConditions: [
      "Stay for another round while the world ends.",
      "Criticise Vogon poetry to a Vogon's face.",
      "Panic. Panicking is right out.",
    ],
  },

  flagNotes: {
    dp_met_ford: "Ford barged into the bedroom and announced the end of the world.",
    dp_drawer_open: "Rummaged the chest of drawers — the towel lives there.",
    dp_delayed: "Lay down in front of the bulldozer. The driver respects commitment.",
    dp_ford_reveal: "Ford admitted the planet is being demolished (and that he is not from Guildford).",
    dp_trust_ford: "Chose to trust Ford's increasingly implausible story.",
    dp_doubt_ford: "Chose to doubt Ford, politely, while the sky caught fire.",
    dp_ford_liar: "Caught Ford's Guildford claim with the Guide itself.",
    dp_beamed: "Followed Ford out of the pub as the sky ripped open.",
    dp_babel_got: "Fished a babel fish out of the Vogon dispenser.",
    dp_poetry_survived: "Survived the poetry reading with eardrums and dignity nominally intact.",
    dp_hesitated: "Hesitated during the poetry — the Vogons noticed.",
    dp_escaped_vogon: "Arrived aboard the Heart of Gold, mostly un-vaporised.",
    dp_nutri_kicked: "Kicked the Nutrimatic dispenser into producing something almost, but not quite, entirely unlike tea.",
    dp_drive_ready: "Wrapped the thumb in the towel and woke the Improbability Drive.",
    dp_towel_bearer: "Arrived on Magrathea still holding the towel. The mice approve.",
    dp_answer_heard: "Heard the Answer (42) and immediately asked the wrong follow-up.",
    dp_question_asked: "Asked the Question on Magrathea — six by nine, allegedly.",
  },

  verbResponses: {
    look: [
      "Mostly harmless. Everything here is mostly harmless. That's the problem.",
      "You look. It looks back. The universe has no blinking reflex.",
      "Forty-two feet of it, give or take. You didn't measure.",
    ],
    take: [
      "You can't take that. It's nailed to the plot.",
      "Somewhere, a Vogon is filling in a form about you touching things.",
      "Best leave it. It has opinions about being held.",
    ],
    talk: [
      "It doesn't answer. Down here, that's practically eloquence.",
      "You say hello. The universe says 'please hold'.",
      "Nobody talks to a man in a dressing gown before noon. It's the law.",
    ],
    use: [
      "You wave your towel at it. Nothing happens, but you feel 12% safer.",
      "Wrong tool. This situation runs on towels and blind panic.",
      "It declines to be used. It has a union.",
    ],
    go: [
      "There is no path that way. There was, but it was demolished for a bypass.",
      "You can't go that way. A small man with a clipboard says so.",
    ],
    kick: [
      "You kick it. The universe files a complaint.",
      "Violence solves nothing, but it does rattle the plumbing.",
    ],
    punch: ["Save it for the poetry."],
  },

  dialogueBox: {
    hudTheme: "ghost-green",
    headingFont: "poster",
    bodyFont: "modern",
    accentColor: "#39ff14",
  },

  map: {
    title: "Heart of Gold — Destination Computer",
    backgroundImage: G.heart,
    locations: [
      {
        id: "dp_map_heart",
        label: "Heart of Gold",
        targetSceneId: "dp_heart",
        x: 30,
        y: 55,
        icon: "🚀",
        gating: { requiresFlags: ["dp_poetry_survived"] },
        lockedHint: "Nobody picks up hitchhikers who haven't survived the poetry.",
      },
      {
        id: "dp_map_magrathea",
        label: "Magrathea",
        targetSceneId: "dp_magrathea",
        x: 72,
        y: 40,
        icon: "🌊",
        gating: { requiresFlags: ["dp_drive_ready"] },
        lockedHint: "The Drive is dormant. It wants a signal wrapped in something fluffy.",
      },
    ],
  },

  layout: {
    dp_title: { x: -360, y: 240 },
    dp_bedroom: { x: 0, y: 240 },
    dp_street: { x: 380, y: 240 },
    dp_pub: { x: 760, y: 240 },
    dp_vogon: { x: 1140, y: 120 },
    dp_poetry: { x: 1140, y: 380 },
    dp_heart: { x: 1520, y: 240 },
    dp_magrathea: { x: 1900, y: 240 },
    dp_end_gold: { x: 2280, y: 60 },
    dp_end_silver: { x: 2280, y: 220 },
    dp_end_panic: { x: 2280, y: 380 },
    dp_end_earth: { x: 760, y: 520 },
    dp_end_poetry: { x: 1140, y: 620 },
  },

  characters: [
    { id: "dp_arthur", name: "Arthur Dent", role: "You — dressing gown, towel, Thursday", avatarUrl: "emoji:🧍‍♂️", trustMeter: 0 , talkingSheet: ARTHUR_TALK },
    { id: "dp_ford", name: "Ford Prefect", role: "Friend from 'Guildford' (not Guildford)", avatarUrl: "emoji:🛸", trustMeter: 1 , talkingSheet: FORD_TALK },
    { id: "dp_prosser", name: "Mr. Prosser", role: "Council bulldozer man", avatarUrl: "emoji:🚜", trustMeter: 0 , talkingSheet: PROSSER_TALK },
    { id: "dp_barman", name: "Barman", role: "Horse and Groom, last orders forever", avatarUrl: "emoji:🍺", trustMeter: 0 , talkingSheet: BARMAN_TALK },
    { id: "dp_guide", name: "The Guide", role: "DON'T PANIC (says so on the cover)", avatarUrl: "emoji:📗", trustMeter: 0 , talkingSheet: GUIDE_TALK },
    { id: "dp_vogon", name: "Vogon Captain", role: "Poet. Bureaucrat. Worst of both.", avatarUrl: "emoji:📢", trustMeter: -2, talkingSheet: VOGON },
    { id: "dp_zaphod", name: "Zaphod Beeblebrox", role: "President, fugitive, two heads", avatarUrl: "emoji:✌️", trustMeter: 0 , talkingSheet: ZAPHOD_TALK },
    { id: "dp_trillian", name: "Trillian", role: "Astrophysicist, only competent person aboard", avatarUrl: "emoji:👩‍🔬", trustMeter: 1 , talkingSheet: TRILLIAN_TALK },
    { id: "dp_marvin", name: "Marvin", role: "Paranoid android, brain the size of a planet", avatarUrl: "emoji:🤖", trustMeter: 0 , talkingSheet: MARVIN_TALK },
    { id: "dp_mice", name: "The Mice", role: "Researchers. The experiment is you.", avatarUrl: "emoji:🐭", trustMeter: 0 , talkingSheet: MICE_TALK },
  ],

  items: [
    {
      id: "dp_towel",
      name: "Your Towel",
      icon: "🏖️",
      iconUrl: A + "item-towel.png",
      description: "A large, fluffy towel. The single most useful object in the known universe.",
      flavorText: "A hitchhiker with a towel is a hitchhiker who knows where it is.",
      combinableWith: { targetItemId: "dp_thumb", resultItemId: "dp_towel_signal" },
    },
    {
      id: "dp_guidebook",
      name: "The Guide",
      icon: "📗",
      description: "A battered electronic book with DON'T PANIC on the cover, in large, friendly letters.",
      flavorText: "Says 'Mostly Harmless' about Earth. Ford is furious on your behalf.",
      isClue: true,
    },
    {
      id: "dp_thumb",
      name: "Electronic Thumb",
      icon: "👍",
      iconUrl: A + "item-thumb.png",
      description: "Ford's spare sub-ether signalling thumb. Hitchhiking equipment. Do not lick.",
      flavorText: "Thumb it, and something improbable usually stops.",
    },
    {
      id: "dp_beer",
      name: "Pint of Bitter",
      icon: "🍺",
      iconUrl: A + "item-beer.png",
      description: "A proper pint, pulled seconds before the end of the world.",
      flavorText: "Six pints, Ford said. Time is an illusion. Lunchtime doubly so.",
    },
    {
      id: "dp_peanuts",
      name: "Packet of Peanuts",
      icon: "🥜",
      iconUrl: A + "item-peanuts.png",
      description: "Salted peanuts from the pub. The nutritional value is mostly theoretical.",
      flavorText: "Ford says peanuts are the fourth emergency supply. Do not ask about the first three.",
    },
    {
      id: "dp_babel",
      name: "Babel Fish",
      icon: "🐟",
      iconUrl: A + "item-babel.png",
      description: "A small, yellow, leech-like fish that feeds on brainwave energy and excretes understanding.",
      flavorText: "Stick it in your ear. Everybody else already has.",
      isClue: true,
    },
    {
      id: "dp_tea",
      name: "Almost-Tea",
      icon: "🍵",
      iconUrl: A + "item-tea.png",
      description: "Something the Nutrimatic insists is tea. It is almost, but not quite, entirely unlike tea.",
      flavorText: "The machine is very proud. Best not to hurt its feelings.",
    },
    {
      id: "dp_towel_signal",
      name: "Towel-Wrapped Thumb",
      icon: "📶",
      description: "The electronic thumb, swaddled in towel for signal integrity. It hums hopefully.",
      flavorText: "Fluffiness increases sub-ether gain. Science doesn't know why. Nobody asks.",
    },
  ],

  scenes: [
    /* ─────────────── 0 · TITLE ─────────────── */
    {
      id: "dp_title",
      title: "DON'T PANIC!",
      nodeType: "credits",
      background: G.heart,
      ambientAudio: "drone",
      transition: "fade-black",
      transitionSpeed: 1.2,
      choiceDelaySeconds: 3,
      prose: "DON'T PANIC!\nA Hitchhiker's Comedy in Five Improbable Parts\nAn unofficial fan parody — bring a towel",
      credits: {
        font: "poster",
        style: "cards",
        cardMotion: "slam",
        titleEntrance: "slam",
        cardSeconds: 3,
        titleColor: "#39ff14",
        accentColor: "#f5c542",
      },
      dialogueBeats: [],
      hotspots: [],
      choices: [
        { id: "dp_title_go", text: "Grab your towel. It's Thursday.", targetSceneId: "dp_bedroom", attitudeTag: "Neutral" },
      ],
    },

    /* ─────────────── 1 · BEDROOM (stage) ─────────────── */
    {
      id: "dp_bedroom",
      title: "Thursday Morning",
      nodeType: "stage",
      background: G.bedroom,
      ambientAudio: "tension",
      prose: "",
      cinematic: { mode: "static" },
      stage: {
        playerImage: "emoji:🧍‍♂️",
        playerSheet: ARTHUR,
        playerScale: 1.1,
        spawn: { x: 50, y: 88 },
        speed: 20,
        reach: 5,
        keyboard: true,
        floor: { top: 60, bottom: 94 },
        depthScale: 0.3,
        hints: "proximity",
        verbCoin: true,
        sentenceLine: true,
        objectVerbMenu: true,
        enterCaption:
          "Thursday. Your head aches, the house is shaking, and a man who claims to be your friend is shouting about the end of the world through your bedroom door.",
        obstacles: [{ x: 8, y: 70, w: 22, h: 12 }],
        npcs: [
          {
            id: "dp_npc_ford_bed",
            image: "emoji:🛸",
            sheet: FORD,
            x: 72,
            y: 88,
            scale: 1.15,
            facing: "left",
            patrol: [
              { x: 66, y: 88, pause: 2, say: "(Ford checks his watch, then the ceiling, then his watch again.)" },
              { x: 78, y: 88, pause: 2, say: "(The ceiling is still there. For now. Ford looks personally offended.)" },
            ],
            speed: 10,
            talkHotspotId: "dp_bed_ford",
          },
        ],
      },
      dialogueBeats: [
        { id: "dpb_bed1", characterId: "dp_ford", text: "Arthur! Good, you're vertical. Pack nothing, bring everything, and for Zark's sake bring your TOWEL. Do you know where your towel is?" },
        { id: "dpb_bed2", characterId: "dp_arthur", text: "It's Thursday. The council is knocking my house down. My head is full of teaspoons. And you're asking about bath linens?" },
        { id: "dpb_bed3", characterId: "dp_ford", text: "The council is the LEAST of it. Your planet is about to be demolished for a hyperspace bypass, the Guide needs updating, and I've only got one spare thumb. Towel. Drawer. NOW." },
        { id: "dpb_bed4", characterId: "dp_guide", text: "TOWEL, n.: (1) absorbent rectangle; (2) the difference between a hitchhiker and a damp corpse; (3) see also: DON'T PANIC." },
      ],
      hotspots: [
        {
          id: "dp_bed_ford",
          label: "Ford, vibrating with urgency",
          bounds: { x: 64, y: 52, w: 16, h: 34 },
          cursor: "talk",
          action: { type: "startDialogue", flagSet: "dp_met_ford" },
        },
        {
          // MULTI-STATE: closed drawer -> open drawer with towel -> taken.
          id: "dp_bed_drawer",
          label: "the chest of drawers",
          bounds: { x: 30, y: 60, w: 14, h: 22 },
          cursor: "use",
          verbs: {
            look: { type: "showText", text: "Third drawer down. It rattles with the particular confidence of a drawer containing exactly one towel and seventeen dead batteries." },
          },
          action: {
            type: "showText",
            flagSet: "dp_drawer_open",
            text: "You yank the drawer open. There — folded with funereal precision — is your towel. It has never looked more beautiful, or more load-bearing.",
          },
          states: [
            {
              id: "dp_drawer_towel",
              when: { requiresFlags: ["dp_drawer_open"] },
              label: "your towel, folded and ready",
              cursor: "take",
              action: { type: "giveItem", itemGranted: "dp_towel" },
            },
          ],
        },
        {
          // Hidden until Ford is met: the Guide peeks out of his satchel.
          id: "dp_bed_satchel",
          label: "Ford's satchel (something glowing)",
          bounds: { x: 80, y: 66, w: 12, h: 20 },
          cursor: "take",
          hiddenWhenLocked: true,
          gating: { requiresFlags: ["dp_met_ford"] },
          customFailMessage: "Ford's satchel. Best wait until he's finished shouting before you rummage in it.",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "dp_guidebook",
            text: "You lift the Guide out. DON'T PANIC, it says, in large, friendly letters. You choose to take this personally.",
          },
        },
        {
          // REMOTE: the bulldozers, visible through the window, far above the floor.
          id: "dp_bed_window",
          label: "the bedroom window (bulldozers outside)",
          bounds: { x: 8, y: 12, w: 20, h: 22 },
          cursor: "look",
          remote: true,
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Through the glass: three yellow bulldozers, one clipboard, and a man with the unmistakable posture of someone about to ruin a Thursday.",
          },
        },
        {
          // EXAMINE: hold to study the scorch mark. Rewards attention with Clever.
          id: "dp_bed_scorch",
          label: "a strange scorch mark on the ceiling",
          bounds: { x: 44, y: 8, w: 12, h: 12 },
          cursor: "look",
          remote: true,
          examine: true,
          examineSeconds: 2,
          action: {
            type: "showText",
            meterChange: { meter: "Clever", delta: 1 },
            text: "You study the scorch mark. It is roughly saucer-shaped, faintly humming, and — you realise with a cold teaspoon-feeling — NOT from any appliance you own.",
          },
        },
        {
          id: "dp_bed_door",
          label: "the front door (the house is shaking)",
          bounds: { x: 2, y: 40, w: 9, h: 42 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresFlags: ["dp_met_ford"] },
          customFailMessage: "Ford physically blocks the door. 'Towel first. Talk to me first. THEN the bulldozers.'",
          action: { type: "goToScene", targetSceneId: "dp_street" },
        },
      ],
      choices: [],
    },

    /* ─────────────── 2 · STREET (stage) ─────────────── */
    {
      id: "dp_street",
      title: "Outside: The Bulldozers",
      nodeType: "stage",
      background: G.street,
      ambientAudio: "tension",
      prose: "",
      cinematic: { mode: "static" },
      stage: {
        playerImage: "emoji:🧍‍♂️",
        playerSheet: ARTHUR,
        playerScale: 1.1,
        spawn: { x: 14, y: 88 },
        speed: 20,
        reach: 5,
        keyboard: true,
        floor: { top: 62, bottom: 94 },
        depthScale: 0.3,
        hints: "proximity",
        verbCoin: true,
        sentenceLine: true,
        objectVerbMenu: true,
        enterCaption:
          "The lane outside. Three bulldozers idle like patient dragons, and Mr. Prosser is already explaining, at length, why this is all perfectly reasonable.",
        obstacles: [{ x: 40, y: 66, w: 26, h: 14 }],
        entrySpawns: {
          dp_bedroom: { x: 10, y: 88 },
          dp_pub: { x: 88, y: 88 },
        },
        // Room-entry cutscene: Prosser strides over with the paperwork. Once.
        enterScript: [
          { do: "npcWalkTo", npcId: "dp_npc_prosser", x: 30, y: 88 },
          { do: "say", text: "Morning! Lovely day for it. Now — if you'd just stop LYING DOWN in front of things…", npcId: "dp_npc_prosser" },
          { do: "say", text: "I haven't lain down yet. Give me a minute. I'm building up to it." },
        ],
        enterScriptFlag: "dp_street_intro_played",
        npcs: [
          {
            id: "dp_npc_prosser",
            image: "emoji:🚜",
            sheet: PROSSER,
            x: 44,
            y: 88,
            scale: 1.1,
            facing: "left",
            talkHotspotId: "dp_street_prosser",
          },
          {
            id: "dp_npc_dog",
            image: "emoji:🐕",
            sheet: DOG,
            x: 70,
            y: 90,
            scale: 0.45,
            patrolMode: "pingpong",
            patrol: [
              { x: 90, y: 86, pause: 3, say: "(The dog has seen Thursdays like this before. It is leaving.)" },
              { x: 60, y: 90, pause: 4 },
            ],
            speed: 8,
          },
        ],
      },
      dialogueBeats: [
        { id: "dpb_st1", characterId: "dp_prosser", text: "Mr. Dent! The plans have been on display in the planning office for nine months. With the lights off. In a locked filing cabinet in a disused lavatory with a sign saying 'Beware of the Leopard'." },
        { id: "dpb_st2", characterId: "dp_arthur", text: "That's not 'on display', that's a cry for help from the concept of transparency." },
        { id: "dpb_st3", characterId: "dp_prosser", text: "Be that as it may — the bypass goes through. Unless, of course, you were to LIE DOWN in front of the bulldozer, which causes no end of paperwork, and which I am certainly not suggesting." },
      ],
      hotspots: [
        {
          id: "dp_street_prosser",
          label: "Mr. Prosser, with paperwork",
          bounds: { x: 38, y: 54, w: 14, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          id: "dp_street_dozer",
          label: "the lead bulldozer",
          bounds: { x: 52, y: 58, w: 20, h: 28 },
          cursor: "use",
          image: A + "bulldozer.png",
          verbs: {
            look: { type: "showText", text: "A big yellow STATUS SYMBOL. The driver is reading a newspaper headlined 'LOCAL MAN ABOUT TO HAVE BAD DAY'. It has your photo. It is not flattering." },
            use: {
              type: "runScript",
              flagSet: "dp_delayed",
              script: [
                { do: "pose", pose: "lie" },
                { do: "say", text: "You lie down in the mud in front of the bulldozer. The driver sighs the sigh of a man whose union rep warned him about exactly this. Work stops. Paperwork begins. Glorious, glorious paperwork." },
                { do: "wait", seconds: 1 },
                { do: "pose" },
              ],
            },
          },
          action: {
            type: "showText",
            text: "The bulldozer idles. The driver will not proceed while a homeowner is performing what the manual calls 'a horizontal objection'.",
          },
        },
        {
          id: "dp_street_plans",
          label: "the demolition notice, nailed to a post",
          bounds: { x: 26, y: 44, w: 10, h: 18 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "'DEMOLITION ORDER 7-B: dwelling to be removed Thursday. Appeals to be lodged on Alpha Centauri, in triplicate, before Tuesday.' It is, somehow, already Tuesday on Alpha Centauri.",
          },
        },
        {
          id: "dp_street_home",
          label: "back inside the house",
          bounds: { x: 2, y: 40, w: 9, h: 42 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "dp_bedroom" },
        },
        {
          id: "dp_street_pub",
          label: "the Horse and Groom (Ford is waving)",
          bounds: { x: 89, y: 40, w: 10, h: 42 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresFlags: ["dp_delayed"] },
          customFailMessage: "Ford grabs your sleeve. 'Not yet — lie down first. A man who won't lie in front of one bulldozer will never hitchhike the galaxy.'",
          action: { type: "goToScene", targetSceneId: "dp_pub" },
        },
      ],
      choices: [],
    },

    /* ─────────────── 3 · PUB (stage) ─────────────── */
    {
      id: "dp_pub",
      title: "The Horse and Groom",
      nodeType: "stage",
      background: G.pub,
      ambientAudio: "jazz",
      prose: "",
      cinematic: { mode: "static" },
      stage: {
        playerImage: "emoji:🧍‍♂️",
        playerSheet: ARTHUR,
        playerScale: 1.1,
        spawn: { x: 12, y: 88 },
        speed: 20,
        reach: 5,
        keyboard: true,
        floor: { top: 62, bottom: 94 },
        depthScale: 0.3,
        hints: "proximity",
        verbCoin: true,
        sentenceLine: true,
        objectVerbMenu: true,
        enterCaption:
          "The Horse and Groom. Peanuts, bitter, and a jukebox playing something cheerful in a key the world will not survive to finish.",
        obstacles: [{ x: 34, y: 68, w: 30, h: 10 }],
        occluders: [
          {
            id: "dp_pub_bar",
            label: "the bar counter",
            points: [
              { x: 34, y: 68 },
              { x: 64, y: 68 },
              { x: 64, y: 78 },
              { x: 34, y: 78 },
            ],
          },
        ],
        entrySpawns: {
          dp_street: { x: 10, y: 88 },
        },
        npcs: [
          {
            id: "dp_npc_ford_pub",
            image: "emoji:🛸",
            sheet: FORD,
            x: 24,
            y: 88,
            scale: 1.15,
            facing: "right",
            talkHotspotId: "dp_pub_ford",
          },
          {
            id: "dp_npc_barman",
            image: "emoji:🍺",
            sheet: BARMAN,
            x: 50,
            y: 86,
            scale: 1.25,
            facing: "left",
            patrol: [
              { x: 44, y: 86, pause: 3, say: "(The barman polishes a glass that has been clean since 1987.)" },
              { x: 56, y: 86, pause: 3 },
            ],
            speed: 8,
            talkHotspotId: "dp_pub_barman",
          },
        ],
      },
      dialogueBeats: [
        { id: "dpb_pub1", characterId: "dp_ford", text: "Six pints, fast. The world ends in twelve minutes and I intend to meet it the way I meet everything: slightly carbonated." },
        { id: "dpb_pub2", characterId: "dp_arthur", text: "You keep SAYING that. The world. Ending. With a straight face. While ordering crisps." },
        {
          id: "dpb_pub_lie",
          characterId: "dp_ford",
          text: "Look, I'm just a bloke from Guildford who happens to know about hyperspace bypasses, sub-ether thumbs, and the exact resale value of your planet. Perfectly normal Guildford stuff. Guildford is famous for it.",
          lie: {
            claim: "Ford claims he is just a bloke from Guildford.",
            evidenceItemIds: ["dp_guidebook"],
            contradictedFlag: "dp_ford_liar",
            caughtBeat: {
              id: "dpb_pub_caught",
              characterId: "dp_ford",
              conditionRule: { requiresFlags: ["dp_ford_liar"] },
              text: "You hold up the Guide. 'Betelgeuse,' it says under his photo, in the tone of a book settling an argument. Ford sighs. 'Fine. FINE. I'm a field researcher. Guildford was COVER. It's a lovely town. It has a castle. I did my best.'",
            },
            wrongBeat: {
              id: "dpb_pub_wrong",
              characterId: "dp_ford",
              text: "Ford stares at what you're holding. 'That's not evidence, Arthur, that's LUNCH. Put it away before the barman charges you corkage.'",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "dp_ford", delta: 1 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "dp_ford", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Ford knows you know about Betelgeuse.",
          },
        },
        {
          id: "dpb_pub3",
          characterId: "dp_ford",
          conditionRule: { requiresFlags: ["dp_ford_reveal"] },
          text: "Vogon constructor ships. They'll jump in over the Atlantic, read the demolition order, and — and this is the part nobody believes — they'll do POETRY first. Bureaucracy with rhyming couplets. Drink up.",
        },
      ],
      choices: [
        {
          id: "dp_pub_reveal",
          text: "\"Ford. The truth. All of it. Starting with Guildford.\"",
          reply: true,
          attitudeTag: "Clever",
          consequences: {
            setFlags: ["dp_ford_reveal"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
          memoryLog: "dp_said_guildford",
        },
        {
          id: "dp_pub_trust",
          text: "\"I trust you. Which worries me more than the bulldozers.\"",
          reply: true,
          attitudeTag: "Sultry",
          exclusiveGroup: "dp_attitude",
          consequences: {
            setFlags: ["dp_trust_ford"],
            trustChanges: [{ characterId: "dp_ford", delta: 1 }],
          },
        },
        {
          id: "dp_pub_doubt",
          text: "\"This is insane. All of it. Itemised.\"",
          reply: true,
          attitudeTag: "Clever",
          exclusiveGroup: "dp_attitude",
          consequences: {
            setFlags: ["dp_doubt_ford"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
      ],
      hotspots: [
        {
          id: "dp_pub_ford",
          label: "Ford, ordering for the apocalypse",
          bounds: { x: 18, y: 54, w: 14, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          // TOPIC HUB: the barman answers questions, flavour only.
          id: "dp_pub_barman",
          label: "the barman, polishing",
          bounds: { x: 44, y: 50, w: 16, h: 30 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topics: [
              {
                id: "dp_t_tap",
                label: "What's on tap?",
                beats: [
                  { id: "dpb_bar1", characterId: "dp_barman", text: "Bitter, mild, and something the brewery calls 'Thursday Special' that we are legally required to keep behind glass." },
                ],
              },
              {
                id: "dp_t_sky",
                label: "Is the sky supposed to do that?",
                beats: [
                  { id: "dpb_bar2", characterId: "dp_barman", text: "It went that colour during the World Cup and nobody complained. Although — mind the big yellow ships. They look thirsty." },
                ],
              },
              {
                id: "dp_t_joke",
                label: "Tell me a joke. Quickly.",
                repeatable: true,
                beats: [
                  { id: "dpb_bar3", characterId: "dp_barman", text: "A man walks into a bar at the end of the world. That's it. That's the joke. You're IN it." },
                ],
              },
            ],
            topicPrompt: "The barman raises an eyebrow. What'll it be — words or beer?",
            topicLeaveLabel: "That'll be all.",
          },
        },
        {
          id: "dp_pub_beer",
          label: "a pulled pint, waiting",
          bounds: { x: 36, y: 50, w: 8, h: 12 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "dp_beer",
            text: "You take the pint. It is cold, amber, and — given the circumstances — essentially a medical intervention.",
          },
        },
        {
          id: "dp_pub_peanuts",
          label: "a bowl of peanuts",
          bounds: { x: 58, y: 52, w: 8, h: 10 },
          cursor: "take",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "dp_peanuts",
            text: "You pocket the peanuts. Salted. Slightly sticky. The fourth emergency supply, according to Ford, who refuses to elaborate.",
          },
        },
        {
          id: "dp_pub_thumb",
          label: "Ford's spare thumb (on the table)",
          bounds: { x: 24, y: 68, w: 8, h: 10 },
          cursor: "take",
          gating: { requiresFlags: ["dp_ford_reveal"] },
          customFailMessage: "Ford slaps your hand away. 'Not until you know what it IS. Ask me what's going on first.'",
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "dp_thumb",
            text: "Ford slides the thumb across. 'Sub-ether. Point it at the sky and think improbable thoughts. You'll get the hang of it, or you won't, and then it won't matter.'",
          },
        },
        {
          id: "dp_pub_jukebox",
          label: "the jukebox",
          bounds: { x: 78, y: 44, w: 12, h: 24 },
          cursor: "look",
          image: A + "jukebox-sheet.png",
          sheet: JUKEBOX,
          isRepeatable: true,
          action: {
            type: "showText",
            text: "The jukebox is playing 'So Long and Thanks for All the Fish'. You have never heard it before. You will never forget it. Nobody knows why it knows.",
          },
        },
        {
          id: "dp_pub_back",
          label: "back out to the street",
          bounds: { x: 2, y: 40, w: 9, h: 42 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "dp_street" },
        },
        {
          id: "dp_pub_follow",
          label: "follow Ford out as the sky rips open",
          bounds: { x: 89, y: 40, w: 10, h: 42 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresFlags: ["dp_ford_reveal"], requiresItems: ["dp_beer"] },
          customFailMessage: "Ford shakes his head. 'Know the truth AND finish your pint. In that order. Civilisation has standards, Arthur, even now.'",
          action: {
            type: "goToScene",
            targetSceneId: "dp_vogon",
          },
        },
        {
          id: "dp_pub_stay",
          label: "order crisps and ignore all of this",
          bounds: { x: 66, y: 62, w: 10, h: 14 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "dp_end_earth" },
        },
      ],
    },

    /* ─────────────── 4 · VOGON HOLD (classic) ─────────────── */
    {
      id: "dp_vogon",
      title: "Vogon Constructor Ship",
      background: G.vogon,
      ambientAudio: "drone",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 40%", zoomDuration: 14 },
      prose:
        "Darkness, a lurch, and the unmistakable feeling of being picked up by something with no suspension and less mercy. You wake in a grey hold that smells of forms and damp cruelty. Ford is already awake, already reading the Guide, already annoyed.",
      onEnterActions: [{ consequences: { setFlags: ["dp_beamed"] } }],
      dialogueBeats: [
        { id: "dpb_v1", characterId: "dp_ford", text: "Well. The good news is we're alive. The bad news is we're alive on a Vogon constructor ship, which the Guide describes — let me find it — as 'a flying DMV with guns'." },
        { id: "dpb_v2", characterId: "dp_guide", text: "VOGON POETRY, n.: the third worst in the universe. Second worst: the Azgoths of Kria. Worst: Paula Nancy Millstone Jennings of Greenbridge, Essex. She was destroyed along with the Earth, which many critics called 'a mercy'." },
        { id: "dpb_v3", characterId: "dp_arthur", text: "Ford. The fish dispenser. It's labelled. In Vogon. Which I can't read. Because I don't have a fish. In my ear. WHERE ONE APPARENTLY GOES." },
        {
          id: "dpb_v4",
          characterId: "dp_ford",
          conditionRule: { requiresFlags: ["dp_babel_got"] },
          text: "There. Fish in. Now you can understand every word of what's about to happen, which — fair warning — you will immediately wish you couldn't.",
        },
      ],
      hotspots: [
        {
          id: "dp_vogon_dispenser",
          label: "the babel fish dispenser",
          bounds: { x: 40, y: 50, w: 20, h: 26 },
          cursor: "take",
          image: A + "babel-tank.png",
          showItemImage: true,
          verbs: {
            look: { type: "showText", text: "A glass tank of small yellow fish, each one wriggling with the smugness of a creature that has solved linguistics and kept the receipt." },
          },
          action: {
            type: "giveItem",
            itemGranted: "dp_babel",
            flagSet: "dp_babel_got",
            text: "You grab a fish and — following Ford's mimed instructions with growing horror — insert it into your ear. The universe suddenly makes sense. It makes HORRIBLE sense, but sense.",
          },
        },
        {
          id: "dp_vogon_notice",
          label: "a posted notice (now readable, thanks to the fish)",
          bounds: { x: 66, y: 30, w: 16, h: 20 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "'BY ORDER: all hitchhikers WILL attend the poetry appreciation session. Attendance is mandatory. Appreciation will be assessed. Resistance will be rhymed at.'",
          },
        },
      ],
      choices: [
        {
          id: "dp_vogon_brave",
          text: "\"Right. Poetry. How bad can it be?\" (March in.)",
          targetSceneId: "dp_poetry",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 1 }] },
        },
        {
          id: "dp_vogon_dread",
          text: "\"Ford, hold my towel. If I don't come back, the peanuts are yours.\" (Shuffle in.)",
          targetSceneId: "dp_poetry",
          attitudeTag: "Neutral",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },

    /* ─────────────── 5 · POETRY (classic QTE) ─────────────── */
    {
      id: "dp_poetry",
      title: "Poetry Appreciation",
      background: G.poetry,
      ambientAudio: "tension",
      cinematic: { mode: "shake", shakeAmount: 0.4, shakeDuration: 0.6 },
      prose:
        "The Vogon Captain stands before you holding a slim volume the way an executioner holds an axe. Behind him, a guard warms up the airlock. 'You will LISTEN,' the Captain says, 'and then you will tell me how it made you FEEL.'",
      dialogueBeats: [
        { id: "dpb_p1", characterId: "dp_vogon", text: "'Oh freddled gruntbuggly, thy micturations are to me —' No. No, I won't do the whole thing. Even the NARRATION has limits. Suffice to say it goes on. And on. Your fillings ache in harmony." },
        { id: "dpb_p2", characterId: "dp_ford", text: "(whispering) Whatever you do — appreciate. Nod. Weep if you can. The last hitchhiker who critiqued the scansion is now a very thin layer on the outside of the hull." },
      ],
      hotspots: [],
      choices: [
        {
          id: "dp_poetry_appreciate",
          text: "APPLAUD WILDLY — \"Breathtaking! The bit about the gruntbuggly — genius!\"",
          quickTime: true,
          qtePrompt: "APPRECIATE THE POETRY!",
          timeLimitSeconds: 8,
          qteHeartbeat: true,
          qteShakyCam: true,
          rememberLine: "The Captain will remember your applause.",
          memoryLog: "dp_applauded",
          targetSceneId: "dp_heart",
          attitudeTag: "Sultry",
          consequences: {
            setFlags: ["dp_poetry_survived"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
            trustChanges: [{ characterId: "dp_vogon", delta: 1 }],
          },
          timedOutTargetSceneId: "dp_end_poetry",
          timedOutConsequences: {
            setFlags: ["dp_hesitated"],
            meterChanges: [{ meter: "Suspicion", delta: 2 }],
          },
        },
        {
          id: "dp_poetry_beg",
          text: "Beg for mercy in fluent Vogon (the fish earns its keep).",
          targetSceneId: "dp_heart",
          attitudeTag: "Clever",
          gating: { requiresItems: ["dp_babel"] },
          consequences: {
            setFlags: ["dp_poetry_survived"],
            meterChanges: [{ meter: "Clever", delta: 1 }],
          },
        },
        {
          id: "dp_poetry_towel",
          text: "Offer the Captain your towel as 'a review copy for drying off after'.",
          targetSceneId: "dp_heart",
          attitudeTag: "Neutral",
          presentItem: "dp_towel",
          consequences: {
            setFlags: ["dp_poetry_survived"],
            trustChanges: [{ characterId: "dp_vogon", delta: 2 }],
          },
        },
        {
          id: "dp_poetry_critique",
          text: "\"Honestly? The scansion's off and the third stanza just gives up.\"",
          targetSceneId: "dp_end_poetry",
          attitudeTag: "Aggressive",
        },
      ],
    },

    /* ─────────────── 6 · HEART OF GOLD (wide stage) ─────────────── */
    {
      id: "dp_heart",
      title: "The Heart of Gold",
      nodeType: "stage",
      background: G.heart,
      ambientAudio: "drone",
      prose: "",
      cinematic: { mode: "static" },
      onEnterActions: [{ consequences: { setFlags: ["dp_escaped_vogon"] } }],
      stage: {
        playerImage: "emoji:🧍‍♂️",
        playerSheet: ARTHUR,
        playerScale: 1.1,
        worldWidth: 200,
        spawn: { x: 18, y: 88 },
        speed: 20,
        reach: 5,
        keyboard: true,
        floor: { top: 60, bottom: 94 },
        depthScale: 0.3,
        hints: "proximity",
        verbCoin: true,
        sentenceLine: true,
        objectVerbMenu: true,
        extendedVerbs: true,
        enterCaption:
          "The Heart of Gold. Infinite Improbability Drive, sleek beyond reason, and — slumped against the far bulkhead like a wet weekend — the most depressed machine ever built.",
        obstacles: [
          { x: 60, y: 68, w: 22, h: 12 },
          // Gated energy field: the bridge seals until the Drive wakes.
          { x: 150, y: 56, w: 8, h: 38, gating: { requiresFlags: ["dp_drive_ready"] } },
        ],
        entrySpawns: {
          dp_poetry: { x: 14, y: 88 },
        },
        exitEdges: {
          left: { targetSceneId: "dp_poetry", label: "back to the Vogons (why?)" },
        },
        npcs: [
          {
            id: "dp_npc_marvin",
            image: "emoji:🤖",
            sheet: MARVIN,
            x: 120,
            y: 88,
            scale: 0.75,
            facing: "left",
            talkHotspotId: "dp_heart_marvin",
          },
          {
            id: "dp_npc_zaphod",
            image: "emoji:✌️",
            sheet: ZAPHOD,
            x: 170,
            y: 86,
            scale: 1.15,
            facing: "left",
            patrol: [
              { x: 160, y: 86, pause: 2, say: "(Zaphod polishes his own reflection. Both heads approve.)" },
              { x: 182, y: 88, pause: 2 },
            ],
            speed: 9,
            talkHotspotId: "dp_heart_zaphod",
          },
          {
            id: "dp_npc_trillian",
            image: "emoji:👩‍🔬",
            sheet: TRILLIAN,
            x: 90,
            y: 84,
            scale: 1.05,
            patrolMode: "pingpong",
            patrol: [
              { x: 110, y: 82, pause: 3, say: "(Trillian recalibrates something. It immediately works better. Nobody thanks her.)" },
              { x: 78, y: 86, pause: 3 },
            ],
            speed: 10,
          },
        ],
      },
      dialogueBeats: [
        { id: "dpb_h1", characterId: "dp_marvin", text: "Oh. More life forms. How uplifting. I have a brain the size of a planet and they ask me to stand here. By the door. The automatic door that opens by itself. Don't mind me." },
        { id: "dpb_h2", characterId: "dp_arthur", text: "Hello! I'm Arthur. This is — well, it was Thursday — I'm new to all this. You seem… thoughtful." },
        {
          id: "dpb_h3",
          characterId: "dp_marvin",
          text: "Thoughtful. Yes. I've been thinking about your friend Ford. He'll fit right in here. Everyone here is insufferable in at least two dimensions.",
          recalls: {
            dp_said_guildford: "Thoughtful. Yes. I've been thinking about your friend Ford — the one you described as '{said}'. Charming. He'll fit right in here. Everyone here lies about something.",
          },
        },
        { id: "dpb_h4", characterId: "dp_trillian", text: "Arthur! A towel, a dressing gown, and you survived Vogon poetry? You're either the luckiest man alive or the universe's idea of a joke. Possibly both. The Drive needs a signal — wrap the thumb in something fluffy." },
      ],
      hotspots: [
        {
          id: "dp_heart_marvin",
          label: "Marvin, slumped",
          bounds: { x: 112, y: 54, w: 16, h: 32 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          // TOPIC HUB: Zaphod holds court. Flavour + one useful rumour.
          id: "dp_heart_zaphod",
          label: "Zaphod, being Zaphod at volume",
          bounds: { x: 162, y: 52, w: 18, h: 34 },
          cursor: "talk",
          isRepeatable: true,
          action: {
            type: "startDialogue",
            topicPrompt: "Zaphod spreads both arms wide. 'Questions? Autographs? Adulation?'",
            topicLeaveLabel: "Back away slowly.",
            topics: [
              {
                id: "dp_t_who",
                label: "Who ARE you?",
                flagSet: "dp_answer_heard",
                beats: [
                  { id: "dpb_z1", characterId: "dp_zaphod", text: "Zaphod Beeblebrox! President of the Galaxy! Thief of this ship! Owner of the coolest heads in known space! You've probably seen my holograms." },
                  { id: "dpb_z2", characterId: "dp_arthur", text: "I live in England. We get weather. That's our whole thing." },
                ],
              },
              {
                id: "dp_t_answer",
                label: "What's the answer to everything?",
                gating: { requiresFlags: ["dp_answer_heard"] },
                beats: [
                  { id: "dpb_z3", characterId: "dp_zaphod", text: "Forty-two! A computer worked it out. Seven and a half million years. Then everybody realised nobody knew the QUESTION, and the whole thing collapsed like a bad soufflé." },
                  { id: "dpb_z4", characterId: "dp_trillian", text: "The mice are still running the experiment, Arthur. On Magrathea. And — no offence — you're the closest thing to a result they've got." },
                ],
              },
              {
                id: "dp_t_cool",
                label: "Is that vest… shaking?",
                repeatable: true,
                beats: [
                  { id: "dpb_z5", characterId: "dp_zaphod", text: "It's not shaking, it's VIBRATING with charisma. There's a difference. My tailor explained it. Twice." },
                ],
              },
            ],
          },
        },
        {
          // MULTI-STATE + EXTENDED VERB: kick the Nutrimatic, then take tea.
          id: "dp_heart_nutri",
          label: "the Nutrimatic Drinks Synthesizer",
          bounds: { x: 40, y: 58, w: 16, h: 28 },
          cursor: "look",
          image: A + "nutrimatic-sheet.png",
          sheet: NUTRI,
          verbs: {
            look: { type: "showText", text: "A tall machine with one button and infinite confidence. A sticker reads: 'NOW WITH EXTRA FLAVOUR'. Nobody knows what flavour. The machine refuses to say." },
            kick: {
              type: "showText",
              flagSet: "dp_nutri_kicked",
              text: "You kick the Nutrimatic. It makes a noise like a philosopher clearing its throat, shudders, and produces — triumphantly — a cup of something almost, but not quite, entirely unlike tea.",
            },
          },
          action: {
            type: "showText",
            text: "The Nutrimatic hums smugly and dispenses nothing. It can sense your desperation. It is SAVOURING it.",
          },
          states: [
            {
              id: "dp_nutri_tea",
              when: { requiresFlags: ["dp_nutri_kicked"] },
              label: "a cup of almost-tea (steaming)",
              cursor: "take",
              action: { type: "giveItem", itemGranted: "dp_tea" },
            },
          ],
        },
        {
          // USE-ITEM PUZZLE: the Drive wants the combined towel signal.
          id: "dp_heart_drive",
          label: "the Infinite Improbability Drive",
          bounds: { x: 128, y: 40, w: 18, h: 30 },
          cursor: "use",
          image: A + "drive-sheet.png",
          sheet: DRIVE,
          gating: { requiresItems: ["dp_towel_signal"] },
          customFailMessage: "The Drive is dormant. Trillian shouts across the bridge: 'It needs a signal! Wrap the thumb in something FLUFFY first — combine them in your pockets!'",
          acceptsItems: ["dp_towel_signal"],
          itemResponses: {
            dp_towel_signal: "You press the towel-wrapped thumb to the Drive. The ship holds its breath — and then the whole bridge smells faintly of warm laundry and mathematics. The Drive is AWAKE.",
          },
          wrongVerbText: "The Drive ignores that completely. It only respects signals wrapped in towelling.",
          verbs: {
            look: { type: "showText", text: "A golden heart-shaped tangle of impossibility. Probability crackles off it like static. Somewhere inside, a sperm whale and a bowl of petunias are having a very confusing afternoon." },
          },
          action: {
            type: "useItem",
            itemConsumed: "dp_towel_signal",
            flagSet: "dp_drive_ready",
            meterChange: { meter: "Clever", delta: 1 },
            text: "The Drive drinks the signal and wakes up humming in a key that doesn't exist yet.",
          },
          states: [
            {
              id: "dp_drive_awake",
              when: { requiresFlags: ["dp_drive_ready"] },
              gating: null,
              label: "the Drive, humming (destination: Magrathea)",
              cursor: "go",
              action: { type: "goToScene", targetSceneId: "dp_magrathea" },
            },
          ],
        },
        {
          // REMOTE: the viewport, high above the floor.
          id: "dp_heart_viewport",
          label: "the viewport (the whole of space)",
          bounds: { x: 84, y: 8, w: 32, h: 20 },
          cursor: "look",
          remote: true,
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Through the viewport: stars, improbability static, and — for one frame — a convoy of dolphins leaving in the opposite direction, doing flips. Show-offs.",
          },
        },
        {
          id: "dp_heart_pod",
          label: "an escape pod (labelled 'NOPE')",
          bounds: { x: 8, y: 56, w: 14, h: 30 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "dp_end_silver" },
        },
      ],
      choices: [],
    },

    /* ─────────────── 7 · MAGRATHEA (finale) ─────────────── */
    {
      id: "dp_magrathea",
      title: "Magrathea",
      background: G.magrathea,
      ambientAudio: "none",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 60%", zoomDuration: 16 },
      prose:
        "Magrathea. Fjords — the good ones, with the award-winning crinkly edges — unroll beneath the ship in the morning light. Two small white mice wait on the landing pad with a contract, a question, and absolutely no patience left.",
      onEnterActions: [
        {
          conditionRule: { requiresItems: ["dp_towel"] },
          consequences: { setFlags: ["dp_towel_bearer"] },
        },
      ],
      dialogueBeats: [
        { id: "dpb_m1", characterId: "dp_mice", text: "Mr. Dent. We have run this experiment for ten million years. We built a COMPUTER the size of a planet. The Answer is forty-two. And now — NOW — we need the QUESTION, and all we have left is you." },
        { id: "dpb_m2", characterId: "dp_arthur", text: "Me? I'm from England! I make tea! I lie in front of bulldozers! I'm not a — a QUESTION!" },
        {
          id: "dpb_m3",
          characterId: "dp_mice",
          conditionRule: { requiresFlags: ["dp_towel_bearer"] },
          text: "You kept the towel. Through demolition, poetry, and improbability itself. That shows… organisational promise. Ask carefully, Mr. Dent. Ten million years of funding rides on your next sentence.",
        },
      ],
      hotspots: [],
      choices: [
        {
          id: "dp_mag_gold",
          text: "\"What do you get when you multiply six by nine?\" (Ask the Question.)",
          targetSceneId: "dp_end_gold",
          attitudeTag: "Clever",
          gating: { minMeters: { Clever: 2 } },
          consequences: { setFlags: ["dp_question_asked"] },
        },
        {
          id: "dp_mag_silver",
          text: "\"Could I just have a lift home and a proper cup of tea?\" (Ask for the quiet life.)",
          targetSceneId: "dp_end_silver",
          attitudeTag: "Neutral",
        },
        {
          id: "dp_mag_panic",
          text: "PANIC. Loudly. With arm movements.",
          targetSceneId: "dp_end_panic",
          attitudeTag: "Aggressive",
        },
      ],
    },

    /* ─────────────── ENDINGS ─────────────── */
    {
      id: "dp_end_gold",
      title: "Mostly Harmless (Gold)",
      isEnding: true,
      background: G.gold,
      prose:
        "The mice go very still. 'Six by nine,' one whispers. 'Fifty-four. That's… that's not forty-two. Unless — unless the universe is in base thirteen!' There is a long silence. Then, from somewhere vast and old, the sound of a computer laughing so hard it voids its own warranty. You keep the towel. You keep the Question. Thursday, against all odds, is a triumph.",
      dialogueBeats: [
        {
          id: "dpb_g1",
          characterId: "dp_guide",
          text: "DENT, ARTHUR, n.: (1) tea-maker; (2) bulldozer-speedbump (honorary); (3) the man who asked. See also: MOSTLY HARMLESS (revised edition).",
          recalls: {
            dp_applauded: "DENT, ARTHUR, n.: (1) applauded Vogon poetry and lived to tell it; (2) the man who asked. See also: MOSTLY HARMLESS (revised edition).",
          },
        },
      ],
      endingData: {
        tier: "victory-gold",
        headline: "THE QUESTION, MORE OR LESS",
        recap: "You asked the Question, kept the towel, and survived poetry, Vogons and Marvin. The mice are furious. The Guide is updating. Gold.",
      },
    },
    {
      id: "dp_end_silver",
      title: "So Long, and Thanks (Silver)",
      isEnding: true,
      background: G.silver,
      prose:
        "You take the quiet road: a lift, a landing, and eventually — impossibly, wonderfully — a proper cup of tea in a kitchen that is not being demolished. The dolphins send a postcard. It just says 'told you'. The towel dries on the line, fluffy and unbothered, the way all towels should be.",
      dialogueBeats: [
        { id: "dpb_s1", characterId: "dp_ford", text: "You know what, Arthur? For a man who panics at Thursdays, you hitchhiked pretty well. Same time next week? I've heard Betelgeuse is lovely this time of eon." },
      ],
      endingData: {
        tier: "victory-silver",
        headline: "THE QUIET LIFE, EARNED",
        recap: "You skipped the Question, kept your sanity, and got home for tea. The universe continues without you. Silver.",
      },
    },
    {
      id: "dp_end_earth",
      title: "Demolished With the Crisps",
      isEnding: true,
      background: G.doom,
      prose:
        "You order the crisps. Salt and vinegar. Excellent choice, really — the crunch almost drowns out the Vogon announcement, and entirely drowns out Ford shouting. The bypass goes through on schedule. Somewhere, a Guide entry updates itself to 'Mostly Harmless. Was.'",
      dialogueBeats: [
        { id: "dpb_e1", characterId: "dp_guide", text: "EARTH, n.: (1) mostly harmless; (2) demolished Thursday, no forwarding address; (3) crisps: salt and vinegar (see also: REGRET, COSMIC)." },
      ],
      endingData: {
        tier: "gameover",
        headline: "DEMOLISHED, WITH CRISPS",
        recap: "You stayed in the pub while the planet was demolished. The crisps were good, though.",
      },
    },
    {
      id: "dp_end_poetry",
      title: "Rhymed At",
      isEnding: true,
      background: G.doom,
      prose:
        "The Captain finishes the third stanza and looks up, expectant. What happens next is either the airlock (for critics) or the fourth stanza (for hesitators). Survivors disagree about which is worse. There are no survivors in this telling. You should have applauded.",
      dialogueBeats: [
        { id: "dpb_po1", characterId: "dp_vogon", text: "'…and thus the freddled gruntbuggly SINGS.' There. You see? I SAVED the ending. Critics. Hmph. Guard — the airlock. And fetch me my rhyming dictionary." },
      ],
      endingData: {
        tier: "gameover",
        headline: "RHYMED AT, THEN SPACED",
        recap: "You critiqued (or failed to appreciate) Vogon poetry. The airlock disagreed.",
      },
    },
    {
      id: "dp_end_panic",
      title: "A Panic, In Arm Movements",
      isEnding: true,
      background: G.doom,
      prose:
        "You panic. The mice stare. The fjords, sensing a wasted ten million years, quietly un-crinkle themselves out of respect. The Guide adds a new entry under your name: 'See: PANIC, DON'T.' Somewhere, Ford puts his head in his hands so hard it registers on the ship's seismometer.",
      dialogueBeats: [
        { id: "dpb_pa1", characterId: "dp_guide", text: "PANIC, v.: (1) what Arthur did; (2) the one thing the cover specifically advises against; (3) see also: COVER, LARGE FRIENDLY LETTERS ON." },
      ],
      endingData: {
        tier: "gameover",
        headline: "YOU PANICKED",
        recap: "Ten million years of research, and you panicked. The cover warned you. It was in large, friendly letters.",
      },
    },
  ],
};
