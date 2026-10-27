// Ported from theartistpost@f604e5f:src/app/privacy/page.tsx, src/app/terms/page.tsx
// and src/app/support/page.tsx (kicker + title from each page's LegalLayout).
/**
 * Terms and Support, faithful to the web pages (Privacy is written for the
 * app; see its note). Where the web text
 * describes the browser/installable web app, it is adapted minimally for the
 * native app and each change is marked `// native:`.
 *
 * Inline web anchors became `links` (web-style hrefs, opened with
 * `followHref`); mailto/tel/maps anchors became `contact` actions.
 */
import { links, site } from "./site";

export type LegalDocId = "privacy" | "terms" | "guidelines" | "support";

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
  // Privacy is written for the native app as it works today (accounts,
  // profiles, posts, RSVPs, check-in). It states the same facts as the
  // website's /privacy page; wording differs where the app differs (no ads,
  // no analytics, no browser storage). Pending Robbie's review.
  privacy: {
    kicker: "Legal",
    title: "Privacy Policy",
    updated: "October 27, 2026",
    sections: [
      {
        body: [
          `${site.legalName} (${site.nonprofitLine} EIN ${site.ein}) operates The Artist Post at ${site.address.full}. Questions about your information: ${site.email} or ${site.phone}.`,
        ],
      },
      {
        heading: "What we collect",
        list: "lead-in",
        body: [
          "Your account. Your name and email. You sign in with a code we email you; there is no password. We keep the account on our servers so you can sign in on another phone.",
          "Your profile. Your handle, plus anything you choose to add: a photo, bio, headline, city, chapter, topics, and Venmo, Cash App or PayPal.me usernames. Your profile and what you add to it are public.",
          "What you share. Posts and replies on the community board, notes on works, reactions, follows, and the photos you attach. These are public to people using The Artist Post. Artists can also publish works to the Wall.",
          "Photos. The app asks for your photo library only when you choose a picture, and uploads only the picture you pick. It does not use your camera or microphone.",
          "RSVPs. When you RSVP to a night we keep your answer, party size, and any note, so the house team can plan seats.",
          "Check-in at events. Checking in is optional. If you tap “Use my location”, the app reads your location once and sends it to confirm you are at the venue. We keep that you checked in and whether it was confirmed, not where you were. The app never tracks your location in the background.",
          "Reports and blocks. If you report something, the house team sees the report and your account. If you block someone, we keep the block so you stop seeing each other.",
          "Get Involved and subscribe. Name, email, optional phone, city, and the message you write. These are sent to our operations system (GoHighLevel) so Robbie can follow up.",
          "On this phone. Saved works and nights, kindness notes you write in the app, your theme, and a copy of recent content for offline use stay on your phone.",
          "Donations and merch. PayPal and Bonfire process those payments. We do not see card numbers.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "To run your account, show what you share to the community, hold seats at nights, keep the community safe, and reply when you reach out. Our hosting and email providers process it for us to do that.",
        ],
      },
      {
        heading: "What we do not do",
        body: [
          "We do not sell personal information. The app does not show ads and does not include advertising or analytics trackers. We do not invent artists, testimonials, or chapter leads.",
        ],
      },
      {
        heading: "Children",
        body: [
          "The Artist Post is a community arts hub, not directed at children under 13. Do not create an account or submit personal information for a child under 13.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "Edit or remove profile details in Edit profile. Delete your own posts and notes from their menu. Delete your account in Settings, which removes your profile and what you shared. Email Robbie to delete a Get Involved or subscribe record, or with any other request. Signing out or uninstalling clears what is kept on this phone.",
        ],
      },
      {
        heading: "Permissions",
        body: [
          "The app asks for your photo library (to choose a picture) and your location (only when you check in). Adding a night to your calendar uses your phone’s own calendar sheet. Push notifications are not turned on.",
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
        links: [{ label: "Donate", href: "/donate" }],
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

  guidelines: {
    kicker: "Community",
    title: "Community Guidelines",
    updated: null,
    sections: [
      {
        body: [
          "The Artist Post is a community for artists, makers and neighbors. These guidelines cover the community board, Wall notes, replies, and profiles.",
        ],
      },
      {
        heading: "Be kind",
        body: [
          "Lift others up. Shout-outs, collab calls, kindness notes, and honest questions are welcome. Disagree with work without attacking the person who made it.",
        ],
      },
      {
        heading: "Not allowed",
        list: "bullets",
        body: [
          "Harassment, bullying, or threats",
          "Hate or discrimination",
          "Sexual content",
          "Spam, scams, or promotion dressed up as community",
          "Impersonating another person or an organization",
          "Anything you don’t have the right to share",
        ],
      },
      {
        heading: "Credit the artist",
        body: [
          "When you share someone’s work, credit them. Don’t present another artist’s work as your own.",
        ],
      },
      {
        heading: "Report, don’t retaliate",
        body: [
          "Use Report on anything that breaks these guidelines. Don’t argue in the comments or try to get even.",
        ],
      },
      {
        heading: "What happens next",
        body: [
          "The house team reviews reports within 24 hours. We may hide content, close reports, or suspend an account. A suspended account can still delete itself.",
        ],
      },
      {
        heading: "Artists never pay to take part",
        body: [
          "Posting on the community board, joining, and showing your work cost nothing.",
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
          // Weekly label, e.g. "Sun–Thu 11 AM – 11 PM · Fri–Sat 11 AM – Midnight".
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
          `Open Donate for the house story, one-time and monthly PayPal, and Venmo ${site.venmo}. Kindness Always merch on Bonfire is a purchase that funds the mission. Sponsorships go through Get Involved — partner.`,
        ],
        links: [
          { label: "Donate", href: "/donate" },
          { label: "Kindness Always merch on Bonfire", href: links.merch },
          { label: "Partner / sponsor", href: "/get-involved" },
        ],
      },
    ],
    contact: ["email", "call", "directions"],
  },
};

export function isLegalDocId(value: unknown): value is LegalDocId {
  return value === "privacy" || value === "terms" || value === "guidelines" || value === "support";
}
