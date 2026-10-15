import { useReducer } from "react";
import { Pressable, View } from "react-native";

import { describeSaveError } from "@/api/errors";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { inlineEditReducer, inlineSaveValue, type InlineEditState } from "@/domain/people/inline-edit";
import { spacing, useBrandColors } from "@/theme";

const idle: InlineEditState = { status: "idle" };

/**
 * One profile field you edit where it sits: tap it, type, Save. The draft
 * survives a failed save (offline, server error) so nothing typed is lost.
 * `onSave` receives the trimmed text, or null when the field was cleared, and
 * must throw when the save did not go through.
 */
export function InlineEditField({
  label,
  value,
  emptyPrompt,
  max,
  multiline = false,
  textVariant = "body",
  onSave,
}: {
  label: string;
  value: string | null;
  emptyPrompt: string;
  max: number;
  multiline?: boolean;
  textVariant?: "body" | "headline";
  onSave: (next: string | null) => Promise<unknown>;
}) {
  const palette = useBrandColors();
  const [state, dispatch] = useReducer(inlineEditReducer, idle);

  if (state.status === "idle") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? `Edit ${label}` : emptyPrompt}
        accessibilityHint={value ?? undefined}
        onPress={() => dispatch({ type: "start", value: value ?? "" })}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "flex-start",
          gap: spacing.xs,
          opacity: pressed ? 0.7 : 1,
          minHeight: 44,
          paddingVertical: spacing.xxs,
        })}
      >
        {value ? (
          <ThemedText variant={textVariant} style={{ flex: 1 }}>
            {value}
          </ThemedText>
        ) : (
          <ThemedText variant="callout" tone="muted" style={{ flex: 1 }}>
            {emptyPrompt}
          </ThemedText>
        )}
        <Icon name="pencil" size={16} color={palette.textMuted} />
      </Pressable>
    );
  }

  const saving = state.status === "saving";
  const error = state.status === "editing" ? state.error : null;

  const save = async () => {
    const draft = state.draft;
    const checked = inlineSaveValue(draft, value, max);
    if (checked.kind === "unchanged") {
      dispatch({ type: "cancel" });
      return;
    }
    // Going through submit -> failed keeps the draft and shows the message in one place.
    dispatch({ type: "submit" });
    if (checked.kind === "invalid") {
      dispatch({ type: "failed", message: checked.message });
      return;
    }
    try {
      await onSave(checked.value);
      dispatch({ type: "saved" });
    } catch (cause) {
      dispatch({ type: "failed", message: describeSaveError(cause) });
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <TextField
        label={label}
        value={state.draft}
        onChangeText={(text) => dispatch({ type: "change", text })}
        multiline={multiline}
        maxLength={max}
        editable={!saving}
        autoFocus
        showCount
        textAlignVertical={multiline ? "top" : "center"}
        style={multiline ? { minHeight: 110 } : undefined}
        error={error}
      />
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <Button
          title={error ? "Try again" : "Save"}
          tone="teal"
          loading={saving}
          onPress={() => void save()}
          style={{ flex: 1 }}
        />
        <Button
          title="Cancel"
          variant="secondary"
          disabled={saving}
          onPress={() => dispatch({ type: "cancel" })}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
