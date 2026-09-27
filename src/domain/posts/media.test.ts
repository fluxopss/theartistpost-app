/// <reference types="jest" />
import { mediaKindLabel, mediaPresentation } from "./media";

describe("mediaKindLabel", () => {
  it("names the three TAP media", () => {
    expect(mediaKindLabel("IMAGE")).toBe("Photograph");
    expect(mediaKindLabel("VIDEO")).toBe("Video");
    expect(mediaKindLabel("EMBED")).toBe("Sound");
  });

  it("falls back to Work for anything else", () => {
    expect(mediaKindLabel("CANVAS")).toBe("Work");
    expect(mediaKindLabel("SOMETHING")).toBe("Work");
  });
});

describe("mediaPresentation", () => {
  it("shows photographs and videos in place", () => {
    expect(mediaPresentation({ type: "IMAGE", url: "https://x.test/a.webp" })).toBe("image");
    expect(mediaPresentation({ type: "VIDEO", url: "https://x.test/a.mp4" })).toBe("video");
  });

  it("sends sound and canvas to the web", () => {
    expect(mediaPresentation({ type: "EMBED", url: "https://x.test/a.mp3" })).toBe("web");
    expect(mediaPresentation({ type: "CANVAS", url: "https://x.test/c" })).toBe("web");
  });

  it("never pretends to show media that is missing", () => {
    expect(mediaPresentation({ type: "IMAGE", url: null })).toBe("web");
    expect(mediaPresentation({ type: "VIDEO", url: "  " })).toBe("web");
  });
});
