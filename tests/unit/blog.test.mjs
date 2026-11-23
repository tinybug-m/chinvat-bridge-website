// Pure article and sitemap helpers (src/lib/blog-helpers.ts): `pnpm test:unit`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSitemap, canonicalUrl, pickRelated } from "../../src/lib/blog-helpers.ts";

const SITE = "https://chinvatbridge.com";

test("canonical URLs use the site origin; the home page is the bare origin", () => {
  assert.equal(canonicalUrl(SITE, "/"), SITE);
  assert.equal(canonicalUrl(`${SITE}/`, "/pricing"), `${SITE}/pricing`);
});

test("the sitemap is ordered home, services, pricing, insights, articles, legal", () => {
  const entries = [
    { kind: "page", path: "/terms", lastModified: "2026-01-02" },
    { kind: "article", path: "/insights/newer", lastModified: "2026-11-01" },
    { kind: "article", path: "/insights/older", lastModified: null },
    { kind: "page", path: "/pricing", lastModified: null },
    { kind: "page", path: "/services/seo", lastModified: "2026-05-05" },
    { kind: "page", path: "/insights", lastModified: null },
    { kind: "page", path: "/", lastModified: null },
    { kind: "page", path: "/privacy", lastModified: "2026-01-01" },
    { kind: "page", path: "/services/ai-integration", lastModified: null },
  ];
  const out = buildSitemap(SITE, entries);
  assert.deepEqual(
    out.map((i) => i.url.replace(SITE, "") || "/"),
    ["/", "/services/ai-integration", "/services/seo", "/pricing", "/insights", "/insights/newer", "/insights/older", "/privacy", "/terms"],
  );
  assert.equal(out[0].priority, 1);
});

test("lastModified is present only when the entry has a date", () => {
  const out = buildSitemap(SITE, [
    { kind: "page", path: "/pricing", lastModified: null },
    { kind: "page", path: "/terms", lastModified: "2026-01-02" },
  ]);
  assert.equal("lastModified" in out[0], false);
  assert.equal(out[1].lastModified, "2026-01-02");
});

test("related reading puts shared tags first, then list order, never the article itself", () => {
  const all = [
    { slug: "a", category: "AI", tags: ["ai"] },
    { slug: "b", category: "SEO", tags: ["seo", "ai"] },
    { slug: "c", category: "AI", tags: [] },
    { slug: "d", category: "Other", tags: [] },
    { slug: "e", category: "Other", tags: [] },
  ];
  const picked = pickRelated(all[0], all, 3).map((p) => p.slug);
  assert.deepEqual(picked, ["b", "c", "d"]);
});

test("related reading keeps the original rule: two by default, and category does not rank", () => {
  const all = [
    { slug: "current", category: "AI", tags: ["ai"] },
    { slug: "newest-other", category: "SEO", tags: ["seo"] },
    { slug: "same-category", category: "AI", tags: [] },
    { slug: "shares-tag", category: "Other", tags: ["ai"] },
  ];
  assert.deepEqual(pickRelated(all[0], all).map((p) => p.slug), ["shares-tag", "newest-other"]);
});

test("the insights index takes its newest article's date; other undated pages stay undated", () => {
  const out = buildSitemap(SITE, [
    { kind: "page", path: "/insights", lastModified: null },
    { kind: "page", path: "/pricing", lastModified: null },
    { kind: "article", path: "/insights/older", lastModified: "2026-09-15" },
    { kind: "article", path: "/insights/newer", lastModified: "2026-11-20" },
  ]);
  const of = (path) => out.find((e) => e.url === `${SITE}${path}`);
  assert.equal(of("/insights").lastModified, "2026-11-20");
  assert.equal("lastModified" in of("/pricing"), false);
  // A later date of its own wins.
  const own = buildSitemap(SITE, [
    { kind: "page", path: "/insights", lastModified: "2026-12-01" },
    { kind: "article", path: "/insights/newer", lastModified: "2026-11-20" },
  ]);
  assert.equal(own.find((e) => e.url === `${SITE}/insights`).lastModified, "2026-12-01");
});
