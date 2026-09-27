import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/components/icon";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { floorWalked, nextLitRooms } from "@/domain/night/play";
import type { FloorBeat } from "@/domain/night/program";
import { inkOnSpark, radius, shadows, spacing, spark, useBrandColors } from "@/theme";

const LAMP = 36;

/** The rooms of the night. Tap a room to light it; this phone remembers the walk. */
export function FloorRooms({
  rooms,
  lit,
  onChange,
}: {
  rooms: FloorBeat[];
  lit: string[];
  onChange: (next: string[]) => void;
}) {
  const palette = useBrandColors();
  const walked = floorWalked(lit, rooms);

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader eyebrow="The floor" eyebrowTone="spark-gold" title="Walk the room" />
      <ThemedText variant="subheadline" tone={walked ? "success" : "muted"} accessibilityLiveRegion="polite">
        {walked ? copy.night.floorDone : copy.night.floorLead}
      </ThemedText>
      <View
        style={{
          backgroundColor: palette.bgElevated,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
      >
        {rooms.map((room, i) => {
          const on = lit.includes(room.id);
          return (
            <Pressable
              key={room.id}
              accessibilityRole="switch"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${room.kicker}: ${room.title}. ${room.body}`}
              onPress={() => {
                void Haptics.impactAsync(on ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
                onChange(nextLitRooms(lit, room.id));
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                gap: spacing.md,
                paddingLeft: spacing.md,
                backgroundColor: pressed ? palette.bgPressed : "transparent",
              })}
            >
              <View style={{ paddingTop: spacing.md }}>
                <View
                  style={{
                    width: LAMP,
                    height: LAMP,
                    borderRadius: LAMP / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: on ? spark.gold : palette.bgPressed,
                    boxShadow: on ? shadows.glow : undefined,
                  }}
                >
                  <Icon name={on ? "sparkle" : "door"} size={16} color={on ? inkOnSpark : palette.textMuted} />
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  gap: 2,
                  paddingVertical: spacing.md,
                  paddingRight: spacing.md,
                  borderBottomWidth: i < rooms.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: palette.separator,
                }}
              >
                <ThemedText variant="eyebrow" tone={on ? "spark-gold" : "muted"}>
                  {room.kicker}
                </ThemedText>
                <ThemedText variant="headline">{room.title}</ThemedText>
                <ThemedText variant="footnote" tone="muted">
                  {room.body}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
