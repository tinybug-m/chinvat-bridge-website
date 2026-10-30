"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[2px] text-small font-medium whitespace-nowrap text-ink touch-manipulation transition-[background-color,color,box-shadow,scale] duration-200 ease-out-quart hover:bg-haze active:scale-[0.97] motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_var(--color-destructive)] data-[state=on]:bg-material data-[state=on]:duration-120 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "bg-transparent shadow-[inset_0_0_0_1px_var(--color-control)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)] data-[state=on]:shadow-[inset_0_0_0_1px_var(--color-ink)]",
      },
      size: {
        default: "min-h-11 min-w-11 px-4",
        sm: "min-h-9 min-w-9 px-3",
        lg: "min-h-12 min-w-12 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
