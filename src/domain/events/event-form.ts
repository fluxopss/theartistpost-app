import type { AdminEventDTO, AdminEventInput, AdminVendorInput } from "@/api/types";

import { COMMUNITY_LANE, isEventMedium } from "./lanes";
import { httpsUrl, SPONSOR_NAME_MAX, SPONSOR_URL_MAX, vendorsFrom } from "./sponsors";
import { parseVendors, vendorDraftsFrom, type VendorDraft } from "./vendor-editor";

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
  /** "community" or a house lane id. */
  medium: string;
  sponsorName: string;
  sponsorUrl: string;
  /** Uploaded logo URL (a newly picked logo is uploaded at save time). */
  sponsorLogoUrl: string;
  vendors: VendorDraft[];
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
    medium: COMMUNITY_LANE.id,
    sponsorName: "",
    sponsorUrl: "",
    sponsorLogoUrl: "",
    vendors: [],
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

type BaseKeys =
  | "title"
  | "description"
  | "startsAt"
  | "endsAt"
  | "venueName"
  | "venueAddress"
  | "latitude"
  | "longitude"
  | "capacity"
  | "coverImageUrl";

/**
 * The API body. Lane, sponsor and vendor keys are only present when they say
 * something new (see `parseEventForm`), so a plain save still works on a
 * server that has not run the sponsor migration yet.
 */
export type EventFormPayload = Required<Pick<AdminEventInput, BaseKeys>> &
  Pick<AdminEventInput, "medium" | "sponsorName" | "sponsorUrl" | "sponsorLogoUrl" | "vendors">;

export type EventFormResult =
  | {
      ok: true;
      payload: EventFormPayload;
      /** Row index in the form for each vendor sent, to place server messages. */
      vendorRows: number[];
    }
  | { ok: false; fields: Record<string, string> };

const sameVendors = (a: AdminVendorInput[], b: AdminVendorInput[]) =>
  a.length === b.length &&
  a.every(
    (v, i) => v.name === b[i]?.name && (v.offering ?? "") === (b[i]?.offering ?? "") && (v.url ?? null) === (b[i]?.url ?? null),
  );

/**
 * Validate the typed form and build the API body (house wall time).
 *
 * `initial` is what the form opened with when editing. Lane, sponsor and
 * vendor keys go out only when they differ from it (or, for a new night, when
 * filled in), so a night saved without them never asks the server for
 * columns it may not have yet. A logo picked but not yet uploaded counts as a
 * change via `pendingLogo`.
 */
export function parseEventForm(
  values: EventFormValues,
  initial?: EventFormValues,
  options: { pendingLogo?: boolean } = {},
): EventFormResult {
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

  const medium = values.medium.trim().toLowerCase();
  if (!medium) fields.medium = "Pick the night’s lane.";

  const sponsorName = values.sponsorName.trim();
  const sponsorUrl = values.sponsorUrl.trim();
  const sponsorLogoUrl = values.sponsorLogoUrl.trim();
  const was = initial ?? emptyEventForm();
  // Clearing the name removes the sponsor; a link or logo left as it was goes with it.
  const removing = Boolean(initial) && !sponsorName && Boolean(was.sponsorName.trim());
  const newLink = Boolean(sponsorUrl) && sponsorUrl !== was.sponsorUrl.trim();
  const newLogo = options.pendingLogo === true || (Boolean(sponsorLogoUrl) && sponsorLogoUrl !== was.sponsorLogoUrl.trim());
  if (sponsorName.length > SPONSOR_NAME_MAX) {
    fields.sponsorName = `Keep the sponsor’s name under ${SPONSOR_NAME_MAX} characters.`;
  }
  if (sponsorUrl && !httpsUrl(sponsorUrl, SPONSOR_URL_MAX)) {
    fields.sponsorUrl = "Use their full https:// link, like https://example.com.";
  }
  if (!sponsorName && (removing ? newLink || newLogo : Boolean(sponsorUrl || sponsorLogoUrl) || newLogo)) {
    fields.sponsorName = "Add the sponsor’s name so the night can say who presents it.";
  }

  const vendorResult = parseVendors(values.vendors);
  if (!vendorResult.ok) Object.assign(fields, vendorResult.fields);

  if (Object.keys(fields).length > 0 || !date || !start || !end || !vendorResult.ok) return { ok: false, fields };

  const extras: Partial<EventFormPayload> = {};
  if (!initial || medium !== initial.medium.trim().toLowerCase()) extras.medium = medium;

  if (removing) {
    extras.sponsorName = null;
    extras.sponsorUrl = null;
    extras.sponsorLogoUrl = null;
  } else {
    if (sponsorName !== was.sponsorName.trim()) extras.sponsorName = sponsorName || null;
    if (sponsorUrl !== was.sponsorUrl.trim()) extras.sponsorUrl = sponsorUrl || null;
    if (sponsorLogoUrl !== was.sponsorLogoUrl.trim() || options.pendingLogo) {
      extras.sponsorLogoUrl = sponsorLogoUrl || null;
    }
  }
  const before = parseVendors(was.vendors);
  if (!before.ok || !sameVendors(vendorResult.vendors, before.vendors)) extras.vendors = vendorResult.vendors;

  const startDate = values.date.trim();
  const endDate = end <= start ? addDay(date) : startDate;
  return {
    ok: true,
    vendorRows: vendorResult.rows,
    payload: {
      ...extras,
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

/** A known lane as its id ("Culinary" → "culinary"); an older free-text medium kept as typed. */
function mediumForForm(medium: string | null | undefined): string {
  const text = medium?.trim() ?? "";
  if (!text) return COMMUNITY_LANE.id;
  return isEventMedium(text) ? text.toLowerCase() : text;
}

/** Editable fields from a managed night the server sent back. */
export function formFromAdminEvent(
  event: Pick<
    AdminEventDTO,
    | "medium"
    | "sponsorName"
    | "sponsorUrl"
    | "sponsorLogoUrl"
    | "vendors"
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
    medium: mediumForForm(event.medium),
    sponsorName: event.sponsorName ?? "",
    sponsorUrl: event.sponsorUrl ?? "",
    sponsorLogoUrl: event.sponsorLogoUrl ?? "",
    vendors: vendorDraftsFrom(vendorsFrom(event.vendors)),
  };
}

/**
 * Servers before the sponsor migration send no sponsor keys on a managed
 * night; the form says so instead of offering fields that would not save.
 */
export function supportsSponsors(event: object): boolean {
  return "sponsorName" in event && "vendors" in event;
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
