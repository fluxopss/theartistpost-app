/**
 * Pure open/closed math only — the hook's interval is a UI concern and stays
 * out of domain. The weekly schedule comes from `HOUSE_SCHEDULE` in
 * `@/content/site` (mirrors the web's site.ts).
 */
import { HOUSE_SCHEDULE } from "@/content/site";
import { isOpenAt, todayLabel } from "@/domain/house/hours";

export function isOpenNow(date = new Date()): boolean {
  return isOpenAt(HOUSE_SCHEDULE, date);
}

/** Today's window in Eastern time, e.g. "11 AM – Midnight". */
export function todayHours(date = new Date()): string {
  return todayLabel(HOUSE_SCHEDULE, date);
}
