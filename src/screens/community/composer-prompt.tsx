import { Pressable, View } from "react-native";

import { useMe } from "@/api/hooks";
import { useAuth } from "@/auth";
import { ArtistAvatar } from "@/components/artist-avatar";
import { ThemedText } from "@/components/themed-text";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

/** The "share something" bar at the top of the board; opens the composer. */
export function ComposerPrompt({ onPress }: { onPress: () => void }) {
  const palette = useBrandColors();
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const name = me.data?.user.name ?? user?.name ?? "You";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Share something with the house"
      accessibilityHint={user ? "Opens the composer" : "Join the house to post"}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: minTapTarget + spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
        borderWidth: 1,
        borderColor: palette.separator,
      })}
    >
      <ArtistAvatar url={me.data?.user.image ?? null} name={name} size={40} />
      <View style={{ flex: 1 }}>
        <ThemedText variant="callout" tone="muted" numberOfLines={2}>
          Lift someone up, ask for a collab, share where you are showing…
        </ThemedText>
      </View>
    </Pressable>
  );
}
