/// <reference types="jest" />
import { needsWelcome, welcomeSteps, type WelcomeProfile } from "./welcome";

const complete: WelcomeProfile = {
  handle: "robbi",
  termsAcceptedAt: "2026-10-14T12:00:00.000Z",
  topics: [{ slug: "music" }],
  image: "https://theartistpost.fluxlab.agency/uploads/a.jpg",
};

describe("welcomeSteps", () => {
  it("needs every step for a brand-new member", () => {
    expect(welcomeSteps({ handle: null, termsAcceptedAt: null, topics: [], image: null })).toEqual([
      "guidelines",
      "handle",
      "topics",
      "photo",
    ]);
  });

  it("skips what is already done", () => {
    expect(welcomeSteps(complete)).toEqual([]);
    expect(welcomeSteps({ ...complete, termsAcceptedAt: null })).toEqual(["guidelines"]);
    expect(welcomeSteps({ ...complete, handle: null })).toEqual(["handle"]);
    expect(welcomeSteps({ ...complete, topics: [] })).toEqual(["topics"]);
    expect(welcomeSteps({ ...complete, image: null })).toEqual(["photo"]);
  });

  it("does not ask an artist (who already has a handle) to pick one", () => {
    expect(
      welcomeSteps({ handle: "realpainter", termsAcceptedAt: null, topics: [], image: null }),
    ).toEqual(["guidelines", "topics", "photo"]);
  });
});

describe("needsWelcome", () => {
  it("is true while the handle or the Guidelines are missing (the posting gate)", () => {
    expect(needsWelcome({ ...complete, handle: null })).toBe(true);
    expect(needsWelcome({ ...complete, termsAcceptedAt: null })).toBe(true);
  });

  it("is false once the gate is open, even if topics and photo are still empty", () => {
    expect(needsWelcome({ ...complete, topics: [], image: null })).toBe(false);
    expect(needsWelcome(complete)).toBe(false);
  });
});
