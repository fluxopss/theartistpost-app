import { router, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useArtist } from "@/api/hooks";
import type { ArtistDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PostGrid } from "@/components/post-grid";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { radius, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

import { SocialLinks } from "./social-links";

const AVATAR_SIZE = 80;

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
      <PostGrid />
    </View>
  );
}

function ArtistBody({ data }: { data: ArtistDTO }) {
  const { artist, posts } = data;
  return (
    <>
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

      <View style={{ gap: spacing.md }}>
        <SectionHeader
          eyebrow={posts.length === 1 ? "1 work" : `${posts.length} works`}
          eyebrowTone="spark-coral"
          title="On the wall"
        />
        {posts.length ? (
          <PostGrid posts={posts} />
        ) : (
          <EmptyState
            icon="wall"
            title="Nothing on the wall yet"
            body={`When ${artist.name} shares approved work, it hangs here.`}
          />
        )}
      </View>
    </>
  );
}

/** An approved artist: portrait, bio, links, and their work on the wall. */
export function ArtistScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const query = useArtist(handle);
  const notFound = isApiError(query.error) && query.error.code === "not_found";

  return (
    <>
      <Stack.Screen
        options={{ title: query.data?.artist.name ?? "Artist", headerLargeTitleEnabled: false }}
      />
      <ScreenScroll gap={spacing.xl} refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
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
            data={query.data}
            isPending={query.isPending}
            error={query.error}
            offline={isApiError(query.error) && query.error.offline}
            onRetry={() => void query.refetch()}
            isRefetching={query.isRefetching}
            loading={<ArtistSkeleton />}
            empty={null}
          >
            {(data) => <ArtistBody data={data} />}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
