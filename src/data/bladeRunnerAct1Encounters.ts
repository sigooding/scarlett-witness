import type { Character, ForegroundExtra, Hotspot, SceneNode, StageSettings } from "../types";
import { BR_HD_SHEETS, brHd, brHd3 } from "./bladeRunnerHdAssets";

export const BR_CHAPTER_ONE_CAST: Character[] = [
  { id: "br_mccoy", name: "Ray McCoy", role: "LAPD Blade Runner", avatarUrl: brHd3("mccoy-portrait.png"), trustMeter: 0, talkingSheet: BR_HD_SHEETS.mccoy },
  { id: "br_gordo", name: "Gordo Frizz", role: "Comedian / Chinatown regular", avatarUrl: brHd("gordo-portrait.png"), trustMeter: 0, talkingSheet: BR_HD_SHEETS.gordo, talkingX: 34 },
  { id: "br_zuben", name: "Zuben", role: "Howie's cook / replicant suspect", avatarUrl: brHd3("zuben-portrait.png"), trustMeter: 0, talkingSheet: BR_HD_SHEETS.zuben, talkingX: 64 },
];

export const BR_CHAPTER_ONE_FLAGS = {
  br_mainframe_synced: "Crime-scene evidence uploaded to the LAPD mainframe; lab comparison downloaded.",
  br_gordo_interviewed: "Questioned the man in the red coat at Howie Lee's.",
  br_zuben_lead: "Howie identified his cook, Zuben, as the next person to question.",
  br_zuben_dodged: "Dodged the pot in Howie's kitchen.",
  br_zuben_fled: "Zuben ran from the kitchen into the service alley.",
  br_zuben_ambush: "Tried the upper warehouse door; Zuben appeared behind McCoy.",
  br_zuben_resolved: "The warehouse confrontation is resolved; McCoy's decision is on record.",
  br_zuben_spared: "McCoy holstered his weapon and allowed Zuben to escape.",
  br_zuben_retired: "McCoy retired Zuben in the warehouse.",
  br_zuben_photo_taken: "Searched Zuben's coat and logged the photograph as evidence.",
  br_gaff_aftermath: "Spoke to Gaff outside Howie's after the warehouse; return to the alley dumpster.",
};

/** Serialized Studio features only: no Blade-Runner-specific runtime, input
 * interception or state-machine bypass. Old IDs and ungated recovery routes
 * remain usable. The original game's exact dialogue/voxel art is not copied. */
const stage = (caption: string): StageSettings => ({
  spawn: { x: 18, y: 89 }, floor: { top: 72, bottom: 94 }, speed: 23, reach: 5,
  keyboard: true, hotspotTrigger: "aim", plateAspectRatio: 16 / 9,
  playerScale: 1.8, depthScale: 0.18, hints: "proximity", enterCaption: caption,
});
const door = (id: string, label: string, targetSceneId: string, x: number): Hotspot => ({
  id, label, cursor: "go", bounds: { x, y: 53, w: 12, h: 39 },
  isRepeatable: true, walkOver: false, action: { type: "goToScene", targetSceneId },
});
const rayPose = (anim: string): ForegroundExtra => ({
  image: "", sheet: { ...BR_HD_SHEETS.mccoy, animations: { loop: BR_HD_SHEETS.mccoy.animations[anim] } },
  x: 69, y: 90, scale: .4, flip: true, anchor: "50% 100%",
});
const fleeingZuben: ForegroundExtra = {
  image: "", sheet: { ...BR_HD_SHEETS.zuben, animations: { loop: BR_HD_SHEETS.zuben.animations.run } },
  x: 45, y: 89, scale: .42, flip: true,
  motion: { points: [{ x: 45, y: 89 }, { x: 4, y: 89 }], duration: 2.5, delay: .5, loop: "once", fadeTo: 0 },
};
const debrief = (action: Hotspot["action"]): Pick<Hotspot, "action" | "states" | "isRepeatable"> => ({
  isRepeatable: false, action: { ...action, flagSet: "br_gaff_aftermath" },
  states: [{ id: "gaff_review", when: { requiresFlags: ["br_gaff_aftermath"] }, isRepeatable: true, action }],
});
const unresolved = { excludesFlags: ["br_zuben_resolved"] };
const ambush = { requiresFlags: ["br_zuben_ambush"], excludesFlags: ["br_zuben_resolved"] };

