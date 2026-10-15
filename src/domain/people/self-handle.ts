/**
 * Which handle is "me". The session's cached user can lack a handle right
 * after onboarding (it is chosen on the Welcome screen), while the server
 * profile always has it, so the profile wins, then the session, then the
 * artist handle.
 */
export function resolveSelfHandle(sources: {
  authHandle?: string | null;
  artistHandle?: string | null;
  profileHandle?: string | null;
}): string | null {
  return sources.profileHandle || sources.authHandle || sources.artistHandle || null;
}

export function isSelfHandle(candidate: string | null | undefined, self: string | null): boolean {
  return Boolean(candidate) && Boolean(self) && candidate === self;
}
