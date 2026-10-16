import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { isApiError } from "@/api/errors";
import { useAdminPeople } from "@/api/hooks";
import type { AdminPersonRowDTO } from "@/api/types";
import { ArtistAvatar } from "@/components/artist-avatar";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { FilterChips } from "@/components/filter-chips";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import {
  DEFAULT_PEOPLE_FILTERS,
  type PeopleFilters,
  peopleQueryParams,
  roleLabel,
} from "@/domain/admin/people";
import { minTapTarget, radius, spacing, useBrandColors } from "@/theme";

import { AdminGate } from "./admin-gate";

const joinedFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const ROLE_OPTIONS: { id: PeopleFilters["role"]; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "VIEWER", label: "Members" },
  { id: "ARTIST", label: "Artists" },
  { id: "ADMIN", label: "Admins" },
];

const STATUS_OPTIONS: { id: PeopleFilters["status"]; label: string }[] = [
  { id: "all", label: "Any status" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
];

const PENDING_OPTIONS: { id: "all" | "pending"; label: string }[] = [
  { id: "all", label: "All artists" },
  { id: "pending", label: "Waiting for approval" },
];

/** Admin-only: find anyone in the house by name, @handle or email, then open them. */
export function AdminPeopleScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "People" }} />
      <AdminGate>
        <PeopleSearch />
      </AdminGate>
    </>
  );
}

function PeopleSearch() {
  const [filters, setFilters] = useState<PeopleFilters>(DEFAULT_PEOPLE_FILTERS);
  const [typed, setTyped] = useState("");

  // The server searches; wait for a pause in typing before asking.
  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => ({ ...current, q: typed })), 300);
    return () => clearTimeout(timer);
  }, [typed]);

  const params = useMemo(() => peopleQueryParams(filters), [filters]);
  const query = useAdminPeople(params);
  const rows = query.data?.pages.flatMap((page) => page.items);
  const filtered = Object.keys(params).length > 0;

  return (
    <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()} gap={spacing.md}>
      <TextField
        label="Search"
        value={typed}
        onChangeText={setTyped}
        placeholder="Name, @handle or email"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        maxLength={80}
      />
      <FilterChips
        label="Role"
        options={ROLE_OPTIONS}
        value={filters.role}
        onChange={(role) => setFilters((current) => ({ ...current, role }))}
      />
      <FilterChips
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => setFilters((current) => ({ ...current, status }))}
      />
      <FilterChips
        label="Artist approval"
        options={PENDING_OPTIONS}
        value={filters.pendingArtist ? "pending" : "all"}
        onChange={(id) => setFilters((current) => ({ ...current, pendingArtist: id === "pending" }))}
      />
      <AsyncView
        data={rows}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0 && !query.hasNextPage}
        loading={
          <View style={{ gap: spacing.md }}>
            <Skeleton height={64} rounded={radius.md} />
            <Skeleton height={64} rounded={radius.md} />
            <Skeleton height={64} rounded={radius.md} />
          </View>
        }
        empty={
          <EmptyState
            icon="people"
            title={filtered ? "No one matches that" : "No one has joined yet"}
            body={filtered ? "Try a different name, or clear a filter." : "When people join the house, they show up here."}
          />
        }
      >
        {(list) => (
          <View>
            {list.map((person) => (
              <PersonLine key={person.id} person={person} />
            ))}
            {query.hasNextPage ? (
              <View style={{ paddingTop: spacing.md }}>
                <Button
                  title={query.isFetchingNextPage ? "Loading…" : "Show more"}
                  variant="secondary"
                  loading={query.isFetchingNextPage}
                  disabled={query.isFetchingNextPage}
                  onPress={() => void query.fetchNextPage()}
                />
              </View>
            ) : null}
          </View>
        )}
      </AsyncView>
    </ScreenScroll>
  );
}

function PersonLine({ person }: { person: AdminPersonRowDTO }) {
  const palette = useBrandColors();
  const joined = joinedFormat.format(new Date(person.createdAt));
  const handle = person.handle ? `@${person.handle}` : "No handle yet";
  const status = person.suspended
    ? "Suspended"
    : person.artistApproved === false
      ? "Waiting for approval"
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${person.name}, ${handle}, ${roleLabel(person.role)}${status ? `, ${status}` : ""}, joined ${joined}`}
      accessibilityHint="Opens their details"
      onPress={() => router.push({ pathname: "/manage-person/[id]", params: { id: person.id } })}
      style={({ pressed }) => ({
        minHeight: minTapTarget + spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: palette.separator,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ArtistAvatar url={person.avatarUrl} name={person.name} size={44} />
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline" numberOfLines={1}>
          {person.name}
        </ThemedText>
        <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
          {handle} · {roleLabel(person.role)}
        </ThemedText>
        <ThemedText variant="footnote" tone="muted" numberOfLines={1}>
          Joined {joined}
          {status ? ` · ${status}` : ""}
        </ThemedText>
      </View>
    </Pressable>
  );
}
