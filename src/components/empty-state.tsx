import type { ReactNode } from "react";
import { View } from "react-native";

import { Icon, type IconName } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

/**
 * Honest empty state: says what is missing and offers the next move. Used for
 * "nothing yet", never for "still loading".
 */
export function EmptyState({
  icon = "sparkle",
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const palette = useBrandColors();
  return (
    <View
      style={{
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
      }}
    >
      <Icon name={icon} size={32} color={palette.accentText} />
      <ThemedText variant="title3" style={{ textAlign: "center" }}>
        {title}
      </ThemedText>
      {body ? (
        <ThemedText variant="callout" tone="muted" style={{ textAlign: "center" }}>
          {body}
        </ThemedText>
      ) : null}
      {action ? <View style={{ marginTop: spacing.xs }}>{action}</View> : null}
    </View>
  );
}
