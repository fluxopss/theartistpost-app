import type { ProfileUpdateInput } from "@/api/types";

type KeyPrefix = readonly string[];

/**
 * Query-key prefixes to refetch after a profile change so every screen (and,
 * through the server, every device) shows the same thing. Topics and the home
 * chapter feed For You and suggested people; name and handle appear on posts.
 */
export function queryKeysToRefreshAfterProfileUpdate(input: ProfileUpdateInput): KeyPrefix[] {
  const keys: KeyPrefix[] = [["person"], ["people"]];
  const add = (key: KeyPrefix) => {
    if (!keys.some((existing) => existing.join("/") === key.join("/"))) keys.push(key);
  };

  if (input.topicSlugs !== undefined) {
    add(["community"]);
    add(["feed"]);
  }
  if (input.name !== undefined || input.handle !== undefined) {
    add(["community"]);
    add(["post"]);
    add(["notifications"]);
  }
  return keys;
}

/** The fields of `/me` that other screens derive things from. */
export type SyncedProfile = {
  name: string;
  handle: string | null;
  chapterId: string | null;
  topics: readonly { slug: string }[];
};

/**
 * What changed between two copies of the signed-in profile, shaped like an
 * update so it can drive `queryKeysToRefreshAfterProfileUpdate`. Used when a
 * refetch brings in an edit made on another device.
 */
export function profileChangeFromServer(prev: SyncedProfile, next: SyncedProfile): ProfileUpdateInput {
  const change: ProfileUpdateInput = {};
  const before = new Set(prev.topics.map((topic) => topic.slug));
  const after = new Set(next.topics.map((topic) => topic.slug));
  if (before.size !== after.size || [...after].some((slug) => !before.has(slug))) {
    change.topicSlugs = [...after];
  }
  if (prev.chapterId !== next.chapterId) change.chapterId = next.chapterId;
  if (prev.name !== next.name) change.name = next.name;
  if (prev.handle !== next.handle && next.handle) change.handle = next.handle;
  return change;
}
