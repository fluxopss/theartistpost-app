import { DEFAULT_STUDIO, slugifyHandle, type StudioProfile } from "@/domain/app/studio";

import { storageKeys } from "./keys";
import { useStored } from "./kv";

/** The on-device studio name/city (no account needed). */
export function useStudio() {
  const [studio, setStudio] = useStored<StudioProfile>(storageKeys.studio, DEFAULT_STUDIO);
  return {
    studio,
    isGuest: studio.handle === DEFAULT_STUDIO.handle,
    update: (patch: { displayName?: string; city?: string }) =>
      setStudio((prev) => {
        const displayName = patch.displayName?.trim() || prev.displayName;
        return {
          displayName,
          handle: slugifyHandle(displayName),
          city: patch.city === undefined ? prev.city : patch.city.trim() || undefined,
        };
      }),
    reset: () => setStudio(DEFAULT_STUDIO),
  };
}
