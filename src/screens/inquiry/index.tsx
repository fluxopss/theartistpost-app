import { SegmentedControl } from "@expo/ui/community/segmented-control";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  BackHandler,
  Keyboard,
  StyleSheet,
  type TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import { useInvolve } from "@/api/hooks";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { doorById } from "@/content/involve";
import { copy } from "@/content/site";
import { INVOLVE_INTENTS, type InvolveIntent } from "@/domain/involve/intents";
import { involveInquirySchema } from "@/domain/involve/validation";
import { screenMargin, spacing, type, useBrandColors, useBrandScheme } from "@/theme";

import { InquiryBar } from "./inquiry-bar";
import { InquirySuccess } from "./inquiry-success";
import { SendError } from "./send-error";
import { useRetryCountdown } from "./use-retry-countdown";

type Field = "name" | "email" | "phone" | "medium" | "city" | "message";
type Draft = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: readonly Field[] = ["name", "email", "phone", "medium", "city", "message"];
const EMPTY_DRAFT: Draft = { name: "", email: "", phone: "", medium: "", city: "", message: "" };
const INTENT_LABELS: Record<InvolveIntent, string> = {
  space: "Space",
  partner: "Partner",
  volunteer: "Volunteer",
};
/** Mirrors the max lengths in `involveInquirySchema`, so input stops where the server would. */
const MAX: Record<Field, number> = { name: 80, email: 120, phone: 40, medium: 40, city: 80, message: 800 };
/** The message box opens five lines tall and grows with what's written. */
const MESSAGE_MIN_HEIGHT = type.body.lineHeight * 5 + spacing.sm * 2;

const ios = process.env.EXPO_OS === "ios";

function isField(key: unknown): key is Field {
  return typeof key === "string" && (FIELDS as readonly string[]).includes(key);
}

function isIntent(value: unknown): value is InvolveIntent {
  return typeof value === "string" && (INVOLVE_INTENTS as readonly string[]).includes(value);
}

/**
 * "Tell us how you want to show up." A header-less modal: its own top bar,
 * a keyboard-aware form, and a send button that rides above the keyboard.
 * A failed send keeps every word; a dirty draft can't be swiped away.
 */
