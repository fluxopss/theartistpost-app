import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, shadows, spacing, useBrandColors } from "@/theme";

type Era = {
  id: string;
  year: string;
  title: string;
  body: string;
  facts: readonly string[];
};

/**
 * One stop on the timeline: a gold year on the rail, the story, then the
 * record it rests on. The present stop is lit teal instead of gold.
 */
export function EraEntry({ era, last, present }: { era: Era; last: boolean; present: boolean }) {
  const palette = useBrandColors();
  const dot = spacing.sm;

  return (
    <View style={{ flexDirection: "row", gap: spacing.md }}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ width: spacing.lg, alignItems: "center" }}
      >
        <View
          style={{
            width: dot,
            height: dot,
            marginTop: spacing.xxs / 2,
            borderRadius: radius.pill,
            backgroundColor: present ? palette.sparkInk.teal : palette.sparkInk.gold,
            boxShadow: present ? shadows.glow : undefined,
          }}
        />
        {last ? null : (
          <View
            style={{
              flex: 1,
              width: 1,
              marginTop: spacing.xs,
              backgroundColor: palette.separatorStrong,
            }}
          />
        )}
      </View>

      <View style={{ flex: 1, gap: spacing.xs, paddingBottom: last ? 0 : spacing.xxl }}>
        <ThemedText variant="eyebrow" tone="spark-gold">
          {era.year}
        </ThemedText>
        <ThemedText variant="title2" accessibilityRole="header">
          {era.title}
        </ThemedText>
        <ThemedText variant="body">{era.body}</ThemedText>
        <View
          style={{
            gap: spacing.xs,
            marginTop: spacing.xxs,
            padding: spacing.sm,
            borderRadius: radius.sm,
            borderCurve: "continuous",
            backgroundColor: palette.bgElevated,
          }}
        >
          {era.facts.map((fact) => (
            <View key={fact} style={{ flexDirection: "row", gap: spacing.xs }}>
              <ThemedText variant="footnote" tone="spark-gold" accessibilityElementsHidden importantForAccessibility="no">
                —
              </ThemedText>
              <ThemedText variant="footnote" tone="muted" selectable style={{ flex: 1 }}>
                {fact}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
