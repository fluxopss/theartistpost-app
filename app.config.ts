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
 */
const PRODUCTION_ID = "agency.fluxlab.theartistpost.dev";

const VARIANTS = {
  development: { id: `${PRODUCTION_ID}.devclient`, name: "Artist Post (Dev)" },
  preview: { id: `${PRODUCTION_ID}.preview`, name: "Artist Post (Preview)" },
  production: { id: PRODUCTION_ID, name: null },
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
    android: { ...config.android, package: variant.id },
  };
};
