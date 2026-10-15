import { Alert, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useBlocks, useUnblock } from "@/api/hooks";
import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ListGroup, ListRow } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";

/** Settings: the people you have blocked, with a way to unblock. Members only. */
export function BlockedGroup() {
  const { user } = useAuth();
  if (!user) return null;
  return <BlockedList />;
}

function BlockedList() {
  const query = useBlocks();
  const unblock = useUnblock();
  const blocks = query.data;

  const confirmUnblock = (handle: string, name: string) => {
    Alert.alert(
      `Unblock ${name}?`,
      `@${handle} will be able to see your posts and profile again. Follows are not restored.`,
      [
        { text: "Keep blocked", style: "cancel" },
        {
          text: "Unblock",
          onPress: () => {
            unblock.mutate(handle, {
              onError: (cause) =>
                Alert.alert(
                  "Could not unblock",
                  isApiError(cause) ? cause.message : "Try again in a moment.",
                ),
            });
          },
        },
      ],
    );
  };

  return (
    <ListGroup
      header="Blocked"
      footer="Blocked people can’t see your posts, notes or profile, and you won’t see theirs."
    >
      {query.isError ? (
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <ThemedText variant="subheadline" tone="danger">
            Could not load your blocked list.
          </ThemedText>
          <Button title="Try again" variant="secondary" onPress={() => void query.refetch()} />
        </View>
      ) : blocks === undefined ? null : blocks.length === 0 ? (
        <View style={{ padding: spacing.md }}>
          <ThemedText variant="subheadline" tone="muted">
            You haven’t blocked anyone.
          </ThemedText>
        </View>
      ) : (
        blocks.map((person, index) => (
          <ListRow
            key={person.id}
            title={person.name}
            subtitle={`@${person.handle}`}
            value="Unblock"
            showChevron={false}
            separator={index < blocks.length - 1}
            accessibilityHint={`Unblocks @${person.handle}`}
            onPress={() => confirmUnblock(person.handle, person.name)}
          />
        ))
      )}
    </ListGroup>
  );
}
