// Crawls a live site from its homepage and sitemap and reports on-page SEO problems (read-only).
//
// node scripts/seo/crawl-live.mjs [--origin https://www.chinvatbridge.com] [--external] [--max 200]
//
// Per HTML page: status, title and description length, H1 count, canonical, robots meta,
// JSON-LD validity and types, images without alt, and internal links that 404 or redirect.
// With --external, also checks every outbound link once (HEAD, falling back to GET).
// Prints a table, then the issues; exits 1 if any page has an error-level issue.

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback);
const origin = value("--origin", "https://www.chinvatbridge.com").replace(/\/$/, "");
const maxPages = Number(value("--max", "200"));
const host = new URL(origin).host;

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html) => decode(html.replace(/<[^>]+>/g, "")).trim();

async function get(url, method = "GET") {
  return fetch(url, { method, redirect: "manual", signal: AbortSignal.timeout(20_000), headers: { "user-agent": "chinvat-seo-check/1.0" } });
}

const pages = new Map(); // url -> report
const linkStatus = new Map(); // internal url -> status
const external = new Map(); // external url -> Set(source pages)
const queue = [origin];

const sitemapXml = await (await get(`${origin}/sitemap.xml`)).text();
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
queue.push(...sitemapUrls);

function normalise(href, base) {
  try {
    const u = new URL(decode(href), base);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = "";
    return u.toString().replace(/\/$/, u.pathname === "/" ? "" : "");
  } catch {
    return null;
  }
}

while (queue.length && pages.size < maxPages) {
  const url = queue.shift();
  if (pages.has(url)) continue;
  const res = await get(url);
  const report = { url, status: res.status, issues: [], inSitemap: sitemapUrls.has(url) };
  pages.set(url, report);
  linkStatus.set(url, res.status);
  if (res.status !== 200) {
    await res.body?.cancel();
    if (report.inSitemap) report.issues.push(["error", `sitemap URL returns ${res.status}`]);
    continue;
  }
  const html = await res.text();
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  const robots = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((m) => m[1]);
  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map((m) => text(m[0]));
  const noindex = robots.some((r) => /noindex/.test(r));
  Object.assign(report, { title, titleLength: title.length, descriptionLength: description.length, canonical, robots: robots.join(" | "), h1: h1s.length, noindex });

  if (!title) report.issues.push(["error", "no <title>"]);
  else if (title.length > 65) report.issues.push(["warn", `title ${title.length} chars (may truncate)`]);
  if (!noindex) {
    if (!description) report.issues.push(["error", "no meta description"]);
    else if (description.length < 70 || description.length > 165) report.issues.push(["warn", `description ${description.length} chars`]);
    if (canonical !== url) report.issues.push(["error", `canonical ${canonical || "(none)"} ≠ URL`]);
    if (h1s.length !== 1) report.issues.push(["error", `${h1s.length} H1 elements`]);
    if (!report.inSitemap) report.issues.push(["warn", "indexable but not in the sitemap"]);
  } else if (report.inSitemap) {
    report.issues.push(["error", "noindex page listed in the sitemap"]);
  }
  if (new Set(robots).size > 1 && robots.some((r) => /index, follow/.test(r) && !/noindex/.test(r)) && noindex) {
    report.issues.push(["error", `conflicting robots tags: ${robots.join(" | ")}`]);
  }

  const types = [];
  for (const block of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block[1]);
      for (const item of data["@graph"] ?? [data]) types.push(item["@type"]);
    } catch {
      report.issues.push(["error", "JSON-LD does not parse"]);
    }
  }
  report.schema = types.join(", ");

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/\salt=/.test(i)).length;
  if (noAlt) report.issues.push(["warn", `${noAlt} <img> without alt`]);

  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const link = normalise(m[1], url);
    if (!link) continue;
    const u = new URL(link);
    if (u.host === host) {
      const clean = `${u.origin}${u.pathname}`.replace(/\/$/, u.pathname === "/" ? "" : "");
      if (u.search) continue; // query variants are canonicalised; not crawled
      if (!pages.has(clean)) queue.push(clean);
      (report.links ??= new Set()).add(clean);
    } else if (!/chinvatbridge\./.test(u.host)) {
      if (!external.has(link)) external.set(link, new Set());
      external.get(link).add(url);
    } else {
      report.issues.push(["warn", `links to another own host: ${link}`]);
    }
  }
}

// Internal links to pages that redirect or fail.
for (const report of pages.values()) {
  for (const link of report.links ?? []) {
    let status = linkStatus.get(link);
    if (status === undefined) {
      status = (await get(link)).status;
      linkStatus.set(link, status);
    }
    if (status >= 400) report.issues.push(["error", `links to ${link} (${status})`]);
    else if (status >= 300) report.issues.push(["warn", `links to ${link} (${status} redirect)`]);
  }
}

if (flag("--external")) {
  for (const [link, sources] of external) {
    let status;
    try {
      status = (await get(link, "HEAD")).status;
      if (status === 405 || status === 403) status = (await get(link)).status;
    } catch (error) {
      status = `error: ${error.cause?.code ?? error.name}`;
    }
    const ok = typeof status === "number" && status < 400;
    console.log(`${ok ? "ok  " : "BAD "} ${status}  ${link}  ← ${[...sources].map((s) => s.replace(origin, "") || "/").join(", ")}`);
  }
  console.log("");
}

console.log("status | title len | desc len | H1 | robots | schema | url");
for (const r of pages.values()) {
  console.log([r.status, r.titleLength ?? "", r.descriptionLength ?? "", r.h1 ?? "", r.robots ?? "", r.schema ?? "", r.url.replace(origin, "") || "/"].join(" | "));
}
let errors = 0;
console.log("\nIssues:");
for (const r of pages.values()) {
  for (const [level, message] of r.issues) {
    if (level === "error") errors++;
    console.log(`${level.toUpperCase().padEnd(5)} ${r.url.replace(origin, "") || "/"}: ${message}`);
  }
}
console.log(`\n${pages.size} pages crawled, ${errors} errors`);
process.exit(errors ? 1 : 0);
