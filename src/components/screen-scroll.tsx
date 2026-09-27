import { forwardRef, type ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { screenMargin, spacing, useBrandColors } from "@/theme";

/**
 * The standard scrolling screen body. First child of every stack screen so
 * large titles, safe areas, tab-bar insets and scroll-to-top all work.
 */
export const ScreenScroll = forwardRef<
  ScrollView,
  Omit<ScrollViewProps, "contentContainerStyle"> & {
    children: ReactNode;
    /** Horizontal padding; pass 0 for full-bleed sections. */
    inset?: number;
    gap?: number;
    refreshing?: boolean;
    onRefresh?: () => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
>(function ScreenScroll(
  {
    children,
    inset = screenMargin,
    gap = spacing.xxl,
    refreshing,
    onRefresh,
    contentContainerStyle,
    ...props
  },
  ref,
) {
  const palette = useBrandColors();
  return (
    <ScrollView
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[
        {
          paddingHorizontal: inset,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxxl,
          gap,
        },
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={palette.accent}
            colors={[palette.accent]}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
});
