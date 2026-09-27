import { Pressable, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

/** A radio row in a grouped list: label, optional hint, checkmark when chosen. */
export function ChoiceRow({
  label,
  hint,
  selected,
  onPress,
  last = false,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: spacing.md,
        backgroundColor: pressed ? palette.bgPressed : "transparent",
      })}
    >
      <View
        style={{
          minHeight: 52,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          borderBottomWidth: last ? 0 : 0.5,
          borderBottomColor: palette.separator,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="body">{label}</ThemedText>
          {hint ? (
            <ThemedText variant="footnote" tone="muted">
              {hint}
            </ThemedText>
          ) : null}
        </View>
        {selected ? <Icon name="check" size={18} color={palette.accentText} weight="semibold" /> : null}
      </View>
    </Pressable>
  );
}
