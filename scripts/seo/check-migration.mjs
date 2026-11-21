// Checks the .uk → .com domain migration against the live site (read-only GET requests).
//
// node scripts/seo/check-migration.mjs [--origin https://www.chinvatbridge.com]
//
// Exits 1 if any check fails. Checks:
//   - every .uk host and scheme answers 301/308 with the same path AND query on the canonical origin
//     (sign-in callbacks, Stripe returns and campaign tags all depend on the query surviving);
//   - the .com apex and http variants reach the canonical origin with path and query kept;
//   - robots.txt names the canonical sitemap;
//   - every sitemap URL is on the canonical origin, returns 200, is indexable and canonicalises to itself.

const argv = process.argv.slice(2);
const originArg = argv.includes("--origin") ? argv[argv.indexOf("--origin") + 1] : undefined;
const origin = (originArg ?? "https://www.chinvatbridge.com").replace(/\/$/, "");

const results = [];
const record = (ok, name, detail) => {
  results.push({ ok, name, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

async function head(url) {
  const res = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(20_000) });
  await res.body?.cancel();
  return res;
}

// Each case: request URL → the exact Location expected (one hop).
const target = (pathAndQuery) => `${origin}${pathAndQuery}`;
const redirectCases = [
  ["https://www.chinvatbridge.uk/auth/callback?code=TEST&next=/dashboard", target("/auth/callback?code=TEST&next=/dashboard")],
  ["https://www.chinvatbridge.uk/subscribe/success?session_id=cs_test_CHECK", target("/subscribe/success?session_id=cs_test_CHECK")],
  ["https://www.chinvatbridge.uk/insights?utm_source=check&utm_medium=test&utm_campaign=migration", target("/insights?utm_source=check&utm_medium=test&utm_campaign=migration")],
  ["https://chinvatbridge.uk/services/seo?x=1", target("/services/seo?x=1")],
  ["http://www.chinvatbridge.uk/pricing?x=1", target("/pricing?x=1")],
  ["http://chinvatbridge.uk/?x=1", target("/?x=1")],
  ["https://www.chinvatbridge.uk/insights", target("/insights")],
];

for (const [from, expected] of redirectCases) {
  try {
    const res = await head(from);
    const location = res.headers.get("location") ?? "";
    const statusOk = res.status === 301 || res.status === 308;
    // An http request may first upgrade to https on the same host; follow that one hop only.
    let finalLocation = location;
    if (statusOk && location.startsWith("https://") && new URL(location).host === new URL(from).host) {
      finalLocation = (await head(location)).headers.get("location") ?? "";
    }
    record(statusOk && finalLocation === expected, `redirect ${from}`, `${res.status} → ${finalLocation || "(none)"}${finalLocation === expected ? "" : `; expected ${expected}`}`);
  } catch (error) {
    record(false, `redirect ${from}`, String(error));
  }
}

for (const from of ["https://chinvatbridge.com/insights?x=1", "http://www.chinvatbridge.com/insights?x=1"]) {
  const res = await head(from);
  const location = res.headers.get("location") ?? "";
  record([301, 308].includes(res.status) && location === target("/insights?x=1"), `redirect ${from}`, `${res.status} → ${location}`);
}

const robots = await (await fetch(`${origin}/robots.txt`)).text();
record(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "robots.txt names the canonical sitemap");

const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
record(locs.length > 0, "sitemap has URLs", `${locs.length}`);

for (const loc of locs) {
  if (!loc.startsWith(origin)) {
    record(false, `sitemap URL on canonical origin: ${loc}`);
    continue;
  }
  const res = await fetch(loc, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  const html = await res.text();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  const robotsMeta = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((m) => m[1]).join(" | ");
  const ok = res.status === 200 && canonical === loc && !/noindex/.test(robotsMeta);
  record(ok, `sitemap page ${loc}`, `${res.status}; canonical ${canonical || "(none)"}; robots ${robotsMeta || "(none)"}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
