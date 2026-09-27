import { useColorScheme } from "react-native";

/**
 * Brand palette — The Artist Post "gallery at night".
 *
 * Hook-only: these are plain hex/rgba strings resolved at render time, so they
 * are safe to hand to Reanimated. Never import system `Color` values here —
 * those live in ./colors.ts (static, OS-drawn surfaces only).
 *
 * Source of truth for values: theartistpost web `src/styles/tokens.css`.
 * Values marked "AA" were darkened from the web palette so text passes WCAG AA
 * on the light paper background.
 */

export type BrandScheme = "light" | "dark";

type Palette = {
  bg: string;
  bgDeep: string;
  bgElevated: string;
  bgPressed: string;
  text: string;
  textMuted: string;
  separator: string;
  separatorStrong: string;
  accent: string;
  accentText: string;
  onAccent: string;
  accentSoft: string;
  danger: string;
  success: string;
  sparkInk: Record<SparkTone, string>;
  shadowCard: string;
  scrim: string;
};

export type SparkTone = "coral" | "gold" | "teal" | "violet";

/** Spark fills are identical in both schemes — they are the brand. */
export const spark: Record<SparkTone, string> = {
  coral: "#FF6B5B",
  gold: "#F0B429",
  teal: "#2EC4B6",
  violet: "#8B5CF6",
};

/** The ink every teal/coral/gold fill carries on top of it. */
export const inkOnSpark = "#020B1A";

/** Navy used for splash, app background config, and the always-dark Home stage. */
export const stageNavy = "#071A2E";
export const stageInk = "#061422";
/** Cream text/border on the always-dark stage band — invariant across schemes. */
export const stageText = "#FFFAF3";
export const stageTextMuted = "rgba(255, 250, 243, 0.74)";
export const stageLine = "rgba(255, 250, 243, 0.28)";
export const stageSurface = "rgba(255, 250, 243, 0.08)";
export const stagePressed = "rgba(255, 250, 243, 0.12)";

/**
 * The web's "gallery at night" light: soft teal and coral pools on navy.
 * A lit room behind the content, not a decorative hero gradient.
 */
export const stageGlow =
  "radial-gradient(ellipse at 50% 12%, rgba(46, 196, 182, 0.26) 0%, rgba(46, 196, 182, 0) 58%), radial-gradient(circle at 92% 78%, rgba(255, 107, 91, 0.16) 0%, rgba(255, 107, 91, 0) 42%), radial-gradient(circle at 6% 88%, rgba(240, 180, 41, 0.12) 0%, rgba(240, 180, 41, 0) 38%)";

export const brandPalette: Record<BrandScheme, Palette> = {
  dark: {
    bg: "#071A2E",
    bgDeep: "#061422",
    bgElevated: "#0D2C48",
    bgPressed: "#16385A",
    text: "#FFFAF3",
    textMuted: "#9AAEB8",
    separator: "rgba(255, 250, 243, 0.12)",
    separatorStrong: "rgba(255, 250, 243, 0.24)",
    accent: spark.teal,
    accentText: spark.teal,
    onAccent: inkOnSpark,
    accentSoft: "rgba(46, 196, 182, 0.14)",
    danger: "#F07178",
    success: "#3DD68C",
    sparkInk: {
      coral: spark.coral,
      gold: spark.gold,
      teal: spark.teal,
      violet: "#A78BFA", // AA — spark violet is 3.6:1 on navy
    },
    shadowCard: "0 6px 16px rgba(2, 11, 26, 0.22)",
    scrim: "rgba(2, 11, 26, 0.55)",
  },
  light: {
    bg: "#FAF6EF",
    bgDeep: "#F3EBE0",
    bgElevated: "#FFFFFF",
    bgPressed: "#F3EBE0",
    text: "#1E2A38",
    textMuted: "#5C5348",
    separator: "rgba(30, 42, 56, 0.10)",
    separatorStrong: "rgba(30, 42, 56, 0.20)",
    accent: "#E85D4C",
    accentText: "#B8402F", // AA
    onAccent: inkOnSpark, // AA — web's #FFFAF3 on coral fails
    accentSoft: "rgba(255, 107, 91, 0.12)",
    danger: "#B42318", // AA
    success: "#13795B", // AA
    sparkInk: {
      coral: "#B8402F", // AA
      gold: "#8A5A00", // AA
      teal: "#0E7C72", // AA
      violet: "#6B46C1", // AA
    },
    shadowCard: "0 8px 24px rgba(30, 42, 56, 0.10)",
    scrim: "rgba(30, 42, 56, 0.35)",
  },
};

/** Paper stage-props keep the same colors in both schemes. */
export const paper = {
  kindness: {
    bg: "#F3E9D8",
    border: "#D4C4B0",
    ink: "#1A1410",
    muted: "#5C4F45",
    meta: "#8A7A6C",
  },
  ticket: {
    bg: "#F6F1E7",
    ink: "#1A120C",
    muted: "#6B5B4E",
    stamp: "#C4523A",
    tealInk: "#0E7C72",
    perforation: "rgba(26, 18, 12, 0.22)",
  },
} as const;

/** Genre sticker fills and inks (web: color-mix of spark + deep ink). */
export const sticker: Record<SparkTone, { bg: string; ink: string; edge: string }> = {
  coral: { bg: "#F2604F", ink: "#2A100E", edge: "rgba(255, 250, 243, 0.35)" },
  teal: { bg: "#29B3A6", ink: "#062824", edge: "rgba(255, 250, 243, 0.35)" },
  gold: { bg: "#E3AA27", ink: "#3A2806", edge: "rgba(255, 250, 243, 0.40)" },
  violet: { bg: "#6A45C9", ink: "#F6F1FF", edge: "rgba(255, 250, 243, 0.30)" },
};

/** Resolved scheme: dark-first — anything but an explicit "light" is dark. */
export function useBrandScheme(): BrandScheme {
  return useColorScheme() === "light" ? "light" : "dark";
}

export function useBrandColors(): Palette {
  return brandPalette[useBrandScheme()];
}
