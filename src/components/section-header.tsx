import { Link, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import { ThemedText, type TextTone } from "@/components/themed-text";
import { spacing } from "@/theme";

/** Eyebrow + section title, with an optional "See all" link. */
export function SectionHeader({
  eyebrow,
  title,
  eyebrowTone = "accent",
  actionLabel,
  actionHref,
}: {
  eyebrow?: string;
  title: string;
  eyebrowTone?: TextTone;
  actionLabel?: string;
  actionHref?: Href;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.md }}>
      <View style={{ flex: 1, gap: spacing.xxs }}>
        {eyebrow ? (
          <ThemedText variant="eyebrow" tone={eyebrowTone}>
            {eyebrow}
          </ThemedText>
        ) : null}
        <ThemedText variant="title2" accessibilityRole="header">
          {title}
        </ThemedText>
      </View>
      {actionLabel && actionHref ? (
        <Link href={actionHref} asChild>
          <Pressable hitSlop={12} accessibilityRole="link">
            <ThemedText variant="subheadline" tone="accent">
              {actionLabel}
            </ThemedText>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
