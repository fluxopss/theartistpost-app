import { router } from "expo-router";
import { ActionSheetIOS, AccessibilityInfo, Alert, Pressable } from "react-native";

import { isApiError } from "@/api/errors";
import { useBlock } from "@/api/hooks";
import type { ReportTargetType } from "@/api/types";
import { useAuth } from "@/auth";
import { Icon } from "@/components/icon";
import { minTapTarget, useBrandColors } from "@/theme";

type MenuAction = {
  label: string;
  destructive?: boolean;
  run: () => void;
};

/**
 * The ellipsis on any piece of community content: report it, block its
 * author, or delete your own. Self-contained so any screen can mount it.
 * iOS uses an action sheet; Android uses an alert (three buttons at most).
 */
export function ContentActionsMenu({
  target,
  authorHandle,
  isOwn = false,
  onDelete,
}: {
  target: { type: ReportTargetType; id: string };
  authorHandle?: string;
  isOwn?: boolean;
  onDelete?: () => void;
}) {
  const { user } = useAuth();
  const block = useBlock();
  const palette = useBrandColors();

  const openReport = () => {
    router.push({ pathname: "/report", params: { type: target.type, id: target.id } });
  };

  const confirmBlock = (handle: string) => {
    Alert.alert(
      `Block @${handle}?`,
      "You won’t see each other’s posts, notes or profiles. Follows between you are removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            block.mutate(handle, {
              onSuccess: () => AccessibilityInfo.announceForAccessibility(`Blocked @${handle}`),
              onError: (cause) =>
                Alert.alert(
                  "Could not block",
                  isApiError(cause) ? cause.message : "Try again in a moment.",
                ),
            });
          },
        },
      ],
    );
  };

  const actions: MenuAction[] = [];
  if (!user) {
    actions.push({ label: "Sign in to report", run: () => router.push("/join") });
  } else {
    if (!isOwn) actions.push({ label: "Report…", run: openReport });
    if (!isOwn && authorHandle) {
      actions.push({
        label: `Block @${authorHandle}`,
        destructive: true,
        run: () => confirmBlock(authorHandle),
      });
    }
    if (isOwn && onDelete) {
      actions.push({
        label: "Delete",
        destructive: true,
        run: () =>
          Alert.alert("Delete this?", "It will be removed for everyone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                onDelete();
                AccessibilityInfo.announceForAccessibility("Deleted");
              },
            },
          ]),
      });
    }
  }

  if (actions.length === 0) return null;

  const openMenu = () => {
    if (process.env.EXPO_OS === "ios") {
      const labels = [...actions.map((a) => a.label), "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: labels,
          cancelButtonIndex: labels.length - 1,
          destructiveButtonIndex: actions
            .map((a, index) => (a.destructive ? index : -1))
            .filter((index) => index >= 0),
        },
        (buttonIndex) => {
          const picked = actions[buttonIndex];
          if (picked) picked.run();
        },
      );
      return;
    }

    Alert.alert(
      "Actions",
      undefined,
      [
        ...actions.map((a) => ({
          text: a.label,
          style: a.destructive ? ("destructive" as const) : ("default" as const),
          onPress: a.run,
        })),
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="More actions"
      accessibilityHint="Report, block or delete"
      hitSlop={6}
      onPress={openMenu}
      style={{
        width: minTapTarget,
        height: minTapTarget,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="more" size={22} color={palette.textMuted} />
    </Pressable>
  );
}
