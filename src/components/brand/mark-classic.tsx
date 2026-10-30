/**
 * The classic material of the mark: the cerulean / azure / saffron gradient the
 * site used before the chrome texture. A static stand-in for the 3D glass: deep
 * cerulean body, azure sheen, saffron light. Kept as a selectable variant (see
 * logo-material.ts); the chrome texture is the default.
 */
export const MARK_CLASSIC_GRADIENT = {
  x1: 640,
  y1: 340,
  x2: 900,
  y2: 900,
  stops: [
    [0, "#0b263c"],
    [0.22, "#0f557d"],
    [0.36, "#1c8ec3"],
    [0.46, "#ebc26b"],
    [0.55, "#be8c3f"],
    [0.68, "#0f557d"],
    [0.86, "#0b263c"],
    [1, "#1d75a3"],
  ],
} as const;

export function MarkClassicGradient({ id }: { id: string }) {
  const { x1, y1, x2, y2, stops } = MARK_CLASSIC_GRADIENT;
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map(([offset, color]) => (
        <stop key={offset} offset={offset} stopColor={color} />
      ))}
    </linearGradient>
  );
}
