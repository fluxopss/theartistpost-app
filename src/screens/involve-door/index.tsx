import { router, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { doorById, isInvolveDoorId } from "@/content/involve";
import { copy } from "@/content/site";
import { spacing } from "@/theme";

import { DoorPlate } from "./door-plate";
import { DoorWorld } from "./door-world";

/**
 * A door's own world: its picture, its story, and the one move it asks for.
 * The door's name lives in the navigation bar; the body opens on its
 * invitation instead of repeating the title.
 */
export function InvolveDoorScreen() {
  const { door: doorParam } = useLocalSearchParams<{ door: string }>();

  if (!isInvolveDoorId(doorParam)) {
    return (
      <>
        <ScreenScroll>
          <EmptyState
            icon="door"
            title="This door isn’t here"
            body="The link may be out of date. Every open door is one step back."
            action={
              <Button
                title="See the five doors"
                variant="secondary"
                onPress={() => router.replace("/get-involved")}
              />
            }
          />
        </ScreenScroll>
        <Stack.Screen options={{ title: copy.involve.title }} />
      </>
    );
  }

  const door = doorById(doorParam);

  return (
    <>
      <ScreenScroll>
        <View style={{ gap: spacing.lg }}>
          <DoorPlate door={door} />
          <View style={{ gap: spacing.xs }}>
            <ThemedText variant="eyebrow" tone={`spark-${door.spark}`}>
              {door.index} · {door.kicker}
            </ThemedText>
            <ThemedText variant="title2" accessibilityRole="header">
              {door.invitation}
            </ThemedText>
            <ThemedText variant="body" tone="muted">
              {door.detail}
            </ThemedText>
          </View>
        </View>

        <DoorWorld door={door} />
      </ScreenScroll>
      <Stack.Screen options={{ title: door.title }} />
    </>
  );
}
