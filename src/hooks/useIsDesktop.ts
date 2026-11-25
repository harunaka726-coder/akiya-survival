"use client";

import { useEffect, useState } from "react";

/** Tailwind `md` (768px) 以上を PC レイアウトとみなす */
export function useIsDesktop(breakpointPx = 768): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpointPx]);

  return desktop;
}
