import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { View } from "react-native";

import { ListGroup } from "@/components/list-row";
import { type ThemePreference, useThemePreference } from "@/storage/appearance";
import { spacing, useBrandColors, useBrandScheme } from "@/theme";

const options: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** System / Light / Dark — the native segmented control, bound to the saved preference. */
export function AppearanceGroup() {
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const { pref, setPref } = useThemePreference();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === pref),
  );

  return (
    <ListGroup header="Appearance" footer="System follows your phone’s Light or Dark setting.">
      <View style={{ padding: spacing.md }}>
        <SegmentedControl
          values={options.map((option) => option.label)}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            const next = options[event.nativeEvent.selectedSegmentIndex];
            if (next && next.value !== pref) setPref(next.value);
          }}
          // Match the app's resolved scheme even when the OS reports none.
          appearance={scheme}
          // Android selected-segment fill (iOS draws its own).
          tintColor={palette.accentSoft}
        />
      </View>
    </ListGroup>
  );
}
