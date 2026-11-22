/**
 * A cheap fingerprint of a plate's markup (tags and attributes, in document order), used to match a plate in the
 * page with its generated ink data. It runs in the browser and in the generator (which evaluates this very source),
 * so keep it self-contained. It hashes the artwork as authored, so it is the same at the first layout and once the
 * page has settled: the loop and current scripts add `svc-current` overlay paths, `data-loop-d`, and the style
 * custom properties of the style (`--loop-d`, `--len`, `--sx`, ...) after mount, and those are ignored.
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
    if (el.classList.contains("svc-current")) continue;
    mix(el.tagName);
    for (const a of el.attributes) {
      if (a.name === "data-loop-d") continue;
      const v = a.name === "style" ? a.value.replace(/--[\w-]+\s*:[^;]*;?/g, "").trim() : a.value;
      if (a.name === "style" && !v) continue;
      mix(a.name);
      mix(v);
    }
  }
  return (h >>> 0).toString(16);
}
