import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useEvent, useFeaturedNight } from "@/api/hooks";
import type { EventDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { formatNightWhen, nightPhase, scheduleLabel } from "@/domain/night/program";
import { useSaves } from "@/storage/saves";
import { radius, spacing } from "@/theme";
import { addEventToCalendar, shareEvent } from "@/utils/calendar";
import { contact, tabRoutes } from "@/utils/links";

const HERO_SKELETON = 120;
const ROWS_SKELETON = 132;

export function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useEvent(id);
  const notFound = isApiError(query.error) && query.error.code === "not_found";

  return (
    <>
      <ScreenScroll
        gap={spacing.xl}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
      >
        {notFound ? (
          <EmptyState
            icon="schedule"
            title="This night isn’t on the board"
            body="It may have been moved or taken down. The schedule always has what’s current."
            action={
              <Button
                title="See the schedule"
                variant="secondary"
                onPress={() => router.navigate(tabRoutes.schedule)}
              />
            }
          />
        ) : (
          <AsyncView
            data={query.data}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            loading={
              <View style={{ gap: spacing.lg }}>
                <Skeleton height={HERO_SKELETON} rounded={radius.md} />
                <Skeleton height={ROWS_SKELETON} rounded={radius.md} />
              </View>
            }
            empty={null}
          >
            {(event) => <EventBody event={event} />}
          </AsyncView>
        )}
      </ScreenScroll>
      <Stack.Screen options={{ title: "Night", headerLargeTitleEnabled: false }} />
    </>
  );
}

function EventBody({ event }: { event: EventDTO }) {
  const featured = useFeaturedNight();
  const { isEventSaved, toggleEvent } = useSaves();
  const when = formatNightWhen(event);
  const phase = nightPhase(event);
  const saved = isEventSaved(event.id);
  const isFeatured = featured.data?.event?.id === event.id && phase !== "closed";

  return (
    <>
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="eyebrow" tone={phase === "live" ? "success" : "spark-gold"}>
          {scheduleLabel(event)}
        </ThemedText>
        <ThemedText variant="title1" accessibilityRole="header">
          {event.title}
        </ThemedText>
        {event.artist && !event.comingSoon ? (
          <ThemedText variant="headline" tone="accent">
            {event.artist}
          </ThemedText>
        ) : null}
      </View>

      {isFeatured ? (
        <Button
          title={copy.night.hold}
          tone="coral"
          size="lg"
          icon="ticket"
          onPress={() => router.push("/night")}
        />
      ) : null}

      <ListGroup>
        <ListRow
          icon="clock"
          title={`${when.weekday}, ${when.month} ${when.day}`}
          subtitle={`${when.time} – ${when.endTime} · Eastern time`}
          showChevron={false}
        />
        <ListRow
          icon="mapPin"
          title={event.venue}
          subtitle={site.address.full}
          onPress={contact.directions}
          external
          separator={Boolean(event.medium)}
        />
        {event.medium ? (
          <ListRow icon="sparkle" title="Medium" value={event.medium} showChevron={false} separator={false} />
        ) : null}
      </ListGroup>

      {event.description ? (
        <ThemedText variant="body" selectable>
          {event.description}
        </ThemedText>
      ) : null}

      {phase === "closed" ? (
        <ThemedText variant="footnote" tone="muted">
          This night has passed. Keep an eye on the schedule for the next one.
        </ThemedText>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {phase !== "closed" ? (
          <Button
            title="Add to Calendar"
            variant="secondary"
            icon="calendarAdd"
            onPress={() => void addEventToCalendar(event)}
            style={{ flexGrow: 1 }}
          />
        ) : null}
        <Button
          title={saved ? "Saved" : "Save"}
          variant="secondary"
          icon={saved ? "bookmarkFill" : "bookmark"}
          accessibilityLabel={saved ? "Remove from saved" : "Save this night"}
          onPress={() => {
            if (process.env.EXPO_OS === "ios") Haptics.selectionAsync();
            toggleEvent({ id: event.id, title: event.title, venue: event.venue, start: event.start });
          }}
          style={{ flexGrow: 1 }}
        />
        <Button
          title="Share"
          variant="secondary"
          icon="share"
          onPress={() => void shareEvent(event)}
          style={{ flexGrow: 1 }}
        />
      </View>
    </>
  );
}
