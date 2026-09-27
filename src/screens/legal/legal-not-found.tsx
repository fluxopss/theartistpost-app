import { router, Stack } from "expo-router";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";

/** A legal link that points nowhere — say so, and point to where the real ones live. */
export function LegalNotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <ScreenScroll>
        <EmptyState
          icon="info"
          title="This page isn’t here"
          body="Privacy, Terms, and Support live in Settings."
          action={
            <Button title="Open Settings" variant="secondary" onPress={() => router.replace("/settings")} />
          }
        />
      </ScreenScroll>
    </>
  );
}
