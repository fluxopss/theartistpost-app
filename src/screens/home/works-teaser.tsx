import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { usePosts } from "@/api/hooks";
import { AsyncView } from "@/components/async-view";
import { EmptyState } from "@/components/empty-state";
import { PostGrid } from "@/components/post-grid";
import { SectionHeader } from "@/components/section-header";
import { spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

/**
 * First row of approved work on Home. Artist names on tiles open profiles;
 * empty is honest until the house publishes.
 */
export function WorksTeaser() {
  const query = usePosts();
  const items = query.data?.pages[0]?.items.slice(0, 4);

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader
        eyebrow="On the plaster"
        eyebrowTone="spark-coral"
        title="Artists’ work"
        actionLabel="Wall"
        actionHref={tabRoutes.wall}
      />
      <AsyncView
        data={items}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0}
        loading={<PostGrid loadingCount={2} />}
        empty={
          <EmptyState
            icon="sparkle"
            title="The wall is being prepared"
            body="When approved artists hang work, it shows up here and on the Wall."
          />
        }
      >
        {(list) => <PostGrid posts={list} />}
      </AsyncView>
    </View>
  );
}
