/// <reference types="jest" />
import { isOpenNight, openNights, savedNightNotice, upcomingLabel } from "./visibility";

const NOW = new Date("2026-10-30T20:00:00.000Z"); // Fri 4:00 PM Eastern

const night = (over: Partial<{ id: string; start: string; end: string; cancelled: boolean; status: "upcoming" | "live" | "closed" }> = {}) => ({
  id: "n1",
  start: "2026-10-30T22:00:00.000Z",
  end: "2026-10-31T02:00:00.000Z",
  cancelled: false,
  status: "upcoming" as const,
  ...over,
});

describe("isOpenNight", () => {
  it("keeps upcoming and live nights", () => {
    expect(isOpenNight(night(), NOW)).toBe(true);
    expect(isOpenNight(night({ start: "2026-10-30T19:00:00.000Z", status: "live" }), NOW)).toBe(true);
  });

  it("drops cancelled nights even when their date is ahead", () => {
    expect(isOpenNight(night({ cancelled: true }), NOW)).toBe(false);
    expect(isOpenNight(night({ status: "closed" }), NOW)).toBe(false);
  });

  it("drops nights that have ended, even if a cached status still says upcoming", () => {
    expect(
      isOpenNight(night({ start: "2026-10-29T22:00:00.000Z", end: "2026-10-30T02:00:00.000Z" }), NOW),
    ).toBe(false);
  });

  it("drops unreadable dates", () => {
    expect(isOpenNight(night({ start: "nope" }), NOW)).toBe(false);
  });
});

describe("openNights", () => {
  it("filters and sorts soonest first without mutating the input", () => {
    const later = night({ id: "later", start: "2026-11-06T22:00:00.000Z", end: "2026-11-07T02:00:00.000Z" });
    const soon = night({ id: "soon" });
    const gone = night({ id: "gone", cancelled: true });
    const input = [later, gone, soon];
    expect(openNights(input, NOW).map((e) => e.id)).toEqual(["soon", "later"]);
    expect(input.map((e) => e.id)).toEqual(["later", "gone", "soon"]);
  });
});

describe("savedNightNotice", () => {
  const saved = { id: "n1", start: "2026-10-30T22:00:00.000Z" };

  it("is null for a saved night still ahead", () => {
    expect(savedNightNotice(saved, undefined, NOW)).toBeNull();
    expect(savedNightNotice(saved, night(), NOW)).toBeNull();
  });

  it("says Cancelled when the board marks it cancelled", () => {
    expect(savedNightNotice(saved, night({ cancelled: true }), NOW)).toBe("Cancelled");
  });

  it("says Date passed once the live night has ended", () => {
    const after = new Date("2026-10-31T03:00:00.000Z");
    expect(savedNightNotice(saved, night(), after)).toBe("Date passed");
  });

  it("without the board, the date passes once its Eastern day is over", () => {
    // Still Friday night in Eastern time (11:30 PM): not passed yet.
    expect(savedNightNotice(saved, undefined, new Date("2026-10-31T03:30:00.000Z"))).toBeNull();
    // Saturday in Eastern time.
    expect(savedNightNotice(saved, undefined, new Date("2026-10-31T05:00:00.000Z"))).toBe("Date passed");
  });

  it("uses a stored end when the save has one", () => {
    const withEnd = { ...saved, end: "2026-10-31T02:00:00.000Z" };
    expect(savedNightNotice(withEnd, undefined, new Date("2026-10-31T02:30:00.000Z"))).toBe("Date passed");
  });

  it("an unreadable stored date is left alone rather than guessed", () => {
    expect(savedNightNotice({ start: "bad" }, undefined, NOW)).toBeNull();
  });
});

describe("upcomingLabel", () => {
  it("never calls a cancelled night live or on the board", () => {
    expect(upcomingLabel({ ...night({ cancelled: true }), comingSoon: false }, NOW)).toBe("Cancelled");
    const tonight = { ...night({ start: "2026-10-30T19:00:00.000Z", cancelled: true }), comingSoon: false };
    expect(upcomingLabel(tonight, NOW)).toBe("Cancelled");
  });

  it("falls through to the schedule label otherwise", () => {
    expect(upcomingLabel({ ...night(), comingSoon: false }, NOW)).toBe("On the board");
    expect(upcomingLabel({ ...night({ start: "2026-10-30T19:00:00.000Z" }), comingSoon: false }, NOW)).toBe("Tonight");
  });
});
