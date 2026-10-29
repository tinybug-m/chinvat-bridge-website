import Link from "next/link";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { HERO_DISCIPLINES } from "./content";

/**
 * The four disciplines as quiet links: a 2 x 2 grid on small screens, one
 * line from lg. Real links to the discipline anchors in #services.
 */
export function DisciplineIndex({ className }: { className?: string }) {
  return (
    <nav aria-label="Disciplines" className={className}>
      <ul className="grid grid-cols-2 gap-x-6 lg:flex lg:gap-x-10">
        {HERO_DISCIPLINES.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group/index inline-flex min-h-11 items-center gap-2 py-2 text-small leading-snug text-ink-soft transition-colors duration-200 ease-out-quart hover:text-ink"
            >
              <span className="underline decoration-line-strong decoration-1 underline-offset-4 group-hover/index:decoration-ink">
                {item.label}
              </span>
              <ArrowIcon
                direction="down"
                className="size-3.5 shrink-0 text-ink-muted transition-transform duration-200 ease-out-quart group-hover/index:translate-y-0.5 group-hover/index:text-ink motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
