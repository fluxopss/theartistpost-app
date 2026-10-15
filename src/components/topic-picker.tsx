import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useTopics } from "@/api/hooks";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { TOPICS_MAX } from "@/domain/people/profile-form";
import { spacing } from "@/theme";

/** Pick up to 8 topics from the house's curated list. */
export function TopicPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  const topics = useTopics();
  const full = selected.length >= TOPICS_MAX;

  const toggle = (slug: string) => {
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
        <ThemedText variant="subheadline" accessibilityRole="header">
          Topics
        </ThemedText>
        <ThemedText variant="footnote" tone="muted" style={{ fontVariant: ["tabular-nums"] }}>
          {selected.length}/{TOPICS_MAX}
        </ThemedText>
      </View>

      {topics.isPending ? (
        <Skeleton height={36} />
      ) : topics.error ? (
        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="footnote" tone="danger">
            {isApiError(topics.error) && topics.error.offline
              ? "You're offline. Topics will load when you're back."
              : "Couldn't load topics."}
          </ThemedText>
          <Button title="Try again" variant="secondary" onPress={() => void topics.refetch()} />
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          {(topics.data ?? []).map((topic) => (
            <Chip
              key={topic.slug}
              label={topic.name}
              selected={selected.includes(topic.slug)}
              disabled={full && !selected.includes(topic.slug)}
              accessibilityHint={full && !selected.includes(topic.slug) ? "You've picked the most topics allowed" : undefined}
              onPress={() => toggle(topic.slug)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
