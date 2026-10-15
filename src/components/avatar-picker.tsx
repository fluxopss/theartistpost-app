import { useState } from "react";
import { Alert, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useUploadAvatar } from "@/api/hooks";
import { ArtistAvatar } from "@/components/artist-avatar";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";
import { pickImageForUpload } from "@/utils/pick-image";

const AVATAR_SIZE = 96;
const AVATAR_MAX_SIDE = 1024;

/**
 * Profile photo: pick, crop square, shrink to 1024px JPEG, upload right away.
 * `url` is whatever the profile currently shows.
 */
export function AvatarPicker({ url, name }: { url: string | null; name: string }) {
  const upload = useUploadAvatar();
  const [error, setError] = useState<string | null>(null);

  const choose = async () => {
    setError(null);
    try {
      const picked = await pickImageForUpload({ maxSide: AVATAR_MAX_SIDE, square: true });
      if (!picked) return;
      await upload.mutateAsync(picked);
    } catch (cause) {
      const message = isApiError(cause) ? cause.message : "Couldn't use that photo. Try another.";
      setError(message);
      Alert.alert("Photo not saved", message);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
      <ArtistAvatar url={url} name={name} size={AVATAR_SIZE} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Button
          title={url ? "Change photo" : "Add a photo"}
          variant="secondary"
          icon="photo"
          loading={upload.isPending}
          onPress={() => void choose()}
        />
        {error ? (
          <ThemedText variant="footnote" tone="danger" accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        ) : (
          <ThemedText variant="footnote" tone="muted">
            Square, from your photo library.
          </ThemedText>
        )}
      </View>
    </View>
  );
}
