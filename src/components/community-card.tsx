import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { originUrl } from "@/api/client";
import { isApiError } from "@/api/errors";
import { postReactionState, useDeleteCommunityPost, useSetReaction } from "@/api/hooks";
import type { CommunityPostDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { ContentActionsMenu } from "@/components/content-actions-menu";
import { Icon } from "@/components/icon";
import { KindChip } from "@/components/kind-chip";
import { MentionText } from "@/components/mention-text";
import { ReactionButton } from "@/components/reaction-button";
import { ReactionSummary } from "@/components/reaction-summary";
import { ThemedText } from "@/components/themed-text";
import { formatActivityTime } from "@/domain/activity/time";
import { isSelfHandle } from "@/domain/people/self-handle";
import { useCommunityGate } from "@/hooks/use-community-gate";
import { useSelfHandle } from "@/hooks/use-self-handle";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

type Variant = "feed" | "thread" | "reply";

function openPerson(handle: string) {
  router.push({ pathname: "/person/[handle]", params: { handle } });
}

function openThread(id: string) {
  router.push({ pathname: "/community/[id]", params: { id } });
}

function Reactions({ post }: { post: CommunityPostDTO }) {
  const setReaction = useSetReaction(post.id);
  const { ensureMember } = useCommunityGate();
  const state = postReactionState(post);

  return (
    <>
      <ReactionButton
        state={state}
        disabled={setReaction.isPending}
        onSelect={(next) => {
          if (!ensureMember()) return;
          setReaction.mutate(next, {
            onError: (cause) =>
              Alert.alert("Could not save that", isApiError(cause) ? cause.message : "Try again in a moment."),
          });
        }}
      />
      <ReactionSummary
        counts={state.reactionCounts}
        onPress={() => router.push({ pathname: "/reactors", params: { id: post.id } })}
      />
    </>
  );
}

/**
 * One community post: who, what kind, the words (with tappable @mentions),
 * an optional photo, and React / Replies. `feed` opens the thread when
 * tapped; `thread` is the opened post; `reply` is a compact row.
 */
export function CommunityCard({
  post,
  variant = "feed",
  onDeleted,
}: {
  post: CommunityPostDTO;
  variant?: Variant;
  /** Called after the author deletes this post (e.g. to leave its thread). */
  onDeleted?: () => void;
}) {
  const palette = useBrandColors();
  const remove = useDeleteCommunityPost();
  const isReply = variant === "reply";
  const time = formatActivityTime(post.createdAt);
  const isOwn = isSelfHandle(post.author.handle, useSelfHandle());

  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${post.author.name}, @${post.author.handle}`}
        accessibilityHint="Opens their profile"
        onPress={() => openPerson(post.author.handle)}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: minTapTarget }}
      >
        <ArtistAvatar url={post.author.avatarUrl} name={post.author.name} size={isReply ? 32 : 40} />
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="headline" numberOfLines={1}>
            {post.author.name}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
            @{post.author.handle}
            {time ? ` · ${time}` : ""}
          </ThemedText>
        </View>
      </Pressable>
      <ContentActionsMenu
        target={{ type: "COMMUNITY_POST", id: post.id }}
        authorHandle={post.author.handle}
        isOwn={isOwn}
        onDelete={
          post.canDelete
            ? () =>
                remove.mutate(post.id, {
                  onSuccess: () => onDeleted?.(),
                  onError: (cause) =>
                    Alert.alert("Could not delete", isApiError(cause) ? cause.message : "Try again in a moment."),
                })
            : undefined
        }
      />
    </View>
  );

  const content = (
    <View style={{ gap: spacing.sm }}>
      {!isReply ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs }}>
          <KindChip kind={post.kind} />
          {post.topic ? (
            <ThemedText variant="footnote" tone="muted">
              {post.topic.name}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
      <MentionText body={post.body} variant={isReply ? "callout" : "body"} />
      {post.imageUrl ? (
        <Image
          source={{ uri: originUrl(post.imageUrl) }}
          accessibilityLabel={`Photo shared by ${post.author.name}`}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: palette.bgDeep }}
        />
      ) : null}
    </View>
  );

  const actions = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
      <Reactions post={post} />
      {!isReply ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            post.replyCount === 0 ? "Reply" : `${post.replyCount} ${post.replyCount === 1 ? "reply" : "replies"}`
          }
          accessibilityHint="Opens the conversation"
          disabled={variant === "thread"}
          onPress={() => openThread(post.id)}
          style={({ pressed }) => ({
            minHeight: minTapTarget,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xxs,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="people" size={20} color={palette.textMuted} />
          <ThemedText variant="subheadline" tone="muted" style={{ fontVariant: ["tabular-nums"] }}>
            {post.replyCount === 0 ? "Reply" : `${post.replyCount}`}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View
      style={{
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderBottomWidth: variant === "thread" ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: palette.separator,
      }}
    >
      {header}
      {variant === "feed" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${post.author.name}: ${post.body}`}
          accessibilityHint="Opens the conversation"
          onPress={() => openThread(post.id)}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {actions}
    </View>
  );
}
