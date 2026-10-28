import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { type PresentedBy as Sponsor, presentedByLine } from "@/domain/events/sponsors";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";
import { openExternal } from "@/utils/links";

const LOGO_SIZE = 32;

/**
 * "Presented by <name>": the plain disclosure on a sponsored night. Renders
 * nothing for a night without a sponsor, so unsponsored nights carry no
 * sponsor wording at all.
 *
 * Shows the logo when there is one; the name opens the sponsor's own site in
 * the browser when there is a link. (List rows and tickets carry a small
 * text line instead; see `EventRow` / `TicketPass`.)
 */
export function PresentedByRow({ sponsor }: { sponsor: Sponsor | null | undefined }) {
  const palette = useBrandColors();
  if (!sponsor) return null;

  const url = sponsor.url;
  const content = (
    <>
      {sponsor.logoUrl ? (
        <Image
          source={sponsor.logoUrl}
          contentFit="contain"
          accessible={false}
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            borderRadius: radius.sm,
            backgroundColor: palette.bgElevated,
          }}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <ThemedText variant="footnote" tone="muted">
          Presented by
        </ThemedText>
        <ThemedText variant="headline">{sponsor.name}</ThemedText>
      </View>
      {url ? <Icon name="external" size={16} color={palette.textMuted} weight="semibold" /> : null}
    </>
  );

  const rowStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    minHeight: minTapTarget,
  };

  if (!url) {
    return (
      <View testID="presented-by" accessible accessibilityLabel={presentedByLine(sponsor.name)} style={rowStyle}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID="presented-by"
      accessibilityRole="link"
      accessibilityLabel={presentedByLine(sponsor.name)}
      accessibilityHint="Opens their website"
      onPress={() => void openExternal(url)}
      style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}
