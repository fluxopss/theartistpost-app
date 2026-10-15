/// <reference types="jest" />
import { resizeToFit } from "./resize";

describe("resizeToFit", () => {
  it("leaves images that already fit alone", () => {
    expect(resizeToFit(800, 600, 1600)).toBeNull();
    expect(resizeToFit(1600, 1600, 1600)).toBeNull();
  });

  it("caps the longer side and lets the other follow", () => {
    expect(resizeToFit(4000, 3000, 1600)).toEqual({ width: 1600 });
    expect(resizeToFit(3000, 4000, 1600)).toEqual({ height: 1600 });
  });

  it("treats a square as landscape", () => {
    expect(resizeToFit(2000, 2000, 1024)).toEqual({ width: 1024 });
  });

  it("ignores unusable sizes", () => {
    expect(resizeToFit(0, 0, 1600)).toBeNull();
    expect(resizeToFit(Number.NaN, 100, 1600)).toBeNull();
  });
});
