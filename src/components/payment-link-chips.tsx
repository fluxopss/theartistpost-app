import { Alert, Linking, Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  chipAccessibilityLabel,
  leavingNotice,
  usablePaymentLinks,
  type PaymentLinkDTO,
} from "@/domain/payments/payment-links";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

/**
 * An artist's own payment services, as chips. Link-out only: each tap asks
 * first, then hands the https link to the system (the Venmo/Cash App/PayPal
 * app if installed, otherwise the browser). Nothing is processed in the app,
 * and these are personal payments to the artist, never "donations".
 */
export function PaymentLinkChips({
  links,
  name,
  handle,
}: {
  links: PaymentLinkDTO[] | undefined;
  name: string;
  handle: string;
}) {
  const palette = useBrandColors();
  const usable = usablePaymentLinks(links);
  if (usable.length === 0) return null;

  const confirmAndOpen = (link: PaymentLinkDTO) => {
    const notice = leavingNotice(link, handle);
    Alert.alert(notice.title, notice.message, [
      { text: notice.cancelLabel, style: "cancel" },
      {
        text: notice.confirmLabel,
        onPress: () => {
          Linking.openURL(link.url).catch(() => {
            Alert.alert(`Couldn't open ${link.label}`, "Try again in a moment.");
          });
        },
      },
    ]);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <ThemedText variant="subheadline" accessibilityRole="header">
        Pay {name} directly
      </ThemedText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {usable.map((link) => (
          <Pressable
            key={link.service}
            accessibilityRole="button"
            accessibilityLabel={chipAccessibilityLabel(link, name)}
            accessibilityHint="Asks before leaving The Artist Post"
            onPress={() => confirmAndOpen(link)}
            style={({ pressed }) => ({
              minHeight: minTapTarget,
              minWidth: minTapTarget,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: spacing.lg,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: palette.separatorStrong,
              backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
            })}
          >
            <ThemedText variant="subheadline">{link.label}</ThemedText>
          </Pressable>
        ))}
      </View>
      <ThemedText variant="footnote" tone="muted">
        Goes straight to {name}. The Artist Post takes no cut.
      </ThemedText>
    </View>
  );
}
