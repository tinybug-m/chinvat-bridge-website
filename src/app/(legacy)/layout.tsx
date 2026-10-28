import type { ReactNode } from "react";
import { LegacyFrame } from "@/components/templates/LegacyFrame";

export default function LegacyLayout({ children }: { children: ReactNode }) {
  return <LegacyFrame>{children}</LegacyFrame>;
}
