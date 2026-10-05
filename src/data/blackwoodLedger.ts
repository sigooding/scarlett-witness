import type { Story } from "../types";

/**
 * THE BLACKWOOD LEDGER
 * A neon-noir break-in, built as a Studio beta smoke-test for the cinematic
 * image controls, the foreground keyframe animation (Vera's "standing_shock"
 * sprites) and the particle effects. Deliberately a SINGLE-TIER story: one
 * victory-gold ending, reached three ways.
 *
 * Feature coverage:
 *  - typewriter credits intro (electric-turquoise accent)
 *  - dolly-zoom (vertigo) archive scene with background blur + 4 neon light
 *    glows (turquoise / magenta / amber / arc-pistol violet)
 *  - foreground keyframe animation cycling Vera's 5 standing_shock frames
 *    (hard sprite swap, Ace Attorney style) on the vertigo anchor
 *  - a beat-replacement background (the neon window) with a zoom-hold camera,
 *    and a second beat with a handheld-shake camera
 *  - storm particles (rain + lightning + thunder) on the archive
 *  - a clue item hotspot (the ledger), reply dialogue and a gated follow-up beat
 */
export const BLACKWOOD_LEDGER: Story = {
  id: "blackwood-ledger",
  title: "The Blackwood Ledger",
  tagline: "Row 14, Section C. A ledger bound in brass — and a signature in fresh ink that flips Vera Voss's whole world.",
  coverImage: "gradient:linear-gradient(160deg,#0a1428 0%,#2a0a2e 45%,#050a14 100%)",
  startSceneId: "bl_credits",
  layout: {
    bl_credits: { x: 0, y: 200 },
    bl_archive: { x: 360, y: 200 },
    bl_end: { x: 760, y: 200 },
  },
  characters: [
    { id: "vera", name: "Vera Voss", role: "Private Investigator", avatarUrl: "/img/ch-vera-voss.jpg", trustMeter: 0 },
    { id: "shadow", name: "The Man in the Dark", role: "Modulated Voice", avatarUrl: "emoji:🌑", trustMeter: 0 },
  ],
  items: [
    {
      id: "ledger",
      name: "Blackwood Ledger",
      icon: "📕",
      description: "A black book bound in brass — payouts, shell corporations and thirty years of the city's rot, signed at the bottom in her father's fresh ink.",
      flavorText: "Some books are written to be burned. This one was written to bury.",
      isClue: true,
    },
  ],
  briefing: {
    objective: "Get into the Blackwood Archive, find the brass-bound ledger on Row 14, Section C — and get back out alive with it.",
    winConditions: [
      "Find the brass-bound ledger on the lectern.",
      "Face the man in the dark — and don't freeze.",
      "Walk out of the Archive with the ledger.",
    ],
    loseConditions: ["Let the man behind you pull the trigger."],
  },
  scenes: [
    /* ==================== 1. OPENING CREDITS ==================== */
    {
      id: "bl_credits",
      title: "Opening Credits",
      nodeType: "credits",
      credits: {
        titleEntrance: "typewriter",
        stagger: 0.5,
        duration: 0.9,
        accentColor: "#2ad9d9",
        lines: [
          { role: "Starring", name: "Vera Voss" },
          { role: "The Man in the Dark", name: "A Voice Under the Neon" },
          { role: "Directed by", name: "Gaslight Reelworks" },
        ],
      },
      background: "gradient:linear-gradient(160deg,#04121a 0%,#0a1f14 55%,#050505 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      prose: "THE BLACKWOOD LEDGER\n\nA Neon Noir Break-In\n\nStarring Vera Voss\n\nTap Begin",
      choices: [
        { id: "blc_begin", text: "Begin the Case", targetSceneId: "bl_archive", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. THE ARCHIVE ==================== */
    {
      id: "bl_archive",
      title: "Row 14, Section C",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      particles: "storm",
      cinematic: {
        mode: "dolly-zoom",
        dollyZoomAmount: 1.25,
        dollyZoomDuration: 10,
        dollyZoomDirection: "both",
        dollyZoomBlur: 3,
        foregroundImage: "/assets/animations/vera/standing_shock/vera_keyframe1.png",
        foregroundScale: 0.85,
        foregroundFit: "contain",
        foregroundX: 50,
        foregroundY: 50,
        foregroundAnimation: {
          mode: "frames",
          frames: [
            "/assets/animations/vera/standing_shock/vera_keyframe1.png",
            "/assets/animations/vera/standing_shock/vera_keyframe2.png",
            "/assets/animations/vera/standing_shock/vera_keyframe3.png",
            "/assets/animations/vera/standing_shock/vera_keyframe4.png",
            "/assets/animations/vera/standing_shock/vera_keyframe5.png",
          ],
          frameDuration: 0.14,
        },
        dimAmount: 0.15,
        lights: [
          { x: 24, y: 16, color: "#2ad9d9", intensity: 0.3, size: 38, pulseSeconds: 3.0, pulseAmount: 0.9 },
          { x: 76, y: 14, color: "#ff2e88", intensity: 0.28, size: 36, pulseSeconds: 2.7, pulseAmount: 0.8 },
          { x: 50, y: 30, color: "#e8b23c", intensity: 0.2, size: 30, pulseSeconds: 3.4, pulseAmount: 0.7 },
          { x: 58, y: 48, color: "#9d4edd", intensity: 0.26, size: 26, pulseSeconds: 1.9, pulseAmount: 1 },
        ],
      },
      prose:
        "The rain outside Blackwood Archive didn't fall — it bled down the high stained-glass windows in harsh streaks of electric turquoise and searing magenta. Vera pulled the collar of her forest-green trench coat higher and stepped between the towering shelves, the anonymous tip still warm in her pocket: Row 14. Section C. Look for the ledger bound in brass.",
      dialogueBeats: [
        {
          id: "bla_n1",
          characterId: "narrator",
          expression: "V.O.",
          background: "/img/bg-vera-window.jpg",
          cinematic: {
            mode: "zoom-hold",
            focalPoint: "50% 42%",
            zoomDuration: 8,
            dimAmount: 0.2,
            lights: [{ x: 50, y: 24, color: "#2ad9d9", intensity: 0.3, size: 42, pulseSeconds: 2.6, pulseAmount: 0.9 }],
            lensFlare: {
              preset: "sci-fi-cyan",
              x: 50,
              y: 24,
              intensity: 0.85,
              streakIntensity: 0.95,
              ghostIntensity: 0.8,
            },
          },
          backgroundTransition: "fade",
          text: "The neon signage from the diner across the boulevard bled straight through the glass, painting the dark rows of ancient books in hyper-saturated shades of cyan and amber.",
        },
        { id: "bla_n2", characterId: "narrator", expression: "V.O.", text: "There it sat on the mahogany lectern. The brass clasps caught a splash of hot orange light, etched deep with the symbol of an eye over a keyhole. Vera unlatched the heavy lock — the metallic snap sounding like a hammer cocking in the empty room." },
        { id: "bla_n3", characterId: "narrator", expression: "V.O.", text: "She turned the page, and the bottom dropped out of her world. It wasn't a historical archive. It was a black book — payouts, shell corporations, wire transfers, thirty years of corrupt city governance. And at the very bottom, signed in fresh, wet ink, a signature that made her stomach turn to lead. Her father's. He hadn't been a victim. He had been the architect." },
        {
          id: "bla_n4",
          characterId: "narrator",
          expression: "V.O.",
          background: "/img/bg-vault.jpg",
          cinematic: {
            mode: "shake",
            shakeAmount: 0.55,
            shakeRotation: 0.9,
            shakeDuration: 0.3,
            dimAmount: 0.3,
            lights: [{ x: 62, y: 40, color: "#9d4edd", intensity: 0.32, size: 30, pulseSeconds: 1.6, pulseAmount: 1 }],
            lensFlare: {
              preset: "neon-noir",
              x: 62,
              y: 40,
              color: "#c084fc",
              secondaryColor: "#e879f9",
              intensity: 0.9,
              streakIntensity: 0.9,
              ghostIntensity: 0.85,
            },
          },
          backgroundTransition: "cut",
          text: "Squeak. A floorboard groaning under deliberate, heavy weight. A shadow — massive, unnaturally tall, edged in a glowing outline of electric blue — slid across the floorboards toward her boots.",
        },
        { id: "bla_s1", characterId: "shadow", expression: "through a vocal modulator", text: "You always had your father's knack for finding things best left buried, Vera. The trouble with dark secrets is they hate the light." },
        { id: "bla_n5", characterId: "narrator", expression: "V.O.", text: "A metallic click sounded inches from her ear. The distinctive charge of an arc-pistol hummed, casting a blinding pulse of violet light over her trembling silhouette. Her hand drifted slowly toward the heavy brass desk lamp. Two seconds." },
        { id: "bla_n6", characterId: "narrator", expression: "V.O.", text: "In a city built on neon and lies, Vera Voss was done playing in the dark." },
        { id: "bla_s2", characterId: "shadow", expression: "hesitating", conditionRule: { requiresFlags: ["stalled_him"] }, text: "The modulator crackled — hesitation, or amusement. Either way, the barrel drifted half an inch. Half an inch was enough." },
      ],
      hotspots: [
        {
          id: "bla_hs_ledger",
          label: "The brass-bound ledger",
          bounds: { x: 46, y: 40, w: 12, h: 14 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "ledger" },
          showItemImage: true,
        },
        {
          id: "bla_hs_lamp",
          label: "The heavy brass desk lamp",
          bounds: { x: 70, y: 62, w: 12, h: 16 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Solid brass, heavy enough to make a point. If it comes to that, it comes to that." },
        },
      ],
      choices: [
        {
          id: "bla_c_talk",
          reply: true,
          targetSceneId: "",
          text: "\u201CYou always had a talent for monologues.\u201D Keep him talking.",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["stalled_him"] },
        },
        {
          id: "bla_c_run",
          text: "Snatch the ledger and dive behind the lectern.",
          targetSceneId: "bl_end",
          attitudeTag: "Clever",
          consequences: { addItems: ["ledger"], setFlags: ["took_ledger"], meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "bla_c_lamp",
          text: "Swing the brass desk lamp at his wrist.",
          targetSceneId: "bl_end",
          attitudeTag: "Aggressive",
          timeLimitSeconds: 2,
          consequences: { setFlags: ["lamp_swing"], meterChanges: [{ meter: "Aggressive", delta: 2 }] },
        },
      ],
    },

    /* ==================== 3. THE SINGLE ENDING ==================== */
    {
      id: "bl_end",
      title: "Done Playing in the Dark",
      background: "/img/bg-end-vera.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "50% 55%",
        zoomDuration: 7,
        dimAmount: 0.12,
        lights: [
          { x: 50, y: 34, color: "#9d4edd", intensity: 0.3, size: 44, pulseSeconds: 2.4, pulseAmount: 0.9 },
          { x: 70, y: 22, color: "#2ad9d9", intensity: 0.24, size: 34, pulseSeconds: 3.0, pulseAmount: 0.8 },
        ],
      },
      prose:
        "The brass ledger hit the floor of the vault like a gavel. By the time the violet light of the arc-pistol faded, the man in the dark was gone — and Vera Voss was walking out of the Blackwood Archive with thirty years of the city's rot tucked under her arm. The rain was still bleeding down the glass. But this time, the secret was hers to keep.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "VERA VOSS CRACKS THE BLACKWOOD LEDGER — CITY HALL IN TURMOIL!",
        recap: "You found the ledger on Row 14, Section C, faced the man in the dark, and walked out alive. Some cases never close — this one just pried every other one open.",
      },
    },
  ],
};
