import type { AttendeeDTO } from "@/api/types";

const HEADER = "name,email,status,seats,waitlisted,note,rsvp_at,checked_in,verified,checked_in_at";

/** Quote for CSV and defuse spreadsheet formulas. */
function cell(value: string | number | boolean | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Attendee list as spreadsheet-safe CSV (same columns as the server export). */
export function attendeesToCsv(items: AttendeeDTO[]): string {
  const rows = items.map((i) =>
    [i.name, i.email, i.status, i.party, i.waitlisted, i.note, i.rsvpAt, i.checkedIn, i.verified, i.checkedInAt]
      .map(cell)
      .join(","),
  );
  return `${[HEADER, ...rows].join("\n")}\n`;
}
