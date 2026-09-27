import { useEffect, useState } from "react";

/**
 * Seconds left before a rate-limited send may be retried. `start` is called
 * from the mutation's error handler, so no state is set inside an effect.
 */
export function useRetryCountdown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!until) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= until) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [until]);

  const start = (seconds: number) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  };

  return { remaining: until > now ? Math.ceil((until - now) / 1000) : 0, start };
}
