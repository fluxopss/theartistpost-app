/**
 * Whether to show the admin entry points. Signed out always means no: the
 * cached `me` of a previous admin session can outlive sign-out, and must
 * never reopen the admin group on a signed-out device.
 */
export function isHouseAdmin(
  signedIn: boolean,
  permissions: { admin?: boolean } | null | undefined,
): boolean {
  return signedIn && permissions?.admin === true;
}
