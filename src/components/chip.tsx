import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

/**
 * A pill that toggles on and off (multi-select). For a single choice among
 * several, use `FilterChips`.
 */
export function Chip({
  label,
  selected,
  onPress,
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      hitSlop={spacing.xxs}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => ({
        minHeight: minTapTarget - 4,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: selected ? palette.accent : pressed ? palette.bgPressed : palette.bgElevated,
        borderWidth: selected ? 0 : 1,
        borderColor: palette.separator,
        opacity: disabled && !selected ? 0.45 : 1,
      })}
    >
      <ThemedText variant="subheadline" tone={selected ? "onAccent" : "default"}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
