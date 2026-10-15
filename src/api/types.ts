import type { Reaction, ReactionCounts } from "@/domain/community/reactions";

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
  /** Where the night is in time. A cancelled night is always "closed". */
  status: EventStatus;
  /** "db" = managed by the house (server RSVPs and check-ins); "content" = seed schedule. */
  source: "db" | "content";
  cancelled: boolean;
  timeZone: string;
  venueAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Total seats; null = unlimited. */
  capacity: number | null;
  coverImageUrl: string | null;
};

export type RsvpStatus = "GOING" | "MAYBE" | "NOT_GOING";

export type EventRsvpDTO = {
  eventId: string;
  status: RsvpStatus;
  party: number;
  note: string | null;
  /** True while a GOING answer is waiting for a seat. */
  waitlisted: boolean;
  passCode: string;
  updatedAt: string;
};

export type SeatSummaryDTO = {
  capacity: number | null;
  seatsTaken: number;
  seatsLeft: number | null;
  waitlisted: number;
};

export type MyRsvpDTO = { rsvp: EventRsvpDTO | null; summary: SeatSummaryDTO };
export type SetRsvpInput = { status: RsvpStatus; party?: number; note?: string | null };
export type SetRsvpResult = { rsvp: EventRsvpDTO; summary: SeatSummaryDTO; event: EventDTO };
export type MyRsvpItemDTO = { rsvp: EventRsvpDTO; event: EventDTO };

export type CheckInWindow = "before" | "open" | "after";
export type CheckInStateDTO = {
  checkIn: { checkedInAt: string; verified: boolean } | null;
  window: CheckInWindow;
  opensAt: string;
  /** Whether the venue has a point to verify against. */
  venueHasLocation: boolean;
};
/** One optional reading, used once by the server and never stored. */
export type CheckInInput = { lat?: number; lng?: number; accuracyM?: number | null };

export type AdminEventCounts = {
  going: number;
  goingSeats: number;
  waitlisted: number;
  maybe: number;
  notGoing: number;
  checkedIn: number;
  verified: number;
};

export type AdminEventDTO = {
  id: string;
  sourceId: string | null;
  title: string;
  description: string;
  artist: string;
  medium: string;
  startsAt: string;
  endsAt: string;
  /** House wall time, ready to edit ("2026-10-30T18:00"). */
  startsAtLocal: string;
  endsAtLocal: string;
  timeZone: string;
  venueName: string;
  venueAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  publishState: "DRAFT" | "PUBLISHED" | "CANCELLED";
  coverImageUrl: string | null;
  comingSoon: boolean;
  publishedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  counts: AdminEventCounts;
};

export type AdminEventListDTO = {
  items: AdminEventDTO[];
  fromSchedule: { id: string; title: string; start: string; end: string; venue: string }[];
};

/** Create/update body. Times are house wall time ("2026-10-30T18:00"). */
export type AdminEventInput = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  venueName: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number | null;
  coverImageUrl?: string | null;
  sourceId?: string;
};

export type AttendeeDTO = {
  userId: string;
  name: string;
  email: string;
  status: RsvpStatus;
  party: number;
  waitlisted: boolean;
  note: string | null;
  rsvpAt: string;
  checkedIn: boolean;
  verified: boolean;
  checkedInAt: string | null;
};

export type AttendeeListDTO = {
  items: AttendeeDTO[];
  totals: {
    goingPeople: number;
    goingSeats: number;
    waitlistedPeople: number;
    waitlistedSeats: number;
    maybe: number;
    notGoing: number;
    checkedIn: number;
    verified: number;
  };
};

export type CheckInListDTO = {
  items: { userId: string; name: string; handle: string | null; checkedInAt: string; verified: boolean }[];
  count: number;
  verifiedCount: number;
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
  author: { name: string; handle?: string | null; avatarUrl?: string | null };
  createdAt: string;
};

export type CommentsPageDTO = {
  items: CommentDTO[];
  nextCursor: string | null;
  commentCount: number;
};

export type LikeStateDTO = {
  liked: boolean;
  likeCount: number;
  /** Reactions fields arrive from servers that support them. */
  viewerReaction?: Reaction | null;
  reactionCounts?: ReactionCounts;
};

