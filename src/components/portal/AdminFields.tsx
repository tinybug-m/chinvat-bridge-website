import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Matches components/ui/input and molecules/FormField: control border on paper-raised, ink on hover.
const CONTROL =
  "w-full min-w-0 rounded-[2px] border border-control bg-paper-raised px-3 text-body text-ink transition-[border-color] duration-200 ease-out-quart placeholder:text-ink-muted hover:border-ink";

/** A labelled control. The label wraps it, so every input is named without ids. */
function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-small font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

type InputProps = ComponentPropsWithoutRef<"input"> & { label: string; fieldClassName?: string };

export function AdminInput({ label, fieldClassName, className, ...props }: InputProps) {
  return (
    <Field label={label} className={fieldClassName}>
      <input className={cn(CONTROL, "h-11", className)} {...props} />
    </Field>
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & { label: string; fieldClassName?: string };

export function AdminSelect({ label, fieldClassName, className, children, ...props }: SelectProps) {
  return (
    <Field label={label} className={fieldClassName}>
      <select className={cn(CONTROL, "h-11 cursor-pointer", className)} {...props}>
        {children}
      </select>
    </Field>
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & { label: string; fieldClassName?: string };

export function AdminTextarea({ label, fieldClassName, className, ...props }: TextareaProps) {
  return (
    <Field label={label} className={fieldClassName}>
      <textarea className={cn(CONTROL, "py-2.5", className)} {...props} />
    </Field>
  );
}

/** An existing record's form: a hairline card on paper. */
export const RECORD_CARD = "space-y-4 rounded-[2px] border border-line bg-paper p-4 sm:p-5";

/** The "add new" form: a dashed outline, so it reads as an empty slot. */
export const NEW_CARD = "space-y-4 rounded-[2px] border border-dashed border-line-strong p-4 sm:p-5";

/** Destructive text action: error red, 44px tall. */
export const DELETE_CLASS =
  "inline-flex min-h-11 items-center px-2 text-small font-medium text-signal-error underline decoration-signal-error/35 underline-offset-[0.22em] hover:decoration-signal-error";
