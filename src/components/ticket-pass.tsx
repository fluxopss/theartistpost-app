import type { ReactNode } from "react";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { fonts, paper, radius, shadows, spacing } from "@/theme";

export type TicketWhen = {
  weekday: string;
  month: string;
  day: string;
  time: string;
  endTime?: string;
};

/**
 * The night pass — a paper ticket that keeps its paper colors in both
 * schemes. `teaser` is the Home "opening door"; `pass` is the full ticket.
 */
export function TicketPass({
  variant = "pass",
  title,
  venue,
  when,
  stamp,
  holder,
  code,
  footer,
  onPress,
  style,
}: {
  variant?: "teaser" | "pass";
  title: string;
  venue: string;
  when: TicketWhen;
  stamp: string;
  holder?: string;
  code?: string;
  footer?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = paper.ticket;
  const isPass = variant === "pass";
  const label = `${stamp}. ${title}, ${when.weekday} ${when.month} ${when.day}, ${when.time}. ${venue}.${
    code ? ` Pass ${code}.` : ""
  }`;

  const body = (
    <View
      style={[
        {
          flexDirection: "row",
          backgroundColor: t.bg,
          borderRadius: radius.xl,
          borderCurve: "continuous",
          boxShadow: shadows.ticket,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {/* Date stub */}
      <View
        style={{
          width: isPass ? 96 : 84,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: spacing.lg,
          gap: 2,
          borderRightWidth: 2,
          borderRightColor: t.perforation,
          borderStyle: "dashed",
        }}
      >
        <ThemedText variant="eyebrow" style={{ color: t.stamp }}>
          {when.weekday}
        </ThemedText>
        <ThemedText
          variant="title1"
          style={{ color: t.ink, fontVariant: ["tabular-nums"] }}
        >
          {when.day}
        </ThemedText>
        <ThemedText variant="caption" style={{ color: t.muted, textTransform: "uppercase" }}>
          {when.month}
        </ThemedText>
      </View>

      {/* Face */}
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.xs }}>
        <View
          style={{
            alignSelf: "flex-start",
            borderWidth: 2,
            borderColor: t.stamp,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            transform: [{ rotate: "-3deg" }],
          }}
        >
          <ThemedText variant="eyebrow" style={{ color: t.stamp }}>
            {stamp}
          </ThemedText>
        </View>
        <ThemedText
          variant={isPass ? "title2" : "title3"}
          style={{ color: t.ink, fontFamily: fonts.display }}
          numberOfLines={3}
        >
          {title}
        </ThemedText>
        <ThemedText variant="footnote" style={{ color: t.muted }}>
          {when.time}
          {when.endTime ? ` – ${when.endTime}` : ""} · {venue}
        </ThemedText>
        {isPass && (holder || code) ? (
          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xs }}>
            {holder ? (
              <View style={{ flex: 1 }}>
                <ThemedText variant="caption" style={{ color: t.muted }}>
                  HOLDER
                </ThemedText>
                <ThemedText variant="headline" style={{ color: t.ink }} numberOfLines={1}>
                  {holder}
                </ThemedText>
              </View>
            ) : null}
            {code ? (
              <View>
                <ThemedText variant="caption" style={{ color: t.muted }}>
                  PASS
                </ThemedText>
                <ThemedText
                  variant="headline"
                  selectable
                  style={{ color: t.tealInk, fontVariant: ["tabular-nums"] }}
                >
                  {code}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}
        {footer}
      </View>
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      {body}
    </Pressable>
  );
}
