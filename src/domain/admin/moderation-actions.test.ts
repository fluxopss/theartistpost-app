/// <reference types="jest" />
import { moderationActionsFor } from "./moderation-actions";

describe("moderationActionsFor", () => {
  it("offers Suspend and Dismiss for profile reports, never Hide", () => {
    expect(moderationActionsFor("USER")).toEqual(["suspend_user", "dismiss"]);
  });

  it.each(["POST", "COMMENT", "COMMUNITY_POST"] as const)(
    "offers Hide, Dismiss and Suspend for %s",
    (targetType) => {
      expect(moderationActionsFor(targetType)).toEqual(["hide", "dismiss", "suspend_user"]);
    },
  );
});
