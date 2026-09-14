import { Icon } from "@/components/atoms/icons";
import { Container } from "@/components/atoms/Container";

export function PreviewBanner() {
  return (
    <div className="bg-gold-500/10 border-b border-gold-500/40 py-3">
      <Container className="flex items-center justify-center gap-2 text-center">
        <Icon name="helpOutline" className="text-gold-400 text-sm shrink-0" />
        <p className="font-mono text-[11px] text-gold-400 uppercase tracking-technical">
          Preview only &mdash; illustrative example. Your actual client portal will show your real project
          data once your subscription is active.
        </p>
      </Container>
    </div>
  );
}
