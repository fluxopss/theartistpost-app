/// <reference types="jest" />
import { compareVersions, mustUpdate, parseVersion } from "./version";

describe("parseVersion", () => {
  it("reads major.minor.patch and fills missing parts with zero", () => {
    expect(parseVersion("1.2.3")).toEqual([1, 2, 3]);
    expect(parseVersion("2")).toEqual([2, 0, 0]);
    expect(parseVersion(" 1.4 ")).toEqual([1, 4, 0]);
    expect(parseVersion("v1.0.1")).toEqual([1, 0, 1]);
  });

  it("ignores pre-release and build tags", () => {
    expect(parseVersion("1.2.3-beta.1")).toEqual([1, 2, 3]);
    expect(parseVersion("1.2.3+45")).toEqual([1, 2, 3]);
  });

  it("returns null for anything unreadable", () => {
    expect(parseVersion("")).toBeNull();
    expect(parseVersion(undefined)).toBeNull();
    expect(parseVersion("one.two")).toBeNull();
    expect(parseVersion("1..2")).toBeNull();
  });
});

describe("compareVersions", () => {
  it("compares numerically, not as text", () => {
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("0.9.9", "1.0.0")).toBe(-1);
    expect(compareVersions("2.0.0", "10.0.0")).toBe(-1);
  });

  it("returns null when either side is unreadable", () => {
    expect(compareVersions("abc", "1.0.0")).toBeNull();
  });
});

describe("mustUpdate", () => {
  it("blocks only when the running version is below the minimum", () => {
    expect(mustUpdate("1.0.0", "1.0.1")).toBe(true);
    expect(mustUpdate("1.0.0", "1.0.0")).toBe(false);
    expect(mustUpdate("1.2.0", "1.1.9")).toBe(false);
  });

  it("fails open when either version is missing or unreadable", () => {
    expect(mustUpdate(undefined, "9.0.0")).toBe(false);
    expect(mustUpdate("1.0.0", undefined)).toBe(false);
    expect(mustUpdate("1.0.0", "soon")).toBe(false);
    expect(mustUpdate("dev", "1.0.0")).toBe(false);
  });
});
