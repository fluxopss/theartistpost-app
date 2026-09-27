# The Artist Post — native app

Native Expo (iOS + Android) app for **The Artist Post**, a West Palm Beach nonprofit arts hub. Mirrors the structure and brand of the web app at [theartistpost.fluxlab.agency](https://theartistpost.fluxlab.agency), on a proper design system (`/expo-design-system`), following native platform conventions rather than reskinning the web layout.

Sibling repo: [`theartistpost`](https://github.com/fluxopss/theartistpost) (Next.js web app) — the backend/API for this app, and **production**: a push to its `main` deploys live within ~3 minutes via a VPS cron. See `AGENTS.md` for the full rule.

## Stack

- **Expo SDK 57** · React Native 0.86 · React 19 · Expo Router (native tabs + stacks, array-group shared stacks)
- **TypeScript**, strict
- **Design system** — `src/theme/` (brand palette, type ramp, spacing/radius/shadow/motion tokens) + `src/components/` primitives
- **Domain logic** — `src/domain/` — pure TS ported from the web app (night/schedule/wall/kindness), with fixes (Eastern-time month grid, ICS escaping)
- **Content** — `src/content/` — bundled copy ported from the web app, real facts only

## Quick start

```bash
npm install
npx expo run:android   # first run: builds a dev client (Android SDK required)
npx expo start         # subsequent runs / iOS via Expo Go or a dev client
```

iOS dev/simulator builds run on EAS cloud (`eas build --profile development-simulator`) — this is developed on Windows, no local Xcode.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest (jest-expo), domain logic
```

## Status

Early scaffold (design system + navigation shell). See the build plan for phases, the backend `/api/v1` contract, and store-readiness checklist — ask Jonathan for the current copy, or check `.claude/plans/` on his machine.

## Design honesty

Per the web app's own rule: this app never invents artists, events, or kindness notes to fill a screen. Empty states are honest until real content exists.
