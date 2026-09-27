import { useFonts } from "expo-font";

import { fonts } from "./fonts";

/**
 * Release and dev builds embed these fonts natively (expo-font config plugin),
 * so this resolves immediately there. Expo Go can't embed fonts, so this is
 * what makes the brand faces appear when previewing in Expo Go.
 */
export function useBrandFonts() {
  const [loaded, error] = useFonts({
    [fonts.display]: require("@/assets/fonts/ClashDisplay-Semibold.ttf"),
    [fonts.displayBold]: require("@/assets/fonts/ClashDisplay-Bold.ttf"),
    [fonts.body]: require("@/assets/fonts/Jost-Regular.ttf"),
    [fonts.bodyMedium]: require("@/assets/fonts/Jost-Medium.ttf"),
    [fonts.bodySemibold]: require("@/assets/fonts/Jost-SemiBold.ttf"),
  });
  // A font failure should never block the app — fall through to system type.
  return loaded || error != null;
}
