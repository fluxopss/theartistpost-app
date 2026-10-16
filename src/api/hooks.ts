import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyViewerReaction,
  emptyReactionCounts,
  reactionsFromLegacy,
  type Reaction,
  type ReactionState,
} from "@/domain/community/reactions";
import { profileChangeFromServer, queryKeysToRefreshAfterProfileUpdate } from "@/domain/people/profile-sync";

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
  ReactionResultDTO,
  ReactorDTO,
  MeDTO,
  CommentDTO,
  PostDetailDTO,
  PostPageDTO,
  RsvpInput,
  RsvpResult,
  TagDTO,
  Page,
  PersonDTO,
  PersonSummaryDTO,
  ProfileUpdateInput,
  UploadFile,
  CommunityKind,
  CommunityPostDTO,
  CommunityPostInput,
  CommunityThreadDTO,
  NotificationPageDTO,
  ReportAction,
  ReportDTO,
  ReportInput,
  ReportStatus,
  TopicDTO,
  AdminUserRowDTO,
  AdminUserDTO,
  AdminUserUpdateInput,
  AdminPersonActionInput,
  AdminPersonActionResult,
  AdminPersonDetailDTO,
  AdminPersonRowDTO,
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
  topics: ["topics"] as const,
  person: (handle: string) => ["person", handle] as const,
  personFollowers: (handle: string) => ["person", handle, "followers"] as const,
  personFollowing: (handle: string) => ["person", handle, "following"] as const,
  personCommunity: (handle: string) => ["person", handle, "community"] as const,
  people: (q: string, topic: string) => ["people", "list", q, topic] as const,
  suggestedPeople: ["people", "suggested"] as const,
  followingFeed: ["feed", "following"] as const,
  communityList: (scope: string, topic?: string, kind?: string) =>
    ["community", "list", scope, topic ?? "all", kind ?? "all"] as const,
  communityThread: (id: string) => ["community", "thread", id] as const,
  notifications: ["notifications"] as const,
  blocks: ["blocks"] as const,
  adminReports: (status: string) => ["admin", "reports", status] as const,
  adminUsers: (pendingOnly: boolean) => ["admin", "users", pendingOnly ? "pending" : "all"] as const,
  adminPeople: (params: Record<string, string>) => ["admin", "users", "people", params] as const,
  adminPerson: (id: string) => ["admin", "person", id] as const,
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
  const client = useQueryClient();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => {
      const previous = client.getQueryData<MeDTO>(queryKeys.me);
      const next = await api.get<MeDTO>("/me", signal);
      // An edit made on another device (topics, chapter, name, handle) changes what the
      // board, feeds and suggestions should show, so refetch them like a local edit would.
      if (previous) {
        const change = profileChangeFromServer(previous.user, next.user);
        if (Object.keys(change).length > 0) {
          for (const queryKey of queryKeysToRefreshAfterProfileUpdate(change)) {
            void client.invalidateQueries({ queryKey });
          }
        }
      }
      return next;
    },
    enabled,
    retry: false,
    // The server is the source of truth: an edit made on another device shows
    // up the next time this phone comes to the foreground after 30 seconds.
    staleTime: 30 * 1000,
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

/**
 * Set (or, with null, take back) the viewer's reaction on a Wall post. A
 * plain Like is the heart (LOVE). Optimistic with rollback.
 */
