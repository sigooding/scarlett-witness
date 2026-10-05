import type { Story } from "../types";

/**
 * THE LATE SHIFT (REDUX) — Part One, Revised.
 * A reimagined pulp magazine story set in 1990s rural Nebraska.
 *
 * Brand-new story from the author's revised script. Ignore the earlier
 * version (theLateShiftReimagined.ts stays in the catalogue untouched) —
 * this is the fresh Part One: Jack Morrow, 32, just out of Tecumseh
 * Correctional, comes home to Loyal, Nebraska in October 1994 with four
 * empty days before a job at Weller's garage. Thursday morning off the bus,
 * Monday night at the Loyal Diner with Vera Voss — and a knock at the door
 * from somebody who already knew where to find him.
 *
 * Scenes 1–2 only. No ending yet: Part One ends on the knock and a fade to
 * black, with a "Part Two" note node on the canvas wired for Scene 3.
 *
 * Art is painted in gouache/oil pulp-cover style with halftone grain, but
 * the world is 1990s rural America — Coke machines, OYAL INN neon, canvas
 * bags stamped PROPERTY OF STATE. All plates are 16:9 landscape.
 */
export const THE_LATE_SHIFT_REDUX: Story = {
  id: "the-late-shift-redux",
  title: "The Late Shift (Redux)",
  tagline:
    "Part One — Revised. A reimagined pulp story. He came home to a town he used to be from. Somebody already knew where to find him.",
  coverImage: "/img/lsrx-cover.jpg",
  startSceneId: "lsrx_credits",
  briefing: {
    objective:
      "Get Jack Morrow through his first week home — off the bus, past the house he grew up in, into the seat at the Loyal Diner counter — and out the other side of a Monday night somebody has been waiting for.",
    winConditions: [
      "Get off the bus in Loyal and face the town for the first time in three years.",
      "Choose how to pass the house on Maple Street.",
      "Last the four days before Monday and show up for the job.",
      "Keep your seat at the Loyal Diner counter when the knock comes.",
    ],
    loseConditions: [
      "Knock on doors you said you'd leave shut.",
      "Be the man everyone in town already thinks you are.",
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
    lsrx_credits: { x: 0, y: 220 },
    lsrx_bus_station: { x: 320, y: 220 },
    lsrx_main_street: { x: 640, y: 220 },
    lsrx_house: { x: 960, y: 220 },
    lsrx_house_a: { x: 1280, y: 60 },
    lsrx_house_b: { x: 1280, y: 220 },
    lsrx_house_c: { x: 1280, y: 380 },
    lsrx_motel: { x: 1600, y: 220 },
    lsrx_motel_room: { x: 1920, y: 220 },
    lsrx_diner: { x: 2240, y: 220 },
    lsrx_diner_counter: { x: 2560, y: 220 },
    lsrx_diner_close: { x: 2880, y: 220 },
    lsrx_fade: { x: 3200, y: 220 },
    lsrx_scene3_note: { x: 3520, y: 220 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Just off the bus",
      avatarUrl: "/img/lsrx-jack.jpg",
      trustMeter: 0,
      voice: { pitch: 0.92, rate: 0.95 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The Loyal Diner, late shift",
      avatarUrl: "/img/lsrx-vera.jpg",
      trustMeter: 0,
      voice: { pitch: 1.08, rate: 1.02 },
    },
  ],
  items: [],
  flagNotes: {
    lsrx_kept_walking:
      "At the house on Maple Street, Jack kept walking — didn't slow down, didn't turn his head.",
    lsrx_slowed_down:
      "At the house on Maple Street, Jack slowed down half a step. A curtain moved in the front window — or didn't.",
    lsrx_stopped_at_home:
      "At the house on Maple Street, Jack stood in the road until a dog started up somewhere. Nobody came out.",
    lsrx_ate_the_grilled_cheese:
      "Jack ordered the grilled cheese and ate it plain.",
    lsrx_told_vera_robbery:
      "Jack told Vera the truth about the robbery — the robbing part was him, the planning was somebody else.",
  },
  scenes: [
    /* ==================== TITLE / CREDITS ==================== */
    {
      id: "lsrx_credits",
      title: "The Late Shift (Redux)",
      nodeType: "credits",
      credits: {
        title: "THE LATE SHIFT",
        subtitle: "(REDUX) · A Reimagined Pulp Story · Part One — Revised",
        font: "pulp",
        titleEntrance: "slam",
        cardMotion: "slam",
        style: "cards",
        cardSeconds: 3.6,
        stagger: 0.55,
        duration: 1.0,
        accentColor: "#c8862f",
        titleColor: "#e8c878",
        gateWeave: "worn",
        montage: [
          "/img/lsrx-bus-station.jpg",
          "/img/lsrx-main-street.jpg",
          "/img/lsrx-motel-sign.jpg",
          "/img/lsrx-diner.jpg",
        ],
        montageSeconds: 4.5,
        montageTransition: "dissolve",
        montageLoop: true,
        lines: [
          { role: "A Gaslight Reelworks Production", name: "" },
          { role: "Part One — Revised", name: "" },
          { role: "Written by", name: "Scarlet Reel" },
          { role: "Starring", name: "Jack Morrow" },
          { role: "And Introducing", name: "Vera Voss" },
          { role: "Set in", name: "Loyal, Nebraska — October, 1994" },
          { role: "A story of coming home", name: "" },
        ],
      },
      background:
        "gradient:linear-gradient(170deg,#1b140d 0%,#2e2113 45%,#0d0b08 100%)",
      musicUrl: "/Soundtrack.mp3",
      musicMode: "track",
      musicLevel: 0.6,
      ambientAudio: "drone",
      prose:
        "THE LATE SHIFT (REDUX)\n\nA reimagined pulp story — Part One, Revised\n\nLoyal, Nebraska. October, 1994.\n\nTap to begin",
      choices: [
        {
          id: "lsrx_begin",
          text: "Get off the bus.",
          targetSceneId: "lsrx_bus_station",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 1: ARRIVAL ==================== */
    {
      id: "lsrx_bus_station",
      title: "Scene 1 — Arrival",
      hideSceneTitle: true,
      background: "/img/lsrx-bus-station.jpg",
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
        "LOYAL, NEBRASKA — BUS STATION — THURSDAY MORNING. Gray light that won't commit to a time of day. The station is one bench and a Coke machine humming louder than it should. JACK MORROW, 32, is the only one who gets off the bus. Canvas bag over one shoulder — PROPERTY OF STATE, stamped in letters that don't fade fast enough.",
      dialogueBeats: [
        {
          id: "lsrx_bus_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "I grew up in Loyal. Left it the first chance I got, which turned out to be a stretch at Tecumseh, which tells you something about the chances I was working with.",
        },
        {
          id: "lsrx_bus_stage",
          characterId: "narrator",
          expression: "",
          text: "He doesn't move right away. Looks at the town like a photograph of somebody he used to know.",
        },
      ],
      choices: [
        {
          id: "lsrx_walk",
          text: "Walk.",
          targetSceneId: "lsrx_main_street",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1b: MAIN STREET ==================== */
    {
      id: "lsrx_main_street",
      title: "Main Street",
      hideSceneTitle: true,
      background: "/img/lsrx-main-street.jpg",
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
        "He walks. Past the Rexall — empty now, window painted over from the inside. Past the Odd Fellows hall, boarded. Past a mural of wheat sheaves somebody painted forty years ago when they still believed in the wheat.",
      dialogueBeats: [
        {
          id: "lsrx_ms_house",
          characterId: "narrator",
          expression: "",
          text: "Ahead: the house he grew up in. Smaller than memory. Paint gone to chalk. Somebody else's truck in the drive.",
        },
      ],
      choices: [
        {
          id: "lsrx_house_a_choice",
          text: "Keep walking. Don't slow down. Don't turn your head.",
          targetSceneId: "lsrx_house_a",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["lsrx_kept_walking"] },
        },
        {
          id: "lsrx_house_b_choice",
          text: "Slow down. Half a step. Just enough.",
          targetSceneId: "lsrx_house_b",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["lsrx_slowed_down"] },
        },
        {
          id: "lsrx_house_c_choice",
          text: "Stop. Stand in the road long enough for somebody to come out.",
          targetSceneId: "lsrx_house_c",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["lsrx_stopped_at_home"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1c: THE HOUSE — THREE WAYS PAST ==================== */
    {
      id: "lsrx_house_a",
      title: "Keep Walking",
      hideSceneTitle: true,
      background: "/img/lsrx-house.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "40% 46%",
        zoomDuration: 14,
        dimAmount: 0.18,
      },
      prose: "The house he grew up in.",
      dialogueBeats: [
        {
          id: "lsrx_ha_stage",
          characterId: "narrator",
          expression: "",
          text: "He doesn't slow down. Doesn't turn his head. The house goes by like any other house.",
        },
        {
          id: "lsrx_ha_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Some doors you don't knock on twice.",
        },
      ],
      choices: [
        {
          id: "lsrx_ha_on",
          text: "Check into the Royal Inn.",
          targetSceneId: "lsrx_motel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },
    {
      id: "lsrx_house_b",
      title: "Slow Down",
      hideSceneTitle: true,
      background: "/img/lsrx-house.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 44%",
        zoomDuration: 14,
        dimAmount: 0.2,
      },
      prose: "The house he grew up in.",
      dialogueBeats: [
        {
          id: "lsrx_hb_stage",
          characterId: "narrator",
          expression: "",
          text: "Half a step. Just enough. A curtain moves in the front window — or doesn't.",
        },
        {
          id: "lsrx_hb_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Some doors you don't knock on twice.",
        },
      ],
      choices: [
        {
          id: "lsrx_hb_on",
          text: "Check into the Royal Inn.",
          targetSceneId: "lsrx_motel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },
    {
      id: "lsrx_house_c",
      title: "Stop",
      hideSceneTitle: true,
      background: "/img/lsrx-house.jpg",
      ambientAudio: "drone",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 40%",
        zoomDuration: 18,
        dimAmount: 0.22,
      },
      prose: "The house he grew up in.",
      dialogueBeats: [
        {
          id: "lsrx_hc_stage",
          characterId: "narrator",
          expression: "",
          text: "He stands in the road a while. Long enough that a dog starts up somewhere. Long enough that somebody could come out if they wanted to. Nobody does.",
        },
        {
          id: "lsrx_hc_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Some doors you don't knock on twice.",
        },
      ],
      choices: [
        {
          id: "lsrx_hc_on",
          text: "Check into the Royal Inn.",
          targetSceneId: "lsrx_motel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1d: THE ROYAL INN ==================== */
    {
      id: "lsrx_motel",
      title: "The Royal Inn",
      hideSceneTitle: true,
      background: "/img/lsrx-motel-sign.jpg",
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
            x: 50,
            y: 26,
            color: "#ff5a4a",
            intensity: 0.4,
            size: 34,
            pulseSeconds: 2.2,
            pulseAmount: 1,
          },
          {
            x: 88,
            y: 72,
            color: "#ffb35c",
            intensity: 0.28,
            size: 22,
            pulseSeconds: 3.1,
            pulseAmount: 0.8,
          },
        ],
      },
      prose:
        "He checks into the ROYAL INN. The R burned out years ago, so it just says OYAL INN. Buzzing red neon above wet asphalt.",
      choices: [
        {
          id: "lsrx_check_in",
          text: "Take a room.",
          targetSceneId: "lsrx_motel_room",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1e: THE ROOM ==================== */
    {
      id: "lsrx_motel_room",
      title: "Room 7",
      hideSceneTitle: true,
      background: "/img/lsrx-motel-room.jpg",
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
            x: 62,
            y: 44,
            color: "#ffc978",
            intensity: 0.32,
            size: 36,
            pulseSeconds: 3.6,
            pulseAmount: 0.7,
          },
        ],
      },
      prose:
        "INT. ROYAL INN — ROOM — CONTINUOUS. Small. Clean in the way that means somebody's still trying. Jack sits on the edge of the bed like he's waiting for permission.",
      dialogueBeats: [
        {
          id: "lsrx_room_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Friday I drove out to Beatrice and sat in a county office while a man I'd never met wrote down where I was staying. Monday I start at Weller's, because Weller takes cons — cons work cheap and don't file complaints. That left me the weekend to remember how to be somebody instead of a number.",
        },
        {
          id: "lsrx_room_ceiling",
          characterId: "narrator",
          expression: "",
          text: "He looks at the ceiling. A water stain shaped like nothing.",
        },
        {
          id: "lsrx_room_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Four days in a town I used to be from. That's a specific kind of homesick.",
        },
      ],
      choices: [
        {
          id: "lsrx_to_diner",
          text: "Monday, 6 PM. The Loyal Diner.",
          targetSceneId: "lsrx_diner",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2: THE DINER ==================== */
    {
      id: "lsrx_diner",
      title: "Scene 2 — The Diner",
      hideSceneTitle: true,
      background: "/img/lsrx-diner.jpg",
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
            x: 66,
            y: 12,
            color: "#ffd99a",
            intensity: 0.4,
            size: 26,
            pulseSeconds: 3.2,
            pulseAmount: 0.6,
          },
          {
            x: 30,
            y: 16,
            color: "#ffb35c",
            intensity: 0.32,
            size: 24,
            pulseSeconds: 3.8,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "THE LOYAL DINER — MONDAY, 6 PM. Ten stools, six booths, a pie case running the same two pies it ran on Friday. Jack takes the counter. Booths are for people with somewhere to be after. VERA VOSS, 29, works it solo. Red hair coming loose from a ponytail. She's talking before he's fully sat down.",
      dialogueBeats: [
        {
          id: "lsrx_d_vera_1",
          characterId: "vera",
          expression: "to the coffee pot, to the room",
          text: "—and I said honey, I love you, but that meatloaf has got a survival story, and it ain't the kind I want to hear about my dinner.",
        },
        {
          id: "lsrx_d_recognition",
          characterId: "narrator",
          expression: "",
          text: "She turns. Sees him. Something happens in her face — fast, small, gone before it finishes. Not surprise. Recognition, and then a decision. Then the warmth comes down over it like a shade.",
        },
        {
          id: "lsrx_d_vera_2",
          characterId: "vera",
          expression: "warm as a lit stove",
          text: "Well, hello, sugar. Sit anywhere you want, the crowd's about to riot.",
        },
        {
          id: "lsrx_d_pours",
          characterId: "narrator",
          expression: "",
          text: "She pours his coffee before he asks.",
        },
        {
          id: "lsrx_d_jack_1",
          characterId: "jack",
          expression: "",
          text: "Grew up here. Been gone a while.",
        },
        {
          id: "lsrx_d_vera_3",
          characterId: "vera",
          expression: "not missing a beat",
          text: "Figured. You've got the look. People who grew up here walk in like they're checking whether the ceiling's still the same height.",
        },
        {
          id: "lsrx_d_jack_2",
          characterId: "jack",
          expression: "",
          text: "Is it?",
        },
        {
          id: "lsrx_d_vera_4",
          characterId: "vera",
          expression: "",
          text: "Lower every year, honey. Don't get the meatloaf.",
        },
        {
          id: "lsrx_d_jack_order",
          characterId: "jack",
          expression: "",
          text: "Grilled cheese.",
        },
        {
          id: "lsrx_d_vera_5",
          characterId: "vera",
          expression: "pointing at him, approving",
          text: "Fast decisions. I respect that in a man who's clearly got nowhere to be.",
        },
        {
          id: "lsrx_d_vera_call",
          characterId: "vera",
          expression: "calling it back without turning fully around",
          text: "GRILLED CHEESE, PLAIN!",
        },
      ],
      choices: [
        {
          id: "lsrx_eat",
          text: "Eat the sandwich.",
          targetSceneId: "lsrx_diner_counter",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["lsrx_ate_the_grilled_cheese"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2b: AT THE COUNTER ==================== */
    {
      id: "lsrx_diner_counter",
      title: "At the Counter",
      hideSceneTitle: true,
      background: "/img/lsrx-diner.jpg",
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
            y: 14,
            color: "#ffd99a",
            intensity: 0.38,
            size: 26,
            pulseSeconds: 3.4,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "She's off down the counter, refilling Billy's cup.",
      dialogueBeats: [
        {
          id: "lsrx_dc_billy",
          characterId: "vera",
          expression: "to Billy",
          text: "Third pie this week, Billy. I'm going to start charging you rent on that booth. I'm not mad about it, I want to be clear. That's commitment.",
        },
        {
          id: "lsrx_dc_billy_line",
          characterId: "narrator",
          expression: "",
          text: "BILLY, who doesn't look up: Last week was four.",
        },
        {
          id: "lsrx_dc_vera_2",
          characterId: "vera",
          expression: "delighted",
          text: "Was it? See, now you're bringing out the worst in me.",
        },
        {
          id: "lsrx_dc_laugh",
          characterId: "narrator",
          expression: "",
          text: "Real laugh. Two other people in the diner look up and smile at nothing.",
        },
        {
          id: "lsrx_dc_back",
          characterId: "narrator",
          expression: "",
          text: "She's back with the sandwich. Sets it down. Leans on the counter.",
        },
        {
          id: "lsrx_dc_vera_3",
          characterId: "vera",
          expression: "",
          text: "Okay. Let me guess you.",
        },
        {
          id: "lsrx_dc_jack_1",
          characterId: "jack",
          expression: "",
          text: "Guess me.",
        },
        {
          id: "lsrx_dc_vera_4",
          characterId: "vera",
          expression: "sizing him up",
          text: "I'm good at this. I can smell a lie through a wall. Bar fight. Something dumb, a couple of years, and the other fella's fine now and doesn't even remember your name.",
        },
        {
          id: "lsrx_dc_jack_2",
          characterId: "jack",
          expression: "a beat",
          text: "Robbery.",
        },
        {
          id: "lsrx_dc_vera_5",
          characterId: "vera",
          expression: "barely a flicker — she recovers fast, but she was wrong and she knows it",
          text: "...Well. Okay. I said I was good, I didn't say I was right.",
        },
        {
          id: "lsrx_dc_jack_3",
          characterId: "jack",
          expression: "",
          text: "The robbing part was me. The planning was somebody else's. I was just there.",
        },
        {
          id: "lsrx_dc_stops",
          characterId: "narrator",
          expression: "",
          text: "She stops wiping the counter. Looks at him properly for the first time.",
        },
        {
          id: "lsrx_dc_vera_6",
          characterId: "vera",
          expression: "",
          text: "Robbing part was you, but you were just there. That's a lot of man for one sentence, honey.",
        },
        {
          id: "lsrx_dc_mercy",
          characterId: "narrator",
          expression: "",
          text: "Jack doesn't answer. Looks at his plate. She lets it go. That's the mercy — she lets it go.",
        },
        {
          id: "lsrx_dc_vera_7",
          characterId: "vera",
          expression: "brightening, moving again",
          text: "Eat your sandwich.",
        },
        {
          id: "lsrx_dc_kid",
          characterId: "narrator",
          expression: "",
          text: "A kid yells from a booth. She waves without looking.",
        },
        {
          id: "lsrx_dc_vera_8",
          characterId: "vera",
          expression: "",
          text: "He's fine, sweetheart, let him yell. Lord knows this town could use some yelling that isn't angry.",
        },
        {
          id: "lsrx_dc_refill",
          characterId: "narrator",
          expression: "",
          text: "She refills Jack's coffee he didn't ask for.",
        },
        {
          id: "lsrx_dc_vera_9",
          characterId: "vera",
          expression: "",
          text: "So you're sticking, or you're passing through like a sad country song?",
        },
        {
          id: "lsrx_dc_jack_4",
          characterId: "jack",
          expression: "",
          text: "Weller's. Started this morning.",
        },
        {
          id: "lsrx_dc_vera_10",
          characterId: "vera",
          expression: "something crosses her face — quick",
          text: "Weller's.",
        },
        {
          id: "lsrx_dc_jack_5",
          characterId: "jack",
          expression: "",
          text: "That a problem?",
        },
        {
          id: "lsrx_dc_vera_11",
          characterId: "vera",
          expression: "too easy, too fast",
          text: "Not a bit. He pays Fridays. Cash, mostly. You'll want to know that.",
        },
        {
          id: "lsrx_dc_moves",
          characterId: "narrator",
          expression: "",
          text: "She moves off. Wipes a table that's already clean. Comes back.",
        },
        {
          id: "lsrx_dc_vera_12",
          characterId: "vera",
          expression: "",
          text: "Everything tastes better when you've been gone a while. Coffee's stronger, light's better. Don't get too attached to the feeling.",
        },
        {
          id: "lsrx_dc_jack_6",
          characterId: "jack",
          expression: "",
          text: "Why not?",
        },
        {
          id: "lsrx_dc_vera_13",
          characterId: "vera",
          expression: "shrugs, already turning away",
          text: "Nothing changed but you.",
        },
      ],
      choices: [
        {
          id: "lsrx_dc_stay",
          text: "Stay until the crowd thins.",
          targetSceneId: "lsrx_diner_close",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [
        { consequences: { setFlags: ["lsrx_told_vera_robbery"] } },
      ],
    },

    /* ==================== SCENE 2c: THE KNOCK ==================== */
    {
      id: "lsrx_diner_close",
      title: "The Knock",
      hideSceneTitle: true,
      background: "/img/lsrx-diner-close.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "58% 48%",
        zoomDuration: 18,
        dimAmount: 0.2,
        lights: [
          {
            x: 62,
            y: 44,
            color: "#ffd99a",
            intensity: 0.36,
            size: 26,
            pulseSeconds: 3.6,
            pulseAmount: 0.6,
          },
          {
            x: 86,
            y: 56,
            color: "#7fb2d9",
            intensity: 0.2,
            size: 30,
            pulseSeconds: 4.4,
            pulseAmount: 0.5,
          },
        ],
      },
      prose:
        "The dinner rush thins out. Billy leaves. The kid leaves. Jack's the last one at the counter and neither of them has mentioned it.",
      dialogueBeats: [
        {
          id: "lsrx_dcl_car",
          characterId: "narrator",
          expression: "",
          text: "Outside, a car goes past the front window. Slow. Then, four minutes later, past it again — the other direction.",
        },
        {
          id: "lsrx_dcl_sees",
          characterId: "narrator",
          expression: "",
          text: "Vera sees it. Jack sees her see it. Neither says anything.",
        },
        {
          id: "lsrx_dcl_cody",
          characterId: "vera",
          expression: "counting the till, not looking up",
          text: "Cody still around? Your brother.",
        },
        {
          id: "lsrx_dcl_still",
          characterId: "narrator",
          expression: "",
          text: "Jack goes very still. He never said he had a brother.",
        },
        {
          id: "lsrx_dcl_jack_1",
          characterId: "jack",
          expression: "",
          text: "...Yeah.",
        },
        {
          id: "lsrx_dcl_vera_mm",
          characterId: "vera",
          expression: "still not looking up, still counting",
          text: "Mm.",
        },
        {
          id: "lsrx_dcl_lights",
          characterId: "narrator",
          expression: "",
          text: "She closes the register. Kills the lights over the booths, leaving just the counter lit — the two of them in a box of light in a dark room.",
        },
        {
          id: "lsrx_dcl_knock1",
          characterId: "narrator",
          expression: "",
          text: "A knock at the glass door. Two knuckles. Unhurried. Neither of them moves.",
        },
        {
          id: "lsrx_dcl_vo1",
          characterId: "jack",
          expression: "V.O.",
          text: "Week and a half out. I'd had one job, one sandwich, and one conversation.",
        },
        {
          id: "lsrx_dcl_knock2",
          characterId: "narrator",
          expression: "",
          text: "Second knock. Same two knuckles. Same patience.",
        },
        {
          id: "lsrx_dcl_vo2",
          characterId: "jack",
          expression: "V.O.",
          text: "And somebody already knew where to find me.",
        },
      ],
      choices: [
        {
          id: "lsrx_black",
          text: "BLACK.",
          targetSceneId: "lsrx_fade",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== END OF PART ONE ==================== */
    {
      id: "lsrx_fade",
      title: "Fade to Black",
      hideSceneTitle: true,
      background: "/img/lsrx-diner-close.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "58% 48%",
        zoomDuration: 16,
        dimAmount: 0.5,
        lights: [
          {
            x: 62,
            y: 44,
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
        "FADE TO BLACK.\n\nSomebody already knew where to find him.\n\n— END OF PART ONE —\n\nThe Late Shift (Redux) continues in Part Two.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "SOMEBODY ALREADY KNEW WHERE TO FIND HIM",
        recap:
          "Part One complete. Jack made it off the bus, past the house on Maple Street, through four empty days, and into a seat at the Loyal Diner counter. Vera poured. He stayed. And then somebody knocked — Part Two begins with that door.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== PART TWO PLACEHOLDER ==================== */
    {
      id: "lsrx_scene3_note",
      title: "Part Two — not written yet",
      nodeType: "note",
      note: "THE LATE SHIFT (REDUX) continues in Part Two: who is at the door on Monday night, Monday's first full shift at Weller's garage — the late tow that should be in a junkyard — and what Vera knows about Cody, and about the man who planned that robbery three years ago. Wire this note into the graph once Scene 3 is written.",
      background:
        "gradient:linear-gradient(160deg,#100d09 0%,#241a10 60%,#0b0907 100%)",
      prose: "Part Two not written yet.",
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
