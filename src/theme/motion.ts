import { Easing } from "react-native-reanimated";

/** Durations in ms — state feedback, element transitions, large surfaces. */
export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

/** The web's signature ease-out: cubic-bezier(0.22, 1, 0.36, 1). */
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

/** Reanimated spring configs shared across the app. */
export const springs = {
  snappy: { damping: 20, stiffness: 300 },
  bouncy: { damping: 12, stiffness: 180 },
  gentle: { damping: 26, stiffness: 170 },
} as const;
