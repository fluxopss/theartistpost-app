import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { View } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";

import { useEvents, usePosts } from "@/api/hooks";
import { GenreRail, type GenreId } from "@/components/genre-rail";
import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { tapLane } from "@/domain/stage/lanes";
import { duration, screenMargin, spacing } from "@/theme";

import { FramesSection } from "./frames-section";
import { KindnessShelf } from "./kindness-shelf";
import { laneTag } from "./lane-tag";
import { NightsSection } from "./nights-section";
import { WorksSection } from "./works-section";

/** The native Wall is shelves, not a canvas — so the pan-and-zoom line is dropped. */
const lead = copy.wall.lead.replace(" Pan and zoom a frame.", "");

/** Start the next page of work this far before the grid's end scrolls into view. */
const LOAD_AHEAD = 600;

/**
 * The Wall as shelves: artists' work, the nights still ahead, the frames
 * waiting for a name, and kindness pinned on this phone. A TAP lane (from the
 * rail here, or Home's `?lane=`) narrows the work and the frames.
 */
export function WallScreen() {
  const params = useLocalSearchParams<{ lane?: string }>();
  const lane = tapLane(params.lane);
  const posts = usePosts(lane ? laneTag[lane.id] : undefined);
  const events = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const reduceMotion = useReducedMotion();

  // Scroll geometry for "load more near the end of the grid". Refs, not
  // state: they change every frame and never need a render.
  const viewport = useRef({ offsetY: 0, height: 0 });
  const worksEndY = useRef(0);

  const loadMoreIfNear = () => {
    const { offsetY, height } = viewport.current;
    if (height === 0 || worksEndY.current === 0) return;
    if (!posts.hasNextPage || posts.isFetching || posts.isFetchNextPageError) return;
    if (offsetY + height + LOAD_AHEAD >= worksEndY.current) void posts.fetchNextPage();
  };

  const setLane = (id: GenreId | null) => router.setParams({ lane: id ?? undefined });

  const selectLane = (id: GenreId) => {
    if (process.env.EXPO_OS === "ios") void Haptics.selectionAsync();
    // Tapping the lit lane again clears it.
    setLane(lane?.id === id ? null : id);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([posts.refetch(), events.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenScroll
      refreshing={refreshing}
      onRefresh={() => void refresh()}
      scrollEventThrottle={100}
      onLayout={(e: LayoutChangeEvent) => {
        viewport.current.height = e.nativeEvent.layout.height;
        loadMoreIfNear();
      }}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        viewport.current = {
          offsetY: e.nativeEvent.contentOffset.y,
          height: e.nativeEvent.layoutMeasurement.height,
        };
        loadMoreIfNear();
      }}
    >
      <Animated.View
        entering={reduceMotion ? undefined : FadeInUp.duration(duration.slow).springify()}
        style={{ gap: spacing.sm }}
      >
        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="eyebrow" tone="spark-teal">
            {copy.wall.kicker}
          </ThemedText>
          <ThemedText variant="title1" accessibilityRole="header">
            {copy.wall.title}
          </ThemedText>
          <ThemedText variant="body" tone="muted">
            {lead}
          </ThemedText>
        </View>
        <GenreRail selected={lane?.id ?? null} onSelect={selectLane} style={{ marginHorizontal: -screenMargin }} />
        {lane ? (
          <ThemedText variant="subheadline" tone="spark-gold" accessibilityLiveRegion="polite">
            {lane.wallLine}
          </ThemedText>
        ) : null}
      </Animated.View>

      <View
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          worksEndY.current = y + height;
          loadMoreIfNear();
        }}
      >
        <WorksSection query={posts} lane={lane} onClearLane={() => setLane(null)} />
      </View>

      <NightsSection query={events} />

      <FramesSection lane={lane} />

      <KindnessShelf />
    </ScreenScroll>
  );
}
