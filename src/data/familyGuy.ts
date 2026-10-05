import type { DialogueBeat, SceneNode, StageSettings, Story } from "../types";

const art = (name: string) => `/assets/family-guy/${name}`;
const line = (id: string, characterId: string, text: string, extra: Partial<DialogueBeat> = {}): DialogueBeat => ({ id: `fg_${id}`, characterId: `fg_${characterId}`, text, ...extra });
const cue = (id: string, text: string, file: string): DialogueBeat => ({ id: `fg_${id}`, characterId: "narrator", text, silent: true, audioUrl: art(`${file}.wav`) });
const floor: StageSettings = {
  floor: { top: 73, bottom: 95 }, spawn: { x: 78, y: 88 }, keyboard: true,
  speed: 26, reach: 5, depthScale: 0.18, playerScale: 0.86, hints: "always",
  verbCoin: true, objectVerbMenu: true,
};
const room = (id: string, title: string, background: string, extra: Partial<SceneNode>): SceneNode => ({
  id: `fg_${id}`, title, background: art(`${background}.webp`), prose: "", ambientAudio: "none",
  noTypewriter: true, hideSceneTitle: true, particles: "none", transition: "fade", transitionSpeed: 0.25,
  cinematic: { mode: "static" }, dialogueBeats: [], choices: [], hotspots: [], ...extra,
});

/** Original, unofficial Family Guy fan-test reel. Every asset is local;
 * dialogue uses the browser's synthetic reader, NOT cloned actor voices.
 * The small WAVs are explicitly labelled sound cues for deterministic media
 * preload tests. See docs/studio-ship-check.md for the full regression matrix. */
