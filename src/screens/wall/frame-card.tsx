import { Pressable, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import type { WallPiece } from "@/domain/wall/types";
import { radius, spacing, useBrandColors } from "@/theme";

const FRAME_WIDTH = 176;
/** Portrait frame proportions; grows taller rather than clipping large text. */
const FRAME_MIN_HEIGHT = 232;

/**
 * An empty, lit frame: dashed edge, its medium, and a way to ask for it.
 * Hung a little crooked, and it straightens under your finger.
 */
export function FrameCard({ piece, onPress }: { piece: WallPiece; onPress: () => void }) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${piece.subtitle}. ${copy.wall.reservedTitle}.`}
      accessibilityHint={`${copy.wall.bookFrame}. Opens a space inquiry.`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: FRAME_WIDTH,
        minHeight: FRAME_MIN_HEIGHT,
        justifyContent: "space-between",
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: palette.separatorStrong,
        backgroundColor: pressed ? palette.bgPressed : palette.bgDeep,
        transform: [{ rotate: `${pressed ? 0 : piece.rotate}deg` }],
      })}
    >
      <ThemedText variant="eyebrow" tone="spark-gold">
        {piece.subtitle}
      </ThemedText>
      <ThemedText variant="title2">{copy.wall.reservedTitle}</ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
        <ThemedText variant="subheadline" tone="accent" style={{ flexShrink: 1 }}>
          {copy.wall.bookFrame}
        </ThemedText>
        <Icon name="arrowRight" size={14} color={palette.accentText} weight="semibold" />
      </View>
    </Pressable>
  );
}
