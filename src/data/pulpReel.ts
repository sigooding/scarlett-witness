import type { Story } from "../types";

/**
 * PULP REEL — A Fan Homage
 * A nonlinear, multichoice neo-noir in the spirit of Tarantino's "Pulp Fiction":
 * two hitmen, a glowing briefcase, a 1950s dance-off, an overdose, a fixer, and
 * a morning that keeps repeating until the lesson lands. All dialogue is
 * original — this is the vibe, not the script.
 *
 * Built for the Studio: a typewriter credits intro, slow-pan / zoom-hold /
 * handheld-shake / wide-dolly / vertigo dolly-zoom cameras, neon light glows,
 * a timed choice (the overdose), an item gate (the briefcase), reply dialogue
 * and three endings that reward (or punish) the player's earlier choices.
 */
export const PULP_REEL: Story = {
  id: "pulp-reel",
  title: "Pulp Reel",
  tagline: "Two hitmen. One briefcase. A morning that keeps repeating until somebody learns the lesson.",
  coverImage: "/img/cover-pulp-reel.jpg",
  startSceneId: "pf_credits",
  layout: {
    pf_credits: { x: 0, y: 220 },
    pf_diner: { x: 320, y: 220 },
    pf_apartment: { x: 640, y: 220 },
    pf_car: { x: 960, y: 220 },
    pf_club: { x: 1280, y: 220 },
    pf_od: { x: 1600, y: 220 },
    pf_finale: { x: 1920, y: 220 },
    pf_end_gold: { x: 2240, y: 0 },
    pf_end_silver: { x: 2240, y: 220 },
    pf_end_gameover: { x: 2240, y: 440 },
  },
  characters: [
    { id: "ray", name: "Ray Vail", role: "Hitman", avatarUrl: "emoji:🕶️", trustMeter: 0 },
    { id: "julian", name: "Julian Frost", role: "Hitman / Philosopher", avatarUrl: "emoji:😇", trustMeter: 0 },
    { id: "mina", name: "Mina Vale", role: "The Boss's Wife", avatarUrl: "emoji:💋", trustMeter: 0 },
    { id: "malcolm", name: "Malcolm Vale", role: "The Boss", avatarUrl: "emoji:👑", trustMeter: 0 },
    { id: "brick", name: "Brick Calloway", role: "The Boxer", avatarUrl: "emoji:🥊", trustMeter: 0 },
    { id: "dealer", name: "Deano", role: "One of the Boys", avatarUrl: "emoji:🎒", trustMeter: 0 },
    { id: "rex", name: "Rex", role: "Diner Robber", avatarUrl: "emoji:🤠", trustMeter: 0 },
    { id: "dot", name: "Dot", role: "Diner Robber", avatarUrl: "emoji:🍯", trustMeter: 0 },
  ],
  items: [
    {
      id: "briefcase",
      name: "The Briefcase",
      icon: "💼",
      description: "A worn leather briefcase that glows gold when you crack the latch. Nobody asks what's inside. That's the whole job description.",
      flavorText: "It hums like a slot machine that already knows you won.",
    },
    {
      id: "adrenaline_kit",
      name: "Adrenaline Kit",
      icon: "💉",
      description: "A black case with a single syringe of adrenaline and a note: 'Straight through the sternum. Don't think about it.'",
      flavorText: "For the moment after the moment when thinking stops working.",
    },
  ],
  briefing: {
    objective: "Deliver the briefcase to Malcolm Vale, keep Mina out of trouble, and survive a morning that keeps repeating until you learn the lesson.",
    winConditions: [
      "Take the briefcase from Deano's boys without unnecessary blood.",
      "Save Mina when the night goes sideways.",
      "End the loop at the diner without drawing first.",
    ],
    loseConditions: [
      "Let Suspicion max out — Malcolm stops asking questions.",
      "Freeze up when the clock is running.",
      "Draw on the robbers and watch the morning reset.",
    ],
    heatLimit: 6,
    heatFailSceneId: "pf_end_gameover",
  },
  scenes: [
    /* ==================== 1. CREDITS ==================== */
    {
      id: "pf_credits",
      title: "Opening Credits",
      nodeType: "credits",
      noTypewriter: true,
      credits: { titleEntrance: "typewriter", stagger: 0.5, duration: 0.9, accentColor: "#ff2e88", lines: [{ role: "Starring", name: "Ray & Julian" }, { role: "Featuring", name: "Mina Vale" }, { role: "An homage to", name: "The Pulp" }] },
      background: "gradient:linear-gradient(160deg,#1a0a0a 0%,#201010 55%,#050505 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "PULP REEL\n\nA Morning That Keeps Repeating\n\nAn Unauthorized Fan Homage\n\nTap Begin",
      choices: [
        { id: "pfc_begin", text: "Begin the Case", targetSceneId: "pf_diner", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE DINER ==================== */
    {
      id: "pf_diner",
      title: "The Tip Top Diner, 7 a.m.",
      background: "/img/bg-pf-diner.jpg",
      ambientAudio: "rain",
      particles: "smoke",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 45%",
        zoomDuration: 9,
        dimAmount: 0.14,
        lights: [
          { x: 62, y: 26, color: "#ff2e88", intensity: 0.28, size: 34, pulseSeconds: 3.2, pulseAmount: 0.9 },
          { x: 30, y: 20, color: "#e8b23c", intensity: 0.22, size: 30, pulseSeconds: 2.8, pulseAmount: 0.7 },
        ],
      },
      prose:
        "Seven in the morning at the Tip Top Diner, and Ray and Julian sat in the corner booth like two well-dressed storm fronts. They were arguing about the only thing that mattered before a job: whether a cheeseburger tasted better on the other side of the ocean. Then the door opened, and the morning got complicated.",
      dialogueBeats: [
        { id: "pfd_r1", characterId: "ray", expression: "chewing", text: "I'm telling you, it's the water. Foreign water, foreign cows. The burger itself has nothing to do with it." },
        { id: "pfd_j1", characterId: "julian", expression: "matter-of-fact", text: "It's the philosophy. Over there they don't rush a cow. Over here we rush everything — our burgers taste like hurry." },
        { id: "pfd_n1", characterId: "narrator", expression: "V.O.", text: "Two hitmen, one briefcase-shaped errand, and a debate about livestock. This was going to be one of those mornings." },
        { id: "pfd_rex1", characterId: "rex", expression: "loud", text: "Nobody move! This is a hold-up. Coffee cups down, wallets on the table, and nobody plays the hero before breakfast." },
        { id: "pfd_dot1", characterId: "dot", expression: "bright", text: "This is my boyfriend Rex. He's very serious about breakfast. Don't take it personally." },
      ],
      hotspots: [
        {
          id: "pfd_hs_window",
          label: "The neon window",
          bounds: { x: 4, y: 10, w: 22, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Neon bleeds through the blinds — pink and gold, the colors of a city that never learned to blush." },
        },
      ],
      choices: [
        { id: "pfd_c1", text: "Keep eating. Let the robbery be somebody else's problem.", targetSceneId: "pf_apartment", attitudeTag: "Clever", consequences: { setFlags: ["cool_head"] } },
        { id: "pfd_c2", text: "Sweet-talk the lovebirds into walking out.", targetSceneId: "pf_apartment", attitudeTag: "Sultry", consequences: { setFlags: ["talked_down"], meterChanges: [{ meter: "Sultry", delta: 2 }] } },
        { id: "pfd_c3", text: "Show them the business end of the morning.", targetSceneId: "pf_apartment", attitudeTag: "Aggressive", consequences: { setFlags: ["showed_iron"], meterChanges: [{ meter: "Suspicion", delta: 2 }] } },
      ],
    },

    /* ==================== 3. THE APARTMENT ==================== */
    {
      id: "pf_apartment",
      title: "Deano's Kitchen",
      background: "/img/bg-pf-apartment.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: {
        mode: "pan",
        panDistance: 5,
        panDirection: "left",
        dimAmount: 0.18,
        lights: [{ x: 50, y: 40, color: "#e8b23c", intensity: 0.32, size: 44, pulseSeconds: 2.6, pulseAmount: 1 }],
      },
      prose:
        "The apartment smelled like cheap air freshener and expensive fear. Three young men, a kitchen table, and — sitting on it like it owned the place — the briefcase. Ray and Julian had the address. The boys had the merchandise. The math was simple.",
      dialogueBeats: [
        { id: "pfa_d1", characterId: "dealer", expression: "terrified", text: "You're him. You're the guy. Look, the case is right there. Just take it. Nobody has to — nobody has to be anybody, okay?" },
        /* Julian's own cold-blooded monologue — original, not the script. */
        { id: "pfa_j1", characterId: "julian", expression: "cold", text: "In this line of work you meet three kinds of people. The ones who run, the ones who beg, and the ones who watch the briefcase like it's already spent. You three are the third kind. And the third kind learns a lesson before I leave this kitchen." },
        { id: "pfa_n1", characterId: "narrator", expression: "V.O.", text: "The briefcase sat open a crack. What was inside threw a little gold light up the walls, like the sun was on the other side of the zipper." },
        { id: "pfa_n2", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["mercy"] }, text: "You took the case and left them breathing. Mercy, Ray learned, is a weapon too — it just takes longer to go off." },
      ],
      hotspots: [
        {
          id: "pfa_hs_case",
          label: "The briefcase on the table",
          bounds: { x: 50, y: 42, w: 16, h: 14 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "briefcase" },
        },
      ],
      choices: [
        { id: "pfa_c1", text: "Make an example of one of them.", targetSceneId: "pf_car", attitudeTag: "Aggressive", consequences: { setFlags: ["made_example"], meterChanges: [{ meter: "Suspicion", delta: 2 }] } },
        { id: "pfa_c2", text: "Take the case. Leave them breathing.", targetSceneId: "pf_car", attitudeTag: "Clever", consequences: { setFlags: ["mercy"], meterChanges: [{ meter: "Clever", delta: 1 }] } },
      ],
    },

    /* ==================== 4. THE CAR ==================== */
    {
      id: "pf_car",
      title: "The Back Seat Problem",
      background: "/img/bg-pf-car.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.35,
        shakeRotation: 0.6,
        shakeDuration: 0.5,
        dimAmount: 0.2,
        lights: [{ x: 50, y: 30, color: "#ff2e88", intensity: 0.24, size: 36, pulseSeconds: 2.8, pulseAmount: 0.8 }],
      },
      prose:
        "The back seat was a problem. The kind of problem that gets its own chapter. Ray kept his eyes on the road and his mind on the fact that the morning had started with cheeseburgers.",
      dialogueBeats: [
        { id: "pfc_r1", characterId: "ray", expression: "queasy", text: "This is a mess. Not the philosophical kind. The kind that stains upholstery." },
        { id: "pfc_j1", characterId: "julian", expression: "calm", text: "We need somebody who cleans problems for a living. A professional. A man with a hose and a plan." },
        { id: "pfc_n1", characterId: "narrator", expression: "V.O.", text: "Every city has a man you call when the problem stops being the kind a towel fixes. In this city, his name was Wolf." },
        { id: "pfc_n2", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["fixer_called"] }, text: "Wolf showed up in twenty minutes flat and made the back seat somebody else's chapter. That's what the money is for." },
      ],
      hotspots: [],
      choices: [
        { id: "pfc_c1", text: "Call the fixer.", targetSceneId: "pf_club", attitudeTag: "Clever", consequences: { setFlags: ["fixer_called"] } },
        { id: "pfc_c2", text: "Handle it yourself. Trunk, hose, bleach.", targetSceneId: "pf_club", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] } },
      ],
    },

    /* ==================== 5. THE CLUB (dolly-zoom) ==================== */
    {
      id: "pf_club",
      title: "Jackalope Slim's",
      background: "/img/bg-pf-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      cinematic: {
        mode: "dolly-zoom",
        dollyZoomAmount: 1.25,
        dollyZoomDuration: 10,
        dollyZoomDirection: "both",
        dollyZoomBlur: 2,
        foregroundImage: "/img/fg-pf-briefcase.png",
        foregroundScale: 0.55,
        foregroundFit: "contain",
        dimAmount: 0.12,
        lights: [
          { x: 50, y: 30, color: "#e8b23c", intensity: 0.3, size: 40, pulseSeconds: 2.6, pulseAmount: 0.9 },
          { x: 70, y: 22, color: "#ff2e88", intensity: 0.24, size: 32, pulseSeconds: 3.0, pulseAmount: 0.8 },
        ],
      },
      prose:
        "Jackalope Slim's was a museum of 1958 that served milkshakes. Mina Vale sat in the booth like she'd been painted there. 'The boss asked you to take me out,' she said. 'So take me out dancing, killer.'",
      dialogueBeats: [
        { id: "pfl_m1", characterId: "mina", expression: "amused", text: "You know what they call a burger with cheese in Europe? They don't. They have dignity. Now come dance with me before I decide you're boring." },
        { id: "pfl_n1", characterId: "narrator", expression: "V.O.", text: "The stage lit up. The announcer called for the Twist. And Ray, who had never once been nervous holding a gun, discovered he was terrified of a dance floor." },
        { id: "pfl_n2", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["won_twist"] }, text: "They took the trophy and left with the briefcase still glowing in the trunk. Mina pressed the trophy into Ray's hands like it was the whole point. Maybe it was." },
      ],
      hotspots: [],
      choices: [
        { id: "pfl_c1", text: "Dance like your life depends on it.", targetSceneId: "pf_od", attitudeTag: "Sultry", consequences: { setFlags: ["won_twist"], meterChanges: [{ meter: "Sultry", delta: 2 }], trustChanges: [{ characterId: "mina", delta: 1 }] } },
        { id: "pfl_c2", text: "Twist with two left feet and no shame.", targetSceneId: "pf_od", attitudeTag: "Neutral" },
        { id: "pfl_c3", text: "Sit it out and watch her.", targetSceneId: "pf_od", attitudeTag: "Neutral" },
      ],
    },

    /* ==================== 6. THE OVERDOSE (timed choice) ==================== */
    {
      id: "pf_od",
      title: "The Longest Minute",
      background: "/img/bg-pf-od.jpg",
      ambientAudio: "tension",
      particles: "smoke",
      cinematic: {
        mode: "shake",
        shakeAmount: 0.5,
        shakeRotation: 0.9,
        shakeDuration: 0.3,
        dimAmount: 0.22,
        lights: [{ x: 50, y: 30, color: "#ff2e88", intensity: 0.3, size: 40, pulseSeconds: 2.0, pulseAmount: 1 }],
      },
      prose:
        "Mina found the wrong little baggie in Ray's coat. By the time he found her, she wasn't moving right. The clock started.",
      dialogueBeats: [
        { id: "pfo_r1", characterId: "ray", expression: "panicking", text: "Wake up. Mina. Mina! Julian, she's not breathing right, what do I do?" },
        { id: "pfo_n1", characterId: "narrator", expression: "V.O.", text: "Somewhere in the trunk was an adrenaline kit with a single instruction: straight through the sternum, don't think about it. The clock was ticking, and thinking was the one thing Ray had too much of." },
      ],
      hotspots: [],
      choices: [
        { id: "pfo_c_save", text: "Stab the adrenaline straight through the sternum.", targetSceneId: "pf_finale", attitudeTag: "Clever", timeLimitSeconds: 8, consequences: { setFlags: ["saved_mina"], meterChanges: [{ meter: "Clever", delta: 2 }], trustChanges: [{ characterId: "mina", delta: 2 }] } },
        { id: "pfo_c_call", text: "Call Malcolm and confess.", targetSceneId: "pf_end_gameover", attitudeTag: "Aggressive", timeLimitSeconds: 8, consequences: { setFlags: ["confessed"], meterChanges: [{ meter: "Suspicion", delta: 3 }] } },
        { id: "pfo_c_freeze", text: "Freeze up.", targetSceneId: "pf_end_gameover", attitudeTag: "Neutral", consequences: { setFlags: ["froze"] } },
      ],
    },

    /* ==================== 7. THE FINALE (back at the diner) ==================== */
    {
      id: "pf_finale",
      title: "The Morning Repeats",
      background: "/img/bg-pf-end.jpg",
      ambientAudio: "rain",
      particles: "smoke",
      cinematic: {
        mode: "dolly",
        dollyDirection: "right",
        dollyDistance: 8,
        dollyDuration: 14,
        dimAmount: 0.14,
        lights: [
          { x: 30, y: 26, color: "#e8b23c", intensity: 0.26, size: 34, pulseSeconds: 3.0, pulseAmount: 0.8 },
          { x: 80, y: 22, color: "#ff2e88", intensity: 0.22, size: 30, pulseSeconds: 2.8, pulseAmount: 0.7 },
        ],
      },
      prose:
        "The Tip Top Diner, seven in the morning, again. Ray and Julian sat in the corner booth like two well-dressed storm fronts, arguing about cheeseburgers. And then Rex and Dot walked in. Some mornings are loops.",
      dialogueBeats: [
        { id: "pff_j1", characterId: "julian", expression: "knowing", text: "You ever notice how the morning keeps repeating until you learn the lesson, Ray?" },
        { id: "pff_n1", characterId: "narrator", expression: "V.O.", text: "The briefcase glowed gold in the footwell. Whatever was in it, it had opinions." },
        { id: "pff_rex1", characterId: "rex", expression: "loud", text: "Nobody move! This is a hold-up. Coffee cups down, wallets on the table, and nobody plays the hero before breakfast." },
        { id: "pff_n2", characterId: "narrator", expression: "V.O.", conditionRule: { requiresFlags: ["redeemed"] }, text: "And this time, for the first time all morning, nobody got hurt. The loop let go. The lesson, whatever it was, finally landed." },
      ],
      hotspots: [],
      choices: [
        {
          id: "pff_c_gold",
          text: "Walk them out of the diner. End the loop without a drop of blood.",
          targetSceneId: "pf_end_gold",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["mercy", "talked_down"], requiresAll: false },
          consequences: { setFlags: ["redeemed"] },
        },
        { id: "pff_c_silver", text: "Give them the wallets and the speech.", targetSceneId: "pf_end_silver", attitudeTag: "Sultry", consequences: { setFlags: ["gave_the_speech"] } },
        { id: "pff_c_gameover", text: "Draw on them.", targetSceneId: "pf_end_gameover", attitudeTag: "Aggressive", consequences: { meterChanges: [{ meter: "Suspicion", delta: 3 }] } },
      ],
    },

    /* ==================== ENDINGS ==================== */
    {
      id: "pf_end_gold",
      title: "The Loop Closes",
      background: "/img/bg-pf-end.jpg",
      ambientAudio: "jazz",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 55%", zoomDuration: 7, dimAmount: 0.1 },
      prose:
        "You walked Dot and Rex to the door like an usher at the end of a picture, and the morning — for the first time — did not repeat. The briefcase stayed shut, glowing a little, like it approved. Ray and Julian finished their cheeseburgers in peace. Some mornings you survive. This one, you actually won.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE LOOP CLOSES — NOBODY DRAWS FIRST",
        recap: "You kept your cool and your mercy, saved Mina, and broke the loop without a drop of blood.",
      },
    },
    {
      id: "pf_end_silver",
      title: "The Speech",
      background: "gradient:linear-gradient(160deg,#2a1a0a 0%,#0c0c14 70%)",
      ambientAudio: "tension",
      prose:
        "You gave Rex and Dot the speech, the wallets, and the door. They walked out wiser, you walked out lighter, and the briefcase hummed in the footwell like a slot machine that was still deciding. The morning didn't repeat. But you never quite trusted a diner again.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "THE SPEECH — REASON OVER REVOLVERS",
        recap: "You talked your way out of the final hold-up. The loop broke, but the lesson only half landed.",
      },
    },
    {
      id: "pf_end_gameover",
      title: "The Morning Gets Complicated",
      background: "gradient:linear-gradient(160deg,#2a0505 0%,#000000 100%)",
      ambientAudio: "tension",
      particles: "storm",
      prose:
        "It happened the way it always happens when you reach for iron instead of words. The diner got loud, then quiet, then very, very still. And when the morning came around again — because it always comes around again — Ray and Julian were back in the booth, arguing about cheeseburgers, with no memory of the lesson they'd just failed.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "THE MORNING GETS COMPLICATED",
        recap: "You drew first, or froze when it mattered. The loop reset — and it will keep resetting until the lesson lands.",
      },
    },
  ],
};
