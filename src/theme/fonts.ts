/**
 * Font family names. Files in assets/fonts are embedded with the expo-font
 * config plugin; each file name equals its PostScript name so the same string
 * resolves on iOS and Android. Weight comes from the family name — never set
 * `fontWeight` alongside these.
 *
 * Clash Display © Indian Type Foundry (Fontshare, ITF Free Font License —
 * credited in About). Jost © Indestructible Type (SIL OFL 1.1).
 */
export const fonts = {
  display: "ClashDisplay-Semibold",
  displayBold: "ClashDisplay-Bold",
  body: "Jost-Regular",
  bodyMedium: "Jost-Medium",
  bodySemibold: "Jost-SemiBold",
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];
