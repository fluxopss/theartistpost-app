import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

import { Icon, type IconName } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, type SparkTone, useBrandColors } from "@/theme";

/** Tile height — room for the glyph and a label that can wrap at large text sizes. */
const TILE_MIN_HEIGHT = 72;

/**
 * One of a row of equal quick actions (Call / Directions / Donate): a
 * spark-inked glyph over a short label on the grouped surface.
 */
export function ActionTile({
  icon,
  label,
  tone,
  accessibilityHint,
  onPress,
}: {
  icon: IconName;
  label: string;
  tone: SparkTone;
  accessibilityHint?: string;
  onPress: () => void;
}) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") {
          void Haptics.selectionAsync();
        }
        onPress();
      }}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: TILE_MIN_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xxs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
      })}
    >
      <Icon name={icon} size={24} color={palette.sparkInk[tone]} />
      <ThemedText variant="footnote" style={{ textAlign: "center" }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
