import { router } from "expo-router";
import type { StyleProp, TextStyle } from "react-native";

import { ThemedText, type ThemedTextProps } from "@/components/themed-text";
import { tokenizeMentions } from "@/domain/community/mentions";

/**
 * Community text with tappable @mentions. Plain text stays selectable; each
 * mention opens that person's profile (the server tells nobody who is not a
 * real member, so a mention of a stranger just shows "no one with that handle").
 */
export function MentionText({
  body,
  variant = "body",
  style,
}: {
  body: string;
  variant?: ThemedTextProps["variant"];
  style?: StyleProp<TextStyle>;
}) {
  const tokens = tokenizeMentions(body);
  return (
    <ThemedText variant={variant} selectable style={style}>
      {tokens.map((token, index) =>
        token.type === "mention" ? (
          <ThemedText
            key={`${index}-${token.handle}`}
            variant={variant}
            tone="accent"
            accessibilityRole="link"
            accessibilityHint={`Opens ${token.value}'s profile`}
            onPress={() => router.push({ pathname: "/person/[handle]", params: { handle: token.handle } })}
          >
            {token.value}
          </ThemedText>
        ) : (
          token.value
        ),
      )}
    </ThemedText>
  );
}
