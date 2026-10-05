import type { Story } from "../types";

const frame = (number: number) =>
  `/assets/animations/adrian_vale/movement/adrian_keyframe${number}.png`;

const movementFrames = Array.from({ length: 10 }, (_, index) => frame(index + 1));
const reelBackground =
  "gradient:radial-gradient(ellipse at 50% 38%,#243942 0%,#111d29 50%,#070c14 100%)";

/**
 * ADRIAN VALE: NIGHT MOVES
 * A compact neo-noir movement reel. Ten matching transparent full-body poses
 * play as one-shot foreground keyframes, from stillness through investigation
 * and a brisk exit.
 */
export const ADRIAN_VALE_REEL: Story = {
  id: "adrian-vale-movement-reel",
  title: "Adrian Vale: Night Moves",
  tagline: "Ten movements. One detective on a long night.",
  coverImage: "gradient:linear-gradient(145deg,#0b111d 0%,#20363c 56%,#221922 100%)",
  startSceneId: "av_intro",
  briefing: {
    gameInfo: "A short full-body movement study for Adrian Vale, a neo-noir detective in his early forties.",
    objective: "Watch Adrian move through the ten-pose foreground reel.",
    winConditions: ["See all ten movement keyframes, then close the reel."],
    loseConditions: [],
  },
  characters: [
    {
      id: "adrian_vale",
      name: "Detective Adrian Vale",
      role: "Neo-noir Detective",
      avatarUrl: frame(1),
      trustMeter: 0,
    },
  ],
  items: [],
  scenes: [
    {
      id: "av_intro",
      title: "Adrian Vale: Night Moves",
      nodeType: "credits",
      noTypewriter: true,
      background: reelBackground,
      prose: "ADRIAN VALE\nNIGHT MOVES\nA ten-pose neo-noir movement reel",
      credits: {
        title: "ADRIAN VALE",
        subtitle: "NIGHT MOVES",
        lines: [{ role: "A movement study", name: "Ten foreground keyframes" }],
        font: "elegant",
        titleEntrance: "typewriter",
        accentColor: "#72ddd2",
        stagger: 0.25,
        duration: 0.65,
      },
      choices: [
        {
          id: "av_start_reel",
          text: "Run the movement reel",
          targetSceneId: "av_reel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "av_reel",
      title: "The Night Shift",
      nodeType: "cutscene",
      noTypewriter: true,
      choiceDelaySeconds: 5.5,
      background: reelBackground,
      transition: "cut",
      prose:
        "Adrian walks the block, checks his notebook and flashlight, drops to inspect a clue, then signals his partner to hold back.",
      note:
        "Ten alpha-cut poses play once as hard-swap foreground frames at 0.5 seconds each: idle, left/right stride, pivot, notebook, flashlight, crouch, rise, hold signal, brisk exit.",
      cinematic: {
        mode: "static",
        foregroundImage: movementFrames[0],
        foregroundScale: 0.86,
        foregroundFit: "contain",
        foregroundX: 50,
        foregroundY: 50,
        foregroundAnimation: {
          mode: "frames",
          frames: movementFrames,
          frameDuration: 0.5,
          loops: 1,
        },
      },
      choices: [
        {
          id: "av_finish_reel",
          text: "Close the reel",
          targetSceneId: "av_end",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "av_end",
      title: "End of Reel",
      background: "gradient:linear-gradient(155deg,#101922 0%,#213a3e 58%,#10131d 100%)",
      noTypewriter: true,
      prose: "The trail is warm. Adrian steps back into the rain-dark street.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE NIGHT ISN'T OVER",
        recap:
          "Adrian Vale completed a ten-pose movement pass, from a quiet stand to a fast exit.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
