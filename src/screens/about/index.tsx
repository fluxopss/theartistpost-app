import { router, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { FramedImage } from "@/components/framed-image";
import { ListGroup, ListRow } from "@/components/list-row";
import { OpenStatusPill } from "@/components/open-status-pill";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { history } from "@/content/history";
import { copy, site } from "@/content/site";
import { spacing, useBrandColors } from "@/theme";
import { brandImages } from "@/utils/brand-images";
import { contact, openExternal } from "@/utils/links";

import { MarksWall } from "./marks-wall";

/** Required by the Clash Display (ITF Free Font License) and Jost (OFL) terms. */
const FONT_CREDIT = "Clash Display by Indian Type Foundry (Fontshare). Jost by Indestructible Type (SIL OFL).";

/** Venmo profile for the handle published in site content. */
const venmoUrl = `https://venmo.com/u/${site.venmo.replace(/^@/, "")}`;

/** Who the house is, where it stands, and how to keep the lights on. */
export function AboutScreen() {
  const palette = useBrandColors();

  return (
    <>
      <ScreenScroll>
        <View style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <ThemedText variant="eyebrow" tone="spark-coral">
              {site.mark}
            </ThemedText>
            <ThemedText variant="body">{copy.about.mission}</ThemedText>
          </View>
          <View
            style={{
              borderLeftWidth: 4,
              borderLeftColor: palette.sparkInk.gold,
              paddingLeft: spacing.md,
              paddingVertical: spacing.xxs,
            }}
          >
            <ThemedText variant="title3">{copy.about.proceeds}</ThemedText>
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          <SectionHeader
            eyebrow={copy.about.marksKicker}
            eyebrowTone="spark-violet"
            title={copy.about.marksTitle}
          />
          <MarksWall />
          <ThemedText variant="body" tone="muted">
            {copy.about.marksBody}
          </ThemedText>
        </View>

        <View style={{ gap: spacing.md }}>
          <SectionHeader eyebrow={site.address.line1} eyebrowTone="spark-teal" title={copy.about.liveRoomTitle} />
          <FramedImage
            source={brandImages.hacienda}
            alt="The Artist Post live space at Hacienda on Clematis Street"
          />
          <ThemedText variant="body" tone="muted">
            {copy.about.liveRoomBody}
          </ThemedText>
          <OpenStatusPill />
          <ListGroup>
            <ListRow
              icon="directions"
              title={copy.home.getDirections}
              subtitle={site.address.full}
              onPress={contact.directions}
              external
              separator={false}
            />
          </ListGroup>
        </View>

        <View style={{ gap: spacing.md }}>
          <SectionHeader eyebrow={site.kindnessMark} eyebrowTone="spark-gold" title={copy.about.supportTitle} />
          <ThemedText variant="body" tone="muted">
            {copy.about.supportBody}
          </ThemedText>
          <Button
            title={copy.about.donateCta}
            icon="donate"
            tone="coral"
            size="lg"
            accessibilityHint="Opens the donate screen"
            onPress={contact.donate}
          />
          <ListGroup>
            <ListRow
              icon="heart"
              title="Venmo"
              value={site.venmo}
              onPress={() => void openExternal(venmoUrl)}
              external
            />
            <ListRow
              icon="kindness"
              title={copy.kindness.buyCta}
              subtitle={site.kindnessMark}
              onPress={contact.merch}
              external
              separator={false}
            />
          </ListGroup>
        </View>

        <ListGroup>
          <ListRow
            icon="history"
            title={history.title}
            subtitle={history.kicker}
            onPress={() => router.push("/history")}
          />
          <ListRow
            icon="people"
            title={copy.supporters.title}
            subtitle={copy.supporters.findTitle}
            onPress={() => router.push("/supporters")}
            separator={false}
          />
        </ListGroup>

        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="footnote" tone="muted">
            {site.nonprofitLine}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted" selectable>
            EIN {site.ein}
          </ThemedText>
          <ThemedText variant="caption" tone="muted" style={{ marginTop: spacing.sm }}>
            {FONT_CREDIT}
          </ThemedText>
          <ThemedText variant="caption" tone="muted">
            {site.copyright}
          </ThemedText>
        </View>
      </ScreenScroll>
      <Stack.Screen
        options={{ title: copy.about.title, headerLargeTitleEnabled: process.env.EXPO_OS === "ios" }}
      />
    </>
  );
}
