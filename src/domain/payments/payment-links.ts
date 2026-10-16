/**
 * Artists' optional "Get paid directly" usernames. Link-out only: the app
 * stores a username, shows a chip, and opens an https link in another app or
 * the browser after a confirm. It never processes, holds or takes a share of
 * a payment, and it never calls these "donations" (donations through the app
 * go to The Artist Post itself).
 *
 * The validation here mirrors the server's so mistakes show before a save.
 * The server stays the authority.
 */

export type PaymentService = "venmo" | "cashapp" | "paypalme";

export type PaymentLinkDTO = {
  service: PaymentService;
  label: string;
  url: string;
};

export type PaymentFieldKey = "venmoUsername" | "cashAppTag" | "paypalMeUsername";

export const PAYMENT_HELPER =
  "Payments happen outside the app in these services. The Artist Post doesn't process them or take a cut.";

type Spec = {
  label: string;
  hosts: readonly string[];
  charset: RegExp;
  min: number;
  max: number;
  startsWithLetter: boolean;
  rule: string;
  nameFromPath: (segments: string[], host: string) => string | undefined;
  /** Host the chip's link must be on. */
  linkHost: string;
};

const SPECS: Record<PaymentService, Spec> = {
  venmo: {
    label: "Venmo",
    hosts: ["venmo.com", "account.venmo.com"],
    charset: /^[A-Za-z0-9_-]+$/,
    min: 5,
    max: 30,
    startsWithLetter: false,
    rule: "Venmo usernames are 5–30 letters, numbers, - or _.",
    nameFromPath: (segments) => (segments[0]?.toLowerCase() === "u" ? segments[1] : segments[0]),
    linkHost: "venmo.com",
  },
  cashapp: {
    label: "Cash App",
    hosts: ["cash.app", "cash.me"],
    charset: /^[A-Za-z0-9]+$/,
    min: 1,
    max: 20,
    startsWithLetter: true,
    rule: "Cash App cashtags are 1–20 letters or numbers, starting with a letter.",
    nameFromPath: (segments) => segments[0],
    linkHost: "cash.app",
  },
  paypalme: {
    label: "PayPal",
    hosts: ["paypal.me", "paypal.com"],
    charset: /^[A-Za-z0-9]+$/,
    min: 1,
    max: 20,
    startsWithLetter: false,
    rule: "PayPal.me names are 1–20 letters or numbers.",
    nameFromPath: (segments, host) =>
      host === "paypal.com" ? (segments[0]?.toLowerCase() === "paypalme" ? segments[1] : undefined) : segments[0],
    linkHost: "paypal.me",
  },
};

export const PAYMENT_SERVICES: readonly PaymentService[] = ["venmo", "cashapp", "paypalme"];

/** What the edit screen renders, in order. */
export const PAYMENT_FIELDS: readonly {
  service: PaymentService;
  key: PaymentFieldKey;
  label: string;
  placeholder: string;
}[] = [
  { service: "venmo", key: "venmoUsername", label: "Venmo username", placeholder: "robbie-art" },
  { service: "cashapp", key: "cashAppTag", label: "Cash App cashtag", placeholder: "robbieart" },
  { service: "paypalme", key: "paypalMeUsername", label: "PayPal.me name", placeholder: "robbieart" },
];

export const PAYMENT_INPUT_MAX = 300;

const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const HOST_LIKE_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i;

function hostOwner(host: string): PaymentService | null {
  for (const service of PAYMENT_SERVICES) {
    if (SPECS[service].hosts.includes(host)) return service;
  }
  return null;
}

export type PaymentParse = { ok: true; value: string | null } | { ok: false; message: string };

export function parsePaymentUsername(service: PaymentService, raw: string): PaymentParse {
  const spec = SPECS[service];
  const input = raw.trim();
  if (input === "") return { ok: true, value: null };
  if (input.length > PAYMENT_INPUT_MAX) {
    return { ok: false, message: "That is too long to be a username or link." };
  }

  let candidate = input;
  if (input.includes("/") || SCHEME_RE.test(input) || HOST_LIKE_RE.test(input)) {
    const notALink: PaymentParse = {
      ok: false,
      message: `That doesn't look like a ${spec.label} username or link. ${spec.rule}`,
    };
    let url: URL;
    try {
      url = new URL(SCHEME_RE.test(input) ? input : `https://${input}`);
    } catch {
      return notALink;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return notALink;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const owner = hostOwner(host);
    if (owner === null) return notALink;
    if (owner !== service) {
      const other = SPECS[owner].label;
      return { ok: false, message: `That looks like a ${other} link. Put it in the ${other} field instead.` };
    }
    const segments = url.pathname
      .split("/")
      .filter((part) => part !== "")
      .map((part) => {
        try {
          return decodeURIComponent(part);
        } catch {
          return part;
        }
      });
    const fromPath = spec.nameFromPath(segments, host);
    if (!fromPath) return notALink;
    candidate = fromPath;
  }

  candidate = candidate.replace(/^[@$]+/, "");
  if (candidate === "") return { ok: true, value: null };

  const valid =
    candidate.length >= spec.min &&
    candidate.length <= spec.max &&
    spec.charset.test(candidate) &&
    (!spec.startsWithLetter || /^[A-Za-z]/.test(candidate));
  return valid ? { ok: true, value: candidate } : { ok: false, message: spec.rule };
}

/**
 * Links safe to open: a known service, https, on that service's own host.
 * Anything else is dropped (a server bug must not become an open redirect),
 * one link per service, in the display order. Older servers send none.
 */
export function usablePaymentLinks(input: unknown): PaymentLinkDTO[] {
  if (!Array.isArray(input)) return [];
  const byService = new Map<PaymentService, PaymentLinkDTO>();
  for (const item of input) {
    if (typeof item !== "object" || item === null) continue;
    const { service, label, url } = item as Record<string, unknown>;
    if (typeof service !== "string" || typeof label !== "string" || typeof url !== "string") continue;
    if (!PAYMENT_SERVICES.includes(service as PaymentService)) continue;
    const known = service as PaymentService;
    if (byService.has(known)) continue;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:") continue;
    if (parsed.hostname.toLowerCase() !== SPECS[known].linkHost) continue;
    byService.set(known, { service: known, label, url });
  }
  return PAYMENT_SERVICES.flatMap((service) => {
    const link = byService.get(service);
    return link ? [link] : [];
  });
}

export function leavingNotice(link: PaymentLinkDTO, handle: string) {
  return {
    title: "Leaving The Artist Post",
    message: `You're leaving The Artist Post to pay @${handle} on ${link.label}.`,
    confirmLabel: `Continue to ${link.label}`,
    cancelLabel: "Cancel",
  };
}

export function chipAccessibilityLabel(link: PaymentLinkDTO, name: string): string {
  return `Pay ${name} on ${link.label}`;
}

/** Only artists and admins can list usernames; the server enforces it too. */
export function canListPaymentUsernames(role: string | null | undefined): boolean {
  return role === "ARTIST" || role === "ADMIN";
}
