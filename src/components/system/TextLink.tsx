import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function TextLink({ className, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "group/link text-cobalt-700 underline decoration-cobalt-700/35 decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-200 ease-out-quart hover:decoration-cobalt-700 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
