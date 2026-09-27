import { Text, type TextProps } from "react-native";

import {
  maxFontScale,
  paper,
  type SparkTone,
  type,
  type TypeVariant,
  useBrandColors,
} from "@/theme";

export type TextTone =
  | "default"
  | "muted"
  | "accent"
  | "danger"
  | "success"
  | "onAccent"
  | "onStage"
  | "paperInk"
  | `spark-${SparkTone}`;

export type ThemedTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
};

/**
 * The only way screens render text. Size, family and tracking come from the
 * type ramp; color comes from the brand palette so light/dark stay in sync.
 */
export function ThemedText({
  variant = "body",
  tone = "default",
  style,
  maxFontSizeMultiplier,
  ...props
}: ThemedTextProps) {
  const palette = useBrandColors();

  const color = (() => {
    switch (tone) {
      case "muted":
        return palette.textMuted;
      case "accent":
        return palette.accentText;
      case "danger":
        return palette.danger;
      case "success":
        return palette.success;
      case "onAccent":
        return palette.onAccent;
      case "onStage":
        return "#FFFAF3";
      case "paperInk":
        return paper.kindness.ink;
      case "spark-coral":
        return palette.sparkInk.coral;
      case "spark-gold":
        return palette.sparkInk.gold;
      case "spark-teal":
        return palette.sparkInk.teal;
      case "spark-violet":
        return palette.sparkInk.violet;
      default:
        return palette.text;
    }
  })();

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? maxFontScale[variant]}
      style={[type[variant], { color }, style]}
      {...props}
    />
  );
}
