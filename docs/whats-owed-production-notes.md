# WHAT'S OWED — production notes

**Neo-noir graphic novel · Los Angeles, 1984 · narrated by Jack Morrow (unreliable).**

A straight, linear prestige read built natively for the Scarlet Reel Studio:
**3 acts · 6 production passes · 10 images per pass** (plus a Pass 0 of 9
character reference sheets, which double as the cast avatars). 70 images total.

- Story module: `src/data/whatsOwed.ts` (+ `whatsOwedAct1/2/3.ts`)
- Plates: `public/img/whats-owed/`
- Play: newsstand → **What's Owed**, or the dev server's story list

## Cast (locked via `ref-lineup.png`, referenced in every plate)

| id | name | file |
|----|------|------|
| jack | Jack Morrow, 40 — PI, ex-LAPD, the narrator | `ref-jack.png` |
| vera | Vera Voss, 34 — the client · dies end of Act One | `ref-vera.png` |
| jenny | Jenny Voss, 32 — stays soft on purpose | `ref-jenny.png` |
| solomon | Solomon Reyes, 48 — daylight, paperwork | `ref-solomon.png` |
| rosa | Det. Rosa Ibarra, 36 — she stayed, he didn't | `ref-rosa.png` |
| krantz | Adele Krantz — counsel, holds the file | `ref-krantz.png` |
| ferris | Ferris — enforcer, deliberately unremarkable | `ref-ferris.png` |
| tomas | Tomás, 22 — keeper, kind, immovable | `ref-tomas.png` |

## Pass manifest

| Pass | Covers | Plates | Status |
|------|--------|--------|--------|
| 0 | Reference sheets (cast + lineup) | 9 | ✅ done |
| 1 | Act 1, beats 1–6: city, office, Rosa, Vera, the debt, first contact | `p010–p100` | ✅ 10/10 |
| 2 | Act 1, beats 5b–9: off-the-case, forcing it, the last talk, **the accounting** | `p110–p200` | ✅ 10/10 |
| 3 | Act 2, beats 10–15: aftermath, Rosa closes the door, Jenny in absence, **proof of life**, **the twist** | `p210–p300` | ✅ 10/10 |
| 4 | Act 2, beats 16–19c: the leash, the clock, the visits, the afternoon, **the buyout**, what it cost Rosa | `p310–p400` | ✅ 10/10 |
| 5 | Act 3, beats 20–24: two exits, **Rosa's truth**, the choice, Ferris, **Solomon** | `p410–p500` | 8/10 — `p470`, `p500` blocked by moderation, reframed prompts queued first next turn |
| 6 | Act 3, beats 25–28 + cover: Tomás stands aside, she goes, **the notice**, last image | `p510–p590`, `cover` | ✅ 10/10 — **COMPLETE** |

Key art `cover.jpg` (Jack at the end of the boulevard, dusk) is registered
as the story's cover and title card.

---

**PRODUCTION COMPLETE — 70/70 images.** All six passes delivered: 9
reference sheets, 60 plates, key art. Verified end-to-end: every story
image reference backs to disk, TypeScript clean, playthrough bot walks
42/42 scenes and 44/44 choices with no dead ends. Final narration in the
data is the shortest in the film and explains nothing: *"Paid."*

## Pass 7 — coverage inserts (10) ✅

**Rule: no scene runs 4+ beats on a single plate.** Auditor (esbuild-bundles
the story, counts unique images per scene) drove the shot list:

| Insert | Scene | Cut |
|--------|-------|-----|
| `p051-badge` | 2b Parker Center | the badge on the chain, on her "favor with a badge" line |
| `p061-client-two` | 3 Vera walks in | reverse two-shot across the desk |
| `p070-paper` (reuse) | 3, the fee | the documents under the lamp |
| `p132-steps-wide` | 5b hot dogs | wide two-shot laughing, the happier film |
| `p112-the-drawer` | 7 the sedan | the records drawer, opened — the favor, spent |
| `p152-crossing` | 8 the last talk | Vera crossing under the streetlamp, not looking back |
| `p212-corkboard` | 11 the door | the case that cannot be built |
| `p281-jenny-laugh` | 14 the kitchen | mid-laugh, unguarded |
| `p282-tomas-sink` | 14, Tomás stops them | the mild attention of staff |
| `p331-the-date` | 16b the clock | the X on the calendar, dentist-appointment calm |
| `p342-regular` | 17 the visits | the terrible coffee, poured |
| `p030-desk` (reuse) | 1 the city | the man at his desk, under the grievance |

Audit result: 42 scenes · 69 unique images referenced · 0 gaps · every
referenced file on disk · avatars and cover backed.

## Pass 11 — atmosphere restoration (final) ✅

Pass 9's overlay strip was an overcorrection (the real "no images" bug was
the dead preview server). Restored, correctly wired this time:

- **Smoke** back on 7 scenes — city smog (beat 1), Jack's cigarette haze
  (the desk, the last talk, the two-exits wall), the alley, the curb, the
  rainy-week office. 16%-alpha wisps; never obscures a plate.
- **Rain, per the no-rain-indoors rule**: `ambientAudio: "rain"` on the
  beat-10 office and the stakeout night with `particles: "none"` — rain is
  SOUND outside glass, never visuals indoors. Zero indoor rain particles.
- **Narrator slate**: painted clapperboard emblem replaces the 🎬 emoji on
  the unvoiced-caption character.
- Final audit: 42 scenes · 97 image refs · **0 gaps** (bar: every scene
  2+ images, every 5+-beat scene 3+) · tsc clean · bot 42/42 & 44/44.

**101 images on disk. The picture is finished.**

Platform note: image generation is capped at **10 per turn**, so one pass
completes per turn. Everything else — the full screenplay, scene graph,
cinematics, registration — is already in and tested (42/42 scenes, 44/44
choices walk clean).

## Production grammar (how the plates are directed)

- Hand-painted chiaroscuro ink/gouache, grainy pulp print — **one style
  block on every prompt**, faces always generated against `ref-lineup.png`.
- 16:9 plates. Letterboxed scenes. Grades: `noir-1940s` (night/interiors),
  `tarantino-35mm` (day/blood), `spielberg-golden` (the only warm scenes —
  5b, the kitchen visits, the reservoir afternoon).
- **NO RAIN INDOORS.** Rain is weather: it lives outside glass (streaks in
  the plate) and as sound. The engine's `particles: "rain"` overlay is
  exterior shots only — beat 10 and 12c overlays were removed in Pass 2
  for exactly this.
- Dominik blocking: long static holds and dolly pans; dolly-zoom reserved for
  the accounting (beat 9) and Solomon's last scene (beat 24); shake only for
  Jack pushing Rosa (7) and the Ferris fight (23).
- The three-sales rhyme — Vera sells Jenny, Jack sells himself, Tomás sells
  his affection — lands in beats 8/21/25 respectively. Only Jenny never sells.

## Narration rules baked into the data

- Act One: Jack explains everything, confidently, wrongly. Unprompted
  grievance every scene.
- Beat 9 (`wo_s130`) and its coda (`wo_s140`): **no Jack V.O. at all** —
  silent captions only. Silence where the audience expects him.
- Act Two: returns with the first outright lie (`wo_s200`), turns on itself
  at the leash (`wo_s280`, unfinished thought), can't finish a paragraph by
  the gun (`wo_s530`).
- Final narration is the shortest in the film and explains nothing:
  *"Paid."*
