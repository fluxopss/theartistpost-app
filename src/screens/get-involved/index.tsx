import { router, Stack } from "expo-router";
import { View } from "react-native";

import { DoorCard } from "@/components/door-card";
import { MantraStrip } from "@/components/mantra-strip";
import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { involveDoors } from "@/content/involve";
import { copy } from "@/content/site";
import { spacing } from "@/theme";

/**
 * The five doors. The task (pick a door) leads; the mantra closes the room
 * instead of standing between the visitor and the doors.
 */
export function GetInvolvedScreen() {
  return (
    <>
      <ScreenScroll>
        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="eyebrow" tone="spark-coral">
            {copy.involve.kicker}
          </ThemedText>
          <ThemedText variant="title3">{copy.involve.lead}</ThemedText>
        </View>

        <View style={{ gap: spacing.sm }}>
          {involveDoors.map((door, i) => (
            <DoorCard
              key={door.id}
              index={i + 1}
              eyebrow={door.kicker}
              title={door.title}
              body={door.summary}
              tone={door.spark}
              cta={copy.house.enter}
              onPress={() => router.push({ pathname: "/get-involved/[door]", params: { door: door.id } })}
            />
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <MantraStrip />
          <ThemedText variant="eyebrow" tone="spark-violet">
            {copy.involve.shine}
          </ThemedText>
        </View>
      </ScreenScroll>
      <Stack.Screen
        options={{ title: copy.involve.title, headerLargeTitleEnabled: process.env.EXPO_OS === "ios" }}
      />
    </>
  );
}
