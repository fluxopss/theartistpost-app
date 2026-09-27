import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { isLegalDocId, legalDocs } from "@/content/legal";
import { spacing } from "@/theme";

import { LegalContactGroup } from "./legal-contact-group";
import { LegalNotFound } from "./legal-not-found";
import { LegalSectionBlock } from "./legal-section-block";

/** Privacy, Terms or Support — the web pages' text, set for reading. */
export function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  if (!isLegalDocId(doc)) return <LegalNotFound />;

  const legal = legalDocs[doc];

  return (
    <>
      <Stack.Screen options={{ title: legal.title }} />
      <ScreenScroll gap={spacing.xl}>
        <View style={{ gap: spacing.xxs }}>
          <ThemedText variant="eyebrow" tone="spark-coral">
            {legal.kicker}
          </ThemedText>
          {legal.updated ? (
            <ThemedText variant="footnote" tone="muted" selectable>
              Last updated {legal.updated}.
            </ThemedText>
          ) : null}
        </View>
        {legal.sections.map((section, index) => (
          <LegalSectionBlock key={section.heading ?? `intro-${index}`} section={section} />
        ))}
        <LegalContactGroup kinds={legal.contact} />
      </ScreenScroll>
    </>
  );
}
