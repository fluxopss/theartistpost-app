import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Share, View } from "react-native";

import { useMe, useUpdateProfile } from "@/api/hooks";
import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { InlineEditField } from "@/components/inline-edit-field";
import { ProfileHeader } from "@/components/profile-header";
import { Skeleton } from "@/components/skeleton";
import { StatRow } from "@/components/stat-row";
import { ThemedText } from "@/components/themed-text";
import { TopicPills } from "@/components/topic-pills";
import { chapters } from "@/content/chapters";
import { BIO_MAX, HEADLINE_MAX } from "@/domain/people/profile-form";
import { needsWelcome } from "@/domain/people/welcome";
import { useAvatarChange } from "@/hooks/use-avatar-change";
import { profileShareMessage, profileShareUrl } from "@/domain/people/share";
import { spacing } from "@/theme";

/** Your community profile at the top of the You tab: edit it, share it, see who follows. */
export function ProfileBlock() {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const update = useUpdateProfile();
  const avatar = useAvatarChange();

  // Coming back to this tab shows what you (or another device) changed since.
  const refetchMe = me.refetch;
  useFocusEffect(
    useCallback(() => {
      if (user) void refetchMe();
    }, [user, refetchMe]),
  );

  if (!user) return null;
  if (!me.data) return me.isPending ? <Skeleton height={160} /> : null;

  const profile = me.data.user;

  if (needsWelcome(profile)) {
    return (
      <View style={{ gap: spacing.sm }}>
        <ThemedText variant="title2" accessibilityRole="header">
          Finish your profile
        </ThemedText>
        <ThemedText variant="callout" tone="muted">
          Accept the Community Guidelines and pick a handle to post, follow and be found.
        </ThemedText>
        <Button title="Finish your profile" tone="teal" onPress={() => router.push("/welcome")} />
      </View>
    );
  }

  const handle = profile.handle ?? "";
  const chapter = chapters.find((c) => c.id === profile.chapterId);
  const share = () =>
    void Share.share({
      message: profileShareMessage(profile.name, handle),
      ...(process.env.EXPO_OS === "ios" ? { url: profileShareUrl(handle) } : {}),
    });

  return (
    <ProfileHeader
      onAvatarPress={() => void avatar.choose()}
      avatarBusy={avatar.isPending}
      headlineSlot={
        <InlineEditField
          label="Headline"
          value={profile.headline}
          emptyPrompt="Add a headline"
          max={HEADLINE_MAX}
          textVariant="headline"
          onSave={(headline) => update.mutateAsync({ headline })}
        />
      }
      bioSlot={
        <InlineEditField
          label="Bio"
          value={profile.bio}
          emptyPrompt="Tell people about your work"
          max={BIO_MAX}
          multiline
          onSave={(bio) => update.mutateAsync({ bio })}
        />
      }
      profile={{
        name: profile.name,
        handle,
        avatarUrl: profile.image,
        headline: profile.headline,
        location: profile.location,
        chapterName: chapter?.name ?? null,
        bio: profile.bio,
        isArtist: profile.artist?.approved === true,
      }}
    >
      <StatRow handle={handle} followerCount={profile.followerCount} followingCount={profile.followingCount} />
      <TopicPills topics={profile.topics} />
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Button title="Edit profile" icon="pencil" variant="secondary" onPress={() => router.push("/edit-profile")} style={{ flex: 1 }} />
        <Button title="Share profile" icon="share" variant="secondary" onPress={share} style={{ flex: 1 }} />
      </View>
      <Button
        title="View public profile"
        variant="ghost"
        onPress={() => router.push({ pathname: "/person/[handle]", params: { handle } })}
      />
    </ProfileHeader>
  );
}
