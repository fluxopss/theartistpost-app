/**
 * Android has no action sheet: the fallback is an Alert, which holds at most
 * three buttons. This turns any list of menu actions into pages of Alert
 * buttons: two actions plus a Cancel, and a "More…" button standing in for
 * the Cancel slot's neighbour when more actions follow.
 */
export type MenuAction = {
  label: string;
  destructive?: boolean;
  run: () => void;
};

export type AlertButtonSpec = {
  text: string;
  style: "default" | "destructive" | "cancel";
  /** Index of the action to run, or "more" to show the next page. */
  pick: number | "more" | null;
};

/** Android Alert shows three buttons; one is always Cancel. */
export const ANDROID_ALERT_MAX_BUTTONS = 3;

/** How many actions fit on one page, leaving room for Cancel (and More…). */
export function actionsPerPage(total: number): number {
  const withoutMore = ANDROID_ALERT_MAX_BUTTONS - 1;
  return total <= withoutMore ? withoutMore : withoutMore - 1;
}

/**
 * The buttons for page `page` (0-based) of `actions`. `pick` is an index into
 * the original list, "more" for the paging button, or null for Cancel.
 */
export function androidAlertPage(actions: readonly MenuAction[], page = 0): AlertButtonSpec[] {
  const size = actionsPerPage(actions.length);
  const start = page * size;
  const slice = actions.slice(start, start + size);
  const buttons: AlertButtonSpec[] = slice.map((action, offset) => ({
    text: action.label,
    style: action.destructive ? "destructive" : "default",
    pick: start + offset,
  }));
  if (start + size < actions.length) {
    buttons.push({ text: "More…", style: "default", pick: "more" });
  }
  buttons.push({ text: "Cancel", style: "cancel", pick: null });
  return buttons;
}
