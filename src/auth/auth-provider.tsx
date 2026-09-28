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
import { setAuthToken } from "./token";
import {
  canComposeMedia,
  studioGate,
  type AuthSession,
  type JoinArtistInput,
  type JoinMemberInput,
  type SessionUser,
  type StudioGate,
  type VerifyInput,
} from "./types";

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: SessionUser | null;
  gate: StudioGate;
  canCompose: boolean;
  /** Last restore/join error worth showing (cleared on success). */
  lastError: string | null;
  joinMember: (input: JoinMemberInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  joinArtist: (input: JoinArtistInput) => Promise<{ ok: true; pendingApproval: boolean } | { ok: false; error: string }>;
  requestCode: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  verify: (input: VerifyInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.code === "not_found" || error.status === 404) {
      return "The house auth door is not open on the API yet. Your details were not sent as a fake success.";
    }
    if (error.offline) return "Couldn't reach The Artist Post. Check the connection and try again.";
    if (error.code === "upstream_unavailable") {
      return "The house is restarting. Try again in a moment.";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    const stored = await sessionStore.read();
    if (!stored) {
      setAuthToken(null);
      setUser(null);
      setStatus("ready");
      return;
    }

    setAuthToken(stored.token);
    setUser(stored.user);

    try {
      const { user: fresh } = await authApi.me();
      setUser(fresh);
      await sessionStore.write({ token: stored.token, user: fresh });
      setLastError(null);
    } catch (error) {
      if (isApiError(error) && (error.code === "unauthorized" || error.status === 401)) {
        await applySession(null);
        setUser(null);
        setLastError(null);
      } else if (isApiError(error) && (error.code === "not_found" || error.status === 404)) {
        // API not shipped yet — keep the local session so UI can still show role state.
        setLastError(null);
      } else {
        // Keep cached user for offline; surface a soft note.
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
      await applySession({ token: result.token, user: result.user });
      setUser(result.user);
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
      await applySession({ token: result.token, user: result.user });
      setUser(result.user);
      setLastError(null);
      return { ok: true as const, pendingApproval: result.pendingApproval ?? true };
    } catch (error) {
      const message = friendlyAuthError(error, "Could not open the studio door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const requestCode = useCallback(async (email: string) => {
    try {
      await authApi.requestCode(email);
      setLastError(null);
      return { ok: true as const };
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
      await applySession({ token: result.token, user: result.user });
      setUser(result.user);
      setLastError(null);
      return { ok: true as const };
    } catch (error) {
      const message = friendlyAuthError(error, "That code did not open the door.");
      setLastError(message);
      return { ok: false as const, error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } catch {
      // Client clears regardless — server revoke is best-effort.
    }
    await applySession(null);
    setUser(null);
    setLastError(null);
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  const gate = studioGate(user);
  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      gate,
      canCompose: canComposeMedia(gate),
      lastError,
      joinMember,
      joinArtist,
      requestCode,
      verify,
      refresh: hydrate,
      signOut,
      clearError,
    }),
    [
      status,
      user,
      gate,
      lastError,
      joinMember,
      joinArtist,
      requestCode,
      verify,
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
