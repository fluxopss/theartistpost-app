import { View } from "react-native";

import { Button } from "@/components/button";
import { NumberedList } from "@/components/numbered-list";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { appCopy, links } from "@/content/site";
import { spacing } from "@/theme";
import { contact, openExternal } from "@/utils/links";

/** How an artist gets onto the schedule — the web's onboarding wizard, as one honest list. */
export function ArtistOnboarding() {
  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader eyebrow="For artists" eyebrowTone="spark-gold" title={appCopy.onboardingTitle} />
      <ThemedText variant="body" tone="muted">
        {appCopy.onboardingLead}
      </ThemedText>
      <NumberedList items={appCopy.onboardingSteps} tone="gold" />
      <View style={{ gap: spacing.xs }}>
        <Button
          title="Review the agreement"
          tone="gold"
          icon="external"
          accessibilityHint="Opens the artist agreement in your browser"
          onPress={() => void openExternal(links.artistAgreement)}
        />
        <Button
          title="Questions? Email Robbie"
          variant="ghost"
          icon="email"
          onPress={() => contact.email("Artist schedule")}
        />
      </View>
    </View>
  );
}
