// Ported from theartistpost@03f9a2f:src/features/night/pass.ts
/** Night pass, spark, and floor types — no localStorage I/O (native storage is handled elsewhere). */

export type NightPass = {
  eventId: string;
  name: string;
  email: string;
  party: number;
  note: string;
  code: string;
  delivered: boolean;
  savedAt: string;
};

export type NightSpark = {
  id: string;
  eventId: string;
  body: string;
  from: string;
  createdAt: string;
};

/** Sparks kept per event (web: `getNightSparks` slice). */
export const MAX_SPARKS_PER_EVENT = 8;

/** Sparks kept across all events (web: `addNightSpark` cap). */
export const MAX_SPARKS_TOTAL = 24;
