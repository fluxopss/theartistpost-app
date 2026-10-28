/// <reference types="jest" />
import { storeUrl } from "./store-link";

describe("storeUrl", () => {
  it("sends iPhone people to the App Store listing", () => {
    expect(storeUrl("ios", null)).toBe("https://apps.apple.com/app/id6823238247");
  });

  it("sends Android people to the Play listing for this package", () => {
    expect(storeUrl("android", "agency.fluxlab.theartistpost.dev")).toBe(
      "https://play.google.com/store/apps/details?id=agency.fluxlab.theartistpost.dev",
    );
  });

  it("has no store for web or an unknown package", () => {
    expect(storeUrl("web", "x")).toBeNull();
    expect(storeUrl("android", undefined)).toBeNull();
  });
});
