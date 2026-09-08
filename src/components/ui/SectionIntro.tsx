import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface SectionIntroProps {
  eyebrow: ReactNode;
  heading: ReactNode;
  headingId?: string;
  note?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function SectionIntro({
  eyebrow,
  heading,
  headingId,
  note,
  description,
  right,
  className = "mb-12",
}: SectionIntroProps) {
  return (
    <div
      className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-border pb-6 gap-4 ${className}`}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionHeading id={headingId}>{heading}</SectionHeading>
        {note ? <p className="font-serif-monument text-sm text-parchment-muted pt-1">{note}</p> : null}
      </div>
      {right ?? (description ? (
        <p className="font-serif-monument text-sm text-parchment-muted max-w-sm">{description}</p>
      ) : null)}
    </div>
  );
}
