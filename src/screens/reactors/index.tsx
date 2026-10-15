import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { isApiError } from "@/api/errors";
import { useReactors } from "@/api/hooks";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ModalBar } from "@/components/modal-bar";
import { PersonRow } from "@/components/person-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { ThemedText } from "@/components/themed-text";
import { REACTION_EMOJI, type Reaction } from "@/domain/community/reactions";
import { spacing } from "@/theme";

/**
 * Who reacted to a post, newest first, each with their emoji. A plain list:
 * tap a person to open their profile. Never a leaderboard.
 */
export function ReactorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useReactors(id ?? "");
  const rows = query.data?.pages.flatMap((page) => page.items);

  return (
    <>
      <ModalBar title="Who reacted" />
      <ScreenScroll refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
        <AsyncView
          data={rows}
          isPending={query.isPending}
          error={query.error}
          offline={isApiError(query.error) && query.error.offline}
          onRetry={() => void query.refetch()}
          isRefetching={query.isRefetching}
          isEmpty={(list) => list.length === 0}
          loading={
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={56} />
              <Skeleton height={56} />
              <Skeleton height={56} />
            </View>
          }
          empty={
            <EmptyState
              icon="sparkle"
              title="No reactions yet"
              body="Be the first to cheer this on."
            />
          }
        >
          {(list) => (
            <View>
              {list.map((row) => (
                <View
                  key={`${row.person.id}:${row.reaction}`}
                  style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
                >
                  <ThemedText
                    variant="title3"
                    accessibilityLabel={reactionName(row.reaction)}
                    style={{ width: 32, textAlign: "center" }}
                  >
                    {REACTION_EMOJI[row.reaction]}
                  </ThemedText>
                  <View style={{ flex: 1 }}>
                    <PersonRow person={row.person} />
                  </View>
                </View>
              ))}
              {query.hasNextPage ? (
                <Button
                  title="Show more"
                  variant="secondary"
                  loading={query.isFetchingNextPage}
                  onPress={() => void query.fetchNextPage()}
                />
              ) : null}
            </View>
          )}
        </AsyncView>
      </ScreenScroll>
    </>
  );
}

function reactionName(reaction: Reaction): string {
  return reaction.charAt(0) + reaction.slice(1).toLowerCase();
}
