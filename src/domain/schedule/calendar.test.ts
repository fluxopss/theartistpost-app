/// <reference types="jest" />
import { easternDayKey, eventToIcs, eventsByEasternDay, monthMatrix } from "./calendar";
import type { ContentEvent } from "@/domain/content/types";

describe("easternDayKey", () => {
  it("keys a midday Eastern instant to that calendar day", () => {
    expect(easternDayKey("2026-09-05T12:00:00-04:00")).toBe("2026-09-05");
  });

  it("keys a late-evening Eastern instant to the same day, not the next UTC day", () => {
    expect(easternDayKey("2026-09-12T23:30:00-04:00")).toBe("2026-09-12");
  });
});

describe("eventsByEasternDay", () => {
  it("groups events under their Eastern calendar day", () => {
    const events = [
      { start: "2026-09-05T12:00:00-04:00" },
      { start: "2026-09-05T20:00:00-04:00" },
      { start: "2026-09-12T23:30:00-04:00" },
    ];
    const map = eventsByEasternDay(events);
    expect(map.get("2026-09-05")).toHaveLength(2);
    expect(map.get("2026-09-12")).toHaveLength(1);
    expect(map.has("2026-09-13")).toBe(false);
  });
});

describe("monthMatrix", () => {
  it("builds a 6-row, Sunday-first grid for September 2026", () => {
    const weeks = monthMatrix(2026, 8);
    expect(weeks).toHaveLength(6);
    weeks.forEach((week) => expect(week).toHaveLength(7));

    // Sep 1, 2026 is a Tuesday, so the first row is Sun/Mon (Aug 30/31, out
    // of month) then Tue Sep 1 (in month).
    expect(weeks[0]![0]).toEqual({ key: "2026-08-30", day: 30, inMonth: false });
    expect(weeks[0]![1]).toEqual({ key: "2026-08-31", day: 31, inMonth: false });
    expect(weeks[0]![2]).toEqual({ key: "2026-09-01", day: 1, inMonth: true });

    const lastCell = weeks[5]![6]!;
    expect(lastCell.inMonth).toBe(false);
    expect(lastCell.key.startsWith("2026-10-")).toBe(true);

    const inMonthCount = weeks.flat().filter((c) => c.inMonth).length;
    expect(inMonthCount).toBe(30);
  });
});

describe("eventToIcs", () => {
  it("emits a single escaped newline in DESCRIPTION, not a literal backslash-n", () => {
    const event: ContentEvent = {
      id: "night-1",
      title: "Test Night",
      artist: "TBD",
      medium: "music",
      start: "2026-09-05T20:00:00-04:00",
      end: "2026-09-05T23:00:00-04:00",
      venue: "Hacienda",
      description: "A night at Hacienda.",
    };
    const ics = eventToIcs(event);
    const descriptionLine = ics
      .split("\r\n")
      .find((line) => line.startsWith("DESCRIPTION:"));
    expect(descriptionLine).toBe(
      "DESCRIPTION:A night at Hacienda.\\nArtist: TBD",
    );
    // A double backslash before the "n" would mean the calendar app sees a
    // literal backslash-n instead of a line break — guard against that bug.
    expect(descriptionLine).not.toContain("\\\\n");
  });
});
