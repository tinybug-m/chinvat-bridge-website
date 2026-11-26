// Windy Pup's mood tag: removed at the start of a reply, however the stream is cut into chunks.
import assert from "node:assert/strict";
import { register } from "node:module";
import { test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(s, c, next) {
  try { return await next(s, c); } catch (e) {
    if (s.startsWith(".") && !/\\.[a-z]+$/.test(s)) return next(s + ".ts", c);
    throw e;
  }
}`),
);

const { createMoodFilter, parseMood, withMood } = await import("../../src/lib/windy-pop/mood.ts");
const { MOODS } = await import("../../src/lib/windy-pop/chat-schema.ts");
const { pickMockMood } = await import("../../src/lib/windy-pop/mock.ts");

/** Runs chunks through the filter; returns the mood (first decision) and all text. */
function run(chunks) {
  const f = createMoodFilter();
  let mood;
  let text = "";
  const take = (s) => {
    if (s.mood) {
      assert.equal(mood, undefined, "mood decided twice");
      mood = s.mood;
    }
    if (s.text) assert.ok(mood, "text before the mood was decided");
    text += s.text;
  };
  for (const c of chunks) take(f.push(c));
  take(f.end());
  return { mood, text };
}

/** Every way of cutting a string into two chunks, and into single characters. */
function everyCut(s) {
  const cuts = [[...s]];
  for (let i = 0; i <= s.length; i++) cuts.push([s.slice(0, i), s.slice(i)]);
  return cuts;
}

test("a whole tag at the start is removed and its mood reported", () => {
  assert.deepEqual(run(["[mood:happy] Hello there."]), { mood: "happy", text: "Hello there." });
  for (const m of MOODS) assert.deepEqual(run([`[mood:${m}]Hi`]), { mood: m, text: "Hi" });
});

test("a tag split anywhere across chunks gives the same result", () => {
  const whole = "[mood:curious] Which task costs you the most time?";
  for (const chunks of everyCut(whole)) assert.deepEqual(run(chunks), { mood: "curious", text: "Which task costs you the most time?" });
  const spaced = "  \n[ mood : Excited ]\nGreat news.";
  for (const chunks of everyCut(spaced)) assert.deepEqual(run(chunks), { mood: "excited", text: "Great news." });
});

test("a missing tag is neutral and nothing is lost, however it is cut", () => {
  const text = "Chinvat Bridge is a UK-based consultancy.";
  for (const chunks of everyCut(text)) assert.deepEqual(run(chunks), { mood: "neutral", text });
  // Text that starts like a tag but is not one comes back whole.
  for (const s of ["[mo", "[mood", "[m", "[", "[moody] thing", "[mood: nope", "[link](/pricing) is here"]) {
    for (const chunks of everyCut(s)) assert.deepEqual(run(chunks), { mood: "neutral", text: s }, s);
  }
});

test("an invalid mood is hidden and becomes neutral", () => {
  assert.deepEqual(run(["[mood:ecstatic] Hello."]), { mood: "neutral", text: "Hello." });
  assert.deepEqual(run(["[mood:] Hello."]), { mood: "neutral", text: "Hello." });
  assert.equal(parseMood("HAPPY "), "happy");
  assert.equal(parseMood("x"), "neutral");
});

test("a tag that is not at the start is ordinary text", () => {
  const s = "Hello [mood:happy] there.";
  for (const chunks of everyCut(s)) assert.deepEqual(run(chunks), { mood: "neutral", text: s });
  // Only the first tag counts.
  assert.deepEqual(run(["[mood:happy] A [mood:sorry] B"]), { mood: "happy", text: "A [mood:sorry] B" });
  // A very long run after "[mood:" is not a tag.
  const long = `[mood:${"x".repeat(60)}] y`;
  assert.deepEqual(run([long]), { mood: "neutral", text: long });
});

test("an empty or tag-only stream yields no text", () => {
  assert.deepEqual(run([]), { mood: "neutral", text: "" });
  assert.deepEqual(run(["[mood:sorry]"]), { mood: "sorry", text: "" });
  assert.deepEqual(run(["[mood:", "sorry]"]), { mood: "sorry", text: "" });
});

test("withMood yields one mood event before any text, over an async stream", async () => {
  async function* source() {
    yield "[mo";
    yield "od:hap";
    yield "py] Hi ";
    yield "again";
  }
  const events = [];
  for await (const e of withMood(source())) events.push(e);
  assert.deepEqual(events, [
    { kind: "mood", mood: "happy" },
    { kind: "text", text: "Hi " },
    { kind: "text", text: "again" },
  ]);
  async function* plain() {
    yield "Just text";
  }
  const second = [];
  for await (const e of withMood(plain())) second.push(e);
  assert.deepEqual(second, [
    { kind: "mood", mood: "neutral" },
    { kind: "text", text: "Just text" },
  ]);
});

test("mock moods are always valid moods", () => {
  for (const q of ["hello", "thanks, brilliant", "this is broken", "what does it cost?", "tell me about seo", "automate invoices?"]) {
    assert.ok(MOODS.includes(pickMockMood(q)), q);
  }
});
