import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { isApiError } from "@/api/errors";
import { useCreateCommunityPost, useTopics, useUploadCommunityImage } from "@/api/hooks";
import type { CommunityKind } from "@/api/types";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { FilterChips } from "@/components/filter-chips";
import { ModalBar } from "@/components/modal-bar";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { COMMUNITY_BODY_MAX, COMMUNITY_KINDS, validateCommunityBody } from "@/domain/community/compose";
import { needsWelcome } from "@/domain/people/welcome";
import { useCommunityGate } from "@/hooks/use-community-gate";
import { radius, screenMargin, spacing, useBrandColors } from "@/theme";
import { pickImageForUpload, type PickedImage } from "@/utils/pick-image";

const PHOTO_MAX_SIDE = 1600;

/**
 * Post to the board. Pick a kind (its prompt becomes the placeholder), write
 * up to 500 characters, optionally tag a topic and attach one photo. People
 * who have not finished their profile are sent to Welcome first.
 */
export function ComposeCommunityScreen() {
  const palette = useBrandColors();
  const { signedIn, profile } = useCommunityGate();
  const topics = useTopics();
  const create = useCreateCommunityPost();
  const upload = useUploadCommunityImage();

  const [kind, setKind] = useState<CommunityKind>("SHOUTOUT");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) router.replace("/join");
    else if (profile && needsWelcome(profile)) router.replace("/welcome");
  }, [signedIn, profile]);

  const option = COMMUNITY_KINDS.find((k) => k.id === kind) ?? COMMUNITY_KINDS[0]!;
  const kindOptions = useMemo(() => COMMUNITY_KINDS.map((k) => ({ id: k.id, label: k.label })), []);
  const checked = validateCommunityBody(body);
  const busy = create.isPending || upload.isPending;

  const choosePhoto = async () => {
    setError(null);
    try {
      const picked = await pickImageForUpload({ maxSide: PHOTO_MAX_SIDE });
      if (picked) setPhoto(picked);
    } catch {
      Alert.alert("Couldn't use that photo", "Try a different one.");
    }
  };

  const submit = async () => {
    if (!checked.ok) {
      setError(checked.message);
      return;
    }
    setError(null);
    try {
      let imageUrl: string | undefined;
      if (photo) imageUrl = (await upload.mutateAsync(photo)).url;
      await create.mutateAsync({
        kind,
        body: checked.body,
        topicSlug: topic ?? undefined,
        imageUrl,
      });
      if (process.env.EXPO_OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (cause) {
      setError(isApiError(cause) ? (cause.fields?.body ?? cause.fields?.imageUrl ?? cause.message) : "Could not post just now.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ModalBar title="Post to the board" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={spacing.xxl}
        contentContainerStyle={{ padding: screenMargin, gap: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="subheadline" accessibilityRole="header">
            What kind of post?
          </ThemedText>
          <FilterChips label="Kind of post" options={kindOptions} value={kind} onChange={setKind} />
        </View>

        <TextField
          label="Your post"
          value={body}
          onChangeText={setBody}
          multiline
          maxCharacters={COMMUNITY_BODY_MAX}
          showCount
          placeholder={option.prompt}
          helper="Mention someone with @handle."
          textAlignVertical="top"
          style={{ minHeight: 140 }}
          error={error}
          editable={!busy}
        />

        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="subheadline" accessibilityRole="header">
            Topic (optional)
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {(topics.data ?? []).map((t) => (
              <Chip
                key={t.slug}
                label={t.name}
                selected={topic === t.slug}
                onPress={() => setTopic(topic === t.slug ? null : t.slug)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          {photo ? (
            <Image
              source={{ uri: photo.uri }}
              accessibilityLabel="The photo you attached"
              contentFit="cover"
              style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md }}
            />
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              title={photo ? "Change photo" : "Add a photo"}
              variant="secondary"
              icon="photo"
              disabled={busy}
              onPress={() => void choosePhoto()}
              style={{ flex: 1 }}
            />
            {photo ? (
              <Button title="Remove" variant="ghost" disabled={busy} onPress={() => setPhoto(null)} />
            ) : null}
          </View>
        </View>

        <Button
          title="Post"
          tone="coral"
          size="lg"
          loading={busy}
          disabled={!checked.ok}
          onPress={() => void submit()}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}
