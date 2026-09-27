import * as Haptics from "expo-haptics";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";

import { Button } from "@/components/button";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { SectionHeader } from "@/components/section-header";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";
import { moderateKindnessBody } from "@/domain/kindness/moderation";
import { KINDNESS_ANON, KINDNESS_MAX_BODY } from "@/domain/kindness/types";
import type { NightSpark } from "@/domain/night/pass-types";
import { duration, type SparkTone, spacing } from "@/theme";

const tones: SparkTone[] = ["coral", "gold", "teal", "violet"];
const tilts = ["-1.6deg", "1.2deg", "-0.8deg", "1.8deg"];

/** Short lines pinned to this night. They stay on this phone. */
export function NightSparks({
  sparks,
  from,
  onAdd,
}: {
  sparks: NightSpark[];
  from: string;
  onAdd: (body: string, from: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pin = () => {
    const moderated = moderateKindnessBody(draft);
    if (!moderated.ok) {
      setError(moderated.error ?? "Try a gentler line.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    onAdd(moderated.cleaned, from.trim() || KINDNESS_ANON);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDraft("");
    setError(null);
  };

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader eyebrow="Last light" eyebrowTone="spark-violet" title="Pin a spark" />
      <ThemedText variant="subheadline" tone="muted">
        {copy.night.sparksNote}
      </ThemedText>

      {sparks.length ? (
        <View style={{ gap: spacing.md }}>
          {sparks.map((spark, i) => (
            <Animated.View
              key={spark.id}
              entering={reduceMotion ? undefined : FadeInUp.duration(duration.slow).springify()}
            >
              <KindnessNoteCard
                variant="compact"
                body={spark.body}
                from={spark.from}
                tone={tones[i % tones.length]}
                style={{ transform: [{ rotate: tilts[i % tilts.length] }] }}
              />
            </Animated.View>
          ))}
        </View>
      ) : (
        <ThemedText variant="footnote" tone="muted">
          The plaster is still warm. Be the first line.
        </ThemedText>
      )}

      <TextField
        label="A line for this night"
        value={draft}
        onChangeText={(value) => {
          setDraft(value);
          if (error) setError(null);
        }}
        placeholder="Shine bright."
        maxLength={KINDNESS_MAX_BODY}
        error={error}
        returnKeyType="done"
        onSubmitEditing={pin}
      />
      <Button
        title={copy.night.toss}
        variant="secondary"
        icon="sparkle"
        disabled={!draft.trim()}
        onPress={pin}
      />
    </View>
  );
}
