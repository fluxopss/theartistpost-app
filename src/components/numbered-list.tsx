import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, type SparkTone, spacing, useBrandColors } from "@/theme";

/**
 * Read-only grouped rows numbered like the doors themselves ("01", "02"…).
 * One shared surface with hairlines — never a card per row.
 */
export function NumberedList({
  items,
  tone,
}: {
  items: readonly { id: string; title: string; body: string }[];
  tone: SparkTone;
}) {
  const palette = useBrandColors();
  return (
    <View
      style={{
        backgroundColor: palette.bgElevated,
        borderRadius: radius.md,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <View
          key={item.id}
          accessible
          accessibilityLabel={`${i + 1}. ${item.title}. ${item.body}`}
          style={{ flexDirection: "row", gap: spacing.sm, paddingLeft: spacing.md }}
        >
          <ThemedText
            variant="headline"
            tone={`spark-${tone}`}
            style={{ fontVariant: ["tabular-nums"], paddingTop: spacing.sm }}
          >
            {String(i + 1).padStart(2, "0")}
          </ThemedText>
          <View
            style={{
              flex: 1,
              gap: spacing.xxs,
              paddingVertical: spacing.sm,
              paddingRight: spacing.md,
              borderBottomWidth: i < items.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: palette.separator,
            }}
          >
            <ThemedText variant="headline">{item.title}</ThemedText>
            <ThemedText variant="subheadline" tone="muted">
              {item.body}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}
