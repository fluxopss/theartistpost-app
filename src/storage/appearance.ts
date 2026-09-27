import { Appearance } from "react-native";

import { storageKeys } from "./keys";
import { kv, useStored } from "./kv";

export type ThemePreference = "system" | "light" | "dark";

function apply(pref: ThemePreference) {
  Appearance.setColorScheme(pref === "system" ? "unspecified" : pref);
}

/** Apply the saved theme before first render (call once at startup). */
export function applyStoredAppearance() {
  apply(kv.get<ThemePreference>(storageKeys.theme, "system"));
}

export function useThemePreference() {
  const [pref, setPref] = useStored<ThemePreference>(storageKeys.theme, "system");
  return {
    pref,
    setPref: (next: ThemePreference) => {
      setPref(next);
      apply(next);
    },
  };
}
