import { router } from "expo-router";

import type { EventDTO } from "@/api/types";
import { EventRow } from "@/components/event-row";
import { ListGroup } from "@/components/list-row";
import { presentedByFrom } from "@/domain/events/sponsors";
import { formatNightWhen, nightPhase } from "@/domain/night/program";
import { upcomingLabel } from "@/domain/night/visibility";

/**
 * Nights as grouped rows; each opens its event page in the current tab.
 * Callers pass open nights (see `openNights`); a cancelled one that slips
 * through still says so instead of "On the board".
 */
export function EventList({ events, header }: { events: EventDTO[]; header?: string }) {
  return (
    <ListGroup header={header}>
      {events.map((event, i) => {
        const when = formatNightWhen(event);
        const live = !event.cancelled && nightPhase(event) === "live";
        return (
          <EventRow
            key={event.id}
            month={when.month}
            day={when.day}
            weekday={when.weekday}
            title={event.title}
            time={when.time}
            venue={event.venue}
            status={upcomingLabel(event)}
            statusTone={live ? "live" : event.cancelled || event.comingSoon ? "muted" : "accent"}
            presentedBy={presentedByFrom(event.presentedBy)?.name}
            separator={i < events.length - 1}
            onPress={() => router.push({ pathname: "/event/[id]", params: { id: event.id } })}
          />
        );
      })}
    </ListGroup>
  );
}
