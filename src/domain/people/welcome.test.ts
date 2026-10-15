/// <reference types="jest" />
import { needsWelcome, welcomeProgress, welcomeSteps, type WelcomeProfile } from "./welcome";

const complete: WelcomeProfile = {
  handle: "robbi",
  termsAcceptedAt: "2026-10-14T12:00:00.000Z",
  topics: [{ slug: "music" }],
  image: "https://theartistpost.fluxlab.agency/uploads/a.jpg",
};

describe("welcomeSteps", () => {
  it("is three steps for a brand-new member: Guidelines, profile (name, handle, photo), topics", () => {
    expect(welcomeSteps({ handle: null, termsAcceptedAt: null, topics: [], image: null })).toEqual([
      "guidelines",
      "profile",
      "topics",
    ]);
  });

  it("skips what is already done", () => {
    expect(welcomeSteps(complete)).toEqual([]);
    expect(welcomeSteps({ ...complete, termsAcceptedAt: null })).toEqual(["guidelines"]);
    expect(welcomeSteps({ ...complete, handle: null })).toEqual(["profile"]);
    expect(welcomeSteps({ ...complete, topics: [] })).toEqual(["topics"]);
    expect(welcomeSteps({ ...complete, image: null })).toEqual(["profile"]);
  });

  it("still offers an artist (who already has a handle) the photo on the profile step", () => {
    expect(
      welcomeSteps({ handle: "realpainter", termsAcceptedAt: null, topics: [], image: null }),
    ).toEqual(["guidelines", "profile", "topics"]);
  });
});

describe("welcomeProgress", () => {
  it("reports the step number and how much of the bar is filled", () => {
    expect(welcomeProgress(0, 3)).toEqual({ current: 1, total: 3, fraction: 1 / 3 });
    expect(welcomeProgress(2, 3)).toEqual({ current: 3, total: 3, fraction: 1 });
  });

  it("never reports an empty or overfull bar", () => {
    expect(welcomeProgress(0, 0)).toEqual({ current: 1, total: 1, fraction: 1 });
    expect(welcomeProgress(7, 3)).toEqual({ current: 3, total: 3, fraction: 1 });
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
