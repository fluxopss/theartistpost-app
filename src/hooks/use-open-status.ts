import { useEffect, useState } from "react";

import { site } from "@/content/site";
import { isOpenNow } from "@/domain/house/open-status";

/** Hacienda open/closed, re-checked every minute (Eastern time). */
export function useOpenStatus() {
  const [open, setOpen] = useState(() => isOpenNow());

  useEffect(() => {
    const id = setInterval(() => setOpen(isOpenNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  return {
    open,
    label: open ? "Open now" : "Closed",
    hoursLabel: site.hours.label,
  };
}
