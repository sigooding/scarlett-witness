import type { Story } from "../types";

/**
 * DEMO 5 — "THE ART ROOM"
 * ───────────────────────
 * A teaching case for the MEDIA PIPELINE — the one part of Studio the other
 * four Demo Labs never touch. Conversation, Scene Craft, Branching Reel and
 * Press the Lie all assume the art already exists; this reel is about how the
 * art gets made.
 *
 * Every scene carries a 📝 author note (visible on its Studio canvas card)
 * explaining the exact clicks. Open it in 🎬 Studio Editor to read the notes,
 * press ▶ Play to see the result.
 *
 * Teaches:
 *   · 🪄 Background remover — EDGE FLOOD vs COLOUR KEY and when each is right
 *   · Why a key "does nothing": the key COLOUR is wrong, not the tool
 *   · Tolerance vs softness, and reading the removal-% readout
 *   · Why a busy/graded backdrop can never be cut by one colour key
 *   · ⚡ Auto-build sheet — flat backdrop, gap detection, overriding the count
 *   · Frame grids & named animations (rest / talk / loop)
 *   · SCALE IS AUTHORED, NOT BAKED IN — the lesson that fixes "my sprite is
 *     tiny": frame height is resolution; on-screen size is talkingScale /
 *     scale / playerScale wherever the sprite is placed.
 *
 * The shipped art is real, not decorative: curator-talk.png and lightbox.png
 * were cut from flat-magenta plates by scripts/art-room/forge-sheet.mjs, a
 * 1:1 Node port of src/studio/spriteForge.ts. The quoted numbers come from
 * scripts/art-room/diagnose.mjs:
 *   curator plate  → 0.0% subject damage  (flat magenta — clean cut)
 *   lightbox plate → 2.7% subject damage  (flat magenta — clean cut)
 *   practice plate → 0.4% subject damage  (flat magenta — clean cut)
 *   bad-plate.png  → 13.1% subject damage (busy brick — key punches holes)
 *
 * practice-plate-magenta.png is shipped UNCUT on purpose: it is the reel's
 * homework. Feeding it to Media Tools → Sheet slicer → ⚡ Upload art should
 * report 3 sprites at 247×512 — a verifiable result the author can check
 * their own hands against.
 */

const A = "/assets/art-room-template/";

/** The curator's talking sheet — 4 frames, 208×512 each, cut from magenta. */
const CURATOR_SHEET = {
  image: A + "curator-talk.png",
  frameWidth: 208,
  frameHeight: 512,
  animations: {
    rest: { frames: [0] },
    talk: { frames: [0, 1, 2, 1], fps: 7 },
  },
  pixelated: false,
};

/** The lightbox prop — 3 frames, 176×256 each, a warm-up loop. */
const LIGHTBOX_SHEET = {
  image: A + "lightbox.png",
  frameWidth: 176,
  frameHeight: 256,
  animations: {
    loop: { frames: [0, 1, 2, 1], fps: 4 },
    hold: { frames: [2], loop: false },
  },
  pixelated: false,
};

