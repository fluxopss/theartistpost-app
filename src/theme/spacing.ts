/** 4-point grid. 12 and 20 recur in the brand layouts, so they are named steps. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Content screens breathe at 20; grouped native lists sit at 16. */
export const screenMargin = spacing.lg;

/** Minimum touch target (Apple 44pt; Android 48dp is met via hitSlop). */
export const minTapTarget = 44;
