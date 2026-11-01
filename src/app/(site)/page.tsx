import { SiteShell } from "@/components/site/SiteShell";
import { CrossingHero } from "@/components/home/hero/CrossingHero";
import { Services } from "@/components/home/services/Services";
import { Work } from "@/components/home/work/Work";
import { Bridge } from "@/components/home/bridge/Bridge";
import { Method } from "@/components/home/method/Method";
import { Capabilities } from "@/components/home/capabilities/Capabilities";
import { About } from "@/components/home/about/About";
import { Insights } from "@/components/home/insights/Insights";
import { Contact } from "@/components/home/contact/Contact";

export default function Home() {
  return (
    <SiteShell>
      <CrossingHero />
      <Services />
      <Work />
      <Bridge />
      <Method />
      <Capabilities />
      <About />
      <Insights />
      <Contact />
    </SiteShell>
  );
}
