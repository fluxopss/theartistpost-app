import { Pressable, View } from "react-native";

import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/**
 * A night on the schedule: date block, title, time and venue, status. Rows
 * group on a shared surface with hairlines (see ListGroup).
 */
export function EventRow({
  month,
  day,
  weekday,
  title,
  time,
  venue,
  status,
  statusTone = "muted",
  onPress,
  separator = true,
}: {
  month: string;
  day: string;
  weekday: string;
  title: string;
  time: string;
  venue: string;
  status?: string;
  statusTone?: "muted" | "live" | "accent";
  onPress?: () => void;
  separator?: boolean;
}) {
  const palette = useBrandColors();
  const statusColor =
    statusTone === "live"
      ? palette.success
      : statusTone === "accent"
        ? palette.accentText
        : palette.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${weekday} ${month} ${day}, ${time}. ${venue}.${status ? ` ${status}.` : ""}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: pressed ? palette.bgPressed : "transparent",
      })}
    >
      <View
        style={{
          width: 52,
          alignItems: "center",
          paddingVertical: spacing.xs,
          borderRadius: radius.md,
          borderCurve: "continuous",
          backgroundColor: palette.accentSoft,
        }}
      >
        <ThemedText variant="caption" tone="accent" style={{ textTransform: "uppercase" }}>
          {month}
        </ThemedText>
        <ThemedText variant="title2" style={{ fontVariant: ["tabular-nums"] }}>
          {day}
        </ThemedText>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "stretch",
          gap: spacing.xs,
          paddingVertical: spacing.md,
          borderBottomWidth: separator ? 0.5 : 0,
          borderBottomColor: palette.separator,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          {status ? (
            <ThemedText variant="eyebrow" style={{ color: statusColor }}>
              {status}
            </ThemedText>
          ) : null}
          <ThemedText variant="headline" numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
            {weekday} · {time} · {venue}
          </ThemedText>
        </View>
        {onPress ? (
          <Icon name="chevronRight" size={14} color={palette.textMuted} weight="semibold" />
        ) : null}
      </View>
    </Pressable>
  );
}
