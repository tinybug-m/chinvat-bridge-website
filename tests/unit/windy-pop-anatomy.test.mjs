// Windy Pup's breed anatomy (src/components/windy-pop/anatomy.ts): the traits that identify the dog.
import assert from "node:assert/strict";
import { test } from "node:test";
import * as dog from "../../src/components/windy-pop/anatomy.ts";

test("the ears are drop ears: they rise from the root, then hang below it, outside the skull", () => {
  const spine = Array.from({ length: 21 }, (_, i) => dog.earToHead(dog.earPoint(0, i / 20, true), 1));
  const top = Math.max(...spine.map((p) => p[1]));
  const tip = spine.at(-1);
  assert.ok(top > spine[0][1], "rises from the root");
  assert.ok(tip[1] < spine[0][1], "tip hangs below the root");
  assert.ok(dog.headSdf(tip) > 0, "tip is clear of the head");
});

test("the two ears mirror each other", () => {
  const right = dog.earToHead(dog.earPoint(0.3, 0.6, true), 1);
  const left = dog.earToHead(dog.earPoint(0.3, 0.6, true), -1);
  assert.deepEqual(left, [-right[0], right[1], right[2]]);
});

test("the muzzle is short, as in a Shih Tzu, and the nose sits at its tip", () => {
  const front = dog.raycast(dog.headSdf, [0, -0.158, 1.5], [0, 0, -1])[2];
  const back = -dog.raycast(dog.headSdf, [0, 0.03, -1.5], [0, 0, 1])[2];
  const muzzle = front - dog.EYE_Z;
  assert.ok(muzzle > 0.1 && muzzle / (front + back) < 0.32, `muzzle ${muzzle.toFixed(2)} of head ${(front + back).toFixed(2)}`);
  assert.ok(Math.abs(dog.NOSE.center[2] - front) < 0.08);
});

test("the trunk and head are symmetrical", () => {
  for (const [x, y, z] of [[0.2, 0.9, 0.1], [0.3, 0.4, -0.6], [0.15, 1.2, 0.4]]) {
    assert.equal(dog.bodySdf([x, y, z]), dog.bodySdf([-x, y, z]));
    assert.equal(dog.headSdf([x, y - 1, z]), dog.headSdf([-x, y - 1, z]));
  }
});

test("the terrier stance shortens the legs and keeps the paws on the ground", () => {
  assert.equal(dog.settle([0.2, 0, 0.4])[1], 0);
  assert.ok(dog.settle([0, 0.6, 0])[1] < 0.6);
  // Continuous where the leg meets the body.
  assert.ok(Math.abs(dog.settle([0, 0.6999, 0])[1] - dog.settle([0, 0.7001, 0])[1]) < 0.002);
});

test("the mouth is a soft dog's smile: two lips curving down from a short philtrum, corners lifted", () => {
  const [, start] = dog.lipPoint(0);
  const [cornerX, corner] = dog.lipPoint(1);
  const lowest = Math.min(...Array.from({ length: 41 }, (_, i) => dog.lipPoint(i / 40)[1]));
  const noseBottom = dog.NOSE.center[1] - dog.NOSE.radii[1];
  assert.ok(noseBottom - start > 0 && noseBottom - start < 0.06, "a short philtrum");
  assert.ok(lowest < start && lowest < corner - 0.01, "the lips dip and lift again at the corners");
  assert.ok(cornerX > 0.08 && cornerX < 0.16, "a small mouth, inside the muzzle");
  assert.deepEqual(dog.lipPoint(-0.4), [-dog.lipPoint(0.4)[0], dog.lipPoint(0.4)[1]]);
});

test("the jaw opens most in the middle and not at all at the corners", () => {
  const [cornerX] = dog.lipPoint(1);
  assert.equal(dog.jawOpening(0), 1);
  assert.ok(dog.jawOpening(cornerX * 1.05) < 0.05);
  assert.ok(dog.jawWeight([0, -0.32, 0.4]) > 0.9, "the chin drops");
  assert.equal(dog.jawWeight([0, -0.12, 0.45]), 0, "the nose stays");
});
