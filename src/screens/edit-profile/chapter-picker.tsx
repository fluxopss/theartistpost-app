import { View } from "react-native";

import { FilterChips } from "@/components/filter-chips";
import { ThemedText } from "@/components/themed-text";
import { chapters } from "@/content/chapters";
import { spacing } from "@/theme";

const NONE = "none";

const options = [{ id: NONE, label: "No chapter" }, ...chapters.map((chapter) => ({ id: chapter.id, label: chapter.name }))];

/** Home chapter: one of the house's chapter regions, or none. */
export function ChapterPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (chapterId: string | null) => void;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="subheadline" accessibilityRole="header">
        Home chapter
      </ThemedText>
      <FilterChips
        label="Home chapter"
        options={options}
        value={value ?? NONE}
        onChange={(id) => onChange(id === NONE ? null : id)}
      />
    </View>
  );
}
