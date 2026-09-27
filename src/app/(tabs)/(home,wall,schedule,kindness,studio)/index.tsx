import { View } from "react-native";

import { LogoMark } from "@/components/logo-mark";
import { OpenStatusPill } from "@/components/open-status-pill";
import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { spacing } from "@/theme";

/**
 * Home has no native header — the branded hero is the header. Full house
 * content (genre rail, doors, mantra, ambient kindness) lands in P2.
 */
export default function HomeScreen() {
  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: spacing.xxxl }}>
      <View style={{ alignItems: "center", gap: spacing.md }}>
        <LogoMark size={88} settle />
        <ThemedText variant="eyebrow" tone="spark-teal">
          {copy.house.hub}
        </ThemedText>
        <ThemedText variant="display" style={{ textAlign: "center" }}>
          {copy.house.headline}
        </ThemedText>
        <ThemedText variant="body" tone="muted" style={{ textAlign: "center" }}>
          {site.tagline}
        </ThemedText>
        <OpenStatusPill />
      </View>
    </ScreenScroll>
  );
}
