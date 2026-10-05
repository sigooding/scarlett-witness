import type { Story } from "../types";

const DETECTIVE_SHEET = {
  image: "/assets/graphic-novel-template/detective-talk.png",
  frameWidth: 606,
  frameHeight: 512,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [0, 1, 2, 1], fps: 7 },
  },
  pixelated: false,
};

const WITNESS_SHEET = {
  image: "/assets/graphic-novel-template/witness-talk.png",
  frameWidth: 363,
  frameHeight: 512,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [0, 1, 2, 1], fps: 7 },
  },
  pixelated: false,
};

/**
 * A copy-friendly starter reel. The gold NOTE nodes are lessons for creators:
 * they remain visible in Studio's flowchart but are automatically bypassed in play.
 */
export const GRAPHIC_NOVEL_TEMPLATE: Story = {
  id: "graphic-novel-starter-template",
  title: "Template: Graphic Novel Starter",
  tagline: "A playable, annotated starter with portraits, hotspots, choices and endings.",
  gameKind: "vn",
  coverImage: "/assets/graphic-novel-template/platform.png",
  startSceneId: "gnt_office",
  layout: {
    gnt_office: { x: 40, y: 220 },
    gnt_note_dialogue: { x: 430, y: 40 },
    gnt_platform: { x: 790, y: 220 },
    gnt_note_branch: { x: 1170, y: 40 },
    gnt_gold: { x: 1510, y: 130 },
    gnt_fold: { x: 1510, y: 390 },
  },
  briefing: {
    gameInfo: "A playable, annotated graphic-novel starter for creators. Investigate a rain-dark railway mystery while opening the same case in Studio to learn backgrounds, hotspots, animated left/right portraits, evidence gates, branching choices, note nodes and endings.",
    objective: "Inspect the folder, question the watchman, and choose an ending.",
    winConditions: ["Click the INSPECT hotspot to collect the clue.", "Use the clue when making the final choice."],
    loseConditions: ["Leave without connecting the clue to the witness."],
  },
  flagNotes: {
    gnt_folder_checked: "The player inspected the example hotspot.",
    gnt_witness_pressed: "The player used the clue in the final branch.",
  },
  characters: [
    {
      id: "gnt_detective",
      name: "Mara Vale",
      role: "Player detective — left-side speaker",
      avatarUrl: "/assets/graphic-novel-template/detective-talk.png",
      trustMeter: 0,
      talkingSheet: DETECTIVE_SHEET,
      talkingX: 22,
      talkingY: -2,
      talkingScale: 1.18,
      talkingDim: 0.52,
    },
    {
      id: "gnt_watchman",
      name: "Elias Rook",
      role: "Witness — right-side speaker",
      avatarUrl: "/assets/graphic-novel-template/witness-talk.png",
      trustMeter: 0,
      talkingSheet: WITNESS_SHEET,
      talkingX: 78,
      talkingY: -2,
      talkingScale: 1.18,
      talkingDim: 0.52,
    },
  ],
  items: [
    {
      id: "gnt_ticket",
      name: "Platform Ticket",
      icon: "🎟️",
      description: "Stamped PLATFORM 6 at 11:47 PM.",
      flavorText: "A simple clue that unlocks a later choice.",
      isClue: true,
    },
  ],
  scenes: [
    {
      id: "gnt_office",
      title: "1 — Establishing Panel + Hotspot",
      note: "CREATOR STEP 1: Replace this background in the Scene tab. The image itself contains readable CASE NOTES, INSPECT and NEXT SCENE labels so you can see how authored text can guide composition. Open Hotspots to inspect the folder zone: it grants an item and sets a flag. Open Beats to edit the two alternating speakers. Duplicate this scene when you need another graphic-novel panel.",
      background: "/assets/graphic-novel-template/office.png",
      prose: "Rain stipples the office window. One folder has been left beneath the lamp, exactly where an impatient player will notice it.",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 3, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.45 },
      dialogueBeats: [
        { id: "gnt_b1", characterId: "gnt_detective", text: "Start with a short line that establishes the question. Who left this folder open?" },
        { id: "gnt_b2", characterId: "gnt_watchman", text: "Then answer from the opposite side of the frame. I only watch the trains, detective." },
      ],
      hotspots: [
        {
          id: "gnt_folder_hotspot",
          label: "INSPECT — the example clue folder",
          bounds: { x: 43, y: 62, w: 18, h: 20 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "gnt_ticket", flagSet: "gnt_folder_checked" },
          verbs: { look: { type: "showText", text: "The label tells the player what matters before they click." } },
        },
        {
          id: "gnt_notes_hotspot",
          label: "CASE NOTES — a repeatable text hotspot",
          bounds: { x: 8, y: 26, w: 24, h: 32 },
          cursor: "look",
          isRepeatable: true,
          action: { type: "showText", text: "Hotspots can reveal flavour, grant items, set flags, start dialogue, or move to another scene." },
        },
      ],
      choices: [
        { id: "gnt_continue", text: "Follow the NEXT SCENE door to Platform 6.", targetSceneId: "gnt_note_dialogue" },
      ],
    },
    {
      id: "gnt_note_dialogue",
      title: "NOTE ② — Talking portraits",
      nodeType: "note",
      note: "NOTE NODES ARE STUDIO-ONLY INSTRUCTIONS. They are bypassed automatically during play. Both characters use one transparent 3-frame sprite sheet: REST holds frame 0; TALK cycles 0-1-2-1. Mara is positioned at 22% (left), Elias at 78% (right). talkingDim fades the listener. Edit these values in Characters, and assign each line's speaker in Beats.",
      background: "gradient:linear-gradient(135deg,#2b1115,#0c0d12)",
      prose: "Studio instruction — bypassed in play.",
      dialogueBeats: [],
      hotspots: [],
      choices: [{ id: "gnt_note_dialogue_next", text: "Continue", targetSceneId: "gnt_platform" }],
    },
    {
      id: "gnt_platform",
      title: "2 — Dialogue + Gated Choice",
      note: "CREATOR STEP 2: The generated background includes PLATFORM 6, EVIDENCE and EXIT as composition guides. The characters alternate again. The first final choice requires the ticket item; this is a gated branch. In Studio, open Choices to inspect Requires Items and Consequences. Test once with the office hotspot collected and once without it.",
      background: "/assets/graphic-novel-template/platform.png",
      prose: "Platform Six is empty except for the watchman and a train that should have departed twenty minutes ago.",
      cinematic: { mode: "zoom-hold", focalPoint: "52% 55%", zoomDuration: 12, colorGrade: "noir-1940s", filmGrade: true, filmGradeStrength: 0.55 },
      dialogueBeats: [
        { id: "gnt_b3", characterId: "gnt_watchman", text: "The timetable says no train stopped here after eleven." },
        { id: "gnt_b4", characterId: "gnt_detective", text: "A good second line introduces the contradiction the player can solve." },
        { id: "gnt_b5", characterId: "gnt_watchman", text: "Choices can branch, set flags, change meters, or require evidence collected from a hotspot." },
      ],
      hotspots: [
        { id: "gnt_sign_hotspot", label: "PLATFORM 6 sign", bounds: { x: 38, y: 12, w: 25, h: 19 }, cursor: "look", isRepeatable: true, action: { type: "showText", text: "Text baked into a background can orient players, but keep interactive labels in the hotspot data for accessibility." } },
        { id: "gnt_exit_hotspot", label: "EXIT sign", bounds: { x: 82, y: 35, w: 12, h: 23 }, cursor: "look", isRepeatable: true, action: { type: "showText", text: "This is an example visual affordance. The actual branch is authored in Choices below." } },
      ],
      choices: [
        {
          id: "gnt_prove",
          text: "Show him the Platform 6 ticket.",
          targetSceneId: "gnt_note_branch",
          gating: { requiresItems: ["gnt_ticket"] },
          consequences: { setFlags: ["gnt_witness_pressed"] },
          attitudeTag: "Clever",
        },
        { id: "gnt_leave", text: "Leave the station without pressing him.", targetSceneId: "gnt_fold", attitudeTag: "Neutral" },
      ],
    },
    {
      id: "gnt_note_branch",
      title: "NOTE ③ — Branches and endings",
      nodeType: "note",
      note: "CREATOR STEP 3: Every route needs a destination. This note sits between the successful choice and victory ending to explain the graph, but players never see it. Endings use endingData: victory-gold / victory-silver / gameover. Keep at least one victory and one game-over route while drafting so Studio's Check tab can prove the story is completable.",
      background: "gradient:linear-gradient(135deg,#2b1115,#0c0d12)",
      prose: "Studio instruction — bypassed in play.",
      dialogueBeats: [],
      hotspots: [],
      choices: [{ id: "gnt_note_branch_next", text: "Continue", targetSceneId: "gnt_gold" }],
    },
    {
      id: "gnt_gold",
      title: "Ending — The Useful Clue",
      isEnding: true,
      background: "/assets/graphic-novel-template/platform.png",
      prose: "The ticket does what good evidence should: it changes the meaning of the conversation. Rook looks at the stamp, then at the train waiting in the rain.",
      dialogueBeats: [{ id: "gnt_b6", characterId: "gnt_watchman", text: "All right. A train came through. But it carried no passengers." }],
      hotspots: [],
      choices: [],
      endingData: { tier: "victory-gold", headline: "YOUR FIRST WORKING BRANCH", recap: "You combined a hotspot item, a gated choice, animated portraits and a victory ending." },
    },
    {
      id: "gnt_fold",
      title: "Ending — Unasked Questions",
      isEnding: true,
      background: "/assets/graphic-novel-template/office.png",
      prose: "The clue stays in the folder. The witness keeps his story. This route demonstrates a game-over ending and gives creators a second branch to inspect.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: { tier: "gameover", headline: "THE CASE STAYS OPEN", recap: "You left without using the clue. In Studio, trace this choice back to Platform 6 and change its destination or consequences." },
    },
  ],
};
