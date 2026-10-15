import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Share, View } from "react-native";

import { isApiError } from "@/api/errors";
import {
  useAdminEvent,
  useCancelAdminEvent,
  useDuplicateAdminEvent,
  useEventAttendees,
  useEventCheckIns,
  usePublishAdminEvent,
} from "@/api/hooks";
import type { AdminEventDTO, AttendeeDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { attendeesToCsv } from "@/domain/events/export";
import { formatNightWhen } from "@/domain/night/program";
import { radius, spacing } from "@/theme";

function attendeeLine(person: AttendeeDTO): string {
  const bits: string[] = [];
  if (person.status === "GOING") {
    bits.push(person.waitlisted ? "Waitlist" : person.party === 1 ? "1 seat" : `${person.party} seats`);
  } else {
    bits.push(person.status === "MAYBE" ? "Maybe" : "Can’t make it");
  }
  if (person.checkedIn) bits.push(person.verified ? "Here (confirmed)" : "Here (no location)");
  return bits.join(" · ");
}

export function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useAdminEvent(id);

  return (
    <>
      <Stack.Screen options={{ title: "Night" }} />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        <AsyncView
          data={query.data}
          isPending={query.isPending}
          error={query.error}
          offline={isApiError(query.error) && query.error.offline}
          onRetry={() => void query.refetch()}
          isRefetching={query.isRefetching}
          loading={
            <View style={{ gap: spacing.md }}>
              <Skeleton height={96} rounded={radius.md} />
              <Skeleton height={140} rounded={radius.md} />
            </View>
          }
          empty={<EmptyState icon="schedule" title="That night wasn’t found" />}
        >
          {({ event }) => <ManageBody event={event} />}
        </AsyncView>
      </ScreenScroll>
    </>
  );
}

function ManageBody({ event }: { event: AdminEventDTO }) {
  const publish = usePublishAdminEvent();
  const cancel = useCancelAdminEvent();
  const duplicate = useDuplicateAdminEvent();
  const attendees = useEventAttendees(event.id, event.publishState !== "DRAFT");
  const checkIns = useEventCheckIns(event.id, event.publishState === "PUBLISHED");
  const when = formatNightWhen({ start: event.startsAt, end: event.endsAt });
  const live = event.publishState === "PUBLISHED";
  const busy = publish.isPending || cancel.isPending || duplicate.isPending;

  const fail = (title: string) => (error: unknown) =>
    Alert.alert(title, isApiError(error) ? error.message : "Try again in a moment.");

  const confirmCancel = () => {
    const audience = event.counts.going + event.counts.waitlisted + event.counts.maybe;
    Alert.alert(
      "Cancel this night?",
      audience > 0
        ? `${audience} ${audience === 1 ? "person" : "people"} who answered will see a note in Activity. This can’t be undone — you can duplicate the night to start again.`
        : "This can’t be undone — you can duplicate the night to start again.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel the night",
          style: "destructive",
          onPress: () => cancel.mutate(event.id, { onError: fail("Couldn’t cancel") }),
        },
      ],
    );
  };

  const shareList = async () => {
    const list = attendees.data;
    if (!list) return;
    await Share.share({
      title: `${event.title} — attendees`,
      message: attendeesToCsv(list.items),
    });
  };

  return (
    <>
      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="eyebrow" tone={live ? "success" : "spark-gold"}>
          {event.publishState === "DRAFT" ? "Draft — not public" : event.publishState === "CANCELLED" ? "Cancelled" : "On the board"}
        </ThemedText>
        <ThemedText variant="title2" accessibilityRole="header">
          {event.title}
        </ThemedText>
        <ThemedText variant="subheadline" tone="muted">
          {`${when.weekday}, ${when.month} ${when.day} · ${when.time} – ${when.endTime} · ${event.venueName}`}
        </ThemedText>
      </View>

      <View style={{ gap: spacing.xs }}>
        {event.publishState === "DRAFT" ? (
          <Button
            title="Publish to the board"
            tone="coral"
            icon="check"
            loading={publish.isPending}
            disabled={busy}
            onPress={() => publish.mutate(event.id, { onError: fail("Couldn’t publish") })}
          />
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          {event.publishState !== "CANCELLED" ? (
            <Button
              title="Edit"
              variant="secondary"
              icon="pencil"
              style={{ flexGrow: 1 }}
              onPress={() => router.push({ pathname: "/event-form", params: { id: event.id } })}
            />
          ) : null}
          <Button
            title="Duplicate"
            variant="secondary"
            icon="plus"
            loading={duplicate.isPending}
            disabled={busy}
            style={{ flexGrow: 1 }}
            onPress={() =>
              duplicate.mutate(event.id, {
                onSuccess: ({ event: copy }) =>
                  router.replace({ pathname: "/manage-event/[id]", params: { id: copy.id } }),
                onError: fail("Couldn’t duplicate"),
              })
            }
          />
          {event.publishState !== "DRAFT" ? (
            <Button
              title="View public page"
              variant="secondary"
              icon="external"
              style={{ flexGrow: 1 }}
              onPress={() => router.push(`/event/${encodeURIComponent(event.id)}`)}
            />
          ) : null}
        </View>
        {event.publishState !== "CANCELLED" ? (
          <Button
            title="Cancel this night"
            variant="destructive"
            icon="close"
            loading={cancel.isPending}
            disabled={busy}
            onPress={confirmCancel}
          />
        ) : null}
      </View>

      {event.publishState !== "DRAFT" ? (
        <ListGroup
          header="Right now"
          footer={
            event.capacity === null
              ? "No seat limit."
              : `${event.counts.goingSeats} of ${event.capacity} seats held.`
          }
        >
          <ListRow icon="ticket" title="Going" value={`${event.counts.going} · ${event.counts.goingSeats} seats`} showChevron={false} />
          <ListRow icon="clock" title="Waitlist" value={String(event.counts.waitlisted)} showChevron={false} />
          <ListRow icon="info" title="Maybe" value={String(event.counts.maybe)} showChevron={false} />
          <ListRow
            icon="checkCircle"
            title="Checked in"
            value={`${checkIns.data?.count ?? event.counts.checkedIn} · ${checkIns.data?.verifiedCount ?? event.counts.verified} confirmed`}
            showChevron={false}
            separator={false}
          />
        </ListGroup>
      ) : null}

      {event.publishState !== "DRAFT" ? (
        <AsyncView
          data={attendees.data}
          isPending={attendees.isPending}
          error={attendees.error}
          onRetry={() => void attendees.refetch()}
          isRefetching={attendees.isRefetching}
          isEmpty={(data) => data.items.length === 0}
          loading={<Skeleton height={96} rounded={radius.md} />}
          empty={
            <EmptyState icon="people" title="No answers yet" body="When people answer for this night, they show here." />
          }
        >
          {(data) => (
            <View style={{ gap: spacing.sm }}>
              <ListGroup header="Attendees" footer="Only admins see names and emails.">
                {data.items.map((person, index) => (
                  <ListRow
                    key={person.userId}
                    icon={person.checkedIn ? "checkCircle" : "people"}
                    title={person.name}
                    subtitle={`${attendeeLine(person)}\n${person.email}`}
                    showChevron={false}
                    separator={index < data.items.length - 1}
                  />
                ))}
              </ListGroup>
              <Button title="Share attendee list (CSV)" variant="secondary" icon="share" onPress={() => void shareList()} />
            </View>
          )}
        </AsyncView>
      ) : null}
    </>
  );
}
