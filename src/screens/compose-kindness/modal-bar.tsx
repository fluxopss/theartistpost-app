import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { screenMargin, spacing, useBrandColors } from "@/theme";

/**
 * Top bar for a header-less modal: platform-native dismiss (iOS "Cancel"
 * text, Android close icon), a centered title and an optional step label.
 */
export function ModalBar({ title, detail }: { title: string; detail?: string }) {
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const ios = process.env.EXPO_OS === "ios";

  return (
    <View
      style={{
        // iOS modals are page sheets that already clear the status bar.
        paddingTop: ios ? spacing.sm : insets.top + spacing.xs,
        paddingBottom: spacing.sm,
        paddingHorizontal: screenMargin,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: palette.separator,
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ios ? "Cancel" : "Close"}
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
        >
          {ios ? (
            <ThemedText variant="body" tone="accent">
              Cancel
            </ThemedText>
          ) : (
            <Icon name="close" size={24} color={palette.text} />
          )}
        </Pressable>
      </View>
      <View style={{ flex: 2, alignItems: "center" }}>
        <ThemedText variant="headline" accessibilityRole="header" numberOfLines={1}>
          {title}
        </ThemedText>
        {detail ? (
          <ThemedText variant="caption" tone="muted">
            {detail}
          </ThemedText>
        ) : null}
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}
