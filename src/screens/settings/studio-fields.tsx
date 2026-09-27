import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, type TextInput, View } from "react-native";

import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { useStudio } from "@/storage/studio";
import { radius, spacing, useBrandColors } from "@/theme";

import { SavedIndicator } from "./saved-indicator";

/** How long "Saved" stays beside the header after a field commits. */
const SAVED_VISIBLE_MS = 2000;

/**
 * Studio name and city, saved on blur or return — no Save button. Limits
 * match the web settings form (name 40, city 80).
 */
export function StudioFields() {
  const palette = useBrandColors();
  const { studio, isGuest, update } = useStudio();
  // A draft exists only while a field is being edited. Otherwise the field
  // shows what is stored, so a reset elsewhere shows up immediately.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [cityDraft, setCityDraft] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const cityRef = useRef<TextInput>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const storedName = isGuest ? "" : studio.displayName;
  const storedCity = studio.city ?? "";

  const confirmSaved = () => {
    setShowSaved(true);
    AccessibilityInfo.announceForAccessibility("Saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setShowSaved(false), SAVED_VISIBLE_MS);
  };

  const commitName = () => {
    if (nameDraft === null) return;
    const next = nameDraft.trim();
    setNameDraft(null);
    // Clearing the name keeps the current one — a studio always has a name.
    if (!next || next === storedName) return;
    update({ displayName: next });
    confirmSaved();
  };

  const commitCity = () => {
    if (cityDraft === null) return;
    const next = cityDraft.trim();
    setCityDraft(null);
    if (next === storedCity) return;
    update({ city: next });
    confirmSaved();
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md }}>
        <ThemedText
          variant="footnote"
          tone="muted"
          accessibilityRole="header"
          style={{ flex: 1, textTransform: "uppercase" }}
        >
          Studio
        </ThemedText>
        <SavedIndicator visible={showSaved} />
      </View>
      <View
        style={{
          gap: spacing.md,
          padding: spacing.md,
          backgroundColor: palette.bgElevated,
          borderRadius: radius.md,
          borderCurve: "continuous",
        }}
      >
        <TextField
          label="Display name"
          value={nameDraft ?? storedName}
          placeholder="Studio Guest"
          maxLength={40}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="nickname"
          textContentType="nickname"
          returnKeyType="next"
          submitBehavior="submit"
          onFocus={() => setNameDraft(storedName)}
          onChangeText={setNameDraft}
          onSubmitEditing={() => cityRef.current?.focus()}
          onBlur={commitName}
        />
        <TextField
          ref={cityRef}
          label="City (optional)"
          value={cityDraft ?? storedCity}
          placeholder="West Palm Beach"
          maxLength={80}
          autoCapitalize="words"
          autoComplete="postal-address-locality"
          textContentType="addressCity"
          returnKeyType="done"
          // Return blurs a single-line field, so blur is the one commit point.
          onFocus={() => setCityDraft(storedCity)}
          onChangeText={setCityDraft}
          onBlur={commitCity}
        />
      </View>
      <ThemedText variant="footnote" tone="muted" style={{ paddingHorizontal: spacing.md }}>
        Signs the kindness notes you leave. It stays on this phone.
      </ThemedText>
    </View>
  );
}
