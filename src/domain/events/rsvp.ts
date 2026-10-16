import type { EventDTO, EventRsvpDTO, SeatSummaryDTO } from "@/api/types";
import type { NightPass } from "@/domain/night/pass-types";

const seats = (n: number) => (n === 1 ? "1 seat" : `${n} seats`);

/** The one-line answer a person reads back about their own RSVP. */
export function rsvpHeadline(rsvp: EventRsvpDTO | null | undefined): string | null {
  if (!rsvp) return null;
  switch (rsvp.status) {
    case "GOING":
      return rsvp.waitlisted
        ? `You’re on the waitlist · ${seats(rsvp.party)}`
        : `You’re going · ${seats(rsvp.party)}`;
    case "MAYBE":
      return "You said maybe";
    case "NOT_GOING":
      return "You can’t make it";
    default:
      return null;
  }
}

/** How full the night is. Null when there is no seat limit to talk about. */
export function seatSummaryLine(summary: SeatSummaryDTO | null | undefined): string | null {
  if (!summary || summary.capacity === null || summary.seatsLeft === null) return null;
  if (summary.seatsLeft > 0) return `${seats(summary.seatsLeft)} left`;
  return summary.waitlisted > 0
    ? `Full — ${summary.waitlisted} ${summary.waitlisted === 1 ? "person" : "people"} waiting`
    : "Full — new answers join the waitlist";
}

/**
 * The pass kept on the phone is backed by the server record: it exists only
 * for a confirmed seat, and its code comes from the server.
 */
export function passFromRsvp(
  rsvp: EventRsvpDTO | null | undefined,
  holder: { name: string; email: string },
  savedAt: string,
): NightPass | null {
  if (!rsvp || rsvp.status !== "GOING" || rsvp.waitlisted) return null;
  return {
    eventId: rsvp.eventId,
    name: holder.name,
    email: holder.email,
    party: rsvp.party,
    note: rsvp.note ?? "",
    code: rsvp.passCode,
    delivered: true,
    savedAt,
  };
}

/** Server RSVPs exist only for managed nights that are still open. */
export function canRsvp(event: Pick<EventDTO, "source" | "cancelled" | "status">): boolean {
  return event.source === "db" && !event.cancelled && event.status !== "closed";
}
