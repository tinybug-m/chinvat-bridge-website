import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/atoms/icons";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/atoms/buttonStyles";

interface ButtonProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  className?: string;
}

export function Button({
  children,
  variant = "solid",
  size = "md",
  icon,
  className = "",
  ...linkProps
}: ButtonProps) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...linkProps}>
      <span>{children}</span>
      {icon ? <Icon name={icon} className="text-sm shrink-0" /> : null}
    </Link>
  );
}
