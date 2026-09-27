import type { GenreId } from "@/components/genre-rail";

/**
 * The post tag each TAP lane opens in "Artists' work". Lanes are the 2016
 * genres; tags are what artists put on their own work. A lane whose tag the
 * house doesn't use yet comes back empty and says so — it never borrows
 * another lane's work.
 */
export const laneTag: Record<GenreId, string> = {
  music: "music",
  photo: "photography",
  dance: "dance",
  film: "film",
  stage: "theater",
  laugh: "comedy",
  frame: "modeling",
};
