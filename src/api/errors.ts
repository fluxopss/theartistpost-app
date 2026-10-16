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

/**
 * A sentence for a failed save that always tells the person their typing is
 * still there, so a bad connection never feels like lost work.
 */
export function describeSaveError(error: unknown): string {
  if (isApiError(error)) {
    if (error.offline) return "You are offline. Your changes are still here, so save again when you are back.";
    const field = error.fields ? Object.values(error.fields)[0] : undefined;
    return field ?? error.message;
  }
  return "Could not save just now. Your changes are still here.";
}
