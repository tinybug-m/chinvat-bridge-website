import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Inline } from "./markdown";

function inline(nodes: Inline[], keyBase = ""): ReactNode {
  return nodes.map((node, i) => {
    const key = `${keyBase}${i}`;
    switch (node.t) {
      case "text":
        return node.v.split("\n").map((part, j) => (
          <Fragment key={`${key}.${j}`}>
            {j > 0 ? <br /> : null}
            {part}
          </Fragment>
        ));
      case "strong":
        return <strong key={key}>{inline(node.c, `${key}.`)}</strong>;
      case "em":
        return <em key={key}>{inline(node.c, `${key}.`)}</em>;
      case "code":
        return <code key={key}>{node.v}</code>;
      case "link":
        return node.href.startsWith("/") ? (
          <Link key={key} href={node.href}>
            {inline(node.c, `${key}.`)}
          </Link>
        ) : (
          <a key={key} href={node.href} target="_blank" rel="noopener noreferrer">
            {inline(node.c, `${key}.`)}
          </a>
        );
    }
  });
}

/** A reply's text as elements. `tail` is placed at the end of the last paragraph (for the bubble's time). */
export function Markdown({ text, tail }: { text: string; tail?: ReactNode }) {
  const blocks = parseMarkdown(text);
  const lastIsParagraph = blocks.at(-1)?.t === "p";
  return (
    <>
      {blocks.map((block, i) => {
        const isLast = i === blocks.length - 1;
        if (block.t === "p") {
          return (
            <p key={i}>
              {inline(block.c)}
              {isLast ? tail : null}
            </p>
          );
        }
        const Tag = block.t;
        return (
          <Tag key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </Tag>
        );
      })}
      {!lastIsParagraph && tail ? <p>{tail}</p> : null}
    </>
  );
}
