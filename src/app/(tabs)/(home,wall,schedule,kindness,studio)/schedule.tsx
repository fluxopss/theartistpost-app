import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { copy } from "@/content/site";

export default function ScheduleScreen() {
  return (
    <ScreenScroll>
      <ThemedText variant="body" tone="muted">
        {copy.schedule.supportLine}
      </ThemedText>
    </ScreenScroll>
  );
}
