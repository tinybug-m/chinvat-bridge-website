import { SectionHeading } from "@/components/ui/SectionHeading";
import { TransitionColumn } from "@/components/sections/TransitionColumn";
import { CURRENT_STATE_ITEMS, FUTURE_STATE_ITEMS } from "@/data/transition";

export function Transition() {
  return (
    <section className="border-b border-stone-border bg-obsidian-950 py-20 relative" id="approach">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono text-[10px] tracking-technical text-gold-500 uppercase">
            &sect; 04.00 // The Transition
          </span>
          <SectionHeading>From Today to What&rsquo;s Next.</SectionHeading>
          <p className="font-serif-monument text-sm text-parchment-muted">
            Technology creates the most value when it solves a real constraint. We help identify the gap,
            design the right solution and build it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <TransitionColumn
            tone="current"
            eyebrow="Current State"
            statusLabel="Status: Constrained"
            title="Today"
            description="Operations held back by friction, manual overhead, and disconnected digital tools."
            items={CURRENT_STATE_ITEMS}
            footerLabel="Challenge: Operational Drag"
            footerIcon="arrowDownward"
          />
          <TransitionColumn
            tone="future"
            eyebrow="Future Direction"
            statusLabel="Direction: Better Systems"
            title="What's Next"
            description="Automated workflows, connected systems, stronger organic visibility, and software built around the business."
            items={FUTURE_STATE_ITEMS}
            footerLabel="The goal isn't more technology. It's a better business."
            footerIcon="verified"
          />
        </div>
      </div>
    </section>
  );
}
