import { router } from "expo-router";
import { View } from "react-native";

import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ListGroup, ListRow } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";

/** Account controls on Studio — join, compose, sign out. */
export function AccountBlock() {
  const { user, canCompose, gate, signOut, lastError, clearError } = useAuth();

  return (
    <View style={{ gap: spacing.sm }}>
      <ListGroup header="Account">
        {!user ? (
          <ListRow
            icon="people"
            title="Join / sign in"
            subtitle="Passwordless member or artist door"
            onPress={() => router.push("/join")}
            separator={false}
          />
        ) : (
          <>
            <ListRow
              icon="studio"
              title={user.email}
              subtitle={
                gate.kind === "artist_pending"
                  ? "Waiting on artist approval"
                  : canCompose
                    ? "Studio open"
                    : "Member pass"
              }
              showChevron={false}
            />
            <ListRow
              icon="people"
              title="Edit your pass"
              subtitle="Display name and studio bio"
              onPress={() => router.push("/settings")}
            />
            {canCompose ? (
              <ListRow
                icon="photo"
                title="Compose a piece"
                subtitle="Photograph, caption, tags, draft or publish"
                onPress={() => router.push("/compose-studio")}
              />
            ) : null}
            <ListRow
              icon="close"
              title="Sign out"
              subtitle="Clears the pass on this phone"
              onPress={() => void signOut()}
              separator={false}
            />
          </>
        )}
      </ListGroup>
      {lastError ? (
        <View style={{ gap: spacing.xs, paddingHorizontal: spacing.md }}>
          <ThemedText variant="footnote" tone="danger">
            {lastError}
          </ThemedText>
          <Button title="Dismiss" variant="ghost" onPress={clearError} />
        </View>
      ) : null}
    </View>
  );
}
