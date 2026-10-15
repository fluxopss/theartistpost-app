import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useCheckIn, useCheckInState } from "@/api/hooks";
import type { EventDTO } from "@/api/types";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { checkedInMomentBody, checkInResultLine, checkInUi } from "@/domain/events/check-in";
import { formatNightWhen } from "@/domain/night/program";
import { radius, spacing, useBrandColors } from "@/theme";
import { readLocationOnce } from "@/utils/location";

/**
 * “I’m here.” Location is opt-in and used once: the server compares one
 * reading to the venue and keeps only the time and a yes/no. Without
 * permission a manual check-in is recorded as unverified.
 */
export function EventCheckInCard({ event }: { event: EventDTO }) {
  const palette = useBrandColors();
  const state = useCheckInState(event.id, event.source === "db");
  const checkIn = useCheckIn(event.id);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const ui = checkInUi(event, state.data);
  if (state.isPending && event.source === "db") return null;
  if (ui.kind === "unavailable" || ui.kind === "closed") return null;

  const send = async (useLocation: boolean) => {
    setNote(null);
    let body: { lat?: number; lng?: number; accuracyM?: number | null } = {};
    if (useLocation) {
      const result = await readLocationOnce();
      if (result.kind === "reading") {
        body = { lat: result.reading.lat, lng: result.reading.lng, accuracyM: result.reading.accuracyM };
      } else {
        setNote(
          result.kind === "denied"
            ? "No location, no problem — we’ll check you in without it."
            : "We couldn’t get a location reading, so we’ll check you in without it.",
        );
      }
    }
    try {
      await checkIn.mutateAsync(body);
      setAsking(false);
      if (process.env.EXPO_OS === "ios") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setNote(isApiError(error) ? error.message : "Couldn’t check you in. Try again in a moment.");
    }
  };

  const shell = {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.separator,
  };

  if (ui.kind === "done") {
    return (
      <View style={shell} accessibilityLiveRegion="polite">
        <View style={{ flexDirection: "row", gap: spacing.xs, alignItems: "center" }}>
          <Icon name="checkCircle" size={22} color={palette.success} />
          <ThemedText variant="headline" style={{ flex: 1 }}>
            {checkInResultLine(ui.verified)}
          </ThemedText>
        </View>
        <Button
          title="Share a moment"
          variant="secondary"
          icon="sparkle"
          onPress={() =>
            router.push({
              pathname: "/compose-community",
              params: { kind: "UPDATE", body: checkedInMomentBody(event.title) },
            })
          }
        />
      </View>
    );
  }

  if (ui.kind === "not-open") {
    const opens = formatNightWhen({ start: ui.opensAt, end: ui.opensAt });
    return (
      <View style={shell}>
        <ThemedText variant="headline">Check-in opens with the doors</ThemedText>
        <ThemedText variant="subheadline" tone="muted">
          From {opens.time} you can tap “I’m here” so the house knows you made it.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={shell}>
      <ThemedText variant="headline">Made it?</ThemedText>
      {asking ? (
        <>
          <ThemedText variant="body">
            {ui.venueHasLocation
              ? "We can confirm you’re at the house using your location, once, right now. We don’t keep it or track you — only that you were here."
              : "Tap to let the house know you’re here."}
          </ThemedText>
          {ui.venueHasLocation ? (
            <Button
              title="Use my location"
              tone="teal"
              icon="mapPin"
              loading={checkIn.isPending}
              onPress={() => void send(true)}
            />
          ) : null}
          <Button
            title={ui.venueHasLocation ? "Check in without location" : "I’m here"}
            variant={ui.venueHasLocation ? "secondary" : "primary"}
            loading={checkIn.isPending && !ui.venueHasLocation}
            disabled={checkIn.isPending}
            onPress={() => void send(false)}
          />
        </>
      ) : (
        <Button title="I’m here" tone="teal" icon="check" onPress={() => setAsking(true)} />
      )}
      {note ? (
        <ThemedText variant="footnote" tone="muted" accessibilityRole="alert">
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}
