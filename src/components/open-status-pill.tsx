import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useOpenStatus } from "@/hooks/use-open-status";
import { radius, spacing, useBrandColors } from "@/theme";

/** "● Open now · 9:00 AM – 9:30 PM" for the live room on Clematis. */
export function OpenStatusPill() {
  const palette = useBrandColors();
  const { open, label, hoursLabel } = useOpenStatus();
  return (
    <View
      accessible
      accessibilityLabel={`${label}. Hours ${hoursLabel} Eastern.`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
        backgroundColor: palette.accentSoft,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: open ? palette.success : palette.textMuted,
        }}
      />
      <ThemedText variant="footnote">
        {label} · <ThemedText variant="footnote" tone="muted">{hoursLabel}</ThemedText>
      </ThemedText>
    </View>
  );
}
