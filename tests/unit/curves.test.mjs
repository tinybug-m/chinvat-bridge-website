// Runs with Node's own test runner and type stripping (Node 24): `pnpm test:unit`.
// Tangents are read 1e-6 inside each end, so they are compared to 1e-4 (0.006 degrees).
// The curve system's invariants (src/lib/curves): every turn starts and ends straight, peaks at
// exactly its radius, and joins its neighbours without a break; the wire radius follows the margin.
import assert from "node:assert/strict";
import { test } from "node:test";
import { curvature, fillet, tangent, turn, turnExtent } from "../../src/lib/curves/geometry.ts";
import { gutterAt, wireRadius } from "../../src/lib/curves/tokens.ts";

const DEG = Math.PI / 180;
const peakRadius = (cubics) => {
  let peak = 0;
  for (const c of cubics) for (let i = 0; i <= 400; i++) peak = Math.max(peak, Math.abs(curvature(c, i / 400)));
  return 1 / peak;
};

test("a turn starts and ends with zero curvature and peaks at its radius", () => {
  for (const deg of [10, 22.5, 45, 60, 90]) {
    const a = deg * DEG;
    const { cubics } = turn({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: Math.sin(a), y: Math.cos(a) }, 24);
    assert.ok(Math.abs(curvature(cubics[0], 0)) < 1e-9, `${deg}: starts straight`);
    assert.ok(Math.abs(curvature(cubics[1], 1)) < 1e-9, `${deg}: ends straight`);
    assert.ok(Math.abs(peakRadius(cubics) - 24) < 0.05, `${deg}: peak radius ${peakRadius(cubics)}`);
    // The two halves meet with the same tangent and the same curvature.
    const t0 = tangent(cubics[0], 1);
    const t1 = tangent(cubics[1], 0);
    assert.ok(Math.abs(t0.x - t1.x) < 1e-4 && Math.abs(t0.y - t1.y) < 1e-4, `${deg}: tangent at the apex`);
    assert.ok(Math.abs(curvature(cubics[0], 1) - curvature(cubics[1], 0)) < 1e-6, `${deg}: curvature at the apex`);
  }
});

test("a turn's curvature rises steadily to the apex (no bumps)", () => {
  const { cubics } = turn({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, 32);
  let last = 0;
  for (let i = 0; i <= 200; i++) {
    const k = Math.abs(curvature(cubics[0], i / 200));
    assert.ok(k >= last - 1e-9);
    last = k;
  }
});

test("a quarter turn runs 1.84 R along each leg, an eighth turn 0.83 R", () => {
  assert.ok(Math.abs(turnExtent(90 * DEG, 1) - 1.84) < 0.01);
  assert.ok(Math.abs(turnExtent(45 * DEG, 1) - 0.83) < 0.01);
});

test("fillet joins straights and turns with continuous tangent and curvature", () => {
  const pieces = fillet(
    [
      { x: 100, y: 0 },
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 400 },
      { x: 200, y: 500 },
      { x: 200, y: 700 },
    ],
    24,
    { lead: 12, gap: 12 },
  );
  assert.ok(pieces);
  const ends = pieces.map((p) =>
    p.kind === "line"
      ? { t0: unit(p.b, p.a), t1: unit(p.b, p.a), k0: 0, k1: 0, a: p.a, b: p.b }
      : { t0: tangent(p.c, 0), t1: tangent(p.c, 1), k0: curvature(p.c, 0), k1: curvature(p.c, 1), a: p.c[0], b: p.c[3] },
  );
  for (let i = 1; i < ends.length; i++) {
    const [u, v] = [ends[i - 1], ends[i]];
    assert.ok(Math.hypot(u.b.x - v.a.x, u.b.y - v.a.y) < 1e-6, "pieces meet");
    assert.ok(Math.hypot(u.t1.x - v.t0.x, u.t1.y - v.t0.y) < 1e-4, "tangent is continuous (to 0.006 degrees)");
    assert.ok(Math.abs(u.k1 - v.k0) < 1e-6, "curvature is continuous");
  }
});

function unit(b, a) {
  const l = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (b.x - a.x) / l, y: (b.y - a.y) / l };
}

test("fillet refuses runs too short for their turns, and turns sharper than 90 degrees", () => {
  const R = 16;
  const e = turnExtent(90 * DEG, R);
  const corner = (run) => [
    { x: 0, y: 0 },
    { x: 0, y: run },
    { x: 100, y: run },
  ];
  assert.equal(fillet(corner(e + 8 - 0.5), R, { lead: 8 }), null);
  assert.ok(fillet(corner(e + 8 + 0.5), R, { lead: 8 }));
  // Two turns of the same hand need the gap between them; opposite turns may touch.
  const zig = (run, back) => [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: run, y: 100 },
    { x: run, y: back ? 200 : 0 },
  ];
  assert.equal(fillet(zig(2 * e + 4, false), R, { gap: 8 }), null);
  assert.ok(fillet(zig(2 * e + 4, true), R, { gap: 8 }));
  assert.equal(fillet([{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: -50, y: 50 }], R), null);
});

test("the wire radius is 8 / 16 / 24 / 32 at the reference widths and continuous between", () => {
  const at = (w) => wireRadius(gutterAt(w));
  assert.equal(Math.round(at(390) * 1000) / 1000, 8);
  assert.equal(Math.round(at(768) * 1000) / 1000, 16);
  assert.equal(Math.round(at(1024) * 1000) / 1000, 24);
  assert.equal(Math.round(at(1440) * 1000) / 1000, 32);
  assert.equal(at(320), 8);
  assert.equal(at(1920), 32);
  let last = at(320);
  for (let w = 321; w <= 1920; w++) {
    const r = at(w);
    assert.ok(r >= last && r - last < 0.1, `continuous and rising at ${w}px`);
    last = r;
  }
});
