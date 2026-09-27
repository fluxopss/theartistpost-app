// Ported from theartistpost@ba27fd0:src/features/posts/mediaRule.ts (mediaKindLabel only)
/**
 * Native notes: `mediaGap` (a publish-time rule) stays on the web. Added
 * `mediaPresentation`, which decides what the app can show in place.
 */

export type MediaType = "IMAGE" | "VIDEO" | "EMBED" | "CANVAS";

/** Original TAP rule: a post is a photograph, a video, or a sound. */
export function mediaKindLabel(type: MediaType | string): string {
  if (type === "IMAGE") return "Photograph";
  if (type === "VIDEO") return "Video";
  if (type === "EMBED") return "Sound";
  return "Work";
}

export type MediaPresentation = "image" | "video" | "web";

/**
 * Photographs and videos play in the app. Sound embeds, canvases, and any
 * post without stored media are shown honestly as "on the web".
 */
export function mediaPresentation(media: { type: MediaType; url: string | null }): MediaPresentation {
  if (!media.url?.trim()) return "web";
  if (media.type === "IMAGE") return "image";
  if (media.type === "VIDEO") return "video";
  return "web";
}
