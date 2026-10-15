/// <reference types="jest" />
import { identityChanged } from "./identity";

describe("identityChanged", () => {
  it("is false until an identity has been resolved once (cold start keeps the offline cache)", () => {
    expect(identityChanged(undefined, "user_a")).toBe(false);
    expect(identityChanged(undefined, null)).toBe(false);
  });

  it("is false when the same person is still signed in (or still a guest)", () => {
    expect(identityChanged("user_a", "user_a")).toBe(false);
    expect(identityChanged(null, null)).toBe(false);
  });

  it("is true on sign-out and on switching to a different account", () => {
    expect(identityChanged("user_a", null)).toBe(true);
    expect(identityChanged("user_a", "user_b")).toBe(true);
    expect(identityChanged(null, "user_b")).toBe(true);
  });
});
