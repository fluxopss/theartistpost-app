import type { ProfileUpdateInput } from "@/api/types";

import { validateHandle } from "./handle";

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const BIO_MAX = 480;
export const HEADLINE_MAX = 80;
export const LOCATION_MAX = 60;
export const TOPICS_MAX = 8;

export type ProfileFormValues = {
  name: string;
  handle: string;
  headline: string;
  location: string;
  bio: string;
  chapterId: string | null;
  topicSlugs: string[];
};

type Options = {
  /** Artists keep their Wall handle; the server rejects any change. */
  handleLocked: boolean;
};

export type ProfileValidation = { ok: true } | { ok: false; fields: Record<string, string> };

export function validateProfileForm(values: ProfileFormValues, options: Options): ProfileValidation {
  const fields: Record<string, string> = {};

  const name = values.name.trim();
  if (name.length < NAME_MIN) fields.name = `Name needs at least ${NAME_MIN} characters.`;
  else if (name.length > NAME_MAX) fields.name = `Name can be at most ${NAME_MAX} characters.`;

  if (!options.handleLocked) {
    const handle = validateHandle(values.handle);
    if (!handle.ok) fields.handle = handle.message;
  }

  if (values.headline.trim().length > HEADLINE_MAX) fields.headline = `Keep it under ${HEADLINE_MAX} characters.`;
  if (values.location.trim().length > LOCATION_MAX) fields.location = `Keep it under ${LOCATION_MAX} characters.`;
  if (values.bio.trim().length > BIO_MAX) fields.bio = `Keep it under ${BIO_MAX} characters.`;
  if (values.topicSlugs.length > TOPICS_MAX) fields.topicSlugs = `Pick up to ${TOPICS_MAX} topics.`;

  return Object.keys(fields).length > 0 ? { ok: false, fields } : { ok: true };
}

const textOrNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((slug) => b.includes(slug));
}

/** Only what changed, shaped for `PATCH /me`. */
export function buildProfilePatch(
  original: ProfileFormValues,
  next: ProfileFormValues,
  options: Options,
): ProfileUpdateInput {
  const patch: ProfileUpdateInput = {};

  const name = next.name.trim();
  if (name !== original.name.trim()) patch.name = name;

  if (!options.handleLocked) {
    const handle = next.handle.trim().toLowerCase();
    if (handle !== original.handle.trim().toLowerCase()) patch.handle = handle;
  }

  const text = ["headline", "location", "bio"] as const;
  for (const key of text) {
    const value = textOrNull(next[key]);
    if (value !== textOrNull(original[key])) patch[key] = value;
  }

  if (next.chapterId !== original.chapterId) patch.chapterId = next.chapterId;
  if (!sameSet(original.topicSlugs, next.topicSlugs)) patch.topicSlugs = next.topicSlugs;

  return patch;
}
