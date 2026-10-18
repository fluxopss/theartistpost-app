/// <reference types="jest" />
import { profileShareMessage, profileShareUrl } from "./share";

describe("profile sharing", () => {
  it("builds the public profile link on the live site, whatever API the app talks to", () => {
    expect(profileShareUrl("robbi")).toBe("https://theartistpost.fluxlab.agency/u/robbi");
    expect(profileShareUrl("Jo_E-1")).toBe("https://theartistpost.fluxlab.agency/u/jo_e-1");
  });

  it("writes a short share message with the link", () => {
    expect(profileShareMessage("Robbi", "robbi")).toBe(
      "Robbi on The Artist Post: https://theartistpost.fluxlab.agency/u/robbi",
    );
  });
});

describe("share origin override", () => {
  const prev = process.env.EXPO_PUBLIC_SITE_URL;
  afterEach(() => {
    if (prev === undefined) delete process.env.EXPO_PUBLIC_SITE_URL;
    else process.env.EXPO_PUBLIC_SITE_URL = prev;
  });

  it("uses EXPO_PUBLIC_SITE_URL when it is a clean https origin", () => {
    process.env.EXPO_PUBLIC_SITE_URL = "https://theartistpost.org/";
    expect(profileShareUrl("Robbi")).toBe("https://theartistpost.org/u/robbi");
  });

  it("ignores a malformed value and keeps the default", () => {
    process.env.EXPO_PUBLIC_SITE_URL = "javascript:alert(1)";
    expect(profileShareUrl("robbi")).toBe("https://theartistpost.fluxlab.agency/u/robbi");
  });
});
