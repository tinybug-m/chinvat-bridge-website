import type { ReactNode } from "react";
import { BodyFontScope } from "@/components/site/BodyFontScope";
import { archivo, martianMono } from "@/styles/fonts";

const FONT_VARIABLES = `${archivo.variable} ${martianMono.variable}`;

// Pages in the new design. Applying the fonts here preloads them on these
// routes only; `contents` keeps the root body layout intact.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${FONT_VARIABLES} contents font-body`}>
      <BodyFontScope className={FONT_VARIABLES} />
      {children}
    </div>
  );
}
