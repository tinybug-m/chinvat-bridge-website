/*
 * Curve system: geometry core (pure, no DOM). Prototype only; nothing in
 * src/ imports this file.
 *
 * Every bend is a TURN: two mirrored cubics whose curvature rises linearly
 * from zero, peaks at exactly 1/R at the apex and falls back to zero (a
 * close approximation of an Euler spiral, the transition curve of railways
 * and roads). A path is a polyline of straight runs on 0/45/90 degree
 * headings; fillet() replaces each vertex with a turn of the role's radius.
 */
(function (root) {
  const P = (x, y) => ({ x, y });
  const add = (a, b) => P(a.x + b.x, a.y + b.y);
  const sub = (a, b) => P(a.x - b.x, a.y - b.y);
  const mul = (a, k) => P(a.x * k, a.y * k);
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  const crs = (a, b) => a.x * b.y - a.y * b.x;
  const mag = (a) => Math.hypot(a.x, a.y);
  const unit = (a) => mul(a, 1 / mag(a));
  const DEG = Math.PI / 180;

  const bez = (c, t) => {
    const u = 1 - t;
    return P(
      u * u * u * c[0].x + 3 * u * u * t * c[1].x + 3 * u * t * t * c[2].x + t * t * t * c[3].x,
      u * u * u * c[0].y + 3 * u * u * t * c[1].y + 3 * u * t * t * c[2].y + t * t * t * c[3].y,
    );
  };
  const bez1 = (c, t) => {
    const u = 1 - t;
    return P(
      3 * u * u * (c[1].x - c[0].x) + 6 * u * t * (c[2].x - c[1].x) + 3 * t * t * (c[3].x - c[2].x),
      3 * u * u * (c[1].y - c[0].y) + 6 * u * t * (c[2].y - c[1].y) + 3 * t * t * (c[3].y - c[2].y),
    );
  };
  const bez2 = (c, t) => {
    const u = 1 - t;
    return P(
      6 * u * (c[2].x - 2 * c[1].x + c[0].x) + 6 * t * (c[3].x - 2 * c[2].x + c[1].x),
      6 * u * (c[2].y - 2 * c[1].y + c[0].y) + 6 * t * (c[3].y - 2 * c[2].y + c[1].y),
    );
  };
  /** Signed curvature of a cubic at t (1/px). */
  const kappa = (c, t) => {
    const d = bez1(c, t);
    const m = mag(d);
    return m < 1e-9 ? 0 : crs(d, bez2(c, t)) / (m * m * m);
  };

  /* ------------------------------------------------------------ turns */

  const shapes = new Map();
  /**
   * The turn's proportions for a deflection theta, fitted numerically so
   * curvature is linear in arc length (error under 2% up to 90 degrees):
   * apex depth mr * e from the vertex, first handle at h of the way to the
   * second. rPerE is the peak radius of a turn with extent 1.
   */
  function turnShape(theta) {
    const key = Math.round(theta / (0.05 * DEG));
    if (shapes.has(key)) return shapes.get(key);
    const q = theta / (Math.PI / 2);
    const shape = { mr: (0.66 + 0.06 * q * q) * Math.tan(theta / 4), h: 0.5 - 0.1 * q * q, rPerE: 1 };
    const raw = rawTurn(P(0, 0), P(1, 0), P(Math.cos(theta), Math.sin(theta)), 1, shape);
    let kmax = 0;
    for (let i = 0; i <= 400; i++) kmax = Math.max(kmax, Math.abs(kappa(raw.cubics[0], i / 400)));
    shape.rPerE = 1 / kmax;
    shapes.set(key, shape);
    return shape;
  }

  function rawTurn(V, u, w, e, shape) {
    const tM = unit(add(u, w));
    const n = unit(sub(w, u));
    const m = shape.mr * e;
    const M = add(V, mul(n, m));
    const s = (m * crs(n, u)) / crs(tM, u);
    const P2 = sub(M, mul(tM, s));
    const T0 = sub(V, mul(u, e));
    const P1 = add(T0, mul(sub(P2, T0), shape.h));
    const T1 = add(V, mul(w, e));
    const d1 = mag(sub(V, P1));
    const d2 = mag(sub(V, P2));
    return { e, T0, T1, cubics: [[T0, P1, P2, M], [M, add(V, mul(w, d2)), add(V, mul(w, d1)), T1]] };
  }

  const angleBetween = (u, w) => Math.acos(Math.max(-1, Math.min(1, dot(u, w))));
  /** How far a turn of deflection theta and peak radius R runs along each leg. */
  const extent = (theta, R) => (theta < 1e-4 ? 0 : R / turnShape(theta).rPerE);
  /** A turn at vertex V from heading u to heading w, peak radius R. */
  function turn(V, u, w, R) {
    const theta = angleBetween(u, w);
    return rawTurn(V, u, w, extent(theta, R), turnShape(theta));
  }

  /* ---------------------------------------------------------- fillet */

  /**
   * Polyline -> pieces. Every interior vertex becomes a turn of radius R.
   * Straight runs must hold both turns' extents, plus `gap` between two
   * turns of the same hand (so they never merge into one lumpy bend; two
   * opposite turns may touch, meeting at zero curvature), plus `lead` at
   * either end. Returns null when the polyline cannot carry the radius.
   */
  function fillet(verts, R, { lead = 0, leadStart = lead, leadEnd = lead, gap = 0 } = {}) {
    const pts = [];
    for (const v of verts) if (!pts.length || mag(sub(v, pts[pts.length - 1])) > 0.01) pts.push(v);
    for (let i = 1; i < pts.length - 1; ) {
      const a = unit(sub(pts[i], pts[i - 1]));
      const b = unit(sub(pts[i + 1], pts[i]));
      if (Math.abs(crs(a, b)) < 1e-6 && dot(a, b) > 0) pts.splice(i, 1);
      else i++;
    }
    const n = pts.length;
    if (n < 2) return null;
    const dirs = [];
    const lens = [];
    for (let i = 0; i < n - 1; i++) {
      const d = sub(pts[i + 1], pts[i]);
      lens.push(mag(d));
      dirs.push(unit(d));
    }
    const E = new Array(n).fill(0);
    const hand = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
      const theta = angleBetween(dirs[i - 1], dirs[i]);
      if (theta > 90.5 * DEG) return null; // never sharper than a quarter turn
      E[i] = extent(theta, R);
      hand[i] = Math.sign(crs(dirs[i - 1], dirs[i]));
    }
    for (let j = 0; j < n - 1; j++) {
      const a = j === 0 ? leadStart : E[j];
      const b = j + 1 === n - 1 ? leadEnd : E[j + 1];
      const between = j > 0 && j + 1 < n - 1 && hand[j] === hand[j + 1] ? gap : 0;
      if (lens[j] + 1e-6 < a + b + between) return null;
    }
    const pieces = [];
    let cur = pts[0];
    for (let i = 1; i < n - 1; i++) {
      const t = turn(pts[i], dirs[i - 1], dirs[i], R);
      if (mag(sub(t.T0, cur)) > 0.01) pieces.push({ k: "L", p: [cur, t.T0] });
      pieces.push({ k: "C", p: t.cubics[0] }, { k: "C", p: t.cubics[1] });
      cur = t.T1;
    }
    if (mag(sub(pts[n - 1], cur)) > 0.01) pieces.push({ k: "L", p: [cur, pts[n - 1]] });
    return pieces;
  }

  /* ------------------------------------------------------ path utils */

  const f1 = (n) => Math.round(n * 10) / 10;
  function toD(pieces) {
    let d = "";
    for (const pc of pieces) {
      if (!d) d = `M${f1(pc.p[0].x)} ${f1(pc.p[0].y)}`;
      if (pc.k === "L") d += `L${f1(pc.p[1].x)} ${f1(pc.p[1].y)}`;
      else d += `C${f1(pc.p[1].x)} ${f1(pc.p[1].y)} ${f1(pc.p[2].x)} ${f1(pc.p[2].y)} ${f1(pc.p[3].x)} ${f1(pc.p[3].y)}`;
    }
    return d;
  }

  /** Pieces from an SVG d of M, L, H, V, Q and C commands (absolute). */
  function parseD(d) {
    const toks = d.match(/[MLHVQC]|-?\d*\.?\d+(?:e-?\d+)?/gi);
    const pieces = [];
    let i = 0;
    let cmd = null;
    let cur = null;
    const n = () => Number(toks[i++]);
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
      if (cmd === "M") cur = P(n(), n());
      else if (cmd === "L") {
        const b = P(n(), n());
        pieces.push({ k: "L", p: [cur, b] });
        cur = b;
      } else if (cmd === "H") {
        const b = P(n(), cur.y);
        pieces.push({ k: "L", p: [cur, b] });
        cur = b;
      } else if (cmd === "V") {
        const b = P(cur.x, n());
        pieces.push({ k: "L", p: [cur, b] });
        cur = b;
      } else if (cmd === "Q") {
        const q = P(n(), n());
        const b = P(n(), n());
        // Degree-elevate the quadratic to a cubic.
        pieces.push({ k: "C", p: [cur, add(cur, mul(sub(q, cur), 2 / 3)), add(b, mul(sub(q, b), 2 / 3)), b] });
        cur = b;
      } else if (cmd === "C") {
        const c = [cur, P(n(), n()), P(n(), n()), P(n(), n())];
        pieces.push({ k: "C", p: c });
        cur = c[3];
      } else break;
    }
    return pieces;
  }

  /**
   * Arc-length samples with curvature, plus join diagnostics: curvature and
   * tangent breaks where one piece meets the next, and each run of curved
   * pieces (one bend) with its peak radius and deflection.
   */
  function analyse(pieces, step = 2) {
    const samples = [];
    const joins = [];
    const bends = [];
    let s = 0;
    let prev = null;
    let bend = null;
    const push = (p, k, t) => {
      if (prev) s += mag(sub(p, prev));
      prev = p;
      samples.push({ x: p.x, y: p.y, s, k, tx: t.x, ty: t.y });
    };
    pieces.forEach((pc, idx) => {
      const before = samples.length ? samples[samples.length - 1] : null;
      if (pc.k === "L") {
        const L = mag(sub(pc.p[1], pc.p[0]));
        if (L < 1e-6) return;
        const t = unit(sub(pc.p[1], pc.p[0]));
        const m = Math.max(1, Math.ceil(L / step));
        if (before) joins.push({ s, dk: Math.abs(before.k), da: Math.acos(Math.max(-1, Math.min(1, before.tx * t.x + before.ty * t.y))), x: pc.p[0].x, y: pc.p[0].y });
        for (let i = samples.length ? 1 : 0; i <= m; i++) push(add(pc.p[0], mul(sub(pc.p[1], pc.p[0]), i / m)), 0, t);
        if (bend) {
          bends.push(bend);
          bend = null;
        }
      } else {
        const c = pc.p;
        const rough = mag(sub(c[1], c[0])) + mag(sub(c[2], c[1])) + mag(sub(c[3], c[2]));
        const m = Math.max(16, Math.ceil(rough / step));
        const t0 = unit(bez1(c, 0.0001));
        const k0 = kappa(c, 0);
        if (before) joins.push({ s, dk: Math.abs(before.k - k0), da: Math.acos(Math.max(-1, Math.min(1, before.tx * t0.x + before.ty * t0.y))), x: c[0].x, y: c[0].y });
        // A bend is one lobe of curvature: a new one starts at every inflection, so an S counts as two.
        if (!bend) bend = { kmax: 0, turn: 0, sign: 0, at: null };
        for (let i = samples.length ? 1 : 0; i <= m; i++) {
          const t = i / m;
          const k = kappa(c, t);
          const p = bez(c, t);
          const s0 = s;
          push(p, k, unit(bez1(c, Math.min(0.9999, Math.max(0.0001, t)))));
          const sign = Math.abs(k) < 1e-5 ? 0 : Math.sign(k);
          if (sign && bend.sign && sign !== bend.sign) {
            bends.push(bend);
            bend = { kmax: 0, turn: 0, sign: 0, at: null };
          }
          if (sign) bend.sign = sign;
          bend.turn += Math.abs(k) * (s - s0);
          if (Math.abs(k) > bend.kmax) {
            bend.kmax = Math.abs(k);
            bend.at = p;
          }
        }
        if (idx === pieces.length - 1) {
          bends.push(bend);
          bend = null;
        }
      }
    });
    if (bend) bends.push(bend);
    // Total turning of each lobe (radians), so an S's lobes count even though its ends are parallel.
    for (const b of bends) b.deflection = b.turn;
    return { samples, joins, bends, length: s };
  }

  /** Summary numbers for a set of paths (one per hop), for comparing systems. */
  function metrics(analyses, R) {
    const bends = analyses.flatMap((a) => a.bends).filter((b) => b.kmax > 1 / 4000 && b.deflection > 3 * DEG);
    const radii = bends.map((b) => 1 / b.kmax);
    const joins = analyses.flatMap((a) => a.joins);
    const kBreak = joins.filter((j) => j.dk > 1 / 400).length;
    const tBreak = joins.filter((j) => j.da > 0.5 * DEG).length;
    const minR = radii.length ? Math.min(...radii) : Infinity;
    const maxR = radii.length ? Math.max(...radii) : Infinity;
    const tight = radii.filter((r) => r < R * 0.75).length;
    // Distinct radii: cluster within 10%.
    const sorted = [...radii].sort((a, b) => a - b);
    let distinct = 0;
    let last = -Infinity;
    for (const r of sorted) {
      if (r <= last * 1.1) continue;
      distinct++;
      last = r;
    }
    return {
      bends: bends.length,
      minR,
      maxR,
      spread: maxR / minR,
      distinct,
      kBreak,
      tBreak,
      tight,
      length: analyses.reduce((a, b) => a + b.length, 0),
    };
  }

  root.Curves = { P, add, sub, mul, dot, crs, mag, unit, DEG, bez, bez1, kappa, turnShape, extent, turn, fillet, toD, parseD, analyse, metrics };
})(window);
