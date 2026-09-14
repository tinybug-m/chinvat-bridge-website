import type { ReactNode } from "react";
import { Container } from "@/components/atoms/Container";

type SectionTone = "darker" | "dark";
type SectionPadding = "default" | "large";

const TONE_CLASSES: Record<SectionTone, string> = {
  darker: "bg-obsidian-950",
  dark: "bg-obsidian-900",
};

const PADDING_CLASSES: Record<SectionPadding, string> = {
  default: "py-20",
  large: "py-24",
};

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: SectionTone;
  padding?: SectionPadding;
  relative?: boolean;
  containerSize?: "4xl" | "5xl" | "7xl";
  containerWide?: boolean;
}

/**
 * Shared chrome for a full-width page section: bordered, tinted background,
 * vertical rhythm, wrapping its content in the standard `Container`.
 */
export function Section({
  children,
  id,
  tone = "darker",
  padding = "default",
  relative = false,
  containerSize = "7xl",
  containerWide = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`border-b border-stone-border ${TONE_CLASSES[tone]} ${PADDING_CLASSES[padding]} ${
        relative ? "relative" : ""
      }`}
    >
      <Container size={containerSize} wide={containerWide}>
        {children}
      </Container>
    </section>
  );
}
