import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { GlassSurface } from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import { ThemedText } from "@/components/themed-text";
import {
  REACTIONS,
  REACTION_EMOJI,
  REACTION_LABEL,
  reactionAccessibilityLabel,
  totalReactions,
  type Reaction,
  type ReactionState,
} from "@/domain/community/reactions";
import { minTapTarget, radius, spacing, springs, useBrandColors } from "@/theme";

const OPTION_SIZE = 48;
const PILL_PADDING = spacing.xs;
const PILL_WIDTH = REACTIONS.length * OPTION_SIZE + PILL_PADDING * 2;
const PILL_HEIGHT = OPTION_SIZE + PILL_PADDING * 2;

type Anchor = { x: number; y: number; width: number; height: number };

function lightHaptic() {
  if (process.env.EXPO_OS === "ios") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function pickerOpenHaptic() {
  if (process.env.EXPO_OS === "ios") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

function selectionHaptic() {
  if (process.env.EXPO_OS === "ios") void Haptics.selectionAsync();
}

/**
 * The reaction control: a tap gives the default (Support) or takes your
 * reaction back; touch and hold opens a small picker of the five kind
 * reactions. VoiceOver / TalkBack get the same choices as custom actions.
 */
export function ReactionButton({
  state,
  onSelect,
  defaultReaction = "SUPPORT",
  disabled = false,
}: {
  state: ReactionState;
  /** What a plain tap gives when the viewer has not reacted yet. */
  defaultReaction?: Reaction;
  /** `null` takes the viewer's reaction back. */
  onSelect: (reaction: Reaction | null) => void;
  disabled?: boolean;
}) {
  const palette = useBrandColors();
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const mine = state.viewerReaction;
  const total = totalReactions(state.reactionCounts);

  const choose = (next: Reaction | null) => {
    setAnchor(null);
    onSelect(next);
  };

  const openPicker = () => {
    if (disabled) return;
    ref.current?.measureInWindow((x, y, width, height) => {
      pickerOpenHaptic();
      setAnchor({ x, y, width, height });
    });
  };

  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={reactionAccessibilityLabel(state)}
        accessibilityState={{ selected: mine !== null, disabled }}
        accessibilityActions={[
          ...REACTIONS.map((reaction) => ({ name: reaction, label: REACTION_LABEL[reaction] })),
          ...(mine ? [{ name: "REMOVE", label: "Take my reaction back" }] : []),
        ]}
        onAccessibilityAction={(event) => {
          const name = event.nativeEvent.actionName;
          if (name === "REMOVE") choose(null);
          else if ((REACTIONS as readonly string[]).includes(name)) choose(name as Reaction);
        }}
        delayLongPress={260}
        hitSlop={spacing.xxs}
        disabled={disabled}
        onPress={() => {
          lightHaptic();
          choose(mine ? null : defaultReaction);
        }}
        onLongPress={openPicker}
        style={({ pressed }) => ({
          minHeight: minTapTarget,
          minWidth: minTapTarget,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xxs,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        {mine ? (
          <ThemedText variant="title3" accessibilityElementsHidden importantForAccessibility="no">
            {REACTION_EMOJI[mine]}
          </ThemedText>
        ) : (
          <Icon name="sparkle" size={20} color={palette.textMuted} />
        )}
        <ThemedText
          variant="subheadline"
          tone={mine ? "accent" : "muted"}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {mine ? REACTION_LABEL[mine] : "React"}
          {total > 0 ? ` · ${total}` : ""}
        </ThemedText>
      </Pressable>

      {anchor ? <ReactionPicker anchor={anchor} selected={mine} onPick={choose} onClose={() => setAnchor(null)} /> : null}
    </>
  );
}

function ReactionPicker({
  anchor,
  selected,
  onPick,
  onClose,
}: {
  anchor: Anchor;
  selected: Reaction | null;
  onPick: (next: Reaction | null) => void;
  onClose: () => void;
}) {
  const palette = useBrandColors();
  const { width: screenWidth } = useWindowDimensions();

  const left = Math.min(Math.max(anchor.x - spacing.xs, spacing.md), screenWidth - PILL_WIDTH - spacing.md);
  const above = anchor.y - PILL_HEIGHT - spacing.xs;
  const top = above > spacing.xxxl ? above : anchor.y + anchor.height + spacing.xs;

  return (
    <Modal transparent animationType="fade" statusBarTranslucent visible onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close reactions"
        onPress={onClose}
        style={{ flex: 1 }}
      >
        <Animated.View
          entering={ZoomIn.springify().damping(springs.bouncy.damping).stiffness(springs.bouncy.stiffness)}
          style={{ position: "absolute", left, top, width: PILL_WIDTH, height: PILL_HEIGHT }}
        >
          <GlassSurface interactive style={{ borderRadius: radius.pill, flex: 1 }}>
            <View
              accessibilityRole="menu"
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: PILL_PADDING,
              }}
            >
              {REACTIONS.map((reaction) => {
                const active = reaction === selected;
                return (
                  <Pressable
                    key={reaction}
                    accessibilityRole="menuitem"
                    accessibilityLabel={REACTION_LABEL[reaction]}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      selectionHaptic();
                      onPick(active ? null : reaction);
                    }}
                    style={({ pressed }) => ({
                      width: OPTION_SIZE,
                      height: OPTION_SIZE,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: radius.pill,
                      backgroundColor: active ? palette.accentSoft : "transparent",
                      transform: [{ scale: pressed ? 1.25 : 1 }],
                    })}
                  >
                    <ThemedText variant="title2" accessibilityElementsHidden importantForAccessibility="no">
                      {REACTION_EMOJI[reaction]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </GlassSurface>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
