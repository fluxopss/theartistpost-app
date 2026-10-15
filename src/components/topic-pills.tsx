import { View } from "react-native";

import type { TopicDTO } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/** Read-only topic labels on a profile. */
export function TopicPills({ topics }: { topics: TopicDTO[] }) {
  const palette = useBrandColors();
  if (topics.length === 0) return null;
  return (
    <View
      accessible
      accessibilityLabel={`Topics: ${topics.map((topic) => topic.name).join(", ")}`}
      style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}
    >
      {topics.map((topic) => (
        <View
          key={topic.slug}
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xxs,
            borderRadius: radius.pill,
            backgroundColor: palette.accentSoft,
          }}
        >
          <ThemedText variant="footnote" tone="accent">
            {topic.name}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}
