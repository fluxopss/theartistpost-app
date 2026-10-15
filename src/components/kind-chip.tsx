import { View } from "react-native";

import type { CommunityKind } from "@/api/types";
import { ThemedText, type TextTone } from "@/components/themed-text";
import { COMMUNITY_KINDS } from "@/domain/community/compose";
import { radius, spacing, useBrandColors } from "@/theme";

const tones: Record<CommunityKind, TextTone> = {
  SHOUTOUT: "spark-coral",
  COLLAB: "spark-teal",
  SHOWING: "spark-gold",
  ASK: "spark-violet",
  KINDNESS: "spark-coral",
  UPDATE: "muted",
};

export function kindLabel(kind: CommunityKind): string {
  return COMMUNITY_KINDS.find((option) => option.id === kind)?.label ?? kind;
}

/** The small label that says what kind of post this is. */
export function KindChip({ kind }: { kind: CommunityKind }) {
  const palette = useBrandColors();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
        backgroundColor: palette.bgDeep,
      }}
    >
      <ThemedText variant="caption" tone={tones[kind]}>
        {kindLabel(kind)}
      </ThemedText>
    </View>
  );
}
