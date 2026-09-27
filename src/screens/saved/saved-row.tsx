import * as Haptics from "expo-haptics";
import { type Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon, iconMap } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { minTapTarget, spacing, useBrandColors } from "@/theme";

/**
 * A saved night or work. Tap opens it. Removing is always one tap away — the
 * filled bookmark at the end un-saves — and also sits in the iOS long-press
 * menu and in the VoiceOver/TalkBack actions rotor.
 */
export function SavedRow({
  title,
  detail,
  accessibilityLabel,
  accessibilityHint,
  leading,
  href,
  onRemove,
  separator = true,
}: {
  title: string;
  detail: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  leading?: ReactNode;
  href: Href;
  onRemove: () => void;
  separator?: boolean;
}) {
  const palette = useBrandColors();

  const remove = () => {
    if (process.env.EXPO_OS === "ios") {
      void Haptics.selectionAsync();
    }
    onRemove();
  };

  return (
    <Link href={href} asChild>
      <Link.Trigger>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityActions={[{ name: "remove", label: "Remove from Saved" }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "remove") remove();
          }}
          // No `style` callback here: Link's asChild Slot merges `style` as an
          // object and would drop a function. Pressed state styles the child.
        >
          {({ pressed }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingLeft: spacing.md,
                // Opaque at rest so the iOS long-press preview lifts a whole row.
                backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
              }}
            >
              {leading}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "stretch",
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  paddingRight: spacing.xs,
                  borderBottomWidth: separator ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: palette.separator,
                }}
              >
                <View style={{ flex: 1, gap: spacing.xxs }}>
                  <ThemedText variant="headline" numberOfLines={2}>
                    {title}
                  </ThemedText>
                  <ThemedText variant="footnote" tone="muted" numberOfLines={2}>
                    {detail}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${title} from Saved`}
                  onPress={remove}
                  style={({ pressed: removing }) => ({
                    width: minTapTarget,
                    height: minTapTarget,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: removing ? 0.5 : 1,
                  })}
                >
                  <Icon name="bookmarkFill" size={20} color={palette.accentText} />
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </Link.Trigger>
      <Link.Menu>
        <Link.MenuAction icon={iconMap.trash.sf} destructive onPress={remove}>
          Remove from Saved
        </Link.MenuAction>
      </Link.Menu>
    </Link>
  );
}
