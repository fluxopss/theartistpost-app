import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { PostSummaryDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/** Row height: a 40pt portrait plus breathing room — well over the 44pt tap minimum. */
const ROW_MIN_HEIGHT = 56;

/** "By" row: portrait, name, handle. Opens the artist's profile. */
export function ArtistByline({ artist }: { artist: PostSummaryDTO["artist"] }) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`By ${artist.name}, @${artist.handle}`}
      accessibilityHint="Opens the artist’s profile"
      onPress={() => router.push({ pathname: "/artist/[handle]", params: { handle: artist.handle } })}
      style={({ pressed }) => ({
        minHeight: ROW_MIN_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
      })}
    >
      <ArtistAvatar url={artist.avatarUrl} name={artist.name} />
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline" numberOfLines={1}>
          {artist.name}
        </ThemedText>
        <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
          @{artist.handle}
        </ThemedText>
      </View>
      <Icon name="chevronRight" size={14} color={palette.textMuted} weight="semibold" />
    </Pressable>
  );
}
