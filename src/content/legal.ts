// Ported from theartistpost@f604e5f:src/app/privacy/page.tsx, src/app/terms/page.tsx
// and src/app/support/page.tsx (kicker + title from each page's LegalLayout).
/**
 * Privacy, Terms and Support, faithful to the web pages. Where the web text
 * describes the browser/installable web app, it is adapted minimally for the
 * native app and each change is marked `// native:`.
 *
 * Inline web anchors became `links` (web-style hrefs, opened with
 * `followHref`); mailto/tel/maps anchors became `contact` actions.
 */
import { links, site } from "./site";

export type LegalDocId = "privacy" | "terms" | "support";

export type LegalContact = "email" | "call" | "directions";

export type LegalLink = { label: string; href: string };

export type LegalSection = {
  heading?: string;
  body: string[];
  /**
   * A web `<ul>`. "lead-in" items opened with a bold phrase: the text up to
   * and including the first ". ".
   */
  list?: "bullets" | "lead-in";
  links?: LegalLink[];
};

export type LegalDoc = {
  kicker: string;
  title: string;
  /** The "Last updated" date printed on the web page; null when it has none. */
  updated: string | null;
  sections: LegalSection[];
  contact: LegalContact[];
};

export const legalDocs: Record<LegalDocId, LegalDoc> = {
  privacy: {
    kicker: "Legal",
    title: "Privacy Policy",
    updated: "August 28, 2026",
    sections: [
      {
        body: [
          `${site.legalName} (${site.nonprofitLine} EIN ${site.ein}) operates The Artist Post at ${site.address.full}. Contact ${site.email} or ${site.phone}.`,
        ],
      },
      {
        heading: "What we collect",
        list: "lead-in",
        body: [
          "Get Involved and subscribe. Name, email, optional phone, city, and the message you write. These are sent to our operations webhook (GoHighLevel) when it is configured so Robbie can follow up.",
          // native: "stay in your browser storage" → "stay in this app’s storage on your phone".
          "On this device. Studio name, likes, saved works and nights, kindness notes, comments, theme, and motion preference stay in this app’s storage on your phone. They are not uploaded until artist accounts exist.",
          "Donations and merch. PayPal and Bonfire process those payments. We do not see card numbers.",
          "Optional analytics. If a Pulse key is configured, we record anonymous product events such as Donate or Get Involved taps.",
        ],
      },
      {
        heading: "What we do not do",
        body: [
          "We do not sell personal information. We do not run a public account system yet — a “Studio Guest” name is local only. We do not invent artists, testimonials, or chapter leads.",
        ],
      },
      {
        heading: "Children",
        body: [
          "The app is a community arts hub, not directed at children under 13. Do not submit personal information for a child under 13.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          // native: "You can install or uninstall the web app at any time." →
          // "You can uninstall the app at any time."
          "Clear local studio data in Settings. Email Robbie to ask us to delete a Get Involved or subscribe record. You can uninstall the app at any time.",
        ],
      },
      {
        // native: heading was "App Store build", and its first sentence described
        // the iOS web wrapper ("The iOS wrapper loads this same site."). The rest
        // of the paragraph is verbatim.
        heading: "The native app",
        body: [
          "This app is built natively for iPhone and Android and shows the same content as the website. It does not add extra trackers. Camera or photo library access is only used if you choose an image in Create. Push notifications are not active until we ship a native reminder feature and ask permission.",
        ],
      },
    ],
    contact: ["email", "call"],
  },

  terms: {
    kicker: "Legal",
    title: "Terms of Use",
    updated: "August 28, 2026",
    sections: [
      {
        body: [
          `By using The Artist Post you agree to these terms. The house is operated by ${site.legalName}, a 501(c)(3) organization (EIN ${site.ein}), at ${site.address.full}.`,
        ],
      },
      {
        heading: "The house",
        body: [
          // native: the inline "(donate)" anchor after "PayPal" became the Donate link below.
          "This is a community platform for local artists, small businesses, and neighbors. Showcase space is free. Donations support local arts, artists, venues, and community events. They are processed by PayPal and are not a purchase of goods from this app unless you order merch through Bonfire.",
        ],
        links: [{ label: "Donate", href: links.donate }],
      },
      {
        heading: "Your content",
        body: [
          "Kindness notes, comments, and Create drafts you make stay on this device unless you publish through a form we receive (Get Involved, artist agreement). Do not post anything unlawful, hateful, or that you do not have the right to share. We may remove material that breaks these terms or our mission of kindness.",
        ],
      },
      {
        heading: "Artist agreement",
        body: [
          "Booking physical space requires the official artist agreement. After it is approved, you receive a scheduling link. The Google Form remains the legal source of truth until accounts launch.",
        ],
      },
      {
        heading: "No warranties",
        body: [
          "Event listings marked coming soon are placeholders. Featured artists appear only when real portraits and bios are provided. The service is offered as-is.",
        ],
      },
      {
        heading: "Contact",
        body: [
          `Questions: ${site.email}. These terms are governed by the laws of the State of Florida.`,
        ],
      },
    ],
    contact: ["email"],
  },

  support: {
    kicker: "Help",
    title: "Support",
    updated: null,
    sections: [
      {
        body: [
          // native: `site.hoursToday` ("09:00 am – 09:30 pm") → `site.hours.label`,
          // the same hours in the app's formatting.
          `Robbie reads the inbox. Better yet, see us in person at Hacienda during posted hours (${site.hours.label}).`,
        ],
        // native: the web's Email / Call or text / Visit list became the contact
        // actions at the end of the page (see `contact` below).
      },
      {
        heading: "How do I showcase?",
        body: [
          "Open Get Involved, choose a door, and sign the artist agreement. After approval you receive a scheduling link.",
        ],
        // native: "Get Involved" was plain text on the web; it is a link here.
        links: [
          { label: "Get Involved", href: "/get-involved" },
          { label: "Artist agreement", href: links.artistAgreement },
        ],
      },
      // native: "How do I install the app?" (Share → Add to Home Screen, the
      // install banner, the web wrapper) is web-only and was dropped.
      {
        heading: "Donations and merch",
        body: [
          `Donate via PayPal or Venmo ${site.venmo}. Order Kindness Always merch on Bonfire or call to place an order.`,
        ],
        links: [
          { label: "Donate with PayPal", href: links.donate },
          { label: "Kindness Always merch on Bonfire", href: links.merch },
        ],
      },
    ],
    contact: ["email", "call", "directions"],
  },
};

export function isLegalDocId(value: unknown): value is LegalDocId {
  return value === "privacy" || value === "terms" || value === "support";
}
