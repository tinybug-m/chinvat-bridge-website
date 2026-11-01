/**
 * Scroll sweep of the Approach seam (BridgeSeam): the value is 0 while the stage's centre is at or
 * below SWEEP_FROM of the viewport height and 100 once it has risen to SWEEP_TO, so the finished
 * bridge is seen with the stage whole and mid-screen. The sweep is never shorter than SWEEP_MIN_PX
 * (landscape phones). Shared with the energy wire (EnergyFlow), which hands its energy to the seam
 * for exactly this stretch of scrolling.
 */
export const SWEEP_FROM = 1;
export const SWEEP_TO = 0.45;
export const SWEEP_MIN_PX = 420;

/** How far the page scrolls while the seam sweeps from 0 to 100 (px). */
export const sweepSpan = (vh: number) => Math.max((SWEEP_FROM - SWEEP_TO) * vh, SWEEP_MIN_PX);

/** Share modernised (0..100) for a stage whose centre is `centre` px from the top of a `vh` px tall viewport. */
export function sweepValue(centre: number, vh: number) {
  return Math.min(1, Math.max(0, (SWEEP_FROM * vh - centre) / sweepSpan(vh))) * 100;
}
