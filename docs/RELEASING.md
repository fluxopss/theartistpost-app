# Releasing The Artist Post app

How a change gets from `main` to testers' phones. Plain language first, commands after.

There are two ways to ship, and picking the right one is the whole job:

| | **OTA update** (over the air) | **Native build** |
|---|---|---|
| What it changes | JavaScript, copy, images, styles | Anything native: new library, permission, icon, splash, SDK, app config |
| How testers get it | Next time they open the app (twice, see below) | Install a new build (TestFlight / APK) |
| Time | A couple of minutes | 15–40 minutes in EAS cloud, plus Apple processing |
| Command | `node scripts/release.mjs ota "message"` | `node scripts/release.mjs native` |

## 1. OTA or native build?

The app uses `runtimeVersion: { policy: "fingerprint" }`. EAS hashes everything native (installed native libraries, `app.json` native config, plugins, Expo SDK) into a **fingerprint**. An OTA update only reaches builds whose fingerprint matches the one the update was published with. Build a new native fingerprint and old installs quietly stop receiving updates — they are not broken, they just keep what they have.

**OTA-safe** (the fingerprint does not change):

- Editing anything in `src/` — screens, copy, logic, styles, theme, tests
- Swapping images or fonts that are `require`d from JS
- Fixing a bug, tweaking a layout, changing a link or a string
- Bumping a JS-only dependency that has no native code

**Needs a native build** (the fingerprint changes):

- `npx expo install <package>` for any package with native code (camera, maps, notifications…)
- Anything in `app.json` outside copy: permissions, plugins, `ios`/`android` blocks, icon, splash, scheme, version, bundle id, `updates`
- Upgrading Expo SDK, React Native, or any `expo-*` package
- Editing `eas.json` **at all** — the whole file is hashed into the fingerprint, even the `submit` section
- Adding, removing or changing a `package.json` **script** — scripts are hashed too (this is why the release tool is run as `node scripts/release.mjs`, not as an npm script)

**When unsure**, don't guess. Check the fingerprint:

```bash
npx eas-cli@latest fingerprint:generate --platform ios
```

