/// <reference types="jest" />
import type { AdminEventDTO } from "@/api/types";

import {
  emptyEventForm,
  formFromAdminEvent,
  parseEventForm,
  parseTime12,
  supportsSponsors,
  whenPreview,
} from "./event-form";

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
      medium: "community",
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

describe("parseEventForm: lane, sponsor and vendors", () => {
  it("sends no sponsor or vendor keys for a night without them (safe before the migration)", () => {
    const parsed = parseEventForm(filled());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    for (const key of ["sponsorName", "sponsorUrl", "sponsorLogoUrl", "vendors"]) {
      expect(parsed.payload).not.toHaveProperty(key);
    }
  });

  it("files a new night under the lane picked, Culinary included", () => {
    const parsed = parseEventForm({ ...filled(), medium: "culinary" });
    expect(parsed.ok && parsed.payload.medium).toBe("culinary");
  });

  it("sends the sponsor and vendors when they are filled in", () => {
    const parsed = parseEventForm({
      ...filled(),
      sponsorName: "  Clematis Coffee ",
      sponsorUrl: "https://clematis.coffee",
      vendors: [
        { name: "Taco Truck", offering: "Street tacos", url: "" },
        { name: "", offering: "", url: "" },
      ],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload).toMatchObject({
      sponsorName: "Clematis Coffee",
      sponsorUrl: "https://clematis.coffee",
      vendors: [{ name: "Taco Truck", offering: "Street tacos", url: null }],
    });
    expect(parsed.vendorRows).toEqual([0]);
  });

  it("needs a name before a sponsor link or logo", () => {
    const link = parseEventForm({ ...filled(), sponsorUrl: "https://example.com" });
    expect(!link.ok && link.fields.sponsorName).toBeTruthy();
    const logo = parseEventForm(filled(), undefined, { pendingLogo: true });
    expect(!logo.ok && logo.fields.sponsorName).toBeTruthy();
  });

  it("accepts only https sponsor links", () => {
    for (const url of ["http://example.com", "javascript:alert(1)", "example.com"]) {
      const parsed = parseEventForm({ ...filled(), sponsorName: "Sponsor", sponsorUrl: url });
      expect(!parsed.ok && parsed.fields.sponsorUrl).toBeTruthy();
    }
  });

  it("on edit, sends only what changed", () => {
    const initial = { ...filled(), medium: "music", sponsorName: "Clematis Coffee" };
    const same = parseEventForm(initial, initial);
    expect(same.ok).toBe(true);
    if (!same.ok) return;
    expect(same.payload).not.toHaveProperty("medium");
    expect(same.payload).not.toHaveProperty("sponsorName");
    expect(same.payload).not.toHaveProperty("vendors");

    const cleared = parseEventForm({ ...initial, sponsorName: "" }, initial);
    expect(cleared.ok && cleared.payload.sponsorName).toBeNull();

    const withLink = { ...initial, sponsorUrl: "https://clematis.coffee" };
    const removed = parseEventForm({ ...withLink, sponsorName: "" }, withLink);
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(removed.payload).toMatchObject({ sponsorName: null, sponsorUrl: null, sponsorLogoUrl: null });
    }

    const relaned = parseEventForm({ ...initial, medium: "culinary" }, initial);
    expect(relaned.ok && relaned.payload.medium).toBe("culinary");
  });

  it("has no money field", () => {
    const parsed = parseEventForm({ ...filled(), sponsorName: "S", vendors: [{ name: "V", offering: "", url: "" }] });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const keys = JSON.stringify(parsed.payload).toLowerCase();
    expect(keys).not.toMatch(/price|fee|amount|tier/);
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
      medium: "community",
      sponsorName: "",
      vendors: [],
    });
  });

  it("brings the lane, sponsor and vendors into the form", () => {
    const dto = {
      title: "Taco Night",
      description: "",
      startsAtLocal: "2026-10-30T18:00",
      endsAtLocal: "2026-10-30T21:00",
      venueName: "Hacienda",
      venueAddress: null,
      latitude: null,
      longitude: null,
      capacity: null,
      coverImageUrl: null,
      medium: "culinary",
      sponsorName: "Clematis Coffee",
      sponsorUrl: "https://clematis.coffee",
      sponsorLogoUrl: "https://theartistpost.fluxlab.agency/uploads/logo.png",
      vendors: [{ name: "Taco Truck", offering: "Street tacos", url: null }],
    } as AdminEventDTO;
    expect(formFromAdminEvent(dto)).toMatchObject({
      medium: "culinary",
      sponsorName: "Clematis Coffee",
      sponsorUrl: "https://clematis.coffee",
      sponsorLogoUrl: "https://theartistpost.fluxlab.agency/uploads/logo.png",
      vendors: [{ name: "Taco Truck", offering: "Street tacos", url: "" }],
    });
    expect(supportsSponsors(dto)).toBe(true);
  });

  it("knows when the server has no sponsor fields yet", () => {
    expect(supportsSponsors({ title: "Old night", medium: "community" })).toBe(false);
  });
});

describe("whenPreview", () => {
  it("shows the person what they typed in plain words", () => {
    expect(whenPreview(filled())).toBe("Fri, Oct 30 · 6:00 PM – 9:00 PM Eastern");
    expect(whenPreview({ ...filled(), date: "" })).toBeNull();
  });
});
