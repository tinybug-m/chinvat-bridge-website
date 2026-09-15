import Link from "next/link";
import { Icon } from "@/components/atoms/icons";
import { Section } from "@/components/molecules/Section";
import { SectionIntro } from "@/components/molecules/SectionIntro";
import { getAllPosts } from "@/lib/blog";

export function Insights() {
  const posts = getAllPosts();

  return (
    <Section id="insights">
      <SectionIntro
        eyebrow="Insights"
        heading="Ideas & Observations"
        note="Practical thinking about AI, software, automation and digital growth."
        className="mb-10"
        right={
          <Link
            href="/insights"
            className="font-mono text-[10px] text-gold-400 hover:text-gold-300 tracking-technical uppercase bg-obsidian-900 border border-stone-border px-3 py-1 rounded-xs transition-colors"
          >
            View All Insights &rarr;
          </Link>
        }
      />

      <div className="divide-y divide-stone-border border-t border-b border-stone-border">
        {posts.map((post, index) => (
          <Link
            key={post.meta.slug}
            href={`/insights/${post.meta.slug}`}
            className="group py-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-obsidian-900/60 px-4 transition-colors"
          >
            <div className="flex items-start md:items-center gap-6">
              <span className="font-mono text-xs text-gold-500 font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif-monument text-lg sm:text-xl text-parchment-100 group-hover:text-gold-300 transition-colors">
                  {post.meta.title}
                </h3>
                <span className="font-mono text-[10px] text-parchment-dim tracking-technical uppercase">
                  Category: {post.meta.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0 font-mono text-[10px] tracking-technical">
              <span className="px-2.5 py-1 rounded-xs bg-obsidian-900 border border-stone-borderLight text-parchment-dim uppercase">
                {post.meta.readingMinutes} min read
              </span>
              <Icon name="article" className="text-gold-500/70 text-sm" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
