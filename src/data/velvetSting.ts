import type { Story } from "../types";

/**
 * A short verification case used to prove every gating rule works end to end.
 * The gold ending requires accumulating Sultry ≥ 3 across three deliberate
 * flirt beats — showing meter accumulation, meter-gated hidden choices, and a
 * lockout for players who drift too Aggressive.
 */
export const VELVET_STING: Story = {
  id: "velvet-sting",
  title: "The Velvet Sting",
  tagline: "One dame, one diamond, and three sultry heartbeats to talk her out of both.",
  coverImage: "/img/bg-dressing.jpg",
  startSceneId: "vs_lounge",
  layout: {
    vs_lounge: { x: 0, y: 200 },
    vs_powder_room: { x: 380, y: 60 },
    vs_bar: { x: 380, y: 340 },
    vs_terrace: { x: 760, y: 200 },
    vs_win_sultry: { x: 1160, y: 60 },
    vs_win_neutral: { x: 1160, y: 240 },
    vs_end_burned: { x: 1160, y: 420 },
  },
  briefing: {
    objective:
      "Talk lounge singer Coral Deveraux into surrendering the stolen Bellamy diamond — using charm, not force. Reach the terrace with her diamond in hand.",
    winConditions: [
      "Keep every choice Sultry — three flirt beats raise your Sultry meter to 3.",
      "At Sultry 3 the private-terrace invitation appears; take it to get the diamond directly.",
      "Never raise Suspicion above 2 — Coral spooks the second she smells pressure.",
    ],
    loseConditions: [
      "Pick any Aggressive choice — Coral's manager throws you out.",
      "Skip the sultry track and grab her wrist — she disappears with the diamond.",
    ],
    heatLimit: 4,
    heatFailSceneId: "vs_end_burned",
  },
  characters: [
    {
      id: "coral",
      name: "Coral Deveraux",
      role: "Torch Singer, Bellamy Diamond Thief",
      avatarUrl: "emoji:🌹",
      trustMeter: 0,
      voice: { pitch: 1.2, rate: 0.85 },
    },
  ],
  items: [
    {
      id: "diamond",
      name: "Bellamy Diamond",
      icon: "💎",
      description: "Ten thousand carats of trouble on a platinum chain.",
      flavorText: "It catches every light in the room, and every eye that follows.",
      isClue: true,
    },
  ],
  scenes: [
    {
      id: "vs_lounge",
      title: "The Cerulean Lounge",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "Coral leaned on the piano like she owned it. Around her neck: a diamond the papers had been screaming about for three days.",
      dialogueBeats: [
        {
          id: "vsb1",
          characterId: "coral",
          expression: "amused",
          text: "You've been staring for two whole songs, detective. Buy me a drink or arrest me — but pick one.",
        },
      ],
      choices: [
        {
          id: "vsc_flirt1",
          text: "\"That diamond isn't the most dangerous thing you're wearing tonight.\" (Sultry)",
          targetSceneId: "vs_bar",
          attitudeTag: "Sultry",
          consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "vsc_grab",
          text: "Reach over and take her wrist. \"Bellamy Diamond. Now.\" (Aggressive)",
          targetSceneId: "vs_end_burned",
          attitudeTag: "Aggressive",
          consequences: { meterChanges: [{ meter: "Aggressive", delta: 2 }, { meter: "Suspicion", delta: 3 }] },
        },
        {
          id: "vsc_deduce",
          text: "Study the setting. That clasp doesn't match the papers' photo. (Clever)",
          targetSceneId: "vs_bar",
          attitudeTag: "Clever",
          consequences: { meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
      ],
    },
    {
      id: "vs_bar",
      title: "Two Fingers at the Bar",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "The bartender poured. Coral watched the ice cracks like they meant something. Under her fingers she rolled the diamond back and forth.",
      dialogueBeats: [
        {
          id: "vsb1",
          characterId: "coral",
          expression: "curious",
          text: "Most men look at the stone. You keep looking at the woman wearing it.",
        },
      ],
      choices: [
        {
          id: "vsc_flirt2",
          text: "\"The stone can be replaced. You can't.\" (Sultry — requires Sul 1)",
          targetSceneId: "vs_powder_room",
          attitudeTag: "Sultry",
          gating: { minMeters: { Sultry: 1 } },
          consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "vsc_press",
          text: "\"You realise you're wearing federal evidence?\" (Aggressive — Sus max 1)",
          targetSceneId: "vs_end_burned",
          attitudeTag: "Aggressive",
          gating: { maxMeters: { Suspicion: 1 } },
          consequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        {
          id: "vsc_wait",
          text: "Say nothing. Wait her out.",
          targetSceneId: "vs_powder_room",
          attitudeTag: "Neutral",
        },
      ],
    },
    {
      id: "vs_powder_room",
      title: "By the Powder Room Door",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "drone",
      prose:
        "She led you into the corridor where the piano couldn't reach. Perfume, powder, and one very good question hanging between you.",
      dialogueBeats: [
        {
          id: "vsb1",
          characterId: "coral",
          expression: "considering",
          text: "Say the right thing here, detective, and I might just show you what the terrace looks like at midnight.",
        },
      ],
      choices: [
        {
          id: "vsc_flirt3",
          text: "\"The right thing? Any of the ones that ends with you.\" (Sultry — requires Sul 2)",
          targetSceneId: "vs_terrace",
          attitudeTag: "Sultry",
          gating: { minMeters: { Sultry: 2 }, maxMeters: { Suspicion: 2 } },
          consequences: { meterChanges: [{ meter: "Sultry", delta: 1 }], setFlags: ["coral_charmed"] },
        },
        {
          id: "vsc_polite",
          text: "\"Show me the terrace.\" (safe — no meters needed)",
          targetSceneId: "vs_terrace",
          attitudeTag: "Neutral",
        },
      ],
    },
    {
      id: "vs_terrace",
      title: "Midnight on the Terrace",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "Twelve stories up, the city looked like spilled sequins. Coral leaned on the railing, the diamond turning slowly against her collarbone.",
      dialogueBeats: [
        {
          id: "vsb1",
          characterId: "coral",
          expression: "vulnerable",
          text: "Bellamy was going to leave me holding the papers when the whole thing fell apart. So I held the diamond instead. Are you going to tell me that's stealing?",
          conditionRule: { minMeters: { Sultry: 3 } },
        },
        {
          id: "vsb2",
          characterId: "coral",
          expression: "cool",
          text: "You want the stone. I want a reason not to hand it over. Which of us has more to bargain with?",
          conditionRule: { maxMeters: { Sultry: 2 } },
        },
      ],
      choices: [
        {
          id: "vsc_win_sultry",
          text: "\"You handed me the reason two rooms ago.\" — accept the diamond from her. (Sultry — requires Sul 3 & Sus ≤ 2)",
          targetSceneId: "vs_win_sultry",
          attitudeTag: "Sultry",
          gating: { minMeters: { Sultry: 3 }, maxMeters: { Suspicion: 2 } },
          consequences: { addItems: ["diamond"], setFlags: ["coral_surrendered"] },
        },
        {
          id: "vsc_win_neutral",
          text: "Offer her the D.A. deal: return it tonight and walk. (Clever — requires Cle 1)",
          targetSceneId: "vs_win_neutral",
          attitudeTag: "Clever",
          gating: { minMeters: { Clever: 1 } },
          consequences: { addItems: ["diamond"], setFlags: ["deal_struck"] },
        },
        {
          id: "vsc_lose",
          text: "Draw on her. \"Give it up.\" (Aggressive)",
          targetSceneId: "vs_end_burned",
          attitudeTag: "Aggressive",
        },
      ],
    },
    {
      id: "vs_win_sultry",
      title: "One Diamond, Two Lies, Zero Regret",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "jazz",
      prose:
        "She unclasped the diamond herself and closed your fingers around it. \"Tell Bellamy I never had it.\" You walked her out the front door. The stone was in the D.A.'s hand by breakfast; Coral's whereabouts were nobody's business by lunch.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "SINGER SURRENDERS STOLEN DIAMOND — 'DETECTIVE HAS A CERTAIN WAY,' SAYS ANONYMOUS SOURCE",
        recap: "You reached Sultry 3, kept Suspicion under 3, and walked out with both the stone and her dignity intact.",
      },
    },
    {
      id: "vs_win_neutral",
      title: "A Very Professional Handshake",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "The deal held. Coral turned herself in with the stone still around her neck; the D.A. shook her hand for the cameras. Case closed, no charm required.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "TORCH SINGER TURNS SELF IN — CLEVER D.A. DEAL SAVES BELLAMY DIAMOND",
        recap: "You used Clever, not charm. Perfectly valid — but the sultry ending is warmer.",
      },
    },
    {
      id: "vs_end_burned",
      title: "The Front Door, The Hard Way",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "Coral vanished the moment your voice hardened. Her manager escorted you out past the same table you'd first seen her at. The diamond went with her, and so did the case.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "P.I. THROWN FROM CERULEAN LOUNGE — SINGER, DIAMOND MISSING",
        recap: "You went Aggressive on a case built for Sultry. Try again — the meters really do matter.",
      },
    },
  ],
};
