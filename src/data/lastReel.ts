import type { Story } from "../types";

/**
 * A deliberately small, fully traced case used as the new flagship experience.
 * Every scene has one job, every required item has one source, and every ending
 * is reachable without grinding meters or revisiting dialogue.
 */
export const LAST_REEL: Story = {
  id: "last-reel",
  title: "Murder on the Last Reel",
  tagline: "A missing film, a dead projectionist, and one final frame that names the killer.",
  coverImage: "/img/bg-club.jpg",
  startSceneId: "reel_office",
  layout: {
    reel_office: { x: 0, y: 180 },
    reel_lobby: { x: 360, y: 180 },
    reel_backstage: { x: 720, y: 180 },
    reel_projection: { x: 1080, y: 180 },
    reel_confront: { x: 1440, y: 180 },
    reel_win: { x: 1800, y: 20 },
    reel_silver: { x: 1800, y: 220 },
    reel_loss: { x: 1800, y: 420 },
  },
  briefing: {
    objective: "Recover the missing final reel and prove who murdered projectionist Leo Crane before the midnight premiere.",
    winConditions: [
      "Get backstage using the press pass or Iris's help.",
      "Reconstruct the scattered contact sheet in the dressing room.",
      "Decode the projection-room payment ledger.",
      "Connect both clues on the corkboard, then accuse Max Mercer.",
    ],
    loseConditions: [
      "Accuse Iris without connecting the evidence.",
      "Let Suspicion reach 6 — Max's security removes you from the theater.",
      "Walk away with only the ledger and leave the murder unproven.",
    ],
    heatLimit: 6,
    heatFailSceneId: "reel_loss",
  },
  characters: [
    {
      id: "iris",
      name: "Iris Vale",
      role: "The Main Actress",
      avatarUrl: "/img/ch-vivienne.png",
      trustMeter: 0,
      voice: { pitch: 1.1, rate: 0.88 },
    },
    {
      id: "max",
      name: "Max Mercer",
      role: "Studio Producer",
      avatarUrl: "/img/ch-rocco.png",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.92 },
    },
  ],
  items: [
    {
      id: "press_pass",
      name: "Midnight Press Pass",
      icon: "🎟️",
      description: "A reporter's pass for the midnight premiere. It opens the backstage corridor once.",
      flavorText: "Cardboard authority with a red velvet string.",
    },
    {
      id: "contact_sheet",
      name: "Reconstructed Contact Sheet",
      icon: "📸",
      description: "Frames show Iris meeting Leo — and Max watching from behind the scenery.",
      flavorText: "A photograph never forgets who stood just outside the frame.",
      isClue: true,
    },
    {
      id: "payment_ledger",
      name: "Decoded Payment Ledger",
      icon: "📒",
      description: "Max paid Leo to destroy the final reel, then paid him again to keep quiet.",
      flavorText: "Two payments. One corpse. Very poor accounting.",
      isClue: true,
    },
  ],
  deduction: {
    suspectIds: ["iris", "max"],
    connections: [
      {
        a: "contact_sheet",
        b: "iris",
        flagSet: "iris_witnessed_max",
        revelation: "Iris was not Leo's killer — the frames show her looking past him at Max in the wings.",
      },
      {
        a: "payment_ledger",
        b: "max",
        flagSet: "max_paid_leo",
        revelation: "Max's coded payments prove motive, opportunity, and the attempt to erase the final reel.",
      },
    ],
  },
  scenes: [
    {
      id: "reel_office",
      title: "Act I — The Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "Iris Vale arrived ten minutes before midnight with rain on her coat and fear under the makeup. The final reel of her new picture was missing. So was Leo Crane, the projectionist — until the police found him cooling beside the projector.",
      dialogueBeats: [
        {
          id: "ro1",
          characterId: "iris",
          expression: "controlled panic",
          text: "The reel shows something Max never wanted screened. Find it before the premiere, detective. Find it before he decides I'm the next scene to cut.",
        },
      ],
      hotspots: [
        {
          id: "ro_pass",
          label: "Press pass on the desk",
          bounds: { x: 12, y: 64, w: 18, h: 15 },
          cursor: "take",
          action: { type: "giveItem", itemGranted: "press_pass" },
        },
      ],
      choices: [
        {
          id: "ro_go",
          text: "Head to the Meridian Theater. The premiere clock is already ticking.",
          targetSceneId: "reel_lobby",
          attitudeTag: "Neutral",
        },
      ],
    },
    {
      id: "reel_lobby",
      title: "Act I — Theater Lobby",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      prose:
        "The Meridian lobby glittered like a lie told under expensive lighting. Max Mercer guarded the backstage corridor while flashbulbs popped around him.",
      dialogueBeats: [
        {
          id: "rl1",
          characterId: "max",
          expression: "pleasantly hostile",
          text: "Theater's closed to freelancers. Enjoy the lobby, enjoy the posters, and keep your curiosity where I can see it.",
        },
        {
          id: "rl2",
          characterId: "iris",
          expression: "decisive",
          text: "He's with me, Max. Unless you'd rather explain to the press why your leading lady is afraid to go backstage alone.",
        },
      ],
      hotspots: [
        {
          id: "rl_door",
          label: "Backstage corridor — show the pass",
          bounds: { x: 78, y: 30, w: 16, h: 48 },
          cursor: "go",
          gating: { requiresItems: ["press_pass"] },
          action: { type: "useItem", itemConsumed: "press_pass", targetSceneId: "reel_backstage" },
          customFailMessage: "Max blocks the corridor. You need the press pass — or Iris to make a scene.",
        },
      ],
      choices: [
        {
          id: "rl_vouch",
          text: "Ask Iris to make Max admit you backstage. (+1 Suspicion)",
          targetSceneId: "reel_backstage",
          attitudeTag: "Sultry",
          gating: { excludesItems: ["press_pass"] },
          consequences: {
            setFlags: ["iris_vouched"],
            meterChanges: [{ meter: "Suspicion", delta: 1 }],
            trustChanges: [{ characterId: "iris", delta: 1 }],
          },
        },
      ],
    },
    {
      id: "reel_backstage",
      title: "Act II — Dressing Room",
      background: "/img/bg-dressing.jpg",
      ambientAudio: "drone",
      prose:
        "Leo's contact prints had been torn from their clips and scattered across Iris's vanity. Someone wanted the sequence forgotten. The order of the frames would tell a different story.",
      hotspots: [
        {
          id: "rb_sheet",
          label: "Reassemble the torn contact prints on the vanity",
          bounds: { x: 30, y: 34, w: 24, h: 34 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "contact_sheet" },
        },
      ],
      choices: [
        {
          id: "rb_continue",
          text: "Take the completed contact sheet to the projection room.",
          targetSceneId: "reel_projection",
          attitudeTag: "Clever",
          gating: { requiresItems: ["contact_sheet"] },
        },
      ],
    },
    {
      id: "reel_projection",
      title: "Act II — Projection Room",
      background: "/img/bg-office.jpg",
      ambientAudio: "tension",
      prose:
        "The projector still turned with no film in its gate. Beside Leo's chair sat a ledger written in a schoolboy cipher — the kind a powerful man mistakes for secrecy.",
      hotspots: [
        {
          id: "rp_ledger",
          label: "Read the cipher ledger beside Leo's chair",
          bounds: { x: 40, y: 42, w: 24, h: 34 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "payment_ledger" },
        },
      ],
      choices: [
        {
          id: "rp_continue",
          text: "Carry the decoded ledger downstairs and confront them both.",
          targetSceneId: "reel_confront",
          attitudeTag: "Clever",
          gating: { requiresItems: ["payment_ledger"] },
        },
        {
          id: "rp_back",
          text: "Return to the dressing room for the missing photo sequence.",
          targetSceneId: "reel_backstage",
          attitudeTag: "Neutral",
          gating: { excludesItems: ["contact_sheet"] },
        },
      ],
    },
    {
      id: "reel_confront",
      title: "Act III — The Midnight Premiere",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "tension",
      prose:
        "The house lights dimmed. Iris stood beneath the screen; Max stood beside the exit. You had one minute before the audience arrived and one accusation before somebody walked.",
      dialogueBeats: [
        {
          id: "rc1",
          characterId: "max",
          expression: "cold",
          text: "You found some photographs and a book of numbers. That isn't a case. That's clutter.",
        },
        {
          id: "rc2",
          characterId: "iris",
          expression: "steady",
          text: "Put the pieces together, detective. Then say the name where everyone can hear it.",
        },
      ],
      hotspots: [
        {
          id: "rc_board",
          label: "Open the corkboard and connect the evidence",
          bounds: { x: 42, y: 18, w: 18, h: 20 },
          cursor: "use",
          isRepeatable: true,
          action: { type: "openBoard" },
        },
      ],
      choices: [
        {
          id: "rc_max",
          text: "Accuse Max Mercer: the photographs place him there and the ledger proves he paid Leo.",
          targetSceneId: "reel_win",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["iris_witnessed_max", "max_paid_leo"] },
          consequences: { meterChanges: [{ meter: "Clever", delta: 2 }] },
        },
        {
          id: "rc_deal",
          text: "Use the ledger to force Max out, but leave Leo's murder unproven.",
          targetSceneId: "reel_silver",
          attitudeTag: "Aggressive",
          gating: { requiresItems: ["payment_ledger"] },
        },
        {
          id: "rc_iris",
          text: "Accuse Iris because she met Leo in secret. (No proof — dangerous.)",
          targetSceneId: "reel_loss",
          attitudeTag: "Neutral",
        },
        {
          id: "rc_retreat",
          text: "Not yet. Return to the projection room and finish the evidence.",
          targetSceneId: "reel_projection",
          attitudeTag: "Neutral",
        },
      ],
    },
    {
      id: "reel_win",
      title: "The Final Frame",
      background: "/img/bg-penthouse.jpg",
      ambientAudio: "jazz",
      prose:
        "The contact sheet put Max behind Leo. The ledger put money in Leo's hand. When the missing reel flickered onto the screen, Max's confession arrived one frame too late. Iris took her bow. The police took Max's wrists.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "PRODUCER EXPOSED IN MIDNIGHT MURDER — FINAL REEL TELLS ALL",
        recap: "You completed both investigations, connected both clues, and named the killer with proof.",
      },
    },
    {
      id: "reel_silver",
      title: "A Picture Without an Ending",
      background: "/img/bg-club.jpg",
      ambientAudio: "rain",
      prose:
        "The ledger ended Max's career, but without the photographs the D.A. could not pin Leo's death on him. Iris survived the premiere. The killer survived the night. Half a case is still half a failure.",
      isEnding: true,
      endingData: {
        tier: "victory-silver",
        headline: "STUDIO BOSS RESIGNS — PROJECTIONIST MURDER REMAINS OPEN",
        recap: "You removed the threat, but did not prove the murder. Use the corkboard next time.",
      },
    },
    {
      id: "reel_loss",
      title: "The Wrong Name",
      background: "/img/bg-alley.jpg",
      ambientAudio: "tension",
      prose:
        "You named Iris with no evidence. Max applauded, security opened the door, and the real killer walked into the rain behind you. By sunrise, every paper in town had your photograph — under the word FRAUD.",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "DETECTIVE ACCUSES STAR, REAL KILLER TAKES FINAL BOW",
        recap: "You accused before connecting the evidence. The Case File told you exactly what proof was required.",
      },
    },
  ],
};