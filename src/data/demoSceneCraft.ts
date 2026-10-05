import type { Story } from "../types";

/**
 * DEMO 2 — "THE SCENE-CRAFT LAB"
 * ──────────────────────────────
 * A six-scene teaching case for LOOK & FEEL. Walk from a flat establishing
 * shot through every cinematic and pacing tool, with a 📝 step-by-step note on
 * each scene node explaining how it was authored in Studio.
 *
 * Teaches:
 *   · Backgrounds — built-in art vs gradient: presets (Image picker)
 *   · Cinematic camera modes — pan / zoom-hold / shake / dolly / dolly-zoom,
 *     focal point, dim, animated light glows
 *   · Foreground overlays — a fixed subject layer while the world moves
 *   · Color grade presets (Nolan IMAX cool / Tarantino warm 35mm /
 *     Spielberg golden hour / 1940s noir B&W) + film-stock emulation
 *   · Parallax depth — cursor-follow camera + mid-ground depth planes
 *   · Particles (rain/smoke) & letterbox bars
 *   · Scene transitions & music behaviour (inherit / track / none, crossfade)
 *   · EXAMINE hold-to-inspect hotspots (camera zoom + hold meter)
 *   · Auto-advance timers (no-choice cinematic routing)
 *   · Credits nodes — the film-title sequence (montage, typeface, motion)
 */
