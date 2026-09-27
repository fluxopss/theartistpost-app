import { router, useLocalSearchParams } from "expo-router";
import { Alert, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { ThemedText } from "@/components/themed-text";
import { site } from "@/content/site";
import { MEDIUM_LABELS } from "@/domain/kindness/types";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { screenMargin, spacing, useBrandColors } from "@/theme";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

/** One note, read at full size. Share it, or take it down. */
export function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const { notes, remove } = useKindnessNotes();
  const note = notes.find((n) => n.id === id);
  const ios = process.env.EXPO_OS === "ios";

  return (
    <View
      style={{
        // Transparent on iOS so the form sheet gets its native material.
        backgroundColor: ios ? "transparent" : palette.bgElevated,
        paddingHorizontal: screenMargin,
        paddingTop: spacing.xl,
        paddingBottom: insets.bottom + spacing.lg,
        gap: spacing.lg,
      }}
    >
      {note ? (
        <>
          <KindnessNoteCard body={note.body} from={note.fromLabel} tone={note.spark} />
          <ThemedText variant="footnote" tone="muted">
            For {MEDIUM_LABELS[note.medium].toLowerCase()} · left {dateFormat.format(new Date(note.createdAt))} · on this phone
          </ThemedText>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              title="Share"
              icon="share"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                Share.share({
                  message: `“${note.body}” — ${note.fromLabel}\n\n${site.kindnessMark} · ${site.name}`,
                })
              }
            />
            <Button
              title="Remove"
              icon="trash"
              variant="destructive"
              style={{ flex: 1 }}
              onPress={() =>
                Alert.alert("Remove this note?", "It will be taken off the plaster on this phone.", [
                  { text: "Keep it", style: "cancel" },
                  {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                      remove(note.id);
                      router.back();
                    },
                  },
                ])
              }
            />
          </View>
        </>
      ) : (
        <EmptyState icon="sparkle" title="This note was taken down" body="It's no longer on this phone." />
      )}
    </View>
  );
}
