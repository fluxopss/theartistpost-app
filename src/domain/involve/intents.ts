// Ported from theartistpost@03f9a2f:src/lib/ghl.ts (INVOLVE_INTENTS only)
/**
 * Inlined here (not imported from `src/lib/ghl.ts`, which is server/Next-only
 * and talks to GoHighLevel) so the native app has no server-only dependency.
 */

export const INVOLVE_INTENTS = ["space", "partner", "volunteer"] as const;

export type InvolveIntent = (typeof INVOLVE_INTENTS)[number];
