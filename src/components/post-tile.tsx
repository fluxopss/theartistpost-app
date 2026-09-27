import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { originUrl } from "@/api/client";
import type { PostSummaryDTO } from "@/api/types";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { mediaKindLabel, mediaPresentation } from "@/domain/posts/media";
import { radius, spacing, useBrandColors } from "@/theme";

/** Portrait frame, like a hung piece. */
const TILE_RATIO = 4 / 5;

/**
 * One work on the wall: its image (or an honest media label when there's no
 * photograph to show), title, and artist. Tap opens the work; on iOS a
 * long-press previews it. Without a `post` it renders its loading shape.
 */
export function PostTile({ post, style }: { post?: PostSummaryDTO; style?: StyleProp<ViewStyle> }) {
  const palette = useBrandColors();

  if (!post) {
    return (
      <View style={[{ gap: spacing.xs }, style]}>
        <Skeleton height="auto" rounded={radius.lg} style={{ aspectRatio: TILE_RATIO }} />
        <Skeleton height={16} width="80%" />
        <Skeleton height={12} width="50%" />
      </View>
    );
  }

  const kind = mediaKindLabel(post.media.type);
  const imageUri =
    mediaPresentation(post.media) === "image" && post.media.url ? originUrl(post.media.url) : null;

  return (
    <View style={style}>
      <Link href={{ pathname: "/post/[slug]", params: { slug: post.slug } }} asChild>
        <Link.Trigger>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${post.title}, by ${post.artist.name}. ${kind}.`}
            accessibilityHint="Opens the work"
            // No `style` callback here: Link's asChild Slot merges `style` as an
            // object and would drop a function. Pressed state styles the child.
          >
            {({ pressed }) => (
              <View style={{ gap: spacing.xs, opacity: pressed ? 0.82 : 1 }}>
                <View
                  style={{
                    aspectRatio: TILE_RATIO,
                    borderRadius: radius.lg,
                    borderCurve: "continuous",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: palette.bgElevated,
                  }}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      contentFit="cover"
                      transition={200}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <ThemedText variant="title2" tone="spark-gold">
                      {kind}
                    </ThemedText>
                  )}
                </View>
                <View style={{ gap: spacing.xxs }}>
                  <ThemedText variant="headline" numberOfLines={2}>
                    {post.title}
                  </ThemedText>
                  <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
                    {post.artist.name}
                  </ThemedText>
                </View>
              </View>
            )}
          </Pressable>
        </Link.Trigger>
        <Link.Preview />
      </Link>
    </View>
  );
}
