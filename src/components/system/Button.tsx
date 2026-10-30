import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "./ArrowIcon";

export const buttonVariants = cva(
  "group/button inline-flex items-center justify-center gap-3 rounded-[2px] font-body font-medium leading-none tracking-[-0.005em] touch-manipulation transition-[background-color,background-position,color,box-shadow,translate] duration-200 ease-out-quart active:translate-y-px motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // The logo's material (chrome or classic); hover slides the sheen across.
        primary: "bg-material hover:[background-position:100%_50%]",
        secondary: "text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]",
        quiet: "px-0! text-ink hover:text-cobalt-700",
      },
      size: {
        md: "min-h-11 px-5 text-[0.9375rem]",
        lg: "min-h-13 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonVariants> & {
  /** Shows the arrow, which nudges forward on hover. */
  arrow?: "right" | "down" | "up-right";
  className?: string;
  children: ReactNode;
};

function Inner({ arrow, children }: Pick<ButtonStyleProps, "arrow" | "children">) {
  return (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowIcon direction={arrow} />
      ) : null}
    </>
  );
}

type ButtonLinkProps = ButtonStyleProps & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}

type ButtonProps = ButtonStyleProps & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({ variant, size, arrow, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}
