import type { Story } from "../types";
import type { PatternPuzzleConfig } from "../game/PatternPuzzleTypes";

/**
 * PATTERN PUZZLE DEMO — a tiny smoke-test case for the ledger mini-game.
 *
 * Purpose: open Studio, pick this case, hit "Play draft", and exercise every
 * code path of the pattern puzzle from one screen:
 *
 *   · Hotspot A — "Open the bank ledger" — a RETRY puzzle. Get it wrong and the
 *     wrongMessage flashes; flag the three embezzlement withdrawals and it pays
 *     off, grants a clue (+1 Deduce), sets a flag and routes to the gold ending.
 *   · Hotspot B — "Decode the cipher note" — a ONE-SHOT puzzle (retry OFF).
 *     Solve it → routes to the gold ending. Get it wrong and there's no second
 *     chance: +2 Heat is applied and the player is routed to the game-over ending.
 *
 * Both puzzles also prove the graph fix: a patternPuzzle hotspot's solve / fail
 * routes are real scene edges, so the validator no longer flags this scene as
 * having "no exits" and the canvas draws the branches.
 *
 * Exercises: patternPuzzle hotspot action, PatternPuzzleConfig (rows, answers,
 * targetCount auto-sync, payoffText, allowRetry, wrongMessage,
 * rewardConsequences, wrongSubmissionConsequences, targetSceneId,
 * wrongTargetSceneId) and the solve/fail consequence application in Game.tsx.
 */

/** Three near-$10k withdrawals to the same bank, across three branches in one
 *  month — someone draining the account before the audit. Retry allowed. */
const BANK_LEDGER: PatternPuzzleConfig = {
  title: "Acme Cartage — Bank Statements",
  instruction: "Flag the three withdrawals that don't belong — the ones that share a hidden pattern.",
  targetCount: 3,
  rows: [
    { id: "bk1", date: "Aug 02", description: "Payroll — Acme Cartage", amount: "$4,200", isAnswer: false },
    { id: "bk2", date: "Aug 06", description: "Blackwood First Nat'l — Main", amount: "-$9,800", isAnswer: true },
    { id: "bk3", date: "Aug 12", description: "Rent — 5th & Vine", amount: "$1,500", isAnswer: false },
    { id: "bk4", date: "Aug 19", description: "Blackwood First Nat'l — West", amount: "-$9,750", isAnswer: true },
    { id: "bk5", date: "Aug 24", description: "City Water & Light", amount: "$318", isAnswer: false },
    { id: "bk6", date: "Aug 28", description: "Blackwood First Nat'l — East", amount: "-$9,900", isAnswer: true },
  ],
  payoffText:
    "Three branches. Three days. Just under ten grand each, every time. Someone was bleeding the account dry before the auditors landed — and the signature on every slip is the same.",
  allowRetry: true,
  wrongMessage: "Those don't sing together. Three of these withdrawals share a shape — same bank, same week, same size.",
  rewardConsequences: {
    setFlags: ["ppd_bank_cracked"],
    addItems: ["ppd_bank_statement"],
    meterChanges: [{ meter: "Clever", delta: 1 }],
  },
  targetSceneId: "ppd_solved",
};

/** Two consonant-only trigrams — dead-drop map grid references. One shot only:
 *  a wrong submission is narratively final (Heat + route to game-over). */
const CIPHER_NOTE: PatternPuzzleConfig = {
  title: "The Cipher Note",
  instruction: "Flag the two trigrams with NO vowels — the dead-drop codes hidden among the decoys.",
  targetCount: 2,
  rows: [
    { id: "cf1", date: "07", description: "DRK", amount: "—", isAnswer: true },
    { id: "cf2", date: "13", description: "AEL", amount: "—", isAnswer: false },
    { id: "cf3", date: "21", description: "QXM", amount: "—", isAnswer: true },
    { id: "cf4", date: "34", description: "OUI", amount: "—", isAnswer: false },
    { id: "cf5", date: "48", description: "EFG", amount: "—", isAnswer: false },
  ],
  payoffText:
    "DRK. QXM. The consonant-only trigrams aren't initials — they're map grid references. Two dead drops, two names the client never wanted found.",
  allowRetry: false,
  wrongMessage: "Wrong — and there are no second chances with a cipher. The note burns.",
  rewardConsequences: {
    setFlags: ["ppd_cipher_cracked"],
    meterChanges: [{ meter: "Clever", delta: 1 }],
  },
  wrongSubmissionConsequences: {
    meterChanges: [{ meter: "Suspicion", delta: 2 }],
  },
  targetSceneId: "ppd_solved",
  wrongTargetSceneId: "ppd_failed",
};

