import Constants from "expo-constants";

import { useAppConfig } from "@/api/hooks";
import { mustUpdate } from "@/domain/app/version";

/** The version this build reports (app.json `version`, the same one sent as X-TAP-Client). */
export const runningVersion = Constants.expoConfig?.version ?? null;

/**
 * True only when the house says this version is too old to keep working.
 * Loading, offline, an error or an unreadable version all fail open (false).
 */
export function useUpdateRequired(): boolean {
  const config = useAppConfig();
  return mustUpdate(runningVersion, config.data?.minSupportedVersion);
}
