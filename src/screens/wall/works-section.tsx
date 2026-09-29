import { View } from "react-native";

import { isApiError } from "@/api/errors";
import type { usePosts } from "@/api/hooks";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PostGrid } from "@/components/post-grid";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import type { TapLane } from "@/domain/stage/lanes";
import { spacing } from "@/theme";
import { contact } from "@/utils/links";

type PostsQuery = ReturnType<typeof usePosts>;

/** What sits under the grid: the next page loading, a failed page, or a way to ask for more. */
function WorksFooter({ query }: { query: PostsQuery }) {
  if (query.isFetchingNextPage) return <PostGrid loadingCount={2} />;
  if (query.isFetchNextPageError) {
    return (
      <View accessibilityRole="alert" style={{ alignItems: "center", gap: spacing.xs }}>
        <ThemedText variant="subheadline" tone="muted" style={{ textAlign: "center" }}>
          The next row of work didn’t come through.
        </ThemedText>
        <Button title="Try again" variant="secondary" icon="refresh" onPress={() => void query.fetchNextPage()} />
      </View>
    );
  }
  if (query.hasNextPage) {
    return <Button title="More work" variant="secondary" onPress={() => void query.fetchNextPage()} />;
  }
  return null;
}

/**
 * Approved artists' posts, newest first. Empty is the honest default right
 * now: no placeholder art, just the prepared stage — or, under a lane, a
 * quiet lane with a way back to everything.
 */
export function WorksSection({
  query,
  lane,
  onClearLane,
}: {
  query: PostsQuery;
  lane: TapLane | null;
  onClearLane: () => void;
}) {
  const items = query.data?.pages.flatMap((page) => page.items);

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader eyebrow={lane ? lane.label : "On the plaster"} eyebrowTone="spark-coral" title="Artists’ work" />
      <AsyncView
        data={items}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0}
        loading={<PostGrid />}
        empty={
          lane ? (
            <EmptyState
              icon="filters"
              title={copy.wall.quietTitle}
              body={copy.wall.quietBody}
              action={<Button title="Show all" variant="secondary" onPress={onClearLane} />}
            />
          ) : (
            <EmptyState
              icon="sparkle"
              title={copy.wall.preparingTitle}
              body={`${copy.wall.preparingBody} ${copy.donate.emptySupportBody}`}
              action={
                <Button
                  title={copy.donate.supportHouseCta}
                  icon="donate"
                  tone="coral"
                  onPress={contact.donate}
                />
              }
            />
          )
        }
      >
        {(list) => (
          <View style={{ gap: spacing.lg }}>
            <PostGrid posts={list} />
            <WorksFooter query={query} />
          </View>
        )}
      </AsyncView>
    </View>
  );
}
