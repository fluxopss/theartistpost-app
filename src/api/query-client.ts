import "expo-sqlite/localStorage/install";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { focusManager, QueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { AppState } from "react-native";

import { storageKeys } from "@/storage/keys";

import { isApiError } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // Keep cached content around long enough to survive a week offline.
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: (count, error) =>
        count < 2 && !(isApiError(error) && ["not_found", "validation_failed"].includes(error.code)),
    },
  },
});

/** Content survives cold starts and airplane mode; busted on each app version. */
export const persister = createSyncStoragePersister({
  storage: localStorage,
  key: storageKeys.queryCache,
  throttleTime: 1000,
});

export const persistBuster = Constants.expoConfig?.version ?? "0";

// Refetch stale data when the app returns to the foreground.
AppState.addEventListener("change", (state) => {
  focusManager.setFocused(state === "active");
});
