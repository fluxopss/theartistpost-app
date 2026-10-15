import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { Stack } from "expo-router";
import { type ReactNode, useState } from "react";
import { AccessibilityInfo, Alert, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useAdminUsers, useMe, useUpdateAdminUser } from "@/api/hooks";
import type { AdminUserRowDTO } from "@/api/types";
import { useAuth } from "@/auth";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { partitionArtistRequests } from "@/domain/admin/artist-requests";
import { radius, screenMargin, spacing, useBrandColors, useBrandScheme } from "@/theme";

type Tab = "pending" | "approved";
const TABS: Tab[] = ["pending", "approved"];

const joinedFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Admin-only: artists who asked to publish (pending) and artists already approved. */
export function ArtistRequestsScreen() {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const palette = useBrandColors();
  const scheme = useBrandScheme();
  const [tab, setTab] = useState<Tab>("pending");
  const [error, setError] = useState<string | null>(null);

  let body: ReactNode;
  if (!user) {
    body = (
      <ScreenScroll>
        <EmptyState icon="people" title="Sign in to continue" body="Artist requests are for house admins." />
      </ScreenScroll>
    );
  } else if (me.isPending) {
    body = (
      <ScreenScroll>
        <Skeleton height={120} rounded={radius.md} />
      </ScreenScroll>
    );
  } else if (!me.data?.permissions.admin) {
    body = (
      <ScreenScroll>
        <EmptyState icon="flag" title="Admins only" body="Artist requests are handled by house admins." />
      </ScreenScroll>
    );
  } else {
    body = (
      <>
        <View style={{ paddingHorizontal: screenMargin, paddingTop: spacing.md, gap: spacing.sm }}>
          <SegmentedControl
            values={["Pending", "Approved"]}
            selectedIndex={TABS.indexOf(tab)}
            onChange={(event) => {
              const next = TABS[event.nativeEvent.selectedSegmentIndex];
              if (next) {
                setTab(next);
                setError(null);
              }
            }}
            appearance={scheme}
            tintColor={palette.accent}
          />
          {error ? (
            <ThemedText variant="callout" tone="danger" accessibilityLiveRegion="polite">
              {error}
            </ThemedText>
          ) : null}
        </View>
        {tab === "pending" ? <PendingList onError={setError} /> : <ApprovedList onError={setError} />}
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Artist requests" }} />
      {body}
    </>
  );
}

function PendingList({ onError }: { onError: (message: string | null) => void }) {
  const query = useAdminUsers({ pendingArtist: true });
  const items = query.data?.pages.flatMap((page) => page.items);
  const rows = items ? partitionArtistRequests(items).pending : undefined;
  return (
    <RequestList
      query={query}
      rows={rows}
      mode="approve"
      emptyTitle="No artist requests right now."
      emptyBody="When an artist asks to publish to The Wall, the request shows here."
      onError={onError}
    />
  );
}

function ApprovedList({ onError }: { onError: (message: string | null) => void }) {
  const query = useAdminUsers();
  const items = query.data?.pages.flatMap((page) => page.items);
  const rows = items ? partitionArtistRequests(items).approved : undefined;
  return (
    <RequestList
      query={query}
      rows={rows}
      mode="revoke"
      emptyTitle="No approved artists yet."
      emptyBody="Approve a request and the artist shows here."
      onError={onError}
    />
  );
}

type ListQuery = ReturnType<typeof useAdminUsers>;

function RequestList({
  query,
  rows,
  mode,
  emptyTitle,
  emptyBody,
  onError,
}: {
  query: ListQuery;
  rows: AdminUserRowDTO[] | undefined;
  mode: "approve" | "revoke";
  emptyTitle: string;
  emptyBody: string;
  onError: (message: string | null) => void;
}) {
  const update = useUpdateAdminUser();

  const act = (row: AdminUserRowDTO) => {
    const approve = mode === "approve";
    const handle = row.handle ?? row.name;
    Alert.alert(
      approve ? `Approve @${handle}?` : `Revoke @${handle}’s approval?`,
      approve
        ? "They’ll be able to publish to The Wall."
        : "They won’t be able to publish to The Wall until you approve them again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: approve ? "Approve" : "Revoke",
          style: approve ? "default" : "destructive",
          onPress: () => {
            onError(null);
            update.mutate(
              { id: row.id, artistApproved: approve },
              {
                onSuccess: () =>
                  AccessibilityInfo.announceForAccessibility(
                    approve ? `Approved @${handle}` : `Revoked @${handle}`,
                  ),
                onError: (cause) =>
                  onError(
                    isApiError(cause) ? cause.message : "Could not update that artist. Try again.",
                  ),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <AsyncView
        data={rows}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0 && !query.hasNextPage}
        loading={<Skeleton height={120} rounded={radius.md} />}
        empty={<EmptyState icon="studio" title={emptyTitle} body={emptyBody} />}
      >
        {(list) => (
          <View style={{ gap: spacing.md }}>
            {list.map((row) => (
              <RequestCard
                key={row.id}
                row={row}
                mode={mode}
                busy={update.isPending && update.variables?.id === row.id}
                disabled={update.isPending}
                onPress={() => act(row)}
              />
            ))}
            {query.hasNextPage ? (
              <Button
                title={query.isFetchingNextPage ? "Loading…" : "Show older"}
                variant="secondary"
                loading={query.isFetchingNextPage}
                disabled={query.isFetchingNextPage}
                onPress={() => void query.fetchNextPage()}
              />
            ) : null}
          </View>
        )}
      </AsyncView>
    </ScreenScroll>
  );
}

function RequestCard({
  row,
  mode,
  busy,
  disabled,
  onPress,
}: {
  row: AdminUserRowDTO;
  mode: "approve" | "revoke";
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const palette = useBrandColors();
  const approve = mode === "approve";
  return (
    <View
      style={{
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: palette.bgElevated,
      }}
    >
      <ThemedText variant="headline">{row.name}</ThemedText>
      <ThemedText variant="subheadline" tone="muted">
        {row.handle ? `@${row.handle}` : "No handle yet"}
      </ThemedText>
      <ThemedText variant="footnote" tone="muted" selectable>
        {row.email}
      </ThemedText>
      <ThemedText variant="footnote" tone="muted">
        Joined {joinedFormat.format(new Date(row.createdAt))}
      </ThemedText>
      <View style={{ marginTop: spacing.xs }}>
        <Button
          title={approve ? "Approve" : "Revoke"}
          variant={approve ? "primary" : "destructive"}
          loading={busy}
          disabled={disabled}
          accessibilityLabel={`${approve ? "Approve" : "Revoke"} ${row.handle ? `@${row.handle}` : row.name}`}
          onPress={onPress}
        />
      </View>
    </View>
  );
}
