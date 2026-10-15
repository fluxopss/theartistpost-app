import { router } from "expo-router";
import { View } from "react-native";

import { useSuggestedPeople } from "@/api/hooks";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PersonRow } from "@/components/person-row";
import { ThemedText } from "@/components/themed-text";
import { spacing } from "@/theme";

type Mode = "all" | "following" | "filtered" | "join";

/** Honest empty states for the board; never filler posts. */
export function EmptyBoard({ mode, onCompose }: { mode: Mode; onCompose: () => void }) {
  const suggested = useSuggestedPeople(mode === "following");
  const people = suggested.data?.items ?? [];

  if (mode === "join") {
    return (
      <EmptyState
        icon="people"
        title="Join the house"
        body="Sign in to see posts from the people you follow."
        action={<Button title="Join the house" onPress={() => router.push("/join")} />}
      />
    );
  }

  if (mode === "following") {
    return (
      <View style={{ gap: spacing.md }}>
        <EmptyState
          icon="people"
          title="No one to hear from yet"
          body="Follow a few artists and their posts land here."
        />
        {people.length > 0 ? (
          <View style={{ gap: spacing.xs }}>
            <ThemedText variant="subheadline" accessibilityRole="header">
              People you may like
            </ThemedText>
            {people.map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  if (mode === "filtered") {
    return (
      <EmptyState
        icon="search"
        title="Nothing here yet"
        body="No posts match those filters. Try another kind or topic, or start the conversation."
        action={<Button title="Post to the board" variant="secondary" onPress={onCompose} />}
      />
    );
  }

  return (
    <EmptyState
      icon="sparkle"
      title="The board is quiet"
      body="Be the first to lift someone up."
      action={<Button title="Post to the board" tone="coral" onPress={onCompose} />}
    />
  );
}
