/**
 * The live public site. Shared links never point at a dev API origin.
 * Set EXPO_PUBLIC_SITE_URL=https://theartistpost.org in eas.json once the
 * domain cutover is live; until then links use the Flux address, which
 * 301s page requests to the real domain after cutover, so old shares keep working.
 */
const DEFAULT_SITE_ORIGIN = "https://theartistpost.fluxlab.agency";

function siteOrigin(): string {
  const raw = (process.env.EXPO_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(raw) ? raw : DEFAULT_SITE_ORIGIN;
}

export function profileShareUrl(handle: string): string {
  return `${siteOrigin()}/u/${handle.trim().toLowerCase()}`;
}

export function profileShareMessage(name: string, handle: string): string {
  return `${name} on The Artist Post: ${profileShareUrl(handle)}`;
}
