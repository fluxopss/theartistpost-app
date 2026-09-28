import { api } from "@/api/client";
import type { PostSummaryDTO } from "@/api/types";

import type {
  JoinArtistInput,
  JoinMemberInput,
  JoinResult,
  SessionUser,
  VerifyInput,
} from "./types";

export type StudioUploadResult = {
  url: string;
  mediaType: "IMAGE" | "VIDEO" | "EMBED" | "CANVAS";
};

export type StudioCreatePostInput = {
  title: string;
  description?: string;
  tags: string[];
  visibility: "DRAFT" | "PUBLISHED";
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "EMBED" | "CANVAS";
};

export type StudioCreatePostResult = {
  slug: string;
  status: "DRAFT" | "PUBLISHED";
};

export const authApi = {
  joinMember: (input: JoinMemberInput) =>
    api.post<JoinResult>("/auth/join", input),

  joinArtist: (input: JoinArtistInput) =>
    api.post<JoinResult>("/auth/join/artist", input),

  requestCode: (email: string) =>
    api.post<{ sent: true }>("/auth/request-code", { email }),

  verify: (input: VerifyInput) =>
    api.post<JoinResult>("/auth/verify", input),

  me: (signal?: AbortSignal) =>
    api.get<{ user: SessionUser }>("/auth/me", signal),

  signOut: () => api.post<{ ok: true }>("/auth/sign-out", {}),
};

export const studioApi = {
  upload: (file: { uri: string; name: string; mimeType: string }) =>
    api.upload<StudioUploadResult>("/studio/upload", file),

  createPost: (input: StudioCreatePostInput) =>
    api.post<StudioCreatePostResult>("/studio/posts", input),

  myPosts: (signal?: AbortSignal) =>
    api.get<{ items: PostSummaryDTO[] }>("/studio/posts", signal),
};
