import type { Story } from "../types";

/**
 * UNDER PIER FOUR — a neon-noir follow-up to "The Blackwood Ledger".
 *
 * Three weeks after the Blackwood Archive burned, Vera Voss follows an
 * encrypted tip beneath Pier 4 and finds a Vanguard Dynamics pocket watch —
 * a tracker, not a timepiece — pointing toward the abandoned salt flats. The
 * woman with the electric-blue optic implants knows her father. The watch is
 * ticking. And the countdown just hit zero.
 *
 * One gold ending (follow the signal) and two silver endings (confront the
 * stranger / spring the trap). Exercises the storm particles, dolly-zoom +
 * beat-replacement cinematics, neon light glows, a clue hotspot, and the new
 * Midnight-in-the-Rain theme.
 */
export const PIER_FOUR: Story = {
  id: "pier-four",
  title: "Under Pier Four",
  tagline: "Three weeks after the Archive burned, a pocket watch starts ticking — and so does Vera Voss's countdown.",
  coverImage: "/img/bg-watch.jpg",
  startSceneId: "pf_credits",
  briefing: {
    objective: "Follow the tracker beneath Pier 4 and learn what her father left behind before the countdown hits zero.",
    winConditions: [
      "Find the silver pocket watch in the rusted utility box.",
      "Decide how to face the woman with the electric-blue eyes.",
      "Follow the signal to the salt flats — or out-maneuver the stranger.",
    ],
    loseConditions: [
      "Let the stranger walk away with the watch.",
      "Follow the signal blind, with no way back out of the dark.",
    ],
  },
  layout: {
    pf_credits: { x: 0, y: 200 },
    pf_diner: { x: 340, y: 200 },
    pf_pier: { x: 680, y: 200 },
    pf_end_stranger: { x: 1040, y: 60 },
    pf_end_signal: { x: 1040, y: 200 },
    pf_end_trap: { x: 1040, y: 340 },
  },
  characters: [
    { id: "vera", name: "Vera Voss", role: "Private Investigator", avatarUrl: "/img/ch-vera-voss.jpg", trustMeter: 0, voice: { pitch: 1.05, rate: 0.9 } },
    { id: "stranger", name: "The Woman With the Electric Eyes", role: "Vanguard Dynamics Asset", avatarUrl: "/img/bg-stranger.jpg", trustMeter: 0, voice: { pitch: 0.9, rate: 0.88 } },
  ],
  items: [
    {
      id: "pocket_watch",
      name: "Vanguard Pocket Watch",
      icon: "⌚",
      iconUrl: "/img/bg-watch.jpg",
      description: "A silver pocket watch with a cracked crystal. The face has been modified into a tiny pulsing signal tracker — a purple LED blinking once every three seconds, engraved 'Property of Vanguard Dynamics.'",
      flavorText: "It doesn't tell time. It tells you where the truth is buried.",
      isClue: true,
    },
  ],
  scenes: [
    /* ==================== 1. OPENING CREDITS ==================== */
    {
      id: "pf_credits",
      title: "Opening Credits",
      nodeType: "credits",
      credits: {
        titleEntrance: "typewriter",
        stagger: 0.5,
        duration: 0.9,
        accentColor: "#2ad9d9",
        lines: [
          { role: "Starring", name: "Vera Voss" },
          { role: "The Woman With the Electric Eyes", name: "A Voice Under the Rain" },
          { role: "Directed by", name: "Gaslight Reelworks" },
        ],
      },
      background: "gradient:linear-gradient(160deg,#04121a 0%,#120a24 55%,#050505 100%)",
      ambientAudio: "drone",
      musicMode: "track",
      musicUrl: "/Midnight%20in%20the%20Rain2.mp3",
      prose: "UNDER PIER FOUR\n\nA Neon Noir Follow-Up\n\nStarring Vera Voss\n\nTap Begin",
      choices: [{ id: "pfc_begin", text: "Begin the Case", targetSceneId: "pf_diner", attitudeTag: "Neutral" }],
      hotspots: [],
      dialogueBeats: [],
    },

    /* ==================== 2. BLACKWOOD DINER ==================== */
    {
      id: "pf_diner",
      title: "Blackwood Diner — Three Weeks Later",
      background: "/img/bg-blackwood-diner.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: {
        mode: "pan",
        focalPoint: "50% 40%",
        zoomDuration: 12,
        dimAmount: 0.14,
        lights: [
          { x: 24, y: 22, color: "#ff2e88", intensity: 0.3, size: 34, pulseSeconds: 3.2, pulseAmount: 1 },
          { x: 74, y: 30, color: "#2ad9d9", intensity: 0.28, size: 40, pulseSeconds: 2.8, pulseAmount: 0.8 },
        ],
      },
      prose:
        "The neon sign outside Blackwood Diner flickered in rhythm with the rain, buzzing like a dying wasp. Vera sat in the corner booth, staring at the bottom of her third cup of black coffee. Three weeks since the Blackwood Archive burned to the ground. The ledgers were gone. Her father's shadow still haunted the city — and the detective shield in her trench coat pocket felt heavier than ever.",
      dialogueBeats: [
        { id: "pfd_n1", characterId: "narrator", expression: "V.O.", text: "Her phone buzzed across the Formica table — a short-range encrypted ping. UNKNOWN: The fire was a distraction. Look under Pier 4. UNKNOWN: He left something behind before he vanished." },
        { id: "pfd_n2", characterId: "narrator", expression: "V.O.", text: "Vera set a wet crumpled bill on the table, pulled her dark green coat tight against the chill, and stepped into the storm." },
      ],
      choices: [{ id: "pfd_go", text: "Head for the harbor district.", targetSceneId: "pf_pier", attitudeTag: "Neutral" }],
      hotspots: [],
    },

    /* ==================== 3. BENEATH PIER 4 ==================== */
    {
      id: "pf_pier",
      title: "Beneath Pier 4",
      background: "/img/bg-pier4.jpg",
      ambientAudio: "rain",
      particles: "storm",
      cinematic: {
        mode: "dolly-zoom",
        dollyZoomAmount: 1.2,
        dollyZoomDuration: 9,
        dollyZoomDirection: "both",
        dollyZoomBlur: 2,
        dimAmount: 0.15,
        lights: [
          { x: 26, y: 18, color: "#2ad9d9", intensity: 0.28, size: 36, pulseSeconds: 2.9, pulseAmount: 0.9 },
          { x: 72, y: 22, color: "#e23b4e", intensity: 0.3, size: 38, pulseSeconds: 2.6, pulseAmount: 0.8 },
        ],
      },
      prose:
        "The harbor district was drenched in hyper-saturated shades of cyan and crimson, the neon from the high-rise casinos reflecting off slick, oil-stained black water. Beneath Pier 4, the air reeked of salt, rust, and ozone. Waves slapped violently against the green-moss timber pilings.",
      dialogueBeats: [
        { id: "pfp_n1", characterId: "narrator", expression: "V.O.", text: "Using her flashlight, Vera navigated the slippery catwalk until the beam caught a rusted iron utility box tucked behind a generator. It wasn't locked — it was jammed shut with a broken pair of brass wire-cutters." },
        {
          id: "pfp_n2",
          characterId: "narrator",
          expression: "V.O.",
          background: "/img/bg-watch.jpg",
          cinematic: { mode: "zoom-hold", focalPoint: "50% 50%", zoomDuration: 6, dimAmount: 0.2, lights: [{ x: 50, y: 46, color: "#9d4edd", intensity: 0.3, size: 36, pulseSeconds: 2.4, pulseAmount: 0.8 }] },
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 0.7,
          text: "Inside wasn't a file or a flash drive. It was a silver pocket watch, its crystal cracked, ticking loudly in the dark. The face was modified into a tiny pulsing signal tracker — a faint purple LED blinking once every three seconds, pointing deeper down the coastline toward the abandoned salt flats.",
        },
        { id: "pfp_s1", characterId: "stranger", expression: "calm, through the downpour", text: "I wouldn't. Your father gave me that watch, Detective. And if it's ticking, it means his countdown just reached zero." },
      ],
      choices: [
        {
          id: "pfp_stranger",
          text: "Draw your weapon and demand to know who she is and how she knew your father.",
          targetSceneId: "pf_end_stranger",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["confronted_stranger"], meterChanges: [{ meter: "Aggressive", delta: 2 }] },
        },
        {
          id: "pfp_signal",
          text: "Ignore her — leap to the lower dock and follow the tracker to the salt flats.",
          targetSceneId: "pf_end_signal",
          attitudeTag: "Clever",
          consequences: { setFlags: ["followed_signal"], addItems: ["pocket_watch"], meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "pfp_trap",
          text: "Flip the upper hand — use the catwalk and the dark the way you used the desk lamp at the Archive.",
          targetSceneId: "pf_end_trap",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["set_trap"], meterChanges: [{ meter: "Sultry", delta: 2 }] },
        },
      ],
      hotspots: [
        {
          id: "pfp_watch",
          label: "The silver pocket watch",
          bounds: { x: 48, y: 46, w: 12, h: 16 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "pocket_watch" },
        },
      ],
    },

    /* ==================== 4a. FOCUS ON THE STRANGER (SILVER) ==================== */
    {
      id: "pf_end_stranger",
      title: "The Woman With the Electric Eyes",
      background: "/img/bg-stranger.jpg",
      ambientAudio: "rain",
      particles: "rain",
      cinematic: { mode: "zoom-hold", focalPoint: "50% 42%", zoomDuration: 7, dimAmount: 0.18, lights: [{ x: 50, y: 40, color: "#2ad9d9", intensity: 0.3, size: 38, pulseSeconds: 2.6, pulseAmount: 0.9 }] },
      prose:
        "Vera drew — and the woman didn't flinch. She only smiled, the blue light of her implants bleeding across the rain. Her name was no name at all: a designation, a Vanguard Dynamics asset who'd been watching the family for thirty years. She knew the father, knew the fire, knew the ledger. But the watch, she said, wasn't hers to keep. The countdown had started, and Vera had spent her two seconds on the wrong question. The woman stepped back into the dark before the storm could swallow her — leaving Vera standing under Pier 4 with a gun, a name she didn't want, and a clock she'd never learned to read.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "THE WOMAN WITH THE ELECTRIC EYES", recap: "You faced the stranger and learned who she was — but the signal kept ticking without you." },
    },

    /* ==================== 4b. FOCUS ON THE SIGNAL (GOLD) ==================== */
    {
      id: "pf_end_signal",
      title: "The Salt Flats",
      background: "/img/bg-saltflats.jpg",
      ambientAudio: "drone",
      particles: "storm",
      cinematic: { mode: "pan", focalPoint: "50% 55%", zoomDuration: 14, dimAmount: 0.16, lights: [{ x: 40, y: 26, color: "#9d4edd", intensity: 0.3, size: 40, pulseSeconds: 3.0, pulseAmount: 0.9 }] },
      prose:
        "Vera dropped off the catwalk to the lower dock and ran, the watch's purple LED pulsing in her fist like a second heartbeat. Out past the last pylon, past the city's light, into the abandoned salt flats where the toxic visualizer fluid pooled in shimmering violet slicks. There, under a slab of salt-crusted concrete, she found what her father had left: not a confession, not a body — a second watch, still running, and a single line scratched into the casing. You were never the witness, Vera. You were the alibi. The storm rolled in behind her. But this time, the secret was hers to keep.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "YOU WERE NEVER THE WITNESS — YOU WERE THE ALIBI", recap: "You followed the signal to the salt flats and found the second watch — and your father's last message." },
    },

    /* ==================== 4c. SET THE TRAP (SILVER) ==================== */
    {
      id: "pf_end_trap",
      title: "Two Seconds in the Dark",
      background: "/img/bg-pier4.jpg",
      ambientAudio: "tension",
      particles: "storm",
      cinematic: { mode: "shake", shakeAmount: 0.4, shakeRotation: 0.7, shakeDuration: 0.35, dimAmount: 0.22, lights: [{ x: 50, y: 24, color: "#e23b4e", intensity: 0.3, size: 34, pulseSeconds: 2.2, pulseAmount: 0.8 }] },
      prose:
        "Vera killed her flashlight and let the dark do the work — the oldest trick in the book, the same one that saved her at the Archive. She swung the watch's chain, caught the stranger's wrist, and let the rusted catwalk finish the argument. The woman went down hard on the wet planks, and Vera stood over her with two seconds and a choice. She took the watch instead. Not vengeance. Not the truth. Just the clock — and the head start it bought her into the storm.",
      isEnding: true,
      endingData: { tier: "victory-silver", headline: "TWO SECONDS IN THE DARK", recap: "You flipped the upper hand in the dark and walked away with the watch — and a head start." },
    },
  ],
};
