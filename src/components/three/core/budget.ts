/*
 * Page-wide WebGL context budget. At most MAX_LIVE stages hold a context at
 * once; when another one needs a context, the stage farthest from the
 * viewport is suspended (it shows its poster) and comes back when it returns.
 */

export const MAX_LIVE_CONTEXTS = 2;

export interface BudgetMember {
  /** Distance from the viewport centre in CSS pixels; larger is farther. */
  distance(): number;
  /** Give the context back now. */
  suspend(): void;
  /** A slot freed up: try to acquire again if still wanted. */
  retry(): void;
}

const live = new Set<BudgetMember>();
const waiting = new Set<BudgetMember>();

/** Returns true if the member may create a context (possibly after suspending a farther one). */
export function acquireContext(member: BudgetMember): boolean {
  if (live.has(member)) return true;
  if (live.size < MAX_LIVE_CONTEXTS) {
    waiting.delete(member);
    live.add(member);
    return true;
  }

  let farthest: BudgetMember | null = null;
  let farthestDistance = -Infinity;
  for (const other of live) {
    const distance = other.distance();
    if (distance > farthestDistance) {
      farthest = other;
      farthestDistance = distance;
    }
  }
  if (!farthest || farthestDistance <= member.distance()) {
    waiting.add(member);
    return false;
  }

  live.delete(farthest);
  farthest.suspend();
  waiting.delete(member);
  live.add(member);
  return true;
}

export function releaseContext(member: BudgetMember) {
  waiting.delete(member);
  if (!live.delete(member)) return;
  // Nearest waiting stage gets the free slot.
  const next = [...waiting].sort((a, b) => a.distance() - b.distance())[0];
  next?.retry();
}

export function liveContextCount() {
  return live.size;
}
