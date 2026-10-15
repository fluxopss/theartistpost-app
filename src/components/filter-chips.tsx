import * as Haptics from "expo-haptics";
import { Pressable, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, screenMargin, spacing, useBrandColors } from "@/theme";

/** A horizontal row of single-select filter pills. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  const palette = useBrandColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      contentContainerStyle={{ gap: spacing.xs, paddingHorizontal: screenMargin }}
      style={{ marginHorizontal: -screenMargin }}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            hitSlop={4}
            onPress={() => {
              if (process.env.EXPO_OS === "ios") Haptics.selectionAsync();
              onChange(option.id);
            }}
            style={({ pressed }) => ({
              minHeight: 36,
              justifyContent: "center",
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              backgroundColor: selected
                ? palette.accent
                : pressed
                  ? palette.bgPressed
                  : palette.bgElevated,
              borderWidth: selected ? 0 : 1,
              borderColor: palette.separator,
            })}
          >
            <ThemedText variant="subheadline" tone={selected ? "onAccent" : "default"}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
