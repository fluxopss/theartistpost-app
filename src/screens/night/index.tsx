import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useFeaturedNight } from "@/api/hooks";
import type { EventDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { TicketPass } from "@/components/ticket-pass";
import { copy } from "@/content/site";
import { floorBeats, formatNightWhen, nightPhase, stampWord } from "@/domain/night/program";
import { useNight } from "@/storage/night";
import { useStudio } from "@/storage/studio";
import { fonts, paper, radius, spacing } from "@/theme";
import { addEventToCalendar, shareEvent } from "@/utils/calendar";
import { contact, tabRoutes } from "@/utils/links";

import { Countdown } from "./countdown";
import { FloorRooms } from "./floor-rooms";
import { NightSparks } from "./night-sparks";
import { TearStub } from "./tear-stub";

const TICKET_SKELETON = 180;

export function NightScreen() {
  const featured = useFeaturedNight();

  return (
    <>
      <ScreenScroll refreshing={featured.isRefetching} onRefresh={() => void featured.refetch()}>
        <AsyncView
          data={featured.data}
          isPending={featured.isPending}
          error={featured.error}
          offline={isApiError(featured.error) && featured.error.offline}
          onRetry={() => void featured.refetch()}
          isRefetching={featured.isRefetching}
          isEmpty={(data) => !data.event}
          loading={
            <View style={{ gap: spacing.lg }}>
              <Skeleton height={spacing.xxxl} rounded={radius.md} />
              <Skeleton height={TICKET_SKELETON} rounded={radius.xl} />
            </View>
          }
          empty={
            <EmptyState
              icon="ticket"
              title={copy.night.emptyTitle}
              body={copy.night.emptyBody}
              action={
                <View style={{ gap: spacing.xs, alignSelf: "stretch" }}>
                  <Button
                    title="See the schedule"
                    variant="secondary"
                    icon="schedule"
                    onPress={() => router.navigate(tabRoutes.schedule)}
                  />
                  <Button title="Visit the house" variant="ghost" icon="directions" onPress={contact.directions} />
                </View>
              }
            />
          }
        >
          {(data) => (data.event ? <NightRoom event={data.event} /> : null)}
        </AsyncView>
      </ScreenScroll>
      <Stack.Screen options={{ title: copy.night.kicker, headerLargeTitleEnabled: false }} />
    </>
  );
}

function NightRoom({ event }: { event: EventDTO }) {
  const { pass, sparks, addSpark, lit, setLit } = useNight(event.id);
  const { studio, isGuest } = useStudio();
  const [tornByHand, setTornByHand] = useState(false);
  const phase = nightPhase(event);
  const when = formatNightWhen(event);
  const torn = Boolean(pass) || tornByHand;

  return (
    <>
      <View style={{ gap: spacing.sm }}>
        <ThemedText variant="eyebrow" tone={phase === "live" ? "success" : "spark-gold"}>
          {phase === "live" ? "Tonight · doors are open" : copy.night.kicker}
        </ThemedText>
        <ThemedText variant="title1" accessibilityRole="header">
          {event.title}
        </ThemedText>
        <ThemedText variant="subheadline" tone="muted">
          {copy.night.lineup}
        </ThemedText>
        {phase === "upcoming" ? <Countdown start={event.start} /> : null}
      </View>

      <View style={{ gap: spacing.xs }}>
        <TicketPass
          title={event.title}
          venue={event.venue}
          when={when}
          stamp={stampWord(phase)}
          holder={pass ? `${pass.name} · ${pass.party === 1 ? "1 seat" : `${pass.party} seats`}` : undefined}
          code={pass?.code}
          footer={
            pass ? null : (
              <ThemedText variant="caption" style={{ color: paper.ticket.muted, fontFamily: fonts.body }}>
                Your name lands here
              </ThemedText>
            )
          }
        />
        <TearStub torn={torn} onTear={() => setTornByHand(true)}>
          {pass ? (
            <>
              <View style={{ gap: spacing.xxs }}>
                <ThemedText variant="caption" tone="muted">
                  PASS
                </ThemedText>
                <ThemedText variant="title1" tone="accent" selectable style={{ fontVariant: ["tabular-nums"] }}>
                  {pass.code}
                </ThemedText>
                <ThemedText variant="subheadline" tone="success">
                  {copy.night.sent}
                </ThemedText>
                {pass.note ? (
                  <ThemedText variant="footnote" tone="muted">
                    “{pass.note}”
                  </ThemedText>
                ) : null}
              </View>
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
                  title="Directions"
                  variant="secondary"
                  icon="directions"
                  onPress={contact.directions}
                  style={{ flexGrow: 1 }}
                />
                <Button
                  title="Share"
                  variant="secondary"
                  icon="share"
                  onPress={() => void shareEvent(event, copy.night.shareLead)}
                  style={{ flexGrow: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              <ThemedText variant="body">
                Put your name on the pass. Robbie gets your seat, and the pass stays on this phone for the door.
              </ThemedText>
              <Button
                title={phase === "closed" ? "This night has closed" : copy.night.hold}
                tone="coral"
                size="lg"
                icon="ticket"
                disabled={phase === "closed"}
                onPress={() => router.push({ pathname: "/rsvp", params: { eventId: event.id } })}
              />
            </>
          )}
        </TearStub>
      </View>

      <FloorRooms rooms={floorBeats(event)} lit={lit} onChange={setLit} />

      <NightSparks
        sparks={sparks}
        from={pass?.name ?? (isGuest ? "" : studio.displayName)}
        onAdd={addSpark}
      />
    </>
  );
}
