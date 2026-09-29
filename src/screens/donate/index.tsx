import { router, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { FramedImage } from "@/components/framed-image";
import { ListGroup, ListRow } from "@/components/list-row";
import { NumberedList } from "@/components/numbered-list";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { whatThisFunds } from "@/content/participate";
import { copy, site } from "@/content/site";
import { spacing } from "@/theme";
import { brandImages } from "@/utils/brand-images";
import { contact, openExternal } from "@/utils/links";

/** Venmo profile for the handle published in site content. */
const venmoUrl = `https://venmo.com/u/${site.venmo.replace(/^@/, "")}`;

/**
 * Dedicated donate screen: brand, why, PayPal (system browser), paths, transparency.
 * Payments stay on PayPal/Venmo — this screen is the house story, not a checkout.
 */
export function DonateScreen() {
  return (
    <>
      <Stack.Screen options={{ title: copy.donate.kicker, headerLargeTitleEnabled: false }} />
      <ScreenScroll>
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <ThemedText variant="eyebrow" tone="spark-coral">
              {site.mark}
            </ThemedText>
            <ThemedText variant="title1">{copy.donate.title}</ThemedText>
            <ThemedText variant="body" tone="muted">
              {copy.donate.lead}
            </ThemedText>
          </View>
          <FramedImage
            source={brandImages.donations}
            alt="Donations appreciated — toward a permanent home for art"
          />
          <Button
            title={copy.donate.onceCta}
            icon="donate"
            tone="coral"
            size="lg"
            accessibilityHint="Opens PayPal in your browser"
            onPress={contact.paypalOnce}
          />
          <Button
            title={copy.donate.monthlyCta}
            icon="donate"
            variant="secondary"
            size="lg"
            accessibilityHint="Opens PayPal; choose monthly on their page if offered"
            onPress={contact.paypalMonthly}
          />
          <ThemedText variant="footnote" tone="muted">
            {copy.donate.monthlyNote}
          </ThemedText>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            eyebrow={copy.donate.fundsTitle}
            eyebrowTone="spark-gold"
            title="What a gift funds"
          />
          <NumberedList items={whatThisFunds} tone="gold" />
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            eyebrow={copy.donate.pathsTitle}
            eyebrowTone="spark-teal"
            title="Three ways to help"
          />
          <ThemedText variant="callout" tone="muted">
            {copy.donate.pathsLead}
          </ThemedText>
          <ListGroup>
            <ListRow
              icon="heart"
              title={copy.donate.venmoCta}
              value={site.venmo}
              subtitle={copy.donate.donatePathBody}
              onPress={() => void openExternal(venmoUrl)}
              external
            />
            <ListRow
              icon="people"
              title={copy.donate.sponsorPathTitle}
              subtitle={copy.donate.sponsorPathBody}
              onPress={() =>
                router.push({ pathname: "/get-involved/[door]", params: { door: "partner" } })
              }
            />
            <ListRow
              icon="kindness"
              title={copy.donate.shopPathTitle}
              subtitle={copy.donate.shopPathBody}
              onPress={contact.merch}
              external
              separator={false}
            />
          </ListGroup>
        </View>

        <View style={{ gap: spacing.xs, paddingBottom: spacing.xl }}>
          <ThemedText variant="eyebrow" tone="spark-gold">
            {copy.donate.transparencyTitle}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted">
            {site.nonprofitLine}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted" selectable>
            EIN {site.ein}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted">
            {copy.about.proceeds}
          </ThemedText>
        </View>
      </ScreenScroll>
    </>
  );
}
