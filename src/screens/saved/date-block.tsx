import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/** Same width as EventRow's date block, so saved nights read like the schedule. */
const BLOCK_WIDTH = 52;

/** Month over day, on the accent wash. Decorative — the row label speaks the date. */
export function DateBlock({ month, day }: { month: string; day: string }) {
  const palette = useBrandColors();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: BLOCK_WIDTH,
        alignItems: "center",
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: palette.accentSoft,
      }}
    >
      <ThemedText variant="caption" tone="accent" style={{ textTransform: "uppercase" }}>
        {month}
      </ThemedText>
      <ThemedText variant="title2" style={{ fontVariant: ["tabular-nums"] }}>
        {day}
      </ThemedText>
    </View>
  );
}
