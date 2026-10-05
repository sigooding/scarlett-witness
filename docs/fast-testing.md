# Developer note: speedy testing

**Use focused checks while editing; run the full release checks once the pass is stable.**
Do not spend another 10–15 minutes on the entire suite for every line, CSS tweak or documentation edit. Keep the final shipping checks; shorten the feedback loop, not the coverage.

Commands below run from the repository root in a POSIX shell. No new test dependencies or runners are needed.

## 1. Pick the smallest useful check

| What changed? | First check |
| --- | --- |
| First-person physics, combat, maps or saves | `npm run test:fps` (includes a physical Hollywood tour) |
| Blade Runner act-one content, return routes, HD assets or portable masks | `npm run test:blade-runner` |
| Black-Mass Bride story, gates, items, endings or portable export | `npm run test:black-mass-bride` |
| Shared decision/validation logic | `npm run test:engine` plus the affected story's focused tests |
| Studio autosave, graph routes or media preloading | `npm run test:studio-ship` |
| Media traversal, compaction or import/export | `npm run test:black-mass-bride` then `npm run test:media` |
| Stage geometry/movement | `npm run test:stage`; add the relevant browser case for visible behavior |
| Layout, focus, menus, captions, pointer/keyboard input | One matching browser test (below), then inspect its screenshot |
| Documentation only | Check links, command names and `git diff --check`; no rebuild or full gameplay run |

For TypeScript/interface changes, also run `npx tsc --noEmit`. Vite and the esbuild-based test runners **do not type-check**.

Start the adventure work with:

```sh
npm run test:black-mass-bride
npm run bot -- --story black-mass-bride --runs 100 --seed fast-check
```

The focused suite covers all 26 scenes and 29 choices deterministically, all endings and the media pipeline. The bot is extra seeded exploration, **not proof of browser interaction or visual quality**. Keep a failing seed so it can be replayed; do not start with thousands of random runs.

**Measured quick checks in this workspace (2026-09-06):** story/media suite **0.95s**, Studio ship suite **1.37s**, 100 bot runs **0.59s**. These are examples, not CI guarantees. In the gameplay pass, the fitted-room browser case took about **10–15 seconds**, a full gold browser route **1–1½ minutes**, `npm test` roughly **5 minutes**, and all 22 browser tests **7–8 minutes**. Most iterations do not need both long suites.

## 2. Filter the browser suite instead of replaying everything

These are actual current test-title substrings, not invented labels:

```sh
# Desktop/mobile framing, edge menu, keyboard pickup and Rewind
npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'fitted room'

# Crafting, lie challenge, archive retry, mobile corkboard and gold epilogue
npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'built-in newsstand'

# Real Studio edit → export/import → Check → Publish → newsstand gold
npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'Studio edit'

# Focused Studio save and graph-undo regressions
npm run test:browser -- scripts/browser/studio.spec.ts --grep 'focused beat|timeout wire delete'
```

Confirm a filter **without launching a browser**, or immediately rerun failures:

```sh
npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'fitted room' --list
npm run test:browser -- --last-failed
```

Use `--last-failed` before another run replaces the last-run record; otherwise use an explicit file/grep. Preserve important screenshots, traces and exported reels **before** another run: Playwright clears its output directory. Separate experiments can use `--output test-results/focused-browser`; the default full run can still clear that parent directory.

### Keep setup and servers warm

- Run `npm ci` on setup/lockfile changes, not before every test. Install Chromium once with `npx playwright install chromium`, or reuse a compatible installation via `PLAYWRIGHT_CHROMIUM_PATH`.
- Without overrides, Playwright manages a test Vite server on **5174**. To reuse an already-running, current-source Vite server on **5173**:

  ```sh
  PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 \
    npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'fitted room'
  ```

- Keep the server running across focused tests; do not edit source while a test is in flight. Port **4173** serves the last **build**, so it will not reflect source edits until rebuilt. Use it for final production smoke, not the normal edit loop.
- New servers must bind to `0.0.0.0` in Arena. Agents should use `start_process` and the process tools, not `bash` background jobs or sleep/curl polling loops. Human testers use the live-preview URL; `127.0.0.1` above is for Playwright running inside the sandbox.
- Keep `workers: 1` as the reliable default. Do not run several full DOM/browser suites concurrently on a small sandbox to chase theoretical speed; resource contention makes timing failures harder to diagnose.

