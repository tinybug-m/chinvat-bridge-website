// Windy Pup's sit (src/components/windy-pop/pose.ts): the standing dog, bent.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ATTENTIONS, CUES, CUE_LENGTH, GAIT, MOODS, bell, hop, legMotion, legOf, sitPoint, trotDrop, trotSpeed } from "../../src/components/windy-pop/pose.ts";

const moved = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test("the forepaws stay planted", () => {
  const paw = [0.26, 0.05, 0.5];
  assert.ok(moved(paw, sitPoint(paw)) < 0.03);
});

test("the rump comes down to the ground and nothing goes through it", () => {
  assert.ok(sitPoint([0, 0.52, -0.5])[1] < 0.12, "underside of the rump rests");
  assert.ok(sitPoint([0, 1.12, -0.5])[1] < 0.75, "back drops");
  for (let y = 0; y <= 1.4; y += 0.1) for (let z = -0.9; z <= 0.7; z += 0.1) assert.ok(sitPoint([0.2, y, z])[1] >= 0);
});

test("the hind paws slide forwards, flat, to lie beside the forepaws", () => {
  const sat = sitPoint([0.3, 0.06, -0.6]);
  assert.ok(sat[2] > 0 && sat[1] < 0.1);
  assert.ok(sat[0] > 0.3, "set a little wider than when standing");
});

test("each paw belongs wholly to its own leg; the back and the midline to none", () => {
  assert.deepEqual(legOf([-0.26, 0.05, 0.5]), [0, 1]);
  assert.deepEqual(legOf([0.26, 0.05, 0.5]), [1, 1]);
  assert.deepEqual(legOf([-0.3, 0.05, -0.58]), [2, 1]);
  assert.deepEqual(legOf([0.3, 0.05, -0.58]), [3, 1]);
  assert.equal(legOf([0.2, 0.95, 0.1])[1], 0, "the back");
  assert.equal(legOf([0, 0.5, 0.45])[1], 0, "the chest between the forelegs");
});

test("a leg's weight changes smoothly, so the coat bends rather than tears", () => {
  for (let y = 0.02; y < 0.8; y += 0.01) {
    const step = Math.abs(legOf([0.25, y, 0.44])[1] - legOf([0.25, y + 0.01, 0.44])[1]);
    assert.ok(step < 0.12, `jump of ${step.toFixed(2)} at y ${y.toFixed(2)}`);
  }
});

test("the trot moves diagonal pairs together and lifts only the paws coming forward", () => {
  for (const phase of [0.3, 1.2, 2.5, 4]) {
    const [a] = legMotion(0, phase, 1);
    const [d] = legMotion(3, phase, 1);
    const [b] = legMotion(1, phase, 1);
    assert.equal(a, d);
    assert.ok(Math.abs(a + b) < 1e-9, "the other pair swings opposite");
  }
  assert.ok(legMotion(0, 0, 1)[1] > 0.9 * GAIT.lift, "lifted mid-swing");
  assert.equal(legMotion(0, Math.PI, 1)[1], 0, "planted mid-stance");
  assert.equal(trotSpeed(0), 0);
  assert.equal(trotDrop(1, 0), 0);
  assert.ok(trotSpeed(1) > 0.5 && trotSpeed(1) < 3, `speed ${trotSpeed(1).toFixed(2)}`);
});

test("the reaction names match the contract, in the order the scene reads them", () => {
  assert.deepEqual([...ATTENTIONS], ["idle", "listening", "thinking", "talking"]);
  assert.deepEqual([...MOODS], ["neutral", "happy", "curious", "sorry", "excited"]);
  assert.deepEqual([...CUES], ["wag", "hop", "tilt", "sneeze", "yawn"]);
  assert.equal(CUE_LENGTH.length, CUES.length);
});

test("a hop gathers, leaves the ground once, and lands where it started", () => {
  const out = [0, 0];
  assert.deepEqual(hop(0, out), [0, 0]);
  assert.ok(hop(0.12, out)[1] > 0.02 && out[0] === 0, "crouches first");
  assert.ok(hop(0.33, out)[0] > 0.1, "in the air");
  for (let t = 0; t <= CUE_LENGTH[1]; t += 0.01) assert.ok(hop(t, out)[0] >= 0 && out[0] < 0.2, "a small hop");
  assert.deepEqual(hop(CUE_LENGTH[1], out), [0, 0], "lands at rest");
  assert.equal(bell(0.5, 0, 0.2, 0.8, 1), 1);
});
