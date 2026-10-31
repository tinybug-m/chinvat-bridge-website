import type { ReactNode } from "react";
import { Container } from "@/components/system/Container";

type StatusPageTone = "neutral" | "celebratory";

interface StatusPageProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  contactNote?: ReactNode;
  /** celebratory adds the saffron node to the opening hairline: the one accent. */
  tone?: StatusPageTone;
  /** Set when a parent layout (e.g. CheckoutShell) already provides the <main> landmark. */
  bare?: boolean;
}

/**
 * Shared layout for one-off confirmation/error pages (subscribe success,
 * cancelled, checkout error, and the app-level error boundary): a quiet kicker,
 * a large heading, the message, an optional contact line and the actions, set
 * left on paper like the 404.
 */
export function StatusPage({
  eyebrow,
  title,
  description,
  actions,
  contactNote,
  tone = "neutral",
  bare = false,
}: StatusPageProps) {
  const body = (
    <Container className="py-section">
      <div className="max-w-[40rem]">
        <div aria-hidden="true" className="relative mb-10 h-px w-24 bg-line-strong">
          {tone === "celebratory" ? (
            <span className="absolute top-1/2 left-0 size-[11px] -translate-y-1/2 rounded-full border-2 border-saffron-500 bg-paper" />
          ) : null}
        </div>
        <p className="text-small font-medium text-ink-muted">{eyebrow}</p>
        <h1 className="mt-4 font-display text-title font-medium text-balance text-ink [font-stretch:100%] lg:[font-stretch:112%]">{title}</h1>
        <p className="mt-6 max-w-measure text-lede text-pretty text-ink-soft">{description}</p>
        {contactNote ? <p className="mt-6 text-small text-ink-muted">{contactNote}</p> : null}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
      </div>
    </Container>
  );

  if (bare) return <div className="flex min-h-[60vh] items-center">{body}</div>;

  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center focus:outline-none">
      {body}
    </main>
  );
}
