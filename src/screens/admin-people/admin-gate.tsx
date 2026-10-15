import type { ReactNode } from "react";

import { useMe } from "@/api/hooks";
import { useAuth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { ScreenScroll } from "@/components/screen-scroll";
import { Skeleton } from "@/components/skeleton";
import { radius } from "@/theme";

/** Renders `children` only for a signed-in house admin; everyone else gets an honest note. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const me = useMe(Boolean(user));

  if (!user) {
    return (
      <ScreenScroll>
        <EmptyState icon="people" title="Sign in to continue" body="People are managed by house admins." />
      </ScreenScroll>
    );
  }
  if (me.isPending) {
    return (
      <ScreenScroll>
        <Skeleton height={120} rounded={radius.md} />
      </ScreenScroll>
    );
  }
  if (!me.data?.permissions.admin) {
    return (
      <ScreenScroll>
        <EmptyState icon="flag" title="Admins only" body="People are managed by house admins." />
      </ScreenScroll>
    );
  }
  return <>{children}</>;
}
