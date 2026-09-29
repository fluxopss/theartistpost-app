import { useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/auth";
import { isApiError } from "@/api/errors";
import { useMe, useUpdateMe } from "@/api/hooks";
import { Button } from "@/components/button";
import { ListGroup } from "@/components/list-row";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";

/**
 * Self-serve display name + artist bio via PATCH /me.
 * Never invents a studio bio for members without an ArtistProfile.
 */
export function AccountProfileGroup() {
  const { user, refresh } = useAuth();
  const me = useMe(Boolean(user));
  const updateMe = useUpdateMe();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftBio, setDraftBio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  if (!user) return null;

  const remoteName = me.data?.user.name ?? user.name;
  const remoteBio = me.data?.profile?.bio ?? "";
  const name = draftName ?? remoteName;
  const bio = draftBio ?? remoteBio;
  const hasArtistProfile = Boolean(me.data?.profile);
  const pending = me.data?.profile?.pendingApproval;

  const save = async () => {
    setError(null);
    setSavedNote(null);
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Name needs at least two characters.");
      return;
    }
    try {
      await updateMe.mutateAsync({
        name: trimmedName,
        ...(hasArtistProfile ? { bio: bio.trim() || null } : {}),
      });
      setDraftName(null);
      setDraftBio(null);
      await refresh();
      setSavedNote("Saved to your house pass.");
    } catch (cause) {
      setError(isApiError(cause) ? cause.message : "Could not update your profile.");
    }
  };

  return (
    <ListGroup
      header="Your pass"
      footer={
        pending
          ? "Artist publish stays closed until the house approves your studio."
          : hasArtistProfile
            ? "Bio shows on your public artist page when approved."
            : "Member pass — request a studio handle from Join if you create."
      }
    >
      <View style={{ gap: spacing.sm, padding: spacing.md }}>
        <TextField
          label="Display name"
          value={name}
          onChangeText={setDraftName}
          maxLength={80}
          autoComplete="name"
          textContentType="name"
          editable={!updateMe.isPending}
        />
        {hasArtistProfile ? (
          <TextField
            label="Studio bio"
            value={bio}
            onChangeText={setDraftBio}
            maxLength={480}
            showCount
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            placeholder="A short word about your practice…"
            editable={!updateMe.isPending}
          />
        ) : null}
        {me.data?.user.handle ? (
          <ThemedText variant="footnote" tone="muted">
            @{me.data.user.handle}
            {me.data.profile?.approved === false ? " · awaiting approval" : ""}
          </ThemedText>
        ) : null}
        {error ? (
          <ThemedText variant="footnote" tone="danger">
            {error}
          </ThemedText>
        ) : null}
        {savedNote ? (
          <ThemedText variant="footnote" tone="muted">
            {savedNote}
          </ThemedText>
        ) : null}
        <Button
          title={updateMe.isPending ? "Saving…" : "Save profile"}
          onPress={() => void save()}
          loading={updateMe.isPending}
          disabled={updateMe.isPending}
        />
      </View>
    </ListGroup>
  );
}
