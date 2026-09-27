import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { ListGroup } from "@/components/list-row";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { canLeaveComposeStep, clampKindnessBody } from "@/domain/kindness/compose-validation";
import {
  KINDNESS_ANON,
  KINDNESS_MAX_BODY,
  type KindnessMedium,
  type KindnessSpark,
  MEDIUM_LABELS,
  SPARK_LABELS,
} from "@/domain/kindness/types";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { useStudio } from "@/storage/studio";
import { duration, radius, screenMargin, spacing, spark, useBrandColors } from "@/theme";
import { tabRoutes } from "@/utils/links";

import { ChoiceRow } from "./choice-row";
import { ModalBar } from "./modal-bar";

type Step = 1 | 2 | 3;

const mediums: { id: KindnessMedium; hint: string }[] = [
  { id: "anyone", hint: "A stranger, a friend, the house" },
  { id: "music", hint: "Musicians and the people who listen" },
  { id: "visual", hint: "Painters, photographers, makers" },
  { id: "theater", hint: "Actors, dancers, comedians" },
  { id: "open-heart", hint: "Whoever needs it today" },
];

const sparks: KindnessSpark[] = ["coral", "gold", "teal"];

// Local control geometry: spark swatches clear the 44pt target with room for
// the selection ring; the note field shows ~5 lines before it scrolls.
const SWATCH = 52;
const SWATCH_RING = 3;
const NOTE_FIELD_MIN_HEIGHT = 140;

const stepTitles: Record<Step, string> = {
  1: "Who is it for?",
  2: "Your words",
  3: "Pin it to the plaster",
};

/** The three-step kindness ritual: who → words → spark. Stays on this phone. */
export function ComposeKindnessScreen() {
  const palette = useBrandColors();
  const insets = useSafeAreaInsets();
  const { studio, isGuest } = useStudio();
  const { add } = useKindnessNotes();

  const [step, setStep] = useState<Step>(1);
  const [medium, setMedium] = useState<KindnessMedium>("anyone");
  const [body, setBody] = useState("");
  const [from, setFrom] = useState(isGuest ? "" : studio.displayName);
  const [tone, setTone] = useState<KindnessSpark>("coral");
  const [error, setError] = useState<string | null>(null);

  const next = () => {
    const check = canLeaveComposeStep(step, body);
    if (!check.ok) {
      setError(check.error ?? null);
      if (process.env.EXPO_OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setError(null);
    if (step < 3) {
      setStep((step + 1) as Step);
      return;
    }
    add({ body: body.trim(), from, medium, spark: tone, pinKind: "house", pinLabel: "The house" });
    if (process.env.EXPO_OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
    router.navigate(tabRoutes.kindness);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ModalBar title="Leave a Kindness" detail={`Step ${step} of 3`} />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={spacing.xxl}
        contentContainerStyle={{ padding: screenMargin, gap: spacing.lg, paddingBottom: spacing.xxxl }}
      >
        <Animated.View key={step} entering={FadeIn.duration(duration.base)} style={{ gap: spacing.lg }}>
          <ThemedText variant="title1" accessibilityRole="header">
            {stepTitles[step]}
          </ThemedText>

          {step === 1 ? (
            <ListGroup>
              {mediums.map((m, i) => (
                <ChoiceRow
                  key={m.id}
                  label={MEDIUM_LABELS[m.id]}
                  hint={m.hint}
                  selected={medium === m.id}
                  onPress={() => setMedium(m.id)}
                  last={i === mediums.length - 1}
                />
              ))}
            </ListGroup>
          ) : null}

          {step === 2 ? (
            <View style={{ gap: spacing.md }}>
              <TextField
                label="Your note"
                value={body}
                onChangeText={(v) => {
                  setBody(clampKindnessBody(v));
                  if (error) setError(null);
                }}
                placeholder="A few kind words…"
                multiline
                autoFocus
                maxLength={KINDNESS_MAX_BODY}
                showCount
                error={error}
                style={{ minHeight: NOTE_FIELD_MIN_HEIGHT, textAlignVertical: "top" }}
              />
              <TextField
                label="From"
                value={from}
                onChangeText={setFrom}
                placeholder={KINDNESS_ANON}
                helper="Leave it blank to sign as an anonymous artist."
                textContentType="name"
                autoComplete="name"
                maxLength={40}
              />
            </View>
          ) : null}

          {step === 3 ? (
            <View style={{ gap: spacing.lg }}>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Spark color"
                style={{ flexDirection: "row", gap: spacing.md }}
              >
                {sparks.map((s) => {
                  const selected = tone === s;
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={SPARK_LABELS[s]}
                      onPress={() => {
                        if (process.env.EXPO_OS === "ios") Haptics.selectionAsync();
                        setTone(s);
                      }}
                      style={{
                        width: SWATCH,
                        height: SWATCH,
                        borderRadius: radius.pill,
                        backgroundColor: spark[s],
                        borderWidth: selected ? SWATCH_RING : 0,
                        borderColor: palette.text,
                        transform: [{ scale: selected ? 1.08 : 1 }],
                      }}
                    />
                  );
                })}
              </View>
              <ThemedText variant="footnote" tone="muted">
                Preview
              </ThemedText>
              <KindnessNoteCard
                body={body.trim()}
                from={from.trim() || KINDNESS_ANON}
                tone={tone}
                style={{ transform: [{ rotate: "-1.2deg" }] }}
              />
              <ThemedText variant="footnote" tone="muted">
                For {MEDIUM_LABELS[medium].toLowerCase()} · stays on this phone until the shared wall opens.
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView offset={{ opened: insets.bottom }}>
        <View
          style={{
            flexDirection: "row",
            gap: spacing.sm,
            paddingHorizontal: screenMargin,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.sm,
            backgroundColor: palette.bg,
            borderTopWidth: 0.5,
            borderTopColor: palette.separator,
          }}
        >
          {step > 1 ? (
            <Button
              title="Back"
              variant="secondary"
              onPress={() => {
                setError(null);
                setStep((step - 1) as Step);
              }}
            />
          ) : null}
          <Button
            title={step === 3 ? "Pin it to the plaster" : "Next"}
            tone="coral"
            icon={step === 3 ? "sparkle" : undefined}
            disabled={step === 2 && !body.trim()}
            onPress={next}
            style={{ flex: 1 }}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
