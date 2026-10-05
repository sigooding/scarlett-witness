# Studio hardening and next-room preload

Updated: 6 September 2026.

This pass covers the editor, its authoring-to-playback handoff, and the next-room loading path. Existing game/newsreel content remains test data. `Family Guy: Remote Control` is a new, small, annotated fan-test reel, not a replacement flagship.

## What changed

### Next-room media, before the cut

`src/game/scenePreload.ts` builds a **one-hop** plan while the current prose or dialogue is still playing. It covers both rail and walking-adventure scenes, including choice gates, note bypasses, after-beat cuts, effective hotspot states, scripts, puzzle outcomes, walk-off exits and map destinations. It predicts entry/choice effects only to select the appropriate opening line; it never changes the player's state.

`src/mediaPreload.ts` owns a disposable LRU: **8 images, 6 audio elements, at most 4 destination rooms per plan**. Images get low fetch priority and asynchronous decoding. Recorded audio is loaded but never played, unlocked, ducked, generated or sent to a speech provider. The current audio engine takes ownership of a warmed element, even before its load completes; later cache eviction cannot stop it. Failed speculation remains retryable. Video/gradient/emoji pseudo-images are skipped; Save-Data and 2G connections opt out.

This is best-effort lookahead, not a navigation dependency. Missing assets, browser preload policy, eviction or an unexpected branch still use the normal playback loader. Browser autoplay restrictions still apply to actual playback. No blanket story download or voice-generation bill is introduced.

### Authoring safety

- Focused dialogue commits on idle, blur, unmount and save shortcuts, with latest-story guards. Immediate export, changing stories, deletion/undo and leaving Studio no longer lose the last line.
- Draft saves are keyed by **story and revision**, with a synchronous recovery snapshot on navigation/unload. A slow older media compaction cannot overwrite a newer edit. Quota/storage failures are surfaced with retry/export recovery.
- Structural edits break typing coalescing, so deleting a just-edited beat is its own reversible undo step.
- Shared route metadata drives graph handles, mutation, validation and deletion. Success and timeout wires, after-beat routes, state puzzle outcomes, scripts and walk-off exits are distinct. State routes use stable state IDs.
- Scene/story copies remap local scene, hotspot, beat, NPC, map, layout, act and episode references. Scene deletion cleans incoming and auxiliary references rather than leaving ghost routes.
- Imports, asynchronous exports and generated voices use guarded snapshots. Native Save captures its original file path **before** bundling, so switching cases cannot redirect the write into the newly opened case. Stale voice results cannot attach to or audition an edited/deleted line.
- Build/content updates preserve authored drafts, publications and backups. Custom-story branch links resolve custom stories, not an unrelated built-in.

### Studio organization and accessibility

- Search scenes by title, ID, type or note; jump with the native selector or Enter. Clear search with Escape.
- Compact, horizontally scrollable tool rows distinguish **This room**, **Your game** and **More tools**. Arrow keys/Home/End use a roving tab stop and labelled editor panel.
- Project-wide workflow, readiness and reference panels live in **Game Objective** and **Test**, not above every editing form. Completed coaching minimizes to a small, expandable strip.
- On narrow screens, the primary toolbar stays compact; **More** reveals the other commands. **Scene editor / Scene map** switches the available workspace instead of squeezing both into unusable slices.
- Shared `DialogFrame` manages focus containment, Escape and focus restoration in Help, Export and player modals. Interactive NPCs and item tiles have meaningful accessible names and keyboard controls.
- Fonts, including the emoji fallback, are local WOFF2 files with their OFL licenses. There is no Google Fonts dependency. Built font/media paths work under a project-site subdirectory.

### Problems exposed by the new game

- QTE expiry was collected inside a React state updater and could be observed too early: the timer reached zero but never took its failure branch. Expiry is now computed once from live clocks; simultaneous QTE expiries choose one route. Menus/modals pause the clock.
- Repeated input during a scene fade could queue multiple entries into the destination. Transitions are guarded and cleaned up on unmount.
- A multi-state machine still asked for its already-consumed key. States can now override **accepted items**: omitted means inherit; `null`/`[]` means act directly without an item picker. Studio exposes the override and the validator checks its IDs.
- Closing a solved/failed puzzle could leave a delayed callback that navigated later. Result/retry timers are cancelled on close/unmount; retry feedback locks input without revealing all answers.
- Modal inventory hid its crafting controls and could cover the inspect panel. Crafting is available inside the modal, inspect closes it first, real drags release the backdrop, and modal focus/keyboard behavior is contained. Bottom-right inventory now reserves space for Sound/Help instead of covering those controls.
- Family Guy art had an incorrect equal-quarter cast crop. Asset preparation now detects transparent gutters, so Peter is not clipped and his arm is not included in Lois's sprite. Pickup bounds and NPC placement were checked in the actual walking scene.

## Automated checks

### Verified in this pass (6 September 2026)

