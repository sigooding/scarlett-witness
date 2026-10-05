/**
 * BETA PROBE — THE WALKING STAGE (🚶 STAGE nodes)
 * ------------------------------------------------
 * Part 1: pure engine math from src/logic.ts (movement, clamping, obstacle
 *         routing, camera, world edges, legacy normalisation).
 * Part 2: the real <GamePlayer> mounted in happy-dom, playing a synthetic
 *         story that crosses the stage ↔ graphic-novel boundary in every
 *         direction — keyboard walk, click-to-walk, verb coin, conversations,
 *         walk-off-screen edge exits.
 * Part 3: NON-INTERFERENCE — the classic graphic-novel scenes between the
 *         stages must keep their prose panel, hotspots, exam card, choice
 *         keyboard shortcuts and default cursor. No stage state (walker,
 *         markers, captions, coin verb) may leak across the boundary.
 * Part 4: a real shipped story (Demo Lab: Press the Lie) stage round-trip.
 *
 * Run: node scripts/beta/stage-harness.mjs
 */
import type { Story } from "../../src/types";

/* ================================================================
 * PART 1 — ENGINE MATH (no DOM)
 * ================================================================ */

const failures: string[] = [];
const passes: string[] = [];
function ok(cond: boolean, label: string, detail = "") {
  if (cond) passes.push(label);
  else failures.push(label + (detail ? ` — ${detail}` : ""));
}

async function part1() {
  const L = await import("../../src/logic");

  /* ---- stepStagePos: one frame of walking ---- */
  {
    const r = L.stepStagePos({ x: 50, y: 80 }, { x: 60, y: 80 }, 18, 0.5, 16 / 9);
    ok(Math.abs(r.x - 59) < 1e-9 && Math.abs(r.y - 80) < 1e-9 && !r.arrived, "stepStagePos: horizontal step is speed×dt", JSON.stringify(r));
  }
  {
    // y is height-% — the step must be aspect-corrected so vertical walking
    // isn't artificially fast on a wide plate. 9 width-% of travel = 9/a
    // height-%.
    const r = L.stepStagePos({ x: 50, y: 80 }, { x: 50, y: 90 }, 18, 0.5, 16 / 9);
    const want = 80 + 9 / (16 / 9);
    ok(Math.abs(r.x - 50) < 1e-9 && Math.abs(r.y - want) < 1e-6, "stepStagePos: vertical step is aspect-corrected", JSON.stringify({ r, want }));
  }
  {
    const r = L.stepStagePos({ x: 10, y: 10 }, { x: 11, y: 10 }, 100, 1, 16 / 9);
    ok(r.arrived && r.x === 11 && r.y === 10, "stepStagePos: lands exactly on arrival");
  }
  {
    const r = L.stepStagePos({ x: 0, y: 0 }, { x: 100, y: 0 }, 0, 0.1, 0); // degenerate speed + aspect
    ok(Number.isFinite(r.x) && r.x > 0, "stepStagePos: zero speed/aspect fall back safely", JSON.stringify(r));
  }

  /* ---- floor band + polygon clamping ---- */
  {
    const poly = L.stageWalkPoly({ floor: { top: 62, bottom: 94 } } as never, 100);
    ok(poly.length === 4, "stageWalkPoly: band rooms are a 4-point rectangle");
    const above = L.clampToWalkPoly(50, 10, poly, 100);
    ok(Math.abs(above.y - 62) < 0.01, "clampToWalkPoly: a click above the band snaps to its top edge", JSON.stringify(above));
    const below = L.clampToWalkPoly(50, 99.5, poly, 100);
    ok(Math.abs(below.y - 94) < 0.01, "clampToWalkPoly: a click below the band snaps to its bottom edge", JSON.stringify(below));
    const edge = L.clampToWalkPoly(-20, 80, poly, 100);
    ok(edge.x >= 1, "clampToWalkPoly: x never leaves the plate", JSON.stringify(edge));
    const wide = L.clampToWalkPoly(150, 80, poly, 200);
    ok(wide.x >= 100 && wide.x <= 199, "clampToWalkPoly: wide worlds clamp inside their own width", JSON.stringify(wide));
  }
  {
    // A ⌐-shaped path polygon: top bar plus a left column — the walkable
    // region is not a rectangle and the missing corner must not be walkable.
    const poly = [
      { x: 0, y: 40 }, { x: 80, y: 40 }, { x: 80, y: 60 }, { x: 30, y: 60 },
      { x: 30, y: 90 }, { x: 0, y: 90 },
    ];
    ok(L.pointInWalkPoly(10, 50, poly), "pointInWalkPoly: inside the top bar");
    ok(L.pointInWalkPoly(10, 80, poly), "pointInWalkPoly: inside the column");
    ok(!L.pointInWalkPoly(60, 80, poly), "pointInWalkPoly: the concave corner is not walkable");
    const snapped = L.clampToWalkPoly(60, 80, poly, 100);
    ok(L.pointInWalkPoly(snapped.x, snapped.y, poly), "clampToWalkPoly: outside clicks land ON the path", JSON.stringify(snapped));
    // A wall poster whose zone base sits in the corner snaps onto the path.
    const mp = L.stageMarkerPointPoly({ bounds: { x: 56, y: 72, w: 8, h: 8 } } as never, poly, 100);
    ok(L.pointInWalkPoly(mp.x, mp.y, poly), "stageMarkerPointPoly: marker walk-point snaps into the polygon", JSON.stringify(mp));
  }

  /* ---- obstacle routing ---- */
  {
    const floor = { top: 60, bottom: 94 };
    const poly = L.stageWalkPoly({ floor } as never, 100);
    const straight = L.stageRoutePoly({ x: 50, y: 90 }, { x: 80, y: 90 }, undefined, poly, floor, 2, 100);
    ok(straight.length === 1 && straight[0].x === 80, "stageRoutePoly: empty rooms route in a straight line", JSON.stringify(straight));
  }
  {
    const floor = { top: 60, bottom: 94 };
    const poly = L.stageWalkPoly({ floor } as never, 100);
    // A crate squarely between the walker (x50,y90) and the wrench (x18,y88):
    // the straight line crosses it, so the route must detour around the top.
    const crate = [{ x: 24, y: 84, w: 16, h: 10 }];
    const route = L.stageRoutePoly({ x: 50, y: 90 }, { x: 18, y: 88 }, crate, poly, floor, 2, 100);
    ok(route.length >= 2, "stageRoutePoly: routes around a blocking crate", JSON.stringify(route));
    let minY = 100;
    let clear = route.length > 0;
    let cur = { x: 50, y: 90 };
    for (const wp of route) {
      if (!L.stageLineClearPoly(cur, wp, crate, poly, 16 / 9, 100)) clear = false;
      cur = wp;
      minY = Math.min(minY, wp.y);
    }
    ok(clear, "stageRoutePoly: every leg of the route is walkable");
    ok(minY < 84, "stageRoutePoly: the detour passes above the crate", `minY=${minY.toFixed(1)}`);
    ok(route[route.length - 1].x === 18, "stageRoutePoly: the route lands on the click", JSON.stringify(route[route.length - 1]));
  }
  {
    const floor = { top: 60, bottom: 94 };
    const poly = L.stageWalkPoly({ floor } as never, 100);
    // Goal walled off by a huge obstacle: refuse the click (no route).
    const wall = [{ x: 10, y: 60, w: 30, h: 40 }];
    const route = L.stageRoutePoly({ x: 50, y: 90 }, { x: 15, y: 85 }, wall, poly, floor, 2, 100);
    ok(route.length === 0, "stageRoutePoly: a walled-off goal returns no route", JSON.stringify(route));
  }
  {
    const floor = { top: 60, bottom: 94 };
    const poly = L.stageWalkPoly({ floor } as never, 200);
    const route = L.stageRoutePoly({ x: 10, y: 90 }, { x: 190, y: 90 }, undefined, poly, floor, 2, 200);
    ok(route.length === 1 && route[0].x === 190, "stageRoutePoly: wide worlds route across the whole strip", JSON.stringify(route));
  }

  /* ---- camera + world edges ---- */
  {
    ok(L.stageCamX(50, 100) === 0, "stageCamX: single-screen rooms never pan");
    ok(L.stageCamX(150, 200) === 100, "stageCamX: the walker is centred on wide worlds");
    ok(L.stageCamX(1, 200) === 0 && L.stageCamX(199, 200) === 100, "stageCamX: clamped to the strip's ends");
  }
  {
    ok(L.stageAtWorldEdge(0.5, 100) === "left", "stageAtWorldEdge: left edge");
    ok(L.stageAtWorldEdge(99.5, 100) === "right", "stageAtWorldEdge: right edge");
    ok(L.stageAtWorldEdge(50, 100) === null, "stageAtWorldEdge: mid-room is not an edge");
  }

  /* ---- reach + perspective ---- */
  {
    ok(L.posReachesMarker({ x: 0, y: 0 }, { x: 0, y: 4 / (16 / 9) }, 4, 16 / 9), "posReachesMarker: aspect-corrected reach");
    ok(!L.posReachesMarker({ x: 0, y: 0 }, { x: 4.1, y: 0 }, 4, 16 / 9), "posReachesMarker: beyond reach");
  }
  {
    const floor = { top: 60, bottom: 94 };
    const st = {} as never;
    const near = L.stageSpriteScale(94, floor, st);
    const far = L.stageSpriteScale(60, floor, st);
    ok(near === 1 && far < near, "stageSpriteScale: big up close, small in the distance", `${near} vs ${far}`);
    const sTop = L.stageSpeedScale(60, floor, st);
    const sBottom = L.stageSpeedScale(94, floor, st);
    ok(sTop < sBottom && sTop >= 0.35 && sBottom <= 1.6, "stageSpeedScale: distant walkers cover less screen", `${sTop} < ${sBottom}`);
  }

  /* ---- legacy stage2d → stage node (old saves keep walking) ---- */
  {
    const legacy = {
      scenes: [
        { id: "a", stage2d: { playerImage: "emoji:🕵️", spawn: { x: 10, y: 90 } } },
        { id: "b", prose: "plain" },
      ],
    } as never as Parameters<typeof L.normalizeLegacyStory>[0];
    const conv = L.normalizeLegacyStory(legacy);
    const sc0 = conv.scenes[0] as { nodeType?: string; stage?: { spawn?: { x: number } } };
    ok(sc0.nodeType === "stage" && sc0.stage?.spawn?.x === 10, "normalizeLegacyStory: stage2d becomes a stage node", JSON.stringify(sc0.nodeType));
    const untouched = (conv.scenes[1] as { nodeType?: string }).nodeType;
    ok(untouched === undefined, "normalizeLegacyStory: standard scenes stay standard");
  }
  {
    const plain = { scenes: [{ id: "a" }, { id: "b" }] } as never as Parameters<typeof L.normalizeLegacyStory>[0];
    ok(L.normalizeLegacyStory(plain) === plain, "normalizeLegacyStory: stories without stage2d are returned untouched");
  }

  /* ---- verbs never leak into classic scenes ---- */
  {
    ok(L.verbsForScene({ hotspots: [{ cursor: "look" }] } as never).length > 0, "verbsForScene: stage rooms derive their verbs");
    ok(L.verbsForScene({ nodeType: undefined, hotspots: [{ cursor: "look" }] } as never) instanceof Array, "verbsForScene: tolerates plain scenes");
    const none = L.verbsForScene({} as never);
    ok(none.length === 0, "verbsForScene: an empty scene offers no verbs", JSON.stringify(none));
  }

  console.log(`\n=== PART 1 · ENGINE MATH — ${passes.length} passed, ${failures.length} failed ===`);
  for (const f of failures) console.log("  ✗ " + f);
}

