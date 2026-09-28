/** Session shape shared with the house `/api/v1/auth/*` contract. */

export type SessionRole = "VIEWER" | "ARTIST" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  handle?: string;
  role: SessionRole;
  image?: string | null;
  /** Artist profile approved for publish. Absent/false = pending or N/A. */
  approved?: boolean;
};

export type AuthSession = {
  user: SessionUser;
  token: string;
};

export type JoinMemberInput = {
  name: string;
  email: string;
};

export type JoinArtistInput = {
  name: string;
  email: string;
  handle: string;
  medium: string;
  intent: string;
};

export type VerifyInput = {
  email: string;
  code: string;
};

export type JoinResult = {
  user: SessionUser;
  token: string;
  pendingApproval?: boolean;
};

/** What the Studio tab should emphasize for this session. */
export type StudioGate =
  | { kind: "guest" }
  | { kind: "member"; user: SessionUser }
  | { kind: "artist_pending"; user: SessionUser }
  | { kind: "artist"; user: SessionUser }
  | { kind: "admin"; user: SessionUser };

export function studioGate(user: SessionUser | null): StudioGate {
  if (!user) return { kind: "guest" };
  if (user.role === "ADMIN") return { kind: "admin", user };
  if (user.role === "ARTIST") {
    return user.approved
      ? { kind: "artist", user }
      : { kind: "artist_pending", user };
  }
  return { kind: "member", user };
}

export function canComposeMedia(gate: StudioGate): boolean {
  return gate.kind === "artist" || gate.kind === "admin";
}
