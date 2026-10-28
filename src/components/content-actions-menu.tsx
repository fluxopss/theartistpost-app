import { router } from "expo-router";
import { ActionSheetIOS, AccessibilityInfo, Alert, Pressable } from "react-native";

import { isApiError } from "@/api/errors";
import { useBlock } from "@/api/hooks";
import type { ReportTargetType } from "@/api/types";
import { useAuth } from "@/auth";
import { Icon } from "@/components/icon";
import { androidAlertPage, type MenuAction } from "@/domain/app/action-menu";
import { minTapTarget, useBrandColors } from "@/theme";

/**
 * The ellipsis on any piece of community content: report it, block its
 * author, or delete it (your own, or anyone's for an admin). Self-contained so
 * any screen can mount it.
 * iOS uses an action sheet; Android has none, so it gets an alert that pages
 * through the actions (an Android alert holds three buttons at most).
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
    // Callers pass onDelete only when deleting is allowed (own content, or an
    // admin where the server permits it), so the menu trusts its presence.
    if (onDelete) {
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

    const showPage = (page: number) => {
      Alert.alert(
        "Actions",
        undefined,
        androidAlertPage(actions, page).map((button) => ({
          text: button.text,
          style: button.style,
          onPress: () => {
            if (button.pick === "more") showPage(page + 1);
            else if (typeof button.pick === "number") actions[button.pick]?.run();
          },
        })),
      );
    };
    showPage(0);
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
