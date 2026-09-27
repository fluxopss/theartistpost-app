import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import type { EventDTO } from "@/api/types";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { appCopy } from "@/content/site";
import { easternDayKey, eventsByEasternDay, monthMatrix } from "@/domain/schedule/calendar";
import { minTapTarget, radius, spacing, spark, useBrandColors } from "@/theme";

import { EventList } from "./event-list";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DOT = 6;

// Cells are Hacienda (Eastern) calendar days encoded as UTC midnights, so
// every formatter reads them back in UTC.
const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const dayTitle = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

type YearMonth = { year: number; month0: number };

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month0: m - 1, day: d };
}

function utcDate(key: string) {
  const { year, month0, day } = parseKey(key);
  return new Date(Date.UTC(year, month0, day));
}

function tick() {
  if (process.env.EXPO_OS === "ios") Haptics.selectionAsync();
}

/** A Hacienda-time month grid. Days with a night carry a gold dot. */
export function MonthView({ events }: { events: EventDTO[] }) {
  const palette = useBrandColors();
  const byDay = useMemo(() => eventsByEasternDay(events), [events]);
  const todayKey = easternDayKey(new Date().toISOString());
  const firstKey = events[0] ? easternDayKey(events[0].start) : todayKey;

  const [cursor, setCursor] = useState<YearMonth>(() => {
    const { year, month0 } = parseKey(firstKey);
    return { year, month0 };
  });
  const [selected, setSelected] = useState(firstKey);

  const weeks = useMemo(() => monthMatrix(cursor.year, cursor.month0), [cursor]);
  const selectedEvents = byDay.get(selected) ?? [];
  const selectedTitle = dayTitle.format(utcDate(selected));

  const shift = (delta: number) => {
    tick();
    setCursor(({ year, month0 }) => {
      const next = new Date(Date.UTC(year, month0 + delta, 1));
      return { year: next.getUTCFullYear(), month0: next.getUTCMonth() };
    });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View
        style={{
          backgroundColor: palette.bgElevated,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          padding: spacing.sm,
          gap: spacing.xs,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MonthArrow direction="previous" onPress={() => shift(-1)} />
          <ThemedText variant="headline" accessibilityRole="header" style={{ flex: 1, textAlign: "center" }}>
            {monthTitle.format(new Date(Date.UTC(cursor.year, cursor.month0, 1)))}
          </ThemedText>
          <MonthArrow direction="next" onPress={() => shift(1)} />
        </View>

        <View style={{ flexDirection: "row" }} importantForAccessibility="no-hide-descendants">
          {WEEKDAYS.map((d, i) => (
            <ThemedText
              key={`${d}-${i}`}
              variant="caption"
              tone="muted"
              style={{ flex: 1, textAlign: "center" }}
            >
              {d}
            </ThemedText>
          ))}
        </View>

        {weeks.map((week) => (
          <View key={week[0].key} style={{ flexDirection: "row" }}>
            {week.map((cell, i) => {
              const count = byDay.get(cell.key)?.length ?? 0;
              const isSelected = cell.key === selected;
              const isToday = cell.key === todayKey;
              return (
                <Pressable
                  key={cell.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${WEEKDAY_NAMES[i]}, ${dayTitle.format(utcDate(cell.key))}${
                    count ? `, ${count === 1 ? "1 night" : `${count} nights`}` : ""
                  }${isToday ? ", today" : ""}`}
                  onPress={() => {
                    tick();
                    setSelected(cell.key);
                    if (!cell.inMonth) {
                      const { year, month0 } = parseKey(cell.key);
                      setCursor({ year, month0 });
                    }
                  }}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 2 }}
                >
                  <View
                    style={{
                      width: minTapTarget,
                      height: minTapTarget,
                      borderRadius: radius.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? palette.accent : "transparent",
                      borderWidth: isToday && !isSelected ? 1.5 : 0,
                      borderColor: palette.accent,
                    }}
                  >
                    <ThemedText
                      variant={isSelected ? "headline" : "callout"}
                      tone={isSelected ? "onAccent" : cell.inMonth ? "default" : "muted"}
                      style={{ fontVariant: ["tabular-nums"], opacity: cell.inMonth ? 1 : 0.5 }}
                    >
                      {cell.day}
                    </ThemedText>
                    <View
                      style={{
                        position: "absolute",
                        bottom: 5,
                        width: DOT,
                        height: DOT,
                        borderRadius: DOT / 2,
                        backgroundColor: count ? (isSelected ? palette.onAccent : spark.gold) : "transparent",
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {selectedEvents.length ? (
        <EventList events={selectedEvents} header={selectedTitle} />
      ) : (
        <View style={{ gap: spacing.xxs, paddingHorizontal: spacing.xs }}>
          <ThemedText variant="subheadline">{selectedTitle}</ThemedText>
          <ThemedText variant="footnote" tone="muted">
            {appCopy.scheduleDayEmpty}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function MonthArrow({ direction, onPress }: { direction: "previous" | "next"; onPress: () => void }) {
  const palette = useBrandColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === "previous" ? "Previous month" : "Next month"}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTapTarget,
        height: minTapTarget,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        backgroundColor: pressed ? palette.bgPressed : "transparent",
      })}
    >
      <Icon
        name={direction === "previous" ? "chevronLeft" : "chevronRight"}
        size={16}
        weight="semibold"
        color={palette.accentText}
      />
    </Pressable>
  );
}
