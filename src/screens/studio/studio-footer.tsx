import Constants from "expo-constants";
import { View } from "react-native";

import { LogoMark } from "@/components/logo-mark";
import { ThemedText } from "@/components/themed-text";
import { site } from "@/content/site";
import { spacing } from "@/theme";

/** The nonprofit sign-off: who runs the house, its EIN, and this build. */
export function StudioFooter() {
  const version = Constants.expoConfig?.version;

  return (
    <View style={{ alignItems: "center", gap: spacing.xxs, paddingTop: spacing.md }}>
      <LogoMark size={40} />
      <ThemedText variant="footnote" tone="muted" style={{ textAlign: "center", marginTop: spacing.xs }}>
        {site.nonprofitLine}
      </ThemedText>
      <ThemedText variant="footnote" tone="muted" selectable style={{ textAlign: "center" }}>
        EIN {site.ein}
      </ThemedText>
      <ThemedText variant="caption" tone="muted" style={{ textAlign: "center" }}>
        {site.copyright}
      </ThemedText>
      {version ? (
        <ThemedText variant="caption" tone="muted" selectable style={{ textAlign: "center" }}>
          Version {version}
        </ThemedText>
      ) : null}
    </View>
  );
}
