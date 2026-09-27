import { ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useBrandColors, useNavigationTheme } from "@/theme";

// Fonts are linked natively via the expo-font config plugin (app.json), so
// there is nothing async to gate on — hide the splash on first paint.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const navigationTheme = useNavigationTheme();
  const palette = useBrandColors();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
