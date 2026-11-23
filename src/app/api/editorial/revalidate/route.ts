import { revalidatePath, revalidateTag } from "next/cache";
import { parseEvent, revalidationPlan, verifySignature } from "@/lib/editorial/signature";

/*
 * Publication events from the editorial backend: articles (published, updated, unpublished, slug
 * changed, rolled back) and website documents (pages, settings, navigation, collections). Authenticated by an HMAC signature over the raw body with a five-minute timestamp
 * window, compared in constant time. The event carries no content: the site refetches the current
 * published state, so processing is idempotent and order-independent, and a replayed event within
 * the window can only cause a harmless extra refresh. Event ids already handled by this instance are
 * acknowledged without repeating the work.
 *
 * What is refreshed, for every event:
 *  - the editorial data cache (tag): article list, the article itself and, for a slug change, its old slug;
 *  - /insights, /sitemap.xml, the homepage teaser, every service page (related insights);
 *  - the article's page and old page, and every article page (related reading and conditional
 *    sentences depend on which articles are published).
 * Tags expire immediately ({ expire: 0 }): the next request renders fresh data, so a new article is
 * in the archive and sitemap at once and an unpublished one is gone at once.
 */

const MAX_BODY_BYTES = 16 * 1024;

/**
 * The service pages show related insights, so article events refresh them. These are the route
 * folders under src/app/(pages)/services (application routing, not editable content).
 */
const SERVICE_ROUTES = ["/services/ai-integration", "/services/workflow-automation", "/services/custom-software", "/services/seo"] as const;
const seen = new Map<string, number>();

/** Recorded only after the work succeeded, so a failed attempt is redone when the backend retries. */
function remember(id: string) {
  seen.set(id, Date.now());
  if (seen.size > 1000) for (const key of [...seen.keys()].slice(0, 500)) seen.delete(key);
}

const json = (status: number, body: unknown) =>
  Response.json(body, { status, headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } });

export async function POST(request: Request) {
  const secret = process.env.EDITORIAL_REVALIDATE_SECRET;
  if (!secret || secret.length < 32) return json(503, { error: "not_configured" });
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) return json(413, { error: "too_large" });
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return json(413, { error: "too_large" });

  const check = verifySignature(secret, request.headers.get("x-editorial-timestamp"), request.headers.get("x-editorial-signature"), body);
  if (!check.ok) return json(401, { error: "invalid_signature", reason: check.reason });
  const event = parseEvent(body);
  if (!event) return json(400, { error: "invalid_event" });
  const header = request.headers.get("x-editorial-event");
  if (header && header !== event.id) return json(400, { error: "invalid_event" });

  if (seen.has(event.id)) return json(200, { ok: true, duplicate: true, event: event.id });

  // Only what this event affects (CONTRACT "Publication events"); see revalidationPlan().
  const plan = revalidationPlan(event, SERVICE_ROUTES);
  for (const tag of plan.tags) revalidateTag(tag, { expire: 0 });
  for (const path of plan.paths) revalidatePath(path);
  if (plan.everyArticlePage) revalidatePath("/insights/[slug]", "page");
  if (plan.wholeSite) revalidatePath("/", "layout");
  remember(event.id);

  const extra = [...(plan.everyArticlePage ? ["/insights/[slug] (all article pages)"] : []), ...(plan.wholeSite ? ["/ (layout: every page)"] : [])];
  return json(200, { ok: true, event: event.id, type: event.type, revalidated: { tags: plan.tags, paths: [...plan.paths, ...extra] } });
}
