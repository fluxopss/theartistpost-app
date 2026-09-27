import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { FramedImage } from "@/components/framed-image";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { FILTER_OPTIONS, type KindnessFilter } from "@/domain/kindness/types";
import { useKindnessNotes } from "@/storage/kindness-notes";
import { spacing } from "@/theme";
import { brandImages } from "@/utils/brand-images";
import { contact } from "@/utils/links";

import { FilterChips } from "./filter-chips";
import { NoteWall } from "./note-wall";

export function KindnessScreen() {
  const { notes } = useKindnessNotes();
  const [filter, setFilter] = useState<KindnessFilter>("all");
  const visible = useMemo(
    () => (filter === "all" ? notes : notes.filter((n) => n.medium === filter)),
    [filter, notes],
  );
  const compose = () => router.push("/compose-kindness");

  return (
    <ScreenScroll>
      <View style={{ gap: spacing.md }}>
        <FramedImage
          source={brandImages.kindnessTrademark}
          alt="Kindness Always mark"
          aspectRatio={16 / 9}
          contentFit="contain"
        />
        <ThemedText variant="eyebrow" tone="spark-violet">
          {site.kindnessMark} · {site.shine}
        </ThemedText>
        <ThemedText variant="title1" accessibilityRole="header">
          Choose kindness, on purpose
        </ThemedText>
        <ThemedText variant="body" tone="muted">
          {copy.kindness.body}
        </ThemedText>
        <Button title="Leave a Kindness" tone="coral" size="lg" icon="sparkle" onPress={compose} />
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader
          eyebrow={notes.length === 1 ? "1 note on this phone" : `${notes.length} notes on this phone`}
          eyebrowTone="spark-violet"
          title="The plaster"
        />
        {notes.length ? (
          <>
            <FilterChips
              label="Filter notes"
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
            />
            {visible.length ? (
              <NoteWall notes={visible} />
            ) : (
              <EmptyState
                icon="filters"
                title="No notes in this lane yet"
                body="Try another filter, or leave one for this lane."
                action={<Button title="Show all" variant="secondary" onPress={() => setFilter("all")} />}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon="sparkle"
            title="The plaster is waiting"
            body="Leave the first note — for an artist, a stranger, or the house. Notes you leave stay on this phone until the shared wall opens."
            action={<Button title="Leave a Kindness" tone="coral" onPress={compose} />}
          />
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionHeader eyebrow="Wear the mark" eyebrowTone="spark-coral" title="Kindness Always merch" />
        <FramedImage
          source={brandImages.merchLockup}
          alt="The Artist Post and Kindness Always merch"
          contentFit="contain"
          aspectRatio={16 / 9}
        />
        <ThemedText variant="body" tone="muted">
          {copy.kindness.merchBody}
        </ThemedText>
        <ListGroup>
          <ListRow
            icon="external"
            title={copy.kindness.buyCta}
            subtitle="Every piece supports local creatives"
            onPress={contact.merch}
            external
          />
          <ListRow
            icon="phone"
            title={copy.kindness.orderLine}
            value={site.phone}
            onPress={contact.call}
            external
            separator={false}
          />
        </ListGroup>
      </View>
    </ScreenScroll>
  );
}
