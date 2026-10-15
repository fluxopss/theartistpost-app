import { FlashList } from "@shopify/flash-list";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useCommunity, useTopics } from "@/api/hooks";
import type { CommunityKind, CommunityPostDTO } from "@/api/types";
import { ActivityBell } from "@/components/activity-bell";
import { CommunityCard } from "@/components/community-card";
import { ErrorState } from "@/components/error-state";
import { FilterChips } from "@/components/filter-chips";
import { Skeleton } from "@/components/skeleton";
import { COMMUNITY_KINDS } from "@/domain/community/compose";
import { useCommunityGate } from "@/hooks/use-community-gate";
import { screenMargin, spacing, useBrandColors } from "@/theme";

import { ComposerPrompt } from "./composer-prompt";
import { EmptyBoard } from "./empty-board";
import { KindnessCard } from "./kindness-card";

type Scope = "all" | "following";

const scopeOptions: { id: Scope; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "following", label: "Following" },
];

const ios = process.env.EXPO_OS === "ios";

/**
 * The community board: everyone's shout-outs, collab calls, showings, asks,
 * kindness and studio updates. Open to every member who accepted the
 * Guidelines; the curated Wall is a separate tab.
 */
export function CommunityScreen() {
  const palette = useBrandColors();
  const { signedIn, ensureMember } = useCommunityGate();
  const [scope, setScope] = useState<Scope>("all");
  const [kind, setKind] = useState<CommunityKind | "all">("all");
  const [topic, setTopic] = useState("all");
  const topics = useTopics();

  const followingLocked = scope === "following" && !signedIn;
  const query = useCommunity(
    {
      scope,
      topic: topic === "all" ? undefined : topic,
      kind: kind === "all" ? undefined : kind,
    },
    !followingLocked,
  );

  const items = useMemo<CommunityPostDTO[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const filtered = kind !== "all" || topic !== "all";

  const kindOptions = useMemo(
    () => [{ id: "all" as const, label: "All kinds" }, ...COMMUNITY_KINDS.map((k) => ({ id: k.id, label: k.label }))],
    [],
  );
  const topicOptions = useMemo(
    () => [{ id: "all", label: "All topics" }, ...(topics.data ?? []).map((t) => ({ id: t.slug, label: t.name }))],
    [topics.data],
  );

  // A cold start offline leaves the topic chips errored too; refresh and Try again must bring both back.
  const refresh = () => {
    void query.refetch();
    if (topics.isError) void topics.refetch();
  };

  const compose = () => {
    if (ensureMember()) router.push("/compose-community");
  };

  const header = (
    <View style={{ gap: spacing.md, paddingBottom: spacing.sm }}>
      <ComposerPrompt onPress={compose} />
      <FilterChips label="Whose posts" options={scopeOptions} value={scope} onChange={setScope} />
      <FilterChips label="Kind of post" options={kindOptions} value={kind} onChange={setKind} />
      {topicOptions.length > 1 ? (
        <FilterChips label="Topic" options={topicOptions} value={topic} onChange={setTopic} />
      ) : null}
      <KindnessCard />
    </View>
  );

  let empty = null;
  if (followingLocked) {
    empty = <EmptyBoard mode="join" onCompose={compose} />;
  } else if (query.isPending) {
    empty = (
      <View style={{ gap: spacing.md, paddingTop: spacing.md }}>
        <Skeleton height={120} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </View>
    );
  } else if (query.error) {
    empty = (
      <ErrorState
        offline={isApiError(query.error) && query.error.offline}
        onRetry={refresh}
        retrying={query.isRefetching}
      />
    );
  } else {
    empty = <EmptyBoard mode={scope === "following" ? "following" : filtered ? "filtered" : "all"} onCompose={compose} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Community", headerRight: () => <ActivityBell /> }} />
      <FlashList
        data={followingLocked ? [] : items}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: screenMargin }}>
            <CommunityCard post={item} />
          </View>
        )}
        ListHeaderComponent={<View style={{ paddingHorizontal: screenMargin, paddingTop: spacing.md }}>{header}</View>}
        ListEmptyComponent={<View style={{ paddingHorizontal: screenMargin }}>{empty}</View>}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View style={{ padding: spacing.md }}>
              <Skeleton height={80} />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.6}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={refresh}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: palette.bg }}
        contentContainerStyle={{ paddingBottom: ios ? spacing.xxxl : spacing.xxl }}
      />
    </>
  );
}
