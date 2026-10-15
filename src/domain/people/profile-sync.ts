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
