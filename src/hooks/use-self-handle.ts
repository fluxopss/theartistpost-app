import { useMe } from "@/api/hooks";
import { useAuth } from "@/auth";
import { resolveSelfHandle } from "@/domain/people/self-handle";

/** The signed-in person's handle, or null when signed out or still unknown. */
export function useSelfHandle(): string | null {
  const { user } = useAuth();
  const me = useMe(Boolean(user));
  if (!user) return null;
  return resolveSelfHandle({
    authHandle: user.handle,
    artistHandle: user.artist?.handle,
    profileHandle: me.data?.user.handle,
  });
}
