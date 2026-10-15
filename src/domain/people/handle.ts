/** Client-side handle rules. Mirrors the web `src/server/api/handles.ts` contract. */

const HANDLE_PATTERN = /^[a-z0-9_-]{2,40}$/;

/** Routes and brand words no member may claim (same list as the server). */
export const RESERVED_HANDLES: readonly string[] = [
  "admin",
  "theartistpost",
  "tap",
  "support",
  "studioguest",
  "api",
  "settings",
  "me",
  "u",
];

export type HandleValidation = { ok: true; handle: string } | { ok: false; message: string };

export function validateHandle(raw: string): HandleValidation {
  const handle = raw.trim().toLowerCase();

  if (handle.length < 2) {
    return { ok: false, message: "Handle needs at least 2 characters." };
  }
  if (handle.length > 40) {
    return { ok: false, message: "Handle can be at most 40 characters." };
  }
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, message: "Handle must be letters, numbers, _ or -." };
  }
  if (RESERVED_HANDLES.includes(handle)) {
    return { ok: false, message: "That handle is reserved. Try another." };
  }
  return { ok: true, handle };
}
