/// <reference types="jest" />
import { houseGenres, tapGenres } from "@/content/stage";
import { buildWallPieces } from "@/domain/wall/build-wall-pieces";
import { allLanes, tapLane } from "./lanes";

describe("Culinary Arts lane", () => {
  it("is a primary lane right after Musicians, without rewriting 2016 history", () => {
    expect(tapGenres.map((g) => g.id as string)).not.toContain("culinary");
    expect(houseGenres.map((g) => g.id)).toEqual([
      "music",
      "culinary",
      "photo",
      "dance",
      "film",
      "stage",
      "laugh",
      "frame",
    ]);
    expect(allLanes().map((l) => l.id)).toEqual(houseGenres.map((g) => g.id));
    expect(tapLane("culinary")).toMatchObject({ label: "Culinary Artists", medium: "culinary" });
  });
});

describe("culinary frame on The Wall", () => {
  const pieces = buildWallPieces({ artists: [], events: [], notes: [] });

  it("hangs a lit, empty culinary frame until a culinary artist is approved", () => {
    const frame = pieces.find((p) => p.id === "reserved-culinary");
    expect(frame).toMatchObject({ medium: "culinary", subtitle: "Culinary · frame reserved" });
    expect(frame?.imageUrl).toBeUndefined();
    expect(frame?.brandImage).toBeUndefined();
  });

  it("does not overlap any other frame", () => {
    const frame = pieces.find((p) => p.id === "reserved-culinary")!;
    const overlaps = pieces.filter(
      (p) =>
        p.id !== frame.id &&
        p.x < frame.x + frame.w &&
        frame.x < p.x + p.w &&
        p.y < frame.y + frame.h &&
        frame.y < p.y + p.h,
    );
    expect(overlaps.map((p) => p.id)).toEqual([]);
  });
});
