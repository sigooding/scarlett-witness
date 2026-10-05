import type { Story } from "../types";

const frame = (number: number) =>
  `/assets/animations/adrian_vale/movement/adrian_keyframe${number}.png`;

const movementFrames = Array.from({ length: 10 }, (_, index) => frame(index + 11));
const reelBackground =
  "gradient:radial-gradient(ellipse at 50% 38%,#243942 0%,#111d29 50%,#070c14 100%)";

/**
 * ADRIAN VALE: CASEWORK
 * A second short movement reel with ten additional actions, using the same
 * character design and canvas as Adrian Vale: Night Moves.
 */
export const ADRIAN_VALE_CASEWORK_REEL: Story = {
  id: "adrian-vale-casework-reel",
  title: "Adrian Vale: Casework",
  tagline: "Ten more moves as the case closes in.",
  coverImage: "gradient:linear-gradient(145deg,#0b111d 0%,#20363c 56%,#221922 100%)",
  startSceneId: "avc_intro",
  briefing: {
    gameInfo: "A second neo-noir movement study for Detective Adrian Vale, featuring ten additional full-body keyframes.",
    objective: "Watch Adrian work the next lead, then close the reel.",
    winConditions: ["See all ten additional movement poses."],
    loseConditions: [],
  },
  characters: [
    {
      id: "adrian_vale",
      name: "Detective Adrian Vale",
      role: "Neo-noir Detective",
      avatarUrl: frame(11),
      trustMeter: 0,
    },
  ],
  items: [],
  scenes: [
    {
      id: "avc_intro",
      title: "Adrian Vale: Casework",
      nodeType: "credits",
      noTypewriter: true,
      background: reelBackground,
      prose: "ADRIAN VALE\nCASEWORK\nTen more moves after midnight",
      credits: {
        title: "ADRIAN VALE",
        subtitle: "CASEWORK",
        lines: [{ role: "A second movement reel", name: "Ten new foreground keyframes" }],
        font: "elegant",
        titleEntrance: "typewriter",
        accentColor: "#72ddd2",
        stagger: 0.25,
        duration: 0.65,
      },
      choices: [
        {
          id: "avc_start_reel",
          text: "Run the casework reel",
          targetSceneId: "avc_reel",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "avc_reel",
      title: "The Next Lead",
      nodeType: "cutscene",
      noTypewriter: true,
      choiceDelaySeconds: 5.5,
      background: reelBackground,
      transition: "cut",
      prose:
        "Adrian listens, reaches, checks the time, calls in, then runs toward the next clue.",
      note:
        "Ten additional alpha-cut poses play once as hard-swap foreground frames at 0.5 seconds each: case folder, listening, high reach, wristwatch, glove, hail cab, sprint, dodge, phone call, decisive point.",
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
          id: "avc_finish_reel",
          text: "Close the reel",
          targetSceneId: "avc_end",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "avc_end",
      title: "End of Casework Reel",
      background: "gradient:linear-gradient(155deg,#101922 0%,#213a3e 58%,#10131d 100%)",
      noTypewriter: true,
      prose: "The receiver clicks down. Adrian is already running.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE CASE MOVES FORWARD",
        recap:
          "Adrian completed ten additional movement poses, from listening at the door to pointing out the next clue.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
