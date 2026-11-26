// Lab-only stand-in for the published-content RPCs the root layout reads, served from
// supabase/seed-content, so the preview needs no database and no credentials.
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const PORT = Number(process.env.STUB_PORT ?? 54911);
const dir = new URL("../../supabase/seed-content/", import.meta.url);
const docs = {};
let revisionId = 1;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const doc = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  if (!doc.key || !doc.data) continue;
  docs[doc.key] = {
    key: doc.key,
    kind: doc.kind,
    revisionId: revisionId++,
    schemaVersion: 1,
    contentHash: createHash("sha256").update(JSON.stringify(doc.data)).digest("hex"),
    data: doc.data,
    publishedAt: null,
    updatedOn: null,
  };
}

createServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", () => {
    const args = body ? JSON.parse(body) : {};
    const rpc = request.url.split("?")[0].split("/").pop();
    let result = [];
    if (rpc === "published_document") result = docs[args.p_key] ?? null;
    if (rpc === "published_documents") result = Object.fromEntries((args.p_keys ?? []).filter((k) => docs[k]).map((k) => [k, docs[k]]));
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(result));
  });
}).listen(PORT, "127.0.0.1", () => console.log(`content stub on ${PORT}: ${Object.keys(docs).length} documents`));
