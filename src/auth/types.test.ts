import {
  canComposeMedia,
  resolveCanPublish,
  studioGate,
  type AuthUser,
} from "@/auth/types";

function user(partial: Partial<AuthUser> & Pick<AuthUser, "role">): AuthUser {
  return {
    id: partial.id ?? "u1",
    name: partial.name ?? "Test",
    email: partial.email ?? "test@example.com",
    role: partial.role,
    handle: partial.handle ?? null,
    image: partial.image ?? null,
    artist: partial.artist ?? null,
  };
}

describe("studioGate", () => {
  it("treats null as guest", () => {
    expect(studioGate(null)).toEqual({ kind: "guest" });
    expect(canComposeMedia(studioGate(null))).toBe(false);
  });

  it("maps viewers to member", () => {
    const gate = studioGate(user({ role: "VIEWER" }));
    expect(gate.kind).toBe("member");
    expect(canComposeMedia(gate)).toBe(false);
  });

  it("keeps unapproved artists pending", () => {
    const gate = studioGate(
      user({
        role: "ARTIST",
        handle: "mira",
        artist: { handle: "mira", approved: false, pendingApproval: true },
      }),
    );
    expect(gate.kind).toBe("artist_pending");
    expect(canComposeMedia(gate)).toBe(false);
  });

  it("opens compose for approved artists and admins", () => {
    const approved = user({
      role: "ARTIST",
      artist: { handle: "mira", approved: true, pendingApproval: false },
    });
    expect(canComposeMedia(studioGate(approved))).toBe(true);
    expect(resolveCanPublish(approved)).toBe(true);
    expect(resolveCanPublish(user({ role: "ADMIN" }))).toBe(true);
    expect(resolveCanPublish(approved, false)).toBe(false);
    expect(resolveCanPublish(approved, true)).toBe(true);
  });
});
