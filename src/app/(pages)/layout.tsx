import type { ReactNode } from "react";
import { BodyFontScope } from "@/components/site/BodyFontScope";
import { archivo, martianMono } from "@/styles/fonts";

const FONT_VARIABLES = `${archivo.variable} ${martianMono.variable}`;

// Inner pages (pricing, insights, legal, auth, checkout, portals): same fonts
// and body scope as the (site) group. Route groups do not change URLs.
export default function InnerPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${FONT_VARIABLES} contents font-body`}>
      <BodyFontScope className={FONT_VARIABLES} />
      {children}
    </div>
  );
}
