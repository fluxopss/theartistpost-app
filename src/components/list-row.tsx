import type { ReactNode } from "react";
import { Pressable, type StyleProp, View, type ViewStyle } from "react-native";

import { Icon, type IconName } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, useBrandColors } from "@/theme";

/**
 * A grouped-list row: icon, title, optional subtitle/value, trailing chevron.
 * Rows sit on a shared background separated by hairlines — never each in
 * its own card.
 */
export function ListRow({
  title,
  subtitle,
  value,
  icon,
  iconTint,
  onPress,
  destructive = false,
  external = false,
  showChevron = true,
  separator = true,
  accessibilityHint,
  style,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  iconTint?: string;
  onPress?: () => void;
  destructive?: boolean;
  external?: boolean;
  showChevron?: boolean;
  separator?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useBrandColors();
  const titleColor = destructive ? palette.danger : palette.text;

  return (
    <Pressable
      accessibilityRole={external ? "link" : "button"}
      accessibilityHint={accessibilityHint}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 52,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: pressed ? palette.bgPressed : "transparent",
        },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={22} color={iconTint ?? (destructive ? palette.danger : palette.accentText)} />
      ) : null}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          alignSelf: "stretch",
          paddingVertical: spacing.sm,
          borderBottomWidth: separator ? 0.5 : 0,
          borderBottomColor: palette.separator,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="body" style={{ color: titleColor }}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText variant="footnote" tone="muted">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {value ? (
          <ThemedText variant="subheadline" tone="muted" selectable>
            {value}
          </ThemedText>
        ) : null}
        {onPress && showChevron ? (
          <Icon
            name={external ? "external" : "chevronRight"}
            size={external ? 16 : 14}
            color={palette.textMuted}
            weight="semibold"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

/** Groups ListRows on an inset, rounded background. */
export function ListGroup({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header?: string;
  footer?: string;
}) {
  const palette = useBrandColors();
  return (
    <View style={{ gap: spacing.xs }}>
      {header ? (
        <ThemedText
          variant="footnote"
          tone="muted"
          accessibilityRole="header"
          style={{ paddingHorizontal: spacing.md, textTransform: "uppercase" }}
        >
          {header}
        </ThemedText>
      ) : null}
      <View
        style={{
          backgroundColor: palette.bgElevated,
          borderRadius: radius.md,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
      {footer ? (
        <ThemedText variant="footnote" tone="muted" style={{ paddingHorizontal: spacing.md }}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}
