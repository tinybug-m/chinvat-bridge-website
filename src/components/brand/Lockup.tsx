import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mark, type MarkVariant } from "./Mark";

interface LockupProps {
  variant?: MarkVariant;
  className?: string;
  /** Renders a link home unless the lockup is decorative. */
  href?: string | null;
}

export function Lockup({ variant = "glass", className, href = "/" }: LockupProps) {
  const content = (
    <>
      <Mark variant={variant} size="sm" priority className="w-8 shrink-0" />
      <span className="font-display text-[1.0625rem] leading-none font-semibold tracking-[-0.01em] [font-stretch:112%]">
        Chinvat Bridge
      </span>
    </>
  );
  const classes = cn("inline-flex items-center gap-3", className);

  if (!href) return <span className={classes}>{content}</span>;
  return (
    <Link href={href} className={classes} aria-label="Chinvat Bridge, home">
      {content}
    </Link>
  );
}
