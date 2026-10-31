import { Container } from "@/components/system/Container";

export function PreviewBanner() {
  return (
    <div role="note" className="border-b border-line bg-haze">
      <Container className="flex items-start gap-3 py-3">
        <span
          aria-hidden="true"
          className="mt-[0.4em] size-[9px] shrink-0 rounded-full border-2 border-saffron-500 bg-haze"
        />
        <p className="text-small text-pretty text-ink-soft">
          Preview only &mdash; illustrative example. Your actual client portal will show your real project
          data once your subscription is active.
        </p>
      </Container>
    </div>
  );
}
