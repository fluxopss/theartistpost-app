import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Per-variant app identity, layered on top of app.json.
 *
 * APP_VARIANT is set per build profile in eas.json. Unset means production.
 *
 * Production keeps `agency.fluxlab.theartistpost.dev`: App Store Connect app
 * 6823238247 was created with that bundle ID and Apple never lets it change.
 * Dev and preview get their own suffix so all three install side by side.
 *
 * Changing an identifier here changes the runtime fingerprint and needs new
 * signing credentials on EAS — see docs/APP-VARIANTS.md.
 *
 * Android production uses TAP's own package, `org.theartistpost.app`, for the
 * Google Play listing under The Artist Post Inc's developer account. A Play
 * package name is permanent once published (docs/ANDROID-PLAY-STORE.md), and
 * no Android build has been published yet, so this is the moment to set it.
 * iOS keeps the existing bundle id because the App Store Connect app is fixed.
 */
const PRODUCTION_ID = "agency.fluxlab.theartistpost.dev";
const ANDROID_PRODUCTION_ID = "org.theartistpost.app";

const VARIANTS = {
  development: {
    id: `${PRODUCTION_ID}.devclient`,
    androidId: `${PRODUCTION_ID}.devclient`,
    name: "Artist Post (Dev)",
  },
  preview: {
    id: `${PRODUCTION_ID}.preview`,
    androidId: `${PRODUCTION_ID}.preview`,
    name: "Artist Post (Preview)",
  },
  production: { id: PRODUCTION_ID, androidId: ANDROID_PRODUCTION_ID, name: null },
} as const;

type Variant = keyof typeof VARIANTS;

function readVariant(): Variant {
  const raw = process.env.APP_VARIANT || "production";
  if (raw in VARIANTS) return raw as Variant;
  throw new Error(
    `Unknown APP_VARIANT "${raw}". Use one of: ${Object.keys(VARIANTS).join(", ")}.`,
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = VARIANTS[readVariant()];

  return {
    ...config,
    name: variant.name ?? config.name ?? "The Artist Post",
    slug: config.slug ?? "theartistpost-app",
    ios: { ...config.ios, bundleIdentifier: variant.id },
    android: { ...config.android, package: variant.androidId },
  };
};
