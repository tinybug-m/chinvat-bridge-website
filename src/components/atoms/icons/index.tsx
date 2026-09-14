import type { SVGProps } from "react";

export type IconName =
  | "arrowForward"
  | "arrowOutward"
  | "arrowDownward"
  | "unfoldMore"
  | "neurology"
  | "infinity"
  | "codeBlocks"
  | "trendingUp"
  | "helpOutline"
  | "verified"
  | "article"
  | "mail"
  | "menu"
  | "close"
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

function ArrowForward(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

function ArrowOutward(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function ArrowDownward(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  );
}

function UnfoldMore(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </svg>
  );
}

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

function HelpOutline(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.3a2.3 2.3 0 1 1 3.4 2c-.8.5-1.1 1-1.1 2" />
      <path d="M12 16.3v.1" />
    </svg>
  );
}

function Verified(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l2.1 1.3 2.4-.4 1 2.2 2.2 1-.4 2.4L20.6 12l-1.3 2.1.4 2.4-2.2 1-1 2.2-2.4-.4L12 20.5l-2.1-1.3-2.4.4-1-2.2-2.2-1 .4-2.4L3.4 12l1.3-2.1-.4-2.4 2.2-1 1-2.2 2.4.4z" />
      <path d="M9 12.3l2 2 4-4.3" />
    </svg>
  );
}

function Article(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="16" rx="1" />
      <path d="M8 8.5h8M8 12h8M8 15.5h5" />
    </svg>
  );
}

function Mail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </svg>
  );
}

function Menu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function Close(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
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
  arrowForward: ArrowForward,
  arrowOutward: ArrowOutward,
  arrowDownward: ArrowDownward,
  unfoldMore: UnfoldMore,
  neurology: Neurology,
  infinity: Infinity,
  codeBlocks: CodeBlocks,
  trendingUp: TrendingUp,
  helpOutline: HelpOutline,
  verified: Verified,
  article: Article,
  mail: Mail,
  menu: Menu,
  close: Close,
  lock: Lock,
};

export function Icon({ name, className = "", ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];
  return <Component className={`inline-block w-[1em] h-[1em] ${className}`} {...props} />;
}
