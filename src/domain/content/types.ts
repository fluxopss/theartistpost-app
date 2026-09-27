// Ported from theartistpost@03f9a2f:src/lib/content/schemas.ts
// (+ ArtistMedium/ARTIST_MEDIUMS from src/data/artists.ts, ScheduleEvent from src/data/events.ts)
import { z } from "zod";

/*
 * Content schemas + inferred types. The web `ContentAdapter` interface was
 * dropped — the native data layer (API client) owns fetching. No seed data
 * lives here: artists and events come from the API.
 */

export const artistMediumSchema = z.enum([
  "music",
  "theater",
  "visual",
  "dance",
  "literary",
  "multidisciplinary",
]);

export type ArtistMedium = z.infer<typeof artistMediumSchema>;

export const ARTIST_MEDIUMS: readonly {
  value: ArtistMedium | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "music", label: "Music" },
  { value: "theater", label: "Theater" },
  { value: "visual", label: "Visual" },
  { value: "dance", label: "Dance" },
  { value: "literary", label: "Literary" },
  { value: "multidisciplinary", label: "Multi" },
];

export const artistSchema = z.object({
  id: z.string(),
  name: z.string(),
  medium: artistMediumSchema,
  bio: z.string(),
  /** Remote image URL or web path for the artist portrait. */
  image: z.string(),
  handle: z.string().optional(),
  comingSoon: z.boolean().optional(),
});

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  medium: z.string(),
  /** ISO 8601 instant with offset. */
  start: z.string(),
  /** ISO 8601 instant with offset. */
  end: z.string(),
  venue: z.string(),
  description: z.string(),
  comingSoon: z.boolean().optional(),
});

export const wallNoteSchema = z.object({
  id: z.string(),
  body: z.string().max(240),
  fromLabel: z.string(),
  medium: z.enum(["anyone", "music", "visual", "theater", "open-heart"]),
  spark: z.enum(["coral", "gold", "teal"]),
  createdAt: z.string(),
  source: z.enum(["seed", "local", "remote"]),
});

export const explorePostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "EMBED", "CANVAS"]),
  featured: z.boolean(),
  publishedAt: z.string().nullable().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  artist: z.object({
    id: z.string(),
    handle: z.string(),
    name: z.string(),
  }),
});

export const chapterSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
  stateCode: z.string().length(2),
  city: z.string().optional(),
  status: z.enum(["active", "forming", "planned"]),
  summary: z.string(),
});

export type ContentArtist = z.infer<typeof artistSchema>;
export type ContentEvent = z.infer<typeof eventSchema>;
export type ContentWallNote = z.infer<typeof wallNoteSchema>;
export type ContentExplorePost = z.infer<typeof explorePostSchema>;
export type ContentChapter = z.infer<typeof chapterSchema>;

/** Web `src/data/events.ts` name for the same shape — kept as an alias. */
export type ScheduleEvent = ContentEvent;
