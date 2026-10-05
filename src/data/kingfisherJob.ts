import type { Story } from "../types";

/**
 * THE KINGFISHER JOB — Jack Morrow × Vera Voss.
 *
 * A compact crossover case built to exercise the 2D-animation systems and
 * the travel map end to end, all at once:
 *
 *  - map.replaceTravelChoices — the map ABSORBS every pure travel choice:
 *    the rail shows "🗺 Open the map" instead of duplicate go-to buttons.
 *    Pins unlock live (the pawnshop from a tip, the pier from a broken lie),
 *    and the moment a pin opens, its matching travel choice vanishes into
 *    the map. Side-effect choices (the reply that earns the tip, the
 *    walk-away ending) are never absorbed — by design.
 *  - character.talkingSheet — Jack and Vera are one-image sprite-sheet
 *    portraits ("talk" mouths while speaking, "rest" otherwise) standing on
 *    either side of every conversation.
 *  - stage.playerSheet — the pawnshop storeroom is a walkable stage node
 *    using the gumshoe walk-cycle sheet.
 *  - foregroundExtra.sheet — the Gilded Kingfisher's neon flickers on a
 *    3-frame loop.
 *  - press-the-lie — Okun's "never saw the brooch" folds to the ledger page
 *    lifted from his own storeroom.
 */
