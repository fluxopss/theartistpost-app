import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { persistBuster, persister, queryClient } from "@/api/query-client";
import { applyStoredAppearance } from "@/storage/appearance";
import { useBrandColors, useNavigationTheme } from "@/theme";

// Fonts are linked natively via the expo-font config plugin, and device
// storage is synchronous — nothing async gates the first frame.
SplashScreen.preventAutoHideAsync().catch(() => {});
applyStoredAppearance();

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function RootLayout() {
  const navigationTheme = useNavigationTheme();
  const palette = useBrandColors();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

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
                  contentStyle: { backgroundColor: "transparent" },
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
                  contentStyle: { backgroundColor: "transparent" },
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
