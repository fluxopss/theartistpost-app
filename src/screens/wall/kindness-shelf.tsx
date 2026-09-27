import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { SectionHeader } from "@/components/section-header";
import { site } from "@/content/site";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { screenMargin, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

const SHELF_LIMIT = 8;
const NOTE_WIDTH = 220;
// Pinned by hand — a little crooked, never in lockstep.
const tilts = [-1.4, 1.2, -0.6, 1.6, -1.1, 0.8];

/**
 * Kindness pinned on this phone. Notes live on the device until the shared
 * wall opens, so this reads straight from storage — nothing to load.
 */
export function KindnessShelf() {
  const { notes } = useKindnessNotes();
  const shown = notes.slice(0, SHELF_LIMIT);

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        eyebrow={
          notes.length === 0
            ? site.kindnessMark
            : notes.length === 1
              ? "1 note on this phone"
              : `${notes.length} notes on this phone`
        }
        eyebrowTone="spark-violet"
        title="Pinned kindness"
        actionLabel={notes.length ? "See all" : undefined}
        actionHref={notes.length ? tabRoutes.kindness : undefined}
      />
      {shown.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="list"
          accessibilityLabel="Pinned kindness notes"
          style={{ marginHorizontal: -screenMargin }}
          contentContainerStyle={{
            alignItems: "flex-start",
            gap: spacing.md,
            paddingHorizontal: screenMargin,
            paddingVertical: spacing.sm,
          }}
        >
          {shown.map((note, i) => (
            <KindnessNoteCard
              key={note.id}
              variant="compact"
              body={note.body}
              from={note.fromLabel}
              tone={note.spark}
              style={{ width: NOTE_WIDTH, transform: [{ rotate: `${tilts[i % tilts.length]}deg` }] }}
              onPress={() => router.push({ pathname: "/note/[id]", params: { id: note.id } })}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon="sparkle"
          title="The plaster is waiting"
          body="Leave the first note — for an artist, a stranger, or the house. Notes you leave stay on this phone until the shared wall opens."
          action={
            <Button
              title="Leave a Kindness"
              tone="coral"
              icon="sparkle"
              onPress={() => router.push("/compose-kindness")}
            />
          }
        />
      )}
    </View>
  );
}