Compare with the runtime version shown on the live build's page on expo.dev (Builds → the build → Runtime version). Same hash → OTA-safe. A different hash on your Windows machine than the cloud's can happen (that's why `.fingerprintignore` exists), so the cloud's number on expo.dev is the source of truth. After publishing, the update's page lists which runtime versions it targets; if it targets none of the live builds, it will not reach anyone.

> **Trap:** a harmless-looking edit to `eas.json` or `package.json` scripts changes the fingerprint. Merge it, and every installed build silently stops receiving OTAs until a new native build ships. If you must touch those files, plan a `release:native` in the same breath.
>
> *Optional later fix:* add a `fingerprint.config.js` with `sourceSkips: SourceSkips.PackageJsonScriptsAll` so scripts stop counting. That change itself alters the fingerprint once, so land it together with the next native build.

## 2. Before every release (checklist)

The release scripts run the first four for you and refuse to continue if any fail. Do the last two yourself.

- [ ] `npx tsc --noEmit` (if typed routes are missing, run `CI=1 npx expo start` for a few seconds first to generate `.expo/types`)
- [ ] `npx expo lint`
- [ ] `npx jest`
- [ ] `npx expo-doctor`
- [ ] Production API smoke test — from the **web repo** (`theartistpost`): `node scripts/qa/community-e2e.mjs`. This hits the real API the app talks to; a native release against a broken API is a bad day.
- [ ] Your change is merged to `main`, you are on `main`, and the tree is clean. The scripts enforce this for production.

## 3. Publish an OTA update

```bash
git checkout main && git pull
node scripts/release.mjs ota "Fix RSVP button on small phones"
```

What it does, in order:

1. Refuses if the working tree is dirty, you are not on `main`, or `main` differs from `origin/main`.
2. Runs typecheck, lint, tests and expo-doctor. Any failure stops it. Nothing is published.
3. Runs `eas update --channel production --environment production --message "…"`.
4. Prints the **update group id** and the exact rollback command.

Practice first with `node scripts/release.mjs ota "msg" --dry-run`: it runs every check and prints the publish command without running it. Add `--no-gates` (dry run only) for a fast plumbing check.

To try a change on the **preview** channel instead (any branch, no `main` requirement — this is how Android APK testers get updates, see §6):

```bash
node scripts/release.mjs ota "Try the new empty state" --channel preview
```

**How testers see it.** The app downloads the update in the background when it launches, then applies it the *next* launch. So: open the app once (downloads), close it fully, open it again (new code). Tell testers that or they will think nothing shipped.

## 4. Cut a native build and submit

```bash
git checkout main && git pull
node scripts/release.mjs native
```

What it does:

1. Same safety checks and gates as OTA (production builds must come from a clean, up-to-date `main`).
2. Starts the **iOS production build** with `--auto-submit`. EAS builds it, bumps the build number (`autoIncrement`, remote), and uploads to App Store Connect (app id `6823238247`, already in `eas.json`).
3. Starts an **Android preview build**: an installable APK, no Play Store account needed.
4. Prints both build ids and links, then returns. The builds run in EAS cloud; you don't have to keep the terminal open.

Each build can also be run on its own:

```bash
npx eas-cli@latest build --platform ios --profile production --auto-submit
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest submit --platform ios --latest      # resubmit the newest iOS build
```

Always read the result back on expo.dev (build status **Finished**) before telling anyone it shipped.

## 5. How testers get iOS builds

- **TAP Team** (internal TestFlight group) has auto-distribution: every processed build goes to them with no action. Processing in App Store Connect takes ~5–30 minutes after upload.
- **TAP Testers** (external group) does **not** get builds automatically. In App Store Connect → TestFlight → TAP Testers → add the new build. The first build of a version (and sometimes later ones) goes through Beta App Review before testers can install it. Plan for that delay.
- OTA updates skip all of this: they reach every installed build with a matching fingerprint on the production channel.

## 6. How testers get Android builds

Android testers use the **preview** profile APK (channel `preview`), not the Play Store (see `docs/ANDROID-PLAY-STORE.md` for what a Play listing needs).

1. Open the build's page on expo.dev (the link printed by `release:native`, or Builds in the dashboard) on the phone and tap **Install**, or scan its QR code. Share that page link with testers who have access to the Expo project — or download the `.apk` from the page and send the file.
2. First install: Android asks to allow installs from the browser/Files app (Settings → "Install unknown apps"). That's normal for APKs outside the Play Store.
3. Updates: JS changes arrive by OTA on the `preview` channel (`node scripts/release.mjs ota "msg" --channel preview`). A native change needs a fresh APK installed over the old one (same package name keeps data).

## 7. Roll back an OTA

OTA rollbacks are quick and don't need a new build. Current CLI is `eas-cli` 24.x; confirm with `npx eas-cli@latest update:rollback --help`.

Find the bad update's **group id** (the id `release:ota` printed, or `npx eas-cli@latest update:list --branch production`), then:

```bash
npx eas-cli@latest update:rollback <GROUP_ID> --message "Roll back RSVP change" --non-interactive
```

It republishes the update that was published *before* the bad one (or rolls back to the embedded bundle if there was none). The group must be the **latest** on its branch + runtime version.

Alternative — republish a specific known-good group:

```bash
npx eas-cli@latest update:republish --group <GOOD_GROUP_ID> --destination-channel production --message "Restore known-good" --non-interactive
```

Rollback, too, is picked up at the next launch after download: open → close → open.

If the fault is native (crash on launch before JS runs), an OTA can't fix it. Ship a new build, and in the meantime pull the build from the TestFlight group in App Store Connect.

## 8. Quick reference

| Task | Command |
|---|---|
| Run the gates only | `node scripts/release.mjs check` |
| Rehearse an OTA | `node scripts/release.mjs ota "msg" --dry-run` |
| Publish OTA to testers | `node scripts/release.mjs ota "msg"` |
| Publish OTA to preview (Android APK testers) | `node scripts/release.mjs ota "msg" --channel preview` |
| New iOS (TestFlight) + Android (APK) builds | `node scripts/release.mjs native` |
| Rehearse the builds | `node scripts/release.mjs native --dry-run` |
| Roll back | `npx eas-cli@latest update:rollback <GROUP_ID> --non-interactive` |

Secrets: nothing in these scripts reads or prints credentials. EAS uses your logged-in session (`npx eas-cli@latest whoami`) and keeps signing keys server-side. The Play service-account key, if you ever add one, lives in `secrets/` (git-ignored) and nowhere else.
