import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { duration, spacing, useBrandColors } from "@/theme";

/**
 * A quiet "✓ Saved" that fades in beside a section header after an edit
 * commits — confirmation without an alert. Holds still under Reduce Motion
 * (Reanimated layout animations follow the system setting).
 */
export function SavedIndicator({ visible }: { visible: boolean }) {
  const palette = useBrandColors();
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(duration.fast)}
      exiting={FadeOut.duration(duration.base)}
      style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}
    >
      <Icon name="checkCircle" size={14} color={palette.success} />
      <ThemedText variant="footnote" tone="success">
        Saved
      </ThemedText>
    </Animated.View>
  );
}
