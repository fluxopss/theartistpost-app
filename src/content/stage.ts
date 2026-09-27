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
