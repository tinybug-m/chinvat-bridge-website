import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Services } from "@/components/sections/Services";
import { Transition } from "@/components/sections/Transition";
import { Process } from "@/components/sections/Process";
import { Capabilities } from "@/components/sections/Capabilities";
import { Insights } from "@/components/sections/Insights";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-obsidian-950 focus:font-mono focus:text-xs focus:font-semibold focus:uppercase focus:rounded-sm"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">
        <Hero />
        <Philosophy />
        <Services />
        <Transition />
        <Process />
        <Capabilities />
        <Insights />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
