import type { Story } from "../types";

/**
 * NOBODY'S WITNESS (New Direction) — Scenes 1 & 2, True Romance style.
 *
 * Brand-new story from the author's new script. Ignore the other Nobody's
 * Witness version (nobodysWitness.ts stays in the catalogue untouched) —
 * this is the fresh direction: Jack Morrow, 32, off the bus in Loyal,
 * Nebraska in October 1994 with four gray days to fill, then the Loyal
 * Diner on Monday night, where Vera Voss works the counter solo, knows
 * everything, and calls him "Bullshit" with zero heat. Part One ends where
 * the script ends: outside, the night comes down over the lot. One truck.
 * Nobody in it. FADE TO BLACK.
 *
 * Scenes 1–2 only. No ending yet: a "Part Two" note node sits on the canvas
 * for Scene 3 (the truck, Weller's, and what Vera knows about Cody).
 *
 * Art is painted in gouache/oil pulp-cover style with halftone grain, but
 * the world is 1990s rural America — Coke machines, the OYAL INN neon
 * (the R burned out, a callback to the old plates), a STATE PROPERTY
 * canvas bag, feed caps, box TV. All plates are 16:9 landscape.
 *
 * NOTE (art): nwn-cover.jpg, nwn-diner.jpg, nwn-vera.jpg and nwn-daryl.jpg
 * still carry stray baked-in magazine text from the first generation pass
 * and are queued for a clean re-render; the catalogue cover temporarily
 * uses the text-free nwn-diner-close.jpg plate.
 */