export function useSetWallReaction(slug: string) {
  const client = useQueryClient();
  const path = `/posts/${encodeURIComponent(slug)}/reaction`;
  return useMutation({
    mutationFn: (reaction: Reaction | null) =>
      reaction ? api.put<LikeStateDTO>(path, { reaction }) : api.delete<LikeStateDTO>(path),
    onMutate: async (reaction) => {
      await client.cancelQueries({ queryKey: queryKeys.like(slug) });
      const previousLike = client.getQueryData<LikeStatusDTO>(queryKeys.like(slug));
      const previousPost = client.getQueryData<PostDetailDTO>(queryKeys.post(slug));
      const current: ReactionState = {
        viewerReaction: previousLike?.viewerReaction ?? (previousLike?.likedByMe ? "LOVE" : null),
        reactionCounts:
          previousLike?.reactionCounts ??
          { ...emptyReactionCounts(), LOVE: previousLike?.likeCount ?? previousPost?.likeCount ?? 0 },
      };
      const next = applyViewerReaction(current, reaction);
      client.setQueryData<LikeStatusDTO>(queryKeys.like(slug), {
        likedByMe: next.viewerSupported,
        likeCount: next.supportCount,
        viewerReaction: next.viewerReaction,
        reactionCounts: next.reactionCounts,
      });
      client.setQueryData<PostDetailDTO>(queryKeys.post(slug), (prev) =>
        prev ? { ...prev, likeCount: next.supportCount } : prev,
      );
      return { previousLike, previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLike !== undefined) {
        client.setQueryData(queryKeys.like(slug), context.previousLike);
      }
      if (context?.previousPost !== undefined) {
        client.setQueryData(queryKeys.post(slug), context.previousPost);
      }
    },
    onSuccess: (data) => {
      client.setQueryData<LikeStatusDTO>(queryKeys.like(slug), {
        likedByMe: data.liked,
        likeCount: data.likeCount,
        viewerReaction: data.viewerReaction ?? (data.liked ? "LOVE" : null),
        reactionCounts: data.reactionCounts,
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

/* ---------- Community v1 ---------- */

type MeUser = MeDTO["user"];
type ListSnapshot = [readonly unknown[], unknown];

/** Applies a change to the signed-in user's cached profile, when it is cached. */
function patchMeUser(client: QueryClient, patch: (user: MeUser) => MeUser) {
  client.setQueryData<MeDTO>(queryKeys.me, (prev) => (prev ? { ...prev, user: patch(prev.user) } : prev));
}

/** Works on a single page, an infinite-query result, or a plain array. */
function mapPeople(data: unknown, fn: (person: PersonSummaryDTO) => PersonSummaryDTO): unknown {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return (data as PersonSummaryDTO[]).map(fn);
  if ("pages" in data) {
    const infinite = data as InfiniteData<Page<PersonSummaryDTO>>;
    return { ...infinite, pages: infinite.pages.map((page) => ({ ...page, items: page.items.map(fn) })) };
  }
  if ("items" in data) {
    const page = data as Page<PersonSummaryDTO>;
    return { ...page, items: page.items.map(fn) };
  }
  return data;
}

/** Same shape handling for community posts; a thread carries `post` + `replies`. */
function mapCommunityPosts(data: unknown, fn: (post: CommunityPostDTO) => CommunityPostDTO): unknown {
  if (!data || typeof data !== "object") return data;
  if ("pages" in data) {
    const infinite = data as InfiniteData<Page<CommunityPostDTO>>;
    return { ...infinite, pages: infinite.pages.map((page) => ({ ...page, items: page.items.map(fn) })) };
  }
  if ("replies" in data) {
    const thread = data as CommunityThreadDTO;
    return { post: fn(thread.post), replies: thread.replies.map(fn) };
  }
  if ("items" in data) {
    const page = data as Page<CommunityPostDTO>;
    return { ...page, items: page.items.map(fn) };
  }
  return data;
}

/** Person lists whose rows show `viewerFollows` (directory, suggestions, followers, following). */
function isFollowAffected(query: { queryKey: readonly unknown[] }): boolean {
  const key = query.queryKey;
  if (key[0] === "people") return true;
  return key[0] === "person" && (key[2] === "followers" || key[2] === "following");
}

function invalidateAfterBlockChange(client: QueryClient) {
  const keys = [["people"], ["person"], ["community"], ["post"], ["feed"], ["blocks"], ["me"], ["notifications"]];
  for (const queryKey of keys) void client.invalidateQueries({ queryKey });
}

export function useTopics() {
  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: ({ signal }) => api.get<TopicDTO[]>("/topics", signal),
    staleTime: 60 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => api.patch<MeDTO>("/me", input),
    onSuccess: (data, input) => {
      // The server's answer is the source of truth for your own profile.
      client.setQueryData(queryKeys.me, data);
      // Everything that is derived from it (For You, suggestions, author names) refetches.
      for (const queryKey of queryKeysToRefreshAfterProfileUpdate(input)) {
        void client.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useUploadAvatar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (file: UploadFile) =>
      api.upload<{ avatarUrl: string }>("/me/avatar", { uri: file.uri, name: file.name, mimeType: file.type }),
    onSuccess: ({ avatarUrl }) => {
      patchMeUser(client, (user) => ({ ...user, image: avatarUrl }));
      void client.invalidateQueries({ queryKey: ["person"] });
      void client.invalidateQueries({ queryKey: ["people"] });
      // Your face is on every post and notification you appear in.
      void client.invalidateQueries({ queryKey: ["community"] });
      void client.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useAcceptTerms() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ termsAcceptedAt: string }>("/me/terms", { accept: true }),
    onSuccess: ({ termsAcceptedAt }) => {
      patchMeUser(client, (user) => ({ ...user, termsAcceptedAt }));
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.delete<{ deleted: true }>("/me", { confirm: "DELETE" }),
  });
}

export type PeopleParams = { q?: string; topic?: string };

/** Directory search. `q` needs 2+ characters; shorter input stays idle. */
export function usePeople(params: PeopleParams) {
  const q = params.q?.trim() ?? "";
  const topic = params.topic ?? "";
  return useInfiniteQuery({
    queryKey: queryKeys.people(q, topic),
    initialPageParam: null as string | null,
    enabled: q.length === 0 || q.length >= 2,
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ take: "20" });
      if (q) search.set("q", q);
      if (topic) search.set("topic", topic);
      if (pageParam) search.set("cursor", pageParam);
      return api.get<Page<PersonSummaryDTO>>(`/people?${search}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

/** Member-only: people who share a topic with you and you do not follow yet. */
export function useSuggestedPeople(enabled = true) {
  return useQuery({
    queryKey: queryKeys.suggestedPeople,
    queryFn: ({ signal }) => api.get<Page<PersonSummaryDTO>>("/people?suggested=1", signal),
    enabled,
    retry: false,
  });
}

export function usePerson(handle: string) {
  return useQuery({
    queryKey: queryKeys.person(handle),
    queryFn: ({ signal }) => api.get<PersonDTO>(`/people/${encodeURIComponent(handle)}`, signal),
    enabled: Boolean(handle),
  });
}

type FollowResult = { following: boolean; followerCount: number };

export function useToggleFollow(handle: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<FollowResult>(`/people/${encodeURIComponent(handle)}/follow`, {}),
    onMutate: async () => {
      await client.cancelQueries({ predicate: isFollowAffected });
      await client.cancelQueries({ queryKey: queryKeys.person(handle) });
      await client.cancelQueries({ queryKey: queryKeys.me });

      const previousPerson = client.getQueryData<PersonDTO>(queryKeys.person(handle));
      const previousMe = client.getQueryData<MeDTO>(queryKeys.me);
      const previousLists = client.getQueriesData<unknown>({ predicate: isFollowAffected }) as ListSnapshot[];

      const nextFollowing = !(previousPerson?.viewerFollows === true);
      const delta = nextFollowing ? 1 : -1;

      client.setQueryData<PersonDTO>(queryKeys.person(handle), (prev) =>
        prev
          ? { ...prev, viewerFollows: nextFollowing, followerCount: Math.max(0, prev.followerCount + delta) }
          : prev,
      );
      client.setQueriesData<unknown>({ predicate: isFollowAffected }, (data: unknown) =>
        mapPeople(data, (person) => (person.handle === handle ? { ...person, viewerFollows: nextFollowing } : person)),
      );
      patchMeUser(client, (user) => ({ ...user, followingCount: Math.max(0, user.followingCount + delta) }));

      return { previousPerson, previousMe, previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPerson !== undefined) {
        client.setQueryData(queryKeys.person(handle), context.previousPerson);
      }
      if (context?.previousMe !== undefined) {
        client.setQueryData(queryKeys.me, context.previousMe);
      }
      for (const [key, data] of context?.previousLists ?? []) {
        client.setQueryData(key, data);
      }
    },
    onSuccess: (data) => {
      client.setQueryData<PersonDTO>(queryKeys.person(handle), (prev) =>
        prev ? { ...prev, viewerFollows: data.following, followerCount: data.followerCount } : prev,
      );
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: queryKeys.person(handle) });
      void client.invalidateQueries({ predicate: isFollowAffected });
      void client.invalidateQueries({ queryKey: queryKeys.followingFeed });
      void client.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

function usePersonSummaryList(handle: string, list: "followers" | "following", key: readonly unknown[]) {
  return useInfiniteQuery({
    queryKey: key,
    initialPageParam: null as string | null,
    enabled: Boolean(handle),
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ take: "20" });
      if (pageParam) search.set("cursor", pageParam);
      return api.get<Page<PersonSummaryDTO>>(
        `/people/${encodeURIComponent(handle)}/${list}?${search}`,
        signal,
      );
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useFollowers(handle: string) {
  return usePersonSummaryList(handle, "followers", queryKeys.personFollowers(handle));
}

export function useFollowing(handle: string) {
  return usePersonSummaryList(handle, "following", queryKeys.personFollowing(handle));
}

export function usePersonCommunity(handle: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.personCommunity(handle),
    initialPageParam: null as string | null,
    enabled: Boolean(handle),
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams();
      if (pageParam) search.set("cursor", pageParam);
      const qs = search.toString();
      return api.get<Page<CommunityPostDTO>>(
        `/people/${encodeURIComponent(handle)}/community${qs ? `?${qs}` : ""}`,
        signal,
      );
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

/** Posts from people you follow. Member only; the server answers 401 to guests. */
export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.followingFeed,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ kind: "following", take: "12" });
      if (pageParam) params.set("cursor", pageParam);
      return api.get<FeedPageDTO>(`/feed?${params}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
    retry: false,
  });
}

export type CommunityParams = {
  /** `foryou` is ranked server-side by the signed-in member's topics. */
  scope: "all" | "following" | "foryou";
  topic?: string;
  kind?: CommunityKind;
};

/** `enabled` lets the Following scope stay idle for signed-out visitors. */
export function useCommunity(params: CommunityParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.communityList(params.scope, params.topic, params.kind),
    initialPageParam: null as string | null,
    enabled,
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ scope: params.scope, take: "20" });
      if (params.topic) search.set("topic", params.topic);
      if (params.kind) search.set("kind", params.kind);
      if (pageParam) search.set("cursor", pageParam);
      return api.get<Page<CommunityPostDTO>>(`/community?${search}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useCommunityThread(id: string) {
  return useQuery({
    queryKey: queryKeys.communityThread(id),
    queryFn: ({ signal }) => api.get<CommunityThreadDTO>(`/community/${encodeURIComponent(id)}`, signal),
    enabled: Boolean(id),
  });
}

export function useCreateCommunityPost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CommunityPostInput) => api.post<CommunityPostDTO>("/community", input),
    onSuccess: (post) => {
      void client.invalidateQueries({ queryKey: ["community", "list"] });
      void client.invalidateQueries({ queryKey: queryKeys.personCommunity(post.author.handle) });
      if (post.parentId) {
        void client.invalidateQueries({ queryKey: queryKeys.communityThread(post.parentId) });
      }
    },
  });
}

export function useUploadCommunityImage() {
  return useMutation({
    mutationFn: (file: UploadFile) =>
      api.upload<{ url: string }>("/community/media", { uri: file.uri, name: file.name, mimeType: file.type }),
  });
}

export function useDeleteCommunityPost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: true }>(`/community/${encodeURIComponent(id)}`),
    onSuccess: (_result, id) => {
      client.removeQueries({ queryKey: queryKeys.communityThread(id) });
      void client.invalidateQueries({ queryKey: ["community"] });
      void client.invalidateQueries({ queryKey: ["person"] });
    },
  });
}

/** The reaction fields of a post, with older servers read as "everything was Support". */
export function postReactionState(post: CommunityPostDTO): ReactionState {
  if (post.reactionCounts) {
    return { reactionCounts: post.reactionCounts, viewerReaction: post.viewerReaction ?? null };
  }
  return reactionsFromLegacy(post);
}

/**
 * Set (or, with null, take back) the viewer's reaction on a community post.
 * Optimistic across every cached list and thread, rolled back on error and
 * replaced by the server's counts on success.
 */
export function useSetReaction(id: string) {
  const client = useQueryClient();
  const path = `/community/${encodeURIComponent(id)}/reaction`;
  return useMutation({
    mutationFn: (reaction: Reaction | null) =>
      reaction
        ? api.put<ReactionResultDTO>(path, { reaction })
        : api.delete<ReactionResultDTO>(path),
    onMutate: async (reaction) => {
      await client.cancelQueries({ queryKey: ["community"] });
      const previousLists = client.getQueriesData<unknown>({ queryKey: ["community"] }) as ListSnapshot[];
      client.setQueriesData<unknown>({ queryKey: ["community"] }, (data: unknown) =>
        mapCommunityPosts(data, (post) =>
          post.id === id ? { ...post, ...applyViewerReaction(postReactionState(post), reaction) } : post,
        ),
      );
      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.previousLists ?? []) {
        client.setQueryData(key, data);
      }
    },
    onSuccess: (result) => {
      client.setQueriesData<unknown>({ queryKey: ["community"] }, (data: unknown) =>
        mapCommunityPosts(data, (post) =>
          post.id === id
            ? {
                ...post,
                viewerReaction: result.viewerReaction,
                reactionCounts: result.reactionCounts,
                supportCount: result.supportCount,
                viewerSupported: result.supported,
              }
            : post,
        ),
      );
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ["community"] });
      void client.invalidateQueries({ queryKey: ["reactors", id] });
    },
  });
}

/** Who reacted to a community post, newest first (optionally one emoji). */
export function useReactors(id: string, reaction?: Reaction) {
  return useInfiniteQuery({
    queryKey: ["reactors", id, reaction ?? "all"] as const,
    initialPageParam: null as string | null,
    enabled: Boolean(id),
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams();
      if (pageParam) search.set("cursor", pageParam);
      if (reaction) search.set("reaction", reaction);
      const qs = search.toString();
      return api.get<Page<ReactorDTO>>(`/community/${encodeURIComponent(id)}/reactions${qs ? `?${qs}` : ""}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams();
      if (pageParam) search.set("cursor", pageParam);
      const qs = search.toString();
      return api.get<NotificationPageDTO>(`/notifications${qs ? `?${qs}` : ""}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

/** Pass ids to mark specific rows read; omit to mark everything read. */
export function useMarkNotificationsRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) =>
      api.post<{ unreadCount: number }>("/notifications/read", ids ? { ids } : {}),
    onSuccess: ({ unreadCount }) => {
      patchMeUser(client, (user) => ({ ...user, unreadNotifications: unreadCount }));
      void client.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useBlocks() {
  return useQuery({
    queryKey: queryKeys.blocks,
    queryFn: ({ signal }) => api.get<PersonSummaryDTO[]>("/blocks", signal),
  });
}

export function useBlock() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (handle: string) => api.post<{ blocked: true }>("/blocks", { handle }),
    onSuccess: () => invalidateAfterBlockChange(client),
  });
}

export function useUnblock() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (handle: string) => api.delete<{ blocked: false }>(`/blocks/${encodeURIComponent(handle)}`),
    onSuccess: () => invalidateAfterBlockChange(client),
  });
}

export function useReport() {
  return useMutation({
    mutationFn: (input: ReportInput) => api.post<{ id: string }>("/reports", input),
  });
}

export function useAdminReports(status: ReportStatus = "OPEN") {
  return useInfiniteQuery({
    queryKey: queryKeys.adminReports(status),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ status });
      if (pageParam) params.set("cursor", pageParam);
      return api.get<Page<ReportDTO>>(`/admin/reports?${params}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useActOnReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: ReportAction; reason?: string }) =>
      api.patch<ReportDTO>(`/admin/reports/${encodeURIComponent(id)}`, { action, reason }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "reports"] });
      void client.invalidateQueries({ queryKey: ["community"] });
      void client.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

/* ---------- Admin: artist requests ---------- */

export type AdminUsersParams = { pendingArtist?: boolean };

/** Admin member list. `pendingArtist` limits to artist requests awaiting approval (server-side). */
export function useAdminUsers(params: AdminUsersParams = {}) {
  const pendingOnly = params.pendingArtist === true;
  return useInfiniteQuery({
    queryKey: queryKeys.adminUsers(pendingOnly),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ take: "24" });
      if (pendingOnly) search.set("pendingArtist", "1");
      if (pageParam) search.set("cursor", pageParam);
      return api.get<Page<AdminUserRowDTO>>(`/admin/users?${search}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
    retry: false,
  });
}

/** Approve or revoke an artist, or change a role. Waits for the server; no optimistic update. */
export function useUpdateAdminUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & AdminUserUpdateInput) =>
      api.patch<{ user: AdminUserDTO }>(`/admin/users/${encodeURIComponent(id)}`, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin", "users"] });
      void client.invalidateQueries({ queryKey: ["people"] });
      void client.invalidateQueries({ queryKey: ["person"] });
    },
  });
}

/* ---------- Admin: people ---------- */

/** Admin People list: server-side search and filters, cursor paged. */
export function useAdminPeople(params: Record<string, string>, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.adminPeople(params),
    enabled,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const search = new URLSearchParams({ take: "24", ...params });
      if (pageParam) search.set("cursor", pageParam);
      return api.get<Page<AdminPersonRowDTO>>(`/admin/users?${search}`, signal);
    },
    getNextPageParam: (last) => last.nextCursor,
    retry: false,
  });
}

/** One person as an admin sees them: profile, counts, activity, audit history. */
export function useAdminPerson(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.adminPerson(id),
    enabled: enabled && id.length > 0,
    queryFn: ({ signal }) => api.get<AdminPersonDetailDTO>(`/admin/users/${encodeURIComponent(id)}`, signal),
    retry: false,
  });
}

/** One audited admin action. Waits for the server; no optimistic update. */
export function useAdminPersonAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & AdminPersonActionInput) =>
      api.post<AdminPersonActionResult>(`/admin/users/${encodeURIComponent(id)}/actions`, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin"] });
      void client.invalidateQueries({ queryKey: ["people"] });
      void client.invalidateQueries({ queryKey: ["person"] });
      void client.invalidateQueries({ queryKey: ["community"] });
    },
  });
}
