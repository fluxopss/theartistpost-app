/// <reference types="jest" />
import {
  ALL_LANES,
  eventMediumOptions,
  isEventMedium,
  mediumLabel,
  nightsInLane,
  scheduleLaneOptions,
} from "./lanes";

describe("lane options", () => {
  it("puts Culinary second among the house lanes, right after Musicians", () => {
    expect(scheduleLaneOptions.map((o) => o.id).slice(0, 3)).toEqual([ALL_LANES, "music", "culinary"]);
    expect(eventMediumOptions.map((o) => o.id).slice(0, 3)).toEqual(["community", "music", "culinary"]);
  });

  it("offers community and every house lane for a new night, and nothing else", () => {
    expect(eventMediumOptions.map((o) => o.id)).toEqual([
      "community",
      "music",
      "culinary",
      "photo",
      "dance",
      "film",
      "stage",
      "laugh",
      "frame",
    ]);
    expect(isEventMedium("Culinary")).toBe(true);
    expect(isEventMedium("jazz")).toBe(false);
  });

  it("labels a lane, and leaves an older free-text medium as typed", () => {
    expect(mediumLabel("culinary")).toBe("Culinary Artists");
    expect(mediumLabel("community")).toBe("Community");
    expect(mediumLabel("Spoken word")).toBe("Spoken word");
  });
});

describe("nightsInLane", () => {
  const nights = [
    { id: "a", medium: "music" },
    { id: "b", medium: "Culinary" },
    { id: "c", medium: "community" },
    { id: "d", medium: "culinary " },
  ];

  it("keeps every night for All", () => {
    expect(nightsInLane(nights, ALL_LANES)).toHaveLength(4);
    expect(nightsInLane(nights, null)).toHaveLength(4);
  });

  it("filters the list already fetched, ignoring case and spaces", () => {
    expect(nightsInLane(nights, "culinary").map((n) => n.id)).toEqual(["b", "d"]);
    expect(nightsInLane(nights, "dance")).toEqual([]);
  });

  it("never mutates the input", () => {
    const copy = [...nights];
    nightsInLane(nights, "music");
    expect(nights).toEqual(copy);
  });
});
