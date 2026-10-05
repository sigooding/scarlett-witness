import type { Story } from "../types";

const MECHANIC_SHEET = {
  image: "/assets/point-click-template/mechanic-talk.png",
  frameWidth: 274,
  frameHeight: 512,
  animations: {
    idle: { frames: [0] },
    talk: { frames: [0, 1, 2, 1], fps: 7 },
  },
  pixelated: false,
};

/** Copy-friendly point-and-click starter. Gold note nodes teach the Studio graph and vanish in play. */
export const POINT_CLICK_TEMPLATE: Story = {
  id: "point-click-starter-template",
  title: "Template: Point & Click Starter",
  tagline: "A two-room adventure teaching walking, verbs, NPCs and inventory puzzles.",
  gameKind: "adventure",
  coverImage: "/assets/point-click-template/workshop.png",
  startSceneId: "pct_workshop",
  inventoryDisplay: { mode: "container", label: "Tool Bag" },
  playerSprite: { image: "emoji:🧑‍🔧" },
  layout: {
    pct_workshop: { x: 40, y: 220 },
    pct_note_rooms: { x: 430, y: 40 },
    pct_yard: { x: 800, y: 220 },
    pct_note_puzzle: { x: 1190, y: 40 },
    pct_win: { x: 1540, y: 160 },
    pct_leave: { x: 1540, y: 420 },
  },
  briefing: {
    gameInfo: "A playable, annotated point-and-click template. Walk through two illustrated rooms, try LOOK, TAKE, TALK, USE and GO, collect a fuse, repair a signal box and inspect the Studio note nodes that explain every setup.",
    objective: "Find a way into the yard, repair the signal box, and open the departure gate.",
    winConditions: ["Take the workshop key.", "Find the ceramic fuse.", "Use the fuse on the signal box."],
    loseConditions: ["Leave the railway without repairing the signal."],
  },
  flagNotes: {
    pct_key_taken: "The player used a TAKE hotspot and collected the workshop key.",
    pct_fuse_taken: "The player collected the puzzle item in the yard.",
    pct_signal_fixed: "The player used the correct inventory item on the signal box.",
  },
  verbResponses: {
    look: ["Nothing else stands out."],
    take: ["That belongs where it is."],
    talk: ["It does not seem conversational."],
    use: ["Those pieces do not fit together."],
    go: ["There is no path that way."],
  },
  characters: [
    {
      id: "pct_mechanic",
      name: "Ada Sparks",
      role: "Mechanic and example interactive NPC",
      avatarUrl: "/assets/point-click-template/mechanic-talk.png",
      trustMeter: 0,
      talkingSheet: {
        image: "/assets/point-click-template/mechanic-talk.png",
        frameWidth: 274,
        frameHeight: 512,
        animations: { rest: { frames: [0] }, talk: { frames: [0, 1, 2, 1], fps: 7 } },
        pixelated: false,
      },
      talkingX: 72,
      talkingScale: 1.18,
    },
  ],
  items: [
    { id: "pct_key", name: "Blue Door Key", icon: "🔑", description: "A brass key tagged YARD.", flavorText: "Inventory items can gate exits or be armed with USE." },
    { id: "pct_fuse", name: "Ceramic Fuse", icon: "▥", description: "A clean 20-amp fuse from the locomotive toolbox.", flavorText: "Try it on the broken signal box.", isClue: true },
  ],
  scenes: [
    {
      id: "pct_workshop",
      title: "1 — Workshop: Verbs and NPC",
      nodeType: "stage",
      note: "CREATOR STEP 1: This is a Walkable Stage. In the Stage tab, inspect floor, spawn, obstacles, verb coin and NPC settings. In Hotspots, compare a TAKE item, repeatable LOOK, TALK marker and gated GO door. The mechanic NPC links to the TALK hotspot, so players click the character—not a floating marker—and walk over before dialogue starts.",
      background: "/assets/point-click-template/workshop.png",
      prose: "",
      cinematic: { mode: "static", parallaxDepth: 0.18 },
      stage: {
        spawn: { x: 8, y: 91 }, speed: 18, reach: 4, keyboard: true,
        floor: { top: 68, bottom: 95 }, depthScale: 0.22, hints: "proximity",
        verbCoin: true, objectVerbMenu: true,
        enterCaption: "THE LAST TRAIN NEEDS ONE REPAIR. THE WORKSHOP HAS EVERYTHING—IF YOU ASK.",
        obstacles: [{ x: 24, y: 73, w: 15, h: 17 }, { x: 59, y: 77, w: 9, h: 13 }],
        npcs: [{ id: "pct_npc_ada", sheet: MECHANIC_SHEET, x: 58, y: 88, scale: 0.92, facing: "left", talkHotspotId: "pct_talk_ada" }],
      },
      dialogueBeats: [
        { id: "pct_b1", characterId: "pct_mechanic", text: "Click an object, choose a verb, and your character walks within reach before acting." },
        { id: "pct_b2", characterId: "pct_mechanic", text: "The yard key is on my bench. The signal fuse is outside in the locomotive toolbox." },
      ],
      hotspots: [
        { id: "pct_key_hs", label: "TAKE — brass yard key", bounds: { x: 29, y: 58, w: 10, h: 17 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "pct_key", flagSet: "pct_key_taken" }, verbs: { look: { type: "showText", text: "Its blue tag matches the yard door." } } },
        { id: "pct_poster_hs", label: "LOOK — verb poster", bounds: { x: 8, y: 18, w: 19, h: 30 }, cursor: "look", isRepeatable: true, remote: true, action: { type: "showText", text: "LOOK gives repeatable flavour. Remote hotspots fire without walking over." } },
        { id: "pct_talk_ada", label: "TALK — Ada Sparks", bounds: { x: 52, y: 55, w: 13, h: 33 }, cursor: "talk", isRepeatable: true, action: { type: "startDialogue" } },
        // isRepeatable: the yard walks back in here, so the door must still be
        // a door on the second visit (validator: return trap).
        { id: "pct_door_hs", label: "GO — blue yard door", bounds: { x: 83, y: 34, w: 15, h: 54 }, cursor: "go", isRepeatable: true, gating: { requiresItems: ["pct_key"] }, customFailMessage: "The blue door is locked. Ada mentioned a key on the bench.", action: { type: "goToScene", targetSceneId: "pct_note_rooms" }, verbs: { look: { type: "showText", text: "The EXIT sign makes the destination visually obvious." } } },
      ],
      choices: [],
    },
    {
      id: "pct_note_rooms", title: "NOTE ② — Connecting rooms", nodeType: "note",
      note: "NOTE NODES ARE STUDIO-ONLY. Players bypass this node and arrive directly in the yard. A GO hotspot points here; the note's first route points onward. Use note nodes to document puzzles, TODOs and handoffs without interrupting play. For normal room-to-room travel, point GO directly at the next Stage scene.",
      background: "gradient:linear-gradient(135deg,#16303a,#081015)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [],
      choices: [{ id: "pct_note_rooms_next", text: "Continue", targetSceneId: "pct_yard" }],
    },
    {
      id: "pct_yard",
      title: "2 — Yard: Inventory Puzzle",
      nodeType: "stage",
      note: "CREATOR STEP 2: TAKE the fuse, choose USE, arm it from the Tool Bag, then click the signal box. acceptsItems controls what fits; itemResponses supplies the successful line; itemConsumed spends the fuse; flagSet records the repair. The gate hotspot requires that flag. Test wrong items too—the story-wide refusal line handles them.",
      background: "/assets/point-click-template/yard.png", prose: "",
      cinematic: { mode: "pan", panDirection: "right", panDistance: 2, parallaxDepth: 0.2 },
      stage: {
        spawn: { x: 7, y: 91 }, speed: 18, reach: 4, keyboard: true,
        floor: { top: 69, bottom: 95 }, depthScale: 0.2, hints: "proximity",
        verbCoin: true, objectVerbMenu: true,
        enterCaption: "THE SIGNAL IS DARK. THE DEPARTURE GATE WILL NOT MOVE UNTIL IT TURNS GREEN.",
        obstacles: [{ x: 20, y: 72, w: 20, h: 17 }, { x: 64, y: 74, w: 8, h: 17 }],
        exitEdges: { left: { targetSceneId: "pct_workshop", label: "the workshop" } },
      },
      dialogueBeats: [],
      hotspots: [
        { id: "pct_fuse_hs", label: "TAKE — fuse in toolbox", bounds: { x: 33, y: 64, w: 10, h: 18 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "pct_fuse", flagSet: "pct_fuse_taken" }, verbs: { look: { type: "showText", text: "The locomotive toolbox contains exactly one useful part." } } },
        { id: "pct_signal_hs", label: "USE ITEM — broken signal box", bounds: { x: 64, y: 45, w: 12, h: 36 }, cursor: "use", gating: { requiresItems: ["pct_fuse"] }, acceptsItems: ["pct_fuse"], itemResponses: { pct_fuse: "The fuse seats with a click. Lamps wake down the line." }, action: { type: "useItem", itemConsumed: "pct_fuse", flagSet: "pct_signal_fixed", text: "The fuse seats with a click. Lamps wake down the line." }, verbs: { look: { type: "showText", text: "One empty 20-amp socket. This is the puzzle's clear need." } } },
        { id: "pct_gate_hs", label: "GO — departure gate", bounds: { x: 84, y: 38, w: 15, h: 52 }, cursor: "go", gating: { requiresFlags: ["pct_signal_fixed"] }, customFailMessage: "The gate motor is interlocked with the dark signal.", action: { type: "goToScene", targetSceneId: "pct_note_puzzle" } },
        { id: "pct_leave_hs", label: "GO — leave the railway", bounds: { x: 1, y: 51, w: 7, h: 40 }, cursor: "go", action: { type: "goToScene", targetSceneId: "pct_leave" } },
      ],
      choices: [],
    },
    {
      id: "pct_note_puzzle", title: "NOTE ③ — Puzzle contract", nodeType: "note",
      note: "A fair inventory puzzle shows NEED, ITEM and RESULT: the empty socket communicates need; the toolbox supplies a matching fuse; the success response and green route communicate result. Check validates item ids, scene links and endings—but only playtesting can tell you whether the clue is readable.",
      background: "gradient:linear-gradient(135deg,#16303a,#081015)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [],
      choices: [{ id: "pct_note_puzzle_next", text: "Continue", targetSceneId: "pct_win" }],
    },
    {
      id: "pct_win", title: "Ending — Signal Green", isEnding: true,
      background: "/assets/point-click-template/yard.png", prose: "The signal wakes green. The gate rolls aside, and the little locomotive answers with a grateful hiss.", dialogueBeats: [], hotspots: [], choices: [],
      endingData: { tier: "victory-gold", headline: "YOUR FIRST INVENTORY PUZZLE", recap: "You explored two rooms, spoke to an NPC, collected an item, used it on the right object and opened a gated exit." },
    },
    {
      id: "pct_leave", title: "Ending — Tools Down", isEnding: true,
      background: "/assets/point-click-template/workshop.png", prose: "You leave the signal dark. This alternate exit demonstrates that point-and-click rooms can still branch into failure endings.", dialogueBeats: [], hotspots: [], choices: [],
      endingData: { tier: "gameover", headline: "THE LAST TRAIN WAITS", recap: "You left before repairing the signal. Return to Studio and trace the hotspot route back to the yard." },
    },
  ],
};
