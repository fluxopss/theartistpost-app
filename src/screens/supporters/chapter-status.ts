import { chapters } from "@/content/chapters";
import { chapterSchema, type ContentChapter } from "@/domain/content/types";
import type { SparkTone } from "@/theme";

export type ChapterStatus = ContentChapter["status"];

/** Schema order, narrowed to the statuses the bundled chapters actually use. */
export const chapterStatuses: readonly ChapterStatus[] = chapterSchema.shape.status.options.filter((status) =>
  chapters.some((chapter) => chapter.status === status),
);

/** Lit (teal) → being hung (gold) → on the map (violet). */
export const chapterStatusTone: Record<ChapterStatus, SparkTone> = {
  active: "teal",
  forming: "gold",
  planned: "violet",
};

export function chapterStatusLabel(status: ChapterStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
