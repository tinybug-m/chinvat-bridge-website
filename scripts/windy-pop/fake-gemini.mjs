// TEST DOUBLE. This is NOT Gemini: a tiny local server imitating
// POST /v1beta/models/<model> (or /v1/, whichever the SDK sends):streamGenerateContent?alt=sse, for exercising src/lib/windy-pop/gemini.ts.
// Usage: FAKE_MODE=ok|429|empty|slow|500|blocked PORT=54398 node scripts/windy-pop/fake-gemini.mjs
// Then run the app with GEMINI_API_KEY=fake GEMINI_API_BASE_URL=http://127.0.0.1:54398
import http from "node:http";

export function startFake({ port = Number(process.env.PORT ?? 54398), mode = process.env.FAKE_MODE ?? "ok" } = {}) {
  const sse = (res, obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const chunk = (text, finishReason) => ({ candidates: [{ content: { role: "model", parts: [{ text }] }, ...(finishReason ? { finishReason } : {}), index: 0 }] });
  const server = http.createServer((req, res) => {
    req.resume(); if (process.env.FAKE_DEBUG) console.error(req.method, req.url);
    if (req.method !== "POST" || !/\/v1(beta)?\/models\/[^/]+:streamGenerateContent/.test(req.url ?? "")) {
      res.writeHead(404).end();
      return;
    }
    req.on("end", () => {
      if (mode === "429") return void res.writeHead(429, { "content-type": "application/json" }).end(JSON.stringify({ error: { code: 429, message: "quota", status: "RESOURCE_EXHAUSTED" } }));
      if (mode === "500") return void res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ error: { code: 500, message: "boom", status: "INTERNAL" } }));
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
      if (mode === "slow") return void setTimeout(() => res.end(), 60_000).unref();
      if (mode === "empty") return void (sse(res, chunk("", "STOP")), res.end());
      if (mode === "blocked") return void (sse(res, { candidates: [{ finishReason: "SAFETY", index: 0 }] }), res.end());
      sse(res, chunk("Hello from "));
      sse(res, chunk("the fake.", "STOP"));
      res.end();
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { port } = await startFake();
  console.log(`fake gemini (TEST DOUBLE) on http://127.0.0.1:${port} mode=${process.env.FAKE_MODE ?? "ok"}`);
}
