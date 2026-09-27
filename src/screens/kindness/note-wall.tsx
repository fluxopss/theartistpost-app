import { router } from "expo-router";
import { View } from "react-native";

import { KindnessNoteCard } from "@/components/kindness-note-card";
import type { KindnessNote } from "@/domain/kindness/types";
import { spacing } from "@/theme";

// Notes are pinned to the plaster by hand — a little crooked, never in lockstep.
const tilts = [-1.6, 1.1, -0.6, 1.8, -1.2, 0.7];

/** Paper notes in two staggered columns, like a wall of pinned cards. */
export function NoteWall({ notes }: { notes: KindnessNote[] }) {
  const columns: KindnessNote[][] = [[], []];
  notes.forEach((note, i) => columns[i % 2].push(note));

  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
      {columns.map((column, c) => (
        <View key={c} style={{ flex: 1, gap: spacing.md, paddingTop: c === 1 ? spacing.xl : 0 }}>
          {column.map((note, i) => (
            <KindnessNoteCard
              key={note.id}
              variant="compact"
              body={note.body}
              from={note.fromLabel}
              tone={note.spark}
              style={{ transform: [{ rotate: `${tilts[(i * 2 + c) % tilts.length]}deg` }] }}
              onPress={() => router.push({ pathname: "/note/[id]", params: { id: note.id } })}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
