import { randomUUID } from "expo-crypto";

import {
  KINDNESS_ANON,
  KINDNESS_LOCAL_CAP,
  type KindnessMedium,
  type KindnessNote,
  type KindnessPinKind,
  type KindnessSpark,
} from "@/domain/kindness/types";

import { storageKeys } from "./keys";
import { useStored } from "./kv";

const NONE: KindnessNote[] = [];

/**
 * Kindness notes left on this phone. There is no shared wall yet, and no
 * invented seed notes — the wall starts honestly empty.
 */
export function useKindnessNotes() {
  const [notes, setNotes] = useStored<KindnessNote[]>(storageKeys.kindnessNotes, NONE);

  return {
    notes,
    add: (input: {
      body: string;
      from?: string;
      medium: KindnessMedium;
      spark: KindnessSpark;
      pinKind?: KindnessPinKind;
      pinLabel?: string;
    }) => {
      const note: KindnessNote = {
        id: randomUUID(),
        body: input.body,
        fromLabel: input.from?.trim() || KINDNESS_ANON,
        medium: input.medium,
        spark: input.spark,
        pinKind: input.pinKind,
        pinLabel: input.pinLabel,
        createdAt: new Date().toISOString(),
        source: "local",
      };
      setNotes((prev) => [note, ...prev].slice(0, KINDNESS_LOCAL_CAP));
      return note;
    },
    remove: (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id)),
    clear: () => setNotes(NONE),
  };
}
