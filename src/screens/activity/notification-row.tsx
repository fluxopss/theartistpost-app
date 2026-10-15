import { type Href, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import type { NotificationDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { ThemedText } from "@/components/themed-text";
import { notificationHref } from "@/domain/activity/route";
import { notificationSentence } from "@/domain/activity/sentence";
import { formatActivityTime } from "@/domain/activity/time";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

/**
 * One notification: who, what, when. Unread rows carry a dot and say so to
 * screen readers. Tap opens the work, thread or person it refers to.
 */
export function NotificationRow({ notification }: { notification: NotificationDTO }) {
  const palette = useBrandColors();
  const sentence = notificationSentence(notification);
  const when = formatActivityTime(notification.createdAt);
  const unread = notification.readAt === null;
  const href = notificationHref(notification.target);
  const label = [sentence, when, unread ? "unread" : null].filter(Boolean).join(", ");

  const body = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        minHeight: minTapTarget + spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: palette.separator,
      }}
    >
      <ArtistAvatar
        url={notification.actor?.avatarUrl ?? null}
        name={notification.actor?.name ?? "Someone"}
        size={40}
      />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <ThemedText variant={unread ? "headline" : "subheadline"}>
          {sentence}
        </ThemedText>
        {when ? (
          <ThemedText variant="footnote" tone="muted">
            {when}
          </ThemedText>
        ) : null}
      </View>
      {unread ? (
        <View
          importantForAccessibility="no"
          accessibilityElementsHidden
          style={{
            width: 8,
            height: 8,
            borderRadius: radius.pill,
            backgroundColor: palette.accent,
          }}
        />
      ) : null}
    </View>
  );

  if (!href) {
    return (
      <View accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens"
      onPress={() => router.push(href as Href)}
      style={({ pressed }) => ({ backgroundColor: pressed ? palette.bgPressed : "transparent" })}
    >
      {body}
    </Pressable>
  );
}
