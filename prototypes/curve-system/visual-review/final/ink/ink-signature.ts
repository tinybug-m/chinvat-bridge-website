/**
 * A cheap fingerprint of a plate's markup (tags and attributes, in document order), used to match a plate in the
 * page with its generated ink data. It runs in the browser and in the generator (which evaluates this very source),
 * so keep it self-contained. `--loop-d`, `--from` and `--to` are set at random or by the loop animation, not artwork.
 */
export const ELEMENTS = "path, line, polyline, polygon, rect, circle, ellipse";

export function signature(svg: Element): string {
  let h = 0x811c9dc5;
  const mix = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= 0xff;
    h = Math.imul(h, 0x01000193);
  };
  mix(svg.getAttribute("viewBox") ?? "");
  for (const el of svg.querySelectorAll(ELEMENTS)) {
    mix(el.tagName);
    for (const a of el.attributes) {
      mix(a.name);
      mix(a.name === "style" ? a.value.replace(/--(?:loop-d|from|to):[^;]*;?/g, "").trim() : a.value);
    }
  }
  return (h >>> 0).toString(16);
}
