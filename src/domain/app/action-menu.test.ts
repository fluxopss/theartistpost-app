/// <reference types="jest" />
import { actionsPerPage, ANDROID_ALERT_MAX_BUTTONS, androidAlertPage, type MenuAction } from "./action-menu";

const make = (count: number): MenuAction[] =>
  Array.from({ length: count }, (_, i) => ({
    label: `Action ${i + 1}`,
    destructive: i === count - 1,
    run: () => {},
  }));

describe("androidAlertPage", () => {
  it("lists one or two actions plus Cancel on a single page", () => {
    const buttons = androidAlertPage(make(2));
    expect(buttons.map((b) => b.text)).toEqual(["Action 1", "Action 2", "Cancel"]);
    expect(buttons[1].style).toBe("destructive");
    expect(buttons[2]).toMatchObject({ style: "cancel", pick: null });
  });

  it("never exceeds the Alert button limit", () => {
    for (let total = 0; total <= 9; total += 1) {
      const pages = Math.max(1, Math.ceil(total / actionsPerPage(total)));
      for (let page = 0; page < pages; page += 1) {
        expect(androidAlertPage(make(total), page).length).toBeLessThanOrEqual(ANDROID_ALERT_MAX_BUTTONS);
      }
    }
  });

  it("pages longer lists behind More… without losing an action", () => {
    const actions = make(5);
    const seen: number[] = [];
    let page = 0;
    for (;;) {
      const buttons = androidAlertPage(actions, page);
      buttons.forEach((b) => typeof b.pick === "number" && seen.push(b.pick));
      if (!buttons.some((b) => b.pick === "more")) break;
      page += 1;
    }
    expect(seen).toEqual([0, 1, 2, 3, 4]);
  });

  it("always ends with Cancel", () => {
    expect(androidAlertPage(make(4), 0).at(-1)).toMatchObject({ text: "Cancel", style: "cancel" });
    expect(androidAlertPage([], 0)).toEqual([{ text: "Cancel", style: "cancel", pick: null }]);
  });
});
