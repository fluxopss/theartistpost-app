/// <reference types="jest" />
import { isOpenNow } from "./open-status";

describe("isOpenNow", () => {
  it("is open just after 09:00 ET", () => {
    expect(isOpenNow(new Date("2026-09-27T13:29:00Z"))).toBe(true);
  });

  it("is open just before 21:30 ET", () => {
    expect(isOpenNow(new Date("2026-09-28T01:29:00Z"))).toBe(true);
  });

  it("is closed just after 21:30 ET", () => {
    expect(isOpenNow(new Date("2026-09-28T01:31:00Z"))).toBe(false);
  });

  it("is closed just before 09:00 ET", () => {
    expect(isOpenNow(new Date("2026-09-27T12:59:00Z"))).toBe(false);
  });
});
