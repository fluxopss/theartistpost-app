import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import type { TapLane } from "@/domain/stage/lanes";
import { buildWallPieces } from "@/domain/wall/build-wall-pieces";
import { filterWallPieces } from "@/domain/wall/filter-wall";
import { DEFAULT_WALL_FILTERS } from "@/domain/wall/types";
import { screenMargin, spacing } from "@/theme";

import { FrameCard } from "./frame-card";

/**
 * Every medium's frame is still open: no approved artists are published to
 * the app yet (the bootstrap `artists` list is empty and not wired here).
 * Once they are, pass them in so a claimed medium's frame stops reading open.
 */
const RESERVED_FRAMES = buildWallPieces({ artists: [], events: [], notes: [] }).filter(
  (piece) => piece.kind === "reserved",
);

function requestFrame() {
  router.push({ pathname: "/inquiry", params: { intent: "space" } });
}

/** Frames hung and lit, waiting for a real name. A lane narrows them to its medium. */
export function FramesSection({ lane }: { lane: TapLane | null }) {
  const frames = lane
    ? filterWallPieces(RESERVED_FRAMES, { ...DEFAULT_WALL_FILTERS, medium: lane.medium })
    : RESERVED_FRAMES;

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader eyebrow="Hung and lit" eyebrowTone="spark-gold" title="Open frames" />
      <ThemedText variant="body" tone="muted">
        {copy.wall.reservedBody}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="Open frames"
        style={{ marginHorizontal: -screenMargin }}
        contentContainerStyle={{
          gap: spacing.md,
          paddingHorizontal: screenMargin,
          // Room for the tilt so frame corners aren't clipped.
          paddingVertical: spacing.sm,
        }}
      >
        {frames.map((piece) => (
          <FrameCard key={piece.id} piece={piece} onPress={requestFrame} />
        ))}
      </ScrollView>
    </View>
  );
}
