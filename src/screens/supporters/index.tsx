import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import type { SearchBarCommands } from "react-native-screens";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { FramedImage } from "@/components/framed-image";
import { ListGroup } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { chapters } from "@/content/chapters";
import { copy } from "@/content/site";
import { spacing, useBrandColors, useBrandScheme } from "@/theme";
import { brandImages } from "@/utils/brand-images";
import { contact } from "@/utils/links";

import { ChapterRow } from "./chapter-row";
import { type ChapterStatus, chapterStatuses, chapterStatusLabel } from "./chapter-status";

type Filter = "all" | ChapterStatus;

const filters: readonly Filter[] = ["all", ...chapterStatuses];
const filterLabels = filters.map((f) => (f === "all" ? "All" : chapterStatusLabel(f)));

// Intrinsic aspect ratio of the bundled supporters map (1400 × 933).
const MAP_RATIO = 1400 / 933;

/** The chapter map: search it, filter it by status, or ask to start one. */
export function SupportersScreen() {
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const searchBar = useRef<SearchBarCommands>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = query.trim().toLowerCase();
  const matches = chapters.filter(
    (c) =>
      (filter === "all" || c.status === filter) &&
      (!q || [c.name, c.state, c.stateCode, c.city ?? "", c.summary].some((f) => f.toLowerCase().includes(q))),
  );
  const groups = chapterStatuses
    .map((status) => ({ status, items: matches.filter((c) => c.status === status) }))
    .filter((group) => group.items.length > 0);

  const clearSearch = () => {
    searchBar.current?.clearText();
    setQuery("");
  };

  return (
    <>
      <ScreenScroll>
        {q ? null : (
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="eyebrow" tone="spark-teal">
                {copy.supporters.findTitle}
              </ThemedText>
              <ThemedText variant="body" tone="muted">
                {copy.supporters.expansion}
              </ThemedText>
            </View>
            <FramedImage
              source={brandImages.supportersMap}
              alt="Map of where The Artist Post operates: Washington, Idaho, Nevada, Oklahoma, Texas, Tennessee, and Florida"
              aspectRatio={MAP_RATIO}
            />
          </View>
        )}

        <View style={{ gap: spacing.lg }}>
          <SegmentedControl
            values={filterLabels}
            selectedIndex={filters.indexOf(filter)}
            onChange={(event) => {
              const next = filters[event.nativeEvent.selectedSegmentIndex];
              if (next) setFilter(next);
            }}
            appearance={scheme}
            tintColor={palette.accent}
          />

          {groups.length > 0 ? (
            groups.map((group) => (
              <ListGroup key={group.status} header={chapterStatusLabel(group.status)}>
                {group.items.map((chapter, i) => (
                  <ChapterRow key={chapter.id} chapter={chapter} last={i === group.items.length - 1} />
                ))}
              </ListGroup>
            ))
          ) : (
            <EmptyState
              icon="search"
              title="No chapters match"
              body={[
                q ? `Nothing for “${query.trim()}”` : "Nothing here",
                filter === "all" ? "" : ` in ${chapterStatusLabel(filter)}`,
                `. ${copy.supporters.wantTitle}`,
              ].join("")}
              action={
                <View style={{ alignItems: "center", gap: spacing.xs }}>
                  {q ? <Button title="Clear search" variant="secondary" icon="close" onPress={clearSearch} /> : null}
                  {filter === "all" ? null : (
                    <Button title="Show all chapters" variant="ghost" onPress={() => setFilter("all")} />
                  )}
                </View>
              }
            />
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            eyebrow={copy.supporters.launchTitle}
            eyebrowTone="spark-coral"
            title={copy.supporters.wantTitle}
          />
          <ThemedText variant="body" tone="muted">
            {copy.supporters.applyBody}
          </ThemedText>
          <Button
            title={copy.supporters.applyCta}
            icon="email"
            tone="coral"
            size="lg"
            accessibilityHint="Opens an email to Robbie about starting a chapter"
            onPress={() => void contact.email("Chapter Application — The Artist Post")}
          />
          <ThemedText variant="footnote" tone="muted" style={{ marginTop: spacing.xs }}>
            {copy.supporters.legalNote}
          </ThemedText>
        </View>
      </ScreenScroll>
      <Stack.Screen
        options={{
          title: copy.supporters.title,
          headerLargeTitleEnabled: process.env.EXPO_OS === "ios",
          headerSearchBarOptions: {
            ref: searchBar,
            placeholder: "Search chapters",
            autoCapitalize: "none",
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(""),
            onClose: () => setQuery(""),
            textColor: palette.text,
            tintColor: palette.accentText,
            hintTextColor: palette.textMuted,
            headerIconColor: palette.text,
          },
        }}
      />
    </>
  );
}
