// Mirrors theartistpost src/features/involve/InvolveInquiryForm.tsx (MEDIA).
/**
 * What the inquiry's `medium` field carries. Same values the web form sends,
 * so Robbie sees one vocabulary in the CRM whichever door someone came through.
 * Culinary sits right after Music, as on the web.
 */
export const INQUIRY_MEDIUMS = [
  { id: "music", label: "Music" },
  { id: "culinary", label: "Culinary" },
  { id: "visual", label: "Visual art" },
  { id: "theater", label: "Theater" },
  { id: "multidisciplinary", label: "Multidisciplinary" },
  { id: "other", label: "Something else" },
] as const;

export type InquiryMedium = (typeof INQUIRY_MEDIUMS)[number]["id"];

export function isInquiryMedium(value: unknown): value is InquiryMedium {
  return INQUIRY_MEDIUMS.some((medium) => medium.id === value);
}
