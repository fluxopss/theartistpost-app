import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import { Icon, type IconName } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { inkOnSpark, radius, spacing, spark, useBrandColors } from "@/theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonTone = "coral" | "teal" | "gold";
export type ButtonSize = "md" | "lg";

const sizes = {
  md: { minHeight: 44, paddingHorizontal: spacing.md, gap: spacing.xs },
  lg: { minHeight: 52, paddingHorizontal: spacing.xl, gap: spacing.xs },
} as const;

export function Button({
  title,
  onPress,
  variant = "primary",
  tone = "coral",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Fill color for primary buttons. */
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useBrandColors();
  const inactive = disabled || loading;

  const fill = {
    primary: spark[tone],
    secondary: palette.bgElevated,
    ghost: "transparent",
    destructive: "transparent",
  }[variant];

  const ink = {
    primary: inkOnSpark,
    secondary: palette.text,
    ghost: palette.accentText,
    destructive: palette.danger,
  }[variant];

  const border =
    variant === "secondary"
      ? palette.separatorStrong
      : variant === "destructive"
        ? palette.danger
        : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.selectionAsync();
        }
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          ...sizes[size],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.pill,
          backgroundColor:
            pressed && variant !== "primary" ? palette.bgPressed : fill,
          borderWidth: border === "transparent" ? 0 : 1,
          borderColor: border,
          opacity: disabled ? 0.45 : pressed && variant === "primary" ? 0.82 : 1,
        },
        style,
      ]}
    >
      {/* Keep label + icon laid out while loading so the width never jumps. */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: sizes[size].gap,
          opacity: loading ? 0 : 1,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={ink} weight="semibold" /> : null}
        <ThemedText variant="headline" style={{ color: ink }} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
      {loading ? (
        <ActivityIndicator
          color={ink}
          style={{ position: "absolute" }}
          accessibilityElementsHidden
        />
      ) : null}
    </Pressable>
  );
}
