/// <reference types="jest" />
import { isSelfHandle, resolveSelfHandle } from "./self-handle";

describe("resolveSelfHandle", () => {
  it("prefers the server profile, which is current right after onboarding", () => {
    expect(resolveSelfHandle({ authHandle: null, artistHandle: null, profileHandle: "qa_rx_one" })).toBe(
      "qa_rx_one",
    );
    expect(resolveSelfHandle({ authHandle: "old", artistHandle: null, profileHandle: "new" })).toBe("new");
  });

  it("falls back to the session handle, then the artist handle", () => {
    expect(resolveSelfHandle({ authHandle: "sess", artistHandle: "art", profileHandle: null })).toBe("sess");
    expect(resolveSelfHandle({ authHandle: null, artistHandle: "art", profileHandle: null })).toBe("art");
  });

  it("is null when nothing is known", () => {
    expect(resolveSelfHandle({})).toBeNull();
    expect(resolveSelfHandle({ authHandle: "", profileHandle: "" })).toBeNull();
  });
});

describe("isSelfHandle", () => {
  it("matches the viewer's own handle", () => {
    expect(isSelfHandle("qa_rx_one", "qa_rx_one")).toBe(true);
  });

  it("is false for other people, empty handles and signed-out viewers", () => {
    expect(isSelfHandle("someone", "qa_rx_one")).toBe(false);
    expect(isSelfHandle("", "")).toBe(false);
    expect(isSelfHandle("qa_rx_one", null)).toBe(false);
    expect(isSelfHandle(null, "qa_rx_one")).toBe(false);
  });
});
