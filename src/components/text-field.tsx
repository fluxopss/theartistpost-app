import { forwardRef, useState } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { colors, fonts, radius, spacing, type, useBrandColors } from "@/theme";

/**
 * Labeled text input. Pass `textContentType` / `autoComplete` through so the
 * OS can autofill (email, name, one-time code).
 */
export const TextField = forwardRef<
  TextInput,
  TextInputProps & {
    label: string;
    helper?: string;
    error?: string | null;
    showCount?: boolean;
  }
>(function TextField({ label, helper, error, showCount, maxLength, value, style, onFocus, onBlur, ...props }, ref) {
  const palette = useBrandColors();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? palette.danger : focused ? palette.accent : palette.separatorStrong;

  return (
    <View style={{ gap: spacing.xxs }}>
      <ThemedText variant="subheadline" nativeID={`${label}-label`}>
        {label}
      </ThemedText>
      <TextInput
        ref={ref}
        value={value}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityLabelledBy={`${label}-label`}
        accessibilityHint={error ?? helper}
        placeholderTextColor={colors.placeholderText}
        selectionColor={palette.accent}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            borderCurve: "continuous",
            borderWidth: focused || error ? 1.5 : 1,
            borderColor,
            backgroundColor: palette.bgElevated,
            color: palette.text,
            fontFamily: fonts.body,
            fontSize: type.body.fontSize,
          },
          style,
        ]}
        {...props}
      />
      {error || helper || (showCount && maxLength) ? (
        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          <ThemedText
            variant="footnote"
            tone={error ? "danger" : "muted"}
            style={{ flex: 1 }}
            accessibilityLiveRegion={error ? "polite" : "none"}
          >
            {error ?? helper ?? ""}
          </ThemedText>
          {showCount && maxLength ? (
            <ThemedText variant="footnote" tone="muted" style={{ fontVariant: ["tabular-nums"] }}>
              {(value ?? "").length}/{maxLength}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
