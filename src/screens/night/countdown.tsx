import { useEffect, useState } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { countdownParts } from "@/domain/night/program";
import { radius, spacing, useBrandColors } from "@/theme";

const TICK_MS = 30_000;

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** Days · hours · minutes until doors. Hides itself once the night starts. */
export function Countdown({ start }: { start: string }) {
  const palette = useBrandColors();
  const parts = countdownParts(start, useNow(TICK_MS));
  if (!parts) return null;

  const cells = [
    { value: parts.days, unit: parts.days === 1 ? "day" : "days" },
    { value: parts.hours, unit: parts.hours === 1 ? "hr" : "hrs" },
    { value: parts.minutes, unit: "min" },
  ];

  return (
    <View
      accessible
      accessibilityLabel={`Doors in ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes`}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: "row", gap: spacing.xs }}
    >
      {cells.map((cell) => (
        <View
          key={cell.unit}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            borderCurve: "continuous",
            backgroundColor: palette.bgElevated,
          }}
        >
          <ThemedText variant="counter">{cell.value}</ThemedText>
          <ThemedText variant="caption" tone="muted">
            {cell.unit}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}
