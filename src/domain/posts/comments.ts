/**
 * Wall-note (post comment) rules that mirror the server: the author or an
 * ADMIN may delete (theartistpost `deleteCommentForUser`).
 */
export function canDeleteComment({
  authorHandle,
  selfHandle,
  role,
}: {
  authorHandle: string | null | undefined;
  selfHandle: string | null;
  role: "VIEWER" | "ARTIST" | "ADMIN" | null | undefined;
}): boolean {
  if (role === "ADMIN") return true;
  return Boolean(authorHandle) && Boolean(selfHandle) && authorHandle === selfHandle;
}

/** The post with one note removed (optimistic delete). Same object if it is not there. */
export function withoutComment<P extends { commentCount: number; comments: { id: string }[] }>(
  post: P,
  commentId: string,
): P {
  if (!post.comments.some((c) => c.id === commentId)) return post;
  return {
    ...post,
    commentCount: Math.max(0, post.commentCount - 1),
    comments: post.comments.filter((c) => c.id !== commentId),
  };
}
