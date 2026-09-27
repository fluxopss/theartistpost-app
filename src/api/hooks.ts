import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { api } from "./client";
import type {
  ArtistDTO,
  EventDTO,
  FeaturedNightDTO,
  AcceptedResult,
  InvolveInput,
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
  post: (slug: string) => ["post", slug] as const,
  artist: (handle: string) => ["artist", handle] as const,
  tags: ["tags"] as const,
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
