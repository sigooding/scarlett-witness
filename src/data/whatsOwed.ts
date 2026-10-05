import type { Character, SceneNode, Story } from "../types";
import type { SpriteSheet } from "../game/spriteSheet";
import { WHATS_OWED_ACT_1 } from "./whatsOwedAct1";
import { WHATS_OWED_ACT_2 } from "./whatsOwedAct2";
import { WHATS_OWED_ACT_3 } from "./whatsOwedAct3";

/**
 * WHAT'S OWED — a neo-noir graphic novel. Los Angeles, 1984.
 *
 * A straight, linear prestige read: three acts, six production passes, one
 * unreliable narrator (Jack Morrow) whose voiceover is his case against the
 * world while the plates quietly contradict it.
 *
 * Built for the Scarlet Reel Studio; plates live under /img/whats-owed.
 */

import { fx, img } from "./whatsOwedAssets";
export { fx, img };

/* ── Talking sprites ────────────────────────────────────────────────
 * Three-pose cutouts (mouth closed / half / open) forged from magenta
 * plates by scripts/art-room/forge-sheet.mjs, so the cast actually
 * appears and lip-flaps over the plates instead of the story playing
 * 217 dialogue beats as captions over a static image.
 *
 * Frames are 512 tall; each character's frame WIDTH differs because the
 * forge bottom-aligns to a uniform height and keeps aspect. Rest is
 * frame 0 so a silent character holds a closed mouth.                */
const talkSheet = (name: string, frameWidth: number): SpriteSheet => ({
  image: `/img/whats-owed/sprites/${name}-talk.png`,
  frameWidth,
  frameHeight: 512,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [1, 2, 0, 2], fps: 7 },
  },
  pixelated: false,
});

export const WHATS_OWED_CHARACTERS: Character[] = [
  {
    id: "jack",
    name: "Jack Morrow",
    role: "Private investigator, ex-LAPD · the narrator, and not a reliable one",
    avatarUrl: img("ref-jack"),
    talkingSheet: talkSheet("jack", 441),
    talkingX: 22,
    talkingScale: 0.95,
    trustMeter: 0,
    voice: { pitch: 0.82, rate: 0.97 },
  },
  {
    id: "vera",
    name: "Vera Voss",
    role: "The client · everything she says is true and nothing she says is complete",
    avatarUrl: img("ref-vera"),
    talkingSheet: talkSheet("vera", 374),
    talkingX: 74,
    talkingScale: 0.92,
    trustMeter: 0,
    voice: { pitch: 0.95, rate: 0.98 },
  },
  {
    id: "jenny",
    name: "Jenny Voss",
    role: "The sister · stayed soft on purpose",
    avatarUrl: img("ref-jenny"),
    talkingSheet: talkSheet("jenny", 708),
    talkingX: 70,
    talkingScale: 0.9,
    trustMeter: 0,
    voice: { pitch: 1.14, rate: 1.04 },
  },
  {
    id: "solomon",
    name: "Solomon Reyes",
    role: "Lends money and collects in people · operates in daylight, with paperwork",
    avatarUrl: img("ref-solomon"),
    talkingSheet: talkSheet("solomon", 616),
    talkingX: 76,
    talkingScale: 0.95,
    trustMeter: 0,
    voice: { pitch: 0.75, rate: 0.92 },
  },
  {
    id: "rosa",
    name: "Det. Rosa Ibarra",
    role: "LAPD homicide · she stayed, and he didn't",
    avatarUrl: img("ref-rosa"),
    talkingSheet: talkSheet("rosa", 550),
    talkingX: 28,
    talkingScale: 0.92,
    trustMeter: 0,
    voice: { pitch: 1.0, rate: 1.0 },
  },
  {
    id: "krantz",
    name: "Adele Krantz",
    role: "Counsel · never present at anything violent, does more damage than Ferris ever has",
    avatarUrl: img("ref-krantz"),
    talkingSheet: talkSheet("krantz", 315),
    talkingX: 72,
    talkingScale: 0.88,
    trustMeter: 0,
    voice: { pitch: 0.92, rate: 0.9 },
  },
  {
    id: "ferris",
    name: "Ferris",
    role: "Enforcer · deliberately unremarkable",
    avatarUrl: img("ref-ferris"),
    trustMeter: 0,
    voice: { pitch: 0.8, rate: 0.96 },
  },
  {
    id: "tomas",
    name: "Tomás",
    role: "Jenny's keeper · the only kindness available in that house, and still not going to let her leave",
    avatarUrl: img("ref-tomas"),
    trustMeter: 0,
    voice: { pitch: 1.05, rate: 1.02 },
  },
  {
    id: "narrator",
    name: "—",
    role: "scene direction (unvoiced captions)",
    avatarUrl: img("slate"),
    trustMeter: 0,
    voice: { pitch: 0.7, rate: 0.95 },
  },
];

