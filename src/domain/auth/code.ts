/** The house sign-in code is always six digits (HMAC code from the server). */
export const HOUSE_CODE_LENGTH = 6;

const OTP_MAX_DIGITS = 8;

/** Digits only, so "123 456", "123-456" and a pasted sentence all become a usable code. */
export function normalizeOtp(raw: string): string {
  return raw.replace(/\D+/g, "").slice(0, OTP_MAX_DIGITS);
}

export function isHouseCodeComplete(code: string): boolean {
  return code.length === HOUSE_CODE_LENGTH;
}

/** Whole seconds until "Send a new code" is allowed again. */
export function resendSecondsLeft(sentAt: number | null, now: number, cooldownMs: number): number {
  if (sentAt === null) return 0;
  const left = sentAt + cooldownMs - now;
  return left <= 0 ? 0 : Math.ceil(left / 1000);
}
