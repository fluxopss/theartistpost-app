import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { LegalSection } from "@/content/legal";
import { spacing } from "@/theme";

import { LegalLink } from "./legal-link";

/** "Lead. Rest" → the bold lead-in the web set in <strong>, and the rest. */
function splitLeadIn(text: string) {
  const end = text.indexOf(". ");
  if (end === -1) return { lead: null, rest: text };
  return { lead: text.slice(0, end + 1), rest: text.slice(end + 2) };
}

/** One heading and its paragraphs, list items, and links. */
export function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {section.heading ? (
        <ThemedText variant="title2" accessibilityRole="header">
          {section.heading}
        </ThemedText>
      ) : null}

      {section.list === "lead-in"
        ? section.body.map((item) => {
            const { lead, rest } = splitLeadIn(item);
            return (
              <View key={item} style={{ gap: spacing.xxs }}>
                {lead ? (
                  <ThemedText variant="headline" selectable>
                    {lead}
                  </ThemedText>
                ) : null}
                <ThemedText variant="body" tone="muted" selectable>
                  {rest}
                </ThemedText>
              </View>
            );
          })
        : section.list === "bullets"
          ? section.body.map((item) => (
              <View key={item} style={{ flexDirection: "row", gap: spacing.xs }}>
                <ThemedText variant="body" tone="muted" accessibilityElementsHidden>
                  •
                </ThemedText>
                <ThemedText variant="body" tone="muted" selectable style={{ flex: 1 }}>
                  {item}
                </ThemedText>
              </View>
            ))
          : section.body.map((paragraph) => (
              <ThemedText key={paragraph} variant="body" tone="muted" selectable>
                {paragraph}
              </ThemedText>
            ))}

      {section.links?.length ? (
        <View>
          {section.links.map((link) => (
            <LegalLink key={link.href} link={link} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
