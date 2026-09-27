import { router } from "expo-router";
import { View } from "react-native";

import { useFeaturedNight } from "@/api/hooks";
import { SectionHeader } from "@/components/section-header";
import { TicketPass } from "@/components/ticket-pass";
import { copy } from "@/content/site";
import { formatNightWhen, stampWord } from "@/domain/night/program";
import { spacing } from "@/theme";

/**
 * The next night as a ticket stub. Renders nothing until a real night is on
 * the board — no placeholder ticket, no loading spinner on the home page.
 */
export function NightTeaser() {
  const { data } = useFeaturedNight();
  const event = data?.event;
  if (!event || !data.phase) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader eyebrow={copy.night.kicker} eyebrowTone="spark-gold" title={copy.night.hold} />
      <TicketPass
        variant="teaser"
        title={event.title}
        venue={event.venue}
        when={formatNightWhen(event)}
        stamp={stampWord(data.phase)}
        onPress={() => router.push("/night")}
      />
    </View>
  );
}
