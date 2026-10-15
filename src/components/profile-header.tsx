import type { ReactNode } from "react";
import { View } from "react-native";

import { ArtistAvatar } from "@/components/artist-avatar";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { spacing, useBrandColors } from "@/theme";

export type ProfileHeaderData = {
  name: string;
  handle: string | null;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  chapterName: string | null;
  bio: string | null;
  isArtist: boolean;
};

const AVATAR_SIZE = 88;

/** Avatar, name, @handle, headline, place and bio. Actions go in `children`. */
export function ProfileHeader({ profile, children }: { profile: ProfileHeaderData; children?: ReactNode }) {
  const palette = useBrandColors();
  const place = [profile.location, profile.chapterName].filter(Boolean).join(" · ");
  const summary = [
    profile.name,
    profile.handle ? `@${profile.handle}` : null,
    profile.isArtist ? "Artist" : null,
    profile.headline,
    place || null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <ArtistAvatar url={profile.avatarUrl} name={profile.name} size={AVATAR_SIZE} />
        <View accessible accessibilityLabel={summary} style={{ flex: 1, gap: spacing.xxs }}>
          {profile.handle ? (
            <ThemedText variant="eyebrow" tone="spark-coral" numberOfLines={1} selectable>
              @{profile.handle}
            </ThemedText>
          ) : null}
          <ThemedText variant="title1" accessibilityRole="header">
            {profile.name}
          </ThemedText>
          {profile.isArtist ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
              <Icon name="checkCircle" size={14} color={palette.accentText} />
              <ThemedText variant="footnote" tone="accent">
                Artist
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {profile.headline ? <ThemedText variant="headline">{profile.headline}</ThemedText> : null}
      {place ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
          <Icon name="mapPin" size={14} color={palette.textMuted} />
          <ThemedText variant="subheadline" tone="muted" style={{ flexShrink: 1 }}>
            {place}
          </ThemedText>
        </View>
      ) : null}
      {profile.bio ? (
        <ThemedText variant="body" selectable>
          {profile.bio}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}
