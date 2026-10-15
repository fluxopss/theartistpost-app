/// <reference types="jest" />
import type { NotificationDTO, NotificationType } from "@/api/types";

import { notificationSentence } from "./sentence";

const actor = { handle: "ada", name: "Ada", avatarUrl: null };

function note(type: NotificationType, overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "n1",
    type,
    actor,
    target: null,
    preview: null,
    readAt: null,
    createdAt: "2026-10-14T12:00:00.000Z",
    ...overrides,
  };
}

describe("notificationSentence", () => {
  it("FOLLOW: someone followed you", () => {
    expect(notificationSentence(note("FOLLOW"))).toBe("Ada followed you");
  });

  it("SUPPORT: someone supported your post", () => {
    expect(notificationSentence(note("SUPPORT"))).toBe("Ada supported your post");
  });

  it("REPLY: quotes the reply preview", () => {
    expect(notificationSentence(note("REPLY", { preview: "Thank you" }))).toBe(
      "Ada replied: “Thank you”",
    );
  });

  it("REPLY without a preview says what happened", () => {
    expect(notificationSentence(note("REPLY"))).toBe("Ada replied to your post.");
  });

  it("MENTION: someone mentioned you", () => {
    expect(notificationSentence(note("MENTION"))).toBe("Ada mentioned you");
  });

  it("LIKE: names the work that was liked", () => {
    expect(notificationSentence(note("LIKE", { preview: "Night Garden" }))).toBe(
      "Ada liked Night Garden",
    );
  });

  it("LIKE without a preview falls back to a plain sentence", () => {
    expect(notificationSentence(note("LIKE"))).toBe("Ada liked a work.");
  });

  it("COMMENT: quotes the note preview", () => {
    expect(notificationSentence(note("COMMENT", { preview: "Lovely light" }))).toBe(
      "Ada commented: “Lovely light”",
    );
  });

  it("COMMENT without a preview falls back to a plain sentence", () => {
    expect(notificationSentence(note("COMMENT"))).toBe("Ada left a Wall note.");
  });

  it("uses Someone when the actor no longer exists", () => {
    expect(notificationSentence(note("FOLLOW", { actor: null }))).toBe("Someone followed you");
  });

  it("treats a blank preview as missing", () => {
    expect(notificationSentence(note("COMMENT", { preview: "   " }))).toBe(
      "Ada left a Wall note.",
    );
  });
});
