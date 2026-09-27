import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { ContentChapter } from "@/domain/content/types";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

import { chapterStatusLabel, chapterStatusTone } from "./chapter-status";

/**
 * A read-only chapter row: a state-code stamp ringed in the status color,
 * the region, and what's true about it today. Rows share one surface.
 */
export function ChapterRow({ chapter, last }: { chapter: ContentChapter; last: boolean }) {
  const palette = useBrandColors();
  const tone = chapterStatusTone[chapter.status];
  const place = chapter.name !== chapter.state ? chapter.state : null;

  return (
    <View
      accessible
      accessibilityLabel={[
        place ? `${chapter.name}, ${place}` : chapter.name,
        chapterStatusLabel(chapter.status),
        chapter.summary,
      ].join(". ")}
      style={{ flexDirection: "row", gap: spacing.sm, paddingLeft: spacing.md }}
    >
      <View style={{ paddingVertical: spacing.sm }}>
        <View
          style={{
            minWidth: minTapTarget,
            minHeight: minTapTarget,
            paddingHorizontal: spacing.xxs,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            borderWidth: 1.5,
            borderColor: palette.sparkInk[tone],
          }}
        >
          <ThemedText variant="headline" tone={`spark-${tone}`}>
            {chapter.stateCode}
          </ThemedText>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          gap: spacing.xxs,
          paddingVertical: spacing.sm,
          paddingRight: spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: palette.separator,
        }}
      >
        <ThemedText variant="headline">{chapter.name}</ThemedText>
        {place ? (
          <ThemedText variant="footnote" tone="muted">
            {place}
          </ThemedText>
        ) : null}
        <ThemedText variant="subheadline" tone="muted">
          {chapter.summary}
        </ThemedText>
      </View>
    </View>
  );
}
