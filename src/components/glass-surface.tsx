import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, type StyleProp, View, type ViewStyle } from "react-native";

import { radius, useBrandColors, useBrandScheme } from "@/theme";

/**
 * Floating surface material: Liquid Glass on iOS 26+, system blur before
 * that, and a solid surface when Reduce Transparency is on (or on Android,
 * where a flat elevated surface is the native look).
 */
export function GlassSurface({
  children,
  interactive = false,
  style,
}: {
  children: ReactNode;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );
    return () => sub.remove();
  }, []);

  const shape: ViewStyle = { borderRadius: radius.lg, borderCurve: "continuous" };

  if (process.env.EXPO_OS !== "ios" || reduceTransparency) {
    return (
      <View style={[shape, { backgroundColor: palette.bgElevated }, style]}>{children}</View>
    );
  }

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive={interactive} style={[shape, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      tint={scheme === "dark" ? "systemMaterialDark" : "systemMaterialLight"}
      intensity={80}
      style={[shape, { overflow: "hidden" }, style]}
    >
      {children}
    </BlurView>
  );
}
