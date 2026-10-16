import { router, Stack, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useAdminPerson, useAdminPersonAction } from "@/api/hooks";
import type { AdminPersonActionInput, AdminPersonDetailDTO } from "@/api/types";
import { useAuth } from "@/auth";
import { ArtistAvatar } from "@/components/artist-avatar";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup, ListRow } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import {
  actionsFor,
  auditLabel,
  type PersonActionOption,
  REASON_MAX,
  reasonProblem,
  roleLabel,
} from "@/domain/admin/people";
import { radius, spacing, useBrandColors } from "@/theme";

import { AdminGate } from "./admin-gate";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const ACTIVITY_KIND: Record<AdminPersonDetailDTO["recentActivity"][number]["kind"], string> = {
  post: "Work",
  comment: "Wall note",
  community_post: "Community post",
};

/** Turns a chosen option into the request body the server expects. */
function inputFor(option: PersonActionOption, reason: string): AdminPersonActionInput {
  const trimmed = reason.trim();
  if (option.id.startsWith("role:")) {
    return { action: "set_role", role: option.id.slice(5) as "VIEWER" | "ARTIST" | "ADMIN", reason: trimmed };
  }
  if (option.id === "sign_in_help") return { action: "send_sign_in_help", reason: trimmed };
  return { action: option.id as "approve_artist" | "revoke_artist" | "suspend" | "unsuspend", reason: trimmed };
}

/** Admin-only member detail: who they are, what they did, what was done, and the actions. */
export function AdminPersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: "Member" }} />
      <AdminGate>
        <PersonDetail id={id ?? ""} />
      </AdminGate>
    </>
  );
}

