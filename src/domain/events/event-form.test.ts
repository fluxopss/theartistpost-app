/// <reference types="jest" />
import type { AdminEventDTO } from "@/api/types";

import { emptyEventForm, formFromAdminEvent, parseEventForm, parseTime12, whenPreview } from "./event-form";

const filled = () => ({
  ...emptyEventForm(),
  title: "  Opening Night ",
  date: "2026-10-30",
  startTime: "6:00 PM",
  endTime: "9:00 PM",
  venueName: "Hacienda",
  venueAddress: "522 Clematis St, West Palm Beach, FL",
  capacity: "80",
});

describe("parseTime12", () => {
  it("reads common ways of typing a time", () => {
    expect(parseTime12("6:00 PM")).toBe("18:00");
    expect(parseTime12("6pm")).toBe("18:00");
    expect(parseTime12("6:30 pm")).toBe("18:30");
    expect(parseTime12("12:15 AM")).toBe("00:15");
    expect(parseTime12("12 PM")).toBe("12:00");
    expect(parseTime12("18:45")).toBe("18:45");
  });

  it("rejects what is not a time", () => {
    expect(parseTime12("")).toBeNull();
    expect(parseTime12("25:00")).toBeNull();
    expect(parseTime12("13 PM")).toBeNull();
    expect(parseTime12("soon")).toBeNull();
  });
});

describe("parseEventForm", () => {
  it("builds the API body in house wall time", () => {
    const parsed = parseEventForm(filled());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload).toEqual({
      title: "Opening Night",
      description: "",
      startsAt: "2026-10-30T18:00",
      endsAt: "2026-10-30T21:00",
      venueName: "Hacienda",
      venueAddress: "522 Clematis St, West Palm Beach, FL",
      latitude: null,
      longitude: null,
      capacity: 80,
      coverImageUrl: null,
    });
  });

  it("rolls an end time at or before the start into the next day", () => {
    const parsed = parseEventForm({ ...filled(), startTime: "9:00 PM", endTime: "1:00 AM" });
    expect(parsed.ok && parsed.payload.endsAt).toBe("2026-10-31T01:00");
  });

  it("asks for what is missing, field by field", () => {
    const parsed = parseEventForm({ ...emptyEventForm() });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(Object.keys(parsed.fields).sort()).toEqual(["date", "endTime", "startTime", "title", "venueName"]);
  });

  it("needs both coordinates or neither, in range", () => {
    expect(parseEventForm({ ...filled(), latitude: "26.7131" }).ok).toBe(false);
    expect(parseEventForm({ ...filled(), latitude: "126", longitude: "-80.05" }).ok).toBe(false);
    const good = parseEventForm({ ...filled(), latitude: "26.7131", longitude: "-80.0533" });
    expect(good.ok && good.payload.latitude).toBe(26.7131);
  });

  it("treats capacity as optional but whole and positive", () => {
    expect(parseEventForm({ ...filled(), capacity: "" }).ok).toBe(true);
    expect(parseEventForm({ ...filled(), capacity: "0" }).ok).toBe(false);
    expect(parseEventForm({ ...filled(), capacity: "12.5" }).ok).toBe(false);
  });

  it("rejects a date that is not a real day", () => {
    expect(parseEventForm({ ...filled(), date: "2026-02-31" }).ok).toBe(false);
    expect(parseEventForm({ ...filled(), date: "10/30/2026" }).ok).toBe(false);
  });
});

describe("formFromAdminEvent", () => {
  it("round-trips an existing night into editable fields", () => {
    const dto = {
      title: "Opening Night",
      description: "Doors at six.",
      startsAtLocal: "2026-10-30T18:00",
      endsAtLocal: "2026-10-30T21:30",
      venueName: "Hacienda",
      venueAddress: null,
      latitude: 26.7131,
      longitude: -80.0533,
      capacity: null,
      coverImageUrl: "https://theartistpost.fluxlab.agency/uploads/a.jpg",
    } as AdminEventDTO;
    expect(formFromAdminEvent(dto)).toMatchObject({
      title: "Opening Night",
      date: "2026-10-30",
      startTime: "6:00 PM",
      endTime: "9:30 PM",
      venueAddress: "",
      latitude: "26.7131",
      capacity: "",
    });
  });
});

describe("whenPreview", () => {
  it("shows the person what they typed in plain words", () => {
    expect(whenPreview(filled())).toBe("Fri, Oct 30 · 6:00 PM – 9:00 PM Eastern");
    expect(whenPreview({ ...filled(), date: "" })).toBeNull();
  });
});
