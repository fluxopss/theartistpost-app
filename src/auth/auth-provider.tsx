import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isApiError } from "@/api/errors";

import { authApi } from "./api";
import { sessionStore } from "./session-store";
import { getSupabase, isSupabaseAuthConfigured } from "./supabase";
import { getAuthToken, setAuthToken } from "./token";
import {
  resolveCanPublish,
  studioGate,
  type AuthSession,
  type AuthUser,
  type JoinArtistInput,
  type JoinMemberInput,
  type SessionPayload,
  type StudioGate,
  type VerifyInput,
} from "./types";

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  gate: StudioGate;
  canCompose: boolean;
  canPublish: boolean;
  /** True when EXPO_PUBLIC_SUPABASE_* is set — return door can use Supabase OTP. */
  supabaseReady: boolean;
  /** Last restore/join error worth showing (cleared on success). */
  lastError: string | null;
  joinMember: (input: JoinMemberInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  joinArtist: (input: JoinArtistInput) => Promise<{ ok: true; pendingApproval: boolean } | { ok: false; error: string }>;
  requestCode: (email: string) => Promise<{ ok: true; debugCode?: string } | { ok: false; error: string }>;
  verify: (input: VerifyInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  /**
   * Supabase email OTP for returning visitors. Stores the access token as Bearer,
   * then calls `/auth/link` (or `/auth/me` once JWKS accepts the JWT).
   */
  requestSupabaseCode: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  verifySupabaseCode: (
    input: VerifyInput,
  ) => Promise<{ ok: true } | { ok: false; error: string; houseFallback?: boolean }>;
  /** Revalidate via `/auth/me` (and refresh token when near expiry). */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Refresh when fewer than 7 days remain on a 30-day token. */
const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000;

function friendlyAuthError(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.code === "service_paused") {
      return "The house auth door is paused right now. Try again later.";
    }
    if (error.code === "not_found" || error.status === 404) {
      return "The house auth door is not open on the API yet. Your details were not sent as a fake success.";
    }
    if (error.offline) return "Couldn't reach The Artist Post. Check the connection and try again.";
    if (error.code === "upstream_unavailable") {
      return "The house is restarting. Try again in a moment.";
    }
    if (error.code === "rate_limited") {
      const wait = error.retryAfterSec ? ` Try again in about ${error.retryAfterSec}s.` : "";
      return `${error.message || "Too many attempts."}${wait}`;
    }
    return error.message || fallback;
  }
  return fallback;
}

async function applySession(session: AuthSession | null): Promise<void> {
  setAuthToken(session?.token ?? null);
  if (session) await sessionStore.write(session);
  else await sessionStore.clear();
}

