/** App Store Connect app 6823238247 (eas.json submit.production.ios.ascAppId). */
const IOS_APP_STORE_URL = "https://apps.apple.com/app/id6823238247";

/** Where to get the newest build for this platform, or null when there is no store. */
export function storeUrl(os: string | undefined, androidPackage: string | null | undefined): string | null {
  if (os === "ios") return IOS_APP_STORE_URL;
  if (os === "android" && androidPackage) {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(androidPackage)}`;
  }
  return null;
}
