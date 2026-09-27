import type { SavedEvent, SavedPost, Saves } from "@/domain/app/studio";

import { storageKeys } from "./keys";
import { useStored } from "./kv";

const EMPTY: Saves = { posts: [], events: [] };

/** Works and nights kept on this phone. */
export function useSaves() {
  const [saves, setSaves] = useStored<Saves>(storageKeys.saves, EMPTY);

  return {
    saves,
    count: saves.posts.length + saves.events.length,
    isEventSaved: (id: string) => saves.events.some((e) => e.id === id),
    isPostSaved: (id: string) => saves.posts.some((p) => p.id === id),
    toggleEvent: (event: SavedEvent) =>
      setSaves((prev) => ({
        ...prev,
        events: prev.events.some((e) => e.id === event.id)
          ? prev.events.filter((e) => e.id !== event.id)
          : [event, ...prev.events],
      })),
    togglePost: (post: SavedPost) =>
      setSaves((prev) => ({
        ...prev,
        posts: prev.posts.some((p) => p.id === post.id)
          ? prev.posts.filter((p) => p.id !== post.id)
          : [post, ...prev.posts],
      })),
    clear: () => setSaves(EMPTY),
  };
}
