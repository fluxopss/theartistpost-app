import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { describeSaveError, isApiError } from "@/api/errors";
import { useAcceptTerms, useMe, useUpdateProfile } from "@/api/hooks";
import type { MeDTO } from "@/api/types";
import { useAuth } from "@/auth";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/button";
import { Chip } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { LegalSectionBlock } from "@/components/legal-section-block";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { TopicPicker } from "@/components/topic-picker";
import { legalDocs } from "@/content/legal";
import { handleAlternatives, suggestHandle, validateHandle } from "@/domain/people/handle";
import { welcomeProgress, welcomeSteps, type WelcomeStep } from "@/domain/people/welcome";
import { radius, screenMargin, spacing, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

const titles: Record<WelcomeStep, string> = {
  guidelines: "How we treat each other",
  profile: "Who are you?",
  topics: "What do you make or love?",
};

function finish() {
  router.dismissTo(tabRoutes.community);
}

/** Acceptance is always an explicit act: the box starts unchecked and the button waits for it. */
function GuidelinesStep({ onDone }: { onDone: () => void }) {
  const palette = useBrandColors();
  const accept = useAcceptTerms();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const doc = legalDocs.guidelines;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.lg }}>
        {doc.sections.map((section, index) => (
          <LegalSectionBlock key={section.heading ?? `intro-${index}`} section={section} />
        ))}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        accessibilityLabel="I have read and agree to the Community Guidelines"
        onPress={() => setAgreed((value) => !value)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          minHeight: 48,
          padding: spacing.sm,
          borderRadius: radius.md,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: agreed ? palette.accent : palette.separatorStrong,
          backgroundColor: palette.bgElevated,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.sm,
            borderWidth: 1.5,
            borderColor: agreed ? palette.accent : palette.separatorStrong,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {agreed ? <Icon name="check" size={16} color={palette.accent} weight="semibold" /> : null}
        </View>
        <ThemedText variant="callout" style={{ flex: 1 }}>
          I have read and agree to the Community Guidelines.
        </ThemedText>
      </Pressable>
      {error ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
      <Button
        title="Agree and continue"
        tone="coral"
        size="lg"
        disabled={!agreed}
        loading={accept.isPending}
        onPress={() =>
          accept.mutate(undefined, {
            onSuccess: onDone,
            onError: (cause) => setError(describeSaveError(cause)),
          })
        }
      />
    </View>
  );
}

/** Name, handle (suggested from the name) and an optional photo on one screen. */
function ProfileStep({ me, onDone }: { me: MeDTO; onDone: () => void }) {
  const update = useUpdateProfile();
  const hasHandle = Boolean(me.user.handle);
  const [name, setName] = useState(me.user.name);
  const [handle, setHandle] = useState(() => suggestHandle(me.user.name));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [takenHandle, setTakenHandle] = useState<string | null>(null);
  // Read the live profile so a photo picked here shows immediately.
  const live = useMe();
  const user = live.data?.user ?? me.user;

  const save = () => {
    const patch: { name?: string; handle?: string } = {};
    if (name.trim().length < 2) {
      setErrors({ name: "Name needs at least 2 characters." });
      return;
    }
    if (name.trim() !== me.user.name) patch.name = name.trim();
    if (!hasHandle) {
      const checked = validateHandle(handle);
      if (!checked.ok) {
        setErrors({ handle: checked.message });
        return;
      }
      patch.handle = checked.handle;
    }
    setErrors({});
    setTakenHandle(null);
    if (Object.keys(patch).length === 0) {
      onDone();
      return;
    }
    update.mutate(patch, {
      onSuccess: onDone,
      onError: (cause) => {
        if (isApiError(cause) && cause.code === "conflict" && patch.handle) {
          setTakenHandle(patch.handle);
        }
        setErrors(
          isApiError(cause) && cause.fields && Object.keys(cause.fields).length > 0
            ? cause.fields
            : { form: describeSaveError(cause) },
        );
      },
    });
  };

  return (
    <View style={{ gap: spacing.md }}>
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        maxLength={80}
        autoComplete="name"
        textContentType="name"
        error={errors.name}
      />
      {hasHandle ? null : (
        <View style={{ gap: spacing.xs }}>
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
          {takenHandle ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {handleAlternatives(takenHandle).map((option) => (
                <Chip
                  key={option}
                  label={`@${option}`}
                  selected={handle === option}
                  onPress={() => {
                    setHandle(option);
                    setErrors({});
                    setTakenHandle(null);
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
      )}
      <ThemedText variant="subheadline" accessibilityRole="header">
        Photo (optional)
      </ThemedText>
      <AvatarPicker url={user.image} name={name || user.name} />
      {errors.form ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {errors.form}
        </ThemedText>
      ) : null}
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
        title={slugs.length > 0 ? "Finish" : "Skip for now"}
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
              onError: (cause) => setError(describeSaveError(cause)),
            },
          );
        }}
      />
    </View>
  );
}

function ProgressBar({ fraction }: { fraction: number }) {
  const palette = useBrandColors();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: 6, borderRadius: 3, backgroundColor: palette.separator, overflow: "hidden" }}
    >
      <View
        style={{
          width: `${Math.round(fraction * 100)}%`,
          height: "100%",
          borderRadius: 3,
          backgroundColor: palette.accent,
        }}
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
  const progress = welcomeProgress(index, steps.length);

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      bottomOffset={spacing.xxl}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.xxxl,
        paddingHorizontal: screenMargin,
        gap: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <ThemedText variant="eyebrow" tone="spark-coral" accessibilityLiveRegion="polite">
          Welcome · Step {progress.current} of {progress.total}
        </ThemedText>
        <Button
          title="Not now"
          variant="ghost"
          onPress={() => (router.canGoBack() ? router.back() : router.replace(tabRoutes.community))}
        />
      </View>
      <ProgressBar fraction={progress.fraction} />
      <ThemedText variant="title1" accessibilityRole="header">
        {titles[step]}
      </ThemedText>
      {step === "guidelines" ? <GuidelinesStep onDone={next} /> : null}
      {step === "profile" ? <ProfileStep me={me} onDone={next} /> : null}
      {step === "topics" ? <TopicsStep onDone={next} /> : null}
    </KeyboardAwareScrollView>
  );
}

/**
 * Onboarding after join in at most three steps: Guidelines, profile (name,
 * handle, photo) and topics. Shows only the steps this member still needs.
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
