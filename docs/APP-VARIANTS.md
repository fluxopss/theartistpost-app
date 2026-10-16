# App variants

`app.config.ts` gives each EAS build profile its own identity, so the dev client, the preview build and the store build can all be installed on one phone.

| `APP_VARIANT` | Build profiles | iOS bundle ID / Android package | Home-screen name |
| --- | --- | --- | --- |
| `development` | `development`, `development-simulator` | `agency.fluxlab.theartistpost.dev.devclient` | Artist Post (Dev) |
| `preview` | `preview`, `ios-simulator` | `agency.fluxlab.theartistpost.dev.preview` | Artist Post (Preview) |
| `production` (or unset) | `production` | `agency.fluxlab.theartistpost.dev` | The Artist Post |

`APP_VARIANT` is set in each profile's `env` in `eas.json`. A typo fails loudly instead of building the wrong app.

## Why production keeps the `.dev` ID

App Store Connect app **6823238247** ("The Artist Post Beta") already has builds under `agency.fluxlab.theartistpost.dev`, and Apple never lets an app record change its bundle ID. Production stays on it until TAP's own store accounts take over with `org.theartistpost.app` (a new app record, a new install for users).

No Play listing exists yet. A Play package name is permanent once uploaded, so decide the Android production package before the first upload (`docs/ANDROID-PLAY-STORE.md` on the `feat/android-release` branch).

## OTA updates: set the variant

The runtime fingerprint includes the app config, so **each variant has a different runtime version**. An update only reaches builds with the same runtime version. Publish with the variant that matches the channel:

```bash
APP_VARIANT=preview npx eas-cli@latest update --channel preview --message "..."
APP_VARIANT=production npx eas-cli@latest update --channel production --message "..."
```

`eas update` does not read the `env` block of build profiles in `eas.json`. If the variant is left unset it resolves to production, which is right for the `production` channel and wrong for `preview`.

Check: `APP_VARIANT=preview npx expo config --type public` shows the preview IDs.

## First build of a new variant (needs Jonathan's OK)

The `.devclient` and `.preview` IDs are new to EAS, so the first build of each:

- **Android:** EAS creates a new upload keystore for the new package. Sideloaded preview APKs under the old package (`agency.fluxlab.theartistpost.dev`) stay installed; testers install the new preview app next to it, and data does not carry over.
- **iOS:** EAS registers the new App IDs and makes ad hoc provisioning profiles for the registered devices. This needs an interactive `eas build` with an Apple Developer sign-in the first time.
- Production keeps its existing credentials.

Merging this change alters the fingerprint of **every** variant, production included. Builds already installed stop receiving OTA updates until the next native build of their variant. Plan a native build with the merge.

## Deep links

The URL scheme stays `theartistpost` in all variants. If more than one variant is installed, Android may ask which app should open a `theartistpost://` link. Sign-in uses a one-time email code, not a redirect URL, so Supabase needs no per-variant callback URLs.
