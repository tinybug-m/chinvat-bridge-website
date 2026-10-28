import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge has to know the custom theme scales. Without this it reads
// `text-label` as a colour and drops it when merged with `text-ink-muted`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "title", "heading", "subheading", "lede", "body", "small", "label"],
      spacing: ["gutter", "section"],
      container: ["page", "measure"],
      font: ["display", "body", "label"],
      ease: ["out-expo", "out-quart", "in-out-quint", "drawn"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
