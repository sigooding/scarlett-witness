# Black-Mass Bride

An illustrated, three-act adventure adapted from the **Mindret Lord story supplied by the user** (*Mystery Tales*, pp. 59–68). The crime has human explanations. The opening dream does not.

## Play

1. Start Scarlet Reel (`npm run dev -- --host 0.0.0.0`) and open the newsstand.
2. Select **Black-Mass Bride**. It is in the catalogue and the default featured strip.
3. Let the illustrated titles play, or choose **Skip title sequence**.

Allow roughly **25–40 minutes** for a first, unhurried investigation. There are no timed choices or required reflex challenges.

- Click a room object, then choose its verb. Double-click the floor to jog.
- **Jay's casebook** opens the inventory. Inspect evidence, or choose **Combine** and tap two items.
- **B** opens the corkboard. Select a clue and a person with clicks/taps or Tab and Enter; dragging from the red pins also works. Scroll to see additional cards.
- **H** reveals markers. **Backspace / Rewind** undoes a decision; **Back** steps through dialogue instead. Endings seal the rewind history.
- **M** toggles sound. Narration is optional; the shipped audio is an original synthetic underscore and three sound cues, not recorded character performances.
- Narrow screens preserve the whole room inside a fitted frame. On portrait phones, tap a numbered pin to see the object's full name and verbs; this avoids overlapping labels. A wider screen gives the illustrations more room.

**Content:** abduction, coercion, off-screen murder and non-graphic injury. All characters are adults. The adaptation omits the source's sexualized violence. Victoria and Pat participate in the investigation rather than being presented as spectacles.

## What is shipped

| Content | Count |
| --- | ---: |
| Acts | 3 |
| Scenes | 26 |
| Authored choices | 29 |
| Walkable investigation rooms | 5 |
| Characters | 8 |
| Inventory items | 13 |
| Corkboard deductions | 3 |
| Endings | 4 |
| Distinct referenced media files | 31 |

The rooms are the Starr library, concealed chamber, Jay's office, service courtyard and Pat's apartment. The other scenes use illustrated dialogue, act transitions and an epilogue.

`src/data/blackMassBride.ts` is the durable, editable story definition. `src/data/stories.ts` registers it; `src/App.tsx` features it by default. Its stable ID is `black-mass-bride`; scene/item/flag IDs start with `bmb_`. Do not rename those IDs casually: saves and published drafts use them.

Browser storage is only a workbench. The source file and shipped assets—not an injected save or an unpublished local draft—are the repository deliverable.

## Studio workflow used and kept reproducible

The illustrated story was prepared as a Studio-compatible definition, then taken through the actual authoring and publishing interface:

1. Open **Studio → Import** and import the draft.
2. Select **The Starr library → 🚶 Stage → Room plate & layout**. Set **Room aspect ratio** to the background width divided by height: `1345 / 742` (about `1.8126684636`). The new control fits art and interaction geometry together.
3. Select **The room I had never seen → Beats → Beat 1**. Edit the opening line. The final Studio-authored line is retained in the source definition.
4. **Check** reports a spotless reel: no validation errors or warnings. Check is a toggle; its expanded state is now accessible to assistive technology and tests.
5. **Export**, then re-import the exported `.reel.json`.
6. **Publish → Leave Studio**, then launch the published case from the **newsstand**, not the Studio scene-preview button or a branch URL.
7. Play the investigation to an ending. The automated browser regression repeats this full workflow, including an immediate export while the edited line still has focus.

Scenes carry author notes explaining their gates, optional evidence, state changes and recovery paths. The graph has authored act lanes. Characters, items, choices, puzzle rows, media, soundtrack and scene framing remain ordinary Studio fields; no custom adventure-only runtime is required.

### Portable copies

Studio's **Export** / browser **Save** and an individual newsstand card's **Export** now bundle referenced file media as well as uploaded library assets. The Black-Mass Bride export embeds all **31 files**, approximately **3.6 MiB** of JSON:

- 7 scene/cover plates;
- 8 portraits;
- 1 transparent four-frame walking sheet;
- 11 SVG inventory/verb icons;
- 4 WAV files (underscore, telephone, bell and knocking).

The exported envelope is `{ ...story, assets: MediaAsset[] }`. Media references become `asset:` IDs. Video and recorded-ambience prefixes survive, and machine-local `fileUrl` fields do not travel. Failed reads and missing library rows produce explicit warnings rather than a false promise of completeness.

