/// <reference types="jest" />
import { filterTopics } from "./topic-search";

const topics = [
  { slug: "visual-art", name: "Visual Artists" },
  { slug: "music", name: "Musicians" },
  { slug: "photo", name: "Photographers" },
  { slug: "venues", name: "Venues & Spaces" },
  { slug: "frame", name: "Models" },
];

describe("filterTopics", () => {
  it("returns every topic, in the curated order, for an empty or blank query", () => {
    expect(filterTopics(topics, "")).toEqual(topics);
    expect(filterTopics(topics, "   ")).toEqual(topics);
  });

  it("matches the display name case-insensitively", () => {
    expect(filterTopics(topics, "MUSIC").map((t) => t.slug)).toEqual(["music"]);
    expect(filterTopics(topics, "graph").map((t) => t.slug)).toEqual(["photo"]);
  });

  it("matches the slug too, so people can type what they call it", () => {
    expect(filterTopics(topics, "visual-art").map((t) => t.slug)).toEqual(["visual-art"]);
    expect(filterTopics(topics, "frame").map((t) => t.slug)).toEqual(["frame"]);
  });

  it("requires every typed word to match", () => {
    expect(filterTopics(topics, "venues spaces").map((t) => t.slug)).toEqual(["venues"]);
    expect(filterTopics(topics, "venues music")).toEqual([]);
  });

  it("ignores accents and stray punctuation", () => {
    const withAccent = [{ slug: "cafe", name: "Café Culture" }];
    expect(filterTopics(withAccent, "cafe").map((t) => t.slug)).toEqual(["cafe"]);
    expect(filterTopics(topics, "venues &").map((t) => t.slug)).toEqual(["venues"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTopics(topics, "zzz")).toEqual([]);
  });
});
