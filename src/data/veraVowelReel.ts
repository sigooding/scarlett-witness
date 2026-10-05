import type { Story } from "../types";

const asset = (file: string) => `/assets/animations/vera/talking_medium/${file}`;
const restingPose = asset("vera_talk_rest.png");
const vowelFrames = [
  asset("vera_vowel_a.png"),
  asset("vera_vowel_e.png"),
  asset("vera_vowel_i.png"),
  asset("vera_vowel_o.png"),
  asset("vera_vowel_u.png"),
];
const plate =
  "gradient:radial-gradient(ellipse at 50% 34%,#28464d 0%,#142531 50%,#080d18 100%)";

/**
 * VERA VOSS: VOWEL TEST
 * Medium-shot alpha cutouts wired into the engine's native talking-frame
 * animation. Vera cycles through A / E / I / O / U while she speaks, and holds
 * the closed-mouth pose whenever she is not the active speaker.
 */
export const VERA_VOWEL_REEL: Story = {
  id: "vera-vowel-reel",
  title: "Vera Voss: Vowel Test",
  tagline: "A medium-shot talking-sprite study: one resting pose and five vowel shapes.",
  coverImage: "gradient:linear-gradient(145deg,#0b111d 0%,#17373d 56%,#211525 100%)",
  startSceneId: "vv_intro",
  briefing: {
    gameInfo: "A short talking-sprite test using matching medium-shot Vera cutouts for A, E, I, O and U.",
    objective: "Hear Vera's five-vowel line and watch the mouth-keyframe loop.",
    winConditions: ["Watch the talking pose cycle, then close the reel."],
    loseConditions: [],
  },
  characters: [
    {
      id: "vera",
      name: "Vera Voss",
      role: "Private Investigator",
      avatarUrl: restingPose,
      trustMeter: 0,
      talkingRest: restingPose,
      talkingFrames: vowelFrames,
      talkingFrameDuration: 0.18,
      talkingX: 50,
      talkingY: 0,
      talkingScale: 1.1,
    },
  ],
  items: [],
  scenes: [
    {
      id: "vv_intro",
      title: "Vera Voss: Vowel Test",
      nodeType: "credits",
      noTypewriter: true,
      background: plate,
      prose: "VERA VOSS\nA–E–I–O–U\nA medium-shot talking-pose test",
      credits: {
        title: "VERA VOSS",
        subtitle: "A · E · I · O · U",
        lines: [{ role: "Talking keyframes", name: "Medium shot • transparent cutouts" }],
        font: "elegant",
        titleEntrance: "typewriter",
        accentColor: "#72ddd2",
        stagger: 0.25,
        duration: 0.65,
      },
      choices: [
        {
          id: "vv_begin",
          text: "Hear the vowel test",
          targetSceneId: "vv_test",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
      dialogueBeats: [],
    },
    {
      id: "vv_test",
      title: "A, E, I, O, U",
      background: plate,
      noTypewriter: true,
      prose: "Vera checks the five mouth shapes before the interview begins.",
      note:
        "The active speaker cycles the five `talkingFrames` (0.18s each); `talkingRest` supplies the closed-mouth pose between lines.",
      dialogueBeats: [
        {
          id: "vv_vowel_line",
          characterId: "vera",
          expression: "vowel test",
          text: "A. E. I. O. U.",
        },
      ],
      choices: [
        {
          id: "vv_finish",
          text: "Close the vowel reel",
          targetSceneId: "vv_end",
          attitudeTag: "Neutral",
        },
      ],
      hotspots: [],
    },
    {
      id: "vv_end",
      title: "End of Vowel Test",
      background: "gradient:linear-gradient(155deg,#101922 0%,#183d3d 58%,#10131d 100%)",
      noTypewriter: true,
      prose: "The mouth rig is ready for a line of dialogue.",
      isEnding: true,
      endingData: {
        tier: "victory-gold",
        headline: "THE INTERVIEW CAN BEGIN",
        recap:
          "Vera's medium-shot talking sprite cycled through the A, E, I, O and U visemes, with a closed-mouth resting pose.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
