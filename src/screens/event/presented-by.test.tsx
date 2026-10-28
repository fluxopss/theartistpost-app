/// <reference types="jest" />
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import type { EventDTO } from "@/api/types";
import { EventRow } from "@/components/event-row";
import { TicketPass } from "@/components/ticket-pass";
import { presentedByFrom, vendorsFrom } from "@/domain/events/sponsors";

import { PresentedByRow } from "./presented-by-row";
import { VendorList } from "./vendor-list";

// The theme's motion tokens import Reanimated, which needs native worklets.
jest.mock("react-native-reanimated", () => ({ Easing: { bezier: () => () => 0 } }));

async function render(element: React.ReactElement): Promise<ReactTestRenderer> {
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = create(element);
  });
  return tree!;
}

/** Every string the tree renders, joined. */
function textOf(tree: ReactTestRenderer): string {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (node == null) return;
    if (typeof node === "string") out.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (typeof node === "object" && "children" in node) walk((node as { children: unknown }).children);
  };
  walk(tree.toJSON());
  return out.join(" ");
}

const night = {
  id: "evt_1",
  title: "Taco Night",
  medium: "culinary",
  presentedBy: { name: "Clematis Coffee", url: "https://clematis.coffee", logoUrl: null },
  vendors: [{ name: "Taco Truck", offering: "Street tacos", url: "https://tacos.example" }],
} as unknown as EventDTO;

const legacyNight = { id: "evt_2", title: "Open Mic", medium: "community" } as unknown as EventDTO;

const when = { weekday: "Fri", month: "Oct", day: "30", time: "6:00 PM" };

describe("Presented by on the event page", () => {
  it("says who presents a sponsored night", async () => {
    const tree = await render(<PresentedByRow sponsor={presentedByFrom(night.presentedBy)} />);
    expect(textOf(tree)).toContain("Presented by");
    expect(textOf(tree)).toContain("Clematis Coffee");
    expect(tree.root.findAll((n) => n.props.accessibilityRole === "link").length).toBeGreaterThan(0);
  });

  it("renders nothing for a night without a sponsor, including one from today's API", async () => {
    const tree = await render(<PresentedByRow sponsor={presentedByFrom(legacyNight.presentedBy)} />);
    expect(tree.toJSON()).toBeNull();
  });

  it("is not a link when the sponsor has no website", async () => {
    const tree = await render(<PresentedByRow sponsor={{ name: "Clematis Coffee", url: null, logoUrl: null }} />);
    expect(textOf(tree)).toContain("Clematis Coffee");
    expect(tree.root.findAll((n) => n.props.accessibilityRole === "link")).toHaveLength(0);
  });
});

describe("Food & vendors", () => {
  it("lists each vendor with what they serve", async () => {
    const tree = await render(<VendorList vendors={vendorsFrom(night.vendors)} />);
    const text = textOf(tree);
    expect(text).toContain("Food & vendors");
    expect(text).toContain("Taco Truck");
    expect(text).toContain("Street tacos");
  });

  it("renders nothing without vendors", async () => {
    const tree = await render(<VendorList vendors={vendorsFrom(legacyNight.vendors)} />);
    expect(tree.toJSON()).toBeNull();
  });
});

describe("Presented by on rows and tickets", () => {
  const row = (event: EventDTO) => (
    <EventRow
      month="Oct"
      day="30"
      weekday="Fri"
      title={event.title}
      time="6:00 PM"
      venue="Hacienda"
      presentedBy={presentedByFrom(event.presentedBy)?.name}
    />
  );

  it("adds a small line to a sponsored night's row", async () => {
    expect(textOf(await render(row(night)))).toContain("Presented by Clematis Coffee");
  });

  it("shows zero sponsor wording on an unsponsored row", async () => {
    expect(textOf(await render(row(legacyNight)))).not.toMatch(/presented by/i);
  });

  it("adds the line to the ticket only when sponsored", async () => {
    const sponsored = await render(
      <TicketPass title="Taco Night" venue="Hacienda" when={when} stamp="Next up" presentedBy="Clematis Coffee" />,
    );
    expect(textOf(sponsored)).toContain("Presented by Clematis Coffee");
    const plain = await render(<TicketPass title="Open Mic" venue="Hacienda" when={when} stamp="Next up" />);
    expect(textOf(plain)).not.toMatch(/presented by/i);
  });
});
