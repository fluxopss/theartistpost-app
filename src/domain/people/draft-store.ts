import type { ProfileFormValues } from "./profile-form";

/**
 * Unsaved edit-profile text, kept in memory per member so closing the sheet
 * (or a failed save) never throws away what was typed. Cleared on a good save.
 */
const drafts = new Map<string, ProfileFormValues>();

const copy = (values: ProfileFormValues): ProfileFormValues => ({
  ...values,
  topicSlugs: [...values.topicSlugs],
});

export function rememberProfileDraft(userId: string, values: ProfileFormValues): void {
  drafts.set(userId, copy(values));
}

export function readProfileDraft(userId: string): ProfileFormValues | null {
  const draft = drafts.get(userId);
  return draft ? copy(draft) : null;
}

export function clearProfileDraft(userId: string): void {
  drafts.delete(userId);
}