The browser shipping test **blocks requests to the original Black-Mass Bride image/audio directories** after re-import, then plays the published copy to gold. This catches accidentally relying on source files or cached path references.

A reproducible repository-only export is also available:

```sh
node scripts/export-reel.mjs \
  src/data/blackMassBride.ts black-mass-bride \
  /path/to/black-mass-bride.reel.json
```

The CLI uses the same media schema walk and includes SVGs, nested media, sprite sheets and wrapper prefixes. It reads `public/`, not the browser's IndexedDB; use Studio for uploaded or remote assets. External/missing CLI references are retained with warnings.

**Bulk “Export all” remains a library backup:** it includes uploaded media but does not download every built-in file in the catalogue. Use per-case Export when handing someone a portable game.

## Art and sound provenance

The illustrations are original AI-assisted images made for this adaptation, not scans of the magazine. Portrait crops and the transparent walker were prepared from those images. SVG evidence icons and the restrained PCM sound design were authored procedurally.

- Shipped art: `public/img/black-mass-bride/`
- Shipped sound: `public/audio/black-mass-bride/`
- Preparation tool: `scripts/black-mass-bride/prepare-assets.py`
- Optional raw authoring plates: `public/img/black-mass-bride/src/` (ignored)

Pillow and the raw plates are needed only to repeat asset preparation. The game, Studio import, tests and exported case use the already-prepared files; no generation service, API key or external image host is needed to play. The preparation script also calls the existing Sprite Forge tool for the four-frame alpha sheet. Source-story authorship remains credited to Mindret Lord; no claim about the original publication's licensing is made here.

## Runtime and Studio fixes found while making the game

- **Room artwork:** the `dimAmount` type comment described brightness backwards. `0` means undimmed; `1` means fully black. Corrected the comment and the story, and added a Studio warning for wholly blacked-out image plates.
- **Aspect-locked stages:** optional `stage.plateAspectRatio`, editable and previewable in Studio, fits the plate, walker, markers and walk-behind layers together. Existing stories retain their legacy fill-screen layout unless they opt in. Invalid ratios are validation errors.
- **Discovery text:** pickup/flag/meter actions now display their authored discovery descriptions and play their authored clips instead of discarding them behind a generic reward toast.
- **Corkboard:** responsive columns, scrolling, accessible selected states and evidence artwork prevent crowded boards from clipping required clues or suspects off-screen. Coordinate conversion accounts for scrolling during dragging.
- **Overlays:** game dialogs fit the viewport; examination-result cards no longer cover the corkboard or another modal.
- **Archive puzzle:** records wrap instead of truncating the very names the player must compare. Selection states are accessible; wrong attempts remain retryable.
- **Casebook:** closing the inventory leaves tap-to-combine mode. Automatic recipe hints wait until a real pair is available, rather than announcing that unrelated evidence cannot combine.
- **Room controls:** compact numbered pins prevent overlapping portrait-phone labels; edge-object verb menus are clamped on-screen, without the old double horizontal translation. Enter opens an object-first menu just as a pointer press does.
- **Shortcuts:** H, M and Backspace work while walking without stealing movement keys.
- **Titles and epilogues:** a visible title skip respects authored holds/gates. Authored ending dialogue now plays before the ending summary, so the concluding conversation and recalled promise are not silently hidden.
- **Exports:** shared media traversal, bounded parallel reads, timeouts, deployment-base handling, format/wrapper support, nonmutating snapshots, deduplication and explicit failure reporting. Existing voice-only export APIs remain compatible.

## Tests

```sh
npm run check
npx tsc --noEmit
npm test
npm run build

# Focused deterministic story/media tests (also included in npm test)
npm run test:black-mass-bride

# Additional seeded exploration
npm run bot -- --story black-mass-bride --runs 300 \
  --seed black-mass-release --out test-results/black-mass-bot.json

# Real Studio and newsstand playthroughs; installs a browser if needed
npx playwright install chromium
npm run test:browser -- scripts/browser/black-mass-bride.spec.ts
```

For an existing Chromium installation, use `PLAYWRIGHT_CHROMIUM_PATH`. For an existing Vite server, use `PLAYWRIGHT_BASE_URL`; otherwise Playwright starts the test server on port 5174.

