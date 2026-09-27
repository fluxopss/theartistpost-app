import { router } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import type { useEvents } from "@/api/hooks";
import type { EventDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { EventRow } from "@/components/event-row";
import { ListGroup } from "@/components/list-row";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/skeleton";
import { appCopy } from "@/content/site";
import { formatNightWhen, nightPhase, scheduleLabel } from "@/domain/night/program";
import { radius, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

/** The shelf shows the next few; the Schedule tab has the rest. */
const SHELF_LIMIT = 4;
const ROWS_SKELETON = 150;

function openNights(events: EventDTO[], now = new Date()): EventDTO[] {
  return events
    .filter((event) => nightPhase(event, now) !== "closed")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/** Nights people can still walk into — never past-dated ones. */
export function NightsSection({ query }: { query: ReturnType<typeof useEvents> }) {
  const nights = query.data ? openNights(query.data) : undefined;
  const hasMore = (nights?.length ?? 0) > SHELF_LIMIT;

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader
        eyebrow="On the board"
        eyebrowTone="spark-gold"
        title="Nights"
        actionLabel={nights?.length ? (hasMore ? "See all" : "Schedule") : undefined}
        actionHref={nights?.length ? tabRoutes.schedule : undefined}
      />
      <AsyncView
        data={nights}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0}
        loading={<Skeleton height={ROWS_SKELETON} rounded={radius.md} />}
        empty={
          <EmptyState
            icon="schedule"
            title={appCopy.scheduleEmptyTitle}
            body={appCopy.scheduleEmptyBody}
            action={
              <Button
                title="See the schedule"
                variant="secondary"
                onPress={() => router.navigate(tabRoutes.schedule)}
              />
            }
          />
        }
      >
        {(list) => {
          const shown = list.slice(0, SHELF_LIMIT);
          return (
            <ListGroup>
              {shown.map((event, index) => {
                const when = formatNightWhen(event);
                return (
                  <EventRow
                    key={event.id}
                    month={when.month}
                    day={when.day}
                    weekday={when.weekday}
                    title={event.title}
                    time={when.time}
                    venue={event.venue}
                    status={scheduleLabel(event)}
                    statusTone={nightPhase(event) === "live" ? "live" : "muted"}
                    onPress={() => router.push({ pathname: "/event/[id]", params: { id: event.id } })}
                    separator={index < shown.length - 1}
                  />
                );
              })}
            </ListGroup>
          );
        }}
      </AsyncView>
    </View>
  );
}
