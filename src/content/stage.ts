// Ported from theartistpost@03f9a2f:src/content/stage.ts
/**
 * The original TAP stage.
 * Source: StartUp Beat, “Featured Startup Pitch: The Artist Post,” March 11, 2016.
 * Spring 2015 site; TAP App in alpha after a successful second Kickstarter.
 * Do not add genres that were not in that pitch.
 *
 * Native: `tilt` is a number of degrees (web used CSS strings like "-2.4deg").
 */

export type TapTone = "coral" | "teal" | "gold" | "violet";

export const tapOrigin = {
  kicker: "The TAP stage",
  line: "Spring 2015. One house for every kind of artist. Posts were photographs, video, and sound — so the feed stayed art.",
  short: "Photographs, video, and sound.",
} as const;

export const tapMedia = [
  { id: "photo", label: "Photograph" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Sound" },
] as const;

export const tapGenres = [
  { id: "music", label: "Musicians", tilt: -2.4, tone: "coral" },
  { id: "photo", label: "Photographers", tilt: 1.6, tone: "teal" },
  { id: "dance", label: "Dancers", tilt: -1.2, tone: "gold" },
  { id: "film", label: "Filmmakers", tilt: 2.1, tone: "violet" },
  { id: "stage", label: "Actors", tilt: -1.8, tone: "coral" },
  { id: "laugh", label: "Comedians", tilt: 1.4, tone: "gold" },
  { id: "frame", label: "Models", tilt: -2, tone: "teal" },
] as const satisfies readonly {
  id: string;
  label: string;
  /** Degrees. */
  tilt: number;
  tone: TapTone;
}[];

export type TapGenre = (typeof tapGenres)[number];

/**
 * Lanes the founder has added since the 2016 pitch. `tapGenres` stays the
 * historical record; `houseGenres` is what the house runs on today.
 * Mirrors the web's src/content/stage.ts.
 *
 * Culinary Arts — Robbie Alvarez, Founder's Vision (Oct 2026): a primary
 * category, not an afterthought. In years of TAP pop-ups, at times roughly
 * half the vendors worked in food. Listed right after Musicians on purpose.
 */
export const culinaryGenre = {
  id: "culinary",
  label: "Culinary Artists",
  tilt: 1.8,
  tone: "violet",
} as const satisfies { id: string; label: string; tilt: number; tone: TapTone };

export const houseGenres = [tapGenres[0], culinaryGenre, ...tapGenres.slice(1)] as const;

export type HouseGenre = (typeof houseGenres)[number];
