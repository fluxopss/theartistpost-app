import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { minTapTarget, screenMargin, spacing, useBrandColors } from "@/theme";

const ios = process.env.EXPO_OS === "ios";

/**
 * Top bar for the header-less inquiry modal. iOS: "Cancel" text on the
 * leading edge and a centered title, like any page sheet. Android: a close
 * icon then a start-aligned title, like a Material full-screen dialog.
 * With no `onDismiss` the dismiss control is hidden (the footer owns "Done").
 */
export function InquiryBar({ title, onDismiss }: { title: string; onDismiss?: () => void }) {
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();

  const dismiss = onDismiss ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ios ? "Cancel" : "Close"}
      hitSlop={spacing.sm}
      onPress={onDismiss}
      style={({ pressed }) => ({
        minHeight: minTapTarget,
        minWidth: minTapTarget,
        justifyContent: "center",
        alignItems: ios ? "flex-start" : "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {ios ? (
        <ThemedText variant="body" tone="accent">
          Cancel
        </ThemedText>
      ) : (
        <Icon name="close" size={24} color={palette.text} />
      )}
    </Pressable>
  ) : (
    <View style={{ minHeight: minTapTarget, minWidth: minTapTarget }} />
  );

  return (
    <View
      style={{
        // iOS modals are page sheets that already clear the status bar;
        // Android draws the modal edge to edge from y = 0.
        paddingTop: ios ? spacing.xs : insets.top + spacing.xxs,
        paddingBottom: spacing.xxs,
        paddingHorizontal: ios ? screenMargin : spacing.xxs,
        flexDirection: "row",
        alignItems: "center",
        gap: ios ? 0 : spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: palette.separator,
      }}
    >
      {ios ? (
        <>
          <View style={{ flex: 1, alignItems: "flex-start" }}>{dismiss}</View>
          <ThemedText variant="headline" accessibilityRole="header" numberOfLines={1} style={{ flex: 2, textAlign: "center" }}>
            {title}
          </ThemedText>
          <View style={{ flex: 1 }} />
        </>
      ) : (
        <>
          {dismiss}
          <ThemedText variant="title3" accessibilityRole="header" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </ThemedText>
        </>
      )}
    </View>
  );
}
