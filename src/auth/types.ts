/** Auth + studio wire types — live contract `/cursor/stores/self/internal/web-auth-studio-api.md`. */

export type SessionRole = "VIEWER" | "ARTIST" | "ADMIN";

export type AuthArtist = {
  handle: string;
  approved: boolean;
  pendingApproval: boolean;
};

/** House `AuthUser` from `/api/v1/auth/*`. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: SessionRole;
  handle: string | null;
  image: string | null;
  artist: AuthArtist | null;
};

/** @deprecated Prefer AuthUser — kept as an alias for older import sites. */
export type SessionUser = AuthUser;

export type AuthSession = {
  token: string;
  user: AuthUser;
  expiresAt?: string;
  canPublish?: boolean;
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

/** Shared session payload from join / verify / refresh. */
export type SessionPayload = {
  token: string;
  expiresAt: string;
  expiresInSec: number;
  user: AuthUser;
  pendingApproval?: true;
};

export type MeResult = {
  user: AuthUser;
  canPublish: boolean;
};

/** What the Studio tab should emphasize for this session. */
export type StudioGate =
  | { kind: "guest" }
  | { kind: "member"; user: AuthUser }
  | { kind: "artist_pending"; user: AuthUser }
  | { kind: "artist"; user: AuthUser }
  | { kind: "admin"; user: AuthUser };

export function studioGate(user: AuthUser | null): StudioGate {
  if (!user) return { kind: "guest" };
  if (user.role === "ADMIN") return { kind: "admin", user };
  if (user.role === "ARTIST") {
    const pending = user.artist?.pendingApproval ?? !user.artist?.approved;
    return pending ? { kind: "artist_pending", user } : { kind: "artist", user };
  }
  return { kind: "member", user };
}

/** Prefer server `canPublish` from `/me`; fall back to role + approved artist. */
export function resolveCanPublish(user: AuthUser | null, canPublish?: boolean): boolean {
  if (canPublish !== undefined) return canPublish;
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return user.artist?.approved === true;
}

export function canComposeMedia(gate: StudioGate): boolean {
  return gate.kind === "artist" || gate.kind === "admin";
}

export function displayHandle(user: AuthUser | null | undefined): string | null {
  if (!user) return null;
  return user.handle ?? user.artist?.handle ?? null;
}
