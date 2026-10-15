import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { minTapTarget, spacing } from "@/theme";

function Stat({
  count,
  noun,
  onPress,
}: {
  count: number;
  noun: string;
  onPress?: () => void;
}) {
  const label = `${count} ${noun}`;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={label}
      accessibilityHint={onPress ? `Shows ${noun}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: minTapTarget,
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <ThemedText variant="headline" style={{ fontVariant: ["tabular-nums"] }}>
        {count}
        <ThemedText variant="subheadline" tone="muted">
          {` ${noun}`}
        </ThemedText>
      </ThemedText>
    </Pressable>
  );
}

/** Followers, following and posts. The first two open their lists. */
export function StatRow({
  handle,
  followerCount,
  followingCount,
  postCount,
}: {
  handle: string;
  followerCount: number;
  followingCount: number;
  postCount?: number;
}) {
  const open = (list: "followers" | "following") =>
    router.push({ pathname: "/people/[handle]/[list]", params: { handle, list } });

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: spacing.lg }}>
      <Stat count={followerCount} noun={followerCount === 1 ? "follower" : "followers"} onPress={() => open("followers")} />
      <Stat count={followingCount} noun="following" onPress={() => open("following")} />
      {postCount !== undefined ? <Stat count={postCount} noun={postCount === 1 ? "post" : "posts"} /> : null}
    </View>
  );
}
