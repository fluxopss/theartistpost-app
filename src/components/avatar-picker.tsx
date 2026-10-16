import { View } from "react-native";

import { ArtistAvatar } from "@/components/artist-avatar";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { useAvatarChange } from "@/hooks/use-avatar-change";
import { spacing } from "@/theme";

const AVATAR_SIZE = 96;

/**
 * Profile photo: pick, crop square, shrink to 1024px JPEG, upload right away.
 * `url` is whatever the profile currently shows.
 */
export function AvatarPicker({ url, name }: { url: string | null; name: string }) {
  const { choose, isPending, error } = useAvatarChange();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
      <ArtistAvatar url={url} name={name} size={AVATAR_SIZE} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Button
          title={url ? "Change photo" : "Add a photo"}
          variant="secondary"
          icon="photo"
          loading={isPending}
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
