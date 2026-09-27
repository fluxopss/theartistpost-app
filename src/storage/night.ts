import { randomUUID } from "expo-crypto";

import {
  MAX_SPARKS_PER_EVENT,
  MAX_SPARKS_TOTAL,
  type NightPass,
  type NightSpark,
} from "@/domain/night/pass-types";

import { storageKeys } from "./keys";
import { useStored } from "./kv";

type Floor = { eventId: string; lit: string[] } | null;

/** The seat, sparks and floor walk for a night — all on this phone. */
export function useNight(eventId: string | undefined) {
  const [pass, setPass] = useStored<NightPass | null>(storageKeys.nightPass, null);
  const [sparks, setSparks] = useStored<NightSpark[]>(storageKeys.nightSparks, []);
  const [floor, setFloor] = useStored<Floor>(storageKeys.nightFloor, null);

  const eventPass = pass && pass.eventId === eventId ? pass : null;
  const eventSparks = sparks.filter((s) => s.eventId === eventId).slice(0, MAX_SPARKS_PER_EVENT);
  const lit = floor && floor.eventId === eventId ? floor.lit : [];

  return {
    pass: eventPass,
    savePass: (next: NightPass) => setPass(next),
    clearPass: () => setPass(null),
    sparks: eventSparks,
    addSpark: (body: string, from: string) => {
      if (!eventId) return;
      const spark: NightSpark = {
        id: randomUUID(),
        eventId,
        body,
        from,
        createdAt: new Date().toISOString(),
      };
      setSparks((prev) => [spark, ...prev].slice(0, MAX_SPARKS_TOTAL));
    },
    lit,
    setLit: (next: string[]) => eventId && setFloor({ eventId, lit: next }),
  };
}
