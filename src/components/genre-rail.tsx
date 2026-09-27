import { router } from "expo-router";
import { ScrollView, type StyleProp, type ViewStyle } from "react-native";

import { GenreSticker } from "@/components/genre-sticker";
import { tapGenres } from "@/content/stage";
import { screenMargin, spacing } from "@/theme";

export type GenreId = (typeof tapGenres)[number]["id"];

/**
 * The seven TAP genres as a horizontal sticker rail. By default a sticker
 * opens that lane on The Wall tab; pass `onSelect` to filter in place.
 */
export function GenreRail({
  selected,
  onSelect,
  style,
}: {
  selected?: GenreId | null;
  onSelect?: (id: GenreId) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="list"
      accessibilityLabel="TAP genres"
      style={style}
      contentContainerStyle={{
        gap: spacing.sm,
        paddingHorizontal: screenMargin,
        // Room for the tilt and sticker shadow so neither gets clipped.
        paddingVertical: spacing.md,
      }}
    >
      {tapGenres.map((genre) => (
        <GenreSticker
          key={genre.id}
          label={genre.label}
          tone={genre.tone}
          tilt={genre.tilt}
          selected={selected === genre.id}
          accessibilityHint={onSelect ? "Filters this lane" : "Opens this lane on The Wall"}
          onPress={() =>
            onSelect
              ? onSelect(genre.id)
              : router.navigate({
                  pathname: "/(tabs)/(wall)/wall",
                  params: { lane: genre.id },
                })
          }
        />
      ))}
    </ScrollView>
  );
}
