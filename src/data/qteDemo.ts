import type { Story } from "../types";

/**
 * QUICK-TIME DEMO — a tiny smoke-test case for the quick-time prompt system.
 *
 * Purpose: let an author open Studio, pick this case, and hit "Play draft" to
 * immediately see a working QTE — the big "STOP HIM!" banner, the countdown
 * ring around the choice button, the numbered ring (no longer masked out), the
 * ⏱ seconds read-out, and — as the clock dips — the heartbeat + shaking camera.
 *
 * It also demonstrates the "you hesitated" consequence branch: let the clock
 * expire and you're routed to the consequence scene with +2 Suspicion instead
 * of silently losing the choice. Three endings (gold / silver / game-over) keep
 * the validator happy.
 *
 * Exercises: quickTime + timeLimitSeconds + qtePrompt + qteHeartbeat +
 * qteShakyCam + rememberLine + timedOutTargetSceneId + timedOutConsequences,
 * alongside plain navigation choices so the ring/plain-number contrast is
 * visible on the same screen.
 */
export const QTE_DEMO: Story = {
  id: "qte-demo",
  title: "Quick-Time Demo",
  tagline: "Five seconds to do the right thing. Hesitate and the city pays.",
  coverImage: "gradient:linear-gradient(160deg,#07111e 0%,#1d0c22 55%,#07070c 100%)",
  startSceneId: "qd_start",
  layout: {
    qd_start: { x: 0, y: 200 },
    qd_qte: { x: 400, y: 200 },
    qd_hesitate: { x: 400, y: 560 },
    qd_win_gold: { x: 800, y: 40 },
    qd_win_silver: { x: 800, y: 240 },
    qd_lose: { x: 800, y: 440 },
  },
  briefing: {
    objective: "Stop the masked man before he reaches the door — or live with the consequences.",
    winConditions: [
      "Beat the clock and stop him (gold ending).",
      "Let him slip but salvage the case (silver ending).",
    ],
    loseConditions: [
      "Run instead of acting (game over).",
      "Let the clock run out and then make the wrong call (game over).",
    ],
  },
  characters: [],
  items: [],
  scenes: [
    {
      id: "qd_start",
      title: "Dead End",
      background: "gradient:linear-gradient(135deg,#0c0c14 0%,#2b2b3f 100%)",
      ambientAudio: "tension",
      prose:
        "Rain hammers the alley as the whistle blows. A masked man bolts from the pawn shop, a satchel of stolen names under his arm. The door to the street is ten paces ahead — and so are you.",
      choices: [
        { id: "qd_to_showdown", text: "Give chase → the warehouse.", targetSceneId: "qd_qte", attitudeTag: "Clever" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "qd_qte",
      title: "The Showdown",
      background: "gradient:linear-gradient(135deg,#1e1b4b 0%,#831843 100%)",
      ambientAudio: "tension",
      prose:
        "He skids to a stop at the warehouse door, hand on the latch. The satchel is in the air. You have a split second to decide — the clock is already running.",
      choices: [
        {
          id: "qd_grab",
          text: "Stop him before he reaches the door.",
          quickTime: true,
          qtePrompt: "STOP HIM!",
          timeLimitSeconds: 6,
          qteHeartbeat: true,
          qteShakyCam: true,
          rememberLine: "The crowd will remember that.",
          targetSceneId: "qd_win_gold",
          attitudeTag: "Clever",
          timedOutTargetSceneId: "qd_hesitate",
          timedOutConsequences: { meterChanges: [{ meter: "Suspicion", delta: 2 }] },
        },
        { id: "qd_slow", text: "Let him go — follow the trail instead.", targetSceneId: "qd_win_silver", attitudeTag: "Neutral" },
        { id: "qd_run", text: "Run. This isn't worth it.", targetSceneId: "qd_lose", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "qd_hesitate",
      title: "You Hesitated",
      background: "gradient:linear-gradient(160deg,#713f12 0%,#0c0c14 70%)",
      ambientAudio: "drone",
      prose:
        "The clock ran out. The door slams and the man is gone — but the city is watching. Somewhere, a phone rings. The case is still salvageable, but only if you steady yourself (+2 Suspicion from the hesitation).",
      choices: [
        { id: "qd_hes_chase", text: "Pick up the trail — it's not over.", targetSceneId: "qd_win_silver", attitudeTag: "Clever" },
        { id: "qd_hes_give", text: "Let the quiet swallow it.", targetSceneId: "qd_lose", attitudeTag: "Neutral" },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "qd_win_gold",
      title: "Case Closed — Gold",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#134e4a 0%,#312e81 100%)",
      prose: "You moved before the second hand did.",
      endingData: {
        tier: "victory-gold",
        headline: "STOPPED AT THE DOOR",
        recap: "You took the shot on instinct — the man dropped, the names are safe, and the city never knew how close it came.",
      },
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "qd_win_silver",
      title: "Case Closed — Silver",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#0c0c14 0%,#2b2b3f 100%)",
      prose: "Not the clean save — but a save.",
      endingData: {
        tier: "victory-silver",
        headline: "THE TRAIL LEADS ON",
        recap: "He got away, but the names in the satchel led you to the real cutpurse. A messier win is still a win.",
      },
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "qd_lose",
      title: "Case Closed — Bust",
      isEnding: true,
      background: "gradient:linear-gradient(135deg,#07070c 0%,#14141f 100%)",
      prose: "Some doors you only get one chance at.",
      endingData: {
        tier: "gameover",
        headline: "THE CITY CLOSES IN",
        recap: "You turned away — and the trail went cold. The stolen names keep the city in someone's pocket, and the whistle means nothing now.",
      },
      hotspots: [],
      dialogueBeats: [],
    },
  ],
};
