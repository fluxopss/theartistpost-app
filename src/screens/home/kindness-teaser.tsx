import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { site } from "@/content/site";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { paper, radius, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

/** Kindness left on this phone — or an honest invitation to leave the first. */
export function KindnessTeaser() {
  const { notes } = useKindnessNotes();
  const latest = notes.slice(0, 2);

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        eyebrow={site.kindnessMark}
        eyebrowTone="spark-violet"
        title={site.shine}
        actionLabel={notes.length ? "See all" : undefined}
        actionHref={notes.length ? tabRoutes.kindness : undefined}
      />
      {latest.length ? (
        <View style={{ gap: spacing.sm }}>
          {latest.map((note) => (
            <KindnessNoteCard
              key={note.id}
              variant="compact"
              body={note.body}
              from={note.fromLabel}
              tone={note.spark}
              onPress={() => router.push({ pathname: "/note/[id]", params: { id: note.id } })}
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: paper.kindness.bg,
            borderWidth: 1,
            borderColor: paper.kindness.border,
            borderStyle: "dashed",
            borderRadius: radius.md,
            borderCurve: "continuous",
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <ThemedText variant="headline" tone="paperInk">
            The plaster is waiting for the first note.
          </ThemedText>
          <ThemedText variant="subheadline" style={{ color: paper.kindness.muted }}>
            Leave a few kind words for an artist, a stranger, or the house. Notes you leave stay on this phone.
          </ThemedText>
          <Button
            title="Leave a Kindness"
            tone="coral"
            icon="sparkle"
            onPress={() => router.push("/compose-kindness")}
            style={{ alignSelf: "flex-start" }}
          />
        </View>
      )}
    </View>
  );
}
