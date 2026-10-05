import type { StageObstacle, Story } from "../types";
import type { SpriteSheet } from "../game/spriteSheet";

/**
 * RAIN SECTOR — THE KAEL FILE
 *
 * A neo-noir synthetic-hunter case built the way a creator builds it in the
 * Studio today, deliberately exercising EVERY layer the engine grew in the
 * 2025 adventure push, so the friction shows up here instead of in a
 * creator's draft:
 *
 *  · 🚶 Two STAGE rooms (a neon street and a back alley) with a real sprite
 *    sheet sliced by `scripts/make-sprite-sheet.mjs` from a magenta plate.
 *  · 🎛 Verb coin + 💬 SENTENCE LINE + 👢 extended verbs (you KICK a jammed
 *    vending machine to shake a key card loose — the noir lock-and-key).
 *  · 🔁 MULTI-STATE object: the dead-drop locker re-skins from locked to
 *    hanging-open to taken.
 *  · 🚪 DOOR: the alley's stair gate is a gate-aware BARRIER — it is a wall
 *    until Old Ping tells you who bolted it (flag-gated, spatial).
 *  · 🧹 INTERACTABLE NPC: Old Ping patrols his counter; click HIM (or press
 *    N) and the walker chases his live position to start the conversation.
 *    The umbrella woman is ambient set dressing on the same plate.
 *  · 👁 REMOTE look: the billboard across the street answers from range.
 *  · ➡ Walk-off-screen edge exit + entry spawns (alley ⇄ street).
 *  · 🎯 The K-Wesson empathy test is a PRESS-THE-LIE beat — a photograph
 *    breaks her claim; two wrong presents and she's gone in the rain.
 *  · Three endings: gold (let her run), silver (retire the unit), gameover.
 */

/** Mara's walk cycle — four frames sliced from the magenta plate
 *  (plates/rs-mara-walk.png → public/assets/sprites/rs-mara-walk.png). */
const RS_WALK: SpriteSheet = {
  image: "/assets/sprites/rs-mara-walk.png",
  frameWidth: 293,
  frameHeight: 560,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: true,
};

/** Old Ping's patrol — four frames from plates/rs-ping-walk.png. */
const RS_PING_SHEET: SpriteSheet = {
  image: "/assets/sprites/rs-ping-walk.png",
  frameWidth: 285,
  frameHeight: 540,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 8 },
  },
  pixelated: true,
};

/** The umbrella woman — taller, slower cadence, from plates/rs-umbrella-walk.png. */
const RS_UMBRELLA_SHEET: SpriteSheet = {
  image: "/assets/sprites/rs-umbrella-walk.png",
  frameWidth: 321,
  frameHeight: 600,
  animations: {
    idle: { frames: [0] },
    walk: { frames: [0, 1, 2, 3], fps: 7 },
  },
  pixelated: true,
};

/** Police spinner on a lazy sweep — the flyby cycles even at "rest":
 *  idle is the same 4-frame loop (beacons, exhaust flicker) at half pace. */
const RS_SPINNER_SHEET: SpriteSheet = {
  image: "/assets/sprites/rs-spinner-fly.png",
  frameWidth: 306,
  frameHeight: 300,
  animations: {
    idle: { frames: [0, 1, 2, 3], fps: 4 },
    walk: { frames: [0, 1, 2, 3], fps: 9 },
  },
  pixelated: true,
};

const walker = (
  floor: { top: number; bottom: number },
  spawn: { x: number; y: number },
  obstacles: StageObstacle[] = [],
  extra: Record<string, unknown> = {}
) => ({
  verbCoin: true,
  sentenceLine: true,
  // Cast at 1.7x — the lane reads better with people big enough to see.
  playerImage: "emoji:🕵️", // fallback if the sheet ever fails to load
  playerSheet: RS_WALK,
  playerScale: 1.7,
  playerNearScale: 1.15,
  playerFarScale: 0.62,
  keyboard: true,
  speed: 16,
  reach: 4,
  depthScale: 0.3,
  hints: "proximity" as const,
  // Authored as a chain of walk-off doorways (the beta plays them by
  // strolling onto them), so this story opts into classic walk-over
  // triggering — which also restores the exact legacy spawn behaviour. New
  // stories get the safer "smart" default, where scene-leaving markers need
  // a deliberate click and an exit under the spawn can't eject the player.
  hotspotTrigger: "walkover" as const,
  floor,
  spawn,
  ...(obstacles.length ? { obstacles } : {}),
  ...extra,
});