export const BR_CHAPTER_ONE_SCENES: SceneNode[] = [
  {
    id: "br_howie_kitchen", title: "9A — Howie Lee's Kitchen",
    nodeType: "stage", background: brHd("kitchen.webp"), prose: "",
    note: "Question Zuben: his conversation motion raises the pot. A successful six-second dodge performs on stage; a missed dodge remains recoverable. Both exits remain usable on revisits.",
    cinematic: { mode: "static", dimAmount: 0 },
    stage: {
      ...stage("HOWIE'S KITCHEN. THE COOK STOPS WORKING WHEN HE SEES YOUR BADGE."),
      npcs: [{ id: "br_npc_zuben_kitchen", sheet: BR_HD_SHEETS.zuben, x: 63, y: 85, scale: 1.95, facing: "left",
        idleAnim: "pot", talkAnim: "threat", talkHotspotId: "br_hs_zuben_question",
        gating: { excludesFlags: ["br_zuben_fled", "br_zuben_resolved"] } }],
      entrySpawns: { br_chinatown_alley: { x: 85, y: 90 } },
    },
    hotspots: [
      door("br_hs_kitchen_return", "GO — Back to Howie Lee's", "br_chinatown", 2),
      { ...door("br_hs_kitchen_alley", "GO — Kitchen back door", "br_chinatown_alley", 85),
        gating: { requiresFlags: ["br_zuben_fled"] }, customFailMessage: "Question the cook before following the service-alley lead." },
      { id: "br_hs_zuben_question", label: "TALK — Zuben, the cook", cursor: "talk", bounds: { x: 56, y: 43, w: 14, h: 44 },
        isRepeatable: true, gating: { excludesFlags: ["br_zuben_fled", "br_zuben_resolved"] }, hiddenWhenLocked: true,
        action: { type: "startDialogue" } },
      { id: "br_hs_kitchen_pot", label: "LOOK — Stockpot", cursor: "look", bounds: { x: 30, y: 52, w: 12, h: 22 }, isRepeatable: true,
        action: { type: "showText", text: "The cook grips the stockpot. Enough boiling broth to cover this narrow aisle. Leave room to move to your right." } },
    ],
    dialogueBeats: [
      { id: "br_zk1", characterId: "br_mccoy", text: "Zuben? I'm following up the attack at Runciter's. I need to ask you about the people who came through here. We can start with a routine test." },
      { id: "br_zk2", characterId: "br_zuben", text: "Routine? You bring that badge into my kitchen and call it routine?", expression: "angry" },
    ],
    choices: [{
      id: "br_zuben_dodge", text: "Dodge to the right", targetSceneId: "br_zuben_evade", attitudeTag: "Clever",
      quickTime: true, qtePrompt: "THE POT — MOVE!", timeLimitSeconds: 6, qteHeartbeat: true,
      consequences: { setFlags: ["br_zuben_dodged", "br_zuben_fled"] },
      timedOutTargetSceneId: "br_zuben_spilled", timedOutConsequences: { setFlags: ["br_zuben_fled"] },
      rememberLine: "You avoided the spill. The chase is still on.",
    }],
  },
  {
    id: "br_zuben_evade", title: "The pot — move right",
    nodeType: "stage", background: brHd("kitchen.webp"), prose: "",
    note: "Short visual consequence of an earned dodge, using the ordinary Stage script/pose/NPC tools. The continue and regroup doors are recovery routes, not progress-granting shortcuts.",
    cinematic: { mode: "static", dimAmount: 0 },
    stage: {
      ...stage("THE POT COMES OVER. DUCK RIGHT — KEEP CLEAR OF THE BROTH."),
      spawn: { x: 54, y: 89 }, speed: 32,
      npcs: [{ id: "br_npc_zuben_throw", sheet: { ...BR_HD_SHEETS.zuben, animations: { ...BR_HD_SHEETS.zuben.animations, walk: BR_HD_SHEETS.zuben.animations.run } },
        x: 63, y: 85, scale: 1.95, facing: "left", idleAnim: "threat", speed: 38 }],
      enterScript: [
        { do: "face", dir: "right" }, { do: "pose", pose: "duck" },
        { do: "npcMotion", npcId: "br_npc_zuben_throw", anim: "throw", facing: "left" },
        { do: "wait", seconds: .45 }, { do: "walkTo", x: 75, y: 91 }, { do: "pose" },
        { do: "npcWalkTo", npcId: "br_npc_zuben_throw", x: 94, y: 81 },
        { do: "wait", seconds: .2 }, { do: "goToScene", targetSceneId: "br_chinatown_alley" },
      ],
    },
    hotspots: [
      door("br_hs_evade_continue", "GO — Follow into the service alley", "br_chinatown_alley", 85),
      door("br_hs_evade_regroup", "GO — Regroup at the noodle bar", "br_chinatown", 2),
    ], dialogueBeats: [], choices: [],
  },
  {
    id: "br_zuben_spilled", title: "The spill — a second chance",
    background: brHd("kitchen.webp"), prose: "The pot hits the tiles. You stumble out of the scalding spray as Zuben disappears through the back door. A lost second, not a lost investigation. You can still follow him.",
    cinematic: { mode: "static", dimAmount: 0, foregroundExtras: [{ ...rayPose("duck"), x: 46, flip: false }, { ...fleeingZuben, flip: false, motion: { points: [{ x: 63, y: 85 }, { x: 96, y: 81 }], duration: 2, loop: "once", fadeTo: 0 } }] },
    choices: [
      { id: "br_spill_follow", text: "Get up and follow Zuben", targetSceneId: "br_chinatown_alley", attitudeTag: "Neutral" },
      { id: "br_spill_return", text: "Regroup at Howie's counter", targetSceneId: "br_chinatown", attitudeTag: "Neutral" },
    ], hotspots: [], dialogueBeats: [],
  },
  {
    id: "br_chinatown_alley", title: "9B — Chinatown Service Alley",
    nodeType: "stage", background: brHd3("chinatown-alley.webp"), prose: "",
    cinematic: { mode: "static", dimAmount: 0 }, particles: "rain",
    stage: {
      ...stage("SERVICE ALLEY. THE WAREHOUSE IS ON THE RIGHT; HOWIE'S IS BEHIND YOU."),
      playerScale: 1.5, depthScale: .35,
      floorPoints: [{ x: 4, y: 90 }, { x: 41, y: 62 }, { x: 57, y: 62 }, { x: 96, y: 92 }, { x: 96, y: 97 }, { x: 4, y: 97 }],
      entrySpawns: { br_warehouse_stairs: { x: 85, y: 92 }, br_zuben_warehouse: { x: 85, y: 92 }, br_howie_street: { x: 18, y: 90 } },
    },
    hotspots: [
      door("br_hs_alley_return", "GO — Back to the noodle bar", "br_chinatown", 2),
      { ...door("br_hs_alley_warehouse", "GO — Follow Zuben into the warehouse", "br_warehouse_stairs", 84),
        gating: { requiresFlags: ["br_zuben_fled"] }, customFailMessage: "No sign of the suspect here yet. Start with Howie's cook." },
      { id: "br_hs_alley_plate", label: "TAKE — License plate in the dumpster", cursor: "take", bounds: { x: 64, y: 60, w: 13, h: 24 },
        gating: { requiresFlags: ["br_zuben_resolved", "br_gaff_aftermath"] }, hiddenWhenLocked: true, walkOver: false,
        showItemImage: true, action: { type: "giveItem", itemGranted: "br_item_alley_plate", text: "Under the discarded packaging: a vehicle plate. Gaff's tip paid off. You log it as physical evidence, separate from the camera disk." } },
      { ...door("br_hs_alley_street", "GO — Out to Howie's street", "br_howie_street", 28), bounds: { x: 25, y: 61, w: 12, h: 25 } },
    ], dialogueBeats: [], choices: [],
  },
  {
    id: "br_warehouse_stairs", title: "9C — Warehouse Stairs",
    nodeType: "stage", background: brHd3("warehouse-stairs.webp"), prose: "",
    cinematic: { mode: "static", dimAmount: 0 },
    stage: {
      ...stage("THE STAIRS LEAD TO AN UPPER CORRIDOR. THE GARAGE IS A WAY BACK OUT."),
      spawn: { x: 12, y: 90 }, playerScale: 1.35, depthScale: .3,
      floorPoints: [{ x: 2, y: 87 }, { x: 35, y: 70 }, { x: 68, y: 74 }, { x: 81, y: 87 }, { x: 70, y: 56 }, { x: 79, y: 53 }, { x: 97, y: 91 }, { x: 97, y: 96 }, { x: 2, y: 96 }],
      entrySpawns: { br_zuben_warehouse: { x: 77, y: 59 }, br_howie_street: { x: 43, y: 86 } },
    },
    hotspots: [
      door("br_hs_stairs_alley", "GO — Back out to the service alley", "br_chinatown_alley", 2),
      { ...door("br_hs_stairs_upper", "GO — Climb to the upper corridor", "br_zuben_warehouse", 70), bounds: { x: 70, y: 29, w: 11, h: 29 } },
      { ...door("br_hs_stairs_garage", "GO — Garage exit to Howie's street", "br_howie_street", 39), bounds: { x: 39, y: 47, w: 14, h: 34 } },
    ], dialogueBeats: [], choices: [],
  },
  {
    id: "br_zuben_warehouse", title: "9D — Warehouse Confrontation",
    nodeType: "stage", background: brHd("warehouse.webp"), prose: "",
    cinematic: { mode: "static", dimAmount: 0 },
    stage: {
      ...stage("A LOCKED DOOR AHEAD. TRY THE HANDLE — LISTEN BEHIND YOU."),
      npcs: [{ id: "br_npc_zuben_warehouse", sheet: BR_HD_SHEETS.zuben, x: 28, y: 88, scale: 1.95, facing: "right",
        talkHotspotId: "br_hs_zuben_standoff", talkAnim: "talk", gating: ambush }],
    },
    hotspots: [
      door("br_hs_warehouse_return", "GO — Downstairs to the alley", "br_warehouse_stairs", 2),
      { id: "br_hs_zuben_standoff", label: "TALK — Confront Zuben", cursor: "talk", bounds: { x: 21, y: 46, w: 14, h: 43 }, isRepeatable: true,
        gating: ambush, hiddenWhenLocked: true, action: { type: "startDialogue" } },
      { id: "br_hs_warehouse_door", label: "USE — Try the locked fire door", cursor: "use", bounds: { x: 82, y: 35, w: 15, h: 51 }, walkOver: false,
        states: [
          { id: "door_after_ambush", isRepeatable: true, when: { requiresFlags: ["br_zuben_ambush"] }, action: { type: "showText", text: "Locked from the other side. Zuben is behind you. Talk to him, or back away and leave the decision open." } },
          { id: "door_after_case", isRepeatable: true, when: { requiresFlags: ["br_zuben_resolved"] }, action: { type: "showText", text: "Still locked. The confrontation is over; take the stairs or garage back out." } },
        ],
        action: { type: "runScript", flagSet: "br_zuben_ambush", script: [
          { do: "wait", seconds: .2 }, { do: "face", dir: "left" }, { do: "pose", pose: "draw" },
          { do: "npcWalkTo", npcId: "br_npc_zuben_warehouse", x: 48, y: 88 },
          { do: "say", npcId: "br_npc_zuben_warehouse", text: "Locked, detective. Now look at me." }, { do: "pose" },
        ] } },
      { ...door("br_hs_warehouse_garage", "GO — Leave through the garage", "br_howie_street", 67), bounds: { x: 67, y: 63, w: 12, h: 29 } },
    ],
    dialogueBeats: [{ id: "br_zw1", characterId: "br_zuben", text: "End of the corridor, detective. Is this where you decide what I am?" }],
    choices: [
      { id: "br_zuben_mercy", text: "Holster the blaster. Let Zuben go.", targetSceneId: "br_zuben_spared", attitudeTag: "Neutral", gating: unresolved,
        consequences: { setFlags: ["br_zuben_resolved", "br_zuben_spared"], clearFlags: ["br_zuben_retired"] },
        memoryLog: "br_zuben_choice", rememberLine: "You chose not to fire." },
      { id: "br_zuben_shoot", text: "Retire Zuben", targetSceneId: "br_zuben_retired", attitudeTag: "Aggressive",
        gating: { requiresItems: ["br_item_blaster"], excludesFlags: ["br_zuben_resolved"] },
        consequences: { setFlags: ["br_zuben_resolved", "br_zuben_retired"], clearFlags: ["br_zuben_spared"] },
        memoryLog: "br_zuben_choice", rememberLine: "The shot is part of your report now." },
      { id: "br_zuben_backaway", text: "Back away — keep the decision open", targetSceneId: "br_chinatown_alley", attitudeTag: "Neutral" },
    ],
  },
  {
    id: "br_zuben_spared", title: "Weapon holstered",
    background: brHd("warehouse.webp"), prose: "You lower the blaster. Zuben hesitates, then slips past you into the stairwell. The empty corridor tells you nothing about whether that was mercy or a mistake. It was your decision. Gaff is waiting outside near Howie's.",
    cinematic: { mode: "static", dimAmount: 0, foregroundExtras: [rayPose("holster"), fleeingZuben] },
    choices: [
      { id: "br_mercy_street", text: "Leave through the garage — speak to Gaff", targetSceneId: "br_howie_street", attitudeTag: "Neutral" },
      { id: "br_mercy_lapd", text: "Return to the LAPD mainframe", targetSceneId: "br_mainframe_hub", attitudeTag: "Neutral" },
      { id: "br_mercy_apt", text: "Go home and check the VidPhon", targetSceneId: "br_mccoy_apt", attitudeTag: "Neutral" },
    ], hotspots: [], dialogueBeats: [],
  },
  {
    id: "br_zuben_retired", title: "A shot in the warehouse",
    background: brHd("warehouse.webp"), prose: "The report will call it retirement. You secure the scene and record the encounter. Check Zuben's coat for evidence before leaving through the garage; Gaff is outside near Howie's. The restaurant carries on serving dinner.",
    cinematic: { mode: "static", dimAmount: 0, foregroundExtras: [rayPose("aim")] },
    choices: [
      { id: "br_retire_search", text: "Search Zuben's coat — log the photograph", targetSceneId: "br_zuben_retired", attitudeTag: "Neutral",
        gating: { requiresFlags: ["br_zuben_retired"], excludesFlags: ["br_zuben_photo_taken"] },
        consequences: { setFlags: ["br_zuben_photo_taken"], addItems: ["br_item_zuben_photo"] } },
      { id: "br_retire_street", text: "Leave through the garage — speak to Gaff", targetSceneId: "br_howie_street", attitudeTag: "Neutral" },
      { id: "br_retire_lapd", text: "Return to the LAPD mainframe", targetSceneId: "br_mainframe_hub", attitudeTag: "Neutral" },
      { id: "br_retire_apt", text: "Go home and review the case", targetSceneId: "br_mccoy_apt", attitudeTag: "Neutral" },
    ], hotspots: [], dialogueBeats: [],
  },
  {
    id: "br_howie_street", title: "9E — Gaff Outside Howie's",
    nodeType: "stage", background: brHd3("howie-street.webp"), prose: "",
    note: "Gaff appears after either Zuben outcome. His branch-specific debrief points back to the dumpster. Old direct HQ/home choices remain recovery shortcuts, not evidence-granting routes.",
    cinematic: { mode: "static", dimAmount: 0 }, particles: "rain",
    stage: {
      ...stage("HOWIE'S STREET. A PARKED SPINNER; THE CITY GOES ON AROUND YOU."),
      playerScale: 1.7, depthScale: .3,
      floorPoints: [{ x: 2, y: 90 }, { x: 44, y: 63 }, { x: 66, y: 66 }, { x: 65, y: 81 }, { x: 98, y: 91 }, { x: 98, y: 96 }, { x: 2, y: 96 }],
      entrySpawns: { br_chinatown_alley: { x: 47, y: 76 }, br_warehouse_stairs: { x: 36, y: 87 }, br_zuben_warehouse: { x: 36, y: 87 } },
      npcs: [{ id: "br_npc_gaff_street", sheet: BR_HD_SHEETS.gaff, x: 64, y: 86, scale: 1.7, facing: "left", talkAnim: "talk",
        talkHotspotId: "br_hs_gaff_aftermath", gating: { requiresFlags: ["br_zuben_resolved"] } }],
    },
    hotspots: [
      door("br_hs_street_howie", "GO — Inside Howie Lee's", "br_chinatown", 2),
      { ...door("br_hs_street_alley", "GO — Return to the service alley", "br_chinatown_alley", 42), bounds: { x: 42, y: 36, w: 14, h: 40 } },
      door("br_hs_street_lapd", "GO — Spinner to LAPD mainframe", "br_mainframe_hub", 85),
      { ...door("br_hs_street_home", "GO — Spinner home to the apartment", "br_mccoy_apt", 73), bounds: { x: 73, y: 62, w: 10, h: 30 } },
      { id: "br_hs_gaff_aftermath", label: "TALK — Gaff by the Spinner", cursor: "talk", bounds: { x: 58, y: 44, w: 13, h: 44 },
        isRepeatable: true, hiddenWhenLocked: true, gating: { requiresFlags: ["br_zuben_resolved"] },
        ...debrief({ type: "startDialogue", topicPrompt: "Gaff rests a hand on his cane. 'Before you leave, check the service-alley dumpster. Somebody was throwing away a vehicle plate.' He has heard about the warehouse.", topicLeaveLabel: "I'll check the alley. Then I'm going home.", topics: [
          { id: "br_t_gaff_mercy", label: "I let Zuben go", gating: { requiresFlags: ["br_zuben_spared"] }, flagSet: "br_gaff_aftermath", repeatable: true, beats: [
            { id: "br_gaff_mercy_1", characterId: "br_mccoy", text: "I holstered the blaster. He left." },
            { id: "br_gaff_mercy_2", characterId: "br_gaff", text: "Then put that in your report. Your decision, detective. Before you leave, check the service-alley dumpster. Somebody was getting rid of a vehicle plate." },
          ] },
          { id: "br_t_gaff_retire", label: "The warehouse retirement", gating: { requiresFlags: ["br_zuben_retired"] }, flagSet: "br_gaff_aftermath", repeatable: true, beats: [
            { id: "br_gaff_retire_1", characterId: "br_mccoy", text: "Zuben's dead. The scene is secured." },
            { id: "br_gaff_retire_2", characterId: "br_gaff", text: "Write what happened, not what makes it easier to sleep. Check the service-alley dumpster before you leave. There may be a vehicle plate in the rubbish." },
          ] },
          { id: "br_t_gaff_photo", label: "The photograph in Zuben's coat", gating: { requiresItems: ["br_item_zuben_photo"] }, repeatable: true, beats: [
            { id: "br_gaff_photo", characterId: "br_gaff", text: "Keep the original with the case evidence. A face in a photograph is a lead, not a verdict. Give the lab something it can actually compare." },
          ] },
        ] }) },
    ], dialogueBeats: [], choices: [],
  },
];
