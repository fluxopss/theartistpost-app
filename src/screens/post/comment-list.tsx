import { StyleSheet, View } from "react-native";

import type { PostDetailDTO } from "@/api/types";
import { ListGroup } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

/**
 * Likes and comments, read-only. Accounts aren't in this build, so there's
 * nothing here that would pretend to like or reply.
 */
export function CommentList({ post }: { post: PostDetailDTO }) {
  const palette = useBrandColors();
  const { comments } = post;
  const capped = post.commentCount > comments.length;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="subheadline">
          {plural(post.likeCount, "like")} · {plural(post.commentCount, "comment")}
        </ThemedText>
        <ThemedText variant="footnote" tone="muted">
          Likes and comments open when accounts arrive.
        </ThemedText>
      </View>

      {comments.length ? (
        <ListGroup header="Comments" footer={capped ? `Showing the newest ${comments.length}.` : undefined}>
          {comments.map((comment, index) => {
            const date = formatDate(comment.createdAt);
            return (
              <View
                key={comment.id}
                accessible
                accessibilityLabel={`${comment.author.name}${date ? `, ${date}` : ""}: ${comment.body}`}
                style={{
                  gap: spacing.xxs,
                  marginLeft: spacing.md,
                  paddingRight: spacing.md,
                  paddingVertical: spacing.sm,
                  borderBottomWidth: index < comments.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: palette.separator,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.xs }}>
                  <ThemedText variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {comment.author.name}
                  </ThemedText>
                  {date ? (
                    <ThemedText variant="footnote" tone="muted">
                      {date}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText variant="callout">{comment.body}</ThemedText>
              </View>
            );
          })}
        </ListGroup>
      ) : null}
    </View>
  );
}
