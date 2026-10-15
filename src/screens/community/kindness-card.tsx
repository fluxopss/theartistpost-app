import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { minTapTarget, radius, spacing, spark, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

/** Pinned link to the Kindness Always wall, which lives inside Community now. */
export function KindnessCard() {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Kindness Always. Read the kindness wall and leave a note"
      onPress={() => router.push(tabRoutes.kindness)}
      style={({ pressed }) => ({
        minHeight: minTapTarget + spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
        borderLeftWidth: 3,
        borderLeftColor: spark.violet,
      })}
    >
      <Icon name="kindness" size={22} color={palette.sparkInk.violet} />
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline">Kindness Always</ThemedText>
        <ThemedText variant="footnote" tone="muted">
          Read the wall of kind notes, or leave one.
        </ThemedText>
      </View>
      <Icon name="chevronRight" size={14} color={palette.textMuted} weight="semibold" />
    </Pressable>
  );
}