function sessionFromPayload(payload: SessionPayload, canPublish?: boolean): AuthSession {
  return {
    token: payload.token,
    user: payload.user,
    expiresAt: payload.expiresAt,
    canPublish:
      canPublish ??
      resolveCanPublish(payload.user, payload.pendingApproval ? false : undefined),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    const stored = await sessionStore.read();
    if (!stored) {
      setAuthToken(null);
      setUser(null);
      setCanPublish(false);
      setStatus("ready");
      return;
    }

    setAuthToken(stored.token);
    setUser(stored.user);
    setCanPublish(resolveCanPublish(stored.user, stored.canPublish));

    try {
      let token = stored.token;
      let expiresAt = stored.expiresAt;

      const expiresAtMs = expiresAt ? Date.parse(expiresAt) : NaN;
      const needsRefresh =
        Number.isFinite(expiresAtMs) && expiresAtMs - Date.now() < REFRESH_WITHIN_MS;

      if (needsRefresh) {
        try {
          const refreshed = await authApi.refresh();
          const next = sessionFromPayload(refreshed);
          await applySession(next);
          token = next.token;
          expiresAt = next.expiresAt;
          setUser(next.user);
          setCanPublish(resolveCanPublish(next.user, next.canPublish));
        } catch {
          // Keep the existing token and ask /me.
        }
      }

      const me = await authApi.me();
      const liveToken = getAuthToken() ?? token;
      const next: AuthSession = {
        token: liveToken,
        user: me.user,
        expiresAt,
        canPublish: me.canPublish,
      };
      await applySession(next);
      setUser(me.user);
      setCanPublish(me.canPublish);
      setLastError(null);
    } catch (error) {
      if (isApiError(error) && (error.code === "unauthorized" || error.status === 401)) {
        await applySession(null);
        setUser(null);
        setCanPublish(false);
        setLastError(null);
      } else if (isApiError(error) && (error.code === "not_found" || error.status === 404)) {
        setLastError(null);
      } else {
        setLastError(friendlyAuthError(error, "Couldn’t refresh your pass."));
      }
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    // SecureStore restore must run after mount; defer so the effect body
    // does not synchronously cascade setState (react-hooks/set-state-in-effect).
    const timer = setTimeout(() => {
      void hydrate();
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrate]);

  const joinMember = useCallback(async (input: JoinMemberInput) => {
    try {
      const result = await authApi.joinMember(input);
      const session = sessionFromPayload(result, false);
      await applySession(session);
      setUser(result.user);
      setCanPublish(false);
      setLastError(null);
      return { ok: true as const };
    } catch (error) {
      const message = friendlyAuthError(error, "Could not open the member door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const joinArtist = useCallback(async (input: JoinArtistInput) => {
    try {
      const result = await authApi.joinArtist(input);
      const pending = result.pendingApproval ?? true;
      const session = sessionFromPayload(result, false);
      await applySession(session);
      setUser(result.user);
      setCanPublish(false);
      setLastError(null);
      return { ok: true as const, pendingApproval: pending };
    } catch (error) {
      const message = friendlyAuthError(error, "Could not open the studio door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const requestCode = useCallback(async (email: string) => {
    try {
      const result = await authApi.requestCode(email);
      setLastError(null);
      return { ok: true as const, debugCode: result.debugCode };
    } catch (error) {
      const message = friendlyAuthError(
        error,
        "Email codes are not available from the house yet.",
      );
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const verify = useCallback(async (input: VerifyInput) => {
    try {
      const result = await authApi.verify(input);
      const session = sessionFromPayload(result);
      await applySession(session);
      setUser(result.user);
      try {
        const me = await authApi.me();
        await applySession({
          ...session,
          user: me.user,
          canPublish: me.canPublish,
        });
        setUser(me.user);
        setCanPublish(me.canPublish);
      } catch {
        setCanPublish(resolveCanPublish(result.user, session.canPublish));
      }
      setLastError(null);
      return { ok: true as const };
    } catch (error) {
      const message = friendlyAuthError(error, "That code did not open the door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const requestSupabaseCode = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      const message = "Supabase Auth is not configured on this build.";
      setLastError(message);
      return { ok: false as const, error: message };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });
      if (error) {
        const message = error.message || "Could not send a house code.";
        setLastError(message);
        return { ok: false as const, error: message };
      }
      setLastError(null);
      return { ok: true as const };
    } catch (error) {
      const message = friendlyAuthError(error, "Could not send a house code.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const verifySupabaseCode = useCallback(async (input: VerifyInput) => {
    const supabase = getSupabase();
    if (!supabase) {
      const message = "Supabase Auth is not configured on this build.";
      setLastError(message);
      return { ok: false as const, error: message };
    }
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: input.email.trim().toLowerCase(),
        token: input.code.trim(),
        type: "email",
      });
      if (error || !data.session?.access_token) {
        const message = error?.message || "That code did not open the door.";
        setLastError(message);
        return { ok: false as const, error: message };
      }

      const accessToken = data.session.access_token;
      const expiresAt = data.session.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : undefined;
      setAuthToken(accessToken);

      try {
        const linked = await authApi.link({});
        const session = sessionFromPayload(linked);
        await applySession({ ...session, expiresAt: session.expiresAt || expiresAt });
        setUser(linked.user);
        setCanPublish(resolveCanPublish(linked.user, session.canPublish));
        setLastError(null);
        return { ok: true as const };
      } catch (linkError) {
        if (isApiError(linkError) && (linkError.code === "not_found" || linkError.status === 404)) {
          // JWKS /auth/link not deployed yet — clear JWT so HMAC house path can proceed.
          setAuthToken(null);
          const message =
            "The house link door is not open yet. Use the email code from The Artist Post instead.";
          setLastError(message);
          return { ok: false as const, error: message, houseFallback: true };
        }
        try {
          const me = await authApi.me();
          const session: AuthSession = {
            token: accessToken,
            user: me.user,
            expiresAt,
            canPublish: me.canPublish,
          };
          await applySession(session);
          setUser(me.user);
          setCanPublish(me.canPublish);
          setLastError(null);
          return { ok: true as const };
        } catch {
          setAuthToken(null);
          const message = friendlyAuthError(
            linkError,
            "Signed in with Supabase, but the house could not link your pass yet.",
          );
          setLastError(message);
          return { ok: false as const, error: message, houseFallback: true };
        }
      }
    } catch (error) {
      const message = friendlyAuthError(error, "That code did not open the door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Client clears regardless — Bearer is stateless.
    }
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Local clear still runs.
      }
    }
    await applySession(null);
    setUser(null);
    setCanPublish(false);
    setLastError(null);
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  const gate = studioGate(user);
  const supabaseReady = isSupabaseAuthConfigured();
  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      gate,
      canCompose: canPublish,
      canPublish,
      supabaseReady,
      lastError,
      joinMember,
      joinArtist,
      requestCode,
      verify,
      requestSupabaseCode,
      verifySupabaseCode,
      refresh: hydrate,
      signOut,
      clearError,
    }),
    [
      status,
      user,
      gate,
      canPublish,
      supabaseReady,
      lastError,
      joinMember,
      joinArtist,
      requestCode,
      verify,
      requestSupabaseCode,
      verifySupabaseCode,
      hydrate,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
