import { View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { doorById } from "@/content/involve";
import { copy, links } from "@/content/site";
import type { InvolveIntent } from "@/domain/involve/intents";
import { spacing, useBrandColors } from "@/theme";
import { openExternal } from "@/utils/links";

/** Split bundled copy into sentences so one line can lead and the rest follow. */
function sentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
}

/**
 * The confirmation. Space inquiries get the real next step — the artist
 * agreement — because approval and the scheduling link both wait on it.
 */
export function InquirySuccess({ intent }: { intent: InvolveIntent }) {
  const palette = useBrandColors();
  const [received, ...afterReceived] = sentences(copy.involve.success);
  const followUp = sentences(copy.involve.formBody).at(-1);
  const agreement = doorById("space").primary;

  return (
    <View style={{ alignItems: "center", gap: spacing.sm, paddingTop: spacing.xxl }}>
      <Icon name="checkCircle" size={56} color={palette.success} weight="semibold" />
      <ThemedText variant="eyebrow" tone="spark-violet" style={{ marginTop: spacing.xs }}>
        {copy.involve.shine}
      </ThemedText>
      <ThemedText variant="title1" accessibilityRole="header" style={{ textAlign: "center" }}>
        {received}
      </ThemedText>
      <ThemedText variant="body" tone="muted" style={{ textAlign: "center" }}>
        {intent === "space" ? afterReceived.join(" ") : followUp}
      </ThemedText>
      {intent === "space" ? (
        <Button
          title={agreement.label}
          icon="external"
          tone="coral"
          size="lg"
          accessibilityHint="Opens the artist agreement form"
          onPress={() => void openExternal(links.artistAgreement)}
          style={{ alignSelf: "stretch", marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}
