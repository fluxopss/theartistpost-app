export type ApiErrorCode =
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "upstream_unavailable"
  | "service_paused"
  | "internal"
  | "network"
  | "bad_response";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: ApiErrorCode,
    readonly status: number,
    readonly fields?: Record<string, string>,
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** No connection (or the request never reached the house). */
  get offline() {
    return this.code === "network";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
