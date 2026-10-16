/// <reference types="jest" />
import { handleAlternatives, suggestHandle, validateHandle } from "./handle";

describe("handleAlternatives", () => {
  it("offers three distinct, valid handles that differ from the taken one", () => {
    const options = handleAlternatives("vera_viewer");
    expect(options).toHaveLength(3);
    expect(new Set(options).size).toBe(3);
    for (const option of options) {
      expect(option).not.toBe("vera_viewer");
      expect(validateHandle(option).ok).toBe(true);
    }
  });

  it("stays within 40 characters even when the taken handle is already 40", () => {
    for (const option of handleAlternatives("a".repeat(40))) {
      expect(option.length).toBeLessThanOrEqual(40);
      expect(validateHandle(option).ok).toBe(true);
    }
  });

  it("offers nothing for an unusable handle", () => {
    expect(handleAlternatives("!!")).toEqual([]);
  });
});

describe("suggestHandle", () => {
  it("turns a name into a valid handle", () => {
    expect(suggestHandle("Vera Viewer")).toBe("vera_viewer");
    expect(suggestHandle("  José O'Neil-Smith ")).toBe("jose_oneil-smith");
  });

  it("returns an empty string when nothing usable is left or the result is reserved/short", () => {
    expect(suggestHandle("!!")).toBe("");
    expect(suggestHandle("Admin")).toBe("");
    expect(suggestHandle("A")).toBe("");
  });

  it("caps at 40 characters", () => {
    expect(suggestHandle("a".repeat(60))).toHaveLength(40);
  });
});
