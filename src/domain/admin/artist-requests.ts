import type { AdminUserRowDTO } from "@/api/types";

/**
 * Splits admin member rows into artist requests awaiting approval and approved
 * artists. Members with no artist profile are not requests. Reserved seed
 * identities are never shown. Order is kept as the server sent it.
 */
export function partitionArtistRequests(users: AdminUserRowDTO[]): {
  pending: AdminUserRowDTO[];
  approved: AdminUserRowDTO[];
} {
  const pending: AdminUserRowDTO[] = [];
  const approved: AdminUserRowDTO[] = [];
  for (const user of users) {
    if (user.deniedSeed || user.artistApproved === null) continue;
    if (user.artistApproved) approved.push(user);
    else pending.push(user);
  }
  return { pending, approved };
}
