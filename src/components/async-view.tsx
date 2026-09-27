import type { ReactNode } from "react";

import { ErrorState } from "@/components/error-state";

/**
 * The four states every data screen has. Loading only shows before the
 * first data arrives; a refetch keeps the old content on screen.
 */
export function AsyncView<T>({
  data,
  isPending,
  error,
  isEmpty,
  onRetry,
  isRefetching = false,
  offline = false,
  loading,
  empty,
  children,
}: {
  data: T | undefined;
  isPending: boolean;
  error: unknown;
  isEmpty?: (data: T) => boolean;
  onRetry?: () => void;
  isRefetching?: boolean;
  offline?: boolean;
  loading: ReactNode;
  empty: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (data !== undefined) {
    if (isEmpty?.(data)) return <>{empty}</>;
    return <>{children(data)}</>;
  }
  if (isPending) return <>{loading}</>;
  if (error) {
    return <ErrorState offline={offline} onRetry={onRetry} retrying={isRefetching} />;
  }
  return <>{empty}</>;
}
