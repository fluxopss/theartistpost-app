import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Share, View } from "react-native";

import { useAuth } from "@/auth";
import { originUrl } from "@/api/client";
import { isApiError } from "@/api/errors";
import { useLikeStatus, usePost, useToggleLike } from "@/api/hooks";
import type { PostDetailDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { mediaKindLabel } from "@/domain/posts/media";
import { useSaves } from "@/storage/saves";
import { radius, spacing, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

import { ArtistByline } from "./artist-byline";
import { CommentList } from "./comment-list";
import { PostMedia } from "./post-media";

const ios = process.env.EXPO_OS === "ios";
const publishedFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function published(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : publishedFormat.format(date);
}

function sharePost(post: PostDetailDTO, url: string) {
  const message = `${post.title} by ${post.artist.name} · ${site.name}`;
  // iOS shares the URL as its own item; Android only carries `message`.
  Share.share(ios ? { message, url } : { message: `${message}\n${url}` }).catch(() => {});
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function PostSkeleton() {
  return (
    <View style={{ gap: spacing.lg }}>
      <Skeleton height="auto" rounded={radius.lg} style={{ aspectRatio: 4 / 5 }} />
      <View style={{ gap: spacing.xs }}>
        <Skeleton height={12} width="30%" />
        <Skeleton height={28} width="85%" />
      </View>
      <Skeleton height={56} rounded={radius.md} />
    </View>
  );
}

function TagList({ tags }: { tags: PostDetailDTO["tags"] }) {
  const palette = useBrandColors();
  return (
    <View
      accessible
      accessibilityLabel={`Tags: ${tags.map((tag) => tag.name).join(", ")}`}
      style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}
    >
      {tags.map((tag) => (
        <View
          key={tag.slug}
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xxs,
            borderRadius: radius.pill,
            backgroundColor: palette.accentSoft,
          }}
        >
          <ThemedText variant="footnote" tone="accent">
            {tag.name}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function PostBody({ post }: { post: PostDetailDTO }) {
  const { user } = useAuth();
  const { isPostSaved, togglePost } = useSaves();
  const saved = isPostSaved(post.id);
  const likeStatus = useLikeStatus(post.slug);
  const toggleLike = useToggleLike(post.slug);
  const [likeError, setLikeError] = useState<string | null>(null);
  const liked = user ? likeStatus.data?.likedByMe === true : false;
  const likeCount = likeStatus.data?.likeCount ?? post.likeCount;
  const webUrl = originUrl(`/post/${post.slug}`);
  const date = published(post.publishedAt);

  const onLike = async () => {
    if (!user) {
      router.push("/join");
      return;
    }
    setLikeError(null);
    if (process.env.EXPO_OS === "ios") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleLike.mutateAsync();
    } catch (cause) {
      setLikeError(isApiError(cause) ? cause.message : "Could not update that like.");
    }
  };

  return (
    <>
      <PostMedia post={post} webUrl={webUrl} />

      <View style={{ gap: spacing.sm }}>
        <ThemedText variant="eyebrow" tone="spark-gold">
          {mediaKindLabel(post.media.type)}
          {date ? ` · ${date}` : ""}
        </ThemedText>
        <ThemedText variant="title1" accessibilityRole="header" selectable>
          {post.title}
        </ThemedText>
        <ArtistByline artist={post.artist} />
        <ThemedText variant="footnote" tone="muted">
          {plural(likeCount, "like")}
          {user ? "" : " · join to leave yours"}
        </ThemedText>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.xs }}>
        <Button
          title={liked ? `Liked · ${likeCount}` : `Like · ${likeCount}`}
          icon={liked ? "heartFill" : "heart"}
          variant="secondary"
          accessibilityLabel={liked ? "Remove like" : "Like this work"}
          loading={toggleLike.isPending}
          onPress={() => void onLike()}
          style={{ flex: 1 }}
        />
        <Button
          title={saved ? "Saved" : "Save"}
          icon={saved ? "bookmarkFill" : "bookmark"}
          variant="secondary"
          accessibilityLabel={saved ? "Remove from Saved" : "Save to this phone"}
          onPress={() => togglePost({ id: post.id, slug: post.slug, title: post.title, artist: post.artist.name })}
          style={{ flex: 1 }}
        />
        <Button
          title="Share"
          icon="share"
          variant="secondary"
          onPress={() => sharePost(post, webUrl)}
          style={{ flex: 1 }}
        />
      </View>

      {likeError ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {likeError}
        </ThemedText>
      ) : null}

      {post.description ? (
        <ThemedText variant="body" selectable>
          {post.description}
        </ThemedText>
      ) : null}

      {post.tags.length ? <TagList tags={post.tags} /> : null}

      <CommentList post={post} />
    </>
  );
}

/** One work: the media, who made it, what it's about, and what people said. */
export function PostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = usePost(slug);
  const notFound = isApiError(query.error) && query.error.code === "not_found";

  return (
    <>
      <Stack.Screen options={{ title: query.data?.title ?? "Work", headerLargeTitleEnabled: false }} />
      <ScreenScroll gap={spacing.xl} refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        {notFound ? (
          <EmptyState
            icon="wall"
            title="This work isn’t on the wall"
            body="It may have been taken down, or it’s still waiting on approval."
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
            loading={<PostSkeleton />}
            empty={null}
          >
            {(post) => <PostBody post={post} />}
          </AsyncView>
        )}
      </ScreenScroll>
    </>
  );
}
