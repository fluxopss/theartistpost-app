import "expo-sqlite/localStorage/install";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

/**
 * Supabase Auth client (publishable key only). Domain data stays on house `/api/v1`.
 * When URL/key are unset, returns null — join keeps using HMAC Bearer.
 */
const url = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").trim();
const publishableKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(url && publishableKey);
}

let client: SupabaseClient | null = null;
let appStateWired = false;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseAuthConfigured()) return null;
  if (!client) {
    client = createClient(url, publishableKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    if (!appStateWired) {
      appStateWired = true;
      AppState.addEventListener("change", (state) => {
        if (!client) return;
        if (state === "active") {
          void client.auth.startAutoRefresh();
        } else {
          void client.auth.stopAutoRefresh();
        }
      });
    }
  }
  return client;
}
