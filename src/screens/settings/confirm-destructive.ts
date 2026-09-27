import { AccessibilityInfo, Alert } from "react-native";

/**
 * The one place an alert is right: confirming an irreversible clear. Cancel
 * is the default; the destructive button is styled as such. On confirm the
 * UI updates in place and VoiceOver/TalkBack hear what happened — never a
 * success alert.
 */
export function confirmDestructive({
  title,
  message,
  action,
  done,
  onConfirm,
}: {
  title: string;
  message: string;
  /** Label of the destructive button, e.g. "Clear". */
  action: string;
  /** Spoken to screen readers after the action runs. */
  done: string;
  onConfirm: () => void;
}) {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: action,
      style: "destructive",
      onPress: () => {
        onConfirm();
        AccessibilityInfo.announceForAccessibility(done);
      },
    },
  ]);
}
