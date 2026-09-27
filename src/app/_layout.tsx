import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { persistBuster, persister, queryClient } from "@/api/query-client";
import { applyStoredAppearance } from "@/storage/appearance";
import { useBrandColors, useBrandFonts, useNavigationTheme } from "@/theme";

// Device storage is synchronous; the only thing gating the first frame is
// fonts, which are instant in real builds and load at runtime in Expo Go.
SplashScreen.preventAutoHideAsync().catch(() => {});
applyStoredAppearance();

const WEEK = 7 * 24 * 60 * 60 * 1000;

// iOS sheets get the native material (Liquid Glass on iOS 26) when the
// content is transparent; Android sheets need a real surface.
const ios = process.env.EXPO_OS === "ios";

export default function RootLayout() {
  const navigationTheme = useNavigationTheme();
  const palette = useBrandColors();
  const fontsReady = useBrandFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <KeyboardProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: WEEK, buster: persistBuster }}
        >
          <ThemeProvider value={navigationTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="rsvp"
                options={{
                  presentation: "formSheet",
                  sheetGrabberVisible: true,
                  sheetAllowedDetents: [0.75, 1],
                  contentStyle: { backgroundColor: ios ? "transparent" : palette.bgElevated },
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="compose-kindness"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen name="inquiry" options={{ presentation: "modal", headerShown: false }} />
              <Stack.Screen
                name="note/[id]"
                options={{
                  presentation: "formSheet",
                  sheetGrabberVisible: true,
                  sheetAllowedDetents: "fitToContents",
                  contentStyle: { backgroundColor: ios ? "transparent" : palette.bgElevated },
                  headerShown: false,
                }}
              />
            </Stack>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
