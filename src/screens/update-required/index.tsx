import Constants from "expo-constants";
import { Linking, View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { storeUrl } from "@/domain/app/store-link";
import { screenMargin, spacing, useBrandColors } from "@/theme";

/**
 * Shown instead of the app when this version is older than the house's
 * `minSupportedVersion`. Calm and single-purpose: one line of why, one button.
 */
export function UpdateRequiredScreen() {
  const palette = useBrandColors();
  const url = storeUrl(process.env.EXPO_OS, Constants.expoConfig?.android?.package);

  return (
    <View
      accessibilityViewIsModal
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        paddingHorizontal: screenMargin,
        backgroundColor: palette.bg,
      }}
    >
      <Icon name="refresh" size={36} color={palette.accentText} />
      <ThemedText variant="title2" accessibilityRole="header" style={{ textAlign: "center" }}>
        Please update The Artist Post
      </ThemedText>
      <ThemedText variant="body" tone="muted" style={{ textAlign: "center" }}>
        This version is too old to keep up with the house. The newest one is free and takes a moment.
      </ThemedText>
      {url ? (
        <Button
          title="Update the app"
          size="lg"
          icon="arrowRight"
          onPress={() => void Linking.openURL(url)}
          accessibilityHint="Opens the app store"
        />
      ) : null}
    </View>
  );
}