/* ================================================================
 * THE SYNTHETIC STORY — a stage ↔ graphic-novel sandwich
 * ================================================================ */

const LOOK_PNG = "data:image/png;base64,LOOKART";
const TAKE_PNG = "data:image/png;base64,TAKEART";
const TALK_PNG = "data:image/png;base64,TALKART";
const GO_PNG = "data:image/png;base64,GOART";
const SAFE_OPEN_PNG = "/img/safe-open.png"; // a path, like real stage object art
const GRAD = "gradient:linear-gradient(160deg,#101018 0%,#1c1424 60%,#050508 100%)";

const STAGE_STORY: Story = {
  id: "beta-stage-walk",
  title: "Beta Lab: Walking Stage",
  tagline: "Beta probe — the walkable stage against the classic novel.",
  coverImage: GRAD,
  startSceneId: "bs_street",
  layout: {
    bs_street: { x: 60, y: 200 },
    bs_wide: { x: 60, y: 420 },
    bs_alibi: { x: 480, y: 200 },
    bs_end: { x: 900, y: 100 },
    bs_over: { x: 900, y: 340 },
  },
  briefing: {
    objective: "Cross the stage↔novel boundary in both directions.",
    winConditions: ["Walk the street, take the wrench, talk, leave through the door."],
    loseConditions: ["Get stuck between the two."],
  },
  flagNotes: {},
  characters: [
    { id: "bs_ash", name: "Ash", role: "The walker", avatarUrl: "emoji:🕵️", trustMeter: 0 },
    { id: "bs_kid", name: "The Kid", role: "The talker", avatarUrl: "emoji:🧒", trustMeter: 0 },
  ],
  items: [
    { id: "bs_wrench", name: "Bent wrench", icon: "🔧", description: "A wrench.", flavorText: "Turns bolts." },
    { id: "bs_coin", name: "Lucky dollar", icon: "🪙", description: "The safe's last tenant.", flavorText: "Heads, anyway." },
  ],
  // NO "default" art on purpose: the default cursor on classic scenes must
  // stay the system arrow, which is exactly what a leaked coin verb breaks.
  cursorArt: {
    look: { image: LOOK_PNG },
    take: { image: TAKE_PNG },
    talk: { image: TALK_PNG },
    go: { image: GO_PNG },
  },
  scenes: [
    /* ── the street: single-screen coin stage ─────────────────────── */
    {
      id: "bs_street",
      title: "Beta Street",
      background: GRAD,
      nodeType: "stage",
      prose: "",
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 50, y: 90 },
        speed: 40,
        reach: 5,
        keyboard: true,
        floor: { top: 60, bottom: 94 },
        verbCoin: true,
        // A crate squarely between the spawn and the wrench marker — the
        // walk to the wrench must route AROUND it (not through).
        obstacles: [{ x: 24, y: 84, w: 16, h: 10 }],
        enterCaption: "BETA STREET — walk with WASD or the arrow keys.",
        // INTERACTABLE NPC — the sweeper is linked to a talker marker: their
        // body IS the marker (the static diamond hides), they patrol, and
        // clicking them (or pressing N) makes the walker give chase.
        npcs: [
          {
            id: "bs_npc_sweeper",
            image: "emoji:🧹",
            x: 44,
            y: 86,
            speed: 14,
            patrol: [
              { x: 60, y: 86, pause: 0.3 },
              { x: 44, y: 86, pause: 0.3 },
            ],
            talkHotspotId: "bsh_sweeper",
          },
        ],
      },
      hotspots: [
        {
          id: "bsh_wrench",
          label: "the dropped wrench",
          bounds: { x: 6, y: 78, w: 8, h: 10 },
          cursor: "take",
          verbs: { look: { type: "showText", text: "WRENCH-LOOK: somebody dropped it mid-stride." } },
          action: { type: "giveItem", itemGranted: "bs_wrench" },
        },
        {
          id: "bsh_poster",
          label: "the poster",
          bounds: { x: 66, y: 28, w: 14, h: 16 },
          cursor: "look",
          remote: true,
          action: { type: "showText", text: "POSTER-TEXT: a noir jazz night, two dollars at the door." },
        },
        {
          id: "bsh_kid",
          label: "the kid on the step",
          bounds: { x: 76, y: 60, w: 12, h: 28 },
          cursor: "talk",
          verbs: { look: { type: "showText", text: "KID-LOOK: twelve years old and knowing it." } },
          action: { type: "startDialogue" },
        },
        {
          id: "bsh_alley",
          label: "the alley mouth",
          bounds: { x: 4, y: 58, w: 10, h: 30 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "bs_wide" },
        },
        {
          // INTERACTABLE NPC talker — hidden as a diamond (the sweeper
          // carries it); repeatable so both the click and the N-key tests
          // can start the conversation.
          id: "bsh_sweeper",
          label: "the street sweeper",
          bounds: { x: 44, y: 60, w: 10, h: 28 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          // Far-wall target for the DOUBLE-CLICK JOG test — it answers TALK
          // (the armed verb) so the click produces a real WALK across the
          // room, not an from-here line. Repeatable read: forever visible.
          id: "bsh_plates",
          label: "the peeling licence plates",
          bounds: { x: 2, y: 56, w: 8, h: 30 },
          cursor: "look",
          isRepeatable: true,
          verbs: { talk: { type: "showText", text: "PLATES-TALK: a decade of states, screwed to the wall in no order at all." } },
          action: { type: "showText", text: "PLATES-LINE: a decade of states, screwed to the wall in no order at all." },
        },
        {
          id: "bsh_door",
          label: "the office door",
          bounds: { x: 88, y: 60, w: 10, h: 30 },
          cursor: "go",
          isRepeatable: true,
          action: { type: "goToScene", targetSceneId: "bs_alibi" },
        },
      ],
      dialogueBeats: [
        { id: "bsb_1", characterId: "bs_kid", text: "KID-LINE-ONE: you're the one asking about the nightclub." },
        { id: "bsb_2", characterId: "bs_ash", text: "ASH-LINE-ONE: and you're the one sitting on the answer." },
      ],
      // reply: true = answer IN PLACE (the conversation closes, the floor
      // comes back). Choices that LEAVE carry just a target scene.
      choices: [{ id: "bsc_stay", text: "Keep walking", reply: true }],
    },
    /* ── the alley: a WIDE world with a walk-off-screen exit ──────── */
    {
      id: "bs_wide",
      title: "Beta Alley (wide)",
      background: GRAD,
      nodeType: "stage",
      prose: "",
      stage: {
        playerImage: "emoji:🕵️",
        spawn: { x: 150, y: 90 },
        speed: 45,
        reach: 5,
        keyboard: true,
        floor: { top: 62, bottom: 94 },
        worldWidth: 200,
        // SENTENCE LINE: the SCUMM strip (+ right-click look).
        sentenceLine: true,
        // DOOR: a gate-aware barrier sealing the alley past the kid. The
        // kid's "Keep moving" reply sets bs_alley_clear and the wall ceases
        // to exist - a spatial lock-and-key, not a menu gate.
        obstacles: [{ x: 176, y: 56, w: 7, h: 40, gating: { requiresFlags: ["bs_alley_clear"] } }],
        exitEdges: {
          right: { targetSceneId: "bs_alibi", label: "Walk into the office" },
        },
      },
      hotspots: [
        // A talker planted in the keyboard path: a CLASSIC room fires a
        // marker the walker steps into, so a key held down when the
        // conversation opens must not still be "held" when it closes.
        {
          id: "bswh_kid",
          label: "the kid in the alley",
          bounds: { x: 165, y: 62, w: 10, h: 27 },
          cursor: "talk",
          action: { type: "startDialogue" },
        },
        // MULTI-STATE SAFE PUZZLE — one marker, three faces: locked (base,
        // gate shut), opened (bell rang: gate cleared, new label + art),
        // and gone (the take consumes it). The bell is the producer. Both
        // stand LEFT of the spawn on the walkable floor, out of the kid's
        // marker radius (the stuck-keys phase walks right through him).
        {
          id: "bswh_bell",
          label: "the counter bell",
          bounds: { x: 128, y: 58, w: 8, h: 28 },
          cursor: "use",
          action: {
            type: "showText",
            text: "BELL: the counter bell rings; somewhere behind the wall a bolt slams back.",
            flagSet: "bs_safe_open",
          },
          verbs: { look: { type: "showText", text: "BELL-LOOK: brass, dented by a hundred knuckles." } },
        },
        {
          id: "bswh_safe",
          label: "the drop-safe",
          bounds: { x: 138, y: 56, w: 12, h: 30 },
          cursor: "take",
          gating: { requiresFlags: ["bs_safe_open"] },
          customFailMessage: "SAFE-LOCKED: bolted shut. The counter bell works the mechanism.",
          action: { type: "showText", text: "SAFE-LOCKED: bolted shut. The counter bell works the mechanism." },
          states: [
            {
              id: "st_safe_open",
              when: { requiresFlags: ["bs_safe_open"] },
              gating: null, // the opened safe is no longer locked
              label: "the hanging-open safe",
              image: SAFE_OPEN_PNG,
              action: { type: "giveItem", itemGranted: "bs_coin" },
            },
          ],
        },
        {
          id: "bswh_door",
          label: "the office door (far end)",
          bounds: { x: 190, y: 60, w: 9, h: 30 },
          cursor: "go",
          action: { type: "goToScene", targetSceneId: "bs_alibi" },
        },
      ],
      dialogueBeats: [{ id: "bswb_1", characterId: "bs_kid", text: "WIDE-KID-LINE: this alley talks back." }],
      choices: [{ id: "bswc_go", text: "Keep moving", reply: true, consequences: { setFlags: ["bs_alley_clear"] } }],
    },
    /* ── the office: a CLASSIC graphic-novel scene ────────────────── */
    {
      id: "bs_alibi",
      title: "The Nickel Club Office",
      background: GRAD,
      prose: "ALIBI-PROSE: The back office of the Nickel Club smells of cold coffee and older lies.",
      dialogueBeats: [
        { id: "bsab_1", characterId: "bs_kid", text: "ALIBI-BEAT-ONE: she signed the tab at one." },
        { id: "bsab_2", characterId: "bs_ash", text: "ALIBI-BEAT-TWO: and the pawn shop saw her at midnight." },
      ],
      hotspots: [
        {
          id: "bsah_desk",
          label: "the desk",
          bounds: { x: 20, y: 36, w: 22, h: 22 },
          cursor: "look",
          action: { type: "showText", text: "DESK-TEXT: papers, a ticket spike, a cold cup of coffee.", flagSet: "bs_desk_searched" },
          // MULTI-STATE on a CLASSIC novel scene: reading it once re-skins
          // the same zone — the label in the scene-action list follows.
          states: [
            {
              id: "st_desk_searched",
              when: { requiresFlags: ["bs_desk_searched"] },
              label: "the searched desk",
              action: { type: "showText", text: "DESK-SEARCHED: drawers out, blotter up — nothing else in it." },
            },
          ],
        },
      ],
      choices: [
        { id: "bsac_street", text: "Back to the street", targetSceneId: "bs_street" },
        { id: "bsac_close", text: "Close the case", targetSceneId: "bs_end" },
        { id: "bsac_quit", text: "Give it up", targetSceneId: "bs_over" },
      ],
    },
    /* ── endings (so the design audit passes cleanly) ─────────────── */
    {
      id: "bs_end",
      title: "Case Closed",
      background: GRAD,
      isEnding: true,
      prose: "The wrench, the tab, the kid — it all hangs together.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: { tier: "victory-gold", headline: "THE BOLT TURNS", recap: "The stage and the novel shook hands." },
    },
    {
      id: "bs_over",
      title: "Not Your Night",
      background: GRAD,
      isEnding: true,
      prose: "The street keeps its secrets.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: { tier: "gameover", headline: "WALKED OFF", recap: "The boundary won." },
    },
  ],
};

