import { api } from "@/api/client";

import type {
  JoinArtistInput,
  JoinMemberInput,
  MeResult,
  SessionPayload,
  VerifyInput,
} from "./types";

export type StudioMediaResult = {
  url: string;
  absoluteUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  contentType: string;
  bytes: number;
};

export type StudioCreatePostInput = {
  title: string;
  caption?: string;
  /** Alias accepted by the house; prefer `caption`. */
  description?: string;
  tags: string[];
  visibility: "DRAFT" | "PUBLISHED";
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "EMBED" | "CANVAS";
};

export type StudioPost = {
  id: string;
  slug: string;
  title: string;
  caption: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  media: { url: string | null; type: "IMAGE" | "VIDEO" | "EMBED" | "CANVAS" };
  tags: { slug: string; name: string }[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioPostsPage = {
  items: StudioPost[];
  nextCursor: string | null;
};

export type LinkSessionInput = {
  /** Optional artist door fields when first linking a new Prisma user. */
  door?: "member" | "artist";
  name?: string;
  handle?: string;
  medium?: string;
  intent?: string;
};

export const authApi = {
  joinMember: (input: JoinMemberInput) =>
    api.post<SessionPayload>("/auth/join", { door: "member", ...input }),

  joinArtist: (input: JoinArtistInput) =>
    api.post<SessionPayload>("/auth/join", { door: "artist", ...input }),

  requestCode: (email: string) =>
    api.post<{ sent: true; expiresAt: string; debugCode?: string }>("/auth/request-code", { email }),

  verify: (input: VerifyInput) => api.post<SessionPayload>("/auth/verify", input),

  /**
   * Exchange a Supabase access token (already on Authorization) for a house session.
   * Lands with the web JWKS PR — until then callers treat 404 as “not open yet”.
   */
  link: (input: LinkSessionInput = {}) => api.post<SessionPayload>("/auth/link", input),

  refresh: () => api.post<SessionPayload>("/auth/refresh", {}),

  me: (signal?: AbortSignal) => api.get<MeResult>("/auth/me", signal),

  logout: () => api.post<{ signedOut: true }>("/auth/logout", {}),
};

export const studioApi = {
  uploadMedia: (file: { uri: string; name: string; mimeType: string }) =>
    api.upload<StudioMediaResult>("/studio/media", file),

  createPost: (input: StudioCreatePostInput) =>
    api.post<StudioPost>("/studio/posts", {
      ...input,
      caption: input.caption ?? input.description,
    }),

  myPosts: (params?: { status?: "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED"; cursor?: string; take?: number }, signal?: AbortSignal) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.take) search.set("take", String(params.take));
    const qs = search.toString();
    return api.get<StudioPostsPage>(`/studio/posts${qs ? `?${qs}` : ""}`, signal);
  },
};
