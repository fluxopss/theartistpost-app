import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { api } from "./client";
import type {
  ArtistDTO,
  AuthorTimelineDTO,
  EventDTO,
  FeedPageDTO,
  FeaturedNightDTO,
  AcceptedResult,
  InvolveInput,
  MeDTO,
  PostDetailDTO,
  PostPageDTO,
  RsvpInput,
  RsvpResult,
  TagDTO,
} from "./types";

export const queryKeys = {
  events: ["events"] as const,
  event: (id: string) => ["events", id] as const,
  featuredNight: ["night", "featured"] as const,
  posts: (tag?: string) => ["posts", tag ?? "all"] as const,
  feed: (tag?: string) => ["feed", "explore", tag ?? "all"] as const,
  post: (slug: string) => ["post", slug] as const,
  artist: (handle: string) => ["artist", handle] as const,
  artistTimeline: (handle: string) => ["artist", handle, "timeline"] as const,
  tags: ["tags"] as const,
  me: ["me"] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: ({ signal }) => api.get<EventDTO[]>("/events", signal),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: ({ signal }) => api.get<EventDTO>(`/events/${encodeURIComponent(id)}`, signal),
  });
}

export function useFeaturedNight() {
  return useQuery({
    queryKey: queryKeys.featuredNight,
    queryFn: ({ signal }) => api.get<FeaturedNightDTO>("/night/featured", signal),
    staleTime: 60 * 1000,
  });
}

export function usePosts(tag?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts(tag),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ take: "12" });
      if (pageParam) params.set("cursor", pageParam);
      if (tag) params.set("tag", tag);
      return api.get<PostPageDTO>(`/posts?${params}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

/** Community / explore feed (`/feed`) — same catalog as Wall posts, chapter-ready. */
export function useExploreFeed(tag?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.feed(tag),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ take: "12" });
      if (pageParam) params.set("cursor", pageParam);
      if (tag) params.set("tag", tag);
      return api.get<FeedPageDTO>(`/feed?${params}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: queryKeys.post(slug),
    queryFn: ({ signal }) => api.get<PostDetailDTO>(`/posts/${encodeURIComponent(slug)}`, signal),
  });
}

export function useArtist(handle: string) {
  return useQuery({
    queryKey: queryKeys.artist(handle),
    queryFn: ({ signal }) => api.get<ArtistDTO>(`/artists/${encodeURIComponent(handle)}`, signal),
    enabled: Boolean(handle),
  });
}

/** Infinite author timeline for a profile screen. */
export function useArtistTimeline(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.artistTimeline(handle),
    initialPageParam: null as string | null,
    enabled: Boolean(handle),
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ take: "12" });
      if (pageParam) params.set("cursor", pageParam);
      return api.get<AuthorTimelineDTO>(
        `/artists/${encodeURIComponent(handle)}/timeline?${params}`,
        signal,
      );
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => api.get<MeDTO>("/me", signal),
    enabled,
    retry: false,
  });
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: ({ signal }) => api.get<TagDTO[]>("/tags", signal),
  });
}

export function useRsvp() {
  return useMutation({
    mutationFn: (input: RsvpInput) => api.post<RsvpResult>("/night/rsvp", input),
  });
}

export function useInvolve() {
  return useMutation({
    mutationFn: (input: InvolveInput) => api.post<AcceptedResult>("/involve", input),
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (input: { email: string; platform: "ios" | "android" }) =>
      api.post<AcceptedResult>("/subscribe", input),
  });
}