export const KINGFISHER_JOB: Story = {
  id: "kingfisher-job",
  title: "The Kingfisher Job",
  tagline: "Two detectives, one stolen brooch — and a pawnbroker whose ledger remembers better than he does.",
  coverImage: "/img/cover-kingfisher.jpg",
  startSceneId: "kf_office",
  layout: {
    kf_office: { x: 40, y: 220 },
    kf_club: { x: 420, y: 100 },
    kf_pawn: { x: 800, y: 220 },
    kf_storeroom: { x: 800, y: 470 },
    kf_warehouse: { x: 1180, y: 120 },
    kf_end_gold: { x: 1560, y: 40 },
    kf_end_deal: { x: 1560, y: 220 },
    kf_end_cold: { x: 1180, y: 400 },
  },
  briefing: {
    objective: "Find who fenced the Kingfisher brooch — and prove it before the trail goes cold.",
    winConditions: [
      "Earn the tip at the Gilded Kingfisher, then lift Okun's ledger page from his storeroom.",
      "Press Okun's lie with the page and follow the buyer to Pier 9.",
    ],
    loseConditions: ["Walk away from the case with the lie still standing."],
  },
  flagNotes: {
    kf_heard_tip: "The hatcheck girl put the brooch in Okun's Loans on Tuesday night.",
    kf_okun_lie_broken: "Okun's own ledger says he took the Kingfisher — his 'never saw it' is dead.",
  },
  map: {
    title: "Crosstown — The Kingfisher Job",
    backgroundImage: "/img/map-crosstown.jpg",
    // The showcase switch: pure travel choices below are absorbed by these
    // pins the moment each pin is open. One road out — the map.
    replaceTravelChoices: true,
    locations: [
      { id: "kf_loc_office", label: "Morrow & Voss, 4th Floor", targetSceneId: "kf_office", x: 18, y: 66, icon: "🕵️" },
      { id: "kf_loc_club", label: "The Gilded Kingfisher", targetSceneId: "kf_club", x: 46, y: 30, icon: "🍸" },
      {
        id: "kf_loc_pawn",
        label: "Okun's Loans",
        targetSceneId: "kf_pawn",
        x: 72,
        y: 58,
        icon: "🪙",
        gating: { requiresFlags: ["kf_heard_tip"] },
        lockedHint: "Somebody at the Gilded Kingfisher saw where the brooch was hocked.",
      },
      {
        id: "kf_loc_pier",
        label: "Pier 9 Bond Warehouse",
        targetSceneId: "kf_warehouse",
        x: 88,
        y: 84,
        icon: "⚓",
        gating: { requiresFlags: ["kf_okun_lie_broken"] },
        lockedHint: "Break Okun's story and he'll give up where the bird flew.",
      },
    ],
  },
  items: [
    {
      id: "kf_ledger_page",
      name: "Okun's Ledger Page",
      icon: "📖",
      description: "Tuesday's page from the pawn ledger: 'kingfisher pc., blue stones, £ agreed — NO TICKET.'",
      flavorText: "No ticket means no questions. The handwriting, though — that answers plenty.",
    },
  ],
  characters: [
    { id: "narrator", name: "Narrator", role: "V.O.", avatarUrl: "emoji:🎙", trustMeter: 0 },
    {
      id: "kf_jack",
      name: "Jack Morrow",
      role: "Private Detective",
      avatarUrl: "/img/ch-jack-morrow.jpg",
      trustMeter: 0,
      voice: { pitch: 0.72, rate: 0.9 },
      // One-image sprite-sheet portrait: mouth frames 1/2 while talking,
      // frame 0 held at rest. Stands stage-left, facing Vera.
      talkingSheet: {
        image: "/assets/sprites/kf-jack-talk.png",
        frameWidth: 160,
        frameHeight: 384,
        animations: {
          rest: { frames: [0] },
          talk: { frames: [1, 2, 0, 2], fps: 7 },
        },
        pixelated: true,
      },
      talkingX: 22,
      talkingScale: 1.05,
    },
    {
      id: "kf_vera",
      name: "Vera Voss",
      role: "Private Investigator",
      avatarUrl: "/img/ch-vera-voss.jpg",
      trustMeter: 1,
      voice: { pitch: 1.05, rate: 0.95 },
      talkingSheet: {
        image: "/assets/sprites/kf-vera-talk.png",
        frameWidth: 147,
        frameHeight: 384,
        animations: {
          rest: { frames: [0] },
          talk: { frames: [1, 2, 0, 1], fps: 7 },
        },
        pixelated: true,
      },
      // She's drawn facing left; standing stage-right she already faces Jack.
      talkingX: 78,
      talkingScale: 1.02,
    },
    {
      id: "kf_okun",
      name: "Ambrose Okun",
      role: "Pawnbroker & Fence",
      avatarUrl: "emoji:👓",
      trustMeter: -1,
      voice: { pitch: 0.85, rate: 0.85 },
    },
  ],
  scenes: [
    /* ── 1 · THE OFFICE — the hook, and the map takes the wheel ────── */
    {
      id: "kf_office",
      title: "Morrow & Voss, 4th Floor",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "The sign on the door is fresh paint: MORROW & VOSS — CONFIDENTIAL INQUIRIES. Neither of them will say whose name went first on the coin toss. On the desk, between two cold coffees, lies a photograph of the Kingfisher brooch — forty diamonds and one impossible blue stone, lifted from the Blackwood estate a week ago and already growing legends.",
      dialogueBeats: [
        {
          id: "kf_of_b1",
          characterId: "kf_vera",
          text: "The insurance men say it vanished into thin air. Thin air doesn't pay cash, Jack. Somebody FENCED that bird inside the city limits.",
        },
        {
          id: "kf_of_b2",
          characterId: "kf_jack",
          text: "Then somebody's bragging about it by now. Nothing that pretty stays quiet. The Gilded Kingfisher's got the loosest tongues on the strip — poetic, a bird singing about a bird.",
        },
        {
          id: "kf_of_b3",
          characterId: "kf_vera",
          text: "Take the map. The city's small when you know which doors matter — and we're going to open every one of them.",
        },
      ],
      hotspots: [],
      // Pure travel to an open pin — absorbed by the map in play. The rail
      // shows "🗺 Open the map" instead of this button.
      choices: [{ id: "kf_of_go_club", text: "Take the Packard to the Gilded Kingfisher", targetSceneId: "kf_club", attitudeTag: "Neutral" }],
    },

    /* ── 2 · THE CLUB — a tip for a question, neon on a bad tube ───── */
    {
      id: "kf_club",
      title: "The Gilded Kingfisher",
      background: "/img/bg-velvet-lounge.jpg",
      ambientAudio: "jazz",
      cinematic: {
        foregroundExtras: [
          {
            image: "/assets/sprites/club-neon.png",
            sheet: {
              image: "/assets/sprites/club-neon.png",
              frameWidth: 115,
              frameHeight: 256,
              animations: {
                loop: { frames: [0, 0, 0, 1, 0, 0, 2, 0, 1, 0], fps: 7 },
              },
              pixelated: true,
            },
            x: 90,
            y: 42,
            scale: 0.58,
            depth: 0.4,
          },
        ],
      },
      prose:
        "The Gilded Kingfisher runs on gin and gossip, under a neon sign with one tube going bad. The barman polishes a glass that was already clean. Everyone here saw everything, and remembers nothing — until you ask the right way.",
      dialogueBeats: [
        {
          id: "kf_cl_b1",
          characterId: "kf_jack",
          text: "Play it soft. Rooms like this clam up if you flash a licence — but they'll trade a secret for the price of feeling important.",
        },
        {
          id: "kf_cl_b2",
          characterId: "kf_vera",
          conditionRule: { requiresFlags: ["kf_heard_tip"] },
          text: "There it is. The hatcheck girl watched a runner carry a bird-shaped piece into OKUN'S LOANS on Tuesday night — wrapped in a bar towel, no ticket written. The map just grew a new address, Jack.",
        },
      ],
      hotspots: [],
      choices: [
        // A reply with consequences — the kind the map must NEVER absorb.
        {
          id: "kf_cl_ask",
          text: "Buy the hatcheck girl a drink and ask about the brooch",
          reply: true,
          attitudeTag: "Sultry",
          consequences: { setFlags: ["kf_heard_tip"] },
        },
        // Gated pure travel: visible-but-locked until the tip lands, and the
        // instant the flag sets, the pawnshop PIN opens too — so this button
        // is absorbed by the map at the exact moment it becomes usable.
        {
          id: "kf_cl_go_pawn",
          text: "Head to Okun's Loans",
          targetSceneId: "kf_pawn",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["kf_heard_tip"] },
        },
      ],
    },

    /* ── 3 · THE PAWNSHOP — Okun's lie, and the walk-away out ──────── */
    {
      id: "kf_pawn",
      title: "Okun's Loans",
      background: "/img/bg-mini-mart.jpg",
      ambientAudio: "tension",
      prose:
        "Okun's Loans smells of camphor and other people's bad years. Ambrose Okun looks up over half-moon glasses with the practised calm of a man who has rehearsed his surprise. Behind him, a bead curtain clicks over the storeroom doorway.",
      dialogueBeats: [
        {
          id: "kf_pw_b1",
          characterId: "kf_okun",
          text: "Detectives. I'm honoured — and puzzled. We deal in wedding rings and war medals here, not headlines.",
        },
        {
          id: "kf_pw_b2",
          characterId: "kf_okun",
          text: "The Kingfisher? Never laid eyes on it. No bird, no blue stone, nothing of the kind has ever crossed this counter — my ledger would show it, and my ledger is a Bible.",
          lie: {
            claim: "Okun swears the Kingfisher brooch never crossed his counter — and that his ledger proves it.",
            evidenceItemIds: ["kf_ledger_page"],
            contradictedFlag: "kf_okun_lie_broken",
            caughtBeat: {
              id: "kf_pw_caught",
              characterId: "kf_okun",
              conditionRule: { requiresFlags: ["kf_okun_lie_broken"] },
              text: "He reads his own handwriting like it's a death notice. \"…Tuesday. No ticket.\" The calm drains out through his shoes. \"It flew, all right? Same night. A bonded man from PIER 9 paid cash and carried it out in a cigar box. That's all I know — and you didn't hear the pier from me.\"",
            },
            wrongBeat: {
              id: "kf_pw_wrong",
              characterId: "kf_okun",
              text: "\"That,\" he says, not even leaning in, \"is not evidence. That is enthusiasm. Come back when you can put the bird BEHIND this counter — or buy something, we have lovely medals.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "kf_okun", delta: -1 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Ambrose Okun knows his own ledger just called him a liar.",
          },
        },
        {
          id: "kf_pw_b3",
          characterId: "kf_vera",
          text: "A Bible, he says. Then he won't mind us checking the scripture. That bead curtain isn't a wall, Jack — and I can keep a pawnbroker talking about medals for HOURS.",
        },
      ],
      hotspots: [],
      choices: [
        // Pure travel to a scene that is NOT a map pin — never absorbed, so
        // the storeroom stays a deliberate on-the-spot decision.
        {
          id: "kf_pw_storeroom",
          text: "Slip through the bead curtain while Vera holds him",
          targetSceneId: "kf_storeroom",
          attitudeTag: "Clever",
        },
        // Hidden until the lie breaks — and the Pier 9 pin opens on the same
        // flag, so the map absorbs this the instant it would appear.
        {
          id: "kf_pw_go_pier",
          text: "Follow the cigar box to Pier 9",
          targetSceneId: "kf_warehouse",
          attitudeTag: "Aggressive",
          hidden: true,
          gating: { requiresFlags: ["kf_okun_lie_broken"] },
        },
        // The always-open cold exit — carries an ending, never absorbed.
        {
          id: "kf_pw_walk",
          text: "Drop the case — some birds stay lost",
          targetSceneId: "kf_end_cold",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ── 4 · THE STOREROOM — walkable stage, gumshoe sheet ─────────── */
    {
      id: "kf_storeroom",
      title: "The Storeroom Ledger",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      nodeType: "stage",
      stage: {
        playerImage: "emoji:🕵️", // fallback if the sheet fails to load
        playerSheet: {
          image: "/assets/sprites/gumshoe-walk.png",
          frameWidth: 114,
          frameHeight: 192,
          animations: {
            idle: { frames: [1] },
            walk: { frames: [0, 1, 2, 3], fps: 8 },
          },
          pixelated: true,
        },
        spawn: { x: 12, y: 86 },
        speed: 22,
        reach: 5,
        keyboard: true,
        floor: { top: 60, bottom: 93 },
        depthScale: 0.32,
        hints: "proximity",
        enterCaption:
          "Vera's voice drifts through the beads — 'now THIS medal, Mr Okun…' — buying minutes. The storeroom is shelves, dust, and one ledger too proud of itself.",
      },
      prose: "",
      dialogueBeats: [],
      hotspots: [
        {
          id: "kf_st_ledger",
          label: "The pawn ledger, open on the desk",
          bounds: { x: 42, y: 52, w: 15, h: 20 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "kf_ledger_page" },
        },
        {
          id: "kf_st_crates",
          label: "A crate stencilled BLACKWOOD ESTATE — SUNDRIES",
          bounds: { x: 68, y: 48, w: 16, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Sundries. Sure. The crate's nailed shut, but the stencil alone says Okun's counter has seen plenty of 'nothing of the kind.'",
          },
        },
        {
          id: "kf_st_door",
          label: "Back through the bead curtain",
          bounds: { x: 88, y: 66, w: 10, h: 24 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "kf_pawn" },
        },
      ],
      choices: [],
    },

    /* ── 5 · PIER 9 — the bird in the cigar box ────────────────────── */
    {
      id: "kf_warehouse",
      title: "Pier 9 Bond Warehouse",
      background: "/img/bg-docks.jpg",
      ambientAudio: "rain",
      prose:
        "Pier 9 after midnight is all rope-creak and harbour fog. The bonded man's 'office' is a packing crate with a lamp on it, and in the lamplight sits a cigar box that never held a cigar. Forty diamonds and one impossible blue stone catch the light like they're pleased to see you.",
      dialogueBeats: [
        {
          id: "kf_wh_b1",
          characterId: "kf_jack",
          text: "There she is. You know what the fence's fence was going to do? Ship it out under a bond seal marked MACHINE PARTS. The brooch would've been in Lisbon by Friday.",
        },
        {
          id: "kf_wh_b2",
          characterId: "kf_vera",
          text: "So here's the whole case in one cigar box, Jack. The Blackwoods' insurers will pay the finder's fee, no questions. Or the precinct gets a parcel and Okun gets a cell. Your coin toss this time.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "kf_wh_turn_in", text: "Take the bird and the ledger page to the precinct", targetSceneId: "kf_end_gold", attitudeTag: "Clever" },
        { id: "kf_wh_fee", text: "Quiet finder's fee — the insurers ask nothing", targetSceneId: "kf_end_deal", attitudeTag: "Sultry" },
      ],
    },

    /* ── ENDINGS ────────────────────────────────────────────────────── */
    {
      id: "kf_end_deal",
      title: "Case Closed — Quiet Money",
      isEnding: true,
      background: "/img/bg-end-vanish.jpg",
      ambientAudio: "rain",
      prose:
        "The insurers pay in a hotel lobby, in an envelope thick enough to be a novel. No names, no report, no cell for Okun — the bird goes home the polite way, and the city never learns it left. It's good money. It spends a little heavy, is all.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-silver",
        headline: "QUIET MONEY",
        recap:
          "The brooch made it home and the fee cleared — but Okun keeps his counter, the bonded man keeps his pier, and the next stolen legend will move through the same quiet doors. You solved the theft. The machine's still running.",
      },
    },
    {
      id: "kf_end_gold",
      title: "Case Closed — The Ledger and the Bird",
      isEnding: true,
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose:
        "The desk sergeant whistles when the cigar box opens. Okun's ledger page does the talking; the brooch just sits there being famous. By morning the Blackwoods have their bird, the city has its story, and the fresh paint on the office door has its first framed clipping. Vera pins it up. Jack straightens it. Neither admits to smiling.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE LEDGER AND THE BIRD",
        recap:
          "You worked the room, not the suspect: a tip traded at the club, a page lifted under the fence's nose, and his own 'Bible' quoted back to him. Okun's lie broke on paper, the map grew a pier, and the Kingfisher went home in an evidence bag with both your names on the report.",
      },
    },
    {
      id: "kf_end_cold",
      title: "Case Closed — Some Birds Stay Lost",
      isEnding: true,
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "rain",
      prose:
        "The rain takes the street back. Somewhere behind a bead curtain a ledger closes, and somewhere past the harbour a bond seal dries over a box marked MACHINE PARTS. The Kingfisher is a rumour by Friday and a legend by spring — and legends never come home.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "SOME BIRDS STAY LOST",
        recap:
          "You walked while Okun's lie was still standing. The evidence was one bead curtain away, the pier one pressed contradiction — the map only shows the doors you've earned, and you left two of them shut.",
      },
    },
  ],
};
