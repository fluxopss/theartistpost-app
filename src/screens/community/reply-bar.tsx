import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useCreateCommunityPost } from "@/api/hooks";
import type { CommunityKind } from "@/api/types";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { COMMUNITY_BODY_MAX, validateCommunityBody } from "@/domain/community/compose";
import { useCommunityGate } from "@/hooks/use-community-gate";
import { spacing } from "@/theme";

/** Reply to a post (one level deep). Keeps the draft if sending fails. */
export function ReplyBar({ parentId, kind }: { parentId: string; kind: CommunityKind }) {
  const create = useCreateCommunityPost();
  const { ensureMember, signedIn } = useCommunityGate();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return <Button title="Join to reply" variant="secondary" onPress={() => ensureMember()} />;
  }

  const send = () => {
    if (!ensureMember()) return;
    const checked = validateCommunityBody(body);
    if (!checked.ok) {
      setError(checked.message);
      return;
    }
    setError(null);
    create.mutate(
      { kind, body: checked.body, parentId },
      {
        onSuccess: () => {
          setBody("");
          if (process.env.EXPO_OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: (cause) => setError(isApiError(cause) ? (cause.fields?.body ?? cause.message) : "Could not send that reply."),
      },
    );
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <TextField
        label="Reply"
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={COMMUNITY_BODY_MAX}
        showCount
        placeholder="Say something kind…"
        textAlignVertical="top"
        style={{ minHeight: 80 }}
        error={error}
        editable={!create.isPending}
      />
      <Button
        title="Reply"
        tone="teal"
        loading={create.isPending}
        disabled={body.trim().length === 0}
        onPress={send}
      />
    </View>
  );
}
