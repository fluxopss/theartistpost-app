/** Wire types for /api/v1 — mirror of theartistpost `src/server/api` DTOs. */

export type EventStatus = "upcoming" | "live" | "closed";

export type EventDTO = {
  id: string;
  title: string;
  artist: string;
  medium: string;
  start: string; // ISO with offset
  end: string;
  venue: string;
  description: string;
  comingSoon: boolean;
  status: EventStatus;
};

export type FeaturedNightDTO = {
  event: EventDTO | null;
  phase: "upcoming" | "live" | null;
};

export type TagDTO = { slug: string; name: string };

export type PostSummaryDTO = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  /** Absolute URL, or null when the post has no stored media. */
  media: { url: string | null; type: "IMAGE" | "VIDEO" | "EMBED" | "CANVAS" };
  tags: TagDTO[];
  artist: { handle: string; name: string; avatarUrl: string | null };
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
};

export type CommentDTO = {
  id: string;
  body: string;
  author: { name: string };
  createdAt: string;
};

export type PostDetailDTO = PostSummaryDTO & { comments: CommentDTO[] };

export type PostPageDTO = { items: PostSummaryDTO[]; nextCursor: string | null };

export type ArtistProfileDTO = {
  handle: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: Record<string, string> | null;
  postCount?: number;
};

/** Profile + first page. `posts` mirrors `items` for older clients. */
export type ArtistDTO = {
  artist: ArtistProfileDTO;
  posts: PostSummaryDTO[];
  items?: PostSummaryDTO[];
  nextCursor?: string | null;
  postCount?: number;
};

export type AuthorTimelineDTO = {
  kind: "author";
  artist: ArtistProfileDTO & { postCount: number };
  items: PostSummaryDTO[];
  nextCursor: string | null;
};

export type FeedPageDTO = {
  kind: "explore" | "following" | "author";
  items: PostSummaryDTO[];
  nextCursor: string | null;
  followingAvailable: boolean;
};

export type MeDTO = {
  user: {
    id: string;
    email: string;
    name: string;
    role: "VIEWER" | "ARTIST" | "ADMIN";
    handle: string | null;
    image: string | null;
    artist: { handle: string; approved: boolean; pendingApproval: boolean } | null;
  };
  canPublish: boolean;
  permissions: { publish: boolean; admin: boolean };
  profile: (ArtistProfileDTO & { approved: boolean; pendingApproval: boolean }) | null;
};

export type RsvpInput = {
  eventId: string;
  name: string;
  email: string;
  party: number;
  note?: string;
  website?: string; // honeypot — always empty from the app
  platform: "ios" | "android";
};

/** Delivery failures come back as `upstream_unavailable` errors, not a flag. */
export type RsvpResult = { code: string };

export type AcceptedResult = { accepted: true };

export type InvolveInput = {
  name: string;
  email: string;
  phone?: string;
  intent: "space" | "partner" | "volunteer";
  medium?: string;
  city?: string;
  message: string;
  website?: string;
  platform: "ios" | "android";
};
