import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import { useAcceptTerms, useMe, useUpdateProfile } from "@/api/hooks";
import type { MeDTO } from "@/api/types";
import { useAuth } from "@/auth";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { LegalSectionBlock } from "@/components/legal-section-block";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { TopicPicker } from "@/components/topic-picker";
import { legalDocs } from "@/content/legal";
import { suggestHandle, validateHandle } from "@/domain/people/handle";
import { welcomeSteps, type WelcomeStep } from "@/domain/people/welcome";
import { screenMargin, spacing, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

const titles: Record<WelcomeStep, string> = {
  guidelines: "How we treat each other",
  handle: "Pick your handle",
  topics: "What do you make or love?",
  photo: "Add a face to your name",
};

function finish() {
  router.dismissTo(tabRoutes.community);
}

function GuidelinesStep({ onDone }: { onDone: () => void }) {
  const accept = useAcceptTerms();
  const [error, setError] = useState<string | null>(null);
  const doc = legalDocs.guidelines;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.lg }}>
        {doc.sections.map((section, index) => (
          <LegalSectionBlock key={section.heading ?? `intro-${index}`} section={section} />
        ))}
      </View>
      {error ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
      <Button
        title="I agree to the Community Guidelines"
        tone="coral"
        size="lg"
        loading={accept.isPending}
        onPress={() =>
          accept.mutate(undefined, {
            onSuccess: onDone,
            onError: (cause) => setError(isApiError(cause) ? cause.message : "Could not save that. Try again."),
          })
        }
      />
    </View>
  );
}

function HandleStep({ me, onDone }: { me: MeDTO; onDone: () => void }) {
  const update = useUpdateProfile();
  const [name, setName] = useState(me.user.name);
  const [handle, setHandle] = useState(() => suggestHandle(me.user.name));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const checked = validateHandle(handle);
    if (!checked.ok) {
      setErrors({ handle: checked.message });
      return;
    }
    if (name.trim().length < 2) {
      setErrors({ name: "Name needs at least 2 characters." });
      return;
    }
    setErrors({});
    update.mutate(
      { handle: checked.handle, ...(name.trim() !== me.user.name ? { name: name.trim() } : {}) },
      {
        onSuccess: onDone,
        onError: (cause) =>
          setErrors(
            isApiError(cause) ? (cause.fields ?? { handle: cause.message }) : { handle: "Could not save that. Try again." },
          ),
      },
    );
  };

  return (
    <View style={{ gap: spacing.md }}>
      <TextField label="Name" value={name} onChangeText={setName} maxLength={80} textContentType="name" error={errors.name} />
      <TextField
        label="Handle"
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={40}
        helper="Letters, numbers, _ or -. People @mention you with it."
        error={errors.handle}
      />
      <Button title="Continue" tone="teal" size="lg" loading={update.isPending} onPress={save} />
    </View>
  );
}

function TopicsStep({ onDone }: { onDone: () => void }) {
  const update = useUpdateProfile();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={{ gap: spacing.lg }}>
      <TopicPicker selected={slugs} onChange={setSlugs} />
      {error ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
      <Button
        title={slugs.length > 0 ? "Continue" : "Skip for now"}
        tone="teal"
        size="lg"
        variant={slugs.length > 0 ? "primary" : "secondary"}
        loading={update.isPending}
        onPress={() => {
          if (slugs.length === 0) {
            onDone();
            return;
          }
          update.mutate(
            { topicSlugs: slugs },
            {
              onSuccess: onDone,
              onError: (cause) => setError(isApiError(cause) ? cause.message : "Could not save that. Try again."),
            },
          );
        }}
      />
    </View>
  );
}

function PhotoStep({ me, onDone }: { me: MeDTO; onDone: () => void }) {
  // Read the live profile so the picked photo shows immediately.
  const live = useMe();
  const user = live.data?.user ?? me.user;
  return (
    <View style={{ gap: spacing.lg }}>
      <AvatarPicker url={user.image} name={user.name} />
      <Button
        title={user.image ? "Finish" : "Skip for now"}
        tone="coral"
        size="lg"
        variant={user.image ? "primary" : "secondary"}
        onPress={onDone}
      />
    </View>
  );
}

function WelcomeFlow({ me }: { me: MeDTO }) {
  const insets = useSafeAreaInsets();
  // Freeze the list on entry: finishing a step must not remove it mid-flow.
  const [steps] = useState<WelcomeStep[]>(() => welcomeSteps(me.user));
  const [index, setIndex] = useState(0);
  const step = steps[index];

  useEffect(() => {
    if (steps.length === 0) finish();
  }, [steps]);

  if (!step) return null;
  const next = () => (index + 1 >= steps.length ? finish() : setIndex(index + 1));

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={spacing.xxl}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.xxxl,
        paddingHorizontal: screenMargin,
        gap: spacing.xl,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <ThemedText variant="eyebrow" tone="spark-coral">
          Welcome · Step {index + 1} of {steps.length}
        </ThemedText>
        <Button title="Not now" variant="ghost" onPress={() => router.back()} />
      </View>
      <ThemedText variant="title1" accessibilityRole="header">
        {titles[step]}
      </ThemedText>
      {step === "guidelines" ? <GuidelinesStep onDone={next} /> : null}
      {step === "handle" ? <HandleStep me={me} onDone={next} /> : null}
      {step === "topics" ? <TopicsStep onDone={next} /> : null}
      {step === "photo" ? <PhotoStep me={me} onDone={next} /> : null}
    </KeyboardAwareScrollView>
  );
}

/**
 * Onboarding after join: Guidelines, handle, topics, photo. Shows only the
 * steps this member still needs (an artist already has a handle).
 */
export function WelcomeScreen() {
  const palette = useBrandColors();
  const { user } = useAuth();
  const me = useMe(Boolean(user));

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {!user ? (
        <EmptyState
          icon="people"
          title="Join the house first"
          action={<Button title="Join the house" onPress={() => router.replace("/join")} />}
        />
      ) : me.data ? (
        <WelcomeFlow me={me.data} />
      ) : me.error ? (
        <EmptyState
          icon="warning"
          title="Couldn't load your profile"
          action={<Button title="Try again" variant="secondary" onPress={() => void me.refetch()} />}
        />
      ) : (
        <View style={{ padding: screenMargin, gap: spacing.md }}>
          <Skeleton height={32} />
          <Skeleton height={200} />
        </View>
      )}
    </View>
  );
}
