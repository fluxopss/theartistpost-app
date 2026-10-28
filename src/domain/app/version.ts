/**
 * App version checks for the forced-update gate (GET /api/v1/app/config →
 * `minSupportedVersion`). Every unreadable input fails open: a bad config or
 * a missing version must never lock someone out of the app.
 */
export type Version = [major: number, minor: number, patch: number];

export function parseVersion(raw: string | null | undefined): Version | null {
  if (typeof raw !== "string") return null;
  const core = raw.trim().replace(/^v/i, "").split(/[-+]/)[0] ?? "";
  if (!core) return null;
  const parts = core.split(".");
  if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const [major = 0, minor = 0, patch = 0] = parts.map(Number);
  return [major, minor, patch];
}

/** -1, 0 or 1 like a sort comparator; null if either side is unreadable. */
export function compareVersions(a: string, b: string): -1 | 0 | 1 | null {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (!va || !vb) return null;
  for (let i = 0; i < 3; i++) {
    if (va[i] !== vb[i]) return va[i] < vb[i] ? -1 : 1;
  }
  return 0;
}

/** True only when both versions read cleanly and `running` is below `minimum`. */
export function mustUpdate(running: string | null | undefined, minimum: string | null | undefined): boolean {
  if (!running || !minimum) return false;
  return compareVersions(running, minimum) === -1;
}
