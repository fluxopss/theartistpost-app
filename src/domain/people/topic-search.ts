/** Fold case and accents and drop punctuation so "café" matches "cafe" and "Venues &" matches "venues". */
function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Narrow the topic list to what the person typed. Every typed word must appear
 * in the topic's name or slug; an empty query keeps the curated order untouched.
 */
export function filterTopics<T extends { slug: string; name: string }>(
  topics: readonly T[],
  query: string,
): T[] {
  const words = fold(query).split(" ").filter(Boolean);
  if (words.length === 0) return [...topics];
  return topics.filter((topic) => {
    const haystack = `${fold(topic.name)} ${fold(topic.slug)}`;
    return words.every((word) => haystack.includes(word));
  });
}
