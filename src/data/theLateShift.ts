import type { Story } from "../types";

/**
 * THE LATE SHIFT — a rural-noir pulp story set in Loyal, Nebraska.
 *
 * Jack Morrow comes home after three years at Tecumseh Correctional: four
 * empty days to remember how to be somebody instead of a number, then a job
 * at Weller's garage. On Monday night he finds the Loyal Diner — and Vera
 * Voss, who works the counter like a dance she knows in her sleep.
 *
 * Reimagined pulp: every plate is painted in 1940s–50s paperback-cover
 * style (gouache/oil, halftone grain, faded ink), and the game runs in the
 * sepia-pulp HUD theme with the pulp display face.
 *
 * Scenes 1–2 only so far — the last scene is a "to be continued" note node
 * (bypassed in play) with a wire waiting for Scene 3.
 */
export const THE_LATE_SHIFT: Story = {
  id: "the-late-shift",
  title: "The Late Shift",
  tagline: "He came back to a town he used to be from. Four days to remember how to be somebody.",
  coverImage: "/img/ls-cover.jpg",
  startSceneId: "ls_credits",
  briefing: {
    objective: "Get Jack Morrow through his first week home — parole check-in, the job at Weller's, and whatever waits behind the next cup of coffee.",
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
    ls_credits: { x: 0, y: 220 },
    ls_bus_station: { x: 320, y: 220 },
    ls_main_street: { x: 640, y: 220 },
    ls_motel: { x: 960, y: 220 },
    ls_motel_room: { x: 1280, y: 220 },
    ls_diner: { x: 1600, y: 220 },
    ls_diner_counter: { x: 1940, y: 220 },
    ls_diner_close: { x: 2280, y: 220 },
    ls_next: { x: 2620, y: 220 },
    ls_scene3_note: { x: 2960, y: 220 },
  },
  characters: [
    {
      id: "jack",
      name: "Jack Morrow",
      role: "Just off the bus",
      avatarUrl: "/img/ch-ls-jack.jpg",
      trustMeter: 0,
      voice: { pitch: 0.92, rate: 0.95 },
    },
    {
      id: "vera",
      name: "Vera Voss",
      role: "The Loyal Diner, late shift",
      avatarUrl: "/img/ch-ls-vera.jpg",
      trustMeter: 0,
      voice: { pitch: 1.08, rate: 1.02 },
    },
  ],
  items: [],
  flagNotes: {
    ls_walked_past_home: "Jack walked past the house he grew up in and didn't knock.",
    ls_took_the_grilled_cheese: "Jack ordered the grilled cheese, not the meatloaf.",
    ls_told_vera_robbery: "Jack told Vera why he went to Tecumseh. She didn't flinch.",
    ls_told_vera_just_passing: "Jack let Vera believe he might pass through.",
  },
  scenes: [
    /* ==================== TITLE / CREDITS ==================== */
    {
      id: "ls_credits",
      title: "The Late Shift",
      nodeType: "credits",
      credits: {
        titleEntrance: "typewriter",
        stagger: 0.55,
        duration: 1.0,
        accentColor: "#c8862f",
        lines: [
          { role: "Gaslight Reelworks Presents", name: "" },
          { role: "Starring", name: "Jack Morrow" },
          { role: "And", name: "Vera Voss" },
          { role: "A story of Loyal, Nebraska", name: "" },
        ],
      },
      background: "gradient:linear-gradient(170deg,#1b140d 0%,#2e2113 45%,#0d0b08 100%)",
      ambientAudio: "drone",
      prose: "THE LATE SHIFT\n\nA pulp story in parts\n\nLoyal, Nebraska — population shrinking\n\nTap to begin",
      choices: [{ id: "lsc_begin", text: "Get off the bus.", targetSceneId: "ls_bus_station", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 1: THE BUS STATION ==================== */
    {
      id: "ls_bus_station",
      title: "Scene 1 — The Bus Station",
      hideSceneTitle: true,
      background: "/img/bg-ls-bus-station.jpg",
      ambientAudio: "drone",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "55% 42%",
        zoomDuration: 16,
        dimAmount: 0.18,
        lights: [
          { x: 22, y: 62, color: "#ffb35c", intensity: 0.34, size: 30, pulseSeconds: 4.1, pulseAmount: 0.7 },
          { x: 70, y: 30, color: "#9fb6c8", intensity: 0.16, size: 46, pulseSeconds: 5.5, pulseAmount: 0.5 },
        ],
      },
      prose:
        "Gray light, the kind that doesn't commit to a time of day. The station is one bench and a Coke machine that hums louder than it should. JACK MORROW, 32, is the only one who gets off the bus. Canvas bag over one shoulder, stamped PROPERTY OF STATE in letters that don't fade fast enough. He doesn't move right away — just stands there, looking at the town like it's a photograph of someone he used to know.",
      dialogueBeats: [
        {
          id: "lsb_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "I grew up in Loyal. Left it the first chance I got, which turned out to be a stretch at Tecumseh Correctional. That tells you something about the chances I was working with.",
        },
        {
          id: "lsb_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Three years is long enough for a town like this to die a little more — and not long enough for you to stop recognizing the corpse.",
        },
      ],
      choices: [{ id: "lsb_walk", text: "Walk into town.", targetSceneId: "ls_main_street", attitudeTag: "Neutral" }],
      hotspots: [],
    },

    /* ==================== SCENE 1b: MAIN STREET (insert) ==================== */
    {
      id: "ls_main_street",
      title: "Main Street",
      hideSceneTitle: true,
      background: "/img/bg-ls-main-street.jpg",
      ambientAudio: "drone",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "48% 50%",
        zoomDuration: 18,
        dimAmount: 0.16,
        lights: [{ x: 30, y: 20, color: "#d9e2ea", intensity: 0.14, size: 60, pulseSeconds: 6, pulseAmount: 0.4 }],
      },
      prose:
        "Past the Rexall that's now a vape shop. Past the Odd Fellows hall, boarded. Past a mural of wheat sheaves someone painted forty years ago, when they still believed in the wheat.",
      dialogueBeats: [
        {
          id: "lsm_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Loyal never had much going for it besides a name that sounded like a promise nobody kept. You stayed because leaving cost money — or you left because staying cost your whole life. I'd done both.",
        },
        {
          id: "lsm_house",
          characterId: "narrator",
          expression: "",
          text: "He passes the house he grew up in — smaller than memory, paint gone to chalk, somebody else's truck in the drive now. He doesn't stop.",
        },
        {
          id: "lsm_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Didn't stop. Didn't need to. Some doors you don't knock on twice.",
        },
      ],
      choices: [{ id: "lsm_to_motel", text: "Keep walking to the Royal Inn.", targetSceneId: "ls_motel", attitudeTag: "Neutral" }],
      hotspots: [],
      onEnterActions: [{ consequences: { setFlags: ["ls_walked_past_home"] } }],
    },

    /* ==================== SCENE 1c: ROYAL INN SIGN (insert) ==================== */
    {
      id: "ls_motel",
      title: "The Royal Inn",
      hideSceneTitle: true,
      background: "/img/bg-ls-motel-sign.jpg",
      ambientAudio: "drone",
      particles: "rain",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 26%",
        zoomDuration: 10,
        dimAmount: 0.12,
        lights: [
          { x: 50, y: 26, color: "#ff5a4a", intensity: 0.4, size: 34, pulseSeconds: 2.2, pulseAmount: 1 },
          { x: 88, y: 72, color: "#ffb35c", intensity: 0.28, size: 22, pulseSeconds: 3.1, pulseAmount: 0.8 },
        ],
      },
      prose:
        "The ROYAL INN — or it was, once. The R burned out years ago, so the sign just reads OYAL INN in buzzing red neon above wet asphalt. Four days until Monday.",
      choices: [{ id: "lsm_check_in", text: "Take a room.", targetSceneId: "ls_motel_room", attitudeTag: "Neutral" }],
      hotspots: [],
    },

    /* ==================== SCENE 1d: THE ROOM ==================== */
    {
      id: "ls_motel_room",
      title: "Room 7",
      hideSceneTitle: true,
      background: "/img/bg-ls-motel-room.jpg",
      ambientAudio: "drone",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 14,
        dimAmount: 0.2,
        lights: [{ x: 62, y: 44, color: "#ffc978", intensity: 0.32, size: 36, pulseSeconds: 3.6, pulseAmount: 0.7 }],
      },
      prose:
        "Small. Clean in the way that means someone's still trying. Jack sits on the edge of the bed like he's waiting for permission to be there. The ceiling carries a water stain shaped like nothing.",
      dialogueBeats: [
        {
          id: "lsr_v1",
          characterId: "jack",
          expression: "V.O.",
          text: "Parole officer's in the next county. Job starts Monday at some garage that'll take a con — because cons work cheap and don't file complaints. I had four days to remember how to be somebody instead of a number.",
        },
        {
          id: "lsr_v2",
          characterId: "jack",
          expression: "V.O.",
          text: "Four days. In a town I used to be from. That's a specific kind of homesick — missing a place while you're standing in it.",
        },
      ],
      choices: [{ id: "lsr_to_diner", text: "Monday, 6 PM. Find somewhere to eat.", targetSceneId: "ls_diner", attitudeTag: "Neutral" }],
      hotspots: [],
    },

    /* ==================== SCENE 2: THE LOYAL DINER ==================== */
    {
      id: "ls_diner",
      title: "Scene 2 — The Loyal Diner",
      hideSceneTitle: true,
      background: "/img/bg-ls-diner.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      cinematic: {
        mode: "pan",
        focalPoint: "62% 46%",
        zoomDuration: 20,
        dimAmount: 0.12,
        lights: [
          { x: 66, y: 12, color: "#ffd99a", intensity: 0.4, size: 26, pulseSeconds: 3.2, pulseAmount: 0.6 },
          { x: 30, y: 16, color: "#ffb35c", intensity: 0.32, size: 24, pulseSeconds: 3.8, pulseAmount: 0.6 },
        ],
      },
      prose:
        "THE LOYAL DINER — MONDAY, 6 PM. A diner that time forgot to update and money forgot to fix. Ten stools, six booths, a pie case that's been the same pies for two days. Jack takes the counter — booths are for people with somewhere to be after. VERA VOSS, 29, works solo: red hair in a ponytail, a voice built for filling silences. She's already talking when Jack sits down.",
      dialogueBeats: [
        {
          id: "lsd_vera_1",
          characterId: "vera",
          expression: "to the coffee pot, to the world",
          text: "And I said, honey, I love you — but this meatloaf looks like it survived something it wasn't supposed to survive.",
        },
        {
          id: "lsd_vera_2",
          characterId: "vera",
          expression: "turning, doesn't miss a beat",
          text: "New. Or invisible. I run a tight ship and I know every face in a thirty-mile radius.",
        },
        {
          id: "lsd_jack_1",
          characterId: "jack",
          expression: "quiet",
          text: "New-ish. Grew up here, actually. Been gone a while.",
        },
        {
          id: "lsd_vera_3",
          characterId: "vera",
          expression: "recalibrating — not suspicious",
          text: "Grew up here and came back on purpose? Honey, that's either real love for this town or you ran out of other doors to try.",
        },
        {
          id: "lsd_jack_2",
          characterId: "jack",
          expression: "half a smile",
          text: "Bit of both.",
        },
        {
          id: "lsd_vera_4",
          characterId: "vera",
          expression: "pointing the coffee pot like she's making a point",
          text: "I respect a man who doesn't lie about his desperation. Half the guys in here'll tell you they chose Loyal like it was a decision and not just where the transmission went out.",
        },
        {
          id: "lsd_vera_5",
          characterId: "vera",
          expression: "pouring before he asks — ten thousand times, this move",
          text: "Don't get the meatloaf.",
        },
        {
          id: "lsd_billy",
          characterId: "narrator",
          expression: "",
          text: "She moves down the counter, refilling coffee, asking about somebody's kid, working it like a dance she knows in her sleep.",
        },
        {
          id: "lsd_vera_billy",
          characterId: "vera",
          expression: "to a regular, third pie this week",
          text: "Billy. Third pie this week. I'm just keeping track.",
        },
        {
          id: "lsd_billy_line",
          characterId: "narrator",
          expression: "as Billy",
          text: "BILLY: Last week was four. She actually laughs — not performing, just laughing — and refills his water.",
        },
      ],
      choices: [
        {
          id: "lsd_order_gc",
          text: "\"Grilled cheese.\"",
          targetSceneId: "ls_diner_counter",
          memoryLog: "diner_order",
          consequences: { setFlags: ["ls_took_the_grilled_cheese"] },
        },
        {
          id: "lsd_order_ml",
          text: "\"How bad can the meatloaf be?\"",
          targetSceneId: "ls_diner_counter",
          memoryLog: "diner_order",
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2 — PART 2 (beat-gated) ==================== */
    {
      id: "ls_diner_counter",
      title: "At the Counter",
      hideSceneTitle: true,
      background: "/img/bg-ls-diner.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "68% 44%",
        zoomDuration: 16,
        dimAmount: 0.14,
        lights: [{ x: 70, y: 14, color: "#ffd99a", intensity: 0.38, size: 26, pulseSeconds: 3.4, pulseAmount: 0.6 }],
      },
      prose:
        "The order goes through the pass. The counter keeps moving: a regular tracking mud, a kid yelling in a booth, a coffee pot that never stays full for long.",
      dialogueBeats: [
        // --- branch A: the smart order ---
        {
          id: "lsdc_gc_vera",
          characterId: "vera",
          expression: "nodding, calling it back without turning",
          conditionRule: { requiresFlags: ["ls_took_the_grilled_cheese"] },
          text: "GRILLED CHEESE! Smart choice.",
        },
        {
          id: "lsdc_gc_food",
          characterId: "narrator",
          expression: "",
          conditionRule: { requiresFlags: ["ls_took_the_grilled_cheese"] },
          text: "It comes through the pass and she sets it down like it's just food — which it is. It's good. Better than good. It tastes like it was made by somebody who wasn't trying to make it special.",
        },
        // --- branch B: the meatloaf dare ---
        {
          id: "lsdc_ml_vera",
          characterId: "vera",
          expression: "raising one eyebrow, already turning to yell",
          conditionRule: { excludesFlags: ["ls_took_the_grilled_cheese"] },
          text: "That's a brave man. MEATLOAF! — and when it comes back, I told you so is free with the coffee.",
        },
        {
          id: "lsdc_ml_food",
          characterId: "narrator",
          expression: "",
          conditionRule: { excludesFlags: ["ls_took_the_grilled_cheese"] },
          text: "The meatloaf arrives looking exactly like she described: something that survived. Jack eats it anyway. It isn't good. But the coffee is, and somehow that's the part he remembers.",
        },
        // --- shared rhythm of the shift ---
        {
          id: "lsdc_dale",
          characterId: "vera",
          expression: "grabbing a broom without sighing, like she knew the mud was coming",
          text: "Hi, Dale. Usual? — You're always out by seven. That's not news, Dale.",
        },
        {
          id: "lsdc_kid",
          characterId: "vera",
          expression: "waving toward the booth without turning",
          text: "He's fine. Kids yell when they're having fun.",
        },
        {
          id: "lsdc_smile",
          characterId: "jack",
          expression: "V.O.",
          text: "I hadn't smiled since I got off that bus. This woman was just working, just talking — and something in my chest that had been locked down three years came loose without her even trying.",
        },
        {
          id: "lsdc_vera_stick",
          characterId: "vera",
          expression: "circling back, coffee pot in hand",
          text: "You sticking around, or just passing through?",
        },
      ],
      choices: [
        {
          id: "lsdc_stay",
          text: "\"Got a job lined up. Starting at Weller's.\"",
          targetSceneId: "ls_diner_close",
          memoryLog: "vera_plans",
          consequences: { setFlags: ["ls_said_staying"] },
        },
        {
          id: "lsdc_pass",
          text: "\"Just passing through, probably.\"",
          targetSceneId: "ls_diner_close",
          memoryLog: "vera_plans",
          consequences: { setFlags: ["ls_told_vera_just_passing"] },
        },
      ],
      hotspots: [],
    },

    /* ==================== SCENE 2 — PART 3 ==================== */
    {
      id: "ls_diner_close",
      title: "Last Cup",
      hideSceneTitle: true,
      background: "/img/bg-ls-diner.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "66% 42%",
        zoomDuration: 12,
        dimAmount: 0.16,
        lights: [{ x: 68, y: 14, color: "#ffd99a", intensity: 0.36, size: 26, pulseSeconds: 3.6, pulseAmount: 0.6 }],
      },
      prose:
        "She doesn't flinch at either answer. The coffee keeps coming. Outside, the blue hour settles over Main Street.",
      dialogueBeats: [
        {
          id: "lsdcl_wellers",
          characterId: "vera",
          expression: "like a verdict",
          conditionRule: { requiresFlags: ["ls_said_staying"] },
          text: "Weller's. Okay. You'll be here a while, then.",
        },
        {
          id: "lsdcl_passing",
          characterId: "vera",
          expression: "refilling his cup like he didn't say it",
          conditionRule: { requiresFlags: ["ls_told_vera_just_passing"] },
          text: "Passing through. Sure. Honey, nobody orders a second cup to pass through.",
        },
        {
          id: "lsdcl_ask",
          characterId: "vera",
          expression: "leaning on the counter — no flinch in her at all",
          text: "So what puts a man away? And don't make it sound dramatic. I can tell when people are lying.",
        },
        {
          id: "lsdcl_jack_robbery",
          characterId: "jack",
          expression: "steady, quiet",
          text: "Robbery. The robbing part was me. The planning was somebody else's. I was just there.",
        },
        {
          id: "lsdcl_vera_okay",
          characterId: "vera",
          expression: "no judgment, pouring water he didn't ask for",
          text: "Okay. That's cleaner than most of what I hear.",
        },
        {
          id: "lsdcl_howlong",
          characterId: "vera",
          expression: "back to him like he's been the only person in the room",
          text: "How long you been back?",
        },
        {
          id: "lsdcl_jack_week",
          characterId: "jack",
          expression: "",
          text: "Week.",
        },
        {
          id: "lsdcl_vera_commit",
          characterId: "vera",
          expression: "grinning",
          text: "And you're already eating our food. That's commitment.",
        },
        {
          id: "lsdcl_jack_better",
          characterId: "jack",
          expression: "",
          text: "It's better than I remembered.",
        },
        {
          id: "lsdcl_vera_light",
          characterId: "vera",
          expression: "wiping the counter, not looking up — the line she gives everyone, but means it",
          text: "Everything's better when you've been away a while. The coffee tastes stronger. The light's different. People seem nicer. It's not that they changed, though. You just got tired of comparing them to bad places.",
        },
        {
          id: "lsdcl_stay",
          characterId: "narrator",
          expression: "",
          text: "She moves off toward Dale's order. Jack sits with his empty plate and understands why people stay in towns. It's not usually about the place.",
        },
        {
          id: "lsdcl_vo1",
          characterId: "jack",
          expression: "V.O.",
          text: "I came back the next night. And the one after. Told myself it was the coffee, the food, the job. It wasn't any of that.",
        },
        {
          id: "lsdcl_vo2",
          characterId: "jack",
          expression: "V.O.",
          text: "I'd spent three years learning how to disappear into a room. Vera had this way of making you feel like you were the only thing worth seeing. I hadn't planned on that. Hadn't planned on much of anything. But that was the first plan I didn't mind losing.",
        },
      ],
      choices: [
        {
          id: "lsdcl_fade",
          text: "FADE TO BLACK.",
          targetSceneId: "ls_next",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      onEnterActions: [{ consequences: { setFlags: ["ls_told_vera_robbery"] } }],
    },

    /* ==================== END OF PART ONE ==================== */
    {
      id: "ls_next",
      title: "Fade to Black",
      hideSceneTitle: true,
      background: "/img/ls-cover.jpg",
      ambientAudio: "jazz",
      letterbox: true,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 14,
        dimAmount: 0.42,
        lights: [{ x: 78, y: 44, color: "#ffc978", intensity: 0.3, size: 30, pulseSeconds: 4, pulseAmount: 0.5 }],
      },
      transition: "fade-black",
      transitionSpeed: 2.2,
      prose:
        "FADE TO BLACK.\n\nOutside the Loyal Diner, the neon in the window does the only promising thing in town: it stays on. Somebody has to work the late shift. Somebody always does.\n\n— END OF PART ONE —",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE FIRST PLAN HE DIDN'T MIND LOSING",
        recap: "Jack made it off the bus, through four empty days, and into a seat at the counter. Vera poured. He stayed.",
      },
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== SCENE 3 PLACEHOLDER (standalone note — bypassed in play) ==================== */
    {
      id: "ls_scene3_note",
      title: "Scene 3 — not written yet",
      nodeType: "note",
      note: "THE LATE SHIFT continues: Monday's first shift at Weller's garage — what comes in on the late tow, and who in Loyal really planned that robbery three years ago? Wire this note into the graph once Scene 3 is written.",
      background: "gradient:linear-gradient(160deg,#100d09 0%,#241a10 60%,#0b0907 100%)",
      prose: "Scene 3 not written yet.",
      choices: [],
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
