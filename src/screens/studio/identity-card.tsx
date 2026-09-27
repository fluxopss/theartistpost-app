import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { appCopy } from "@/content/site";
import { useStudio } from "@/storage/studio";
import {
  radius,
  spacing,
  spark,
  stageGlow,
  stageLine,
  stageNavy,
  stageSurface,
  stageText,
} from "@/theme";

/** Diameter of the studio monogram. */
const MONOGRAM = 56;

/**
 * The studio nameplate — a small placard lit in the house's always-night
 * palette, so it reads the same in light and dark mode. Name and city live
 * only on this phone; Edit opens Settings.
 */
export function IdentityCard() {
  const { studio, isGuest } = useStudio();
  const initial = studio.displayName.trim().charAt(0).toUpperCase();
  const summary = [appCopy.studioKicker, studio.displayName, studio.city].filter(Boolean).join(". ");

  return (
    <View
      style={{
        backgroundColor: stageNavy,
        experimental_backgroundImage: stageGlow,
        borderRadius: radius.xl,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: stageLine,
        overflow: "hidden",
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: MONOGRAM,
            height: MONOGRAM,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: stageLine,
            backgroundColor: stageSurface,
          }}
        >
          {isGuest || !initial ? (
            <Icon name="studio" size={28} color={stageText} />
          ) : (
            // Decorative glyph in a fixed circle — it does not grow with Dynamic Type.
            <ThemedText variant="title1" maxFontSizeMultiplier={1} style={{ color: spark.teal }}>
              {initial}
            </ThemedText>
          )}
        </View>
        <Button
          title="Edit"
          variant="onStage"
          icon="pencil"
          accessibilityLabel="Edit studio"
          accessibilityHint="Opens Settings"
          onPress={() => router.push("/settings")}
        />
      </View>

      <View accessible accessibilityLabel={summary} style={{ gap: spacing.xxs }}>
        <ThemedText variant="eyebrow" style={{ color: spark.coral }}>
          {appCopy.studioKicker}
        </ThemedText>
        <ThemedText variant="title1" tone="onStage" selectable>
          {studio.displayName}
        </ThemedText>
        {studio.city ? (
          <ThemedText variant="subheadline" tone="onStageMuted" selectable>
            {studio.city}
          </ThemedText>
        ) : null}
      </View>

      {isGuest ? (
        <ThemedText variant="footnote" tone="onStageMuted">
          {appCopy.guestLine}
        </ThemedText>
      ) : null}
    </View>
  );
}
