import { DarkTheme, DefaultTheme, type Theme } from "expo-router";
import { useMemo } from "react";

import { brandPalette, useBrandScheme } from "./brand";
import { fonts } from "./fonts";

/**
 * React Navigation theme built from the brand palette so stack backgrounds,
 * headers and cards never flash white/black between screens.
 */
export function useNavigationTheme(): Theme {
  const scheme = useBrandScheme();
  return useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    const palette = brandPalette[scheme];
    return {
      ...base,
      dark: scheme === "dark",
      colors: {
        ...base.colors,
        primary: palette.accent,
        background: palette.bg,
        card: palette.bg,
        text: palette.text,
        border: palette.separator,
        notification: palette.accent,
      },
      fonts: {
        ...base.fonts,
        regular: { fontFamily: fonts.body, fontWeight: "normal" },
        medium: { fontFamily: fonts.bodyMedium, fontWeight: "normal" },
        bold: { fontFamily: fonts.bodySemibold, fontWeight: "normal" },
        heavy: { fontFamily: fonts.display, fontWeight: "normal" },
      },
    };
  }, [scheme]);
}
