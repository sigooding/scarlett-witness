import type { Story } from "../types";

/**
 * THE SOUR NOTE
 * A short, punchy case built against the (freshly audited) Studio schema.
 * Demonstrates the recently-exposed features: conversational reply choices with
 * per-character trust deltas, a trust-gated dialogue beat (minTrust), a choice
 * that clears a flag, and a cipher mini-game. Two endings.
 */
export const SOUR_NOTE: Story = {
  id: "sour-note",
  title: "The Sour Note",
  tagline: "One wrong chord in a dead man's last song.",
  coverImage: "/img/cover-sour-note.jpg",
  startSceneId: "sn_office",
  layout: {
    sn_office: { x: 0, y: 160 },
    sn_club: { x: 420, y: 160 },
    sn_good: { x: 840, y: 0 },
    sn_bad: { x: 840, y: 320 },
  },
  briefing: {
    objective: "Find out who silenced saxophonist Danny Vale — without breaking his sister's trust.",
    winConditions: [
      "Decode the note hidden in the saxophone at The Sour Note.",
      "Keep Lena's trust — she only opens up when she believes you.",
    ],
    loseConditions: [
      "Accuse the wrong person.",
      "Push Lena away before she tells you what she knows.",
    ],
  },
  characters: [
    { id: "lena", name: "Lena Vale", role: "Torch Singer", avatarUrl: "/img/ch-lena.jpg", trustMeter: 0, voice: { pitch: 1.15, rate: 0.88 } },
    { id: "rex", name: "Rex Duval", role: "Club Owner", avatarUrl: "/img/ch-marlow-junior.jpg", trustMeter: 0, voice: { pitch: 0.72, rate: 0.9 } },
  ],
  items: [
    { id: "cipher_note", name: "The Dead Man's Note", icon: "📜", description: "A note in blocky capitals, decoded: THE SOUR NOTE IS IN THE HORN.", flavorText: "A dead man left his last song in a saxophone.", isClue: true },
  ],
  scenes: [
    /* ------------------------------------------------------------ */
    {
      id: "sn_office",
      title: "The Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      particles: "rain",
      prose:
        "Lena Vale arrived with rain on her collar and a headline already written in her eyes. Her brother Danny — saxophonist at The Sour Note — had been dead for two weeks, and the police had already filed it under 'accident.' She said it wasn't. She said he left a note.",
      dialogueBeats: [
        { id: "sno_lena", characterId: "lena", expression: "fragile", text: "They're calling it an accident, detective. Danny didn't trip. Danny had perfect pitch — he never missed a note, and he never missed a step." },
        { id: "sno_confide", characterId: "lena", expression: "confiding", text: "You actually listened. Danny used to hide messages inside the horn of his sax — he said only someone who reads between the notes would ever find them.", conditionRule: { minTrust: { lena: 1 } } },
        { id: "sno_cold", characterId: "lena", expression: "guarded", text: "I've told the police everything. If you're not going to listen, there's nothing more I can give you.", conditionRule: { requiresFlags: ["harsh_start"] } },
      ],
      hotspots: [],
      choices: [
        {
          id: "sno_sultry",
          text: "\"Take your time, Miss Vale. Start with the last song you sang together.\"",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "opening",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["gentle_start"], trustChanges: [{ characterId: "lena", delta: 2 }], meterChanges: [{ meter: "Sultry", delta: 1 }] },
        },
        {
          id: "sno_aggro",
          text: "\"Cut the tears. If you're lying to me, I'll hand you to the bulls myself.\"",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "opening",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["harsh_start"], trustChanges: [{ characterId: "lena", delta: -1 }], meterChanges: [{ meter: "Aggressive", delta: 1 }, { meter: "Suspicion", delta: 1 }] },
        },
        {
          id: "sno_clever",
          text: "\"Walk me through it backwards. What did you hear, and who was listening?\"",
          targetSceneId: "",
          reply: true,
          exclusiveGroup: "opening",
          attitudeTag: "Clever",
          consequences: { setFlags: ["gentle_start"], trustChanges: [{ characterId: "lena", delta: 1 }], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "sno_soften",
          text: "\"Forget how I came on. Start again — gentler.\"",
          targetSceneId: "",
          reply: true,
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["harsh_start"] },
          consequences: { clearFlags: ["harsh_start"], setFlags: ["gentle_start"], trustChanges: [{ characterId: "lena", delta: 2 }] },
        },
        {
          id: "sno_go",
          text: "Head to The Sour Note.",
          targetSceneId: "sn_club",
          hidden: true,
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["gentle_start", "harsh_start"], requiresAll: false },
        },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "sn_club",
      title: "The Sour Note",
      background: "/img/bg-jazz-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      prose:
        "The Sour Note smelled of old smoke and older dreams. Danny's saxophone still hung beside the piano, untouched since the night he died. A torn scrap of paper peeked from inside the horn — and somebody had been here before you.",
      dialogueBeats: [
        { id: "snc_rex", characterId: "rex", expression: "menacing", text: "You're in my club asking about a dead man. Watch your step, gumshoe. The Sour Note keeps its own time." },
      ],
      hotspots: [
        { id: "snc_horn", label: "Examine the paper inside the horn", bounds: { x: 38, y: 30, w: 24, h: 40 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "cipher_note" } },
      ],
      choices: [
        { id: "snc_good", text: "Accuse Rex Duval — the note, the horn, and the timing all point to him.", targetSceneId: "sn_good", attitudeTag: "Clever", gating: { requiresItems: ["cipher_note"] } },
        { id: "snc_bad", text: "Accuse Rex without ever touching the horn.", targetSceneId: "sn_bad", attitudeTag: "Aggressive" },
        { id: "snc_back", text: "Return to the office.", targetSceneId: "sn_office", attitudeTag: "Neutral", isRepeatable: true },
      ],
    },
    /* ------------------------------------------------------------ */
    {
      id: "sn_good",
      title: "The Song Never Ends",
      background: "/img/bg-dressing-note.jpg",
      ambientAudio: "jazz",
      prose:
        "The note inside the horn was Danny's dying testimony — a sour note Rex Duval had been covering up for years. With it, the case closed in a day. Lena sang her brother's last song at the funeral, and for the first time, it came out clean.",
      isEnding: true,
      endingData: { tier: "victory-gold", headline: "DEAD MAN'S NOTE BREAKS THE CASE", recap: "You decoded Danny's message and named his killer." },
    },
    {
      id: "sn_bad",
      title: "The Wrong Chord",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      prose:
        "You accused Rex Duval with nothing but a hunch, and the city smelled blood. The real story stayed inside Danny's saxophone, and Lena Vale walked out of your office for the last time.",
      isEnding: true,
      endingData: { tier: "gameover", headline: "DETECTIVE FINGERS WRONG MAN", recap: "You accused without the note — the truth stayed silent." },
    },
  ],
};
