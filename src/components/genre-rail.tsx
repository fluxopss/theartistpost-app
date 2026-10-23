import { router } from "expo-router";
import { ScrollView, type StyleProp, type ViewStyle } from "react-native";

import { GenreSticker } from "@/components/genre-sticker";
import { houseGenres } from "@/content/stage";
import { screenMargin, spacing } from "@/theme";

export type GenreId = (typeof houseGenres)[number]["id"];

/**
 * The TAP lanes (the 2016 stage + Culinary) as a horizontal sticker rail. By default a sticker
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
      accessibilityLabel="TAP lanes"
      style={style}
      contentContainerStyle={{
        gap: spacing.sm,
        paddingHorizontal: screenMargin,
        // Room for the tilt and sticker shadow so neither gets clipped.
        paddingVertical: spacing.md,
      }}
    >
      {houseGenres.map((genre) => (
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
