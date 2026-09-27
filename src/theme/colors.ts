import { Color } from "expo-router";
import { Platform } from "react-native";

/**
 * System semantic colors — static-safe, resolved on device, adapt to
 * light/dark and accessibility contrast automatically. Used only where the
 * OS draws the surface (native list separators, input placeholders, fills
 * behind native controls). Brand surfaces use `useBrandColors()` instead.
 *
 * On Android, components rendering these must call `useColorScheme()` so they
 * re-render when the theme flips.
 */
export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#1E2A38",
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#5C5348",
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "rgba(30, 42, 56, 0.10)",
  })!,
  placeholderText: Platform.select({
    ios: Color.ios.placeholderText,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#8A7A6C",
  })!,
  systemFill: Platform.select({
    ios: Color.ios.systemFill,
    android: Color.android.dynamic.surfaceVariant,
    default: "rgba(120, 120, 128, 0.2)",
  })!,
};
