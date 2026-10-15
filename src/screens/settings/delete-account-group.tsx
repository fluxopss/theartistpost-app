import { router, type Href } from "expo-router";
import { AccessibilityInfo, View } from "react-native";
import { useState } from "react";

import { isApiError } from "@/api/errors";
import { queryClient } from "@/api/query-client";
import { useDeleteAccount } from "@/api/hooks";
import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ListGroup, ListRow } from "@/components/list-row";
import { TextField } from "@/components/text-field";
import { tabRoutes } from "@/utils/links";
import { spacing } from "@/theme";

const CONFIRM_WORD = "DELETE";

/** Settings: delete the account. Type DELETE to confirm; then sign out and clear. */
export function DeleteAccountGroup() {
  const { user } = useAuth();
  if (!user) return null;
  return <DeleteAccount />;
}

function DeleteAccount() {
  const { signOut } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const confirmed = typed.trim() === CONFIRM_WORD;

  const remove = async () => {
    if (!confirmed) return;
    setError(null);
    try {
      await deleteAccount.mutateAsync();
    } catch (cause) {
      setError(isApiError(cause) ? cause.message : "Could not delete your account. Try again.");
      return;
    }
    await signOut();
    queryClient.clear();
    AccessibilityInfo.announceForAccessibility("Your account was deleted.");
    router.replace(tabRoutes.home as Href);
  };

  return (
    <ListGroup
      header="Delete account"
      footer="Deleting your account removes your profile, follows, community posts, notifications and blocks. It can’t be undone."
    >
      {open ? (
        <View style={{ padding: spacing.md, gap: spacing.md }}>
          <TextField
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            error={error}
            editable={!deleteAccount.isPending}
          />
          <Button
            title={deleteAccount.isPending ? "Deleting…" : "Delete my account"}
            variant="destructive"
            disabled={!confirmed || deleteAccount.isPending}
            loading={deleteAccount.isPending}
            onPress={() => void remove()}
          />
          <Button title="Keep my account" variant="ghost" onPress={() => setOpen(false)} />
        </View>
      ) : (
        <ListRow
          icon="trash"
          destructive
          title="Delete my account"
          subtitle="Type DELETE to confirm"
          showChevron={false}
          separator={false}
          onPress={() => setOpen(true)}
        />
      )}
    </ListGroup>
  );
}
