import type { Story } from "../types";

/**
 * CROSSTOWN — the travel-map demo case.
 *
 * Purpose: open Studio, pick this case (or just play it from the newsstand)
 * to see the 🗺 Travel Map system end to end:
 *
 *  - `story.map` with four pins on a drawn city map (public/img/map-crosstown.jpg)
 *  - two pins open from the start, one LOCKED-VISIBLE ("???" + teaser line)
 *    until a flag is earned, one HIDDEN entirely until its flag is set
 *  - unlocks are pure gating (`requiresFlags`) — nothing is stored in the save
 *  - an `openMap` hotspot (the wall map in the office) alongside the HUD
 *    menu entry and the T hotkey
 *  - every map destination is also reachable through ordinary gated choices,
 *    so the deep-walker and the validator can prove the endings reachable
 *    without ever touching the map. The map is the fast, visual way around —
 *    not the only way.
 *
 * Flags: cm_tip_docks (diner counterman names the pier — opens the Docks pin),
 * cm_saw_ledger (the ledger at the docks names the warehouse — reveals the
 * hidden Warehouse pin).
 */
export const MAP_DEMO: Story = {
  id: "map-demo",
  title: "Crosstown",
  tagline: "The city opens one confession at a time. Work the map.",
  coverImage: "/img/map-crosstown.jpg",
  startSceneId: "cm_office",
  layout: {
    cm_office: { x: 0, y: 260 },
    cm_diner: { x: 400, y: 60 },
    cm_docks: { x: 400, y: 460 },
    cm_warehouse: { x: 800, y: 260 },
    cm_end_win: { x: 1200, y: 140 },
    cm_end_bust: { x: 1200, y: 420 },
  },
  briefing: {
    objective: "Follow the tips across town — diner to docks to warehouse — and bring the ledger home.",
    winConditions: ["Find the ledger and call it in with backup (victory)."],
    loseConditions: ["Walk into the warehouse alone (game over)."],
  },
  flagNotes: {
    cm_tip_docks: "The counterman named Pier 9 — the Docks are on the map now.",
    cm_saw_ledger: "The ledger names a warehouse on Coldwater Row — a hidden pin just surfaced.",
  },
  map: {
    title: "Crosstown — City Map",
    backgroundImage: "/img/map-crosstown.jpg",
    locations: [
      { id: "cm_loc_office", label: "Your Office", targetSceneId: "cm_office", x: 68, y: 21, icon: "🏢" },
      { id: "cm_loc_diner", label: "Milly's Diner", targetSceneId: "cm_diner", x: 31, y: 31, icon: "🍩" },
      {
        id: "cm_loc_docks",
        label: "Pier 9",
        targetSceneId: "cm_docks",
        x: 55,
        y: 84,
        icon: "⚓",
        gating: { requiresFlags: ["cm_tip_docks"] },
        lockedHint: "Someone at the diner knows which pier.",
      },
      {
        id: "cm_loc_warehouse",
        label: "Coldwater Row",
        targetSceneId: "cm_warehouse",
        x: 14,
        y: 57,
        icon: "🏚",
        gating: { requiresFlags: ["cm_saw_ledger"] },
        hiddenWhenLocked: true,
      },
    ],
  },
  characters: [],
  items: [],
  scenes: [
    {
      id: "cm_office",
      title: "Your Office",
      background: "/img/bg-office.jpg",
      ambientAudio: "rain",
      prose:
        "Third floor, frosted glass, your name peeling off the door. The city map on the wall has more pinholes than plaster. Somewhere out there is a ledger with the wrong names in it — and every tip you shake loose opens another corner of town.",
      hotspots: [
        {
          id: "cmh_wallmap",
          label: "Study the city map on the wall",
          bounds: { x: 8, y: 18, w: 22, h: 30 },
          cursor: "look",
          action: { type: "openMap" },
        },
      ],
      choices: [
        { id: "cmc_diner", text: "Start where the coffee's honest — Milly's Diner.", targetSceneId: "cm_diner", attitudeTag: "Neutral" },
        {
          id: "cmc_ferry",
          text: "Take the late ferry out to Pier 9.",
          targetSceneId: "cm_docks",
          attitudeTag: "Clever",
          gating: { requiresFlags: ["cm_tip_docks"] },
        },
        {
          id: "cmc_drive",
          text: "Drive out to the warehouse on Coldwater Row.",
          targetSceneId: "cm_warehouse",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["cm_saw_ledger"] },
        },
      ],
      dialogueBeats: [],
    },
    {
      id: "cm_diner",
      title: "Milly's Diner",
      background: "/img/bg-blackwood-diner.jpg",
      ambientAudio: "jazz",
      prose:
        "Chrome, grease, and a counterman who's seen every face in this city twice. He polishes the same glass until you slide the photograph across the counter. \"This guy? Keeps a boat slip. Pier 9 — after midnight, if you're dumb enough.\"",
      hotspots: [],
      choices: [
        {
          id: "cmc_tip",
          text: "Press him for the slip number — then check the map.",
          targetSceneId: "cm_office",
          attitudeTag: "Clever",
          consequences: { setFlags: ["cm_tip_docks"] },
          rememberLine: "The counterman will remember you kept his name out of it.",
        },
        { id: "cmc_leave", text: "Leave the photo, keep the peace.", targetSceneId: "cm_office", attitudeTag: "Neutral" },
      ],
      dialogueBeats: [],
    },
    {
      id: "cm_docks",
      title: "Pier 9",
      background: "/img/bg-docks.jpg",
      ambientAudio: "rain",
      prose:
        "Fog thick enough to bottle. The boat slip is empty but the harbormaster's shack isn't locked, and under the tide tables sits a ledger bound in oilcloth. Half the names are aldermen. The other half are addresses — one circled in red: a warehouse on Coldwater Row.",
      hotspots: [],
      choices: [
        {
          id: "cmc_ledger",
          text: "Photograph the circled page.",
          targetSceneId: "cm_office",
          attitudeTag: "Clever",
          consequences: { setFlags: ["cm_saw_ledger"], meterChanges: [{ meter: "Clever", delta: 1 }] },
        },
        {
          id: "cmc_row",
          text: "Go straight to Coldwater Row — no detours.",
          targetSceneId: "cm_warehouse",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["cm_saw_ledger"] },
        },
      ],
      dialogueBeats: [],
    },
    {
      id: "cm_warehouse",
      title: "Coldwater Row",
      background: "/img/bg-basement.jpg",
      ambientAudio: "tension",
      prose:
        "The warehouse breathes — trucks idling inside, voices counting in the dark. The ledger in your pocket is enough to hang every name in it, if it gets to a courthouse instead of the river.",
      hotspots: [],
      choices: [
        {
          id: "cmc_callin",
          text: "Find a phone box. Call it in and watch the doors.",
          targetSceneId: "cm_end_win",
          attitudeTag: "Clever",
        },
        { id: "cmc_alone", text: "Go in alone. It ends tonight.", targetSceneId: "cm_end_bust", attitudeTag: "Aggressive" },
      ],
      dialogueBeats: [],
    },
    {
      id: "cm_end_win",
      title: "Case Closed — The Whole Map",
      isEnding: true,
      background: "/img/bg-office.jpg",
      prose: "By dawn the trucks are impounded and the aldermen are phoning lawyers. You worked the city corner by corner — and the city worked with you.",
      endingData: {
        tier: "victory-gold",
        headline: "LEDGER LANDS EVERY NAME",
        recap: "Diner tip to dock ledger to warehouse bust — every pin on the map earned, none wasted.",
      },
      hotspots: [],
      choices: [],
      dialogueBeats: [],
    },
    {
      id: "cm_end_bust",
      title: "Case Closed — Off the Map",
      isEnding: true,
      background: "/img/bg-docks.jpg",
      prose: "They fish your hat out of the river on Thursday. The ledger never surfaces at all.",
      endingData: {
        tier: "gameover",
        headline: "GUMSHOE VANISHES ON COLDWATER ROW",
        recap: "You had the whole map in your pocket and walked into the one square that bites.",
      },
      hotspots: [],
      choices: [],
      dialogueBeats: [],
    },
  ],
};
