import { useState } from "react";
import { View } from "react-native";

import { useSubscribe } from "@/api/hooks";
import { isApiError } from "@/api/errors";
import { Button } from "@/components/button";
import { SectionHeader } from "@/components/section-header";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { parseSubscribeEmail } from "@/domain/app/subscribe";
import { spacing } from "@/theme";

/** Newsletter sign-up. Keeps the typed email if sending fails. */
export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const subscribe = useSubscribe();

  const submit = () => {
    if (subscribe.isPending) return;
    const parsed = parseSubscribeEmail(email);
    if (!parsed.ok) {
      setFieldError(parsed.error);
      return;
    }
    setFieldError(null);
    subscribe.mutate({ email: parsed.email, platform: process.env.EXPO_OS === "ios" ? "ios" : "android" });
  };

  if (subscribe.isSuccess) {
    return (
      <View style={{ gap: spacing.xs }}>
        <SectionHeader eyebrow="Subscribed" eyebrowTone="spark-teal" title="You’re on the list" />
        <ThemedText variant="body" tone="muted">
          We’ll write about showcases, sales, and nights at Hacienda.
        </ThemedText>
      </View>
    );
  }

  const sendError = subscribe.error
    ? isApiError(subscribe.error) && subscribe.error.offline
      ? "You’re offline. Reconnect and try again."
      : subscribe.error.message
    : null;

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader eyebrow="Stay close" eyebrowTone="spark-teal" title={copy.home.subscribeTitle} />
      <ThemedText variant="body" tone="muted">
        {copy.home.subscribeBody}
      </ThemedText>
      <TextField
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (fieldError) setFieldError(null);
        }}
        placeholder="you@example.com"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={submit}
        error={fieldError ?? sendError}
      />
      <Button title="Subscribe" tone="teal" loading={subscribe.isPending} onPress={submit} />
    </View>
  );
}
