import { ScreenScroll } from "@/components/screen-scroll";
import { ThemedText } from "@/components/themed-text";
import { appCopy } from "@/content/site";

export default function StudioScreen() {
  return (
    <ScreenScroll>
      <ThemedText variant="body" tone="muted">
        {appCopy.studioLead}
      </ThemedText>
    </ScreenScroll>
  );
}
