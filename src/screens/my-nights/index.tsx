import { router, Stack } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useMyRsvps } from "@/api/hooks";
import { useAuth } from "@/auth";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { EventRow } from "@/components/event-row";
import { ListGroup } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { rsvpHeadline } from "@/domain/events/rsvp";
import { presentedByFrom } from "@/domain/events/sponsors";
import { formatNightWhen, nightPhase } from "@/domain/night/program";
import { radius, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

/** The nights I answered going or maybe to, soonest first. */
export function MyNightsScreen() {
  const { user } = useAuth();
  const query = useMyRsvps(Boolean(user));

  return (
    <>
      <Stack.Screen options={{ title: "My nights" }} />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        {!user ? (
          <EmptyState
            icon="ticket"
            title="Sign in to see your nights"
            body="Your seats live on your account, so they follow you to any phone."
            action={<Button title="Join the house" icon="people" onPress={() => router.push("/join")} />}
          />
        ) : (
          <AsyncView
            data={query.data}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            isEmpty={(data) => data.items.length === 0}
            loading={
              <View style={{ gap: spacing.md }}>
                <Skeleton height={72} rounded={radius.md} />
                <Skeleton height={72} rounded={radius.md} />
              </View>
            }
            empty={
              <EmptyState
                icon="ticket"
                title="No seats held yet"
                body="When you say you’re going to a night, it shows up here."
                action={
                  <Button
                    title="See the schedule"
                    variant="secondary"
                    icon="schedule"
                    onPress={() => router.navigate(tabRoutes.schedule)}
                  />
                }
              />
            }
          >
            {(data) => (
              <ListGroup header="Going and maybe">
                {data.items.map(({ rsvp, event }, index) => {
                  const when = formatNightWhen(event);
                  const phase = nightPhase(event);
                  return (
                    <EventRow
                      key={event.id}
                      month={when.month}
                      day={when.day}
                      weekday={when.weekday}
                      title={event.title}
                      time={`${when.time} – ${when.endTime}`}
                      venue={event.venue}
                      status={event.cancelled ? "Cancelled" : (rsvpHeadline(rsvp) ?? undefined)}
                      statusTone={phase === "live" ? "live" : "accent"}
                      presentedBy={presentedByFrom(event.presentedBy)?.name}
                      onPress={() => router.push(`/event/${encodeURIComponent(event.id)}`)}
                      separator={index < data.items.length - 1}
                    />
                  );
                })}
              </ListGroup>
            )}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
