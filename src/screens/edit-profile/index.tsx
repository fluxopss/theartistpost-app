import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { describeSaveError, isApiError } from "@/api/errors";
import { useMe, useUpdateProfile } from "@/api/hooks";
import type { MeDTO } from "@/api/types";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ModalBar } from "@/components/modal-bar";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { TopicPicker } from "@/components/topic-picker";
import { useAuth } from "@/auth";
import { clearProfileDraft, readProfileDraft, rememberProfileDraft } from "@/domain/people/draft-store";
import {
  BIO_MAX,
  buildProfilePatch,
  HEADLINE_MAX,
  LOCATION_MAX,
  NAME_MAX,
  validateProfileForm,
  type ProfileFormValues,
} from "@/domain/people/profile-form";
import { screenMargin, spacing, useBrandColors } from "@/theme";

import { ChapterPicker } from "./chapter-picker";

function toFormValues(user: MeDTO["user"], profile: MeDTO["profile"]): ProfileFormValues {
  return {
    name: user.name,
    handle: user.handle ?? "",
    headline: user.headline ?? "",
    location: user.location ?? "",
    bio: user.bio ?? profile?.bio ?? "",
    chapterId: user.chapterId,
    topicSlugs: user.topics.map((topic) => topic.slug),
  };
}

function EditProfileForm({ me }: { me: MeDTO }) {
  const update = useUpdateProfile();
  const original = useMemo(() => toFormValues(me.user, me.profile), [me.user, me.profile]);
  // An earlier edit that was never saved (sheet closed, or the save failed) comes back.
  const [restored] = useState(() => readProfileDraft(me.user.id));
  const [values, setValues] = useState<ProfileFormValues>(restored ?? original);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Artists keep the handle that is their Wall address; the server refuses a change.
  const handleLocked = Boolean(me.user.artist?.handle);
  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) =>
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      rememberProfileDraft(me.user.id, next);
      return next;
    });

  const save = async () => {
    const checked = validateProfileForm(values, { handleLocked });
    if (!checked.ok) {
      setErrors(checked.fields);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError(null);
    const patch = buildProfilePatch(original, values, { handleLocked });
    if (Object.keys(patch).length === 0) {
      clearProfileDraft(me.user.id);
      router.back();
      return;
    }
    try {
      await update.mutateAsync(patch);
      clearProfileDraft(me.user.id);
      router.back();
    } catch (cause) {
      // Typed text stays in the form (and in the draft store) whatever went wrong.
      const fields = isApiError(cause) ? cause.fields : undefined;
      if (fields && Object.keys(fields).length > 0) setErrors(fields);
      else setFormError(describeSaveError(cause));
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={spacing.xxl}
      contentContainerStyle={{ padding: screenMargin, gap: spacing.lg, paddingBottom: spacing.xxxl }}
    >
      {restored ? (
        <ThemedText variant="footnote" tone="muted" accessibilityLiveRegion="polite">
          Your unsaved changes are back. Save when you are ready.
        </ThemedText>
      ) : null}
      <AvatarPicker url={me.user.image} name={values.name || me.user.name} />

      <TextField
        label="Name"
        value={values.name}
        onChangeText={(text) => set("name", text)}
        maxLength={NAME_MAX}
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />
      <TextField
        label="Handle"
        value={values.handle}
        onChangeText={(text) => set("handle", text)}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={40}
        editable={!handleLocked}
        helper={
          handleLocked
            ? "Artist handles are your Wall address, so the house keeps them steady."
            : "Letters, numbers, _ or -. This is how people find and mention you."
        }
        error={errors.handle}
        style={handleLocked ? { opacity: 0.6 } : undefined}
      />
      <TextField
        label="Headline"
        value={values.headline}
        onChangeText={(text) => set("headline", text)}
        maxLength={HEADLINE_MAX}
        showCount
        placeholder="Muralist · West Palm Beach"
        error={errors.headline}
      />
      <TextField
        label="Location"
        value={values.location}
        onChangeText={(text) => set("location", text)}
        maxLength={LOCATION_MAX}
        showCount
        error={errors.location}
      />
      <TextField
        label="Bio"
        value={values.bio}
        onChangeText={(text) => set("bio", text)}
        multiline
        maxLength={BIO_MAX}
        showCount
        textAlignVertical="top"
        style={{ minHeight: 120 }}
        error={errors.bio}
      />

      <ChapterPicker value={values.chapterId} onChange={(id) => set("chapterId", id)} />
      <TopicPicker selected={values.topicSlugs} onChange={(slugs) => set("topicSlugs", slugs)} />
      {errors.topicSlugs ? (
        <ThemedText variant="footnote" tone="danger">
          {errors.topicSlugs}
        </ThemedText>
      ) : null}

      {formError ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {formError}
        </ThemedText>
      ) : null}
      <Button title="Save" tone="teal" size="lg" loading={update.isPending} onPress={() => void save()} />
    </KeyboardAwareScrollView>
  );
}

/** Edit your profile: photo, name, handle, headline, place, bio, chapter and topics. */
export function EditProfileScreen() {
  const palette = useBrandColors();
  const { user } = useAuth();
  const me = useMe(Boolean(user));

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ModalBar title="Edit profile" />
      {!user ? (
        <EmptyState
          icon="people"
          title="Join the house"
          body="Sign in to build your profile."
          action={<Button title="Join the house" onPress={() => router.replace("/join")} />}
        />
      ) : me.data ? (
        <EditProfileForm me={me.data} />
      ) : me.error ? (
        <EmptyState
          icon="warning"
          title="Couldn't load your profile"
          body="Check your connection and try again."
          action={<Button title="Try again" variant="secondary" onPress={() => void me.refetch()} />}
        />
      ) : (
        <View style={{ padding: screenMargin, gap: spacing.md }}>
          <Skeleton height={96} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </View>
      )}
    </View>
  );
}
