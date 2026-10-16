import { router, Stack } from "expo-router";
import { Alert, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useAdminEvents, useCreateAdminEvent, useMe } from "@/api/hooks";
import type { AdminEventDTO } from "@/api/types";
import { useAuth } from "@/auth";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { formatNightWhen } from "@/domain/night/program";
import { radius, spacing } from "@/theme";

const STATE_LABEL: Record<AdminEventDTO["publishState"], string> = {
  DRAFT: "Draft",
  PUBLISHED: "On the board",
  CANCELLED: "Cancelled",
};

function summaryLine(event: AdminEventDTO): string {
  const when = formatNightWhen({ start: event.startsAt, end: event.endsAt });
  const parts = [`${when.weekday}, ${when.month} ${when.day} · ${when.time}`];
  if (event.publishState !== "DRAFT") {
    parts.push(`${event.counts.goingSeats} going`);
    if (event.counts.checkedIn > 0) parts.push(`${event.counts.checkedIn} here`);
  }
  return parts.join(" · ");
}

/** Admin-only: create, publish, cancel and review nights. */
export function ManageEventsScreen() {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const isAdmin = me.data?.permissions.admin === true;
  const query = useAdminEvents(isAdmin);
  const create = useCreateAdminEvent();

  if (!user || (!me.isPending && !isAdmin)) {
    return (
      <>
        <Stack.Screen options={{ title: "Manage events" }} />
        <ScreenScroll>
          <EmptyState icon="flag" title="Admins only" body="Nights are managed by house admins." />
        </ScreenScroll>
      </>
    );
  }

  const adopt = (item: { id: string; title: string; start: string; end: string; venue: string }) => {
    create.mutate(
      {
        sourceId: item.id,
        title: item.title,
        startsAt: item.start,
        endsAt: item.end,
        venueName: item.venue,
      },
      {
        onSuccess: ({ event }) =>
          router.push({ pathname: "/event-form", params: { id: event.id } }),
        onError: (error) =>
          Alert.alert(
            "Couldn’t copy that night",
            isApiError(error) ? error.message : "Try again in a moment.",
          ),
      },
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Manage events" }} />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        <Button
          title="New night"
          icon="plus"
          tone="coral"
          onPress={() => router.push({ pathname: "/event-form" })}
        />
        <AsyncView
          data={query.data}
          isPending={me.isPending || query.isPending}
          error={query.error}
          offline={isApiError(query.error) && query.error.offline}
          onRetry={() => void query.refetch()}
          isRefetching={query.isRefetching}
          loading={
            <View style={{ gap: spacing.md }}>
              <Skeleton height={64} rounded={radius.md} />
              <Skeleton height={64} rounded={radius.md} />
            </View>
          }
          empty={null}
        >
          {(data) => (
            <>
              {data.items.length === 0 ? (
                <EmptyState
                  icon="schedule"
                  title="No managed nights yet"
                  body="Create a night, or copy one from the schedule below. Nothing is public until you publish it."
                />
              ) : (
                <ListGroup header="Your nights" footer="Drafts are only visible to admins.">
                  {data.items.map((event, index) => (
                    <ListRow
                      key={event.id}
                      icon="ticket"
                      title={event.title}
                      subtitle={summaryLine(event)}
                      value={STATE_LABEL[event.publishState]}
                      onPress={() =>
                        router.push({ pathname: "/manage-event/[id]", params: { id: event.id } })
                      }
                      separator={index < data.items.length - 1}
                    />
                  ))}
                </ListGroup>
              )}

              {data.fromSchedule.length > 0 ? (
                <ListGroup
                  header="On the schedule"
                  footer="Copy a schedule night to manage its seats and check-ins. The original stays hidden once the copy is published."
                >
                  {data.fromSchedule.map((item, index) => {
                    const when = formatNightWhen(item);
                    return (
                      <ListRow
                        key={item.id}
                        icon="calendarAdd"
                        title={item.title}
                        subtitle={`${when.weekday}, ${when.month} ${when.day} · ${when.time}`}
                        value="Copy"
                        showChevron={false}
                        onPress={() => !create.isPending && adopt(item)}
                        separator={index < data.fromSchedule.length - 1}
                      />
                    );
                  })}
                </ListGroup>
              ) : null}
            </>
          )}
        </AsyncView>
      </ScreenScroll>
    </>
  );
}
