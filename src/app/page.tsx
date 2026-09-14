import { SiteShell } from "@/components/templates/SiteShell";
import { Hero } from "@/components/organisms/sections/Hero";
import { Philosophy } from "@/components/organisms/sections/Philosophy";
import { Services } from "@/components/organisms/sections/Services";
import { Transition } from "@/components/organisms/sections/Transition";
import { Process } from "@/components/organisms/sections/Process";
import { Capabilities } from "@/components/organisms/sections/Capabilities";
import { Insights } from "@/components/organisms/sections/Insights";
import { Contact } from "@/components/organisms/sections/Contact";

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Philosophy />
      <Services />
      <Transition />
      <Process />
      <Capabilities />
      <Insights />
      <Contact />
    </SiteShell>
  );
}
