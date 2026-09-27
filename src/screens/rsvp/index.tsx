import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import { useEvent, useRsvp } from "@/api/hooks";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { formatNightWhen, nightPhase } from "@/domain/night/program";
import { parseNightRsvp } from "@/domain/night/rsvp";
import { useNight } from "@/storage/night";
import { useStudio } from "@/storage/studio";
import { minTapTarget, radius, screenMargin, spacing, useBrandColors } from "@/theme";

const SEATS = [1, 2, 3, 4, 5, 6];
const NOTE_MAX = 160;
const ios = process.env.EXPO_OS === "ios";

function sendErrorMessage(error: unknown): string {
  if (!isApiError(error)) return "Could not hold that seat. Try again in a moment.";
  switch (error.code) {
    case "network":
      return "You’re offline. Your details are still here — try again when you’re connected.";
    case "upstream_unavailable":
      return copy.night.device;
    case "rate_limited":
      return error.retryAfterSec
        ? `Too many tries from this network. Try again in ${Math.ceil(error.retryAfterSec / 60)} min.`
        : "Too many tries from this network. Try again in a few minutes.";
    case "validation_failed":
      return Object.values(error.fields ?? {})[0] ?? error.message;
    default:
      return error.message || "Could not hold that seat. Try again in a moment.";
  }
}

/** Hold a seat: name, email, seats, a note for the door. Keeps the draft on any failure. */
export function RsvpScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const event = useEvent(eventId ?? "");
  const { studio, isGuest } = useStudio();
  const { savePass } = useNight(eventId);
  const rsvp = useRsvp();

  const [name, setName] = useState(isGuest ? "" : studio.displayName);
  const [email, setEmail] = useState("");
  const [party, setParty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const night = event.data;
  const closed = night ? nightPhase(night) === "closed" : false;

  const submit = () => {
    if (!eventId || rsvp.isPending) return;
    const parsed = parseNightRsvp({ eventId, name, email, party, note, website: "" });
    if (!parsed.ok) {
      setError(parsed.error);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setError(null);
    rsvp.mutate(
      {
        eventId,
        name: parsed.data.name,
        email: parsed.data.email,
        party: parsed.data.party,
        note: parsed.data.note?.trim() ?? "",
        website: "",
        platform: ios ? "ios" : "android",
      },
      {
        onSuccess: ({ code }) => {
          savePass({
            eventId,
            name: parsed.data.name,
            email: parsed.data.email,
            party: parsed.data.party,
            note: parsed.data.note?.trim() ?? "",
            code,
            delivered: true,
            savedAt: new Date().toISOString(),
          });
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
        onError: (err) => {
          setError(sendErrorMessage(err));
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      },
    );
  };

  if (!eventId || (event.error && !night)) {
    return (
      <View style={{ padding: screenMargin, paddingBottom: insets.bottom + spacing.lg }}>
        <EmptyState
          icon="ticket"
          title="This night isn’t taking seats"
          body="It may have moved or closed. The Night page always has what’s current."
          action={<Button title="Close" variant="secondary" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  const when = night ? formatNightWhen(night) : null;

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={spacing.xl}
      contentContainerStyle={{
        padding: screenMargin,
        paddingTop: spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="eyebrow" tone="spark-coral">
          {copy.night.admit}
        </ThemedText>
        <ThemedText variant="title2" accessibilityRole="header">
          {copy.night.hold}
        </ThemedText>
        {night && when ? (
          <ThemedText variant="subheadline" tone="muted">
            {night.title} · {when.weekday} {when.month} {when.day}, {when.time}
          </ThemedText>
        ) : null}
      </View>

      <TextField
        label="Name on the pass"
        value={name}
        onChangeText={setName}
        textContentType="name"
        autoComplete="name"
        autoCapitalize="words"
        maxLength={80}
        returnKeyType="next"
      />
      <TextField
        label="Email for Robbie"
        value={email}
        onChangeText={setEmail}
        textContentType="emailAddress"
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={120}
      />

      <View style={{ gap: spacing.xs }}>
        <ThemedText variant="subheadline" nativeID="seats-label">
          Seats
        </ThemedText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabelledBy="seats-label"
          style={{ flexDirection: "row", gap: spacing.xs }}
        >
          {SEATS.map((count) => {
            const on = party === count;
            return (
              <Pressable
                key={count}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={count === 1 ? "1 seat" : `${count} seats`}
                onPress={() => {
                  if (ios) void Haptics.selectionAsync();
                  setParty(count);
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
                  backgroundColor: on ? palette.accent : pressed ? palette.bgPressed : palette.bgElevated,
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

      <TextField
        label="A note for the door (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="Coming from the station…"
        maxLength={NOTE_MAX}
        showCount
      />

      {error ? (
        <ThemedText variant="footnote" tone="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}

      <Button
        title={closed ? "This night has closed" : rsvp.isPending ? "Holding…" : copy.night.hold}
        tone="coral"
        size="lg"
        icon="ticket"
        loading={rsvp.isPending}
        disabled={closed || !night}
        onPress={submit}
      />
    </KeyboardAwareScrollView>
  );
}
