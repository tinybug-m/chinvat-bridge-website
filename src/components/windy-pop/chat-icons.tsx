// Small drawn icons for the chat: 1.5px strokes, round caps, as the site's diagrams are drawn.

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

export const ArrowUpIcon = () => (
  <svg {...base} strokeWidth={2}>
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
  </svg>
);
export const StopIcon = () => (
  <svg {...base}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" stroke="none" />
  </svg>
);
export const ArrowLeftIcon = () => (
  <svg {...base} width={15} height={15} strokeWidth={1.8}>
    <path d="M19 12H5.5M11.5 5.5 5 12l6.5 6.5" />
  </svg>
);
export const ChevronDownIcon = () => (
  <svg {...base} strokeWidth={2}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);
export const PlaneIcon = () => (
  <svg {...base}>
    <path d="M21 4 3.5 11l6 2.5L12 20l2.5-5.5Z" />
    <path d="m9.5 13.5 11-9.5" />
  </svg>
);
export const RestartIcon = () => (
  <svg {...base}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
    <path d="M4 4.5v4h4" />
  </svg>
);
export const CloseIcon = () => (
  <svg {...base}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const WarnIcon = () => (
  <svg {...base}>
    <path d="M12 4 3 19.5h18Z" />
    <path d="M12 10v4.5M12 17.2v.1" />
  </svg>
);
export const CheckIcon = () => (
  <svg {...base} strokeWidth={2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** Telegram's ticks, redrawn thin: one for sent, two overlapping for delivered. */
export const Ticks = ({ double }: { double: boolean }) => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m1.5 5.8 3 3L10 2" />
    {double ? <path d="m7 8.5.5.5L15 2" /> : null}
  </svg>
);

/** Windy Pup's face, drawn in points and lines like the dog itself: a mesh head, drop ears, a saffron nose. "ink" is the paper version: navy lines with azure and saffron. */
export function WindyMark({ size = 36, tone = "light" }: { size?: number; tone?: "light" | "ink" }) {
  const ink = tone === "ink";
  const line = ink ? "#0b1a26" : "#8fe3fa";
  const ear = ink ? "#be8c3f" : "#ebc26b";
  const eye = ink ? "#0b1a26" : "#eaf8fd";
  const nose = ink ? "#be8c3f" : "#ebc26b";
  const node = ink ? "#1c8ec3" : "#8fe3fa";
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true" focusable={false}>
      <g stroke={line} strokeWidth={ink ? 1.1 : 1} strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 7.5 26 10.5 28.5 19 25.5 26.5 18 30 10.5 26.5 7.5 19 10 10.5Z" />
        <path d="M18 7.5V15M10 10.5l4.5 5.5M26 10.5 21.5 16M7.5 19l7-3M28.5 19l-7-3M14.5 16h7M14.5 16 18 22.5 21.5 16M18 22.5v7.5M10.5 26.5 18 22.5l7.5 4" strokeOpacity="0.55" />
      </g>
      <g stroke={ear} strokeWidth={ink ? 1.2 : 1} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 10.5C5.5 10.5 3.5 15 5.2 20.5c1 1.8 2.2 2 3 .5" />
        <path d="M26 10.5c4.5 0 6.5 4.5 4.8 10-1 1.8-2.2 2-3 .5" />
      </g>
      <g fill={node}>
        <circle cx="18" cy="7.5" r="1" />
        <circle cx="10" cy="10.5" r="1" />
        <circle cx="26" cy="10.5" r="1" />
        <circle cx="7.5" cy="19" r="1" />
        <circle cx="28.5" cy="19" r="1" />
        <circle cx="18" cy="30" r="1" />
      </g>
      <g fill={eye}>
        <circle cx="14.5" cy="16" r="1.5" />
        <circle cx="21.5" cy="16" r="1.5" />
      </g>
      <circle cx="18" cy="22.5" r="1.9" fill={nose} />
    </svg>
  );
}
