import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import type { PersonSummaryDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { FollowButton } from "@/components/follow-button";
import { ThemedText } from "@/components/themed-text";
import { isSelfHandle } from "@/domain/people/self-handle";
import { useSelfHandle } from "@/hooks/use-self-handle";
import { minTapTarget, spacing, useBrandColors } from "@/theme";

/** One person in a list: avatar, name, @handle, headline, and a Follow button. */
export function PersonRow({ person }: { person: PersonSummaryDTO }) {
  const palette = useBrandColors();
  const isSelf = isSelfHandle(person.handle, useSelfHandle());

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: palette.separator,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${person.name}, @${person.handle}${person.isArtist ? ", artist" : ""}${person.headline ? `, ${person.headline}` : ""}`}
        accessibilityHint="Opens their profile"
        onPress={() => router.push({ pathname: "/person/[handle]", params: { handle: person.handle } })}
        style={{ flex: 1, minHeight: minTapTarget + spacing.xs, flexDirection: "row", alignItems: "center", gap: spacing.sm }}
      >
        <ArtistAvatar url={person.avatarUrl} name={person.name} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="headline" numberOfLines={1}>
            {person.name}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
            @{person.handle}
            {person.headline ? ` · ${person.headline}` : ""}
          </ThemedText>
        </View>
      </Pressable>
      {isSelf ? null : <FollowButton handle={person.handle} following={person.viewerFollows} />}
    </View>
  );
}
