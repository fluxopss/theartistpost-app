import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useAuth } from "@/auth";
import { isApiError } from "@/api/errors";
import { useCreateComment } from "@/api/hooks";
import type { PostDetailDTO } from "@/api/types";
import { Button } from "@/components/button";
import { ListGroup } from "@/components/list-row";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

/**
 * Comments on a work: read the wall notes, leave one when signed in.
 * Empty list is honest — never invents chatter.
 */
export function CommentList({ post }: { post: PostDetailDTO }) {
  const palette = useBrandColors();
  const { user } = useAuth();
  const createComment = useCreateComment(post.slug);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { comments } = post;
  const capped = post.commentCount > comments.length;

  const submit = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write a short note first.");
      return;
    }
    setError(null);
    try {
      await createComment.mutateAsync(trimmed);
      setBody("");
    } catch (cause) {
      setError(isApiError(cause) ? cause.message : "Could not leave that note.");
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="subheadline">
          {plural(post.commentCount, "Wall note")}
        </ThemedText>
        <ThemedText variant="footnote" tone="muted">
          {user
            ? "Notes from your pass land on the shared Wall — short, public, from the community."
            : "Join to leave a public Wall note on this work."}
        </ThemedText>
      </View>

      {comments.length ? (
        <ListGroup
          header="Wall notes"
          footer={capped ? `Showing the newest ${comments.length}.` : undefined}
        >
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
      ) : (
        <ThemedText variant="footnote" tone="muted">
          No Wall notes yet — be the first from the house.
        </ThemedText>
      )}

      {user ? (
        <View style={{ gap: spacing.sm }}>
          <TextField
            label="Leave a Wall note"
            value={body}
            onChangeText={setBody}
            maxLength={280}
            showCount
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 88 }}
            placeholder={`A note from ${user.name}…`}
            error={error}
            editable={!createComment.isPending}
          />
          <Button
            title={createComment.isPending ? "Sending…" : "Leave a Wall note"}
            onPress={() => void submit()}
            loading={createComment.isPending}
            disabled={createComment.isPending}
          />
        </View>
      ) : (
        <Button
          title="Join to leave a note"
          variant="secondary"
          onPress={() => router.push("/join")}
        />
      )}
    </View>
  );
}