export type LikeStatusDTO = {
  likedByMe: boolean | null;
  likeCount: number;
  viewerReaction?: Reaction | null;
  reactionCounts?: ReactionCounts;
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
    bio: string | null;
    headline: string | null;
    location: string | null;
    chapterId: string | null;
    topics: TopicDTO[];
    termsAcceptedAt: string | null;
    suspended: boolean;
    followerCount: number;
    followingCount: number;
    unreadNotifications: number;
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

/* ---------- Community v1 (contract: theartistpost docs/superpowers/plans/2026-10-14-community-v1.md) ---------- */

export type TopicDTO = { slug: string; name: string; kind: "genre" | "community" };

export type PersonSummaryDTO = {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  isArtist: boolean;
  viewerFollows: boolean;
};

export type PersonDTO = PersonSummaryDTO & {
  bio: string | null;
  location: string | null;
  chapter: { id: string; name: string } | null;
  topics: TopicDTO[];
  followerCount: number;
  followingCount: number;
  communityPostCount: number;
  followsViewer: boolean;
  isSelf: boolean;
  artist: { handle: string; approved: boolean } | null;
  joinedAt: string;
};

export type CommunityKind = "SHOUTOUT" | "COLLAB" | "SHOWING" | "ASK" | "KINDNESS" | "UPDATE";

export type CommunityPostDTO = {
  id: string;
  kind: CommunityKind;
  body: string;
  imageUrl: string | null;
  topic: TopicDTO | null;
  parentId: string | null;
  author: { handle: string; name: string; avatarUrl: string | null; isArtist: boolean };
  /** Total reactions of any kind. */
  supportCount: number;
  replyCount: number;
  /** True when the viewer has reacted with anything. */
  viewerSupported: boolean;
  /** Per-emoji counts. Absent only on servers that predate reactions. */
  reactionCounts?: ReactionCounts;
  viewerReaction?: Reaction | null;
  canDelete: boolean;
  createdAt: string;
};

/** One person who reacted, with the emoji they chose. */
export type ReactorDTO = {
  reaction: Reaction;
  person: PersonSummaryDTO;
  createdAt: string;
};

/** Server reply to setting or clearing a reaction. */
export type ReactionResultDTO = {
  viewerReaction: Reaction | null;
  reactionCounts: ReactionCounts;
  supportCount: number;
  supported: boolean;
};

export type NotificationType = "FOLLOW" | "LIKE" | "COMMENT" | "REPLY" | "SUPPORT" | "MENTION" | "EVENT";

export type NotificationDTO = {
  id: string;
  type: NotificationType;
  actor: { handle: string; name: string; avatarUrl: string | null } | null;
  target:
    | { kind: "post"; slug: string }
    | { kind: "community"; id: string }
    | { kind: "person"; handle: string }
    | { kind: "event"; id: string }
    | null;
  preview: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "sexual"
  | "violence"
  | "self_harm"
  | "impersonation"
  | "other";

export type ReportTargetType = "POST" | "COMMENT" | "COMMUNITY_POST" | "USER";

export type ReportDTO = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note: string | null;
  status: "OPEN" | "ACTIONED" | "DISMISSED";
  reportCount: number;
  preview: string | null;
  reporter: { handle: string | null; name: string };
  createdAt: string;
};

export type Page<T> = { items: T[]; nextCursor: string | null };

export type ReportStatus = ReportDTO["status"];

export type NotificationPageDTO = Page<NotificationDTO> & { unreadCount: number };

export type CommunityThreadDTO = { post: CommunityPostDTO; replies: CommunityPostDTO[] };

/** PATCH /me — any subset. `topicSlugs` holds at most 8 slugs. */
export type ProfileUpdateInput = {
  name?: string;
  handle?: string;
  bio?: string | null;
  headline?: string | null;
  location?: string | null;
  chapterId?: string | null;
  topicSlugs?: string[];
};

export type CommunityPostInput = {
  kind: CommunityKind;
  body: string;
  topicSlug?: string;
  imageUrl?: string;
  parentId?: string;
};

export type ReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note?: string;
};

export type ReportAction = "hide" | "dismiss" | "suspend_user";

/** Local file part for multipart uploads (appended under field `file`). */
export type UploadFile = { uri: string; name: string; type: string };

/* ---------- Admin: artist requests ---------- */

/** One row from GET /api/v1/admin/users. `artistApproved` is null for members with no artist profile. */
export type AdminUserRowDTO = {
  id: string;
  name: string;
  email: string;
  role: "VIEWER" | "ARTIST" | "ADMIN";
  handle: string | null;
  artistApproved: boolean | null;
  deniedSeed: boolean;
  createdAt: string;
};

/** Full record returned by PATCH /api/v1/admin/users/[id]. */
export type AdminUserDTO = AdminUserRowDTO & {
  artistBio: string | null;
  postCount: number;
  commentCount: number;
  likeCount: number;
  updatedAt: string;
};

export type AdminUserUpdateInput = {
  role?: "VIEWER" | "ARTIST" | "ADMIN";
  artistApproved?: boolean;
};
