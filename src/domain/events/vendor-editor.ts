import type { AdminVendorInput } from "@/api/types";

import {
  httpsUrl,
  VENDOR_NAME_MAX,
  VENDOR_OFFERING_MAX,
  VENDOR_URL_MAX,
  VENDORS_MAX,
  type Vendor,
} from "./sponsors";

/** One vendor row as typed in the event form. */
export type VendorDraft = { name: string; offering: string; url: string };

export function emptyVendor(): VendorDraft {
  return { name: "", offering: "", url: "" };
}

export function canAddVendor(rows: readonly VendorDraft[]): boolean {
  return rows.length < VENDORS_MAX;
}

export function addVendorRow(rows: readonly VendorDraft[]): VendorDraft[] {
  return canAddVendor(rows) ? [...rows, emptyVendor()] : [...rows];
}

export function removeVendorRow(rows: readonly VendorDraft[], index: number): VendorDraft[] {
  return rows.filter((_, i) => i !== index);
}

export function vendorDraftsFrom(vendors: readonly Vendor[]): VendorDraft[] {
  return vendors.map((vendor) => ({ name: vendor.name, offering: vendor.offering, url: vendor.url ?? "" }));
}

const isBlank = (row: VendorDraft) => !row.name.trim() && !row.offering.trim() && !row.url.trim();

export type VendorParse =
  | { ok: true; vendors: AdminVendorInput[]; rows: number[] }
  | { ok: false; fields: Record<string, string> };

/**
 * Check the vendor rows and build the API list. A row left completely empty
 * is skipped; anything else needs a name. Field keys match the server's
 * (`vendors.0.name`), so its messages land on the same row.
 */
export function parseVendors(rows: readonly VendorDraft[]): VendorParse {
  const fields: Record<string, string> = {};
  const vendors: AdminVendorInput[] = [];
  const kept: number[] = [];

  rows.forEach((row, index) => {
    if (isBlank(row)) return;
    const name = row.name.trim();
    const offering = row.offering.trim();
    const url = row.url.trim();

    if (!name) fields[`vendors.${index}.name`] = "Give this vendor a name.";
    else if (name.length > VENDOR_NAME_MAX)
      fields[`vendors.${index}.name`] = `Keep the name under ${VENDOR_NAME_MAX} characters.`;

    if (offering.length > VENDOR_OFFERING_MAX)
      fields[`vendors.${index}.offering`] = `Keep this under ${VENDOR_OFFERING_MAX} characters.`;

    if (url && !httpsUrl(url, VENDOR_URL_MAX))
      fields[`vendors.${index}.url`] = "Use their full https:// link, like https://example.com.";

    vendors.push({ name, offering, url: url || null });
    kept.push(index);
  });

  if (vendors.length > VENDORS_MAX) fields.vendors = `A night can list up to ${VENDORS_MAX} vendors.`;
  return Object.keys(fields).length > 0 ? { ok: false, fields } : { ok: true, vendors, rows: kept };
}
