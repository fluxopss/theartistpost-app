/// <reference types="jest" />
import {
  addVendorRow,
  canAddVendor,
  emptyVendor,
  parseVendors,
  removeVendorRow,
  vendorDraftsFrom,
  type VendorDraft,
} from "./vendor-editor";

const row = (over: Partial<VendorDraft> = {}): VendorDraft => ({ ...emptyVendor(), ...over });

describe("vendor rows", () => {
  it("adds and removes rows, up to 12", () => {
    let rows: VendorDraft[] = [];
    for (let i = 0; i < 15; i++) rows = addVendorRow(rows);
    expect(rows).toHaveLength(12);
    expect(canAddVendor(rows)).toBe(false);
    rows = removeVendorRow(rows, 0);
    expect(rows).toHaveLength(11);
    expect(canAddVendor(rows)).toBe(true);
  });

  it("removes the row asked for", () => {
    const rows = [row({ name: "A" }), row({ name: "B" }), row({ name: "C" })];
    expect(removeVendorRow(rows, 1).map((r) => r.name)).toEqual(["A", "C"]);
  });

  it("opens saved vendors as editable rows", () => {
    expect(vendorDraftsFrom([{ name: "Taco Truck", offering: "Tacos", url: null }])).toEqual([
      { name: "Taco Truck", offering: "Tacos", url: "" },
    ]);
  });
});

describe("parseVendors", () => {
  it("builds the API list, skipping rows left empty", () => {
    const result = parseVendors([
      row({ name: " Taco Truck ", offering: " Street tacos ", url: " https://tacos.example " }),
      row(),
      row({ name: "Bread Co" }),
    ]);
    expect(result).toEqual({
      ok: true,
      vendors: [
        { name: "Taco Truck", offering: "Street tacos", url: "https://tacos.example" },
        { name: "Bread Co", offering: "", url: null },
      ],
      rows: [0, 2],
    });
  });

  it("asks for a name on a row with anything else in it", () => {
    const result = parseVendors([row({ offering: "Coffee" })]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fields["vendors.0.name"]).toBe("Give this vendor a name.");
  });

  it("keeps names, offerings and links within the server's limits", () => {
    const result = parseVendors([
      row({ name: "x".repeat(61) }),
      row({ name: "Ok", offering: "y".repeat(81) }),
      row({ name: "Ok", url: "http://not-secure.example" }),
      row({ name: "Ok", url: "javascript:alert(1)" }),
    ]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fields).sort()).toEqual([
      "vendors.0.name",
      "vendors.1.offering",
      "vendors.2.url",
      "vendors.3.url",
    ]);
    expect(result.fields["vendors.2.url"]).toMatch(/https:\/\//);
  });

  it("warns past 12 vendors", () => {
    const rows = Array.from({ length: 13 }, (_, i) => row({ name: `V${i}` }));
    const result = parseVendors(rows);
    expect(!result.ok && result.fields.vendors).toBe("A night can list up to 12 vendors.");
  });
});
