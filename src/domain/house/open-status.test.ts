/// <reference types="jest" />
import { site } from "@/content/site";
import { formatMinutes, isOpenAt, weeklyLabel, type WeeklyHours } from "./hours";
import { isOpenNow, todayHours } from "./open-status";

/** Eastern wall-clock → Date. Oct 2026 is EDT (UTC-4); Dec is EST (UTC-5). */
const edt = (iso: string) => new Date(`${iso}-04:00`);
const est = (iso: string) => new Date(`${iso}-05:00`);

// Oct 2026: Thu 22, Fri 23, Sat 24, Sun 25.
describe("Hacienda hours (official, Oct 2026)", () => {
  it("opens at 11 AM every day", () => {
    expect(isOpenNow(edt("2026-10-22T10:59"))).toBe(false);
    expect(isOpenNow(edt("2026-10-22T11:00"))).toBe(true);
    expect(isOpenNow(edt("2026-10-25T11:00"))).toBe(true);
  });

  it("closes at 11 PM Sunday through Thursday", () => {
    expect(isOpenNow(edt("2026-10-22T22:59"))).toBe(true);
    expect(isOpenNow(edt("2026-10-22T23:00"))).toBe(false);
    expect(isOpenNow(edt("2026-10-25T23:30"))).toBe(false);
  });

  it("stays open until midnight Friday and Saturday", () => {
    expect(isOpenNow(edt("2026-10-23T23:30"))).toBe(true);
    expect(isOpenNow(edt("2026-10-24T23:59"))).toBe(true);
    expect(isOpenNow(edt("2026-10-25T00:00"))).toBe(false);
  });

  it("follows Eastern time after the DST change", () => {
    expect(isOpenNow(est("2026-12-04T23:30"))).toBe(true);
    expect(isOpenNow(est("2026-12-03T23:30"))).toBe(false);
  });

  it("labels the week and today", () => {
    expect(site.hours.label).toBe("Sun–Thu 11 AM – 11 PM · Fri–Sat 11 AM – Midnight");
    expect(todayHours(edt("2026-10-22T12:00"))).toBe("11 AM – 11 PM");
    expect(todayHours(edt("2026-10-23T12:00"))).toBe("11 AM – Midnight");
  });
});

describe("weekly hours math", () => {
  const lateFriday: WeeklyHours = {
    timeZone: "America/New_York",
    weekly: [{ day: 5, openMinutes: 18 * 60, closeMinutes: 25 * 60 }],
  };

  it("carries a past-midnight close into the next morning", () => {
    expect(isOpenAt(lateFriday, edt("2026-10-24T00:30"))).toBe(true);
    expect(isOpenAt(lateFriday, edt("2026-10-24T01:00"))).toBe(false);
  });

  it("treats a missing day as closed and formats words", () => {
    expect(isOpenAt(lateFriday, edt("2026-10-20T19:00"))).toBe(false);
    expect(weeklyLabel(lateFriday)).toBe("Sun–Thu Closed · Fri 6 PM – 1 AM · Sat Closed");
    expect(formatMinutes(720)).toBe("Noon");
  });
});
