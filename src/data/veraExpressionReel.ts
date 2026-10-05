import type { Story } from "../types";

const frame = (number: number) =>
  `/assets/animations/vera/standing_shock/vera_keyframe${number}.png`;

const expressionFrames = Array.from({ length: 10 }, (_, index) => frame(index + 6));
const reelBackground =
  "gradient:radial-gradient(ellipse at 50% 38%,#25464d 0%,#142531 48%,#080d18 100%)";

/**
 * VERA VOSS: TEN FACES
 * A deliberately short, one-shot foreground reel made from ten transparent
 * character keyframes. The frame order moves from curiosity through confidence,
 * doubt, worry, sadness, frustration, anger, resolve, relief and surprise.
 */
export const VERA_EXPRESSION_REEL: Story = {
  id: "vera-expression-reel",
  title: "Vera Voss: Ten Faces",
  tagline: "One clue. Ten reactions. A quick foreground-keyframe character study.",
  coverImage: "gradient:linear-gradient(145deg,#0b111d 0%,#17373d 56%,#211525 100%)",
  startSceneId: "ver_intro",
  briefing: {
    gameInfo: "A short, one-shot portrait reel with ten transparent foreground keyframes of Vera Voss.",
    objective: "Watch Vera's ten changing expressions, then close the reel.",
    winConditions: ["See all ten foreground keyframes."],
    loseConditions: [],
  },
  characters: [
    {
      id: "vera",
      name: "Vera Voss",
      role: "Private Investigator",
      avatarUrl: frame(6),
      trustMeter: 0,
    },
  ],
  items: [],
  scenes: [
    {
      id: "ver_intro",
      title: "Vera Voss: Ten Faces",
      nodeType: "credits",
      noTypewriter: true,
      background: reelBackground,
      prose: "VERA VOSS\nTEN FACES\nA short expression reel",
      credits: {
        title: "VERA VOSS",
        subtitle: "TEN FACES",
        lines: [{ role: "A foreground keyframe study", name: "One clue. Ten reactions." }],
        font: "elegant",
        titleEntrance: "typewriter",
        accentColor: "#72ddd2",
        stagger: 0.25,
        duration: 0.65,
      },
      choices: [
        {
          id: "ver_start_reel",
          text: "Run the short reel",
          targetSceneId: "ver_reel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "ver_reel",
      title: "One Clue, Ten Reactions",
      nodeType: "cutscene",
      noTypewriter: true,
      choiceDelaySeconds: 7.4,
      background: reelBackground,
      transition: "cut",
      prose:
        "A clue lands. Curiosity becomes confidence, doubt, worry, grief, frustration, anger, resolve, relief—and one last surprise.",
      note:
        "10 alpha-cut Vera poses play once as a hard-swap foreground animation (0.68 seconds per keyframe).",
      cinematic: {
        mode: "static",
        foregroundImage: expressionFrames[0],
        foregroundScale: 0.86,
        foregroundFit: "contain",
        foregroundX: 50,
        foregroundY: 50,
        foregroundAnimation: {
          mode: "frames",
          frames: expressionFrames,
          frameDuration: 0.68,
          loops: 1,
        },
      },
      choices: [
        {
          id: "ver_finish_reel",
          text: "Close the reel",
          targetSceneId: "ver_end",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "ver_end",
      title: "End of Reel",
      background: "gradient:linear-gradient(155deg,#101922 0%,#183d3d 58%,#10131d 100%)",
      noTypewriter: true,
      prose: "Ten expressions, one Vera. The case can wait until morning.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE CASE IS STILL OPEN",
        recap:
          "Vera's ten-frame expression reel played once, from curious first look to the final surprised glance.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
