/**
 * Onboarding after join is three steps: Guidelines, profile (name, handle and
 * an optional photo on one screen) and topics.
 */
export type WelcomeStep = "guidelines" | "profile" | "topics";

/** The slice of `GET /me` that decides onboarding. */
export type WelcomeProfile = {
  handle: string | null;
  termsAcceptedAt: string | null;
  topics: readonly { slug: string }[];
  image: string | null;
};

/** Onboarding steps this member still needs, in order. */
export function welcomeSteps(profile: WelcomeProfile): WelcomeStep[] {
  const steps: WelcomeStep[] = [];
  if (!profile.termsAcceptedAt) steps.push("guidelines");
  // The profile step (name, handle, optional photo) is for people with no handle yet;
  // nobody is sent back through onboarding just to add a photo.
  if (!profile.handle) steps.push("profile");
  if (profile.topics.length === 0) steps.push("topics");
  return steps;
}

/** Where the member is in the flow, for the step label and progress bar. */
export function welcomeProgress(
  index: number,
  total: number,
): { current: number; total: number; fraction: number } {
  const safeTotal = Math.max(1, total);
  const current = Math.min(Math.max(0, index) + 1, safeTotal);
  return { current, total: safeTotal, fraction: current / safeTotal };
}

/**
 * True while the posting gate is closed (Guidelines not accepted, or no
 * handle). Topics and a photo are encouraged, never required.
 */
export function needsWelcome(profile: WelcomeProfile): boolean {
  return !profile.termsAcceptedAt || !profile.handle;
}
