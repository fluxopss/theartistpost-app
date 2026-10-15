import { router, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useCommunityThread } from "@/api/hooks";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { CommunityCard } from "@/components/community-card";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";

import { ReplyBar } from "./reply-bar";

/** One post and its replies, with a bar to answer. Replies stay one level deep. */
export function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useCommunityThread(id ?? "");
  const gone = isApiError(query.error) && query.error.code === "not_found";

  return (
    <>
      <Stack.Screen options={{ title: "Conversation", headerLargeTitleEnabled: false }} />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()} gap={spacing.md}>
        {gone ? (
          <EmptyState
            icon="sparkle"
            title="That post is gone"
            body="It may have been removed, or you can no longer see it."
            action={<Button title="Back to the board" variant="secondary" onPress={() => router.back()} />}
          />
        ) : (
          <AsyncView
            data={query.data}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            loading={
              <View style={{ gap: spacing.md }}>
                <Skeleton height={140} />
                <Skeleton height={72} />
              </View>
            }
            empty={null}
          >
            {(thread) => (
              <View style={{ gap: spacing.md }}>
                <CommunityCard post={thread.post} variant="thread" onDeleted={() => router.back()} />

                <ThemedText variant="subheadline" accessibilityRole="header">
                  {thread.replies.length === 0
                    ? "No replies yet"
                    : thread.replies.length === 1
                      ? "1 reply"
                      : `${thread.replies.length} replies`}
                </ThemedText>

                {thread.replies.length === 0 ? (
                  <ThemedText variant="footnote" tone="muted">
                    Be the first to answer kindly.
                  </ThemedText>
                ) : (
                  <View>
                    {thread.replies.map((reply) => (
                      <CommunityCard key={reply.id} post={reply} variant="reply" />
                    ))}
                  </View>
                )}

                <ReplyBar parentId={thread.post.id} kind={thread.post.kind} />
              </View>
            )}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