The focused Node suite covers **all 26 scenes and 29 choices deterministically**, all three alarm methods, recoverable mistakes, one-shot rewards, repeatable exits, all gold prerequisites, all four endings and the real files on disk. Its independent media manifest exercises nested topic/lie/interrogation media, sprites, state audio, deferred Quake prop setters, MP3/video prefixes, library compaction/resolution, HTTP/HTML/empty/timeout failures, missing library payloads, the scoped desktop read bridge, subpath deployments and the export CLI.

The browser suite starts every adventure run from the newsstand, with **no injected progress**. It covers built-in and Studio-published gold runs, all other endings, crafting, evidence presentation, wrong puzzle submissions, keyboard and pointer deductions, actual decision rewind, narrow-screen framing and the ending epilogue. Screenshots and the Studio-produced portable reel are written under Playwright's ignored `test-results/` output; failure traces are retained.

### Verified on 2026-09-06

- `npm run check`: passed; all 574 playable-catalogue asset references present.
- TypeScript, lint, `git diff --check`, and production build: passed.
- `npm test`: passed, including 24 Black-Mass Bride/media checks, 1,306 engine tests, 186 Studio shipping regressions and the existing media/DOM/stage/arcade suites.
- `npm run test:browser`: **22/22 passed**, including all six Black-Mass Bride workflows.
- Seed `black-mass-release`, 300 bot runs: **300/300 completed**, 26/26 scenes, 29/29 choices, 23/23 markers and 4/4 endings; no crashes or dead ends.
- The actual Studio export contains 31 embedded media assets and was re-imported, checked, published and played to gold with its original media directories blocked.

These are Chromium/browser and pure-engine tests. A native Windows/macOS packaged-Electron smoke test remains appropriate before distributing an installer.

---

## Spoilers: proof route and branch map

<details>
<summary>Gold walkthrough</summary>

1. Answer Victoria. Either response about the dream remains viable.
2. In the library, take the **house plan** and **loose bell wire**. Test the **service bell**. Talking to Arthur gives context.
3. Enter the chamber. Inspect the **garden-side drapes**, take the **work glove**, and combine wire + glove into the **padded hook**. Return to the library and leave for the office.
4. Preserve the **marked envelope**. Collect the paper and service roster if desired. Tell O'Leary the truth—or repair an earlier omission with the later backup call.
5. Search the courtyard. Take **Victoria's scarf** and the **spare-key ledger**. Question Peters. On his claim that the truck carried no passenger, **Press them on that** and present the scarf. This contradiction helps the investigation but is not a hidden gold gate.
6. Telephone the office. Play along with “Mr. Arbuthnot.” Blurting Jay's name is recoverable: take the long way to Pat's apartment. Resting there is recoverable too.
7. Record the **radio bulletin**, **secure Pat's door**, and **telephone O'Leary**. Do these before the fire escape.
8. In Pat's archive, select **Elias Peters's building register** and **Ruth Peters's inquest**. Reject the sermon, hotel register and unrelated marriage notice. Wrong submissions may be retried without penalty.
9. On the corkboard, connect **Pat's archive → Mr. Peters**. Scarf → Peters and, later, key ledger → Mrs. Peters are additional deductions.
10. Take the fire escape. Jay always receives a **shovel**. Use either mansion approach; the library ambush is survivable.
11. **State the case** at the confrontation. Then raise an alarm using the padded hook (requires the tested bell), the shovel, or the waiting patrol.
12. Choose **Put every name, every witness and every document into the record**. Read Victoria and Jay's epilogue, then the gold summary.

Gold requires `bmb_case_made + bmb_backup + bmb_pat_safe`. No unannounced luck roll or relationship threshold is involved.

</details>

<details>
<summary>Other endings and softlock safeguards</summary>

- **THE LIVING COME FIRST:** take any alarm route, then prioritize leaving. Available with incomplete preparation and even on a perfect run.
- **A CASE TOO NEAT:** voluntarily surrender during the monitored telephone sequence.
- **THE DOOR STAYS SHUT:** explicitly rush Peters instead of using an alarm.

The essential progression gates use persistent observations, not consumable crafting ingredients. The archive can be closed and retried. Questioning Peters can be repeated. Neither the wrong telephone answer nor exhaustion silently ends the best route. Every investigation that reaches the final room has the guaranteed shovel alarm; optional crafting is an advantage, not a mandatory obscure recipe.

</details>