export const RAIN_SECTOR: Story = {
  id: "rain-sector",
  title: "Rain Sector — The Kael File",
  tagline: "A synthetic killed her handler. The rain says otherwise. Administer the test.",
  coverImage: "/img/rs-cover.jpg",
  gameKind: "adventure",
  startSceneId: "rs_brief",
  layout: {
    rs_brief: { x: -320, y: 240 },
    rs_street: { x: 40, y: 240 },
    rs_alley: { x: 400, y: 80 },
    rs_room: { x: 400, y: 420 },
    rs_end_free: { x: 840, y: 300 },
    rs_end_retire: { x: 840, y: 100 },
    rs_end_lost: { x: 840, y: 520 },
  },
  briefing: {
    objective:
      "A VEIL-6 synthetic (Iris Kael) killed her handler at the Echelon annex and ran into the Rain Sector. Find her, administer the K-Wesson empathy test, and decide what the department gets back: a confirmation, or a body.",
    winConditions: [
      "Break her claim with the loading-dock photograph, then decide her fate (gold: let her run).",
      "Retire the unit after a confirmed test (silver — clean paperwork, dirty rain).",
    ],
    loseConditions: ["Present the wrong evidence twice: she's gone in the rain, and so is your case."],
  },
  verbResponses: {
    look: [
      "Rain, neon, and somebody's laundry. The city keeps its own ledger.",
      "You've been staring at this block for eleven years. It stares back.",
      "Nothing new. The rain files everything under the same grey folder.",
    ],
    take: [
      "Half this block is welded shut. The other half is watching you.",
      "That belongs to somebody who counts knives the way you count rounds.",
      "You have pockets, not a warehouse.",
    ],
    talk: [
      "It doesn't answer. Down here, that's a personality.",
      "The rain talks enough for both of you.",
      "Nobody on this block talks to a badge for free.",
    ],
    use: [
      "You could, but the machine would only laugh at you in three languages.",
      "Wrong tool. This city runs on key cards and grudges.",
      "It doesn't take kindly to that.",
    ],
    kick: [
      "The block has been kicked before. It holds grudges.",
      "Steel toe, meet civic infrastructure. Infrastructure wins.",
    ],
    punch: ["Save it for somebody breathing."],
  },
  characters: [
    { id: "rs_narrator", name: "Sector Radio", role: "V.O.", avatarUrl: "emoji:📻", trustMeter: 0 },
    {
      id: "rs_mara",
      name: "Mara Vane",
      role: "Retirement Division (you)",
      avatarUrl: "/assets/faces/rs-mara.png",
      trustMeter: 0,
      voice: { pitch: 0.85, rate: 0.98 },
    },
    {
      id: "rs_iris",
      name: "Iris Kael",
      role: "VEIL-6, medical adjunct",
      avatarUrl: "/assets/faces/rs-iris.png",
      trustMeter: 0,
      voice: { pitch: 1.2, rate: 0.95 },
    },
    {
      id: "rs_captain",
      name: "Captain Ostrander",
      role: "Captain, Retirement Division",
      avatarUrl: "/assets/faces/rs-captain.png",
      trustMeter: 1,
      voice: { pitch: 0.7, rate: 0.92 },
    },
    {
      id: "rs_ping",
      name: "Old Ping",
      role: "Noodle bar, Kowloon Lane",
      avatarUrl: "/assets/faces/rs-ping.png",
      trustMeter: 2,
      voice: { pitch: 1.05, rate: 1.05 },
    },
  ],
  items: [
    {
      id: "rs_keycard",
      name: "Magnetic Key Card",
      icon: "🎫",
      description: "Echelon annex issue, scuffed grey. The vending machine had opinions about giving it up.",
      flavorText: "Doors on this block answer to grey plastic, not badges.",
    },
    {
      id: "rs_photo",
      name: "Loading-Dock Photograph",
      icon: "🖼️",
      description:
        "Rain-spotted still: Iris Kael and her handler at the Echelon annex loading dock. Time code 02:14 — four hours AFTER her scheduled review.",
      flavorText: "The camera doesn't blink. Everybody else on this case did.",
      isClue: true,
    },
    {
      id: "rs_tin",
      name: "Warped Cigarette Tin",
      icon: "🚬",
      description: "Rain-warped tin, half a cigarette left. Smells like the alley's whole biography.",
      flavorText: "Evidence of somebody's bad night. Not evidence of anything.",
    },
  ],
  scenes: [
    /* ─────────────────────────── 0 · THE BRIEFING ─────────────────── */
    {
      id: "rs_brief",
      title: "The Kael File",
      background: "/img/rs-brief.jpg",
      cinematic: {
        foregroundExtras: [
          {
            // The desk the file sits on — pushed into the player's lap,
            // the lamp's glow unsteady.
            image: "/assets/sprites/rs-fg-desk.png",
            x: 50, y: 98, scale: 1.05, depth: 0.9,
            anim: { preset: "flicker", intensity: 0.25, speed: 0.5 },
          },
        ],
      },
      ambientAudio: "rain",
      prose:
        "Captain Ostrander's office, ninety floors over the rain. The file on his desk is thin the way files are thin when a corporation wants a thing done quietly. IRIS KAEL. VEIL-6 medical adjunct. Alleged: the retirement of her handler on the annex's loading level. He slides it across with two fingers, like it might bite.",
      dialogueBeats: [
        { id: "rsb_1", characterId: "rs_captain", text: "Echelon flagged the unit rogue at 03:00. Handler's name doesn't matter — what matters is the annex wants this off the books by Friday. She was sighted in the Rain Sector. Kowloon Lane." },
        { id: "rsb_2", characterId: "rs_captain", text: "Administer the K-Wesson. Confirm the unit. Retire it. That's the whole job, Vane. Don't make it a philosophy seminar." },
        { id: "rsb_3", characterId: "rs_mara", text: "And if the test says she's not rogue?" },
        { id: "rsb_4", characterId: "rs_captain", text: "The test says whatever the paper says when you file it. Bring me a paper." },
      ],
      choices: [
        {
          id: "rsc_book",
          text: "\"By the book. Test first, gun after.\"",
          targetSceneId: "rs_street",
          attitudeTag: "Clever",
          consequences: { setFlags: ["rs_bybook"] },
        },
        {
          id: "rsc_cold",
          text: "\"A skinjob is a skinjob. I'll end it tonight.\"",
          targetSceneId: "rs_street",
          attitudeTag: "Aggressive",
          consequences: { setFlags: ["rs_cold"] },
        },
        {
          id: "rsc_curious",
          text: "\"Why does Echelon want this one back so quietly?\"",
          targetSceneId: "rs_street",
          attitudeTag: "Sultry",
          consequences: { setFlags: ["rs_curious"] },
        },
      ],
      hotspots: [],
    },

    /* ─────────────────────────── 1 · KOWLOON LANE ─────────────────── */
    {
      id: "rs_street",
      title: "Kowloon Lane",
      background: "/img/rs-street.jpg",
      ambientAudio: "rain",
      nodeType: "stage",
      prose: "",
      stage: {
        ...walker(
          { top: 62, bottom: 94 },
          { x: 46, y: 90 },
          [{ x: 6, y: 70, w: 26, h: 13 }] // Ping's steamer counter
        ),
        // 👢 extended verbs: the vending machine puzzle needs a KICK.
        extendedVerbs: true,
        // 🧹 NPCs — Old Ping is INTERACTABLE (click HIM or press N to talk);
        // the umbrella woman is ambient set dressing that paces the block.
        npcs: [
          {
            id: "rs_npc_ping",
            image: "emoji:🧑‍🍳", // fallback
            sheet: RS_PING_SHEET,
            scale: 1.7,
            x: 14,
            y: 88,
            speed: 12,
            patrol: [
              { x: 22, y: 88, pause: 2.5 },
              { x: 12, y: 88, pause: 2.5 },
            ],
            talkHotspotId: "rsh_ping",
          },
          {
            id: "rs_npc_umbrella",
            image: "emoji:🌂", // fallback
            sheet: RS_UMBRELLA_SHEET,
            scale: 1.7,
            x: 62,
            y: 78,
            speed: 9,
            patrol: [
              { x: 78, y: 78, pause: 1.5 },
              { x: 58, y: 84, pause: 1.5 },
            ],
          },
          {
            // SET DRESSING with a searchlight attitude: a police spinner
            // sweeping the skyline above the billboards. No talk link — it
            // is very far away and very uninterested in the street.
            id: "rs_npc_spinner",
            sheet: RS_SPINNER_SHEET,
            x: 4,
            y: 14,
            scale: 0.85,
            speed: 14,
            patrol: [
              { x: 98, y: 11, scale: 0.6 },
              { x: 2, y: 17, scale: 0.9 },
            ],
            patrolMode: "pingpong",
          },
        ],
        entrySpawns: {
          rs_alley: { x: 88, y: 90 },
        },
        enterCaption:
          "Kowloon Lane. Rain like static on a dead channel. Steam off Ping's woks, neon off everything else. Somewhere above the billboards, a spinner's searchlight drags the sky.",
      },
      cinematic: {
        foregroundExtras: [
          // FOREGROUND SPRITES (Studio's foreground editor layer) — the
          // street dresses itself: weather, signage, life.
          {
            // Laundry strung between the blocks, high and out of the way.
            image: "/assets/sprites/rs-fg-laundry.png",
            x: 24, y: 8, scale: 0.9, depth: 0.3,
            anim: { preset: "sway", intensity: 0.5 },
          },
          {
            // A flickering blade sign over the middle of the lane.
            image: "/assets/sprites/rs-fg-neon.png",
            x: 47, y: 30, scale: 0.7, depth: 0.35,
            anim: { preset: "flicker", intensity: 0.8 },
          },
          {
            // Two strangers sharing an umbrella, mid-distance.
            image: "/assets/sprites/rs-fg-crowd.png",
            x: 58, y: 66, scale: 0.5, depth: 0.55,
            anim: { preset: "bob", intensity: 0.5, speed: 0.7 },
            occludes: true,
          },
          {
            // Curb steam vent, amber-lit.
            image: "/assets/sprites/rs-fg-vent.png",
            x: 78, y: 82, scale: 0.5, depth: 0.6,
            anim: { preset: "drift", intensity: 0.7 },
            occludes: true,
          },
          {
            // The lane's real supervisor.
            image: "/assets/sprites/rs-fg-cat.png",
            x: 4, y: 68, scale: 0.42, depth: 0.62,
            anim: { preset: "breathe", intensity: 0.4, speed: 0.7 },
          },
          {
            // Wok steam over Ping's stall — three real billow phases.
            image: "/assets/sprites/rs-fg-steam-wok.png",
            sheet: {
              image: "/assets/sprites/rs-fg-steam-wok.png",
              frameWidth: 516,
              frameHeight: 600,
              animations: { loop: { frames: [0, 1, 2], fps: 3 } },
              pixelated: true,
            },
            x: 14, y: 44, scale: 0.8, depth: 0.4,
          },
          {
            // A puddle working through its ripple rings where the awning drips.
            image: "/assets/sprites/rs-fg-puddle.png",
            sheet: {
              image: "/assets/sprites/rs-fg-puddle.png",
              frameWidth: 704,
              frameHeight: 560,
              animations: { loop: { frames: [0, 1, 2], fps: 2.5 } },
              pixelated: true,
            },
            x: 40, y: 95, scale: 0.85, depth: 0.7,
          },
          {
            // The hologram ad above the billboards, glitching through her
            // broadcast — solid, banded, half-faded, forever.
            image: "/assets/sprites/rs-fg-hologram.png",
            sheet: {
              image: "/assets/sprites/rs-fg-hologram.png",
              frameWidth: 277,
              frameHeight: 600,
              animations: { loop: { frames: [0, 1, 2], fps: 4 } },
              pixelated: true,
            },
            x: 88, y: 12, scale: 0.38, depth: 0.3,
          },
          {
            // Two splash bursts where the rain hits hard — same sheet, two
            // placements, out of phase via the anim delay.
            image: "/assets/sprites/rs-fg-splash.png",
            sheet: {
              image: "/assets/sprites/rs-fg-splash.png",
              frameWidth: 628,
              frameHeight: 380,
              animations: { loop: { frames: [0, 1, 2], fps: 5 } },
              pixelated: true,
            },
            x: 64, y: 93, scale: 0.3, depth: 0.85,
          },
          {
            image: "/assets/sprites/rs-fg-splash.png",
            sheet: {
              image: "/assets/sprites/rs-fg-splash.png",
              frameWidth: 628,
              frameHeight: 380,
              animations: { loop: { frames: [2, 0, 1], fps: 4 } },
              pixelated: true,
            },
            x: 90, y: 96, scale: 0.26, depth: 0.8,
          },
          {
            // The rain itself — a two-phase streak field laid over the
            // whole plate, flickering between passes.
            image: "/assets/sprites/rs-fg-rain.png",
            sheet: {
              image: "/assets/sprites/rs-fg-rain.png",
              frameWidth: 685,
              frameHeight: 700,
              animations: { loop: { frames: [0, 1], fps: 6 } },
              pixelated: true,
            },
            fit: "cover",
            x: 50, y: 50, scale: 1.05, depth: 0.97,
          },
          {
            // A passerby crossing the NEAR plane — walks the bottom of the
            // plate on a slow loop, facing the way they travel.
            image: "/assets/sprites/rs-fg-pedestrian.png",
            sheet: {
              image: "/assets/sprites/rs-fg-pedestrian.png",
              frameWidth: 307,
              frameHeight: 600,
              animations: { loop: { frames: [0, 1, 2, 3], fps: 6 } },
              pixelated: true,
            },
            x: -15, y: 97, scale: 1.3, depth: 0.95,
            motion: {
              points: [
                { x: -15, y: 97 },
                { x: 115, y: 97 },
              ],
              duration: 28,
              faceTravel: true,
              holdSeconds: 6,
            },
          },
        ],
      },
      hotspots: [
        {
          // INTERACTABLE NPC talker — the diamond hides; Ping IS the marker.
          id: "rsh_ping",
          label: "Old Ping",
          bounds: { x: 10, y: 58, w: 12, h: 28 },
          cursor: "talk",
          isRepeatable: true,
          action: { type: "startDialogue" },
        },
        {
          // MULTI-STATE, the noir lock-and-key: the machine is NEVER gated
          // (an object-level gate would lock out the very verbs that open
          // it — verbs resolve before gates). Ungated, it answers 👁 look
          // and 👢 kick; the kick's flag re-skins the same marker into the
          // tray with the card in it, and the take consumes it.
          id: "rsh_vend",
          label: "the jammed vending machine",
          bounds: { x: 30, y: 64, w: 12, h: 26 },
          cursor: "look",
          verbs: {
            look: { type: "showText", text: "VEND-LOOK: a wall of grey machines. One wears a OUT OF ORDER sign and a dent the shape of somebody's frustration." },
            kick: {
              type: "showText",
              text: "BOOT-CLANG. The machine shudders, thinks about it, and spits a scuffed magnetic key card into the tray.",
              flagSet: "rs_key_dropped",
            },
          },
          action: {
            type: "showText",
            text: "VEND-JAMMED: the machine hums, gulps, and returns exactly nothing. The OUT OF ORDER sign has been there longer than your badge.",
          },
          states: [
            {
              id: "st_vend_tray",
              when: { requiresFlags: ["rs_key_dropped"] },
              label: "the key card in the tray",
              image: "/assets/sprites/rs-vend-tray.png",
              cursor: "take",
              action: { type: "giveItem", itemGranted: "rs_keycard" },
            },
          ],
        },
        {
          id: "rsh_billboard",
          label: "the geisha billboard",
          bounds: { x: 70, y: 6, w: 26, h: 26 },
          cursor: "look",
          remote: true,
          isRepeatable: true,
          verbs: {
            look: {
              type: "showText",
              text: "BILLBOARD: forty feet of a smiling hologram woman selling migration to the off-world colonies. She's been smiling since before you made detective. Up here, nobody blinks — you checked once.",
            },
          },
          action: { type: "showText", text: "BILLBOARD: forty feet of a smiling hologram woman selling the off-world colonies. She never blinks." },
        },
        {
          id: "rsh_gate",
          label: "the alley gate",
          bounds: { x: 88, y: 62, w: 10, h: 30 },
          cursor: "go",
          isRepeatable: true,
          gating: { requiresItems: ["rs_keycard"] },
          customFailMessage: "GATE: mag-locked, chain backed. It wants a key card you don't have.",
          action: {
            type: "useItem",
            targetSceneId: "rs_alley",
            text: "The key card slaps the reader. Somewhere in the chain-link, a magnetic latch lets go with a sound like a knuckle cracking.",
          },
        },
      ],
      dialogueBeats: [
        { id: "rss_p1", characterId: "rs_ping", text: "Detective Vane! You only come down Kowloon Lane when somebody's lost or somebody's found. Which one tonight?" },
        { id: "rss_p2", characterId: "rs_mara", text: "A woman. Young, dark bob, good coat. Runs like she's being timed." },
        { id: "rss_p3", characterId: "rs_ping", text: "Hah! Half the lane runs like that. But — yes. She ate here. Two bowls, no conversation, paid in Echelon scrip. Then she went up the back stairs behind the alley gate, and Ping bolted the gate behind her, because that is what one does for a paying customer." },
        {
          id: "rss_p4",
          characterId: "rs_ping",
          conditionRule: { requiresFlags: ["rs_curious"] },
          text: "You want to know why Echelon wants her quiet? Ping only cooks noodles. But the man who came asking BEFORE you wore city shoes and corporate patience. Draw your own soup, detective.",
        },
      ],
      choices: [
        {
          id: "rsc_ping_thanks",
          text: "\"Bolted the gate. Kind of you. Leave it bolted for me.\"",
          reply: true,
          attitudeTag: "Sultry",
          consequences: { setFlags: ["rs_ping_told"] },
        },
        {
          id: "rsc_ping_bye",
          text: "\"Appreciate the noodles, Ping.\" (step back into the rain)",
          reply: true,
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ─────────────────────────── 2 · BEHIND THE LANE ──────────────── */
    {
      id: "rs_alley",
      title: "Behind Kowloon Lane",
      background: "/img/rs-alley.jpg",
      ambientAudio: "rain",
      nodeType: "stage",
      prose: "",
      stage: {
        ...walker(
          { top: 60, bottom: 94 },
          { x: 10, y: 90 },
          [
            { x: 26, y: 68, w: 16, h: 10 }, // the crates
            // 🚪 THE DOOR: a gate-aware barrier. Until Old Ping tells you
            // he bolted it AND you ask him to unbolt it (rs_ping_told),
            // the stair gate is a WALL the router refuses.
            { x: 72, y: 56, w: 8, h: 40, gating: { requiresFlags: ["rs_ping_told"] } },
          ],
          {
            exitEdges: {
              left: { targetSceneId: "rs_street", label: "back to Kowloon Lane" },
            },
            entrySpawns: {
              rs_street: { x: 8, y: 90 },
            },
          }
        ),
        enterCaption:
          "Behind the lane. Steam off the vents, rust off the lockers, rain off everything. The stair gate stands in its chain-link like a verdict.",
      },
      cinematic: {
        foregroundExtras: [
          {
            // Wet crates boxing in the service entrance — the rain
            // drums on them (a barely-there rattle).
            image: "/assets/sprites/rs-fg-crates.png",
            x: 34, y: 78, scale: 0.8, depth: 0.6,
            anim: { preset: "shake", intensity: 0.15, speed: 0.35 },
            occludes: true,
          },
          {
            // A downspout down the right wall, above the stair gate —
            // wind rattles it, faintly.
            image: "/assets/sprites/rs-fg-pipe.png",
            x: 98, y: 42, scale: 0.8, depth: 0.35,
            anim: { preset: "shake", intensity: 0.1, speed: 0.25 },
          },
          {
            // …and the joint DRIPS, on a three-frame loop.
            image: "/assets/sprites/rs-fg-drip.png",
            sheet: {
              image: "/assets/sprites/rs-fg-drip.png",
              frameWidth: 494,
              frameHeight: 400,
              animations: { loop: { frames: [0, 1, 2], fps: 3 } },
              pixelated: true,
            },
            x: 96, y: 64, scale: 0.4, depth: 0.5,
          },
          {
            // A transformer that crackles when it feels like it.
            image: "/assets/sprites/rs-fg-transformer.png",
            sheet: {
              image: "/assets/sprites/rs-fg-transformer.png",
              frameWidth: 404,
              frameHeight: 520,
              animations: { loop: { frames: [0, 0, 1, 0, 2], fps: 6 } },
              pixelated: true,
            },
            x: 9, y: 38, scale: 0.42, depth: 0.4,
          },
          {
            // A wall fan spinning behind its grille.
            image: "/assets/sprites/rs-fg-fan.png",
            sheet: {
              image: "/assets/sprites/rs-fg-fan.png",
              frameWidth: 503,
              frameHeight: 520,
              animations: { loop: { frames: [0, 1, 2], fps: 8 } },
              pixelated: true,
            },
            x: 45, y: 34, scale: 0.36, depth: 0.35,
          },
          {
            // The rat. There is always a rat.
            image: "/assets/sprites/rs-fg-rat.png",
            sheet: {
              image: "/assets/sprites/rs-fg-rat.png",
              frameWidth: 746,
              frameHeight: 300,
              animations: { loop: { frames: [0, 1, 2, 3], fps: 12 } },
              pixelated: true,
            },
            x: 64, y: 92, scale: 0.35, depth: 0.75,
            motion: {
              points: [
                { x: 64, y: 92 },
                { x: 4, y: 95 },
              ],
              duration: 7,
              faceTravel: true,
              holdSeconds: 14,
            },
          },
          {
            // THE GHOST BEAT: a woman in a pale coat crosses the far end of
            // the alley exactly once a minute, and dissolves before the
            // stairs. You are meant to doubt her.
            image: "/assets/sprites/rs-fg-iris.png",
            sheet: {
              image: "/assets/sprites/rs-fg-iris.png",
              frameWidth: 433,
              frameHeight: 580,
              animations: { loop: { frames: [0, 1, 2, 3], fps: 10 } },
              pixelated: true,
            },
            x: 62, y: 68, scale: 0.5, depth: 0.5,
            motion: {
              points: [
                { x: 62, y: 68 },
                { x: 94, y: 64 },
              ],
              duration: 3.4,
              loop: "once",
              fadeTo: 0,
              faceTravel: true,
              delay: 50,
            },
          },
        ],
      },
      hotspots: [
        {
          id: "rsh_reader",
          label: "the scraped keyhole",
          bounds: { x: 24, y: 46, w: 10, h: 20 },
          cursor: "use",
          gating: { requiresItems: ["rs_keycard"] },
          customFailMessage: "READER: grey doors, mag-locked. The keyhole is scraped shiny — somebody was here recently — but it wants a key card.",
          action: {
            type: "showText",
            text: "MAG-CLICK. The key card wakes the reader; locker 9 yawns open like it has been waiting all night to be asked.",
            flagSet: "rs_locker_open",
          },
          verbs: {
            look: { type: "showText", text: "READER-LOOK: ranks of grey dead-drop doors. One keyhole is scraped shiny around its edge. Fresh." },
          },
        },
        {
          // MULTI-STATE — the same marker, three faces: locked (base, gate
          // shut), hanging-open (flag set: gate cleared, new label/action),
          // and consumed once the photograph is genuinely taken.
          id: "rsh_lockers",
          label: "the dead-drop lockers",
          bounds: { x: 12, y: 42, w: 12, h: 26 },
          cursor: "take",
          gating: { requiresFlags: ["rs_locker_open"] },
          customFailMessage: "LOCKERS: mag-locked ranks of grey. Whatever locker 9 is holding, it isn't holding it for you. Yet.",
          action: { type: "showText", text: "LOCKERS: mag-locked ranks of grey. Whatever locker 9 is holding, it isn't holding it for you. Yet." },
          states: [
            {
              id: "st_locker_open",
              when: { requiresFlags: ["rs_locker_open"] },
              gating: null, // the opened locker is no longer locked
              label: "the hanging-open locker 9",
              action: { type: "giveItem", itemGranted: "rs_photo" },
            },
          ],
        },
        {
          id: "rsh_tin",
          label: "a warped cigarette tin",
          bounds: { x: 40, y: 76, w: 10, h: 16 },
          cursor: "take",
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "rs_tin" },
        },
        {
          // ENTRANCE AS HOTSPOT — the way you came in, clickable. The left
          // walk-off-screen edge also works, but a labeled marker means you
          // can always find the way back.
          id: "rsh_mouth",
          label: "the mouth of the alley",
          bounds: { x: 2, y: 52, w: 8, h: 42 },
          cursor: "go",
          isRepeatable: true,
          // An intentional walk-off doorway: the beta (and the player) leave
          // by strolling onto it, so opt this one marker into step-on firing.
          walkOver: true,
          action: {
            type: "goToScene",
            targetSceneId: "rs_street",
            text: "You duck back under the chain-link and into the noise of the lane.",
          },
        },
        {
          id: "rsh_stairs",
          label: "the stair gate",
          bounds: { x: 78, y: 58, w: 10, h: 32 },
          cursor: "go",
          isRepeatable: true,
          // An intentional walk-off doorway: the beta (and the player) leave
          // by strolling onto it, so opt this one marker into step-on firing.
          walkOver: true,
          gating: { requiresFlags: ["rs_ping_told"] },
          customFailMessage: "STAIRS: chained and bolted. Ping keeps the bolt — and Ping doesn't unbolt it for strangers.",
          action: { type: "goToScene", targetSceneId: "rs_room" },
        },
      ],
      dialogueBeats: [],
      choices: [],
    },

    /* ─────────────────────── 3 · THE K-WESSON TEST ────────────────── */
    {
      id: "rs_room",
      title: "The K-Wesson Test",
      background: "/img/rs-room.jpg",
      ambientAudio: "tension",
      cinematic: {
        foregroundExtras: [
          {
            // The machine between you and her, close enough to hear.
            image: "/assets/sprites/rs-fg-kampff.png",
            x: 78, y: 88, scale: 0.85, depth: 0.85,
            anim: { preset: "pulse", intensity: 0.25, speed: 0.6 },
          },
        ],
      },
      prose:
        "Top of the stairs, a back room over the noodle steam: two chairs, one cone of white light, a window doing its best to hold the neon out. Iris Kael sits like the word 'composed' was assigned to her at manufacture. You set the K-Wesson between you. Its paper strip waits to draw the shape of her answers.",
      hotspots: [
        {
          // EXIT AS HOTSPOT — the stairs you came up. Open until the test
          // concludes (rs_caught); after that the endings carry you off.
          id: "rsh_down",
          label: "back down the stairs",
          bounds: { x: 4, y: 58, w: 14, h: 36 },
          cursor: "go",
          isRepeatable: true,
          // An intentional walk-off doorway: the beta (and the player) leave
          // by strolling onto it, so opt this one marker into step-on firing.
          walkOver: true,
          gating: { excludesFlags: ["rs_caught"] },
          action: {
            type: "goToScene",
            targetSceneId: "rs_alley",
            text: "You leave the cone of light and the composed woman in it. The stairs take you back down into the steam.",
          },
        },
      ],
      dialogueBeats: [
        {
          id: "rsr_1",
          characterId: "rs_iris",
          text: "You're the third badge this month. The first two read me my rights and left when the rain got heavy. Go on, detective. Ask your questions. I have nowhere to be and all the patience in the sector.",
        },
        {
          id: "rsr_2",
          characterId: "rs_mara",
          conditionRule: { requiresFlags: ["rs_cold"] },
          text: "\"Let's skip the part where you cry.\" You thumb the magazine release and set the pistol on the table, muzzle toward the window. The K-Wesson stays in the case.",
        },
        {
          id: "rsr_3",
          characterId: "rs_mara",
          conditionRule: { requiresFlags: ["rs_bybook"] },
          text: "You leave the iron where it sleeps and cue the first calibration slide. \"Standard empathy battery. A tortoise flips on its back in the desert sun. You watch it. What do you feel?\"",
        },
        {
          id: "rsr_claim",
          characterId: "rs_iris",
          expression: "level",
          text: "You want the annex? I have never had an unscheduled contact with my handler. Reviews were monthly, in the open court, minutes kept. There is no photograph of me anywhere near that loading dock, because I was never anywhere near that loading dock. Check the logs. The logs don't blink.",
          lie: {
            claim: "Iris says she never had unscheduled contact with her handler and was never near the loading dock.",
            evidenceItemIds: ["rs_photo"],
            contradictedFlag: "rs_caught",
            caughtBeat: {
              id: "rsr_caught",
              characterId: "rs_iris",
              conditionRule: { requiresFlags: ["rs_caught"] },
              text: "The photograph lands in the light. Her, the handler, the dock, 02:14 in the corner — four hours after the court adjourned. The paper strip on the K-Wesson draws one long flat line, and Iris Kael, VEIL-6, medical adjunct, does the one thing the manual says she can't. She smiles like it hurts. \"…He called it a kindness meeting. Their logs blink, detective. I just learned where.\"",
            },
            wrongBeat: {
              id: "rsr_wrong",
              characterId: "rs_iris",
              text: "She glances at the tin and something in the room drops ten degrees. \"Somebody's cigarettes. You dragged a woman's hiding place over the city for somebody's cigarettes? The strip is flat, detective. Your machine says I'm telling the truth, and your machine is the only witness Echelon will pay for. Present evidence or present apologies.\"",
            },
            wrongEvidenceLimit: 2,
            contradictedConsequences: {
              trustChanges: [{ characterId: "rs_iris", delta: 2 }],
              meterChanges: [{ meter: "Clever", delta: 1 }],
            },
            wrongConsequences: {
              trustChanges: [{ characterId: "rs_iris", delta: -1 }],
              meterChanges: [{ meter: "Suspicion", delta: 1 }],
            },
            rememberLine: "Iris Kael knows you caught the loading dock in her story.",
          },
        },
      ],
      choices: [
        {
          id: "rsc_free",
          text: "\"Test came back flat. Nothing up here but noodles.\" — log it unconfirmed and point her at the off-world freighter.",
          targetSceneId: "rs_end_free",
          attitudeTag: "Sultry",
          gating: { requiresFlags: ["rs_caught"] },
        },
        {
          id: "rsc_retire",
          text: "\"Confirmed rogue.\" — file the paper, do the job, catch the spinner home.",
          targetSceneId: "rs_end_retire",
          attitudeTag: "Aggressive",
          gating: { requiresFlags: ["rs_caught"] },
        },
        {
          id: "rsc_walk",
          text: "Close the case file and walk back down into the rain, decided about nothing.",
          targetSceneId: "rs_end_lost",
          attitudeTag: "Neutral",
        },
      ],
    },

    /* ───────────────────────────── ENDINGS ────────────────────────── */
    {
      id: "rs_end_free",
      title: "Flat Line, Open Sky",
      isEnding: true,
      background: "/img/rs-end-free.jpg",
      prose:
        "The freighter lifts at 04:40 with the rain going sideways and one passenger unlisted, and Iris Kael rides it out of the sector wearing a coat you never saw. Your report says TEST INCONCLUSIVE — SUBJECT AT LARGE, which is eleven words away from a lie. Ostrander reads it twice and puts it in the drawer where the department keeps its quiet. The K-Wesson said flat. The photograph said 02:14. Somewhere over the pacific the two of them are still arguing, and you have stopped being the judge. The rain keeps falling. You let it.",
      endingData: {
        tier: "victory-gold",
        headline: "FLAT LINE, OPEN SKY — ONE PASSENGER UNLISTED",
        recap: "You broke her claim, read the flat line for what it was, and logged the kindest lie the department will ever file.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "rs_end_retire",
      title: "Clean Paper, Dirty Rain",
      isEnding: true,
      background: "/img/rs-end-retire.jpg",
      prose:
        "The paper says CONFIRMED. The spinner takes her at 05:00 without its running lights, the way the division prefers. Ostrander shakes your hand with all four fingers of his and Echelon's annex gets its quiet by Friday. On the way down Kowloon Lane, Ping's woks are steaming for the morning shift and he doesn't look up when you pass. The test came back flat and you filed it rogue, and the rain — which has been filing reports on this city since before either of you were manufactured — says nothing at all.",
      endingData: {
        tier: "victory-silver",
        headline: "CASE CLOSED BY FRIDAY — AS REQUESTED",
        recap: "You confirmed the unit and retired it, exactly as instructed. The instructions were the easy part.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
    {
      id: "rs_end_lost",
      title: "Gone in the Rain",
      isEnding: true,
      background: "/img/rs-street.jpg",
      prose:
        "By the time the second wrong photograph hits the table she is already moving — through the window's neon and down the fire escape with the unhurried speed of something that was built to run. The sector swallows her between a noodle steam and a prayer sign, and the K-Wesson strip in your case is blank as a fresh lie. Ostrander takes one look at the file and puts you on day patrols at the cannery pier, where the rain is exactly as heavy and the decisions arrive already made.",
      endingData: {
        tier: "gameover",
        headline: "SUBJECT AT LARGE — BADGE REDUCED",
        recap: "Two wrong presents and a walk-away. The Rain Sector keeps her, and the department keeps you.",
      },
      hotspots: [],
      dialogueBeats: [],
      choices: [],
    },
  ],
};
