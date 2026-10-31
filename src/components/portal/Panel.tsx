import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  /** The panel's h2. Also seeds the heading id the section is labelled by. */
  title: string;
  /** Right-hand slot in the header row, e.g. a tag. */
  meta?: ReactNode;
  /** Quiet line under the content. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&[a-z]+;|&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A ruled panel on paper-raised: the repeating block of the client and admin screens. */
export function Panel({ title, meta, footer, className, children }: PanelProps) {
  const headingId = `panel-${slug(title)}`;
  return (
    <section aria-labelledby={headingId} className={cn("rounded-[2px] border border-line bg-paper-raised", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-5 py-4 sm:px-6">
        <h2 id={headingId} className="font-display text-subheading font-medium text-ink">
          {title}
        </h2>
        {meta}
      </div>
      <div>{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-5 py-3 text-small text-ink-muted sm:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
