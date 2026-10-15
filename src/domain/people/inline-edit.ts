/**
 * State for editing one profile field in place (headline, bio). The draft is
 * part of every state that can follow a failed save, so typed text is never
 * dropped by a network error.
 */
export type InlineEditState =
  | { status: "idle" }
  | { status: "editing"; draft: string; error: string | null }
  | { status: "saving"; draft: string };

export type InlineEditAction =
  | { type: "start"; value: string }
  | { type: "change"; text: string }
  | { type: "submit" }
  | { type: "saved" }
  | { type: "failed"; message: string }
  | { type: "cancel" };

export function inlineEditReducer(state: InlineEditState, action: InlineEditAction): InlineEditState {
  switch (action.type) {
    case "start":
      return state.status === "idle" ? { status: "editing", draft: action.value, error: null } : state;
    case "change":
      return state.status === "editing" ? { status: "editing", draft: action.text, error: null } : state;
    case "submit":
      return state.status === "editing" ? { status: "saving", draft: state.draft } : state;
    case "saved":
      return state.status === "saving" ? { status: "idle" } : state;
    case "failed":
      return state.status === "saving"
        ? { status: "editing", draft: state.draft, error: action.message }
        : state;
    case "cancel":
      return state.status === "editing" ? { status: "idle" } : state;
  }
}

export type InlineSaveValue =
  | { kind: "unchanged" }
  | { kind: "invalid"; message: string }
  | { kind: "save"; value: string | null };

/** What to send for a draft: nothing, a complaint, or the trimmed value (null clears the field). */
export function inlineSaveValue(draft: string, saved: string | null, max: number): InlineSaveValue {
  const next = draft.trim();
  if (next === (saved ?? "").trim()) return { kind: "unchanged" };
  if (next.length > max) return { kind: "invalid", message: `Keep it under ${max} characters.` };
  return { kind: "save", value: next === "" ? null : next };
}