export const FAMILY_GUY: Story = {
  id: "family-guy-remote-control",
  title: "Family Guy: Remote Control",
  tagline: "One remote. Three wrong buttons. A very ordinary multiverse emergency.",
  gameKind: "adventure",
  coverImage: art("living-room.webp"),
  startSceneId: "fg_title",
  playerSprite: {
    sheet: {
      image: art("peter-sheet.png"), frameWidth: 352, frameHeight: 464,
      animations: { idle: { frames: [0] }, walk: { frames: [0, 1, 2, 3], fps: 7 }, talk: { frames: [0, 1], fps: 5 } },
      pixelated: false,
    },
  },
  inventoryDisplay: { mode: "modal", startClosed: true, label: "Peter's pockets", tileSize: 112 },
  briefing: {
    gameInfo: "An unofficial, original Family Guy fan adventure and Studio QA reel. Peter borrows Stewie's universal remote. Unfortunately, universal is literal. Explore the house, combine the remote and batteries, catch Brian's fib, tune the machine, and survive a timed final choice. Includes annotated scenes for Studio testing. Character speech uses your browser's synthetic voices; the recorded WAVs are original sound cues, not actor recordings.",
    objective: "Restore normal television before Lois gets back from the kitchen.",
    winConditions: ["Combine the empty remote with batteries.", "Install it in Stewie's machine and tune GREEN + BLUE.", "Choose the blue button. Catch Brian's lie for the gold ending."],
    loseConditions: ["Press the red button, or let the final countdown expire."],
  },
  dialogueBox: { hideCaseProgress: true, hideCorkboard: false, hideMap: false },
  flagNotes: {
    fg_careful: "Peter promised to fix the remote properly (the opening choice).",
    fg_blame: "Peter blamed Brian in the opening choice.",
    fg_remote: "The remote has been picked up. Doors use this flag so crafting cannot relock them.",
    fg_mission: "The lab and pub are unlocked after the cold open.",
    fg_receipt: "The suspicious pub receipt is in Peter's pocket.",
    fg_caught: "Brian's claim was contradicted with the receipt; unlocks the gold ending.",
    fg_installed: "The powered remote has been installed. The machine changes state.",
    fg_tuned: "The two correct frequencies were selected.",
    fg_signal: "Brian explained the colour code.",
    fg_deduction: "The receipt was connected to Brian on the corkboard (optional).",
    fg_hesitated: "The final QTE expired. It must use its own fail wire.",
  },
  characters: [
    { id: "fg_peter", name: "Peter Griffin", role: "Remote-control enthusiast", avatarUrl: art("peter.png"), trustMeter: 0, voice: { pitch: 0.82, rate: 1.08 } },
    { id: "fg_lois", name: "Lois Griffin", role: "The only adult in the room", avatarUrl: art("lois.png"), trustMeter: 0, voice: { pitch: 1.12, rate: 1.05 } },
    { id: "fg_brian", name: "Brian Griffin", role: "Suspiciously well-informed dog", avatarUrl: art("brian.png"), trustMeter: 0, voice: { pitch: 0.9, rate: 0.98 } },
    { id: "fg_stewie", name: "Stewie Griffin", role: "Inventor; reluctant technical support", avatarUrl: art("stewie.png"), trustMeter: 0, voice: { pitch: 1.2, rate: 1.03 } },
  ],
  items: [
    { id: "fg_remote_item", name: "Empty remote", icon: "▤", iconUrl: art("remote.svg"), description: "Stewie's universal remote. Its battery compartment is empty.", flavorText: "Universal. In retrospect, a warning.", combinableWith: { targetItemId: "fg_batteries", resultItemId: "fg_powered_remote" } },
    { id: "fg_batteries", name: "Two batteries", icon: "▥", iconUrl: art("batteries.svg"), description: "Found under the sofa. Still good.", flavorText: "Combine these with the empty remote." },
    { id: "fg_powered_remote", name: "Powered remote", icon: "▣", iconUrl: art("powered-remote.svg"), description: "It is powered up and ready for Stewie's machine.", flavorText: "USE this on the machine in the basement." },
    { id: "fg_receipt_item", name: "Brian's receipt", icon: "▧", iconUrl: art("receipt.svg"), description: "Drunken Clam. One universal signal booster. Customer: Brian. Tune GREEN + BLUE; never RED.", flavorText: "Evidence beats a confident explanation.", isClue: true },
  ],
  deduction: { suspectIds: ["fg_brian"], connections: [{ a: "fg_receipt_item", b: "fg_brian", flagSet: "fg_deduction", revelation: "Brian bought the booster. This was not a random accident." }] },
  map: {
    title: "A very small slice of Quahog", backgroundImage: art("yard.webp"),
    locations: [
      { id: "fg_map_home", label: "Griffin living room", targetSceneId: "fg_living", x: 32, y: 57, icon: "⌂", gating: { requiresFlags: ["fg_mission"] } },
      { id: "fg_map_lab", label: "Stewie's basement", targetSceneId: "fg_basement", x: 51, y: 72, icon: "⚙", gating: { requiresFlags: ["fg_remote"] }, lockedHint: "Pick up the remote first." },
      { id: "fg_map_clam", label: "The Drunken Clam", targetSceneId: "fg_clam", x: 81, y: 39, icon: "♧", gating: { requiresFlags: ["fg_mission"] } },
    ],
  },
  acts: [
    { id: "fg_act_setup", label: "Act One", title: "Technical difficulties", startSceneId: "fg_title", titleCardSeconds: 0 },
    { id: "fg_act_payoff", label: "Act Two", title: "Do not press red", startSceneId: "fg_countdown", titleCardSeconds: 0 },
  ],
  layout: {
    fg_title: { x: 0, y: 240 }, fg_cold: { x: 320, y: 240 }, fg_living: { x: 660, y: 240 },
    fg_note: { x: 990, y: 0 }, fg_basement: { x: 1320, y: 240 }, fg_yard: { x: 990, y: 640 },
    fg_clam: { x: 1320, y: 720 }, fg_countdown: { x: 1670, y: 240 }, fg_reset: { x: 2010, y: 100 },
    fg_verdict: { x: 2350, y: 100 }, fg_gold: { x: 2690, y: 0 }, fg_silver: { x: 2690, y: 380 }, fg_fail: { x: 2010, y: 640 },
  },
  scenes: [
    room("title", "Remote Control", "living-room", {
      nodeType: "credits", prose: "FAMILY GUY\nREMOTE CONTROL\nAn unofficial Studio test reel",
      note: "CREDITS + START. A credits opener is a valid start scene. All art is local. Open Scene → title-sequence controls, Audio, then Play. The coach must not ask you to replace this start marker.",
      noTypewriter: false,
      choices: [{ id: "fg_begin", text: "Start the remote incident", targetSceneId: "fg_cold" }],
    }),
    room("cold", "Technical difficulties", "living-room", {
      note: "RAIL + LOOKAHEAD. While these lines play, fg_living's background and first conversation cue should already be loading. Choices record flags, trust, and a remembered line. The two approaches are exclusive.",
      onEnterActions: [{ consequences: { setFlags: ["fg_mission"] } }],
      dialogueBeats: [
        cue("cold_cue", "The remote chirps. Every channel now shows Peter looking for the remote.", "channel"),
        line("cold_peter", "peter", "Lois, good news. I'm finally on television. Bad news: so is the television."),
        line("cold_brian", "brian", "You borrowed a universal remote from a baby with a particle accelerator. How narrow did you expect the word universal to be?"),
      ],
      choices: [
        { id: "fg_careful_choice", text: "Fix it properly. No more random buttons.", targetSceneId: "fg_living", exclusiveGroup: "fg_approach", attitudeTag: "Clever", consequences: { setFlags: ["fg_careful"], trustChanges: [{ characterId: "fg_brian", delta: 1 }] }, memoryLog: "fg_plan", rememberLine: "Brian will remember the plan." },
        { id: "fg_blame_choice", text: "This feels like a dog problem, Brian.", targetSceneId: "fg_living", exclusiveGroup: "fg_approach", consequences: { setFlags: ["fg_blame"], trustChanges: [{ characterId: "fg_brian", delta: -1 }] }, memoryLog: "fg_plan" },
      ],
    }),
    room("living", "Griffin living room", "living-room", {
      nodeType: "stage",
      note: "ADVENTURE. TAKE the remote and batteries, TALK to Lois, combine the items in Peter's pockets. The basement door routes through a note. The right screen edge leads to the yard. Try both keyboard and click-to-walk; repeatable exits must survive backtracking.",
      stage: { ...floor, obstacles: [{ x: 37, y: 73, w: 19, h: 7 }], npcs: [{ id: "fg_lois_npc", image: art("lois.png"), x: 8, y: 88, scale: 0.8, facing: "right", talkHotspotId: "fg_talk_lois" }], exitEdges: { right: { targetSceneId: "fg_yard", label: "Front yard" } } },
      dialogueBeats: [cue("lois_cue", "From the kitchen: a timer dings. This is now a deadline.", "channel"), line("lois_1", "lois", "Peter, the remote is on the table. The batteries are under the sofa. Please solve one problem without creating a larger, glowing problem."), line("lois_2", "peter", "Okay. But if the sofa has a warranty dimension, I'm checking it.")],
      hotspots: [
        { id: "fg_take_remote", label: "Remote on the table", bounds: { x: 43, y: 63, w: 10, h: 22 }, cursor: "take", action: { type: "giveItem", itemGranted: "fg_remote_item", flagSet: "fg_remote", text: "Empty. Even the batteries have escaped." } },
        { id: "fg_take_batteries", label: "Batteries under the sofa", bounds: { x: 17, y: 64, w: 10, h: 10 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "fg_batteries", text: "Two batteries. A more sensible pair of protagonists." } },
        { id: "fg_talk_lois", label: "Talk to Lois", bounds: { x: 3, y: 43, w: 10, h: 42 }, cursor: "talk", isRepeatable: true, action: { type: "startDialogue" } },
        { id: "fg_lab_door", label: "Down to Stewie's lab", bounds: { x: 50, y: 28, w: 12, h: 36 }, cursor: "go", isRepeatable: true, gating: { requiresFlags: ["fg_remote"] }, customFailMessage: "Bring the remote. Technical support insists on seeing the problem.", action: { type: "goToScene", targetSceneId: "fg_note" } },
      ],
    }),
    room("note", "QA — the next room must already be warm", "basement", {
      nodeType: "note", note: "BYPASS. This node is not played. Both preload and navigation must follow it to fg_basement, not try to load this placeholder. Duplicate, rewire, delete and undo this node to exercise Studio graph editing.",
      choices: [{ id: "fg_bypass", text: "Into the basement", targetSceneId: "fg_basement" }],
    }),
    room("basement", "Stewie's basement", "basement", {
      nodeType: "stage",
      note: "MULTI-STATE OBJECT + CRAFTING + PUZZLE. The machine starts as a USE target. Install the powered remote (consumed), then click again to tune GREEN + BLUE. Wrong answers allow retry. Correct tuning routes to the timed rail scene. Test flag fg_installed in the Test tab and inspect its separate state-route wire.",
      stage: { ...floor, spawn: { x: 88, y: 90 }, npcs: [{ id: "fg_stewie_npc", image: art("stewie.png"), x: 24, y: 85, scale: 0.46, facing: "right", talkHotspotId: "fg_talk_stewie" }], exitEdges: { right: { targetSceneId: "fg_living", label: "Back upstairs" } } },
      dialogueBeats: [cue("stewie_cue", "The machine answers with three increasingly annoyed beeps.", "lab"), line("stewie_1", "stewie", "I built that remote to control a universe. You have somehow put it on the shopping channel."), line("stewie_2", "stewie", "Power it up, use it on the machine, and select green and blue. Brian bought the signal booster. Ask him why.")],
      hotspots: [
        { id: "fg_talk_stewie", label: "Talk to Stewie", bounds: { x: 19, y: 56, w: 12, h: 27 }, cursor: "talk", isRepeatable: true, action: { type: "startDialogue" } },
        { id: "fg_machine", isRepeatable: true, gating: { requiresItems: ["fg_powered_remote"] }, label: "Install the powered remote", bounds: { x: 32, y: 29, w: 35, h: 37 }, cursor: "use", acceptsItems: ["fg_powered_remote"], itemResponses: { fg_powered_remote: "The remote clicks into its slot. The three frequency lamps wake up." }, customFailMessage: "Combine the remote and batteries first, then USE the powered remote here.", action: { type: "useItem", itemConsumed: "fg_powered_remote", flagSet: "fg_installed", text: "Installed. Now tune the two safe colours." },
          verbs: { look: { type: "showText", text: "Three lamps: green, blue, red. A sticker says NEVER RED in Stewie's handwriting." } },
          states: [
            { id: "fg_machine_installed", gating: null, acceptsItems: null, when: { requiresFlags: ["fg_installed"] }, label: "Tune the signal", cursor: "use", action: { type: "patternPuzzle", patternPuzzle: { title: "Stewie's signal tuner", instruction: "Select the two safe frequencies. GREEN + BLUE. Never RED.", targetCount: 2, allowRetry: true, rows: [{ id: "fg_green", date: "01", description: "GREEN — home frequency", amount: "440 Hz", isAnswer: true }, { id: "fg_blue", date: "02", description: "BLUE — stabiliser", amount: "660 Hz", isAnswer: true }, { id: "fg_red", date: "03", description: "RED — shopping universe", amount: "999 Hz", isAnswer: false }], payoffText: "The picture stabilises. One final button remains.", wrongMessage: "That includes red. The shopping universe has put you on hold. Try green and blue.", rewardConsequences: { setFlags: ["fg_tuned"] }, targetSceneId: "fg_countdown" } } },
          ],
        },
      ],
    }),
    room("yard", "A quiet street in Quahog", "yard", {
      nodeType: "stage",
      note: "CLUE + TRAVEL. The receipt is optional evidence for the gold ending. The left walk-off exit returns home. The pub door and the travel map both reach a rail scene. The map never bypasses inventory requirements in the lab.",
      stage: { ...floor, spawn: { x: 22, y: 89 }, exitEdges: { left: { targetSceneId: "fg_living", label: "Back home" } } },
      hotspots: [
        { id: "fg_receipt_hs", label: "Receipt in the mailbox", bounds: { x: 67, y: 60, w: 10, h: 21 }, cursor: "take", action: { type: "giveItem", itemGranted: "fg_receipt_item", flagSet: "fg_receipt", text: "A signal booster, billed to Brian at the Clam. The receipt says GREEN + BLUE, never RED." } },
        { id: "fg_pub_door", label: "Walk to the Drunken Clam", bounds: { x: 86, y: 58, w: 12, h: 25 }, cursor: "go", isRepeatable: true, action: { type: "goToScene", targetSceneId: "fg_clam" } },
        { id: "fg_map_hs", label: "Quahog street map", bounds: { x: 3, y: 32, w: 10, h: 25 }, cursor: "look", remote: true, isRepeatable: true, action: { type: "openMap" } },
      ],
    }),
    room("clam", "The Drunken Clam", "clam", {
      note: "RAIL CONVERSATION + LIE. Carry the receipt, advance to Brian's claim, then press it and present the receipt. The injected caught beat sets fg_caught. The reply choice unlocks a gated beat. Return travel remains repeatable. This scene also exercises first-cue preloading from an adventure door.",
      dialogueBeats: [
        cue("pub_cue", "The pub's ancient television makes two reassuringly ordinary noises.", "clam"),
        line("brian_claim", "brian", "For the record, I have never bought a multiversal signal booster. That is a very specific accusation.", { lie: { evidenceItemIds: ["fg_receipt_item"], contradictedFlag: "fg_caught", caughtBeat: line("brian_caught", "brian", "Fine. I wanted international public radio. I did not ask for radio from every possible international.", { conditionRule: { requiresFlags: ["fg_caught"] } }), wrongBeat: line("brian_wrong", "brian", "Those are batteries, Peter. They are not sworn testimony."), wrongEvidenceLimit: 2, contradictedConsequences: { trustChanges: [{ characterId: "fg_brian", delta: 1 }] } } }),
        line("brian_code", "brian", "Green and blue. I remember the instructions because they were the only two words I read.", { conditionRule: { requiresFlags: ["fg_signal"] } }),
      ],
      choices: [
        { id: "fg_ask_code", text: "What colours did the instructions say?", reply: true, consequences: { setFlags: ["fg_signal"] }, isRepeatable: false },
        { id: "fg_pub_back", text: "Back to the front yard", targetSceneId: "fg_yard", isRepeatable: true },
        { id: "fg_pub_lab", text: "Back to Stewie's lab", targetSceneId: "fg_basement", isRepeatable: true, gating: { requiresFlags: ["fg_remote"] } },
      ],
    }),
    room("countdown", "The last wrong button", "basement", {
      note: "QUICK-TIME. Blue succeeds; its separate timeout wire and the red choice fail. Delete only the timeout wire and undo: the blue success destination must remain intact. Open Test to inject fg_tuned and compare both routes.",
      dialogueBeats: [cue("countdown_cue", "The machine's final confirmation tone is much less reassuring.", "lab"), line("countdown_stewie", "stewie", "Blue restores the television. Red subscribes reality to a premium bundle. You have eight seconds. I wish that were a metaphor.")],
      choices: [
        { id: "fg_blue_button", text: "Press BLUE. Restore normal television.", targetSceneId: "fg_reset", quickTime: true, timeLimitSeconds: 8, qteHeartbeat: true, timedOutTargetSceneId: "fg_fail", timedOutConsequences: { setFlags: ["fg_hesitated"] } },
        { id: "fg_red_button", text: "Press RED. It is the bigger button.", targetSceneId: "fg_fail", attitudeTag: "Aggressive" },
      ],
    }),
    room("reset", "Back on the air", "yard", {
      note: "AFTER-BEAT CUT. A replacement plate, recorded cue, then a remembered line. The last beat routes automatically to the verdict. The canvas must have a distinct after-beat handle, and the verdict media should warm during this line.",
      dialogueBeats: [cue("reset_cue", "Click. One house, one universe, one slightly disappointed shopping presenter.", "ending"), line("reset_brian", "brian", "You fixed it. Against a very impressive body of evidence, you fixed it.", { recalls: { fg_plan: "Your plan was: {said}. Somehow that worked." }, background: art("living-room.webp"), backgroundTransition: "crossfade", afterBeatTargetSceneId: "fg_verdict", afterBeatMode: "auto", afterBeatDelaySeconds: 2 })],
    }),
    room("verdict", "Who gets the credit?", "living-room", {
      note: "GATED ENDINGS. Exactly one finish choice is visible. fg_caught leads to gold; otherwise silver. The optional corkboard is independent of the lie reward. Test both flags, then publish/export the draft.",
      dialogueBeats: [line("verdict_lois", "lois", "The television works, the house exists, and nobody has explained the dog-shaped charge on the credit card.")],
      choices: [
        { id: "fg_gold_choice", text: "Give Lois Brian's very specific explanation.", hidden: true, gating: { requiresFlags: ["fg_caught"] }, targetSceneId: "fg_gold" },
        { id: "fg_silver_choice", text: "Put the remote down. Walk away slowly.", hidden: true, gating: { excludesFlags: ["fg_caught"] }, targetSceneId: "fg_silver" },
      ],
    }),
    room("gold", "A responsible adult, briefly", "living-room", {
      note: "GOLD ENDING. Reward for solving the machine and proving Brian bought the booster. Check ending gallery, save/resume and the completed route map.",
      prose: "Lois takes the remote. Brian takes the receipt. Peter takes credit for reading two colours. For one whole evening, this is enough.",
      isEnding: true, endingData: { tier: "victory-gold", headline: "NORMAL SERVICE RESUMED", recap: "You repaired reality and caught Brian's lie. Lois has instituted a remote-control sign-out sheet." },
    }),
    room("silver", "Close enough for television", "yard", {
      note: "SILVER ENDING. The playable completion without optional evidence. No hidden clue may be required to finish.",
      prose: "The house returns to normal. Brian quietly tears up a receipt. Peter discovers the television's own power button and calls Stewie a genius.",
      isEnding: true, endingData: { tier: "victory-silver", headline: "TECHNICALLY FIXED", recap: "Reality is back. The billing mystery will have to wait for another episode." },
    }),
    room("fail", "Terms and conditions apply", "clam", {
      note: "FAILURE / TIMEOUT. The same final card is reachable both deliberately and by doing nothing. Rewind must seal at this ending; restart must reset the pockets and flags.",
      prose: "Every surface in Quahog becomes a shopping channel. Stewie stares at Peter. Somewhere, a very small printer begins a very long receipt.",
      isEnding: true, endingData: { tier: "gameover", headline: "REALITY: SUBSCRIBED", recap: "The red button won. The cancellation number is in another universe." },
    }),
  ],
};
