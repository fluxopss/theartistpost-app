/// <reference types="jest" />
import type { AdminPersonRowDTO } from "@/api/types";

import {
  REASON_MAX,
  REASON_MIN,
  actionsFor,
  auditLabel,
  peopleQueryParams,
  reasonProblem,
  roleLabel,
} from "./people";

function person(overrides: Partial<AdminPersonRowDTO> & { id: string }): AdminPersonRowDTO {
  return {
    name: "Someone",
    email: "someone@example.com",
    role: "VIEWER",
    handle: "someone",
    avatarUrl: null,
    artistApproved: null,
    suspended: false,
    deniedSeed: false,
    createdAt: "2026-10-14T12:00:00.000Z",
    ...overrides,
  };
}

const VIEWER_ID = "admin_me";

describe("roleLabel", () => {
  it("uses the house words, not enum names", () => {
    expect(roleLabel("VIEWER")).toBe("Member");
    expect(roleLabel("ARTIST")).toBe("Artist");
    expect(roleLabel("ADMIN")).toBe("Admin");
  });
});

describe("peopleQueryParams", () => {
  it("sends nothing for the default view", () => {
    expect(peopleQueryParams({ q: "", role: "all", status: "all", pendingArtist: false })).toEqual({});
  });

  it("trims the search and maps every filter", () => {
    expect(
      peopleQueryParams({ q: "  @vera ", role: "ARTIST", status: "suspended", pendingArtist: true }),
    ).toEqual({ q: "@vera", role: "ARTIST", status: "suspended", pendingArtist: "1" });
  });
});

describe("reasonProblem", () => {
  it("asks for a real reason", () => {
    expect(reasonProblem("")).toMatch(/why/i);
    expect(reasonProblem("  ok ")).toMatch(/few words/i);
  });

  it("accepts the allowed range and rejects too long", () => {
    expect(reasonProblem("x".repeat(REASON_MIN))).toBeNull();
    expect(reasonProblem("x".repeat(REASON_MAX))).toBeNull();
    expect(reasonProblem("x".repeat(REASON_MAX + 1))).toMatch(/shorter/i);
  });
});

describe("actionsFor: mirrors the server guards so the UI never offers a dead end", () => {
  const ids = (rows: ReturnType<typeof actionsFor>) => rows.map((a) => a.id);

  it("offers suspend and role changes for a plain member", () => {
    const rows = actionsFor(person({ id: "m" }), VIEWER_ID);
    expect(ids(rows)).toEqual(["role:ADMIN", "suspend", "sign_in_help"]);
    expect(rows.find((a) => a.id === "suspend")?.destructive).toBe(true);
  });

  it("offers unsuspend instead of suspend for a suspended person", () => {
    const rows = actionsFor(person({ id: "m", suspended: true }), VIEWER_ID);
    expect(ids(rows)).toContain("unsuspend");
    expect(ids(rows)).not.toContain("suspend");
  });

  it("offers approve/revoke only when an artist profile exists", () => {
    expect(ids(actionsFor(person({ id: "a", artistApproved: false, role: "VIEWER" }), VIEWER_ID))).toEqual([
      "approve_artist",
      "role:ARTIST",
      "role:ADMIN",
      "suspend",
      "sign_in_help",
    ]);
    expect(ids(actionsFor(person({ id: "a", artistApproved: true, role: "ARTIST" }), VIEWER_ID))).toEqual([
      "revoke_artist",
      "role:VIEWER",
      "role:ADMIN",
      "suspend",
      "sign_in_help",
    ]);
  });

  it("never offers ARTIST role to someone with no artist profile", () => {
    expect(ids(actionsFor(person({ id: "m", artistApproved: null }), VIEWER_ID))).not.toContain("role:ARTIST");
  });

  it("gives you no way to remove your own admin role or suspend yourself", () => {
    const rows = actionsFor(person({ id: VIEWER_ID, role: "ADMIN" }), VIEWER_ID);
    expect(ids(rows)).toEqual(["sign_in_help"]);
  });

  it("does not offer to suspend another admin (demote first)", () => {
    const rows = actionsFor(person({ id: "other", role: "ADMIN" }), VIEWER_ID);
    expect(ids(rows)).toEqual(["role:VIEWER", "sign_in_help"]);
  });

  it("offers nothing destructive for reserved seed identities", () => {
    expect(actionsFor(person({ id: "seed", deniedSeed: true }), VIEWER_ID)).toEqual([]);
  });
});

describe("auditLabel", () => {
  it("translates audit actions to plain words", () => {
    expect(auditLabel("user.role_change")).toBe("Role changed");
    expect(auditLabel("user.suspend")).toBe("Suspended");
    expect(auditLabel("user.unsuspend")).toBe("Suspension lifted");
    expect(auditLabel("artist.approve")).toBe("Approved as artist");
    expect(auditLabel("artist.revoke")).toBe("Artist approval revoked");
    expect(auditLabel("user.sign_in_help")).toBe("Sign-in code emailed");
    expect(auditLabel("moderation.suspend_user")).toBe("Suspended from the queue");
  });

  it("falls back to a readable version of unknown actions", () => {
    expect(auditLabel("something.new_thing")).toBe("something new thing");
  });
});
