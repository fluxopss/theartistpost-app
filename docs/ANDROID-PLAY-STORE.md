# Google Play Store: what it takes

Status: **not started — needs Jonathan's decision.** A Play listing needs a Google Play developer account, which costs money (a one-time registration fee) and is tied to a legal identity. Nobody should create it on TAP's behalf without that OK. Until then, Android testers use the installable APK (see `docs/RELEASING.md` §6).

## What's needed from the people

1. **A Google Play Console developer account** — one-time registration fee (US$25 at the time of writing; confirm on the sign-up page).
   - **Account type: Organization**, registered to The Artist Post as the 501(c)(3). Organization accounts need a **D-U-N-S number** (free from Dun & Bradstreet, can take days to weeks), a verified organization website, and a contact phone/email. Google verifies the organization.
   - **Why not Personal:** personal accounts created after 13 Nov 2023 must run a **closed test with at least 12 testers opted in for 14 consecutive days** before they can publish to production. Confirm in Play Console help whether organization accounts are exempt; plan for the test either way.
   - The account holder should be TAP's own (so the app is theirs), per the plan to move to the final bundle id `org.theartistpost.app` under their own store accounts.
2. **Package name decision.** Today it is `agency.fluxlab.theartistpost.dev`. A Play package name is **permanent** — it can never change once published. Decide before the first upload whether this ships as `org.theartistpost.app`. That also changes the iOS bundle id plan; do both together.
3. **Store listing assets and answers** (Play Console → app setup):
   - App name, short description (80 chars), full description (4000 chars)
   - Icon 512×512, feature graphic 1024×500, at least 2 phone screenshots
   - **Privacy policy URL** (the app has accounts and user posts; the web app's `/legal/privacy` page is the natural source — it must be a public URL)
   - **Data safety form**: what is collected (email, name, posts, photos the user uploads), why, whether it is encrypted in transit (yes, HTTPS), and how users can delete data
   - **Content rating** questionnaire (user-generated content: the app has report/block tools, which Play requires — keep them)
   - Target audience, ads declaration (none), account-deletion URL/flow (Play requires an in-app and web path to delete the account; confirm the app has one before submitting)
4. **A Google Cloud service account** with Play Console API access, so `eas submit` can upload without a person clicking:
   1. Play Console → Setup → API access → link or create a Google Cloud project.
   2. Create a service account; grant it **Release manager** (or higher) on the app.
   3. Download its JSON key. Save it as `secrets/play-service-account.json` (git-ignored; `eas.json` already points there) or upload it to EAS (Credentials → Android).
   4. Never commit or paste the key anywhere.

## What engineering does once the account exists

1. In Play Console, create the app (default language, free, app or game, declarations).
2. Build the store artifact — the `production` profile already produces an `.aab` (APKs can't be submitted):

   ```bash
   npx eas-cli@latest build --platform android --profile production
   ```

   EAS creates and stores the upload keystore on first build (or reuse the one made for the preview build — see below). Enable **Play App Signing** (the default); Google holds the real signing key, the EAS keystore is only the *upload* key.
3. Submit. `eas.json` already targets the **internal** testing track:

   ```bash
   npx eas-cli@latest submit --platform android --latest
   ```

   The very first release on a brand-new Play app is easiest to upload by hand (Play Console → Testing → Internal testing → Create release → upload the `.aab`) because Play requires the app record to exist and be set up. After that, `eas submit` works unattended.
4. Fill the remaining setup tasks until the dashboard is green, add internal testers, then promote: internal → closed → production.
5. Wire the production channel: Android store builds use the `production` profile, so they are on the `production` update channel and receive `npm run release:ota` updates just like iOS.

## Signing keys, in one paragraph

The APK testers install is signed with a keystore EAS generated and stores server-side for this project (view with `npx eas-cli@latest credentials --platform android`). A Play listing must use the same package name; if the package name changes to `org.theartistpost.app`, a new keystore is created for it and existing APK testers must install the new app side by side (their data does not carry over). Back up the keystore from the EAS credentials screen before any Play upload.

## Rough order of operations

1. Jonathan: decide account owner + package name; approve the fee.
2. TAP (or Jonathan with TAP's details): D-U-N-S number → Play Console organization account → verification.
3. Flux: privacy policy URL, listing copy and assets, data-safety answers, service account.
4. Flux: production `.aab` → internal track → closed test (if required) → production.
