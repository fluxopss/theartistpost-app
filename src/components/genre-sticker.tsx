import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, shadows, spacing, type SparkTone, sticker } from "@/theme";

/**
 * A tilted TAP genre sticker — the one piece of "hand-hung" brand chrome.
 * Straightens while pressed; the tilt is decorative, so VoiceOver just reads
 * the label and selection state.
 */
export function GenreSticker({
  label,
  tone,
  tilt,
  selected = false,
  onPress,
  accessibilityHint,
  style,
}: {
  label: string;
  tone: SparkTone;
  tilt: number;
  selected?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const fill = sticker[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          minHeight: 44,
          justifyContent: "center",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xs,
          borderRadius: radius.pill,
          backgroundColor: fill.bg,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#FFFAF3" : fill.edge,
          boxShadow: shadows.sticker,
          transform: [{ rotate: `${pressed ? 0 : tilt}deg` }],
        },
        style,
      ]}
    >
      <ThemedText variant="headline" style={{ color: fill.ink }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
