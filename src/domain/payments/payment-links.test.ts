/// <reference types="jest" />
import {
  canListPaymentUsernames,
  chipAccessibilityLabel,
  leavingNotice,
  parsePaymentUsername,
  PAYMENT_FIELDS,
  PAYMENT_HELPER,
  usablePaymentLinks,
} from "./payment-links";

const ok = (service: Parameters<typeof parsePaymentUsername>[0], raw: string) => {
  const result = parsePaymentUsername(service, raw);
  if (!result.ok) throw new Error(`expected ok: ${result.message}`);
  return result.value;
};
const bad = (service: Parameters<typeof parsePaymentUsername>[0], raw: string) => {
  const result = parsePaymentUsername(service, raw);
  if (result.ok) throw new Error(`expected failure, got ${result.value}`);
  return result.message;
};

describe("parsePaymentUsername (mirrors the server rules)", () => {
  it("clears on empty", () => {
    expect(ok("venmo", "")).toBeNull();
    expect(ok("cashapp", "  ")).toBeNull();
  });

  it("strips @ and $, and pulls the name out of pasted links", () => {
    expect(ok("venmo", "@robbie-art")).toBe("robbie-art");
    expect(ok("venmo", "https://venmo.com/u/robbie-art")).toBe("robbie-art");
    expect(ok("cashapp", "$robbieart")).toBe("robbieart");
    expect(ok("cashapp", "cash.app/$robbieart")).toBe("robbieart");
    expect(ok("paypalme", "https://www.paypal.me/robbieart/25")).toBe("robbieart");
  });

  it("enforces length and characters", () => {
    expect(bad("venmo", "abcd")).toMatch(/venmo/i);
    expect(bad("venmo", "a".repeat(31))).toMatch(/venmo/i);
    expect(bad("venmo", "rob bie")).toMatch(/venmo/i);
    expect(bad("cashapp", "1robbie")).toMatch(/letter/i);
    expect(bad("cashapp", "a".repeat(21))).toMatch(/cash app/i);
    expect(bad("paypalme", "a-b")).toMatch(/paypal/i);
  });

  it("tells people which field a link belongs in", () => {
    expect(bad("venmo", "https://cash.app/$robbieart")).toMatch(/cash app/i);
    expect(bad("paypalme", "https://venmo.com/u/robbie-art")).toMatch(/venmo/i);
  });

  it("rejects other sites and schemes", () => {
    expect(bad("venmo", "https://evil.example/u/robbie-art")).toMatch(/venmo/i);
    expect(bad("cashapp", "javascript:alert(1)")).toMatch(/cash app/i);
  });
});

describe("usablePaymentLinks (defence in depth)", () => {
  const venmo = { service: "venmo", label: "Venmo", url: "https://venmo.com/u/robbie-art" };
  const cash = { service: "cashapp", label: "Cash App", url: "https://cash.app/$robbieart" };
  const paypal = { service: "paypalme", label: "PayPal", url: "https://paypal.me/robbieart" };

  it("keeps good links in the fixed display order", () => {
    expect(usablePaymentLinks([paypal, venmo, cash])).toEqual([venmo, cash, paypal]);
  });

  it("treats a missing or malformed list as empty (older servers)", () => {
    expect(usablePaymentLinks(undefined)).toEqual([]);
    expect(usablePaymentLinks(null)).toEqual([]);
    expect(usablePaymentLinks("nope")).toEqual([]);
    expect(usablePaymentLinks([{}, 5, null])).toEqual([]);
  });

  it("drops anything that is not https on the service's own host", () => {
    expect(usablePaymentLinks([{ ...venmo, url: "http://venmo.com/u/robbie-art" }])).toEqual([]);
    expect(usablePaymentLinks([{ ...venmo, url: "https://evil.example/u/robbie-art" }])).toEqual([]);
    expect(usablePaymentLinks([{ ...venmo, url: "https://venmo.com.evil.example/u/x" }])).toEqual([]);
    expect(usablePaymentLinks([{ ...cash, url: "https://venmo.com/u/robbie-art" }])).toEqual([]);
    expect(usablePaymentLinks([{ ...paypal, url: "javascript:alert(1)" }])).toEqual([]);
    expect(usablePaymentLinks([{ service: "zelle", label: "Zelle", url: "https://zelle.com/x" }])).toEqual([]);
  });

  it("keeps at most one link per service", () => {
    expect(usablePaymentLinks([venmo, { ...venmo, url: "https://venmo.com/u/other-name" }])).toEqual([venmo]);
  });
});

describe("copy", () => {
  it("shows the exact leaving notice", () => {
    expect(
      leavingNotice({ service: "venmo", label: "Venmo", url: "https://venmo.com/u/robbie-art" }, "robbie"),
    ).toEqual({
      title: "Leaving The Artist Post",
      message: "You're leaving The Artist Post to pay @robbie on Venmo.",
      confirmLabel: "Continue to Venmo",
      cancelLabel: "Cancel",
    });
  });

  it("uses the service label for each service", () => {
    const cash = leavingNotice({ service: "cashapp", label: "Cash App", url: "https://cash.app/$a" }, "ann");
    expect(cash.message).toBe("You're leaving The Artist Post to pay @ann on Cash App.");
    const paypal = leavingNotice({ service: "paypalme", label: "PayPal", url: "https://paypal.me/a" }, "ann");
    expect(paypal.message).toBe("You're leaving The Artist Post to pay @ann on PayPal.");
  });

  it("labels chips for screen readers without calling it a donation", () => {
    const label = chipAccessibilityLabel(
      { service: "venmo", label: "Venmo", url: "https://venmo.com/u/robbie-art" },
      "Robbie Alvarez",
    );
    expect(label).toBe("Pay Robbie Alvarez on Venmo");
    expect(label.toLowerCase()).not.toContain("donat");
  });

  it("explains that payments happen outside the app", () => {
    expect(PAYMENT_HELPER).toBe(
      "Payments happen outside the app in these services. The Artist Post doesn't process them or take a cut.",
    );
  });

  it("never uses the word donation in field copy", () => {
    for (const field of PAYMENT_FIELDS) {
      expect(JSON.stringify(field).toLowerCase()).not.toContain("donat");
    }
  });
});

describe("canListPaymentUsernames", () => {
  it("is for artists and admins only", () => {
    expect(canListPaymentUsernames("ARTIST")).toBe(true);
    expect(canListPaymentUsernames("ADMIN")).toBe(true);
    expect(canListPaymentUsernames("VIEWER")).toBe(false);
    expect(canListPaymentUsernames(undefined)).toBe(false);
  });
});
