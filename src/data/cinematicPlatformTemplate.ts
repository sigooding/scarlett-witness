import type { SpriteSheet } from "../game/spriteSheet";
import type { Story } from "../types";

const A = "/assets/cinematic-platform-template/";
const sheet = (image: string, frameWidth: number, frameHeight: number, animations: SpriteSheet["animations"]): SpriteSheet => ({
  image: A + image, frameWidth, frameHeight, animations, pixelated: false,
});

const RUNNER = sheet("runner-sheet.png", 455, 512, {
  idle: { frames: [0] }, walk: { frames: [1, 2, 1], fps: 8 }, run: { frames: [3, 1, 2], fps: 11 }, crouch: { frames: [4] }, reach: { frames: [5] },
});
const GUARD = sheet("guard-sheet.png", 232, 512, {
  idle: { frames: [0] }, walk: { frames: [1, 2, 1], fps: 7 }, search: { frames: [3, 0], fps: 3 }, alarm: { frames: [4] }, run: { frames: [5, 1, 2], fps: 10 },
});
const SEARCHLIGHT = sheet("searchlight-sheet.png", 322, 384, { loop: { frames: [0, 1, 2, 3, 2, 1], fps: 3 } });
const STEAM = sheet("steam-sheet.png", 1079, 384, { loop: { frames: [0, 1, 2, 3], fps: 4 } });
const SPARKS = sheet("sparks-sheet.png", 391, 384, { loop: { frames: [0, 1, 2, 3], fps: 7 } });
const CRATE = sheet("crate-sheet.png", 550, 384, { loop: { frames: [0] } });
const SWITCH = sheet("pressure-switch-sheet.png", 160, 256, { loop: { frames: [0, 1, 2], fps: 4 } });
const GATE = sheet("gate-sheet.png", 233, 512, { loop: { frames: [0] } });
const DRONE = sheet("drone-sheet.png", 1564, 256, { idle: { frames: [0, 1, 2, 1], fps: 5 }, alarm: { frames: [3, 4], fps: 8 } });
const SPLASH = sheet("water-splash-sheet.png", 172, 320, { loop: { frames: [0, 1, 2, 3, 4, 5], fps: 7 } });
const BEACON = sheet("red-beacon-sheet.png", 219, 256, { loop: { frames: [0, 1, 2, 3], fps: 5 } });
const CABLES = sheet("cable-sway-sheet.png", 190, 512, { loop: { frames: [0, 1, 2, 3, 2, 1], fps: 3 } });
const VALVE = sheet("valve-sheet.png", 127, 384, { loop: { frames: [0] } });