export const WHATS_OWED_SCENES: SceneNode[] = [
  ...WHATS_OWED_ACT_1,
  ...WHATS_OWED_ACT_2,
  ...WHATS_OWED_ACT_3,
];

/* Simple reading order for the Studio canvas: three rows, one per act. */
const LAYOUT: Record<string, { x: number; y: number }> = {};
{
  let row = 0;
  let col = 0;
  for (const s of WHATS_OWED_SCENES) {
    if (s.partBreak && col > 0) {
      row += 1;
      col = 0;
    }
    LAYOUT[s.id] = { x: col * 280, y: row * 260 };
    col += 1;
    if (col >= 9) {
      col = 0;
      row += 1;
    }
  }
}

export const WHATS_OWED: Story = {
  id: "whats-owed",
  title: "What's Owed",
  tagline:
    "Los Angeles, 1984. A man mistakes his own grievance for love, learns the difference too late, and pays for the education with the only person who ever offered him anything.",
  coverImage: img("cover"),
  gameKind: "noir-rail",
  startSceneId: "wo_s000",
  acts: [
    {
      id: "wo_act1",
      label: "Act One",
      title: "The Client",
      tagline: "Heat, smog light, palm shadows on stucco — and a fee she plainly couldn't cover.",
      startSceneId: "wo_s000",
      titleCardImage: "/img/whats-owed/tcard-act1.jpg",
      titleCardSeconds: 3,
    },
    {
      id: "wo_act2",
      label: "Act Two",
      title: "A Dead Woman's Case",
      tagline: "No client, no fee, no standing. He keeps working. The first lie is the one he tells himself.",
      startSceneId: "wo_s200",
      titleCardImage: "/img/whats-owed/tcard-act2.jpg",
      titleCardSeconds: 3,
    },
    {
      id: "wo_act3",
      label: "Act Three",
      title: "The Choice",
      tagline: "Two exits, and he cannot look directly at the part where they end the same.",
      startSceneId: "wo_s500",
      titleCardImage: "/img/whats-owed/tcard-act3.jpg",
      titleCardSeconds: 3,
    },
  ],
  briefing: {
    objective:
      "Jack Morrow believes he is avenging Vera Voss. He is avenging himself, and has been the whole time. A neo-noir in three acts, narrated by the least reliable man in Los Angeles.",
    winConditions: [
      "Everything Jack said he wanted, obtained — and nothing he needed.",
      "Jenny leaves intact. She's the only one who never sold anyone.",
    ],
    loseConditions: [
      "The visits end either way. That's the part he can't look at directly.",
      "There is no authority to appeal to. That's the world.",
    ],
  },
  flagNotes: {
    wo_asked_debt:
      "Vera's answer about the debt in beat 3 — ask before 'Take the case' appears.",
    wo_asked_jenny:
      "Vera's answer about Jenny in beat 3 — ask before 'Take the case' appears.",
  },
  characters: WHATS_OWED_CHARACTERS,
  items: [],
  layout: LAYOUT,
  scenes: WHATS_OWED_SCENES,
};
