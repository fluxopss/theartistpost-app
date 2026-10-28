/// <reference types="jest" />
import type { EventDTO } from "@/api/types";

import { httpsUrl, presentedByFrom, presentedByLine, vendorsFrom, withSponsorFields } from "./sponsors";

/** A night exactly as today's production API sends it: no sponsor keys at all. */
const legacyNight = {
  id: "evt_1",
  title: "Opening Night",
  artist: "",
  medium: "community",
  start: "2026-10-30T18:00:00-04:00",
  end: "2026-10-30T21:00:00-04:00",
  venue: "Hacienda",
  description: "",
  comingSoon: false,
  status: "upcoming",
  source: "db",
  cancelled: false,
  timeZone: "America/New_York",
  venueAddress: null,
  latitude: null,
  longitude: null,
  capacity: null,
  coverImageUrl: null,
} satisfies EventDTO;

describe("parsing nights with and without sponsor fields", () => {
  it("reads a night from a server without the new keys as unsponsored, with no vendors", () => {
    const night = withSponsorFields(legacyNight);
    expect(night.presentedBy).toBeNull();
    expect(night.vendors).toEqual([]);
    expect(night.title).toBe("Opening Night");
  });

  it("keeps a sponsored night's sponsor and vendors", () => {
    const night = withSponsorFields({
      ...legacyNight,
      medium: "culinary",
      presentedBy: { name: "Clematis Coffee", url: "https://clematis.coffee", logoUrl: null },
      vendors: [
        { name: "Taco Truck", offering: "Street tacos", url: "https://tacos.example" },
        { name: "Bread Co", offering: "", url: null },
      ],
    });
    expect(night.presentedBy).toEqual({ name: "Clematis Coffee", url: "https://clematis.coffee", logoUrl: null });
    expect(night.vendors).toHaveLength(2);
    expect(night.vendors[1]).toEqual({ name: "Bread Co", offering: "", url: null });
  });

  it("treats null, empty and malformed values as none, never as an error", () => {
    expect(presentedByFrom(null)).toBeNull();
    expect(presentedByFrom(undefined)).toBeNull();
    expect(presentedByFrom({ name: "   " })).toBeNull();
    expect(presentedByFrom("Clematis Coffee")).toBeNull();
    expect(vendorsFrom(null)).toEqual([]);
    expect(vendorsFrom({ name: "x" })).toEqual([]);
    expect(vendorsFrom([null, 3, { offering: "no name" }, { name: "Kept" }])).toEqual([
      { name: "Kept", offering: "", url: null },
    ]);
  });

  it("drops links that are not https", () => {
    const sponsor = presentedByFrom({ name: "S", url: "javascript:alert(1)", logoUrl: "http://x.test/a.png" });
    expect(sponsor).toEqual({ name: "S", url: null, logoUrl: null });
    expect(vendorsFrom([{ name: "V", url: "http://v.test" }])[0]?.url).toBeNull();
  });

  it("lists at most 12 vendors", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ name: `Vendor ${i}`, offering: "" }));
    expect(vendorsFrom(many)).toHaveLength(12);
  });
});

describe("httpsUrl", () => {
  it("accepts https links and refuses the rest", () => {
    expect(httpsUrl("https://example.com")).toBe("https://example.com");
    expect(httpsUrl(" https://example.com/menu?x=1 ")).toBe("https://example.com/menu?x=1");
    expect(httpsUrl("http://example.com")).toBeNull();
    expect(httpsUrl("https://user:pw@example.com")).toBeNull();
    expect(httpsUrl("https://")).toBeNull();
    expect(httpsUrl(`https://example.com/${"a".repeat(300)}`)).toBeNull();
  });
});

it("says a sponsored night plainly", () => {
  expect(presentedByLine("Clematis Coffee")).toBe("Presented by Clematis Coffee");
});
