/**
 * When a failed API call means "your sign-in expired" (sign the person out
 * and ask them to sign in again) rather than an ordinary error.
 *
 * - Only a 401 on a request that carried a token. Anonymous requests to
 *   public endpoints never trigger it, so it cannot loop.
 * - Not the /auth/* doors: they report their own errors, and cold-start
 *   restore already handles a 401 from /auth/me quietly.
 * - Only while that token is still the current one (a slow request from an
 *   earlier session must not sign out a new one), and once per token when
 *   several requests fail together.
 */
export function isSessionExpiry({
  status,
  path,
  sentToken,
  currentToken,
  alreadyHandledToken,
}: {
  status: number;
  path: string;
  sentToken: string | null;
  currentToken: string | null;
  alreadyHandledToken: string | null;
}): boolean {
  if (status !== 401) return false;
  if (!sentToken) return false;
  if (path === "/auth" || path.startsWith("/auth/") || path.startsWith("/auth?")) return false;
  if (currentToken !== sentToken) return false;
  if (alreadyHandledToken === sentToken) return false;
  return true;
}
