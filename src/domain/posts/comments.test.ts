/// <reference types="jest" />
import { canDeleteComment, withoutComment } from "./comments";

describe("canDeleteComment", () => {
  it("lets the author delete their own note", () => {
    expect(canDeleteComment({ authorHandle: "robbi", selfHandle: "robbi", role: "VIEWER" })).toBe(true);
  });

  it("lets an admin delete any note", () => {
    expect(canDeleteComment({ authorHandle: "someone", selfHandle: "house", role: "ADMIN" })).toBe(true);
    expect(canDeleteComment({ authorHandle: null, selfHandle: null, role: "ADMIN" })).toBe(true);
  });

  it("never offers delete to anyone else or to signed-out viewers", () => {
    expect(canDeleteComment({ authorHandle: "someone", selfHandle: "robbi", role: "ARTIST" })).toBe(false);
    expect(canDeleteComment({ authorHandle: null, selfHandle: null, role: "VIEWER" })).toBe(false);
    expect(canDeleteComment({ authorHandle: "robbi", selfHandle: null, role: null })).toBe(false);
  });
});

describe("withoutComment", () => {
  const post = {
    commentCount: 3,
    comments: [{ id: "a" }, { id: "b" }],
  };

  it("removes the note and lowers the count", () => {
    expect(withoutComment(post, "a")).toEqual({ commentCount: 2, comments: [{ id: "b" }] });
  });

  it("leaves the post alone when the note is not there", () => {
    expect(withoutComment(post, "zzz")).toBe(post);
  });

  it("never drops the count below zero", () => {
    expect(withoutComment({ commentCount: 0, comments: [{ id: "a" }] }, "a").commentCount).toBe(0);
  });
});