function PersonDetail({ id }: { id: string }) {
  const query = useAdminPerson(id);

  return (
    <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <AsyncView
        data={query.data}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        loading={
          <View style={{ gap: spacing.lg }}>
            <Skeleton height={88} rounded={radius.md} />
            <Skeleton height={120} rounded={radius.md} />
          </View>
        }
        empty={<EmptyState icon="people" title="That account is gone" body="It may have been deleted." />}
      >
        {(detail) => <PersonBody detail={detail} />}
      </AsyncView>
    </ScreenScroll>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="title3" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function PersonBody({ detail }: { detail: AdminPersonDetailDTO }) {
  const { user } = useAuth();
  const palette = useBrandColors();
  const person = detail.user;
  const handle = person.handle ? `@${person.handle}` : "No handle yet";
  const options = actionsFor(person, user?.id ?? "");

  const counts: [string, number][] = [
    ["Works", detail.counts.posts],
    ["Wall notes", detail.counts.comments],
    ["Community posts", detail.counts.communityPosts],
    ["Following", detail.counts.following],
    ["Followers", detail.counts.followers],
    ["Reports they filed", detail.counts.reportsFiled],
    ["Reports about them", detail.counts.reportsReceived],
  ];

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <ArtistAvatar url={person.avatarUrl} name={person.name} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="title2" selectable>
            {person.name}
          </ThemedText>
          <ThemedText variant="subheadline" tone="muted" selectable>
            {handle} · {roleLabel(person.role)}
          </ThemedText>
          {person.artistApproved !== null ? (
            <ThemedText variant="footnote" tone="muted">
              {person.artistApproved ? "Approved artist" : "Artist request waiting"}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {person.suspension ? (
        <View
          accessibilityRole="alert"
          style={{
            gap: spacing.xxs,
            padding: spacing.md,
            borderRadius: radius.md,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: palette.danger,
          }}
        >
          <ThemedText variant="headline" tone="danger">
            Suspended
          </ThemedText>
          <ThemedText variant="callout">
            Since {dateFormat.format(new Date(person.suspension.at))}
            {person.suspension.by ? ` by ${person.suspension.by}` : ""}.
          </ThemedText>
          {person.suspension.reason ? (
            <ThemedText variant="callout" tone="muted" selectable>
              Reason: {person.suspension.reason}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <Section title="Details">
        <ListGroup>
          <ListRow title="Email" subtitle={person.email} showChevron={false} />
          <ListRow title="Joined" value={dateFormat.format(new Date(person.createdAt))} showChevron={false} />
          <ListRow
            title="Accepted guidelines"
            value={person.termsAcceptedAt ? dateFormat.format(new Date(person.termsAcceptedAt)) : "Not yet"}
            showChevron={false}
            separator={Boolean(person.handle)}
          />
          {person.handle ? (
            <ListRow
              icon="studio"
              title="Open public profile"
              onPress={() => router.push({ pathname: "/person/[handle]", params: { handle: person.handle ?? "" } })}
              separator={false}
            />
          ) : null}
        </ListGroup>
        {person.bio || person.artistBio ? (
          <ThemedText variant="callout" tone="muted" selectable>
            {person.artistBio ?? person.bio}
          </ThemedText>
        ) : null}
      </Section>

      <Section title="Activity so far">
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: spacing.lg, rowGap: spacing.xs }}>
          {counts.map(([label, count]) => (
            <ThemedText key={label} variant="headline" style={{ fontVariant: ["tabular-nums"] }}>
              {count}
              <ThemedText variant="subheadline" tone="muted">
                {` ${label}`}
              </ThemedText>
            </ThemedText>
          ))}
        </View>
      </Section>

      <Section title="Recent activity">
        {detail.recentActivity.length === 0 ? (
          <ThemedText variant="callout" tone="muted">
            Nothing posted yet.
          </ThemedText>
        ) : (
          <View>
            {detail.recentActivity.map((item) => (
              <View
                key={`${item.kind}-${item.id}`}
                style={{
                  gap: 2,
                  paddingVertical: spacing.xs,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: palette.separator,
                }}
              >
                <ThemedText variant="footnote" tone="muted">
                  {ACTIVITY_KIND[item.kind]} · {dateFormat.format(new Date(item.createdAt))}
                  {item.hidden ? " · Hidden" : ""}
                </ThemedText>
                <ThemedText variant="callout" numberOfLines={3}>
                  {item.text ?? "No text"}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="What you can do">
        <ActionPanel personId={person.id} personName={person.name} options={options} />
      </Section>

      <Section title="History">
        {detail.audit.length === 0 ? (
          <ThemedText variant="callout" tone="muted">
            Nothing has been done to this account yet.
          </ThemedText>
        ) : (
          <View>
            {detail.audit.map((entry) => (
              <View
                key={entry.id}
                style={{
                  gap: 2,
                  paddingVertical: spacing.xs,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: palette.separator,
                }}
              >
                <ThemedText variant="headline">
                  {auditLabel(entry.action)}
                  {entry.change ? `: ${roleName(entry.change.from)} to ${roleName(entry.change.to)}` : ""}
                </ThemedText>
                <ThemedText variant="footnote" tone="muted">
                  {dateTimeFormat.format(new Date(entry.createdAt))}
                  {entry.actor ? ` · by ${entry.actor.name}` : ""}
                </ThemedText>
                {entry.reason ? (
                  <ThemedText variant="callout" tone="muted" selectable>
                    “{entry.reason}”
                  </ThemedText>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Section>
    </View>
  );
}

function roleName(raw: string): string {
  return raw === "VIEWER" || raw === "ARTIST" || raw === "ADMIN" ? roleLabel(raw) : raw;
}

function ActionPanel({
  personId,
  personName,
  options,
}: {
  personId: string;
  personName: string;
  options: PersonActionOption[];
}) {
  const act = useAdminPersonAction();
  const [chosen, setChosen] = useState<PersonActionOption | null>(null);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const problem = reasonProblem(reason);

  const reset = () => {
    setChosen(null);
    setReason("");
    setTouched(false);
  };

  const submit = () => {
    if (!chosen) return;
    if (problem) {
      setTouched(true);
      return;
    }
    setError(null);
    setMessage(null);
    act.mutate(
      { id: personId, ...inputFor(chosen, reason) },
      {
        onSuccess: () => {
          const done = `${chosen.label}: done for ${personName}.`;
          setMessage(done);
          AccessibilityInfo.announceForAccessibility(done);
          reset();
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "That did not go through. Try again.");
        },
      },
    );
  };

  if (options.length === 0) {
    return (
      <EmptyState
        icon="info"
        title="Nothing to do here"
        body="This account is a reserved house identity, so it is not managed from this screen."
      />
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {message ? (
        <ThemedText variant="callout" accessibilityLiveRegion="polite">
          {message}
        </ThemedText>
      ) : null}
      {error ? (
        <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}

      {chosen ? (
        <View style={{ gap: spacing.sm }}>
          <ThemedText variant="headline">{chosen.label}</ThemedText>
          <ThemedText variant="callout" tone="muted">
            {chosen.consequence}
          </ThemedText>
          <TextField
            label="Why? (kept in the history)"
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              setError(null);
            }}
            onBlur={() => setTouched(true)}
            multiline
            maxLength={REASON_MAX}
            showCount
            autoFocus
            error={touched ? problem : null}
          />
          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            <Button title="Cancel" variant="secondary" onPress={reset} disabled={act.isPending} style={{ flex: 1 }} />
            <Button
              title={chosen.confirmLabel}
              accessibilityLabel={chosen.label}
              variant={chosen.destructive ? "destructive" : "primary"}
              loading={act.isPending}
              disabled={act.isPending}
              onPress={submit}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        options.map((option) => (
          <Button
            key={option.id}
            title={option.label}
            variant={option.destructive ? "destructive" : "secondary"}
            onPress={() => {
              setChosen(option);
              setMessage(null);
              setError(null);
            }}
          />
        ))
      )}
    </View>
  );
}
