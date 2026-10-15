import { router } from "expo-router";
import { useCallback } from "react";

import { useMe } from "@/api/hooks";
import { useAuth } from "@/auth";
import { needsWelcome } from "@/domain/people/welcome";

/**
 * Community writes (post, follow, support) need a signed-in member who has
 * accepted the Guidelines and picked a handle. `ensureMember()` returns true
 * when the action may go ahead; otherwise it sends the person to Join or
 * Welcome and returns false.
 */
export function useCommunityGate() {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  const profile = me.data?.user;

  const ensureMember = useCallback((): boolean => {
    if (!user) {
      router.push("/join");
      return false;
    }
    if (profile && needsWelcome(profile)) {
      router.push("/welcome");
      return false;
    }
    return true;
  }, [user, profile]);

  return { ensureMember, signedIn: Boolean(user), me: me.data, profile };
}
