import Link from "next/link";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { cn } from "@/lib/utils";
import { HERO_DISCIPLINES } from "./content";

/**
 * The four disciplines as a mono-numbered index: a row on desktop, a 2 x 2
 * grid on small screens. Real links to the discipline anchors in #services.
 */
export function DisciplineIndex({ className }: { className?: string }) {
  return (
    <nav aria-label="Disciplines" className={className}>
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {HERO_DISCIPLINES.map((item, index) => (
          <li
            key={item.href}
            className={cn(
              "border-line",
              // 2 x 2: a hairline between the columns and between the rows.
              index % 2 === 0 && "border-r",
              index < 2 && "border-b lg:border-b-0",
              // One row: hairlines between the four.
              index === 1 && "lg:border-r",
              index === 2 && "lg:border-r",
            )}
          >
            <Link
              href={item.href}
              className="group/index flex min-h-16 items-center gap-3 px-1 py-3 text-ink-soft transition-colors duration-200 ease-out-quart hover:text-ink sm:gap-4 lg:min-h-18 lg:px-5 lg:first:pl-0"
            >
              <span className="font-label text-label text-ink">{item.index}</span>
              <span className="text-small leading-snug font-medium">{item.label}</span>
              <ArrowIcon
                direction="down"
                className="ml-auto hidden size-3.5 text-ink-muted transition-transform duration-200 ease-out-quart group-hover/index:translate-y-0.5 group-hover/index:text-ink motion-reduce:transition-none sm:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
