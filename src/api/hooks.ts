import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./client";
import type {
  ArtistDTO,
  AuthorTimelineDTO,
  EventDTO,
  FeedPageDTO,
  FeaturedNightDTO,
  AcceptedResult,
  InvolveInput,
  LikeStateDTO,
  LikeStatusDTO,
  MeDTO,
  CommentDTO,
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
  like: (slug: string) => ["post", slug, "like"] as const,
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

export function useLikeStatus(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.like(slug),
    queryFn: ({ signal }) => api.get<LikeStatusDTO>(`/posts/${encodeURIComponent(slug)}/like`, signal),
    enabled: Boolean(slug) && enabled,
  });
}

export function useToggleLike(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<LikeStateDTO>(`/posts/${encodeURIComponent(slug)}/like`, {}),
    onSuccess: (data) => {
      client.setQueryData<LikeStatusDTO>(queryKeys.like(slug), {
        likedByMe: data.liked,
        likeCount: data.likeCount,
      });
      client.setQueryData<PostDetailDTO>(queryKeys.post(slug), (prev) =>
        prev ? { ...prev, likeCount: data.likeCount } : prev,
      );
    },
  });
}

export function useCreateComment(slug: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api.post<{ comment: CommentDTO }>(`/posts/${encodeURIComponent(slug)}/comments`, { body }),
    onSuccess: ({ comment }) => {
      client.setQueryData<PostDetailDTO>(queryKeys.post(slug), (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          commentCount: prev.commentCount + 1,
          comments: [comment, ...prev.comments],
        };
      });
    },
  });
}

export function useUpdateMe() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; bio?: string | null }) => api.patch<MeDTO>("/me", input),
    onSuccess: (data) => {
      client.setQueryData(queryKeys.me, data);
    },
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
