import type { TextStyle } from "react-native";

import { fonts } from "./fonts";

/**
 * Type ramp aligned to the native text styles, voiced in the brand faces:
 * Clash Display for headlines, Jost for reading text. Color is applied by
 * ThemedText at render time (brand colors are hook-only).
 */
export const type = {
  display: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  largeTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  title1: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
  },
  title2: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  title3: { fontFamily: fonts.bodySemibold, fontSize: 20, lineHeight: 25 },
  headline: { fontFamily: fonts.bodySemibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24 },
  callout: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  subheadline: { fontFamily: fonts.body, fontSize: 15, lineHeight: 20 },
  footnote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  counter: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Only the showpiece display line caps scaling; everything else grows freely. */
export const maxFontScale: Partial<Record<TypeVariant, number>> = {
  display: 1.3,
  largeTitle: 1.5,
};
