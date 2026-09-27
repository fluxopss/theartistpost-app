import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";

import { originUrl } from "@/api/client";
import type { PostSummaryDTO } from "@/api/types";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { mediaKindLabel, mediaPresentation } from "@/domain/posts/media";
import { radius, spacing, useBrandColors } from "@/theme";
import { openExternal } from "@/utils/links";

/** Very tall or very wide work is letterboxed past these, never cropped. */
const MIN_RATIO = 0.6;
const MAX_RATIO = 1.8;
const VIDEO_RATIO = 16 / 9;
const WEB_ONLY_MIN_HEIGHT = 240;

function frame(background: string): StyleProp<ViewStyle> {
  return {
    width: "100%",
    borderRadius: radius.lg,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: background,
  };
}

/** A photograph at its own proportions — the whole piece, uncropped. */
function PhotoMedia({ uri, alt }: { uri: string; alt: string }) {
  const palette = useBrandColors();
  const [ratio, setRatio] = useState(4 / 5);
  return (
    <View style={[frame(palette.bgElevated), { aspectRatio: ratio }]}>
      <Image
        source={{ uri }}
        accessibilityLabel={alt}
        contentFit="contain"
        transition={200}
        onLoad={({ source }) => {
          if (source.width > 0 && source.height > 0) {
            setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, source.width / source.height)));
          }
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}

/** Native player with native controls. Never autoplays. */
function VideoMedia({ uri, title }: { uri: string; title: string }) {
  const palette = useBrandColors();
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <View style={[frame(palette.bgDeep), { aspectRatio: VIDEO_RATIO }]}>
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        accessibilityLabel={`Video: ${title}`}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}

/** Sound embeds and canvases don't play in the app yet — say so, and open the web. */
function WebOnlyMedia({ kind, webUrl }: { kind: string; webUrl: string }) {
  const palette = useBrandColors();
  return (
    <View
      style={[
        frame(palette.bgDeep),
        {
          minHeight: WEB_ONLY_MIN_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          padding: spacing.xl,
        },
      ]}
    >
      <ThemedText variant="title1" tone="spark-gold">
        {kind}
      </ThemedText>
      <ThemedText variant="callout" tone="muted" style={{ textAlign: "center" }}>
        {kind === "Sound" ? "This sound plays on the web for now." : "This work opens on the web for now."}
      </ThemedText>
      <Button
        title="View on the web"
        icon="external"
        variant="secondary"
        accessibilityHint="Opens this work on The Artist Post website"
        onPress={() => void openExternal(webUrl)}
      />
    </View>
  );
}

/** The work itself: photograph, video, or an honest pointer to the web. */
export function PostMedia({ post, webUrl }: { post: PostSummaryDTO; webUrl: string }) {
  const presentation = mediaPresentation(post.media);
  const uri = post.media.url ? originUrl(post.media.url) : null;

  if (presentation === "image" && uri) return <PhotoMedia uri={uri} alt={post.title} />;
  if (presentation === "video" && uri) return <VideoMedia uri={uri} title={post.title} />;
  return <WebOnlyMedia kind={mediaKindLabel(post.media.type)} webUrl={webUrl} />;
}
