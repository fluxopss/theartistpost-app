import * as SecureStore from "expo-secure-store";

import type { AuthSession, AuthUser } from "./types";

const TOKEN_KEY = "tap.auth.token";
const USER_KEY = "tap.auth.user";
const META_KEY = "tap.auth.meta";

type SessionMeta = {
  expiresAt?: string;
  canPublish?: boolean;
};

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const u = value as AuthUser;
  return Boolean(u.id && u.email && u.name && u.role);
}

/**
 * Passwordless session on device. Token is the house HMAC Bearer (same payload
 * as web `tap_session`) or, once JWKS lands, a Supabase access token after
 * `/auth/link`. Never put it in AsyncStorage.
 */
export const sessionStore = {
  async read(): Promise<AuthSession | null> {
    try {
      const [token, rawUser, rawMeta] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
        SecureStore.getItemAsync(META_KEY),
      ]);
      if (!token || !rawUser) return null;
      const user = JSON.parse(rawUser) as unknown;
      if (!isAuthUser(user)) return null;
      const meta = rawMeta ? (JSON.parse(rawMeta) as SessionMeta) : {};
      return {
        token,
        user,
        expiresAt: meta.expiresAt,
        canPublish: meta.canPublish,
      };
    } catch {
      return null;
    }
  },

  async write(session: AuthSession): Promise<void> {
    const meta: SessionMeta = {
      expiresAt: session.expiresAt,
      canPublish: session.canPublish,
    };
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, session.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
      SecureStore.setItemAsync(META_KEY, JSON.stringify(meta)),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(META_KEY),
    ]);
  },
};
