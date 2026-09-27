import { router, Stack } from "expo-router";
import { View } from "react-native";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ListGroup } from "@/components/list-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { copy } from "@/content/site";
import type { SavedEvent } from "@/domain/app/studio";
import { formatNightWhen } from "@/domain/night/program";
import { useSaves } from "@/storage/saves";
import { duration, spacing } from "@/theme";
import { tabRoutes } from "@/utils/links";

import { DateBlock } from "./date-block";
import { SavedRow } from "./saved-row";

/** A removed row fades; the rows below slide up to close the gap. */
const rowExit = FadeOut.duration(duration.fast);
const rowLayout = LinearTransition.duration(duration.base);

/** Eastern date parts for a saved night, or null if the stored start is unreadable. */
function nightWhen(event: SavedEvent) {
  if (Number.isNaN(new Date(event.start).getTime())) return null;
  return formatNightWhen({ start: event.start, end: event.start });
}

/** Works and nights kept on this phone. */
export function SavedScreen() {
  const { saves, count, toggleEvent, togglePost } = useSaves();
  const hasNights = saves.events.length > 0;
  const hasWorks = saves.posts.length > 0;

  return (
    <>
      <Stack.Screen options={{ title: "Saved" }} />
      <ScreenScroll>
        {count === 0 ? (
          <EmptyState
            icon="bookmark"
            title="Nothing saved yet"
            body="Open a work on The Wall or a night on the Schedule and keep it here — on this phone only."
            action={
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.xs }}>
                <Button
                  title={copy.house.wallCta}
                  icon="wall"
                  tone="teal"
                  onPress={() => router.navigate(tabRoutes.wall)}
                />
                <Button
                  title="See the schedule"
                  icon="schedule"
                  variant="secondary"
                  onPress={() => router.navigate(tabRoutes.schedule)}
                />
              </View>
            }
          />
        ) : null}

        {hasNights ? (
          <ListGroup header="Nights" footer={hasWorks ? undefined : "Kept on this phone only."}>
            {saves.events.map((event, index) => {
              const when = nightWhen(event);
              return (
                <Animated.View key={event.id} exiting={rowExit} layout={rowLayout}>
                  <SavedRow
                    title={event.title}
                    detail={when ? `${when.weekday} · ${when.time} · ${event.venue}` : event.venue}
                    accessibilityLabel={
                      when
                        ? `${event.title}. ${when.weekday} ${when.month} ${when.day}, ${when.time} Eastern. ${event.venue}.`
                        : `${event.title}. ${event.venue}.`
                    }
                    accessibilityHint="Opens the night"
                    leading={when ? <DateBlock month={when.month} day={when.day} /> : undefined}
                    href={{ pathname: "/event/[id]", params: { id: event.id } }}
                    onRemove={() => toggleEvent(event)}
                    separator={index < saves.events.length - 1}
                  />
                </Animated.View>
              );
            })}
          </ListGroup>
        ) : null}

        {hasWorks ? (
          <ListGroup header="Works" footer="Kept on this phone only.">
            {saves.posts.map((post, index) => (
              <Animated.View key={post.id} exiting={rowExit} layout={rowLayout}>
                <SavedRow
                  title={post.title}
                  detail={post.artist}
                  accessibilityLabel={`${post.title}. ${post.artist}.`}
                  accessibilityHint="Opens the work"
                  href={{ pathname: "/post/[slug]", params: { slug: post.slug } }}
                  onRemove={() => togglePost(post)}
                  separator={index < saves.posts.length - 1}
                />
              </Animated.View>
            ))}
          </ListGroup>
        ) : null}
      </ScreenScroll>
    </>
  );
}
