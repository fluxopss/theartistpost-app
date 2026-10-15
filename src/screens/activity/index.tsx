import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

import { useAuth } from "@/auth";
import { isApiError } from "@/api/errors";
import { useMarkNotificationsRead, useNotifications } from "@/api/hooks";
import type { NotificationDTO } from "@/api/types";
import { AsyncView } from "@/components/async-view";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { spacing } from "@/theme";

import { NotificationRow } from "./notification-row";

/** The house's replies to you, newest first. Member only. */
export function ActivityScreen() {
  const { user } = useAuth();
  return (
    <>
      <Stack.Screen options={{ title: "Activity" }} />
      {user ? <ActivityFeed /> : <SignedOutActivity />}
    </>
  );
}

function SignedOutActivity() {
  return (
    <ScreenScroll>
      <EmptyState
        icon="people"
        title="Join the house"
        body="Sign in to see who followed you, supported your posts, and replied."
        action={<Button title="Join the house" onPress={() => router.push("/join")} />}
      />
    </ScreenScroll>
  );
}

function ActivityFeed() {
  const query = useNotifications();
  const markRead = useMarkNotificationsRead();
  const { mutate: markAllRead } = markRead;
  const pages = query.data?.pages;
  const unreadCount = pages?.[0]?.unreadCount ?? 0;
  const items: NotificationDTO[] | undefined = pages?.flatMap((page) => page.items);

  // Opening the screen reads everything it shows. Only fires when something is unread.
  useFocusEffect(
    useCallback(() => {
      if (unreadCount > 0) markAllRead(undefined);
    }, [unreadCount, markAllRead]),
  );

  return (
    <ScreenScroll
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      <AsyncView
        data={items}
        isPending={query.isPending}
        error={query.error}
        offline={isApiError(query.error) && query.error.offline}
        onRetry={() => void query.refetch()}
        isRefetching={query.isRefetching}
        isEmpty={(list) => list.length === 0}
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
            title="Nothing yet"
            body="Follow a few artists to get the house talking."
          />
        }
      >
        {(list) => (
          <View style={{ gap: spacing.md }}>
            <ListGroup>
              {list.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} />
              ))}
            </ListGroup>
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
