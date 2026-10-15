/// <reference types="jest" />
import type { AttendeeDTO } from "@/api/types";

import { attendeesToCsv } from "./export";

const person = (over: Partial<AttendeeDTO> = {}): AttendeeDTO => ({
  userId: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  status: "GOING",
  party: 2,
  waitlisted: false,
  note: null,
  rsvpAt: "2026-10-16T00:00:00.000Z",
  checkedIn: true,
  verified: true,
  checkedInAt: "2026-10-30T22:05:00.000Z",
  ...over,
});

describe("attendeesToCsv", () => {
  it("writes a header and one row per person", () => {
    const [header, row] = attendeesToCsv([person()]).trim().split("\n");
    expect(header).toBe("name,email,status,seats,waitlisted,note,rsvp_at,checked_in,verified,checked_in_at");
    expect(row).toBe(
      "Ada Lovelace,ada@example.com,GOING,2,false,,2026-10-16T00:00:00.000Z,true,true,2026-10-30T22:05:00.000Z",
    );
  });

  it("quotes commas and quotes, and defuses spreadsheet formulas", () => {
    const csv = attendeesToCsv([person({ name: 'Ada "Ace", Esq.', note: '=HYPERLINK("http://x")' })]);
    expect(csv).toContain('"Ada ""Ace"", Esq."');
    expect(csv).toContain("\"'=HYPERLINK(");
  });
});
