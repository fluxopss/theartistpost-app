import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { mantra } from "@/content/site";
import { type SparkTone, spacing } from "@/theme";

const tones: SparkTone[] = ["coral", "gold", "teal"];

/** "Love ALL · Dream TOGETHER · Create AS ONE™" — the house mantra. */
export function MantraStrip({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel="Love all. Dream together. Create as one."
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: spacing.md,
        rowGap: spacing.xxs,
      }}
    >
      {mantra.map((line, index) => (
        <ThemedText key={line.lead} variant="title2">
          {line.lead}{" "}
          <ThemedText variant="title2" tone={`spark-${tones[index % tones.length]}`}>
            {line.rest}
            {"mark" in line ? line.mark : ""}
          </ThemedText>
        </ThemedText>
      ))}
    </View>
  );
}
