import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { spacing } from "@/theme";

export default function KindnessScreen() {
  return (
    <ScreenScroll contentContainerStyle={{ gap: spacing.sm }}>
      <ThemedText variant="eyebrow" tone="spark-violet">
        {site.shine}
      </ThemedText>
      <ThemedText variant="body" tone="muted">
        {copy.kindness.body}
      </ThemedText>
    </ScreenScroll>
  );
}
