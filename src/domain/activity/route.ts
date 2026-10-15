import type { NotificationDTO } from "@/api/types";

/**
 * Where a notification leads. Returns a path for expo-router, or null when the
 * target is gone or was never set.
 */
export function notificationHref(target: NotificationDTO["target"]): string | null {
  if (!target) return null;
  switch (target.kind) {
    case "post":
      return `/post/${encodeURIComponent(target.slug)}`;
    case "community":
      return `/community/${encodeURIComponent(target.id)}`;
    case "person":
      return `/person/${encodeURIComponent(target.handle)}`;
    default:
      return null;
  }
}