export const DEMO_SCENE_CRAFT: Story = {
  id: "demo-scene-craft-lab",
  title: "Demo Lab: Scene Craft",
  tagline: "A teaching reel on cameras, light, sound and pacing — one tool per scene.",
  coverImage: "gradient:linear-gradient(160deg,#0b1a24 0%,#0d2430 55%,#07070c 100%)",
  startSceneId: "ds_title",
  layout: {
    ds_title: { x: 0, y: 200 },
    ds_flat: { x: 360, y: 80 },
    ds_camera: { x: 360, y: 300 },
    ds_grade: { x: 720, y: 60 },
    ds_parallax: { x: 720, y: 300 },
    ds_light: { x: 1080, y: 80 },
    ds_examine: { x: 1080, y: 320 },
    ds_cutscene: { x: 1440, y: 140 },
    ds_leave: { x: 360, y: 500 },
  },
  briefing: {
    objective: "Walk the reel: title card, camera moves, lighting, hold-to-examine, and an auto-advancing cut.",
    winConditions: [
      "Reach the final 'Directed by you' card.",
      "Try the hold-to-EXAMINE hotspot in the lighting scene.",
    ],
    loseConditions: [
      "Nothing — this is a teaching reel; every path ends.",
    ],
  },
  characters: [
    {
      id: "ds_instructor",
      name: "The Projectionist",
      role: "Your cinematography instructor",
      avatarUrl: "emoji:📽️",
      trustMeter: 0,
      voice: { pitch: 0.85, rate: 0.95 },
    },
  ],
  items: [
    {
      id: "ds_film_reel",
      name: "Lost Film Reel",
      icon: "🎞️",
      description: "A rusty 35mm reel found hidden behind the brick — the missing picture.",
      flavorText: "The label reads 'REEL 7 — DO NOT PROJECT'.",
      isClue: true,
    },
  ],
  flagNotes: {
    ds_examined_wall: "You held-to-EXAMINE the loose brick and found the reel.",
  },
  scenes: [
    /* ── SCENE 1 — CREDITS / TITLE SEQUENCE ────────────────────────── */
    {
      id: "ds_title",
      title: "Title Card",
      nodeType: "credits",
      note:
        "STEP 1 — THE TITLE SEQUENCE. ① Right-click the canvas → 'Add credits scene' (or toggle Node type: credits in the Scene tab). Credits nodes hide the HUD and play full-screen typography. " +
        "② Open the 🎬 Credits intro section: pick a TYPEFACE (here: poster — tall film-poster caps), a card MOTION, and a MONTAGE list of stills that cross-dissolve behind the type. " +
        "③ The prose fills title/subtitle/lines automatically (line 1 = big title). ④ choiceDelaySeconds holds the card before Continue appears. Press ▶ Play to watch it.",
      background: "/img/bg-corridor.jpg",
      ambientAudio: "none",
      musicUrl: "/Soundtrack.mp3",
      musicMode: "track",
      musicFadeSeconds: 2,
      transition: "fade-black",
      transitionSpeed: 1.2,
      choiceDelaySeconds: 3,
      prose:
        "SCENE CRAFT\nA Studio Lighting Reel\nDirected by You",
      credits: {
        font: "poster",
        style: "cards",
        cardMotion: "slam",
        titleEntrance: "slam",
        cardSeconds: 3,
        montage: ["/img/bg-corridor.jpg", "/img/bg-diner-booth.jpg", "/img/bg-vault.jpg"],
        montageSeconds: 3,
        montageTransition: "cut",
        titleColor: "#f5c542",
        accentColor: "#4dd8e6",
      },
      dialogueBeats: [],
      hotspots: [],
      choices: [
        { id: "ds_title_go", text: "Take your seat in the projection booth.", targetSceneId: "ds_flat", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 2 — FLAT ESTABLISHING SHOT ──────────────────────────── */
    {
      id: "ds_flat",
      title: "Take One — The Static Plate",
      note:
        "STEP 2 — A FLAT ESTABLISHING SHOT. ① Scene tab → Background → pick bg-diner-booth.jpg. ② Cinematic: leave mode on STATIC (or off) — this is your control shot, no camera move. " +
        "③ Transition into the scene: 'fade', 0.6s. ④ Ambient audio: 'jazz' synth preset. " +
        "⑤ Prose + one narrator beat set the scene. Then choose the next take to add a camera move — everything afterwards is a variation you can compare against this flat frame.",
      background: "/img/bg-diner-booth.jpg",
      ambientAudio: "jazz",
      transition: "fade",
      transitionSpeed: 0.6,
      prose:
        "The Projectionist threads the first take. A diner booth, coffee going cold, nobody home. The frame is locked off — no motion, no grade. 'Every shot STARTS here,' she says. 'Now watch what the camera does to the same room.'",
      dialogueBeats: [
        {
          id: "ds_flat_1",
          characterId: "ds_instructor",
          expression: "lecture",
          text: "Static is your baseline. In the Cinematic panel, mode static means the plate just sits there — perfect for a held beat where the dialogue does the work. Every other mode is a decision you make on top of this.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "ds_flat_cam", text: "Next take — move the camera.", targetSceneId: "ds_camera", attitudeTag: "Neutral" },
        { id: "ds_flat_leave", text: "Walk out of the booth before the lesson starts.", targetSceneId: "ds_leave", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 3 — CAMERA MODES ────────────────────────────────────── */
    {
      id: "ds_camera",
      title: "Take Two — The Camera Moves",
      note:
        "STEP 3 — CAMERA MODES. Open Cinematic Image Controls. Mode = DOLLY here: the plate slides on a rail across a wide image; set dollyDirection, dollyDistance (%) and dollyDuration. " +
        "Try the others from the dropdown: pan (slow drift), zoom-hold (pushes to focalPoint over zoomDuration — set the focal point like '70% 30%'), shake (handheld; shakeAmount/shakeDuration), dolly-zoom (the vertigo move, with optional blur). " +
        "The FOREGROUND image layer pins a subject (a transparent PNG, or a gradient stand-in) that stays sharp while the world slides behind it — the anchor of every dolly move. Particles: rain; Letterbox: on for the film frame.",
      background: "/img/bg-alley.jpg",
      ambientAudio: "rain",
      particles: "rain",
      letterbox: true,
      transition: "fade",
      transitionSpeed: 0.8,
      cinematic: {
        mode: "dolly",
        dollyDirection: "left",
        dollyDistance: 12,
        dollyDuration: 12,
        dollyVertical: 2,
        dimAmount: 0.9,
        foregroundImage: "gradient:radial-gradient(circle at 50% 35%, rgba(40,40,60,0.9) 0%, rgba(10,10,18,0.65) 45%, rgba(0,0,0,0) 70%)",
        foregroundFit: "cover",
        foregroundY: 10,
        foregroundScale: 1,
        foregroundZoom: 1.06,
        foregroundZoomDuration: 10,
      },
      prose:
        "Same city, different grammar. The alley slides past on a slow dolly track while rain streaks the lens and black letterbox bars frame the shot. A figure in the foreground stays pin-sharp as the world moves behind it.",
      dialogueBeats: [
        {
          id: "ds_cam_1",
          characterId: "ds_instructor",
          expression: "sweeping hand",
          text: "Dolly! The background rails past and the foreground holds — that fixed layer is the Foreground image, a transparent PNG of your subject. Swap mode to zoom-hold and set a focal point, or shake for handheld. Each mode is just numbers: distance, duration, amount.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "ds_cam_grade", text: "Next take — grade the picture.", targetSceneId: "ds_grade", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 4 — COLOR GRADES & FILM STOCK ───────────────────────── */
    {
      id: "ds_grade",
      title: "Take Three — The Grade",
      note:
        "STEP 4 — COLOR GRADE & FILM STOCK. Cinematic panel → '🎨 Color grade & film stock'. " +
        "① The GRADE dropdown is a one-click director look: Nolan = cold desaturated teal/steel IMAX; Tarantino = hot warm 35mm with punchy contrast; Spielberg = amber golden-hour glow; 1940s Noir = high-contrast black & white. Each is a CSS filter chain + a split-tone wash, so it works on EVERY camera mode and on insert-shot beats. " +
        "② Tick '🎞 Film grade' for a 35mm PRINT: animated grain (heavier than the ambient grain), gate weave (the frame wobbles like a projected print), highlight halation bloom, light flicker and occasional scratches — with a strength slider. The film layer sits ON TOP of the grade, like the physical print of the graded image. " +
        "▶ Play this scene, then switch the grade in Studio and watch the same plate become four different films.",
      background: "/img/bg-vault.jpg",
      ambientAudio: "tension",
      letterbox: true,
      transition: "fade",
      transitionSpeed: 0.8,
      cinematic: {
        mode: "static",
        colorGrade: "noir-1940s",
        filmGrade: true,
        filmGradeStrength: 0.8,
      },
      prose:
        "The Projectionist threads four different prints of the same vault. On screen it's black and white, silver grain swirling in the projector beam, shadows crushed to velvet. 'Same photograph,' she says. 'Four cinematographers. Pick the one that tells your lie — and whether it runs through celluloid.'",
      dialogueBeats: [
        {
          id: "ds_grade_1",
          characterId: "ds_instructor",
          expression: "holding film strips",
          text: "The grade is the cheapest magic in the booth. Nolan cools everything to steel and teal, Tarantino pushes the reds and bleach-bypass contrast, Spielberg pours golden hour over the whole frame, and classic noir drains every colour for stark monochrome. Film grade adds the physical print: grain that moves, weave, flicker, scratches.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "ds_grade_par", text: "Next take — depth you can move in.", targetSceneId: "ds_parallax", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 5 — PARALLAX DEPTH ──────────────────────────────────── */
    {
      id: "ds_parallax",
      title: "Take Four — Parallax Depth",
      note:
        "STEP 5 — PARALLAX DEPTH. Cinematic panel → '🌆 Parallax depth'. " +
        "① The DEPTH slider (0 = off) turns on cursor-follow parallax: move your mouse and the plate drifts a little, while the foreground subject drifts MORE — a diorama. A gentle idle sway plays when the mouse is still (and it stands down under reduced-motion). " +
        "② Add MID-GROUND DEPTH PLANES: transparent PNG cutouts (a window frame, a crowd, a fog bank) between the plate and the subject. Each plane's own DEPTH % sets how fast it shifts — far planes barely move, near planes move almost like the foreground. Upload a cutout, or drop in the gradient 'fog plane' as a cheap depth layer. " +
        "③ STACK MULTIPLE FOREGROUND IMAGES: the '🧍 Foreground overlay' section is the single MAIN subject (also the talking-sprite/vertigo anchor); '👥 Additional foreground images' adds any number of EXTRA characters/props/frames — each with its own X/Y position, scale, fit, flip and parallax depth. Here two cutouts stand on opposite sides of the room and drift at different speeds.",
      background: "/img/bg-club.jpg",
      ambientAudio: "jazz",
      particles: "smoke",
      transition: "fade",
      transitionSpeed: 0.8,
      cinematic: {
        mode: "pan",
        parallaxDepth: 0.6,
        // Primary subject: a dark vignette stand-in at the front (the "booth"
        // silhouette) — this is the single main foreground anchor.
        foregroundImage: "gradient:radial-gradient(circle at 50% 70%, rgba(20,12,24,0.85) 0%, rgba(0,0,0,0) 55%)",
        foregroundFit: "cover",
        foregroundY: 20,
        // EXTRA foreground subjects stacked behind it: two cutouts on opposite
        // sides of the frame, each with its own position, scale, mirror and
        // parallax depth — the "multiple characters in one shot" look.
        foregroundExtras: [
          {
            image: "/img/ch-marlene.png",
            x: 26, y: 78, scale: 0.62, fit: "contain", anchor: "50% 100%", flip: false, depth: 0.75,
          },
          {
            image: "/img/ch-rocco.png",
            x: 74, y: 80, scale: 0.7, fit: "contain", anchor: "50% 100%", flip: true, depth: 0.9,
          },
        ],
        parallaxLayers: [
          { image: "gradient:linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(8,10,18,0.5) 100%)", depth: 0.3 },
        ],
      },
      prose:
        "The club goes deep — a haze of smoke at the back, a dark silhouette of a booth at the front. Move your cursor across the frame: the room leans with you, the smoke slides slow, the booth slides fast, and suddenly a flat painting has air between its layers.",
      dialogueBeats: [
        {
          id: "ds_par_1",
          characterId: "ds_instructor",
          expression: "lens to eye",
          text: "Parallax is depth from motion. The plate shifts a few pixels, the mid-planes more, the foreground most — your eye reads the difference as distance. Transparent cutouts make the best planes; a gradient fog makes the cheapest one. Move your mouse over the preview in Studio, it's live there too.",
        },
      ],
      hotspots: [],
      choices: [
        { id: "ds_par_light", text: "Next take — paint with light.", targetSceneId: "ds_light", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 4 — LIGHTING + EXAMINE HOTSPOT ──────────────────────── */
    {
      id: "ds_light",
      title: "Take Three — Light & The Hold",
      note:
        "STEP 4 — LIGHT + EXAMINE. ① Cinematic → LIGHTS: add glow points (x/y %, colour, size, intensity) — they breathe on a sine curve so light feels alive. A LENS FLARE can hang off each one. " +
        "② dimAmount darkens the plate so the glows read. ③ The hotspot: Hotspots tab → add a zone over the loose brick, action giveItem (the reel), then tick EXAMINE and set examineSeconds. In play the player HOLDS the pointer: the camera pushes in, an EXAMINING meter fills, and on completion the pickup fires and the zone vanishes. Pair it with the gated narrator beat (condition rule: flag ds_examined_wall) to narrate the discovery.",
      background: "/img/bg-safehouse.jpg",
      ambientAudio: "drone",
      transition: "fade-black",
      transitionSpeed: 1,
      cinematic: {
        mode: "zoom-hold",
        focalPoint: "28% 45%",
        zoomDuration: 10,
        dimAmount: 0.72,
        lights: [
          { x: 24, y: 30, color: "#ffb347", intensity: 0.85, size: 46, pulseSeconds: 3.2, pulseAmount: 1, flare: { preset: "warm-amber", intensity: 0.6 } },
          { x: 78, y: 18, color: "#4dd8e6", intensity: 0.5, size: 34, pulseSeconds: 4.1, pulseAmount: 0.8 },
        ],
      },
      prose:
        "The safehouse is dead dark except for two living lights — a swinging amber bulb and cold cyan bleed under the door. The wall ahead has one loose brick. The Projectionist nods at it: 'Don't click. HOLD. The camera does the rest.'\n\n(Hold the pointer on the glowing zone until the EXAMINING meter fills.)",
      dialogueBeats: [
        {
          id: "ds_light_1",
          characterId: "ds_instructor",
          expression: "stage whisper",
          text: "Lights are points you place — position, colour, size, breath speed. They glow on top of the dimmed plate. And the brick? That's an EXAMINE hotspot: hold to inspect. Zoom, meter, payoff.",
        },
        {
          id: "ds_light_2",
          characterId: "narrator",
          conditionRule: { requiresFlags: ["ds_examined_wall"] },
          text: "The brick swings aside and there it is — a rusty 35mm reel, label reading REEL 7. The zoom holds on your find for one extra beat before the zone disappears for good.",
        },
      ],
      hotspots: [
        {
          id: "ds_hs_brick",
          label: "Loose brick in the wall",
          bounds: { x: 20, y: 38, w: 16, h: 22 },
          cursor: "look",
          isRepeatable: false,
          examine: true,
          examineSeconds: 2.2,
          showItemImage: true,
          action: {
            type: "giveItem",
            itemGranted: "ds_film_reel",
            flagSet: "ds_examined_wall",
          },
        },
      ],
      choices: [
        { id: "ds_light_go", text: "Thread the found reel into the projector.", targetSceneId: "ds_examine", attitudeTag: "Neutral" },
      ],
    },

    /* ── SCENE 5 — MUSIC + TWO WAYS TO CUT (auto-advance vs after-beat) ─ */
    {
      id: "ds_examine",
      title: "Take Four — Sound & The Cut",
      note:
        "STEP 5 — SOUND, PACING & THE TWO WAYS TO CUT. ① Audio tab: Music mode = TRACK with musicUrl /Soundtrack.mp3 and musicFadeSeconds 2.4 — a true crossfade; INHERIT keeps the old track, NONE goes silent. " +
        "② SCENE AUTO-ADVANCE (Scene tab): set an auto-advance target + delay and the scene routes itself after prose+beats when there are NO choices — the hands-off cut, used here on the TIMED line. " +
        "③ AFTER-BEAT ROUTING (Dialogue tab, on a beat): 'After this beat — cut to scene' fires when the LAST beat is dismissed — the insert background fades STRAIGHT into the next scene with no flash back to the scene plate. Pick ⏱ Auto (a timer guarantees the line is read) or ▸ Continue (Space/button cuts). The ▸-button line below uses it, so the beat's picture holds until YOU cut. The beat route always wins while a beat is live, so the two timers never conflict.",
      background: "/img/bg-dressing.jpg",
      musicUrl: "/Soundtrack.mp3",
      musicMode: "track",
      musicFadeSeconds: 2.4,
      transition: "fade",
      transitionSpeed: 1.2,
      prose:
        "The projector wakes with a mechanical clatter. The drone of the safehouse crossfades into the score — two seconds of overlap, the old track sinking under the new. The Projectionist lets the first line breathe, then points at the screen: this one cuts itself, and the next one waits for you.",
      dialogueBeats: [
        {
          id: "ds_ex_1",
          characterId: "ds_instructor",
          expression: "in the light",
          text: "Three music modes: inherit keeps the previous track, track crossfades to a new MP3, none kills the sound. Fade seconds is your dissolve. A scene with no choices can auto-advance on a timer — the director saying 'we move on now.'",
        },
        {
          id: "ds_ex_2",
          characterId: "ds_instructor",
          expression: "hand on the reel",
          text: "But say a beat has its OWN insert shot and you want to cut from THAT picture, straight to the next scene — no cut back to this room. That's an after-beat route. This line holds on my insert background until you press Continue, and then the cut is clean.",
          afterBeatTargetSceneId: "ds_cutscene",
          afterBeatMode: "continue",
          background: "/img/bg-folder-closeup.jpg",
          backgroundTransition: "crossfade",
          backgroundTransitionSpeed: 1,
          cinematic: { mode: "zoom-hold", focalPoint: "50% 40%", zoomDuration: 7 },
        },
      ],
      hotspots: [],
      choices: [],
    },

    /* ── SCENE 6 — END CARD ────────────────────────────────────────── */
    {
      id: "ds_cutscene",
      title: "End of the Reel",
      isEnding: true,
      note:
        "STEP 6 — WRAP. Ending nodes (🏁) show the route chart automatically. This one is gold tier with a recap that lists what the player just learned. " +
        "Back in the Studio, press ⚠ Check: it verifies every scene is reachable, every choice target exists, and every ending is wired. Then 💾 Save and ▶ Play the whole reel start to finish.",
      background: "/img/bg-end-gold.jpg",
      ambientAudio: "jazz",
      musicMode: "inherit",
      letterbox: true,
      transition: "fade-black",
      transitionSpeed: 1.4,
      prose:
        "The reel runs out and the house lights come up gold. Static plate, dolly move, breathing light, a held examination, a crossfaded score, a cut that made itself. That's the grammar.",
      dialogueBeats: [
        {
          id: "ds_end_1",
          characterId: "ds_instructor",
          expression: "bow",
          text: "You just watched six tools in six scenes. Now open your own case and use them — one at a time, the way you learned them here.",
        },
      ],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "victory-gold",
        headline: "THAT'S A WRAP",
        recap:
          "You walked the Scene-Craft reel: credits title sequence, static plate, dolly camera with a pinned foreground, a Nolan/Tarantino/Spielberg/noir color grade plus 35mm film-stock emulation, cursor parallax with depth planes, animated lights with lens flare, a hold-to-examine discovery, crossfaded music, and auto-advance pacing.",
      },
    },

    /* ── WALK-OUT ENDING (game-over tier, keeps the validator honest) ── */
    {
      id: "ds_leave",
      title: "The Reel Unwatched",
      isEnding: true,
      note:
        "Why a second ending? Studio Check wants a case to have real stakes: a victory AND a game-over tier. This walk-out branch is the lose state — wired to the 'leave' choice on the first take. Ending tiers feed the newsstand stars and the ending gallery.",
      background: "/img/bg-end-refusal.jpg",
      ambientAudio: "none",
      transition: "fade-black",
      prose:
        "You push out of the booth into the rain and never look back. The Projectionist watches the door swing shut, then runs the reel to an empty house. Every tool on it stays unlearned.",
      dialogueBeats: [],
      hotspots: [],
      choices: [],
      endingData: {
        tier: "gameover",
        headline: "MISSING PICTURE",
        recap:
          "You walked out of the lesson. Replay and stay in the booth — the camera move is on the next take.",
      },
    },
  ],
};
