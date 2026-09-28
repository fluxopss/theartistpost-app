import { fetch } from "expo/fetch";
import Constants from "expo-constants";

import { getAuthToken } from "@/auth/token";

import { ApiError, type ApiErrorCode } from "./errors";

/** The web app is the backend. Baked in at build time per EAS profile. */
export const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL ?? "https://theartistpost.fluxlab.agency").replace(/\/$/, "");

const clientHeader = `${process.env.EXPO_OS ?? "native"}/${Constants.expoConfig?.version ?? "0"}`;

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ApiErrorCode; message: string; fields?: Record<string, string>; retryAfterSec?: number } };

type RequestInitShape = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  /** Skip Authorization even if a token is in memory (unused — reserved). */
  anonymous?: boolean;
  /** Multipart upload; mutually exclusive with JSON `body`. */
  formData?: FormData;
};

function authHeaders(anonymous?: boolean): Record<string, string> {
  const token = anonymous ? null : getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInitShape = {}): Promise<T> {
  let response: Response;
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-TAP-Client": clientHeader,
      ...authHeaders(init.anonymous),
    };
    if (init.formData === undefined && init.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    response = await fetch(`${API_ORIGIN}/api/v1${path}`, {
      method: init.method ?? "GET",
      headers,
      body:
        init.formData !== undefined
          ? init.formData
          : init.body !== undefined
            ? JSON.stringify(init.body)
            : undefined,
      signal: init.signal,
    });
  } catch (cause) {
    if ((cause as Error)?.name === "AbortError") throw cause;
    throw new ApiError("Couldn't reach The Artist Post.", "network", 0);
  }

  let payload: Envelope<T> | undefined;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    // A proxy error page (e.g. 502 during a deploy) is HTML, not JSON.
    throw new ApiError(
      response.ok ? "The house sent something unexpected." : "The house is restarting. Try again in a moment.",
      response.ok ? "bad_response" : "upstream_unavailable",
      response.status,
    );
  }

  if (payload && payload.ok) return payload.data;
  const err = payload && !payload.ok ? payload.error : undefined;
  throw new ApiError(
    err?.message ?? "Something went wrong.",
    err?.code ?? (response.status === 404 ? "not_found" : "internal"),
    response.status,
    err?.fields,
    err?.retryAfterSec,
  );
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
  /** Image upload for the artist studio. Field name matches the web `/api/upload` contract. */
  upload: <T>(path: string, file: { uri: string; name: string; mimeType: string }) => {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
    return request<T>(path, { method: "POST", formData });
  },
};

/** Absolute URL for a path on the web origin (brand images, uploads). */
export function originUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
