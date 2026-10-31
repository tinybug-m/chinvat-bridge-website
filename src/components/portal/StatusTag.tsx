import { cn } from "@/lib/utils";

type Tone = "done" | "active" | "review" | "waiting";

const TONES: Record<Tone, { tag: string; dot: string }> = {
  done: { tag: "border-line-strong text-ink", dot: "bg-ink" },
  active: { tag: "border-cobalt-700/40 text-cobalt-700", dot: "bg-cobalt-700" },
  review: { tag: "border-saffron-600/50 text-saffron-800", dot: "bg-saffron-500" },
  waiting: { tag: "border-line text-ink-muted", dot: "border border-control bg-transparent" },
};

/** Sprint statuses as stored; unknown values read as waiting. */
const SPRINT_TONES: Record<string, Tone> = {
  Complete: "done",
  "In Progress": "active",
  "In Review": "review",
  Scheduled: "waiting",
};

export function sprintTone(status: string): Tone {
  return SPRINT_TONES[status] ?? "waiting";
}

/** A small hairline tag with a status dot. Ink by default; cobalt and saffron only for live states. */
export function StatusTag({ tone = "waiting", children }: { tone?: Tone; children: string }) {
  const style = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[2px] border px-2 py-0.5 text-[0.8125rem] leading-5",
        style.tag,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      {children}
    </span>
  );
}
