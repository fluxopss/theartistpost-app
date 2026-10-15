import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { useAuth } from "@/auth";
import { useMe } from "@/api/hooks";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { minTapTarget, radius, spacing, stageText, useBrandColors } from "@/theme";

/**
 * Header bell for the Activity screen, with an unread count. Renders nothing
 * when no one is signed in.
 */
export function ActivityBell({ onStage = false }: { onStage?: boolean }) {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const palette = useBrandColors();

  if (!user) return null;

  const unread = me.data?.user.unreadNotifications ?? 0;
  const label = unread > 0 ? `Activity, ${unread} unread` : "Activity";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={spacing.xxs}
      onPress={() => router.push("/activity")}
      style={{
        width: minTapTarget,
        height: minTapTarget,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="bell" size={24} color={onStage ? stageText : palette.text} />
      {unread > 0 ? (
        <View
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 16,
            height: 16,
            paddingHorizontal: spacing.xxs,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.accent,
          }}
        >
          <ThemedText variant="caption" tone="onAccent">
            {unread > 9 ? "9+" : String(unread)}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}
