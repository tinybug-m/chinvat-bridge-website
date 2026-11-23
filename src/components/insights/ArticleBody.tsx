import type { ReactNode } from "react";
import Link from "next/link";
import { classifyHref, type ArticleContent, type Block, type Inline } from "@/lib/editorial/content";

/*
 * Renders an article's structured content as the same markup the hand-written TSX articles produced:
 * <p>, <h2>/<h3>, lists, tables, blockquotes, <strong>/<em>/<code>, next/link for site paths and
 * <a target="_blank" rel="noopener noreferrer"> for external links. Text is rendered as React text
 * (escaped); there is no dangerouslySetInnerHTML. Conditional content (formerly <WhenPublished>)
 * appears only while the article it names is published, so no link ever points at a missing page.
 */

interface Ctx {
  published: Set<string>;
}

function inlines(nodes: Inline[], ctx: Ctx): ReactNode[] {
  return nodes.map((n, i) => inline(n, ctx, i));
}

function inline(n: Inline, ctx: Ctx, key: number): ReactNode {
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
      const kind = classifyHref(n.href);
      const children = inlines(n.children, ctx);
      if (kind === "internal") return <Link key={key} href={n.href}>{children}</Link>;
      if (kind === "anchor") return <a key={key} href={n.href}>{children}</a>;
      if (kind === "external") return <a key={key} href={n.href} target="_blank" rel="noopener noreferrer">{children}</a>;
      return children;
    }
    case "conditional":
      return ctx.published.has(n.slug) ? inlines(n.children, ctx) : null;
  }
}

function block(b: Block, ctx: Ctx, key: number): ReactNode {
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
      return <blockquote key={key}>{blocks(b.children, ctx)}</blockquote>;
    case "conditional":
      return ctx.published.has(b.slug) ? blocks(b.children, ctx) : null;
  }
}

function blocks(list: Block[], ctx: Ctx): ReactNode[] {
  return list.map((b, i) => block(b, ctx, i));
}

export function ArticleBody({ content, published }: { content: ArticleContent; published: Set<string> }) {
  return <>{blocks(content.blocks, { published })}</>;
}
