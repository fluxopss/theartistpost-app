/// <reference types="jest" />
import type { NotificationDTO } from "@/api/types";

import { notificationHref } from "./route";
import { notificationSentence } from "./sentence";

const n = (over: Partial<NotificationDTO> = {}): NotificationDTO => ({
  id: "n1",
  type: "EVENT",
  actor: null,
  target: { kind: "event", id: "evt_1" },
  preview: "Opening Night has been cancelled.",
  readAt: null,
  createdAt: "2026-10-20T12:00:00.000Z",
  ...over,
});

describe("event notifications", () => {
  it("lead to the night", () => {
    expect(notificationHref(n().target)).toBe("/event/evt_1");
  });

  it("read as the house speaking, using the preview", () => {
    expect(notificationSentence(n())).toBe("Opening Night has been cancelled.");
    expect(notificationSentence(n({ preview: null }))).toBe("A night you answered for changed.");
  });
});
