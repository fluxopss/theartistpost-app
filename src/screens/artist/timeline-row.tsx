import { Link } from "expo-router";
import { Pressable, View } from "react-native";

import { API_ORIGIN } from "@/api/client";
import type { PostSummaryDTO } from "@/api/types";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";
import { PostMedia } from "@/screens/post/post-media";

const publishedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function publishedLabel(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : publishedFormat.format(date);
}

/**
 * One work in an artist timeline — media first, then title and date.
 * No card chrome; the media is the surface.
 */
export function TimelineRow({ post }: { post: PostSummaryDTO }) {
  const when = publishedLabel(post.publishedAt);
  const webUrl = `${API_ORIGIN}/post/${encodeURIComponent(post.slug)}`;

  return (
    <View style={{ gap: spacing.sm }}>
      <PostMedia post={post} webUrl={webUrl} />
      <Link href={{ pathname: "/post/[slug]", params: { slug: post.slug } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.title}${when ? `, ${when}` : ""}`}
          accessibilityHint="Opens the work"
          style={({ pressed }) => ({ gap: spacing.xxs, opacity: pressed ? 0.82 : 1 })}
        >
          <ThemedText variant="headline" numberOfLines={2}>
            {post.title}
          </ThemedText>
          {post.description ? (
            <ThemedText variant="body" tone="muted" numberOfLines={3}>
              {post.description}
            </ThemedText>
          ) : null}
          {when ? (
            <ThemedText variant="footnote" tone="muted">
              {when}
            </ThemedText>
          ) : null}
        </Pressable>
      </Link>
    </View>
  );
}
