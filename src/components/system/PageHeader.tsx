import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface PageHeaderProps {
  /** Small muted line above the title (sentence case), e.g. "Insights" or "Updated 1 May 2026". */
  kicker?: ReactNode;
  /** The page's single h1. */
  title: ReactNode;
  /** id for the h1, so a wrapping section can be aria-labelledby it. */
  titleId?: string;
  lede?: ReactNode;
  /** Right-hand column from lg (actions, a meta list, a figure). Stacks below on small screens. */
  aside?: ReactNode;
  /** Extra content under the lede, in the left column (e.g. buttons). */
  children?: ReactNode;
  /** Draws the hairline under the header. Default true. */
  ruled?: boolean;
  /** Tighter bottom padding from lg, for app pages where content follows straight away. */
  compact?: boolean;
  className?: string;
}

/**
 * Opening block for inner pages, in the 404's tone: a quiet kicker, a large
 * display h1, an optional lede, and an optional right-hand slot. Place it
 * first inside templates/SiteShell (which already clears the fixed header).
 */
export function PageHeader({ kicker, title, titleId, lede, aside, children, ruled = true, compact = false, className }: PageHeaderProps) {
  return (
    <header className={className}>
      <Container>
        {/* Container-width hairline, like the homepage's rules (it stops at the gutters). */}
        <div
          className={cn(
            "grid grid-cols-1 gap-y-10 pt-12 pb-14 lg:grid-cols-12 lg:gap-x-6 lg:pt-20",
            compact ? "lg:pb-14" : "lg:pb-20",
            ruled && "border-b border-line",
          )}
        >
          <div className={cn(aside ? "lg:col-span-7" : "lg:col-span-10")}>
            {kicker ? <p className="text-small font-medium text-ink-muted">{kicker}</p> : null}
            <h1
              id={titleId}
              className={cn(
                "max-w-[20ch] font-display text-title font-medium text-balance text-ink [font-stretch:100%] lg:[font-stretch:112%]",
                kicker && "mt-5",
              )}
            >
              {title}
            </h1>
            {lede ? <p className="mt-6 max-w-[36rem] text-lede text-pretty text-ink-soft lg:mt-8">{lede}</p> : null}
            {children ? <div className="mt-8 lg:mt-10">{children}</div> : null}
          </div>
          {aside ? <div className="lg:col-span-4 lg:col-start-9 lg:self-end">{aside}</div> : null}
        </div>
      </Container>
    </header>
  );
}
