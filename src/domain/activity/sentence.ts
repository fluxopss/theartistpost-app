import type { NotificationDTO } from "@/api/types";

/** The sentence a person reads for one notification. Pure; no React. */
export function notificationSentence(n: NotificationDTO): string {
  const name = n.actor?.name?.trim() || "Someone";
  const preview = n.preview?.trim() || null;

  switch (n.type) {
    case "FOLLOW":
      return `${name} followed you`;
    case "SUPPORT":
      return `${name} supported your post`;
    case "REPLY":
      return preview ? `${name} replied: “${preview}”` : `${name} replied to your post.`;
    case "MENTION":
      return `${name} mentioned you`;
    case "LIKE":
      return preview ? `${name} liked ${preview}` : `${name} liked a work.`;
    case "COMMENT":
      return preview ? `${name} commented: “${preview}”` : `${name} left a Wall note.`;
    default:
      return `${name} sent you something new.`;
  }
}