export const CINEMATIC_PLATFORM_TEMPLATE: Story = {
  id: "cinematic-platform-adventure-template",
  title: "Template: Cinematic Platform-Adventure",
  tagline: "An annotated no-HUD journey through hazards, machinery and environmental puzzles.",
  gameKind: "adventure",
  coverImage: A + "floodwall.png",
  startSceneId: "cpa_floodwall",
  playerSprite: { image: A + "runner-sheet.png", sheet: RUNNER },
  inventoryDisplay: { mode: "hidden", label: "Carried Parts" },
  layout: {
    cpa_floodwall: { x: 40, y: 220 }, cpa_note_ai: { x: 420, y: 30 }, cpa_note_limits: { x: 790, y: 30 },
    cpa_pumps: { x: 1160, y: 220 }, cpa_note_scripts: { x: 1540, y: 30 },
    cpa_sluice: { x: 1910, y: 220 }, cpa_note_hazards: { x: 2290, y: 30 },
    cpa_core: { x: 2660, y: 220 }, cpa_win: { x: 3040, y: 100 }, cpa_caught: { x: 3040, y: 400 },
  },
  briefing: {
    gameInfo: "A playable creator tutorial for cinematic side-view adventures. Cross four no-HUD stages, avoid authored hazards, operate machinery, trigger scripted sequences and inspect gold Studio note nodes explaining what Scarlet Reel can—and cannot—simulate compared with a physics platformer.",
    objective: "Cross the floodworks, open the pressure route, and reach the core chamber.",
    winConditions: ["Disable the perimeter searchlight.", "Hold the pump-hall pressure switch.", "Drain the sluice tunnel.", "Disable the core surveillance drone."],
    loseConditions: ["Cross an exposed hazard before disabling it."],
  },
  flagNotes: {
    cpa_fuse_found: "The runner found a ceramic fuse in the floodwall debris.", cpa_light_off: "The perimeter searchlight is disabled.",
    cpa_crate_placed: "The crate is holding the pump-hall pressure switch.", cpa_wheel_found: "The runner recovered the valve wheel.",
    cpa_water_lowered: "The sluice water has been lowered.", cpa_drone_off: "The core surveillance drone is disabled.",
  },
  characters: [],
  items: [
    { id: "cpa_fuse", name: "Ceramic Fuse", icon: "▥", description: "A dry auxiliary fuse found under the floodwall.", flavorText: "One dead circuit can be brought back." },
    { id: "cpa_wheel", name: "Valve Wheel", icon: "⊕", description: "A heavy iron handwheel with a square drive.", flavorText: "The tunnel valve is missing exactly this." },
  ],
  scenes: [
    {
      id: "cpa_floodwall", title: "1 — Floodwall Perimeter", nodeType: "stage", hideHud: true,
      note: "LESSON 1: A no-HUD Stage removes almost all interface chrome but keeps walking, markers, scripts and Esc-to-save. The searchlight is an animated foreground sprite. Scarlet Reel hazards are authored gates and interactions—not continuous collision volumes. Find the fuse, use it on the breaker, then cross. Deliberately crossing the lit ground demonstrates a failure route.",
      background: A + "floodwall.png", prose: "", dialogueBeats: [], choices: [],
      cinematic: { mode: "pan", panDirection: "right", panDistance: 3, filmGrade: true, filmGradeStrength: 0.45, foregroundExtras: [
        { image: A + "searchlight-sheet.png", sheet: SEARCHLIGHT, x: 78, y: 12, scale: 0.32, depth: 0.35 },
        { image: A + "debris-foreground.png", x: 22, y: 76, scale: 0.5, depth: 0.9, occludes: true },
        { image: A + "red-beacon-sheet.png", sheet: BEACON, x: 90, y: 19, scale: 0.18, depth: 0.4 },
      ] },
      stage: { playerSheet: RUNNER, playerScale: 0.42, spawn: { x: 6, y: 91 }, speed: 17, reach: 4, keyboard: true, floor: { top: 69, bottom: 95 }, depthScale: 0.18, hints: "proximity", enterCaption: "THE FLOODWALL. EVERY LIGHT IS LOOKING FOR SOMEONE.", obstacles: [{ x: 31, y: 74, w: 9, h: 15 }, { x: 61, y: 77, w: 7, h: 12 }] },
      hotspots: [
        { id: "cpa_fuse_hs", label: "ceramic fuse beneath the rebar", bounds: { x: 19, y: 71, w: 11, h: 16 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "cpa_fuse", flagSet: "cpa_fuse_found" } },
        { id: "cpa_breaker_hs", label: "searchlight breaker", bounds: { x: 48, y: 54, w: 11, h: 31 }, cursor: "use", gating: { requiresItems: ["cpa_fuse"] }, acceptsItems: ["cpa_fuse"], itemResponses: { cpa_fuse: "The auxiliary relay catches. The tower goes dark." }, action: { type: "useItem", itemConsumed: "cpa_fuse", flagSet: "cpa_light_off", text: "The auxiliary relay catches. The tower goes dark." }, image: A + "sparks-sheet.png", sheet: SPARKS },
        { id: "cpa_exposed_hs", label: "cross the exposed ground", bounds: { x: 74, y: 69, w: 13, h: 23 }, cursor: "go", gating: { excludesFlags: ["cpa_light_off"] }, action: { type: "goToScene", targetSceneId: "cpa_caught" } },
        { id: "cpa_perimeter_exit", label: "dark service entrance", bounds: { x: 88, y: 52, w: 11, h: 40 }, cursor: "go", gating: { requiresFlags: ["cpa_light_off"] }, customFailMessage: "The beam still owns the open ground.", action: { type: "goToScene", targetSceneId: "cpa_note_ai" } },
      ],
    },
    {
      id: "cpa_note_ai", title: "NOTE ② — Build assets in AI Images", nodeType: "note",
      note: "BUILT-IN ASSET PIPELINE: Open Studio → AI Images. Use a Sprite Sheet Starter for a walker, talking character, vehicle or effect; replace the example description with your own character; then Generate. Sprite mode automatically requests separated frames on flat magenta, keys out that backdrop, detects and slices the frames, builds named animations, and saves the finished transparent sheet into the Media Library. The result panel tells you where to assign it: Characters → talking sheet, Scene → sprite editor, Walkable Stage → player sheet, a hotspot's animated art, or Cinematic foreground extras. You can also generate a normal background plate, save it, then pick it in the Scene tab. For imported/generated art that was not made in Sprite mode, use Convert to animated sprite and choose character, vehicle or effect plus key strength/output size. Always preview the sheet: clean frame separation and a truly flat magenta background produce the best automatic cutout.",
      background: "gradient:linear-gradient(135deg,#193140,#071018)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [], choices: [{ id: "cpa_n_ai", text: "Continue", targetSceneId: "cpa_note_limits" }],
    },
    {
      id: "cpa_note_limits", title: "NOTE ③ — Platforming limits", nodeType: "note",
      note: "CURRENT LIMITS: this engine supports side-view walking, click routing, obstacles, jogging, poses, animated props, scripts and gated hazards. It does not provide free jumping, gravity, rigid-body crate physics, ledge grabbing, ropes, ragdolls or continuous enemy vision cones. Represent those ideas with authored hotspot zones, obstacle routing, animations, timed choices and scripted state changes. Note nodes are bypassed in play.",
      background: "gradient:linear-gradient(135deg,#171d21,#06080a)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [], choices: [{ id: "cpa_n1", text: "Continue", targetSceneId: "cpa_pumps" }],
    },
    {
      id: "cpa_pumps", title: "2 — Pump Hall Pressure Puzzle", nodeType: "stage", hideHud: true,
      note: "LESSON 2: This room demonstrates an authored push-crate puzzle. Clicking the crate runs a locked-input sequence: the player walks to it, adopts the reach pose, advances, sets a flag and speaks no dialogue. The engine does not physically simulate the crate; the script and flag represent the solved state. The pressure switch and gate are animated object art, while the exit gate requires cpa_crate_placed.",
      background: A + "pump-hall.png", prose: "", dialogueBeats: [], choices: [],
      cinematic: { mode: "dolly", dollyDirection: "right", dollyDistance: 4, dollyDuration: 14, foregroundExtras: [
        { image: A + "steam-sheet.png", sheet: STEAM, x: 21, y: 56, scale: 0.3, depth: 0.65, occludes: true },
        { image: A + "cable-sway-sheet.png", sheet: CABLES, x: 52, y: 2, scale: 0.38, depth: 0.55, occludes: true },
      ] },
      stage: { playerSheet: RUNNER, playerScale: 0.62, spawn: { x: 6, y: 91 }, speed: 16, reach: 4, keyboard: true, floor: { top: 67, bottom: 95 }, depthScale: 0.2, hints: "proximity", enterCaption: "THE PUMPS ARE STILL. THE GATE IS NOT.", obstacles: [{ x: 24, y: 72, w: 11, h: 17 }, { x: 60, y: 72, w: 8, h: 17 }], npcs: [{ id: "cpa_guard", sheet: GUARD, x: 72, y: 86, scale: 0.55, facing: "left", idleAnim: "search", speed: 7, patrolMode: "pingpong", patrol: [{ x: 78, y: 86, pause: 2, anim: "search" }, { x: 66, y: 86, pause: 2, anim: "search" }] }] },
      hotspots: [
        { id: "cpa_crate_hs", label: "push the crate onto the pressure switch", bounds: { x: 28, y: 66, w: 15, h: 23 }, cursor: "use", image: A + "crate-sheet.png", sheet: CRATE, action: { type: "runScript", flagSet: "cpa_crate_placed", script: [{ do: "walkTo", x: 29, y: 89 }, { do: "pose", pose: "reach" }, { do: "wait", seconds: 0.6 }, { do: "walkTo", x: 53, y: 89 }, { do: "setFlag", flag: "cpa_crate_placed" }, { do: "pose" }] } },
        { id: "cpa_switch_hs", label: "pressure switch", bounds: { x: 53, y: 81, w: 10, h: 8 }, cursor: "look", isRepeatable: true, image: A + "pressure-switch-sheet.png", sheet: SWITCH, action: { type: "showText", text: "The switch needs weight held on it. The crate is the only movable thing in the room." } },
        { id: "cpa_gate_hs", label: "raised pump gate", bounds: { x: 84, y: 35, w: 14, h: 55 }, cursor: "go", image: A + "gate-sheet.png", sheet: GATE, gating: { requiresFlags: ["cpa_crate_placed"] }, customFailMessage: "The gate drops whenever the pressure switch rises.", action: { type: "goToScene", targetSceneId: "cpa_note_scripts" } },
      ],
    },
    {
      id: "cpa_note_scripts", title: "NOTE ④ — Scripts sell the illusion", nodeType: "note",
      note: "SCRIPT RECIPE: walkTo approaches the prop; pose selects a named frame; wait provides weight; setFlag makes the result persistent. Scripts lock player input and can also move NPCs, face actors, show floating lines and route scenes. Keep them short. A script is choreography, not physics: make the plate, animation and sound communicate resistance and impact.",
      background: "gradient:linear-gradient(135deg,#171d21,#06080a)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [], choices: [{ id: "cpa_n2", text: "Continue", targetSceneId: "cpa_sluice" }],
    },
    {
      id: "cpa_sluice", title: "3 — Sluice Tunnel", nodeType: "stage", hideHud: true,
      note: "LESSON 3: Foreground water is an occluding layer that hides the runner's legs; animated splash sprites add motion. TAKE the wheel, then USE it on the valve. The item is consumed and cpa_water_lowered opens the pressure door. This is a classic environmental puzzle: visible missing part, nearby matching object, immediate world-state response.",
      background: A + "sluice-tunnel.png", prose: "", dialogueBeats: [], choices: [],
      cinematic: { mode: "zoom-hold", focalPoint: "72% 54%", zoomDuration: 15, dimAmount: 0.82, foregroundExtras: [
        { image: A + "water-splash-sheet.png", sheet: SPLASH, x: 38, y: 73, scale: 0.35, depth: 0.72 },
        { image: A + "water-foreground.png", x: 50, y: 75, scale: 0.85, depth: 0.95, occludes: true },
        { image: A + "red-beacon-sheet.png", sheet: BEACON, x: 80, y: 18, scale: 0.2, depth: 0.45 },
      ] },
      stage: { playerSheet: RUNNER, playerScale: 0.42, spawn: { x: 6, y: 91 }, speed: 14, reach: 4, keyboard: true, floor: { top: 72, bottom: 95 }, depthScale: 0.12, hints: "proximity", enterCaption: "THE WATER IS WARM. THE PRESSURE DOOR IS NOT.", obstacles: [{ x: 40, y: 76, w: 8, h: 13 }] },
      hotspots: [
        { id: "cpa_wheel_hs", label: "fallen valve wheel", bounds: { x: 24, y: 73, w: 12, h: 17 }, cursor: "take", showItemImage: true, action: { type: "giveItem", itemGranted: "cpa_wheel", flagSet: "cpa_wheel_found" } },
        { id: "cpa_valve_hs", label: "sluice valve spindle", bounds: { x: 67, y: 48, w: 13, h: 38 }, cursor: "use", image: A + "valve-sheet.png", sheet: VALVE, gating: { requiresItems: ["cpa_wheel"] }, acceptsItems: ["cpa_wheel"], itemResponses: { cpa_wheel: "The wheel catches. Water tears away through the lower channel." }, action: { type: "useItem", itemConsumed: "cpa_wheel", flagSet: "cpa_water_lowered", text: "The wheel catches. Water tears away through the lower channel." } },
        { id: "cpa_pressure_door", label: "pressure door", bounds: { x: 84, y: 28, w: 15, h: 61 }, cursor: "go", gating: { requiresFlags: ["cpa_water_lowered"] }, customFailMessage: "Water pressure pins the circular door shut.", action: { type: "goToScene", targetSceneId: "cpa_note_hazards" } },
      ],
    },
    {
      id: "cpa_note_hazards", title: "NOTE ⑤ — Fair authored hazards", nodeType: "note",
      note: "HAZARD CONTRACT: telegraph danger, provide a readable countermeasure, and show a consequence. The floodwall beam telegraphs surveillance; the fuse disables it; crossing early reaches a game-over scene. This is deterministic authoring rather than stealth AI. For moving enemies, use patrolling NPCs plus a gated interaction or timed choice—do not promise free-form detection the engine does not perform.",
      background: "gradient:linear-gradient(135deg,#171d21,#06080a)", prose: "Studio instruction — bypassed in play.", dialogueBeats: [], hotspots: [], choices: [{ id: "cpa_n3", text: "Continue", targetSceneId: "cpa_core" }],
    },
    {
      id: "cpa_core", title: "4 — Core Chamber Finale", nodeType: "stage", hideHud: true,
      note: "LESSON 4: An ambient drone patrol provides visible pressure. The breaker hotspot runs a finale script, disables surveillance and then leaves the core exit available. The drone sheet is decorative animation, not autonomous combat AI. Use camera, foreground depth, captions and short scripts to make a mechanically simple gate feel cinematic.",
      background: A + "core-chamber.png", prose: "", dialogueBeats: [], choices: [],
      cinematic: { mode: "dolly-zoom", dollyZoomAmount: 1.16, dollyZoomDuration: 12, dollyZoomDirection: "both", parallaxDepth: 0.28, foregroundExtras: [
        { image: A + "cable-sway-sheet.png", sheet: CABLES, x: 18, y: 1, scale: 0.45, depth: 0.8, occludes: true },
        { image: A + "sparks-sheet.png", sheet: SPARKS, x: 73, y: 41, scale: 0.35, depth: 0.65 },
      ] },
      stage: { playerSheet: RUNNER, playerScale: 0.62, spawn: { x: 6, y: 91 }, speed: 17, reach: 4, keyboard: true, floor: { top: 69, bottom: 95 }, depthScale: 0.18, hints: "proximity", enterCaption: "THE CORE IS AWAKE. SO IS ITS WATCHER.", obstacles: [{ x: 38, y: 72, w: 12, h: 18 }], npcs: [{ id: "cpa_drone", image: A + "drone-sheet.png", sheet: DRONE, x: 30, y: 30, scale: 0.3, speed: 10, patrolMode: "pingpong", patrol: [{ x: 68, y: 24, pause: 1.2 }, { x: 27, y: 34, pause: 1.2 }] }] },
      hotspots: [
        { id: "cpa_drone_look", label: "surveillance drone", bounds: { x: 37, y: 18, w: 18, h: 22 }, cursor: "look", remote: true, isRepeatable: true, action: { type: "showText", text: "It follows a fixed patrol for presentation. The breaker is the authored countermeasure." } },
        { id: "cpa_core_breaker", label: "core surveillance breaker", bounds: { x: 71, y: 48, w: 12, h: 37 }, cursor: "use", action: { type: "runScript", flagSet: "cpa_drone_off", script: [{ do: "walkTo", x: 72, y: 89 }, { do: "pose", pose: "reach" }, { do: "wait", seconds: 0.8 }, { do: "setFlag", flag: "cpa_drone_off" }, { do: "say", text: "The red eye folds into darkness." }, { do: "pose" }] } },
        { id: "cpa_core_exit", label: "enter the core chamber", bounds: { x: 86, y: 31, w: 13, h: 58 }, cursor: "go", gating: { requiresFlags: ["cpa_drone_off"] }, customFailMessage: "The drone's red eye tracks the exposed walkway.", action: { type: "goToScene", targetSceneId: "cpa_win" } },
      ],
    },
    { id: "cpa_win", title: "Ending — Below the Floodworks", isEnding: true, background: A + "core-chamber.png", prose: "The surveillance grid dies. Beyond the glass, the submerged machinery turns once—as if something vast has noticed you noticing it.", dialogueBeats: [], hotspots: [], choices: [], endingData: { tier: "victory-gold", headline: "THE WAY BELOW", recap: "You crossed four no-HUD stages using authored hazards, inventory gates, scripted machinery, animated props and cinematic foreground depth." } },
    { id: "cpa_caught", title: "Ending — White Light", isEnding: true, background: A + "floodwall.png", prose: "The beam stops moving. So do you. Boots strike concrete beyond the fence, all arriving at the same answer.", dialogueBeats: [], hotspots: [], choices: [], endingData: { tier: "gameover", headline: "WHITE LIGHT", recap: "You crossed before disabling the searchlight. The hazard was authored as a clear gate with a visible countermeasure." } },
  ],
};
