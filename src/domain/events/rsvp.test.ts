/// <reference types="jest" />
import type { EventDTO, EventRsvpDTO, SeatSummaryDTO } from "@/api/types";

import { canRsvp, passFromRsvp, rsvpHeadline, seatSummaryLine } from "./rsvp";

const rsvp = (over: Partial<EventRsvpDTO> = {}): EventRsvpDTO => ({
  eventId: "evt_1",
  status: "GOING",
  party: 2,
  note: null,
  waitlisted: false,
  passCode: "TAP-AB12",
  updatedAt: "2026-10-20T12:00:00.000Z",
  ...over,
});

const summary = (over: Partial<SeatSummaryDTO> = {}): SeatSummaryDTO => ({
  capacity: 10,
  seatsTaken: 4,
  seatsLeft: 6,
  waitlisted: 0,
  ...over,
});

describe("rsvpHeadline", () => {
  it("speaks plainly for each answer", () => {
    expect(rsvpHeadline(rsvp())).toBe("You’re going · 2 seats");
    expect(rsvpHeadline(rsvp({ party: 1 }))).toBe("You’re going · 1 seat");
    expect(rsvpHeadline(rsvp({ waitlisted: true }))).toBe("You’re on the waitlist · 2 seats");
    expect(rsvpHeadline(rsvp({ status: "MAYBE" }))).toBe("You said maybe");
    expect(rsvpHeadline(rsvp({ status: "NOT_GOING" }))).toBe("You can’t make it");
    expect(rsvpHeadline(null)).toBeNull();
  });
});

describe("seatSummaryLine", () => {
  it("is silent for unlimited nights", () => {
    expect(seatSummaryLine(summary({ capacity: null, seatsLeft: null }))).toBeNull();
  });

  it("says how many seats are left, or that the night is full", () => {
    expect(seatSummaryLine(summary())).toBe("6 seats left");
    expect(seatSummaryLine(summary({ seatsLeft: 1 }))).toBe("1 seat left");
    expect(seatSummaryLine(summary({ seatsLeft: 0, seatsTaken: 10 }))).toBe(
      "Full — new answers join the waitlist",
    );
    expect(seatSummaryLine(summary({ seatsLeft: 0, waitlisted: 3 }))).toBe("Full — 3 people waiting");
  });
});

describe("passFromRsvp", () => {
  const holder = { name: "Mia Member", email: "mia@example.com" };

  it("builds the device pass only for a confirmed seat", () => {
    expect(passFromRsvp(rsvp(), holder, "2026-10-20T12:00:00.000Z")).toEqual({
      eventId: "evt_1",
      name: "Mia Member",
      email: "mia@example.com",
      party: 2,
      note: "",
      code: "TAP-AB12",
      delivered: true,
      savedAt: "2026-10-20T12:00:00.000Z",
    });
    expect(passFromRsvp(rsvp({ waitlisted: true }), holder, "t")).toBeNull();
    expect(passFromRsvp(rsvp({ status: "MAYBE" }), holder, "t")).toBeNull();
    expect(passFromRsvp(null, holder, "t")).toBeNull();
  });
});

describe("canRsvp", () => {
  const event = (over: Partial<EventDTO>) =>
    ({ source: "db", cancelled: false, status: "upcoming", ...over }) as Pick<
      EventDTO,
      "source" | "cancelled" | "status"
    >;

  it("only open managed nights take server RSVPs", () => {
    expect(canRsvp(event({}))).toBe(true);
    expect(canRsvp(event({ status: "live" }))).toBe(true);
    expect(canRsvp(event({ status: "closed" }))).toBe(false);
    expect(canRsvp(event({ cancelled: true }))).toBe(false);
    expect(canRsvp(event({ source: "content" }))).toBe(false);
  });
});
