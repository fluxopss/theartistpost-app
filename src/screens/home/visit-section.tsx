import { View } from "react-native";

import { FramedImage } from "@/components/framed-image";
import { ListGroup, ListRow } from "@/components/list-row";
import { OpenStatusPill } from "@/components/open-status-pill";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { copy, site } from "@/content/site";
import { spacing } from "@/theme";
import { brandImages } from "@/utils/brand-images";
import { contact } from "@/utils/links";

/** The live room on Clematis: where it is, when it's open, how to reach it. */
export function VisitSection() {
  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader eyebrow="The live room" eyebrowTone="spark-coral" title={copy.home.haciendaTitle} />
      <FramedImage
        source={brandImages.haciendaHero}
        alt="The Artist Post live space at Hacienda on Clematis Street"
      />
      <ThemedText variant="body" tone="muted">
        {copy.home.haciendaBody}
      </ThemedText>
      <OpenStatusPill />
      <ListGroup>
        <ListRow
          icon="directions"
          title="Get directions"
          subtitle={site.address.full}
          onPress={contact.directions}
          external
        />
        <ListRow icon="phone" title="Call" value={site.phone} onPress={contact.call} external />
        <ListRow
          icon="email"
          title="Email Robbie"
          subtitle={site.email}
          onPress={() => contact.email()}
          external
          separator={false}
        />
      </ListGroup>
    </View>
  );
}