export const PATTERN_PUZZLE_DEMO: Story = {
  id: "pattern-puzzle-demo",
  title: "Pattern Puzzle Demo",
  tagline: "Two ledgers. One truth in the numbers. Flag the pattern before the trail goes cold.",
  coverImage: "gradient:linear-gradient(160deg,#0b1a24 0%,#1a0f22 55%,#07070c 100%)",
  startSceneId: "ppd_start",
  layout: {
    ppd_start: { x: 0, y: 220 },
    ppd_ledger: { x: 420, y: 220 },
    ppd_solved: { x: 860, y: 80 },
    ppd_failed: { x: 860, y: 420 },
  },
  briefing: {
    objective: "Crack either ledger in the basement — the bank statements or the cipher note — to close the case.",
    winConditions: [
      "Solve the bank ledger (flag the three embezzlement withdrawals).",
      "OR solve the cipher note (flag the two consonant-only trigrams).",
    ],
    loseConditions: [
      "Fail the one-shot cipher note — a wrong guess ends the case.",
    ],
  },
  characters: [],
  items: [
    {
      id: "ppd_bank_statement",
      name: "Bank Statement",
      icon: "🧾",
      description: "Three slips from three branches of the same bank, all just under ten grand.",
      flavorText: "Whoever forged these was in a hurry — and almost careful enough.",
      isClue: true,
    },
  ],
  scenes: [
    {
      id: "ppd_start",
      title: "The Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "drone",
      prose:
        "The client's file lands on your desk with a thud: two ledgers, both pulled from the basement of Acme Cartage. The numbers don't add up — somewhere in those columns is the proof. You take the stairs down.",
      choices: [
        { id: "ppd_go_down", text: "Head down to the basement ledger room.", targetSceneId: "ppd_ledger", attitudeTag: "Clever" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "ppd_ledger",
      title: "The Basement Ledger Room",
      background: "/img/bg-basement.jpg",
      ambientAudio: "tension",
      prose:
        "A bare bulb swings over a steel table. Two things sit on it: a thick sheaf of bank statements, and a torn cipher note weighted down with a brass slug. Crack either one and the case breaks open. Choose what to examine.",
      choices: [],
      hotspots: [
        {
          id: "ppd_hs_bank",
          label: "Open the bank ledger",
          bounds: { x: 14, y: 30, w: 34, h: 38 },
          cursor: "look",
          isRepeatable: false,
          action: { type: "patternPuzzle", patternPuzzle: BANK_LEDGER },
        },
        {
          id: "ppd_hs_cipher",
          label: "Decode the cipher note",
          bounds: { x: 54, y: 30, w: 32, h: 38 },
          cursor: "look",
          isRepeatable: false,
          action: { type: "patternPuzzle", patternPuzzle: CIPHER_NOTE },
        },
      ],
      dialogueBeats: [],
    },
    {
      id: "ppd_solved",
      title: "Case Closed — Cracked",
      isEnding: true,
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      prose: "The numbers finally sing. The pattern was there all along — you just had to hear it.",
      endingData: {
        tier: "victory-gold",
        headline: "THE PATTERN BREAKS",
        recap:
          "You read the ledgers the way the forger wrote them. The withdrawals, the trigrams, the shape of the crime — it all lined up, and the client walked away with the truth.",
      },
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "ppd_failed",
      title: "Case Closed — Burned",
      isEnding: true,
      background: "/img/bg-endgame.jpg",
      ambientAudio: "drone",
      prose: "The cipher note curls black at the edges and crumbles. You had one read, and you misread it.",
      endingData: {
        tier: "gameover",
        headline: "THE TRAIL GOES COLD",
        recap:
          "A wrong guess on a one-shot cipher costs the case. The dead drops stay buried, the forger walks, and the city files another mystery no one will ever solve.",
      },
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
