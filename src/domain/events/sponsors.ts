/**
 * "Presented by" and "Food & vendors" for a night. Mirrors theartistpost
 * `src/server/api/eventSponsors.ts` (Phase 2 contract).
 *
 * Founder's Vision guardrails: artists and vendors never pay, so nothing here
 * carries money; a sponsored night says so plainly; an unsponsored night shows
 * nothing. Only admins set these fields.
 *
 * Servers before the sponsor migration send neither key, and a cached night
 * from an older build may lack them too, so every reader goes through
 * `presentedByFrom` / `vendorsFrom`: missing or malformed means "none",
 * never an error and never a guess.
 */

export const SPONSOR_NAME_MAX = 80;
export const SPONSOR_URL_MAX = 300;
export const VENDORS_MAX = 12;
export const VENDOR_NAME_MAX = 60;
export const VENDOR_OFFERING_MAX = 80;
export const VENDOR_URL_MAX = 300;

export type PresentedBy = { name: string; url: string | null; logoUrl: string | null };
export type Vendor = { name: string; offering: string; url: string | null };

/** https, a host, no credentials, no spaces. (RN's URL polyfill is partial, so no `new URL`.) */
const HTTPS_RE = /^https:\/\/[^\s/?#@\\]+(?:[/?#]\S*)?$/i;

/** An absolute https URL of at most `max` characters; otherwise null. */
export function httpsUrl(value: unknown, max = SPONSOR_URL_MAX): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return HTTPS_RE.test(trimmed) ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The wire `presentedBy`, or null when absent, empty or unreadable. */
export function presentedByFrom(value: unknown): PresentedBy | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!name) return null;
  return {
    name: name.slice(0, SPONSOR_NAME_MAX),
    url: httpsUrl(value.url),
    logoUrl: httpsUrl(value.logoUrl, 500),
  };
}

/** The wire `vendors`, [] when absent. Malformed entries are dropped, never guessed. */
export function vendorsFrom(value: unknown): Vendor[] {
  if (!Array.isArray(value)) return [];
  const out: Vendor[] = [];
  for (const item of value) {
    if (out.length >= VENDORS_MAX) break;
    if (!isRecord(item)) continue;
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    const offering = typeof item.offering === "string" ? item.offering.trim() : "";
    out.push({
      name: name.slice(0, VENDOR_NAME_MAX),
      offering: offering.slice(0, VENDOR_OFFERING_MAX),
      url: httpsUrl(item.url, VENDOR_URL_MAX),
    });
  }
  return out;
}

/** A night from the API with both keys filled in (null / [] when the server sent none). */
export function withSponsorFields<T extends object>(
  event: T,
): Omit<T, "presentedBy" | "vendors"> & { presentedBy: PresentedBy | null; vendors: Vendor[] } {
  const raw = event as T & { presentedBy?: unknown; vendors?: unknown };
  return { ...event, presentedBy: presentedByFrom(raw.presentedBy), vendors: vendorsFrom(raw.vendors) };
}

/** The plain disclosure line. */
export function presentedByLine(name: string): string {
  return `Presented by ${name}`;
}
