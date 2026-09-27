import { createEventInCalendarAsync } from "expo-calendar/legacy";
import { Share } from "react-native";

import { originUrl } from "@/api/client";
import type { EventDTO } from "@/api/types";
import { site } from "@/content/site";
import { formatNightWhen } from "@/domain/night/program";
import { googleCalendarUrl } from "@/domain/schedule/calendar";
import { openExternal } from "@/utils/links";

/**
 * The OS "new event" sheet, prefilled. Needs no calendar permission on
 * iOS 17+ or Android; if the system sheet is unavailable, fall back to
 * Google Calendar in the browser.
 */
export async function addEventToCalendar(event: EventDTO) {
  try {
    await createEventInCalendarAsync({
      title: event.title,
      startDate: new Date(event.start),
      endDate: new Date(event.end),
      location: `${event.venue}, ${site.address.full}`,
      notes: `${event.description}\n\n${site.name} · ${originUrl(`/event/${event.id}`)}`,
      timeZone: "America/New_York",
    });
  } catch {
    await openExternal(googleCalendarUrl(event));
  }
}

export function shareEvent(event: EventDTO, lead?: string) {
  const when = formatNightWhen(event);
  const url = originUrl(`/event/${event.id}`);
  return Share.share({
    message: `${lead ? `${lead}: ` : ""}${event.title} — ${when.weekday} ${when.month} ${when.day}, ${when.time} at ${event.venue}.\n${url}`,
    url: process.env.EXPO_OS === "ios" ? url : undefined,
  });
}
