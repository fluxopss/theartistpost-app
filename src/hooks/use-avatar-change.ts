import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { useUploadAvatar } from "@/api/hooks";
import { pickImageForUpload } from "@/utils/pick-image";

const AVATAR_MAX_SIDE = 1024;

/**
 * One-tap profile photo change: pick, crop square, shrink to a 1024px JPEG and
 * upload right away. Shared by the avatar on the You tab and the edit form.
 */
export function useAvatarChange() {
  const upload = useUploadAvatar();
  const [error, setError] = useState<string | null>(null);

  const choose = useCallback(async () => {
    setError(null);
    try {
      const picked = await pickImageForUpload({ maxSide: AVATAR_MAX_SIDE, square: true });
      if (!picked) return;
      await upload.mutateAsync(picked);
    } catch (cause) {
      const message = isApiError(cause)
        ? cause.offline
          ? "You are offline. Try the photo again when you are back."
          : cause.message
        : "Could not use that photo. Try another.";
      setError(message);
      Alert.alert("Photo not saved", message);
    }
  }, [upload]);

  return { choose, isPending: upload.isPending, error };
}
