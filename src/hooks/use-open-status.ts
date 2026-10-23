import { useEffect, useState } from "react";

import { isOpenNow, todayHours } from "@/domain/house/open-status";

/** Hacienda open/closed, re-checked every minute (Eastern time). */
export function useOpenStatus() {
  const [open, setOpen] = useState(() => isOpenNow());
  const [today, setToday] = useState(() => todayHours());

  useEffect(() => {
    const id = setInterval(() => {
      setOpen(isOpenNow());
      setToday(todayHours());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return {
    open,
    label: open ? "Open now" : "Closed",
    /** Today's window, e.g. "11 AM – Midnight". */
    hoursLabel: today,
  };
}
