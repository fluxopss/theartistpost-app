/// <reference types="jest" />
import { isSessionExpiry } from "./session-expiry";

const base = {
  status: 401,
  path: "/me",
  sentToken: "tok-1",
  currentToken: "tok-1" as string | null,
  alreadyHandledToken: null as string | null,
};

describe("isSessionExpiry", () => {
  it("treats a 401 on a signed-in request as an expired session", () => {
    expect(isSessionExpiry(base)).toBe(true);
    expect(isSessionExpiry({ ...base, path: "/posts/a/comments?x=1" })).toBe(true);
  });

  it("ignores anything that is not a 401", () => {
    expect(isSessionExpiry({ ...base, status: 403 })).toBe(false);
    expect(isSessionExpiry({ ...base, status: 500 })).toBe(false);
  });

  it("ignores anonymous requests, so public endpoints never loop", () => {
    expect(isSessionExpiry({ ...base, sentToken: null })).toBe(false);
  });

  it("leaves the sign-in doors to their own error handling", () => {
    for (const path of ["/auth/me", "/auth/verify", "/auth/link", "/auth/refresh", "/auth/logout", "/auth/join"]) {
      expect(isSessionExpiry({ ...base, path })).toBe(false);
    }
  });

  it("ignores a stale request from a token that is no longer current", () => {
    expect(isSessionExpiry({ ...base, currentToken: null })).toBe(false);
    expect(isSessionExpiry({ ...base, currentToken: "tok-2" })).toBe(false);
  });

  it("handles each expired token once, however many requests fail together", () => {
    expect(isSessionExpiry({ ...base, alreadyHandledToken: "tok-1" })).toBe(false);
    expect(isSessionExpiry({ ...base, alreadyHandledToken: "tok-0" })).toBe(true);
  });
});
