import type { Story } from "../types";

/**
 * THE LATE SHIFT (REIMAGINED) — a rural-noir pulp story set in 1990s Loyal, Nebraska.
 *
 * A reimagined pulp magazine serial: Jack Morrow (32, just out of Tecumseh
 * Correctional) comes home to a town that died a little more while he was gone.
 * Four empty days, then a job at Weller's garage. Monday night he finds the
 * Loyal Diner — and Vera Voss, who works the counter like a dance she knows
 * in her sleep.
 *
 * 90s reimagining: the art is painted in gouache/oil pulp-cover style with
 * halftone grain and faded ink, but the world is 1990s rural America — vape
 * shops where Rexalls used to be, Coke machines, canvas bags stamped PROPERTY
 * OF STATE. The voice is hardboiled; the heart is tender.
 *
 * Scenes 1–2 only. No ending yet — the story ends on a fade to black with
 * a "to be continued" note node wired for Scene 3.
 */
export const THE_LATE_SHIFT_REIMAGINED: Story = {
  id: "the-late-shift-reimagined",
  title: "The Late Shift (Reimagined)",
  tagline:
    "He came back to a town he used to be from. Four days to remember how to be somebody.",
  coverImage: "/img/lsr-cover.jpg",
  startSceneId: "lsr_credits",
  briefing: {
    objective:
      "Get Jack Morrow through his first week home — parole check-in, the job at Weller's, and whatever waits behind the next cup of coffee.",
    winConditions: [
      "Get off the bus and face Loyal for the first time in three years.",
      "Last the four days before Monday and show up for the job.",
      "Keep your seat at the Loyal Diner counter.",
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
    lsr_credits: { x: 0, y: 220 },
    lsr_bus_station: { x: 320, y: 220 },
    lsr_main_street: { x: 640, y: 220 },
    lsr_motel: { x: 960, y: 220 },
    lsr_motel_room: { x: 1280, y: 220 },
    lsr_diner: { x: 1600, y: 220 },
    lsr_diner_counter: { x: 1940, y: 220 },
    lsr_diner_close: { x: 2280, y: 220 },
    lsr_fade: { x: 2620, y: 220 },
    lsr_scene3_note: { x: 2960, y: 220 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Just off the bus",
      avatarUrl: "/img/ch-lsr-jack.jpg",
      trustMeter: 0,
      voice: { pitch: 0.92, rate: 0.95 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The Loyal Diner, late shift",
      avatarUrl: "/img/ch-lsr-vera.jpg",
      trustMeter: 0,
      voice: { pitch: 1.08, rate: 1.02 },
    },
  ],
  items: [],
  flagNotes: {
    lsr_walked_past_home:
      "Jack walked past the house he grew up in and didn't knock.",
    lsr_took_the_grilled_cheese:
      "Jack ordered the grilled cheese, not the meatloaf.",
    lsr_told_vera_robbery:
      "Jack told Vera why he went to Tecumseh. She didn't flinch.",
    lsr_told_vera_just_passing:
      "Jack let Vera believe he might pass through.",
    lsr_said_staying:
      "Jack told Vera he's sticking around for the job at Weller's.",
  },
  scenes: [
    /* ==================== TITLE / CREDITS ==================== */
    {
      id: "lsr_credits",
      title: "The Late Shift (Reimagined)",
      nodeType: "credits",
      credits: {
        title: "THE LATE SHIFT",
        subtitle: "A Reimagined Pulp Story",
        font: "pulp",
        titleEntrance: "slam",
        cardMotion: "slam",
        style: "cards",
        cardSeconds: 3.8,
        stagger: 0.55,
        duration: 1.0,
        accentColor: "#c8862f",
        titleColor: "#e8c878",
        gateWeave: "worn",
        montage: [
          "/img/lsr-bus-station.jpg",
          "/img/lsr-main-street.jpg",
          "/img/lsr-motel-sign.jpg",
          "/img/lsr-diner.jpg",
        ],
        montageSeconds: 4.5,
        montageTransition: "dissolve",
        montageLoop: true,
        lines: [
          { role: "A Gaslight Reelworks Production", name: "" },
          { role: "Written by", name: "Scarlet Reel" },
          { role: "Starring", name: "Jack Morrow" },
          { role: "And Introducing", name: "Vera Voss" },
          { role: "Set in", name: "Loyal, Nebraska" },
          { role: "A story of coming home", name: "" },
        ],
      },
      background:
        "gradient:linear-gradient(170deg,#1b140d 0%,#2e2113 45%,#0d0b08 100%)",
      musicUrl: "/Midnight in the Rain2.mp3",
      musicMode: "track",
      musicLevel: 0.6,
      ambientAudio: "drone",
      prose:
        "THE LATE SHIFT\n\nA reimagined pulp story in parts\n\nLoyal, Nebraska — population shrinking\n\nTap to begin",
      choices: [
        {
          id: "lsr_begin",
          text: "Get off the bus.",
          targetSceneId: "lsr_bus_station",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 1: THE BUS STATION ==================== */
    {
      id: "lsr_bus_station",
      title: "Scene 1 — The Bus Station",
      hideSceneTitle: true,
      background: "/img/lsr-bus-station.jpg",
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
        "LOYAL, NEBRASKA — BUS STATION — MORNING. Gray light, the kind that doesn't commit to a time of day. The station is one bench and a Coke machine that hums louder than it should. JACK MORROW, 32, is the only one who gets off the bus. Canvas bag over one shoulder, stamped PROPERTY OF STATE in letters that don't fade fast enough.",
      dialogueBeats: [
        {
          id: "lsr_bus_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "I grew up in Loyal. Left it the first chance I got, which turned out to be a stretch at Tecumseh Correctional, which tells you something about the chances I was working with.",
        },
        {
          id: "lsr_bus_stage",
          characterId: "narrator",
          expression: "",
          text: "He doesn't move right away. Just stands there, looking at the town like it's a photograph of someone he used to know — familiar, but he can't place why it hurts.",
        },
        {
          id: "lsr_bus_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Three years is long enough for a town like this to die a little more and not long enough for you to stop recognizing the corpse.",
        },
      ],
      choices: [
        {
          id: "lsr_walk",
          text: "Walk into town.",
          targetSceneId: "lsr_main_street",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1b: MAIN STREET ==================== */
    {
      id: "lsr_main_street",
      title: "Main Street",
      hideSceneTitle: true,
      background: "/img/lsr-main-street.jpg",
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
        "He walks. Past the Rexall that's now a vape shop. Past the Odd Fellows hall, boarded. Past a mural of wheat sheaves someone painted forty years ago when they still believed in the wheat.",
      dialogueBeats: [
        {
          id: "lsr_ms_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Loyal never had much going for it besides a name that sounded like a promise nobody kept. You stayed because leaving cost money, or you left because staying cost your whole life. I'd done both.",
        },
        {
          id: "lsr_ms_house",
          characterId: "narrator",
          expression: "",
          text: "He passes the house he grew up in — smaller than memory, paint gone to chalk, somebody else's truck in the drive now.",
        },
        {
          id: "lsr_ms_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Didn't stop. Didn't need to. Some doors you don't knock on twice.",
        },
      ],
      choices: [
        {
          id: "lsr_to_motel",
          text: "Keep walking to the Royal Inn.",
          targetSceneId: "lsr_motel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [
        { consequences: { setFlags: ["lsr_walked_past_home"] } },
      ],
    },

    /* ==================== SCENE 1c: ROYAL INN SIGN ==================== */
    {
      id: "lsr_motel",
      title: "The Royal Inn",
      hideSceneTitle: true,
      background: "/img/lsr-motel-sign.jpg",
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
        "He checks into the ROYAL INN — the R burned out years ago so it just reads OYAL INN. Buzzing red neon above wet asphalt.",
      choices: [
        {
          id: "lsr_check_in",
          text: "Take a room.",
          targetSceneId: "lsr_motel_room",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 1d: THE ROOM ==================== */
    {
      id: "lsr_motel_room",
      title: "Room 7",
      hideSceneTitle: true,
      background: "/img/lsr-motel-room.jpg",
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
        "INT. ROYAL INN — ROOM — CONTINUOUS. Small. Clean in the way that means someone's still trying. Jack sits on the edge of the bed like he's waiting for permission to be there.",
      dialogueBeats: [
        {
          id: "lsr_room_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Parole officer's in the next county. Job starts Monday at some garage that'll take a con because cons work cheap and don't file complaints. I had four days to remember how to be somebody instead of a number.",
        },
        {
          id: "lsr_room_ceiling",
          characterId: "narrator",
          expression: "",
          text: "He looks at the ceiling. A water stain shaped like nothing.",
        },
        {
          id: "lsr_room_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Four days. In a town I used to be from. That's a specific kind of homesick — missing a place while you're standing in it.",
        },
      ],
      choices: [
        {
          id: "lsr_to_diner",
          text: "Monday, 6 PM. Find somewhere to eat.",
          targetSceneId: "lsr_diner",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2: THE LOYAL DINER ==================== */
    {
      id: "lsr_diner",
      title: "Scene 2 — The Loyal Diner",
      hideSceneTitle: true,
      background: "/img/lsr-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
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
        "THE LOYAL DINER — MONDAY, 6 PM. A diner that time forgot to update and money forgot to fix. Ten stools, six booths, a pie case that's been the same pies for two days. Jack takes the counter — booths are for people with somewhere to be after. VERA VOSS, 29, works solo. Red hair escaping a ponytail, bright and quick, already moving before you finish asking for something. She's talking before Jack even sits down, doesn't break stride to notice him.",
      dialogueBeats: [
        {
          id: "lsr_d_vera_1",
          characterId: "vera",
          expression: "to the coffee pot, to the universe",
          text: "And I said, \"Honey, I love you with all my heart, but this meatloaf has got a survival story and it ain't the kind I wanna hear about my dinner.\"",
        },
        {
          id: "lsr_d_vera_2",
          characterId: "vera",
          expression: "spinning around, clocks Jack, lights up",
          text: "Well hello there, sugar. You're either new or I'm having some kind of episode where I can't recognize faces, which has happened before, so could go either way.",
        },
        {
          id: "lsr_d_jack_1",
          characterId: "jack",
          expression: "quiet",
          text: "New-ish. Grew up here actually. Been gone a while.",
        },
        {
          id: "lsr_d_vera_3",
          characterId: "vera",
          expression: "recalibrating, delighted",
          text: "Oh my God, you came back? On purpose? Honey, that takes either a whole lot of love for this town or you ran completely out of places to hide.",
        },
        {
          id: "lsr_d_jack_2",
          characterId: "jack",
          expression: "half a smile",
          text: "Bit of both.",
        },
        {
          id: "lsr_d_vera_4",
          characterId: "vera",
          expression: "leaning on the counter like she's got all the time in the world",
          text: "I like you already. Most men come through here, they'll lie about why they stayed or why they left, like Loyal's some big mystery. You just went ahead and said it.",
        },
        {
          id: "lsr_d_vera_5",
          characterId: "vera",
          expression: "pouring coffee without asking, moving like she's got springs in her legs",
          text: "Don't get the meatloaf, sweetheart. I'm not saying there's anything wrong with it, I'm just saying it's got a past and I'm real protective of your stomach.",
        },
        {
          id: "lsr_d_jack_order",
          characterId: "jack",
          expression: "",
          text: "Grilled cheese.",
        },
        {
          id: "lsr_d_vera_6",
          characterId: "vera",
          expression: "pointing with approval",
          text: "Now that's a man who makes decisions fast. I respect that. You want pickles? Tomato? I can make it fancy or I can make it honest, your choice.",
        },
        {
          id: "lsr_d_jack_plain",
          characterId: "jack",
          expression: "",
          text: "Just plain.",
        },
        {
          id: "lsr_d_vera_7",
          characterId: "vera",
          expression: "grinning",
          text: "Plain's honest. I like it.",
        },
        {
          id: "lsr_d_vera_call",
          characterId: "vera",
          expression: "hollering back without turning, one fluid motion",
          text: "GRILLED CHEESE, PLAIN, AND MAKE IT LOVE IT!",
        },
      ],
      choices: [
        {
          id: "lsr_d_wait",
          text: "Wait for the food. Watch her work.",
          targetSceneId: "lsr_diner_counter",
          attitudeTag: "Neutral",
          consequences: { setFlags: ["lsr_took_the_grilled_cheese"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2b: DINER COUNTER — VERA IN MOTION ==================== */
    {
      id: "lsr_diner_counter",
      title: "At the Counter",
      hideSceneTitle: true,
      background: "/img/lsr-diner.jpg",
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
        "She's already moved on to refilling Billy's coffee, talking a mile a minute. The diner hums around her — a regular tracking mud, a kid yelling in a booth, a coffee pot that never stays full for long.",
      dialogueBeats: [
        {
          id: "lsr_dc_billy",
          characterId: "vera",
          expression: "to Billy, third pie this week",
          text: "Billy, sweetheart, this is your third pie this week and I'm gonna have to start charging you rent on that booth, but I'm not even mad about it. That's commitment and I respect commitment.",
        },
        {
          id: "lsr_dc_billy_line",
          characterId: "narrator",
          expression: "",
          text: "BILLY: Last week was four. She actually laughs — real, genuine, the kind that makes other people in the diner look up.",
        },
        {
          id: "lsr_dc_food",
          characterId: "narrator",
          expression: "",
          text: "The grilled cheese comes through. Vera sets it down in front of Jack, doesn't make a thing of it.",
        },
        {
          id: "lsr_dc_vera_food",
          characterId: "vera",
          expression: "setting it down, already moving",
          text: "There you go, baby. Honest work.",
        },
        {
          id: "lsr_dc_observe",
          characterId: "narrator",
          expression: "",
          text: "She doesn't stick around to watch him eat. She's already moving, wiping the counter with quick efficient circles, restocking napkins, checking on people, her red hair coming loose from the ponytail.",
        },
        {
          id: "lsr_dc_smile",
          characterId: "jack",
          expression: "V.O.",
          text: "I hadn't smiled once since I got off that bus. This woman was working six jobs at once and somehow made it look like she was having the time of her life, and something locked down inside me for three years just came loose.",
        },
        {
          id: "lsr_dc_vera_stick",
          characterId: "vera",
          expression: "circling back, coffee pot in hand, leaning on the counter",
          text: "So are you sticking around town or just passing through like some sad country song?",
        },
      ],
      choices: [
        {
          id: "lsr_dc_stay",
          text: "\"Sticking around. Got a job lined up at Weller's garage.\"",
          targetSceneId: "lsr_diner_close",
          memoryLog: "vera_plans",
          consequences: { setFlags: ["lsr_said_staying"] },
        },
        {
          id: "lsr_dc_pass",
          text: "\"Just passing through, probably.\"",
          targetSceneId: "lsr_diner_close",
          memoryLog: "vera_plans",
          consequences: { setFlags: ["lsr_told_vera_just_passing"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2c: DINER CLOSE — THE REAL CONVERSATION ==================== */
    {
      id: "lsr_diner_close",
      title: "Last Cup",
      hideSceneTitle: true,
      background: "/img/lsr-diner.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "66% 42%",
        zoomDuration: 12,
        dimAmount: 0.16,
        lights: [
          {
            x: 68,
            y: 14,
            color: "#ffd99a",
            intensity: 0.36,
            size: 26,
            pulseSeconds: 3.6,
            pulseAmount: 0.6,
          },
        ],
      },
      prose:
        "The blue hour settles over Main Street. The diner keeps humming. Vera keeps pouring.",
      dialogueBeats: [
        {
          id: "lsr_dcl_wellers",
          characterId: "vera",
          expression: "eyes lighting up",
          conditionRule: { requiresFlags: ["lsr_said_staying"] },
          text: "Weller's! Okay, okay, so you're gonna be around. That makes me happy for reasons I probably shouldn't admit to a stranger.",
        },
        {
          id: "lsr_dcl_passing",
          characterId: "vera",
          expression: "refilling his cup like he didn't say it",
          conditionRule: { requiresFlags: ["lsr_told_vera_just_passing"] },
          text: "Passing through. Sure. Honey, nobody orders a second cup to pass through.",
        },
        {
          id: "lsr_dcl_kid",
          characterId: "vera",
          expression: "waving toward a booth without even looking",
          text: "He's fine, honey, let him yell. Kids yell when they're having fun and lord knows we need more yelling in this town that ain't angry yelling.",
        },
        {
          id: "lsr_dcl_ask",
          characterId: "vera",
          expression: "leaning on her elbows, genuine",
          text: "So, real question and I need you to be honest with me. What kind of trouble puts a man away? And don't make it sound all dramatic and literary, 'cause I can smell BS from a mile away and you don't seem like a BS guy.",
        },
        {
          id: "lsr_dcl_jack_robbery",
          characterId: "jack",
          expression: "steady, quiet",
          text: "Robbery. The actual robbing was me. The planning was my brother. I was just there when it went bad.",
        },
        {
          id: "lsr_dcl_vera_okay",
          characterId: "vera",
          expression: "no flinch, just matter-of-fact",
          text: "Okay. Okay, that's honest. I respect that more than you know.",
        },
        {
          id: "lsr_dcl_wink",
          characterId: "vera",
          expression: "refilling his water, winking like they're in on a secret",
          text: "How long you been back?",
        },
        {
          id: "lsr_dcl_jack_week",
          characterId: "jack",
          expression: "",
          text: "Week.",
        },
        {
          id: "lsr_dcl_vera_commit",
          characterId: "vera",
          expression: "grinning",
          text: "And you're already eating our food and talking to me. That's commitment, sugar. Most people take longer to settle in.",
        },
        {
          id: "lsr_dcl_jack_better",
          characterId: "jack",
          expression: "",
          text: "It's better than I remembered.",
        },
        {
          id: "lsr_dcl_vera_light",
          characterId: "vera",
          expression: "leaning on her elbows, genuine",
          text: "Everything's better when you've been gone a while. The coffee tastes different. The light looks better. People seem nicer. But here's the thing — they didn't change. You just spent so long in bad places that now you can actually see the good when you're standing in it.",
        },
        {
          id: "lsr_dcl_cody",
          characterId: "vera",
          expression: "moving off to other customers, talking over her shoulder",
          text: "I got a brother, Cody, he's sixteen and he's gonna be around here somewhere later, probably looking for money, so if you see a dumb-looking kid with my hair trying to convince you he's gonna pay you back, the answer is always no.",
        },
        {
          id: "lsr_dcl_stay",
          characterId: "narrator",
          expression: "",
          text: "Jack sits with his empty plate and understands why people come back to places. Why they stay.",
        },
        {
          id: "lsr_dcl_vo1",
          characterId: "jack",
          expression: "V.O.",
          text: "I came back the next night. And the one after that. Told myself it was the food, the job, the coffee. It was none of those things.",
        },
        {
          id: "lsr_dcl_vo2",
          characterId: "jack",
          expression: "V.O.",
          text: "I'd spent three years learning how to disappear into a room. Vera had this way of making you feel like you were the only interesting thing she'd seen all day. I hadn't planned on that. Hadn't planned on much of anything. But that was the first plan I didn't mind losing.",
        },
      ],
      choices: [
        {
          id: "lsr_fade_out",
          text: "FADE TO BLACK.",
          targetSceneId: "lsr_fade",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [
        { consequences: { setFlags: ["lsr_told_vera_robbery"] } },
      ],
    },

    /* ==================== END OF PART ONE ==================== */
    {
      id: "lsr_fade",
      title: "Fade to Black",
      hideSceneTitle: true,
      background: "/img/lsr-cover.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 14,
        dimAmount: 0.42,
        lights: [
          {
            x: 78,
            y: 44,
            color: "#ffc978",
            intensity: 0.3,
            size: 30,
            pulseSeconds: 4,
            pulseAmount: 0.5,
          },
        ],
      },
      transition: "fade-black",
      transitionSpeed: 2.2,
      prose:
        "FADE TO BLACK.\n\nOutside the Loyal Diner, the neon in the window does the only promising thing in town: it stays on. Somebody has to work the late shift. Somebody always does.\n\n— END OF PART ONE —",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE FIRST PLAN HE DIDN'T MIND LOSING",
        recap:
          "Jack made it off the bus, through four empty days, and into a seat at the counter. Vera poured. He stayed.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 3 PLACEHOLDER ==================== */
    {
      id: "lsr_scene3_note",
      title: "Scene 3 — not written yet",
      nodeType: "note",
      note: "THE LATE SHIFT (REIMAGINED) continues: Monday's first shift at Weller's garage — what comes in on the late tow, and who in Loyal really planned that robbery three years ago? Wire this note into the graph once Scene 3 is written.",
      background:
        "gradient:linear-gradient(160deg,#100d09 0%,#241a10 60%,#0b0907 100%)",
      prose: "Scene 3 not written yet.",
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
