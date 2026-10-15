/**
 * Did the signed-in person change since the last time we knew who it was?
 * `previous === undefined` means "not resolved yet" (cold start), which must not
 * count as a change so the offline cache survives app launches.
 */
export function identityChanged(previous: string | null | undefined, next: string | null): boolean {
  if (previous === undefined) return false;
  return previous !== next;
}
