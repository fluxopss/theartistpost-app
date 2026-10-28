import { houseGenres } from "@/content/stage";

/**
 * Lanes a night is filed under: the house genres (Musicians, then Culinary
 * Artists, …) plus "community". Mirrors theartistpost `EVENT_MEDIUMS`
 * (src/server/api/eventAdmin.ts) and the web schedule's `LaneChips`.
 */

export type LaneOption = { id: string; label: string };

export const COMMUNITY_LANE: LaneOption = { id: "community", label: "Community" };

/** House genres in house order: Musicians first, Culinary Artists second. */
export const houseLanes: readonly LaneOption[] = houseGenres.map((genre) => ({ id: genre.id, label: genre.label }));

/**
 * What the event form offers, in the server's order: Community (the default
 * for a new night), then every house lane, Culinary right after Musicians.
 */
export const eventMediumOptions: readonly LaneOption[] = [COMMUNITY_LANE, ...houseLanes];

/** The schedule's filter chips: all nights, then each house lane. */
export const ALL_LANES = "all";
export const scheduleLaneOptions: readonly LaneOption[] = [{ id: ALL_LANES, label: "All nights" }, ...houseLanes];

function normalize(medium: string | null | undefined): string {
  return (medium ?? "").trim().toLowerCase();
}

/** True when `medium` is a lane a new night can be filed under. */
export function isEventMedium(medium: string | null | undefined): boolean {
  const id = normalize(medium);
  return eventMediumOptions.some((option) => option.id === id);
}

/** "Culinary Artists" for "culinary"; an unknown (older, free-text) medium reads as typed. */
export function mediumLabel(medium: string | null | undefined): string {
  const id = normalize(medium);
  return eventMediumOptions.find((option) => option.id === id)?.label ?? (medium ?? "").trim();
}

/** Nights in one lane, on the list already fetched. `all` (or null) keeps every night. */
export function nightsInLane<T extends { medium: string }>(events: readonly T[], lane: string | null): T[] {
  const id = normalize(lane);
  if (!id || id === ALL_LANES) return [...events];
  return events.filter((event) => normalize(event.medium) === id);
}
