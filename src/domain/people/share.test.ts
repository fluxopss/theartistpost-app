/// <reference types="jest" />
import { eventPageUrl, postPageUrl, profileShareMessage, profileShareUrl, siteOrigin, siteUrl } from "./share";

const prev = process.env.EXPO_PUBLIC_SITE_URL;
const prevApi = process.env.EXPO_PUBLIC_API_URL;
afterEach(() => {
  if (prev === undefined) delete process.env.EXPO_PUBLIC_SITE_URL;
  else process.env.EXPO_PUBLIC_SITE_URL = prev;
  if (prevApi === undefined) delete process.env.EXPO_PUBLIC_API_URL;
  else process.env.EXPO_PUBLIC_API_URL = prevApi;
});

describe("profile sharing", () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
  });

  it("builds the public profile link on theartistpost.org, whatever API the app talks to", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://theartistpost.fluxlab.agency";
    expect(profileShareUrl("robbi")).toBe("https://theartistpost.org/u/robbi");
    expect(profileShareUrl("Jo_E-1")).toBe("https://theartistpost.org/u/jo_e-1");
  });

  it("writes a short share message with the link", () => {
    expect(profileShareMessage("Robbi", "robbi")).toBe("Robbi on The Artist Post: https://theartistpost.org/u/robbi");
  });
});

describe("web page links", () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
  });

  it("points events and posts at the website, encoded", () => {
    expect(eventPageUrl("opening-night")).toBe("https://theartistpost.org/event/opening-night");
    expect(postPageUrl("a b")).toBe("https://theartistpost.org/post/a%20b");
  });

  it("joins paths with or without a leading slash", () => {
    expect(siteUrl("/privacy")).toBe("https://theartistpost.org/privacy");
    expect(siteUrl("terms")).toBe("https://theartistpost.org/terms");
  });
});

describe("site origin override", () => {
  it("defaults to theartistpost.org when unset", () => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
    expect(siteOrigin()).toBe("https://theartistpost.org");
  });

  it("uses EXPO_PUBLIC_SITE_URL when it is a clean https origin", () => {
    process.env.EXPO_PUBLIC_SITE_URL = "https://staging.theartistpost.org/";
    expect(profileShareUrl("Robbi")).toBe("https://staging.theartistpost.org/u/robbi");
    expect(eventPageUrl("x")).toBe("https://staging.theartistpost.org/event/x");
  });

  it("ignores a malformed value and keeps the default", () => {
    process.env.EXPO_PUBLIC_SITE_URL = "javascript:alert(1)";
    expect(profileShareUrl("robbi")).toBe("https://theartistpost.org/u/robbi");
    process.env.EXPO_PUBLIC_SITE_URL = "http://theartistpost.org";
    expect(siteOrigin()).toBe("https://theartistpost.org");
  });
});
