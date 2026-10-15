import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { reactionSummaryLabel, topReactions, type ReactionCounts } from "@/domain/community/reactions";
import { minTapTarget, spacing } from "@/theme";

/**
 * The top reactions on a post as emoji with counts. Shows only what people
 * actually gave; renders nothing when there are none. With `onPress` it opens
 * the list of who reacted. Never a ranking across posts.
 */
export function ReactionSummary({
  counts,
  onPress,
}: {
  counts: ReactionCounts;
  onPress?: () => void;
}) {
  const top = topReactions(counts, 3);
  if (top.length === 0) return null;
  const spoken = reactionSummaryLabel(counts);

  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
      {top.map((entry) => (
        <ThemedText key={entry.reaction} variant="subheadline" style={{ fontVariant: ["tabular-nums"] }}>
          {entry.emoji} {entry.count}
        </ThemedText>
      ))}
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={spoken}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Shows who reacted"
      hitSlop={spacing.xxs}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: minTapTarget,
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {body}
    </Pressable>
  );
}
