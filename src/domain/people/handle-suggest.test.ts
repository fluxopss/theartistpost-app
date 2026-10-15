/// <reference types="jest" />
import { suggestHandle } from "./handle";

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
