"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordPage } from "./journey";

/** Notes each page the visitor reads, in memory only (see journey.ts). Renders nothing. */
export function JourneyRecorder() {
  const pathname = usePathname();
  useEffect(() => {
    recordPage(pathname);
  }, [pathname]);
  return null;
}
