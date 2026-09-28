import { canComposeMedia, studioGate, type SessionUser } from "@/auth/types";

function user(partial: Partial<SessionUser> & Pick<SessionUser, "role">): SessionUser {
  return {
    id: partial.id ?? "u1",
    name: partial.name ?? "Test",
    email: partial.email ?? "test@example.com",
    role: partial.role,
    handle: partial.handle,
    approved: partial.approved,
    image: partial.image ?? null,
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
    const gate = studioGate(user({ role: "ARTIST", handle: "mira", approved: false }));
    expect(gate.kind).toBe("artist_pending");
    expect(canComposeMedia(gate)).toBe(false);
  });

  it("opens compose for approved artists and admins", () => {
    expect(canComposeMedia(studioGate(user({ role: "ARTIST", approved: true })))).toBe(true);
    expect(canComposeMedia(studioGate(user({ role: "ADMIN" })))).toBe(true);
  });
});
