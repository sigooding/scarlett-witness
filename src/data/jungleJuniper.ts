import type { Story } from "../types";

/**
 * THE JUNGLE CAME TO JUNIPER
 * A pulp prehistoric adventure, told in the breathless 1950s sci-fi register.
 * An alien seed falls on the small town of Juniper and overnight rewrites it
 * into a Cretaceous jungle — a "reset" meant to scrub the human race and put
 * Earth back in natural order. One family fights back.
 *
 * Deliberately built as a Studio smoke-test with a SINGLE ending (one exit,
 * one tier): an animated typewriter credits node, slow-pan / wide-dolly /
 * handheld-shake cameras, a vertigo dolly-zoom with a foreground seed pod and
 * blur, rain + storm particles, neon-green light glows, hotspot item gating and
 * reply dialogue.
 */
export const JUNGLE_JUNIPER: Story = {
  id: "jungle-juniper",
  title: "The Jungle Came to Juniper",
  tagline: "It fell from a green sky. By Friday, Main Street was a Cretaceous jungle — and the dinosaurs were winning.",
  coverImage: "/img/cover-jungle-juniper.jpg",
  startSceneId: "jj_credits",
  layout: {
    jj_credits: { x: 0, y: 220 },
    jj_suburb: { x: 320, y: 220 },
    jj_park: { x: 640, y: 220 },
    jj_downtown: { x: 960, y: 220 },
    jj_lab: { x: 1280, y: 220 },
    jj_crater: { x: 1600, y: 220 },
    jj_end: { x: 1920, y: 220 },
  },
  characters: [
    { id: "hank", name: "Hank Riley", role: "Dad / Mechanic", avatarUrl: "emoji:👨‍🔧", trustMeter: 0 },
    { id: "june", name: "June Riley", role: "Mom / Botanist", avatarUrl: "emoji:👩‍🔬", trustMeter: 0 },
    { id: "ellie", name: "Ellie Riley", role: "The Kid", avatarUrl: "emoji:👧", trustMeter: 0 },
    { id: "signal", name: "The Signal", role: "The Thing in the Seed", avatarUrl: "emoji:🛸", trustMeter: 0 },
  ],
  items: [
    {
      id: "seed_shard",
      name: "Seed-pod Shard",
      icon: "🌱",
      description: "A warm, faintly humming sliver of the seed pod. It feels less like rock and more like it is waiting for something.",
      flavorText: "It's growing. Even in your pocket, it is growing.",
      isClue: true,
    },
    {
      id: "wrench",
      name: "Pipe Wrench",
      icon: "🔧",
      description: "Hank's biggest pipe wrench. Good for carburetors, burst pipes, and — with enough elbow grease — the shell of an alien seed pod.",
      flavorText: "If it won't turn, hit it harder.",
    },
    {
      id: "radio",
      name: "Ham Radio",
      icon: "📻",
      description: "A battered ham radio from the hardware store. June swears she can tune it to the seed's own frequency.",
      flavorText: "The static sounds like the sea. If the sea were angry.",
    },
  ],
  briefing: {
    objective: "The seed in the crater is rewriting Juniper into a prehistoric jungle. Grab the wrench and the radio, then break the pod before the town is gone for good.",
    winConditions: [
      "Find Hank's pipe wrench and the ham radio.",
      "Reach the crater at the heart of the green.",
      "Jam the pod's signal and save Juniper.",
    ],
    loseConditions: ["Let the jungle finish what the seed started."],
  },
  scenes: [
    /* ==================== 1. CREDITS ==================== */
    {
      id: "jj_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      credits: { titleEntrance: "typewriter", stagger: 0.5, duration: 0.9, accentColor: "#2aff88", lines: [{ role: "Starring", name: "The Riley Family" }, { role: "The Seed", name: "From a Green Sky" }, { role: "Directed by", name: "Natural Order" }] },
      background: "gradient:linear-gradient(160deg,#04140a 0%,#0a1f14 55%,#050505 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "THE JUNGLE CAME TO JUNIPER\n\nA Pulp Prehistoric Adventure\n\nStarring the Riley Family\n\nTap Begin",
      choices: [
        { id: "jjc_begin", text: "Begin the Case", targetSceneId: "jj_suburb", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE SUBURB ==================== */
    {
      id: "jj_suburb",
      title: "The Morning It Fell",
      background: "/img/bg-jj-suburb.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "pan",
        panDistance: 6,
        panDirection: "right",
        dimAmount: 0.12,
        lights: [
          { x: 70, y: 22, color: "#2aff88", intensity: 0.26, size: 36, pulseSeconds: 3.2, pulseAmount: 0.9 },
          { x: 28, y: 18, color: "#e8b23c", intensity: 0.2, size: 30, pulseSeconds: 2.8, pulseAmount: 0.7 },
        ],
      },
      prose:
        "IT FELL FROM A GREEN SKY. Three in the morning, a light the color of a poisoned emerald came down over Juniper like a match struck against the dark — no sound, no boom, just a long green scar across the stars. By sunrise, every bird in town was gone, and the Rileys' front lawn was coming up ferns.",
      dialogueBeats: [
        { id: "jjs_h1", characterId: "hank", expression: "coffee in hand", text: "June. Honey. Why is the petunia bed trying to eat the mailbox?" },
        { id: "jjs_j1", characterId: "june", expression: "calm, worried", text: "That isn't a petunia, Hank. That's a Devonian tree fern. It's been extinct for three hundred and fifty million years." },
        { id: "jjs_n1", characterId: "narrator", expression: "V.O.", text: "Out past the rooftops, where the town park used to be, something green was glowing. Something green was GROWING. And the Rileys were going to find out exactly what." },
        { id: "jjs_e1", characterId: "ellie", expression: "wide-eyed", conditionRule: { requiresFlags: ["asked_sky"] }, text: "It looked like a big green tear in the sky, Dad. Like the sky was crying. Only it was laughing." },
      ],
      hotspots: [
        {
          id: "jjs_hs_window",
          label: "The front window",
          bounds: { x: 70, y: 10, w: 20, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Across the street, the Johnsons' lawn is already a waist-high carpet of prehistoric green. Their flamingo is up to its neck." },
        },
      ],
      choices: [
        { id: "jjs_c1", reply: true, targetSceneId: "", text: "\u201CWhat did it look like, Ellie?\u201D", attitudeTag: "Neutral", consequences: { setFlags: ["asked_sky"] } },
        { id: "jjs_c2", text: "Head to the park where it fell.", targetSceneId: "jj_park", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 3. THE PARK ==================== */
    {
      id: "jj_park",
      title: "The Crater in the Park",
      background: "/img/bg-jj-park.jpg",
      ambientAudio: "tension",
      particles: "rain",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 9,
        dimAmount: 0.16,
        lights: [
          { x: 50, y: 55, color: "#2aff88", intensity: 0.34, size: 46, pulseSeconds: 2.6, pulseAmount: 1 },
        ],
      },
      prose:
        "The crater was still smoking when they reached it — a wound in the town green, ringed by ferns that hadn't existed on this Earth since before the dinosaurs. And in the middle, half-buried in the black earth, the seed pod. It pulsed. Like a heart made of emeralds.",
      dialogueBeats: [
        { id: "jjp_j1", characterId: "june", expression: "kneeling", text: "It's not a meteor, Hank. It's a seed. And it's been dropped here on purpose." },
        { id: "jjp_n1", characterId: "narrator", expression: "V.O.", text: "A seed. Dropped from a green sky to a small town park. The kind of sentence that should sound crazy — except for the jungle chewing its way up the jungle gyms." },
        { id: "jjp_j2", characterId: "june", expression: "urgent", conditionRule: { requiresFlags: ["asked_what"] }, text: "Think of Earth as a garden that got overgrown. The weeds are US, Hank. This thing is here to pull us out and plant everything back the way it was — natural order. No people." },
      ],
      hotspots: [
        {
          id: "jjp_hs_shard",
          label: "A glowing shard of the pod",
          bounds: { x: 50, y: 44, w: 12, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "seed_shard" },
        },
      ],
      choices: [
        { id: "jjp_c1", reply: true, targetSceneId: "", text: "\u201CWhat is it, June?\u201D", attitudeTag: "Clever", consequences: { setFlags: ["asked_what"] } },
        { id: "jjp_c2", text: "Check Main Street.", targetSceneId: "jj_downtown", attitudeTag: "Neutral" },
        { id: "jjp_c3", text: "Back home.", targetSceneId: "jj_suburb", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 4. DOWNTOWN (wide dolly) ==================== */
    {
      id: "jj_downtown",
      title: "Main Street, One Week Later",
      background: "/img/bg-jj-downtown.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "dolly",
        dollyDirection: "right",
        dollyDistance: 14,
        dollyDuration: 16,
        dollyVertical: 2,
        dimAmount: 0.14,
        lights: [
          { x: 20, y: 30, color: "#2aff88", intensity: 0.24, size: 32, pulseSeconds: 2.8, pulseAmount: 0.8 },
          { x: 80, y: 26, color: "#e8b23c", intensity: 0.2, size: 30, pulseSeconds: 3.0, pulseAmount: 0.7 },
        ],
      },
      prose:
        "One week, and Main Street was a lost world. Vines had swallowed the cinema marquee, the diner, the barber pole — all of it under a canopy of leaves the size of car hoods. And somewhere between the drugstore and the five-and-dime, something enormous was breathing.",
      dialogueBeats: [
        { id: "jjd_h1", characterId: "hank", expression: "grim", text: "We need my wrench. And a radio. If June's right about that pod, we're gonna want both." },
        { id: "jjd_n1", characterId: "narrator", expression: "V.O.", text: "The garage was up ahead, its door hanging open like a jaw. The hardware store was two doors down. And between them — behind them — the jungle kept moving." },
        /* the dinosaur scare — handheld shake on a replacement background */
        {
          id: "jjd_d1",
          characterId: "narrator",
          expression: "V.O.",
          background: "/img/bg-jj-downtown.jpg",
          cinematic: { mode: "shake", shakeAmount: 0.6, shakeRotation: 1.1, shakeDuration: 0.28, dimAmount: 0.3, lights: [{ x: 50, y: 24, color: "#2aff88", intensity: 0.3, size: 40, pulseSeconds: 2.0, pulseAmount: 1 }] },
          backgroundTransition: "cut",
          text: "THEN THE TREES MOVED. A head the size of a station wagon rose over the diner roof, and the jungle let out a sound that had been extinct for sixty-five million years.",
        },
        { id: "jjd_h2", characterId: "hank", expression: "terrified", text: "Nobody panic. Ellie, get behind your mother. And for the love of all that is holy, do not let it see the flamingo." },
      ],
      hotspots: [
        {
          id: "jjd_hs_wrench",
          label: "Hank's wrench in the garage",
          bounds: { x: 10, y: 42, w: 14, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "wrench" },
        },
        {
          id: "jjd_hs_radio",
          label: "Ham radio in the store",
          bounds: { x: 76, y: 40, w: 14, h: 12 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "radio" },
        },
      ],
      choices: [
        { id: "jjd_c1", text: "Head to Mom's greenhouse.", targetSceneId: "jj_lab", attitudeTag: "Neutral" },
        { id: "jjd_c2", text: "Back to the park.", targetSceneId: "jj_park", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 5. THE GREENHOUSE ==================== */
    {
      id: "jj_lab",
      title: "June's Greenhouse",
      background: "/img/bg-jj-lab.jpg",
      ambientAudio: "drone",
      particles: "smoke",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 8,
        dimAmount: 0.16,
        lights: [
          { x: 50, y: 30, color: "#2aff88", intensity: 0.3, size: 42, pulseSeconds: 2.6, pulseAmount: 0.9 },
        ],
      },
      prose:
        "June's greenhouse was the only green in Juniper that still made sense. Rows of jars, a microscope, a chalkboard of fern sketches — and on the bench, next to the ham radio, the shard. It had sprouted. In a jar. Overnight.",
      dialogueBeats: [
        { id: "jjl_j1", characterId: "june", expression: "intense", text: "The shard is singing, Hank. A frequency, repeating — a countdown, or a command. I need the radio to talk back to it." },
        { id: "jjl_n1", characterId: "narrator", expression: "V.O.", text: "She translated it into plain English, the way she translated everything: The seed was a reset switch. When it finished blooming, every human thing on Earth would be compost. The planet would go back to its natural order — a garden with no gardeners." },
        { id: "jjl_e1", characterId: "ellie", expression: "fierce", text: "So we unplug it. We're the Rileys. We don't do compost." },
        { id: "jjl_j2", characterId: "june", expression: "determined", text: "Then we break the pod. Wrench the shell open, jam its frequency with the radio, and hope whatever's listening doesn't hang up first." },
      ],
      hotspots: [],
      choices: [
        { id: "jjl_c1", text: "March on the crater.", targetSceneId: "jj_crater", attitudeTag: "Aggressive" },
        { id: "jjl_c2", text: "Back to Main Street.", targetSceneId: "jj_downtown", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 6. THE CRATER (vertigo) ==================== */
    {
      id: "jj_crater",
      title: "The Heart of the Green",
      background: "/img/bg-jj-crater.jpg",
      ambientAudio: "tension",
      particles: "storm",
      cinematic: {
        mode: "dolly-zoom",
        dollyZoomAmount: 1.3,
        dollyZoomDuration: 9,
        dollyZoomDirection: "both",
        dollyZoomBlur: 4,
        foregroundImage: "/img/fg-jj-seed.png",
        foregroundScale: 0.85,
        foregroundFit: "contain",
        dimAmount: 0.18,
        lights: [
          { x: 50, y: 40, color: "#2aff88", intensity: 0.34, size: 46, pulseSeconds: 2.2, pulseAmount: 1 },
        ],
      },
      prose:
        "The crater had become the heart of the green — a bowl of jungle with the seed pod at its center, glowing like a small green sun. The air tasted of ozone and wet leaves. The pod pulsed. And for the first time, it spoke.",
      dialogueBeats: [
        { id: "jjc_s1", characterId: "signal", expression: "telepathic", text: "NATURAL ORDER. THE WEEDS WILL BE PULLED. THIS GARDEN WILL BE RESTORED. DO NOT BE AFRAID. FEAR IS ALSO A WEED." },
        { id: "jjc_h1", characterId: "hank", expression: "raising the wrench", text: "Buddy, you picked the wrong garden. June — the frequency. Ellie — stand back. This is going to be loud." },
        { id: "jjc_n1", characterId: "narrator", expression: "V.O.", text: "The pod's shell was thick as the hull of a bank vault. But it had never met a Riley with a pipe wrench and something to save." },
      ],
      hotspots: [],
      choices: [
        {
          id: "jjc_c_end",
          text: "Wrench the pod open and jam the radio's frequency.",
          targetSceneId: "jj_end",
          attitudeTag: "Clever",
          gating: { requiresItems: ["wrench", "radio"] },
          consequences: { setFlags: ["saved_juniper"], meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        { id: "jjc_c_back", text: "Go back for supplies.", targetSceneId: "jj_lab", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 7. THE SINGLE ENDING ==================== */
    {
      id: "jj_end",
      title: "The Jungle Lets Go",
      background: "/img/bg-jj-end.jpg",
      ambientAudio: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 55%", zoomDuration: 7, dimAmount: 0.1 },
      prose:
        "The wrench cracked the shell. The radio screamed the seed's own song back into it, off-key, over and over. The pod screamed once — a sound like a sky full of radio static — and then it went dark. By sunrise, the jungle was crumbling to green dust and blowing away down Main Street. The Rileys stood on the hill and watched their town come back, fern by fern, and it was the prettiest thing Hank had ever seen that wasn't his family.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE RILEYS SAVE JUNIPER — JUNGLE VANISHES!",
        recap: "You found the wrench and the radio, cracked the seed pod, and jammed its signal. The green receded and Juniper returned to normal — this time.",
      },
    },
  ],
};