export const DEMO_ART_ROOM: Story = {
  id: "demo-art-room-lab",
  title: "Demo Lab: The Art Room",
  tagline: "Bring your own art in — cut it out, sheet it, and size it right.",
  coverImage: A + "artroom.png",
  startSceneId: "ar_bench",
  layout: {
    ar_bench: { x: 0, y: 220 },
    ar_key: { x: 360, y: 80 },
    ar_note_flat: { x: 360, y: 400 },
    ar_sheet: { x: 720, y: 80 },
    ar_scale: { x: 1080, y: 200 },
    ar_win: { x: 1440, y: 200 },
    ar_leave: { x: 360, y: 620 },
  },
  briefing: {
    objective:
      "Learn the media pipeline: cut a subject out of its backdrop, build a sprite sheet from it, and scale it correctly on screen.",
    winConditions: [
      "Reach 'The Cut Is Clean' ending.",
      "Pick up the Magenta Swatch — it unlocks the sheet-building lesson.",
    ],
    loseConditions: ["Nothing — this is a teaching reel; every path ends."],
  },
  characters: [
    {
      id: "ar_curator",
      name: "Vera Loom",
      role: "Studio archivist — your art instructor",
      avatarUrl: A + "curator-talk.png",
      trustMeter: 0,
      voice: { pitch: 1.05, rate: 0.98 },
      talkingSheet: CURATOR_SHEET,
      talkingX: 76,
      talkingY: 0,
      // 1.15 ≈ a full-height figure against this plate. Deliberately authored
      // (not left at the 1.0 default) because sizing is this reel's whole point.
      talkingScale: 1.15,
      talkingDim: 0.55,
    },
  ],
  items: [
    {
      id: "ar_swatch",
      name: "Magenta Swatch",
      icon: "🟪",
      description: "A card of pure #FF00FF — the flattest backdrop colour in the building.",
      flavorText: "Nothing in a normal photograph is this colour. That is exactly why it works.",
      isClue: true,
    },
  ],
  scenes: [
    /* ── SCENE 1 — the bench ─────────────────────────────────────────── */
    {
      id: "ar_bench",
      title: "The Cutting Bench",
      note:
        "STEP 1 — WHERE THE ART TOOLS LIVE. Everything in this reel is in Studio's 🎨 MEDIA TOOLS tab. " +
        "① The scene BACKGROUND here is an ordinary imported plate (artroom.png) — Scene tab → Background → Image picker. " +
        "② Vera is a CHARACTER with a TALKING SHEET, not a flat portrait: People tab → Talking Animation → pick the sheet, set frame size, name the animations. Her sheet was cut from a flat-magenta plate by the auto-builder — that is what scene 3 teaches. " +
        "③ The glowing lightbox is a FOREGROUND EXTRA with its own sheet on a 'loop' animation: Cinematics panel → Foreground extras → add → pick sheet → animation 'loop'. " +
        "④ Take the magenta swatch hotspot before you leave — the sheet lesson is gated on it, mirroring how a real flat plate is the prerequisite for a clean auto-build.",
      background: A + "artroom.png",
      ambientAudio: "rain",
      cinematic: {
        mode: "static",
        parallaxDepth: 0.15,
        foregroundExtras: [
          {
            image: A + "lightbox.png",
            sheet: LIGHTBOX_SHEET,
            x: 20,
            y: 74,
            scale: 0.3,
            depth: 0.5,
          },
        ],
      },
      prose:
        "Rain on the window. A lightbox breathing warm amber over a bench strewn with paper figures, scissors and film strips.\n\nThis is where outside art becomes game art. Vera Loom has cut ten thousand figures out of ten thousand backdrops, and she has opinions.",
      dialogueBeats: [
        {
          id: "ar_b1",
          characterId: "ar_curator",
          text: "You brought your own art. Good — the built-in library only takes you so far. But a picture isn't a sprite yet. A sprite has no background, a known frame size, and named animations. That's three jobs, and Studio does all three in the Media Tools tab.",
        },
        {
          id: "ar_b2",
          characterId: "ar_curator",
          text: "I'm a sprite myself, by the way. Four frames on one strip — rest, half-open, wide, half-open — cut off a flat magenta card and played back at seven frames a second while I talk. You'll build one exactly like it before you leave.",
        },
        {
          id: "ar_b3",
          characterId: "narrator",
          text: "Take the magenta swatch off the bench. You'll need it.",
        },
      ],
      hotspots: [
        {
          id: "ar_hs_swatch",
          label: "A card of pure magenta on the bench",
          bounds: { x: 40, y: 62, w: 14, h: 16 },
          cursor: "take",
          isRepeatable: false,
          showItemImage: true,
          action: { type: "giveItem", itemGranted: "ar_swatch" },
        },
        {
          id: "ar_hs_lightbox",
          label: "The lightbox",
          bounds: { x: 13, y: 52, w: 14, h: 22 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Three frames — dark, dim, bright — looping at 4fps. It's a foreground extra at scale 0.3. At scale 1.0 this little lamp would stand as tall as the room: props almost always want a scale WELL below 1.",
          },
        },
      ],
      choices: [
        {
          id: "ar_go_key",
          text: "Show me how to remove a background.",
          targetSceneId: "ar_key",
          attitudeTag: "Clever",
        },
        {
          id: "ar_go_leave",
          text: "I'll figure the art out myself.",
          targetSceneId: "ar_leave",
          attitudeTag: "Aggressive",
        },
      ],
    },

    /* ── SCENE 2 — the background remover ────────────────────────────── */
    {
      id: "ar_key",
      title: "Cutting the Backdrop",
      note:
        "STEP 2 — 🪄 BACKGROUND REMOVER (Media Tools). Drop in any image, get a transparent PNG. " +
        "① MODE is the first decision and the one people get wrong. EDGE FLOOD floods inward from the border and removes only backdrop CONNECTED to the edge — so a pale coat survives a pale wall. COLOUR KEY removes EVERY pixel near the picked colour anywhere in the frame — right for flat magenta/green plates, wrong for photographs. " +
        "② If nothing disappears, the KEY COLOUR is wrong — the tool is fine. Click the backdrop directly in the preview to sample the colour under your cursor, or press ⟲ auto to re-sample. " +
        "③ TOLERANCE = how far from that colour still counts as backdrop. Raise it if specks survive; lower it if the cut bites into your art. SOFTNESS feathers the edge. " +
        "④ Read the coloured readout under the preview: it reports the % actually removed and names the failure (wrong key / eating the subject / backdrop too busy). " +
        "⑤ 'Trim to subject' crops the empty margin — important, because a sprite padded with transparency renders TINY even at full scale. " +
        "⑥ Saved cutouts land in 📁 cutouts and appear in every image dropdown.",
      background: A + "bad-plate.png",
      ambientAudio: "drone",
      transition: "fade",
      transitionSpeed: 0.7,
      cinematic: { mode: "zoom-hold", focalPoint: "50% 45%", dimAmount: 0.95 },
      prose:
        "Vera drops a photograph on the lightbox: a man in a pale coat against a brick wall, the light falling off into brown at the floor and blue at the ceiling.\n\n\"Cut him out,\" she says. \"Go on.\"",
      dialogueBeats: [
        {
          id: "ar_k1",
          characterId: "ar_curator",
          text: "You can't. Not with one colour key — and it's worth understanding why, because the tool will look broken when it's actually telling you the truth about your plate.",
        },
        {
          id: "ar_k2",
          characterId: "ar_curator",
          text: "Colour key removes every pixel near ONE colour. This wall is fifty colours: dark blue up top, warm brown at the floor, red brick, grey mortar, damp patches. Pick any one of them and you remove a stripe. Pick a tolerance wide enough to catch them all and you've eaten his coat — it's the same grey as the mortar.",
        },
        {
          id: "ar_k3",
          characterId: "narrator",
          text: "Measured, not guessed: keying this plate punches holes through 13% of the subject. The same measurement on Vera's flat magenta plate reports 0.0% — a perfectly clean cut. That gap is the whole lesson.",
        },
        {
          id: "ar_k4",
          characterId: "ar_curator",
          text: "So: EDGE FLOOD for a photograph. It floods in from the border and stops where the picture stops, so it only takes backdrop that touches the frame edge — his coat is safe because it's connected to him, not to the border. It still won't be perfect on brick. Nothing will.",
        },
        {
          id: "ar_k5",
          characterId: "ar_curator",
          text: "And the real answer? Don't shoot the problem. Put the figure on ONE flat colour in the first place. That's not a workaround, it's how every chroma stage since 1940 has done it. Which is what your swatch is for.",
        },
      ],
      hotspots: [
        {
          id: "ar_hs_coat",
          label: "The pale coat, against the pale mortar",
          bounds: { x: 44, y: 35, w: 16, h: 40 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "His coat and the mortar behind it are within a few points of the same grey. No tolerance setting can keep one and drop the other — colour alone can't tell them apart. Only EDGE FLOOD can, because it uses connectivity instead of colour.",
          },
        },
      ],
      choices: [
        {
          id: "ar_key_sheet",
          text: "Use the magenta swatch — show me the right way.",
          targetSceneId: "ar_sheet",
          attitudeTag: "Clever",
          gating: { requiresItems: ["ar_swatch"] },
        },
        {
          id: "ar_key_noswatch",
          text: "I didn't take the swatch — go back for it.",
          targetSceneId: "ar_bench",
          attitudeTag: "Neutral",
          isRepeatable: true,
        },
      ],
    },

    /* ── NOTE NODE — the flat-plate contract ─────────────────────────── */
    {
      id: "ar_note_flat",
      title: "NOTE — The flat-plate contract",
      nodeType: "note",
      note:
        "NOTE NODES ARE STUDIO-ONLY — players never see them. " +
        "THE CONTRACT FOR A CLEAN AUTO-BUILD: (a) ONE flat backdrop colour behind every frame — magenta #FF00FF or green #00FF00, because neither occurs in skin, cloth or timber; (b) a VISIBLE TRANSPARENT GAP between frames, since the slicer finds frames by the empty columns between them — touching figures merge into one frame; (c) every pose the SAME height and standing on the SAME baseline, because frames are scaled to a uniform grid and bottom-aligned; (d) no drop shadow onto the backdrop — a soft shadow is neither subject nor backdrop and keys into grey mush. " +
        "Meet those four and the auto-builder is a single click. Miss (a) and you get scene 2's problem; miss (b) and you override the sprite count by hand.",
      background: "gradient:linear-gradient(135deg,#2a0a2a,#0d0510)",
      prose: "Studio instruction — bypassed in play.",
      dialogueBeats: [],
      hotspots: [],
      choices: [{ id: "ar_note_flat_next", text: "Continue", targetSceneId: "ar_sheet" }],
    },

    /* ── SCENE 3 — auto-build the sheet ──────────────────────────────── */
    {
      id: "ar_sheet",
      title: "Four Frames on a Flat Card",
      note:
        "STEP 3 — ⚡ AUTO-BUILD SHEET. Anywhere a sprite sheet is accepted (People tab → Talking Animation, Scene → Walkable Stage, Cinematics → foreground extras, or Media Tools → 🎞 Sheet slicer) there is an '⚡ Upload art → auto-build sheet' button. " +
        "① Upload a strip of frames side by side on ONE flat colour. Nothing is applied yet. " +
        "② Tune BACKDROP REMOVAL STRENGTH against the live preview; press ⟲ auto to re-sample the key from the corners. Green guide bands show where it will slice, numbered per frame. " +
        "③ SPRITES shows the auto-detected count. If it's wrong — two touching figures read as one — type the real number and it slices into even bands instead. Check the guides before building. " +
        "④ OUTPUT SIZE is a frame-height CAP: big art keeps its detail, small art is never upscaled into blur. " +
        "⑤ Build. The sheet is saved to 📁 sprites and the frame size + animations are filled in below automatically. " +
        "⑥ Then name the ANIMATIONS. The engine looks up specific names: 'rest' and 'talk' for talking portraits, 'idle' and 'walk' for stage walkers, 'loop' for extras. The preset buttons write them for you. " +
        "Vera's own sheet was built by this exact path: a 1408×768 magenta plate → 4 frames detected at 208×512 each.",
      background: A + "artroom.png",
      ambientAudio: "jazz",
      transition: "fade",
      transitionSpeed: 0.7,
      cinematic: {
        mode: "static",
        parallaxDepth: 0.12,
        foregroundExtras: [
          { image: A + "lightbox.png", sheet: LIGHTBOX_SHEET, x: 20, y: 74, scale: 0.3, depth: 0.5 },
        ],
      },
      prose:
        "Vera pins four poses of herself onto the magenta card, evenly spaced, feet on one line.\n\n\"Same figure, four mouths. Rest, half, wide, half. That's a talking loop.\"",
      dialogueBeats: [
        {
          id: "ar_s1",
          characterId: "ar_curator",
          text: "Upload that strip and the builder does four things: keys the magenta, finds the frames by the empty gaps between them, crops each to its own content, then scales them all to one uniform grid — bottom-aligned, so nobody floats.",
        },
        {
          id: "ar_s2",
          characterId: "ar_curator",
          text: "Gaps matter more than anything. The slicer finds frames by looking for empty columns. Let two figures touch and it sees ONE wide frame. That's not a bug — just type the real sprite count and it slices even bands instead. The green guides show you the split before you commit.",
        },
        {
          id: "ar_s3",
          characterId: "ar_curator",
          text: "Then the names. The engine doesn't play 'animation 1' — it looks up 'talk' when I speak and 'rest' when I don't. Walkers want 'walk' and 'idle'. Props want 'loop'. Get the names wrong and your sprite just stands there, perfectly built and perfectly still.",
        },
        {
          id: "ar_s4",
          characterId: "narrator",
          text: "Vera is running her own sheet right now: 4 frames at 208×512, 'talk' at 7fps while she speaks, 'rest' the moment she stops.",
        },
        {
          id: "ar_s5",
          characterId: "ar_curator",
          text: "There's a spare plate on the bench — three poses of a paper boy, still uncut. Run it through the builder yourself. If it reports three sprites at 247 by 512, you've done it right. Look at the plate for the file path.",
        },
      ],
      hotspots: [
        {
          id: "ar_hs_card",
          label: "The magenta card",
          bounds: { x: 56, y: 30, w: 20, h: 30 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "#FF00FF. No skin tone, no fabric, no timber is anywhere near it, so the tolerance can be generous without touching the art. Green works too. Avoid white and black — they turn up in eyes, teeth, shoes and shadows.",
          },
        },
        {
          id: "ar_hs_practice",
          label: "A spare plate, still uncut",
          bounds: { x: 78, y: 42, w: 16, h: 24 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "PRACTICE PLATE — a real uncut file ships with this reel at /assets/art-room-template/practice-plate-magenta.png. Three poses of a newspaper boy on flat magenta. Open Media Tools → 🎞 Sheet slicer → ⚡ Upload art, feed it that file, and you should see 3 sprites detected at 247×512. Build it, name the animations, and you've done the whole pipeline yourself.",
          },
        },
      ],
      choices: [
        {
          id: "ar_sheet_scale",
          text: "It's built — but it's the wrong size on screen.",
          targetSceneId: "ar_scale",
          attitudeTag: "Clever",
        },
      ],
    },

    /* ── SCENE 4 — scale is authored ─────────────────────────────────── */
    {
      id: "ar_scale",
      title: "The Size Is Not In The Picture",
      note:
        "STEP 4 — SCALE IS AUTHORED, NOT BAKED IN. This is the single most common art-pipeline confusion, so it gets its own scene. " +
        "A sheet's FRAME WIDTH/HEIGHT is only its RESOLUTION — how many pixels of detail exist. It does NOT set how big the sprite appears. On-screen size comes from a scale field wherever the sprite is placed: " +
        "· People tab → talkingScale (talking portraits; ~0.9–1.2 for a full-height figure) " +
        "· Cinematics → foreground extras → scale (props; usually 0.15–0.5 — at 1.0 a table lamp is as tall as the room) " +
        "· Scene → Walkable Stage → playerScale, and each NPC's own scale " +
        "· Stage depthScale additionally shrinks a walker toward the back of the floor band. " +
        "SO: sprite too small? RAISE THE SCALE. Do not re-export the art at a bigger frame size — that only adds file weight and changes nothing on screen. " +
        "Judge every scale against a DOOR or a chair in your background plate; a character shorter than a doorknob breaks the room instantly.",
      background: A + "artroom.png",
      ambientAudio: "jazz",
      cinematic: {
        mode: "static",
        parallaxDepth: 0.12,
        foregroundExtras: [
          // The same lightbox sheet, deliberately shown at three scales.
          { image: A + "lightbox.png", sheet: LIGHTBOX_SHEET, x: 12, y: 74, scale: 0.16, depth: 0.5 },
          { image: A + "lightbox.png", sheet: LIGHTBOX_SHEET, x: 27, y: 74, scale: 0.3, depth: 0.5 },
          { image: A + "lightbox.png", sheet: LIGHTBOX_SHEET, x: 46, y: 74, scale: 0.52, depth: 0.5 },
        ],
      },
      prose:
        "Vera lines up three copies of the same lightbox along the bench. Same sheet. Same frames. Same file.\n\nThey are three different sizes.",
      dialogueBeats: [
        {
          id: "ar_z1",
          characterId: "ar_curator",
          text: "One image, three scales — 0.16, 0.3 and 0.52. Nothing was re-exported. If your sprite comes out too small, this is the number you change, and it's the last place most people look.",
        },
        {
          id: "ar_z2",
          characterId: "ar_curator",
          text: "Frame height is RESOLUTION, not size. A 512-pixel-tall frame just means 512 pixels of detail are available. Build it at 2000 and it won't grow an inch on screen — you'll only make the file heavier.",
        },
        {
          id: "ar_z3",
          characterId: "ar_curator",
          text: "Where the number lives depends on where the sprite lives. Portraits use talkingScale. Foreground props use scale — nearly always well under 1. Stage walkers use playerScale, and depthScale shrinks them as they walk upstage. Same idea, four fields.",
        },
        {
          id: "ar_z4",
          characterId: "ar_curator",
          text: "And measure against the doorway, never against your own eye in isolation. A figure shorter than a doorknob tells the player the room is wrong before they've read a single line. You can't write your way out of a bad scale.",
        },
      ],
      hotspots: [
        {
          id: "ar_hs_three",
          label: "Three lightboxes, one sheet",
          bounds: { x: 8, y: 58, w: 45, h: 22 },
          cursor: "look",
          isRepeatable: true,
          action: {
            type: "showText",
            text: "Identical sheet reference in all three: same image, same 176×256 frames, same 'loop' animation. Only the scale field differs. This is why 'my sprite is tiny' is nearly always a scale problem, not an art problem.",
          },
        },
      ],
      choices: [
        {
          id: "ar_scale_win",
          text: "Understood — let me build my own.",
          targetSceneId: "ar_win",
          attitudeTag: "Sultry",
        },
        {
          id: "ar_scale_back",
          text: "Run the cut-out lesson again.",
          targetSceneId: "ar_key",
          attitudeTag: "Clever",
          isRepeatable: true,
        },
      ],
    },

    /* ── ENDING — success ────────────────────────────────────────────── */
    {
      id: "ar_win",
      title: "The Cut Is Clean",
      background: A + "artroom.png",
      ambientAudio: "jazz",
      isEnding: true,
      prose:
        "Vera drops the offcuts in the bin and switches off the lightbox.\n\n\"Flat backdrop, clear gaps, one baseline, right animation names, and a scale you checked against a door. Do those five and the tools stay out of your way.\"\n\nThe rain keeps on. The bench is clear for the next reel — yours.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THE CUT IS CLEAN",
        recap:
          "You walked the Art Room: edge flood vs colour key and why a busy plate can't be keyed, reading the removal-% readout instead of guessing, the flat-plate contract, auto-building a sheet and overriding a wrong frame count, the animation names the engine actually looks up, and the big one — scale is authored in the scene, not baked into the image.",
      },
    },

    /* ── ENDING — walked out ─────────────────────────────────────────── */
    {
      id: "ar_leave",
      title: "Offcuts",
      background: A + "bad-plate.png",
      ambientAudio: "none",
      isEnding: true,
      cinematic: { mode: "static", dimAmount: 0.75 },
      prose:
        "You take the art away unedited.\n\nIt'll load — Studio accepts any image. It'll just arrive with its backdrop still attached, in a frame nobody sliced, at whatever size the default happens to be.\n\nThe bench is still here when you want it.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "BACKDROP INCLUDED",
        recap:
          "You skipped the art lesson. Replay and take the magenta swatch — the sheet builder is three clicks once the plate is flat.",
      },
    },
  ],
};