export const NOBODYS_WITNESS_NEW: Story = {
  id: "nobodys-witness-new",
  title: "Nobody's Witness (New Direction)",
  tagline:
    "Small towns, honey, everybody's your own personal FBI whether they mean to be or not.",
  coverImage: "/img/nwn-diner-close.jpg",
  startSceneId: "nwn_credits",
  briefing: {
    objective:
      "Get Jack Morrow off the bus, past the house he grew up in, through four gray days, and into the seat at the Loyal Diner — and through the longest conversation of his first week in Loyal.",
    winConditions: [
      "Get off the bus and face Loyal for the first time in three years.",
      "Walk past the house on Maple Street and keep walking.",
      "Sit at the Loyal Diner counter and let Vera Voss clock you.",
    ],
    loseConditions: [
      "Tell the church version of the story.",
      "Let the town turn you into whoever it decided you were.",
    ],
  },
  dialogueBox: {
    bodyFont: "type",
    headingFont: "pulp",
    hudTheme: "sepia-pulp",
    accentColor: "#c8862f",
    bordered: true,
    backdropBlur: 2,
    reserveLines: 3,
  },
  layout: {
    nwn_credits: { x: 0, y: 220 },
    nwn_bus_station: { x: 320, y: 220 },
    nwn_main_street: { x: 640, y: 220 },
    nwn_motel: { x: 960, y: 220 },
    nwn_motel_room: { x: 1280, y: 220 },
    nwn_diner: { x: 1600, y: 220 },
    nwn_sandwich: { x: 1920, y: 220 },
    nwn_mama: { x: 2240, y: 220 },
    nwn_catchup: { x: 2560, y: 220 },
    nwn_close: { x: 2880, y: 220 },
    nwn_fade: { x: 3200, y: 220 },
    nwn_scene3_note: { x: 3520, y: 220 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Off the bus, four days in",
      avatarUrl: "/img/nwn-jack.jpg",
      trustMeter: 0,
      voice: { pitch: 0.92, rate: 0.95 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The Loyal Diner, late shift",
      avatarUrl: "/img/nwn-vera.jpg",
      trustMeter: 0,
      voice: { pitch: 1.08, rate: 1.02 },
    },
    {
      id: "daryl",
      name: "Daryl",
      role: "The booth. The pie.",
      avatarUrl: "/img/nwn-daryl.jpg",
      trustMeter: 0,
      voice: { pitch: 0.8, rate: 0.95 },
    },
  ],
  items: [],
  flagNotes: {
    nwn_walked_past_the_house:
      "At the house he grew up in, Jack didn't stop. Didn't slow down, didn't turn his head. Smaller than he remembered it — which is always the lie towns tell.",
    nwn_vera_poured_first:
      "Vera poured Jack's coffee before he asked, and kept refilling it without asking. Starting to be a pattern.",
    nwn_kept_the_story_folded:
      "Jack didn't tell Vera the story. He said he was just some guy at a garage. She said 'Bullshit.' Neither of them brought it up again — she pivoted to the water tower instead.",
    nwn_truck_in_the_lot:
      "End of Part One: outside, the night comes down over the lot. One truck. Nobody in it.",
  },
  scenes: [
    /* ==================== TITLE / CREDITS ==================== */
    {
      id: "nwn_credits",
      title: "Nobody's Witness (New Direction)",
      nodeType: "credits",
      credits: {
        title: "NOBODY'S WITNESS",
        subtitle: "(NEW DIRECTION) · A Reimagined Pulp Story · 1994",
        font: "pulp",
        titleEntrance: "slam",
        cardMotion: "slam",
        style: "cards",
        cardSeconds: 3.4,
        stagger: 0.55,
        duration: 1.0,
        accentColor: "#c8862f",
        titleColor: "#e8c878",
        gateWeave: "worn",
        montage: [
          "/img/nwn-bus-station.jpg",
          "/img/nwn-main-street.jpg",
          "/img/nwn-motel-sign.jpg",
          "/img/nwn-diner.jpg",
        ],
        montageSeconds: 4.5,
        montageTransition: "dissolve",
        montageLoop: true,
        lines: [
          { role: "A Gaslight Reelworks Production", name: "" },
          { role: "New Direction — Scenes 1 & 2", name: "" },
          { role: "Written by", name: "Scarlet Reel" },
          { role: "Starring", name: "Jack Morrow" },
          { role: "And Introducing", name: "Vera Voss" },
          { role: "The Booth", name: "Daryl" },
          { role: "Set in", name: "Loyal, Nebraska — October, 1994" },
          { role: "No ending yet", name: "" },
        ],
      },
      background:
        "gradient:linear-gradient(170deg,#1b140d 0%,#2e2113 45%,#0d0b08 100%)",
      musicUrl: "/nobodys-witness.mp3",
      musicMode: "track",
      musicLevel: 0.6,
      ambientAudio: "drone",
      prose:
        "NOBODY'S WITNESS (NEW DIRECTION)\n\nA reimagined pulp story — set in 1994\n\nLoyal, Nebraska. October, 1994.\n\nTap to begin",
      choices: [
        {
          id: "nwn_begin",
          text: "Get off the bus.",
          targetSceneId: "nwn_bus_station",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 1: ARRIVAL ==================== */
    {
      id: "nwn_bus_station",
      title: "Scene 1 — Arrival",
      hideSceneTitle: true,
      background: "/img/nwn-bus-station.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "55% 42%",
        zoomDuration: 16,
        dimAmount: 0.18,
        lights: [
          {
            x: 22,
            y: 62,
            color: "#ffb35c",
            intensity: 0.34,
            size: 30,
            pulseSeconds: 4.1,
            pulseAmount: 0.7,
          },
          {
            x: 70,
            y: 30,
            color: "#9fb6c8",
            intensity: 0.16,
            size: 46,
            pulseSeconds: 5.5,
            pulseAmount: 0.5,
          },
        ],
      },
      prose:
        "LOYAL, NEBRASKA — BUS STATION — THURSDAY MORNING. Gray light. One bench. A Coke machine humming louder than it should. JACK MORROW, 32, gets off the bus — canvas bag over one shoulder, STATE PROPERTY stamped on it. He stands there a second, just looking at the town.",
      dialogueBeats: [
        {
          id: "nwn_bus_stands",
          characterId: "narrator",
          expression: "",
          text: "The bus pulls out. The Coke machine hums. The town goes on without saying anything.",
        },
      ],
      choices: [
        {
          id: "nwn_walk",
          text: "He walks.",
          targetSceneId: "nwn_main_street",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1b: MAIN STREET ==================== */
    {
      id: "nwn_main_street",
      title: "Main Street",
      hideSceneTitle: true,
      background: "/img/nwn-main-street.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "48% 50%",
        zoomDuration: 18,
        dimAmount: 0.16,
        lights: [
          {
            x: 30,
            y: 20,
            color: "#d9e2ea",
            intensity: 0.14,
            size: 60,
            pulseSeconds: 6,
            pulseAmount: 0.4,
          },
        ],
      },
      prose:
        "He walks. Past the Rexall — boarded up, window painted over from the inside. Past the grain elevator, still standing, not still working. Ahead: the house he grew up in. Smaller than he remembered it, which is always the lie towns tell.",
      dialogueBeats: [
        {
          id: "nwn_ms_doesnt_stop",
          characterId: "narrator",
          expression: "",
          text: "He doesn't stop.",
        },
      ],
      choices: [
        {
          id: "nwn_inn",
          text: "The Royal Inn.",
          targetSceneId: "nwn_motel",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["nwn_walked_past_the_house"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1c: THE ROYAL INN ==================== */
    {
      id: "nwn_motel",
      title: "The Royal Inn",
      hideSceneTitle: true,
      background: "/img/nwn-motel-sign.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      particles: "rain",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 26%",
        zoomDuration: 10,
        dimAmount: 0.12,
        lights: [
          {
            x: 30,
            y: 22,
            color: "#ff5a4a",
            intensity: 0.4,
            size: 34,
            pulseSeconds: 2.2,
            pulseAmount: 1,
          },
          {
            x: 80,
            y: 62,
            color: "#ffb35c",
            intensity: 0.28,
            size: 22,
            pulseSeconds: 3.1,
            pulseAmount: 0.8,
          },
        ],
      },
      prose:
        "He checks into the ROYAL INN. The R burned out years ago, so it just says OYAL INN — buzzing red over wet asphalt.",
      choices: [
        {
          id: "nwn_room",
          text: "Take a room.",
          targetSceneId: "nwn_motel_room",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1d: THE ROOM ==================== */
    {
      id: "nwn_motel_room",
      title: "The Room",
      hideSceneTitle: true,
      background: "/img/nwn-motel-room.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 14,
        dimAmount: 0.2,
        lights: [
          {
            x: 28,
            y: 58,
            color: "#ffc978",
            intensity: 0.32,
            size: 36,
            pulseSeconds: 3.6,
            pulseAmount: 0.7,
          },
        ],
      },
      prose:
        "INT. ROYAL INN — ROOM — CONTINUOUS. Small. Clean in the way that means somebody's still trying. Jack sits on the bed and doesn't turn on the TV. The bag sits by the door, STATE PROPERTY facing out.",
      dialogueBeats: [
        {
          id: "nwn_room_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Three years and you forget how to be alone in a room without making yourself small. I had four days to get over that habit.",
        },
        {
          id: "nwn_room_dark",
          characterId: "narrator",
          expression: "",
          text: "The TV stays dark.",
        },
      ],
      choices: [
        {
          id: "nwn_monday",
          text: "Monday, 6 PM. The Loyal Diner.",
          targetSceneId: "nwn_diner",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2: THE LOYAL DINER ==================== */
    {
      id: "nwn_diner",
      title: "Scene 2 — The Loyal Diner",
      hideSceneTitle: true,
      background: "/img/nwn-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "track",
      musicUrl: "/Midnight in the Rain2.mp3",
      musicLevel: 0.45,
      musicFadeSeconds: 2.0,
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "62% 46%",
        zoomDuration: 20,
        dimAmount: 0.12,
        lights: [
          {
            x: 60,
            y: 10,
            color: "#ffd99a",
            intensity: 0.4,
            size: 26,
            pulseSeconds: 3.2,
            pulseAmount: 0.6,
          },
          {
            x: 30,
            y: 14,
            color: "#ffb35c",
            intensity: 0.32,
            size: 24,
            pulseSeconds: 3.8,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "THE LOYAL DINER — MONDAY, 6 PM. Ten stools. Six booths. A pie case with two kinds of pie — the same ones from Friday. VERA VOSS, 29, blonde, works the counter solo. She's pouring coffee for DARYL — sixties, feed cap, permanent booth fixture — when Jack sits down. She doesn't look at him right away. Finishes with Daryl. Moves down the line. Checks on a booth. Then she comes to Jack.",
      dialogueBeats: [
        {
          id: "nwn_d_why",
          characterId: "vera",
          expression: "dry, not unkind",
          text: "You want coffee or you want to tell me why you're here?",
        },
        {
          id: "nwn_d_coffee",
          characterId: "jack",
          expression: "startled",
          text: "Coffee's good.",
        },
        {
          id: "nwn_d_ease",
          characterId: "vera",
          expression: "pouring",
          text: "That's not an answer to the second question, but okay, we'll ease into it.",
        },
        {
          id: "nwn_d_looks",
          characterId: "narrator",
          expression: "",
          text: "She sets the cup down. Looks at him.",
        },
        {
          id: "nwn_d_fbi",
          characterId: "vera",
          expression: "",
          text: "You got off the bus Thursday. Been at the Royal Inn. Started at Weller's this morning — Denny over at the Sinclair saw you walk the lot twice before you went in, said you looked like a man deciding whether the whole thing was worth the trouble. Small towns, honey, everybody's your own personal FBI whether they mean to be or not.",
        },
        {
          id: "nwn_d_jesus",
          characterId: "jack",
          expression: "",
          text: "Jesus Christ. That's a hell of a lot of information for a guy who ordered a coffee.",
        },
        {
          id: "nwn_d_ears",
          characterId: "vera",
          expression: "grinning",
          text: "I didn't even get to the good part yet. You walked it. Two and a half miles out to Weller's and two and a half back, and it's supposed to freeze tonight. That one I figured out myself — no car in the lot at the Inn, and you came in here with your ears red.",
        },
        {
          id: "nwn_d_special",
          characterId: "jack",
          expression: "",
          text: "You do this to everybody or am I special?",
        },
        {
          id: "nwn_d_deluxe",
          characterId: "vera",
          expression: "",
          text: "Oh, everybody gets it, honey, don't go feeling singled out. You're just the first new face since March, so you're gettin' the deluxe package. Comes with free refills and my whole personality.",
        },
        {
          id: "nwn_d_owes",
          characterId: "vera",
          expression: "beat, studying him",
          text: "And you've been staring at that coffee like it owes you money. That tells me something, I just ain't decided what yet.",
        },
        {
          id: "nwn_d_stared",
          characterId: "jack",
          expression: "",
          text: "Or maybe I just don't much like being stared at.",
        },
        {
          id: "nwn_d_eyes",
          characterId: "vera",
          expression: "",
          text: "Mm. Or maybe you spent a while somewhere they teach you real quick that eye contact's a bad idea.",
        },
        {
          id: "nwn_d_still",
          characterId: "narrator",
          expression: "",
          text: "Jack goes still. Doesn't answer.",
        },
        {
          id: "nwn_d_con",
          characterId: "vera",
          expression: "soft — not pushing, but not backing off either",
          text: "That's fine. I'm not asking you to confess nothing. I just notice things, it's a whole personality flaw of mine. My mama used to say I'd make a hell of a cop or a hell of a con artist, depending on the day.",
        },
        {
          id: "nwn_d_which",
          characterId: "jack",
          expression: "",
          text: "Which one'd you pick?",
        },
        {
          id: "nwn_d_neither",
          characterId: "vera",
          expression: "",
          text: "Neither. I make grilled cheese and I mind my business, mostly. Mostly.",
        },
        {
          id: "nwn_d_hand",
          characterId: "vera",
          expression: "sticking her hand out",
          text: "Vera, by the way. Since we're already this far in.",
        },
        {
          id: "nwn_d_jack",
          characterId: "jack",
          expression: "shaking it",
          text: "Jack.",
        },
        {
          id: "nwn_d_looklike",
          characterId: "vera",
          expression: "",
          text: "Jack. Okay. You look like a Jack. That's a compliment, I think, I haven't fully worked it out.",
        },
      ],
      choices: [
        {
          id: "nwn_sandwich_go",
          text: "Let her work the room.",
          targetSceneId: "nwn_sandwich",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [
        { consequences: { setFlags: ["nwn_vera_poured_first"] } },
      ],
    },

    /* ==================== SCENE 2b: THE GRILLED CHEESE + DARYL ==================== */
    {
      id: "nwn_sandwich",
      title: "The Grilled Cheese",
      hideSceneTitle: true,
      background: "/img/nwn-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "68% 44%",
        zoomDuration: 16,
        dimAmount: 0.14,
        lights: [
          {
            x: 70,
            y: 12,
            color: "#ffd99a",
            intensity: 0.38,
            size: 26,
            pulseSeconds: 3.4,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "She moves off. Refills Daryl's coffee, says something that makes him laugh, comes back with a plate — grilled cheese, already made.",
      dialogueBeats: [
        {
          id: "nwn_s_here",
          characterId: "vera",
          expression: "",
          text: "Here. Didn't ask what you wanted 'cause you had the look of a man who hasn't been asked what he wants in a real long time, and I didn't want to put that pressure on you your first night in my diner.",
        },
        {
          id: "nwn_s_thanks",
          characterId: "jack",
          expression: "thrown",
          text: "That's — shit. Thanks.",
        },
        {
          id: "nwn_s_tasted",
          characterId: "vera",
          expression: "",
          text: "Don't thank me yet, you ain't tasted it. I've had a man tell me this sandwich changed his life and I've had a man tell me it's just a sandwich, and honestly? Both of 'em seemed real sure.",
        },
        {
          id: "nwn_s_good",
          characterId: "narrator",
          expression: "",
          text: "He eats. It's good.",
        },
        {
          id: "nwn_s_itgood",
          characterId: "jack",
          expression: "",
          text: "It's good.",
        },
        {
          id: "nwn_s_shoes",
          characterId: "vera",
          expression: "delighted, like she wasn't expecting him to actually say it",
          text: "See, now that's the nicest thing anybody's said to me since Tuesday, and Tuesday somebody complimented my shoes, so you're really cutting it close with the shoes.",
        },
        {
          id: "nwn_s_daryl_pie",
          characterId: "narrator",
          expression: "",
          text: "She moves off to top up Daryl's coffee. He's got a slice of pie in front of him.",
        },
        {
          id: "nwn_s_breakfast",
          characterId: "daryl",
          expression: "not looking up",
          text: "This is breakfast, right here. I'm having breakfast for dinner.",
        },
        {
          id: "nwn_s_notbreakfast",
          characterId: "vera",
          expression: "",
          text: "That's pie, Daryl. Pie's not breakfast.",
        },
        {
          id: "nwn_s_nutrition",
          characterId: "daryl",
          expression: "",
          text: "Pie's got fruit in it. Fruit's breakfast. That's just basic nutrition.",
        },
        {
          id: "nwn_s_costume",
          characterId: "vera",
          expression: "",
          text: "It's got fruit and a pound of sugar and a crust made of Crisco. That's not a fruit delivery system, that's a dessert wearing a little fruit costume.",
        },
        {
          id: "nwn_s_grandma",
          characterId: "daryl",
          expression: "",
          text: "My grandmother ate pie every morning of her life. Lived to ninety-one.",
        },
        {
          id: "nwn_s_rules",
          characterId: "vera",
          expression: "",
          text: "Your grandmother also smoked two packs a day and outlived three husbands, Daryl, she wasn't operating on the same rules as the rest of us.",
        },
        {
          id: "nwn_s_facts",
          characterId: "daryl",
          expression: "pointing his fork at her",
          text: "That's not a counterargument, that's just facts about my grandmother.",
        },
        {
          id: "nwn_s_counter",
          characterId: "vera",
          expression: "already moving away, calling back",
          text: "Facts about your grandmother are exactly my counterargument!",
        },
      ],
      choices: [
        {
          id: "nwn_let_land",
          text: "Let it land.",
          targetSceneId: "nwn_mama",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2c: MAMA + CODY + BULLSHIT ==================== */
    {
      id: "nwn_mama",
      title: "Mama and Cody",
      hideSceneTitle: true,
      background: "/img/nwn-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 40%",
        zoomDuration: 16,
        dimAmount: 0.16,
        lights: [
          {
            x: 45,
            y: 12,
            color: "#ffd99a",
            intensity: 0.36,
            size: 28,
            pulseSeconds: 3.6,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "She's back behind the counter, shaking her head, half-laughing at herself. She hops up, sits on the counter, swinging her legs like she's got nowhere better to be, which she doesn't.",
      dialogueBeats: [
        {
          id: "nwn_m_cook",
          characterId: "vera",
          expression: "",
          text: "My mama taught me to cook when I was five. Said if I could feed myself I'd never have to depend on some man for a damn thing. Turned out to be wrong about the depending part — I depend on everybody, I'm a mess — but she was dead right about the cooking.",
        },
        {
          id: "nwn_m_where",
          characterId: "jack",
          expression: "",
          text: "Where's your mama now?",
        },
        {
          id: "nwn_m_dead",
          characterId: "vera",
          expression: "plain — not sad, not performing sad",
          text: "Dead. Seven years. Cancer, the fast kind, which I guess if you're gonna get cancer that's the mercy version, though nobody tells you that part till after.",
        },
        {
          id: "nwn_m_cody",
          characterId: "vera",
          expression: "",
          text: "Got a brother after that. Cody. He was nine then, he's sixteen now, and he's currently got some real interesting theories about how a man makes money in a town with no jobs, and every single one of his theories is gonna get him hurt or arrested or both.",
        },
        {
          id: "nwn_m_fixable",
          characterId: "jack",
          expression: "",
          text: "That fixable?",
        },
        {
          id: "nwn_m_annoy",
          characterId: "vera",
          expression: "",
          text: "Nope. But I annoy him about it daily, which is basically my whole parenting strategy.",
        },
        {
          id: "nwn_m_refill",
          characterId: "narrator",
          expression: "",
          text: "She hops down. Refills his coffee he didn't ask for — starting to be a pattern.",
        },
        {
          id: "nwn_m_yourturn",
          characterId: "vera",
          expression: "",
          text: "Okay, your turn. What's your story. And don't give me the church version where you come out looking decent.",
        },
        {
          id: "nwn_m_guy",
          characterId: "jack",
          expression: "",
          text: "Ain't got one. I'm just some guy at a garage.",
        },
        {
          id: "nwn_m_bullshit",
          characterId: "vera",
          expression: "flat, calling it immediately",
          text: "Bullshit.",
        },
        {
          id: "nwn_m_excuse",
          characterId: "jack",
          expression: "almost smiling",
          text: "Excuse me?",
        },
        {
          id: "nwn_m_wetcoat",
          characterId: "vera",
          expression: "",
          text: "You heard me. You got a story sitting on you like a wet coat, honey, I can see the shape of it from here. You just don't want to hang it up yet.",
        },
        {
          id: "nwn_m_sit",
          characterId: "narrator",
          expression: "",
          text: "Jack doesn't answer. She lets it sit a second.",
        },
      ],
      choices: [
        {
          id: "nwn_pivot",
          text: "Let it sit.",
          targetSceneId: "nwn_catchup",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2d: THE CATCH-UP ==================== */
    {
      id: "nwn_catchup",
      title: "The Catch-Up",
      hideSceneTitle: true,
      background: "/img/nwn-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "55% 50%",
        zoomDuration: 20,
        dimAmount: 0.14,
        lights: [
          {
            x: 60,
            y: 12,
            color: "#ffd99a",
            intensity: 0.34,
            size: 26,
            pulseSeconds: 3.2,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "Then, instead of pushing, she pivots hard, like she's decided to give him the out herself.",
      dialogueBeats: [
        {
          id: "nwn_c_tower",
          characterId: "vera",
          expression: "counting off on her fingers",
          text: "Fine. You don't wanna talk about you, let's talk about what you missed. You been gone, what, three years? Lemme catch you up. The water tower got repainted. Used to say LOYAL in blue, now it says LOYAL in a blue everybody agrees is the wrong blue, and there was an actual town meeting about it. Forty-five minutes. Grown adults. One woman cried.",
        },
        {
          id: "nwn_c_paint",
          characterId: "jack",
          expression: "",
          text: "She cried. About paint.",
        },
        {
          id: "nwn_c_corporate",
          characterId: "vera",
          expression: "not stopping",
          text: "Cried about paint, Jack. Said the old blue was 'her grandfather's blue' and the new blue was 'corporate.' It's the same can of paint from the same hardware store, but sure, corporate.",
        },
        {
          id: "nwn_c_fireworks",
          characterId: "vera",
          expression: "",
          text: "The Fourth of July fireworks got cancelled two years running 'cause the volunteer fire department's down to four guys and none of 'em wanna work a holiday for free, so now everybody just drives to Beatrice to watch theirs, which means our whole Fourth of July is us watching somebody else's fireworks from a ditch off Highway 4, which is depressing if you think about it, so I try not to.",
        },
        {
          id: "nwn_c_laugh",
          characterId: "jack",
          expression: "actually laughing now, first real one",
          text: "Three fuckin' years and that's it? Paint and fireworks?",
        },
        {
          id: "nwn_c_thatsit",
          characterId: "vera",
          expression: "",
          text: "That's it. That's three years. I told you this town doesn't have a lot going on, I wasn't being modest.",
        },
        {
          id: "nwn_c_darylsgrandma",
          characterId: "vera",
          expression: "beat, softer",
          text: "Oh, and Daryl's grandmother died. Not the pie one. Different Daryl.",
        },
        {
          id: "nwn_c_twodaryls",
          characterId: "jack",
          expression: "",
          text: "There's two Daryls?",
        },
        {
          id: "nwn_c_fourdaryls",
          characterId: "vera",
          expression: "",
          text: "There's four Daryls. It's a real problem. We should've spaced those out better as a community.",
        },
        {
          id: "nwn_c_joke",
          characterId: "narrator",
          expression: "",
          text: "She laughs at her own joke, which is somehow more charming than if it had actually been that funny.",
        },
        {
          id: "nwn_c_room",
          characterId: "narrator",
          expression: "",
          text: "She walks off. Works the room — refills, jokes, a hand on somebody's shoulder, laughing at something Daryl says that isn't that funny. She's good at this. Not performing good, just actually good at it.",
        },
      ],
      choices: [
        {
          id: "nwn_listen",
          text: "Twenty minutes later.",
          targetSceneId: "nwn_close",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [
        { consequences: { setFlags: ["nwn_kept_the_story_folded"] } },
      ],
    },

    /* ==================== SCENE 2e: CLOSER ==================== */
    {
      id: "nwn_close",
      title: "Closer",
      hideSceneTitle: true,
      background: "/img/nwn-diner-close.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "55% 48%",
        zoomDuration: 18,
        dimAmount: 0.22,
        lights: [
          {
            x: 58,
            y: 40,
            color: "#ffd99a",
            intensity: 0.34,
            size: 26,
            pulseSeconds: 3.6,
            pulseAmount: 0.6,
          },
          {
            x: 20,
            y: 30,
            color: "#7fb2d9",
            intensity: 0.18,
            size: 30,
            pulseSeconds: 4.4,
            pulseAmount: 0.5,
          },
        ],
      },
      prose:
        "Twenty minutes later, the diner's nearly empty. Daryl's got his paper. A couple truckers are half-asleep over their coffee. She comes back and sits on the stool next to Jack instead of standing across from him — different now, closer.",
      dialogueBeats: [
        {
          id: "nwn_cl_worth",
          characterId: "vera",
          expression: "for what it's worth — she doesn't say this to just anybody",
          text: "I don't actually care what you did. People do stupid shit. That's not a character flaw, that's just Tuesday.",
        },
        {
          id: "nwn_cl_careabout",
          characterId: "jack",
          expression: "",
          text: "So what the hell do you care about?",
        },
        {
          id: "nwn_cl_asshole",
          characterId: "vera",
          expression: "looking right at him",
          text: "Whether you're gonna turn out to be an asshole. That's it. That's the whole list.",
        },
        {
          id: "nwn_cl_jury",
          characterId: "jack",
          expression: "",
          text: "Jury's still out.",
        },
        {
          id: "nwn_cl_cups",
          characterId: "vera",
          expression: "standing, gathering cups",
          text: "Well, you let me know when you land on it. I got nothin' but time and about four hundred coffee cups.",
        },
        {
          id: "nwn_cl_shoulder",
          characterId: "narrator",
          expression: "",
          text: "She puts a hand on his shoulder — brief, easy, not a big deal to her, a very big deal to him — then moves off toward the register.",
        },
        {
          id: "nwn_cl_vo1",
          characterId: "jack",
          expression: "V.O.",
          text: "Five days out. I'd told myself I came back to Loyal because there was nowhere else left to go.",
        },
        {
          id: "nwn_cl_refill",
          characterId: "narrator",
          expression: "",
          text: "She refills his cup one last time without asking. Doesn't say anything. Just sets it down, gives him a look that isn't quite a smile but isn't far off, and goes back to closing out the register.",
        },
        {
          id: "nwn_cl_truck",
          characterId: "narrator",
          expression: "",
          text: "Outside, the night comes down over the lot. One truck. Nobody in it.",
        },
      ],
      choices: [
        {
          id: "nwn_black",
          text: "FADE TO BLACK.",
          targetSceneId: "nwn_fade",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== END OF PART ONE ==================== */
    {
      id: "nwn_fade",
      title: "Fade to Black",
      hideSceneTitle: true,
      background: "/img/nwn-diner-close.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "55% 48%",
        zoomDuration: 16,
        dimAmount: 0.5,
        lights: [
          {
            x: 58,
            y: 40,
            color: "#ffd99a",
            intensity: 0.3,
            size: 26,
            pulseSeconds: 4,
            pulseAmount: 0.5,
          },
        ],
      },
      transition: "fade-black",
      transitionSpeed: 2.2,
      prose:
        "FADE TO BLACK.\n\nOne truck. Nobody in it.\n\n— END OF PART ONE —\n\nNobody's Witness (New Direction) — no ending yet. Part Two is not written.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "ONE TRUCK. NOBODY IN IT.",
        recap:
          "Part One complete. Jack got off the bus, walked past the house he grew up in, sat on a motel bed for four days, and took a seat at the Loyal Diner counter. Vera Voss clocked every mile he walked and every eye he avoided — then called him 'Bullshit' and let the story stay folded. Outside, the night comes down over the lot. One truck. Nobody in it.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
      onEnterActions: [
        { consequences: { setFlags: ["nwn_truck_in_the_lot"] } },
      ],
    },

    /* ==================== PART TWO PLACEHOLDER ==================== */
    {
      id: "nwn_scene3_note",
      title: "Part Two — not written yet",
      nodeType: "note",
      note: "NOBODY'S WITNESS (NEW DIRECTION) continues in Part Two — not written yet: who the truck in the lot belongs to, what Jack's second week at Weller's brings, and what Vera knows about Cody. Wire this note into the graph once Scene 3 is written.",
      background:
        "gradient:linear-gradient(160deg,#100d09 0%,#241a10 60%,#0b0907 100%)",
      prose: "Part Two not written yet.",
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
