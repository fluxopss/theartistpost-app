import { nightPhase, scheduleLabel } from "./program";

/**
 * Which nights may read as live. The server sends cancelled nights (so a
 * saved or RSVP'd one can say so) and the list can be a minute stale, so the
 * app decides from both the flags and the clock.
 */
type BoardNight = {
  start: string;
  end: string;
  cancelled?: boolean;
  status?: "upcoming" | "live" | "closed";
};

const NY = "America/New_York";

/** A night people can still walk into: not cancelled, not closed, not ended. */
export function isOpenNight(event: BoardNight, now = new Date()): boolean {
  if (event.cancelled) return false;
  if (event.status === "closed") return false;
  return nightPhase(event, now) !== "closed";
}

/** The row label: a cancelled night always says so, never "On the board" or "Tonight". */
export function upcomingLabel(event: BoardNight & { comingSoon: boolean }, now = new Date()): string {
  if (event.cancelled) return "Cancelled";
  return scheduleLabel(event, now);
}

/** Open nights only, soonest first. Never mutates the input. */
export function openNights<T extends BoardNight>(events: readonly T[], now = new Date()): T[] {
  return events
    .filter((event) => isOpenNight(event, now))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/** yyyy-mm-dd for an instant, in Eastern time. */
function easternDay(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: NY, year: "numeric", month: "2-digit", day: "2-digit" });
}

export type SavedNightNotice = "Cancelled" | "Date passed";

/**
 * What a saved night should say when it can no longer be attended, or null
 * while it is still ahead. `live` is the night from the board when the app has
 * it; without it, the stored end (or, for older saves, the end of the night's
 * Eastern day) decides. An unreadable stored date is left alone, not guessed.
 */
export function savedNightNotice(
  saved: { start: string; end?: string },
  live: BoardNight | undefined,
  now = new Date(),
): SavedNightNotice | null {
  if (live) {
    if (live.cancelled) return "Cancelled";
    return nightPhase(live, now) === "closed" ? "Date passed" : null;
  }
  const start = new Date(saved.start);
  if (Number.isNaN(start.getTime())) return null;
  if (saved.end) {
    const end = new Date(saved.end).getTime();
    if (!Number.isNaN(end)) return now.getTime() > end ? "Date passed" : null;
  }
  return easternDay(now) > easternDay(start) ? "Date passed" : null;
}
