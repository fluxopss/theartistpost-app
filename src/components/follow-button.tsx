import { Alert, type StyleProp, type ViewStyle } from "react-native";

import { isApiError } from "@/api/errors";
import { useToggleFollow } from "@/api/hooks";
import { Button } from "@/components/button";
import { useCommunityGate } from "@/hooks/use-community-gate";

/**
 * Follow / Following for one person. Optimistic through `useToggleFollow`;
 * guests are sent to Join and new members to Welcome first.
 */
export function FollowButton({
  handle,
  following,
  style,
}: {
  handle: string;
  following: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const toggle = useToggleFollow(handle);
  const { ensureMember } = useCommunityGate();

  const onPress = () => {
    if (!ensureMember()) return;
    toggle.mutate(undefined, {
      onError: (cause) =>
        Alert.alert(
          following ? "Could not unfollow" : "Could not follow",
          isApiError(cause) ? cause.message : "Try again in a moment.",
        ),
    });
  };

  return (
    <Button
      title={following ? "Following" : "Follow"}
      variant={following ? "secondary" : "primary"}
      tone="teal"
      icon={following ? "check" : "plus"}
      accessibilityLabel={following ? `Following @${handle}. Double tap to unfollow` : `Follow @${handle}`}
      disabled={toggle.isPending}
      onPress={onPress}
      style={style}
    />
  );
}
