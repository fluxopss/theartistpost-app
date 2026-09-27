import { router } from "expo-router";

import type { EventDTO } from "@/api/types";
import { EventRow } from "@/components/event-row";
import { ListGroup } from "@/components/list-row";
import { formatNightWhen, nightPhase, scheduleLabel } from "@/domain/night/program";

/** Nights as grouped rows; each opens its event page in the current tab. */
export function EventList({ events, header }: { events: EventDTO[]; header?: string }) {
  return (
    <ListGroup header={header}>
      {events.map((event, i) => {
        const when = formatNightWhen(event);
        const live = nightPhase(event) === "live";
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
            statusTone={live ? "live" : event.comingSoon ? "muted" : "accent"}
            separator={i < events.length - 1}
            onPress={() => router.push({ pathname: "/event/[id]", params: { id: event.id } })}
          />
        );
      })}
    </ListGroup>
  );
}
