import type { ComponentType } from "react";
import { ALL_POSTS } from "@/content/blog/posts";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date string (YYYY-MM-DD) — when the article was first published. */
  date: string;
  /** ISO date string — set only when the article has actually been revised since publishing. */
  updated?: string;
  author: string;
  tags: string[];
  /** Category label shown on the homepage Insights teaser and the listing page. */
  category: string;
  /** Set by hand per article — rendering to static markup to compute this at request time
   * isn't available from a shared Server Component module in this Next.js version. */
  readingMinutes: number;
  draft?: boolean;
}

export interface Post {
  meta: PostMeta;
  Content: ComponentType;
}

export function getAllPosts(): Post[] {
  return ALL_POSTS.filter((post) => !post.meta.draft).sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.meta.slug === slug);
}

export function getRelatedPosts(post: Post, limit = 2): Post[] {
  const others = getAllPosts().filter((candidate) => candidate.meta.slug !== post.meta.slug);
  const shareTag = (candidate: Post) => candidate.meta.tags.some((tag) => post.meta.tags.includes(tag));

  const related = others.filter(shareTag);
  const rest = others.filter((candidate) => !shareTag(candidate));
  return [...related, ...rest].slice(0, limit);
}

export function formatPostDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
