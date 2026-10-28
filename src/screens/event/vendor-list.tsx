import { View } from "react-native";

import { ListGroup, ListRow } from "@/components/list-row";
import { ThemedText } from "@/components/themed-text";
import type { Vendor } from "@/domain/events/sponsors";
import { spacing } from "@/theme";
import { openExternal } from "@/utils/links";

/** "Food & vendors" on a night: who's there, what they serve, their own link. Nothing without vendors. */
export function VendorList({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) return null;
  return (
    <View testID="vendor-list" style={{ gap: spacing.xs }}>
      <View style={{ gap: spacing.xxs }}>
        <ThemedText variant="title3" accessibilityRole="header">
          Food & vendors
        </ThemedText>
        <ThemedText variant="footnote" tone="muted">
          Local makers sharing the night with us.
        </ThemedText>
      </View>
      <ListGroup>
        {vendors.map((vendor, index) => {
          const url = vendor.url;
          return (
            <ListRow
              key={`${vendor.name}-${index}`}
              icon="food"
              title={vendor.name}
              subtitle={vendor.offering || undefined}
              onPress={url ? () => void openExternal(url) : undefined}
              external={Boolean(url)}
              accessibilityHint={url ? "Opens their website" : undefined}
              separator={index < vendors.length - 1}
            />
          );
        })}
      </ListGroup>
    </View>
  );
}
