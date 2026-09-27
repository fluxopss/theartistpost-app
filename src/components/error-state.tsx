import { View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

/** A failed load with a way back in. Offline reads differently from broken. */
export function ErrorState({
  title = "The door stuck",
  message,
  offline = false,
  onRetry,
  retrying = false,
}: {
  title?: string;
  message?: string;
  offline?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const palette = useBrandColors();
  return (
    <View
      accessibilityRole="alert"
      style={{
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
      }}
    >
      <Icon name={offline ? "wifiOff" : "warning"} size={30} color={palette.danger} />
      <ThemedText variant="title3" style={{ textAlign: "center" }}>
        {offline ? "You're offline" : title}
      </ThemedText>
      <ThemedText variant="callout" tone="muted" selectable style={{ textAlign: "center" }}>
        {message ??
          (offline
            ? "Reconnect and pull to refresh. Anything saved on this phone is still here."
            : "Something went wrong reaching the house. Try again in a moment.")}
      </ThemedText>
      {onRetry ? (
        <Button
          title="Try again"
          variant="secondary"
          icon="refresh"
          loading={retrying}
          onPress={onRetry}
          style={{ marginTop: spacing.xs }}
        />
      ) : null}
    </View>
  );
}
