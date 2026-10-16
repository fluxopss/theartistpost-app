import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useMyRsvp, useSetRsvp } from "@/api/hooks";
import type { EventDTO, RsvpStatus } from "@/api/types";
import { useAuth } from "@/auth";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { canRsvp, rsvpHeadline, seatSummaryLine } from "@/domain/events/rsvp";
import { useNight } from "@/storage/night";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

const ANSWERS: { status: RsvpStatus; label: string }[] = [
  { status: "GOING", label: "Going" },
  { status: "MAYBE", label: "Maybe" },
  { status: "NOT_GOING", label: "Can’t" },
];
const SEATS = [1, 2, 3, 4, 5, 6];
const ios = process.env.EXPO_OS === "ios";

/**
 * Going / maybe / can’t, with seats. The server keeps the record; the pass on
 * this phone is only a copy of it (see `useNight`).
 */
export function EventRsvpCard({ event }: { event: EventDTO }) {
  const palette = useBrandColors();
  const { user } = useAuth();
  const mine = useMyRsvp(event.id, Boolean(user) && event.source === "db");
  const setRsvp = useSetRsvp(event.id);
  const { savePass, clearPass } = useNight(event.id);
  const [party, setParty] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canRsvp(event)) return null;

  const shell = {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.separator,
  };

  if (!user) {
    return (
      <View style={shell}>
        <ThemedText variant="headline">Hold a seat</ThemedText>
        <ThemedText variant="subheadline" tone="muted">
          Join the house to answer for this night — your seats and pass stay with your account.
        </ThemedText>
        <Button title="Join the house" tone="coral" icon="people" onPress={() => router.push("/join")} />
      </View>
    );
  }

  const rsvp = mine.data?.rsvp ?? null;
  const summary = mine.data?.summary ?? null;
  const seats = party ?? rsvp?.party ?? 1;
  const headline = rsvpHeadline(rsvp);
  const line = seatSummaryLine(summary);

  const answer = (status: RsvpStatus) => {
    setError(null);
    if (ios) void Haptics.selectionAsync();
    setRsvp.mutate(
      { status, party: status === "GOING" ? seats : undefined },
      {
        onSuccess: ({ rsvp: saved }) => {
          if (saved.status === "GOING" && !saved.waitlisted) {
            savePass({
              eventId: event.id,
              name: user.name,
              email: user.email,
              party: saved.party,
              note: saved.note ?? "",
              code: saved.passCode,
              delivered: true,
              savedAt: new Date().toISOString(),
            });
          } else {
            clearPass();
          }
          setParty(null);
        },
        onError: (cause) =>
          setError(isApiError(cause) ? cause.message : "Couldn’t save your answer. Try again in a moment."),
      },
    );
  };

  return (
    <View style={shell}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="headline" accessibilityLiveRegion="polite">
          {headline ?? "Will you be there?"}
        </ThemedText>
        {line ? (
          <ThemedText variant="footnote" tone="muted">
            {line}
          </ThemedText>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", gap: spacing.xs }}>
        {ANSWERS.map(({ status, label }) => {
          const on = rsvp?.status === status;
          return (
            <Pressable
              key={status}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: setRsvp.isPending }}
              accessibilityLabel={label}
              disabled={setRsvp.isPending}
              onPress={() => answer(status)}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: minTapTarget,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.md,
                borderCurve: "continuous",
                borderWidth: on ? 0 : 1,
                borderColor: palette.separatorStrong,
                backgroundColor: on ? palette.accent : pressed ? palette.bgPressed : palette.bg,
                opacity: setRsvp.isPending ? 0.6 : 1,
              })}
            >
              <ThemedText variant="headline" tone={on ? "onAccent" : "default"}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="footnote" tone="muted">
          Seats for “Going”
        </ThemedText>
        <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: spacing.xs }}>
          {SEATS.map((count) => {
            const on = seats === count;
            return (
              <Pressable
                key={count}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={count === 1 ? "1 seat" : `${count} seats`}
                onPress={() => {
                  if (ios) void Haptics.selectionAsync();
                  setParty(count);
                  // Changing seats on an existing “going” answer saves right away.
                  if (rsvp?.status === "GOING" && count !== rsvp.party) {
                    setRsvp.mutate({ status: "GOING", party: count });
                  }
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: minTapTarget,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: radius.md,
                  borderCurve: "continuous",
                  borderWidth: on ? 0 : 1,
                  borderColor: palette.separatorStrong,
                  backgroundColor: on ? palette.accent : pressed ? palette.bgPressed : palette.bg,
                })}
              >
                <ThemedText variant="headline" tone={on ? "onAccent" : "default"}>
                  {count}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
