import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";

import { useFeaturedNight } from "@/api/hooks";
import { Button } from "@/components/button";
import { DoorCard } from "@/components/door-card";
import { GenreRail } from "@/components/genre-rail";
import { Icon } from "@/components/icon";
import { MantraStrip } from "@/components/mantra-strip";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { involveDoors } from "@/content/involve";
import { history } from "@/content/history";
import { copy, site } from "@/content/site";
import { tapOrigin } from "@/content/stage";
import { duration, radius, screenMargin, spacing, useBrandColors } from "@/theme";
import { contact } from "@/utils/links";

import { KindnessTeaser } from "./kindness-teaser";
import { NightTeaser } from "./night-teaser";
import { StageBand } from "./stage-band";
import { SubscribeForm } from "./subscribe-form";
import { VisitSection } from "./visit-section";

export function HomeScreen() {
  const palette = useBrandColors();
  const night = useFeaturedNight();
  const reduceMotion = useReducedMotion();

  // The stage band is always navy, so the status bar is light while Home is up.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light", true);
      return () => setStatusBarStyle("auto", true);
    }, []),
  );

  return (
    <ScreenScroll
      inset={0}
      gap={0}
      contentContainerStyle={{ paddingTop: 0 }}
      refreshing={night.isRefetching}
      onRefresh={() => night.refetch()}
    >
      <StageBand />

      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.delay(180).duration(duration.slow).springify()}
        style={{ paddingTop: spacing.xxl, gap: spacing.xxxl }}
      >
        <View style={{ gap: spacing.xs }}>
          <View style={{ paddingHorizontal: screenMargin }}>
            <SectionHeader
              eyebrow={tapOrigin.kicker}
              eyebrowTone="spark-coral"
              title="One house for every kind of artist"
            />
          </View>
          <GenreRail />
          <ThemedText variant="subheadline" tone="muted" style={{ paddingHorizontal: screenMargin }}>
            {tapOrigin.line}
          </ThemedText>
        </View>

        <View style={{ paddingHorizontal: screenMargin, gap: spacing.xxxl }}>
          <NightTeaser />

          <View style={{ gap: spacing.sm }}>
            <SectionHeader eyebrow={copy.house.kicker} eyebrowTone="spark-gold" title="Step through a door" />
            {involveDoors.map((door, i) => (
              <DoorCard
                key={door.id}
                index={i + 1}
                eyebrow={door.kicker}
                title={door.title}
                body={door.summary}
                tone={door.spark}
                cta={copy.house.enter}
                onPress={() => router.push({ pathname: "/get-involved/[door]", params: { door: door.id } })}
              />
            ))}
          </View>

          <MantraStrip />

          <KindnessTeaser />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${history.title}. ${history.kicker}`}
            onPress={() => router.push("/history")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.lg,
              borderCurve: "continuous",
              backgroundColor: pressed ? palette.bgPressed : palette.bgElevated,
            })}
          >
            <View style={{ flex: 1, gap: spacing.xxs }}>
              <ThemedText variant="eyebrow" tone="spark-teal">
                Since December {site.founded}
              </ThemedText>
              <ThemedText variant="title3">{history.title}</ThemedText>
              <ThemedText variant="subheadline" tone="muted" numberOfLines={2}>
                {history.kicker}. A sourced record, from the first post to Clematis Street.
              </ThemedText>
            </View>
            <Icon name="chevronRight" size={16} color={palette.textMuted} weight="semibold" />
          </Pressable>

          <View style={{ gap: spacing.xs }}>
            <SectionHeader eyebrow="On the wall" eyebrowTone="spark-violet" title={copy.home.featuredTitle} />
            <ThemedText variant="body" tone="muted">
              {copy.home.featuredEmpty} Frames stay lit until a real artist is approved — never a stand-in face.
            </ThemedText>
          </View>

          <VisitSection />

          <SubscribeForm />

          <View style={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
            <Button title="Donate" icon="donate" tone="coral" onPress={contact.donate} />
            <ThemedText variant="footnote" tone="muted" style={{ textAlign: "center" }}>
              {site.nonprofitLine} EIN {site.ein}.
            </ThemedText>
            <ThemedText variant="caption" tone="muted" style={{ textAlign: "center" }}>
              {site.copyright}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScreenScroll>
  );
}
