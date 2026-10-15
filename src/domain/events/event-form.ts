import type { AdminEventDTO, AdminEventInput } from "@/api/types";

/** Everything the manage-a-night form holds, as the person typed it. */
export type EventFormValues = {
  title: string;
  description: string;
  /** "2026-10-30" */
  date: string;
  /** "6:00 PM" */
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  latitude: string;
  longitude: string;
  capacity: string;
  coverImageUrl: string;
};

export function emptyEventForm(): EventFormValues {
  return {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    latitude: "",
    longitude: "",
    capacity: "",
    coverImageUrl: "",
  };
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function realDate(value: string): { y: number; m: number; d: number } | null {
  const match = DATE_RE.exec(value.trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/** "6pm", "6:30 PM", "12 AM" or 24-hour "18:45" → "HH:mm". Null if not a time. */
export function parseTime12(raw: string): string | null {
  const text = raw.trim().toLowerCase();
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/.exec(text);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.[0];
  if (minute > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "p" && hour !== 12) hour += 12;
    if (meridiem === "a" && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function format12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function addDay(date: { y: number; m: number; d: number }): string {
  const next = new Date(Date.UTC(date.y, date.m - 1, date.d + 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export type EventFormResult =
  | { ok: true; payload: Required<Omit<AdminEventInput, "sourceId">> }
  | { ok: false; fields: Record<string, string> };

/** Validate the typed form and build the API body (house wall time). */
export function parseEventForm(values: EventFormValues): EventFormResult {
  const fields: Record<string, string> = {};

  const title = values.title.trim();
  if (!title) fields.title = "Give the night a title.";
  else if (title.length > 120) fields.title = "Keep the title under 120 characters.";

  const venueName = values.venueName.trim();
  if (!venueName) fields.venueName = "Name the venue.";

  const date = realDate(values.date);
  if (!date) fields.date = "Use the date like 2026-10-30.";

  const start = parseTime12(values.startTime);
  if (!start) fields.startTime = "Use a time like 6:00 PM.";
  const end = parseTime12(values.endTime);
  if (!end) fields.endTime = "Use a time like 9:00 PM.";

  let latitude: number | null = null;
  let longitude: number | null = null;
  const latText = values.latitude.trim();
  const lngText = values.longitude.trim();
  if (latText || lngText) {
    const lat = Number(latText);
    const lng = Number(lngText);
    if (!latText || !lngText) {
      fields.latitude = "Add both latitude and longitude, or leave both empty.";
    } else if (!Number.isFinite(lat) || Math.abs(lat) > 90) {
      fields.latitude = "Latitude is between -90 and 90.";
    } else if (!Number.isFinite(lng) || Math.abs(lng) > 180) {
      fields.longitude = "Longitude is between -180 and 180.";
    } else {
      latitude = lat;
      longitude = lng;
    }
  }

  let capacity: number | null = null;
  const capText = values.capacity.trim();
  if (capText) {
    const n = Number(capText);
    if (!/^\d+$/.test(capText) || n < 1 || n > 5000) {
      fields.capacity = "Seats must be a whole number from 1 to 5000.";
    } else {
      capacity = n;
    }
  }

  if (Object.keys(fields).length > 0 || !date || !start || !end) return { ok: false, fields };

  const startDate = values.date.trim();
  const endDate = end <= start ? addDay(date) : startDate;
  return {
    ok: true,
    payload: {
      title,
      description: values.description.trim(),
      startsAt: `${startDate}T${start}`,
      endsAt: `${endDate}T${end}`,
      venueName,
      venueAddress: values.venueAddress.trim() || null,
      latitude,
      longitude,
      capacity,
      coverImageUrl: values.coverImageUrl.trim() || null,
    },
  };
}

/** Editable fields from a managed night the server sent back. */
export function formFromAdminEvent(
  event: Pick<
    AdminEventDTO,
    | "title"
    | "description"
    | "startsAtLocal"
    | "endsAtLocal"
    | "venueName"
    | "venueAddress"
    | "latitude"
    | "longitude"
    | "capacity"
    | "coverImageUrl"
  >,
): EventFormValues {
  const [date, start = ""] = event.startsAtLocal.split("T");
  const [, end = ""] = event.endsAtLocal.split("T");
  return {
    title: event.title,
    description: event.description,
    date: date ?? "",
    startTime: start ? format12(start) : "",
    endTime: end ? format12(end) : "",
    venueName: event.venueName,
    venueAddress: event.venueAddress ?? "",
    latitude: event.latitude === null ? "" : String(event.latitude),
    longitude: event.longitude === null ? "" : String(event.longitude),
    capacity: event.capacity === null ? "" : String(event.capacity),
    coverImageUrl: event.coverImageUrl ?? "",
  };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Fri, Oct 30 · 6:00 PM – 9:00 PM Eastern", or null until date and times parse. */
export function whenPreview(values: Pick<EventFormValues, "date" | "startTime" | "endTime">): string | null {
  const date = realDate(values.date);
  const start = parseTime12(values.startTime);
  const end = parseTime12(values.endTime);
  if (!date || !start || !end) return null;
  const weekday = WEEKDAYS[new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()];
  return `${weekday}, ${MONTHS[date.m - 1]} ${date.d} · ${format12(start)} – ${format12(end)} Eastern`;
}
