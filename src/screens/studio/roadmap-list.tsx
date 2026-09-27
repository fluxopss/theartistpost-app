import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { appCopy } from "@/content/site";
import { radius, spacing, type SparkTone, type, useBrandColors } from "@/theme";

const dotTones: SparkTone[] = ["violet", "teal", "gold"];
const DOT = 8;

/**
 * What's on the drafting table — a quiet list, not a row of promo cards.
 * Nothing here is tappable because none of it has shipped.
 */
export function RoadmapList() {
  const palette = useBrandColors();

  return (
    <View style={{ gap: spacing.sm }}>
      <ThemedText
        variant="footnote"
        tone="muted"
        accessibilityRole="header"
        style={{ paddingHorizontal: spacing.md, textTransform: "uppercase" }}
      >
        {appCopy.comingNextTitle}
      </ThemedText>
      <View style={{ gap: spacing.md, paddingHorizontal: spacing.md }}>
        {appCopy.comingNext.map((item, index) => (
          <View
            key={item.title}
            accessible
            accessibilityLabel={`${item.title}. ${item.body}`}
            style={{ flexDirection: "row", gap: spacing.sm }}
          >
            {/* Centre the dot on the first line of the title. */}
            <View style={{ height: type.headline.lineHeight, justifyContent: "center" }}>
              <View
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: radius.pill,
                  backgroundColor: palette.sparkInk[dotTones[index % dotTones.length]],
                }}
              />
            </View>
            <View style={{ flex: 1, gap: spacing.xxs }}>
              <ThemedText variant="headline">{item.title}</ThemedText>
              <ThemedText variant="subheadline" tone="muted">
                {item.body}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
