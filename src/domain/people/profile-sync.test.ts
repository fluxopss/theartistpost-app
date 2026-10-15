/// <reference types="jest" />
import { profileChangeFromServer, queryKeysToRefreshAfterProfileUpdate } from "./profile-sync";

const base = {
  name: "Vera",
  handle: "vera",
  chapterId: "fl-wpb" as string | null,
  topics: [{ slug: "music" }, { slug: "film" }],
};

describe("profileChangeFromServer", () => {
  it("is empty when nothing that other screens depend on changed", () => {
    expect(profileChangeFromServer(base, { ...base })).toEqual({});
  });

  it("reports changed topics regardless of order", () => {
    expect(profileChangeFromServer(base, { ...base, topics: [{ slug: "film" }, { slug: "music" }] })).toEqual({});
    expect(profileChangeFromServer(base, { ...base, topics: [{ slug: "dance" }] })).toEqual({
      topicSlugs: ["dance"],
    });
  });

  it("reports a changed chapter, name or handle", () => {
    expect(profileChangeFromServer(base, { ...base, chapterId: null })).toEqual({ chapterId: null });
    expect(profileChangeFromServer(base, { ...base, name: "Vera V" })).toEqual({ name: "Vera V" });
    expect(profileChangeFromServer(base, { ...base, handle: "vera2" })).toEqual({ handle: "vera2" });
  });

  it("a change made on another device refreshes the board and feeds through the same keys", () => {
    const change = profileChangeFromServer(base, { ...base, topics: [{ slug: "dance" }] });
    const keys = queryKeysToRefreshAfterProfileUpdate(change).map((key) => key[0]);
    expect(keys).toEqual(expect.arrayContaining(["community", "feed", "people"]));
  });
});

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
