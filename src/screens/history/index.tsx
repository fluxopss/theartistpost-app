import { Stack } from "expo-router";
import { View } from "react-native";

import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { history } from "@/content/history";
import { spacing } from "@/theme";
import { openExternal } from "@/utils/links";

import { EraEntry } from "./era-entry";

/** "startupbeat.com" from a full URL — so each source says where it opens. */
function sourceHost(href: string) {
  return href.replace(/^[a-z]+:\/\//i, "").split("/")[0].replace(/^www\./, "");
}

/** The sourced public record, 2014 to now, as one vertical timeline. */
export function HistoryScreen() {
  const lastIndex = history.eras.length - 1;

  return (
    <>
      <ScreenScroll>
        <View style={{ gap: spacing.xs }}>
          <ThemedText variant="eyebrow" tone="spark-teal">
            {history.foundedLabel}
          </ThemedText>
          <ThemedText variant="title2" accessibilityRole="header">
            {history.kicker}
          </ThemedText>
          <ThemedText variant="body" tone="muted">
            {history.lead}
          </ThemedText>
        </View>

        <View>
          {history.eras.map((era, i) => (
            <EraEntry key={era.id} era={era} last={i === lastIndex} present={i === lastIndex} />
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Sources" />
          <ThemedText variant="subheadline" tone="muted">
            {history.honesty}
          </ThemedText>
          <ListGroup>
            {history.sources.map((source, i) => (
              <ListRow
                key={source.href}
                title={source.label}
                subtitle={sourceHost(source.href)}
                external
                accessibilityHint="Opens the source in your browser"
                onPress={() => void openExternal(source.href)}
                separator={i < history.sources.length - 1}
              />
            ))}
          </ListGroup>
        </View>
      </ScreenScroll>
      <Stack.Screen options={{ title: "History", headerLargeTitleEnabled: process.env.EXPO_OS === "ios" }} />
    </>
  );
}
