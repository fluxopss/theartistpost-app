/// <reference types="jest" />
import { involveInquirySchema } from "./validation";
import { INQUIRY_MEDIUMS, isInquiryMedium } from "./mediums";

describe("inquiry mediums", () => {
  it("sends the same values as the web form, Culinary right after Music", () => {
    expect(INQUIRY_MEDIUMS.map((m) => m.id)).toEqual([
      "music",
      "culinary",
      "visual",
      "theater",
      "multidisciplinary",
      "other",
    ]);
  });

  it("fit the field the API already accepts", () => {
    for (const { id } of INQUIRY_MEDIUMS) {
      const parsed = involveInquirySchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        intent: "space",
        medium: id,
        message: "I cook for pop-ups.",
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("knows its own values", () => {
    expect(isInquiryMedium("culinary")).toBe(true);
    expect(isInquiryMedium("Culinary")).toBe(false);
    expect(isInquiryMedium("")).toBe(false);
  });
});
