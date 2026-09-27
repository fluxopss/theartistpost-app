import { Stack } from "expo-router";

import { ScreenScroll } from "@/components/screen-scroll";

import { AboutAppGroup } from "./about-app-group";
import { AppearanceGroup } from "./appearance-group";
import { DeviceDataGroup } from "./device-data-group";
import { StudioFields } from "./studio-fields";

/**
 * Settings: the on-device studio, appearance, what this phone keeps, and the
 * legal pages. There are no accounts in this build, so no sign-in here.
 */
export function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScreenScroll>
        <StudioFields />
        <AppearanceGroup />
        <DeviceDataGroup />
        <AboutAppGroup />
      </ScreenScroll>
    </>
  );
}
