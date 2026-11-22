// The generated artwork ink for the energy wire (src/components/home/services/energy): not stale, well formed, and sampled correctly.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const energy = path.join(root, "src/components/home/services/energy");
const data = JSON.parse(fs.readFileSync(path.join(energy, "ink.generated.json"), "utf8"));
const { inkForPlate } = await import("../../src/components/home/services/energy/ink-core.ts");

test("generated ink is not stale: every artwork source file still hashes as it did at generation", () => {
  const stale = [];
  for (const [file, hash] of Object.entries(data.sources)) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) { stale.push(`${file} (missing)`); continue; }
    if (crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") !== hash) stale.push(file);
  }
  assert.deepEqual(stale, [], `artwork changed since ink.generated.json was made; run "pnpm energy:ink" with the site running: ${stale.join(", ")}`);
});

test("generated ink has the expected shape", () => {
  assert.equal(data.version, 1);
  assert.equal(data.step, 6);
  assert.equal(data.plates.length, 8);
  for (const p of data.plates) {
    assert.match(p.sig, /^[0-9a-f]+$/);
    for (const e of p.elements) {
      assert.ok(e.len >= 0 && e.sp.length >= 1);
      for (const s of e.sp) assert.equal(s.length % 3, 0);
    }
  }
});

test("a filled square gets a 6 px grid inside it and an outline every 6 px, boundary points included", () => {
  // 20 x 20 square at scale 1: outline length 80 -> 14 steps (15 points); grid nx = ny = ceil(20/6) = 4 -> 3 x 3 inside.
  const el = { sw: 0, fill: true, faint: false, len: 80, bb: [0, 0, 20, 20], sp: [[0, 0, 0, 20, 20, 0, 40, 20, 20, 60, 0, 20, 80, 0, 0]] };
  const out = [];
  inkForPlate({ sig: "t", elements: [el] }, { a: 1, b: 0, c: 0, d: 1, e: 100, f: 50 }, 3, (x, y) => ({ x, y }), 6, out);
  assert.equal(out.length, 15 + 9);
  assert.ok(out.every((q) => q.stop === 3 && !q.faint));
  assert.deepEqual([out[0].x, out[0].y], [100, 50]);
  // Diamond: grid points exactly on its edges count as inside (as the browser's isPointInFill does).
  const dia = { sw: 0, fill: true, faint: false, len: 4 * Math.hypot(14, 14), bb: [0, 0, 28, 28], sp: [[0, 14, 0, 19.799, 28, 14, 39.598, 14, 28, 59.397, 0, 14, 79.196, 14, 0]] };
  const d2 = [];
  inkForPlate({ sig: "t", elements: [dia] }, { a: 1.7, b: 0, c: 0, d: 1.7, e: 0, f: 0 }, 0, (x, y) => ({ x, y }), 6, d2);
  assert.ok(d2.length > 55, `diamond ink ${d2.length}`);
});
