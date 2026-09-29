// Ported from theartistpost@03f9a2f:src/content/involve.ts
import { links, type BrandImage } from "@/content/site";

/*
 * Native notes: the web's Tailwind-class helpers (involveImageFitClass,
 * involveImagePlateClass, involveImageAspectClass) and `doorHref` were dropped.
 * `involveImagePlate` keeps the plate intent as a token instead of a class.
 *
 * TODO(nav): internal `primary`/`secondary` hrefs (no `external` flag) are web
 * routes ("/artist-schedule", "/supporters", "/kindness-always", "/night").
 * Map them to native routes in the UI layer; external/mailto hrefs work as-is.
 */

export const INVOLVE_DOOR_IDS = [
  "space",
  "partner",
  "support",
  "volunteer",
  "events",
] as const;

export type InvolveDoorId = (typeof INVOLVE_DOOR_IDS)[number];

export type InvolveSpark = "coral" | "gold" | "teal";

export type InvolveDoorLink = { href: string; label: string; external?: boolean };

export type InvolveDoor = {
  id: InvolveDoorId;
  index: string;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  invitation: string;
  image: BrandImage;
  imageAlt: string;
  spark: InvolveSpark;
  imageFit: "cover" | "contain";
  collectsInquiry: boolean;
  primary: InvolveDoorLink;
  secondary?: InvolveDoorLink;
};

/** Robbie’s five participation paths from portal intake — not a merch funnel. */
export const involveDoors: readonly InvolveDoor[] = [
  {
    id: "space",
    index: "01",
    title: "Book an Artist Space",
    kicker: "Artists",
    summary: "Reserve a free showcase opportunity.",
    invitation: "The live room is lit. Step through to reserve a free showcase.",
    detail:
      "Hacienda is TAP’s live creative space on Clematis. Review the agreement, get approved, then receive a scheduling link. Showcase is free — kindness and collaboration are the cost of entry.",
    image: "haciendaHero",
    imageAlt: "The Artist Post live space at Hacienda",
    spark: "coral",
    imageFit: "cover",
    collectsInquiry: true,
    primary: {
      href: links.artistAgreement,
      label: "Review & sign the agreement",
      external: true,
    },
    secondary: { href: "/artist-schedule", label: "Artist schedule" },
  },
  {
    id: "partner",
    index: "02",
    title: "Become a Partner",
    kicker: "Venues & sponsors",
    summary: "Businesses, venues, and sponsors who open doors.",
    invitation: "Have a room, a storefront, or a night to underwrite? Open it.",
    detail:
      "TAP grows by activating space with artists — not by selling a stack of services. If you have a room, a storefront, a stage, or want to sponsor a chapter, start here.",
    image: "partnerSubCulture",
    imageAlt: "Community partner mark",
    spark: "gold",
    imageFit: "contain",
    collectsInquiry: true,
    primary: { href: "/supporters", label: "See chapters" },
    secondary: {
      href: `mailto:Robbie@theartistpost.org?subject=${encodeURIComponent("Partnership — The Artist Post")}`,
      label: "Email Robbie",
      external: true,
    },
  },
  {
    id: "support",
    index: "03",
    title: "Support the Mission",
    kicker: "Give",
    summary: "Donate or shop merchandise that funds local arts.",
    invitation: "See what a gift actually funds — then give or wear the work.",
    detail:
      "Donations keep the Hacienda space going and build toward a permanent home for art. PayPal and Venmo are live. Kindness Always merch is donation-based purpose you can wear.",
    image: "donations",
    imageAlt: "Donations appreciated — toward a permanent home for art",
    spark: "gold",
    imageFit: "contain",
    collectsInquiry: false,
    primary: { href: "/donate", label: "Support the house" },
    secondary: { href: links.merch, label: "Shop merch", external: true },
  },
  {
    id: "volunteer",
    index: "04",
    title: "Volunteer",
    kicker: "Hands & hearts",
    summary: "Help spread kindness and support local artists.",
    invitation: "Hands and hearts — pick a mission and we will match you.",
    detail:
      "Hold space at showcases, welcome visitors, leave a spark on the kindness wall, or help a chapter stand up. Tell us how you can show up — we will match you to the work.",
    image: "kindnessTrademark",
    imageAlt: "Kindness Always®",
    spark: "teal",
    imageFit: "contain",
    collectsInquiry: true,
    primary: { href: "/kindness-always", label: "Leave a kindness" },
    secondary: {
      href: `mailto:Robbie@theartistpost.org?subject=${encodeURIComponent("Volunteer — The Artist Post")}`,
      label: "Email Robbie",
      external: true,
    },
  },
  {
    id: "events",
    index: "05",
    title: "Explore Events",
    kicker: "Community",
    summary: "Upcoming showcases and community gatherings.",
    invitation: "Walk the nights on Clematis. Leave a spark if you come.",
    detail:
      "The calendar is the living wall of who is in the space. Come support scheduled local artisans at Hacienda — or apply for a slot of your own.",
    image: "comingSoon",
    imageAlt: "Artist schedule at Hacienda",
    spark: "coral",
    imageFit: "contain",
    collectsInquiry: false,
    primary: { href: "/night", label: "Hold a seat" },
    secondary: { href: "/artist-schedule", label: "Open the schedule" },
  },
];

export function isInvolveDoorId(value: string | null | undefined): value is InvolveDoorId {
  return Boolean(value && (INVOLVE_DOOR_IDS as readonly string[]).includes(value));
}

/** Plate behind a door image: light paper for logo marks, ink for photos. */
export function involveImagePlate(id: InvolveDoorId): "paper" | "ink" {
  switch (id) {
    case "support":
    case "partner":
    case "events":
      return "paper";
    case "space":
    case "volunteer":
      return "ink";
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function doorById(id: InvolveDoorId): InvolveDoor {
  switch (id) {
    case "space":
    case "partner":
    case "support":
    case "volunteer":
    case "events": {
      const found = involveDoors.find((d) => d.id === id);
      if (!found) {
        throw new Error(`Missing door data: ${id}`);
      }
      return found;
    }
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unknown involve door: ${_exhaustive}`);
    }
  }
}
