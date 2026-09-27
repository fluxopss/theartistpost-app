import { Stack } from "expo-router/stack";
import { useMemo } from "react";

import { fonts, useBrandColors } from "@/theme";

/**
 * One physical folder, five virtual tabs. Expo Router mounts this layout
 * once per tab (`(home)`, `(wall)`, …), each with its own Stack instance and
 * navigation history, all sharing the route files below — so a push from
 * any tab (post/[slug], event/[id], night, about…) stays inside that tab's
 * own stack instead of jumping to a separate global one.
 *
 * `unstable_settings` tells each virtual tab which file is its root/anchor.
 */
export const unstable_settings = {
  home: { anchor: "index" },
  wall: { anchor: "wall" },
  schedule: { anchor: "schedule" },
  kindness: { anchor: "kindness" },
  studio: { anchor: "studio" },
};

const anchorTitles: Record<string, string> = {
  home: "Home",
  wall: "The Wall",
  schedule: "Schedule",
  kindness: "Kindness",
  studio: "Studio",
};

const ios = process.env.EXPO_OS === "ios";

export default function SharedTabStack({ segment }: { segment: string }) {
  const palette = useBrandColors();
  const tab = segment.match(/\((.*)\)/)?.[1] ?? "home";
  const anchorFile = tab === "home" ? "index" : tab;

  // Home carries its own branded stage — no native header competing with it.
  const anchorOptions = useMemo(
    () =>
      tab === "home"
        ? { headerShown: false, title: anchorTitles.home }
        : { title: anchorTitles[tab], headerLargeTitleEnabled: ios },
    [tab],
  );

  return (
    <Stack
      screenOptions={{
        // iOS insets scroll content under a transparent header (and iOS 26
        // adds its own scroll-edge effect). Android has no automatic
        // insets, so it gets a solid header in the page color instead.
        headerTransparent: ios,
        headerStyle: ios ? undefined : { backgroundColor: palette.bg },
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: palette.accentText,
        headerTitleStyle: { fontFamily: fonts.bodySemibold, color: palette.text },
        headerLargeTitleStyle: { fontFamily: fonts.display, color: palette.text },
        contentStyle: { backgroundColor: palette.bg },
      }}
    >
      <Stack.Screen name={anchorFile} options={anchorOptions} />
    </Stack>
  );
}