**This session's browser workaround:** if `/tmp/chromium` and `/tmp/al2023/lib` still exist, use the already-installed browser instead of retrying downloads:

```sh
LD_LIBRARY_PATH="/tmp/al2023/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}" \
PLAYWRIGHT_CHROMIUM_PATH=/tmp/chromium \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 \
  npm run test:browser -- scripts/browser/black-mass-bride.spec.ts --grep 'fitted room'
```

Those `/tmp` paths are temporary, **not repository dependencies or guaranteed on another machine**. If absent, use a normal browser installation. Tool-shell exports do not persist between calls; pass needed overrides on the command itself.

## 3. Avoid the expensive false starts from this pass

- **Read the failure screenshot/context first.** Do not rerun the whole suite to learn that a selector is wrong. Check the real story labels and accessible names. The room editor is the **🚶 Stage** tab; the story uses **Jay's casebook**. Stage conversations auto-close—there is no “Leave conversation” button.
- **Reuse `scripts/browser/adventure-driver.ts`.** It waits for observed scene changes and stable, enabled DOM controls. A dissolve can briefly expose the next scene's choices before its prose resets; `isVisible()` alone is not readiness. Do not paper over this with bigger timeouts or unbounded Space presses.
- **Wait for actual persistence.** `draft?.field === undefined` also succeeds when no draft exists. Assert a real saved record and its expected fields together. After import, wait for the “Opened … asset(s)” confirmation, not a title that was already on screen.
- **Use branch links for diagnosis, not release proof.** `?story=black-mass-bride&scene=bmb_library` is a quick way to inspect that room. A branch-link screenshot or injected inventory does not count as completing the adventure from the newsstand.
- **Inspect both 1440×960 and 390×844 after layout changes.** Green logic tests did not catch blacked-out artwork, clipped labels or hidden epilogue text. One targeted browser run plus its screenshots is cheaper and more useful than another blind bot run.
- **Do not clear an author's storage to fix a test.** Use fresh Playwright contexts. Studio drafts/publications can override built-in source; explicitly confirm which version you are testing.

## 4. Before handing off a completed content/engine pass

After focused failures are fixed, run the broad checks against the final, unchanged code:

```sh
npm run check && npx tsc --noEmit && npm test && npm run build
npm run lint && npm run test:browser
```

Then complete **Studio Check**, the **published-newsstand playthrough**, and the shipping-shell QA in [DEVELOPMENT-NOTES](../DEVELOPMENT-NOTES.txt). The Black-Mass Bride browser suite includes its real Studio import/edit/export/re-import/publish workflow and newsstand-started runs for all four endings; its portable-copy run blocks the original media directories. A browser pass does not certify a native installer.

If a late fix changes behavior, rerun its focused regression, then the applicable broad suite before sign-off. Report the exact commands and results; do not claim full release coverage from a filtered test. See [testing tools](testing-tools.md) and [the adventure guide](black-mass-bride.md) for the deeper mechanics and spoiler routes.

## First-person additions

The FPS pass adds three browser cases. Use `npm run test:fps` first (about a second),
then `npm run test:browser -- scripts/browser/fps.spec.ts --grep 'pause, real'` for
input/save/mobile work, `--grep 'newsstand rooftop'` for the complete route, or
`--grep 'Studio type'` for editing/export/publishing. See [the first-person guide](first-person.md).
The ordinary story bot does **not** simulate first-person combat.

### HD pose banks and pursuit regression

Run `npm run test:sprite-atlas` and `npm run test:blade-runner` first, then
`npm run test:browser -- scripts/browser/blade-runner.spec.ts`. The focused
browser set includes the real Studio forge/assembler, eight-way player
selection/rest, pot/dodge, both Zuben outcomes, Gaff, saved revisits and portable
ESPER/cockpit/VK media. Test all authored entry spawns, not just a room's default.
A* must turn concave floor corners even without rectangular furniture.
Avoid simultaneous heavy browser/Stage-beta runs when diagnosing timeouts.
