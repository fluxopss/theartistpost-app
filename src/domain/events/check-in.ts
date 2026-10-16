import type { CheckInStateDTO, EventDTO } from "@/api/types";

export type CheckInUi =
  | { kind: "unavailable" }
  | { kind: "not-open"; opensAt: string }
  | { kind: "ready"; venueHasLocation: boolean }
  | { kind: "closed" }
  | { kind: "done"; verified: boolean; checkedInAt: string };

/** What the check-in card should show, from the event and the server's state. */
export function checkInUi(
  event: Pick<EventDTO, "source" | "cancelled">,
  state: CheckInStateDTO | null | undefined,
): CheckInUi {
  if (event.source !== "db" || event.cancelled || !state) return { kind: "unavailable" };
  if (state.checkIn) {
    return { kind: "done", verified: state.checkIn.verified, checkedInAt: state.checkIn.checkedInAt };
  }
  switch (state.window) {
    case "before":
      return { kind: "not-open", opensAt: state.opensAt };
    case "open":
      return { kind: "ready", venueHasLocation: state.venueHasLocation };
    default:
      return { kind: "closed" };
  }
}

export function checkInResultLine(verified: boolean): string {
  return verified
    ? "You’re checked in — confirmed at the house."
    : "You’re checked in — not confirmed by location.";
}

const COMMUNITY_BODY_MAX = 500;

/** The optional "Checked in at …" moment people can post to the board. */
export function checkedInMomentBody(title: string): string {
  const tail = ". Glad to be here.";
  const lead = "Checked in at ";
  const room = COMMUNITY_BODY_MAX - lead.length - tail.length;
  const name = title.trim().length > room ? `${title.trim().slice(0, room - 1)}…` : title.trim();
  return `${lead}${name}${tail}`;
}
