import { queryClient } from "@/api/query-client";
import { ListGroup, ListRow } from "@/components/list-row";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { useSaves } from "@/storage/saves";
import { useStudio } from "@/storage/studio";

import { confirmDestructive } from "./confirm-destructive";

/** Rows with nothing to clear are dimmed and inert rather than hidden. */
const EMPTY_ROW = { opacity: 0.45 } as const;

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** Everything this phone keeps, and a confirmed way to clear each piece. */
export function DeviceDataGroup() {
  const saves = useSaves();
  const kindness = useKindnessNotes();
  const { studio, isGuest, reset } = useStudio();

  const hasSaves = saves.count > 0;
  const hasNotes = kindness.notes.length > 0;
  const hasStudio = !isGuest || Boolean(studio.city);

  return (
    <ListGroup
      header="This phone"
      footer="Saves, kindness notes, and your night pass live only on this phone. Clearing them can’t be undone."
    >
      <ListRow
        title="Clear saved works & nights"
        value={hasSaves ? String(saves.count) : undefined}
        destructive
        showChevron={false}
        style={hasSaves ? undefined : EMPTY_ROW}
        onPress={
          hasSaves
            ? () =>
                confirmDestructive({
                  title: "Clear saved works & nights?",
                  message: `${plural(saves.count, "saved item", "saved items")} will be removed from this phone.`,
                  action: "Clear",
                  done: "Saved works and nights cleared",
                  onConfirm: saves.clear,
                })
            : undefined
        }
      />
      <ListRow
        title="Clear kindness notes"
        value={hasNotes ? String(kindness.notes.length) : undefined}
        destructive
        showChevron={false}
        style={hasNotes ? undefined : EMPTY_ROW}
        onPress={
          hasNotes
            ? () =>
                confirmDestructive({
                  title: "Clear kindness notes?",
                  message: `${plural(kindness.notes.length, "note", "notes")} you left on this phone will be removed.`,
                  action: "Clear",
                  done: "Kindness notes cleared",
                  onConfirm: kindness.clear,
                })
            : undefined
        }
      />
      <ListRow
        title="Reset studio"
        destructive
        showChevron={false}
        style={hasStudio ? undefined : EMPTY_ROW}
        onPress={
          hasStudio
            ? () =>
                confirmDestructive({
                  title: "Reset studio?",
                  message: "Your studio name and city go back to Studio Guest.",
                  action: "Reset",
                  done: "Studio reset",
                  onConfirm: reset,
                })
            : undefined
        }
      />
      <ListRow
        title="Clear offline cache"
        destructive
        showChevron={false}
        separator={false}
        onPress={() =>
          confirmDestructive({
            title: "Clear offline cache?",
            message:
              "Content kept for offline use will be removed. It downloads again the next time you’re online. Your saves and notes stay.",
            action: "Clear",
            done: "Offline cache cleared",
            onConfirm: () => queryClient.clear(),
          })
        }
      />
    </ListGroup>
  );
}
