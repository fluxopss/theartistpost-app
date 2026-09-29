import { router, Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useArtistTimeline } from "@/api/hooks";
import type { ArtistProfileDTO, PostSummaryDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { radius, spacing } from "@/theme";
import { contact, tabRoutes } from "@/utils/links";

import { SocialLinks } from "./social-links";
import { TimelineRow } from "./timeline-row";

const AVATAR_SIZE = 88;
const LOAD_AHEAD = 600;

function ArtistSkeleton() {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} rounded={radius.lg} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Skeleton height={12} width="40%" />
          <Skeleton height={28} width="80%" />
        </View>
      </View>
      <Skeleton height={64} />
      <Skeleton height="auto" rounded={radius.lg} style={{ aspectRatio: 4 / 5 }} />
    </View>
  );
}

function ProfileHeader({ artist }: { artist: ArtistProfileDTO & { postCount?: number } }) {
  const count = artist.postCount;
  const worksLabel =
    count === undefined
      ? "Timeline"
      : count === 1
        ? "1 work"
        : `${count} works`;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <ArtistAvatar url={artist.avatarUrl} name={artist.name} size={AVATAR_SIZE} />
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <ThemedText variant="eyebrow" tone="spark-coral" selectable>
            @{artist.handle}
          </ThemedText>
          <ThemedText variant="title1" accessibilityRole="header">
            {artist.name}
          </ThemedText>
        </View>
      </View>

      {artist.bio ? (
        <ThemedText variant="body" tone="muted" selectable>
          {artist.bio}
        </ThemedText>
      ) : null}

      <SocialLinks links={artist.socialLinks} />

      <SectionHeader eyebrow={worksLabel} eyebrowTone="spark-coral" title="Timeline" />
    </View>
  );
}

function TimelineFooter({
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  onRetry,
  onMore,
}: {
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasNextPage: boolean;
  onRetry: () => void;
  onMore: () => void;
}) {
  if (isFetchingNextPage) {
    return <Skeleton height="auto" rounded={radius.lg} style={{ aspectRatio: 4 / 5 }} />;
  }
  if (isFetchNextPageError) {
    return (
      <View accessibilityRole="alert" style={{ alignItems: "center", gap: spacing.xs }}>
        <ThemedText variant="subheadline" tone="muted" style={{ textAlign: "center" }}>
          The next works didn’t come through.
        </ThemedText>
        <Button title="Try again" variant="secondary" icon="refresh" onPress={onRetry} />
      </View>
    );
  }
  if (hasNextPage) {
    return <Button title="More on the timeline" variant="secondary" onPress={onMore} />;
  }
  return null;
}

function ArtistTimelineBody({
  artist,
  items,
  query,
}: {
  artist: ArtistProfileDTO & { postCount: number };
  items: PostSummaryDTO[];
  query: ReturnType<typeof useArtistTimeline>;
}) {
  return (
    <View style={{ gap: spacing.xxl }}>
      <ProfileHeader artist={artist} />
      {items.length === 0 ? (
        <EmptyState
          icon="wall"
          title="Nothing on the timeline yet"
          body={`When ${artist.name} shares approved work, it appears here. ${copy.donate.emptySupportBody}`}
          action={
            <Button
              title={copy.donate.supportHouseCta}
              icon="donate"
              tone="coral"
              onPress={contact.donate}
            />
          }
        />
      ) : (
        <View style={{ gap: spacing.xxl }}>
          {items.map((post) => (
            <TimelineRow key={post.id} post={post} />
          ))}
          <TimelineFooter
            isFetchingNextPage={query.isFetchingNextPage}
            isFetchNextPageError={query.isFetchNextPageError}
            hasNextPage={Boolean(query.hasNextPage)}
            onRetry={() => void query.fetchNextPage()}
            onMore={() => void query.fetchNextPage()}
          />
        </View>
      )}
    </View>
  );
}

/** Approved artist: portrait, bio, and an infinite chronological timeline. */
export function ArtistScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const query = useArtistTimeline(handle ?? "");
  const notFound = isApiError(query.error) && query.error.code === "not_found";

  const viewport = useRef({ offsetY: 0, height: 0 });
  const timelineEndY = useRef(0);

  const loadMoreIfNear = () => {
    const { offsetY, height } = viewport.current;
    if (height === 0 || timelineEndY.current === 0) return;
    if (!query.hasNextPage || query.isFetching || query.isFetchNextPageError) return;
    if (offsetY + height + LOAD_AHEAD >= timelineEndY.current) void query.fetchNextPage();
  };

  const artist = query.data?.pages[0]?.artist;
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <Stack.Screen
        options={{ title: artist?.name ?? "Artist", headerLargeTitleEnabled: false }}
      />
      <ScreenScroll
        gap={spacing.xl}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        scrollEventThrottle={100}
        onLayout={(e: LayoutChangeEvent) => {
          viewport.current.height = e.nativeEvent.layout.height;
          loadMoreIfNear();
        }}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          viewport.current = {
            offsetY: e.nativeEvent.contentOffset.y,
            height: e.nativeEvent.layoutMeasurement.height,
          };
          loadMoreIfNear();
        }}
      >
        {notFound ? (
          <EmptyState
            icon="studio"
            title="This artist isn’t on the wall"
            body="Artists appear here once the house approves them. This handle may still be waiting, or it has moved."
            action={
              <Button
                title={copy.house.wallCta}
                variant="secondary"
                onPress={() => router.navigate(tabRoutes.wall)}
              />
            }
          />
        ) : (
          <AsyncView
            data={artist ? { artist, items } : undefined}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            loading={<ArtistSkeleton />}
            empty={null}
          >
            {(data) => (
              <View
                onLayout={(e) => {
                  const { y, height } = e.nativeEvent.layout;
                  timelineEndY.current = y + height;
                  loadMoreIfNear();
                }}
              >
                <ArtistTimelineBody artist={data.artist} items={data.items} query={query} />
              </View>
            )}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
