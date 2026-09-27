// Ported from theartistpost@03f9a2f:src/features/app/storage.ts
/** Types + pure helpers only — no localStorage I/O (native storage lives elsewhere). */

export type StudioProfile = {
  displayName: string;
  handle: string;
  city?: string;
};

export type SavedPost = {
  id: string;
  slug: string;
  title: string;
  artist: string;
};

export type SavedEvent = {
  id: string;
  title: string;
  venue: string;
  start: string;
};

/** Web `SavedLibrary` — a studio's saved posts and events. */
export type Saves = {
  posts: SavedPost[];
  events: SavedEvent[];
};

export const DEFAULT_STUDIO: StudioProfile = {
  displayName: "Studio Guest",
  handle: "studioguest",
};

export function slugifyHandle(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug || DEFAULT_STUDIO.handle;
}
