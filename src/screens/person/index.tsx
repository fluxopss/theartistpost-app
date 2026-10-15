import { router, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { usePerson, usePersonCommunity } from "@/api/hooks";
import type { PersonDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { CommunityCard } from "@/components/community-card";
import { ContentActionsMenu } from "@/components/content-actions-menu";
import { EmptyState } from "@/components/empty-state";
import { FollowButton } from "@/components/follow-button";
import { ProfileHeader } from "@/components/profile-header";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { StatRow } from "@/components/stat-row";
import { ThemedText } from "@/components/themed-text";
import { TopicPills } from "@/components/topic-pills";
import { spacing } from "@/theme";

function PersonSkeleton() {
  return (
    <View style={{ gap: spacing.lg }}>
      <Skeleton height={88} />
      <Skeleton height={20} width="60%" />
      <Skeleton height={64} />
    </View>
  );
}

function PersonPosts({ handle }: { handle: string }) {
  const posts = usePersonCommunity(handle);
  const items = posts.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="title3" accessibilityRole="header">
        On the board
      </ThemedText>
      <AsyncView
        data={posts.data ? items : undefined}
        isPending={posts.isPending}
        error={posts.error}
        offline={isApiError(posts.error) && posts.error.offline}
        onRetry={() => void posts.refetch()}
        isRefetching={posts.isRefetching}
        isEmpty={(list) => list.length === 0}
        loading={<Skeleton height={96} />}
        empty={
          <ThemedText variant="callout" tone="muted">
            Nothing posted yet.
          </ThemedText>
        }
      >
        {(list) => (
          <View>
            {list.map((post) => (
              <CommunityCard key={post.id} post={post} />
            ))}
            {posts.hasNextPage ? (
              <Button
                title={posts.isFetchingNextPage ? "Loading…" : "Show older"}
                variant="secondary"
                loading={posts.isFetchingNextPage}
                onPress={() => void posts.fetchNextPage()}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
          </View>
        )}
      </AsyncView>
    </View>
  );
}

function PersonBody({ person }: { person: PersonDTO }) {
  return (
    <View style={{ gap: spacing.xl }}>
      <ProfileHeader
        profile={{
          name: person.name,
          handle: person.handle,
          avatarUrl: person.avatarUrl,
          headline: person.headline,
          location: person.location,
          chapterName: person.chapter?.name ?? null,
          bio: person.bio,
          isArtist: person.isArtist,
        }}
      >
        <StatRow
          handle={person.handle}
          followerCount={person.followerCount}
          followingCount={person.followingCount}
          postCount={person.communityPostCount}
        />
        <TopicPills topics={person.topics} />
        <View style={{ gap: spacing.sm }}>
          {person.isSelf ? (
            <Button title="Edit profile" icon="pencil" variant="secondary" onPress={() => router.push("/edit-profile")} />
          ) : (
            <>
              <FollowButton handle={person.handle} following={person.viewerFollows} />
              {person.followsViewer ? (
                <ThemedText variant="footnote" tone="muted">
                  Follows you
                </ThemedText>
              ) : null}
            </>
          )}
          {person.artist?.approved ? (
            <Button
              title="See their work on The Wall"
              variant="ghost"
              onPress={() => router.push({ pathname: "/artist/[handle]", params: { handle: person.artist!.handle } })}
            />
          ) : null}
        </View>
      </ProfileHeader>
      <PersonPosts handle={person.handle} />
    </View>
  );
}

/** A member's public profile: who they are, who follows them, what they posted. */
export function PersonScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const query = usePerson(handle ?? "");
  const gone = isApiError(query.error) && query.error.code === "not_found";
  // After a block the server answers 404 but the query keeps its old data; do not show it.
  const person = gone ? undefined : query.data;

  return (
    <>
      <Stack.Screen
        options={{
          title: person?.name ?? "Profile",
          headerLargeTitleEnabled: false,
          headerRight: person
            ? () => (
                <ContentActionsMenu
                  target={{ type: "USER", id: person.id }}
                  authorHandle={person.handle}
                  isOwn={person.isSelf}
                />
              )
            : undefined,
        }}
      />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        {gone ? (
          <EmptyState
            icon="people"
            title="No one here"
            body="This profile isn't available. They may have left, or you can't see each other."
            action={<Button title="Go back" variant="secondary" onPress={() => router.back()} />}
          />
        ) : (
          <AsyncView
            data={person}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            loading={<PersonSkeleton />}
            empty={null}
          >
            {(data) => <PersonBody person={data} />}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
