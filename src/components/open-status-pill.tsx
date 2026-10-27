import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useOpenStatus } from "@/hooks/use-open-status";
import { radius, spacing, stageLine, stageSurface, useBrandColors } from "@/theme";

/** "● Open now · 11 AM – Midnight" (today's posted Hacienda hours) for the live room on Clematis. */
export function OpenStatusPill({ tone = "default" }: { tone?: "default" | "stage" }) {
  const palette = useBrandColors();
  const { open, label, hoursLabel } = useOpenStatus();
  return (
    <View
      accessible
      accessibilityLabel={`${label}. Today ${hoursLabel} Eastern.`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
        backgroundColor: tone === "stage" ? stageSurface : palette.accentSoft,
        borderWidth: tone === "stage" ? 1 : 0,
        borderColor: stageLine,
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
      <ThemedText variant="footnote" tone={tone === "stage" ? "onStage" : "default"}>
        {label} ·{" "}
        <ThemedText variant="footnote" tone={tone === "stage" ? "onStageMuted" : "muted"}>
          {hoursLabel}
        </ThemedText>
      </ThemedText>
    </View>
  );
}
