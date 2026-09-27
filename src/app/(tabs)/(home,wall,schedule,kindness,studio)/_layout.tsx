import { Stack } from "expo-router/stack";
import { useMemo } from "react";

/**
 * One physical folder, five virtual tabs. Expo Router mounts this layout
 * once per tab (`(home)`, `(wall)`, …), each with its own Stack instance and
 * navigation history, all sharing the route files below — so a push from
 * any tab (post/[slug], artist/[handle], event/[id], night) stays inside
 * that tab's own stack instead of jumping to a separate global one.
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

export default function SharedTabStack({ segment }: { segment: string }) {
  const tab = segment.match(/\((.*)\)/)?.[1] ?? "home";
  const anchorFile = tab === "home" ? "index" : tab;

  // Home carries its own branded hero — no native header competing with it.
  const anchorOptions = useMemo(
    () =>
      tab === "home"
        ? { headerShown: false }
        : { title: anchorTitles[tab], headerLargeTitleEnabled: true },
    [tab],
  );

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name={anchorFile} options={anchorOptions} />
    </Stack>
  );
}
