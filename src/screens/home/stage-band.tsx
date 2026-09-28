import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { LogoMark } from "@/components/logo-mark";
import { OpenStatusPill } from "@/components/open-status-pill";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { duration, easeOut, screenMargin, spacing, stageGlow, stageNavy } from "@/theme";

/**
 * The house entrance. Always navy — the "gallery at night" — in both light
 * and dark mode, lit by the brand glow. Brand first; one CTA pair; full-bleed.
 */
export function StageBand() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  // iOS: the scroll view already insets content below the status bar, so
  // pull the band up under it. Android draws edge-to-edge from y=0.
  const ios = process.env.EXPO_OS === "ios";
  const copyOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const copyY = useSharedValue(reduceMotion ? 0 : 14);

  useEffect(() => {
    if (reduceMotion) return;
    copyOpacity.value = withDelay(120, withTiming(1, { duration: duration.slow, easing: easeOut }));
    copyY.value = withDelay(120, withTiming(0, { duration: duration.slow, easing: easeOut }));
  }, [copyOpacity, copyY, reduceMotion]);

  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyY.value }],
  }));

  return (
    <View
      style={{
        backgroundColor: stageNavy,
        experimental_backgroundImage: stageGlow,
        marginTop: ios ? -insets.top : 0,
        paddingTop: insets.top + spacing.xl,
        paddingBottom: spacing.xxl,
        paddingHorizontal: screenMargin,
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      {/* Overscroll backdrop so a pull-down never reveals a paper strip. */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: -800, left: 0, right: 0, height: 800, backgroundColor: stageNavy }}
      />
      <LogoMark size={112} settle />
      <Animated.View style={[{ alignItems: "center", gap: spacing.xs }, copyStyle]}>
        <ThemedText variant="eyebrow" tone="spark-teal">
          {site.mark} · {copy.house.hub}
        </ThemedText>
        <ThemedText
          variant="display"
          tone="onStage"
          accessibilityRole="header"
          style={{ textAlign: "center" }}
        >
          {copy.house.headline}
        </ThemedText>
        <ThemedText variant="callout" tone="onStageMuted" style={{ textAlign: "center", maxWidth: 360 }}>
          {site.heroSupport}
        </ThemedText>
      </Animated.View>
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.delay(220).duration(duration.slow).springify()}
        style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}
      >
        <Button
          title={copy.house.ctaInvolve}
          tone="coral"
          size="lg"
          onPress={() => router.push("/get-involved")}
        />
        <Button
          title={copy.house.ctaKindness}
          variant="onStage"
          size="lg"
          onPress={() => router.push("/compose-kindness")}
        />
      </Animated.View>
      <OpenStatusPill tone="stage" />
    </View>
  );
}
