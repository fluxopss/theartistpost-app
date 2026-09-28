import * as SecureStore from "expo-secure-store";

import type { AuthSession, SessionUser } from "./types";

const TOKEN_KEY = "tap.auth.token";
const USER_KEY = "tap.auth.user";

/**
 * Passwordless session on device. Token is the house HMAC (same payload as
 * web `tap_session`); never put it in AsyncStorage / SQLite.
 */
export const sessionStore = {
  async read(): Promise<AuthSession | null> {
    try {
      const [token, rawUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (!token || !rawUser) return null;
      const user = JSON.parse(rawUser) as SessionUser;
      if (!user?.id || !user.email || !user.role) return null;
      return { token, user };
    } catch {
      return null;
    }
  },

  async write(session: AuthSession): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, session.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