/* ================================================================
 * PARTS 2–4 — THE REAL GAME, MOUNTED
 * ================================================================ */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function parts2to4() {
  const { Window } = await import("happy-dom");
  const win = new Window({ url: "http://localhost:5173/" });
  const doc = win.document;
  doc.body.innerHTML = '<div id="root"></div>';

  for (const key of [
    "document", "navigator", "location", "history", "customElements",
    "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLIFrameElement",
    "Element", "Node", "NodeList", "CharacterData", "DocumentFragment", "Document",
    "MutationObserver", "ResizeObserver", "IntersectionObserver", "getComputedStyle",
    "requestAnimationFrame", "cancelAnimationFrame", "localStorage", "sessionStorage",
    "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "PointerEvent",
    "matchMedia", "DOMRect", "SVGElement", "Image", "Audio", "CSS",
  ]) {
    if ((win as unknown as Record<string, unknown>)[key] === undefined) continue;
    try {
      (globalThis as unknown as Record<string, unknown>)[key] = (win as unknown as Record<string, unknown>)[key];
    } catch {
      /* already bound */
    }
  }
  globalThis.window = win as unknown as Window & typeof globalThis;
  win.matchMedia =
    (win.matchMedia?.bind(win) as typeof matchMedia) ??
    ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  globalThis.matchMedia = win.matchMedia as typeof matchMedia;

  if (!globalThis.ResizeObserver) {
    class RO { observe() {} unobserve() {} disconnect() {} }
    globalThis.ResizeObserver = RO as unknown as typeof ResizeObserver;
  }
  class FakeAudio {
    paused = true;
    volume = 1;
    currentTime = 0;
    duration = 0;
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    addEventListener() {}
    removeEventListener() {}
    cloneNode() { return new FakeAudio(); }
  }
  (globalThis as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  (win as unknown as { Audio: typeof FakeAudio }).Audio = FakeAudio;
  try { (win.HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }).play = function () { return Promise.resolve(); }; } catch {}
  try { (win.HTMLCanvasElement.prototype as unknown as { getContext: () => null }).getContext = function () { return null; }; } catch {}
  win.scrollTo = () => {};
  globalThis.scrollTo = win.scrollTo as typeof scrollTo;

  // Console capture — every React warning/error fails the beta unless it is
  // the known happy-dom rAF artifact (see dom-smoke.mjs for the rationale).
  const problems: [string, string][] = [];
  console.error = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.error", msg]);
    if (process.env.STAGE_BETA_VERBOSE) process.stderr.write(`[live console.error] ${msg.slice(0, 2000)}\n`);
  };
  console.warn = (...a: unknown[]) => {
    const msg = a.map(String).join(" ");
    problems.push(["console.warn", msg]);
    if (process.env.STAGE_BETA_VERBOSE) process.stderr.write(`[live console.warn] ${msg.slice(0, 600)}\n`);
  };
  process.on("uncaughtException", (e) => problems.push(["uncaught", String((e as Error)?.stack || e)]));
  process.on("unhandledRejection", (e) => problems.push(["unhandled rejection", String(e)]));

  const { StrictMode, createElement }: typeof import("react") = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { GamePlayer } = await import("../../src/game/Game");
  const { ErrorBoundary } = await import("../../src/ErrorBoundary");
  const { validateStory } = await import("../../src/logic");
  const { DEMO_LIE } = await import("../../src/data/demoLie");

  const container = doc.getElementById("root")!;
  let root: ReturnType<typeof createRoot> | null = null;

  const mountStory = async (story: Story, fromSceneId?: string) => {
    try { win.localStorage.clear(); win.sessionStorage.clear(); } catch {}
    // Unmount the previous root BEFORE wiping the DOM — clearing first would
    // have React's unmount remove children that no longer exist (the classic
    // "removeChild: not a child of this node" crash).
    root?.unmount();
    container.innerHTML = "";
    root = createRoot(container);
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(ErrorBoundary, null, createElement(GamePlayer, {
          story,
          // The default reading pace: Space force-completes a typing line
          // exactly like a player, and happy-dom starves 1ms typewriter
          // timers anyway.
          typeSpeed: 34,
          isNewGamePlus: false,
          onExit: () => {},
          ...(fromSceneId ? { playFromSceneId: fromSceneId } : {}),
        }))
      )
    );
    await sleep(1200);
  };

  const text = () => (container.textContent || "").replace(/\s+/g, " ");
  const q = <T extends Element>(sel: string) => container.querySelector(sel) as T | null;
  const qa = <T extends Element>(sel: string) => [...container.querySelectorAll(sel)] as T[];
  async function until(desc: string, fn: () => boolean, timeoutMs = 10000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (fn()) return true;
      await sleep(120);
    }
    ok(false, desc, `timed out; rendered: ${text().slice(0, 1200)}`);
    return false;
  }
  const playerPos = () => {
    const el = q<HTMLElement>("[data-stage-player]");
    if (!el) return null;
    const x = parseFloat((el.style.left || "").replace("%", ""));
    const y = parseFloat((el.style.top || "").replace("%", ""));
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  };
  const key = (k: string, code?: string) =>
    win.dispatchEvent(new win.KeyboardEvent("keydown", { key: k, code: code ?? k, bubbles: true }));
  const keyUp = (k: string) => win.dispatchEvent(new win.KeyboardEvent("keyup", { key: k, bubbles: true }));
  async function holdKey(k: string, ms: number, sample?: () => void) {
    key(k);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      sample?.();
      await sleep(60);
    }
    keyUp(k);
  }
  const coinVerb = async (label: string) => {
    const btn = qa<HTMLButtonElement>("button").find((b) => b.getAttribute("aria-label") === label);
    if (!btn) return false;
    btn.click();
    // Let React commit the armed verb before the next marker click — in a
    // real browser the player can't click twice inside one render tick.
    await sleep(250);
    return true;
  };
  const marker = (id: string) => q<HTMLButtonElement>(`.stage-marker[data-hs-id="${id}"]`);
  const crashed = () => /the reel snapped|something broke/i.test(container.innerHTML);

  /* ---------------- PART 2 · the stage, walked by hand ---------------- */
  console.log("\n=== PART 2 · WALKING STAGE (synthetic story) ===");

  // Validation first: the fixture itself must be a well-formed case.
  const issues = validateStory(STAGE_STORY);
  ok(issues.filter((i) => i.severity === "error").length === 0, "fixture story validates with no errors",
    issues.map((i) => i.message).join(" | "));
  await mountStory(STAGE_STORY);

  ok(!crashed(), "game mounts without tripping the error boundary");

  // A — the stage mounts with markers and NO novel chrome.
  await until("stage mounts its walker", () => !!q("[data-stage-player]"));
  ok(qa(".stage-marker").length === 6, "every stage hotspot renders as a walkable marker (the linked NPC's diamond hides)", `${qa(".stage-marker").length} markers`);
  ok(qa(".hotspot-box").length === 0, "NO classic hotspot boxes on a stage node");
  ok(!text().includes("ALIBI-PROSE"), "no prose panel bleeds onto the stage");
  ok(await coinVerb("Look at"), "the verb coin rail offers Look at");
  ok(await coinVerb("Pick up"), "the verb coin rail offers Pick up");
  await until("the entry caption plays", () => !!q(".stage-caption") && text().includes("BETA STREET"), 4000);

  // B — keyboard walking, all four directions, clamped by the floor.
  {
    const p0 = playerPos();
    await holdKey("ArrowRight", 420);
    const p1 = playerPos();
    ok(!!p0 && !!p1 && p1.x - p0.x > 3, "ArrowRight walks the walker right", `${p0?.x} → ${p1?.x}`);
    await holdKey("a", 360);
    const p2 = playerPos();
    ok(!!p2 && p2.x < p1!.x - 2, "A walks the walker left", `${p1?.x} → ${p2?.x}`);
    let minY = 100;
    await holdKey("ArrowUp", 2600, () => { const p = playerPos(); if (p) minY = Math.min(minY, p.y); });
    const p3 = playerPos();
    ok(!!p3 && minY < 85 && p3.y < p2!.y - 5, "ArrowUp walks the walker 'into' the screen", `minY=${minY.toFixed(1)} final=${p3?.y}`);
    ok(!!p3 && p3.y >= 59 && p3.y <= 61.5, "the floor band clamps the walk at its top edge", `y=${p3?.y}`);
    keyUp("ArrowUp");
    // The walk settles back to idle (releasing the key must not leave the
    // sprite "moonwalking" in place).
    await until("walker settles to idle when the key is released", () => {
      const bob = q<HTMLElement>("[data-stage-player] > div");
      return !!bob && /stage2d-idle/.test(bob.className);
    }, 4000);
  }

  ok(!q(".stage-sentence"), "rooms without the flag render no sentence strip");

  // C — click-to-walk + the coin: pick up the wrench AROUND the crate.
  {
    ok(await coinVerb("Pick up"), "arming the Pick up verb");
    const w = marker("bsh_wrench");
    ok(!!w, "the wrench marker is clickable");
    w!.click();
    let minY = 100;
    const got = await until("walking to the wrench grants it", () => {
      const p = playerPos();
      if (p) minY = Math.min(minY, p.y);
      return !!q('[data-item-id="bs_wrench"]');
    }, 12000);
    if (got) {
      ok(!marker("bsh_wrench"), "the consumed pickup marker disappears");
      const p = playerPos();
      ok(!!p && p.x < 20, "the walker ended at the wrench", `x=${p?.x}`);
      ok(minY < 83.5, "the route detoured AROUND the crate (not through it)", `minY=${minY.toFixed(1)}`);
    }
  }

  // D — a remote LOOK fires from where the character stands.
  {
    ok(await coinVerb("Look at"), "arming the Look at verb");
    const before = playerPos();
    const poster = marker("bsh_poster");
    ok(!!poster, "the remote poster marker is clickable");
    poster!.click();
    await until("the remote look plays its caption", () => !!q(".stage-caption") && text().includes("POSTER-TEXT"), 5000);
    const after = playerPos();
    ok(!!before && !!after && Math.abs(after.x - before.x) < 1, "a remote look does NOT walk the character", `${before?.x} → ${after?.x}`);
    ok(!!q(".stage-caption") && !qa(".hud-frame").some((n) => (n.textContent || "").includes("POSTER-TEXT")), "stage captions are subtitles, not the novel's exam card");
  }

  // E — a conversation opens, locks the floor, then hands it back.
  {
    ok(await coinVerb("Talk to"), "arming the Talk to verb");
    marker("bsh_kid")!.click();
    await until("the conversation opens (markers sleep)", () => qa(".stage-marker[disabled]").length > 0, 12000);
    // TALK ZOOM — the camera punches in on the walker while they talk…
    await until("the camera punches in on the talk", () => (q<HTMLElement>("[data-stage-world]")?.style.transform ?? "").includes("scale(1.22)"), 4000);
    await until("the first beat plays as a subtitle", () => text().includes("KID-LINE-ONE"), 6000);
    ok(!(await coinVerb("Pick up")), "the coin rail hides while talking");
    // Space finishes a beat's typing AND advances it — press until the
    // conversation's closing choices stand up.
    for (let i = 0; i < 10 && !qa("button").some((b) => /keep walking/i.test(b.textContent || "")); i++) {
      key(" ", "Space");
      await sleep(400);
    }
    ok(!!qa("button").find((b) => /keep walking/i.test(b.textContent || "")), "the conversation's choices appear");
    // While talking, WASD belongs to nobody: it must not walk or navigate.
    const pTalk = playerPos();
    await holdKey("ArrowRight", 300);
    const pTalk2 = playerPos();
    ok(!!pTalk && !!pTalk2 && Math.abs(pTalk2.x - pTalk.x) < 1, "the floor is locked while a conversation plays", `${pTalk?.x} → ${pTalk2?.x}`);
    const stay = qa("button").find((b) => /keep walking/i.test(b.textContent || ""));
    ok(!!stay, "the conversation's closing choice is clickable");
    stay?.click();
    await until("the conversation hands the floor back", () => qa(".stage-marker[disabled]").length === 0, 6000);
    // …and eases back out once it's over.
    await until("the camera eases back out after the talk", () => !(q<HTMLElement>("[data-stage-world]")?.style.transform ?? "").includes("scale(1.2"), 4000);
    const pAfter = playerPos();
    await holdKey("ArrowLeft", 300);
    const pAfter2 = playerPos();
    ok(!!pAfter && !!pAfter2 && pAfter2.x < pAfter.x - 1, "walking works again after the conversation", `${pAfter?.x} → ${pAfter2?.x}`);
  }

  // G — INTERACTION QoL: hint-key flash, coin hotkeys, double-click jog,
  //     and a MOVING NPC you can click (or press N) to talk to.
  {
    // H — every marker pulses, and the linked NPC's chip pulses with them.
    key("h");
    await sleep(80);
    ok(qa(".stage-marker-flash").length >= 5, "the hint key flashes every marker", `${qa(".stage-marker-flash").length} flashing`);
    ok(!!q('[data-npc-id="bs_npc_sweeper"] .stage-marker-flash'), "the interactable NPC's chip flashes too");

    // 1-9 — coin verbs positionally. By now the wrench is taken, so the
    // coin reads Look at · Talk to · Go to — 2 = Talk to, which the NPC
    // phases below want armed anyway.
    key("2");
    await sleep(80);
    const pressed = qa<HTMLButtonElement>("button[aria-pressed]").find((b) => b.getAttribute("aria-pressed") === "true" && b.getAttribute("aria-label") === "Talk to");
    ok(!!pressed, "coin hotkey 2 arms Talk to");

    // Double-click jog: two presses on the far-wall plates (which answers
    // the armed verb) jog the walker across the room — the flag shows and
    // the line lands in a window only a jog can meet.
    {
      const plates = marker("bsh_plates")!;
      const t0 = Date.now();
      plates.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
      await sleep(70);
      plates.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
      let sawJog = false;
      let caption = false;
      while (Date.now() - t0 < 1500 && !(caption = text().includes("PLATES-TALK"))) {
        sawJog = sawJog || !!q('[data-stage-player][data-jog="1"]');
        await sleep(15);
      }
      ok(sawJog, "the double-click puts the walker into a jog");
      ok(caption && Date.now() - t0 < 1100, "the jog crosses the room in under a second (a walk would need ~1.7s)", `${Date.now() - t0}ms`);
      await until("the walker ends at the plates wall", () => (playerPos()?.x ?? 100) < 15, 3000);
    }

    // Interactable NPC: the sweeper's diamond is GONE, their body is the
    // marker — click the MOVING character and the walker gives chase.
    ok(!q('.stage-marker[data-hs-id="bsh_sweeper"]'), "a linked NPC's static diamond hides");
    const sweeper = q<HTMLElement>('[data-npc-id="bs_npc_sweeper"]');
    ok(!!sweeper && /the street sweeper/i.test(sweeper.textContent || ""), "the sweeper carries their own talk chip");
    sweeper!.dispatchEvent(new win.PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await until("clicking the moving NPC starts the conversation", () => qa(".stage-marker[disabled]").length > 0, 12000);
    // CONVERSATION FREEZE — a linked NPC holds their patrol while the talk
    // plays (they've been addressed), then resumes when the floor is back.
    const npcLeft = () => parseFloat((q<HTMLElement>('[data-npc-id="bs_npc_sweeper"]')?.style.left || "0"));
    const f1 = npcLeft();
    await sleep(500);
    const f2 = npcLeft();
    ok(Math.abs(f2 - f1) < 0.6, "the NPC freezes mid-patrol while the conversation plays", `${f1} -> ${f2}`);
    for (let i = 0; i < 10 && !qa("button").some((b) => /keep walking/i.test(b.textContent || "")); i++) {
      key(" ", "Space");
      await sleep(400);
    }
    qa<HTMLButtonElement>("button").find((b) => /keep walking/i.test(b.textContent || ""))?.click();
    await until("the sweeper conversation hands the floor back", () => qa(".stage-marker[disabled]").length === 0, 8000);
    let resumed = false;
    const r0 = npcLeft();
    for (let i = 0; i < 9 && !resumed; i++) {
      await sleep(250);
      resumed = Math.abs(npcLeft() - r0) > 0.5;
    }
    ok(resumed, "the NPC resumes patrolling after the conversation", `from ${r0}`);

    // N — walk to + talk with the NEAREST linked character, no mouse at all.
    key("n");
    await until("the N key starts the nearest-character conversation", () => qa(".stage-marker[disabled]").length > 0, 12000);
    for (let i = 0; i < 10 && !qa("button").some((b) => /keep walking/i.test(b.textContent || "")); i++) {
      key(" ", "Space");
      await sleep(400);
    }
    qa<HTMLButtonElement>("button").find((b) => /keep walking/i.test(b.textContent || ""))?.click();
    await until("the N-key conversation hands the floor back", () => qa(".stage-marker[disabled]").length === 0, 8000);

    // RIGHT-CLICK — the object-first verb pie opens on any marker (coin
    // rooms included); right-clicking the same object again closes it.
    {
      const poster = marker("bsh_poster")!;
      poster.dispatchEvent(new win.MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
      await sleep(220);
      const pieLook = qa<HTMLButtonElement>("button[aria-label='Look at']").filter((b) => b.getAttribute("aria-pressed") === null);
      ok(pieLook.length === 1 && text().includes("the poster"), "right-click opens the object-first verb pie on the marker", `pie buttons=${pieLook.length}`);
      poster.dispatchEvent(new win.MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
      await sleep(220);
      const pieAfter = qa<HTMLButtonElement>("button[aria-label='Look at']").filter((b) => b.getAttribute("aria-pressed") === null);
      ok(pieAfter.length === 0, "right-clicking the same object again closes its pie", `pie buttons=${pieAfter.length}`);
    }
  }

  // F — leave through the door; the classic novel must be pristine.
  console.log("\n=== PART 3 · NON-INTERFERENCE (classic graphic novel) ===");
  {
    ok(await coinVerb("Go to"), "arming the Go to verb");
    marker("bsh_door")!.click();
    await until("the door marker walks into the office scene", () => !q("[data-stage-player]") && text().includes("ALIBI-PROSE"), 15000);
    if (process.env.STAGE_BETA_VERBOSE) process.stderr.write(`[P3 entry] ${text().slice(0, 400)}\n`);

    ok(qa(".stage-marker").length === 0, "no stage markers leak into the novel scene");
    ok(!q(".stage-caption"), "no stage caption bar leaks into the novel scene");
    ok(text().includes("ALIBI-PROSE"), "the novel scene shows its prose panel");

    // The prose → beats → choices flow still works, by keyboard. Space both
    // finishes a typing line and advances it (a player's rhythm); press
    // until the choices stand up.
    const choices = () => qa("button").filter((b) => /back to the street|close the case|give it up/i.test(b.textContent || ""));
    const sawBeat = (t: string) => text().includes(t);
    let sawOne = false;
    let sawTwo = false;
    for (let i = 0; i < 24; i++) {
      if (sawBeat("ALIBI-BEAT-ONE")) sawOne = true;
      if (sawBeat("ALIBI-BEAT-TWO")) sawTwo = true;
      if (choices().length === 3) break;
      key(" ", "Space");
      await sleep(450);
    }
    ok(sawOne, "beat one plays");
    ok(sawTwo, "beat two plays");
    await until("the choices render", () => choices().length === 3, 6000);
    // Hotspots surface once the scene is ready to be explored (prose read).
    ok(qa(".hotspot-box").length === 1, "the novel scene renders its classic hotspot zone", `${qa(".hotspot-box").length}`);

    // Choice keyboard nav (w/s + arrows) still belongs to the novel. The
    // focused choice carries the ring highlight (ring-2 for replies,
    // ring-1 for route choices) plus the ⏎ hint.
    const focused = () => choices().findIndex((b) => /ring-[12] ring-neon/.test(b.className) || /⏎/.test(b.textContent || ""));
    ok(focused() === 0, "choice focus starts on the first choice", `idx=${focused()}`);
    key("s"); await sleep(150);
    ok(focused() === 1, "S moves the choice focus down", `idx=${focused()}`);
    key("ArrowUp"); await sleep(150);
    ok(focused() === 0, "ArrowUp moves the choice focus back up", `idx=${focused()}`);

    // WASD on a novel scene is inert (no walker to steer, nothing swallowed,
    // no navigation away).
    for (const k of ["w", "a", "d"]) { key(k); await sleep(80); keyUp(k); }
    await sleep(250);
    if (process.env.STAGE_BETA_VERBOSE) process.stderr.write(`[P3 wasd] player=${!!q("[data-stage-player]")} prose=${text().includes("ALIBI-PROSE")} choices=${choices().length} txt=${text().slice(0, 260)}\n`);
    ok(!q("[data-stage-player]") && choices().length === 3, "WASD on a novel scene does nothing (and breaks nothing)");

    // The classic hotspot → exam card, not a stage caption.
    (qa(".hotspot-box").find((b) => b.getAttribute("data-hs-id") === "bsah_desk") as HTMLButtonElement)?.click();
    await until("the desk hotspot opens the exam card", () => !!q(".hud-frame") && text().includes("DESK-TEXT"), 5000);
    ok(!q(".stage-caption"), "the novel scene answers with the exam card, never a stage caption");
    // Dismiss the CARD itself (other chrome shares the hud-frame class) and
    // wait for it to clear — the card also auto-dismisses on its own timer.
    const card = qa(".hud-frame").find((n) => (n.textContent || "").includes("DESK-TEXT"));
    (card as HTMLElement | undefined)?.click();
    await until("the exam card clears", () => !qa(".hud-frame").some((n) => (n.textContent || "").includes("DESK-TEXT")), 6000);

    // MULTI-STATE on a classic novel scene: reading the desk once re-skins
    // the SAME zone — new label in the scene-action list, new line, no
    // duplicate zones and no stage machinery involved.
    await until("the searched desk re-skins the action list", () => /the searched desk/i.test(text()), 6000);
    (qa(".hotspot-box").find((b) => b.getAttribute("data-hs-id") === "bsah_desk") as HTMLButtonElement)?.click();
    await until("the searched desk answers with its new line", () => !!q(".hud-frame") && text().includes("DESK-SEARCHED"), 5000);
    ok(qa(".hotspot-box").length === 1, "the state change never duplicated the zone");

    // THE CURSOR LEAK: a coin verb armed on the stage must not become the
    // cursor of every later classic scene.
    const novelLayer = q<HTMLElement>('div[class*="z-[46]"]');
    const styleAttr = novelLayer?.getAttribute("style") || "";
    ok(!/cursor:\s*url/.test(styleAttr), "the armed coin verb does NOT leak its cursor onto novel scenes", styleAttr.slice(0, 120));

    // Number keys still pick choices — back to the street.
    key("1"); await sleep(400);
    // Diagnostic logging must not outwait the caption we assert below.
    for (let i = 0; i < 3 && process.env.STAGE_BETA_VERBOSE; i++) {
      process.stderr.write(`[P3 after 1 · +${(i + 1) * 1000}ms] player=${!!q("[data-stage-player]")} markers=${qa(".stage-marker").length} caption=${!!q(".stage-caption")} txt=${text().slice(0, 160)}\n`);
      await sleep(1000);
    }
    await until("choice 1 returns to the stage scene", () => !!q("[data-stage-player]"), 10000);
  }

  // G — re-entering the stage: fresh gate, no stale conversation. The wrench
  // pickup was consumed on the first visit, so four markers remain (the
  // door is authored repeatable, the way a real exit would be).
  {
    // The entry caption fades after a few seconds — catch it before the
    // slower marker poll eats its lifetime.
    await until("the entry caption replays", () => text().includes("BETA STREET"), 9000);
    await until("the street's markers are back", () => qa(".stage-marker").length === 5, 8000);
    ok(qa(".stage-marker[disabled]").length === 0, "the conversation gate re-opens closed (markers live)");
    ok(!text().includes("KID-LINE-ONE"), "no conversation beats auto-leak onto re-entry");
    const p0 = playerPos();
    await holdKey("ArrowRight", 300);
    const p1 = playerPos();
    ok(!!p0 && !!p1 && p1.x > p0.x, "the walker answers the keyboard again after re-entry", `${p0?.x} → ${p1?.x}`);
  }

  /* -------- PART 2b · wide world + walk-off-screen exit -------- */
  console.log("\n=== PART 2b · WIDE WORLD + WALK-OFF-SCREEN EXIT ===");
  await mountStory(STAGE_STORY, "bs_wide");
  await until("the wide stage mounts", () => !!q("[data-stage-player]"));
  {
    const worldDiv = q<HTMLElement>("[data-stage-player]")?.parentElement;
    const camAt = () => {
      const m = /translateX\(-([\d.]+)%\)/.exec(worldDiv?.style.transform || "");
      return m ? parseFloat(m[1]) : 0;
    };
    ok(Math.abs(camAt() - 100) < 6, "the camera starts centred on the walker (x150 of 200)", `cam=${camAt()}`);
    const arrow = qa("button").find((b) => (b.getAttribute("aria-label") || "").includes("Walk into the office"));
    ok(!!arrow, "the walk-off-screen edge arrow renders at the strip's end");

    /* ---- SENTENCE LINE, live: the SCUMM strip + right-click look ---- */
    {
      const strip = () => q<HTMLElement>(".stage-sentence");
      ok(!!strip(), "the sentence strip renders on a sentence-line room");
      ok(/walk to/i.test(strip()?.textContent || ""), "the bare floor reads 'Walk to'", strip()?.textContent);
      const bellBtn = q<HTMLButtonElement>('.stage-marker[data-hs-id="bswh_bell"]');
      // Hover: React's onMouseEnter rides the delegated mouseover.
      bellBtn?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      await until("the strip reads out the hovered object", () => /the counter bell/i.test(strip()?.textContent || ""), 3000);
      ok(/use the counter bell/i.test(strip()?.textContent || ""), "with no coin armed it reads the object's own verb", strip()?.textContent);
      // Right-click = quick Look (walks never; the look verb answers from here).
      bellBtn?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
      await until("right-click look fires the bell's look line", () => text().includes("BELL-LOOK"), 6000);
    }

    /* ---- MULTI-STATE OBJECT, live: the drop-safe puzzle ----
     * One marker through three faces — locked, opened, taken — with the
     * marker count never changing until the take genuinely consumes it. */
    {
      const safe = () => q<HTMLButtonElement>('.stage-marker[data-hs-id="bswh_safe"]');
      const bell = () => q<HTMLButtonElement>('.stage-marker[data-hs-id="bswh_bell"]');
      const markersBefore = qa(".stage-marker").length;
      ok(!!safe() && !!bell(), "the safe and its bell render as markers");
      ok(/the drop-safe/i.test(safe()!.getAttribute("aria-label") || "") && /locked/i.test(safe()!.getAttribute("aria-label") || ""), "the safe starts as its locked base face", safe()!.getAttribute("aria-label") ?? "");

      // 1 — locked: the gate refuses with the fail caption, nothing changes.
      safe()!.click();
      await until("the locked safe refuses with its caption", () => text().includes("SAFE-LOCKED"), 6000);
      ok(!!safe() && /the drop-safe/i.test(safe()!.getAttribute("aria-label") || ""), "the refused safe keeps its face");
      ok(qa(".stage-marker").length === markersBefore, "a state object is ONE marker, not gated duplicates");

      // 2 — the bell rings: same marker re-skins in place (label, art, no lock).
      bell()!.click();
      await until("the bell's line plays", () => text().includes("BELL:"), 6000);
      await until("the safe's marker re-skins to its open state", () => {
        const s = safe();
        return !!s && /the hanging-open safe/i.test(s.getAttribute("aria-label") || "") && !/locked/i.test(s.getAttribute("aria-label") || "");
      }, 6000);
      ok(!!container.querySelector('img[src*="safe-open"]'), "the open state swaps the object art in place");
      ok(qa(".stage-marker").length === markersBefore, "the state change never duplicates or remounts the marker");

      // 3 — take what's inside: the open state's action grants the item and
      //     only THEN does the marker go away (a real pickup, not a re-skin).
      safe()!.click();
      await until("the opened safe grants its item", () => !!q('[data-item-id="bs_coin"]'), 12000);
      ok(!safe(), "the emptied safe is consumed by the take (base pickup rules)");
    }

    /* ---- DOOR, live: the gate-aware barrier sealing the alley ----
     * While the kid's flag is unset the wall past him is SOLID - the far
     * markers stay visible but the walker physically cannot reach them. */
    {
      const doorBtn = q<HTMLButtonElement>('.stage-marker[data-hs-id="bswh_door"]');
      ok(!!doorBtn, "the door marker is clickable even while walled off");
      doorBtn!.click(); // click-to-walk at the far door: the wall must stop it
      await sleep(1800);
      const held = playerPos()?.x ?? 0;
      ok(held < 175.5, "a shut door stops the walker cold at the wall", `x=${held}`);
      ok(!!q('.stage-marker[data-hs-id="bswh_door"]'), "the markers behind the door stay visible");
      ok(!q(".hotspot-box"), "the walled-off door never fires its scene change");
    }

    // The failed door command must NOT have auto-talked to the kid en route.
    // That old accidental activation made this test pass for the wrong reason.
    ok(!text().includes("WIDE-KID-LINE"), "aiming at a blocked exit does not activate the NPC on the way");
    // The blocked door put us just PAST the kid. Step back into his reach
    // with LEFT held. That keyboard command cancels the blocked-door aim;
    // its keyup may happen while the conversation owns the floor.
    let maxCam = camAt();
    key("ArrowLeft");
    const talked = await until("stepping into the alley kid opens the conversation", () =>
      qa(".stage-marker[disabled]").length > 0 || text().includes("WIDE-KID-LINE"), 10000);
    if (talked) {
      for (let i = 0; i < 10 && !qa("button").some((b) => /keep moving/i.test(b.textContent || "")); i++) {
        key(" ", "Space");
        await sleep(450);
      }
      const move = qa<HTMLButtonElement>("button").find((b) => /keep moving/i.test(b.textContent || ""));
      move?.click();
      await until("the alley conversation hands the floor back", () => qa(".stage-marker[disabled]").length === 0, 8000);
      const x0 = playerPos()?.x;
      await sleep(1500); // the phantom "held" key would walk ~30% in this window
      const x1 = playerPos()?.x;
      ok(!!x0 && !!x1 && Math.abs(x1 - x0) < 1.5, "a key held when a conversation opened does not ghost-walk after it closes", `${x0} → ${x1}`);
    }

    // Walk off the right edge of the world into the target scene.
    key("ArrowRight"); // re-press: the floor lock legitimately dropped the old hold
    const t0 = Date.now();
    let maxX = playerPos()?.x ?? 0;
    while (Date.now() - t0 < 12000 && q("[data-stage-player]")) {
      maxCam = Math.max(maxCam, camAt());
      maxX = Math.max(maxX, playerPos()?.x ?? 0);
      await sleep(80);
    }
    keyUp("ArrowRight");
    ok(maxX > 184, "the opened barrier lets the walker cross to the far end", `maxX=${maxX}`);
    ok(maxCam > 90, "the camera pans ahead of the walker to the strip's end", `cam=${maxCam}`);
    // Arrival shows the office's prose first. Its interactive hotspots do
    // not appear until that prose is acknowledged; expecting both at once
    // only passed in a transient pre-entry render.
    await until("walking off the edge enters the target scene", () => !q("[data-stage-player]") && text().includes("ALIBI-PROSE"), 8000);
    ok(!q("[data-stage-player]"), "the walker is gone after the edge exit");
  }

  /* ---------------- PART 4 · real shipped data ---------------- */
  console.log("\n=== PART 4 · REAL DATA (Demo Lab: Press the Lie) ===");
  {
    const dlIssues = validateStory(DEMO_LIE);
    ok(dlIssues.filter((i) => i.severity === "error").length === 0, "Demo Lab: Press the Lie validates clean",
      dlIssues.map((i) => i.message).join(" | "));
  }
  await mountStory(DEMO_LIE, "dl_office");
  await until("the real stage mounts", () => !!q("[data-stage-player]"));
  ok(qa(".stage-marker").length === 4, "the office stage renders its 4 authored markers", `${qa(".stage-marker").length}`);
  ok(!q(".hotspot-box"), "no novel hotspots on the real stage");
  {
    const exit = q<HTMLButtonElement>('.stage-marker[data-hs-id="dl_hs_exit"]');
    ok(!!exit, "the classic-verb room's exit marker is clickable");
    exit!.click();
    await until("the exit walks the player into the interrogation scene", () => !q("[data-stage-player]") && (/by ten|signed|pawn|tab/i.test(text()) || qa(".hotspot-box").length > 0), 15000);
    ok(!q("[data-stage-player]") && !q(".stage-caption"), "the real stage leaves no walker/caption behind");
    ok(qa(".stage-marker").length === 0, "the real stage leaves no markers behind");
    // The novel scene's beats still play.
    let played = false;
    for (let i = 0; i < 16 && !played; i++) {
      played = qa(".hotspot-box").length > 0 || /home by ten|signed|tab|pawn/i.test(text());
      key(" ", "Space");
      await sleep(450);
    }
    ok(played, "the real novel scene plays its dialogue");
  }

  /* ---------------- PART 5 · STUDIO authoring (the 🔁 States editor) ---------------- */
  console.log("\n=== PART 5 · STUDIO (states authoring) ===");
  {
    const { Studio } = await import("../../src/studio/Studio");
    root?.unmount();
    root = createRoot(container);
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(ErrorBoundary, null, createElement(Studio, {
          baseStories: [STAGE_STORY],
          initialStoryId: STAGE_STORY.id,
          initialSceneId: "bs_wide",
          onExit: () => {},
          onPlay: () => {},
          onPublish: () => true,
          onDeleteStory: () => true,
          onCreateStory: () => true,
          onUpdateTitleTheme: () => {},
        }))
      )
    );
    await sleep(1800);
    ok(!crashed(), "Studio mounts straight onto the wide stage scene");

    const tab = qa<HTMLButtonElement>("button").find((b) => (b.textContent || "").trim() === "Hotspots");
    ok(!!tab, "the Hotspots tab is reachable");
    tab?.click();
    await sleep(500);

    // The safe's hotspot card carries its states badge.
    const card = () => qa<HTMLButtonElement>("button").find((b) => /⌖ the drop-safe/i.test(b.textContent || ""));
    ok(!!card() && /🔁1/.test(card()!.textContent || ""), "the hotspot card shows its 🔁 states badge", card()?.textContent);
    card()?.click(); // open the inspector
    await sleep(400);

    // The 🔁 States section, opened.
    const statesToggle = () => qa<HTMLButtonElement>("button").find((b) => /🔁 States/.test(b.textContent || ""));
    ok(!!statesToggle(), "the 🔁 States section renders in the inspector");
    statesToggle()?.click();
    await sleep(400);
    ok(/after bs_safe_open/i.test(text()), "the existing state lists its gate flag");

    // Add a state, then remove it — the mutate paths round-trip.
    const addBtn = qa<HTMLButtonElement>("button").find((b) => /Add a state/i.test(b.textContent || ""));
    ok(!!addBtn, "the add-state button renders");
    addBtn?.click();
    await sleep(400);
    ok(/🔁2/.test(card()?.textContent || ""), "adding a state bumps the card badge", card()?.textContent);
    const delBtn = qa<HTMLButtonElement>("button").filter((b) => b.title === "Remove this state").pop();
    ok(!!delBtn, "the new state row offers its remove button");
    delBtn?.click();
    await sleep(400);
    ok(/🔁1/.test(card()?.textContent || ""), "removing it restores the badge", card()?.textContent);

    /* ---- 🥾 WALK TEST — the visual stage editor's live walker ---- */
    // NB: a SECOND "🚶 Stage" button exists (the add-scene template in the
    // toolbar) — clicking THAT would mint a new empty stage scene. The tab
    // strip renders later in the DOM, so take the LAST match.
    const stageTab = qa<HTMLButtonElement>("button").filter((b) => (b.textContent || "").trim() === "🚶 Stage").pop();
    ok(!!stageTab, "the 🚶 Stage tab is reachable");
    stageTab?.click();
    await sleep(800);
    const wtBtn = () => qa<HTMLButtonElement>("button").find((b) => !!b.getAttribute("data-walktest-btn"));
    ok(!!wtBtn(), "the 🥾 Walk test tool renders on the stage plate");
    wtBtn()?.click();
    await sleep(500);
    const walkerEl = () => q<HTMLElement>("[data-walktest-walker]");
    const noteEl = () => q<HTMLElement>("[data-walktest-note]");
    ok(!!walkerEl(), "the live walker appears at spawn");
    ok(!!noteEl() && /spawn/i.test(noteEl()!.textContent || ""), "the verdict chip introduces the test", noteEl()?.textContent);

    // Doors SHUT: the office-door marker sits behind the gated barrier.
    const doorMarker = () => qa<HTMLElement>("[data-drag]").find((n) => n.getAttribute("data-drag") === "hs:bswh_door");
    ok(!!doorMarker(), "the door marker is on the stage plate", qa("[data-drag]").map((n) => n.getAttribute("data-drag")).join(" | ") || "(none)");
    doorMarker()?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await sleep(700);
    ok(!!noteEl() && /no route/i.test(noteEl()!.textContent || ""), "a sealed marker reports NO ROUTE while the doors are shut", noteEl()?.textContent);

    // Doors OPEN: the same press routes the walker there and it arrives.
    const doorsBtn = () => qa<HTMLButtonElement>("[data-walktest-doors]")[0];
    ok(!!doorsBtn(), "the 🚪 doors toggle appears while testing");
    doorsBtn()?.click();
    await sleep(300);
    doorMarker()?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await until("the walker reaches the far door", () => !!noteEl() && /reached the office door/i.test(noteEl()!.textContent || ""), 12000);
    const wtLeft = parseFloat(walkerEl()?.style.left ?? "0");
    const routeSvg = q<SVGSVGElement>("svg polyline");
    ok(wtLeft > 85, "the walker crossed the opened barrier to the far end", `left=${wtLeft}% · note=${noteEl()?.textContent} · route=${routeSvg?.getAttribute("points")?.slice(0, 60) ?? "none"}`);

    // Keyboard drive: ArrowLeft walks it back down the alley, live.
    const kbBefore = parseFloat(walkerEl()?.style.left ?? "0");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    await sleep(700);
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }));
    const kbAfter = parseFloat(walkerEl()?.style.left ?? "0");
    ok(kbAfter < kbBefore - 0.5, "WASD/arrows drive the test walker live", `${kbBefore} → ${kbAfter}`);
  }

  /* ---------------- PART 6 · REAL DATA 2: RAIN SECTOR (creator pass) ---------------- */
  console.log("\n=== PART 6 · RAIN SECTOR (creator pass) ===");
  {
    const { RAIN_SECTOR } = await import("../../src/data/rainSector");
    // The briefing is a classic novel: beats, then the three tone choices.
    await mountStory(RAIN_SECTOR, "rs_brief");
    await until("the briefing prose shows", () => /ninety floors over the rain/i.test(text()), 8000);
    for (let i = 0; i < 14 && !qa("button").some((b) => /by the book/i.test(b.textContent || "")); i++) {
      key(" ", "Space");
      await sleep(420);
    }
    qa<HTMLButtonElement>("button").find((b) => /by the book/i.test(b.textContent || ""))?.click();
    await until("the choice carries you onto the street", () => !!q("[data-stage-player]"), 12000);

    // The walker is the SLICED SHEET (not the emoji fallback) and the room
    // runs the full coin + sentence line + extended verbs.
    await sleep(600);
    // happy-dom cannot decode images, so the sheet renders its emoji
    // fallback here; the sliced sheet itself is pinned by the engine tests
    // (frameWidth 293) and by the browser preview.
    ok(!!q("[data-stage-player]"), "the street walker stands (sheet art pinned by engine tests)");
    ok(!!q(".stage-sentence"), "the sentence line renders");
    ok(!!q('[data-npc-id="rs_npc_ping"] .stage-npc-chip'), "Old Ping carries his talk chip (interactable NPC)");
    ok(!q('.stage-marker[data-hs-id="rsh_ping"]'), "Ping's static diamond hides");
    ok(!!q('[data-npc-id="rs_npc_umbrella"]'), "the umbrella woman paces as ambient dressing");

    // The noir lock-and-key: KICK the vending machine, then take the card.
    ok(await coinVerb("Kick"), "arming the Kick verb (extended verbs on)");
    marker("rsh_vend")!.click();
    await until("the kick shakes the card loose", () => text().includes("BOOT-CLANG"), 8000);
    ok(await coinVerb("Pick up"), "arming the Pick up verb");
    marker("rsh_vend")!.click();
    await until("the machine gives up the key card", () => !!q('[data-item-id="rs_keycard"]'), 10000);

    // The gate is a useItem exit gated on the card: walk up, through.
    ok(await coinVerb("Go to"), "arming the Go to verb");
    marker("rsh_gate")!.click();
    await until("the mag-locked gate swings into the alley", () => !!q('.stage-marker[data-hs-id="rsh_stairs"]'), 15000);

    // The stair gate is bolted until Ping says otherwise.
    ok(await coinVerb("Go to"), "arming the Go to verb");
    marker("rsh_stairs")!.click();
    await until("the bolted stairs refuse", () => /STAIRS: chained/i.test(text()), 8000);
    ok(text().includes("Ping keeps the bolt"), "the refusal names the holder (Ping)");
    // ENGINE REGRESSION (click-walk wall respect): a marker walled off behind
    // a closed gate refuses from where the player stands — the walker must
    // never ghost through the barrier toward it.
    await sleep(1200);
    const boltedX = playerPos()!.x;
    ok(boltedX < 72, `the walker stays west of the barrier (x=${boltedX.toFixed(1)})`);

    // Back to the street via the walk-off-screen LEFT edge.
    key("ArrowLeft");
    await until("the left edge walks back to Kowloon Lane", () => !!q('[data-npc-id="rs_npc_ping"]'), 15000);
    keyUp("ArrowLeft");

    // N: talk to the nearest linked character, no mouse. The reply sets
    // rs_ping_told, which unboltts both the barrier and the marker.
    key("n");
    // 20s: fifteen animated foreground extras make headless frames slower
    // than the old 12s budget — a player's browser is nowhere near this.
    await until("N opens Ping's conversation", () => qa(".stage-marker[disabled]").length > 0, 20000);
    for (let i = 0; i < 12 && !qa("button").some((b) => /bolted the gate/i.test(b.textContent || "")); i++) {
      key(" ", "Space");
      await sleep(420);
    }
    // Choice buttons stay disabled until their beat's text has finished
    // typing — clicking early is swallowed. Wait for the enabled button.
    const clickChoice = async (re: RegExp, label: string) => {
      for (let i = 0; i < 20; i++) {
        const btn = qa<HTMLButtonElement>("button").find((b) => re.test(b.textContent || ""));
        if (btn && !btn.disabled) {
          btn.click();
          await sleep(600);
          return;
        }
        key(" ", "Space");
        await sleep(420);
      }
      ok(false, `${label} — choice button never enabled`);
    };
    await clickChoice(/bolted the gate/i, "the tip lands");
    // A linear stage conversation lingers until every usable reply is spent
    // (no leave button) — spend the goodbye too, then the auto-close fires.
    await clickChoice(/appreciate the noodles/i, "the goodbye lands");
    await until("Ping's conversation closes", () => qa(".stage-marker[disabled]").length === 0, 8000);

    // Through the gate again, up the now-unbolted stairs, into the test.
    ok(await coinVerb("Go to"), "arming the Go to verb");
    marker("rsh_gate")!.click();
    await until("back in the alley", () => !!q('.stage-marker[data-hs-id="rsh_stairs"]'), 15000);
    // The Stage remounts per scene, and the coin's armed verb resets with it
    // (default 👁) — re-arm GO or the stairs click examines instead of climbing.
    ok(await coinVerb("Go to"), "re-arming the Go to verb after the remount");
    marker("rsh_stairs")!.click();
    await until("the stairs lead to the K-Wesson room", () => !q("[data-stage-player]"), 15000);
    ok(!q("[data-stage-player]"), "the classic room takes over (no walker left behind)");
    let claimPlayed = false;
    for (let i = 0; i < 16 && !claimPlayed; i++) {
      claimPlayed = /logs don't blink/i.test(text());
      key(" ", "Space");
      await sleep(420);
    }
    ok(claimPlayed, "the K-Wesson claim beat plays (the lie is armed)");
  }

  /* ---------------- final report ---------------- */
  const realProblems = problems.filter(([k, m]) => !(k === "console.error" && /Maximum update depth/.test(m)));
  ok(realProblems.length === 0, "no console errors/warnings during the whole run",
    realProblems.slice(0, 4).map(([k, m]) => `${k}: ${m.slice(0, 1600)}`).join(" || "));
  ok(!crashed(), "the error boundary never tripped");

  root?.unmount();
}

(async () => {
  try {
    await part1();
    await parts2to4();
  } catch (err) {
    failures.push(`probe threw: ${String((err as Error)?.stack || err)}`);
  }
  console.log(`\n=== STAGE BETA: ${passes.length} passed, ${failures.length} failed ===`);
  for (const f of failures) console.log("  ✗ " + f);
  if (failures.length) process.exitCode = 1;
})();
