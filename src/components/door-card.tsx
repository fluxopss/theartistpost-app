import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, type SparkTone, useBrandColors } from "@/theme";

/**
 * One of the five participation doors. A numbered, tinted panel with a
 * spark-colored edge — the door frame — rather than a floating card.
 */
export function DoorCard({
  index,
  eyebrow,
  title,
  body,
  tone,
  cta = "Step through",
  onPress,
  style,
}: {
  index: number;
  eyebrow: string;
  title: string;
  body: string;
  tone: SparkTone;
  cta?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      accessibilityHint={cta}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
          borderLeftWidth: 4,
          borderLeftColor: palette.sparkInk[tone],
        },
        style,
      ]}
    >
      <ThemedText
        variant="title1"
        tone={`spark-${tone}`}
        style={{ fontVariant: ["tabular-nums"], minWidth: 36 }}
        accessibilityElementsHidden
      >
        {String(index).padStart(2, "0")}
      </ThemedText>
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <ThemedText variant="eyebrow" tone={`spark-${tone}`}>
          {eyebrow}
        </ThemedText>
        <ThemedText variant="title3">{title}</ThemedText>
        <ThemedText variant="subheadline" tone="muted">
          {body}
        </ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginTop: spacing.xxs }}>
          <ThemedText variant="footnote" tone="accent">
            {cta}
          </ThemedText>
          <Icon name="arrowRight" size={13} color={palette.accentText} weight="semibold" />
        </View>
      </View>
    </Pressable>
  );
}
