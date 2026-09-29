import { View } from "react-native";

import { OpenStatusPill } from "@/components/open-status-pill";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { site } from "@/content/site";
import { spacing } from "@/theme";
import { contact } from "@/utils/links";

import { ActionTile } from "./action-tile";

/** The live room: where it is, whether it's open, and the three ways in. */
export function VisitBlock() {
  return (
    <View style={{ gap: spacing.md }}>
      {/* Eyebrow + title from the web Studio hub's Visit block. */}
      <SectionHeader eyebrow="Visit" eyebrowTone="spark-gold" title="Hacienda on Clematis" />
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="subheadline" tone="muted" selectable>
          {site.address.full}
        </ThemedText>
        <OpenStatusPill />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <ActionTile
          icon="phone"
          label="Call"
          tone="teal"
          accessibilityHint={`Calls ${site.phone}`}
          onPress={contact.call}
        />
        <ActionTile
          icon="directions"
          label="Directions"
          tone="gold"
          accessibilityHint="Opens Maps"
          onPress={contact.directions}
        />
        <ActionTile
          icon="donate"
          label="Donate"
          tone="coral"
          accessibilityHint="Opens the donate screen"
          onPress={contact.donate}
        />
      </View>
    </View>
  );
}
