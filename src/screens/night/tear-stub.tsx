import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { clampTearPull, tearShouldOpen } from "@/domain/night/play";
import { duration, minTapTarget, radius, spacing, springs, useBrandColors } from "@/theme";

/**
 * The perforated edge under the pass. Pull it down past the threshold (or
 * tap it) to tear the stub open and reveal what's underneath.
 */
export function TearStub({
  torn,
  onTear,
  children,
}: {
  torn: boolean;
  onTear: () => void;
  children: ReactNode;
}) {
  const palette = useBrandColors();
  const reduceMotion = useReducedMotion();
  const pull = useSharedValue(0);

  const open = () => {
    if (torn) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTear();
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!torn && !reduceMotion)
    .activeOffsetY(6)
    .failOffsetX([-16, 16])
    .onUpdate((event) => {
      pull.value = clampTearPull(event.translationY);
    })
    .onEnd(() => {
      if (tearShouldOpen(pull.value)) open();
      pull.value = withSpring(0, springs.snappy);
    });
  const tap = Gesture.Tap().runOnJS(true).enabled(!torn).onEnd(open);

  const handleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.value }] }));

  return (
    <View style={{ gap: spacing.md }}>
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View
          accessible
          accessibilityRole="button"
          accessibilityLabel={torn ? copy.night.torn : copy.night.tear}
          accessibilityState={{ expanded: torn }}
          accessibilityHint={torn ? undefined : "Opens the stub under the pass"}
          onAccessibilityTap={open}
          style={[
            {
              minHeight: minTapTarget,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            },
            handleStyle,
          ]}
        >
          <Perforation color={palette.separatorStrong} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
            <Icon name={torn ? "check" : "arrowDown"} size={14} weight="semibold" color={palette.accentText} />
            <ThemedText variant="subheadline" tone="accent">
              {torn ? copy.night.torn : copy.night.tear}
            </ThemedText>
          </View>
          <Perforation color={palette.separatorStrong} />
        </Animated.View>
      </GestureDetector>

      {torn ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(duration.slow).springify()}
          style={{
            padding: spacing.lg,
            gap: spacing.md,
            borderRadius: radius.xl,
            borderCurve: "continuous",
            backgroundColor: palette.bgElevated,
          }}
        >
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

function Perforation({ color }: { color: string }) {
  return (
    <View
      style={{
        flex: 1,
        height: 0,
        borderTopWidth: 2,
        borderColor: color,
        borderStyle: "dashed",
      }}
    />
  );
}
