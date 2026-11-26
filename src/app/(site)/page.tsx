import type { Metadata } from "next";
import { HomeSections } from "@/components/home/HomeSections";
import { HomeContact } from "@/components/windy-pop/variants/contact/HomeContact";
import { getPage } from "@/lib/content/read";

/**
 * The title and description are the layout's defaults (settings:site); the canonical lives here, not
 * in the root layout, where every page without its own would inherit it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return {
    alternates: { canonical: "/" },
    ...(page?.data.seo.robots === "noindex" && { robots: { index: false, follow: true } }),
  };
}

export default function Home() {
  return <HomeSections contact={<HomeContact />} />;
}
