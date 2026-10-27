/**
 * The live public website. Shared and "open on the web" links always point
 * here, never at the API host: the API (EXPO_PUBLIC_API_URL) stays on the
 * Flux address, while pages people open live on theartistpost.org.
 * EXPO_PUBLIC_SITE_URL can override it per build profile (see eas.json).
 */
const DEFAULT_SITE_ORIGIN = "https://theartistpost.org";

export function siteOrigin(): string {
  const raw = (process.env.EXPO_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(raw) ? raw : DEFAULT_SITE_ORIGIN;
}

/** Absolute web-page URL for a site path ("/event/x" → "https://theartistpost.org/event/x"). */
export function siteUrl(path: string): string {
  return `${siteOrigin()}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function eventPageUrl(id: string): string {
  return siteUrl(`/event/${encodeURIComponent(id)}`);
}

export function postPageUrl(slug: string): string {
  return siteUrl(`/post/${encodeURIComponent(slug)}`);
}

export function profileShareUrl(handle: string): string {
  return siteUrl(`/u/${handle.trim().toLowerCase()}`);
}

export function profileShareMessage(name: string, handle: string): string {
  return `${name} on The Artist Post: ${profileShareUrl(handle)}`;
}
