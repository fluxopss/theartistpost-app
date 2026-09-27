This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## The Artist Post — project rules

This app mirrors **theartistpost** (Next.js web repo, sibling folder `../theartistpost`), a West Palm Beach nonprofit arts hub. The web repo is the backend/API and is **production**: a push to its `main` deploys live within ~3 minutes via a VPS cron, regardless of CI status. Never push to that repo's `main` directly — branch, PR, and wait for explicit human sign-off before merging, even for a one-line fix.

**Structure** (see `src/theme/`, `src/components/`, `src/domain/`, `src/content/` for the established patterns before adding a new one):
- `src/app/` — routes only, per expo-router convention above.
- `src/screens/` — screen bodies route files render (thin route files, real UI here).
- `src/components/` — shared UI only, promoted once used on 2+ screens; kebab-case, one named export.
- `src/theme/` — the single source of design tokens. **Never hardcode a hex color, font size, or spacing multiple outside `src/theme/`.** Screens and components import from `@/theme` (or `@/components/themed-text` for text) — they never set `fontFamily`/`fontSize`/raw color strings directly. Brand colors (`useBrandColors()`) and system semantic colors (`@/theme/colors`) are never mixed in one file.
- `src/domain/` — pure TS logic ported from the web app (night/schedule/wall/kindness/etc.), no React/RN imports, colocated `*.test.ts`.
- `src/content/` — bundled copy ported from the web app's `src/content/*`. Real facts only.
- `src/api/`, `src/auth/`, `src/storage/` — added in later phases (see the project plan) as the backend `/api/v1` and accounts land.

**Content honesty (non-negotiable):** never invent artists, events, kindness notes, or nonprofit facts to fill out a screen. If real content isn't available yet, show an honest empty state, not a placeholder that reads as real. Never port the web app's `kindness/fixtures.ts` seed notes or any placeholder/past-dated events as if they were live.

**Navigation:** never import `@react-navigation/*` directly — use `expo-router`'s re-exports (`ThemeProvider`, `DarkTheme`, etc. all come from `"expo-router"` itself on this SDK, confirmed against installed types — don't assume `expo-router/react-navigation` without checking first). Prefer `NativeTabs` (`expo-router/unstable-native-tabs`) and native `Stack`/`formSheet` over any custom-built tab bar or modal.

**Before trusting an Expo/RN API from memory or a skill's example**, check it against `node_modules/<pkg>/**/*.d.ts` on this exact install (TypeScript ~6.0.3, SDK 57) — this project has already hit at least one skill-doc example (`Platform.select` + `DynamicColorIOS` in tabs.md) that doesn't typecheck against these exact versions.

Full build plan, phase order, design-token source values, and the backend API contract: `C:\Users\jonat\.claude\plans\the-artist-post-is-gleaming-chipmunk.md` (Jonathan's machine).
