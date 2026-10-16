import * as Location from "expo-location";

import type { CheckInInput } from "@/api/types";

export type OneShotLocation =
  | { kind: "reading"; reading: Required<Pick<CheckInInput, "lat" | "lng">> & { accuracyM: number | null } }
  | { kind: "denied" }
  | { kind: "unavailable" };

const READ_TIMEOUT_MS = 12_000;

/**
 * One foreground location reading, asked for only after the person tapped
 * “Use my location”. No watching, no background use, nothing is kept here:
 * the caller hands the reading to the server once and drops it.
 */
export async function readLocationOnce(): Promise<OneShotLocation> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return { kind: "denied" };

    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), READ_TIMEOUT_MS)),
    ]);
    if (!position) return { kind: "unavailable" };

    return {
      kind: "reading",
      reading: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: position.coords.accuracy ?? null,
      },
    };
  } catch {
    return { kind: "unavailable" };
  }
}
