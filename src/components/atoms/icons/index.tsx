import type { SVGProps } from "react";

export type IconName =
  | "neurology"
  | "infinity"
  | "codeBlocks"
  | "trendingUp"
  | "lock";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Neurology(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5a2.5 2.5 0 0 1 5 0v.6a3 3 0 0 1 2.5 4.4 3 3 0 0 1-.7 5.2 2.5 2.5 0 0 1-4.6 2.3A2.5 2.5 0 0 1 6.6 15a3 3 0 0 1-.7-5.2A3 3 0 0 1 8.4 5.1z" />
      <path d="M9.5 8.5v7M14.5 8.5v7M6.5 12h3M14.5 12h3" />
    </svg>
  );
}

function Infinity(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 9a3 3 0 1 0 0 6c2.5 0 3.5-2 5-3s2.5-3 5-3a3 3 0 1 1 0 6c-2.5 0-3.5-2-5-3s-2.5-3-5-3" />
    </svg>
  );
}

function CodeBlocks(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 8 5 12l4 4M15 8l4 4-4 4M13 5l-2 14" />
    </svg>
  );
}

function TrendingUp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16l5-5 4 4 7-8M14 7h6v6" />
    </svg>
  );
}

function Lock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

const ICONS: Record<IconName, (props: IconProps) => React.JSX.Element> = {
  neurology: Neurology,
  infinity: Infinity,
  codeBlocks: CodeBlocks,
  trendingUp: TrendingUp,
  lock: Lock,
};

export function Icon({ name, className = "", ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];
  return <Component className={`inline-block w-[1em] h-[1em] ${className}`} {...props} />;
}
