import type { ReactNode } from "react";
import Link from "next/link";
import { EmailLink } from "@/components/atoms/EmailLink";
import type { RichBlock, RichInline, RichText as RichTextData } from "@/lib/content/schema";

/*
 * Page rich text (the editorial ArticleContent model plus `contact_email`), rendered as the same
 * markup the hand-written pages had: <p>, <h2>/<h3>, lists, tables, blockquotes, next/link for site
 * paths, <a target="_blank" rel="noopener noreferrer"> for https links, and the contact address as
 * EmailLink. Text is React text (escaped); no dangerouslySetInnerHTML. Hrefs were validated by the
 * content schema before this runs. Conditional content shows only while the named article is published.
 */

interface Ctx {
  email: string;
  published: ReadonlySet<string>;
}

function inline(n: RichInline, ctx: Ctx, key: number): ReactNode {
  switch (n.type) {
    case "text":
      return n.text;
    case "strong":
      return <strong key={key}>{inlines(n.children, ctx)}</strong>;
    case "em":
      return <em key={key}>{inlines(n.children, ctx)}</em>;
    case "code":
      return <code key={key}>{n.text}</code>;
    case "link": {
      const children = inlines(n.children, ctx);
      if (n.href.startsWith("/")) return <Link key={key} href={n.href}>{children}</Link>;
      if (n.href.startsWith("#")) return <a key={key} href={n.href}>{children}</a>;
      return <a key={key} href={n.href} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
    case "conditional":
      return ctx.published.has(n.slug) ? inlines(n.children, ctx) : null;
    case "contact_email":
      return <EmailLink key={key} email={ctx.email} />;
  }
}

export function inlines(nodes: RichInline[], ctx: Ctx): ReactNode[] {
  return nodes.map((n, i) => inline(n, ctx, i));
}

function block(b: RichBlock, ctx: Ctx, key: number): ReactNode {
  switch (b.type) {
    case "paragraph":
      return <p key={key}>{inlines(b.children, ctx)}</p>;
    case "heading":
      return b.level === 2 ? <h2 key={key} id={b.id}>{inlines(b.children, ctx)}</h2> : <h3 key={key} id={b.id}>{inlines(b.children, ctx)}</h3>;
    case "list": {
      const items = b.items.map((it, i) => <li key={i}>{inlines(it.children, ctx)}</li>);
      return b.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
    }
    case "table":
      return (
        <table key={key}>
          {b.head.length ? (
            <thead>
              <tr>{b.head.map((c, i) => <th key={i}>{inlines(c, ctx)}</th>)}</tr>
            </thead>
          ) : null}
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}>{inlines(c, ctx)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    case "blockquote":
      return <blockquote key={key}>{b.children.map((c, i) => block(c, ctx, i))}</blockquote>;
    case "conditional":
      return ctx.published.has(b.slug) ? b.children.map((c, i) => block(c, ctx, i)) : null;
  }
}

export function RichText({ content, email, published = new Set() }: { content: RichTextData; email: string; published?: ReadonlySet<string> }) {
  const ctx = { email, published };
  return <>{content.blocks.map((b, i) => block(b, ctx, i))}</>;
}
