/// <reference types="jest" />
import { queryKeysToRefreshAfterProfileUpdate } from "./profile-sync";

const has = (keys: readonly (readonly string[])[], key: string) => keys.some((k) => k[0] === key);

describe("queryKeysToRefreshAfterProfileUpdate", () => {
  it("always refreshes profile pages and the people directory", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ bio: "Hi" });
    expect(has(keys, "person")).toBe(true);
    expect(has(keys, "people")).toBe(true);
  });

  it("a bio or headline edit does not need the board or the feeds", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ bio: "Hi", headline: "Poet" });
    expect(has(keys, "community")).toBe(false);
    expect(has(keys, "feed")).toBe(false);
  });

  it("changing topics refreshes the For You board, the feeds and suggested people", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ topicSlugs: ["music"] });
    expect(has(keys, "community")).toBe(true);
    expect(has(keys, "feed")).toBe(true);
    expect(has(keys, "people")).toBe(true);
  });

  it("changing the home chapter refreshes suggested people", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ chapterId: "fl-wpb" });
    expect(has(keys, "people")).toBe(true);
  });

  it("a new name or handle shows up on posts, threads and notifications", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ name: "Vera V" });
    expect(has(keys, "community")).toBe(true);
    expect(has(keys, "post")).toBe(true);
    expect(has(keys, "notifications")).toBe(true);
  });

  it("lists each key once", () => {
    const keys = queryKeysToRefreshAfterProfileUpdate({ topicSlugs: [], name: "V", handle: "v2" });
    const flat = keys.map((k) => k.join("/"));
    expect(new Set(flat).size).toBe(flat.length);
  });
});
