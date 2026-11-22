/*
 * Proposed wire router (prototype). Same inputs as routeWire() in
 * src/components/home/services/energy/route.ts (origin, stops, text boxes,
 * width, lane), different construction:
 *
 *   topology  a monotone polyline on 0/45/90 degree headings: vertical
 *             lanes joined by lane changes (a 45 degree diagonal, a
 *             shallower S when the offset is small, or a level run when
 *             the drop is too short), searched against the obstacles;
 *   geometry  fillet() turns every vertex into a turn of one radius.
 *
 * Lanes prefer the layout grid (the page margin's middle, the column
 * gutters, the page's centre line) and each port's own x.
 */
(function (root) {
  const { P, DEG, extent, fillet } = root.Curves;

  /** Geometry tokens for a viewport width (see the tokens table in index.html). */
  function tokens(vw) {
    const gutter = Math.min(80, Math.max(20, -2.288 + 0.05714 * vw));
    const R = 4 * Math.round((0.4 * gutter) / 4);
    return { gutter, R, lead: R / 2, gap: R / 2, clearance: vw < 640 ? 7 : 14 };
  }

  function gridLanes(layout) {
    const { width, lane, content } = layout;
    const xs = new Set([lane, width - lane, Math.round(width / 2)]);
    const W = content.x1 - content.x0;
    if (width >= 1024) {
      const gap = 24;
      const col = (W - 11 * gap) / 12;
      for (let k = 1; k < 12; k++) xs.add(Math.round(content.x0 + k * (col + gap) - gap / 2));
    } else if (width >= 768) {
      xs.add(Math.round(content.x0 + W / 2));
    }
    return [...xs].sort((a, b) => a - b);
  }

  const inside = (p, b, pad) => p.x > b.x0 - pad && p.x < b.x1 + pad && p.y > b.y0 - pad && p.y < b.y1 + pad;

  /** Segment a-b against box b grown by pad (Liang-Barsky). */
  function segBox(a, c, b, pad) {
    const x0 = b.x0 - pad;
    const x1 = b.x1 + pad;
    const y0 = b.y0 - pad;
    const y1 = b.y1 + pad;
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    let t0 = 0;
    let t1 = 1;
    const clip = (p, q) => {
      if (Math.abs(p) < 1e-12) return q >= 0;
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
      return true;
    };
    return clip(-dx, a.x - x0) && clip(dx, x1 - a.x) && clip(-dy, a.y - y0) && clip(dy, y1 - a.y) && t1 - t0 > 1e-9;
  }

  /**
   * Route the whole wire. Returns one hop per stop reached, each with its
   * polyline, pieces and the radius it used (a hop that cannot carry the
   * token radius steps it down and says so).
   */
  function route(layout, tk) {
    const t0 = performance.now();
    const grid = gridLanes(layout);
    const hops = [];
    let outs = [{ ...layout.origin, dir: "down" }];
    let from = null;
    for (let i = 0; i < layout.stops.length; i++) {
      const stop = layout.stops[i];
      const top = Math.min(...outs.map((p) => p.y)) - 40;
      const bottom = Math.max(...stop.ins.map((q) => q.y)) + 40;
      const obstacles = [...layout.text, ...layout.stops.flatMap((s) => s.keepout)].filter((b) => b.y1 > top && b.y0 < bottom);
      // The token radius, stepped down only when a hop cannot be routed clear with it (and flagged).
      let best = null;
      for (const scale of [1, 0.75, 0.5]) {
        const r = hop(outs, stop.ins, obstacles, from, stop.keepout, layout, grid, { ...tk, R: tk.R * scale, lead: tk.lead * scale, gap: tk.gap * scale });
        if (r) r.R = tk.R * scale;
        if (!best || (r && r.hits < best.hits)) best = r;
        if (best && best.hits === 0) break;
      }
      hops.push(best);
      if (!stop.outs.length) break;
      outs = stop.outs;
      from = stop.keepout;
    }
    return { hops, ms: performance.now() - t0, grid };
  }

  function hop(outs, ins, obstacles, from, to, layout, grid, tk) {
    const { R, lead, gap, clearance: C } = tk;
    const e90 = extent(90 * DEG, R);
    const { width, lane } = layout;
    const fine = [];
    for (let x = lane; x <= width - lane; x += width < 640 ? 12 : 24) fine.push(Math.round(x));
    let best = null;

    for (const p of outs) {
      // The artwork round the port the hop leaves by (for the first hop, the hero's tiers the origin sits under).
      const f = (from ?? obstacles).filter((b) => inside(p, b, C));
      for (const q of ins) {
        const t = to.filter((b) => inside(q, b, C));
        const obs = obstacles.filter((b) => !f.includes(b) && !t.includes(b));
        const penalty = (p.penalty || 0) + (q.penalty || 0);
        const ctx = { p, q, f, t, obs, R, lead, gap, C, e90, penalty, grid };
        const sideLanes = (lanes, port, sign) => lanes.filter((x) => (sign < 0 ? x <= port.x - lead - e90 : x >= port.x + lead + e90));
        const starts = (lanes) => (p.dir === "down" ? [p.x] : sideLanes(lanes, p, p.dir === "left" ? -1 : 1));
        const ends = (lanes) => (q.dir === "down" ? [q.x] : sideLanes(lanes, q, q.dir === "right" ? -1 : 1));
        const lanes = [...new Set([...grid, p.x, q.x])].sort((a, b) => a - b);
        const try1 = (L) => {
          for (const x1 of starts(L)) for (const xn of ends(L)) best = pick(best, oneJog(ctx, x1, xn));
        };
        try1(lanes);
        if (best && best.hits === 0) continue;
        for (const x1 of starts(lanes)) for (const xn of ends(lanes)) best = pick(best, twoJog(ctx, x1, xn, lanes));
        if (best && best.hits === 0) continue;
        try1([...new Set([...lanes, ...fine])]);
      }
    }
    return best;
  }

  const pick = (a, b) => (!b ? a : !a || b.score < a.score ? b : a);

  const prefix = (p, x1) => (p.dir === "down" ? [p] : [p, P(x1, p.y)]);
  const suffix = (q, xn) => (q.dir === "down" ? [q] : [P(xn, q.y), q]);

  /**
   * Headings a lane change may take for a lateral offset dx: a level run
   * (90), the 45 degree diagonal, and when the diagonal is too short to
   * carry two turns, the steepest shallower angle that can (an S).
   */
  function jogAngles(dx, R) {
    const out = [90 * DEG];
    const fits = (a) => dx / Math.sin(a) >= 2 * extent(a, R);
    if (fits(45 * DEG)) out.push(45 * DEG);
    else {
      let lo = 1 * DEG;
      let hi = 45 * DEG;
      if (!fits(lo)) return out;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) lo = mid;
        else hi = mid;
      }
      out.push(lo);
    }
    return out;
  }

  /** The drop a lane change of offset dx takes at heading a (from vertical). */
  const dropOf = (dx, a) => (a >= 89.9 * DEG ? 0 : Math.abs(dx) / Math.tan(a));

  const HEADING = { down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  /** Does segment a-b run along the port's heading? */
  const along = (a, b, dir) => {
    const L = Math.hypot(b.x - a.x, b.y - a.y);
    return ((b.x - a.x) * HEADING[dir].x + (b.y - a.y) * HEADING[dir].y) / L > 0.999;
  };

  function evaluate(ctx, raw, jogs, partial = false) {
    const { R, lead, gap, C, obs, f, t, e90, penalty } = ctx;
    const verts = [];
    for (const v of raw) {
      const last = verts[verts.length - 1];
      if (!last || Math.hypot(v.x - last.x, v.y - last.y) > 0.01) verts.push(v);
    }
    if (verts.length < 2) return null;
    // Leave along the out port's heading and arrive along the in port's: never sideways out of a port.
    if (!along(verts[0], verts[1], ctx.p.dir)) return null;
    if (!partial && !along(verts[verts.length - 2], verts[verts.length - 1], ctx.q.dir)) return null;
    const pieces = fillet(verts, R, { lead, gap });
    if (!pieces) return null;
    let hits = 0;
    const n = verts.length - 1;
    for (let j = 0; j < n; j++) {
      const a = verts[j];
      const b = verts[j + 1];
      for (const box of obs) if (segBox(a, b, box, C)) hits++;
      const ownStart = j === 0 || (j === 1 && ctx.p.dir !== "down");
      if (!ownStart) for (const box of f) if (segBox(a, b, box, C)) hits++;
      if (j < n - 1) for (const box of t) if (segBox(a, b, box, C)) hits++;
    }
    let length = 0;
    let turning = 0;
    for (let j = 0; j < n; j++) length += Math.hypot(verts[j + 1].x - verts[j].x, verts[j + 1].y - verts[j].y);
    for (let j = 1; j < n; j++) {
      const u = { x: verts[j].x - verts[j - 1].x, y: verts[j].y - verts[j - 1].y };
      const w = { x: verts[j + 1].x - verts[j].x, y: verts[j + 1].y - verts[j].y };
      const c = (u.x * w.x + u.y * w.y) / (Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y));
      turning += Math.acos(Math.max(-1, Math.min(1, c)));
    }
    // A lane change sits in the middle of the free band it crosses, not hard against text.
    let crowd = 0;
    const want = 3 * R + C;
    for (const { a, b } of jogs) {
      const xlo = Math.min(a.x, b.x) - C;
      const xhi = Math.max(a.x, b.x) + C;
      let room = want;
      // Every box counts here, the plates' own artwork too: a change hard under its own plate is cramped.
      for (const box of [...obs, ...f, ...t]) {
        if (box.x1 < xlo || box.x0 > xhi) continue;
        if (box.y1 <= a.y) room = Math.min(room, a.y - box.y1);
        else if (box.y0 >= b.y) room = Math.min(room, box.y0 - b.y);
      }
      crowd += want - room;
    }
    const offGrid = verts.filter((v, i) => i > 0 && i < n && !ctx.grid.includes(Math.round(v.x)) && v.x !== ctx.p.x && v.x !== ctx.q.x).length;
    void e90;
    const score = length + (turning / (Math.PI / 2)) * 3 * R + crowd * 1.5 + offGrid * 2 * R + penalty + hits * 10000;
    return { verts, pieces, hits, score, port: ctx.q };
  }

  function oneJog(ctx, x1, xn) {
    const { p, q, R } = ctx;
    const head = prefix(p, x1);
    const tail = suffix(q, xn);
    const yA = head[head.length - 1].y;
    const yB = tail[0].y;
    if (x1 === xn) return evaluate(ctx, [...head, ...tail], []);
    let best = null;
    const dx = xn - x1;
    for (const a of jogAngles(Math.abs(dx), R)) {
      const drop = dropOf(dx, a);
      for (let y = yA; y + drop <= yB; y += 6) {
        const j0 = P(x1, y);
        const j1 = P(xn, y + drop);
        best = pick(best, evaluate(ctx, [...head, j0, j1, ...tail], [{ a: j0, b: j1 }]));
      }
    }
    return best;
  }

  function twoJog(ctx, x1, xn, lanes) {
    const { p, q, R, obs, C } = ctx;
    const head = prefix(p, x1);
    const tail = suffix(q, xn);
    const yA = head[head.length - 1].y;
    const yB = tail[0].y;
    let best = null;
    for (const xm of lanes) {
      if (xm === x1 || xm === xn) continue;
      const firsts = [];
      for (const a of jogAngles(Math.abs(xm - x1), R)) {
        const drop = dropOf(xm - x1, a);
        for (let y = yA; y + drop <= yB; y += 12) {
          const j0 = P(x1, y);
          const j1 = P(xm, y + drop);
          // Judge the first change on its own: up to a short stub down the new lane.
          const r = evaluate(ctx, [...head, j0, j1, P(xm, j1.y + 2 * R)], [{ a: j0, b: j1 }], true);
          if (r && r.hits === 0) firsts.push({ j0, j1, score: r.score });
        }
      }
      if (!firsts.length) continue;
      firsts.sort((u, v) => u.score - v.score);
      for (const a of jogAngles(Math.abs(xn - xm), R)) {
        const drop = dropOf(xn - xm, a);
        for (let y = yB - drop; y >= yA; y -= 12) {
          const k0 = P(xm, y);
          const k1 = P(xn, y + drop);
          for (const fj of firsts.slice(0, 24)) {
            if (fj.j1.y >= y) continue;
            let clear = true;
            for (const box of obs) if (segBox(fj.j1, k0, box, C)) clear = false;
            if (!clear) continue;
            best = pick(best, evaluate(ctx, [...head, fj.j0, fj.j1, k0, k1, ...tail], [{ a: fj.j0, b: fj.j1 }, { a: k0, b: k1 }]));
            break;
          }
        }
      }
    }
    return best;
  }

  root.Router = { tokens, route, gridLanes };
})(window);
