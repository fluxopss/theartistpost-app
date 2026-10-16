/// <reference types="jest" />
import type { CheckInStateDTO, EventDTO } from "@/api/types";

import { checkedInMomentBody, checkInResultLine, checkInUi } from "./check-in";

const base = (over: Partial<CheckInStateDTO> = {}): CheckInStateDTO => ({
  checkIn: null,
  window: "open",
  opensAt: "2026-10-30T21:30:00.000Z",
  venueHasLocation: true,
  ...over,
});

const night = (over: Partial<EventDTO> = {}) =>
  ({ source: "db", cancelled: false, title: "Opening Night", ...over }) as EventDTO;

describe("checkInUi", () => {
  it("offers I’m here only while the window is open", () => {
    expect(checkInUi(night(), base()).kind).toBe("ready");
    expect(checkInUi(night(), base({ window: "before" })).kind).toBe("not-open");
    expect(checkInUi(night(), base({ window: "after" })).kind).toBe("closed");
  });

  it("is not offered for schedule-only or cancelled nights", () => {
    expect(checkInUi(night({ source: "content" }), base()).kind).toBe("unavailable");
    expect(checkInUi(night({ cancelled: true }), base()).kind).toBe("unavailable");
  });

  it("shows the finished state with or without location proof", () => {
    const done = checkInUi(
      night(),
      base({ checkIn: { checkedInAt: "2026-10-30T22:10:00.000Z", verified: true } }),
    );
    expect(done).toMatchObject({ kind: "done", verified: true });
    const manual = checkInUi(
      night(),
      base({ checkIn: { checkedInAt: "2026-10-30T22:10:00.000Z", verified: false } }),
    );
    expect(manual).toMatchObject({ kind: "done", verified: false });
  });

  it("stays done even after the window closes", () => {
    const ui = checkInUi(
      night(),
      base({ window: "after", checkIn: { checkedInAt: "2026-10-30T22:10:00.000Z", verified: false } }),
    );
    expect(ui.kind).toBe("done");
  });
});

describe("copy", () => {
  it("states plainly what was confirmed", () => {
    expect(checkInResultLine(true)).toBe("You’re checked in — confirmed at the house.");
    expect(checkInResultLine(false)).toBe("You’re checked in — not confirmed by location.");
  });

  it("writes a kind, short moment for the board", () => {
    expect(checkedInMomentBody("Opening Night")).toBe("Checked in at Opening Night. Glad to be here.");
    expect(checkedInMomentBody("x".repeat(600)).length).toBeLessThanOrEqual(500);
  });
});
