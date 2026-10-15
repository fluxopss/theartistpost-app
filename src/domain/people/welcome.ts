export type WelcomeStep = "guidelines" | "handle" | "topics" | "photo";

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
  if (!profile.handle) steps.push("handle");
  if (profile.topics.length === 0) steps.push("topics");
  if (!profile.image) steps.push("photo");
  return steps;
}

/**
 * True while the posting gate is closed (Guidelines not accepted, or no
 * handle). Topics and a photo are encouraged, never required.
 */
export function needsWelcome(profile: WelcomeProfile): boolean {
  return !profile.termsAcceptedAt || !profile.handle;
}
