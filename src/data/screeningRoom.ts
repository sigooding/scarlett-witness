import type { Story } from "../types";

/**
 * THE SCREENING ROOM — the pre-flight check.
 *
 * A deliberately tiny case whose only job is to prove the projector is ready
 * before a real reel goes in: run it top to bottom and every load-bearing
 * system has to work at once. Four scenes, two minutes.
 *
 * What each station proves:
 *  · TEST PATTERN  — the dialogue panel holding one fixed height from the
 *    first character (the beats here are LONGER than anything in the flagship
 *    or the draft, on purpose: if the box so much as trembles, it's broken);
 *    reply choices with an exclusive group; a HIDDEN choice revealed by a
 *    reply's flag; a clue hotspot with showItemImage (and the end-of-scene
 *    investigation nudge pointing at it); a per-beat replacement background
 *    with an iris-in; a looping track that has to hand OFF hard at the cut.
 *  · COUNTDOWN     — the music hard-cut (0.0s hand-off); a quick-time prompt
 *    with heartbeat + shaky cam and a real "you hesitated" expiry route; a
 *    "will remember that" card.
 *  · PICTURE START — the gold ending tier.
 *  · SPLICED       — the game-over tier via the timed-out target.
 */
export const SCREENING_ROOM: Story = {
  id: "screening-room",
  title: "The Screening Room",
  tagline: "Two minutes of test pattern. If this reel runs clean, ship the picture.",
  coverImage: "gradient:linear-gradient(160deg,#0b0d10 0%,#14181f 45%,#050608 100%)",
  startSceneId: "sr_pattern",
  briefing: {
    objective: "Run the reel. Every station has to pass: the panel, the hand-off, the clock, the ending.",
    winConditions: ["Thread the projection test.", "Beat the countdown."],
    loseConditions: ["Let the clock run out."],
  },
  layout: {
    sr_pattern: { x: 0, y: 200 },
    sr_countdown: { x: 400, y: 200 },
    sr_end_gold: { x: 760, y: 80 },
    sr_end_splice: { x: 760, y: 380 },
  },
  items: [
    {
      id: "sr_reel",
      name: "The Test Reel",
      icon: "🎞",
      description: "Leader, count-down, then two minutes of bars. If it runs clean, the projector's ready.",
      flavorText: "Picture start.",
      isClue: true,
    },
  ],
  characters: [
    { id: "projectionist", name: "The Projectionist", role: "Runs the booth. Seen every reel twice.", avatarUrl: "emoji:🎥", trustMeter: 0 },
  ],
  scenes: [
    {
      id: "sr_pattern",
      title: "Test Pattern",
      background: "/img/nw2/bg-poolhall.jpg",
      ambientAudio: "drone",
      // This track must hand OFF hard at the countdown (fade 0) — if you can
      // still hear it one second into the next scene, the hand-off is broken.
      musicMode: "track",
      musicUrl: "/Soundtrack.mp3",
      cinematic: {
        mode: "static",
        dimAmount: 0.3,
        lights: [{ x: 50, y: 16, color: "#dff3ff", intensity: 0.3, size: 34, pulseSeconds: 4.4, pulseAmount: 0.3 }],
      },
      prose:
        "The booth smells of warm dust and acetate. On the wall, a projector the size of a dog house points at a screen the size of a door. The test pattern is already up: bars, a circle, a resolution wedge.",
      dialogueBeats: [
        {
          id: "sr_p_1",
          characterId: "projectionist",
          expression: "not looking up, threading the leader",
          text: "Rule one of this booth: nothing moves once the picture starts. Panel, controls, chrome — you set the frame before the first character lands and then you leave it alone. Watch the box while I talk. If it so much as breathes, we're here all night.",
        },
        {
          id: "sr_p_2",
          characterId: "projectionist",
          expression: "the long line — if the panel holds its height through THIS, it holds through anything",
          text: "Now the long one, because a short line proves nothing: in thirty-one years I have watched every kind of picture come through this booth — the two-reelers with the cigarette burns you could set your watch by, the roadshow engagements with overtures nobody sat still for, the midnight horror prints that came in smelling like a bar, the one western that snapped in the gate on a Friday and I spliced it with chewing gum wrapper and it ran for a week like that and nobody ever knew the difference, and I will tell you the one thing all of those pictures had in common, the only thing that actually mattered, the thing I will say while you stand there watching this box to see whether it moves: the frame never lies, and the frame never moves, and the moment either of those things stops being true you don't have a picture anymore — you have a projector pointed at a sheet. That's the whole craft. Set the frame. Hold the frame. Roll.",
        },
        {
          id: "sr_p_3",
          characterId: "projectionist",
          expression: "insert shot",
          text: "This is the iris. It opens like a decision.",
          background: "/img/nw2/bg-final-street.jpg",
          backgroundTransition: "iris-in",
          backgroundTransitionSpeed: 1.4,
        },
      ],
      choices: [
        {
          id: "sr_p_reply_a",
          text: "“Hold the frame. Got it.”",
          reply: true,
          targetSceneId: "",
          attitudeTag: "Neutral",
          exclusiveGroup: "sr_opener",
          consequences: { setFlags: ["sr_briefed_a"] },
        },
        {
          id: "sr_p_reply_b",
          text: "“Thirty-one years and you never once got bored?”",
          reply: true,
          targetSceneId: "",
          attitudeTag: "Sultry",
          exclusiveGroup: "sr_opener",
          consequences: { setFlags: ["sr_briefed_b"] },
        },
        {
          // HIDDEN until a reply has been made — the reveal pattern.
          id: "sr_p_hidden",
          text: "Ask what the test reel is for.",
          reply: true,
          hidden: true,
          targetSceneId: "",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["sr_briefed_a", "sr_briefed_b"], requiresAll: false },
          consequences: { setFlags: ["sr_reel_explained"] },
        },
        {
          id: "sr_p_go",
          text: "Thread the reel.",
          targetSceneId: "sr_countdown",
          attitudeTag: "Neutral",
          gating: { requiresFlags: ["sr_briefed_a", "sr_briefed_b"], requiresAll: false },
        },
      ],
      hotspots: [
        {
          id: "sr_p_hs_reel",
          label: "The test reel on the bench",
          cursor: "take",
          bounds: { x: 60, y: 56, w: 26, h: 30 },
          isRepeatable: false,
          action: { type: "giveItem", itemGranted: "sr_reel" },
          showItemImage: true,
        },
        {
          id: "sr_p_hs_pattern",
          label: "The test pattern",
          cursor: "look",
          bounds: { x: 16, y: 16, w: 32, h: 40 },
          isRepeatable: true,
          action: { type: "showText", text: "Bars, a circle, a resolution wedge. Everything straight. Nothing moving." },
        },
      ],
      onEnterActions: [],
    },
    {
      id: "sr_countdown",
      title: "Countdown",
      background: "/img/nw2/bg-empty-booth.jpg",
      ambientAudio: "drone",
      // THE HARD HAND-OFF: the track from the previous scene must stop dead
      // here — no fade tail, no leakage under the countdown.
      musicMode: "none",
      musicFadeSeconds: 0,
      transition: "cut",
      cinematic: { mode: "static", dimAmount: 0.34 },
      prose: "The leader runs. 8… 7… 6… The projectionist's hand hovers at the changeover mark. Whatever happens in the next few seconds happens at speed.",
      dialogueBeats: [
        {
          id: "sr_c_1",
          characterId: "projectionist",
          expression: "flat",
          text: "Changeover's coming. You get one clean second. Don't spend it thinking.",
        },
      ],
      choices: [
        {
          id: "sr_c_qte",
          text: "Hit the mark.",
          targetSceneId: "sr_end_gold",
          attitudeTag: "Clever",
          quickTime: true,
          timeLimitSeconds: 5,
          qtePrompt: "HIT THE MARK",
          qteHeartbeat: true,
          qteShakyCam: true,
          timedOutTargetSceneId: "sr_end_splice",
          timedOutConsequences: { setFlags: ["sr_hesitated"] },
          rememberLine: "The projectionist will remember that.",
        },
      ],
      hotspots: [],
      onEnterActions: [],
    },
    {
      id: "sr_end_gold",
      title: "Picture Start",
      background: "/img/nw2/bg-final-street.jpg",
      ambientAudio: "none",
      transition: "fade",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "PICTURE START",
        recap: "Thread, mark, changeover — clean. The reel runs, the frame never moved. Ship the picture.",
      },
      cinematic: { mode: "static", dimAmount: 0.26 },
      prose: "The mark hits. The picture starts. Nothing moves but the film.",
      dialogueBeats: [],
      choices: [],
      hotspots: [],
    },
    {
      id: "sr_end_splice",
      title: "Spliced",
      background: "/img/nw2/bg-empty-booth.jpg",
      ambientAudio: "none",
      transition: "fade-black",
      isEnding: true,
      endingData: {
        tier: "gameover",
        headline: "SPLICED",
        recap: "You hesitated. The film jumped the sprocket, and somebody upstairs decided the booth runs itself now.",
      },
      cinematic: { mode: "static", dimAmount: 0.5 },
      prose: "The mark passes. The film jumps the sprocket and grinds in the gate, loud, then quiet, then done.",
      dialogueBeats: [],
      choices: [],
      hotspots: [],
    },
  ],
};
