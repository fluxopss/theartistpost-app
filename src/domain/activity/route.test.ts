/// <reference types="jest" />
import { notificationHref } from "./route";

describe("notificationHref", () => {
  it("opens a work by slug", () => {
    expect(notificationHref({ kind: "post", slug: "night-garden" })).toBe("/post/night-garden");
  });

  it("opens a community post by id", () => {
    expect(notificationHref({ kind: "community", id: "cmp_123" })).toBe("/community/cmp_123");
  });

  it("opens a person by handle", () => {
    expect(notificationHref({ kind: "person", handle: "ada_art" })).toBe("/person/ada_art");
  });

  it("encodes path segments", () => {
    expect(notificationHref({ kind: "post", slug: "a/b" })).toBe("/post/a%2Fb");
  });

  it("returns null when there is no target", () => {
    expect(notificationHref(null)).toBeNull();
  });
});