export function InquiryScreen() {
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ intent?: string }>();
  const involve = useInvolve();
  const retry = useRetryCountdown();

  const [intent, setIntent] = useState<InvolveIntent>(() => (isIntent(params.intent) ? params.intent : "space"));
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [footerHeight, setFooterHeight] = useState(0);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const mediumRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const sent = involve.isSuccess;
  const sending = involve.isPending;
  const dirty = !sent && FIELDS.some((f) => draft[f].trim().length > 0);

  const edit = (field: Field) => (value: string) => {
    setDraft((d) => ({ ...d, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  /** Event-handler only: moves focus to a field (next-field chaining, first error). */
  const focusField = (field: Field) => {
    const target = {
      name: nameRef,
      email: emailRef,
      phone: phoneRef,
      medium: mediumRef,
      city: cityRef,
      message: messageRef,
    }[field];
    target.current?.focus();
  };

  const dismiss = () => {
    if (!dirty) {
      router.back();
      return;
    }
    Alert.alert("Discard your message?", "What you’ve written here will be lost.", [
      { text: "Keep Editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  // Android's back button gets the same guard the iOS sheet gets from
  // `gestureEnabled: false` below.
  useEffect(() => {
    if (ios || !dirty) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      dismiss();
      return true;
    });
    return () => sub.remove();
  });

  const submit = () => {
    if (sending || retry.remaining > 0) return;

    const parsed = involveInquirySchema.safeParse({ ...draft, intent, website: "" });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (isField(key) && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const first = FIELDS.find((f) => next[f]);
      if (first) {
        focusField(first);
        AccessibilityInfo.announceForAccessibility(next[first] ?? "");
      }
      if (ios) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setErrors({});
    Keyboard.dismiss();
    const data = parsed.data;
    involve.mutate(
      {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        intent: data.intent,
        medium: data.medium || undefined,
        city: data.city || undefined,
        message: data.message,
        website: "",
        platform: ios ? "ios" : "android",
      },
      {
        onSuccess: () => {
          if (ios) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility(copy.involve.success);
        },
        onError: (error) => {
          if (ios) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          AccessibilityInfo.announceForAccessibility(
            isApiError(error) && error.offline ? "You’re offline. Your message is still here." : error.message,
          );
          if (!isApiError(error)) return;
          if (error.code === "rate_limited" && error.retryAfterSec) retry.start(error.retryAfterSec);
          if (error.code === "validation_failed" && error.fields) {
            const fromServer: FieldErrors = {};
            for (const [key, message] of Object.entries(error.fields)) {
              if (isField(key)) fromServer[key] = message;
            }
            setErrors(fromServer);
          }
        },
      },
    );
  };

  const failure = involve.error;
  const offline = isApiError(failure) && failure.offline;
  const rateLimited = isApiError(failure) && failure.code === "rate_limited" && Boolean(failure.retryAfterSec);
  const sendError = !failure
    ? null
    : offline
      ? "You’re offline. Your message is still here — reconnect and send it again."
      : rateLimited
        ? retry.remaining > 0
          ? `Too many sends in a row. You can try again in ${retry.remaining}s.`
          : "You can send it again now."
        : isApiError(failure) && failure.code === "validation_failed" && failure.fields
          ? "A few fields need another look."
          : failure.message;

  const sentIntent = involve.variables?.intent ?? intent;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <InquiryBar title={copy.involve.title} onDismiss={sent ? undefined : dismiss} />

      <KeyboardAwareScrollView
        // The sticky footer is extra keyboard chrome: keep the focused field above it.
        bottomOffset={Math.max(footerHeight - insets.bottom, 0) + spacing.md}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // The top bar and footer own the safe areas; don't inset twice.
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ padding: screenMargin, paddingBottom: spacing.xxl, gap: spacing.lg }}
      >
        {sent ? (
          <InquirySuccess intent={sentIntent} />
        ) : (
          <>
            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="eyebrow" tone="spark-coral">
                {copy.involve.kicker}
              </ThemedText>
              <ThemedText variant="title1" accessibilityRole="header">
                {copy.involve.formTitle}
              </ThemedText>
              <ThemedText variant="callout" tone="muted">
                {copy.involve.formBody}
              </ThemedText>
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="subheadline">Your door</ThemedText>
              <SegmentedControl
                values={INVOLVE_INTENTS.map((i) => INTENT_LABELS[i])}
                selectedIndex={INVOLVE_INTENTS.indexOf(intent)}
                onChange={(event) => {
                  const next = INVOLVE_INTENTS[event.nativeEvent.selectedSegmentIndex];
                  if (next) setIntent(next);
                }}
                enabled={!sending}
                appearance={scheme}
                tintColor={palette.accent}
              />
              <ThemedText variant="footnote" tone="muted">
                {doorById(intent).summary}
              </ThemedText>
            </View>

            <TextField
              ref={nameRef}
              label="Name"
              value={draft.name}
              onChangeText={edit("name")}
              error={errors.name}
              maxLength={MAX.name}
              editable={!sending}
              textContentType="name"
              autoComplete="name"
              autoCapitalize="words"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focusField("email")}
            />
            <TextField
              ref={emailRef}
              label="Email"
              value={draft.email}
              onChangeText={edit("email")}
              error={errors.email}
              maxLength={MAX.email}
              editable={!sending}
              placeholder="you@example.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focusField("phone")}
            />
            <TextField
              ref={phoneRef}
              label="Phone (optional)"
              value={draft.phone}
              onChangeText={edit("phone")}
              error={errors.phone}
              maxLength={MAX.phone}
              editable={!sending}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focusField("medium")}
            />
            <TextField
              ref={mediumRef}
              label="Medium (optional)"
              value={draft.medium}
              onChangeText={edit("medium")}
              error={errors.medium}
              maxLength={MAX.medium}
              editable={!sending}
              placeholder="Music, photography, dance…"
              autoCapitalize="sentences"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focusField("city")}
            />
            <TextField
              ref={cityRef}
              label="City (optional)"
              value={draft.city}
              onChangeText={edit("city")}
              error={errors.city}
              maxLength={MAX.city}
              editable={!sending}
              textContentType="addressCity"
              autoComplete="postal-address-locality"
              autoCapitalize="words"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focusField("message")}
            />
            <TextField
              ref={messageRef}
              label="Message"
              value={draft.message}
              onChangeText={edit("message")}
              error={errors.message}
              helper="At least 8 characters."
              maxLength={MAX.message}
              showCount
              editable={!sending}
              placeholder="Tell us a little about how you want to show up."
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              style={{ minHeight: MESSAGE_MIN_HEIGHT }}
            />
          </>
        )}
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <View
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
          style={{
            gap: spacing.sm,
            paddingHorizontal: screenMargin,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.sm,
            backgroundColor: palette.bg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.separator,
          }}
        >
          {sent ? (
            <Button
              title="Done"
              variant={sentIntent === "space" ? "secondary" : "primary"}
              tone="teal"
              size="lg"
              onPress={() => router.back()}
            />
          ) : (
            <>
              {sendError ? <SendError message={sendError} offline={offline} /> : null}
              <Button
                title="Send to Robbie"
                tone="coral"
                size="lg"
                icon="email"
                loading={sending}
                disabled={retry.remaining > 0}
                accessibilityHint="Sends your message to The Artist Post"
                onPress={submit}
              />
            </>
          )}
        </View>
      </KeyboardStickyView>

      <Stack.Screen options={{ gestureEnabled: !dirty }} />
    </View>
  );
}
