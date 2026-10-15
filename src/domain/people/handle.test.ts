/// <reference types="jest" />
import { validateHandle } from "./handle";

describe("validateHandle", () => {
  it("accepts a clean handle and lowercases it", () => {
    expect(validateHandle("Robbie_Art")).toEqual({ ok: true, handle: "robbie_art" });
  });

  it("trims surrounding whitespace", () => {
    expect(validateHandle("  ada-lovelace  ")).toEqual({ ok: true, handle: "ada-lovelace" });
  });

  it("accepts the length bounds of 2 and 40", () => {
    expect(validateHandle("ab")).toEqual({ ok: true, handle: "ab" });
    const forty = "a".repeat(40);
    expect(validateHandle(forty)).toEqual({ ok: true, handle: forty });
  });

  it("rejects fewer than 2 characters", () => {
    const result = validateHandle("a");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/at least 2/i);
  });

  it("rejects more than 40 characters", () => {
    const result = validateHandle("a".repeat(41));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/40/);
  });

  it("rejects characters outside letters, numbers, _ and -", () => {
    for (const bad of ["ada lovelace", "ada.art", "ada@x", "ada!", "ädä"]) {
      const result = validateHandle(bad);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.message).toMatch(/letters, numbers/i);
    }
  });

  it("rejects reserved handles case-insensitively", () => {
    for (const reserved of ["admin", "ADMIN", "theartistpost", "tap", "support", "studioguest", "api", "settings", "me"]) {
      const result = validateHandle(reserved);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.message).toMatch(/reserved/i);
    }
  });

  it("rejects the one-letter reserved handle u as too short", () => {
    expect(validateHandle("u").ok).toBe(false);
  });

  it("does not reject handles that merely contain a reserved word", () => {
    expect(validateHandle("adminart")).toEqual({ ok: true, handle: "adminart" });
  });

  it("rejects an empty handle", () => {
    expect(validateHandle("   ").ok).toBe(false);
  });
});
