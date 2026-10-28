import type { QualityProfile } from "./types";
import { qualityOverride } from "./switches";

/*
 * Quality tiers, decided once per page view without loading three:
 * - none: no WebGL 2 at all. Poster only.
 * - low:  DPR 1 and the cheaper material. Software or caveated WebGL, Save-Data,
 *         a dual-core CPU, or a phone that also reports little memory.
 * - high: everything else. DPR up to 2 (1.5 on phones and tablets).
 *
 * Four cores alone never mean low: plenty of capable laptops report four.
 */

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

let cached: QualityProfile | null = null;

interface ProbeResult {
  webgl2: boolean;
  caveat: boolean;
  renderer: string;
}

function probeWebGL(): ProbeResult {
  const canvas = document.createElement("canvas");
  let gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) as WebGL2RenderingContext | null;
  let caveat = false;
  if (!gl) {
    gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    caveat = Boolean(gl);
  }
  if (!gl) return { webgl2: false, caveat: false, renderer: "" };

  let renderer = "";
  try {
    // Firefox and Safari return a sanitised string here; that is enough to spot software rasterisers.
    renderer = String(gl.getParameter(gl.RENDERER) ?? "");
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? renderer);
  } catch {
    // Some privacy modes throw; the tier then rests on the other signals.
  }
  // Free the probe context straight away: browsers cap live contexts.
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return { webgl2: true, caveat, renderer };
}

export function detectQuality(): QualityProfile {
  if (cached) return cached;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const mobile = coarse && small;
  // Phones and tablets: a touch screen is usually dense enough that 1.5 looks sharp.
  const highCap = coarse ? 1.5 : 2;
  const override = qualityOverride();

  if (override === "none") {
    cached = { tier: "none", dprCap: 1, mobile, reason: "override" };
    return cached;
  }

  const probe = probeWebGL();
  if (!probe.webgl2) {
    cached = { tier: "none", dprCap: 1, mobile, reason: "no WebGL 2" };
    return cached;
  }
  if (override) {
    cached = { tier: override, dprCap: override === "high" ? highCap : 1, mobile, reason: "override" };
    return cached;
  }

  const reasons: string[] = [];
  if (probe.caveat) reasons.push("major performance caveat");
  if (SOFTWARE_RENDERER.test(probe.renderer)) reasons.push(`software renderer (${probe.renderer})`);
  if (nav.connection?.saveData) reasons.push("Save-Data");
  const cores = nav.hardwareConcurrency ?? 0;
  if (cores > 0 && cores <= 2) reasons.push(`${cores} cores`);
  const memory = nav.deviceMemory;
  if (mobile && cores > 0 && cores <= 4 && memory !== undefined && memory <= 4) {
    reasons.push(`small device, ${cores} cores, ${memory} GB`);
  }

  cached = reasons.length
    ? { tier: "low", dprCap: 1, mobile, reason: reasons.join("; ") }
    : { tier: "high", dprCap: highCap, mobile, reason: probe.renderer || "default" };
  return cached;
}
