import "expo-sqlite/localStorage/install";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
// useSyncExternalStore needs a stable snapshot per key between writes.
const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) value = JSON.parse(raw) as T;
  } catch {
    // Corrupt or legacy value — fall back rather than crash the screen.
  }
  cache.set(key, value);
  return value;
}

/**
 * Device key-value storage (SQLite-backed localStorage). Everything here stays
 * on this phone: studio name, saves, kindness notes, night pass.
 */
export const kv = {
  get: read,
  set<T>(key: string, value: T) {
    cache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
    listeners.get(key)?.forEach((fn) => fn());
  },
  remove(key: string) {
    cache.delete(key);
    localStorage.removeItem(key);
    listeners.get(key)?.forEach((fn) => fn());
  },
  subscribe(key: string, fn: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
    return () => {
      listeners.get(key)?.delete(fn);
    };
  },
};

/** Reactive binding to one key. Writes notify every subscriber of that key. */
export function useStored<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    (fn) => kv.subscribe(key, fn),
    () => read(key, fallback),
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      kv.set(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    // fallback is a stable default literal at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set];
}
