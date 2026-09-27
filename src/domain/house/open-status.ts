// Ported from theartistpost@03f9a2f:src/hooks/useOpenStatus.ts
/**
 * Pure open/closed math only — the web hook's `useState`/`useEffect`/minute
 * interval is UI concern and stays out of domain. Open/close minutes and the
 * timezone come from `site.hours` (already ported to `@/content/site`).
 */
import { site } from "@/content/site";

/** Minutes since local midnight in `site.hours.timeZone`, for a given instant. */
export function minutesInTz(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.hours.timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function isOpenNow(date = new Date()): boolean {
  const m = minutesInTz(date);
  return m >= site.hours.openMinutes && m < site.hours.closeMinutes;
}
