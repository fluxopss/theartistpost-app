/// <reference types="jest" />
import type { AdminUserRowDTO } from "@/api/types";

import { partitionArtistRequests } from "./artist-requests";

function row(overrides: Partial<AdminUserRowDTO> & { id: string }): AdminUserRowDTO {
  return {
    name: "Someone",
    email: "someone@example.com",
    role: "VIEWER",
    handle: null,
    artistApproved: null,
    deniedSeed: false,
    createdAt: "2026-10-14T12:00:00.000Z",
    ...overrides,
  };
}

describe("partitionArtistRequests", () => {
  it("splits artist profiles into pending and approved", () => {
    const users = [
      row({ id: "a", handle: "ada", artistApproved: false }),
      row({ id: "b", handle: "bo", artistApproved: true }),
    ];
    const result = partitionArtistRequests(users);
    expect(result.pending.map((u) => u.id)).toEqual(["a"]);
    expect(result.approved.map((u) => u.id)).toEqual(["b"]);
  });

  it("ignores members who never applied as artists", () => {
    const result = partitionArtistRequests([row({ id: "m", artistApproved: null })]);
    expect(result.pending).toEqual([]);
    expect(result.approved).toEqual([]);
  });

  it("hides reserved seed identities", () => {
    const result = partitionArtistRequests([
      row({ id: "seed", handle: "luna", artistApproved: true, deniedSeed: true }),
    ]);
    expect(result.approved).toEqual([]);
  });

  it("keeps the order the server sent (newest first)", () => {
    const result = partitionArtistRequests([
      row({ id: "new", artistApproved: false, createdAt: "2026-10-15T00:00:00.000Z" }),
      row({ id: "old", artistApproved: false, createdAt: "2026-10-01T00:00:00.000Z" }),
    ]);
    expect(result.pending.map((u) => u.id)).toEqual(["new", "old"]);
  });
});
