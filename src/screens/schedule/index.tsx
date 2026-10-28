import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { useEvents, useFeaturedNight } from "@/api/hooks";
import { isApiError } from "@/api/errors";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { FilterChips } from "@/components/filter-chips";
import { GenreRail } from "@/components/genre-rail";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { appCopy, copy } from "@/content/site";
import { ALL_LANES, mediumLabel, nightsInLane, scheduleLaneOptions } from "@/domain/events/lanes";
import { openNights } from "@/domain/night/visibility";
import { radius, screenMargin, spacing, useBrandColors, useBrandScheme } from "@/theme";
import { contact } from "@/utils/links";

import { ArtistOnboarding } from "./artist-onboarding";
import { EventList } from "./event-list";
import { MonthView } from "./month-view";

const views = ["List", "Month"] as const;
type ScheduleViewMode = (typeof views)[number];

const ROW_SKELETON = 76;

/**
 * Upcoming nights only. Past, cancelled and placeholder dates never read as live, so
 * an empty board says so plainly instead of padding the list.
 */
export function ScheduleScreen() {
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const events = useEvents();
  const featured = useFeaturedNight();
  const [mode, setMode] = useState<ScheduleViewMode>("List");
  const [lane, setLane] = useState<string>(ALL_LANES);

  const upcoming = useMemo(() => (events.data ? openNights(events.data) : undefined), [events.data]);
  // Filters the list already fetched; no server support needed.
  const inLane = useMemo(() => (upcoming ? nightsInLane(upcoming, lane) : undefined), [upcoming, lane]);
  const night = featured.data?.event;

  return (
    <ScreenScroll
      refreshing={events.isRefetching}
      onRefresh={() => {
        void events.refetch();
        void featured.refetch();
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="eyebrow" tone="spark-gold">
          {copy.schedule.venue} · Clematis
        </ThemedText>
        <ThemedText variant="body" tone="muted">
          {copy.schedule.supportLine}
        </ThemedText>
        <GenreRail style={{ marginHorizontal: -screenMargin }} />
        {night ? (
          <Button
            title={`${copy.night.hold} · ${night.title}`}
            tone="coral"
            size="lg"
            icon="ticket"
            onPress={() => router.push("/night")}
          />
        ) : null}
      </View>

      <View style={{ gap: spacing.md }}>
        <SegmentedControl
          values={[...views]}
          selectedIndex={views.indexOf(mode)}
          onValueChange={(value) => setMode(value as ScheduleViewMode)}
          tintColor={palette.accent}
          appearance={scheme}
        />
        {upcoming && upcoming.length > 0 ? (
          <FilterChips
            label="Schedule lanes"
            options={[...scheduleLaneOptions]}
            value={lane}
            onChange={setLane}
          />
        ) : null}
        <AsyncView
          data={inLane}
          isPending={events.isPending}
          error={events.error}
          offline={isApiError(events.error) && events.error.offline}
          onRetry={() => void events.refetch()}
          isRefetching={events.isRefetching}
          isEmpty={(list) => list.length === 0}
          loading={
            <View style={{ gap: spacing.xs }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={ROW_SKELETON} rounded={radius.md} />
              ))}
            </View>
          }
          empty={
            lane !== ALL_LANES && upcoming && upcoming.length > 0 ? (
              <EmptyState
                icon="schedule"
                title={`No ${mediumLabel(lane)} nights on the calendar yet.`}
                body="New nights land here as soon as they are booked. Every lane is welcome at the house."
                action={<Button title="See all nights" variant="secondary" onPress={() => setLane(ALL_LANES)} />}
              />
            ) : (
              <EmptyState
                icon="schedule"
                title={appCopy.scheduleEmptyTitle}
                body={appCopy.scheduleEmptyBody}
                action={
                  <Button title="Visit the house" variant="secondary" icon="directions" onPress={contact.directions} />
                }
              />
            )
          }
        >
          {(list) => (mode === "List" ? <EventList events={list} /> : <MonthView events={list} />)}
        </AsyncView>
      </View>

      <ArtistOnboarding />
    </ScreenScroll>
  );
}
