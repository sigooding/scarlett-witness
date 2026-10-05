/**
 * LINT — the crash net.
 *
 * This config exists for one rule above all others: react-hooks/rules-of-hooks.
 * Two real hook-order crashes shipped into main before it existed:
 *
 *   - Studio ▸ CinematicPreview declared a useRef AFTER the early return for
 *     "video:" URLs, so flipping a cinematic between an image plate and a video
 *     cutscene changed the hook count and React threw "rendered fewer hooks
 *     than expected" — killing the preview panel mid-edit.
 *   - Game declared the onStage useMemo BELOW the `if (!scene)` guard, so
 *     navigating into a missing scene crashed the player instead of showing the
 *     intended "Missing scene" fallback.
 *
 * Neither was caught by tsc or by any of the harnesses, because both are legal
 * TypeScript and only misbehave on the second render. Hence: rules-of-hooks is
 * an ERROR and `npm run lint` blocks.
 *
 * exhaustive-deps is a WARNING on purpose. There is a large existing backlog of
 * stale-closure warnings in Game.tsx / Studio.tsx; making it an error today
 * would mean either a huge risky refactor or a wall of suppressions. Warnings
 * keep it visible without blocking. Drive the count down over time.
 *
 *   npm run lint         → errors block, warnings print
 *   npm run lint:strict  → warnings block too (for when the backlog is clear)
 */
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [
      "dist/**",
      "dist_electron/**",
      "node_modules/**",
      ".preflight/**",
      "scripts/.tmp-*/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