| Check | Result |
|---|---|
| TypeScript | Clean (`tsc --noEmit`) |
| Strict lint | 0 errors, 0 warnings |
| Full `npm test` chain | Passed, including the final Sledge/arcade suites |
| Focused Studio/preload | 186 passed |
| Engine | 1,306 passed |
| Sprite / `.screel` | 12 / 23 passed |
| Stage / Studio beta | 154 / 76 passed |
| Sledge / arcade | 131 / 262 passed; Sledge DOM passed |
| Production browser suite | 16 passed under `/Scarlet-reel/` |
| Production build | 306 modules; approximately 3.89 MB inline HTML, 1.06 MB gzip |
| Deployed-base visual/asset check | No page errors, failed requests or broken images; font requests stayed under the deployed base; no Google Fonts requests |

Legacy probes were updated to use semantic tab roles rather than a four-column
layout class, to recognize the shared dialog component, and to test walk-off
arrival independently of post-prose hotspot visibility. These preserve the
behavioral assertions without relying on a transient render or CSS layout.

Run from the repository root:

```sh
npm ci
npx tsc --noEmit
npm run lint:strict
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

`npm test` includes the **186 focused Studio/preload assertions**, engine tests, sprite keying, `.screel` archives, independent-process import/export, App DOM smoke tests, walking-stage and Studio beta probes, Sledge and arcade regressions. The focused suite also reaches all Family Guy endings and the retryable puzzle through the pure decision model.

The **16 real-browser tests** in `scripts/browser/studio.spec.ts` cover:

| Area | Browser check |
|---|---|
| Last focused text | Immediate export, switch away/back, exit and reload |
| History | Edit → delete → undo → redo |
| Graph | Delete/undo timeout without touching success |
| Navigation | Search, every tool tab, keyboard tabs, modal focus |
| Layout | 1280, 768 and 390 px; at least 200 px of actual editing area; phone map/editor switch |
| Updates | Old build metadata does not erase draft, publication or backup |
| Custom cases | Authored custom-story branch link reaches its own ending |
| Adventure | Collect, combine, warm the next room/cue, install the crafted item |
| Puzzle / ending | Wrong answer, retry, blue choice, after-beat cut, silver ending |
| QTE | Real-time timeout takes its failure route |
| Rail preload | Distinct current/next media requested while the current line remains visible; no speculative `play()` |
| Puzzle lifecycle | Close during result delay, no late navigation, clean reopen |
| Inventory | Tab containment, paused clock, inspect not hidden behind the modal |
| Optional route | Receipt, encountered suspect, keyboard deduction, lie, reply, gold ending |

The rail network test deliberately gives the cold-open fixture different media: the authored cold open and living room share a plate/cue, which otherwise makes a network assertion meaningless. Tests observe `HTMLMediaElement.play()` without replacing playback behavior.

By default Playwright starts its own Vite server on **5174**, with HMR disabled for deterministic runs. It does not restart the author's live preview on 5173. Failures retain a screenshot, DOM context and trace under ignored `test-results/`.

Optional environment variables:

```sh
# An existing server; relative test URLs also support a deployed subdirectory.
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173/Scarlet-reel/ npm run test:browser

# An already-installed compatible Chromium binary (restricted CI environments).
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

## Family Guy test route

Open **Studio → Choose story to edit → Family Guy: Remote Control**. Every scene has an author note describing what it exercises. There are 13 nodes, including one non-playable bypass note.

1. Start the remote incident; choose either opening response.
2. Pick up the remote and batteries. Open Peter's pockets with **Combine**, then select both ingredients.
3. Optional gold route: leave through the right edge, pick up the receipt, enter the Clam, and challenge Brian's claim with it. Once Brian has been encountered, the receipt and Brian can also be connected on the corkboard. Ask about the colour code.
4. Enter Stewie's basement; use the powered remote on the machine. It is consumed and the same object becomes **Tune the signal**.
5. Select **GREEN + BLUE**. A wrong combination can be retried. Choose the blue button before eight seconds expire; red or timeout loses.
6. The final insert cuts to the verdict. Evidence produces gold; otherwise the game has a complete silver path.

Useful branch links, relative to the app's deployed directory:

```text
?story=family-guy-remote-control&scene=fg_living&flags=fg_mission&seed=qa
?story=family-guy-remote-control&scene=fg_basement&flags=fg_installed,fg_mission&seed=qa
?story=family-guy-remote-control&scene=fg_countdown&seed=qa
?story=family-guy-remote-control&scene=fg_verdict&flags=fg_caught&seed=qa
```

The four rooms, cast, simple Peter sheet, SVG items and synthetic WAV cues are local. Dialogue is original fan-test writing and uses browser speech synthesis where enabled; there are **no cloned actor recordings** and no paid provider calls. Raw generated art is not committed. See `scripts/family-guy/README.md` for the optional asset-preparation step.

## Release boundaries

Green automation is a regression baseline, not a claim that every hardware/provider combination is certified. Before distributing an installer, smoke-test the packaged app on each supported OS: native Open/Save/Save As, permissions and generated-voice folder selection. Live external voice/image-provider credentials, billing, microphone hardware and every platform's installed TTS voices were not exercised by this offline/local test run. The archive/bridge logic has automated coverage; a packaged native dialog is still a platform-specific check.

The fan-test reel is unofficial test content. It should not be presented as an official or licensed Family Guy release. Keep raw artwork, browser traces, generated builds and large test datasets out of Git.
