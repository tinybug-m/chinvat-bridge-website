import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProseProps {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  /** For rendered article HTML; otherwise pass children. */
  html?: string;
}

/**
 * Long-form text in the new type scale (styles/prose.css): headings, lists,
 * links, quotes and tables at a ~38rem measure. For articles and legal pages.
 */
export function Prose({ as: Tag = "div", className, children, html }: ProseProps) {
  if (html !== undefined) {
    return <Tag className={cn("prose-cb", className)} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <Tag className={cn("prose-cb", className)}>{children}</Tag>;
}
