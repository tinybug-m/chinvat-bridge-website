import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./ArrowIcon";

interface RowLinkProps {
  href: string;
  title: ReactNode;
  /** The muted line under the title (a category, or why the link is worth following). */
  meta?: ReactNode;
}

/**
 * One hairline row in a list of links: the title, a muted line under it and
 * an arrow, with a rule that draws across on hover. Place it in an <li> inside
 * a <ul className="border-b border-line">, each <li> with border-t border-line.
 */
export function RowLink({ href, title, meta }: RowLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group/row relative grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-quart group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100 motion-reduce:transition-none"
      />
      <span className="text-balance font-display text-body font-medium text-ink transition-colors duration-200 group-hover/row:text-cobalt-700 md:text-lede">
        {title}
      </span>
      {meta ? <span className="col-start-1 row-start-2 max-w-measure text-small text-pretty text-ink-muted">{meta}</span> : null}
      <ArrowIcon className="col-start-2 row-span-2 row-start-1 text-ink group-hover/row:translate-x-0.5 group-hover/row:text-cobalt-700" />
    </Link>
  );
}
