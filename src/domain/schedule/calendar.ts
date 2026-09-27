// Ported from theartistpost@03f9a2f:src/lib/schedule/calendar.ts
/**
 * Calendar helpers — framework-agnostic, no DOM.
 *
 * Native notes: `downloadIcs` was dropped (DOM `Blob`/anchor-click only).
 * `eventToIcs`'s DESCRIPTION line embedded a literal `\n` (backslash + "n",
 * from a double-escaped `\\n` in the source) that `icsEscape` then escaped
 * again into `\\n`, so calendar apps rendered a literal backslash-n instead
 * of a line break. Fixed here to emit one real newline before escaping, so
 * the ICS text carries a single escaped `\n` that unescapes to a line break.
 * `monthMatrix` is rewritten to build cells from America/New_York calendar
 * dates via `Date.UTC` arithmetic only, instead of the web version's
 * local-time `Date` getters (which silently used the device's timezone).
 */

import type { ContentEvent } from "@/domain/content/types";

export function googleCalendarUrl(event: ContentEvent): string {
  const fmt = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: `${event.description}\n\nArtist: ${event.artist}\nVenue: ${event.venue}`,
    location: event.venue,
    dates: `${fmt(event.start)}/${fmt(event.end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function eventToIcs(event: ContentEvent): string {
  const stamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Artist Post//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@theartistpost.org`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    // A real newline here (not "\\n") so icsEscape emits one correct `\n`.
    `DESCRIPTION:${icsEscape(`${event.description}\nArtist: ${event.artist}`)}`,
    `LOCATION:${icsEscape(event.venue)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type MonthCell = { key: string; day: number; inMonth: boolean };

/** "YYYY-MM-DD" for the UTC instant `utcMillis`, read back with UTC getters only. */
function isoKeyFromUtc(utcMillis: number): string {
  const d = new Date(utcMillis);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * A 6-week, Sunday-first grid for `month0` (0 = January) of `year`, built
 * entirely from `Date.UTC` arithmetic so the result never depends on the
 * host device's local timezone.
 */
export function monthMatrix(year: number, month0: number): MonthCell[][] {
  const startWeekday = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(year, month0, 0)).getUTCDate();

  const cells: MonthCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      key: isoKeyFromUtc(Date.UTC(year, month0 - 1, day)),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      key: isoKeyFromUtc(Date.UTC(year, month0, day)),
      day,
      inMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      key: isoKeyFromUtc(Date.UTC(year, month0 + 1, nextDay)),
      day: nextDay,
      inMonth: false,
    });
    nextDay += 1;
  }

  const weeks: MonthCell[][] = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(cells.slice(i * 7, i * 7 + 7));
  }
  return weeks;
}

const EASTERN_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The "YYYY-MM-DD" calendar day in America/New_York for an instant. */
export function easternDayKey(iso: string): string {
  return EASTERN_DAY_FORMATTER.format(new Date(iso));
}

/** Groups events by their America/New_York calendar day. */
export function eventsByEasternDay<T extends { start: string }>(
  events: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const event of events) {
    const key = easternDayKey(event.start);
    const existing = map.get(key);
    if (existing) {
      existing.push(event);
    } else {
      map.set(key, [event]);
    }
  }
  return map;
}
