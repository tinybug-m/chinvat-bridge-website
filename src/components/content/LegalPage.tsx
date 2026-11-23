import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { Prose } from "@/components/system/Prose";
import { SiteShell } from "@/components/templates/SiteShell";
import { getPage, getSiteChrome } from "@/lib/content/read";
import { pageMetadata } from "@/lib/metadata";
import { inlines, RichText } from "./RichText";

/*
 * /privacy and /terms, from their page documents (template "legal"): header, the "Last updated"
 * aside (updatedOn, also the sitemap's lastmod), the lede and the body as rich text.
 */

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

async function legalPage(path: string) {
  const page = await getPage(path);
  if (!page || page.data.template !== "legal") notFound();
  return page.data;
}

export async function legalMetadata(path: string): Promise<Metadata> {
  const [page, { settings }] = await Promise.all([legalPage(path), getSiteChrome()]);
  return {
    ...pageMetadata({ title: page.seo.title, description: page.seo.description, path }, settings),
    ...(page.seo.robots === "noindex" && { robots: { index: false, follow: true } }),
  };
}

export async function LegalPage({ path }: { path: string }) {
  const [page, { settings }] = await Promise.all([legalPage(path), getSiteChrome()]);
  const ctx = { email: settings.contactEmail, published: new Set<string>() };
  return (
    <SiteShell>
      <PageHeader kicker={page.header.kicker} title={page.header.title} />
      <Container className="grid grid-cols-1 gap-y-10 pt-10 pb-section lg:grid-cols-12 lg:gap-x-6 lg:pt-16">
        <aside aria-label="About this document" className="lg:col-span-3">
          <p className="text-small text-ink-muted lg:sticky lg:top-28">
            {page.lastUpdatedLabel} <time dateTime={page.updatedOn}>{formatDate(page.updatedOn)}</time>
          </p>
        </aside>
        <Prose className="lg:col-span-7 lg:col-start-4">
          <p className="text-lede text-ink">{inlines(page.lede, ctx)}</p>
          <RichText content={page.body} email={settings.contactEmail} />
        </Prose>
      </Container>
    </SiteShell>
  );
}
