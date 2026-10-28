import type { ReactNode } from "react";
import { LegacyFrame } from "@/components/templates/LegacyFrame";
import { legacyFontVariables } from "@/styles/legacy-fonts";

export default function LegacyLayout({ children }: { children: ReactNode }) {
  return <LegacyFrame fonts={legacyFontVariables}>{children}</LegacyFrame>;
}
