import { View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/** Why the send failed, right above the button that retries it. */
export function SendError({ message, offline }: { message: string; offline: boolean }) {
  const palette = useBrandColors();
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.xs,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
        borderCurve: "continuous",
        backgroundColor: palette.bgElevated,
      }}
    >
      <Icon name={offline ? "wifiOff" : "warning"} size={18} color={palette.danger} />
      <ThemedText variant="subheadline" selectable style={{ flex: 1 }}>
        {message}
      </ThemedText>
    </View>
  );
}
