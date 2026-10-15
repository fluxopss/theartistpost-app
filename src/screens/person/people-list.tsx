import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useFollowers, useFollowing } from "@/api/hooks";
import type { PersonSummaryDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PersonRow } from "@/components/person-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { spacing } from "@/theme";

function useList(handle: string, list: "followers" | "following") {
  const followers = useFollowers(list === "followers" ? handle : "");
  const following = useFollowing(list === "following" ? handle : "");
  return list === "followers" ? followers : following;
}

/** Followers or following for one person (the route's `list` segment). */
export function PeopleListScreen() {
  const params = useLocalSearchParams<{ handle: string; list: string }>();
  const list = params.list === "following" ? "following" : "followers";
  const handle = params.handle ?? "";
  const query = useList(handle, list);
  const people: PersonSummaryDTO[] | undefined = query.data?.pages.flatMap((page) => page.items);
  const title = list === "followers" ? "Followers" : "Following";

  return (
    <>
      <Stack.Screen options={{ title, headerLargeTitleEnabled: false }} />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        <AsyncView
          data={people}
          isPending={query.isPending}
          error={query.error}
          offline={isApiError(query.error) && query.error.offline}
          onRetry={() => void query.refetch()}
          isRefetching={query.isRefetching}
          isEmpty={(rows) => rows.length === 0}
          loading={
            <View style={{ gap: spacing.md }}>
              <Skeleton height={56} />
              <Skeleton height={56} />
              <Skeleton height={56} />
            </View>
          }
          empty={
            <EmptyState
              icon="people"
              title={list === "followers" ? "No followers yet" : "Not following anyone yet"}
              body={list === "followers" ? "When someone follows @" + handle + ", they show up here." : undefined}
            />
          }
        >
          {(rows) => (
            <View>
              {rows.map((person) => (
                <PersonRow key={person.id} person={person} />
              ))}
              {query.hasNextPage ? (
                <Button
                  title={query.isFetchingNextPage ? "Loading…" : "Show more"}
                  variant="secondary"
                  loading={query.isFetchingNextPage}
                  onPress={() => void query.fetchNextPage()}
                  style={{ marginTop: spacing.md }}
                />
              ) : null}
            </View>
          )}
        </AsyncView>
      </ScreenScroll>
    </>
  );
}
