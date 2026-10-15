import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { DoorCard } from "@/components/door-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { EventRow } from "@/components/event-row";
import { GenreRail } from "@/components/genre-rail";
import { GlassSurface } from "@/components/glass-surface";
import { KindnessNoteCard } from "@/components/kindness-note-card";
import { ListGroup, ListRow } from "@/components/list-row";
import { LogoMark } from "@/components/logo-mark";
import { MantraStrip } from "@/components/mantra-strip";
import { OpenStatusPill } from "@/components/open-status-pill";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { TicketPass } from "@/components/ticket-pass";
import {
  brandPalette,
  paper,
  radius,
  shadows,
  spacing,
  spark,
  sticker,
  type SparkTone,
  useBrandColors,
} from "@/theme";

const sparkTones: SparkTone[] = ["coral", "gold", "teal", "violet"];

function Swatch({ label, color }: { label: string; color: string }) {
  const palette = useBrandColors();
  return (
    <View style={{ alignItems: "center", gap: spacing.xxs, width: 64 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          borderCurve: "continuous",
          backgroundColor: color,
          borderWidth: 1,
          borderColor: palette.separatorStrong,
        }}
      />
      <ThemedText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

/**
 * Dev-only token and component gallery. Screenshot this in light/dark, at
 * the largest Dynamic Type size, and with Reduce Motion / Reduce
 * Transparency on, per the P1 exit criteria. Not linked from any nav —
 * reach it directly during development.
 */
export default function StyleguideScreen() {
  const palette = useBrandColors();
  const [asyncDemo, setAsyncDemo] = useState<"loading" | "error" | "empty" | "content">(
    "content",
  );

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <>
      <Stack.Screen options={{ title: "Styleguide", headerLargeTitleEnabled: false }} />
      <ScreenScroll contentContainerStyle={{ gap: spacing.xxl }}>
        <SectionHeader eyebrow="Design system" title="Styleguide" />

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Brand palette (current scheme)</ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Swatch label="bg" color={palette.bg} />
            <Swatch label="bgDeep" color={palette.bgDeep} />
            <Swatch label="bgElevated" color={palette.bgElevated} />
            <Swatch label="bgPressed" color={palette.bgPressed} />
            <Swatch label="accent" color={palette.accent} />
            <Swatch label="accentText" color={palette.accentText} />
            <Swatch label="danger" color={palette.danger} />
            <Swatch label="success" color={palette.success} />
          </View>
          <ThemedText variant="footnote" tone="muted">
            Light bg {brandPalette.light.bg} · Dark bg {brandPalette.dark.bg}
          </ThemedText>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Sparks &amp; stickers</ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {sparkTones.map((tone) => (
              <Swatch key={tone} label={`spark.${tone}`} color={spark[tone]} />
            ))}
            {sparkTones.map((tone) => (
              <Swatch key={`sticker-${tone}`} label={`sticker.${tone}`} color={sticker[tone].bg} />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Swatch label="paper.kindness" color={paper.kindness.bg} />
            <Swatch label="paper.ticket" color={paper.ticket.bg} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Type ramp</ThemedText>
          <ThemedText variant="display">Display</ThemedText>
          <ThemedText variant="largeTitle">Large title</ThemedText>
          <ThemedText variant="title1">Title 1</ThemedText>
          <ThemedText variant="title2">Title 2</ThemedText>
          <ThemedText variant="title3">Title 3</ThemedText>
          <ThemedText variant="headline">Headline</ThemedText>
          <ThemedText variant="body">
            Body — Love ALL, Dream TOGETHER, Create AS ONE. The quick brown fox jumps.
          </ThemedText>
          <ThemedText variant="callout">Callout text</ThemedText>
          <ThemedText variant="subheadline" tone="muted">
            Subheadline, muted
          </ThemedText>
          <ThemedText variant="footnote" tone="muted">
            Footnote, muted
          </ThemedText>
          <ThemedText variant="eyebrow" tone="spark-teal">
            Eyebrow label
          </ThemedText>
          <ThemedText variant="counter">04:12:59</ThemedText>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Buttons</ThemedText>
          <View style={{ gap: spacing.xs }}>
            <Button title="Primary coral" tone="coral" onPress={() => {}} />
            <Button title="Primary teal" tone="teal" onPress={() => {}} />
            <Button title="Secondary" variant="secondary" onPress={() => {}} />
            <Button title="Ghost" variant="ghost" onPress={() => {}} />
            <Button title="Destructive" variant="destructive" onPress={() => {}} />
            <Button title="Loading" loading onPress={() => {}} />
            <Button title="Disabled" disabled onPress={() => {}} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Genre rail</ThemedText>
          <GenreRail style={{ marginHorizontal: -spacing.lg }} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Mantra strip</ThemedText>
          <MantraStrip />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Door card</ThemedText>
          <DoorCard
            index={1}
            eyebrow="Space"
            tone="coral"
            title="Book a wall"
            body="Request a frame at Hacienda for your work."
            onPress={() => {}}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Ticket pass</ThemedText>
          <TicketPass
            title="Kindness Always Community Night"
            venue="Hacienda · 522 Clematis Street"
            when={{ weekday: "Sat", month: "Sep", day: "26", time: "4:00 PM", endTime: "9:00 PM" }}
            stamp="Admit one"
            holder="Jordan R."
            code="TAP-4821"
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Kindness note</ThemedText>
          <KindnessNoteCard
            body="You never know whose day you're turning around. Keep going."
            from="A visitor"
            tone="violet"
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Event row</ThemedText>
          <ListGroup>
            <EventRow
              month="Sep"
              day="26"
              weekday="Sat"
              title="Kindness Always Community Night"
              time="4:00 – 9:00 PM"
              venue="Hacienda"
              status="Tonight"
              statusTone="live"
              onPress={() => {}}
              separator={false}
            />
          </ListGroup>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">List group</ThemedText>
          <ListGroup header="Studio">
            <ListRow title="Settings" icon="settings" onPress={() => {}} />
            <ListRow title="Saved" icon="bookmark" value="3" onPress={() => {}} />
            <ListRow
              title="Sign out"
              icon="close"
              destructive
              showChevron={false}
              separator={false}
              onPress={() => {}}
            />
          </ListGroup>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Text field</ThemedText>
          <TextField label="Name" placeholder="Your name" />
          <TextField label="Note" placeholder="Leave a spark…" maxLength={240} showCount />
          <TextField label="Email" error="Enter a valid email" />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Skeleton</ThemedText>
          <Skeleton height={20} width="60%" />
          <Skeleton height={80} rounded={radius.lg} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Empty &amp; error states</ThemedText>
          <View style={{ backgroundColor: palette.bgElevated, borderRadius: radius.lg, borderCurve: "continuous" }}>
            <EmptyState title="The stage is set" body="Featured artists coming soon." />
          </View>
          <View style={{ backgroundColor: palette.bgElevated, borderRadius: radius.lg, borderCurve: "continuous" }}>
            <ErrorState onRetry={() => {}} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Async view (tap to cycle)</ThemedText>
          <Button
            title={`State: ${asyncDemo}`}
            variant="secondary"
            onPress={() =>
              setAsyncDemo((s) =>
                s === "loading" ? "error" : s === "error" ? "empty" : s === "empty" ? "content" : "loading",
              )
            }
          />
          <View style={{ minHeight: 100, backgroundColor: palette.bgElevated, borderRadius: radius.lg, borderCurve: "continuous" }}>
            <AsyncView
              data={asyncDemo === "content" ? ["one"] : asyncDemo === "empty" ? [] : undefined}
              isPending={asyncDemo === "loading"}
              error={asyncDemo === "error" ? new Error("demo") : null}
              isEmpty={(items) => items.length === 0}
              onRetry={() => setAsyncDemo("content")}
              loading={<Skeleton height={100} />}
              empty={<EmptyState title="Nothing here yet" />}
            >
              {(items) => (
                <View style={{ padding: spacing.md }}>
                  <ThemedText>{items.length} item(s) loaded</ThemedText>
                </View>
              )}
            </AsyncView>
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="title3">Glass surface</ThemedText>
          <GlassSurface style={{ padding: spacing.md, minHeight: 72 }}>
            <ThemedText>Floats over the house.</ThemedText>
          </GlassSurface>
        </View>

        <View style={{ gap: spacing.sm, alignItems: "flex-start" }}>
          <ThemedText variant="title3">Logo &amp; status</ThemedText>
          <LogoMark size={72} />
          <OpenStatusPill />
        </View>

        <View style={{ height: spacing.xxxl, boxShadow: shadows.hairline }} />
      </ScreenScroll>
    </>
  );
}
