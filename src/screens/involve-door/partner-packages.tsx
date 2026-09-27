import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { partnerPackages } from "@/content/participate";
import { radius, type SparkTone, spacing, useBrandColors } from "@/theme";
import { followHref } from "@/utils/links";

/** Three ways to open a door for artists — each row goes straight to its ask. */
export function PartnerPackages({ tone }: { tone: SparkTone }) {
  const palette = useBrandColors();
  return (
    <View
      style={{
        backgroundColor: palette.bgElevated,
        borderRadius: radius.md,
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      {partnerPackages.map((pkg, i) => {
        const mail = pkg.href.startsWith("mailto:");
        return (
          <Pressable
            key={pkg.id}
            accessibilityRole={mail ? "link" : "button"}
            accessibilityLabel={`${pkg.title}. ${pkg.body}`}
            accessibilityHint={pkg.cta}
            onPress={() => followHref(pkg.href)}
            style={({ pressed }) => ({
              paddingLeft: spacing.md,
              backgroundColor: pressed ? palette.bgPressed : "transparent",
            })}
          >
            <View
              style={{
                gap: spacing.xxs,
                paddingVertical: spacing.md,
                paddingRight: spacing.md,
                borderBottomWidth: i < partnerPackages.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: palette.separator,
              }}
            >
              <ThemedText variant="eyebrow" tone={`spark-${tone}`}>
                {pkg.kicker}
              </ThemedText>
              <ThemedText variant="headline">{pkg.title}</ThemedText>
              <ThemedText variant="subheadline" tone="muted">
                {pkg.body}
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginTop: spacing.xxs }}>
                <ThemedText variant="footnote" tone="accent">
                  {pkg.cta}
                </ThemedText>
                <Icon
                  name={mail ? "email" : "arrowRight"}
                  size={13}
                  color={palette.accentText}
                  weight="semibold"
                />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
