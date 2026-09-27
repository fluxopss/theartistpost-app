import { Pressable } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import type { LegalLink as LegalLinkData } from "@/content/legal";
import { minTapTarget, spacing, useBrandColors } from "@/theme";
import { followHref } from "@/utils/links";

/** An inline web anchor from the legal copy, as a text link with a full-height target. */
export function LegalLink({ link }: { link: LegalLinkData }) {
  const palette = useBrandColors();
  const external = /^[a-z]+:/i.test(link.href);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={link.label}
      accessibilityHint={external ? "Opens in your browser" : undefined}
      onPress={() => followHref(link.href)}
      style={({ pressed }) => ({
        minHeight: minTapTarget,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: spacing.xxs,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <ThemedText variant="callout" tone="accent">
        {link.label}
      </ThemedText>
      <Icon
        name={external ? "external" : "arrowRight"}
        size={14}
        color={palette.accentText}
        weight="semibold"
      />
    </Pressable>
  );
}
