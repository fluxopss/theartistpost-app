import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { paper, radius, shadows, spacing, spark, type SparkTone } from "@/theme";

/**
 * A kindness note — warm paper with a spark-colored pin stripe. Paper keeps
 * its colors in both schemes; it is an object on the wall, not chrome.
 */
export function KindnessNoteCard({
  body,
  from,
  tone = "coral",
  variant = "full",
  onPress,
  style,
}: {
  body: string;
  from: string;
  tone?: SparkTone;
  variant?: "compact" | "full";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const k = paper.kindness;
  const compact = variant === "compact";

  const card = (
    <View
      style={[
        {
          backgroundColor: k.bg,
          borderWidth: 1,
          borderColor: k.border,
          borderTopWidth: 4,
          borderTopColor: spark[tone],
          borderRadius: radius.md,
          borderCurve: "continuous",
          padding: compact ? spacing.sm : spacing.md,
          gap: spacing.xs,
          boxShadow: shadows.hairline,
        },
        style,
      ]}
    >
      <ThemedText
        variant={compact ? "subheadline" : "body"}
        style={{ color: k.ink }}
        numberOfLines={compact ? 4 : undefined}
      >
        {body}
      </ThemedText>
      <ThemedText variant="caption" style={{ color: k.muted }} numberOfLines={1}>
        — {from}
      </ThemedText>
    </View>
  );

  if (!onPress) return card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Kindness note from ${from}: ${body}`}
      accessibilityHint="Opens the note"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {card}
    </Pressable>
  );
}
